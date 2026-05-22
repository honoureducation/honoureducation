const express = require('express');
const router = express.Router();
const assessmentController = require('../controllers/assessmentController');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

// All assessment routes now require authentication
// This ensures teacher data isolation — each teacher only sees their own records

// Create assessment (requires login so we can track createdBy)
router.post('/', authenticateToken, assessmentController.createAssessment);

// Get all assessments (filtered by teacher — teachers see only their own, admins see all)
router.get('/', authenticateToken, assessmentController.getAllAssessments);

// Get single assessment (requires login, ownership verified in controller)
router.get('/:id', authenticateToken, assessmentController.getAssessmentById);

// Delete assessment (requires login, ownership verified in controller)
router.delete('/:id', authenticateToken, assessmentController.deleteAssessment);

module.exports = router;
