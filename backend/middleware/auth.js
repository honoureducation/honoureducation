const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify JWT Token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ message: 'Access token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Get user from database
    const user = await User.findById(decoded.userId).select('-password').populate('school', 'name code status');
    if (!user) {
      return res.status(401).json({ message: 'Invalid token - user not found' });
    }

    // Check if user is active
    if (user.role === 'teacher' && user.status !== 'approved') {
      return res.status(403).json({ message: 'Account not approved or suspended' });
    }

    // Check if school is active (for non-platform admins)
    // We must ensure user.school is an object with a status field before checking, 
    // because legacy users might have a plain string as their school field.
    if (user.role !== 'platform_admin' && user.school && typeof user.school === 'object' && user.school.status) {
      if (user.school.status !== 'active') {
        return res.status(403).json({ message: 'School account is inactive' });
      }
    }

    req.userId = user._id;
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    console.error('Auth middleware error:', error);
    res.status(500).json({ message: 'Authentication failed' });
  }
};

// Check if user has specific role(s)
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const userRole = req.user.role;
    const allowedRoles = Array.isArray(roles) ? roles : [roles];

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ 
        message: `Access denied. Required role(s): ${allowedRoles.join(', ')}` 
      });
    }

    next();
  };
};

// Check if user is platform admin
const requirePlatformAdmin = (req, res, next) => {
  if (req.user.role !== 'platform_admin') {
    return res.status(403).json({ message: 'Platform admin access required' });
  }
  next();
};

// Check if user is school admin
const requireSchoolAdmin = (req, res, next) => {
  if (req.user.role !== 'school_admin') {
    return res.status(403).json({ message: 'School admin access required' });
  }
  next();
};

// Check if user is any admin
const requireAdmin = (req, res, next) => {
  if (!req.user.role.includes('admin')) {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

// Check if user is teacher
const requireTeacher = (req, res, next) => {
  if (req.user.role !== 'teacher') {
    return res.status(403).json({ message: 'Teacher access required' });
  }
  next();
};

// Check if user is approved teacher
const requireApprovedTeacher = (req, res, next) => {
  if (req.user.role !== 'teacher' || req.user.status !== 'approved') {
    return res.status(403).json({ message: 'Approved teacher access required' });
  }
  next();
};

// Check if user belongs to the same school as the resource
const requireSameSchool = (req, res, next) => {
  // This middleware should be used after authenticateToken
  // It will be implemented in individual controllers where school validation is needed
  next();
};

// Optional authentication (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      const user = await User.findById(decoded.userId).select('-password').populate('school', 'name code status');
      if (user) {
        req.userId = user._id;
        req.user = user;
      }
    }
    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

module.exports = {
  authenticateToken,
  requireRole,
  requirePlatformAdmin,
  requireSchoolAdmin,
  requireAdmin,
  requireTeacher,
  requireApprovedTeacher,
  requireSameSchool,
  optionalAuth
};