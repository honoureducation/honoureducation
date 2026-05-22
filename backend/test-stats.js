const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');
const Assessment = require('./models/Assessment');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const teacherPerformanceStats = await Assessment.aggregate([
    { $match: {} },
    { $group: { _id: '$teacherName', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);
  console.log("Teacher Performance Stats:", teacherPerformanceStats);
  
  process.exit(0);
});
