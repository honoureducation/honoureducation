// Stripe client + order fulfilment. Fulfilment is idempotent: it can be triggered by
// the webhook and by the success-page check, and only the first call does any work.
const { Order, Enrollment, Learner, Course } = require('../models');
const mailer = require('./mailer');

let client;
const getStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    const err = new Error('Payments are not configured (STRIPE_SECRET_KEY missing)');
    err.status = 503;
    throw err;
  }
  if (!client) client = require('stripe')(process.env.STRIPE_SECRET_KEY);
  return client;
};

const isConfigured = () => !!process.env.STRIPE_SECRET_KEY;

const grantEnrollmentsForOrder = async (order) => {
  for (const item of order.items) {
    await Enrollment.findOneAndUpdate(
      { learner: order.learner, course: item.course },
      {
        $set: { status: 'active', source: 'purchase', order: order._id, accessExpiresAt: null },
        $setOnInsert: { progressPercent: 0 },
      },
      { upsert: true, new: true }
    );
  }
};

// session: a Stripe Checkout Session object (from webhook or retrieved from the API).
const fulfillCheckoutSession = async (session) => {
  if (!session || session.mode !== 'payment') return null;
  if (session.payment_status !== 'paid' && session.payment_status !== 'no_payment_required') return null;

  const orderId = session.metadata && session.metadata.orderId;
  const query = orderId ? { _id: orderId } : { stripeCheckoutSessionId: session.id };

  const paymentIntentId =
    typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent && session.payment_intent.id;

  // Atomic pending → paid transition so concurrent callers can't double-fulfil.
  const order = await Order.findOneAndUpdate(
    { ...query, status: { $in: ['pending', 'failed', 'cancelled'] } },
    {
      $set: {
        status: 'paid',
        paidAt: new Date(),
        stripePaymentIntentId: paymentIntentId,
        stripeCheckoutSessionId: session.id,
      },
    },
    { new: true }
  );

  if (!order) return Order.findOne(query); // already fulfilled (or unknown)

  // Sanity check: amount and currency charged must match the order.
  if (session.amount_total != null && (session.amount_total !== order.total || session.currency !== order.currency)) {
    console.error('[lms] amount mismatch for order', order.orderNumber, session.amount_total, session.currency);
  }

  await grantEnrollmentsForOrder(order);

  try {
    const [learner, courses] = await Promise.all([
      Learner.findById(order.learner),
      Course.find({ _id: { $in: order.items.map((i) => i.course) } }).select('title slug'),
    ]);
    if (learner) await mailer.sendPurchaseReceipt(learner, order, courses);
  } catch (e) {
    console.warn('[lms] receipt email failed', e.message);
  }
  return order;
};

const markSessionFailed = async (session, status) => {
  const orderId = session.metadata && session.metadata.orderId;
  const query = orderId ? { _id: orderId } : { stripeCheckoutSessionId: session.id };
  await Order.updateOne({ ...query, status: 'pending' }, { $set: { status } });
};

// charge: a Stripe Charge object from charge.refunded
const applyRefund = async (charge) => {
  const pi = typeof charge.payment_intent === 'string' ? charge.payment_intent : charge.payment_intent && charge.payment_intent.id;
  if (!pi) return;
  const order = await Order.findOne({ stripePaymentIntentId: pi });
  if (!order) return;
  const full = charge.refunded === true || charge.amount_refunded >= charge.amount;
  order.amountRefunded = charge.amount_refunded;
  order.status = full ? 'refunded' : 'partially_refunded';
  order.refundedAt = new Date();
  await order.save();
  if (full) {
    await Enrollment.updateMany({ order: order._id, status: 'active' }, { $set: { status: 'refunded' } });
  }
};

module.exports = { getStripe, isConfigured, fulfillCheckoutSession, markSessionFailed, applyRefund };
