import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const OPTIONS = [
  {
    id: "fs1",
    subtitle: "Stage 1 · Nursery",
    title: "FS1 Writing Assessment",
    tag: "FS1 · Age 3–4",
    desc: "6 CVC missing grapheme prompts (h _ _, d _ _, etc.), pencil grip, formation, and CEFR scoring.",
    color: "bg-pink-500",
    lightColor: "bg-pink-50 text-pink-500 border-pink-200",
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
          d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
        />
      </svg>
    ),
    route: "/assessment/fs1-writing",
  },
  {
    id: "fs2",
    subtitle: "Stage 2 · Reception",
    title: "FS2 - KG1 Writing Assessment",
    tag: "FS2 · KG1 · Age 4–5",
    desc: "Children playing football in park picture story with real-time AI keyword detection and CEFR scoring.",
    color: "bg-pink-500",
    lightColor: "bg-pink-50 text-pink-500 border-pink-200",
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
          d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
        />
      </svg>
    ),
    route: "/assessment/fs2-writing",
  },
  {
    id: "kg2-year1",
    subtitle: "Stage 3 · Year 1",
    title: "KG2 / Year 1 Writing Assessment",
    tag: "KG2 · Year 1 · Age 5–6",
    desc: "Children playing football in park picture story with real-time AI keyword detection and CEFR Pre-A1 to B2–C1 writing rubric.",
    color: "bg-pink-500",
    lightColor: "bg-pink-50 text-pink-500 border-pink-200",
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
          d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
        />
      </svg>
    ),
    route: "/assessment/kg2-writing",
  },
  {
    id: "grade1-year2",
    subtitle: "Stage 4 · Year 2",
    title: "Grade 1 / Year 2 Writing Assessment",
    tag: "Grade 1 · Year 2 · Age 6–7",
    desc: "6 word-writing prompts (s _ _, c _ _, b _ _ _, sh _ _, ca _ _), independent word formation, and CEFR writing rubric.",
    color: "bg-pink-500",
    lightColor: "bg-pink-50 text-pink-500 border-pink-200",
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
          d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
        />
      </svg>
    ),
    route: "/assessment/grade1-writing",
  },
  {
    id: "grade2-year3",
    subtitle: "Stage 5 · Year 3",
    title: "Grade 2 / Year 3 Writing Assessment",
    tag: "Grade 2 · Year 3 · Age 7–8",
    desc: "3 fantasy story pictures (Rocky mountain, Nature valley, Campfire dragons) with 4 prompts, real-time AI keyword detection, and CEFR writing rubric.",
    color: "bg-pink-500",
    lightColor: "bg-pink-50 text-pink-500 border-pink-200",
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
          d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
        />
      </svg>
    ),
    route: "/assessment/grade2-writing",
  },
  {
    id: "grade3-year4",
    subtitle: "Stage 6 · Year 4",
    title: "Grade 3 / Year 4 Writing Assessment",
    tag: "Grade 3 · Year 4 · Age 8–9",
    desc: "Dual-mode: 3 sci-fi/fantasy adventure pictures (Spaceship, Canyon Ruins, Knight & Dragon) or 4 word-writing prompts (Moon, Star, Girl, Cube) with AI Conductor & CEFR rubric.",
    color: "bg-pink-500",
    lightColor: "bg-pink-50 text-pink-500 border-pink-200",
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
          d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
        />
      </svg>
    ),
    route: "/assessment/grade3-writing",
  },
  {
    id: "grade4-year5",
    subtitle: "Stage 7 · Year 5",
    title: "Grade 4 / Year 5 Writing Assessment",
    tag: "Grade 4 · Year 5 · Age 9–10",
    desc: "Sci-Fi Space & Alien Planet story prompts (Neon Corridor, Futuristic Alien City, Astronauts Exploring) with AI Conductor & CEFR rubric.",
    color: "bg-pink-500",
    lightColor: "bg-pink-50 text-pink-500 border-pink-200",
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
          d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
        />
      </svg>
    ),
    route: "/assessment/grade4-writing",
  },
];

export default function PrimaryWritingSelector() {
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
              Primary Writing ({selectedTerm})
            </span>
          </nav>
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-pink-500"></span>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
              Primary Writing Assessment
            </h1>
          </div>
          <p className="text-slate-500 text-sm mt-1">
            Select the primary school stage for{" "}
            <span className="font-bold text-pink-600">{selectedTerm}</span> to
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
              className="group text-left bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
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
                  <span className="text-[10px] font-bold text-pink-600 uppercase tracking-widest">
                    {o.subtitle}
                  </span>
                  <h3 className="text-lg font-black text-slate-900 group-hover:text-pink-600 transition-colors leading-snug">
                    {o.title}
                  </h3>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-500 leading-relaxed mb-4 h-10 overflow-hidden">
                  {o.desc}
                </p>

                {/* CTA */}
                <div className="flex items-center gap-1.5 text-xs font-bold text-pink-600 uppercase tracking-wide">
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
