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
  const baseUrl = process.env.FRONTEND_URL || 'https://assessment.honoureducation.online';
  const logoUrl = `https://assessment.honoureducation.online/logonew.png?v=${Date.now()}`;

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f0f4f8; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f0f4f8; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 30px rgba(0,0,0,0.10);">

              <!-- HEADER -->
              <tr>
                <td style="background: linear-gradient(135deg, #2b6c8a 0%, #1a4f6e 100%); padding: 36px 30px; text-align: center;">
                  <img src="${logoUrl}" alt="Honour Education Logo" width="200"
                    style="display: block; margin: 0 auto 16px auto; max-width: 100%; height: auto;"
                    onerror="this.style.display='none'">
                  <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase;">Honour Education</h1>
                  <p style="color: rgba(255,255,255,0.75); margin: 6px 0 0 0; font-size: 13px; letter-spacing: 0.5px;">Academic Excellence Platform</p>
                </td>
              </tr>

              <!-- TITLE BAR -->
              <tr>
                <td style="background-color: #e8f4f8; padding: 18px 30px; border-bottom: 2px solid #c8e4ee;">
                  <h2 style="margin: 0; color: #1a4f6e; font-size: 20px; font-weight: 700;">${title}</h2>
                </td>
              </tr>

              <!-- BODY CONTENT -->
              <tr>
                <td style="padding: 36px 30px; color: #334155; font-size: 16px; line-height: 1.75;">
                  ${content}
                </td>
              </tr>

              <!-- DIVIDER -->
              <tr>
                <td style="padding: 0 30px;">
                  <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 0;">
                </td>
              </tr>

              <!-- FOOTER -->
              <tr>
                <td style="background-color: #f8fafc; padding: 24px 30px; text-align: center;">
                  <p style="margin: 0 0 6px 0; color: #64748b; font-size: 13px;">
                    © ${new Date().getFullYear()} <strong style="color: #1a4f6e;">Honour Education</strong>. All rights reserved.
                  </p>
                  <p style="margin: 0; color: #94a3b8; font-size: 12px;">
                    This is an automated message — please do not reply directly to this email.
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
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
  const baseUrl = process.env.FRONTEND_URL || 'https://assessment.honoureducation.online';
  const setupUrl = `${baseUrl}/set-password/${setupToken}`;
  const content = `
    <div style="text-align: center; margin-bottom: 28px;">
      <div style="display: inline-block; background-color: #d1fae5; border-radius: 50%; width: 60px; height: 60px; line-height: 60px; font-size: 30px;">✅</div>
    </div>
    <p style="margin-top: 0;">Dear <strong>${user.firstName}</strong>,</p>
    <p>Great news! Your teacher account on the <strong>Honour Education</strong> platform has been officially <strong style="color: #1a4f6e;">approved</strong>.</p>
    <p>To finalize your setup and access your assessment dashboard, please create your password by clicking the secure button below:</p>
    <div style="text-align: center; margin: 28px 0;">
      <a href="${setupUrl}" style="display: inline-block; background: linear-gradient(135deg, #2b6c8a, #1a4f6e); color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 16px; letter-spacing: 0.5px;">Set Your Password</a>
    </div>
    <p style="font-size: 13px; color: #64748b; text-align: center;">Or copy and paste this link into your browser:<br>
      <span style="color: #2b6c8a; word-break: break-all;">${setupUrl}</span>
    </p>
    <div style="background-color: #fff7ed; border-left: 4px solid #f97316; padding: 12px 16px; border-radius: 4px; margin-top: 20px;">
      <p style="margin: 0; font-size: 13px; color: #9a3412;"><strong>⚠️ Important:</strong> This link will expire in <strong>24 hours</strong>. Please set your password before it expires.</p>
    </div>
  `;
  return sendEmail({ to: user.email, subject: 'Account Approved - Action Required', title: 'Account Approved! 🎉', html: content });
};

const sendPasswordResetEmail = async (user, resetToken) => {
  const baseUrl = process.env.FRONTEND_URL || 'https://assessment.honoureducation.online';
  const resetUrl = `${baseUrl}/set-password/${resetToken}`;
  const content = `
    <p>Dear <strong>${user.firstName}</strong>,</p>
    <p>We received a request to reset your password. If you didn't make this request, you can safely ignore this email — no changes will be made.</p>
    <p>To reset your password, click the secure button below:</p>
    <div style="text-align: center; margin: 28px 0;">
      <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #2b6c8a, #1a4f6e); color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 16px;">Reset Password</a>
    </div>
    <p style="font-size: 13px; color: #64748b; text-align: center;">Or copy and paste this link:<br>
      <span style="color: #2b6c8a; word-break: break-all;">${resetUrl}</span>
    </p>
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
