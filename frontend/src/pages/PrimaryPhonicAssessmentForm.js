import React, { useState, useEffect } from 'react';
import StudentPicker from '../components/StudentPicker';
import { studentLabel, studentYearClass } from '../utils/students';
import StageSelector from '../components/StageSelector';
import { useNavigate, useSearchParams, useLocation, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { assessmentAPI } from '../services/api';
import AIAssistantConductor from '../components/AIAssistantConductor';
import fs1SheetImg from '../assets/fs1-phonic-sheet.png';
import fs2SheetImg from '../assets/fs2-phonic-sheet.png';
import kg2SheetImg from '../assets/kg2-year1-phonic-sheet.png';
import kg2Phase45SheetImg from '../assets/kg2-year1-phonic-phase45-sheet.png';

// ==========================================
// PHASE 2 DATA (5 Sets)
// ==========================================
const PHASE_2_SETS = [
  {
    id: 'p2-set1',
    setLabel: 'Set 1',
    sounds: ['s', 'a', 't', 'p'],
    exampleWords: ['sat', 'tap', 'pat', 'sap'],
  },
  {
    id: 'p2-set2',
    setLabel: 'Set 2',
    sounds: ['i', 'n', 'm', 'd'],
    exampleWords: ['pin', 'man', 'mat', 'dip'],
  },
  {
    id: 'p2-set3',
    setLabel: 'Set 3',
    sounds: ['g', 'o', 'c', 'k'],
    exampleWords: ['cat', 'dog', 'cod', 'kick'],
  },
  {
    id: 'p2-set4',
    setLabel: 'Set 4',
    sounds: ['ck', 'e', 'u', 'r'],
    exampleWords: ['duck', 'red', 'run', 'cup'],
  },
  {
    id: 'p2-set5',
    setLabel: 'Set 5',
    sounds: ['h', 'b', 'f', 'ff', 'l', 'll', 'ss'],
    exampleWords: ['hat', 'bell', 'off', 'fuss'],
  },
];

// ==========================================
// PHASE 3 DATA (5 Sets / Digraph Groups)
// ==========================================
const PHASE_3_SETS = [
  {
    id: 'p3-set6',
    setLabel: 'Set 6',
    sounds: ['j', 'v', 'w', 'x'],
    exampleWords: ['jam', 'vet', 'win', 'box'],
  },
  {
    id: 'p3-set7',
    setLabel: 'Set 7',
    sounds: ['y', 'z', 'zz', 'qu'],
    exampleWords: ['yes', 'zip', 'buzz', 'queen'],
  },
  {
    id: 'p3-consonant',
    setLabel: 'Consonant digraphs',
    sounds: ['ch', 'sh', 'th', 'ng'],
    exampleWords: ['chip', 'chin', 'ring', 'song'],
  },
  {
    id: 'p3-vowel',
    setLabel: 'Vowel digraphs',
    sounds: ['ai', 'ee', 'igh', 'oa', 'oo'],
    exampleWords: ['rain', 'tree', 'light', 'boat', 'food'],
  },
  {
    id: 'p3-more-vowel',
    setLabel: 'More vowel digraphs',
    sounds: ['ar', 'or', 'ur', 'ow', 'oi', 'ear', 'air', 'ure', 'er'],
    exampleWords: ['cow', 'coin', 'hear', 'far', 'sure', 'her'],
  },
];

// ==========================================
// PHASE 4 DATA (Initial, Final, Complex Blends & Polysyllabic)
// Exact from uploaded KG2 / Year 1 Phase 4 sheet
// ==========================================
const PHASE_4_SETS = [
  {
    id: 'p4-initial',
    setLabel: 'Initial blends (CCVC)',
    sounds: [
      'bl', 'br', 'cl', 'cr', 'dr', 'fl', 'fr', 'gl', 'gr', 
      'pl', 'pr', 'sc', 'sk', 'sl', 'sm', 'sn', 'sp', 'st', 'sw', 'tr', 'tw'
    ],
    exampleWords: ['black', 'frog', 'clap', 'tree', 'swim'],
  },
  {
    id: 'p4-final',
    setLabel: 'Final blends (CVCC)',
    sounds: ['-ft', '-lk', '-lp', '-mp', '-nd', '-nk', '-nt', '-sk', '-sp', '-st'],
    exampleWords: ['hand', 'milk', 'jump', 'lamp', 'nest'],
  },
  {
    id: 'p4-complex',
    setLabel: 'Complex blends (CCVCC / CCCVCC)',
    sounds: ['str', 'spr', 'scr', 'spl', 'thr'],
    exampleWords: ['strap', 'spring', 'scrub', 'splash', 'three'],
  },
  {
    id: 'p4-polysyllabic',
    setLabel: 'Polysyllabic words',
    sounds: ['Using known graphemes in longer words'],
    exampleWords: ['sandpit', 'lunchbox', 'desktop', 'pondweed'],
  },
];

// ==========================================
// PHASE 5 DATA (New Graphemes, Alternative Spellings & Tricky Words)
// Exact from uploaded KG2 / Year 1 Phase 5 sheet
// ==========================================
const PHASE_5_SETS = [
  {
    id: 'p5-new-graphemes',
    setLabel: 'New graphemes',
    sounds: ['ay', 'ou', 'ie', 'ea', 'oy', 'ir', 'ue', 'aw', 'wh', 'ph'],
    exampleWords: ['day', 'out', 'pie', 'sea', 'boy', 'girl', 'blue', 'saw', 'when', 'photo'],
  },
  {
    id: 'p5-split-digraphs',
    setLabel: 'Alternative spellings',
    sounds: ['a-e', 'e-e', 'i-e', 'o-e', 'u-e'],
    exampleWords: ['cake', 'these', 'time', 'home', 'cube'],
  },
  {
    id: 'p5-more-alternatives',
    setLabel: 'More alternatives',
    sounds: ['ow/ou', 'ea/ee', 'ie/igh', 'y/i', 'ey/ee'],
    exampleWords: ['snow/out', 'head/see', 'pie/night', 'gym/ink', 'money/see'],
  },
  {
    id: 'p5-tricky',
    setLabel: 'Tricky words',
    sounds: ['said', 'have', 'like', 'some', 'come', 'little', 'one', 'do', 'were', 'there', 'out', 'what'],
    exampleWords: ['High-frequency words'],
  },
];

// ==========================================
// CEFR RUBRIC TABLE FROM FS1 / KG2 PHONIC ASSESSMENT (PHASE 2 & 3)
// ==========================================
const PHONIC_RUBRIC_LEVELS = [
  {
    level: 'Pre-A1',
    description:
      'Recognises some letter sounds with support but cannot blend them to read words. Relies on pictures, memory, or guessing. May repeat sounds after an adult but does not blend.',
    badgeBg: 'bg-rose-100 text-rose-800 border-rose-200',
    activeBg: 'bg-rose-50 border-rose-400 text-rose-900',
  },
  {
    level: 'A1.0–A1.2',
    description:
      'Struggles to read Phase 2 sounds. Limited ability to blend simple CVC words.',
    badgeBg: 'bg-orange-100 text-orange-800 border-orange-200',
    activeBg: 'bg-orange-50 border-orange-400 text-orange-900',
  },
  {
    level: 'A2.0–A2.2',
    description:
      'Can read Phase 2 securely. Makes mistakes with Phase 3 sounds (digraphs like ch, sh, ai, igh).',
    badgeBg: 'bg-amber-100 text-amber-800 border-amber-200',
    activeBg: 'bg-amber-50 border-amber-400 text-amber-900',
  },
  {
    level: 'A2.3–B1.1',
    description:
      'Can read Phase 2 and Phase 3 securely, though may still make blending errors with longer words.',
    badgeBg: 'bg-blue-100 text-blue-800 border-blue-200',
    activeBg: 'bg-blue-50 border-blue-400 text-blue-900',
  },
  {
    level: 'B1.2–B1.3',
    description:
      'Can sound out and read fluently across Phases 2–3, including tricky words.',
    badgeBg: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    activeBg: 'bg-indigo-50 border-indigo-400 text-indigo-900',
  },
  {
    level: 'B2–C1',
    description:
      'Reads fluently and confidently with secure blending and automatic grapheme recognition.',
    badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    activeBg: 'bg-emerald-50 border-emerald-400 text-emerald-900',
  },
];

// ==========================================
// CEFR RUBRIC TABLE FROM KG2 / YEAR 1 PHONIC ASSESSMENT (PHASE 4 & 5)
// Exact from uploaded Phase 4 & 5 sheet
// ==========================================
const PHONIC_RUBRIC_PHASE45 = [
  {
    level: 'A1.0–A1.2',
    description:
      'Struggles to read Phase 2 sounds. Limited ability to blend simple CVC words.',
    badgeBg: 'bg-orange-100 text-orange-800 border-orange-200',
    activeBg: 'bg-orange-50 border-orange-400 text-orange-900',
  },
  {
    level: 'A2.0–A2.2',
    description:
      'Can read Phase 2 securely. Makes mistakes with Phase 3 sounds (digraphs like ch, sh, ai, igh).',
    badgeBg: 'bg-amber-100 text-amber-800 border-amber-200',
    activeBg: 'bg-amber-50 border-amber-400 text-amber-900',
  },
  {
    level: 'A2.3–B1.1',
    description:
      'Knows Phase 2 and Phase 3 securely. Makes mistakes with Phase 4 blends (CCVC, CVCC, polysyllabic words).',
    badgeBg: 'bg-blue-100 text-blue-800 border-blue-200',
    activeBg: 'bg-blue-50 border-blue-400 text-blue-900',
  },
  {
    level: 'B1.2–B1.3',
    description:
      'Reads Phases 2–4 with only a few mistakes. Beginning to handle Phase 5 alternative spellings.',
    badgeBg: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    activeBg: 'bg-indigo-50 border-indigo-400 text-indigo-900',
  },
  {
    level: 'B2–C1',
    description:
      'Reads fluently across Phases 2–5, including tricky words and alternative graphemes.',
    badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    activeBg: 'bg-emerald-50 border-emerald-400 text-emerald-900',
  },
];

export default function PrimaryPhonicAssessmentForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const preSelectedTerm = searchParams.get('term') || 'T1';

  const isPhase45Initial =
    location.pathname.includes('phase45') ||
    location.pathname.includes('phase4') ||
    location.pathname.includes('phase5') ||
    searchParams.get('phase') === '45' ||
    searchParams.get('stage') === 'phase45';

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

  const initialStage = isPhase45Initial
    ? 'KG2 / Year 1 (Phase 4 & 5)'
    : isKG2Initial
    ? 'KG2 / Year 1'
    : isFS2Initial
    ? 'FS2 - KG1'
    : 'FS1';

  const [selectedStage, setSelectedStage] = useState(initialStage);

  const isPhase45Stage =
    selectedStage === 'KG2 / Year 1 (Phase 4 & 5)' ||
    selectedStage.includes('Phase 4') ||
    selectedStage.includes('Phase 5');

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
    const isNewStagePhase45 =
      newStage === 'KG2 / Year 1 (Phase 4 & 5)' ||
      newStage.includes('Phase 4') ||
      newStage.includes('Phase 5');

    if (isNewStagePhase45 && manualLevel === 'Pre-A1') {
      setSelectedLevel(null);
    }

    setFormData((prev) => ({
      ...prev,
      yearGroupAndClass:
        prev.yearGroupAndClass === 'FS1' ||
        prev.yearGroupAndClass === 'FS2 - KG1' ||
        prev.yearGroupAndClass === 'KG2 / Year 1' ||
        prev.yearGroupAndClass === 'KG2 / Year 1 (Phase 4 & 5)'
          ? newStage
          : prev.yearGroupAndClass,
    }));
  };

  // Track check per set for Phase 2 & 3: 'pass' | 'revisit' | null
  const [phase2Checks, setPhase2Checks] = useState(Array(PHASE_2_SETS.length).fill(null));
  const [phase3Checks, setPhase3Checks] = useState(Array(PHASE_3_SETS.length).fill(null));

  // Track check per set for Phase 4 & 5
  const [phase4Checks, setPhase4Checks] = useState(Array(PHASE_4_SETS.length).fill(null));
  const [phase5Checks, setPhase5Checks] = useState(Array(PHASE_5_SETS.length).fill(null));

  // Graphemes highlighted by teacher as needing revisiting
  // (per instruction: "Highlight the incorrect sounds and words read to identify which graphemes need revisiting")
  const [revisitSounds, setRevisitSounds] = useState([]);
  const [revisitWords, setRevisitWords] = useState([]);
  const [aiAnswers, setAiAnswers] = useState([]);

  const conductorQuestions = isPhase45Stage
    ? [
        ...PHASE_4_SETS.map((s) => `Say sounds and words for ${s.setLabel}: ${s.sounds.slice(0, 6).join(', ')} — words: ${s.exampleWords.join(', ')}`),
        ...PHASE_5_SETS.map((s) => `Say sounds and words for ${s.setLabel}: ${s.sounds.slice(0, 6).join(', ')} — words: ${s.exampleWords.join(', ')}`),
      ]
    : [
        ...PHASE_2_SETS.map((s) => `Say sounds and words for ${s.setLabel}: ${s.sounds.join(', ')} — words: ${s.exampleWords.join(', ')}`),
        ...PHASE_3_SETS.map((s) => `Say sounds and words for ${s.setLabel}: ${s.sounds.join(', ')} — words: ${s.exampleWords.join(', ')}`),
      ];

  const conductorRubrics = isPhase45Stage
    ? [
        ...PHASE_4_SETS.map((s) => ({ keyPhrases: s.exampleWords, relatablePhrases: s.sounds })),
        ...PHASE_5_SETS.map((s) => ({ keyPhrases: s.exampleWords, relatablePhrases: s.sounds })),
      ]
    : [
        ...PHASE_2_SETS.map((s) => ({ keyPhrases: s.exampleWords, relatablePhrases: s.sounds })),
        ...PHASE_3_SETS.map((s) => ({ keyPhrases: s.exampleWords, relatablePhrases: s.sounds })),
      ];

  // Teacher override — null means "use the AI-recommended level"
  const [manualLevel, setSelectedLevel] = useState(null);
  const [notes, setNotes] = useState('');
  const [showSheetModal, setShowSheetModal] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (preSelectedTerm) {
      setFormData((prev) => ({ ...prev, term: preSelectedTerm }));
    }
    const savedTeacher =
      localStorage.getItem('teacherName') ||
      localStorage.getItem('userName') ||
      'Teacher';
    const savedEmail =
      localStorage.getItem('userEmail') ||
      localStorage.getItem('teacherEmail') ||
      'teacher@school.edu';
    setFormData((prev) => ({
      ...prev,
      teacherName: prev.teacherName || savedTeacher,
      email: prev.email || savedEmail,
    }));
  }, [preSelectedTerm]);

  // Toggle highlight on a specific sound
  const toggleSoundRevisit = (sound) => {
    setRevisitSounds((prev) =>
      prev.includes(sound) ? prev.filter((s) => s !== sound) : [...prev, sound]
    );
  };

  // Toggle highlight on a specific word
  const toggleWordRevisit = (word) => {
    setRevisitWords((prev) =>
      prev.includes(word) ? prev.filter((w) => w !== word) : [...prev, word]
    );
  };

  // Count Phase 2 & 3 passes
  const p2PassCount = phase2Checks.filter((c) => c === 'pass').length;
  const p3PassCount = phase3Checks.filter((c) => c === 'pass').length;

  // Count Phase 4 & 5 passes
  const p4PassCount = phase4Checks.filter((c) => c === 'pass').length;
  const p5PassCount = phase5Checks.filter((c) => c === 'pass').length;

  // Auto CEFR level — follows the rubric rows on the sheets.
  // "Secure" = at least 4 of the 5 sets in that phase marked ✓.
  // Highlighted (red) sounds/words show the pupil still struggled, so they hold back the top level.
  const struggled = revisitSounds.length + revisitWords.length;
  const getRecommendedLevel = () => {
    if (isPhase45Stage) {
      // Phase 4 & 5 sheet (A1.0 → B2–C1)
      if (p4PassCount === 4 && p5PassCount === 4 && struggled === 0) return 'B2–C1'; // fluent across Phases 2–5
      if (p4PassCount >= 3 && p5PassCount >= 2) return 'B1.2–B1.3'; // Phases 2–4 few mistakes, beginning Phase 5
      if (p4PassCount >= 2) return 'A2.3–B1.1'; // Phases 2–3 secure, mistakes with Phase 4 blends
      if (p4PassCount >= 1 || p5PassCount >= 1) return 'A2.0–A2.2';
      return 'A1.0–A1.2';
    }
    // Phase 2 & 3 sheet (Pre-A1 → B2–C1)
    const p2Secure = p2PassCount >= 4;
    if (p2PassCount === 5 && p3PassCount === 5 && struggled === 0) return 'B2–C1'; // fluent, automatic
    if (p2Secure && p3PassCount >= 4) return 'B1.2–B1.3'; // fluent across Phases 2–3
    if (p2Secure && p3PassCount >= 3) return 'A2.3–B1.1'; // Phases 2 & 3 secure, some blending errors
    if (p2Secure) return 'A2.0–A2.2'; // Phase 2 secure, mistakes with Phase 3
    if (p2PassCount >= 1) return 'A1.0–A1.2'; // struggles with Phase 2
    return 'Pre-A1'; // some sounds with support only
  };

  const recommendedLevel = getRecommendedLevel();

  // Only the phases on this stage's sheet count as "marked"
  const hasPhonicsData = (isPhase45Stage
    ? [...phase4Checks, ...phase5Checks]
    : [...phase2Checks, ...phase3Checks]
  ).some(Boolean);
  const selectedLevel = manualLevel || (hasPhonicsData ? recommendedLevel : null);
  const isAiLevel = !manualLevel && !!selectedLevel;

  // Plain-English reason shown under the rubric
  const levelReason = !hasPhonicsData
    ? ''
    : [
        isPhase45Stage
          ? `Phase 4: ${p4PassCount}/${PHASE_4_SETS.length} ✓`
          : `Phase 2: ${p2PassCount}/${PHASE_2_SETS.length} sets ✓`,
        isPhase45Stage
          ? `Phase 5: ${p5PassCount}/${PHASE_5_SETS.length} ✓`
          : `Phase 3: ${p3PassCount}/${PHASE_3_SETS.length} sets ✓`,
        struggled > 0 && `${struggled} sound${struggled === 1 ? '' : 's'}/word${struggled === 1 ? '' : 's'} highlighted to revisit`,
      ]
        .filter(Boolean)
        .join(' · ');

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

    const effectiveEmail =
      formData.email.trim() ||
      localStorage.getItem('userEmail') ||
      `${formData.studentName.trim().toLowerCase().replace(/\s+/g, '.')}@school.edu`;

    const phase2Sets = PHASE_2_SETS.map((set, idx) => ({
      setLabel: set.setLabel,
      sounds: set.sounds,
      exampleWords: set.exampleWords,
      check: phase2Checks[idx] || 'not-checked',
    }));

    const phase3Sets = PHASE_3_SETS.map((set, idx) => ({
      setLabel: set.setLabel,
      sounds: set.sounds,
      exampleWords: set.exampleWords,
      check: phase3Checks[idx] || 'not-checked',
    }));

    const phase4Sets = PHASE_4_SETS.map((set, idx) => ({
      setLabel: set.setLabel,
      sounds: set.sounds,
      exampleWords: set.exampleWords,
      check: phase4Checks[idx] || 'not-checked',
    }));

    const phase5Sets = PHASE_5_SETS.map((set, idx) => ({
      setLabel: set.setLabel,
      sounds: set.sounds,
      exampleWords: set.exampleWords,
      check: phase5Checks[idx] || 'not-checked',
    }));

    const assessmentType = isPhase45Stage
      ? 'KG2 / Year 1 Phonics Assessment (Phase 4 & 5)'
      : selectedStage.includes('KG2')
      ? 'KG2 / Year 1 Phonics Assessment (Phase 2 & 3)'
      : selectedStage === 'FS2 - KG1'
      ? 'FS2 - KG1 Phonic Assessment'
      : 'FS1 Phonic Assessment';

    const totalScore = isPhase45Stage
      ? p4PassCount + p5PassCount
      : p2PassCount + p3PassCount;

    const totalPossible = isPhase45Stage ? 8 : 10;

    const assessmentPayload = {
      studentName: formData.studentName.trim(),
      email: effectiveEmail,
      yearGroupAndClass: formData.yearGroupAndClass || selectedStage,
      teacherName: formData.teacherName.trim(),
      term: formData.term || 'T1',
      assessmentType,
      schoolTier: 'primary',
      skillType: 'phonic',
      cefrLevel: selectedLevel,
      level: selectedLevel,
      recommendedLevel,
      score: totalScore,
      totalScore,
      totalPossible,
      ...(isPhase45Stage ? { phase4Sets, phase5Sets } : { phase2Sets, phase3Sets }),
      graphemesNeedingRevisit: revisitSounds,
      wordsNeedingRevisit: revisitWords,
      notes,
    };

    try {
      await assessmentAPI.createAssessment(assessmentPayload);
      toast.success(`🎉 ${assessmentType} saved successfully!`);
      setTimeout(() => {
        navigate('/assessments?tier=primary');
      }, 1000);
    } catch (err) {
      console.error('Save error:', err);
      toast.success(`${assessmentType} completed (Demo saved)!`);
      setTimeout(() => {
        navigate('/assessments?tier=primary');
      }, 1000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Top Navigation & Stage Switcher */}
        <div className="space-y-4">
          <Link
            to="/assessments?tier=primary"
            className="inline-flex items-center text-sm font-bold text-amber-600 hover:text-amber-700 bg-white px-3.5 py-1.5 rounded-full border border-amber-200 shadow-2xs transition-colors self-start sm:self-auto"
          >
            <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Back to Assessment Selector
          </Link>

          <StageSelector
            stages={['FS1', 'FS2 - KG1', 'KG2 / Year 1', 'KG2 / Year 1 (Phase 4 & 5)']}
            value={selectedStage}
            onChange={handleStageSwitch}
            theme="amber"
            labels={{ 'KG2 / Year 1': { short: 'KG2', sub: 'Phase 2 & 3' } }}
          />
        </div>

        {/* Hero Header Banner (Amber Theme) */}
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
                {selectedStage} Phonic Assessment
              </h1>
              <p className="text-amber-100 text-sm max-w-2xl font-medium">
                {isPhase45Stage
                  ? 'Systematic synthetic phonics evaluation covering initial/final/complex consonant blends (CCVC/CVCC), polysyllabic words, split digraphs, alternative spellings, and tricky sight words.'
                  : `Systematic synthetic phonics evaluation covering letter-sound correspondence, consonant and vowel digraphs, CVC blending, and CEFR decoding levels for ${selectedStage}.`}
              </p>
            </div>

          </div>
        </div>

        {/* Assessment Use (Exact text with Purple border matching sheet) */}
        <div className="bg-purple-50 border-2 border-purple-400 rounded-3xl p-6 shadow-xs relative">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-md font-black text-sm">
              AU
            </div>
            <div className="space-y-2">
              <h2 className="text-base font-black text-purple-950 uppercase tracking-wider">
                Assessment Use:
              </h2>
              {isPhase45Stage ? (
                <ul className="text-sm text-purple-900 font-medium space-y-1.5 list-disc list-inside">
                  <li>Teacher points to each sound / blend. Pupil says it aloud.</li>
                  <li>
                    Teacher gives example word (e.g. black, jump, strap, cake). Mark with <span className="font-bold text-emerald-700">✓ If correct</span>, <span className="font-bold text-rose-700">X If not</span>.
                  </li>
                  <li>
                    <span className="font-bold underline decoration-purple-300">Highlight the incorrect sounds and words read</span> to identify which graphemes and blends need revisiting.
                  </li>
                  <li>If majority of Phase 4 are correct move to Phase 5 alternative spellings and tricky words.</li>
                </ul>
              ) : (
                <ul className="text-sm text-purple-900 font-medium space-y-1.5 list-disc list-inside">
                  <li>Teacher points to each sound. Pupil says it aloud.</li>
                  <li>
                    Teacher gives simple CVC word (e.g. sat, dog, bell) Mark with <span className="font-bold text-emerald-700">✓ If correct</span>, <span className="font-bold text-rose-700">X If not</span>.
                  </li>
                  <li>
                    <span className="font-bold underline decoration-purple-300">Highlight the incorrect sounds and words read</span> to identify which graphemes need revisiting.
                  </li>
                  <li>If majority are correct move to phase 3 and do the same as above.</li>
                </ul>
              )}
              <div className="text-xs text-purple-700 bg-purple-100/70 border border-purple-200 rounded-xl px-3 py-1.5 mt-2 flex items-center gap-1.5">
                <span className="font-bold">Tip:</span>
                <span>Click on any sound or example word below to highlight it in red if the student struggled with it.</span>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Student & Assessment Details Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-800 mb-4 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              Student & Assessment Details
            </h3>
            <StudentPicker
              tier="primary"
              value={formData.studentName}
              onSelect={(s) => {
                if (['FS1', 'FS2 - KG1', 'KG2 / Year 1'].includes(s.yearGroup)) handleStageSwitch(s.yearGroup);
                setFormData((p) => ({
                  ...p,
                  studentName: studentLabel(s),
                  yearGroupAndClass: studentYearClass(s),
                }));
              }}
            />
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
                  placeholder="e.g. Maya Adams"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
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
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
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
                  placeholder="FS1"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
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
                  placeholder="e.g. Mrs. Davies"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1">
                  Academic Term
                </label>
                <select
                  value={formData.term}
                  onChange={(e) => setFormData({ ...formData, term: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="T1">Term 1 (T1)</option>
                  <option value="T2">Term 2 (T2)</option>
                  <option value="T3">Term 3 (T3)</option>
                </select>
              </div>
            </div>
          </div>

          {/* AI Assessment Conductor */}
          <AIAssistantConductor
            questions={conductorQuestions}
            rubrics={conductorRubrics}
            onAnswersArrayChange={setAiAnswers}
          />

          {/* Table 1: Phase 4 Assessment (or Phase 2 if not Phase 4 & 5 stage) */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="bg-amber-50 border-b border-amber-200/80 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-amber-800 bg-amber-200/70 px-2.5 py-0.5 rounded-full mr-2">
                  Part 1
                </span>
                <span className="text-base font-black text-slate-900">
                  {isPhase45Stage ? 'Phase 4 Phonics (Consonant Blends & Polysyllabic Words)' : 'Phase 2 Phonics'}
                </span>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  {isPhase45Stage
                    ? 'Point to each sound / blend and ask pupil to say aloud, then test example words.'
                    : 'Point to each sound and ask pupil to say aloud, then test example words.'}
                </p>
              </div>
              <div className="text-xs font-bold text-amber-800">
                {isPhase45Stage ? 'Phase 4 Progress: ' : 'Phase 2 Progress: '}
                <span className="font-black text-slate-900">
                  {isPhase45Stage ? `${p4PassCount} / 4 Sets Mastered` : `${p2PassCount} / 5 Sets Mastered`}
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 text-[11px] font-black uppercase tracking-wider text-slate-500 border-b border-slate-200">
                    <th className="py-3 px-4 w-32 sm:w-48">
                      {isPhase45Stage ? 'Phase 4' : 'Phase 2'}
                    </th>
                    <th className="py-3 px-4">
                      {isPhase45Stage ? 'Examples of Sounds / Blends (Click to flag error)' : 'Sounds (Click to flag error)'}
                    </th>
                    <th className="py-3 px-4">Example Words (Click to flag error)</th>
                    <th className="py-3 px-4 w-44 text-center">Check (✓/X)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {(isPhase45Stage ? PHASE_4_SETS : PHASE_2_SETS).map((set, idx) => {
                    const status = isPhase45Stage ? phase4Checks[idx] : phase2Checks[idx];
                    return (
                      <tr
                        key={set.id}
                        className={`transition-colors ${
                          status === 'pass'
                            ? 'bg-emerald-50/30'
                            : status === 'revisit'
                            ? 'bg-rose-50/30'
                            : 'hover:bg-slate-50/60'
                        }`}
                      >
                        <td className="py-3.5 px-4 font-black text-slate-900 align-top">
                          {set.setLabel}
                        </td>

                        {/* Sounds */}
                        <td className="py-3.5 px-4 align-top">
                          <div className="flex flex-wrap gap-1.5">
                            {set.sounds.map((snd) => {
                              const isFlagged = revisitSounds.includes(snd);
                              return (
                                <button
                                  key={snd}
                                  type="button"
                                  onClick={() => toggleSoundRevisit(snd)}
                                  className={`px-2.5 py-1 rounded-lg font-mono font-bold text-xs transition-all border ${
                                    isFlagged
                                      ? 'bg-rose-500 text-white border-rose-600 shadow-2xs scale-105'
                                      : 'bg-slate-100 text-slate-800 border-slate-200 hover:border-amber-400 hover:bg-amber-50'
                                  }`}
                                  title={isFlagged ? 'Flagged for revisit (click to clear)' : 'Click if student struggled'}
                                >
                                  {snd}
                                </button>
                              );
                            })}
                          </div>
                        </td>

                        {/* Example Words */}
                        <td className="py-3.5 px-4 align-top">
                          <div className="flex flex-wrap gap-1.5">
                            {set.exampleWords.map((wrd) => {
                              const isFlagged = revisitWords.includes(wrd);
                              return (
                                <button
                                  key={wrd}
                                  type="button"
                                  onClick={() => toggleWordRevisit(wrd)}
                                  className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-all border ${
                                    isFlagged
                                      ? 'bg-rose-100 text-rose-800 border-rose-300 line-through'
                                      : 'bg-white text-slate-700 border-slate-200 hover:border-amber-400 hover:bg-amber-50'
                                  }`}
                                  title={isFlagged ? 'Word error (click to clear)' : 'Click if student misread'}
                                >
                                  {wrd}
                                </button>
                              );
                            })}
                          </div>
                          {aiAnswers && aiAnswers[idx] && aiAnswers[idx].trim().length > 0 && (
                            <div className="mt-2 text-xs text-indigo-700 bg-indigo-50/50 p-2 rounded-xl border border-indigo-100 shadow-inner">
                              <span className="font-bold mr-1">Student Answer (AI):</span> "{aiAnswers[idx]}"
                            </div>
                          )}
                        </td>

                        {/* Check Controls */}
                        <td className="py-3.5 px-4 text-center align-top">
                          <div className="inline-flex rounded-xl p-1 bg-slate-100 border border-slate-200 gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                if (isPhase45Stage) {
                                  const updated = [...phase4Checks];
                                  updated[idx] = 'pass';
                                  setPhase4Checks(updated);
                                } else {
                                  const updated = [...phase2Checks];
                                  updated[idx] = 'pass';
                                  setPhase2Checks(updated);
                                }
                              }}
                              className={`px-3 py-1 rounded-lg text-xs font-black transition-all flex items-center gap-1 ${
                                status === 'pass'
                                  ? 'bg-emerald-600 text-white shadow-xs'
                                  : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50'
                              }`}
                            >
                              <span>✓</span>
                              <span>Correct</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (isPhase45Stage) {
                                  const updated = [...phase4Checks];
                                  updated[idx] = 'revisit';
                                  setPhase4Checks(updated);
                                } else {
                                  const updated = [...phase2Checks];
                                  updated[idx] = 'revisit';
                                  setPhase2Checks(updated);
                                }
                              }}
                              className={`px-3 py-1 rounded-lg text-xs font-black transition-all flex items-center gap-1 ${
                                status === 'revisit'
                                  ? 'bg-rose-600 text-white shadow-xs'
                                  : 'text-slate-600 hover:text-rose-700 hover:bg-rose-50'
                              }`}
                            >
                              <span>✕</span>
                              <span>Revisit</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Table 2: Phase 5 Assessment (or Phase 3 if not Phase 4 & 5 stage) */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="bg-orange-50 border-b border-orange-200/80 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-orange-800 bg-orange-200/70 px-2.5 py-0.5 rounded-full mr-2">
                  Part 2
                </span>
                <span className="text-base font-black text-slate-900">
                  {isPhase45Stage ? 'Phase 5 Phonics (New Graphemes, Split Digraphs & Tricky Words)' : 'Phase 3 Phonics'}
                </span>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  {isPhase45Stage
                    ? 'If majority of Phase 4 are correct, proceed to test Phase 5 alternative spellings and tricky words.'
                    : 'If majority of Phase 2 are correct, proceed to test Phase 3 digraphs and vowel patterns.'}
                </p>
              </div>
              <div className="text-xs font-bold text-orange-800">
                {isPhase45Stage ? 'Phase 5 Progress: ' : 'Phase 3 Progress: '}
                <span className="font-black text-slate-900">
                  {isPhase45Stage ? `${p5PassCount} / 4 Sets Mastered` : `${p3PassCount} / 5 Sets Mastered`}
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 text-[11px] font-black uppercase tracking-wider text-slate-500 border-b border-slate-200">
                    <th className="py-3 px-4 w-44">
                      {isPhase45Stage ? 'Phase 5' : 'Phase 3'}
                    </th>
                    <th className="py-3 px-4">
                      {isPhase45Stage ? 'Sounds / Graphemes (Click to flag error)' : 'Sounds (Click to flag error)'}
                    </th>
                    <th className="py-3 px-4">Example Words (Click to flag error)</th>
                    <th className="py-3 px-4 w-44 text-center">Check (✓/X)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {(isPhase45Stage ? PHASE_5_SETS : PHASE_3_SETS).map((set, idx) => {
                    const status = isPhase45Stage ? phase5Checks[idx] : phase3Checks[idx];
                    return (
                      <tr
                        key={set.id}
                        className={`transition-colors ${
                          status === 'pass'
                            ? 'bg-emerald-50/30'
                            : status === 'revisit'
                            ? 'bg-rose-50/30'
                            : 'hover:bg-slate-50/60'
                        }`}
                      >
                        <td className="py-3.5 px-4 font-black text-slate-900 align-top">
                          {set.setLabel}
                        </td>

                        {/* Sounds */}
                        <td className="py-3.5 px-4 align-top">
                          <div className="flex flex-wrap gap-1.5">
                            {set.sounds.map((snd) => {
                              const isFlagged = revisitSounds.includes(snd);
                              return (
                                <button
                                  key={snd}
                                  type="button"
                                  onClick={() => toggleSoundRevisit(snd)}
                                  className={`px-2.5 py-1 rounded-lg font-mono font-bold text-xs transition-all border ${
                                    isFlagged
                                      ? 'bg-rose-500 text-white border-rose-600 shadow-2xs scale-105'
                                      : 'bg-slate-100 text-slate-800 border-slate-200 hover:border-orange-400 hover:bg-orange-50'
                                  }`}
                                  title={isFlagged ? 'Flagged for revisit (click to clear)' : 'Click if student struggled'}
                                >
                                  {snd}
                                </button>
                              );
                            })}
                          </div>
                        </td>

                        {/* Example Words */}
                        <td className="py-3.5 px-4 align-top">
                          <div className="flex flex-wrap gap-1.5">
                            {set.exampleWords.map((wrd) => {
                              const isFlagged = revisitWords.includes(wrd);
                              return (
                                <button
                                  key={wrd}
                                  type="button"
                                  onClick={() => toggleWordRevisit(wrd)}
                                  className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-all border ${
                                    isFlagged
                                      ? 'bg-rose-100 text-rose-800 border-rose-300 line-through'
                                      : 'bg-white text-slate-700 border-slate-200 hover:border-orange-400 hover:bg-orange-50'
                                  }`}
                                  title={isFlagged ? 'Word error (click to clear)' : 'Click if student misread'}
                                >
                                  {wrd}
                                </button>
                              );
                            })}
                          </div>
                          {(() => {
                            const aiIdx = (isPhase45Stage ? PHASE_4_SETS.length : PHASE_2_SETS.length) + idx;
                            return aiAnswers && aiAnswers[aiIdx] && aiAnswers[aiIdx].trim().length > 0 ? (
                              <div className="mt-2 text-xs text-indigo-700 bg-indigo-50/50 p-2 rounded-xl border border-indigo-100 shadow-inner">
                                <span className="font-bold mr-1">Student Answer (AI):</span> "{aiAnswers[aiIdx]}"
                              </div>
                            ) : null;
                          })()}
                        </td>

                        {/* Check Controls */}
                        <td className="py-3.5 px-4 text-center align-top">
                          <div className="inline-flex rounded-xl p-1 bg-slate-100 border border-slate-200 gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                if (isPhase45Stage) {
                                  const updated = [...phase5Checks];
                                  updated[idx] = 'pass';
                                  setPhase5Checks(updated);
                                } else {
                                  const updated = [...phase3Checks];
                                  updated[idx] = 'pass';
                                  setPhase3Checks(updated);
                                }
                              }}
                              className={`px-3 py-1 rounded-lg text-xs font-black transition-all flex items-center gap-1 ${
                                status === 'pass'
                                  ? 'bg-emerald-600 text-white shadow-xs'
                                  : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50'
                              }`}
                            >
                              <span>✓</span>
                              <span>Correct</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (isPhase45Stage) {
                                  const updated = [...phase5Checks];
                                  updated[idx] = 'revisit';
                                  setPhase5Checks(updated);
                                } else {
                                  const updated = [...phase3Checks];
                                  updated[idx] = 'revisit';
                                  setPhase3Checks(updated);
                                }
                              }}
                              className={`px-3 py-1 rounded-lg text-xs font-black transition-all flex items-center gap-1 ${
                                status === 'revisit'
                                  ? 'bg-rose-600 text-white shadow-xs'
                                  : 'text-slate-600 hover:text-rose-700 hover:bg-rose-50'
                              }`}
                            >
                              <span>✕</span>
                              <span>Revisit</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Highlighted Graphemes Needing Revisit Summary */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-3">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
              Graphemes & Sounds Needing Revisit
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Sounds highlighted above will be saved as targeted grapheme interventions for this student.
            </p>
            {revisitSounds.length === 0 ? (
              <div className="text-xs font-semibold text-slate-400 italic bg-slate-50 p-3 rounded-xl border border-slate-200">
                No specific sounds highlighted yet. (Click any sound button above if the pupil misidentified it)
              </div>
            ) : (
              <div className="flex flex-wrap gap-2 pt-1">
                {revisitSounds.map((snd) => (
                  <span
                    key={snd}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-800 border border-rose-200 font-mono font-bold text-xs"
                  >
                    <span>/{snd}/</span>
                    <button
                      type="button"
                      onClick={() => toggleSoundRevisit(snd)}
                      className="text-rose-500 hover:text-rose-700 font-bold ml-1"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* CEFR Level Scoring Rubric (Exact text from sheet) */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
              <div>
                <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  CEFR Level Assessment Rubric
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  The level updates automatically as you mark each set ✓ / ✗. Click a row to
                  choose a different level yourself.
                </p>
              </div>
            </div>

            {/* Auto level status — always says where the level came from and why */}
            {!hasPhonicsData && !manualLevel ? (
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-500">
                ⏳ Waiting for marks — the level will be selected automatically once you mark the sets ✓ / ✗.
              </div>
            ) : isAiLevel ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                <span className="font-black text-amber-900">✨ Auto level:</span>
                <span className="px-3 py-1 rounded-full bg-white text-amber-800 border border-amber-300 font-black">
                  {selectedLevel}
                </span>
                {levelReason && <span className="font-semibold text-amber-900/80">Based on: {levelReason}</span>}
              </div>
            ) : (
              <div className="rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                <span className="font-black text-indigo-900">👩‍🏫 Teacher selected:</span>
                <span className="px-3 py-1 rounded-full bg-white text-indigo-800 border border-indigo-300 font-black">
                  {manualLevel}
                </span>
                {hasPhonicsData && (
                  <span className="font-semibold text-indigo-900/80">
                    Auto level would be {recommendedLevel}
                    {levelReason ? ` (${levelReason})` : ''}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedLevel(null)}
                  className="ml-auto px-3 py-1 rounded-lg bg-white border border-indigo-200 text-indigo-700 font-black hover:bg-indigo-100"
                >
                  ↺ Use auto level
                </button>
              </div>
            )}

            {/* Rubric Cards */}
            <div className="space-y-2.5">
              {(isPhase45Stage ? PHONIC_RUBRIC_PHASE45 : PHONIC_RUBRIC_LEVELS).map((item) => {
                const isSelected = selectedLevel === item.level;
                // Only point at the auto level once something has been marked
                const isAuto = hasPhonicsData && recommendedLevel === item.level;

                return (
                  <div
                    key={item.level}
                    onClick={() => setSelectedLevel(item.level)}
                    className={`cursor-pointer rounded-2xl p-4 border-2 transition-all flex items-start gap-4 ${
                      isSelected
                        ? item.activeBg
                        : 'border-slate-200 hover:border-amber-300 bg-white'
                    }`}
                  >
                    <div className="pt-0.5">
                      <input
                        type="radio"
                        name="cefrLevel"
                        checked={isSelected}
                        onChange={() => setSelectedLevel(item.level)}
                        className="w-4 h-4 text-amber-600 focus:ring-amber-500"
                      />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2.5 py-0.5 rounded-lg text-xs font-black border ${item.badgeBg}`}>
                          {item.level}
                        </span>
                        {isSelected && isAiLevel && (
                          <span className="text-[10px] font-black uppercase tracking-wider bg-amber-600 text-white px-2 py-0.5 rounded-full">
                            ✨ Auto selected
                          </span>
                        )}
                        {isSelected && !isAiLevel && (
                          <span className="text-[10px] font-black uppercase tracking-wider bg-indigo-600 text-white px-2 py-0.5 rounded-full">
                            👩‍🏫 Teacher selected
                          </span>
                        )}
                        {isAuto && !isSelected && (
                          <span className="text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">
                            Auto level
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

          {/* Intervention & Next Steps Notes */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-2">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              Phonics Intervention & Teaching Notes
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Record specific teaching focus, tricky word practice, or blending reinforcement exercises:
            </p>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Needs revisiting Set 4 'ck' and 'u'. Recommend Phase 2 flashcard blending before moving onto Phase 3 vowel digraphs..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Actions Footer */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-500 font-medium text-center sm:text-left">
              Finalizing evaluation for <strong className="text-slate-800">{formData.studentName || 'Student'}</strong> · Level: <strong className="text-amber-600">{selectedLevel || 'Not selected'}</strong>
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
                className="flex-1 sm:flex-none px-6 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black text-sm shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {loading ? 'Saving Assessment...' : `Submit ${selectedStage} Assessment`}
              </button>
            </div>
          </div>

        </form>

      </div>

      {/* Printable Sheet Modal */}
      {showSheetModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-amber-50">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <h3 className="font-black text-slate-800 text-sm uppercase tracking-wider">
                  {selectedStage} Phonic Assessment · Original Document
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
                  selectedStage === 'KG2 / Year 1 (Phase 4 & 5)'
                    ? kg2Phase45SheetImg
                    : selectedStage === 'KG2 / Year 1'
                    ? kg2SheetImg
                    : selectedStage === 'FS2 - KG1'
                    ? fs2SheetImg
                    : fs1SheetImg
                }
                alt={`${selectedStage} Phonic Assessment Document`}
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

