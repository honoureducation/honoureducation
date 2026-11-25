import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const OPTIONS = [
  {
    id: 'fs1',
    subtitle: 'Stage 1 · Nursery',
    title: 'FS1 Speaking Assessment',
    tag: 'FS1 · Age 3–4',
    desc: '6 comprehension questions with family meal picture prompt and CEFR scoring (Pre-A1 to B2–C1).',
    color: 'bg-violet-500',
    lightColor: 'bg-violet-50 text-violet-500 border-violet-200',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
      </svg>
    ),
    route: '/assessment/fs1-speaking',
  },
  {
    id: 'fs2',
    subtitle: 'Stage 2 · Reception',
    title: 'FS2 - KG1 Speaking Assessment',
    tag: 'FS2 · KG1 · Age 4–5',
    desc: '6 comprehension questions with family meal stimulus and extended CEFR verbal assessment.',
    color: 'bg-violet-500',
    lightColor: 'bg-violet-50 text-violet-500 border-violet-200',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
      </svg>
    ),
    route: '/assessment/fs2-speaking',
  },
  {
    id: 'kg2-year1',
    subtitle: 'Stage 3 · Year 1',
    title: 'KG2 / Year 1 Speaking Assessment',
    tag: 'KG2 · Year 1 · Age 5–6',
    desc: '6 comprehension questions with family meal picture prompt, conjunctions, and CEFR scoring (A1.0–A1.2 to B2–C1).',
    color: 'bg-violet-500',
    lightColor: 'bg-violet-50 text-violet-500 border-violet-200',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 01-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342" />
      </svg>
    ),
    route: '/assessment/kg2-speaking',
  },
  {
    id: 'grade1-year2',
    subtitle: 'Stage 4 · Year 2',
    title: 'Grade 1 / Year 2 Speaking Assessment',
    tag: 'Grade 1 · Year 2 · Age 6–7',
    desc: '4 story prompts with Paul & Grandma picture strip, storytelling evaluation, and CEFR scoring (A1.0–A1.2 to B2–C1).',
    color: 'bg-violet-500',
    lightColor: 'bg-violet-50 text-violet-500 border-violet-200',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
      </svg>
    ),
    route: '/assessment/grade1-speaking',
  },
  {
    id: 'grade2-year3',
    subtitle: 'Stage 5 · Year 3',
    title: 'Grade 2 / Year 3 Speaking Assessment',
    tag: 'Grade 2 · Year 3 · Age 7–8',
    desc: '4 story prompts with classroom 3-picture strip, sequential storytelling, CEFR scoring, and key vocabulary detection.',
    color: 'bg-violet-500',
    lightColor: 'bg-violet-50 text-violet-500 border-violet-200',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 01-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342" />
      </svg>
    ),
    route: '/assessment/grade2-speaking',
  },
  {
    id: 'grade3-year4',
    subtitle: 'Stage 6 · Year 4',
    title: 'Grade 3 / Year 4 Speaking Assessment',
    tag: 'Grade 3 · Year 4 · Age 8–9',
    desc: '4 story prompts with table discussion, digital learning & rocket launch strip, story sequencing, and CEFR scoring.',
    color: 'bg-violet-500',
    lightColor: 'bg-violet-50 text-violet-500 border-violet-200',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.458m8.28-8.28a15.09 15.09 0 01-2.448 2.458m-2.448-2.458a15.09 15.09 0 012.448-2.458" />
      </svg>
    ),
    route: '/assessment/grade3-speaking',
  },
  {
    id: 'grade4-year5',
    subtitle: 'Stage 7 · Year 5',
    title: 'Grade 4 / Year 5 Speaking Assessment',
    tag: 'Grade 4 · Year 5 · Age 9–10',
    desc: '4 story prompts with coral reef & shark ocean images, story sequencing, and CEFR scoring.',
    color: 'bg-violet-500',
    lightColor: 'bg-violet-50 text-violet-500 border-violet-200',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
      </svg>
    ),
    route: '/assessment/grade4-speaking',
  },
  {
    id: 'grade5-year6',
    subtitle: 'Stage 8 · Year 6',
    title: 'Grade 5 / Year 6 Speaking Assessment',
    tag: 'Grade 5 · Year 6 · Age 10–11',
    desc: '4 story prompts with mountain walk, cliff & paragliding pictures, story sequencing, and CEFR scoring.',
    color: 'bg-violet-500',
    lightColor: 'bg-violet-50 text-violet-500 border-violet-200',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
      </svg>
    ),
    route: '/assessment/grade5-speaking',
  },
];

export default function PrimarySpeakingSelector() {
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
            <span className="text-slate-700 font-bold">Primary Speaking ({selectedTerm})</span>
          </nav>
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-violet-500"></span>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
              Primary Speaking Assessment
            </h1>
          </div>
          <p className="text-slate-500 text-sm mt-1">
            Select the primary school stage for <span className="font-bold text-violet-600">{selectedTerm}</span> to begin.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-7xl">
          {OPTIONS.map((o) => (
            <button
              key={o.id}
              onClick={() => handleStartAssessment(o.route)}
              className="group text-left bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2"
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
                  <span className="text-[10px] font-bold text-violet-500 uppercase tracking-widest">
                    {o.subtitle}
                  </span>
                  <h3 className="text-lg font-black text-slate-900 group-hover:text-violet-500 transition-colors leading-snug">
                    {o.title}
                  </h3>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-500 leading-relaxed mb-4 h-10 overflow-hidden">{o.desc}</p>

                {/* CTA */}
                <div className="flex items-center gap-1.5 text-xs font-bold text-violet-500 uppercase tracking-wide">
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

