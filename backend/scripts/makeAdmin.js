// Promote an existing account to platform_admin (OTP login at /admin).
// Usage (from the backend folder):  node scripts/makeAdmin.js someone@example.com
// The account's password is left unchanged. Note: an admin account can no longer
// use the teacher login.
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const email = String(process.argv[2] || '').trim().toLowerCase();
if (!email) {
  console.error('Usage: node scripts/makeAdmin.js <email>');
  process.exit(1);
}

mongoose
  .connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 15000 })
  .then(async () => {
    const user = await User.findOne({ email });
    if (!user) {
      console.error(`No account found for ${email}. Register it first (teacher sign-up), then run this again.`);
      process.exit(1);
    }
    console.log(`Before: ${user.email} role=${user.role} status=${user.status}`);
    await User.updateOne(
      { _id: user._id },
      {
        $set: {
          role: 'platform_admin',
          status: 'approved',
          adminLevel: 'platform',
          permissions: [
            'manage_schools', 'manage_teachers', 'manage_students', 'view_reports',
            'export_data', 'manage_assessments', 'view_analytics', 'manage_settings',
          ],
          updatedAt: new Date(),
        },
      }
    );
    const after = await User.findById(user._id).select('email role status').lean();
    console.log(`After:  ${after.email} role=${after.role} status=${after.status}`);
    process.exit(0);
  })
  .catch((err) => {
    console.error('Error:', err.message);
    process.exit(1);
  });
