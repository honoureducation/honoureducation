import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { assessmentAPI } from '../services/api';

import henImg from '../assets/cvc/cvc-hen.jpg';
import dogImg from '../assets/cvc/cvc-dog.jpg';
import sitImg from '../assets/cvc/cvc-sit.jpg';
import webImg from '../assets/cvc/cvc-web.jpg';
import bugImg from '../assets/cvc/cvc-bug.jpg';
import sunImg from '../assets/cvc/cvc-sun.jpg';
import sheetImg from '../assets/fs1-reading-sheet.jpg';
import fs2ReadingSheet from '../assets/fs2-reading-sheet.jpg';
import kg2ReadingSheet from '../assets/kg2-reading-sheet.png';

// ==========================================
// 6 CVC WORDS & PICTURES (FS1 & FS2 READING)
// ==========================================
const READING_ITEMS = [
  { id: 1, word: 'hen', letters: ['h', 'e', 'n'], image: henImg, label: 'Hen with chicks' },
  { id: 2, word: 'dog', letters: ['d', 'o', 'g'], image: dogImg, label: 'Dog in dugout' },
  { id: 3, word: 'sit', letters: ['s', 'i', 't'], image: sitImg, label: 'Boy sitting on chair' },
  { id: 4, word: 'web', letters: ['w', 'e', 'b'], image: webImg, label: 'Spider on cobweb' },
  { id: 5, word: 'bug', letters: ['b', 'u', 'g'], image: bugImg, label: 'Ladybug / beetle' },
  { id: 6, word: 'sun', letters: ['s', 'u', 'n'], image: sunImg, label: 'Smiling yellow sun' },
];

// ==========================================
// 5 READING PASSAGES (KG2 / YEAR 1 READING)
// ==========================================
const KG2_READING_PASSAGES = [
  {
    id: 1,
    box: 'Text 1',
    passage: 'Sit on the mat. Pat the big dog. A red cup in the bag.',
    hint: 'Short a, i, o, u · CVC decodable sentences',
  },
  {
    id: 2,
    box: 'Text 2',
    passage: 'Ten cats on a log. A kid ran in the sun. The bug is in the mud.',
    hint: 'Short vowels · Initial and final consonant blending',
  },
  {
    id: 3,
    box: 'Text 3',
    passage: 'Get the pen and pad. A dog digs in the pit. The cat sat on the bed.',
    hint: 'Decodable phrasing · Basic sentence punctuation',
  },
  {
    id: 4,
    box: 'Text 4',
    passage: 'A hot pan of jam. Mum has a red hat. Sam is in the van.',
    hint: 'CVC words · Common sight words (has, the, of, is)',
  },
  {
    id: 5,
    box: 'Text 5',
    passage: 'Pick up the sock. Six frogs jump in. That pet can win.',
    hint: 'Digraph -ck · CCVC/CVCC blending (frogs, jump)',
  },
];

// ==========================================
// CEFR RUBRIC TABLE FOR FS1 & FS2 READING
// ==========================================
const READING_RUBRIC_LEVELS = [
  {
    level: 'Pre-A1',
    description: 'Recognises some sounds with support but cannot blend them into words. Relies on pictures or adult prompting. May repeat single sounds but does not read CVC words independently.',
    badgeBg: 'bg-rose-100 text-rose-800 border-rose-200',
    activeBg: 'bg-rose-50 border-rose-400 text-rose-900',
  },
  {
    level: 'A1.0–A1.2',
    description: 'Majority mistakes. Missing initial sound recognition. Cannot blend Phase 2 CVC words securely.',
    badgeBg: 'bg-orange-100 text-orange-800 border-orange-200',
    activeBg: 'bg-orange-50 border-orange-400 text-orange-900',
  },
  {
    level: 'A2.0–A2.2',
    description: 'Makes over 5 mistakes per line. Misses digraphs ("special friends") and Phase 2 sounds.',
    badgeBg: 'bg-amber-100 text-amber-800 border-amber-200',
    activeBg: 'bg-amber-50 border-amber-400 text-amber-900',
  },
  {
    level: 'A2.3–B1.1',
    description: 'Makes 3–4 mistakes per line. Mis-sounds Phase 1/2 graphemes. Insecure blending.',
    badgeBg: 'bg-blue-100 text-blue-800 border-blue-200',
    activeBg: 'bg-blue-50 border-blue-400 text-blue-900',
  },
  {
    level: 'B1.2–B1.3',
    description: 'Makes 1–2 mistakes per line. Recognises Phase 1, 2, and some Phase 3 sounds. Developing fluency.',
    badgeBg: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    activeBg: 'bg-indigo-50 border-indigo-400 text-indigo-900',
  },
  {
    level: 'B2–C1',
    description: 'Makes no mistakes. Reads fluently and confidently with secure blending.',
    badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    activeBg: 'bg-emerald-50 border-emerald-400 text-emerald-900',
  },
];

