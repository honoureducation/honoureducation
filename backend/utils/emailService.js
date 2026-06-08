const nodemailer = require('nodemailer');

// Create transporter
let transporter;
const createTransporter = () => {
  if (transporter) return transporter;
  const host = process.env.EMAIL_HOST;
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;
  if (!host || !user || !pass) return null;
  transporter = nodemailer.createTransport({
    host, port: parseInt(process.env.EMAIL_PORT) || 587, secure: false, auth: { user, pass }, tls: { rejectUnauthorized: false }
  });
  return transporter;
};

// Base Email Template
const getEmailTemplate = (title, content) => {
  const logoUrl = process.env.FRONTEND_URL ? `${process.env.FRONTEND_URL}/favicon.ico` : 'https://academic-excellence-frontend.onrender.com/favicon.ico';
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; margin: 0; padding: 40px 20px; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #2563eb, #4f46e5); padding: 30px; text-align: center; }
        .header img { max-height: 50px; margin-bottom: 15px; }
        .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: 0.5px; }
        .content { padding: 40px 30px; color: #334155; line-height: 1.6; font-size: 16px; }
        .content h2 { color: #1e293b; margin-top: 0; }
        .button { display: inline-block; background-color: #4f46e5; color: #ffffff !important; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 25px 0; text-align: center; }
        .footer { background-color: #f1f5f9; padding: 20px; text-align: center; color: #64748b; font-size: 13px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Honour Education</h1>
        </div>
        <div class="content">
          <h2>${title}</h2>
          ${content}
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Honour Education. All rights reserved.</p>
          <p>This is an automated message, please do not reply.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

const sendEmail = async (options) => {
  try {
    const t = createTransporter();
    if (!t) return null;
    const mailOptions = {
      from: `"Honour Education" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to: options.to,
      subject: options.subject,
      html: getEmailTemplate(options.title || options.subject, options.html)
    };
    const info = await t.sendMail(mailOptions);
    return info;
  } catch (error) {
    console.error('Email send error:', error.message);
    return null;
  }
};

const sendRegistrationEmail = async (user) => {
  const content = `
    <p>Dear <strong>${user.firstName} ${user.lastName}</strong>,</p>
    <p>Thank you for registering on our platform! Your account is currently <strong>pending approval</strong> by our administrators.</p>
    <p>Once approved, you will receive another email with instructions to set your password and access your dashboard.</p>
  `;
  return sendEmail({ to: user.email, subject: 'Welcome to Honour Education', title: 'Registration Received', html: content });
};

const sendApprovalEmail = async (user, setupToken) => {
  const setupUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/set-password/${setupToken}`;
  const content = `
    <p>Dear <strong>${user.firstName}</strong>,</p>
    <p>Great news! Your teacher account has been officially <strong>approved</strong>.</p>
    <p>To finalize your setup and access your assessment dashboard, please set your password by clicking the secure button below:</p>
    <div style="text-align: center;">
      <a href="${setupUrl}" class="button">Set Your Password</a>
    </div>
    <p style="font-size: 14px; color: #64748b; margin-top: 20px;">Or copy and paste this link into your browser: <br>${setupUrl}</p>
    <p style="font-size: 14px; color: #ef4444;"><em>Note: This link will expire in 24 hours.</em></p>
  `;
  return sendEmail({ to: user.email, subject: 'Account Approved - Action Required', title: 'Account Approved!', html: content });
};

const sendPasswordResetEmail = async (user, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/set-password/${resetToken}`;
  const content = `
    <p>Dear <strong>${user.firstName}</strong>,</p>
    <p>We received a request to reset your password. If you didn't make this request, please ignore this email.</p>
    <p>To reset your password, click the secure button below:</p>
    <div style="text-align: center;">
      <a href="${resetUrl}" class="button">Reset Password</a>
    </div>
  `;
  return sendEmail({ to: user.email, subject: 'Password Reset Request', title: 'Reset Your Password', html: content });
};

const sendContactEmail = async (contactData) => {
  const content = `
    <p><strong>New Contact Request Submitted</strong></p>
    <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
      <tr><td style="padding: 10px; border-bottom: 1px solid #e2e8f0; width: 100px;"><strong>Name:</strong></td><td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${contactData.name}</td></tr>
      <tr><td style="padding: 10px; border-bottom: 1px solid #e2e8f0;"><strong>Email:</strong></td><td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${contactData.email}</td></tr>
      <tr><td style="padding: 10px; border-bottom: 1px solid #e2e8f0;"><strong>Subject:</strong></td><td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${contactData.subject}</td></tr>
    </table>
    <p style="margin-top: 20px;"><strong>Message:</strong></p>
    <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; white-space: pre-wrap;">${contactData.message}</div>
  `;
  return sendEmail({ to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER, subject: 'New Contact Request: ' + contactData.subject, title: 'Contact Request', html: content });
};

const sendAdminOtpEmail = async (user, otp) => {
  const content = `
    <p>Dear <strong>${user.firstName}</strong>,</p>
    <p>Use the following One-Time Password (OTP) to access your Admin Dashboard. This OTP is valid for 10 minutes:</p>
    <div style="text-align: center; margin: 30px 0;">
      <span style="font-size: 36px; font-weight: 800; letter-spacing: 6px; background-color: #f1f5f9; padding: 12px 24px; border-radius: 8px; color: #4f46e5; border: 1px solid #e2e8f0;">${otp}</span>
    </div>
    <p style="color: #ef4444; font-size: 14px;"><strong>Please do not share this OTP with anyone.</strong></p>
  `;
  return sendEmail({ to: user.email, subject: 'Admin Login OTP - Action Required', title: 'Admin Verification Code', html: content });
};

module.exports = { sendRegistrationEmail, sendApprovalEmail, sendPasswordResetEmail, sendContactEmail, sendAdminOtpEmail };
