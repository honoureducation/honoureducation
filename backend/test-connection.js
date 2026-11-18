const mongoose = require('mongoose');
require('dotenv').config();

const mongoURI = process.env.MONGODB_URI;

console.log('Testing connection with .env MONGODB_URI...');

mongoose.connect(mongoURI, { serverSelectionTimeoutMS: 8000 })
  .then(async () => {
    console.log('🎉 SUCCESS! Connected to MongoDB Atlas from .env!');
    console.log('Database:', mongoose.connection.db.databaseName);
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Collections in database:');
    collections.forEach(c => console.log(' - ' + c.name));
    await mongoose.disconnect();
    process.exit(0);
  })
  .catch(err => {
    console.log('❌ Connection error:', err.message);
    process.exit(1);
  });
