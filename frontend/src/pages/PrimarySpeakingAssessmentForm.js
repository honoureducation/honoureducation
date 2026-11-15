import React, { useState, useEffect } from "react";
import {
  useNavigate,
  useSearchParams,
  useLocation,
  Link,
} from "react-router-dom";
import { toast } from "react-toastify";
import { assessmentAPI } from "../services/api";
import familyPhoto from "../assets/fs1-speaking-family.jpg";
import fs1SpeakingSheet from "../assets/fs1-speaking-sheet.jpg";
import fs2SpeakingSheet from "../assets/fs2-speaking-sheet.png";
import kg2SpeakingSheet from "../assets/kg2-speaking-sheet.png";

// ==========================================
// 6 QUESTIONS FROM FS1 / FS2 / KG2 SPEAKING ASSESSMENT
// ==========================================
const FS1_SPEAKING_QUESTIONS = [
  { id: 1, text: "Can you explain what is happening in the picture?" },
  { id: 2, text: "What are they eating?" },
  { id: 3, text: "How do they eat?" },
  { id: 4, text: "Who has no food on their plate?" },
  { id: 5, text: "How are they feeling?" },
  { id: 6, text: "How do you know this?" },
];

// ==========================================
// CEFR RUBRIC TABLE FOR FS1 & FS2 - KG1
// ==========================================
const CEFR_RUBRIC_LEVELS = [
  {
    level: "Pre-A1",
    description:
      "Points, gestures, single sounds; no meaningful verbal response.",
    badgeBg: "bg-rose-100 text-rose-800 border-rose-200",
    activeBg: "bg-rose-50 border-rose-400 text-rose-900",
    indicator: "bg-rose-500",
  },
  {
    level: "A1.0–A1.2",
    description: "1–3 word answers; names objects; cannot explain clearly.",
    badgeBg: "bg-orange-100 text-orange-800 border-orange-200",
    activeBg: "bg-orange-50 border-orange-400 text-orange-900",
    indicator: "bg-orange-500",
  },
  {
    level: "A2.0–A2.2",
    description:
      "2–5 word answers; simple sentences; attempts basic explanation.",
    badgeBg: "bg-amber-100 text-amber-800 border-amber-200",
    activeBg: "bg-amber-50 border-amber-400 text-amber-900",
    indicator: "bg-amber-500",
  },
  {
    level: "A2.3–B1.1",
    description: "5–10 word sentences; uses conjunctions; relevant vocabulary.",
    badgeBg: "bg-blue-100 text-blue-800 border-blue-200",
    activeBg: "bg-blue-50 border-blue-400 text-blue-900",
    indicator: "bg-blue-600",
  },
  {
    level: "B1.2–B1.3",
    description: "Fluent short/long sentences; explains gist; adds details.",
    badgeBg: "bg-indigo-100 text-indigo-800 border-indigo-200",
    activeBg: "bg-indigo-50 border-indigo-400 text-indigo-900",
    indicator: "bg-indigo-600",
  },
  {
    level: "B2–C1",
    description:
      "Confident, extended explanation; strong vocabulary; justifies ideas.",
    badgeBg: "bg-emerald-100 text-emerald-800 border-emerald-200",
    activeBg: "bg-emerald-50 border-emerald-400 text-emerald-900",
    indicator: "bg-emerald-600",
  },
];

