// Course-store administration. Mounted behind the assessment platform's existing
// authenticateToken + requirePlatformAdmin middleware (imported, not modified).
const crypto = require('crypto');
const mongoose = require('mongoose');
const { Course, Section, Material, Order, Enrollment, Learner, Progress } = require('../models');
const { CURRENCIES, DEFAULT_CURRENCY, MATERIAL_TYPES, FILE_MATERIAL_TYPES, isSupportedCurrency } = require('../config');
const storage = require('../services/storage');
const stripeService = require('../services/stripe');
const { asyncHandler, httpError, isId, apiBase, slugify, escapeRegex, thumbnailUrl, courseStats } = require('../helpers');

const str = (v, max = 5000) => (typeof v === 'string' ? v.trim().slice(0, max) : undefined);

// "49.99" + "aed" → 4999 ; "12.5" + "kwd" → 12500
const toMinor = (major, currency) => {
  const cfg = CURRENCIES[currency];
  const n = Number(major);
  if (!Number.isFinite(n) || n < 0) throw httpError(400, 'Price must be a positive number');
  const minor = Math.round(n * 10 ** cfg.decimals);
  if (cfg.decimals === 3 && minor % 10 !== 0) {
    throw httpError(400, `${cfg.code} prices can have at most 2 decimal places`);
  }
  return minor;
};

const uniqueSlug = async (wanted, excludeId) => {
  const base = slugify(wanted) || `course-${crypto.randomBytes(3).toString('hex')}`;
  let slug = base;
  for (let i = 2; await Course.exists({ slug, ...(excludeId ? { _id: { $ne: excludeId } } : {}) }); i += 1) {
    slug = `${base}-${i}`;
  }
  return slug;
};

const loadCourse = async (id) => {
  if (!isId(id)) throw httpError(404, 'Course not found');
  const course = await Course.findById(id);
  if (!course) throw httpError(404, 'Course not found');
  return course;
};

const applyCourseFields = async (course, body) => {
  if (body.title !== undefined) {
    const t = str(body.title, 200);
    if (!t) throw httpError(400, 'Title is required');
    course.title = t;
  }
  if (body.slug !== undefined && str(body.slug)) course.slug = await uniqueSlug(body.slug, course._id);
  if (body.shortDescription !== undefined) course.shortDescription = str(body.shortDescription, 300);
  if (body.description !== undefined) course.description = str(body.description, 50000);
  if (body.category !== undefined) course.category = str(body.category, 80);
  if (body.level !== undefined) course.level = body.level;
  if (body.tags !== undefined) {
    const tags = Array.isArray(body.tags) ? body.tags : String(body.tags).split(',');
    course.tags = tags.map((t) => String(t).trim()).filter(Boolean).slice(0, 20);
  }
  if (body.currency !== undefined) {
    const c = String(body.currency).toLowerCase();
    if (!isSupportedCurrency(c)) throw httpError(400, 'Unsupported currency');
    course.currency = c;
  }
  if (body.isFree !== undefined) course.isFree = !!body.isFree;
  if (body.price !== undefined && body.price !== '') course.price = toMinor(body.price, course.currency);
  if (course.isFree) course.price = 0;
};

const adminCourseView = async (req, course, extra = {}) => ({
  ...course.toObject(),
  thumbnailUrl: await thumbnailUrl(req, course),
  ...extra,
});

// ── Meta ────────────────────────────────────────────────────────────────────
exports.meta = asyncHandler(async (req, res) => {
  res.json({
    currencies: Object.entries(CURRENCIES).map(([id, c]) => ({ id, ...c })),
    defaultCurrency: DEFAULT_CURRENCY,
    materialTypes: MATERIAL_TYPES,
    storage: storage.useS3 ? 's3' : 'local',
    stripeConfigured: stripeService.isConfigured(),
    webhookConfigured: !!process.env.STRIPE_WEBHOOK_SECRET,
  });
});