// ==========================================
// CEFR RUBRIC TABLE FOR KG2 / YEAR 1 READING
// ==========================================
const KG2_READING_RUBRIC = [
  {
    level: 'A1.0–A1.2',
    description: 'Majority mistakes. Missing initial sound recognition. Cannot blend Phase 2 CVC words securely.',
    badgeBg: 'bg-orange-100 text-orange-800 border-orange-200',
    activeBg: 'bg-orange-50 border-orange-400 text-orange-900',
  },
  {
    level: 'A2.0–A2.2',
    description: 'Makes over 5 mistakes per line. Misses digraphs ("special friends") and Phase 2 sounds.',
    badgeBg: 'bg-amber-100 text-amber-800 border-amber-200',
    activeBg: 'bg-amber-50 border-amber-400 text-amber-900',
  },
  {
    level: 'A2.3–B1.1',
    description: 'Makes 3–4 mistakes per line. Mis-sounds Phase 1/2 graphemes. Insecure blending.',
    badgeBg: 'bg-blue-100 text-blue-800 border-blue-200',
    activeBg: 'bg-blue-50 border-blue-400 text-blue-900',
  },
  {
    level: 'B1.2–B1.3',
    description: 'Makes 1–2 mistakes per line. Recognises Phase 1, 2 and some Phase 3 sounds. Developing fluency.',
    badgeBg: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    activeBg: 'bg-indigo-50 border-indigo-400 text-indigo-900',
  },
  {
    level: 'B2–C1',
    description: 'Makes no mistakes. Reads fluently and confidently with secure blending.',
    badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    activeBg: 'bg-emerald-50 border-emerald-400 text-emerald-900',
  },
];

const KEY_WORDS = [
  'hen', 'dog', 'sit', 'web', 'bug', 'ladybird', 'cobweb', 'sun', 
  'chicken', 'boy', 'chair', 'spider', 'red', 'yellow'
];

