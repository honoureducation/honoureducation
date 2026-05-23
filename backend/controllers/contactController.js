const ContactMessage = require('../models/ContactMessage');
const emailService = require('../utils/emailService');

exports.submitContact = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Save to database
    const newContact = new ContactMessage({ name, email, subject, message });
    await newContact.save();

    // Send email notification to Admin
    await emailService.sendContactEmail({ name, email, subject, message });

    res.status(201).json({ message: 'Contact request submitted successfully', contact: newContact });
  } catch (error) {
    console.error('Submit contact error:', error);
    res.status(500).json({ message: 'Server error while submitting contact request' });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching messages' });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const message = await ContactMessage.findByIdAndUpdate(req.params.id, { status: 'read' }, { new: true });
    res.json(message);
  } catch (error) {
    res.status(500).json({ message: 'Error updating message status' });
  }
};
