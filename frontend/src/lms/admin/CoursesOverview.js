// Course store dashboard: KPIs, 30-day charts, recent activity and setup checklist.
import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { lmsAdminAPI, errorMessage, formatMoney, toMajor, formatDate } from '../api';
import { Spinner, Pill } from '../components';

const Icon = ({ d, className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d={d} />
  </svg>
);

const ICON = {
  money: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  cart: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z',
  users: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
  book: 'M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25',
  check: 'M5 13l4 4L19 7',
  plus: 'M12 4v16m8-8H4',
  eye: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z',
};

const TONES = {
  indigo: 'bg-indigo-50 text-indigo-600',
  emerald: 'bg-emerald-50 text-emerald-600',
  sky: 'bg-sky-50 text-sky-600',
  amber: 'bg-amber-50 text-amber-600',
};

function Trend({ now, prev }) {
  if (!now && !prev) return <span className="text-xs text-slate-400">No activity in the last 30 days</span>;
  if (!prev) return <span className="text-xs font-bold text-emerald-600">New in the last 30 days</span>;
  const pct = Math.round(((now - prev) / prev) * 100);
  const up = pct >= 0;
  return (
    <span className={`text-xs font-bold ${up ? 'text-emerald-600' : 'text-rose-600'}`}>
      {up ? '▲' : '▼'} {Math.abs(pct)}% <span className="font-medium text-slate-400">vs previous 30 days</span>
    </span>
  );
}

function Kpi({ label, value, icon, tone, children }) {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</p>
          <p className="mt-2 text-2xl lg:text-3xl font-black text-slate-900 truncate">{value}</p>
        </div>
        <span className={`shrink-0 w-11 h-11 rounded-2xl flex items-center justify-center ${TONES[tone]}`}>
          <Icon d={ICON[icon]} />
        </span>
      </div>
      <div className="mt-3">{children}</div>
    </div>
  );
}