export default function PrimaryReadingAssessmentForm() {
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

  // Form Details
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

  // Observations per CVC word (FS1 & FS2)
  const [itemStatuses, setItemStatuses] = useState(Array(READING_ITEMS.length).fill(null));
  const [itemNotes, setItemNotes] = useState(Array(READING_ITEMS.length).fill(''));
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [usedKeywords, setUsedKeywords] = useState([]);
  const [teachingFocusNotes, setTeachingFocusNotes] = useState('');
  const [loading, setLoading] = useState(false);

  // KG2 / Year 1 State
  const [passageStatuses, setPassageStatuses] = useState(Array(KG2_READING_PASSAGES.length).fill(null));
  const [passageNotes, setPassageNotes] = useState(Array(KG2_READING_PASSAGES.length).fill(''));
  const [kg2Accuracy, setKg2Accuracy] = useState('10');
  const [kg2Fluency, setKg2Fluency] = useState('Smooth');
  const [kg2Comments, setKg2Comments] = useState('');

  const activeRubric = selectedStage === 'KG2 / Year 1' ? KG2_READING_RUBRIC : READING_RUBRIC_LEVELS;
  const activeSheet =
    selectedStage === 'KG2 / Year 1'
      ? kg2ReadingSheet
      : selectedStage === 'FS2 - KG1'
      ? fs2ReadingSheet
      : sheetImg;

  useEffect(() => {
    if (preSelectedTerm) {
      setFormData(prev => ({ ...prev, term: preSelectedTerm }));
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
      setFormData(prev => ({
        ...prev,
        teacherName: prev.teacherName || savedTeacher,
        email: prev.email || savedEmail,
      }));
    }
  }, [preSelectedTerm]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleStatusChange = (index, status) => {
    const nextStatuses = [...itemStatuses];
    nextStatuses[index] = status;
    setItemStatuses(nextStatuses);
  };

  const handleItemNoteChange = (index, value) => {
    const nextNotes = [...itemNotes];
    nextNotes[index] = value;
    setItemNotes(nextNotes);
  };

  const handlePassageStatusChange = (index, status) => {
    const next = [...passageStatuses];
    next[index] = status;
    setPassageStatuses(next);
  };

  const handlePassageNoteChange = (index, value) => {
    const next = [...passageNotes];
    next[index] = value;
    setPassageNotes(next);
  };

  const toggleKeyword = (word) => {
    setUsedKeywords(prev => 
      prev.includes(word) ? prev.filter(w => w !== word) : [...prev, word]
    );
  };

  const fluentCount = itemStatuses.filter(s => s === 'fluent').length;
  const supportCount = itemStatuses.filter(s => s === 'support').length;
  const errorCount = itemStatuses.filter(s => s === 'error').length;
  const evaluatedCount = itemStatuses.filter(s => s !== null).length;

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
    if (!selectedLevel) {
      toast.error('Please select the evaluated CEFR Level from the rubric table.');
      return;
    }

    setLoading(true);
    const assessmentType =
      selectedStage === 'KG2 / Year 1'
        ? 'KG2 / Year 1 Reading Assessment'
        : selectedStage === 'FS2 - KG1'
        ? 'FS2 - KG1 Reading Assessment'
        : 'FS1 Reading Assessment';

    try {
      const selectedRubric = activeRubric.find(r => r.level === selectedLevel);

      const payload = {
        assessmentType,
        yearGroupType: 'junior',
        email: formData.email,
        studentName: formData.studentName,
        yearGroupAndClass: formData.yearGroupAndClass,
        teacherName: formData.teacherName,
        term: formData.term,
        readingScore: selectedLevel,
        cefrLevel: selectedLevel,
        level: selectedLevel,
        totalScore:
          selectedStage === 'KG2 / Year 1'
            ? parseInt(kg2Accuracy, 10) || (activeRubric.findIndex(r => r.level === selectedLevel) + 1)
            : activeRubric.findIndex(r => r.level === selectedLevel) + 1,
        itemsEvaluated:
          selectedStage === 'KG2 / Year 1'
            ? KG2_READING_PASSAGES.map((p, idx) => ({
                word: p.box,
                status: passageStatuses[idx] || 'evaluated',
                notes: passageNotes[idx] || p.passage,
              }))
            : READING_ITEMS.map((item, idx) => ({
                word: item.word,
                status: itemStatuses[idx] || 'unassessed',
                notes: itemNotes[idx] || '',
              })),
        teachingFocus:
          selectedStage === 'KG2 / Year 1'
            ? `Accuracy: ${kg2Accuracy}/10 | Fluency: ${kg2Fluency} | Comments: ${kg2Comments}`
            : teachingFocusNotes,
        keywordsIdentified: usedKeywords,
        notes:
          selectedStage === 'KG2 / Year 1'
            ? `${selectedRubric?.description || ''}. Accuracy: ${kg2Accuracy}/10, Fluency: ${kg2Fluency}. Comments: ${kg2Comments}`
            : selectedRubric?.description || '',
      };

      await assessmentAPI.createAssessment(payload);
      toast.success(`${assessmentType} saved successfully! (${selectedLevel})`);
      
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
                  ? 'bg-white text-emerald-700 shadow-sm scale-[1.02]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/50'
              }`}
            >
              <span>🌸 FS1</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                selectedStage === 'FS1' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-300 text-slate-700'
              }`}>
                Nursery
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleStageSwitch('FS2 - KG1')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 ${
                selectedStage === 'FS2 - KG1'
                  ? 'bg-white text-emerald-700 shadow-sm scale-[1.02]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/50'
              }`}
            >
              <span>🌼 FS2 - KG1</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                selectedStage === 'FS2 - KG1' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-300 text-slate-700'
              }`}>
                Reception
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleStageSwitch('KG2 / Year 1')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 ${
                selectedStage === 'KG2 / Year 1'
                  ? 'bg-white text-emerald-700 shadow-sm scale-[1.02]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/50'
              }`}
            >
              <span>🎓 KG2 / Year 1</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                selectedStage === 'KG2 / Year 1' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-300 text-slate-700'
              }`}>
                Year 1
              </span>
            </button>
          </div>
        </div>

        {/* Title Header Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-green-600" />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-black uppercase tracking-widest text-emerald-600">
                  Primary Assessment · Reading
                </span>
                <span className="text-slate-300 font-bold">•</span>
                <span className="text-xs font-extrabold text-slate-500">
                  {selectedStage}
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mt-1">
                {selectedStage} Reading Assessment
              </h1>
              <p className="text-slate-500 text-sm mt-2 max-w-2xl">
                {selectedStage === 'KG2 / Year 1'
                  ? '5 reading passages with oral decoding, 1-minute passage timing, accuracy (/10), and fluency assessment.'
                  : selectedStage === 'FS2 - KG1'
                  ? 'Phase 2 CVC blending and phonics decoding evaluation for FS2 - KG1 pupils.'
                  : 'Phase 2 CVC blending and phonics decoding evaluation for Foundation Stage 1 students.'}
              </p>
            </div>

            {/* Evaluated Level Box */}
            <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-4 flex items-center gap-4 self-start md:self-auto shadow-xs">
              <div>
                <span className="text-[10px] font-black text-emerald-700 uppercase tracking-wider block">
                  Evaluated Level
                </span>
                <span className={`inline-block px-3 py-1 mt-1 rounded-xl text-sm font-black ${
                  selectedLevel ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-200 text-slate-600'
                }`}>
                  {selectedLevel || 'Not Selected'}
                </span>
              </div>
            </div>
          </div>

          {/* Instructions for assessor box */}
          <div className="mt-6 p-5 bg-slate-50 border border-slate-200 rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                </svg>
                Instructions for assessor:
              </h3>
              <button
                type="button"
                onClick={() => setShowSheetModal(true)}
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 underline"
              >
                View Printable Sheet ↗
              </button>
            </div>
            {selectedStage === 'KG2 / Year 1' ? (
              <ul className="space-y-1.5 text-xs text-slate-600 font-medium list-disc list-inside">
                <li>Present one text box at a time.</li>
                <li>Say: <em>"Read this text out loud. Take your time."</em></li>
                <li>Allow 1 minute per text. Stop if the child struggles to read and move to phonics assessments.</li>
                <li>Use Teacher Notes below to record accuracy (/10), fluency, and comments.</li>
              </ul>
            ) : (
              <ul className="space-y-1.5 text-xs text-slate-600 font-medium list-disc list-inside">
                <li>Point to each picture and ask the child to say the word and sound it out.</li>
                <li>Record the child’s errors and blending attempts.</li>
                <li>Use the results to identify teaching focus (e.g., extra support on Phase 2 CVC blending, Phase 3 digraphs, or fluency with tricky words)</li>
              </ul>
            )}
          </div>
        </div>

        {/* Printable Sheet Preview Modal */}
        {showSheetModal && (
          <div
            onClick={() => setShowSheetModal(false)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-xs cursor-pointer"
          >
            <div className="bg-white rounded-3xl p-4 max-w-2xl w-full shadow-2xl relative" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-black text-slate-800">{selectedStage} Reading Assessment Sheet</h3>
                <button
                  onClick={() => setShowSheetModal(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold flex items-center justify-center"
                >
                  ✕
                </button>
              </div>
              <img
                src={activeSheet}
                alt={`${selectedStage} Reading Assessment Sheet`}
                className="w-full max-h-[75vh] object-contain rounded-2xl border"
              />
            </div>
          </div>
        )}

        {/* Assessment Form */}
        <form onSubmit={handleSubmit} className="space-y-8">

          {/* Student & Assessor Details */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
            <h2 className="text-base font-black text-slate-900 mb-6 flex items-center gap-2">
              <span className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-extrabold">1</span>
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
                  className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 transition-all focus:outline-none focus:ring-4 focus:ring-emerald-100"
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
                  className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 transition-all focus:outline-none focus:ring-4 focus:ring-emerald-100"
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
                  className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 transition-all focus:outline-none focus:ring-4 focus:ring-emerald-100"
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
                  className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 transition-all focus:outline-none focus:ring-4 focus:ring-emerald-100"
                >
                  <option value="T1">Term 1 (T1)</option>
                  <option value="T2">Term 2 (T2)</option>
                  <option value="T3">Term 3 (T3)</option>
                </select>
              </div>
            </div>
          </div>

          {selectedStage === 'KG2 / Year 1' ? (
            /* KG2 / Year 1 Reading Passages (5 Text Boxes from Image) */
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
                <div>
                  <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <span className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-extrabold">2</span>
                    Reading Passages (5 Texts · 1 Minute per text)
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Present one text box at a time. Pupil reads aloud. Stop if the child struggles to read and move to phonics assessments.
                  </p>
                </div>
                <div className="text-xs font-semibold text-slate-500 bg-slate-50 px-3.5 py-1.5 rounded-xl border border-slate-200 self-start sm:self-auto">
                  5 Texts Evaluated
                </div>
              </div>

              {/* 5 Text Passages List */}
              <div className="space-y-4">
                {KG2_READING_PASSAGES.map((item, idx) => {
                  const status = passageStatuses[idx];

                  return (
                    <div
                      key={item.id}
                      className={`rounded-2xl border-2 p-5 transition-all ${
                        status === 'accurate'
                          ? 'border-emerald-500 bg-emerald-50/30 shadow-xs'
                          : status === 'hesitant'
                          ? 'border-amber-400 bg-amber-50/30'
                          : status === 'struggled'
                          ? 'border-rose-400 bg-rose-50/30'
                          : 'border-slate-200 bg-slate-50/50 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
                        <div className="flex items-center gap-2.5">
                          <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-black uppercase rounded-lg">
                            {item.box}
                          </span>
                          <span className="text-[11px] font-semibold text-slate-400">
                            {item.hint}
                          </span>
                        </div>

                        {/* Quick Marking Buttons */}
                        <div className="flex items-center gap-2 text-xs font-bold self-start md:self-auto">
                          <button
                            type="button"
                            onClick={() => handlePassageStatusChange(idx, 'accurate')}
                            className={`px-3 py-1.5 rounded-xl transition-all ${
                              status === 'accurate'
                                ? 'bg-emerald-600 text-white font-black shadow-xs'
                                : 'bg-white border border-slate-200 text-slate-700 hover:bg-emerald-50 hover:text-emerald-800'
                            }`}
                          >
                            ✓ Accurate
                          </button>
                          <button
                            type="button"
                            onClick={() => handlePassageStatusChange(idx, 'hesitant')}
                            className={`px-3 py-1.5 rounded-xl transition-all ${
                              status === 'hesitant'
                                ? 'bg-amber-500 text-white font-black shadow-xs'
                                : 'bg-white border border-slate-200 text-slate-700 hover:bg-amber-50 hover:text-amber-800'
                            }`}
                          >
                            ~ Hesitation / Errors
                          </button>
                          <button
                            type="button"
                            onClick={() => handlePassageStatusChange(idx, 'struggled')}
                            className={`px-3 py-1.5 rounded-xl transition-all ${
                              status === 'struggled'
                                ? 'bg-rose-500 text-white font-black shadow-xs'
                                : 'bg-white border border-slate-200 text-slate-700 hover:bg-rose-50 hover:text-rose-800'
                            }`}
                          >
                            ✗ Struggled / Stop
                          </button>
                        </div>
                      </div>

                      {/* The Reading Passage Text (Large, crisp, readable) */}
                      <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-inner">
                        <p className="font-serif text-lg md:text-xl font-bold text-slate-900 tracking-wide leading-relaxed">
                          {item.passage}
                        </p>
                      </div>

                      {/* Passage Observation Input */}
                      <div className="mt-3">
                        <input
                          type="text"
                          value={passageNotes[idx]}
                          onChange={(e) => handlePassageNoteChange(idx, e.target.value)}
                          placeholder="Passage notes (e.g., mispronounced 'mud', paused at 'frogs')..."
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Teacher Notes Box (Exact from official KG2 / Year 1 sheet) */}
              <div className="mt-6 p-6 bg-slate-50 border-2 border-slate-200 rounded-3xl space-y-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                    Teacher Notes (From Assessment Sheet)
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Accuracy */}
                  <div className="bg-white p-4 rounded-2xl border border-slate-200">
                    <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                      Accuracy Score <span className="text-slate-400 font-normal">(___ / 10)</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        max="10"
                        value={kg2Accuracy}
                        onChange={(e) => setKg2Accuracy(e.target.value)}
                        className="w-24 px-3.5 py-2 rounded-xl border border-slate-300 font-black text-base text-slate-900 text-center bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      <span className="text-xs font-bold text-slate-500">out of 10</span>
                    </div>
                  </div>

                  {/* Fluency */}
                  <div className="bg-white p-4 rounded-2xl border border-slate-200">
                    <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                      Fluency Level
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {['Smooth', 'Some hesitation', 'Many pauses'].map((fl) => (
                        <button
                          key={fl}
                          type="button"
                          onClick={() => setKg2Fluency(fl)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            kg2Fluency === fl
                              ? 'bg-emerald-600 text-white shadow-xs font-black'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          {fl}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Comments */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200">
                  <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                    Teacher Comments
                  </label>
                  <textarea
                    rows={2}
                    value={kg2Comments}
                    onChange={(e) => setKg2Comments(e.target.value)}
                    placeholder="Enter observation notes, mis-sounded phonemes, or blending confidence..."
                    className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-xl px-3.5 py-2 text-xs font-medium text-slate-800 transition-all focus:outline-none focus:ring-4 focus:ring-emerald-100"
                  />
                </div>
              </div>
            </div>
          ) : (
            /* 6 CVC Reading Word Cards (Image 1) */
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <span className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-extrabold">2</span>
                    Picture Prompt & CVC Reading Cards
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Point to each picture and ask the child to sound out and read each word.
                  </p>
                </div>

                <div className="flex items-center gap-3 text-xs font-semibold text-slate-600 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200">
                  <span>Evaluated: <strong className="text-slate-900">{evaluatedCount}/6</strong></span>
                  <span>•</span>
                  <span className="text-emerald-700 font-bold">✓ Fluent: {fluentCount}</span>
                  <span>•</span>
                  <span className="text-amber-700 font-bold">~ Support: {supportCount}</span>
                  <span>•</span>
                  <span className="text-rose-700 font-bold">✗ Errors: {errorCount}</span>
                </div>
              </div>

              {/* Grid of 6 CVC Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {READING_ITEMS.map((item, idx) => {
                  const status = itemStatuses[idx];

                  return (
                    <div
                      key={item.id}
                      className={`rounded-3xl border-2 p-5 transition-all flex flex-col justify-between ${
                        status === 'fluent'
                          ? 'border-emerald-500 bg-emerald-50/30 shadow-md'
                          : status === 'support'
                          ? 'border-amber-400 bg-amber-50/30'
                          : status === 'error'
                          ? 'border-rose-400 bg-rose-50/30'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div>
                        {/* Image Prompt */}
                        <div className="w-full h-36 bg-slate-100 rounded-2xl overflow-hidden mb-4 border border-slate-200 flex items-center justify-center p-2">
                          <img
                            src={item.image}
                            alt={item.word}
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>

                        {/* Spaced CVC word letters (e.g. h  e  n) */}
                        <div className="text-center mb-4">
                          <div className="flex items-center justify-center gap-3 font-mono text-3xl font-black text-slate-900 tracking-widest">
                            {item.letters.map((ltr, lIdx) => (
                              <span 
                                key={lIdx}
                                className="w-10 h-12 flex items-center justify-center rounded-xl bg-slate-50 border border-slate-200 shadow-2xs"
                              >
                                {ltr}
                              </span>
                            ))}
                          </div>
                          <span className="text-[11px] font-bold text-slate-400 mt-1.5 block">
                            Card {item.id}: {item.label}
                          </span>
                        </div>
                      </div>

                      {/* Assessor Observation Quick Buttons */}
                      <div className="space-y-2.5 pt-3 border-t border-slate-100">
                        <div className="grid grid-cols-3 gap-1.5 text-xs font-bold">
                          <button
                            type="button"
                            onClick={() => handleStatusChange(idx, 'fluent')}
                            className={`py-1.5 px-2 rounded-xl transition-all ${
                              status === 'fluent'
                                ? 'bg-emerald-600 text-white font-black shadow-xs'
                                : 'bg-slate-100 text-slate-600 hover:bg-emerald-100 hover:text-emerald-800'
                            }`}
                          >
                            ✓ Fluent
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(idx, 'support')}
                            className={`py-1.5 px-2 rounded-xl transition-all ${
                              status === 'support'
                                ? 'bg-amber-500 text-white font-black shadow-xs'
                                : 'bg-slate-100 text-slate-600 hover:bg-amber-100 hover:text-amber-800'
                            }`}
                          >
                            ~ Support
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(idx, 'error')}
                            className={`py-1.5 px-2 rounded-xl transition-all ${
                              status === 'error'
                                ? 'bg-rose-500 text-white font-black shadow-xs'
                                : 'bg-slate-100 text-slate-600 hover:bg-rose-100 hover:text-rose-800'
                            }`}
                          >
                            ✗ Error
                          </button>
                        </div>

                        {/* Blending / Mis-sound notes */}
                        <input
                          type="text"
                          value={itemNotes[idx]}
                          onChange={(e) => handleItemNoteChange(idx, e.target.value)}
                          placeholder="Sound errors / blending note..."
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-[11px] font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* CEFR Level Rubric Selection (Image 1) */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-extrabold">3</span>
                  CEFR Reading Rubric & Level Assignment
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Click on the row that reflects the student's reading accuracy and CVC blending capability.
                </p>
              </div>

              {selectedLevel && (
                <div className="bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-2xl flex items-center gap-2">
                  <span className="text-xs font-bold text-emerald-700">Assigned:</span>
                  <span className="text-xs font-black text-emerald-900 bg-white px-2 py-0.5 rounded-lg border border-emerald-200">
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
                            ? 'bg-emerald-50/90 font-extrabold border-l-4 border-l-emerald-600 shadow-2xs' 
                            : 'hover:bg-slate-50'
                        }`}
                      >
                        <td className="py-4 px-4 font-black">
                          <span className={`inline-block px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                            isSelected ? 'bg-emerald-600 text-white shadow-xs scale-105' : item.badgeBg
                          }`}>
                            {item.level}
                          </span>
                        </td>
                        <td className="py-4 px-4 leading-relaxed font-medium">
                          {item.description}
                        </td>
                        <td className="py-4 px-4 text-center">
                          <input
                            type="radio"
                            name="readingCefrRadio"
                            checked={isSelected}
                            onChange={() => setSelectedLevel(item.level)}
                            className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                          />
                        </td>
                      </tr>
                    );
                  })}

                  {/* Key Words Row */}
                  <tr className="bg-slate-50/90 border-t-2 border-slate-300">
                    <td className="py-4 px-4 font-black text-slate-800 align-top">
                      Key words
                    </td>
                    <td colSpan={2} className="py-4 px-4">
                      <p className="text-[11px] text-slate-500 font-semibold mb-2">
                        Mark words identified by the student:
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
                                  ? 'bg-emerald-600 text-white font-bold shadow-xs scale-105'
                                  : 'bg-white border border-slate-200 text-slate-700 hover:border-emerald-300'
                              }`}
                            >
                              {isUsed ? '✓ ' : ''}{word}
                            </button>
                          );
                        })}
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Teaching Focus Notes */}
            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                Teaching Focus & Next Steps
              </label>
              <textarea
                value={teachingFocusNotes}
                onChange={(e) => setTeachingFocusNotes(e.target.value)}
                rows={2}
                placeholder="Identify teaching focus (e.g., extra support on Phase 2 CVC blending, Phase 3 digraphs, or tricky word fluency)..."
                className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-800 transition-all focus:outline-none focus:ring-4 focus:ring-emerald-100"
              />
            </div>
          </div>

          {/* Submission Bar */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-500 font-medium">
              {selectedLevel ? (
                <span>Assigned Level: <strong className="text-emerald-700 font-black">{selectedLevel}</strong></span>
              ) : (
                <span className="text-rose-600 font-bold">Please select a CEFR level from the rubric table above</span>
              )}
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
                disabled={loading || !selectedLevel}
                className="w-1/2 sm:w-auto px-8 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <span>Submit {selectedStage} Reading</span>
                    <span>→</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
}

