const mongoose = require('mongoose');
require('dotenv').config();

const mongoURI = process.env.MONGODB_URI;

console.log('Testing MongoDB connection...');
console.log('URI:', mongoURI.replace(/:[^:@]*@/, ':****@')); // Hide password in logs

mongoose.connect(mongoURI)
  .then(() => {
    console.log('✅ MongoDB connected successfully!');
    console.log('Database:', mongoose.connection.db.databaseName);
    process.exit(0);
  })
  .catch(err => {
    console.log('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });