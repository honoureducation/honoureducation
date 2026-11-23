const crypto = require('crypto');
const { Course, Order, StripeEvent } = require('../models');
const { FRONTEND_URL } = require('../config');
const stripeService = require('../services/stripe');
const { asyncHandler, httpError, isId, findActiveEnrollment } = require('../helpers');

const newOrderNumber = () =>
  `HE-${new Date().getFullYear()}-${Date.now().toString(36).toUpperCase()}${crypto.randomBytes(2).toString('hex').toUpperCase()}`;

// Send buyers back to the site they came from when it is a known frontend.
const returnBase = (req) => {
  const origin = req.headers.origin;
  const allowed = [FRONTEND_URL, ...(process.env.LMS_ALLOWED_RETURN_ORIGINS || '').split(',')]
    .map((s) => s.trim().replace(/\/$/, ''))
    .filter(Boolean);
  if (origin && (allowed.includes(origin) || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin))) return origin;
  return FRONTEND_URL;
};

// POST /checkout { courseId }
exports.createCheckout = asyncHandler(async (req, res) => {
  const { courseId } = req.body;
  if (!isId(courseId)) throw httpError(400, 'Course is required');
  const course = await Course.findOne({ _id: courseId, status: 'published' });
  if (!course) throw httpError(404, 'Course not found');
  if (course.isFree || !course.price) throw httpError(400, 'This course is free — enrol directly');
  if (await findActiveEnrollment(req.learner._id, course._id)) throw httpError(409, 'You already own this course');

  const stripe = stripeService.getStripe();
  const learner = req.learner;

  if (!learner.stripeCustomerId) {
    const customer = await stripe.customers.create({
      email: learner.email,
      name: `${learner.firstName} ${learner.lastName}`,
      phone: learner.phone || undefined,
      metadata: { lmsLearnerId: String(learner._id) },
    });
    learner.stripeCustomerId = customer.id;
    await learner.save();
  }

  const order = await Order.create({
    orderNumber: newOrderNumber(),
    learner: learner._id,
    items: [{ course: course._id, titleSnapshot: course.title, unitAmount: course.price }],
    subtotal: course.price,
    total: course.price,
    currency: course.currency,
  });

  const base = returnBase(req);
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    customer: learner.stripeCustomerId,
    client_reference_id: String(order._id),
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: course.currency,
          unit_amount: course.price,
          product_data: {
            name: course.title,
            description: course.shortDescription || undefined,
            metadata: { lmsCourseId: String(course._id) },
          },
        },
      },
    ],
    metadata: { orderId: String(order._id), learnerId: String(learner._id), courseId: String(course._id) },
    payment_intent_data: { metadata: { orderId: String(order._id), orderNumber: order.orderNumber } },
    success_url: `${base}/learn/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${base}/learn/courses/${course.slug}?checkout=cancelled`,
  });

  order.stripeCheckoutSessionId = session.id;
  await order.save();
  res.status(201).json({ url: session.url });
});

// GET /checkout/session/:sessionId — called by the success page. The session is read
// from Stripe's API (never trusted from the browser), so this is a safe fallback if the
// webhook is slow or not yet configured.
exports.getCheckoutStatus = asyncHandler(async (req, res) => {
  const sessionId = String(req.params.sessionId || '');
  if (!/^cs_[A-Za-z0-9_]+$/.test(sessionId)) throw httpError(400, 'Invalid session');

  let order = await Order.findOne({ stripeCheckoutSessionId: sessionId, learner: req.learner._id }).populate('items.course', 'slug title');
  if (!order) throw httpError(404, 'Order not found');

  if (order.status === 'pending') {
    const session = await stripeService.getStripe().checkout.sessions.retrieve(sessionId);
    await stripeService.fulfillCheckoutSession(session);
    order = await Order.findById(order._id).populate('items.course', 'slug title');
  }

  res.json({
    order: {
      orderNumber: order.orderNumber,
      status: order.status,
      total: order.total,
      currency: order.currency,
      items: order.items.map((i) => ({ title: i.titleSnapshot, slug: i.course && i.course.slug })),
    },
  });
});

// POST /stripe/webhook (raw body)
exports.handleWebhook = async (req, res) => {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret || !stripeService.isConfigured()) {
    return res.status(503).json({ message: 'Stripe webhook not configured' });
  }
  let event;
  try {
    event = stripeService.getStripe().webhooks.constructEvent(req.body, req.headers['stripe-signature'], secret);
  } catch (err) {
    console.warn('[lms] webhook signature check failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Idempotency: record the event first; a duplicate delivery hits the unique index.
  try {
    await StripeEvent.create({ eventId: event.id, type: event.type, payloadSummary: { objectId: event.data.object.id } });
  } catch (e) {
    if (e.code === 11000) return res.json({ received: true, duplicate: true });
    console.error('[lms] could not record stripe event', e);
    return res.status(500).end();
  }

  try {
    const obj = event.data.object;
    switch (event.type) {
      case 'checkout.session.completed':
      case 'checkout.session.async_payment_succeeded':
        await stripeService.fulfillCheckoutSession(obj);
        break;
      case 'checkout.session.async_payment_failed':
        await stripeService.markSessionFailed(obj, 'failed');
        break;
      case 'checkout.session.expired':
        await stripeService.markSessionFailed(obj, 'cancelled');
        break;
      case 'charge.refunded':
        await stripeService.applyRefund(obj);
        break;
      default:
        break;
    }
    return res.json({ received: true });
  } catch (err) {
    console.error('[lms] webhook processing failed', event.type, err);
    // Remove the marker so Stripe's retry gets processed.
    await StripeEvent.deleteOne({ eventId: event.id }).catch(() => {});
    return res.status(500).end();
  }
};