const shortDay = (iso) => new Date(`${iso}T00:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

export default function CoursesOverview({ meta, refreshKey, onNavigate }) {
  const [s, setS] = useState(null);
  const [currency, setCurrency] = useState('');

  useEffect(() => {
    let alive = true;
    lmsAdminAPI
      .get('/stats')
      .then((r) => {
        if (!alive) return;
        setS(r.data);
        setCurrency((c) => c || (r.data.revenue[0] && r.data.revenue[0].currency) || (meta && meta.defaultCurrency) || 'aed');
      })
      .catch((e) => toast.error(errorMessage(e)));
    return () => { alive = false; };
  }, [refreshKey, meta]);

  const chartData = useMemo(
    () => (s ? s.daily.map((d) => ({ ...d, label: shortDay(d.day), revenue: toMajor(d[currency] || 0, currency) })) : []),
    [s, currency]
  );

  if (!s) return <Spinner label="Loading course dashboard…" />;

  const main = s.revenue.find((r) => r.currency === currency) || s.revenue[0];
  const otherRevenue = s.revenue.filter((r) => r !== main);

  const checklist = [
    { done: !!(meta && meta.stripeConfigured), label: 'Connect Stripe payments', hint: 'Set STRIPE_SECRET_KEY on the server' },
    { done: !!(meta && meta.webhookConfigured), label: 'Add the Stripe webhook', hint: 'Set STRIPE_WEBHOOK_SECRET so refunds sync automatically' },
    { done: !!(meta && meta.storage === 's3'), label: 'Connect file storage', hint: 'Configure an R2/S3 bucket (LMS_S3_*) before going live' },
    { done: s.courses.published > 0, label: 'Publish your first course', hint: 'Add materials, set a price and publish', action: 'courses' },
    { done: s.revenue.length > 0, label: 'Make your first sale', hint: 'Share /learn with your learners' },
  ];
  const doneCount = checklist.filter((c) => c.done).length;

  return (
    <div className="space-y-8">
      {/* Welcome banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-slate-900 p-6 lg:p-8 text-white shadow-xl shadow-indigo-900/20">
        <div className="pointer-events-none absolute -top-16 -right-10 w-64 h-64 rounded-full bg-white/10 blur-2xl" />
        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-200">Course store</p>
            <h3 className="mt-2 text-2xl lg:text-3xl font-black">
              {main ? `${formatMoney(main.last30, main.currency)} earned in the last 30 days` : 'Ready to start selling'}
            </h3>
            <p className="mt-2 text-indigo-100">
              {s.courses.published} published · {s.courses.draft} draft{s.courses.archived ? ` · ${s.courses.archived} archived` : ''} · {s.activeEnrollments} active enrolment{s.activeEnrollments === 1 ? '' : 's'}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button onClick={() => onNavigate('courses')} className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 font-bold text-indigo-700 hover:bg-indigo-50">
              <Icon d={ICON.plus} className="w-4 h-4" /> New course
            </button>
            <a href="/learn" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-white/10 border border-white/20 px-5 py-3 font-bold text-white hover:bg-white/20">
              <Icon d={ICON.eye} className="w-4 h-4" /> View storefront
            </a>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Net revenue" value={main ? formatMoney(main.net, main.currency) : formatMoney(0, currency)} icon="money" tone="emerald">
          {main ? <Trend now={main.last30} prev={main.prev30} /> : <span className="text-xs text-slate-400">No sales yet</span>}
          {otherRevenue.length > 0 && (
            <p className="mt-1 text-xs text-slate-500">+ {otherRevenue.map((r) => formatMoney(r.net, r.currency)).join(' · ')}</p>
          )}
        </Kpi>
        <Kpi label="Orders (30 days)" value={s.orders30} icon="cart" tone="indigo">
          <Trend now={s.orders30} prev={s.ordersPrev30} />
        </Kpi>
        <Kpi label="Learners" value={s.learners} icon="users" tone="sky">
          <span className="text-xs text-slate-500"><strong className="text-slate-700">{s.learners30}</strong> joined in the last 30 days</span>
        </Kpi>
        <Kpi label="Active enrolments" value={s.activeEnrollments} icon="book" tone="amber">
          <span className="text-xs text-slate-500">Across {s.courses.published} published course{s.courses.published === 1 ? '' : 's'}</span>
        </Kpi>
      </div>

      {/* Charts */}
      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-900">Revenue · last 30 days</h3>
              <p className="text-xs text-slate-500">Net of refunds, by payment date</p>
            </div>
            {s.currencies.length > 1 && (
              <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="rounded-xl border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-700">
                {s.currencies.map((c) => <option key={c} value={c}>{c.toUpperCase()}</option>)}
              </select>
            )}
          </div>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="lmsRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} interval={4} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip
                  formatter={(v) => [`${currency.toUpperCase()} ${Number(v).toLocaleString()}`, 'Revenue']}
                  contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2.5} fill="url(#lmsRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
          <h3 className="font-bold text-slate-900">Sign-ups &amp; enrolments</h3>
          <p className="text-xs text-slate-500">Last 30 days</p>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} interval={6} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0' }} />
                <Bar dataKey="learners" name="New learners" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="enrollments" name="Enrolments" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex gap-4 text-xs font-semibold text-slate-500">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-sky-400" /> New learners</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-amber-500" /> Enrolments</span>
          </div>
        </div>
      </div>

      {/* Activity */}
      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900">Recent orders</h3>
            <button onClick={() => onNavigate('orders')} className="text-sm font-bold text-indigo-600 hover:underline">View all →</button>
          </div>
          {s.recentOrders.length === 0 ? (
            <p className="mt-6 text-sm text-slate-500">No orders yet. They will appear here as soon as someone buys a course.</p>
          ) : (
            <ul className="mt-4 divide-y divide-slate-100">
              {s.recentOrders.map((o) => (
                <li key={o._id} className="py-3 flex items-center gap-4 text-sm">
                  <span className="w-10 h-10 shrink-0 rounded-full bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center uppercase">
                    {o.learner ? o.learner.name.split(' ').map((p) => p[0]).slice(0, 2).join('') : '?'}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block font-semibold text-slate-900 truncate">{o.learner ? o.learner.name : 'Deleted learner'}</span>
                    <span className="block text-xs text-slate-500 truncate">{o.course} · {formatDate(o.date)}</span>
                  </span>
                  <Pill value={o.status} />
                  <span className="w-28 text-right font-bold text-slate-900">{formatMoney(o.total, o.currency)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900">Setup checklist</h3>
            <span className="text-xs font-bold text-slate-500">{doneCount}/{checklist.length} done</span>
          </div>
          <div className="mt-3 h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${(doneCount / checklist.length) * 100}%` }} />
          </div>
          <ul className="mt-4 space-y-3">
            {checklist.map((c) => (
              <li key={c.label} className="flex items-start gap-3">
                <span className={`mt-0.5 shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${c.done ? 'bg-emerald-500 text-white' : 'border-2 border-slate-300'}`}>
                  {c.done && <Icon d={ICON.check} className="w-3.5 h-3.5" />}
                </span>
                <span className="min-w-0">
                  {c.action && !c.done ? (
                    <button onClick={() => onNavigate(c.action)} className="block text-sm font-semibold text-indigo-700 hover:underline text-left">{c.label}</button>
                  ) : (
                    <span className={`block text-sm font-semibold ${c.done ? 'text-slate-400 line-through' : 'text-slate-800'}`}>{c.label}</span>
                  )}
                  {!c.done && <span className="block text-xs text-slate-500">{c.hint}</span>}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900">Top courses</h3>
            <button onClick={() => onNavigate('courses')} className="text-sm font-bold text-indigo-600 hover:underline">Manage →</button>
          </div>
          {s.topCourses.length === 0 ? (
            <p className="mt-6 text-sm text-slate-500">No enrolments yet.</p>
          ) : (
            <ul className="mt-4 space-y-4">
              {s.topCourses.map((c, i) => {
                const max = s.topCourses[0].enrollments || 1;
                return (
                  <li key={c._id}>
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className="flex items-center gap-3 min-w-0">
                        <span className="w-6 h-6 shrink-0 rounded-lg bg-slate-100 text-slate-600 text-xs font-black flex items-center justify-center">{i + 1}</span>
                        <span className="font-semibold text-slate-800 truncate">{c.title}</span>
                      </span>
                      <span className="shrink-0 text-xs text-slate-500">
                        <strong className="text-slate-900">{c.enrollments}</strong> enrolled · {c.avgProgress || 0}% avg progress
                      </span>
                    </div>
                    <div className="mt-2 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-sky-400" style={{ width: `${(c.enrollments / max) * 100}%` }} />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900">Newest learners</h3>
            <button onClick={() => onNavigate('learners')} className="text-sm font-bold text-indigo-600 hover:underline">View all →</button>
          </div>
          {s.recentLearners.length === 0 ? (
            <p className="mt-6 text-sm text-slate-500">No learners have signed up yet.</p>
          ) : (
            <ul className="mt-4 divide-y divide-slate-100">
              {s.recentLearners.map((l) => (
                <li key={l._id} className="py-3 flex items-center gap-3 text-sm">
                  <span className="w-9 h-9 shrink-0 rounded-full bg-sky-50 text-sky-700 font-bold flex items-center justify-center uppercase">
                    {(l.firstName || '?')[0]}{(l.lastName || '')[0]}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block font-semibold text-slate-900 truncate">{l.firstName} {l.lastName}</span>
                    <span className="block text-xs text-slate-500 truncate">{l.email}{l.country ? ` · ${l.country}` : ''}</span>
                  </span>
                  <span className="text-xs text-slate-400 whitespace-nowrap">{formatDate(l.createdAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
