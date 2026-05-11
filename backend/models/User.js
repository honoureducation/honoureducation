const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // Basic Information
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: false,
    minlength: 6
  },
  
  // Role and Status
  role: {
    type: String,
    enum: ['platform_admin', 'school_admin', 'teacher'],
    default: 'teacher'
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'suspended'],
    default: 'pending'
  },
  
  // School Association (for teachers and school admins)
  school: {
    type: mongoose.Schema.Types.Mixed, // Allow both ObjectId and String for legacy data
    required: false
  },
  
  // Teacher Information
  teacherId: {
    type: String,
    required: false
  },
  department: {
    type: String,
    required: false
  },
  phoneNumber: {
    type: String,
    required: false
  },
  teachingExperience: {
    type: Number,
    required: false
  },
  subjects: [String],
  qualifications: [String],
  
  // Admin Information
  adminLevel: {
    type: String,
    enum: ['platform', 'school'],
    required: function() { return this.role.includes('admin'); }
  },
  permissions: [{
    type: String,
    enum: [
      'manage_schools', 'manage_teachers', 'manage_students', 
      'view_reports', 'export_data', 'manage_assessments',
      'view_analytics', 'manage_settings'
    ]
  }],
  
  // Approval Information
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  },
  rejectionReason: {
    type: String
  },
  
  // Profile
  profilePicture: {
    type: String
  },
  bio: {
    type: String,
    maxlength: 500
  },
  
  // Security
  lastLogin: {
    type: Date
  },
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: {
    type: Date
  },
  resetPasswordToken: {
    type: String
  },
  resetPasswordExpires: {
    type: Date
  },
  
  // Activity Tracking
  totalStudentsAssessed: {
    type: Number,
    default: 0
  },
  totalAssessmentsCreated: {
    type: Number,
    default: 0
  },
  lastActivityDate: {
    type: Date
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Compound indexes for multi-tenancy
userSchema.index({ school: 1, role: 1, status: 1 });
userSchema.index({ email: 1 });
userSchema.index({ role: 1, status: 1 });
userSchema.index({ school: 1, teacherId: 1 }, { 
  unique: true, 
  sparse: true,
  partialFilterExpression: { teacherId: { $exists: true } }
});

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for account lock status
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Update the updatedAt field before saving
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('User', userSchema);