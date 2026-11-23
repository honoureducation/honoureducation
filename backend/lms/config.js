// Course store (LMS) configuration.
// Everything for this feature lives under backend/lms and uses lms_* collections,
// so it never touches the assessment platform's data.

// Currencies offered to Middle East buyers. Amounts are always stored in the
// currency's smallest unit (fils / halala / dirham / cent), which is what Stripe expects.
// KWD, BHD and OMR use 3 decimals, and Stripe requires those amounts to be multiples of 10.
const CURRENCIES = {
  aed: { code: 'AED', label: 'UAE Dirham', decimals: 2 },
  sar: { code: 'SAR', label: 'Saudi Riyal', decimals: 2 },
  qar: { code: 'QAR', label: 'Qatari Riyal', decimals: 2 },
  kwd: { code: 'KWD', label: 'Kuwaiti Dinar', decimals: 3 },
  bhd: { code: 'BHD', label: 'Bahraini Dinar', decimals: 3 },
  omr: { code: 'OMR', label: 'Omani Rial', decimals: 3 },
  usd: { code: 'USD', label: 'US Dollar', decimals: 2 },
};

const DEFAULT_CURRENCY = (process.env.LMS_DEFAULT_CURRENCY || 'aed').toLowerCase();

// Separate secret from the assessment platform's JWT_SECRET so a learner token can
// never be accepted by teacher/admin routes (and vice versa).
const LMS_JWT_SECRET =
  process.env.LMS_JWT_SECRET ||
  `${process.env.JWT_SECRET || 'your-secret-key'}::lms-learner`;

if (!process.env.LMS_JWT_SECRET && process.env.NODE_ENV === 'production') {
  console.warn('[lms] LMS_JWT_SECRET is not set — using a value derived from JWT_SECRET. Set a dedicated secret.');
}

const FRONTEND_URL = (process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/$/, '');

// How long signed file links stay valid (seconds). Long enough to watch a video.
const SIGNED_URL_TTL = parseInt(process.env.LMS_SIGNED_URL_TTL, 10) || 2 * 60 * 60;

const MATERIAL_TYPES = ['video', 'pdf', 'document', 'audio', 'image', 'link', 'text'];
const FILE_MATERIAL_TYPES = ['video', 'pdf', 'document', 'audio', 'image'];

const isSupportedCurrency = (c) => Object.prototype.hasOwnProperty.call(CURRENCIES, String(c || '').toLowerCase());

module.exports = {
  CURRENCIES,
  DEFAULT_CURRENCY,
  LMS_JWT_SECRET,
  FRONTEND_URL,
  SIGNED_URL_TTL,
  MATERIAL_TYPES,
  FILE_MATERIAL_TYPES,
  isSupportedCurrency,
};
