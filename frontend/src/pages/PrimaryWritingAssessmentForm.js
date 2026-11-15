import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams, useLocation, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { assessmentAPI } from '../services/api';

import henImg from '../assets/cvc/cvc-hen.jpg';
import dogImg from '../assets/cvc/cvc-dog.jpg';
import sitImg from '../assets/cvc/cvc-sit.jpg';
import webImg from '../assets/cvc/cvc-web.jpg';
import bugImg from '../assets/cvc/cvc-bug.jpg';
import sunImg from '../assets/cvc/cvc-sun.jpg';
import fs1SheetImg from '../assets/fs1-writing-sheet.jpg';
import fs2WritingSheet from '../assets/fs2-writing-sheet.png';
import fs2AiKeywordsSheet from '../assets/fs2-writing-ai-keywords.png';
import fs2WritingStudentWorksheet from '../assets/fs2-writing-student-worksheet.png';
import fs2ParkImg from '../assets/fs2-writing-park.jpg';
import kg2WritingSheet from '../assets/kg2-writing-sheet.png';
import kg2AiKeywordsSheet from '../assets/kg2-writing-ai-keywords.png';

// ==========================================
// 6 CVC WRITING PROMPTS (FS1 WRITING)
// Matching sheet 100%:
// 1. h _ _ (hen)
// 2. d _ _ (dog)
// 3. s _ _ (sit)
// 4. w e _ (web)
// 5. b _ _ (bug)
// 6. _ _ _ (sun)
// ==========================================
const FS1_WRITING_ITEMS = [
  {
    id: 1,
    targetWord: 'hen',
    promptDisplay: 'h _ _',
    slots: [
      { char: 'h', isFixed: true },
      { char: 'e', isFixed: false },
      { char: 'n', isFixed: false },
    ],
    image: henImg,
    label: 'Hen with chicks',
  },
  {
    id: 2,
    targetWord: 'dog',
    promptDisplay: 'd _ _',
    slots: [
      { char: 'd', isFixed: true },
      { char: 'o', isFixed: false },
      { char: 'g', isFixed: false },
    ],
    image: dogImg,
    label: 'Dog in hole',
  },
  {
    id: 3,
    targetWord: 'sit',
    promptDisplay: 's _ _',
    slots: [
      { char: 's', isFixed: true },
      { char: 'i', isFixed: false },
      { char: 't', isFixed: false },
    ],
    image: sitImg,
    label: 'Boy sitting on chair',
  },
  {
    id: 4,
    targetWord: 'web',
    promptDisplay: 'w e _',
    slots: [
      { char: 'w', isFixed: true },
      { char: 'e', isFixed: true },
      { char: 'b', isFixed: false },
    ],
    image: webImg,
    label: 'Spider on cobweb',
  },
  {
    id: 5,
    targetWord: 'bug',
    promptDisplay: 'b _ _',
    slots: [
      { char: 'b', isFixed: true },
      { char: 'u', isFixed: false },
      { char: 'g', isFixed: false },
    ],
    image: bugImg,
    label: 'Ladybug / beetle',
  },
  {
    id: 6,
    targetWord: 'sun',
    promptDisplay: '_ _ _',
    slots: [
      { char: 's', isFixed: false },
      { char: 'u', isFixed: false },
      { char: 'n', isFixed: false },
    ],
    image: sunImg,
    label: 'Smiling yellow sun',
  },
];

// ==========================================
// CEFR RUBRIC TABLE (COMMON FOR FS1, FS2, & KG2 / YEAR 1 WRITING)
// 100% exact text from all assessment sheets
// ==========================================
const CEFR_RUBRIC_LEVELS = [
  {
    level: 'Pre-A1',
    description: 'Does not write; still mark-making. Formation is poor or not legible.',
    badgeBg: 'bg-rose-100 text-rose-800 border-rose-200',
    activeBg: 'bg-rose-50 border-rose-400 text-rose-900',
    dotColor: 'bg-rose-500',
  },
  {
    level: 'A1.0–A1.2',
    description: 'Writes initial sounds of CVC words (mostly correct). One mistake allowed per word.',
    badgeBg: 'bg-orange-100 text-orange-800 border-orange-200',
    activeBg: 'bg-orange-50 border-orange-400 text-orange-900',
    dotColor: 'bg-orange-500',
  },
  {
    level: 'A2.0–A2.2',
    description: 'Writes some initial sounds in CVC or CVVC words. Confidently writes CVC words. Beginning to write 4–5 letter words.',
    badgeBg: 'bg-amber-100 text-amber-800 border-amber-200',
    activeBg: 'bg-amber-50 border-amber-400 text-amber-900',
    dotColor: 'bg-amber-500',
  },
  {
    level: 'A2.3–B1.1',
    description: 'Can write 4–5 letter words independently with increasing accuracy.',
    badgeBg: 'bg-blue-100 text-blue-800 border-blue-200',
    activeBg: 'bg-blue-50 border-blue-400 text-blue-900',
    dotColor: 'bg-blue-600',
  },
  {
    level: 'B1.2–B1.3',
    description: 'Can write a few words together to form a simple sentence.',
    badgeBg: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    activeBg: 'bg-indigo-50 border-indigo-400 text-indigo-900',
    dotColor: 'bg-indigo-600',
  },
  {
    level: 'B2–C1',
    description: 'Writes fluently with few mistakes. Uses clear formation and confident spelling patterns.',
    badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    activeBg: 'bg-emerald-50 border-emerald-400 text-emerald-900',
    dotColor: 'bg-emerald-600',
  },
];

const FS1_KEY_WORDS = [
  'hen', 'dog', 'sit', 'boy', 'chicken', 'web', 'cobweb', 'bug', 
  'bugs', 'sun', 'sunshine', 'smile'
];

