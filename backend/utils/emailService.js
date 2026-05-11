const nodemailer = require('nodemailer');

// Create transporter - configured for Gmail App Passwords
let transporter;

const createTransporter = () => {
  if (transporter) return transporter;

  const host = process.env.EMAIL_HOST;
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  // If no email config, skip email sending
  if (!host || !user || !pass) {
    console.log('⚠️  Email not configured — emails will be skipped. Set EMAIL_HOST, EMAIL_USER, and EMAIL_PASS in .env');
    return null;
  }

  transporter = nodemailer.createTransport({
    host,
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false, // false for port 587 (STARTTLS)
    auth: { user, pass },
    tls: {
      rejectUnauthorized: false
    }
  });

  return transporter;
};

/**
 * Send an email
 * @param {Object} options - Email options (to, subject, html)
 */
const sendEmail = async (options) => {
  try {
    const t = createTransporter();
    if (!t) {
      console.log('📧 Email skipped (no config):', options.subject, '→', options.to);
      return null;
    }

    const mailOptions = {
      from: `"Honour Education" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html
    };

    const info = await t.sendMail(mailOptions);
    console.log('✅ Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('❌ Email send error:', error.message);
    // Don't crash the registration flow — log and continue
    return null;
  }
};

/**
 * Send registration confirmation email to teacher
 */
const sendRegistrationEmail = async (user) => {
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded: 12px;">
      <h2 style="color: #1e293b;">Welcome to Honour Education!</h2>
      <p>Dear ${user.firstName},</p>
      <p>Thank you for registering as a teacher on our platform. Your account is currently <strong>pending approval</strong> by our administrators.</p>
      <p>Once your account is approved, you will receive another email with a link to set your password and access the platform.</p>
      <p>Best regards,<br>The Honour Education Team</p>
    </div>
  `;

  return sendEmail({
    to: user.email,
    subject: 'Thanks for Registering - Honour Education',
    html
  });
};

/**
 * Send approval and password setup email to teacher
 */
const sendApprovalEmail = async (user, setupToken) => {
  const setupUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/set-password/${setupToken}`;
  
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded: 12px;">
      <h2 style="color: #1e293b;">Your Account is Approved!</h2>
      <p>Dear ${user.firstName},</p>
      <p>Good news! Your teacher account has been approved by our administrators.</p>
      <p>Please click the button below to set your password and complete your account setup:</p>
      <div style="margin: 30px 0; text-align: center;">
        <a href="${setupUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Set Your Password</a>
      </div>
      <p>Or copy and paste this link into your browser:</p>
      <p style="color: #64748b; font-size: 14px;">${setupUrl}</p>
      <p>This link will expire in 24 hours.</p>
      <p>Best regards,<br>The Honour Education Team</p>
    </div>
  `;

  return sendEmail({
    to: user.email,
    subject: 'Account Approved - Set Your Password',
    html
  });
};

module.exports = {
  sendRegistrationEmail,
  sendApprovalEmail
};
