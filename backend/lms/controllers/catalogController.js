// Public catalogue + learner area (my courses, progress, orders).
const { Course, Material, Enrollment, Progress, Order } = require('../models');
const {
  asyncHandler,
  httpError,
  isId,
  escapeRegex,
  courseStats,
  coursePublicCard,
  publicCurriculum,
  findActiveEnrollment,
  recomputeProgress,
  materialContent,
} = require('../helpers');

const findPublishedBySlug = async (slug) => {
  const course = await Course.findOne({ slug: String(slug).toLowerCase(), status: 'published' });
  if (!course) throw httpError(404, 'Course not found');
  return course;
};

// GET /courses?search=&category=
exports.listCourses = asyncHandler(async (req, res) => {
  const q = { status: 'published' };
  if (req.query.category) q.category = String(req.query.category);
  if (req.query.search) {
    const re = new RegExp(escapeRegex(String(req.query.search).slice(0, 80)), 'i');
    q.$or = [{ title: re }, { shortDescription: re }, { category: re }, { tags: re }];
  }
  const courses = await Course.find(q).sort({ publishedAt: -1 }).limit(200);
  const stats = await courseStats(courses.map((c) => c._id));
  const [cards, categories] = await Promise.all([
    Promise.all(courses.map((c) => coursePublicCard(req, c, stats))),
    Course.distinct('category', { status: 'published', category: { $nin: [null, ''] } }),
  ]);
  res.json({ courses: cards, categories });
});

// GET /courses/:slug
exports.getCourse = asyncHandler(async (req, res) => {
  const course = await findPublishedBySlug(req.params.slug);
  const stats = await courseStats([course._id]);
  const [card, curriculum, enrollment] = await Promise.all([
    coursePublicCard(req, course, stats),
    publicCurriculum(course._id),
    req.learner ? findActiveEnrollment(req.learner._id, course._id) : null,
  ]);
  res.json({ course: { ...card, description: course.description, curriculum }, enrolled: !!enrollment });
});

// GET /courses/:slug/materials/:materialId — preview materials are open to everyone,
// everything else needs an active enrollment.
exports.accessMaterial = asyncHandler(async (req, res) => {
  if (!isId(req.params.materialId)) throw httpError(404, 'Material not found');
  const course = await findPublishedBySlug(req.params.slug);
  const material = await Material.findOne({ _id: req.params.materialId, course: course._id });
  if (!material) throw httpError(404, 'Material not found');

  if (!material.isPreview) {
    if (!req.learner) throw httpError(401, 'Please sign in to access this material');
    const enrollment = await findActiveEnrollment(req.learner._id, course._id);
    if (!enrollment) throw httpError(403, 'Purchase this course to access this material');
    enrollment.lastAccessedAt = new Date();
    await enrollment.save();
  }
  res.json({ material: await materialContent(req, material) });
});

// POST /courses/:slug/enroll-free
exports.enrollFree = asyncHandler(async (req, res) => {
  const course = await findPublishedBySlug(req.params.slug);
  if (!course.isFree) throw httpError(400, 'This course must be purchased');
  const existing = await Enrollment.findOne({ learner: req.learner._id, course: course._id });
  if (existing && existing.isActive()) return res.json({ enrolled: true });
  if (existing && existing.status === 'revoked') throw httpError(403, 'Your access to this course was removed. Please contact support.');
  await Enrollment.findOneAndUpdate(
    { learner: req.learner._id, course: course._id },
    { $set: { status: 'active', source: 'free', accessExpiresAt: null } },
    { upsert: true }
  );
  res.status(201).json({ enrolled: true });
});

// ── Learner area ────────────────────────────────────────────────────────────