// ── Stats ───────────────────────────────────────────────────────────────────
// Dashboard numbers. "Sold" orders are paid or partly refunded; fully refunded orders
// count as refunds. Trends compare the last 30 days with the 30 days before.
exports.stats = asyncHandler(async (req, res) => {
  const DAY = 24 * 60 * 60 * 1000;
  const now = new Date();
  const since30 = new Date(now.getTime() - 30 * DAY);
  const since60 = new Date(now.getTime() - 60 * DAY);
  const SOLD = ['paid', 'partially_refunded', 'refunded'];
  const dayKey = { $dateToString: { format: '%Y-%m-%d', date: '$paidAt' } };

  const [
    revenue,
    revenue30,
    revenuePrev30,
    dailySales,
    dailyLearners,
    dailyEnrollments,
    learners,
    learners30,
    learnersPrev30,
    activeEnrollments,
    courseStatus,
    topCourses,
    recentOrders,
    recentLearners,
  ] = await Promise.all([
    Order.aggregate([
      { $match: { status: { $in: SOLD } } },
      {
        $group: {
          _id: '$currency',
          gross: { $sum: '$total' },
          refunded: { $sum: '$amountRefunded' },
          orders: { $sum: { $cond: [{ $eq: ['$status', 'refunded'] }, 0, 1] } },
          refunds: { $sum: { $cond: [{ $gt: ['$amountRefunded', 0] }, 1, 0] } },
        },
      },
      { $sort: { gross: -1 } },
    ]),
    Order.aggregate([
      { $match: { status: { $in: SOLD }, paidAt: { $gte: since30 } } },
      { $group: { _id: '$currency', net: { $sum: { $subtract: ['$total', '$amountRefunded'] } }, orders: { $sum: 1 } } },
    ]),
    Order.aggregate([
      { $match: { status: { $in: SOLD }, paidAt: { $gte: since60, $lt: since30 } } },
      { $group: { _id: '$currency', net: { $sum: { $subtract: ['$total', '$amountRefunded'] } }, orders: { $sum: 1 } } },
    ]),
    Order.aggregate([
      { $match: { status: { $in: SOLD }, paidAt: { $gte: since30 } } },
      { $group: { _id: { day: dayKey, currency: '$currency' }, net: { $sum: { $subtract: ['$total', '$amountRefunded'] } }, orders: { $sum: 1 } } },
    ]),
    Learner.aggregate([
      { $match: { createdAt: { $gte: since30 } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, n: { $sum: 1 } } },
    ]),
    Enrollment.aggregate([
      { $match: { createdAt: { $gte: since30 } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, n: { $sum: 1 } } },
    ]),
    Learner.countDocuments(),
    Learner.countDocuments({ createdAt: { $gte: since30 } }),
    Learner.countDocuments({ createdAt: { $gte: since60, $lt: since30 } }),
    Enrollment.countDocuments({ status: 'active' }),
    Course.aggregate([{ $group: { _id: '$status', n: { $sum: 1 } } }]),
    Enrollment.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$course', enrollments: { $sum: 1 }, avgProgress: { $avg: '$progressPercent' } } },
      { $sort: { enrollments: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'lms_courses', localField: '_id', foreignField: '_id', as: 'course' } },
      { $unwind: '$course' },
      {
        $project: {
          enrollments: 1,
          avgProgress: { $round: ['$avgProgress', 0] },
          title: '$course.title',
          price: '$course.price',
          currency: '$course.currency',
          isFree: '$course.isFree',
        },
      },
    ]),
    Order.find({ status: { $ne: 'pending' } })
      .sort({ createdAt: -1 })
      .limit(6)
      .populate('learner', 'firstName lastName email')
      .select('orderNumber status total currency items createdAt paidAt learner')
      .lean(),
    Learner.find().sort({ createdAt: -1 }).limit(5).select('firstName lastName email country createdAt').lean(),
  ]);

  // Fill in every day of the last 30 so charts have no gaps.
  const days = [];
  for (let i = 29; i >= 0; i -= 1) days.push(new Date(now.getTime() - i * DAY).toISOString().slice(0, 10));
  const learnerByDay = new Map(dailyLearners.map((d) => [d._id, d.n]));
  const enrolByDay = new Map(dailyEnrollments.map((d) => [d._id, d.n]));
  const currencies = [...new Set([...revenue.map((r) => r._id), ...dailySales.map((d) => d._id.currency)])];
  const daily = days.map((day) => {
    const row = { day, learners: learnerByDay.get(day) || 0, enrollments: enrolByDay.get(day) || 0, orders: 0 };
    currencies.forEach((c) => {
      row[c] = 0;
    });
    dailySales
      .filter((d) => d._id.day === day)
      .forEach((d) => {
        row[d._id.currency] = d.net;
        row.orders += d.orders;
      });
    return row;
  });

  const byCurrency = (rows) => new Map(rows.map((r) => [r._id, r]));
  const r30 = byCurrency(revenue30);
  const rPrev = byCurrency(revenuePrev30);
  const statusCount = Object.fromEntries(courseStatus.map((s) => [s._id, s.n]));

  res.json({
    revenue: revenue.map((r) => ({
      currency: r._id,
      gross: r.gross,
      refunded: r.refunded,
      net: r.gross - r.refunded,
      orders: r.orders,
      refunds: r.refunds,
      last30: (r30.get(r._id) || {}).net || 0,
      prev30: (rPrev.get(r._id) || {}).net || 0,
    })),
    orders30: revenue30.reduce((n, r) => n + r.orders, 0),
    ordersPrev30: revenuePrev30.reduce((n, r) => n + r.orders, 0),
    learners,
    learners30,
    learnersPrev30,
    activeEnrollments,
    courses: { published: statusCount.published || 0, draft: statusCount.draft || 0, archived: statusCount.archived || 0 },
    publishedCourses: statusCount.published || 0,
    currencies,
    daily,
    topCourses,
    recentOrders: recentOrders.map((o) => ({
      _id: o._id,
      orderNumber: o.orderNumber,
      status: o.status,
      total: o.total,
      currency: o.currency,
      date: o.paidAt || o.createdAt,
      course: o.items.map((i) => i.titleSnapshot).join(', '),
      learner: o.learner ? { name: `${o.learner.firstName} ${o.learner.lastName}`, email: o.learner.email } : null,
    })),
    recentLearners,
  });
});

