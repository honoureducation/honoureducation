const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const School = require('../models/School');
const Assessment = require('../models/Assessment');

const MONGODB_URI = process.env.MONGODB_URI;

async function syncDatabase() {
  console.log('🔄 Connecting to MongoDB Atlas...');
  if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI not found in backend/.env!');
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 15000,
    });
    console.log('✅ Connected to MongoDB Atlas successfully!\n');

    const saltRounds = 12;

    // 1. Ensure Platform Admins First (Needed for createdBy references)
    console.log('👑 Checking Platform Admins...');
    const adminPassword = await bcrypt.hash('admin123', saltRounds);

    const adminEmails = [
      { email: 'info@honoureducation.com', firstName: 'Honour', lastName: 'Admin' },
      { email: 'admin@academic-excellence.com', firstName: 'Platform', lastName: 'Admin' },
    ];

    let platformAdminUser = null;

    for (const adm of adminEmails) {
      let existingAdmin = await User.findOne({ email: adm.email });
      if (!existingAdmin) {
        existingAdmin = await User.create({
          firstName: adm.firstName,
          lastName: adm.lastName,
          email: adm.email,
          password: adminPassword,
          role: 'platform_admin',
          status: 'approved',
          adminLevel: 'platform',
          permissions: [
            'manage_schools', 'manage_teachers', 'manage_students',
            'view_reports', 'export_data', 'manage_assessments',
            'view_analytics', 'manage_settings'
          ],
        });
        console.log(`  + Created Platform Admin: ${adm.email} (Password: admin123)`);
      } else {
        existingAdmin.role = 'platform_admin';
        existingAdmin.status = 'approved';
        existingAdmin.adminLevel = 'platform';
        existingAdmin.password = adminPassword;
        await existingAdmin.save();
        console.log(`  ✓ Updated Platform Admin: ${adm.email} (Password: admin123)`);
      }
      if (!platformAdminUser) platformAdminUser = existingAdmin;
    }

    // 2. Ensure Schools Exist
    console.log('\n🏫 Checking and creating schools...');
    let primarySchool = await School.findOne({ code: 'HONOUR001' });
    if (!primarySchool) {
      primarySchool = await School.create({
        name: 'Honour Primary School',
        code: 'HONOUR001',
        type: 'primary',
        address: {
          street: '10 Education Avenue',
          city: 'Dubai',
          state: 'Dubai',
          country: 'United Arab Emirates',
          postalCode: '00000',
        },
        contactInfo: {
          phone: '+971-4-1234567',
          email: 'primary@honoureducation.com',
          website: 'https://honoureducation.com',
        },
        principalName: 'Mrs. Emily Davies',
        subscriptionPlan: 'premium',
        maxTeachers: 50,
        maxStudents: 1000,
        enabledFeatures: ['listening', 'speaking', 'reading', 'writing', 'phonic', 'reports', 'exports', 'analytics'],
        createdBy: platformAdminUser._id,
      });
      console.log('  + Created Honour Primary School (HONOUR001)');
    } else {
      console.log('  ✓ Honour Primary School exists');
    }

    let secondarySchool = await School.findOne({ code: 'HONOUR002' });
    if (!secondarySchool) {
      secondarySchool = await School.create({
        name: 'Honour Secondary School',
        code: 'HONOUR002',
        type: 'secondary',
        address: {
          street: '12 Education Avenue',
          city: 'Dubai',
          state: 'Dubai',
          country: 'United Arab Emirates',
          postalCode: '00000',
        },
        contactInfo: {
          phone: '+971-4-1234568',
          email: 'secondary@honoureducation.com',
          website: 'https://honoureducation.com',
        },
        principalName: 'Dr. Michael Sterling',
        subscriptionPlan: 'premium',
        maxTeachers: 50,
        maxStudents: 1000,
        enabledFeatures: ['listening', 'speaking', 'reading', 'writing', 'reports', 'exports', 'analytics'],
        createdBy: platformAdminUser._id,
      });
      console.log('  + Created Honour Secondary School (HONOUR002)');
    } else {
      console.log('  ✓ Honour Secondary School exists');
    }

    // 3. Ensure School Admins
    console.log('\n🏛️ Checking School Admins...');
    const schoolAdminPassword = await bcrypt.hash('schooladmin123', saltRounds);
    const schoolAdmins = [
      { email: 'schooladmin@honoureducation.com', firstName: 'Honour', lastName: 'SchoolAdmin', school: primarySchool._id },
      { email: 'schooladmin@demo-school.edu', firstName: 'Demo', lastName: 'SchoolAdmin', school: primarySchool._id },
    ];

    for (const sa of schoolAdmins) {
      let existingSA = await User.findOne({ email: sa.email });
      if (!existingSA) {
        await User.create({
          firstName: sa.firstName,
          lastName: sa.lastName,
          email: sa.email,
          password: schoolAdminPassword,
          role: 'school_admin',
          status: 'approved',
          school: sa.school,
          adminLevel: 'school',
          permissions: [
            'manage_teachers', 'manage_students', 'view_reports',
            'export_data', 'manage_assessments'
          ],
        });
        console.log(`  + Created School Admin: ${sa.email} (Password: schooladmin123)`);
      } else {
        existingSA.role = 'school_admin';
        existingSA.status = 'approved';
        existingSA.password = schoolAdminPassword;
        await existingSA.save();
        console.log(`  ✓ Updated School Admin: ${sa.email} (Password: schooladmin123)`);
      }
    }

    // 4. Ensure Teacher Accounts
    console.log('\n👩‍🏫 Checking Teacher Accounts...');
    const teacherPassword = await bcrypt.hash('teacher123', saltRounds);

    const teachers = [
      {
        email: 'teacher@school.edu',
        firstName: 'Demo',
        lastName: 'Teacher',
        school: 'Honour Education',
        department: 'Primary & Secondary Languages',
        experience: 6,
      },
      {
        email: 'teacher@honoureducation.com',
        firstName: 'Lead',
        lastName: 'Teacher',
        school: 'Honour Education',
        department: 'Early Years & Primary Phase',
        experience: 8,
      },
      {
        email: 'teacher@demo-school.edu',
        firstName: 'Sarah',
        lastName: 'Jenkins',
        school: 'Honour Primary School',
        department: 'English Language Learning',
        experience: 5,
      },
    ];

    let defaultTeacherId = null;

    for (const t of teachers) {
      let existingT = await User.findOne({ email: t.email });
      if (!existingT) {
        const createdT = await User.create({
          firstName: t.firstName,
          lastName: t.lastName,
          email: t.email,
          password: teacherPassword,
          role: 'teacher',
          status: 'approved',
          school: t.school,
          department: t.department,
          teachingExperience: t.experience,
          phoneNumber: '+971-50-1234567',
          subjects: ['Phonics', 'English', 'Reading', 'Writing', 'Speaking', 'Listening'],
          bio: 'Certified bilingual educator specializing in EYFS, Primary and Secondary CEFR language acquisition.',
        });
        if (!defaultTeacherId) defaultTeacherId = createdT._id;
        console.log(`  + Created Teacher: ${t.email} (Password: teacher123)`);
      } else {
        existingT.role = 'teacher';
        existingT.status = 'approved';
        existingT.password = teacherPassword;
        existingT.school = t.school;
        existingT.department = t.department;
        await existingT.save();
        if (!defaultTeacherId) defaultTeacherId = existingT._id;
        console.log(`  ✓ Updated Teacher: ${t.email} (Password: teacher123)`);
      }
    }

    // 5. Ensure Sample Live Assessments (Primary & Secondary)
    console.log('\n📊 Checking Sample Assessments...');
    const assessmentCount = await Assessment.countDocuments();
    if (assessmentCount === 0) {
      console.log('  Seeding initial sample assessments...');

      const sampleAssessments = [
        // --- PRIMARY ASSESSMENTS ---
        {
          assessmentType: 'FS1 Phonic Assessment',
          schoolTier: 'primary',
          term: 'T1',
          email: 'teacher@school.edu',
          teacherName: 'Demo Teacher',
          studentName: 'Zaid Al-Mansoor',
          yearGroupAndClass: 'FS1 - Ruby',
          totalScore: 16,
          level: 'A2.0–A2.2',
          cefrLevel: 'A2.0–A2.2',
          teacherComments: 'Recognises Phase 2 sounds fluently and blending initial CVCs.',
          createdBy: defaultTeacherId,
          createdAt: new Date(Date.now() - 86400000 * 1),
        },
        {
          assessmentType: 'FS2 - KG1 Reading Assessment',
          schoolTier: 'primary',
          term: 'T1',
          email: 'teacher@school.edu',
          teacherName: 'Demo Teacher',
          studentName: 'Amina Nour',
          yearGroupAndClass: 'FS2 - Emerald',
          totalScore: 6,
          level: 'B1.2–B1.3',
          cefrLevel: 'B1.2–B1.3',
          teacherComments: 'Excellent sound decoding across all 6 CVC picture flashcards.',
          createdBy: defaultTeacherId,
          createdAt: new Date(Date.now() - 86400000 * 2),
        },
        {
          assessmentType: 'FS2 - KG1 Writing Assessment',
          schoolTier: 'primary',
          term: 'T1',
          email: 'teacher@school.edu',
          teacherName: 'Demo Teacher',
          studentName: 'Leo Chen',
          yearGroupAndClass: 'KG1 - Sapphire',
          totalScore: 8,
          level: 'A2.3–B1.1',
          cefrLevel: 'A2.3–B1.1',
          studentWriting: 'Children playing football in park. The grass is green. They kick the ball and run happily.',
          teacherComments: 'Great sentence writing with 8 AI keywords correctly matched.',
          createdBy: defaultTeacherId,
          createdAt: new Date(Date.now() - 86400000 * 3),
        },
        {
          assessmentType: 'KG2 / Year 1 Writing Assessment',
          schoolTier: 'primary',
          term: 'T1',
          email: 'teacher@school.edu',
          teacherName: 'Demo Teacher',
          studentName: 'Maya Patel',
          yearGroupAndClass: 'Year 1A',
          totalScore: 11,
          level: 'B2–C1',
          cefrLevel: 'B2–C1',
          studentWriting: 'The children are playing outside in the park. They are kicking the ball together and laughing having fun.',
          teacherComments: 'Fluent sentences with 11 AI keywords matched across prompt questions.',
          createdBy: defaultTeacherId,
          createdAt: new Date(Date.now() - 86400000 * 4),
        },
        {
          assessmentType: 'FS2 - KG1 Listening Assessment',
          schoolTier: 'primary',
          term: 'T1',
          email: 'teacher@school.edu',
          teacherName: 'Demo Teacher',
          studentName: 'Oliver Smith',
          yearGroupAndClass: 'FS2 - Amber',
          totalScore: 9,
          level: 'B1.2–B1.3',
          cefrLevel: 'B1.2–B1.3',
          teacherComments: 'Gave fluent answers to 9 out of 10 listening comprehension prompts.',
          createdBy: defaultTeacherId,
          createdAt: new Date(Date.now() - 86400000 * 5),
        },
        {
          assessmentType: 'FS2 - KG1 Speaking Assessment',
          schoolTier: 'primary',
          term: 'T1',
          email: 'teacher@school.edu',
          teacherName: 'Demo Teacher',
          studentName: 'Fatima Zahra',
          yearGroupAndClass: 'KG1 - Diamond',
          totalScore: 5,
          level: 'A2.3–B1.1',
          cefrLevel: 'A2.3–B1.1',
          teacherComments: 'Described family dinner scene clearly using connectors (and, because).',
          createdBy: defaultTeacherId,
          createdAt: new Date(Date.now() - 86400000 * 6),
        },

        // --- SECONDARY ASSESSMENTS ---
        {
          assessmentType: 'Listening Part 1',
          schoolTier: 'secondary',
          term: 'T1',
          email: 'teacher@school.edu',
          teacherName: 'Demo Teacher',
          studentName: 'Alexander Hayes',
          yearGroupAndClass: 'Year 8B',
          totalScore: 24,
          level: 'B2',
          cefrLevel: 'B2',
          teacherComments: 'Excellent comprehension of complex questions and details.',
          createdBy: defaultTeacherId,
          createdAt: new Date(Date.now() - 86400000 * 2),
        },
        {
          assessmentType: 'Speaking Assessment',
          yearGroupType: 'junior',
          schoolTier: 'secondary',
          term: 'T1',
          email: 'teacher@school.edu',
          teacherName: 'Demo Teacher',
          studentName: 'Sophie Bennett',
          yearGroupAndClass: 'Year 9A',
          totalScore: 10,
          level: 'B2',
          cefrLevel: 'B2',
          teacherComments: 'Strong narrative fluency describing the 6-picture problem solving scenario.',
          createdBy: defaultTeacherId,
          createdAt: new Date(Date.now() - 86400000 * 4),
        },
        {
          assessmentType: 'Reading Assessment',
          yearGroupType: 'senior',
          schoolTier: 'secondary',
          term: 'T1',
          email: 'teacher@school.edu',
          teacherName: 'Demo Teacher',
          studentName: 'Ryan Cooper',
          yearGroupAndClass: 'Year 11C',
          totalScore: 18,
          level: 'C1',
          cefrLevel: 'C1',
          teacherComments: 'Insightful textual analysis and advanced vocabulary inferences.',
          createdBy: defaultTeacherId,
          createdAt: new Date(Date.now() - 86400000 * 7),
        },
        {
          assessmentType: 'Writing Assessment',
          yearGroupType: 'senior',
          schoolTier: 'secondary',
          term: 'T1',
          email: 'teacher@school.edu',
          teacherName: 'Demo Teacher',
          studentName: 'Chloe Taylor',
          yearGroupAndClass: 'Year 10A',
          totalScore: 17,
          level: 'C1',
          cefrLevel: 'C1',
          studentWriting: 'The implications of technological automation in contemporary society require proactive educational frameworks...',
          teacherComments: 'Well-structured argument with cohesive paragraph transitions.',
          createdBy: defaultTeacherId,
          createdAt: new Date(Date.now() - 86400000 * 8),
        },
      ];

      await Assessment.insertMany(sampleAssessments);
      console.log(`  + Seeded ${sampleAssessments.length} sample assessments (Primary & Secondary)!`);
    } else {
      console.log(`  ✓ Database already contains ${assessmentCount} assessment records.`);
    }

    console.log('\n======================================================');
    console.log('🎉 DATABASE SYNCHRONIZATION COMPLETE!');
    console.log('======================================================');
    console.log('\nYou can now log in with any of these credentials:\n');
    console.log('👩‍🏫 TEACHER LOGIN (/login):');
    console.log('   • Email: teacher@school.edu       | Password: teacher123');
    console.log('   • Email: teacher@honoureducation.com | Password: teacher123');
    console.log('   • Email: teacher@demo-school.edu  | Password: teacher123');
    console.log('\n👑 ADMIN LOGIN (/admin/login):');
    console.log('   • Email: info@honoureducation.com    | (Receives OTP via Gmail SMTP)');
    console.log('   • Email: admin@academic-excellence.com | (Receives OTP via Gmail SMTP)');
    console.log('\n🏛️ SCHOOL ADMIN:');
    console.log('   • Email: schooladmin@honoureducation.com | Password: schooladmin123');
    console.log('======================================================\n');

  } catch (err) {
    console.error('\n❌ Database Sync Error:', err);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed cleanly.');
  }
}

syncDatabase();
