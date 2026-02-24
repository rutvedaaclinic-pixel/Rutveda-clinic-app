const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { validateRegister, validateLogin } = require('../middleware/validate');
const {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  logout,
  getUsers,
  deleteUser
} = require('../controllers/authController');

// Public routes
router.post('/login', validateLogin, login);

// Protected routes
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/password', protect, changePassword);
router.post('/logout', protect, logout);

// Admin only routes
router.post('/register', protect, authorize('admin'), validateRegister, register);
router.get('/users', protect, authorize('admin'), getUsers);
router.delete('/users/:id', protect, authorize('admin'), deleteUser);

module.exports = router;