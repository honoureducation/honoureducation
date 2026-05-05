const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken, requireRole } = require('../middleware/auth');

// All admin routes require authentication and admin role (platform_admin or school_admin)
router.use(authenticateToken);
router.use(requireRole(['platform_admin', 'school_admin']));

// Teacher management
router.get('/teachers/pending', adminController.getPendingTeachers);
router.get('/teachers', adminController.getAllTeachers);
router.get('/teachers/:teacherId', adminController.getTeacherDetails);
router.put('/teachers/:teacherId', adminController.updateTeacher);
router.delete('/teachers/:teacherId', adminController.deleteTeacher);
router.put('/teachers/:teacherId/approve', adminController.approveTeacher);
router.put('/teachers/:teacherId/reject', adminController.rejectTeacher);
router.put('/teachers/:teacherId/suspend', adminController.toggleTeacherSuspension);

// Dashboard
router.get('/dashboard/stats', adminController.getDashboardStats);

module.exports = router;