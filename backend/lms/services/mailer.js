// Emails for course-store learners. Uses the same SMTP settings as the assessment
// platform (EMAIL_HOST / EMAIL_USER / EMAIL_PASS) but is kept separate from
// utils/emailService.js so that file is not touched.
const nodemailer = require('nodemailer');
const { FRONTEND_URL, CURRENCIES } = require('../config');

let transporter;
const getTransporter = () => {
  if (transporter) return transporter;
  const { EMAIL_HOST: host, EMAIL_USER: user, EMAIL_PASS: pass } = process.env;
  if (!host || !user || !pass) return null;
  transporter = nodemailer.createTransport({
    host,
    port: parseInt(process.env.EMAIL_PORT, 10) || 587,
    secure: false,
    auth: { user, pass },
  });
  return transporter;
};

const escapeHtml = (s) =>
  String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const layout = (title, inner) => `<!DOCTYPE html><html><body style="margin:0;background:#f0f4f8;font-family:Segoe UI,Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px"><tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fff;border-radius:14px;overflow:hidden">
<tr><td style="background:#1a4f6e;padding:22px 28px;color:#fff;font-size:18px;font-weight:700">Honour Education · Courses</td></tr>
<tr><td style="padding:28px;color:#1e293b;font-size:15px;line-height:1.6"><h2 style="margin:0 0 16px;font-size:20px;color:#1a4f6e">${escapeHtml(title)}</h2>${inner}</td></tr>
<tr><td style="padding:18px 28px;background:#f8fafc;color:#64748b;font-size:12px">You received this email because you have an account on Honour Education Courses.</td></tr>
</table></td></tr></table></body></html>`;

const button = (href, label) =>
  `<p style="margin:24px 0"><a href="${href}" style="background:#2563eb;color:#fff;padding:12px 22px;border-radius:10px;text-decoration:none;font-weight:600">${escapeHtml(label)}</a></p>`;

const send = async ({ to, subject, title, html }) => {
  const t = getTransporter();
  if (!t) {
    console.log(`[lms] email not configured — would send "${subject}" to ${to}`);
    return null;
  }
  try {
    return await t.sendMail({
      from: `"Honour Education" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to,
      subject,
      html: layout(title || subject, html),
    });
  } catch (e) {
    console.error('[lms] email send error:', e.message);
    return null;
  }
};

const formatMoney = (minor, currency) => {
  const cfg = CURRENCIES[currency] || { decimals: 2, code: String(currency).toUpperCase() };
  return `${cfg.code} ${(minor / 10 ** cfg.decimals).toFixed(cfg.decimals)}`;
};

const sendWelcome = (learner) =>
  send({
    to: learner.email,
    subject: 'Welcome to Honour Education Courses',
    html: `<p>Hi ${escapeHtml(learner.firstName)},</p><p>Your account is ready. Browse the catalogue and start learning.</p>${button(
      `${FRONTEND_URL}/learn`,
      'Browse courses'
    )}`,
  });

const sendPasswordReset = (learner, token) =>
  send({
    to: learner.email,
    subject: 'Reset your password',
    html: `<p>Hi ${escapeHtml(learner.firstName)},</p><p>Use the button below to choose a new password. The link expires in 1 hour.</p>${button(
      `${FRONTEND_URL}/learn/reset-password/${token}`,
      'Reset password'
    )}<p style="color:#64748b;font-size:13px">If you did not ask for this, you can ignore this email.</p>`,
  });

const sendPurchaseReceipt = (learner, order, courses) => {
  const rows = order.items
    .map(
      (i) =>
        `<tr><td style="padding:6px 0">${escapeHtml(i.titleSnapshot)}</td><td style="padding:6px 0;text-align:right">${formatMoney(
          i.unitAmount,
          order.currency
        )}</td></tr>`
    )
    .join('');
  const first = courses && courses[0];
  return send({
    to: learner.email,
    subject: `Your receipt · ${order.orderNumber}`,
    title: 'Thank you for your purchase',
    html: `<p>Hi ${escapeHtml(learner.firstName)}, your payment was successful.</p>
<table width="100%" style="border-top:1px solid #e2e8f0;border-bottom:1px solid #e2e8f0;margin:12px 0">${rows}
<tr><td style="padding:8px 0;font-weight:700">Total</td><td style="padding:8px 0;text-align:right;font-weight:700">${formatMoney(
      order.total,
      order.currency
    )}</td></tr></table>
<p style="color:#64748b;font-size:13px">Order ${escapeHtml(order.orderNumber)}</p>
${button(first ? `${FRONTEND_URL}/learn/my-courses/${first.slug}` : `${FRONTEND_URL}/learn/my-courses`, 'Start learning')}`,
  });
};

module.exports = { sendWelcome, sendPasswordReset, sendPurchaseReceipt };
