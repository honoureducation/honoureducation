const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

async function createDefaultAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/student-assessment');
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('Admin user already exists:', existingAdmin.email);
      process.exit(0);
    }

    // Create default admin
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash('admin123', saltRounds);

    const admin = new User({
      firstName: 'System',
      lastName: 'Administrator',
      email: 'admin@academic-excellence.com',
      password: hashedPassword,
      role: 'admin',
      status: 'approved',
      adminLevel: 'super'
    });

    await admin.save();
    console.log('✅ Default admin user created successfully!');
    console.log('Email: admin@academic-excellence.com');
    console.log('Password: admin123');
    console.log('⚠️  Please change the password after first login');

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    mongoose.connection.close();
  }
}

createDefaultAdmin();