// ── Courses ─────────────────────────────────────────────────────────────────
exports.listCourses = asyncHandler(async (req, res) => {
  const courses = await Course.find().sort({ updatedAt: -1 });
  const ids = courses.map((c) => c._id);
  const [stats, enrollCounts] = await Promise.all([
    courseStats(ids),
    Enrollment.aggregate([{ $match: { course: { $in: ids }, status: 'active' } }, { $group: { _id: '$course', n: { $sum: 1 } } }]),
  ]);
  const enrollMap = new Map(enrollCounts.map((e) => [String(e._id), e.n]));
  res.json({
    courses: await Promise.all(
      courses.map((c) =>
        adminCourseView(req, c, {
          materialCount: (stats.get(String(c._id)) || {}).materialCount || 0,
          enrollmentCount: enrollMap.get(String(c._id)) || 0,
        })
      )
    ),
  });
});

exports.createCourse = asyncHandler(async (req, res) => {
  const title = str(req.body.title, 200);
  if (!title) throw httpError(400, 'Title is required');
  const course = new Course({ title, createdBy: req.user._id, currency: DEFAULT_CURRENCY });
  course.slug = await uniqueSlug(req.body.slug || title);
  await applyCourseFields(course, { ...req.body, slug: undefined });
  await course.save();
  res.status(201).json({ course: await adminCourseView(req, course) });
});

