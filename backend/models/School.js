const mongoose = require('mongoose');

const schoolSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: true,
    trim: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['primary', 'secondary', 'college', 'university', 'language_center', 'other'],
    required: true
  },
  
  // Contact Information
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    postalCode: String
  },
  contactInfo: {
    phone: String,
    email: String,
    website: String
  },
  
  // Administrative
  principalName: String,
  adminContact: {
    name: String,
    email: String,
    phone: String
  },
  
  // Platform Settings
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  subscriptionPlan: {
    type: String,
    enum: ['free', 'basic', 'premium', 'enterprise'],
    default: 'free'
  },
  maxTeachers: {
    type: Number,
    default: 5
  },
  maxStudents: {
    type: Number,
    default: 100
  },
  
  // Features
  enabledFeatures: [{
    type: String,
    enum: ['listening', 'speaking', 'reading', 'writing', 'reports', 'exports', 'analytics']
  }],
  
  // Branding
  logo: String,
  primaryColor: {
    type: String,
    default: '#3b82f6'
  },
  
  // Statistics
  totalTeachers: {
    type: Number,
    default: 0
  },
  totalStudents: {
    type: Number,
    default: 0
  },
  totalAssessments: {
    type: Number,
    default: 0
  },
  
  // Audit
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  lastActivity: {
    type: Date,
    default: Date.now
  }
});

// Indexes
schoolSchema.index({ code: 1 });
schoolSchema.index({ status: 1 });
schoolSchema.index({ createdAt: -1 });

// Virtual for full address
schoolSchema.virtual('fullAddress').get(function() {
  const addr = this.address;
  if (!addr) return '';
  return [addr.street, addr.city, addr.state, addr.country, addr.postalCode]
    .filter(Boolean)
    .join(', ');
});

// Update timestamps
schoolSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('School', schoolSchema);