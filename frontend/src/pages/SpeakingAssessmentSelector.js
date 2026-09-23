import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function SpeakingAssessmentSelector() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedTerm = searchParams.get('term') || 'T1';

  const options = [
    {
      id: 'junior',
      title: 'Year 7–9 / Grade 6–8',
      subtitle: 'Junior',
      desc: '6 speaking comprehension questions with CEFR level scoring (A1–C2). Max score: 12.',
      color: 'bg-violet-500',
      route: '/assessment/speaking/junior'
    },
    {
      id: 'senior',
      title: 'Year 10–13 / Grade 9–12',
      subtitle: 'Senior',
      desc: '6 advanced speaking comprehension questions with CEFR level scoring (A1–C2). Max score: 12.',
      color: 'bg-violet-500',
      route: '/assessment/speaking/senior'
    }
  ];

  const handleStartAssessment = (route) => {
    navigate(`${route}?term=${selectedTerm}`);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <nav className="breadcrumb mb-2">
            <button
              onClick={() => navigate('/assessments')}
              className="hover:text-slate-700 transition-colors"
            >
              Assessments
            </button>
            <span className="breadcrumb-sep">/</span>
            <span className="text-slate-700 font-medium">Speaking ({selectedTerm})</span>
          </nav>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
            Speaking Assessment
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Select the year group for <span className="font-bold text-violet-500">{selectedTerm}</span> to begin.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-5 max-w-3xl">
          {options.map((o) => (
            <button
              key={o.id}
              onClick={() => handleStartAssessment(o.route)}
              className="group text-left bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2"
            >
              <div className={`h-1 ${o.color}`} />
              <div className="p-5 lg:p-6">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  {o.subtitle}
                </span>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-violet-500 transition-colors mb-2">
                  {o.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-4">{o.desc}</p>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-violet-500">
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