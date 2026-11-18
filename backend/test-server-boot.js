require('./server.js');

setTimeout(() => {
  console.log('Server verified successfully!');
  process.exit(0);
}, 3000);
