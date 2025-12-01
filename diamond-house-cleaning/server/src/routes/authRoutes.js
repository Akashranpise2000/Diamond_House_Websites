const express = require('express');
const { body } = require('express-validator');
const {
  register,
  login,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword,
  verifyEmail,
  sendOTP,
  verifyOTP
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Validation rules
const registerValidation = [
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('phone')
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Please provide a valid 10-digit Indian phone number'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')
];

const loginValidation = [
  body('identifier')
    .notEmpty()
    .withMessage('Email or phone number is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.post('/refresh-token', refreshToken);
router.post('/logout', protect, logout);
router.post('/forgot-password', [
  body('email').isEmail().withMessage('Please provide a valid email')
], forgotPassword);
router.post('/reset-password/:token', [
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')
], resetPassword);
router.post('/verify-email/:token', verifyEmail);
router.post('/otp/send', [
  body('phone')
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Please provide a valid 10-digit Indian phone number')
], sendOTP);
router.post('/otp/verify', [
  body('phone')
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Please provide a valid 10-digit Indian phone number'),
  body('otp')
    .isLength({ min: 4, max: 6 })
    .isNumeric()
    .withMessage('OTP must be 4-6 digits')
], verifyOTP);

module.exports = router;