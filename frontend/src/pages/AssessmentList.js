import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { assessmentAPI } from "../services/api";

const LISTENING_P1_QUESTIONS = [
  "What is your name?",
  "What is your age?",
  "What language do you speak at home?",
  "Where do you live?",
  "Have you got brothers and sisters?",
  "What hobbies or sports do you like?",
  "How did you come to school today?",
  "Did you go to school in another place? Where?",
  "Tell me about your last school.",
  "What was your best subject?",
  "What did you not like in school?",
  "What will you do after school today?",
  "What would you like to do when you finish school?",
];

const SPEAKING_QUESTIONS_JUNIOR = [
  "What do you see in picture 1?",
  "Can you tell me what happens next after picture 1?",
  "Can you tell the whole story from the first picture to the last one?",
  "Why do you think the team is celebrating at the end, and what helped them succeed?",
  "What does this story show about teamwork and solving problems under pressure?",
  "How could different audiences interpret this story differently, and why?",
];

const TYPE_META = {
  "EAL & ELL": { label: "EAL & ELL", color: "bg-purple-100 text-purple-700" },
  "Listening Part 1": {
    label: "Listening P1",
    color: "bg-blue-100 text-blue-700",
  },
  "Listening Part 2": {
    label: "Listening P2",
    color: "bg-cyan-100 text-cyan-700",
  },
  "Speaking Assessment": {
    label: "Speaking",
    color: "bg-violet-100 text-violet-700",
  },
  "Reading Assessment": {
    label: "Reading",
    color: "bg-emerald-100 text-emerald-700",
  },
  "Writing Assessment": {
    label: "Writing",
    color: "bg-amber-100 text-amber-700",
  },
  // Primary Phonics
  "FS1 Phonic Assessment": {
    label: "FS1 Phonics",
    color: "bg-amber-100 text-amber-800",
  },
  "FS2 - KG1 Phonic Assessment": {
    label: "FS2 Phonics",
    color: "bg-amber-100 text-amber-800",
  },
  "KG2 / Year 1 Phonic Assessment": {
    label: "KG2 Phonics",
    color: "bg-amber-100 text-amber-800",
  },
  "Grade 1 / Year 2 Phonic Assessment": {
    label: "Grade 1 Phonics",
    color: "bg-amber-100 text-amber-800",
  },
  "Grade 2 / Year 3 Phonic Assessment": {
    label: "Grade 2 Phonics",
    color: "bg-amber-100 text-amber-800",
  },
  // Primary Listening
  "FS1 Listening Assessment": {
    label: "FS1 Listening",
    color: "bg-cyan-100 text-cyan-800",
  },
  "FS2 - KG1 Listening Assessment": {
    label: "FS2 Listening",
    color: "bg-cyan-100 text-cyan-800",
  },
  "KG2 / Year 1 Listening Assessment": {
    label: "KG2 Listening",
    color: "bg-cyan-100 text-cyan-800",
  },
  "Grade 1 / Year 2 Listening Assessment": {
    label: "Grade 1 Listening",
    color: "bg-cyan-100 text-cyan-800",
  },
  "Grade 2 / Year 3 Listening Assessment": {
    label: "Grade 2 Listening",
    color: "bg-cyan-100 text-cyan-800",
  },
  "Grade 3 / Year 4 Listening Assessment": {
    label: "Grade 3 Listening",
    color: "bg-cyan-100 text-cyan-800",
  },
  "Grade 4 / Year 5 Listening Assessment": {
    label: "Grade 4 Listening",
    color: "bg-cyan-100 text-cyan-800",
  },
  "Grade 5 / Year 6 Listening Assessment": {
    label: "Grade 5 Listening",
    color: "bg-cyan-100 text-cyan-800",
  },
  // Primary Speaking
  "FS1 Speaking Assessment": {
    label: "FS1 Speaking",
    color: "bg-violet-100 text-violet-800",
  },
  "FS2 - KG1 Speaking Assessment": {
    label: "FS2 Speaking",
    color: "bg-violet-100 text-violet-800",
  },
  "KG2 / Year 1 Speaking Assessment": {
    label: "KG2 Speaking",
    color: "bg-violet-100 text-violet-800",
  },
  "Grade 1 / Year 2 Speaking Assessment": {
    label: "Grade 1 Speaking",
    color: "bg-violet-100 text-violet-800",
  },
  "Grade 2 / Year 3 Speaking Assessment": {
    label: "Grade 2 Speaking",
    color: "bg-violet-100 text-violet-800",
  },
  "Grade 3 / Year 4 Speaking Assessment": {
    label: "Grade 3 Speaking",
    color: "bg-violet-100 text-violet-800",
  },
  "Grade 4 / Year 5 Speaking Assessment": {
    label: "Grade 4 Speaking",
    color: "bg-violet-100 text-violet-800",
  },
  "Grade 5 / Year 6 Speaking Assessment": {
    label: "Grade 5 Speaking",
    color: "bg-violet-100 text-violet-800",
  },
  // Primary Reading
  "FS1 Reading Assessment": {
    label: "FS1 Reading",
    color: "bg-emerald-100 text-emerald-800",
  },
  "FS2 - KG1 Reading Assessment": {
    label: "FS2 Reading",
    color: "bg-emerald-100 text-emerald-800",
  },
  "KG2 / Year 1 Reading Assessment": {
    label: "KG2 Reading",
    color: "bg-emerald-100 text-emerald-800",
  },
  "Grade 1 / Year 2 Reading Assessment": {
    label: "Grade 1 Reading",
    color: "bg-emerald-100 text-emerald-800",
  },
  "Grade 2 / Year 3 Reading Assessment": {
    label: "Grade 2 Reading",
    color: "bg-emerald-100 text-emerald-800",
  },
  "Grade 3 / Year 4 Reading Assessment": {
    label: "Grade 3 Reading",
    color: "bg-emerald-100 text-emerald-800",
  },
  "Grade 4 / Year 5 Reading Assessment": {
    label: "Grade 4 Reading",
    color: "bg-emerald-100 text-emerald-800",
  },
  "Grade 5 / Year 6 Reading Assessment": {
    label: "Grade 5 Reading",
    color: "bg-emerald-100 text-emerald-800",
  },
  // Primary Writing
  "FS1 Writing Assessment": {
    label: "FS1 Writing",
    color: "bg-pink-100 text-pink-800",
  },
  "FS2 - KG1 Writing Assessment": {
    label: "FS2 Writing",
    color: "bg-pink-100 text-pink-800",
  },
  "KG2 / Year 1 Writing Assessment": {
    label: "KG2 Writing",
    color: "bg-pink-100 text-pink-800",
  },
  "Grade 1 / Year 2 Writing Assessment": {
    label: "Grade 1 Writing",
    color: "bg-pink-100 text-pink-800",
  },
  "Grade 2 / Year 3 Writing Assessment": {
    label: "Grade 2 Writing",
    color: "bg-pink-100 text-pink-800",
  },
  "Grade 2 / Year 3 Writing Assessment (Phonics)": {
    label: "Grade 2 Writing (Phonics)",
    color: "bg-pink-100 text-pink-800",
  },
  "Grade 3 / Year 4 Writing Assessment": {
    label: "Grade 3 Writing",
    color: "bg-pink-100 text-pink-800",
  },
  "Grade 3 / Year 4 Writing Assessment (Phonics)": {
    label: "Grade 3 Writing (Phonics)",
    color: "bg-pink-100 text-pink-800",
  },
  "Grade 4 / Year 5 Writing Assessment": {
    label: "Grade 4 Writing",
    color: "bg-pink-100 text-pink-800",
  },
  "Grade 5 / Year 6 Writing Assessment": {
    label: "Grade 5 Writing",
    color: "bg-pink-100 text-pink-800",
  },
};