// GET /me/courses
exports.myCourses = asyncHandler(async (req, res) => {
  const enrollments = await Enrollment.find({ learner: req.learner._id, status: 'active' })
    .sort({ lastAccessedAt: -1, createdAt: -1 })
    .populate('course');
  const live = enrollments.filter((e) => e.course && e.isActive() && e.course.status !== 'draft');
  const stats = await courseStats(live.map((e) => e.course._id));
  const courses = await Promise.all(
    live.map(async (e) => ({
      ...(await coursePublicCard(req, e.course, stats)),
      progressPercent: e.progressPercent,
      enrolledAt: e.createdAt,
      lastAccessedAt: e.lastAccessedAt,
      accessExpiresAt: e.accessExpiresAt,
    }))
  );
  res.json({ courses });
});

// GET /me/courses/:slug — curriculum plus per-material progress. Archived courses stay
// available to people who already own them.
exports.myCourse = asyncHandler(async (req, res) => {
  const course = await Course.findOne({ slug: String(req.params.slug).toLowerCase(), status: { $ne: 'draft' } });
  if (!course) throw httpError(404, 'Course not found');
  const enrollment = await findActiveEnrollment(req.learner._id, course._id);
  if (!enrollment) throw httpError(403, 'You are not enrolled in this course');

  const [curriculum, progress] = await Promise.all([
    publicCurriculum(course._id),
    Progress.find({ learner: req.learner._id, course: course._id }).lean(),
  ]);
  const byMaterial = new Map(progress.map((p) => [String(p.material), p]));
  curriculum.forEach((s) =>
    s.materials.forEach((m) => {
      const p = byMaterial.get(String(m._id));
      m.completed = !!(p && p.completed);
      m.lastPositionSec = p ? p.lastPositionSec : undefined;
    })
  );
  res.json({
    course: { _id: course._id, title: course.title, slug: course.slug, description: course.description, curriculum },
    progressPercent: enrollment.progressPercent,
  });
});

// GET /me/materials/:id — content for an owned course (works for archived courses too).
exports.myMaterial = asyncHandler(async (req, res) => {
  if (!isId(req.params.id)) throw httpError(404, 'Material not found');
  const material = await Material.findById(req.params.id);
  if (!material) throw httpError(404, 'Material not found');
  const enrollment = await findActiveEnrollment(req.learner._id, material.course);
  if (!enrollment) throw httpError(403, 'You are not enrolled in this course');
  enrollment.lastAccessedAt = new Date();
  await enrollment.save();
  res.json({ material: await materialContent(req, material) });
});

// POST /me/materials/:id/progress { completed?, lastPositionSec? }
exports.saveProgress = asyncHandler(async (req, res) => {
  if (!isId(req.params.id)) throw httpError(404, 'Material not found');
  const material = await Material.findById(req.params.id).select('course');
  if (!material) throw httpError(404, 'Material not found');
  if (!(await findActiveEnrollment(req.learner._id, material.course))) throw httpError(403, 'You are not enrolled in this course');

  const set = {};
  if (typeof req.body.completed === 'boolean') set.completed = req.body.completed;
  const pos = Number(req.body.lastPositionSec);
  if (Number.isFinite(pos) && pos >= 0) set.lastPositionSec = Math.floor(pos);

  await Progress.findOneAndUpdate(
    { learner: req.learner._id, material: material._id },
    { $set: { ...set, course: material.course } },
    { upsert: true }
  );
  const progressPercent = await recomputeProgress(req.learner._id, material.course);
  res.json({ progressPercent });
});

// GET /me/orders
exports.myOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ learner: req.learner._id, status: { $ne: 'pending' } })
    .sort({ createdAt: -1 })
    .limit(100)
    .populate('items.course', 'slug')
    .lean();
  res.json({
    orders: orders.map((o) => ({
      _id: o._id,
      orderNumber: o.orderNumber,
      status: o.status,
      total: o.total,
      currency: o.currency,
      amountRefunded: o.amountRefunded,
      createdAt: o.createdAt,
      paidAt: o.paidAt,
      items: o.items.map((i) => ({ title: i.titleSnapshot, unitAmount: i.unitAmount, slug: i.course && i.course.slug })),
    })),
  });
});
