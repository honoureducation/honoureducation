import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const OPTIONS = [
  {
    id: 'part1',
    subtitle: 'Part 1',
    title: 'Listening Assessment',
    tag: 'Year 7–13 · Grade 6–12',
    desc: '13 personal questions with CEFR level scoring (A1–C2). Max score: 26.',
    color: 'bg-blue-600',
    lightColor: 'bg-blue-50 text-blue-600 border-blue-200',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
      </svg>
    ),
    route: '/assessment/listening/part1',
  },
  {
    id: 'part2-junior',
    subtitle: 'Part 2',
    title: 'Listening Assessment',
    tag: 'Year 7–9 · Grade 6–8',
    desc: 'Paragraph comprehension — 4 questions based on a short passage read aloud. Max score: 8.',
    color: 'bg-cyan-600',
    lightColor: 'bg-cyan-50 text-cyan-600 border-cyan-200',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
      </svg>
    ),
    route: '/assessment/listening-part2/junior',
  },
  {
    id: 'part2-senior',
    subtitle: 'Part 2',
    title: 'Listening Assessment',
    tag: 'Year 10–13 · Grade 9–12',
    desc: 'Paragraph comprehension — 10 questions based on an extended passage read aloud. Max score: 20.',
    color: 'bg-teal-600',
    lightColor: 'bg-teal-50 text-teal-600 border-teal-200',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
      </svg>
    ),
    route: '/assessment/listening-part2/senior',
  },
];

export default function ListeningAssessmentSelector() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedTerm = searchParams.get('term') || 'T1';

  const handleStartAssessment = (route) => {
    navigate(`${route}?term=${selectedTerm}`);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <nav className="breadcrumb mb-2">
            <button
              onClick={() => navigate('/assessments')}
              className="hover:text-slate-700 transition-colors"
            >
              Assessments
            </button>
            <span className="breadcrumb-sep">/</span>
            <span className="text-slate-700 font-medium">Listening ({selectedTerm})</span>
          </nav>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
            Listening Assessment
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Select the assessment type for <span className="font-bold text-blue-600">{selectedTerm}</span> to begin.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl">
          {OPTIONS.map((o) => (
            <button
              key={o.id}
              onClick={() => handleStartAssessment(o.route)}
              className="group text-left bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {/* Top accent bar */}
              <div className={`h-1 ${o.color}`} />

              <div className="p-6">
                {/* Icon + tag */}
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${o.lightColor}`}>
                    {o.icon}
                  </div>
                  <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full whitespace-nowrap">
                    {o.tag}
                  </span>
                </div>

                {/* Title */}
                <div className="mb-1">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    {o.subtitle}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug">
                    {o.title}
                  </h3>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-500 leading-relaxed mb-5">{o.desc}</p>

                {/* CTA */}
                <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-600">
                  Start {selectedTerm} Assessment
                  <svg
                    className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </div>
              </div>
            </button>
          ))}
        </div>

        <button
          onClick={() => navigate('/assessments')}
          className="mt-6 btn-secondary btn-sm"
        >
          ← Back to Assessments
        </button>
      </div>
    </div>
  );
}
