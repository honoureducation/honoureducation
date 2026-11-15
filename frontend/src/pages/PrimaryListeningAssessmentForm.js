import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { assessmentAPI } from '../services/api';
import fs1Sheet from '../assets/fs1-listening-sheet.png';
import fs2Sheet from '../assets/fs2-listening-sheet.png';
import kg2Sheet from '../assets/kg2-year1-listening-sheet.png';

// ==========================================
// 10 QUESTIONS FROM FS1 LISTENING ASSESSMENT
// ==========================================
const FS1_QUESTIONS = [
  { id: 1, text: 'What is your name?' },
  { id: 2, text: 'How old are you ?' },
  { id: 3, text: 'Where were you born?' },
  { id: 4, text: 'Where do you live now?' },
  { id: 5, text: 'Who do you live with?' },
  { id: 6, text: 'Have you got any brothers or sisters?' },
  { id: 7, text: 'Who are your friends?' },
  { id: 8, text: 'Can you tell me about the things you like?' },
  { id: 9, text: 'Tell me about your house?' },
  { id: 10, text: 'What is your favorite food?' },
];

// ==========================================
// RUBRIC TABLE FROM FS1 LISTENING ASSESSMENT
// ==========================================
const RUBRIC_BANDS = [
  {
    range: '0 – 2',
    min: 0,
    max: 2,
    level: 'Pre-A1',
    notes: 'Very early stage; gestures, pointing, single sounds',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
    highlightBorder: 'border-rose-400 bg-rose-50/70',
    accentColor: 'text-rose-600',
  },
  {
    range: '3 – 4',
    min: 3,
    max: 4,
    level: 'A1.0–A1.2',
    notes: '1–3 word answers; names objects; limited explanation',
    badgeColor: 'bg-orange-100 text-orange-800 border-orange-200',
    highlightBorder: 'border-orange-400 bg-orange-50/70',
    accentColor: 'text-orange-600',
  },
  {
    range: '4 – 5',
    min: 5, // overlap boundary
    max: 5,
    level: 'A2.0–A2.2',
    notes: '2–5 word answers; simple sentences; attempts explanation',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    highlightBorder: 'border-amber-400 bg-amber-50/70',
    accentColor: 'text-amber-600',
  },
  {
    range: '6 – 7',
    min: 6,
    max: 7,
    level: 'A2.3–B1.1',
    notes: '5–10 word sentences; conjunctions; relevant vocabulary',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    highlightBorder: 'border-blue-400 bg-blue-50/70',
    accentColor: 'text-blue-600',
  },
  {
    range: '8 – 9',
    min: 8,
    max: 8, // boundary
    level: 'B1.2–B1.3',
    notes: 'Fluent short/long sentences; explains gist; adds details',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    highlightBorder: 'border-indigo-400 bg-indigo-50/70',
    accentColor: 'text-indigo-600',
  },
  {
    range: '9 – 10',
    min: 9,
    max: 10,
    level: 'B2–C1',
    notes: 'Confident, extended explanation; strong vocabulary; justifies ideas',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    highlightBorder: 'border-emerald-400 bg-emerald-50/70',
    accentColor: 'text-emerald-600',
  },
];

// ==========================================
// RUBRIC TABLE FROM KG2 / YEAR 1 LISTENING ASSESSMENT
// 100% exact text from uploaded sheet
// ==========================================
const KG2_RUBRIC_BANDS = [
  {
    range: '0',
    min: 0,
    max: 0,
    level: 'Pre-A1',
    notes: '0 acceptable responses (gestures, single sounds)',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
    highlightBorder: 'border-rose-400 bg-rose-50/70',
    accentColor: 'text-rose-600',
  },
  {
    range: '1 – 3',
    min: 1,
    max: 3,
    level: 'A1.0–A1.2',
    notes: '1–3 acceptable responses',
    badgeColor: 'bg-orange-100 text-orange-800 border-orange-200',
    highlightBorder: 'border-orange-400 bg-orange-50/70',
    accentColor: 'text-orange-600',
  },
  {
    range: '4 – 5',
    min: 4,
    max: 5,
    level: 'A2.0–A2.2',
    notes: '4–5 acceptable responses',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    highlightBorder: 'border-amber-400 bg-amber-50/70',
    accentColor: 'text-amber-600',
  },
  {
    range: '6 – 7',
    min: 6,
    max: 7,
    level: 'A2.3–B1.1',
    notes: '6–7 acceptable responses',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    highlightBorder: 'border-blue-400 bg-blue-50/70',
    accentColor: 'text-blue-600',
  },
  {
    range: '8 – 9',
    min: 8,
    max: 9,
    level: 'B1.2–B1.3',
    notes: '8–9 acceptable responses',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    highlightBorder: 'border-indigo-400 bg-indigo-50/70',
    accentColor: 'text-indigo-600',
  },
  {
    range: '10',
    min: 10,
    max: 10,
    level: 'B2–C1',
    notes: '10 acceptable responses',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    highlightBorder: 'border-emerald-400 bg-emerald-50/70',
    accentColor: 'text-emerald-600',
  },
];

