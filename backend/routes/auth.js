const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  logout,
  updateWallet
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', register);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', login);

// @route   GET /api/auth/profile
// @desc    Get user profile
// @access  Private
router.get('/me', protect, getMe);

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', protect, logout);

// @route   PUT /api/auth/wallet
// @desc    Update wallet address
// @access  Private
router.put('/wallet', protect, updateWallet);

module.exports = router; 