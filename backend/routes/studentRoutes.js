const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { authenticateToken, requireRole } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// Student CRUD operations
router.post('/', requireRole(['teacher', 'school_admin']), studentController.createStudent);
router.get('/', requireRole(['teacher', 'school_admin']), studentController.getStudents);
router.get('/:id', requireRole(['teacher', 'school_admin']), studentController.getStudentById);
router.put('/:id', requireRole(['teacher', 'school_admin']), studentController.updateStudent);
router.delete('/:id', requireRole(['teacher', 'school_admin']), studentController.deleteStudent);

// Student assessments
router.get('/:id/assessments', requireRole(['teacher', 'school_admin']), studentController.getStudentAssessments);

// Bulk operations
router.post('/bulk-import', requireRole(['teacher', 'school_admin']), studentController.bulkImportStudents);
router.get('/export/excel', requireRole(['teacher', 'school_admin']), studentController.exportStudentsToExcel);

module.exports = router;