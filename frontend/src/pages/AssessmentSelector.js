import React from 'react';
import { useNavigate } from 'react-router-dom';

const ASSESSMENTS = [
  {
    id: 'listening-p1',
    title: 'Listening Assessment',
    subtitle: 'Part 1',
    tag: 'Year 7–13 · Grade 6–12',
    desc: '13 personal questions with CEFR level scoring (A1–C2). Max score: 26.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
      </svg>
    ),
    color: 'bg-blue-600',
    lightColor: 'bg-blue-50 text-blue-600 border-blue-200',
    route: '/assessment/listening',
  },
  {
    id: 'listening-p2',
    title: 'Listening Assessment',
    subtitle: 'Part 2',
    tag: 'Junior & Senior',
    desc: 'Paragraph comprehension — Junior (4 questions) and Senior (10 questions).',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
      </svg>
    ),
    color: 'bg-cyan-600',
    lightColor: 'bg-cyan-50 text-cyan-600 border-cyan-200',
    route: '/assessment/listening-part2',
  },
  {
    id: 'speaking',
    title: 'Speaking Assessment',
    subtitle: 'Junior & Senior',
    tag: 'Year 7–13 · Grade 6–12',
    desc: '6 comprehension questions with picture prompts. CEFR scoring (A1–C2). Max score: 12.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
      </svg>
    ),
    color: 'bg-violet-600',
    lightColor: 'bg-violet-50 text-violet-600 border-violet-200',
    route: '/assessment/speaking',
  },
  {
    id: 'reading',
    title: 'Reading Assessment',
    subtitle: 'Junior & Senior',
    tag: 'Year 7–13 · Grade 6–12',
    desc: 'Reading accuracy with story passages. A–E scoring based on decoding, blending, and fluency.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
      </svg>
    ),
    color: 'bg-emerald-600',
    lightColor: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    route: '/assessment/reading',
  },
  {
    id: 'writing',
    title: 'Writing Assessment',
    subtitle: 'Junior & Senior',
    tag: 'Year 7–13 · Grade 6–12',
    desc: 'Writing quality with picture prompts. A–E scoring for narrative and sentence structure.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
      </svg>
    ),
    color: 'bg-amber-600',
    lightColor: 'bg-amber-50 text-amber-600 border-amber-200',
    route: '/assessment/writing',
  },
];

export default function AssessmentSelector() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Page header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Assessments</h1>
          <p className="text-slate-500 text-sm mt-1">Select an assessment type to begin evaluating a student.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {ASSESSMENTS.map((a) => (
            <button
              key={a.id}
              onClick={() => navigate(a.route)}
              className="group text-left bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {/* Top accent */}
              <div className={`h-1 ${a.color}`} />

              <div className="p-6">
                {/* Icon + tag row */}
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center border ${a.lightColor}`}>
                    {a.icon}
                  </div>
                  <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
                    {a.tag}
                  </span>
                </div>

                {/* Title */}
                <div className="mb-1">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{a.subtitle}</span>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug">
                    {a.title}
                  </h3>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-500 leading-relaxed mb-5">{a.desc}</p>

                {/* CTA */}
                <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-600">
                  Start Assessment
                  <svg className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