// ==========================================
// CEFR RUBRIC TABLE FOR KG2 / YEAR 1 SPEAKING
// ==========================================
const KG2_SPEAKING_RUBRIC = [
  {
    level: "A1.0–A1.2",
    description:
      "Uses 1–3 word answers or none because they cannot explain.",
    badgeBg: "bg-orange-100 text-orange-800 border-orange-200",
    activeBg: "bg-orange-50 border-orange-400 text-orange-900",
    indicator: "bg-orange-500",
  },
  {
    level: "A2.0–A2.2",
    description:
      "Uses 2–5 word answers; explains in a confused way. Short sentences.",
    badgeBg: "bg-amber-100 text-amber-800 border-amber-200",
    activeBg: "bg-amber-50 border-amber-400 text-amber-900",
    indicator: "bg-amber-500",
  },
  {
    level: "A2.3–B1.1",
    description:
      "Uses 5–10 words in a sentence and includes conjunctions. Mix of short and longer sentences with relevant vocabulary.",
    badgeBg: "bg-blue-100 text-blue-800 border-blue-200",
    activeBg: "bg-blue-50 border-blue-400 text-blue-900",
    indicator: "bg-blue-600",
  },
  {
    level: "B1.2–B1.3",
    description:
      "Speaks more fluently in short and long sentences; explains the gist of the picture without hesitation. Uses conjunctions and adds details.",
    badgeBg: "bg-indigo-100 text-indigo-800 border-indigo-200",
    activeBg: "bg-indigo-50 border-indigo-400 text-indigo-900",
    indicator: "bg-indigo-600",
  },
  {
    level: "B2–C1",
    description:
      "Fluently and confidently explains the picture; adds additional information that supports the picture and story. Uses strong vocabulary and sentence structures.",
    badgeBg: "bg-emerald-100 text-emerald-800 border-emerald-200",
    activeBg: "bg-emerald-50 border-emerald-400 text-emerald-900",
    indicator: "bg-emerald-600",
  },
];

const KEY_WORDS = [
  "Family",
  "eating",
  "vegetables",
  "rice",
  "eggs",
  "salad",
  "girl",
  "boy",
  "mum",
  "dad",
  "dinner",
  "lunch",
  "happy",
  "chicken",
  "meat",
  "drink",
  "sit",
  "eat",
  "hungry",
];

export default function PrimarySpeakingAssessmentForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const preSelectedTerm = searchParams.get("term") || "T1";

  const isKG2Initial =
    location.pathname.includes("kg2") ||
    location.pathname.includes("year1") ||
    searchParams.get("grade") === "kg2" ||
    searchParams.get("grade") === "year1" ||
    searchParams.get("stage") === "kg2" ||
    searchParams.get("stage") === "year1";

  const isFS2Initial =
    location.pathname.includes("fs2") ||
    searchParams.get("grade") === "fs2" ||
    searchParams.get("stage") === "fs2";

  const initialStage = isKG2Initial
    ? "KG2 / Year 1"
    : isFS2Initial
    ? "FS2 - KG1"
    : "FS1";

  const [selectedStage, setSelectedStage] = useState(initialStage);
  const [showSheetModal, setShowSheetModal] = useState(false);

  useEffect(() => {
    localStorage.setItem("assessmentSchoolTier", "primary");
  }, []);

  // Form Details
  const [formData, setFormData] = useState({
    email: "",
    studentName: "",
    yearGroupAndClass: initialStage,
    teacherName: "",
    term: preSelectedTerm,
  });

  const handleStageSwitch = (newStage) => {
    setSelectedStage(newStage);
    setFormData((prev) => ({
      ...prev,
      yearGroupAndClass:
        prev.yearGroupAndClass === "FS1" ||
        prev.yearGroupAndClass === "FS2 - KG1" ||
        prev.yearGroupAndClass === "KG2 / Year 1"
          ? newStage
          : prev.yearGroupAndClass,
    }));
  };

  const activeRubric =
    selectedStage === "KG2 / Year 1" ? KG2_SPEAKING_RUBRIC : CEFR_RUBRIC_LEVELS;

  const activeSheet =
    selectedStage === "KG2 / Year 1"
      ? kg2SpeakingSheet
      : selectedStage === "FS2 - KG1"
      ? fs2SpeakingSheet
      : fs1SpeakingSheet;

  // Observations and per-question notes
  const [questionNotes, setQuestionNotes] = useState(
    Array(FS1_SPEAKING_QUESTIONS.length).fill(""),
  );
  const [selectedLevel, setSelectedLevel] = useState(null); // 'Pre-A1' | 'A1.0–A1.2' etc.
  const [usedKeywords, setUsedKeywords] = useState([]);
  const [teacherGeneralComments, setTeacherGeneralComments] = useState("");
  const [showFullPicture, setShowFullPicture] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (preSelectedTerm) {
      setFormData((prev) => ({ ...prev, term: preSelectedTerm }));
    }
    const savedTeacher =
      localStorage.getItem("teacherName") ||
      localStorage.getItem("userName") ||
      "";
    const savedEmail =
      localStorage.getItem("userEmail") ||
      localStorage.getItem("teacherEmail") ||
      "";
    if (savedTeacher || savedEmail) {
      setFormData((prev) => ({
        ...prev,
        teacherName: prev.teacherName || savedTeacher,
        email: prev.email || savedEmail,
      }));
    }
  }, [preSelectedTerm]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNoteChange = (index, value) => {
    const nextNotes = [...questionNotes];
    nextNotes[index] = value;
    setQuestionNotes(nextNotes);
  };

  const toggleKeyword = (word) => {
    setUsedKeywords((prev) =>
      prev.includes(word) ? prev.filter((w) => w !== word) : [...prev, word],
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.studentName.trim()) {
      toast.error("Please enter the student name.");
      return;
    }
    if (!formData.email.trim()) {
      toast.error("Please enter the assessor/student email.");
      return;
    }
    if (!selectedLevel) {
      toast.error(
        "Please select the evaluated CEFR Level from the rubric table.",
      );
      return;
    }

    setLoading(true);
    const assessmentType =
      selectedStage === "KG2 / Year 1"
        ? "KG2 / Year 1 Speaking Assessment"
        : selectedStage === "FS2 - KG1"
        ? "FS2 - KG1 Speaking Assessment"
        : "FS1 Speaking Assessment";

    try {
      const selectedRubricObj = activeRubric.find(
        (r) => r.level === selectedLevel,
      );

      const payload = {
        assessmentType,
        yearGroupType: "junior",
        email: formData.email,
        studentName: formData.studentName,
        yearGroupAndClass: formData.yearGroupAndClass,
        teacherName: formData.teacherName,
        term: formData.term,
        cefrLevel: selectedLevel,
        level: selectedLevel,
        totalScore:
          activeRubric.findIndex((r) => r.level === selectedLevel) + 1,
        speakingAssessmentAnswers: FS1_SPEAKING_QUESTIONS.map((q, idx) => ({
          questionId: q.id,
          question: q.text,
          studentResponse: questionNotes[idx] || "",
          score: selectedLevel,
        })),
        keywordsUsed: usedKeywords,
        comments: teacherGeneralComments,
        notes: selectedRubricObj?.description || "",
      };

      await assessmentAPI.createAssessment(payload);
      toast.success(`${assessmentType} saved successfully! (${selectedLevel})`);

      setTimeout(() => {
        navigate("/assessments?tier=primary");
      }, 1500);
    } catch (err) {
      console.error("Submission error:", err);
      toast.error(`Failed to save: ${err.message || "Error occurred"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Navigation Breadcrumb & Stage Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Link
            to="/assessments?tier=primary"
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
              />
            </svg>
            Back to Assessments
          </Link>

          {/* Stage Selector (FS1, FS2 - KG1, KG2 / Year 1) */}
          <div className="inline-flex bg-slate-200/90 p-1.5 rounded-2xl shadow-inner gap-1 flex-wrap self-start sm:self-auto">
            <button
              type="button"
              onClick={() => handleStageSwitch("FS1")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 ${
                selectedStage === "FS1"
                  ? "bg-white text-violet-700 shadow-sm scale-[1.02]"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/50"
              }`}
            >
              <span>🌸 FS1</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  selectedStage === "FS1"
                    ? "bg-violet-100 text-violet-800"
                    : "bg-slate-300 text-slate-700"
                }`}
              >
                Nursery
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleStageSwitch("FS2 - KG1")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 ${
                selectedStage === "FS2 - KG1"
                  ? "bg-white text-violet-700 shadow-sm scale-[1.02]"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/50"
              }`}
            >
              <span>🌼 FS2 - KG1</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  selectedStage === "FS2 - KG1"
                    ? "bg-violet-100 text-violet-800"
                    : "bg-slate-300 text-slate-700"
                }`}
              >
                Reception
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleStageSwitch("KG2 / Year 1")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 ${
                selectedStage === "KG2 / Year 1"
                  ? "bg-white text-violet-700 shadow-sm scale-[1.02]"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/50"
              }`}
            >
              <span>🎓 KG2 / Year 1</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  selectedStage === "KG2 / Year 1"
                    ? "bg-violet-100 text-violet-800"
                    : "bg-slate-300 text-slate-700"
                }`}
              >
                Year 1
              </span>
            </button>
          </div>
        </div>

        {/* Title Header Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-600" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-black uppercase tracking-widest text-violet-600">
                  Primary Assessment · Speaking
                </span>
                <span className="text-slate-300 font-bold">•</span>
                <span className="text-xs font-extrabold text-slate-500">
                  {selectedStage}
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mt-1">
                {selectedStage} Speaking Assessment
              </h1>
              <p className="text-slate-500 text-sm mt-2 max-w-2xl">
                {selectedStage === "KG2 / Year 1"
                  ? "Picture-based oral response evaluation with sentence structures and conjunctions for Year 1 pupils."
                  : selectedStage === "FS2 - KG1"
                  ? "Picture-based oral response evaluation for FS2 - KG1 students."
                  : "Picture-based oral response evaluation for Foundation Stage 1 students."}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 self-start md:self-auto">
              <button
                type="button"
                onClick={() => setShowSheetModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-violet-50 hover:bg-violet-100 text-violet-700 font-bold text-xs border border-violet-200 transition-colors shadow-2xs"
              >
                <svg
                  className="w-4 h-4 text-violet-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                  />
                </svg>
                View Printable Sheet
              </button>

              {/* Selected Level Badge */}
              <div className="bg-violet-50 border-2 border-violet-200 rounded-2xl p-4 flex items-center gap-4 shadow-xs">
                <div>
                  <span className="text-[10px] font-black text-violet-700 uppercase tracking-wider block">
                    Evaluated Level
                  </span>
                  <span
                    className={`inline-block px-3 py-1 mt-1 rounded-xl text-sm font-black ${
                      selectedLevel
                        ? "bg-violet-600 text-white shadow-xs"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {selectedLevel || "Not Selected"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Picture Prompt & Instructions Box (Exact purple border from source image) */}
          <div className="mt-8 border-3 border-violet-500 rounded-3xl p-5 sm:p-6 bg-slate-50/60 shadow-xs">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              {/* Left Column: Instructions and Questions */}
              <div className="lg:col-span-7 space-y-5">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-violet-900 flex items-center gap-2 mb-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-violet-600"></span>
                    Instructions for assessor
                  </h3>
                  <ul className="text-xs text-slate-700 font-bold space-y-1 list-disc list-inside">
                    <li>Show the student the picture.</li>
                    <li>Ask each question once only.</li>
                    <li>Accept the first answer given.</li>
                    <li>Do not probe or repeat.</li>
                  </ul>
                </div>

                <div className="border-t border-slate-200/80 pt-4">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 mb-2">
                    Questions for the student
                  </h4>
                  <ul className="text-xs sm:text-sm text-slate-800 font-semibold space-y-2">
                    {FS1_SPEAKING_QUESTIONS.map((q) => (
                      <li key={q.id} className="flex items-start gap-2">
                        <span className="text-violet-600 font-extrabold">
                          •
                        </span>
                        <span>{q.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Right Column: Family Dinner Photo Prompt */}
              <div className="lg:col-span-5 flex flex-col items-center">
                <div
                  onClick={() => setShowFullPicture(!showFullPicture)}
                  className="cursor-pointer group relative rounded-2xl overflow-hidden border-2 border-violet-300 shadow-md bg-white transition-all hover:scale-102 hover:shadow-xl"
                  title="Click to view large prompt image"
                >
                  <img
                    src={familyPhoto}
                    alt="Family dinner prompt"
                    className="w-full h-56 sm:h-64 object-cover object-center"
                  />
                  <div className="absolute inset-0 bg-violet-900/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="bg-white/90 text-violet-900 text-xs font-extrabold px-3 py-1.5 rounded-xl shadow-md">
                      🔍 Tap to Zoom Prompt
                    </span>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-slate-500 mt-2">
                  Picture Prompt (Family at Table)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal for Full Picture Zoom */}
        {showFullPicture && (
          <div
            onClick={() => setShowFullPicture(false)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-xs cursor-pointer"
          >
            <div
              className="bg-white rounded-3xl p-4 max-w-2xl w-full shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-black text-slate-800">
                  FS1 Speaking Prompt Image
                </h3>
                <button
                  onClick={() => setShowFullPicture(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold flex items-center justify-center"
                >
                  ✕
                </button>
              </div>
              <img
                src={familyPhoto}
                alt="Family dinner prompt large"
                className="w-full max-h-[75vh] object-contain rounded-2xl border"
              />
              <p className="text-center text-xs text-slate-500 mt-3 font-semibold">
                Show this image clearly to the student while asking the 6
                questions.
              </p>
            </div>
          </div>
        )}

        {/* Assessment Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Student & Assessment Details */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
            <h2 className="text-base font-black text-slate-900 mb-6 flex items-center gap-2">
              <span className="w-7 h-7 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center text-xs font-extrabold">
                1
              </span>
              Student & Assessment Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                  Student Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="studentName"
                  value={formData.studentName}
                  onChange={handleInputChange}
                  placeholder="e.g. Liam Smith"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-violet-500 focus:bg-white rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 transition-all focus:outline-none focus:ring-4 focus:ring-violet-100"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                  Assessor Email <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="assessor@school.edu"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-violet-500 focus:bg-white rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 transition-all focus:outline-none focus:ring-4 focus:ring-violet-100"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                  Year Group / Class
                </label>
                <input
                  type="text"
                  name="yearGroupAndClass"
                  value={formData.yearGroupAndClass}
                  onChange={handleInputChange}
                  placeholder="e.g. FS1 - Dolphins"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-violet-500 focus:bg-white rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 transition-all focus:outline-none focus:ring-4 focus:ring-violet-100"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                  Academic Term
                </label>
                <select
                  name="term"
                  value={formData.term}
                  onChange={handleInputChange}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-violet-500 focus:bg-white rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 transition-all focus:outline-none focus:ring-4 focus:ring-violet-100"
                >
                  <option value="T1">Term 1 (T1)</option>
                  <option value="T2">Term 2 (T2)</option>
                  <option value="T3">Term 3 (T3)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Student Verbal Responses Logging (Optional notes per question) */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center text-xs font-extrabold">
                    2
                  </span>
                  Question Responses & Observed Speech
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Record brief notes of the student’s first answer for each
                  question (e.g. single words, phrases, complete sentences).
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {FS1_SPEAKING_QUESTIONS.map((q, idx) => (
                <div
                  key={q.id}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 transition-all hover:bg-slate-100/50"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-extrabold text-slate-800">
                      <span className="text-violet-600 mr-2">Q{q.id}.</span>{" "}
                      {q.text}
                    </span>
                  </div>
                  <input
                    type="text"
                    value={questionNotes[idx]}
                    onChange={(e) => handleNoteChange(idx, e.target.value)}
                    placeholder="Note child's answer (e.g. 'eating rice', points to plate, says 'happy')..."
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-500"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* CEFR Level Rubric Selection (100% exact copy of image 1) */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center text-xs font-extrabold">
                    3
                  </span>
                  CEFR Level Rubric & Evaluation
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Click on the row that best matches the student's verbal
                  response to select their CEFR level.
                </p>
              </div>

              {selectedLevel && (
                <div className="bg-violet-50 border border-violet-200 px-4 py-2 rounded-2xl flex items-center gap-2">
                  <span className="text-xs font-bold text-violet-700">
                    Selected Level:
                  </span>
                  <span className="text-xs font-black text-violet-900 bg-white px-2 py-0.5 rounded-lg border border-violet-200">
                    {selectedLevel}
                  </span>
                </div>
              )}
            </div>

            {/* Exact CEFR Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse border border-slate-200 rounded-2xl overflow-hidden text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 font-black uppercase tracking-wider border-b border-slate-200">
                    <th className="py-3.5 px-4 w-36">CEFR Level</th>
                    <th className="py-3.5 px-4">Description</th>
                    <th className="py-3.5 px-4 w-28 text-center">Select</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-800">
                  {activeRubric.map((item, i) => {
                    const isSelected = selectedLevel === item.level;

                    return (
                      <tr
                        key={i}
                        onClick={() => setSelectedLevel(item.level)}
                        className={`cursor-pointer transition-all duration-150 ${
                          isSelected
                            ? "bg-violet-50/90 font-extrabold border-l-4 border-l-violet-600 shadow-2xs"
                            : "hover:bg-slate-50"
                        }`}
                      >
                        <td className="py-4 px-4 font-black">
                          <span
                            className={`inline-block px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                              isSelected
                                ? "bg-violet-600 text-white shadow-xs scale-105"
                                : item.badgeBg
                            }`}
                          >
                            {item.level}
                          </span>
                        </td>
                        <td className="py-4 px-4 leading-relaxed font-medium">
                          {item.description}
                        </td>
                        <td className="py-4 px-4 text-center">
                          <input
                            type="radio"
                            name="cefrLevelRadio"
                            checked={isSelected}
                            onChange={() => setSelectedLevel(item.level)}
                            className="w-4 h-4 text-violet-600 focus:ring-violet-500 cursor-pointer"
                          />
                        </td>
                      </tr>
                    );
                  })}

                  {/* Key Words Row (Exact from image) */}
                  <tr className="bg-slate-50/90 border-t-2 border-slate-300">
                    <td className="py-4 px-4 font-black text-slate-800 align-top">
                      Key Words
                    </td>
                    <td colSpan={2} className="py-4 px-4">
                      <p className="text-[11px] text-slate-500 font-semibold mb-2">
                        Tap words to mark what the student used during speaking:
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {KEY_WORDS.map((word, kIdx) => {
                          const isUsed = usedKeywords.includes(word);
                          return (
                            <button
                              key={kIdx}
                              type="button"
                              onClick={() => toggleKeyword(word)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                                isUsed
                                  ? "bg-violet-600 text-white font-bold shadow-xs scale-105"
                                  : "bg-white border border-slate-200 text-slate-700 hover:border-violet-300"
                              }`}
                            >
                              {isUsed ? "✓ " : ""}
                              {word}
                            </button>
                          );
                        })}
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* General Assessor Comments */}
            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                Assessor General Comments / Observations
              </label>
              <textarea
                value={teacherGeneralComments}
                onChange={(e) => setTeacherGeneralComments(e.target.value)}
                rows={2}
                placeholder="Additional notes on pronunciation, confidence, non-verbal gestures..."
                className="w-full bg-slate-50 border border-slate-200 focus:border-violet-500 focus:bg-white rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-800 transition-all focus:outline-none focus:ring-4 focus:ring-violet-100"
              />
            </div>
          </div>

          {/* Submission Bar */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-500 font-medium">
              {selectedLevel ? (
                <span>
                  Assigned Level:{" "}
                  <strong className="text-violet-700 font-black">
                    {selectedLevel}
                  </strong>
                </span>
              ) : (
                <span className="text-rose-600 font-bold">
                  Please select a CEFR level from the rubric table above
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => navigate("/assessments?tier=primary")}
                className="w-1/2 sm:w-auto px-5 py-3 rounded-2xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !selectedLevel}
                className="w-1/2 sm:w-auto px-8 py-3 rounded-2xl bg-violet-600 hover:bg-violet-700 text-white font-extrabold text-xs shadow-lg shadow-violet-600/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <span>Submit {selectedStage} Speaking</span>
                    <span>→</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Printable Sheet Modal */}
      {showSheetModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-violet-50">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-violet-500"></span>
                <h3 className="font-black text-slate-800 text-sm uppercase tracking-wider">
                  {selectedStage} Speaking Assessment · Original Document
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowSheetModal(false)}
                className="w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center font-bold text-sm"
              >
                ✕
              </button>
            </div>
            <div className="p-4 overflow-y-auto flex-1 flex justify-center bg-slate-100">
              <img
                src={activeSheet}
                alt={`${selectedStage} Speaking Assessment Document`}
                className="max-w-full h-auto rounded-xl shadow-lg border border-slate-300"
              />
            </div>
            <div className="px-6 py-3 border-t border-slate-200 flex justify-end bg-white">
              <button
                type="button"
                onClick={() => setShowSheetModal(false)}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
