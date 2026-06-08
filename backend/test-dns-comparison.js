const mongoose = require('mongoose');
const dns = require('dns');
require('dotenv').config();

const mongoURI = process.env.MONGODB_URI;

async function testConnection(label, servers) {
  dns.setServers(servers);
  
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
  await testConnection('Google DNS (8.8.8.8)', ['8.8.8.8', '8.8.4.4']);
  await testConnection('Cloudflare DNS (1.1.1.1)', ['1.1.1.1', '1.0.0.1']);
  process.exit(0);
}

run();