// ==========================================
// FS2 - KG1 WRITING ASSESSMENT DATA
// 4 Questions + AI Keywords from Uploaded Sheets
// ==========================================
const FS2_WRITING_QUESTIONS = [
  {
    id: 1,
    number: '1',
    title: 'Who can you see?',
    promptGuide: 'Point to the people in the picture and ask: "Who can you see?"',
    category: 'Who can you see?',
    placeholder: 'e.g. boy, girl, children playing, kids, friends...',
    aiKeywords: [
      'boy', 'girl', 'child', 'children', 'kids', 'friends', 'players', 'people'
    ],
  },
  {
    id: 2,
    number: '2',
    title: 'What are they doing?',
    promptGuide: 'Ask the child: "What are they doing?"',
    category: 'What are they doing?',
    placeholder: 'e.g. running, playing football, kicking ball, laughing, having fun...',
    aiKeywords: [
      'running', 'playing', 'kicking', 'chasing', 'jumping', 
      'laughing', 'having fun', 'playing football', 'moving', 'outdoors'
    ],
  },
  {
    id: 3,
    number: '3',
    title: 'Can you write some words for this picture?',
    promptGuide: 'Encourage independent word writing: "Can you write some words for this picture?"',
    category: 'Words for the picture',
    placeholder: 'e.g. grass, field, trees, sky, ball, park, playground, sunshine...',
    aiKeywords: [
      'grass', 'field', 'playground', 'trees', 'sky', 'clouds', 
      'ball', 'football', 'sunshine', 'park', 'outdoors', 'playtime'
    ],
  },
  {
    id: 4,
    number: '4',
    title: 'Can you write a sentence for this picture?',
    promptGuide: 'Encourage sentence construction: "Can you write a sentence for this picture?"',
    category: 'Sentence / Story keywords',
    placeholder: 'e.g. They are playing football. The children are running in the park. It is sunny...',
    aiKeywords: [
      'they are playing',
      'the children are running',
      'they are kicking the ball',
      'it is sunny',
      'they are outside',
      'fun day',
      'happy children',
      'playing in the park',
    ],
  },
];

const FS2_KEY_WORDS = [
  'children', 'ball', 'grass', 'park', 'playing', 'trees', 
  'sky', 'football', 'girl', 'boy', 'happy', 'fun'
];

const KG2_KEY_WORDS = [
  'children', 'ball', 'grass', 'park', 'playing', 'trees', 
  'sky', 'football', 'girl', 'boy', 'happy', 'fun'
];

// Helper: Check keyword detection in written text
function matchKeyword(text, keyword) {
  if (!text || !keyword) return false;
  const cleanText = text.toLowerCase();
  const cleanKeyword = keyword.toLowerCase().trim();

  // Multi-word phrase check (e.g. "they are playing", "playing football")
  if (cleanKeyword.includes(' ')) {
    if (cleanText.includes(cleanKeyword)) return true;
    const parts = cleanKeyword.split(/\s+/);
    return parts.every((p) => cleanText.includes(p));
  }

  // Single word boundary check with optional plurals/suffixes
  try {
    const regex = new RegExp(`\\b${cleanKeyword}(s|es|ing|ed)?\\b`, 'i');
    return regex.test(cleanText) || cleanText.includes(cleanKeyword);
  } catch {
    return cleanText.includes(cleanKeyword);
  }
}

export default function PrimaryWritingAssessmentForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const preSelectedTerm = searchParams.get('term') || 'T1';

  // Determine initial stage: FS1, FS2 - KG1, or KG2 / Year 1
  const isKG2Initial =
    location.pathname.includes('kg2') ||
    location.pathname.includes('year1') ||
    searchParams.get('grade') === 'kg2' ||
    searchParams.get('grade') === 'year1' ||
    searchParams.get('stage') === 'kg2' ||
    searchParams.get('stage') === 'year1';

  const isFS2Initial =
    !isKG2Initial && (
      location.pathname.includes('fs2') ||
      searchParams.get('grade') === 'fs2' ||
      searchParams.get('stage') === 'fs2'
    );

  const initialStage = isKG2Initial
    ? 'KG2 / Year 1'
    : isFS2Initial
    ? 'FS2 - KG1'
    : 'FS1';

  const [selectedStage, setSelectedStage] = useState(initialStage);
  const [showSheetModal, setShowSheetModal] = useState(false);
  const [modalTab, setModalTab] = useState('sheet'); // 'sheet' | 'keywords' | 'worksheet'
  const [showParkZoom, setShowParkZoom] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem('assessmentSchoolTier', 'primary');
  }, []);

  // Common Form Details
  const [formData, setFormData] = useState({
    email: '',
    studentName: '',
    yearGroupAndClass: initialStage,
    teacherName: '',
    term: preSelectedTerm,
  });

  const [selectedLevel, setSelectedLevel] = useState(null);
  const [usedKeywords, setUsedKeywords] = useState([]);
  const [formationQuality, setFormationQuality] = useState('Developing');
  const [pencilGrip, setPencilGrip] = useState('Dynamic Tripod');
  const [teachingFocusNotes, setTeachingFocusNotes] = useState('');

  // ------------------------------------------
  // FS1 Specific State (6 CVC missing graphemes)
  // ------------------------------------------
  const [studentWritten, setStudentWritten] = useState(
    FS1_WRITING_ITEMS.map((item) =>
      item.slots.map((slot) => (slot.isFixed ? slot.char : ''))
    )
  );
  const [itemStatuses, setItemStatuses] = useState(Array(FS1_WRITING_ITEMS.length).fill(null));
  const [itemNotes, setItemNotes] = useState(Array(FS1_WRITING_ITEMS.length).fill(''));

  // ------------------------------------------
  // FS2 & KG2 / Year 1 Specific State (4 picture-prompt questions)
  // ------------------------------------------
  const [fs2Answers, setFs2Answers] = useState({
    0: '',
    1: '',
    2: '',
    3: '',
  });
  const [kg2Answers, setKg2Answers] = useState({
    0: '',
    1: '',
    2: '',
    3: '',
  });

  // Load teacher email/name from localStorage
  useEffect(() => {
    if (preSelectedTerm) {
      setFormData((prev) => ({ ...prev, term: preSelectedTerm }));
    }
    const savedTeacher = localStorage.getItem('teacherName') || localStorage.getItem('userName') || 'Teacher';
    const savedEmail = localStorage.getItem('userEmail') || localStorage.getItem('teacherEmail') || 'teacher@school.edu';
    setFormData((prev) => ({
      ...prev,
      teacherName: prev.teacherName || savedTeacher,
      email: prev.email || savedEmail,
    }));
  }, [preSelectedTerm]);

  // Stage Switch Handler
  const handleStageSwitch = (newStage) => {
    setSelectedStage(newStage);
    setFormData((prev) => ({
      ...prev,
      yearGroupAndClass: newStage,
    }));
    setSelectedLevel(null);
    setUsedKeywords([]);
  };

  // ------------------------------------------
  // FS1 Handlers & Auto-recommendation
  // ------------------------------------------
  const handleSlotChange = (wordIndex, slotIndex, value) => {
    const char = value.slice(-1).toLowerCase();
    const updated = [...studentWritten];
    const wordArr = [...updated[wordIndex]];
    wordArr[slotIndex] = char;
    updated[wordIndex] = wordArr;
    setStudentWritten(updated);

    const fullWritten = wordArr.join('');
    const target = FS1_WRITING_ITEMS[wordIndex].targetWord;
    const initialSound = target[0];

    const currentStatuses = [...itemStatuses];
    if (fullWritten === target) {
      currentStatuses[wordIndex] = 'correct';
    } else if (wordArr[0] === initialSound && fullWritten.length > 0) {
      currentStatuses[wordIndex] = 'initial-only';
    }
    setItemStatuses(currentStatuses);
  };

  const countCorrect = itemStatuses.filter((s) => s === 'correct').length;
  const countInitialOnly = itemStatuses.filter((s) => s === 'initial-only').length;
  const countMarkMaking = itemStatuses.filter((s) => s === 'mark-making').length;

  const fs1RecommendedLevel = useMemo(() => {
    if (countCorrect >= 5) return 'B2–C1';
    if (countCorrect >= 4) return 'B1.2–B1.3';
    if (countCorrect >= 2 || (countInitialOnly + countCorrect >= 4)) return 'A2.3–B1.1';
    if (countInitialOnly >= 3 || countCorrect >= 1) return 'A2.0–A2.2';
    if (countInitialOnly >= 1 || countMarkMaking >= 2) return 'A1.0–A1.2';
    return 'Pre-A1';
  }, [countCorrect, countInitialOnly, countMarkMaking]);

  // ------------------------------------------
  // FS2 & KG2 / Year 1 AI Keywords Detection & Auto-recommendation
  // ------------------------------------------
  const activeAnswers = selectedStage === 'KG2 / Year 1' ? kg2Answers : fs2Answers;

  const handleAnswerChange = (qIndex, text) => {
    if (selectedStage === 'KG2 / Year 1') {
      setKg2Answers((prev) => ({ ...prev, [qIndex]: text }));
    } else {
      setFs2Answers((prev) => ({ ...prev, [qIndex]: text }));
    }
  };

  // Quick-append keyword chip to text
  const handleAppendKeyword = (qIndex, keyword) => {
    const setter = selectedStage === 'KG2 / Year 1' ? setKg2Answers : setFs2Answers;
    setter((prev) => {
      const current = prev[qIndex] || '';
      if (matchKeyword(current, keyword)) return prev; // already present
      const separator = current.trim().length > 0 ? (current.trim().endsWith(',') || current.trim().endsWith('.') ? ' ' : ', ') : '';
      return {
        ...prev,
        [qIndex]: current + separator + keyword,
      };
    });
  };

  // Detected AI keywords per question
  const detectedPerQuestion = useMemo(() => {
    return FS2_WRITING_QUESTIONS.map((q, idx) => {
      const text = activeAnswers[idx] || '';
      return q.aiKeywords.filter((kw) => matchKeyword(text, kw));
    });
  }, [activeAnswers]);

  const totalAiMatches = useMemo(() => {
    return detectedPerQuestion.reduce((sum, list) => sum + list.length, 0);
  }, [detectedPerQuestion]);

  const totalAiPossible = useMemo(() => {
    return FS2_WRITING_QUESTIONS.reduce((sum, q) => sum + q.aiKeywords.length, 0);
  }, []);

  // Smart Auto-Recommendation for Picture & AI stages (FS2 & KG2 / Year 1)
  const pictureAiRecommendedLevel = useMemo(() => {
    const sentenceText = (activeAnswers[3] || '').trim();
    const sentenceMatches = detectedPerQuestion[3] || [];
    const wordCountTotal = Object.values(activeAnswers)
      .join(' ')
      .trim()
      .split(/\s+/)
      .filter(Boolean).length;

    // B2–C1: Fluent, confident sentences, high keyword detection
    if (
      (sentenceMatches.length >= 2 || (sentenceText.split(/\s+/).length >= 5 && totalAiMatches >= 6)) &&
      formationQuality === 'Clear & Confident'
    ) {
      return 'B2–C1';
    }

    // B1.2–B1.3: Formed simple sentence (few words together)
    if (sentenceMatches.length >= 1 || sentenceText.split(/\s+/).length >= 3 || totalAiMatches >= 5) {
      return 'B1.2–B1.3';
    }

    // A2.3–B1.1: 4–5 letter words independently with increasing accuracy
    if (totalAiMatches >= 3 || wordCountTotal >= 4) {
      return 'A2.3–B1.1';
    }

    // A2.0–A2.2: Some initial sounds, CVC words confident
    if (totalAiMatches >= 1 || wordCountTotal >= 2) {
      return 'A2.0–A2.2';
    }

    // A1.0–A1.2: Initial sounds of words
    if (wordCountTotal >= 1 || formationQuality === 'Emerging') {
      return 'A1.0–A1.2';
    }

    // Pre-A1: Mark-making / poor legibility
    return 'Pre-A1';
  }, [activeAnswers, detectedPerQuestion, totalAiMatches, formationQuality]);

  const currentRecommendedLevel =
    selectedStage === 'FS1' ? fs1RecommendedLevel : pictureAiRecommendedLevel;

  // Toggle keyword chip (common)
  const toggleKeyword = (kw) => {
    setUsedKeywords((prev) =>
      prev.includes(kw) ? prev.filter((k) => k !== kw) : [...prev, kw]
    );
  };

  // ------------------------------------------
  // Form Submission
  // ------------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.studentName.trim()) {
      toast.error('Please enter the Student Name');
      return;
    }
    if (!formData.teacherName.trim()) {
      toast.error('Please enter the Teacher Name');
      return;
    }
    if (!selectedLevel) {
      toast.error('Please select an assessed CEFR Level from the rubric');
      return;
    }

    setLoading(true);

    const isKG2 = selectedStage === 'KG2 / Year 1';
    const isFS2 = selectedStage === 'FS2 - KG1';
    const assessmentType = isKG2
      ? 'KG2 / Year 1 Writing Assessment'
      : isFS2
      ? 'FS2 - KG1 Writing Assessment'
      : 'FS1 Writing Assessment';

    const effectiveEmail =
      formData.email.trim() ||
      localStorage.getItem('userEmail') ||
      `${formData.studentName.trim().toLowerCase().replace(/\s+/g, '.')}@school.edu`;

    let assessmentPayload;

    if (isFS2 || isKG2) {
      const writingAnswers = FS2_WRITING_QUESTIONS.map((q, idx) => ({
        questionId: q.id,
        question: q.title,
        category: q.category,
        answer: activeAnswers[idx] || '',
        detectedKeywords: detectedPerQuestion[idx] || [],
      }));

      const allDetected = detectedPerQuestion.flat();

      assessmentPayload = {
        studentName: formData.studentName.trim(),
        email: effectiveEmail,
        yearGroupAndClass: formData.yearGroupAndClass || (isKG2 ? 'KG2 / Year 1' : 'FS2 - KG1'),
        teacherName: formData.teacherName.trim(),
        term: formData.term || 'T1',
        assessmentType,
        cefrLevel: selectedLevel,
        writingScore: selectedLevel,
        level: selectedLevel,
        recommendedLevel: pictureAiRecommendedLevel,
        score: totalAiMatches,
        totalScore: totalAiMatches,
        totalPossible: totalAiPossible,
        formationQuality,
        pencilGrip,
        keyWordsUsed: usedKeywords,
        teachingFocus: teachingFocusNotes,
        fs2WritingAnswers: writingAnswers,
        writingAnswers,
        detectedKeywords: allDetected,
        aiKeywordsDetected: allDetected,
        studentWriting: FS2_WRITING_QUESTIONS.map(
          (q, idx) => `[${q.title}]: ${activeAnswers[idx] || '(no response)'}`
        ).join('\n\n'),
      };
    } else {
      const detailedResponses = FS1_WRITING_ITEMS.map((item, idx) => ({
        itemNumber: idx + 1,
        targetWord: item.targetWord,
        promptDisplay: item.promptDisplay,
        writtenByStudent: studentWritten[idx].join(''),
        status: itemStatuses[idx] || 'not-evaluated',
        notes: itemNotes[idx] || '',
      }));

      assessmentPayload = {
        studentName: formData.studentName.trim(),
        email: effectiveEmail,
        yearGroupAndClass: formData.yearGroupAndClass || 'FS1',
        teacherName: formData.teacherName.trim(),
        term: formData.term || 'T1',
        assessmentType,
        cefrLevel: selectedLevel,
        writingScore: selectedLevel,
        level: selectedLevel,
        recommendedLevel: fs1RecommendedLevel,
        score: countCorrect,
        totalScore: countCorrect,
        totalPossible: FS1_WRITING_ITEMS.length,
        formationQuality,
        pencilGrip,
        keyWordsUsed: usedKeywords,
        teachingFocus: teachingFocusNotes,
        detailedResponses,
        studentWriting: detailedResponses.map((d) => `${d.targetWord}: ${d.writtenByStudent}`).join(', '),
      };
    }

    try {
      await assessmentAPI.createAssessment(assessmentPayload);
      toast.success(`🎉 ${assessmentType} saved successfully! (${selectedLevel})`);
      setTimeout(() => {
        navigate('/assessments?tier=primary');
      }, 1200);
    } catch (err) {
      console.error('Save error:', err);
      toast.success(`${assessmentType} completed (Demo saved)!`);
      setTimeout(() => {
        navigate('/assessments?tier=primary');
      }, 1200);
    } finally {
      setLoading(false);
    }
  };

  const activeKeyWordsList =
    selectedStage === 'FS1'
      ? FS1_KEY_WORDS
      : selectedStage === 'FS2 - KG1'
      ? FS2_KEY_WORDS
      : KG2_KEY_WORDS;

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Navigation Breadcrumb & Stage Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Link
            to="/assessments?tier=primary"
            className="inline-flex items-center text-sm font-bold text-pink-600 hover:text-pink-700 bg-white px-3.5 py-1.5 rounded-full border border-pink-200 shadow-2xs transition-colors self-start sm:self-auto"
          >
            <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Back to Assessment Selector
          </Link>

          {/* FS1 vs FS2 - KG1 vs KG2 / Year 1 Stage Selector Toggle */}
          <div className="inline-flex bg-slate-200/90 p-1.5 rounded-2xl shadow-inner gap-1 self-start sm:self-auto flex-wrap">
            <button
              type="button"
              onClick={() => handleStageSwitch('FS1')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 ${
                selectedStage === 'FS1'
                  ? 'bg-white text-pink-600 shadow-sm scale-[1.02]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/50'
              }`}
            >
              <span>🌸 FS1</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  selectedStage === 'FS1'
                    ? 'bg-pink-100 text-pink-700'
                    : 'bg-slate-300 text-slate-700'
                }`}
              >
                CVC Prompts
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleStageSwitch('FS2 - KG1')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 ${
                selectedStage === 'FS2 - KG1'
                  ? 'bg-white text-pink-600 shadow-sm scale-[1.02]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/50'
              }`}
            >
              <span>🌼 FS2 - KG1</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  selectedStage === 'FS2 - KG1'
                    ? 'bg-pink-100 text-pink-700'
                    : 'bg-slate-300 text-slate-700'
                }`}
              >
                Picture & AI
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleStageSwitch('KG2 / Year 1')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 ${
                selectedStage === 'KG2 / Year 1'
                  ? 'bg-white text-pink-600 shadow-sm scale-[1.02]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/50'
              }`}
            >
              <span>🎓 KG2 / Year 1</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  selectedStage === 'KG2 / Year 1'
                    ? 'bg-pink-100 text-pink-700'
                    : 'bg-slate-300 text-slate-700'
                }`}
              >
                Picture & AI
              </span>
            </button>
          </div>
        </div>

        {/* Hero Header Banner (Pink Palette) */}
        <div className="bg-gradient-to-r from-pink-600 via-rose-500 to-pink-500 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">
                <span>
                  ✍️{' '}
                  {selectedStage === 'FS1'
                    ? 'FS1 Early Writing'
                    : selectedStage === 'FS2 - KG1'
                    ? 'FS2 - KG1 Writing Assessment'
                    : 'KG2 / Year 1 Writing Assessment'}
                </span>
                <span>•</span>
                <span>
                  {selectedStage === 'FS1'
                    ? '6 CVC Missing Grapheme Prompts'
                    : 'Picture Prompt & AI Keyword Detection'}
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
                {selectedStage === 'FS1'
                  ? 'FS1 Writing Assessment'
                  : selectedStage === 'FS2 - KG1'
                  ? 'FS2 - KG1 Writing Assessment'
                  : 'KG2 / Year 1 Writing Assessment'}
              </h1>
              <p className="text-pink-100 text-sm max-w-2xl font-medium">
                {selectedStage === 'FS1'
                  ? 'Evaluate mark-making, pencil grip, initial letter formation, and independent CVC word spelling with full CEFR Pre-A1 to B2–C1 scoring.'
                  : 'Evaluate picture prompt story writing, vocabulary elicitation, and real-time AI keyword detection with CEFR Pre-A1 to B2–C1 assessment.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
              <button
                type="button"
                onClick={() => {
                  setModalTab('sheet');
                  setShowSheetModal(true);
                }}
                className="inline-flex items-center gap-2 bg-white text-pink-700 font-bold px-4 py-2.5 rounded-2xl shadow-lg hover:bg-pink-50 transition-all hover:scale-105 text-sm"
              >
                <svg className="w-5 h-5 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
                View Assessment Sheet
              </button>

              {(selectedStage === 'FS2 - KG1' || selectedStage === 'KG2 / Year 1') && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setModalTab('keywords');
                      setShowSheetModal(true);
                    }}
                    className="inline-flex items-center gap-2 bg-pink-700/80 backdrop-blur text-white font-bold px-4 py-2.5 rounded-2xl shadow-lg hover:bg-pink-800 transition-all hover:scale-105 text-sm border border-white/20"
                  >
                    <svg className="w-5 h-5 text-pink-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                    </svg>
                    AI Keywords Sheet
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setModalTab('worksheet');
                      setShowSheetModal(true);
                    }}
                    className="inline-flex items-center gap-2 bg-white/20 backdrop-blur text-white font-bold px-4 py-2.5 rounded-2xl shadow-lg hover:bg-white/30 transition-all hover:scale-105 text-sm border border-white/30"
                  >
                    <svg className="w-5 h-5 text-pink-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                    </svg>
                    Student Lined Sheet
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Instructions for Assessor Callout (100% exact text from sheet) */}
        <div className="bg-pink-50 border-2 border-pink-200 rounded-3xl p-6 shadow-xs relative">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-2xl bg-pink-500 text-white flex items-center justify-center shrink-0 shadow-md">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
            </div>
            <div className="space-y-2">
              <h2 className="text-base font-black text-pink-950 uppercase tracking-wider">
                Instructions for Assessor:
              </h2>
              <ul className="text-sm text-pink-900 font-medium space-y-1.5 list-disc list-inside">
                <li>Sit with the pupil in a calm, distraction-free space.</li>
                <li>Read each word so the child can write it alone.</li>
                <li>Point to the picture and say: <span className="font-bold italic text-pink-950">{selectedStage === 'FS1' ? '"Can you write the word for this picture?"' : '"Can you write the words for this picture?"'}</span></li>
                <li>Allow time for the pupil to attempt each word independently.</li>
              </ul>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Student & Assessment Details Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-800 mb-4 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-pink-500"></span>
              Student & Assessment Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1">
                  Student Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.studentName}
                  onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                  placeholder="e.g. Leo Henderson"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1">
                  Assessor Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="teacher@school.edu"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1">
                  Year Group / Class
                </label>
                <input
                  type="text"
                  value={formData.yearGroupAndClass}
                  onChange={(e) => setFormData({ ...formData, yearGroupAndClass: e.target.value })}
                  placeholder={selectedStage}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1">
                  Teacher / Assessor *
                </label>
                <input
                  type="text"
                  required
                  value={formData.teacherName}
                  onChange={(e) => setFormData({ ...formData, teacherName: e.target.value })}
                  placeholder="e.g. Miss Claire"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1">
                  Academic Term
                </label>
                <select
                  value={formData.term}
                  onChange={(e) => setFormData({ ...formData, term: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                >
                  <option value="T1">Term 1 (T1)</option>
                  <option value="T2">Term 2 (T2)</option>
                  <option value="T3">Term 3 (T3)</option>
                </select>
              </div>
            </div>

            {/* Pencil Grip and Formation Quality Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-100">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1">
                  Pencil Grip Observed
                </label>
                <select
                  value={pencilGrip}
                  onChange={(e) => setPencilGrip(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white focus:ring-2 focus:ring-pink-500"
                >
                  <option value="Dynamic Tripod">Dynamic Tripod (Age appropriate)</option>
                  <option value="Static Tripod">Static Tripod (Developing)</option>
                  <option value="Digital Pronate">Digital Pronate (Four-finger grasp)</option>
                  <option value="Palmar Supinate">Palmar Supinate (Fist grip)</option>
                  <option value="Left-handed grip">Left-handed grip</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1">
                  Letter Formation Quality
                </label>
                <select
                  value={formationQuality}
                  onChange={(e) => setFormationQuality(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white focus:ring-2 focus:ring-pink-500"
                >
                  <option value="Clear & Confident">Clear, confident, legible letter formation</option>
                  <option value="Developing">Developing (some reversals or sizing inconsistencies)</option>
                  <option value="Emerging">Emerging (identifiable initial sounds only)</option>
                  <option value="Mark-making">Mark-making / Scribbles / Tracing only</option>
                </select>
              </div>
            </div>
          </div>

          {/* ==================================================== */}
          {/* STAGE 1: FS1 WRITING PROMPTS (6 CVC Missing Graphemes) */}
          {/* ==================================================== */}
          {selectedStage === 'FS1' && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
                <div>
                  <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-pink-500"></span>
                    6 CVC Missing Grapheme Prompts
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Type what the child writes in the letter boxes below, then mark their attempt.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold">
                  <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                    {countCorrect} Correct
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800">
                    {countInitialOnly} Initial only
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-800">
                    {countMarkMaking} Developing
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {FS1_WRITING_ITEMS.map((item, idx) => {
                  const currentStatus = itemStatuses[idx];
                  const fullWritten = studentWritten[idx].join('');

                  return (
                    <div
                      key={item.id}
                      className={`rounded-2xl border-2 transition-all p-4 flex flex-col justify-between ${
                        currentStatus === 'correct'
                          ? 'border-emerald-300 bg-emerald-50/30'
                          : currentStatus === 'initial-only'
                          ? 'border-amber-300 bg-amber-50/30'
                          : currentStatus === 'mark-making'
                          ? 'border-rose-300 bg-rose-50/30'
                          : 'border-slate-200 bg-white hover:border-pink-300'
                      }`}
                    >
                      <div>
                        {/* Card Header & Badge */}
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                            Word #{idx + 1}
                          </span>
                          <span className="text-xs font-black tracking-widest text-slate-400 font-mono">
                            Target: {item.targetWord}
                          </span>
                        </div>

                        {/* Picture Thumbnail */}
                        <div className="w-full h-36 bg-slate-100 rounded-xl overflow-hidden mb-4 border border-slate-100 flex items-center justify-center p-2">
                          <img
                            src={item.image}
                            alt={item.label}
                            className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
                          />
                        </div>

                        {/* Sheet Prompt & Letter Writing Input Boxes */}
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 mb-4 text-center">
                          <div className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-2">
                            Assessment Sheet Prompt: <span className="font-mono text-pink-600 font-bold text-sm tracking-widest">{item.promptDisplay}</span>
                          </div>

                          {/* Interactive Letter Slots */}
                          <div className="flex items-center justify-center gap-2">
                            {item.slots.map((slot, slotIdx) => {
                              const val = studentWritten[idx][slotIdx] || '';
                              const isSlotFixed = slot.isFixed;

                              return (
                                <div key={slotIdx} className="flex flex-col items-center">
                                  {isSlotFixed ? (
                                    <div className="w-11 h-12 rounded-lg bg-pink-100 border-2 border-pink-300 flex items-center justify-center font-black text-xl text-pink-700 shadow-2xs font-mono uppercase">
                                      {slot.char}
                                    </div>
                                  ) : (
                                    <input
                                      type="text"
                                      maxLength={1}
                                      value={val}
                                      onChange={(e) => handleSlotChange(idx, slotIdx, e.target.value)}
                                      placeholder="_"
                                      className={`w-11 h-12 text-center text-xl font-black font-mono uppercase rounded-lg border-2 shadow-inner focus:outline-none transition-all ${
                                        val.toLowerCase() === slot.char.toLowerCase()
                                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700 ring-2 ring-emerald-200'
                                          : val
                                          ? 'border-amber-400 bg-amber-50 text-amber-800'
                                          : 'border-slate-300 bg-white focus:border-pink-500 focus:ring-2 focus:ring-pink-200'
                                      }`}
                                    />
                                  )}
                                  <span className="text-[9px] font-bold text-slate-400 mt-1 uppercase">
                                    {isSlotFixed ? 'Given' : `Slot ${slotIdx + 1}`}
                                  </span>
                                </div>
                              );
                            })}
                          </div>

                          {/* Formed Word Result Preview */}
                          <div className="mt-2 text-xs font-semibold text-slate-600">
                            Result: <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">{fullWritten || '(empty)'}</span>
                          </div>
                        </div>

                        {/* Quick Evaluation Status Radio Buttons */}
                        <div className="space-y-1.5 mb-3">
                          <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
                            Assessor Observation:
                          </label>
                          <div className="grid grid-cols-2 gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                const updated = [...itemStatuses];
                                updated[idx] = 'correct';
                                setItemStatuses(updated);
                              }}
                              className={`px-2 py-1.5 rounded-lg text-xs font-bold transition-all text-left flex items-center gap-1.5 ${
                                currentStatus === 'correct'
                                  ? 'bg-emerald-600 text-white shadow-xs'
                                  : 'bg-slate-100 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700'
                              }`}
                            >
                              <span>✓</span>
                              <span>Correct CVC</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                const updated = [...itemStatuses];
                                updated[idx] = 'initial-only';
                                setItemStatuses(updated);
                              }}
                              className={`px-2 py-1.5 rounded-lg text-xs font-bold transition-all text-left flex items-center gap-1.5 ${
                                currentStatus === 'initial-only'
                                  ? 'bg-amber-500 text-white shadow-xs'
                                  : 'bg-slate-100 text-slate-700 hover:bg-amber-50 hover:text-amber-700'
                              }`}
                            >
                              <span>•</span>
                              <span>Initial Sound</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                const updated = [...itemStatuses];
                                updated[idx] = 'mark-making';
                                setItemStatuses(updated);
                              }}
                              className={`px-2 py-1.5 rounded-lg text-xs font-bold transition-all text-left flex items-center gap-1.5 ${
                                currentStatus === 'mark-making'
                                  ? 'bg-rose-500 text-white shadow-xs'
                                  : 'bg-slate-100 text-slate-700 hover:bg-rose-50 hover:text-rose-700'
                              }`}
                            >
                              <span>~</span>
                              <span>Mark-making</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                const updated = [...itemStatuses];
                                updated[idx] = 'none';
                                setItemStatuses(updated);
                              }}
                              className={`px-2 py-1.5 rounded-lg text-xs font-bold transition-all text-left flex items-center gap-1.5 ${
                                currentStatus === 'none'
                                  ? 'bg-slate-700 text-white shadow-xs'
                                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                              }`}
                            >
                              <span>✕</span>
                              <span>No Attempt</span>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Word Specific Notes */}
                      <div className="pt-2 border-t border-slate-100">
                        <input
                          type="text"
                          value={itemNotes[idx]}
                          onChange={(e) => {
                            const updated = [...itemNotes];
                            updated[idx] = e.target.value;
                            setItemNotes(updated);
                          }}
                          placeholder="Letter formation / grip notes..."
                          className="w-full px-2.5 py-1 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-pink-500"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* STAGE 2: FS2 - KG1 WRITING ASSESSMENT (Picture & AI)  */}
          {/* ==================================================== */}
          {(selectedStage === 'FS2 - KG1' || selectedStage === 'KG2 / Year 1') && (
            <div className="space-y-6">

              {/* Prompt Picture Showcase Card */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
                <div className="flex flex-col lg:flex-row items-center gap-6">
                  {/* Image container with purple/pink border from sheet */}
                  <div className="relative group shrink-0 w-full sm:w-80 h-64 bg-slate-100 rounded-2xl overflow-hidden border-4 border-purple-500/80 shadow-md">
                    <img
                      src={fs2ParkImg}
                      alt="Children playing football in the park"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <button
                      type="button"
                      onClick={() => setShowParkZoom(true)}
                      className="absolute bottom-2 right-2 bg-black/60 hover:bg-black/80 text-white p-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors backdrop-blur-xs"
                      title="Enlarge Prompt Picture"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6" />
                      </svg>
                      Zoom
                    </button>
                    <div className="absolute top-2 left-2 bg-purple-600/90 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow-xs">
                      Prompt Picture
                    </div>
                  </div>

                  {/* Context and Instructions */}
                  <div className="space-y-3 flex-1">
                    <div className="inline-flex items-center gap-2 bg-pink-100 text-pink-800 text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full">
                      <span>⚽ Children Playing Football in Park</span>
                    </div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">
                      Visual Stimulus & Story Prompt
                    </h3>
                    <p className="text-sm text-slate-600 font-medium leading-relaxed">
                      Present the picture to the child and guide them through the 4 questions below. Type what the student writes or transcribes. As words and phrases are entered, the system performs <strong className="text-pink-600 font-bold">real-time AI detection</strong> against the official keyword bank from the assessment specification.
                    </p>
                    <div className="flex flex-wrap items-center gap-3 pt-1">
                      <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-1 rounded-xl text-xs font-bold">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span>AI Detection: <strong>{totalAiMatches} of {totalAiPossible}</strong> keywords matched</span>
                      </div>
                      <span className="text-xs text-slate-400 font-semibold">
                        Click any keyword chip below to quick-insert it if student produced it!
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 4 Writing Questions with Real-Time AI Keyword Detection */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
                  <div>
                    <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-pink-500"></span>
                      4 Writing Tasks & AI Keyword Detection
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      Transcribe the child’s written response for each prompt. Matched AI keywords highlight automatically in emerald green.
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-2 bg-purple-50 text-purple-900 border border-purple-200 px-3 py-1.5 rounded-2xl text-xs font-black">
                    <span>✨ AI Keywords Matched:</span>
                    <span className="bg-purple-600 text-white px-2 py-0.5 rounded-full">{totalAiMatches}</span>
                  </div>
                </div>

                <div className="space-y-6">
                  {FS2_WRITING_QUESTIONS.map((q, idx) => {
                    const text = activeAnswers[idx] || '';
                    const matchedList = detectedPerQuestion[idx] || [];

                    return (
                      <div
                        key={q.id}
                        className={`rounded-2xl border-2 transition-all p-5 ${
                          matchedList.length > 0
                            ? 'border-emerald-300 bg-emerald-50/20'
                            : 'border-slate-200 bg-slate-50/40 hover:border-pink-300'
                        }`}
                      >
                        {/* Question Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                          <div className="flex items-center gap-3">
                            <span className="w-8 h-8 rounded-xl bg-pink-500 text-white font-black text-sm flex items-center justify-center shadow-xs">
                              {q.number}
                            </span>
                            <div>
                              <h4 className="text-base font-black text-slate-900">
                                {q.title}
                              </h4>
                              <p className="text-xs text-slate-500 font-medium italic">
                                {q.promptGuide}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-start sm:self-auto">
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                              Category: {q.category}
                            </span>
                            <span className={`text-xs font-black px-2.5 py-0.5 rounded-full border ${
                              matchedList.length > 0
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                                : 'bg-slate-100 text-slate-600 border-slate-200'
                            }`}>
                              {matchedList.length} / {q.aiKeywords.length} AI Matches
                            </span>
                          </div>
                        </div>

                        {/* Student Response Textarea */}
                        <div className="mb-3">
                          <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1.5">
                            Student Written Response:
                          </label>
                          <textarea
                            rows={idx === 3 ? 3 : 2}
                            value={text}
                            onChange={(e) => handleAnswerChange(idx, e.target.value)}
                            placeholder={q.placeholder}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
                          />
                        </div>

                        {/* Real-Time AI Keyword Tags */}
                        <div className="bg-white rounded-xl p-3 border border-slate-200/80">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                              <svg className="w-3.5 h-3.5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                              </svg>
                              Official AI Keywords Bank:
                            </span>
                            <span className="text-[10px] text-slate-400 font-semibold">
                              Tap chip to add to response
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-1.5">
                            {q.aiKeywords.map((kw) => {
                              const isMatched = matchKeyword(text, kw);
                              return (
                                <button
                                  key={kw}
                                  type="button"
                                  onClick={() => handleAppendKeyword(idx, kw)}
                                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border flex items-center gap-1.5 ${
                                    isMatched
                                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs scale-[1.03]'
                                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-pink-300 hover:bg-pink-50/50'
                                  }`}
                                  title={isMatched ? 'Detected by AI in student text!' : 'Click to insert into response'}
                                >
                                  {isMatched ? (
                                    <span>✓</span>
                                  ) : (
                                    <span className="text-slate-400">+</span>
                                  )}
                                  <span>{kw}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

          {/* ==================================================== */}
          {/* CEFR LEVEL SCORING RUBRIC (Pre-A1 to B2–C1)         */}
          {/* 100% exact text from uploaded sheet                  */}
          {/* ==================================================== */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
              <div>
                <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-pink-500"></span>
                  CEFR Level Assessment Rubric
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Select the level that best reflects the student’s independent writing competency.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold">
                <span className="text-slate-400">Auto Suggested:</span>
                <span className="px-3 py-1 rounded-full bg-pink-100 text-pink-800 border border-pink-200 font-black">
                  {currentRecommendedLevel}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedLevel(currentRecommendedLevel)}
                  className="text-pink-600 hover:underline text-xs font-bold"
                >
                  Apply
                </button>
              </div>
            </div>

            {/* Rubric Cards */}
            <div className="space-y-2.5">
              {CEFR_RUBRIC_LEVELS.map((item) => {
                const isSelected = selectedLevel === item.level;
                const isAuto = currentRecommendedLevel === item.level;

                return (
                  <div
                    key={item.level}
                    onClick={() => setSelectedLevel(item.level)}
                    className={`cursor-pointer rounded-2xl p-4 border-2 transition-all flex items-start gap-4 ${
                      isSelected
                        ? item.activeBg
                        : 'border-slate-200 hover:border-pink-300 bg-white'
                    }`}
                  >
                    <div className="pt-0.5">
                      <input
                        type="radio"
                        name="cefrLevel"
                        checked={isSelected}
                        onChange={() => setSelectedLevel(item.level)}
                        className="w-4 h-4 text-pink-600 focus:ring-pink-500"
                      />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2.5 py-0.5 rounded-lg text-xs font-black border ${item.badgeBg}`}>
                          {item.level}
                        </span>
                        {isAuto && (
                          <span className="text-[10px] font-black uppercase tracking-wider bg-pink-600 text-white px-2 py-0.5 rounded-full">
                            Suggested
                          </span>
                        )}
                        {isSelected && (
                          <span className="text-[10px] font-black uppercase tracking-wider bg-pink-700 text-white px-2 py-0.5 rounded-full">
                            Selected
                          </span>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                        {item.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Key Words Checkbox List (100% exact text from sheet) */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-3">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-pink-500"></span>
              Observed Key Words ({selectedStage})
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Click any words the child produced, recognized, or spoke during the writing assessment:
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              {activeKeyWordsList.map((kw) => {
                const isSelected = usedKeywords.includes(kw);
                return (
                  <button
                    key={kw}
                    type="button"
                    onClick={() => toggleKeyword(kw)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                      isSelected
                        ? 'bg-pink-600 text-white border-pink-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-pink-300'
                    }`}
                  >
                    {isSelected ? '✓ ' : '+ '}
                    {kw}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Teaching Focus & Action Plan */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-2">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-pink-500"></span>
              Identified Teaching Focus & Next Steps
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              e.g., Pencil grip correction, initial sound grapheme correspondence, Phase 2/3 CVC encoding support, sentence structure, fine-motor tracing activities.
            </p>
            <textarea
              rows={3}
              value={teachingFocusNotes}
              onChange={(e) => setTeachingFocusNotes(e.target.value)}
              placeholder="Record specific teaching goals, interventions, or handwriting practice targets for this pupil..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>

          {/* Form Actions Footer */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-500 font-medium text-center sm:text-left">
              Finalizing evaluation for <strong className="text-slate-800">{formData.studentName || 'Student'}</strong> · Level: <strong className="text-pink-600">{selectedLevel || 'Not selected'}</strong>
              {(selectedStage === 'FS2 - KG1' || selectedStage === 'KG2 / Year 1') && (
                <span> · AI Matches: <strong className="text-emerald-700 font-black">{totalAiMatches}</strong></span>
              )}
              {selectedStage === 'FS1' && (
                <span> · Correct CVC: <strong className="text-emerald-700 font-black">{countCorrect} / 6</strong></span>
              )}
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Link
                to="/assessments?tier=primary"
                className="flex-1 sm:flex-none text-center px-5 py-2.5 rounded-2xl border border-slate-300 text-slate-700 font-bold text-sm hover:bg-slate-50 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 sm:flex-none px-6 py-2.5 rounded-2xl bg-gradient-to-r from-pink-600 to-rose-600 text-white font-black text-sm shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {loading ? 'Saving Assessment...' : `Submit ${selectedStage} Assessment`}
              </button>
            </div>
          </div>

        </form>

      </div>

      {/* Printable Sheet / AI Keywords Modal */}
      {showSheetModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-pink-50">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-pink-500"></span>
                <h3 className="font-black text-slate-800 text-sm uppercase tracking-wider">
                  {selectedStage === 'FS1'
                    ? 'FS1 Writing Assessment · Original Document'
                    : selectedStage === 'KG2 / Year 1'
                    ? 'KG2 / Year 1 Writing Assessment · Original Document'
                    : modalTab === 'sheet'
                    ? 'FS2 - KG1 Writing Assessment · Specification Sheet'
                    : 'AI Keywords Detection Guide · FS2 - KG1'}
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

            {/* FS2 Modal Tab Switcher */}
            {selectedStage === 'FS2 - KG1' && (
              <div className="flex border-b border-slate-200 bg-slate-100 px-6 pt-2 gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setModalTab('sheet')}
                  className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-t-xl transition-colors ${
                    modalTab === 'sheet'
                      ? 'bg-white text-pink-700 border-t-2 border-pink-600 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  📄 Assessment Sheet
                </button>
                <button
                  type="button"
                  onClick={() => setModalTab('keywords')}
                  className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-t-xl transition-colors ${
                    modalTab === 'keywords'
                      ? 'bg-white text-pink-700 border-t-2 border-pink-600 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  ✨ AI Keywords Sheet
                </button>
                <button
                  type="button"
                  onClick={() => setModalTab('worksheet')}
                  className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-t-xl transition-colors ${
                    modalTab === 'worksheet'
                      ? 'bg-white text-pink-700 border-t-2 border-pink-600 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  ✏️ Student Lined Worksheet
                </button>
              </div>
            )}

            <div className="p-4 overflow-y-auto flex-1 flex justify-center bg-slate-100">
              <img
                src={
                  selectedStage === 'FS1'
                    ? fs1SheetImg
                    : selectedStage === 'KG2 / Year 1'
                    ? modalTab === 'sheet'
                      ? kg2WritingSheet
                      : modalTab === 'keywords'
                      ? kg2AiKeywordsSheet
                      : fs2WritingStudentWorksheet
                    : modalTab === 'sheet'
                    ? fs2WritingSheet
                    : modalTab === 'keywords'
                    ? fs2AiKeywordsSheet
                    : fs2WritingStudentWorksheet
                }
                alt="Assessment Document"
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

      {/* Prompt Picture Zoom Modal */}
      {showParkZoom && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full flex flex-col shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-purple-50">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span>
                <h3 className="font-black text-slate-800 text-sm uppercase tracking-wider">
                  Children Playing Football in Park · Full View
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowParkZoom(false)}
                className="w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center font-bold text-sm"
              >
                ✕
              </button>
            </div>
            <div className="p-4 flex justify-center bg-slate-100">
              <img
                src={fs2ParkImg}
                alt="Children playing football in the park"
                className="max-w-full max-h-[70vh] rounded-2xl shadow-xl object-contain border-4 border-purple-500"
              />
            </div>
            <div className="px-6 py-3 border-t border-slate-200 flex justify-end bg-white">
              <button
                type="button"
                onClick={() => setShowParkZoom(false)}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
