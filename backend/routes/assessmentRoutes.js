const express = require('express');
const router = express.Router();
const assessmentController = require('../controllers/assessmentController');

// Routes
router.post('/', assessmentController.createAssessment);
router.get('/', assessmentController.getAllAssessments);
router.get('/:id', assessmentController.getAssessmentById);
router.delete('/:id', assessmentController.deleteAssessment);

module.exports = router;
