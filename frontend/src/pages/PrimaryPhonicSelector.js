import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const OPTIONS = [
  {
    id: 'fs1',
    subtitle: 'Stage 1 · Nursery',
    title: 'FS1 Phonic Assessment',
    tag: 'FS1 · Age 3–4',
    desc: 'Phase 2 & Phase 3 systematic synthetic phonics, grapheme highlighting, and CEFR decoding levels.',
    color: 'bg-amber-500',
    lightColor: 'bg-amber-50 text-amber-500 border-amber-200',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
      </svg>
    ),
    route: '/assessment/fs1-phonic',
  },
  {
    id: 'fs2',
    subtitle: 'Stage 2 · Reception',
    title: 'FS2 - KG1 Phonic Assessment',
    tag: 'FS2 · KG1 · Age 4–5',
    desc: 'Phase 2 & Phase 3 systematic synthetic phonics assessment for Reception / KG1 pupils.',
    color: 'bg-amber-500',
    lightColor: 'bg-amber-50 text-amber-500 border-amber-200',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
      </svg>
    ),
    route: '/assessment/fs2-phonic',
  },
  {
    id: 'kg2-phase23',
    subtitle: 'Stage 3 · Year 1',
    title: 'KG2 / Year 1 Phonics (Phase 2 & 3)',
    tag: 'KG2 · Year 1 · Age 5–6',
    desc: 'Sets 1–7 letter sounds, CVC words, consonant and vowel digraphs, with CEFR decoding levels.',
    color: 'bg-amber-500',
    lightColor: 'bg-amber-50 text-amber-500 border-amber-200',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 01-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342" />
      </svg>
    ),
    route: '/assessment/kg2-phonic',
  },
  {
    id: 'kg2-phase45',
    subtitle: 'Stage 3 · Year 1 Higher',
    title: 'KG2 / Year 1 Phonics (Phase 4 & 5)',
    tag: 'Phase 4 & 5 · Advanced',
    desc: 'Initial/final/complex consonant blends (CCVC/CVCC), alternative spellings, split digraphs & tricky words.',
    color: 'bg-amber-500',
    lightColor: 'bg-amber-50 text-amber-500 border-amber-200',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
    route: '/assessment/kg2-phonic-phase45',
  },
];

export default function PrimaryPhonicSelector() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedTerm = searchParams.get('term') || 'T1';

  useEffect(() => {
    localStorage.setItem('assessmentSchoolTier', 'primary');
  }, []);

  const handleStartAssessment = (route) => {
    navigate(`${route}?term=${selectedTerm}&tier=primary`);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <nav className="breadcrumb mb-2 flex items-center gap-2 text-xs font-semibold text-slate-400">
            <button
              onClick={() => navigate('/assessments?tier=primary')}
              className="hover:text-slate-700 transition-colors"
            >
              Assessments
            </button>
            <span className="text-slate-300">/</span>
            <span className="text-slate-700 font-bold">Primary Phonics ({selectedTerm})</span>
          </nav>
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
              Primary Phonic Assessment
            </h1>
          </div>
          <p className="text-slate-500 text-sm mt-1">
            Select the primary school stage for <span className="font-bold text-amber-600">{selectedTerm}</span> to begin.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5 max-w-6xl">
          {OPTIONS.map((o) => (
            <button
              key={o.id}
              onClick={() => handleStartAssessment(o.route)}
              className="group text-left bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
            >
              {/* Top accent bar */}
              <div className={`h-1.5 ${o.color}`} />

              <div className="p-5 lg:p-6">
                {/* Icon + tag */}
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${o.lightColor}`}>
                    {o.icon}
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-md whitespace-nowrap uppercase tracking-wider">
                    {o.tag}
                  </span>
                </div>

                {/* Title */}
                <div className="mb-1">
                  <h3 className="text-lg font-black text-slate-900 group-hover:text-amber-600 transition-colors leading-snug">
                    {o.title}
                  </h3>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-500 leading-relaxed mb-4 h-10 overflow-hidden">{o.desc}</p>

                {/* CTA */}
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 uppercase tracking-wide">
                  Start {selectedTerm}
                  <svg
                    className="w-4 h-4 group-hover:translate-x-1 transition-transform"
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
          onClick={() => navigate('/assessments?tier=primary')}
          className="mt-8 flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm hover:shadow-md"
        >
          ← Back to Assessments
        </button>
      </div>
    </div>
  );
}

