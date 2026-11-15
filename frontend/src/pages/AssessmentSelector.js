import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

// ==========================================
// 🎓 SECONDARY ASSESSMENTS (Year 7–13 · Grade 6–12)
// ==========================================
const SECONDARY_ASSESSMENTS = [
  {
    id: "listening-p1",
    title: "Listening Assessment",
    subtitle: "Part 1",
    stage: "Secondary",
    tag: "Year 7–13 · Grade 6–12",
    desc: "13 personal questions with CEFR level scoring (A1–C2). Max score: 26.",
    icon: (
      <svg
        className="w-6 h-6"
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
    color: "bg-cyan-500",
    lightColor: "bg-cyan-50 text-cyan-500 border-cyan-200",
    textColor: "text-cyan-500",
    hoverText: "group-hover:text-cyan-500",
    hoverBg: "group-hover:bg-cyan-500",
    bgSoft: "bg-cyan-50",
    route: "/assessment/listening",
  },
  {
    id: "speaking",
    title: "Speaking Assessment",
    subtitle: "Junior & Senior",
    stage: "Secondary",
    tag: "Year 7–13 · Grade 6–12",
    desc: "6 comprehension questions with picture prompts. CEFR scoring (A1–C2). Max score: 12.",
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.8}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
        />
      </svg>
    ),
    color: "bg-violet-500",
    lightColor: "bg-violet-50 text-violet-500 border-violet-200",
    textColor: "text-violet-500",
    hoverText: "group-hover:text-violet-500",
    hoverBg: "group-hover:bg-violet-500",
    bgSoft: "bg-violet-50",
    route: "/assessment/speaking",
  },
  {
    id: "reading",
    title: "Reading Assessment",
    subtitle: "Junior & Senior",
    stage: "Secondary",
    tag: "Year 7–13 · Grade 6–12",
    desc: "Reading accuracy with story passages. CEFR scoring based on decoding, blending, and fluency.",
    icon: (
      <svg
        className="w-6 h-6"
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
    color: "bg-emerald-500",
    lightColor: "bg-emerald-50 text-emerald-500 border-emerald-200",
    textColor: "text-emerald-500",
    hoverText: "group-hover:text-emerald-500",
    hoverBg: "group-hover:bg-emerald-500",
    bgSoft: "bg-emerald-50",
    route: "/assessment/reading",
  },
  {
    id: "writing",
    title: "Writing Assessment",
    subtitle: "Junior & Senior",
    stage: "Secondary",
    tag: "Year 7–13 · Grade 6–12",
    desc: "Writing quality with picture prompts. CEFR scoring for narrative and sentence structure.",
    icon: (
      <svg
        className="w-6 h-6"
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
    color: "bg-pink-500",
    lightColor: "bg-pink-50 text-pink-500 border-pink-200",
    textColor: "text-pink-500",
    hoverText: "group-hover:text-pink-500",
    hoverBg: "group-hover:bg-pink-500",
    bgSoft: "bg-pink-50",
    route: "/assessment/writing",
  },
];

// ==========================================
// 🎒 PRIMARY ASSESSMENTS (Matching exact UI & color combo)
// ==========================================
const PRIMARY_ASSESSMENTS = [
  {
    id: "primary-listening",
    title: "Listening Assessment",
    subtitle: "FS1, FS2 & KG2 / Year 1",
    stage: "Primary",
    tag: "FS1 · FS2 · KG2 · Year 1",
    desc: "10 personal questions with oral evaluation and CEFR scoring across FS1, FS2 - KG1, and KG2 / Year 1.",
    icon: (
      <svg
        className="w-6 h-6"
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
    color: "bg-cyan-500",
    lightColor: "bg-cyan-50 text-cyan-500 border-cyan-200",
    textColor: "text-cyan-500",
    hoverText: "group-hover:text-cyan-500",
    hoverBg: "group-hover:bg-cyan-500",
    bgSoft: "bg-cyan-50",
    route: "/assessment/primary-listening",
  },
  {
    id: "primary-speaking",
    title: "Speaking Assessment",
    subtitle: "FS1 · FS2 · KG2 / Year 1",
    stage: "Primary",
    tag: "FS1 · FS2 · KG2 · Y1",
    desc: "Comprehension questions with family meal picture prompt and CEFR level evaluation (Pre-A1 to B2-C1).",
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.8}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
        />
      </svg>
    ),
    color: "bg-violet-500",
    lightColor: "bg-violet-50 text-violet-500 border-violet-200",
    textColor: "text-violet-500",
    hoverText: "group-hover:text-violet-500",
    hoverBg: "group-hover:bg-violet-500",
    bgSoft: "bg-violet-50",
    route: "/assessment/primary-speaking",
  },
  {
    id: "primary-reading",
    title: "Reading Assessment",
    subtitle: "FS1 · FS2 · KG2 / Year 1",
    stage: "Primary",
    tag: "FS1 · FS2 · KG2 · Y1",
    desc: "6 CVC picture cards with sound blending, phonics decoding, and CEFR level scoring (Pre-A1 to B2-C1).",
    icon: (
      <svg
        className="w-6 h-6"
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
    color: "bg-emerald-500",
    lightColor: "bg-emerald-50 text-emerald-500 border-emerald-200",
    textColor: "text-emerald-500",
    hoverText: "group-hover:text-emerald-500",
    hoverBg: "group-hover:bg-emerald-500",
    bgSoft: "bg-emerald-50",
    route: "/assessment/primary-reading",
  },
  {
    id: "primary-writing",
    title: "Writing Assessment",
    subtitle: "FS1 · FS2 · KG2 / Year 1 · AI",
    stage: "Primary",
    tag: "FS1 · FS2 · KG2 · Y1",
    desc: "FS1 CVC prompts, FS2 & KG2 / Year 1 picture story with real-time AI keyword detection and rubric.",
    icon: (
      <svg
        className="w-6 h-6"
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
    color: "bg-pink-500",
    lightColor: "bg-pink-50 text-pink-500 border-pink-200",
    textColor: "text-pink-500",
    hoverText: "group-hover:text-pink-500",
    hoverBg: "group-hover:bg-pink-500",
    bgSoft: "bg-pink-50",
    route: "/assessment/primary-writing",
  },
  {
    id: "primary-phonic",
    title: "Phonic Assessment",
    subtitle: "FS1 · Phase 2 & 3",
    stage: "Primary",
    tag: "FS1 Phonics",
    desc: "Teacher-led phonics grapheme evaluation across Set 1-7 sounds, digraphs, and CVC blending.",
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.8}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
        />
      </svg>
    ),
    color: "bg-amber-500",
    lightColor: "bg-amber-50 text-amber-500 border-amber-200",
    textColor: "text-amber-500",
    hoverText: "group-hover:text-amber-500",
    hoverBg: "group-hover:bg-amber-500",
    bgSoft: "bg-amber-50",
    route: "/assessment/primary-phonic",
  },
];

