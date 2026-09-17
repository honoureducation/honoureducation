require('dotenv').config();
const nodemailer = require('nodemailer');

async function testEmail() {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: 'info@honoureducation.com',
      pass: 'dmqb cqzf pkja wsjn' // the app password provided
    },
    tls: { rejectUnauthorized: false }
  });

  try {
    const info = await transporter.sendMail({
      from: '"Honour Education" <info@honoureducation.com>',
      to: 'info@honoureducation.com',
      subject: "Test OTP Email from Script 2",
      text: "This is a test OTP: 123456",
    });
    console.log("SUCCESS! Message ID: %s", info.messageId);
  } catch (error) {
    console.error("FAILED TO SEND:", error.message);
  }
}

testEmail();