function getTypeMeta(type) {
  if (TYPE_META[type]) return TYPE_META[type];
  const t = (type || "").toLowerCase();
  if (t.includes("phonic"))
    return { label: type, color: "bg-amber-100 text-amber-800" };
  if (t.includes("reading"))
    return { label: type, color: "bg-emerald-100 text-emerald-800" };
  if (t.includes("writing"))
    return { label: type, color: "bg-pink-100 text-pink-800" };
  if (t.includes("speaking"))
    return { label: type, color: "bg-violet-100 text-violet-800" };
  if (t.includes("listening"))
    return { label: type, color: "bg-cyan-100 text-cyan-800" };
  return { label: type || "Assessment", color: "bg-slate-100 text-slate-700" };
}

const CEFR_COLORS = {
  "Pre-A1": "bg-red-100 text-red-700",
  "A1.0–A1.2": "bg-orange-100 text-orange-700",
  "A1.0-A1.2": "bg-orange-100 text-orange-700",
  "A2.0–A2.2": "bg-amber-100 text-amber-700",
  "A2.0-A2.2": "bg-amber-100 text-amber-700",
  "A2.3–B1.1": "bg-blue-100 text-blue-700",
  "A2.3-B1.1": "bg-blue-100 text-blue-700",
  "B1.2–B1.3": "bg-indigo-100 text-indigo-700",
  "B1.2-B1.3": "bg-indigo-100 text-indigo-700",
  "B2–C1": "bg-emerald-100 text-emerald-700",
  "B2-C1": "bg-emerald-100 text-emerald-700",
  A1: "bg-red-100 text-red-700",
  A2: "bg-orange-100 text-orange-700",
  B1: "bg-amber-100 text-amber-700",
  B2: "bg-blue-100 text-blue-700",
  C1: "bg-emerald-100 text-emerald-700",
  "C1-C2": "bg-emerald-100 text-emerald-700",
  C2: "bg-violet-100 text-violet-700",
};

const AE_COLORS = {
  A: "bg-red-100 text-red-700",
  B: "bg-orange-100 text-orange-700",
  C: "bg-amber-100 text-amber-700",
  D: "bg-blue-100 text-blue-700",
  E: "bg-emerald-100 text-emerald-700",
};

