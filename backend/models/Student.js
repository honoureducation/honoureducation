const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
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
  studentId: {
    type: String,
    required: true,
    trim: true
  },
  
  // School Association
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: true
  },
  
  // Academic Information
  yearGroup: {
    type: String,
    required: true
  },
  class: {
    type: String,
    required: true
  },
  academicYear: {
    type: String,
    required: true
  },
  
  // Personal Information
  dateOfBirth: Date,
  gender: {
    type: String,
    enum: ['male', 'female', 'other', 'prefer_not_to_say']
  },
  nationality: String,
  
  // Language Information
  nativeLanguage: String,
  otherLanguages: [String],
  englishLearningStartDate: Date,
  previousSchools: [String],
  
  // Contact Information
  parentContact: {
    name: String,
    email: String,
    phone: String,
    relationship: String
  },
  
  // Academic Status
  status: {
    type: String,
    enum: ['active', 'inactive', 'graduated', 'transferred'],
    default: 'active'
  },
  enrollmentDate: {
    type: Date,
    default: Date.now
  },
  
  // Assessment Summary
  assessmentSummary: {
    totalAssessments: {
      type: Number,
      default: 0
    },
    lastAssessmentDate: Date,
    currentLevel: {
      listening: String,
      speaking: String,
      reading: String,
      writing: String,
      overall: String
    },
    averageScores: {
      listening: Number,
      speaking: Number,
      reading: Number,
      writing: Number
    }
  },
  
  // Notes and Comments
  notes: String,
  specialNeeds: String,
  learningSupport: String,
  
  // Audit Trail
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
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
studentSchema.index({ school: 1, studentId: 1 }, { unique: true });
studentSchema.index({ school: 1, status: 1 });
studentSchema.index({ school: 1, yearGroup: 1, class: 1 });
studentSchema.index({ school: 1, createdAt: -1 });

// Virtual for full name
studentSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for current age
studentSchema.virtual('age').get(function() {
  if (!this.dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
});

// Update timestamps
studentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Student', studentSchema);