const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const School = require('../models/School');
require('dotenv').config();

async function setupPlatform() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Create Platform Admin
    let platformAdmin = await User.findOne({ role: 'platform_admin' });
    if (!platformAdmin) {
      // Check if user exists with different role
      const existingUser = await User.findOne({ email: 'admin@academic-excellence.com' });
      if (existingUser) {
        // Update existing user to platform admin
        existingUser.role = 'platform_admin';
        existingUser.adminLevel = 'platform';
        existingUser.permissions = [
          'manage_schools', 'manage_teachers', 'manage_students', 
          'view_reports', 'export_data', 'manage_assessments',
          'view_analytics', 'manage_settings'
        ];
        existingUser.school = undefined; // Platform admin doesn't belong to a school
        await existingUser.save();
        platformAdmin = existingUser;
        console.log('✅ Updated existing user to platform admin!');
      } else {
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash('admin123', saltRounds);

        platformAdmin = new User({
          firstName: 'Platform',
          lastName: 'Administrator',
          email: 'admin@academic-excellence.com',
          password: hashedPassword,
          role: 'platform_admin',
          status: 'approved',
          adminLevel: 'platform',
          permissions: [
            'manage_schools', 'manage_teachers', 'manage_students', 
            'view_reports', 'export_data', 'manage_assessments',
            'view_analytics', 'manage_settings'
          ]
        });

        await platformAdmin.save();
        console.log('✅ Platform admin created!');
      }
      console.log('📧 Email: admin@academic-excellence.com');
      console.log('🔑 Password: admin123');
    } else {
      console.log('✅ Platform admin already exists:', platformAdmin.email);
    }

    // Create Demo School
    let demoSchool = await School.findOne({ code: 'DEMO001' });
    if (!demoSchool) {
      demoSchool = new School({
        name: 'Demo Elementary School',
        code: 'DEMO001',
        type: 'primary',
        address: {
          street: '123 Education Street',
          city: 'Learning City',
          state: 'Knowledge State',
          country: 'Education Country',
          postalCode: '12345'
        },
        contactInfo: {
          phone: '+1-555-0123',
          email: 'info@demo-school.edu',
          website: 'https://demo-school.edu'
        },
        principalName: 'Dr. Jane Smith',
        adminContact: {
          name: 'John Doe',
          email: 'admin@demo-school.edu',
          phone: '+1-555-0124'
        },
        subscriptionPlan: 'premium',
        maxTeachers: 20,
        maxStudents: 500,
        enabledFeatures: ['listening', 'speaking', 'reading', 'writing', 'reports', 'exports', 'analytics'],
        createdBy: platformAdmin._id
      });

      await demoSchool.save();
      console.log('✅ Demo school created!');
      console.log('🏫 School: Demo Elementary School (DEMO001)');
    } else {
      console.log('✅ Demo school already exists:', demoSchool.name);
    }

    // Create School Admin for Demo School
    let schoolAdmin = await User.findOne({ email: 'schooladmin@demo-school.edu' });
    if (!schoolAdmin) {
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash('schooladmin123', saltRounds);

      schoolAdmin = new User({
        firstName: 'School',
        lastName: 'Administrator',
        email: 'schooladmin@demo-school.edu',
        password: hashedPassword,
        role: 'school_admin',
        status: 'approved',
        school: demoSchool._id,
        adminLevel: 'school',
        permissions: [
          'manage_teachers', 'manage_students', 'view_reports', 
          'export_data', 'manage_assessments'
        ],
        approvedBy: platformAdmin._id,
        approvedAt: new Date()
      });

      await schoolAdmin.save();
      console.log('✅ School admin created!');
      console.log('📧 Email: schooladmin@demo-school.edu');
      console.log('🔑 Password: schooladmin123');
    } else {
      console.log('✅ School admin already exists:', schoolAdmin.email);
    }

    // Create Demo Teacher
    let demoTeacher = await User.findOne({ email: 'teacher@demo-school.edu' });
    if (!demoTeacher) {
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash('teacher123', saltRounds);

      demoTeacher = new User({
        firstName: 'Demo',
        lastName: 'Teacher',
        email: 'teacher@demo-school.edu',
        password: hashedPassword,
        role: 'teacher',
        status: 'approved',
        school: demoSchool._id,
        teacherId: 'T001',
        department: 'English Language Learning',
        phoneNumber: '+1-555-0125',
        teachingExperience: 5,
        subjects: ['English', 'ESL', 'EAL'],
        qualifications: ['TESOL Certificate', 'Bachelor of Education'],
        bio: 'Experienced EAL teacher specializing in assessment and curriculum development.',
        approvedBy: schoolAdmin._id,
        approvedAt: new Date()
      });

      await demoTeacher.save();
      console.log('✅ Demo teacher created!');
      console.log('📧 Email: teacher@demo-school.edu');
      console.log('🔑 Password: teacher123');
    } else {
      console.log('✅ Demo teacher already exists:', demoTeacher.email);
    }

    console.log('\n🎯 Platform Setup Complete!');
    console.log('\n📋 Demo Accounts:');
    console.log('Platform Admin: admin@academic-excellence.com / admin123');
    console.log('School Admin: schooladmin@demo-school.edu / schooladmin123');
    console.log('Teacher: teacher@demo-school.edu / teacher123');
    console.log('\n🏫 Demo School: Demo Elementary School (DEMO001)');

  } catch (error) {
    console.error('❌ Setup Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

setupPlatform();