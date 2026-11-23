// Course store (LMS) — entry point. server.js mounts:
//   app.use('/api/lms', lms.rawRouter)  BEFORE express.json()  (Stripe webhook + local file streams)
//   app.use('/api/lms', lms.router)     after express.json()
const express = require('express');
const { authenticateToken, requirePlatformAdmin } = require('../middleware/auth');
const { requireLearner, optionalLearner } = require('./middleware/learnerAuth');
const auth = require('./controllers/learnerAuthController');
const catalog = require('./controllers/catalogController');
const checkout = require('./controllers/checkoutController');
const admin = require('./controllers/adminController');
const storage = require('./services/storage');

// ── Routes that need the untouched request body ─────────────────────────────
const rawRouter = express.Router();
rawRouter.post('/stripe/webhook', express.raw({ type: 'application/json' }), checkout.handleWebhook);
rawRouter.put('/files/upload/:token', storage.handleLocalUpload);
rawRouter.get('/files/download/:token', storage.handleLocalDownload);

// ── JSON routes ─────────────────────────────────────────────────────────────
const router = express.Router();

// Learner accounts
router.post('/auth/register', auth.register);
router.post('/auth/login', auth.login);
router.post('/auth/forgot-password', auth.forgotPassword);
router.post('/auth/reset-password', auth.resetPassword);
router.get('/auth/me', requireLearner, auth.me);
router.put('/auth/me', requireLearner, auth.updateMe);
router.put('/auth/password', requireLearner, auth.changePassword);

// Public catalogue
router.get('/courses', catalog.listCourses);
router.get('/courses/:slug', optionalLearner, catalog.getCourse);
router.get('/courses/:slug/materials/:materialId', optionalLearner, catalog.accessMaterial);
router.post('/courses/:slug/enroll-free', requireLearner, catalog.enrollFree);

// Learner area
router.get('/me/courses', requireLearner, catalog.myCourses);
router.get('/me/courses/:slug', requireLearner, catalog.myCourse);
router.get('/me/materials/:id', requireLearner, catalog.myMaterial);
router.post('/me/materials/:id/progress', requireLearner, catalog.saveProgress);
router.get('/me/orders', requireLearner, catalog.myOrders);

// Checkout
router.post('/checkout', requireLearner, checkout.createCheckout);
router.get('/checkout/session/:sessionId', requireLearner, checkout.getCheckoutStatus);

// Admin (platform admins of the assessment platform)
const adminRouter = express.Router();
adminRouter.use(authenticateToken, requirePlatformAdmin);
adminRouter.get('/meta', admin.meta);
adminRouter.get('/stats', admin.stats);
adminRouter.get('/courses', admin.listCourses);
adminRouter.post('/courses', admin.createCourse);
adminRouter.get('/courses/:id', admin.getCourse);
adminRouter.put('/courses/:id', admin.updateCourse);
adminRouter.delete('/courses/:id', admin.deleteCourse);
adminRouter.post('/courses/:id/upload-url', admin.uploadUrl);
adminRouter.put('/courses/:id/thumbnail', admin.setThumbnail);
adminRouter.put('/courses/:id/reorder', admin.reorder);
adminRouter.post('/courses/:id/sections', admin.createSection);
adminRouter.put('/sections/:id', admin.updateSection);
adminRouter.delete('/sections/:id', admin.deleteSection);
adminRouter.post('/sections/:id/materials', admin.createMaterial);
adminRouter.put('/materials/:id', admin.updateMaterial);
adminRouter.delete('/materials/:id', admin.deleteMaterial);
adminRouter.get('/materials/:id/preview', admin.previewMaterial);
adminRouter.get('/orders', admin.listOrders);
adminRouter.post('/orders/:id/refund', admin.refundOrder);
adminRouter.get('/learners', admin.listLearners);
adminRouter.patch('/learners/:id', admin.updateLearner);
adminRouter.get('/enrollments', admin.listEnrollments);
adminRouter.post('/enrollments', admin.grantEnrollment);
adminRouter.patch('/enrollments/:id', admin.updateEnrollment);
router.use('/admin', adminRouter);

// Unknown /api/lms/* paths return JSON 404 instead of falling through to the SPA.
router.use((req, res) => res.status(404).json({ message: 'Not found' }));

module.exports = { router, rawRouter };
