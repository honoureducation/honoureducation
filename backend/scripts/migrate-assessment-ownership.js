/**
 * Migration Script: Backfill createdBy on existing assessments
 * 
 * This script matches existing assessments to teachers using the `email` field
 * and populates the new `createdBy` field.
 * 
 * Run once: node scripts/migrate-assessment-ownership.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Assessment = require('../models/Assessment');
const User = require('../models/User');

const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/student-assessment';

async function migrate() {
  try {
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');

    // Get all assessments without a createdBy
    const orphanedAssessments = await Assessment.find({ 
      $or: [
        { createdBy: null },
        { createdBy: { $exists: false } }
      ]
    });

    console.log(`Found ${orphanedAssessments.length} assessments without createdBy`);

    if (orphanedAssessments.length === 0) {
      console.log('Nothing to migrate!');
      process.exit(0);
    }

    // Get all teachers
    const teachers = await User.find({ role: 'teacher' }).select('email firstName lastName');
    console.log(`Found ${teachers.length} teachers to match against`);

    let matched = 0;
    let unmatched = 0;

    for (const assessment of orphanedAssessments) {
      // Try to match by email first
      let teacher = teachers.find(t => 
        t.email.toLowerCase() === (assessment.email || '').toLowerCase()
      );

      // Fallback: try matching by teacherName
      if (!teacher && assessment.teacherName) {
        const teacherNameLower = assessment.teacherName.toLowerCase().trim();
        teacher = teachers.find(t => {
          const fullName = `${t.firstName} ${t.lastName}`.toLowerCase().trim();
          const firstOnly = t.firstName.toLowerCase().trim();
          return fullName === teacherNameLower || firstOnly === teacherNameLower;
        });
      }

      if (teacher) {
        await Assessment.updateOne(
          { _id: assessment._id },
          { $set: { createdBy: teacher._id } }
        );
        matched++;
      } else {
        unmatched++;
        console.log(`  ⚠ Could not match assessment ${assessment._id} (email: ${assessment.email}, teacher: ${assessment.teacherName})`);
      }
    }

    console.log('\n--- Migration Complete ---');
    console.log(`✅ Matched: ${matched}`);
    console.log(`⚠  Unmatched: ${unmatched}`);
    
    if (unmatched > 0) {
      console.log('\nUnmatched assessments will still exist but won\'t appear in any teacher\'s dashboard.');
      console.log('An admin can still see all assessments. You can manually assign them if needed.');
    }

    process.exit(0);
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  }
}

migrate();