exports.getCourse = asyncHandler(async (req, res) => {
  const course = await loadCourse(req.params.id);
  const [sections, materials, enrollmentCount] = await Promise.all([
    Section.find({ course: course._id }).sort({ order: 1, createdAt: 1 }).lean(),
    Material.find({ course: course._id }).sort({ order: 1, createdAt: 1 }).lean(),
    Enrollment.countDocuments({ course: course._id, status: 'active' }),
  ]);
  const curriculum = sections.map((s) => ({ ...s, materials: materials.filter((m) => String(m.section) === String(s._id)) }));
  res.json({ course: await adminCourseView(req, course, { enrollmentCount }), curriculum });
});

exports.updateCourse = asyncHandler(async (req, res) => {
  const course = await loadCourse(req.params.id);
  await applyCourseFields(course, req.body);

  if (req.body.status !== undefined && req.body.status !== course.status) {
    const status = req.body.status;
    if (!['draft', 'published', 'archived'].includes(status)) throw httpError(400, 'Invalid status');
    if (status === 'published') {
      if (!(await Material.exists({ course: course._id }))) throw httpError(400, 'Add at least one material before publishing');
      if (!course.isFree && !course.price) throw httpError(400, 'Set a price (or mark the course as free) before publishing');
      if (!course.publishedAt) course.publishedAt = new Date();
    }
    course.status = status;
  }
  await course.save();
  res.json({ course: await adminCourseView(req, course) });
});

exports.deleteCourse = asyncHandler(async (req, res) => {
  const course = await loadCourse(req.params.id);
  if ((await Enrollment.exists({ course: course._id })) || (await Order.exists({ 'items.course': course._id, status: { $ne: 'pending' } }))) {
    throw httpError(409, 'This course has buyers or enrolments — archive it instead of deleting');
  }
  const materials = await Material.find({ course: course._id }).select('file.storageKey');
  await Promise.all(materials.map((m) => storage.deleteObject(m.file && m.file.storageKey)));
  await storage.deleteObject(course.thumbnailKey);
  await Promise.all([
    Material.deleteMany({ course: course._id }),
    Section.deleteMany({ course: course._id }),
    Order.deleteMany({ 'items.course': course._id, status: 'pending' }),
    course.deleteOne(),
  ]);
  res.json({ message: 'Course deleted' });
});

// POST /courses/:id/upload-url { fileName, contentType, purpose: 'material' | 'thumbnail' }
exports.uploadUrl = asyncHandler(async (req, res) => {
  const course = await loadCourse(req.params.id);
  const fileName = str(req.body.fileName, 200) || 'file';
  const contentType = str(req.body.contentType, 120) || 'application/octet-stream';
  const purpose = req.body.purpose === 'thumbnail' ? 'thumbnail' : 'material';
  if (purpose === 'thumbnail' && !contentType.startsWith('image/')) throw httpError(400, 'Thumbnail must be an image');
  const storageKey = storage.buildKey(course._id, fileName, purpose);
  const target = await storage.getUploadTarget({ key: storageKey, contentType, apiBase: apiBase(req) });
  res.json({ storageKey, ...target });
});

// PUT /courses/:id/thumbnail { storageKey }
exports.setThumbnail = asyncHandler(async (req, res) => {
  const course = await loadCourse(req.params.id);
  const key = req.body.storageKey;
  if (key) {
    if (!storage.keyBelongsToCourse(key, course._id)) throw httpError(400, 'Invalid file');
    if (!(await storage.statObject(key))) throw httpError(400, 'Upload not found — please try again');
  }
  const old = course.thumbnailKey;
  course.thumbnailKey = key || undefined;
  await course.save();
  if (old && old !== key) await storage.deleteObject(old);
  res.json({ course: await adminCourseView(req, course) });
});

