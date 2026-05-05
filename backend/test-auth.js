const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

async function testAuth() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if any users exist
    const userCount = await User.countDocuments();
    console.log(`📊 Total users in database: ${userCount}`);

    // Check for admin user
    const admin = await User.findOne({ role: 'admin' });
    if (admin) {
      console.log('✅ Admin user found:', admin.email);
    } else {
      console.log('❌ No admin user found');
      
      // Create default admin
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash('admin123', saltRounds);

      const newAdmin = new User({
        firstName: 'System',
        lastName: 'Administrator',
        email: 'admin@academic-excellence.com',
        password: hashedPassword,
        role: 'admin',
        status: 'approved',
        adminLevel: 'super'
      });

      await newAdmin.save();
      console.log('✅ Default admin user created!');
      console.log('📧 Email: admin@academic-excellence.com');
      console.log('🔑 Password: admin123');
    }

    // Check for demo teacher
    let teacher = await User.findOne({ email: 'teacher@school.edu' });
    if (!teacher) {
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash('teacher123', saltRounds);

      teacher = new User({
        firstName: 'Demo',
        lastName: 'Teacher',
        email: 'teacher@school.edu',
        password: hashedPassword,
        role: 'teacher',
        status: 'approved',
        school: 'Demo School',
        department: 'English Language Learning',
        phoneNumber: '+1234567890',
        teachingExperience: 5,
        bio: 'Demo teacher account for testing'
      });

      await teacher.save();
      console.log('✅ Demo teacher user created!');
      console.log('📧 Email: teacher@school.edu');
      console.log('🔑 Password: teacher123');
    } else {
      console.log('✅ Demo teacher found:', teacher.email, '- Status:', teacher.status);
    }

    console.log('\n🎯 Demo Accounts Ready:');
    console.log('Admin: admin@academic-excellence.com / admin123');
    console.log('Teacher: teacher@school.edu / teacher123');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

testAuth();