const mongoose = require('mongoose');
const dns = require('dns');
require('dotenv').config();

dns.setServers(['8.8.8.8', '8.8.4.4']);

const User = require('./models/User');

const mongoURI = process.env.MONGODB_URI;

mongoose.connect(mongoURI)
  .then(async () => {
    console.log('Connected to MongoDB. Creating/Promoting info@honoureducation.com...');
    const result = await User.findOneAndUpdate(
      { email: 'info@honoureducation.com' },
      {
        $set: {
          firstName: 'Admin',
          lastName: 'Honour',
          email: 'info@honoureducation.com',
          password: 'dummyPassword123!',
          role: 'platform_admin',
          status: 'approved',
          adminLevel: 'platform',
          permissions: [
            'manage_schools', 'manage_teachers', 'manage_students',
            'view_reports', 'export_data', 'manage_assessments',
            'view_analytics', 'manage_settings'
          ]
        }
      },
      { new: true, upsert: true }
    );
    if (result) {
      console.log('✅ User successfully created/promoted to platform_admin:', result.email);
    } else {
      console.log('❌ Failed to create/promote user.');
    }
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