// PUT /courses/:id/reorder { sections: [{ id, materials: [materialId, ...] }, ...] }
exports.reorder = asyncHandler(async (req, res) => {
  const course = await loadCourse(req.params.id);
  const sections = Array.isArray(req.body.sections) ? req.body.sections : [];
  const ops = [];
  sections.forEach((s, si) => {
    if (!isId(s.id)) return;
    ops.push(Section.updateOne({ _id: s.id, course: course._id }, { $set: { order: si } }));
    (s.materials || []).forEach((mid, mi) => {
      if (isId(mid)) ops.push(Material.updateOne({ _id: mid, course: course._id }, { $set: { order: mi, section: s.id } }));
    });
  });
  await Promise.all(ops);
  res.json({ message: 'Order saved' });
});

// ── Sections ────────────────────────────────────────────────────────────────
exports.createSection = asyncHandler(async (req, res) => {
  const course = await loadCourse(req.params.id);
  const title = str(req.body.title, 200);
  if (!title) throw httpError(400, 'Section title is required');
  const last = await Section.findOne({ course: course._id }).sort({ order: -1 });
  const section = await Section.create({ course: course._id, title, order: last ? last.order + 1 : 0 });
  res.status(201).json({ section });
});

exports.updateSection = asyncHandler(async (req, res) => {
  if (!isId(req.params.id)) throw httpError(404, 'Section not found');
  const title = str(req.body.title, 200);
  if (!title) throw httpError(400, 'Section title is required');
  const section = await Section.findByIdAndUpdate(req.params.id, { $set: { title } }, { new: true });
  if (!section) throw httpError(404, 'Section not found');
  res.json({ section });
});

exports.deleteSection = asyncHandler(async (req, res) => {
  if (!isId(req.params.id)) throw httpError(404, 'Section not found');
  const section = await Section.findById(req.params.id);
  if (!section) throw httpError(404, 'Section not found');
  const materials = await Material.find({ section: section._id });
  await Promise.all(materials.map((m) => storage.deleteObject(m.file && m.file.storageKey)));
  await Progress.deleteMany({ material: { $in: materials.map((m) => m._id) } });
  await Material.deleteMany({ section: section._id });
  await section.deleteOne();
  res.json({ message: 'Section deleted' });
});

