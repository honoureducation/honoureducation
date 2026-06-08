const mongoose = require('mongoose');
const dns = require('dns');
require('dotenv').config();

dns.setServers(['8.8.8.8', '8.8.4.4']);

const User = require('./models/User');

const mongoURI = process.env.MONGODB_URI;

mongoose.connect(mongoURI)
  .then(async () => {
    console.log('Connected to MongoDB. Promoting shakirayoubbhat@gmail.com...');
    const result = await User.findOneAndUpdate(
      { email: 'shakirayoubbhat@gmail.com' },
      { 
        role: 'platform_admin',
        status: 'approved',
        adminLevel: 'platform',
        permissions: [
          'manage_schools', 'manage_teachers', 'manage_students', 
          'view_reports', 'export_data', 'manage_assessments',
          'view_analytics', 'manage_settings'
        ]
      },
      { new: true }
    );
    if (result) {
      console.log('✅ User successfully promoted to platform_admin:', result);
    } else {
      console.log('❌ User not found with email shakirayoubbhat@gmail.com');
    }
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
