const User = require('../models/User');
const { logger } = require('../middleware/loggerMiddleware');

// @desc    Get user profile
// @route   GET /api/v1/users/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    logger.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/v1/users/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, profileImage } = req.body;

    // Check if email is already taken by another user
    if (email && email !== req.user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already in use'
        });
      }
    }

    // Check if phone is already taken by another user
    if (phone && phone !== req.user.phone) {
      const existingUser = await User.findOne({ phone });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Phone number already in use'
        });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        firstName,
        lastName,
        email,
        phone,
        profileImage
      },
      {
        new: true,
        runValidators: true
      }
    ).select('-password');

    logger.info(`User profile updated: ${updatedUser.email}`);

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser
    });
  } catch (error) {
    logger.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get all users (Admin only)
// @route   GET /api/v1/users
// @access  Private/Admin
const getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const users = await User.find({})
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments();

    res.status(200).json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get users',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get single user (Admin only)
// @route   GET /api/v1/users/:id
// @access  Private/Admin
const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    logger.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update user (Admin only)
// @route   PUT /api/v1/users/:id
// @access  Private/Admin
const updateUser = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, role, isActive } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        firstName,
        lastName,
        email,
        phone,
        role,
        isActive
      },
      {
        new: true,
        runValidators: true
      }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    logger.info(`User updated by admin: ${updatedUser.email}`);

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: updatedUser
    });
  } catch (error) {
    logger.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Delete user (Admin only)
// @route   DELETE /api/v1/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    await User.findByIdAndDelete(req.params.id);

    logger.info(`User deleted by admin: ${user.email}`);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    logger.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getUsers,
  getUser,
  updateUser,
  deleteUser
};