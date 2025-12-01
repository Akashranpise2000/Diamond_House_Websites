const express = require('express');
const { body } = require('express-validator');
const {
  getProfile,
  updateProfile,
  getUsers,
  getUser,
  updateUser,
  deleteUser
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Profile routes
router.get('/profile', getProfile);
router.put('/profile', [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('phone')
    .optional()
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Please provide a valid 10-digit Indian phone number')
], updateProfile);

// Admin only routes
router.get('/', authorize('admin'), getUsers);
router.get('/:id', authorize('admin'), getUser);
router.put('/:id', authorize('admin'), [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('phone')
    .optional()
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Please provide a valid 10-digit Indian phone number'),
  body('role')
    .optional()
    .isIn(['user', 'admin'])
    .withMessage('Role must be either user or admin'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean')
], updateUser);
router.delete('/:id', authorize('admin'), deleteUser);

module.exports = router;