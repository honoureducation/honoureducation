const mongoose = require('mongoose');
const dns = require('dns');
require('dotenv').config();

dns.setServers(['8.8.8.8', '8.8.4.4']);

const User = require('./models/User');

const mongoURI = process.env.MONGODB_URI;

mongoose.connect(mongoURI)
  .then(async () => {
    console.log('Connected to MongoDB. Fetching users...');
    const users = await User.find({}, 'email role firstName lastName status');
    console.log('Total users:', users.length);
    console.table(users.map(u => ({
      id: u._id.toString(),
      email: u.email,
      role: u.role,
      firstName: u.firstName,
      lastName: u.lastName,
      status: u.status
    })));
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
