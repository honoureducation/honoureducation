// Course store admin. Rendered by the Admin Dashboard when the "Courses" workspace
// is selected; the dashboard sidebar drives which section is shown.
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { lmsAdminAPI, errorMessage, formatMoney, formatDate } from '../api';
import { Spinner, Thumb, Pill, inputCls, btnPrimary, btnSecondary } from '../components';
import CourseEditor from './CourseEditor';
import CoursesOverview from './CoursesOverview';
import CourseWizard from './CourseWizard';

// Sidebar items for the Courses workspace (icons are heroicons outline paths).
export const LMS_NAV = [
  { id: 'new', label: 'Create course', cta: true, icon: 'M12 4v16m8-8H4' },
  { id: 'overview', label: 'Dashboard', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
  { id: 'courses', label: 'Courses', icon: 'M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25' },
  { id: 'orders', label: 'Orders', icon: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z' },
  { id: 'learners', label: 'Learners', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
];

export default function LmsAdmin({ tab = 'overview', onTabChange, refreshKey = 0 }) {
  const [editingId, setEditingId] = useState(null);
  const [meta, setMeta] = useState(null);

  useEffect(() => {
    lmsAdminAPI.get('/meta').then((r) => setMeta(r.data)).catch((e) => toast.error(errorMessage(e, 'Course store unavailable')));
  }, [refreshKey]);

  // Changing sidebar section closes the editor, unless we are switching to open one.
  const pendingEdit = useRef(null);
  useEffect(() => {
    setEditingId(pendingEdit.current);
    pendingEdit.current = null;
  }, [tab]);

  const go = (t) => onTabChange && onTabChange(t);

  if (editingId) return <CourseEditor courseId={editingId} meta={meta} onBack={() => setEditingId(null)} />;

  if (tab === 'new') {
    return (
      <CourseWizard
        key={refreshKey}
        meta={meta}
        onExit={() => go('courses')}
        onOpenEditor={(id) => { pendingEdit.current = id; go('courses'); }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {tab !== 'overview' && meta && (!meta.stripeConfigured || !meta.webhookConfigured || meta.storage === 'local') && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 space-y-1">
          <p className="font-bold">Setup needed before going live</p>
          {!meta.stripeConfigured && <p>• Payments are off: set STRIPE_SECRET_KEY on the server.</p>}
          {meta.stripeConfigured && !meta.webhookConfigured && <p>• Set STRIPE_WEBHOOK_SECRET so payments and refunds are recorded automatically.</p>}
          {meta.storage === 'local' && <p>• Files are stored on the server disk (development mode). Configure an R2/S3 bucket (LMS_S3_*) for production.</p>}
        </div>
      )}

      {tab === 'overview' && <CoursesOverview meta={meta} refreshKey={refreshKey} onNavigate={go} />}
      {tab === 'courses' && <Courses key={refreshKey} onEdit={setEditingId} onCreate={() => go('new')} />}
      {tab === 'orders' && <Orders key={refreshKey} />}
      {tab === 'learners' && <Learners key={refreshKey} />}
    </div>
  );
}

function Courses({ onEdit, onCreate }) {
  const [courses, setCourses] = useState(null);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    lmsAdminAPI.get('/courses').then((r) => setCourses(r.data.courses)).catch((e) => toast.error(errorMessage(e)));
  }, []);

  if (!courses) return <Spinner />;

  if (courses.length === 0) {
    return (
      <div className="rounded-3xl border-2 border-dashed border-slate-300 bg-white p-10 lg:p-16 text-center">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>
        </div>
        <h3 className="mt-5 text-2xl font-black text-slate-900">Create your first course</h3>
        <p className="mt-2 text-slate-500 max-w-md mx-auto">A short guided setup: name it, set a price, add a cover and drop in your lessons. It takes about 5 minutes.</p>
        <button onClick={onCreate} className="mt-8 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 font-bold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700">
          + Create course
        </button>
      </div>
    );
  }

  const counts = courses.reduce((acc, c) => ({ ...acc, [c.status]: (acc[c.status] || 0) + 1 }), {});
  const q = search.trim().toLowerCase();
  const shown = courses.filter((c) => (filter === 'all' || c.status === filter) && (!q || c.title.toLowerCase().includes(q) || (c.category || '').toLowerCase().includes(q)));

  return (
    <div className="space-y-5">
      <div className="flex flex-col lg:flex-row lg:items-center gap-3">
        <div className="flex flex-wrap gap-2">
          {[['all', 'All', courses.length], ['published', 'Published', counts.published || 0], ['draft', 'Drafts', counts.draft || 0], ['archived', 'Archived', counts.archived || 0]].map(([id, label, n]) => (
            <button key={id} onClick={() => setFilter(id)}
              className={`rounded-full px-4 py-2 text-sm font-bold transition-colors ${filter === id ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-400'}`}>
              {label} <span className={filter === id ? 'text-slate-300' : 'text-slate-400'}>{n}</span>
            </button>
          ))}
        </div>
        <div className="flex gap-3 lg:ml-auto">
          <input className={`${inputCls} lg:w-64`} placeholder="Search courses" value={search} onChange={(e) => setSearch(e.target.value)} />
          <button onClick={onCreate} className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 font-bold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700">
            + Create course
          </button>
        </div>
      </div>

      {shown.length === 0 ? (
        <p className="text-center text-slate-500 py-12">No courses match.</p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {shown.map((c) => {
            const needs = [];
            if (!c.materialCount) needs.push('add lessons');
            if (!c.isFree && !c.price) needs.push('set a price');
            return (
              <button key={c._id} onClick={() => onEdit(c._id)}
                className="group text-left bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all">
                <div className="relative aspect-video overflow-hidden">
                  <Thumb url={c.thumbnailUrl} title={c.title} className="group-hover:scale-105 transition-transform duration-500" />
                  <span className="absolute top-3 left-3"><Pill value={c.status} /></span>
                </div>
                <div className="p-5">
                  <p className="font-extrabold text-slate-900 leading-snug line-clamp-2">{c.title}</p>
                  <p className="mt-1 text-sm font-bold text-slate-700">{c.isFree ? 'Free' : c.price ? formatMoney(c.price, c.currency) : 'No price yet'}</p>
                  <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
                    <span><strong className="text-slate-700">{c.materialCount}</strong> lesson{c.materialCount === 1 ? '' : 's'}</span>
                    <span><strong className="text-slate-700">{c.enrollmentCount}</strong> enrolled</span>
                    <span className="ml-auto font-bold text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity">Edit →</span>
                  </div>
                  {c.status === 'draft' && needs.length > 0 && (
                    <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800">To publish: {needs.join(' and ')}</p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Pager({ page, pages, onPage }) {
  if (!pages || pages <= 1) return null;
  return (
    <div className="flex items-center justify-end gap-2 text-sm">
      <button disabled={page <= 1} onClick={() => onPage(page - 1)} className={btnSecondary}>Previous</button>
      <span className="text-slate-500">Page {page} of {pages}</span>
      <button disabled={page >= pages} onClick={() => onPage(page + 1)} className={btnSecondary}>Next</button>
    </div>
  );
}

function Orders() {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const load = useCallback(() => {
    lmsAdminAPI
      .get('/orders', { params: { status: status || undefined, search: search || undefined, page } })
      .then((r) => setData(r.data))
      .catch((e) => toast.error(errorMessage(e)));
  }, [status, search, page]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  const refund = async (o) => {
    if (!window.confirm(`Refund ${formatMoney(o.total, o.currency)} for order ${o.orderNumber}? The learner will lose access to the course.`)) return;
    try {
      await lmsAdminAPI.post(`/orders/${o._id}/refund`);
      toast.success('Refund issued');
      load();
    } catch (e) {
      toast.error(errorMessage(e));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <input className={inputCls} placeholder="Search order number, email or name" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        <select className={`${inputCls} sm:w-56`} value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
          <option value="">All completed</option>
          {['paid', 'refunded', 'partially_refunded', 'failed', 'cancelled', 'pending'].map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
        </select>
      </div>
      {!data ? (
        <Spinner />
      ) : data.orders.length === 0 ? (
        <p className="text-center text-slate-500 py-12">No orders found.</p>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500">
              <tr><th className="p-3">Order</th><th className="p-3">Learner</th><th className="p-3">Course</th><th className="p-3">Date</th><th className="p-3">Status</th><th className="p-3 text-right">Total</th><th className="p-3" /></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.orders.map((o) => (
                <tr key={o._id}>
                  <td className="p-3 font-mono text-xs">{o.orderNumber}</td>
                  <td className="p-3">{o.learner ? <><p className="font-semibold">{o.learner.firstName} {o.learner.lastName}</p><p className="text-xs text-slate-500">{o.learner.email}</p></> : '—'}</td>
                  <td className="p-3">{o.items.map((i) => i.titleSnapshot).join(', ')}</td>
                  <td className="p-3 whitespace-nowrap">{formatDate(o.paidAt || o.createdAt)}</td>
                  <td className="p-3"><Pill value={o.status} /></td>
                  <td className="p-3 text-right font-bold whitespace-nowrap">{formatMoney(o.total, o.currency)}</td>
                  <td className="p-3 text-right">
                    {(o.status === 'paid' || o.status === 'partially_refunded') && (
                      <button onClick={() => refund(o)} className="text-xs font-bold text-rose-600 hover:underline">Refund</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {data && <Pager page={data.page} pages={data.pages} onPage={setPage} />}
    </div>
  );
}

function Learners() {
  const [data, setData] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [grant, setGrant] = useState({ email: '', courseId: '' });
  const [courses, setCourses] = useState([]);

  const load = useCallback(() => {
    lmsAdminAPI
      .get('/learners', { params: { search: search || undefined, page } })
      .then((r) => setData(r.data))
      .catch((e) => toast.error(errorMessage(e)));
  }, [search, page]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  useEffect(() => {
    lmsAdminAPI.get('/courses').then((r) => setCourses(r.data.courses)).catch(() => {});
  }, []);

  const toggle = async (l) => {
    const status = l.status === 'active' ? 'suspended' : 'active';
    if (status === 'suspended' && !window.confirm(`Suspend ${l.email}? They will not be able to sign in.`)) return;
    try {
      await lmsAdminAPI.patch(`/learners/${l._id}`, { status });
      load();
    } catch (e) {
      toast.error(errorMessage(e));
    }
  };

  const giveAccess = async (e) => {
    e.preventDefault();
    try {
      await lmsAdminAPI.post('/enrollments', grant);
      toast.success('Access granted');
      setGrant({ email: '', courseId: '' });
      load();
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={giveAccess} className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
        <h3 className="font-bold text-slate-900">Give free access to a course</h3>
        <div className="flex flex-col lg:flex-row gap-3">
          <input type="email" required className={inputCls} placeholder="Learner email" value={grant.email} onChange={(e) => setGrant({ ...grant, email: e.target.value })} />
          <select required className={inputCls} value={grant.courseId} onChange={(e) => setGrant({ ...grant, courseId: e.target.value })}>
            <option value="">Choose course</option>
            {courses.map((c) => <option key={c._id} value={c._id}>{c.title}</option>)}
          </select>
          <button className={`${btnPrimary} shrink-0`}>Grant access</button>
        </div>
      </form>

      <input className={inputCls} placeholder="Search learners by name or email" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
      {!data ? (
        <Spinner />
      ) : data.learners.length === 0 ? (
        <p className="text-center text-slate-500 py-12">No learners found.</p>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500">
              <tr><th className="p-3">Learner</th><th className="p-3">Country</th><th className="p-3">Courses</th><th className="p-3">Joined</th><th className="p-3">Status</th><th className="p-3" /></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.learners.map((l) => (
                <tr key={l._id}>
                  <td className="p-3"><p className="font-semibold">{l.firstName} {l.lastName}</p><p className="text-xs text-slate-500">{l.email}{l.phone ? ` · ${l.phone}` : ''}</p></td>
                  <td className="p-3">{l.country || '—'}</td>
                  <td className="p-3">{l.courseCount}</td>
                  <td className="p-3 whitespace-nowrap">{formatDate(l.createdAt)}</td>
                  <td className="p-3"><Pill value={l.status} /></td>
                  <td className="p-3 text-right">
                    <button onClick={() => toggle(l)} className={`text-xs font-bold hover:underline ${l.status === 'active' ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {l.status === 'active' ? 'Suspend' : 'Reactivate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {data && <Pager page={data.page} pages={data.pages} onPage={setPage} />}
    </div>
  );
}
