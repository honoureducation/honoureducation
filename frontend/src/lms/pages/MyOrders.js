import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { learnerAPI, errorMessage, formatMoney, formatDate } from '../api';
import { Spinner, EmptyState, btnPrimary } from '../components';

const STATUS = {
  paid: ['Paid', 'bg-emerald-50 text-emerald-700'],
  refunded: ['Refunded', 'bg-slate-100 text-slate-600'],
  partially_refunded: ['Partly refunded', 'bg-amber-50 text-amber-700'],
  failed: ['Failed', 'bg-rose-50 text-rose-700'],
  cancelled: ['Cancelled', 'bg-slate-100 text-slate-500'],
};

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    learnerAPI
      .get('/me/orders')
      .then((r) => setOrders(r.data.orders))
      .catch((e) => setError(errorMessage(e)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-black text-slate-900">Purchases</h1>
      <div className="mt-8">
        {loading ? (
          <Spinner />
        ) : error ? (
          <EmptyState title="Could not load purchases">{error}</EmptyState>
        ) : orders.length === 0 ? (
          <EmptyState title="No purchases yet" action={<Link to="/learn" className={btnPrimary}>Browse courses</Link>} />
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100">
            {orders.map((o) => {
              const [label, cls] = STATUS[o.status] || [o.status, 'bg-slate-100 text-slate-600'];
              return (
                <div key={o._id} className="p-5 flex flex-wrap items-center gap-4">
                  <div className="flex-1 min-w-[200px]">
                    {o.items.map((i) => (
                      <p key={i.title} className="font-bold text-slate-900">
                        {i.slug && o.status === 'paid' ? <Link className="hover:text-blue-700" to={`/learn/my-courses/${i.slug}`}>{i.title}</Link> : i.title}
                      </p>
                    ))}
                    <p className="text-xs text-slate-500 mt-1">{o.orderNumber} · {formatDate(o.paidAt || o.createdAt)}</p>
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${cls}`}>{label}</span>
                  <span className="font-black text-slate-900 w-32 text-right">{formatMoney(o.total, o.currency)}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
