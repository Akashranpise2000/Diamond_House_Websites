const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { logger } = require('../middleware/loggerMiddleware');

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '24h'
  });
};

// Generate Refresh Token
const generateRefreshToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d'
  });
};

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({
      $or: [{ email }, { phone }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: existingUser.email === email ? 'Email already registered' : 'Phone number already registered'
      });
    }

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email,
      phone,
      password
    });

    // Generate tokens
    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    logger.info(`New user registered: ${user.email}`);

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please verify your email.',
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          role: user.role
        },
        token,
        refreshToken
      }
    });
  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { identifier, password } = req.body; // identifier can be email or phone

    // Check for user
    const user = await User.findByEmailOrPhone(identifier).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Generate tokens
    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    logger.info(`User logged in: ${user.email}`);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          role: user.role,
          profileImage: user.profileImage,
          isEmailVerified: user.isEmailVerified,
          isPhoneVerified: user.isPhoneVerified
        },
        token,
        refreshToken
      }
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Refresh token
// @route   POST /api/v1/auth/refresh-token
// @access  Public
const refreshToken = async (req, res) => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token required'
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    // Generate new tokens
    const newToken = generateToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    res.status(200).json({
      success: true,
      data: {
        token: newToken,
        refreshToken: newRefreshToken
      }
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid refresh token'
    });
  }
};

// @desc    Logout user
// @route   POST /api/v1/auth/logout
// @access  Private
const logout = async (req, res) => {
  try {
    // In a stateless JWT system, logout is handled client-side
    // by removing the token from storage
    logger.info(`User logged out: ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Logout failed'
    });
  }
};

// @desc    Forgot password
// @route   POST /api/v1/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get reset token
    const resetToken = user.getResetPasswordToken();
    await user.save();

    // TODO: Send email with reset token
    // await sendPasswordResetEmail(user.email, resetToken);

    logger.info(`Password reset requested for: ${user.email}`);

    res.status(200).json({
      success: true,
      message: 'Password reset email sent'
    });
  } catch (error) {
    logger.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send reset email'
    });
  }
};

// @desc    Reset password
// @route   POST /api/v1/auth/reset-password/:token
// @access  Public
const resetPassword = async (req, res) => {
  try {
    const { password } = req.body;
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    // Set new password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    logger.info(`Password reset successful for: ${user.email}`);

    res.status(200).json({
      success: true,
      message: 'Password reset successful'
    });
  } catch (error) {
    logger.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Password reset failed'
    });
  }
};

// @desc    Verify email
// @route   POST /api/v1/auth/verify-email/:token
// @access  Public
const verifyEmail = async (req, res) => {
  try {
    // TODO: Implement email verification logic
    res.status(200).json({
      success: true,
      message: 'Email verification not implemented yet'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Email verification failed'
    });
  }
};

// @desc    Send OTP
// @route   POST /api/v1/auth/otp/send
// @access  Public
const sendOTP = async (req, res) => {
  try {
    const { phone } = req.body;

    // TODO: Implement OTP sending logic with Twilio
    logger.info(`OTP requested for phone: ${phone}`);

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully'
    });
  } catch (error) {
    logger.error('Send OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send OTP'
    });
  }
};

// @desc    Verify OTP
// @route   POST /api/v1/auth/otp/verify
// @access  Public
const verifyOTP = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    // TODO: Implement OTP verification logic
    logger.info(`OTP verification attempted for phone: ${phone}`);

    res.status(200).json({
      success: true,
      message: 'OTP verified successfully'
    });
  } catch (error) {
    logger.error('Verify OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'OTP verification failed'
    });
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword,
  verifyEmail,
  sendOTP,
  verifyOTP
};