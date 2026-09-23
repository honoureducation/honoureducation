import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const OPTIONS = [
  {
    id: 'junior-student',
    title: 'Year 7–9 / Grade 6–8',
    subtitle: 'Student Writing Sheet',
    desc: 'Student writing sheet with sports picture prompts and lined writing space.',
    color: 'bg-pink-500',
    route: '/assessment/writing/junior-student',
  },
  {
    id: 'junior-assessor',
    title: 'Year 7–9 / Grade 6–8',
    subtitle: 'Assessor Form',
    desc: 'Writing assessment with sports picture prompts. A–E scoring rubric and teacher observations.',
    color: 'bg-pink-500',
    route: '/assessment/writing/junior',
  },
  {
    id: 'senior-student',
    title: 'Year 10–13 / Grade 9–12',
    subtitle: 'Student Writing Sheet',
    desc: 'Student writing sheet with landmark picture prompts and lined writing space.',
    color: 'bg-pink-500',
    route: '/assessment/writing/senior-student',
  },
  {
    id: 'senior-assessor',
    title: 'Year 10–13 / Grade 9–12',
    subtitle: 'Assessor Form',
    desc: 'Writing assessment with sports picture prompts. A–E scoring rubric and teacher observations.',
    color: 'bg-pink-500',
    route: '/assessment/writing/senior',
  },
  {
    id: 'senior-landmark-student',
    title: 'Year 10–13 / Grade 9-12',
    subtitle: 'Student Writing Sheet',
    desc: 'Student writing sheet with landmark picture prompts and lined writing space.',
    color: 'bg-pink-500',
    route: '/assessment/writing/senior-landmark-student',
  },
  {
    id: 'senior-landmark-assessor',
    title: 'Year 10–13 / Grade 9-12',
    subtitle: 'Assessor Form',
    desc: 'Writing assessment with landmark picture prompts. New CEFR scoring rubric.',
    color: 'bg-pink-500',
    route: '/assessment/writing/senior-landmark',
  },
];

export default function WritingAssessmentSelector() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedTerm = searchParams.get('term') || 'T1';

  const handleStartAssessment = (route) => {
    navigate(`${route}?term=${selectedTerm}`);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <nav className="breadcrumb mb-2">
            <button onClick={() => navigate('/assessments')} className="hover:text-slate-700 transition-colors">Assessments</button>
            <span className="breadcrumb-sep">/</span>
            <span className="text-slate-700 font-medium">Writing ({selectedTerm})</span>
          </nav>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Writing Assessment</h1>
          <p className="text-slate-500 text-sm mt-1">
            Select the year group for <span className="font-bold text-pink-500">{selectedTerm}</span> to begin.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5 max-w-5xl">
          {OPTIONS.map((o) => (
            <button
              key={o.id}
              onClick={() => handleStartAssessment(o.route)}
              className="group text-left bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
            >
              <div className={`h-1 ${o.color}`} />
              <div className="p-5 lg:p-6">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{o.subtitle}</span>
                <h3 className="text-base font-bold text-slate-900 mb-2">{o.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-4">{o.desc}</p>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-pink-500">
                  Start {selectedTerm} Assessment
                  <svg className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </div>
              </div>
            </button>
          ))}
        </div>
        <button onClick={() => navigate('/assessments')} className="mt-6 btn-secondary btn-sm">
          ← Back to Assessments
        </button>
      </div>
    </div>
  );
}