function getLevelBadge(a) {
  const level = a.cefrLevel || a.level || "—";
  const colorClass =
    CEFR_COLORS[level] || AE_COLORS[level] || "bg-slate-100 text-slate-600";
  return <span className={`badge ${colorClass}`}>{level}</span>;
}

function isPrimaryAssessment(a) {
  if (!a) return false;
  if (a.schoolTier === "primary") return true;
  if (a.schoolTier === "secondary") return false;
  const type = (a.assessmentType || "").toLowerCase();
  const yg = (a.yearGroupAndClass || "").toLowerCase();
  return (
    type.includes("fs") ||
    type.includes("kg") ||
    type.includes("phonic") ||
    type.startsWith("primary") ||
    type.includes("grade 1") ||
    type.includes("grade 2") ||
    type.includes("grade 3") ||
    type.includes("grade 4") ||
    type.includes("grade 5") ||
    type.includes("grade 6") ||
    type.includes("year 1") ||
    type.includes("year 2") ||
    type.includes("year 3") ||
    type.includes("year 4") ||
    type.includes("year 5") ||
    type.includes("year 6") ||
    yg.includes("fs") ||
    yg.includes("kg") ||
    yg.startsWith("y1") ||
    yg.includes("year 1") ||
    yg.includes("year 2") ||
    yg.includes("year 3") ||
    yg.includes("year 4") ||
    yg.includes("year 5") ||
    yg.includes("year 6") ||
    yg.includes("grade 1") ||
    yg.includes("grade 2") ||
    yg.includes("grade 3") ||
    yg.includes("grade 4") ||
    yg.includes("grade 5") ||
    yg.includes("grade 6")
  );
}

function getScoreMax(a) {
  if (a.totalPossible) return `/${a.totalPossible}`;
  const type = (a.assessmentType || "").toLowerCase();
  if (isPrimaryAssessment(a)) {
    if (type.includes("listening")) return "/10";
    if (type.includes("reading")) return "/6";
    if (type.includes("writing")) {
      if (type.includes("grade 3") || type.includes("grade 2")) return "/4";
      if (type.includes("grade 1") || type.includes("grade 4")) return "";
      return "/6";
    }
    if (type.includes("phonic")) return "/10";
    return "";
  }
  if (type.includes("listening")) {
    if (a.assessmentType === "Listening Part 1") return "/26";
    return a.yearGroupType === "junior" ? "/8" : "/20";
  }
  if (a.assessmentType === "Speaking Assessment") return "/12";
  if (a.assessmentType === "Reading Assessment") return "/10";
  if (a.assessmentType === "Writing Assessment") return "/20";
  return "";
}

function getDisplayScore(a) {
  let score = a.totalScore !== undefined && a.totalScore !== null ? a.totalScore : a.score;
  const isPrimary = isPrimaryAssessment(a);
  const type = (a.assessmentType || "").toLowerCase();
  const WRITING_SCORES = [4, 8, 12, 15, 17, 20];

  if (score !== undefined && score !== null && score >= 0) {
    if (score <= 5 && type.includes("writing") && !isPrimary) {
      return WRITING_SCORES[score] || 0;
    }
    return score;
  }

  if (isPrimary) {
    return a.cefrLevel || a.level || "—";
  }

  const lvl = a.cefrLevel || a.level || "A1";
  const baseLvl = lvl.substring(0, 2);
  const idx = ["A1", "A2", "B1", "B2", "C1", "C2"].indexOf(baseLvl);
  return idx >= 0 ? WRITING_SCORES[idx] : 5;
}

function getInitials(name) {
  return name
    ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "?";
}

const AVATAR_COLORS = [
  "bg-blue-500",
  "bg-violet-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-cyan-500",
  "bg-indigo-500",
  "bg-teal-500",
];

