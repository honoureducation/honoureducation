const mongoose = require('mongoose');
const dns = require('dns');
require('dotenv').config();

const mongoURI = process.env.MONGODB_URI;

async function testConnection(label, useGoogleDns) {
  if (useGoogleDns) {
    dns.setServers(['8.8.8.8', '8.8.4.4']);
  } else {
    // Reset to system default (or try to use default dns)
    // Node.js doesn't have a direct "reset" but we can check if it works without setting it.
  }
  
  console.log(`\n--- Testing: ${label} ---`);
  const start = Date.now();
  try {
    const conn = await mongoose.createConnection(mongoURI).asPromise();
    console.log(`Connected in ${Date.now() - start}ms`);
    const User = conn.model('User', new mongoose.Schema({}));
    const findStart = Date.now();
    const count = await User.countDocuments();
    console.log(`Query count: ${count} in ${Date.now() - findStart}ms`);
    await conn.close();
    console.log(`Total time: ${Date.now() - start}ms`);
  } catch (err) {
    console.error(`Failed: ${err.message}`);
  }
}

async function run() {
  // Test 1: with system dns (we spawn a child process or we just do it first before setting servers)
  await testConnection('System Default DNS', false);
  await testConnection('Google DNS (8.8.8.8)', true);
  process.exit(0);
}

run();
