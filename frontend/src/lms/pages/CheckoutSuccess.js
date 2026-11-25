import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { learnerAPI, errorMessage, formatMoney } from '../api';
import { Spinner, btnPrimary, btnSecondary } from '../components';

// Stripe redirects here. The backend confirms the payment with Stripe directly,
// so access is never granted just because this page was opened.
export default function CheckoutSuccess() {
  const [params] = useSearchParams();
  const sessionId = params.get('session_id');
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!sessionId) {
      setError('Missing payment reference.');
      return undefined;
    }
    let alive = true;
    let tries = 0;
    const check = () =>
      learnerAPI
        .get(`/checkout/session/${encodeURIComponent(sessionId)}`)
        .then((r) => {
          if (!alive) return;
          setOrder(r.data.order);
          // Some payment methods confirm a few seconds later — poll briefly.
          if (r.data.order.status === 'pending' && tries < 10) {
            tries += 1;
            setTimeout(check, 3000);
          }
        })
        .catch((e) => alive && setError(errorMessage(e)));
    check();
    return () => { alive = false; };
  }, [sessionId]);

  const first = order && order.items[0];

  return (
    <div className="max-w-xl mx-auto px-4 py-16">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-card-md p-8 text-center">
        {error ? (
          <>
            <h1 className="text-2xl font-black text-slate-900">We couldn't confirm your payment</h1>
            <p className="text-slate-500 mt-3">{error}</p>
            <p className="text-slate-500 mt-1 text-sm">If you were charged, your course will appear in My courses shortly.</p>
            <Link to="/learn/my-courses" className={`${btnPrimary} mt-6`}>My courses</Link>
          </>
        ) : !order || order.status === 'pending' ? (
          <>
            <Spinner label="Confirming your payment…" />
            {order && <p className="text-sm text-slate-500">This can take a moment. You can safely leave this page — we'll email your receipt.</p>}
          </>
        ) : order.status === 'paid' ? (
          <>
            <div className="mx-auto w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            </div>
            <h1 className="text-2xl font-black text-slate-900 mt-4">Payment successful</h1>
            <p className="text-slate-600 mt-2">
              You now own <strong>{first && first.title}</strong>. A receipt is on its way to your email.
            </p>
            <p className="text-sm text-slate-400 mt-1">{order.orderNumber} · {formatMoney(order.total, order.currency)}</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              {first && first.slug && <Link to={`/learn/my-courses/${first.slug}`} className={btnPrimary}>Start learning</Link>}
              <Link to="/learn" className={btnSecondary}>Browse more</Link>
            </div>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-black text-slate-900">Payment not completed</h1>
            <p className="text-slate-500 mt-3">Your payment was not completed and you have not been charged.</p>
            <Link to="/learn" className={`${btnPrimary} mt-6`}>Back to courses</Link>
          </>
        )}
      </div>
    </div>
  );
}