function avatarColor(name) {
  let hash = 0;
  for (let i = 0; i < (name || "").length; i++)
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function formatDate(d) {
  const date = new Date(d);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/* ── Detail Modal ─────────────────────────────────────────── */
function DetailModal({ assessment: a, onClose }) {
  if (!a) return null;
  const isPrimary = isPrimaryAssessment(a);
  const scoreLabel = (s) =>
    s === 0
      ? "No response"
      : s === 1
        ? "Some comprehension"
        : "Full comprehension";

  const allKeywords = Array.from(
    new Set([
      ...(Array.isArray(a.keyWordsUsed) ? a.keyWordsUsed : []),
      ...(Array.isArray(a.keywordsUsed) ? a.keywordsUsed : []),
      ...(Array.isArray(a.detectedKeywords) ? a.detectedKeywords : []),
      ...(Array.isArray(a.aiKeywordsDetected) ? a.aiKeywordsDetected : []),
      ...(Array.isArray(a.keywordsIdentified) ? a.keywordsIdentified : []),
    ]),
  ).filter(Boolean);

  const isReading = (a.assessmentType || "")
    .toLowerCase()
    .includes("reading");
  const isWriting = (a.assessmentType || "")
    .toLowerCase()
    .includes("writing");
  const isPhonic = (a.assessmentType || "")
    .toLowerCase()
    .includes("phonic");

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-panel max-w-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header">
          <div className="flex items-center gap-3">
            <div className={`avatar ${avatarColor(a.studentName)}`}>
              {getInitials(a.studentName)}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-bold text-slate-900">
                  {a.studentName}
                </h2>
                {isPrimary ? (
                  <span className="px-2 py-0.5 rounded text-[10px] font-black bg-pink-100 text-pink-700 border border-pink-200">
                    🎒 Primary
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[10px] font-black bg-blue-100 text-blue-700 border border-blue-200">
                    🎓 Secondary
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                {a.assessmentType} · {a.yearGroupAndClass}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn-ghost btn-sm p-1.5 rounded-lg"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="modal-body space-y-6">
          {/* Meta grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { label: "Email", value: a.email },
              { label: "Year & Class", value: a.yearGroupAndClass },
              { label: "Term", value: a.term || "T1" },
              a.teacherName && {
                label: "Teacher / Assessor",
                value: a.teacherName,
              },
              { label: "Date", value: new Date(a.createdAt).toLocaleString() },
            ]
              .filter(Boolean)
              .map(({ label, value }) => (
                <div
                  key={label}
                  className="bg-slate-50 rounded-xl p-3 border border-slate-200"
                >
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">
                    {label}
                  </p>
                  <p className="text-xs text-slate-800 font-semibold truncate">
                    {value}
                  </p>
                </div>
              ))}
          </div>

          {/* Score + Level + Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="score-box-blue p-3 rounded-xl border border-blue-100 bg-blue-50/60">
              <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-1">
                Total Score
              </p>
              <p className="text-2xl font-black text-blue-700">
                {getDisplayScore(a)}
                {getScoreMax(a)}
              </p>
            </div>
            <div
              className={`score-box p-3 rounded-xl border ${CEFR_COLORS[a.cefrLevel || a.level] || AE_COLORS[a.level] || "bg-slate-50 border-slate-200"}`}
            >
              <p className="text-[10px] font-bold uppercase tracking-wider mb-1 opacity-70">
                Assessed Level
              </p>
              <p className="text-2xl font-black">
                {a.cefrLevel || a.level || "—"}
              </p>
            </div>
            {a.recommendedLevel && (
              <div className="p-3 rounded-xl border border-indigo-100 bg-indigo-50/60">
                <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider mb-1">
                  AI Recommended
                </p>
                <p className="text-lg font-black text-indigo-800">
                  {a.recommendedLevel}
                </p>
              </div>
            )}
            {(a.formationQuality || a.pencilGrip) && (
              <div className="p-3 rounded-xl border border-amber-100 bg-amber-50/60">
                <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider mb-1">
                  Pencil & Formation
                </p>
                <div className="text-xs font-bold text-amber-900 space-y-0.5">
                  {a.pencilGrip && (
                    <div>
                      Grip: <span className="capitalize">{a.pencilGrip}</span>
                    </div>
                  )}
                  {a.formationQuality && (
                    <div>
                      Formation:{" "}
                      <span className="capitalize">{a.formationQuality}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Keywords Chips if available */}
          {allKeywords.length > 0 && (
            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">
                Identified / Detected Keywords ({allKeywords.length})
              </p>
              <div className="flex flex-wrap gap-1.5">
                {allKeywords.map((kw, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-white text-indigo-700 border border-indigo-200 shadow-2xs"
                  >
                    ✓ {kw}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Listening answers */}
          {a.listeningAssessmentAnswers?.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">
                Listening Assessment Breakdown (
                {a.listeningAssessmentAnswers.length} Questions)
              </h3>
              <div className="table-wrapper overflow-x-auto rounded-xl border border-slate-200">
                <table className="data-table text-xs">
                  <thead className="bg-slate-100">
                    <tr>
                      <th className="py-2.5 px-3">#</th>
                      <th className="py-2.5 px-3">Question</th>
                      <th className="py-2.5 px-3 text-center">
                        Result / Score
                      </th>
                      <th className="py-2.5 px-3">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {a.listeningAssessmentAnswers.map((ans, i) => {
                      const isAccDefined = ans.acceptable !== undefined;
                      return (
                        <tr
                          key={i}
                          className="hover:bg-slate-50 border-b border-slate-100 last:border-none"
                        >
                          <td className="py-2 px-3 font-bold text-slate-500">
                            {ans.questionId || i + 1}
                          </td>
                          <td className="py-2 px-3 font-medium text-slate-800">
                            {ans.question ||
                              LISTENING_P1_QUESTIONS[i] ||
                              `Question ${ans.questionId || i + 1}`}
                          </td>
                          <td className="py-2 px-3 text-center">
                            {isAccDefined ? (
                              <span
                                className={`inline-flex px-2 py-0.5 rounded-full font-bold text-[10px] ${
                                  ans.acceptable
                                    ? "bg-emerald-100 text-emerald-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {ans.acceptable
                                  ? "✓ Acceptable"
                                  : "✗ Not acceptable"}
                              </span>
                            ) : (
                              <span className="font-bold text-slate-900">
                                {ans.score}/2 ({scoreLabel(ans.score)})
                              </span>
                            )}
                          </td>
                          <td className="py-2 px-3 text-slate-500 italic">
                            {ans.notes || "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Speaking answers */}
          {a.speakingAssessmentAnswers?.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">
                Speaking Assessment Breakdown
              </h3>
              <div className="table-wrapper overflow-x-auto rounded-xl border border-slate-200">
                <table className="data-table text-xs">
                  <thead className="bg-slate-100">
                    <tr>
                      <th className="py-2.5 px-3">Prompt</th>
                      <th className="py-2.5 px-3">Student Response / Notes</th>
                      <th className="py-2.5 px-3 text-center">
                        Assessed Score
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {a.speakingAssessmentAnswers.map((ans, i) => (
                      <tr
                        key={i}
                        className="hover:bg-slate-50 border-b border-slate-100 last:border-none"
                      >
                        <td className="py-2 px-3 font-semibold text-slate-800 max-w-xs">
                          {ans.question ||
                            SPEAKING_QUESTIONS_JUNIOR[i] ||
                            `Prompt ${ans.questionId || i + 1}`}
                        </td>
                        <td className="py-2 px-3 text-slate-600">
                          {ans.studentResponse || "—"}
                        </td>
                        <td className="py-2 px-3 text-center font-bold text-slate-900">
                          {ans.score || a.cefrLevel || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Reading Details & Items Evaluated */}
          {isReading && (
            <div className="space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">
                Reading Assessment Details
              </h3>
              {a.itemsEvaluated?.length > 0 && (
                <div className="table-wrapper overflow-x-auto rounded-xl border border-slate-200">
                  <table className="data-table text-xs">
                    <thead className="bg-slate-100">
                      <tr>
                        <th className="py-2.5 px-3">Word / Passage Box</th>
                        <th className="py-2.5 px-3 text-center">Status</th>
                        <th className="py-2.5 px-3">Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {a.itemsEvaluated.map((it, idx) => (
                        <tr
                          key={idx}
                          className="hover:bg-slate-50 border-b border-slate-100 last:border-none"
                        >
                          <td className="py-2 px-3 font-bold text-slate-800">
                            {it.word}
                          </td>
                          <td className="py-2 px-3 text-center">
                            <span
                              className={`inline-flex px-2 py-0.5 rounded-full font-bold text-[10px] ${
                                it.status === "read" || it.status === "correct"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : it.status === "struggled"
                                    ? "bg-amber-100 text-amber-800"
                                    : "bg-slate-100 text-slate-700"
                              }`}
                            >
                              {it.status}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-slate-500">
                            {it.notes || "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Writing Details: Detailed Responses (Phonics words) */}
          {isWriting && a.detailedResponses?.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">
                Phonics & Word Writing Breakdown
              </h3>
              <div className="table-wrapper overflow-x-auto rounded-xl border border-slate-200">
                <table className="data-table text-xs">
                  <thead className="bg-slate-100">
                    <tr>
                      <th className="py-2.5 px-3">#</th>
                      <th className="py-2.5 px-3">Target Word</th>
                      <th className="py-2.5 px-3">Student Wrote</th>
                      <th className="py-2.5 px-3 text-center">Evaluation</th>
                      <th className="py-2.5 px-3">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {a.detailedResponses.map((d, idx) => (
                      <tr
                        key={idx}
                        className="hover:bg-slate-50 border-b border-slate-100 last:border-none"
                      >
                        <td className="py-2 px-3 font-bold text-slate-500">
                          {d.itemNumber || idx + 1}
                        </td>
                        <td className="py-2 px-3 font-black text-slate-800">
                          {d.targetWord}
                        </td>
                        <td className="py-2 px-3 font-mono font-bold text-indigo-700">
                          {d.writtenByStudent || "(no attempt)"}
                        </td>
                        <td className="py-2 px-3 text-center">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded-full font-bold text-[10px] ${
                              d.status === "correct"
                                ? "bg-emerald-100 text-emerald-800"
                                : d.status === "incorrect"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {d.status}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-slate-500">
                          {d.notes || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Writing Details: Picture AI Prompt Answers */}
          {isWriting &&
            (a.writingAnswers?.length > 0 ||
              a.fs2WritingAnswers?.length > 0) && (
              <div className="space-y-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">
                  Picture Writing Responses
                </h3>
                <div className="space-y-2">
                  {(a.writingAnswers || a.fs2WritingAnswers).map((wa, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-50 rounded-xl border border-slate-200"
                    >
                      <p className="text-xs font-bold text-slate-800 mb-1">
                        {wa.question || `Prompt ${wa.questionId || idx + 1}`}
                      </p>
                      <p className="text-xs text-slate-700 p-2.5 bg-white rounded-lg border border-slate-100 font-medium">
                        {wa.answer || "(No response)"}
                      </p>
                      {wa.detectedKeywords?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {wa.detectedKeywords.map((k, kIdx) => (
                            <span
                              key={kIdx}
                              className="text-[10px] font-bold px-1.5 py-0.5 bg-indigo-50 text-indigo-700 rounded"
                            >
                              {k}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

          {/* Student Writing raw sheet text */}
          {a.studentWriting && (
            <div className="space-y-1">
              <p className="text-xs text-indigo-600 uppercase font-black tracking-wider">
                Student Writing Text
              </p>
              <div className="text-xs text-slate-800 whitespace-pre-wrap leading-relaxed p-4 bg-slate-50 rounded-xl border border-slate-200 font-medium">
                {a.studentWriting}
              </div>
            </div>
          )}

          {/* Phonics Phase sets & revisits */}
          {isPhonic && (
            <div className="space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">
                Phonics Progression & Revisits
              </h3>
              {a.graphemesNeedingRevisit?.length > 0 && (
                <div className="p-3 bg-red-50 rounded-xl border border-red-200">
                  <p className="text-[10px] font-black uppercase tracking-wider text-red-700 mb-1.5">
                    Sounds / Graphemes Needing Revisit (
                    {a.graphemesNeedingRevisit.length})
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {a.graphemesNeedingRevisit.map((s, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 bg-white text-red-800 border border-red-200 rounded-md text-xs font-mono font-bold"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {a.wordsNeedingRevisit?.length > 0 && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                  <p className="text-[10px] font-black uppercase tracking-wider text-amber-800 mb-1.5">
                    Words Needing Revisit ({a.wordsNeedingRevisit.length})
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {a.wordsNeedingRevisit.map((w, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 bg-white text-amber-800 border border-amber-200 rounded-md text-xs font-bold"
                      >
                        {w}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Teaching Focus */}
          {a.teachingFocus && (
            <div className="bg-emerald-50 rounded-xl p-3.5 border border-emerald-200">
              <p className="text-[10px] text-emerald-700 uppercase font-black tracking-wider mb-1">
                Targeted Teaching Focus
              </p>
              <p className="text-xs text-slate-800 font-medium">
                {a.teachingFocus}
              </p>
            </div>
          )}

          {/* Notes / Assessor comments */}
          {(a.readingNotes ||
            a.writingNotes ||
            a.notes ||
            a.comments ||
            a.teacherComments) && (
            <div className="bg-amber-50 rounded-xl p-3.5 border border-amber-200">
              <p className="text-[10px] text-amber-700 uppercase font-black tracking-wider mb-1">
                Teacher Notes & Feedback
              </p>
              <p className="text-xs text-slate-800 font-medium whitespace-pre-wrap">
                {a.teacherComments ||
                  a.comments ||
                  a.readingNotes ||
                  a.writingNotes ||
                  a.notes}
              </p>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn-secondary">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Records filters: skill & year group ──────────────────── */
const PRIMARY_STAGES = [
  "FS1",
  "FS2 - KG1",
  "KG2 / Year 1",
  "Grade 1 / Year 2",
  "Grade 2 / Year 3",
  "Grade 3 / Year 4",
  "Grade 4 / Year 5",
  "Grade 5 / Year 6",
];
const SECONDARY_STAGES = ["Junior (Year 7–9)", "Senior (Year 10–13)"];

function skillOf(a) {
  const t = (a.assessmentType || "").toLowerCase();
  if (t.includes("phonic")) return "Phonics";
  if (t.includes("listen")) return "Listening";
  if (t.includes("speak")) return "Speaking";
  if (t.includes("read")) return "Reading";
  if (t.includes("writ")) return "Writing";
  return "Other";
}

function stageOf(a) {
  if (!isPrimaryAssessment(a)) {
    return a.yearGroupType === "senior" ? SECONDARY_STAGES[1] : SECONDARY_STAGES[0];
  }
  const type = a.assessmentType || "";
  const yg = a.yearGroupAndClass || "";
  return (
    PRIMARY_STAGES.find((st) => type.startsWith(st)) ||
    PRIMARY_STAGES.find((st) => yg.startsWith(st)) ||
    "Other"
  );
}

const SKILL_CARD_STYLES = {
  blue: { idle: "bg-blue-50 text-blue-700 border-blue-200", active: "bg-blue-600 text-white border-blue-600" },
  cyan: { idle: "bg-cyan-50 text-cyan-700 border-cyan-200", active: "bg-cyan-600 text-white border-cyan-600" },
  violet: { idle: "bg-violet-50 text-violet-700 border-violet-200", active: "bg-violet-600 text-white border-violet-600" },
  emerald: { idle: "bg-emerald-50 text-emerald-700 border-emerald-200", active: "bg-emerald-600 text-white border-emerald-600" },
  pink: { idle: "bg-pink-50 text-pink-700 border-pink-200", active: "bg-pink-600 text-white border-pink-600" },
  amber: { idle: "bg-amber-50 text-amber-700 border-amber-200", active: "bg-amber-500 text-white border-amber-500" },
};

/* ── Main Component ───────────────────────────────────────── */
export default function AssessmentList() {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [search, setSearch] = useState("");
  const [filterTier, setFilterTier] = useState(() =>
    localStorage.getItem("assessmentSchoolTier") === "secondary" ? "secondary" : "primary",
  );
  const [filterSkill, setFilterSkill] = useState("All");
  const [filterStage, setFilterStage] = useState("All");
  const [filterTerm, setFilterTerm] = useState("All");

  const changeTier = (tier) => {
    setFilterTier(tier);
    setFilterSkill("All");
    setFilterStage("All");
    localStorage.setItem("assessmentSchoolTier", tier);
  };

  useEffect(() => {
    fetchAssessments();
  }, []);

  const fetchAssessments = async () => {
    try {
      setLoading(true);
      const data = await assessmentAPI.getAllAssessments();
      setAssessments(data);
    } catch (err) {
      toast.error(
        `Failed to load assessments: ${err.message || "Unknown error"}`,
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this assessment? This cannot be undone."))
      return;
    try {
      setDeletingId(id);
      await assessmentAPI.deleteAssessment(id);
      setAssessments((prev) => prev.filter((a) => a._id !== id));
      toast.success("Assessment deleted.");
    } catch (err) {
      toast.error(`Failed to delete: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  const handleExportCSV = () => {
    if (filtered.length === 0) {
      toast.warning("No data to export");
      return;
    }

    const headers = [
      "Student Name",
      "Year & Class",
      "Term",
      "Assessment Type",
      "Score",
      "Max Score",
      "Level",
      "Date",
      "Teacher Name",
      "Teacher Comments",
    ];

    const rows = filtered.map((a) => [
      a.studentName,
      a.yearGroupAndClass,
      a.term || "T1",
      a.assessmentType,
      getDisplayScore(a),
      getScoreMax(a).replace("/", ""),
      a.cefrLevel || a.level || "—",
      new Date(a.createdAt).toLocaleString(),
      a.teacherName || "",
      (a.teacherComments || "").replace(/\n/g, " "),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","),
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `honour_assessments_${new Date().toISOString().split("T")[0]}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Records for the selected tier (Primary or Secondary)
  const tierRecords = assessments.filter((a) =>
    filterTier === "primary" ? isPrimaryAssessment(a) : !isPrimaryAssessment(a),
  );
  const stageOptions = (filterTier === "primary" ? PRIMARY_STAGES : SECONDARY_STAGES).filter((st) =>
    tierRecords.some((a) => stageOf(a) === st),
  );

  // Everything except the skill filter (the skill cards show these counts)
  const baseFiltered = tierRecords.filter((a) => {
    const q = search.trim().toLowerCase();
    const matchStage = filterStage === "All" || stageOf(a) === filterStage;
    const matchTerm = filterTerm === "All" || (a.term || "T1") === filterTerm;
    const matchSearch =
      !q ||
      a.studentName?.toLowerCase().includes(q) ||
      a.yearGroupAndClass?.toLowerCase().includes(q);
    return matchStage && matchTerm && matchSearch;
  });
  const filtered = baseFiltered.filter((a) => filterSkill === "All" || skillOf(a) === filterSkill);

  const primaryCount = assessments.filter(isPrimaryAssessment).length;
  const secondaryCount = assessments.filter(
    (a) => !isPrimaryAssessment(a),
  ).length;

  // Skill cards double as the skill filter
  const SKILL_CARDS = [
    { key: "All", label: "All Skills", color: "blue" },
    { key: "Listening", label: "Listening", color: "cyan" },
    { key: "Speaking", label: "Speaking", color: "violet" },
    { key: "Reading", label: "Reading", color: "emerald" },
    { key: "Writing", label: "Writing", color: "pink" },
    ...(filterTier === "primary" ? [{ key: "Phonics", label: "Phonics", color: "amber" }] : []),
  ].map((c) => ({
    ...c,
    value: c.key === "All" ? baseFiltered.length : baseFiltered.filter((a) => skillOf(a) === c.key).length,
  }));

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Page header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="page-title">Assessment Records</h1>
              <p className="page-subtitle">
                Track and manage all student assessments.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportCSV}
                className="btn-primary btn-sm flex items-center gap-1.5"
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M7.5 12l4.5 4.5m0 0l4.5-4.5M12 3v13.5"
                  />
                </svg>
                Export CSV
              </button>
              <button
                onClick={fetchAssessments}
                className="btn-secondary btn-sm flex items-center gap-1.5"
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
                  />
                </svg>
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* School tier — Primary or Secondary */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="inline-flex bg-white border border-slate-200 p-1 rounded-2xl shadow-2xs self-start">
            {[
              { key: "primary", label: "Primary", count: primaryCount, on: "bg-pink-600 text-white" },
              { key: "secondary", label: "Secondary", count: secondaryCount, on: "bg-blue-600 text-white" },
            ].map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => changeTier(t.key)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  filterTier === t.key ? `${t.on} shadow-sm` : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                {t.label}
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                    filterTier === t.key ? "bg-white/25 text-white" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {t.count}
                </span>
              </button>
            ))}
          </div>
          <span className="text-sm text-slate-500 font-semibold">
            Showing {filtered.length} of {tierRecords.length} {filterTier} assessment
            {tierRecords.length === 1 ? "" : "s"}
          </span>
        </div>

        {/* Skill cards — click to filter */}
        <div className={`grid grid-cols-2 sm:grid-cols-3 ${SKILL_CARDS.length === 6 ? "lg:grid-cols-6" : "lg:grid-cols-5"} gap-3`}>
          {SKILL_CARDS.map((c) => {
            const active = filterSkill === c.key;
            const style = SKILL_CARD_STYLES[c.color];
            return (
              <button
                key={c.key}
                type="button"
                onClick={() => setFilterSkill(c.key)}
                className={`rounded-2xl border p-4 text-center transition-all ${
                  active ? `${style.active} shadow-md scale-[1.02]` : `${style.idle} hover:shadow-sm`
                }`}
              >
                <div className="text-2xl font-bold">{c.value}</div>
                <div className="text-xs font-semibold mt-0.5 opacity-90">{c.label}</div>
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="card-section flex flex-col items-center justify-center py-20 gap-3">
            <span className="spinner w-8 h-8 border-2 border-blue-600 border-t-transparent" />
            <p className="text-sm text-slate-500">Loading assessments...</p>
          </div>
        ) : assessments.length === 0 ? (
          <div className="card-section flex flex-col items-center justify-center py-20 gap-3 text-center">
            <svg
              className="w-12 h-12 text-slate-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z"
              />
            </svg>
            <div>
              <p className="text-slate-700 font-semibold">No assessments yet</p>
              <p className="text-slate-400 text-sm mt-0.5">
                Create your first assessment to see it here.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Filters: search · year group · term */}
            <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-2xs flex flex-col lg:flex-row lg:items-center gap-3">
              <div className="relative flex-1">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search student or class…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
              <select
                value={filterStage}
                onChange={(e) => setFilterStage(e.target.value)}
                className="lg:w-56 px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                aria-label="Year group"
              >
                <option value="All">All year groups</option>
                {stageOptions.map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
              <div className="inline-flex bg-slate-100 p-1 rounded-xl self-start lg:self-auto" role="group" aria-label="Term">
                {["All", "T1", "T2", "T3"].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setFilterTerm(t)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      filterTerm === t ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {t === "All" ? "All terms" : t}
                  </button>
                ))}
              </div>
              {(search || filterStage !== "All" || filterTerm !== "All" || filterSkill !== "All") && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setFilterStage("All");
                    setFilterTerm("All");
                    setFilterSkill("All");
                  }}
                  className="text-xs font-bold text-slate-500 hover:text-slate-800 px-2"
                >
                  Clear filters
                </button>
              )}
            </div>


            <div className="table-wrapper bg-white">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Year & Class</th>
                    <th>Term</th>
                    <th>Assessment Type</th>
                    <th className="text-center">Score</th>
                    <th className="text-center">Level</th>
                    <th>Date</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="text-center py-10 text-slate-400 text-sm"
                      >
                        No results match your search.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((a) => {
                      const typeMeta = getTypeMeta(a.assessmentType);
                      return (
                        <tr key={a._id}>
                          <td>
                            <div className="flex items-center gap-2.5">
                              <div
                                className={`avatar text-xs ${avatarColor(a.studentName)}`}
                              >
                                {getInitials(a.studentName)}
                              </div>
                              <span className="font-semibold text-slate-900 text-sm">
                                {a.studentName}
                              </span>
                            </div>
                          </td>
                          <td className="text-sm">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span>{a.yearGroupAndClass}</span>
                              {isPrimaryAssessment(a) ? (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-pink-50 text-pink-700 border border-pink-200">
                                  🎒 Primary
                                </span>
                              ) : (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-blue-50 text-blue-700 border border-blue-200">
                                  🎓 Secondary
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="text-sm">
                            <span className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded-md font-bold text-[10px]">
                              {a.term || "T1"}
                            </span>
                          </td>
                          <td>
                            <span className={`type-pill ${typeMeta.color}`}>
                              {typeMeta.label}
                            </span>
                          </td>
                          <td className="text-center">
                            <span className="font-bold text-slate-900 text-sm">
                              {getDisplayScore(a)}
                              {getScoreMax(a)}
                            </span>
                          </td>
                          <td className="text-center">{getLevelBadge(a)}</td>
                          <td className="text-xs text-slate-500">
                            {formatDate(a.createdAt)}
                          </td>
                          <td>
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => setViewing(a)}
                                className="btn-ghost btn-sm p-1.5 rounded-lg"
                                title="View details"
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  strokeWidth={2}
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                                  />
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                  />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDelete(a._id)}
                                disabled={deletingId === a._id}
                                className="btn-ghost btn-sm p-1.5 rounded-lg text-red-500 hover:bg-red-50 disabled:opacity-40"
                                title="Delete"
                              >
                                {deletingId === a._id ? (
                                  <span className="spinner w-3.5 h-3.5" />
                                ) : (
                                  <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                                    />
                                  </svg>
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <p className="text-xs text-slate-400">
              Showing {filtered.length} of {assessments.length} assessment
              {assessments.length !== 1 ? "s" : ""}
            </p>
          </>
        )}
      </div>

      <DetailModal assessment={viewing} onClose={() => setViewing(null)} />
    </div>
  );
}
