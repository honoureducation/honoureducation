import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const OPTIONS = [
  {
    id: "fs1",
    subtitle: "Stage 1 · Nursery",
    title: "FS1 Listening Assessment",
    tag: "FS1 · Age 3–4",
    desc: "10 personal questions with acceptable oral responses and CEFR level scoring for Nursery.",
    color: "bg-cyan-500",
    lightColor: "bg-cyan-50 text-cyan-500 border-cyan-200",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.8}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z"
        />
      </svg>
    ),
    route: "/assessment/fs1-listening",
  },
  {
    id: "fs2",
    subtitle: "Stage 2 · Reception",
    title: "FS2 - KG1 Listening Assessment",
    tag: "FS2 · KG1 · Age 4–5",
    desc: "10 personal questions with acceptable oral responses and CEFR level scoring for FS2 - KG1.",
    color: "bg-cyan-500",
    lightColor: "bg-cyan-50 text-cyan-500 border-cyan-200",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.8}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z"
        />
      </svg>
    ),
    route: "/assessment/fs2-listening",
  },
  {
    id: "kg2-year1",
    subtitle: "Stage 3 · Year 1",
    title: "KG2 / Year 1 Listening Assessment",
    tag: "KG2 · Year 1 · Age 5–6",
    desc: "10 personal questions with oral evaluation and CEFR scoring for KG2 / Year 1 pupils.",
    color: "bg-cyan-500",
    lightColor: "bg-cyan-50 text-cyan-500 border-cyan-200",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.8}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.26 10.147a60.438 60.438 0 01-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342"
        />
      </svg>
    ),
    route: "/assessment/kg2-listening",
  },
  {
    id: "grade1-year2",
    subtitle: "Stage 4 · Year 2",
    title: "Grade 1 / Year 2 Listening Assessment",
    tag: "Grade 1 · Year 2 · Age 6–7",
    desc: "10 personal questions with competent response evaluation, rubric scoring (Pre-A1 to B2–C1), and key words.",
    color: "bg-cyan-500",
    lightColor: "bg-cyan-50 text-cyan-500 border-cyan-200",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.8}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
        />
      </svg>
    ),
    route: "/assessment/grade1-listening",
  },
  {
    id: "grade2-year3",
    subtitle: "Stage 5 · Year 3",
    title: "Grade 2 / Year 3 Listening Assessment",
    tag: "Grade 2 · Year 3 · Age 7–8",
    desc: "10 personal questions with competent response evaluation and CEFR scoring (Pre-A1 to B2–C1).",
    color: "bg-cyan-500",
    lightColor: "bg-cyan-50 text-cyan-500 border-cyan-200",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.8}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.26 10.147a60.438 60.438 0 01-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342"
        />
      </svg>
    ),
    route: "/assessment/grade2-listening",
  },
  {
    id: "grade3-year4",
    subtitle: "Stage 6 · Year 4",
    title: "Grade 3 / Year 4 Listening Assessment",
    tag: "Grade 3 · Year 4 · Age 8–9",
    desc: "10 personal questions with competent response evaluation and CEFR scoring (A1.0–A1.2 to B2–C1).",
    color: "bg-cyan-500",
    lightColor: "bg-cyan-50 text-cyan-500 border-cyan-200",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.8}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
        />
      </svg>
    ),
    route: "/assessment/grade3-listening",
  },
  {
    id: "grade4-year5",
    subtitle: "Stage 7 · Year 5",
    title: "Grade 4 / Year 5 Listening Assessment",
    tag: "Grade 4 · Year 5 · Age 9–10",
    desc: "10 personal questions with competent response evaluation and CEFR scoring (A1.0–A1.2 to B2–C1).",
    color: "bg-cyan-500",
    lightColor: "bg-cyan-50 text-cyan-500 border-cyan-200",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.8}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z"
        />
      </svg>
    ),
    route: "/assessment/grade4-listening",
  },
];

export default function PrimaryListeningSelector() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedTerm = searchParams.get("term") || "T1";

  useEffect(() => {
    localStorage.setItem("assessmentSchoolTier", "primary");
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
              onClick={() => navigate("/assessments?tier=primary")}
              className="hover:text-slate-700 transition-colors"
            >
              Assessments
            </button>
            <span className="text-slate-300">/</span>
            <span className="text-slate-700 font-bold">
              Primary Listening ({selectedTerm})
            </span>
          </nav>
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-500"></span>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
              Primary Listening Assessment
            </h1>
          </div>
          <p className="text-slate-500 text-sm mt-1">
            Select the primary school stage for{" "}
            <span className="font-bold text-cyan-600">{selectedTerm}</span> to
            begin.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-7xl">
          {OPTIONS.map((o) => (
            <button
              key={o.id}
              onClick={() => handleStartAssessment(o.route)}
              className="group text-left bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
            >
              {/* Top accent bar */}
              <div className={`h-1.5 ${o.color}`} />

              <div className="p-5 lg:p-6">
                {/* Icon + tag */}
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center border ${o.lightColor}`}
                  >
                    {o.icon}
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-md whitespace-nowrap uppercase tracking-wider">
                    {o.tag}
                  </span>
                </div>

                {/* Title */}
                <div className="mb-1">
                  <span className="text-[10px] font-bold text-cyan-500 uppercase tracking-widest">
                    {o.subtitle}
                  </span>
                  <h3 className="text-lg font-black text-slate-900 group-hover:text-cyan-500 transition-colors leading-snug">
                    {o.title}
                  </h3>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-500 leading-relaxed mb-4 h-10 overflow-hidden">
                  {o.desc}
                </p>

                {/* CTA */}
                <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-500 uppercase tracking-wide">
                  Start {selectedTerm}
                  <svg
                    className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                    />
                  </svg>
                </div>
              </div>
            </button>
          ))}
        </div>

        <button
          onClick={() => navigate("/assessments?tier=primary")}
          className="mt-8 flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm hover:shadow-md"
        >
          ← Back to Assessments
        </button>
      </div>
    </div>
  );
}
