// Data model for the course store. All collections are prefixed lms_ and all
// model names are prefixed Lms so nothing collides with the assessment platform.
const mongoose = require('mongoose');
const { MATERIAL_TYPES, CURRENCIES } = require('./config');

const { ObjectId } = mongoose.Schema.Types;
const currencyEnum = Object.keys(CURRENCIES);

// ── Learners (buyers) ───────────────────────────────────────────────────────
const learnerSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    phone: { type: String, trim: true },
    country: { type: String, trim: true },
    emailVerified: { type: Boolean, default: false },
    resetPasswordToken: { type: String }, // sha256 of the emailed token
    resetPasswordExpires: { type: Date },
    stripeCustomerId: { type: String },
    status: { type: String, enum: ['active', 'suspended'], default: 'active' },
    loginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date },
    lastLoginAt: { type: Date },
  },
  { timestamps: true }
);
learnerSchema.index({ stripeCustomerId: 1 }, { unique: true, sparse: true });
learnerSchema.methods.toPublic = function toPublic() {
  return {
    _id: this._id,
    email: this.email,
    firstName: this.firstName,
    lastName: this.lastName,
    phone: this.phone,
    country: this.country,
    status: this.status,
    createdAt: this.createdAt,
  };
};

// ── Courses ─────────────────────────────────────────────────────────────────
const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    shortDescription: { type: String, trim: true, maxlength: 300 },
    description: { type: String },
    thumbnailKey: { type: String },
    category: { type: String, trim: true },
    level: { type: String, enum: ['beginner', 'intermediate', 'advanced', 'all'], default: 'all' },
    tags: [{ type: String, trim: true }],
    price: { type: Number, default: 0, min: 0 }, // smallest currency unit
    currency: { type: String, enum: currencyEnum, default: 'aed' },
    isFree: { type: Boolean, default: false },
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
    publishedAt: { type: Date },
    createdBy: { type: ObjectId, ref: 'User' },
  },
  { timestamps: true }
);
courseSchema.index({ status: 1, publishedAt: -1 });

// ── Sections (chapters) ─────────────────────────────────────────────────────
const sectionSchema = new mongoose.Schema(
  {
    course: { type: ObjectId, ref: 'LmsCourse', required: true },
    title: { type: String, required: true, trim: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);
sectionSchema.index({ course: 1, order: 1 });

// ── Materials (uploaded files / lessons) ────────────────────────────────────
const materialSchema = new mongoose.Schema(
  {
    course: { type: ObjectId, ref: 'LmsCourse', required: true },
    section: { type: ObjectId, ref: 'LmsCourseSection', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String },
    type: { type: String, enum: MATERIAL_TYPES, required: true },
    file: {
      storageKey: String, // private storage key — never exposed to learners
      originalName: String,
      mimeType: String,
      sizeBytes: Number,
      durationSec: Number,
    },
    externalUrl: { type: String },
    body: { type: String },
    isPreview: { type: Boolean, default: false },
    downloadable: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
    uploadedBy: { type: ObjectId, ref: 'User' },
  },
  { timestamps: true }
);
materialSchema.index({ course: 1, section: 1, order: 1 });

// ── Orders ──────────────────────────────────────────────────────────────────
const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true },
    learner: { type: ObjectId, ref: 'LmsLearner', required: true },
    items: [
      {
        course: { type: ObjectId, ref: 'LmsCourse', required: true },
        titleSnapshot: String,
        unitAmount: Number,
      },
    ],
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true },
    currency: { type: String, enum: currencyEnum, required: true },
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'cancelled', 'refunded', 'partially_refunded'],
      default: 'pending',
    },
    stripeCheckoutSessionId: { type: String },
    stripePaymentIntentId: { type: String },
    amountRefunded: { type: Number, default: 0 },
    paidAt: Date,
    refundedAt: Date,
  },
  { timestamps: true }
);
orderSchema.index({ learner: 1, createdAt: -1 });
orderSchema.index({ stripeCheckoutSessionId: 1 }, { unique: true, sparse: true });
orderSchema.index({ stripePaymentIntentId: 1 }, { sparse: true });
orderSchema.index({ status: 1, createdAt: -1 });

// ── Enrollments (the access check) ──────────────────────────────────────────
const enrollmentSchema = new mongoose.Schema(
  {
    learner: { type: ObjectId, ref: 'LmsLearner', required: true },
    course: { type: ObjectId, ref: 'LmsCourse', required: true },
    order: { type: ObjectId, ref: 'LmsOrder' },
    source: { type: String, enum: ['purchase', 'free', 'admin_grant'], required: true },
    grantedBy: { type: ObjectId, ref: 'User' },
    status: { type: String, enum: ['active', 'revoked', 'refunded'], default: 'active' },
    accessExpiresAt: { type: Date }, // null = lifetime
    progressPercent: { type: Number, default: 0 },
    lastAccessedAt: Date,
  },
  { timestamps: true }
);
enrollmentSchema.index({ learner: 1, course: 1 }, { unique: true });
enrollmentSchema.index({ course: 1, status: 1 });
enrollmentSchema.methods.isActive = function isActive() {
  return this.status === 'active' && (!this.accessExpiresAt || this.accessExpiresAt > new Date());
};

// ── Material progress ───────────────────────────────────────────────────────
const progressSchema = new mongoose.Schema(
  {
    learner: { type: ObjectId, ref: 'LmsLearner', required: true },
    material: { type: ObjectId, ref: 'LmsCourseMaterial', required: true },
    course: { type: ObjectId, ref: 'LmsCourse', required: true },
    completed: { type: Boolean, default: false },
    lastPositionSec: Number,
  },
  { timestamps: true }
);
progressSchema.index({ learner: 1, material: 1 }, { unique: true });
progressSchema.index({ learner: 1, course: 1 });

// ── Stripe webhook idempotency ──────────────────────────────────────────────
const stripeEventSchema = new mongoose.Schema({
  eventId: { type: String, required: true, unique: true },
  type: String,
  processedAt: { type: Date, default: Date.now },
  payloadSummary: mongoose.Schema.Types.Mixed,
});

const model = (name, schema, collection) =>
  mongoose.models[name] || mongoose.model(name, schema, collection);

module.exports = {
  Learner: model('LmsLearner', learnerSchema, 'lms_learners'),
  Course: model('LmsCourse', courseSchema, 'lms_courses'),
  Section: model('LmsCourseSection', sectionSchema, 'lms_course_sections'),
  Material: model('LmsCourseMaterial', materialSchema, 'lms_course_materials'),
  Order: model('LmsOrder', orderSchema, 'lms_orders'),
  Enrollment: model('LmsEnrollment', enrollmentSchema, 'lms_enrollments'),
  Progress: model('LmsMaterialProgress', progressSchema, 'lms_material_progress'),
  StripeEvent: model('LmsStripeEvent', stripeEventSchema, 'lms_stripe_events'),
};