// ── Materials ───────────────────────────────────────────────────────────────
const applyMaterialFields = async (material, body, courseId) => {
  if (body.title !== undefined) {
    const t = str(body.title, 200);
    if (!t) throw httpError(400, 'Title is required');
    material.title = t;
  }
  if (body.description !== undefined) material.description = str(body.description, 5000);
  if (body.isPreview !== undefined) material.isPreview = !!body.isPreview;
  if (body.downloadable !== undefined) material.downloadable = !!body.downloadable;
  if (body.type !== undefined) {
    if (!MATERIAL_TYPES.includes(body.type)) throw httpError(400, 'Invalid material type');
    material.type = body.type;
  }
  if (material.type === 'link' && body.externalUrl !== undefined) {
    const url = str(body.externalUrl, 2000);
    if (!/^https?:\/\//i.test(url || '')) throw httpError(400, 'Link must start with http:// or https://');
    material.externalUrl = url;
  }
  if (material.type === 'text' && body.body !== undefined) material.body = str(body.body, 100000);

  if (FILE_MATERIAL_TYPES.includes(material.type) && body.file && body.file.storageKey) {
    const key = body.file.storageKey;
    if (!storage.keyBelongsToCourse(key, courseId)) throw httpError(400, 'Invalid file');
    const stat = await storage.statObject(key);
    if (!stat) throw httpError(400, 'Upload not found — please upload the file again');
    const oldKey = material.file && material.file.storageKey;
    material.file = {
      storageKey: key,
      originalName: str(body.file.originalName, 200),
      mimeType: str(body.file.mimeType, 120) || stat.mimeType,
      sizeBytes: stat.sizeBytes,
      durationSec: Number.isFinite(Number(body.file.durationSec)) ? Math.round(Number(body.file.durationSec)) : undefined,
    };
    if (oldKey && oldKey !== key) material.$locals.replacedKey = oldKey;
  }
  if (FILE_MATERIAL_TYPES.includes(material.type) && !(material.file && material.file.storageKey)) {
    throw httpError(400, 'Please upload a file for this material');
  }
};

exports.createMaterial = asyncHandler(async (req, res) => {
  if (!isId(req.params.id)) throw httpError(404, 'Section not found');
  const section = await Section.findById(req.params.id);
  if (!section) throw httpError(404, 'Section not found');
  const last = await Material.findOne({ section: section._id }).sort({ order: -1 });
  const material = new Material({
    course: section.course,
    section: section._id,
    type: req.body.type,
    title: 'Untitled',
    order: last ? last.order + 1 : 0,
    uploadedBy: req.user._id,
  });
  await applyMaterialFields(material, req.body, section.course);
  await material.save();
  res.status(201).json({ material });
});

exports.updateMaterial = asyncHandler(async (req, res) => {
  if (!isId(req.params.id)) throw httpError(404, 'Material not found');
  const material = await Material.findById(req.params.id);
  if (!material) throw httpError(404, 'Material not found');
  await applyMaterialFields(material, req.body, material.course);
  await material.save();
  if (material.$locals.replacedKey) await storage.deleteObject(material.$locals.replacedKey);
  res.json({ material });
});

exports.deleteMaterial = asyncHandler(async (req, res) => {
  if (!isId(req.params.id)) throw httpError(404, 'Material not found');
  const material = await Material.findById(req.params.id);
  if (!material) throw httpError(404, 'Material not found');
  await storage.deleteObject(material.file && material.file.storageKey);
  await Progress.deleteMany({ material: material._id });
  await material.deleteOne();
  res.json({ message: 'Material deleted' });
});

exports.previewMaterial = asyncHandler(async (req, res) => {
  if (!isId(req.params.id)) throw httpError(404, 'Material not found');
  const material = await Material.findById(req.params.id);
  if (!material) throw httpError(404, 'Material not found');
  const f = material.file || {};
  const url = f.storageKey
    ? await storage.getDownloadUrl({ key: f.storageKey, fileName: f.originalName, mimeType: f.mimeType, inline: true, apiBase: apiBase(req) })
    : material.externalUrl || null;
  res.json({ url, body: material.body });
});

// ── Orders ──────────────────────────────────────────────────────────────────
const page = (req) => {
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 25));
  const p = Math.max(1, parseInt(req.query.page, 10) || 1);
  return { limit, skip: (p - 1) * limit, page: p };
};

exports.listOrders = asyncHandler(async (req, res) => {
  const { limit, skip, page: p } = page(req);
  const q = {};
  if (req.query.status) q.status = String(req.query.status);
  else q.status = { $ne: 'pending' };
  if (req.query.search) {
    const re = new RegExp(escapeRegex(String(req.query.search).slice(0, 80)), 'i');
    const learners = await Learner.find({ $or: [{ email: re }, { firstName: re }, { lastName: re }] }).select('_id').limit(200);
    q.$or = [{ orderNumber: re }, { learner: { $in: learners.map((l) => l._id) } }];
  }
  const [orders, total] = await Promise.all([
    Order.find(q).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('learner', 'firstName lastName email').lean(),
    Order.countDocuments(q),
  ]);
  res.json({ orders, total, page: p, pages: Math.ceil(total / limit) });
});

// POST /orders/:id/refund — full refund through Stripe. The charge.refunded webhook
// will also arrive; the local update here just makes the UI reflect it immediately.
exports.refundOrder = asyncHandler(async (req, res) => {
  if (!isId(req.params.id)) throw httpError(404, 'Order not found');
  const order = await Order.findById(req.params.id);
  if (!order) throw httpError(404, 'Order not found');
  if (order.status !== 'paid' && order.status !== 'partially_refunded') throw httpError(400, 'Only paid orders can be refunded');
  if (!order.stripePaymentIntentId) throw httpError(400, 'No Stripe payment found for this order');
  await stripeService.getStripe().refunds.create({ payment_intent: order.stripePaymentIntentId, reason: 'requested_by_customer' });
  order.status = 'refunded';
  order.amountRefunded = order.total;
  order.refundedAt = new Date();
  await order.save();
  await Enrollment.updateMany({ order: order._id, status: 'active' }, { $set: { status: 'refunded' } });
  res.json({ order });
});