const KEY_WORDS = [
  'name', 'I am', 'I was born', 'I live', 'I live with', 'I have', 
  'brothers', 'sisters', 'friends', 'I like', 'my house'
];

function calculateListeningLevel(score, stage) {
  if (stage === 'KG2 / Year 1') {
    if (score === 0) {
      return {
        level: 'Pre-A1',
        notes: '0 acceptable responses; gestures, single sounds',
        color: 'text-rose-600 bg-rose-50 border-rose-200',
        tagColor: 'bg-rose-500 text-white',
      };
    }
    if (score <= 3) {
      return {
        level: 'A1.0–A1.2',
        notes: '1–3 acceptable responses',
        color: 'text-orange-600 bg-orange-50 border-orange-200',
        tagColor: 'bg-orange-500 text-white',
      };
    }
    if (score <= 5) {
      return {
        level: 'A2.0–A2.2',
        notes: '4–5 acceptable responses',
        color: 'text-amber-600 bg-amber-50 border-amber-200',
        tagColor: 'bg-amber-500 text-white',
      };
    }
    if (score <= 7) {
      return {
        level: 'A2.3–B1.1',
        notes: '6–7 acceptable responses',
        color: 'text-blue-600 bg-blue-50 border-blue-200',
        tagColor: 'bg-blue-600 text-white',
      };
    }
    if (score <= 9) {
      return {
        level: 'B1.2–B1.3',
        notes: '8–9 acceptable responses',
        color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
        tagColor: 'bg-indigo-600 text-white',
      };
    }
    return {
      level: 'B2–C1',
      notes: '10 acceptable responses',
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
      tagColor: 'bg-emerald-600 text-white',
    };
  }

  // FS1 and FS2 - KG1 scoring
  if (score <= 2) {
    return {
      level: 'Pre-A1',
      notes: 'Very early stage; gestures, pointing, single sounds',
      color: 'text-rose-600 bg-rose-50 border-rose-200',
      tagColor: 'bg-rose-500 text-white',
    };
  }
  if (score <= 4) {
    return {
      level: 'A1.0–A1.2',
      notes: '1–3 word answers; names objects; limited explanation',
      color: 'text-orange-600 bg-orange-50 border-orange-200',
      tagColor: 'bg-orange-500 text-white',
    };
  }
  if (score === 5) {
    return {
      level: 'A2.0–A2.2',
      notes: '2–5 word answers; simple sentences; attempts explanation',
      color: 'text-amber-600 bg-amber-50 border-amber-200',
      tagColor: 'bg-amber-500 text-white',
    };
  }
  if (score <= 7) {
    return {
      level: 'A2.3–B1.1',
      notes: '5–10 word sentences; conjunctions; relevant vocabulary',
      color: 'text-blue-600 bg-blue-50 border-blue-200',
      tagColor: 'bg-blue-600 text-white',
    };
  }
  if (score <= 9) {
    return {
      level: 'B1.2–B1.3',
      notes: 'Fluent short/long sentences; explains gist; adds details',
      color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
      tagColor: 'bg-indigo-600 text-white',
    };
  }
  return {
    level: 'B2–C1',
    notes: 'Confident, extended explanation; strong vocabulary; justifies ideas',
    color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    tagColor: 'bg-emerald-600 text-white',
  };
}

export default function PrimaryListeningAssessmentForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const preSelectedTerm = searchParams.get('term') || 'T1';

  const isKG2Initial =
    location.pathname.includes('kg2') ||
    location.pathname.includes('year1') ||
    searchParams.get('grade') === 'kg2' ||
    searchParams.get('grade') === 'year1' ||
    searchParams.get('stage') === 'kg2' ||
    searchParams.get('stage') === 'year1';

  const isFS2Initial =
    location.pathname.includes('fs2') ||
    searchParams.get('grade') === 'fs2' ||
    searchParams.get('stage') === 'fs2';

  const initialStage = isKG2Initial
    ? 'KG2 / Year 1'
    : isFS2Initial
    ? 'FS2 - KG1'
    : 'FS1';

  const [selectedStage, setSelectedStage] = useState(initialStage);
  const [showSheetModal, setShowSheetModal] = useState(false);

  useEffect(() => {
    localStorage.setItem('assessmentSchoolTier', 'primary');
  }, []);

  // Form State
  const [formData, setFormData] = useState({
    email: '',
    studentName: '',
    yearGroupAndClass: initialStage,
    teacherName: '',
    term: preSelectedTerm,
  });

  const handleStageSwitch = (newStage) => {
    setSelectedStage(newStage);
    setFormData((prev) => ({
      ...prev,
      yearGroupAndClass:
        prev.yearGroupAndClass === 'FS1' ||
        prev.yearGroupAndClass === 'FS2 - KG1' ||
        prev.yearGroupAndClass === 'KG2 / Year 1'
          ? newStage
          : prev.yearGroupAndClass,
    }));
  };

  // Each item in answers: null | true (Acceptable) | false (Not acceptable)
  const [answers, setAnswers] = useState(Array(FS1_QUESTIONS.length).fill(null));
  const [questionNotes] = useState(Array(FS1_QUESTIONS.length).fill(''));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (preSelectedTerm) {
      setFormData((prev) => ({ ...prev, term: preSelectedTerm }));
    }
    const savedTeacher =
      localStorage.getItem('teacherName') ||
      localStorage.getItem('userName') ||
      '';
    const savedEmail =
      localStorage.getItem('userEmail') ||
      localStorage.getItem('teacherEmail') ||
      '';
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

  const handleAnswerSelect = (index, isAcceptable) => {
    const nextAnswers = [...answers];
    nextAnswers[index] = isAcceptable;
    setAnswers(nextAnswers);
  };

  // Score count = acceptable answers only
  const acceptableCount = answers.filter((a) => a === true).length;
  const notAcceptableCount = answers.filter((a) => a === false).length;
  const answeredCount = answers.filter((a) => a !== null).length;
  const currentResult = calculateListeningLevel(acceptableCount, selectedStage);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.studentName.trim()) {
      toast.error('Please enter the student name.');
      return;
    }
    if (!formData.email.trim()) {
      toast.error('Please enter the assessor/student email.');
      return;
    }
    if (answeredCount < FS1_QUESTIONS.length) {
      toast.error(`Please assess all 10 questions. (${answeredCount}/10 completed)`);
      return;
    }

    setLoading(true);
    const assessmentType =
      selectedStage === 'KG2 / Year 1'
        ? 'KG2 / Year 1 Listening Assessment'
        : selectedStage === 'FS2 - KG1'
        ? 'FS2 - KG1 Listening Assessment'
        : 'FS1 Listening Assessment';

    try {
      const payload = {
        assessmentType,
        yearGroupType: 'junior',
        email: formData.email,
        studentName: formData.studentName,
        yearGroupAndClass: formData.yearGroupAndClass || selectedStage,
        teacherName: formData.teacherName,
        term: formData.term,
        totalScore: acceptableCount,
        cefrLevel: currentResult.level,
        level: currentResult.level,
        listeningAssessmentAnswers: answers.map((isAcc, idx) => ({
          questionId: idx + 1,
          question: FS1_QUESTIONS[idx].text,
          score: isAcc ? 1 : 0,
          acceptable: isAcc,
          notes: questionNotes[idx] || '',
        })),
        notes: currentResult.notes,
      };

      await assessmentAPI.createAssessment(payload);
      toast.success(`${assessmentType} saved successfully! (${currentResult.level})`);

      // Navigate back to assessments selector
      setTimeout(() => {
        navigate('/assessments?tier=primary');
      }, 1500);
    } catch (err) {
      console.error('Submission error:', err);
      toast.error(`Failed to save: ${err.message || 'Error occurred'}`);
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
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Back to Assessments
          </Link>

          {/* Stage Selector (FS1, FS2 - KG1, KG2 / Year 1) */}
          <div className="inline-flex bg-slate-200/90 p-1.5 rounded-2xl shadow-inner gap-1 flex-wrap self-start sm:self-auto">
            <button
              type="button"
              onClick={() => handleStageSwitch('FS1')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 ${
                selectedStage === 'FS1'
                  ? 'bg-white text-cyan-700 shadow-sm scale-[1.02]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/50'
              }`}
            >
              <span>🌸 FS1</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                selectedStage === 'FS1' ? 'bg-cyan-100 text-cyan-800' : 'bg-slate-300 text-slate-700'
              }`}>
                Nursery
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleStageSwitch('FS2 - KG1')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 ${
                selectedStage === 'FS2 - KG1'
                  ? 'bg-white text-cyan-700 shadow-sm scale-[1.02]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/50'
              }`}
            >
              <span>🌼 FS2 - KG1</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                selectedStage === 'FS2 - KG1' ? 'bg-cyan-100 text-cyan-800' : 'bg-slate-300 text-slate-700'
              }`}>
                Reception
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleStageSwitch('KG2 / Year 1')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 ${
                selectedStage === 'KG2 / Year 1'
                  ? 'bg-white text-cyan-700 shadow-sm scale-[1.02]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/50'
              }`}
            >
              <span>🎒 KG2 / Year 1</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                selectedStage === 'KG2 / Year 1' ? 'bg-cyan-100 text-cyan-800' : 'bg-slate-300 text-slate-700'
              }`}>
                Year 1
              </span>
            </button>
          </div>
        </div>

        {/* Title Header Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-cyan-500 via-sky-500 to-cyan-600" />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-black uppercase tracking-widest text-cyan-600">
                  Primary Assessment · Listening
                </span>
                <span className="text-slate-300 font-bold">•</span>
                <span className="text-xs font-extrabold text-slate-500">
                  {selectedStage}
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mt-1">
                {selectedStage} Listening Assessment
              </h1>
              <p className="text-slate-500 text-sm mt-2 max-w-2xl">
                {selectedStage === 'KG2 / Year 1'
                  ? 'One-to-one auditory and personal question evaluation for KG2 / Year 1 students with CEFR level mapping.'
                  : selectedStage === 'FS2 - KG1'
                  ? 'One-to-one auditory and comprehension evaluation for FS2 - KG1 pupils.'
                  : 'One-to-one early auditory evaluation for Foundation Stage 1 students.'}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 self-start md:self-auto">
              <button
                type="button"
                onClick={() => setShowSheetModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-cyan-50 hover:bg-cyan-100 text-cyan-700 font-bold text-xs border border-cyan-200 transition-colors shadow-2xs"
              >
                <svg className="w-4 h-4 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
                View Printable Sheet
              </button>

              {/* Live Score Floating Badge */}
              <div className="bg-cyan-50 border-2 border-cyan-200 rounded-2xl p-4 flex items-center gap-4 shadow-xs">
                <div className="text-center">
                  <span className="text-[10px] font-black text-cyan-700 uppercase tracking-wider block">
                    Acceptable Score
                  </span>
                  <span className="text-3xl font-black text-cyan-900">
                    {acceptableCount} <span className="text-sm text-cyan-600 font-bold">/ 10</span>
                  </span>
                </div>
                <div className="h-10 w-px bg-cyan-200" />
                <div>
                  <span className="text-[10px] font-black text-cyan-700 uppercase tracking-wider block">
                    Current Level
                  </span>
                  <span className="inline-block px-2.5 py-0.5 mt-0.5 rounded-lg text-xs font-black bg-cyan-600 text-white shadow-2xs">
                    {currentResult.level}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Instructions for assessor box (100% exact copy from image 1) */}
          <div className="mt-6 p-5 bg-slate-50 border border-slate-200 rounded-2xl">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2 mb-2">
              <svg className="w-4 h-4 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
              </svg>
              Instructions for assessor:
            </h3>
            <ul className="space-y-1.5 text-xs text-slate-600 font-medium list-disc list-inside">
              <li>Ask each question once only.</li>
              <li>Accept the first answer given (1–3 words are acceptable if relevant).</li>
              <li>Do not probe further.</li>
              <li>Record Yes/No depending on whether the student gave a competent/comprehensible response.</li>
            </ul>
          </div>
        </div>

        {/* Assessment Form */}
        <form onSubmit={handleSubmit} className="space-y-8">

          {/* Student & Assessor Info */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
            <h2 className="text-base font-black text-slate-900 mb-6 flex items-center gap-2">
              <span className="w-7 h-7 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-extrabold">1</span>
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
                  className="w-full bg-slate-50 border border-slate-200 focus:border-cyan-500 focus:bg-white rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 transition-all focus:outline-none focus:ring-4 focus:ring-cyan-100"
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
                  className="w-full bg-slate-50 border border-slate-200 focus:border-cyan-500 focus:bg-white rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 transition-all focus:outline-none focus:ring-4 focus:ring-cyan-100"
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
                  className="w-full bg-slate-50 border border-slate-200 focus:border-cyan-500 focus:bg-white rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 transition-all focus:outline-none focus:ring-4 focus:ring-cyan-100"
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
                  className="w-full bg-slate-50 border border-slate-200 focus:border-cyan-500 focus:bg-white rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 transition-all focus:outline-none focus:ring-4 focus:ring-cyan-100"
                >
                  <option value="T1">Term 1 (T1)</option>
                  <option value="T2">Term 2 (T2)</option>
                  <option value="T3">Term 3 (T3)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Assessment Questions Table (Image 1) */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center text-xs font-extrabold">2</span>
                  Questions Evaluation
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Ask each question once. Select whether the student response is <strong>Acceptable</strong> or <strong>Not acceptable</strong>.
                </p>
              </div>

              <div className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl self-start sm:self-auto">
                Completed: <span className="font-extrabold text-slate-900">{answeredCount}</span> of 10
              </div>
            </div>

            {/* Questions Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse border border-slate-200 rounded-2xl overflow-hidden">
                <thead>
                  <tr className="bg-slate-100/80 text-slate-800 text-xs font-black uppercase tracking-wider border-b border-slate-200">
                    <th className="py-3.5 px-4 w-12 text-center">#</th>
                    <th className="py-3.5 px-4">Questions</th>
                    <th className="py-3.5 px-4 w-40 text-center bg-emerald-50/70 border-x border-slate-200 text-emerald-900">
                      Acceptable
                    </th>
                    <th className="py-3.5 px-4 w-44 text-center bg-rose-50/70 text-rose-900">
                      Not acceptable
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-sm">
                  {FS1_QUESTIONS.map((q, idx) => {
                    const isAcceptable = answers[idx] === true;
                    const isNotAcceptable = answers[idx] === false;

                    return (
                      <tr 
                        key={q.id}
                        className={`transition-colors ${
                          isAcceptable 
                            ? 'bg-emerald-50/20' 
                            : isNotAcceptable 
                            ? 'bg-rose-50/20' 
                            : 'hover:bg-slate-50/80'
                        }`}
                      >
                        {/* Number */}
                        <td className="py-4 px-4 text-center font-bold text-slate-500 text-xs">
                          {q.id}
                        </td>

                        {/* Question Text */}
                        <td className="py-4 px-4 font-bold text-slate-800">
                          <div className="text-sm font-extrabold">{q.text}</div>
                        </td>

                        {/* Acceptable Option */}
                        <td className="py-3 px-4 text-center border-x border-slate-200">
                          <button
                            type="button"
                            onClick={() => handleAnswerSelect(idx, true)}
                            className={`w-full py-2.5 px-3 rounded-xl font-extrabold text-xs transition-all duration-200 flex items-center justify-center gap-1.5 ${
                              isAcceptable
                                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 scale-[1.02]'
                                : 'bg-slate-100 text-slate-600 hover:bg-emerald-100 hover:text-emerald-800'
                            }`}
                          >
                            <span>✓</span>
                            <span>Acceptable</span>
                          </button>
                        </td>

                        {/* Not Acceptable Option */}
                        <td className="py-3 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => handleAnswerSelect(idx, false)}
                            className={`w-full py-2.5 px-3 rounded-xl font-extrabold text-xs transition-all duration-200 flex items-center justify-center gap-1.5 ${
                              isNotAcceptable
                                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30 scale-[1.02]'
                                : 'bg-slate-100 text-slate-600 hover:bg-rose-100 hover:text-rose-800'
                            }`}
                          >
                            <span>✗</span>
                            <span>Not acceptable</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Quick Answer Helpers */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  Acceptable: <strong className="text-slate-800">{acceptableCount}</strong>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                  Not acceptable: <strong className="text-slate-800">{notAcceptableCount}</strong>
                </span>
              </div>
              <button
                type="button"
                onClick={() => setAnswers(Array(FS1_QUESTIONS.length).fill(true))}
                className="text-amber-700 hover:text-amber-800 font-bold underline"
              >
                Mark all acceptable
              </button>
            </div>
          </div>

          {/* Rubric and Level Result (Image 2) */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center text-xs font-extrabold">3</span>
                  Score Rubric & Proficiency Band
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Automatic proficiency mapping based on acceptable responses count.
                </p>
              </div>

              {/* Current Calculated Outcome */}
              <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-2xl">
                <span className="text-xs font-extrabold text-slate-500">Result:</span>
                <span className="text-sm font-black text-blue-700">
                  {currentResult.level}
                </span>
                <span className="text-xs text-slate-400">|</span>
                <span className="text-xs font-bold text-slate-600 truncate max-w-[200px]">
                  {currentResult.notes}
                </span>
              </div>
            </div>

            {/* Rubric Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse border border-slate-200 rounded-2xl overflow-hidden text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-black uppercase tracking-wider border-b border-slate-200">
                    <th className="py-3 px-4 w-44">
                      Score Range <span className="block text-[10px] font-medium text-slate-500 normal-case">(Count acceptable column only)</span>
                    </th>
                    <th className="py-3 px-4 w-32">Level</th>
                    <th className="py-3 px-4">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-700">
                  {(selectedStage === 'KG2 / Year 1' ? KG2_RUBRIC_BANDS : RUBRIC_BANDS).map((r, i) => {
                    const isCurrentBand = currentResult.level === r.level;

                    return (
                      <tr
                        key={i}
                        className={`transition-colors ${
                          isCurrentBand 
                            ? `${r.highlightBorder} font-extrabold shadow-inner` 
                            : 'hover:bg-slate-50/80'
                        }`}
                      >
                        <td className="py-3 px-4 font-mono font-bold">
                          <div className="flex items-center gap-2">
                            {isCurrentBand && (
                              <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
                            )}
                            <span>{r.range}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-block px-2.5 py-1 rounded-lg font-black text-xs ${
                            isCurrentBand ? r.badgeColor + ' shadow-2xs' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {r.level}
                          </span>
                        </td>
                        <td className="py-3 px-4 leading-relaxed font-medium">
                          {r.notes}
                        </td>
                      </tr>
                    );
                  })}

                  {/* Key Words Row (Image 2) */}
                  <tr className="bg-slate-50/80 border-t-2 border-slate-300">
                    <td className="py-4 px-4 font-black text-slate-800">
                      Key words
                    </td>
                    <td colSpan={2} className="py-4 px-4">
                      <div className="flex flex-wrap gap-1.5">
                        {KEY_WORDS.map((kw, kIdx) => (
                          <span
                            key={kIdx}
                            className="bg-white border border-slate-200 text-slate-700 px-2 py-0.5 rounded-md font-mono text-[11px]"
                          >
                            {kw}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Submission Bar */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-500 font-medium">
              Ready to submit: <strong className="text-slate-800">{answeredCount}/10</strong> questions evaluated.
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => navigate('/assessments?tier=primary')}
                className="w-1/2 sm:w-auto px-5 py-3 rounded-2xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-1/2 sm:w-auto px-8 py-3 rounded-2xl bg-cyan-600 hover:bg-cyan-700 text-white font-extrabold text-xs shadow-lg shadow-cyan-600/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <span>Submit {selectedStage} Assessment</span>
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
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-cyan-50">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-500"></span>
                <h3 className="font-black text-slate-800 text-sm uppercase tracking-wider">
                  {selectedStage} Listening Assessment · Original Document
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
                src={
                  selectedStage === 'KG2 / Year 1'
                    ? kg2Sheet
                    : selectedStage === 'FS2 - KG1'
                    ? fs2Sheet
                    : fs1Sheet
                }
                alt={`${selectedStage} Listening Assessment Document`}
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

