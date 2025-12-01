const Booking = require('../models/Booking');
const Service = require('../models/Service');
const User = require('../models/User');
const Payment = require('../models/Payment');
const { logger } = require('../middleware/loggerMiddleware');

// @desc    Create new booking
// @route   POST /api/v1/bookings
// @access  Private
const createBooking = async (req, res) => {
  try {
    const {
      services,
      serviceAddress,
      scheduledDate,
      scheduledTimeSlot,
      specialInstructions
    } = req.body;

    // Validate services exist and calculate pricing
    let subtotal = 0;
    const validatedServices = [];

    for (const serviceItem of services) {
      const service = await Service.findById(serviceItem.serviceId);
      if (!service || !service.isActive) {
        return res.status(400).json({
          success: false,
          message: `Service ${serviceItem.serviceId} not found or inactive`
        });
      }

      const basePrice = service.pricing.basePrice;
      const addOnTotal = serviceItem.addOns?.reduce((sum, addOn) => sum + addOn.price, 0) || 0;
      const itemTotal = (basePrice + addOnTotal) * serviceItem.quantity;

      validatedServices.push({
        serviceId: service._id,
        serviceName: service.serviceName,
        quantity: serviceItem.quantity,
        basePrice,
        addOns: serviceItem.addOns || [],
        subtotal: itemTotal
      });

      subtotal += itemTotal;
    }

    // Calculate tax (18% GST)
    const tax = Math.round(subtotal * 0.18 * 100) / 100;
    const total = subtotal + tax;

    // Create booking
    const booking = await Booking.create({
      customerId: req.user._id,
      services: validatedServices,
      serviceAddress,
      scheduledDate,
      scheduledTimeSlot,
      pricing: {
        subtotal,
        tax,
        total
      },
      specialInstructions
    });

    // Populate service details
    await booking.populate('customerId', 'firstName lastName email phone');

    logger.info(`Booking created: ${booking.bookingNumber} by ${req.user.email}`);

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: { booking }
    });
  } catch (error) {
    logger.error('Create booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create booking',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get user bookings
// @route   GET /api/v1/bookings
// @access  Private
const getBookings = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let filter = {};

    if (req.user.role === 'customer') {
      filter.customerId = req.user._id;
    } else if (req.user.role === 'staff') {
      filter.assignedStaff = { $elemMatch: { staffId: req.user._id } };
    }
    // Admin can see all bookings

    if (req.query.status) {
      filter.status = req.query.status;
    }

    if (req.query.startDate && req.query.endDate) {
      filter.scheduledDate = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate)
      };
    }

    const bookings = await Booking.find(filter)
      .populate('customerId', 'firstName lastName email phone')
      .populate('assignedStaff.staffId', 'firstName lastName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Booking.countDocuments(filter);

    res.status(200).json({
      success: true,
      message: 'Bookings retrieved successfully',
      data: {
        bookings,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    logger.error('Get bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve bookings',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get single booking
// @route   GET /api/v1/bookings/:id
// @access  Private
const getBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('customerId', 'firstName lastName email phone addresses')
      .populate('assignedStaff.staffId', 'firstName lastName phone')
      .populate('payment');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user has permission to view this booking
    if (req.user.role === 'customer' && booking.customerId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this booking'
      });
    }

    if (req.user.role === 'staff' && !booking.assignedStaff.some(staff => staff.staffId._id.toString() === req.user._id.toString())) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this booking'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Booking retrieved successfully',
      data: { booking }
    });
  } catch (error) {
    logger.error('Get booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve booking',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update booking
// @route   PUT /api/v1/bookings/:id
// @access  Private
const updateBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check permissions
    if (req.user.role === 'customer' && booking.customerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this booking'
      });
    }

    // Only allow certain fields to be updated based on role and booking status
    const allowedFields = [];

    if (req.user.role === 'customer' && ['pending', 'confirmed'].includes(booking.status)) {
      allowedFields.push('scheduledDate', 'scheduledTimeSlot', 'specialInstructions', 'serviceAddress');
    }

    if (req.user.role === 'admin' || req.user.role === 'staff') {
      allowedFields.push('status', 'assignedStaff', 'completion');
    }

    const updateData = {};
    Object.keys(req.body).forEach(key => {
      if (allowedFields.includes(key)) {
        updateData[key] = req.body[key];
      }
    });

    const updatedBooking = await Booking.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('customerId', 'firstName lastName email phone');

    logger.info(`Booking updated: ${updatedBooking.bookingNumber} by ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Booking updated successfully',
      data: { booking: updatedBooking }
    });
  } catch (error) {
    logger.error('Update booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update booking',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Cancel booking
// @route   DELETE /api/v1/bookings/:id
// @access  Private
const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check permissions
    if (req.user.role === 'customer' && booking.customerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this booking'
      });
    }

    // Check if booking can be cancelled
    if (!booking.canCancel()) {
      return res.status(400).json({
        success: false,
        message: 'Booking cannot be cancelled at this time'
      });
    }

    // Update booking status
    booking.status = 'cancelled';
    booking.cancellation = {
      isCancelled: true,
      cancelledBy: req.user._id,
      cancelledAt: new Date(),
      cancellationReason: req.body.reason || 'Cancelled by user'
    };

    await booking.save();

    // TODO: Process refund if payment was made

    logger.info(`Booking cancelled: ${booking.bookingNumber} by ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully'
    });
  } catch (error) {
    logger.error('Cancel booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel booking',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get upcoming bookings
// @route   GET /api/v1/bookings/upcoming
// @access  Private
const getUpcomingBookings = async (req, res) => {
  try {
    const hours = parseInt(req.query.hours) || 24;
    const futureDate = new Date(Date.now() + hours * 60 * 60 * 1000);

    let filter = {
      scheduledDate: { $lte: futureDate },
      status: { $in: ['confirmed', 'assigned'] }
    };

    if (req.user.role === 'customer') {
      filter.customerId = req.user._id;
    } else if (req.user.role === 'staff') {
      filter.assignedStaff = { $elemMatch: { staffId: req.user._id } };
    }

    const bookings = await Booking.find(filter)
      .populate('customerId', 'firstName lastName phone')
      .sort({ scheduledDate: 1 });

    res.status(200).json({
      success: true,
      message: 'Upcoming bookings retrieved successfully',
      data: { bookings }
    });
  } catch (error) {
    logger.error('Get upcoming bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve upcoming bookings',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  createBooking,
  getBookings,
  getBooking,
  updateBooking,
  cancelBooking,
  getUpcomingBookings
};