// ── Learners & enrolments ───────────────────────────────────────────────────
exports.listLearners = asyncHandler(async (req, res) => {
  const { limit, skip, page: p } = page(req);
  const q = {};
  if (req.query.search) {
    const re = new RegExp(escapeRegex(String(req.query.search).slice(0, 80)), 'i');
    q.$or = [{ email: re }, { firstName: re }, { lastName: re }];
  }
  const [learners, total] = await Promise.all([
    Learner.find(q).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Learner.countDocuments(q),
  ]);
  const ids = learners.map((l) => l._id);
  const counts = await Enrollment.aggregate([
    { $match: { learner: { $in: ids }, status: 'active' } },
    { $group: { _id: '$learner', n: { $sum: 1 } } },
  ]);
  const countMap = new Map(counts.map((c) => [String(c._id), c.n]));
  res.json({
    learners: learners.map((l) => ({ ...l.toPublic(), lastLoginAt: l.lastLoginAt, courseCount: countMap.get(String(l._id)) || 0 })),
    total,
    page: p,
    pages: Math.ceil(total / limit),
  });
});

exports.updateLearner = asyncHandler(async (req, res) => {
  if (!isId(req.params.id)) throw httpError(404, 'Learner not found');
  if (!['active', 'suspended'].includes(req.body.status)) throw httpError(400, 'Invalid status');
  const learner = await Learner.findByIdAndUpdate(req.params.id, { $set: { status: req.body.status } }, { new: true });
  if (!learner) throw httpError(404, 'Learner not found');
  res.json({ learner: learner.toPublic() });
});

exports.listEnrollments = asyncHandler(async (req, res) => {
  const { limit, skip, page: p } = page(req);
  const q = {};
  if (req.query.course && isId(req.query.course)) q.course = new mongoose.Types.ObjectId(String(req.query.course));
  if (req.query.learner && isId(req.query.learner)) q.learner = new mongoose.Types.ObjectId(String(req.query.learner));
  const [enrollments, total] = await Promise.all([
    Enrollment.find(q)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('learner', 'firstName lastName email')
      .populate('course', 'title slug')
      .lean(),
    Enrollment.countDocuments(q),
  ]);
  res.json({ enrollments, total, page: p, pages: Math.ceil(total / limit) });
});

// POST /enrollments { email, courseId } — give a learner free access.
exports.grantEnrollment = asyncHandler(async (req, res) => {
  const email = str(req.body.email, 200)?.toLowerCase();
  const learner = email && (await Learner.findOne({ email }));
  if (!learner) throw httpError(404, 'No learner account with that email — ask them to register first');
  const course = await loadCourse(req.body.courseId);
  const enrollment = await Enrollment.findOneAndUpdate(
    { learner: learner._id, course: course._id },
    { $set: { status: 'active', source: 'admin_grant', grantedBy: req.user._id, accessExpiresAt: null } },
    { upsert: true, new: true }
  );
  res.status(201).json({ enrollment });
});

// PATCH /enrollments/:id { status: 'active' | 'revoked' }
exports.updateEnrollment = asyncHandler(async (req, res) => {
  if (!isId(req.params.id)) throw httpError(404, 'Enrolment not found');
  if (!['active', 'revoked'].includes(req.body.status)) throw httpError(400, 'Invalid status');
  const enrollment = await Enrollment.findByIdAndUpdate(req.params.id, { $set: { status: req.body.status } }, { new: true });
  if (!enrollment) throw httpError(404, 'Enrolment not found');
  res.json({ enrollment });
});