export default function AssessmentSelector() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Read initial stage from: 1. URL search param (?tier=primary), 2. localStorage, 3. fallback 'secondary'
  const getInitialStage = () => {
    const fromUrl = searchParams.get("tier") || searchParams.get("stage") || searchParams.get("school");
    if (fromUrl && (fromUrl.toLowerCase() === "primary" || fromUrl.toLowerCase() === "secondary")) {
      return fromUrl.toLowerCase();
    }
    const saved = localStorage.getItem("assessmentSchoolTier");
    if (saved && (saved === "primary" || saved === "secondary")) {
      return saved;
    }
    return "secondary";
  };

  const [selectedStage, setSelectedStage] = useState(getInitialStage);
  const [selectedTerm, setSelectedTerm] = useState("T1");

  useEffect(() => {
    const fromUrl = searchParams.get("tier") || searchParams.get("stage") || searchParams.get("school");
    if (fromUrl && (fromUrl.toLowerCase() === "primary" || fromUrl.toLowerCase() === "secondary")) {
      const normalized = fromUrl.toLowerCase();
      setSelectedStage(normalized);
      localStorage.setItem("assessmentSchoolTier", normalized);
    } else {
      const saved = localStorage.getItem("assessmentSchoolTier");
      if (saved && (saved === "primary" || saved === "secondary")) {
        setSelectedStage(saved);
      }
    }
  }, [searchParams]);

  const handleStageChange = (newStage) => {
    setSelectedStage(newStage);
    localStorage.setItem("assessmentSchoolTier", newStage);
    const updated = new URLSearchParams(searchParams);
    updated.set("tier", newStage);
    setSearchParams(updated, { replace: true });
  };

  const activeAssessments =
    selectedStage === "secondary" ? SECONDARY_ASSESSMENTS : PRIMARY_ASSESSMENTS;

  const handleStartAssessment = (item) => {
    navigate(`${item.route}?term=${selectedTerm}&tier=${selectedStage}`);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Page Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-blue-100 text-blue-800">
                  Assessment Portal
                </span>
                <span className="text-slate-400 font-bold text-xs">•</span>
                <span className="text-xs font-bold text-slate-500">
                  {selectedStage === "secondary"
                    ? "Secondary School (Year 7–13)"
                    : "Primary School (Year 1–6)"}
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
                Assessments
              </h1>
              <p className="text-slate-500 text-sm mt-1.5 font-medium">
                Select an assessment type to begin evaluating a student.
              </p>
            </div>

            {/* Academic Term Selection in Header */}
            <div className="flex flex-col self-start md:self-auto">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                Academic Term
              </label>
              <div className="bg-slate-100 p-1.5 rounded-2xl flex items-center gap-1 shadow-inner">
                {["T1", "T2", "T3"].map((term) => (
                  <button
                    key={term}
                    onClick={() => setSelectedTerm(term)}
                    className={`px-4 sm:px-5 py-2 rounded-xl text-xs font-black transition-all duration-300 ${
                      selectedTerm === term
                        ? "bg-white text-blue-600 shadow-md scale-105"
                        : "text-slate-400 hover:text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {term === "T1"
                      ? "Term 1"
                      : term === "T2"
                        ? "Term 2"
                        : "Term 3"}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Stage Toggle Bar (Kept below, exactly as requested) */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="inline-flex bg-slate-200/80 p-1.5 rounded-2xl shadow-inner gap-1">
            <button
              onClick={() => handleStageChange("secondary")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 ${
                selectedStage === "secondary"
                  ? "bg-white text-blue-700 shadow-sm scale-[1.02]"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/50"
              }`}
            >
              <span>🎓 Secondary School</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  selectedStage === "secondary"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-slate-300/80 text-slate-700"
                }`}
              >
                {SECONDARY_ASSESSMENTS.length}
              </span>
            </button>

            <button
              onClick={() => handleStageChange("primary")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 ${
                selectedStage === "primary"
                  ? "bg-white text-blue-700 shadow-sm scale-[1.02]"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/50"
              }`}
            >
              <span>🎒 Primary School</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  selectedStage === "primary"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-slate-300/80 text-slate-700"
                }`}
              >
                {PRIMARY_ASSESSMENTS.length} New
              </span>
            </button>
          </div>

          {/* Quick Notice Badge */}
          <div className="text-xs font-semibold text-slate-500 bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-2xs flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>
              Showing{" "}
              <strong className="text-slate-800">
                {activeAssessments.length}
              </strong>{" "}
              {selectedStage} assessment types for{" "}
              <strong className="text-blue-600">{selectedTerm}</strong>
            </span>
          </div>
        </div>

        {/* Assessment Cards Grid - 3 cards per row for primary */}
        <div
          className={`grid gap-6 ${
            selectedStage === "primary"
              ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
              : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
          }`}
        >
          {activeAssessments.map((a) => (
            <button
              key={a.id}
              onClick={() => handleStartAssessment(a)}
              className="group text-left bg-white rounded-3xl border border-slate-200 shadow-xs hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 overflow-hidden focus:outline-none focus:ring-4 focus:ring-blue-100 flex flex-col justify-between"
            >
              <div>
                {/* Top accent line */}
                <div className={`h-2 ${a.color} opacity-85`} />

                <div className="p-5 xl:p-6">
                  {/* Icon + Tag row */}
                  <div className="flex items-start justify-between mb-5">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-xs ${a.lightColor}`}
                    >
                      {a.icon}
                    </div>
                    <span className="text-[10px] font-black text-slate-500 bg-slate-100 border border-slate-200/80 px-2.5 py-1 rounded-full uppercase tracking-wider">
                      {a.tag}
                    </span>
                  </div>

                  {/* Subtitle & Title */}
                  <div className="mb-2">
                    <span
                      className={`text-[10px] font-black ${a.textColor} uppercase tracking-[0.18em]`}
                    >
                      {a.subtitle}
                    </span>
                    <h3
                      className={`text-xl font-black text-slate-900 ${a.hoverText} transition-colors leading-tight mt-1`}
                    >
                      {a.title}
                    </h3>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-500 leading-relaxed mb-4">
                    {a.desc}
                  </p>
                </div>
              </div>

              {/* Bottom Action CTA */}
              <div className="px-5 xl:px-6 pb-5 xl:pb-6 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div
                  className={`flex items-center gap-2 text-xs font-black ${a.textColor} uppercase tracking-wider`}
                >
                  <span>Start {selectedTerm}</span>
                  <svg
                    className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-300"
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
                <div
                  className={`w-8 h-8 rounded-full ${a.bgSoft} flex items-center justify-center ${a.hoverBg} group-hover:text-white transition-all duration-300 font-bold text-xs`}
                >
                  {selectedTerm}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
