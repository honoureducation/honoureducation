const express = require('express');
const router = express.Router();
const schoolController = require('../controllers/schoolController');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Platform Admin only routes
router.post('/', authenticateToken, requireRole(['platform_admin']), schoolController.createSchool);
router.get('/', authenticateToken, requireRole(['platform_admin']), schoolController.getAllSchools);
router.get('/:id', authenticateToken, requireRole(['platform_admin', 'school_admin']), schoolController.getSchoolById);
router.put('/:id', authenticateToken, requireRole(['platform_admin']), schoolController.updateSchool);
router.delete('/:id', authenticateToken, requireRole(['platform_admin']), schoolController.deleteSchool);
router.put('/:id/status', authenticateToken, requireRole(['platform_admin']), schoolController.updateSchoolStatus);

// School statistics
router.get('/:id/stats', authenticateToken, requireRole(['platform_admin', 'school_admin']), schoolController.getSchoolStats);

module.exports = router;