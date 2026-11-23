const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { Learner } = require('../models');
const { signLearnerToken } = require('../middleware/learnerAuth');
const mailer = require('../services/mailer');
const { asyncHandler, httpError } = require('../helpers');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_ATTEMPTS = 5;
const LOCK_MS = 15 * 60 * 1000;

const clean = (v, max = 100) => (typeof v === 'string' ? v.trim().slice(0, max) : undefined);

const validatePassword = (pw) => {
  if (typeof pw !== 'string' || pw.length < 8) throw httpError(400, 'Password must be at least 8 characters');
  if (pw.length > 128) throw httpError(400, 'Password is too long');
};

exports.register = asyncHandler(async (req, res) => {
  const email = clean(req.body.email, 200)?.toLowerCase();
  const firstName = clean(req.body.firstName);
  const lastName = clean(req.body.lastName);
  if (!firstName || !lastName) throw httpError(400, 'First and last name are required');
  if (!email || !EMAIL_RE.test(email)) throw httpError(400, 'Please enter a valid email address');
  validatePassword(req.body.password);

  if (await Learner.exists({ email })) throw httpError(409, 'An account with this email already exists. Please sign in.');

  const learner = await Learner.create({
    email,
    firstName,
    lastName,
    phone: clean(req.body.phone, 40),
    country: clean(req.body.country, 60),
    passwordHash: await bcrypt.hash(req.body.password, 12),
    lastLoginAt: new Date(),
  });
  mailer.sendWelcome(learner).catch(() => {});
  res.status(201).json({ token: signLearnerToken(learner), learner: learner.toPublic() });
});

exports.login = asyncHandler(async (req, res) => {
  const email = clean(req.body.email, 200)?.toLowerCase();
  const password = req.body.password;
  if (!email || !password) throw httpError(400, 'Email and password are required');

  const learner = await Learner.findOne({ email });
  if (!learner) throw httpError(401, 'Incorrect email or password');
  if (learner.lockUntil && learner.lockUntil > new Date()) {
    throw httpError(429, 'Too many failed attempts. Please try again in a few minutes.');
  }
  if (learner.status !== 'active') throw httpError(403, 'This account has been suspended. Please contact support.');

  const ok = await bcrypt.compare(String(password), learner.passwordHash);
  if (!ok) {
    learner.loginAttempts = (learner.loginAttempts || 0) + 1;
    if (learner.loginAttempts >= MAX_ATTEMPTS) {
      learner.lockUntil = new Date(Date.now() + LOCK_MS);
      learner.loginAttempts = 0;
    }
    await learner.save();
    throw httpError(401, 'Incorrect email or password');
  }

  learner.loginAttempts = 0;
  learner.lockUntil = undefined;
  learner.lastLoginAt = new Date();
  await learner.save();
  res.json({ token: signLearnerToken(learner), learner: learner.toPublic() });
});

exports.me = asyncHandler(async (req, res) => {
  res.json({ learner: req.learner.toPublic() });
});

exports.updateMe = asyncHandler(async (req, res) => {
  const l = req.learner;
  ['firstName', 'lastName'].forEach((k) => {
    const v = clean(req.body[k]);
    if (v) l[k] = v;
  });
  if (req.body.phone !== undefined) l.phone = clean(req.body.phone, 40);
  if (req.body.country !== undefined) l.country = clean(req.body.country, 60);
  await l.save();
  res.json({ learner: l.toPublic() });
});

exports.changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!(await bcrypt.compare(String(currentPassword || ''), req.learner.passwordHash))) {
    throw httpError(400, 'Current password is incorrect');
  }
  validatePassword(newPassword);
  req.learner.passwordHash = await bcrypt.hash(newPassword, 12);
  await req.learner.save();
  res.json({ message: 'Password updated' });
});

exports.forgotPassword = asyncHandler(async (req, res) => {
  const email = clean(req.body.email, 200)?.toLowerCase();
  const generic = { message: 'If an account exists for that email, a reset link has been sent.' };
  if (!email) return res.json(generic);
  const learner = await Learner.findOne({ email, status: 'active' });
  if (learner) {
    const token = crypto.randomBytes(32).toString('hex');
    learner.resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');
    learner.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);
    await learner.save();
    await mailer.sendPasswordReset(learner, token);
  }
  return res.json(generic);
});

exports.resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;
  if (!token) throw httpError(400, 'Reset link is invalid');
  validatePassword(password);
  const hashed = crypto.createHash('sha256').update(String(token)).digest('hex');
  const learner = await Learner.findOne({ resetPasswordToken: hashed, resetPasswordExpires: { $gt: new Date() } });
  if (!learner) throw httpError(400, 'This reset link is invalid or has expired');
  learner.passwordHash = await bcrypt.hash(password, 12);
  learner.resetPasswordToken = undefined;
  learner.resetPasswordExpires = undefined;
  learner.loginAttempts = 0;
  learner.lockUntil = undefined;
  await learner.save();
  res.json({ token: signLearnerToken(learner), learner: learner.toPublic() });
});
