const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    const allowed = [
      'https://academic-excellence-frontend.onrender.com',
      'https://academic-excellence.onrender.com',
      'https://studentassessment-m8vs.onrender.com',
      process.env.FRONTEND_URL
    ].filter(Boolean);

    if (
      allowed.includes(origin) ||
      origin.endsWith('.onrender.com') ||
      origin.includes('localhost')
    ) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true
}));

// Course store (separate feature, see backend/lms). Stripe webhooks and file
// streams need the raw request body, so these routes are mounted before express.json().
const lms = require('./lms');
app.use('/api/lms', lms.rawRouter);

app.use(express.json());

// MongoDB Connection
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/student-assessment';

mongoose.connect(mongoURI, { serverSelectionTimeoutMS: 8000 })
  .then(() => console.log('✅ MongoDB connected successfully to database:', mongoose.connection.name))
  .catch(err => {
    console.log('ℹ️ MongoDB connection note:', err.message);
    console.log('ℹ️ MongoDB not detected (offline/demo mode enabled).');
    console.log('👉 You can log in using: teacher@school.edu / teacher123');
  });

// Routes
const assessmentRoutes = require('./routes/assessmentRoutes');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const schoolRoutes = require('./routes/schoolRoutes');
const studentRoutes = require('./routes/studentRoutes');
const contactRoutes = require('./routes/contactRoutes');

app.use('/api/assessments', assessmentRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/schools', schoolRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/lms', lms.router);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'Server is running',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
  });
}

// Start Server
const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
