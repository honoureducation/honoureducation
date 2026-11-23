const mongoose = require('mongoose');
const storage = require('./services/storage');
const { Section, Material, Enrollment, Progress } = require('./models');

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch((err) => {
    if (err && err.name === 'ValidationError') {
      return res.status(400).json({ message: Object.values(err.errors).map((e) => e.message).join(', ') });
    }
    if (err && err.code === 11000) return res.status(409).json({ message: 'That value already exists' });
    if (err && err.name === 'CastError') return res.status(404).json({ message: 'Not found' });
    if (err && typeof err.type === 'string' && err.type.startsWith('Stripe')) {
      // Never pass Stripe's own status (e.g. 401 for a bad API key) through to the browser.
      console.error('[lms] stripe error:', err.type, err.message);
      return res.status(502).json({ message: 'Payment provider error — please try again shortly' });
    }
    const status = err.status || err.statusCode || 500;
    if (status >= 500) console.error('[lms]', err);
    return res.status(status >= 400 && status < 600 ? status : 500).json({
      message: status >= 500 && !err.status ? 'Something went wrong' : err.message,
    });
  });

const httpError = (status, message) => Object.assign(new Error(message), { status });

const isId = (v) => mongoose.Types.ObjectId.isValid(v) && String(new mongoose.Types.ObjectId(v)) === String(v);

// Public origin of this API, used for local-storage file links.
const apiBase = (req) => {
  if (process.env.LMS_API_PUBLIC_URL) return process.env.LMS_API_PUBLIC_URL.replace(/\/$/, '');
  const proto = (req.headers['x-forwarded-proto'] || req.protocol || 'http').split(',')[0].trim();
  return `${proto}://${req.get('host')}`;
};

const escapeRegex = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const slugify = (s) =>
  String(s || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);

const thumbnailUrl = (req, course) =>
  course.thumbnailKey
    ? storage.getDownloadUrl({ key: course.thumbnailKey, fileName: 'thumbnail', inline: true, apiBase: apiBase(req), ttl: 6 * 3600 })
    : Promise.resolve(null);

// Counts and total duration of materials per course id.
const courseStats = async (courseIds) => {
  const rows = await Material.aggregate([
    { $match: { course: { $in: courseIds.map((id) => new mongoose.Types.ObjectId(String(id))) } } },
    {
      $group: {
        _id: '$course',
        materialCount: { $sum: 1 },
        totalDurationSec: { $sum: { $ifNull: ['$file.durationSec', 0] } },
        previewCount: { $sum: { $cond: ['$isPreview', 1, 0] } },
        videoCount: { $sum: { $cond: [{ $eq: ['$type', 'video'] }, 1, 0] } },
      },
    },
  ]);
  return new Map(rows.map((r) => [String(r._id), r]));
};

const coursePublicCard = async (req, course, stats) => {
  const s = (stats && stats.get(String(course._id))) || {};
  return {
    _id: course._id,
    title: course.title,
    slug: course.slug,
    shortDescription: course.shortDescription,
    category: course.category,
    level: course.level,
    tags: course.tags,
    price: course.price,
    currency: course.currency,
    isFree: course.isFree,
    publishedAt: course.publishedAt,
    thumbnailUrl: await thumbnailUrl(req, course),
    materialCount: s.materialCount || 0,
    totalDurationSec: s.totalDurationSec || 0,
    previewCount: s.previewCount || 0,
    videoCount: s.videoCount || 0,
  };
};

// Curriculum without any storage keys — safe to send to anyone.
const publicCurriculum = async (courseId) => {
  const [sections, materials] = await Promise.all([
    Section.find({ course: courseId }).sort({ order: 1, createdAt: 1 }).lean(),
    Material.find({ course: courseId }).sort({ order: 1, createdAt: 1 }).lean(),
  ]);
  return sections.map((s) => ({
    _id: s._id,
    title: s.title,
    materials: materials
      .filter((m) => String(m.section) === String(s._id))
      .map((m) => ({
        _id: m._id,
        title: m.title,
        description: m.description,
        type: m.type,
        isPreview: m.isPreview,
        downloadable: m.downloadable,
        durationSec: m.file && m.file.durationSec,
        sizeBytes: m.file && m.file.sizeBytes,
      })),
  }));
};

const findActiveEnrollment = async (learnerId, courseId) => {
  if (!learnerId) return null;
  const e = await Enrollment.findOne({ learner: learnerId, course: courseId });
  return e && e.isActive() ? e : null;
};

const recomputeProgress = async (learnerId, courseId) => {
  const [total, done] = await Promise.all([
    Material.countDocuments({ course: courseId }),
    Progress.countDocuments({ learner: learnerId, course: courseId, completed: true }),
  ]);
  const pct = total ? Math.min(100, Math.round((done / total) * 100)) : 0;
  await Enrollment.updateOne({ learner: learnerId, course: courseId }, { $set: { progressPercent: pct, lastAccessedAt: new Date() } });
  return pct;
};

// Content payload for one material (signed link for files).
const materialContent = async (req, material, { forceInline = false } = {}) => {
  const base = { _id: material._id, title: material.title, type: material.type, description: material.description };
  if (material.type === 'text') return { ...base, body: material.body || '' };
  if (material.type === 'link') return { ...base, externalUrl: material.externalUrl };
  const f = material.file || {};
  const inline = forceInline || ['video', 'audio', 'pdf', 'image'].includes(material.type);
  const url = await storage.getDownloadUrl({
    key: f.storageKey,
    fileName: f.originalName || material.title,
    mimeType: f.mimeType,
    inline,
    apiBase: apiBase(req),
  });
  const downloadUrl = material.downloadable
    ? await storage.getDownloadUrl({
        key: f.storageKey,
        fileName: f.originalName || material.title,
        mimeType: f.mimeType,
        inline: false,
        apiBase: apiBase(req),
      })
    : null;
  return { ...base, url, downloadUrl, mimeType: f.mimeType, originalName: f.originalName, sizeBytes: f.sizeBytes };
};

module.exports = {
  asyncHandler,
  httpError,
  isId,
  apiBase,
  escapeRegex,
  slugify,
  thumbnailUrl,
  courseStats,
  coursePublicCard,
  publicCurriculum,
  findActiveEnrollment,
  recomputeProgress,
  materialContent,
};
