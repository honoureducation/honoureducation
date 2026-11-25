import React from 'react';
import { Link, NavLink, Navigate, useLocation } from 'react-router-dom';
import { useLearner } from './LearnerContext';
import { formatPrice, formatDuration } from './api';

export function LearnSubnav() {
  const { learner, logout } = useLearner();
  const linkCls = ({ isActive }) =>
    `px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
      isActive ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
    }`;
  return (
    <div className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
        <nav className="flex flex-wrap items-center gap-1">
          <NavLink to="/learn" end className={linkCls}>All courses</NavLink>
          {learner && <NavLink to="/learn/my-courses" className={linkCls}>My courses</NavLink>}
          {learner && <NavLink to="/learn/orders" className={linkCls}>Purchases</NavLink>}
        </nav>
        <div className="flex items-center gap-2 text-sm">
          {learner ? (
            <>
              <NavLink to="/learn/account" className={linkCls}>
                {learner.firstName} {learner.lastName}
              </NavLink>
              <button onClick={logout} className="px-3 py-1.5 rounded-lg font-semibold text-slate-500 hover:text-rose-600">
                Sign out
              </button>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function RequireLearner({ children }) {
  const { learner } = useLearner();
  const location = useLocation();
  if (!learner) return <Navigate to={`/learn/login?next=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  return children;
}

export function Spinner({ label = 'Loading…' }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-slate-500 gap-3">
      <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      <span className="text-sm">{label}</span>
    </div>
  );
}

export function EmptyState({ title, children, action }) {
  return (
    <div className="text-center py-20 px-6 bg-white rounded-2xl border border-dashed border-slate-300">
      <h3 className="text-lg font-bold text-slate-800">{title}</h3>
      {children && <p className="text-slate-500 mt-2 max-w-md mx-auto">{children}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function Thumb({ url, title, className = '' }) {
  if (url) return <img src={url} alt="" className={`w-full h-full object-cover ${className}`} />;
  return (
    <div className={`w-full h-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center p-4 ${className}`}>
      <span className="text-white/90 font-black text-lg text-center leading-tight line-clamp-3">{title}</span>
    </div>
  );
}

const LEVEL_LABEL = { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced' };

export function CourseCard({ course, to, footer }) {
  const free = course.isFree || !course.price;
  return (
    <Link
      to={to || `/learn/courses/${course.slug}`}
      className="group relative bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-card hover:shadow-2xl hover:shadow-blue-900/10 hover:-translate-y-1 hover:border-blue-200 transition-all duration-300 flex flex-col"
    >
      <div className="relative aspect-video overflow-hidden">
        <Thumb url={course.thumbnailUrl} title={course.title} className="group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 via-transparent to-transparent opacity-80" />
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {LEVEL_LABEL[course.level] && (
            <span className="rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold text-slate-800 shadow-sm">{LEVEL_LABEL[course.level]}</span>
          )}
          {course.previewCount > 0 && (
            <span className="rounded-full bg-amber-400 px-2.5 py-1 text-[11px] font-bold text-amber-950 shadow-sm">Free preview</span>
          )}
        </div>
        {!footer && (
          <span className={`absolute bottom-3 right-3 rounded-xl px-3 py-1.5 text-sm font-black shadow-lg ${free ? 'bg-emerald-500 text-white' : 'bg-white text-slate-900'}`}>
            {formatPrice(course)}
          </span>
        )}
      </div>
      <div className="p-5 flex flex-col flex-1">
        {course.category && <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-blue-600">{course.category}</span>}
        <h3 className="mt-1.5 font-extrabold text-slate-900 text-lg leading-snug group-hover:text-blue-700 transition-colors">{course.title}</h3>
        {course.shortDescription && <p className="mt-2 text-sm text-slate-500 leading-relaxed line-clamp-2">{course.shortDescription}</p>}
        <div className="mt-auto pt-5">
          {footer || (
            <div className="flex items-center justify-between border-t border-slate-100 pt-4">
              <span className="flex items-center gap-3 text-xs font-medium text-slate-500">
                <span className="flex items-center gap-1">
                  <TypeIcon type="text" className="w-3.5 h-3.5" />
                  {course.materialCount} lesson{course.materialCount === 1 ? '' : 's'}
                </span>
                {course.totalDurationSec > 0 && (
                  <span className="flex items-center gap-1">
                    <TypeIcon type="video" className="w-3.5 h-3.5" />
                    {formatDuration(course.totalDurationSec)}
                  </span>
                )}
              </span>
              <span className="text-sm font-bold text-blue-600 flex items-center gap-1 group-hover:gap-2 transition-all">
                View <span aria-hidden="true">→</span>
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

export function ProgressBar({ value }) {
  return (
    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
      <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${Math.max(0, Math.min(100, value || 0))}%` }} />
    </div>
  );
}

export const TYPE_LABEL = {
  video: 'Video',
  pdf: 'PDF',
  document: 'Document',
  audio: 'Audio',
  image: 'Image',
  link: 'Link',
  text: 'Reading',
};

export function TypeIcon({ type, className = 'w-4 h-4' }) {
  const paths = {
    video: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z',
    pdf: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    document: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    audio: 'M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z',
    image: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
    link: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1',
    text: 'M4 6h16M4 12h16M4 18h7',
  };
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d={paths[type] || paths.text} />
    </svg>
  );
}

const STATUS_PILL = {
  draft: 'bg-slate-100 text-slate-600',
  published: 'bg-emerald-50 text-emerald-700',
  archived: 'bg-amber-50 text-amber-700',
  paid: 'bg-emerald-50 text-emerald-700',
  refunded: 'bg-slate-100 text-slate-600',
  partially_refunded: 'bg-amber-50 text-amber-700',
  failed: 'bg-rose-50 text-rose-700',
  cancelled: 'bg-slate-100 text-slate-500',
  pending: 'bg-blue-50 text-blue-700',
  active: 'bg-emerald-50 text-emerald-700',
  suspended: 'bg-rose-50 text-rose-700',
  revoked: 'bg-rose-50 text-rose-700',
};

export const Pill = ({ value }) => (
  <span className={`inline-block text-xs font-bold px-2.5 py-1 rounded-full capitalize whitespace-nowrap ${STATUS_PILL[value] || 'bg-slate-100 text-slate-600'}`}>
    {String(value).replace('_', ' ')}
  </span>
);

export const inputCls =
  'w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500';
export const btnPrimary =
  'inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 font-bold text-white hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors';
export const btnSecondary =
  'inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-60 transition-colors';
