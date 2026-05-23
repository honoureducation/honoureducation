const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const { authenticateToken } = require('../middleware/auth');

// Public route to submit contact
router.post('/', contactController.submitContact);

// Admin routes for viewing messages
router.get('/', authenticateToken, contactController.getMessages);
router.put('/:id/read', authenticateToken, contactController.markAsRead);

module.exports = router;
