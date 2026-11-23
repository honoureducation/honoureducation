const jwt = require('jsonwebtoken');
const { LMS_JWT_SECRET } = require('../config');
const { Learner } = require('../models');

const TOKEN_TYPE = 'lms_learner';

const signLearnerToken = (learner) =>
  jwt.sign({ learnerId: String(learner._id), typ: TOKEN_TYPE }, LMS_JWT_SECRET, { expiresIn: '7d' });

const readToken = (req) => {
  const h = req.headers.authorization || '';
  return h.startsWith('Bearer ') ? h.slice(7) : null;
};

const loadLearner = async (token) => {
  const decoded = jwt.verify(token, LMS_JWT_SECRET);
  if (decoded.typ !== TOKEN_TYPE || !decoded.learnerId) return null;
  const learner = await Learner.findById(decoded.learnerId);
  if (!learner || learner.status !== 'active') return null;
  return learner;
};

const requireLearner = async (req, res, next) => {
  const token = readToken(req);
  if (!token) return res.status(401).json({ message: 'Please sign in' });
  try {
    const learner = await loadLearner(token);
    if (!learner) return res.status(401).json({ message: 'Session expired, please sign in again' });
    req.learner = learner;
    return next();
  } catch (e) {
    return res.status(401).json({ message: 'Session expired, please sign in again' });
  }
};

// Attaches req.learner when a valid learner token is present; never fails.
const optionalLearner = async (req, res, next) => {
  const token = readToken(req);
  if (token) {
    try {
      req.learner = (await loadLearner(token)) || undefined;
    } catch (e) {
      /* ignore */
    }
  }
  next();
};

module.exports = { signLearnerToken, requireLearner, optionalLearner };
