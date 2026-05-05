const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  // User Information
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School'
  },
  
  // Activity Details
  action: {
    type: String,
    required: true,
    enum: [
      // Authentication
      'login', 'logout', 'failed_login',
      
      // Student Management
      'student_created', 'student_updated', 'student_deleted', 'student_viewed',
      
      // Assessment Management
      'assessment_created', 'assessment_updated', 'assessment_deleted', 'assessment_viewed',
      
      // School Management (Admin only)
      'school_created', 'school_updated', 'school_deleted',
      
      // Teacher Management
      'teacher_approved', 'teacher_rejected', 'teacher_suspended',
      
      // Data Export
      'data_exported', 'report_generated',
      
      // System
      'profile_updated', 'password_changed'
    ]
  },
  
  // Target Information
  targetType: {
    type: String,
    enum: ['student', 'assessment', 'school', 'teacher', 'user', 'system']
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId
  },
  targetName: String,
  
  // Details
  description: {
    type: String,
    required: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  },
  
  // Request Information
  ipAddress: String,
  userAgent: String,
  
  // Status
  status: {
    type: String,
    enum: ['success', 'failed', 'warning'],
    default: 'success'
  },
  
  // Timestamp
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Indexes for efficient querying
activityLogSchema.index({ user: 1, timestamp: -1 });
activityLogSchema.index({ school: 1, timestamp: -1 });
activityLogSchema.index({ action: 1, timestamp: -1 });
activityLogSchema.index({ targetType: 1, targetId: 1 });
activityLogSchema.index({ timestamp: -1 });

// TTL index to automatically delete old logs (keep for 1 year)
activityLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 31536000 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);