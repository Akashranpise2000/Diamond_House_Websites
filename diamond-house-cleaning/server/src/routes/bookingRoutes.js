const express = require('express');
const { body } = require('express-validator');
const {
  createBooking,
  getBookings,
  getBooking,
  updateBooking,
  cancelBooking,
  getUpcomingBookings
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Validation rules
const bookingValidation = [
  body('services')
    .isArray({ min: 1 })
    .withMessage('At least one service is required'),
  body('services.*.serviceId')
    .isMongoId()
    .withMessage('Valid service ID is required'),
  body('services.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),
  body('serviceAddress.addressLine1')
    .trim()
    .isLength({ min: 5 })
    .withMessage('Address line 1 is required'),
  body('serviceAddress.city')
    .trim()
    .isLength({ min: 2 })
    .withMessage('City is required'),
  body('serviceAddress.state')
    .trim()
    .isLength({ min: 2 })
    .withMessage('State is required'),
  body('serviceAddress.pincode')
    .matches(/^\d{6}$/)
    .withMessage('Valid 6-digit pincode is required'),
  body('scheduledDate')
    .isISO8601()
    .withMessage('Valid scheduled date is required'),
  body('scheduledTimeSlot.startTime')
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Valid start time is required'),
  body('scheduledTimeSlot.endTime')
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Valid end time is required')
];

// All routes require authentication
router.use(protect);

// Routes
router.post('/', bookingValidation, createBooking);
router.get('/', getBookings);
router.get('/upcoming', getUpcomingBookings);
router.get('/:id', getBooking);
router.put('/:id', updateBooking);
router.delete('/:id', cancelBooking);

module.exports = router;