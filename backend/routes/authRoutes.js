const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

// Public routes
router.post('/register', authController.registerTeacher);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/set-password', authController.setPassword);
router.post('/admin/send-otp', authController.sendAdminOtp);
router.post('/admin/verify-otp', authController.verifyAdminOtp);

// Protected routes
router.get('/profile', authenticateToken, authController.getProfile);
router.put('/profile', authenticateToken, authController.updateProfile);
router.put('/change-password', authenticateToken, authController.changePassword);

module.exports = router;