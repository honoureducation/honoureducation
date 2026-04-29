import React from 'react';
import { Link } from 'react-router-dom';

const FEATURES = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
    color: 'bg-blue-100 text-blue-600',
    title: 'Real-time Analytics',
    desc: 'Instant score calculation with CEFR and A–E level mapping across all assessment types.',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    color: 'bg-emerald-100 text-emerald-600',
    title: 'Structured Rubrics',
    desc: 'Standardised scoring rubrics for Listening, Speaking, Reading, and Writing skills.',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    ),
    color: 'bg-violet-100 text-violet-600',
    title: 'Student Records',
    desc: 'Centralised records with full assessment history, filterable by type, level, and date.',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 8.25h3m-3 3h3m-6 3h.008v.008H7.5v-.008zm0-3h.008v.008H7.5v-.008zm0-3h.008v.008H7.5v-.008z" />
      </svg>
    ),
    color: 'bg-amber-100 text-amber-600',
    title: 'Multi-skill Coverage',
    desc: 'Covers EAL/ELL, Listening (Parts 1 & 2), Speaking, Reading, and Writing assessments.',
  },
];

const STATS = [
  { value: '1,000+', label: 'Students Assessed' },
  { value: '500+',   label: 'Active Teachers' },
  { value: '50+',    label: 'Schools' },
  { value: '98%',    label: 'Satisfaction Rate' },
];

const ASSESSMENTS = [
  { icon: '🎧', label: 'Listening',  desc: 'Parts 1 & 2 · CEFR A1–C2',  to: '/assessment/listening',  color: 'bg-blue-50 text-blue-600 border-blue-200' },
  { icon: '🎙️', label: 'Speaking',   desc: 'Junior & Senior · CEFR A1–C2', to: '/assessment/speaking', color: 'bg-violet-50 text-violet-600 border-violet-200' },
  { icon: '📖', label: 'Reading',    desc: 'Junior & Senior · A–E',       to: '/assessment/reading',   color: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
  { icon: '✏️', label: 'Writing',    desc: 'Junior & Senior · A–E',       to: '/assessment/writing',   color: 'bg-amber-50 text-amber-600 border-amber-200' },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative bg-slate-900 overflow-hidden">
        {/* subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
        {/* glow blobs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600 rounded-full filter blur-3xl opacity-10 animate-blob" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-600 rounded-full filter blur-3xl opacity-10 animate-blob animation-delay-2000" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-600/20 border border-blue-500/30 text-blue-300 text-xs font-semibold mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              Student Assessment Platform
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight mb-6">
              Assess smarter,<br />
              <span className="text-blue-400">teach better.</span>
            </h1>
            <p className="text-lg text-slate-400 mb-10 max-w-xl leading-relaxed">
              A comprehensive platform for EAL/ELL educators to evaluate student language proficiency across all four skills — with instant CEFR scoring.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/assessments"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-blue-900/30"
              >
                Start an Assessment
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
              <Link
                to="/records"
                className="inline-flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl border border-slate-700 transition-colors"
              >
                View Records
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats bar ────────────────────────────────────── */}
      <section className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-slate-200">
            {STATS.map(({ value, label }) => (
              <div key={label} className="py-6 px-6 text-center">
                <div className="text-2xl font-bold text-slate-900">{value}</div>
                <div className="text-xs text-slate-500 mt-0.5 font-medium">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Assessment types ─────────────────────────────── */}
      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Assessment Types</h2>
            <p className="text-slate-500 text-sm">Select a skill area to begin evaluating your students.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {ASSESSMENTS.map(({ icon, label, desc, to, color }) => (
              <Link
                key={label}
                to={to}
                className={`group flex flex-col gap-3 p-5 rounded-2xl border bg-white hover:shadow-md transition-all duration-200 hover:-translate-y-0.5`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl border ${color}`}>
                  {icon}
                </div>
                <div>
                  <div className="font-semibold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">{label}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{desc}</div>
                </div>
                <div className="mt-auto flex items-center gap-1 text-xs font-medium text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  Open
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────── */}
      <section className="py-16 md:py-20 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Built for educators</h2>
            <p className="text-slate-500 text-sm">Everything you need to run effective language assessments.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map(({ icon, color, title, desc }) => (
              <div key={title} className="flex flex-col gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
                  {icon}
                </div>
                <div>
                  <div className="font-semibold text-slate-900 text-sm mb-1">{title}</div>
                  <div className="text-xs text-slate-500 leading-relaxed">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────── */}
      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-900 rounded-3xl px-8 py-12 md:px-12 md:py-16 flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Ready to get started?</h2>
              <p className="text-slate-400 text-sm max-w-md">
                Run your first assessment in minutes. No setup required — just select a skill area and begin.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 flex-shrink-0">
              <Link
                to="/assessments"
                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-blue-900/30 text-sm"
              >
                Start Assessment
              </Link>
              <Link
                to="/records"
                className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl border border-slate-700 transition-colors text-sm"
              >
                View Records
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
