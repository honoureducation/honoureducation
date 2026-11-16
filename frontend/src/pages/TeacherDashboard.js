import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { authService } from '../services/authService';
import { assessmentAPI } from '../services/api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList
} from 'recharts';
import Chart from 'react-apexcharts';

// Helper for identifying Primary vs Secondary assessments
const isPrimaryAssessment = (a) => {
  if (!a) return false;
  if (a.schoolTier === 'primary') return true;
  if (a.schoolTier === 'secondary') return false;
  const type = (a.assessmentType || '').toLowerCase();
  const yg = (a.yearGroupAndClass || '').toLowerCase();
  return (
    type.includes('fs') ||
    type.includes('kg') ||
    type.includes('year 1') ||
    type.includes('phonic') ||
    type.startsWith('primary') ||
    yg.includes('fs') ||
    yg.includes('kg') ||
    yg.startsWith('y1') ||
    yg.includes('year 1') ||
    yg.includes('grade 1')
  );
};

// Helper for retrieving display score safely
const getDisplayScore = (a) => {
  let score = a.totalScore;
  const type = (a.assessmentType || '').toLowerCase();
  const WRITING_SCORES = [4, 8, 12, 15, 17, 20];

  if (score !== undefined && score !== null && score >= 0) {
    // Secondary writing was 0-5 mapping to 4, 8, 12...
    if (score <= 5 && type.includes('writing') && !type.includes('fs') && !type.includes('kg') && !type.includes('primary')) {
      return WRITING_SCORES[score] || 0;
    }
    return score;
  }

  const lvl = a.cefrLevel || a.level || 'A1';
  const baseLvl = lvl.substring(0, 2);
  const idx = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].indexOf(baseLvl);
  return idx >= 0 ? WRITING_SCORES[idx] : 5;
};

// Custom tooltip for Recharts to show CEFR level
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const getCefrStr = (score) => {
      if (score === 0) return 'N/A';
      if (score >= 18) return 'C2 / B2-C1';
      if (score >= 16) return 'C1';
      if (score >= 13) return 'B2 / B1.2-B1.3';
      if (score >= 9) return 'B1 / A2.3-B1.1';
      if (score >= 5) return 'A2 / A2.0-A2.2';
      return 'A1 / A1.0-A1.2';
    };
    return (
      <div className="bg-white p-3 border border-slate-100 shadow-xl rounded-xl shadow-blue-500/10 min-w-[150px]">
        <p className="font-bold text-slate-800 mb-2 uppercase tracking-wide text-[10px]">{label}</p>
        <div className="space-y-1.5">
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center justify-between gap-4 text-[11px] font-bold pb-1 border-b border-slate-50 last:border-b-0 last:pb-0">
              <span className="flex items-center gap-1.5" style={{ color: entry.color }}>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></span>
                {entry.name}: {entry.value}
              </span>
              {entry.value > 0 && (
                <span className="px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded text-[9px]">
                  {getCefrStr(entry.value)}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

// Custom label for putting score numbers on top of Recharts bars
const renderCustomBarLabel = (props) => {
  const { x, y, width, value } = props;
  if (!value || value === 0) return null;
  const cx = x + width / 2;
  return (
    <text x={cx} y={y - 6} fill="#64748b" textAnchor="middle" fontSize="10" fontWeight="bold">
      {value}
    </text>
  );
};

// Assessment action cards for Primary
const PRIMARY_ACTION_CARDS = [
  {
    id: 'primary-listening',
    title: 'Listening Assessment',
    badge: 'FS1 · FS2 · KG2 · Year 2',
    description: '10 personal questions with oral evaluation and CEFR scoring across FS1, FS2, KG2 / Year 1, and Grade 1 / Year 2.',
    icon: '🎧',
    color: 'bg-cyan-500',
    lightBg: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    route: '/assessment/primary-listening'
  },
  {
    id: 'primary-speaking',
    title: 'Speaking Assessment',
    badge: 'FS1 · FS2 · KG2 / Y1',
    description: 'Comprehension questions with family meal picture prompt and CEFR level evaluation (Pre-A1 to B2-C1).',
    icon: '🎙️',
    color: 'bg-purple-500',
    lightBg: 'bg-purple-50 text-purple-700 border-purple-200',
    route: '/assessment/primary-speaking'
  },
  {
    id: 'primary-reading',
    title: 'Reading Assessment',
    badge: 'FS1 · FS2 · KG2 / Y1',
    description: '6 CVC picture cards with sound blending, phonics decoding, and CEFR level scoring (Pre-A1 to B2-C1).',
    icon: '📖',
    color: 'bg-emerald-500',
    lightBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    route: '/assessment/primary-reading'
  },
  {
    id: 'primary-writing',
    title: 'Writing Assessment',
    badge: 'FS1 · FS2 · KG2 / Y1 · AI',
    description: 'FS1 CVC prompts, FS2 & KG2 / Year 1 picture story with real-time AI keyword detection and rubric.',
    icon: '✏️',
    color: 'bg-pink-500',
    lightBg: 'bg-pink-50 text-pink-700 border-pink-200',
    route: '/assessment/primary-writing'
  },
  {
    id: 'primary-phonic',
    title: 'Phonic Assessment',
    badge: 'FS1 · FS2 · KG2 (Phase 2–5)',
    description: 'Systematic synthetic phonics across Phase 2, Phase 3, Phase 4 consonant blends, and Phase 5 alternative spellings.',
    icon: '🔤',
    color: 'bg-amber-500',
    lightBg: 'bg-amber-50 text-amber-700 border-amber-200',
    route: '/assessment/primary-phonic'
  }
];

// Assessment action cards for Secondary
const SECONDARY_ACTION_CARDS = [
  {
    id: 'listening',
    title: 'Listening Assessment',
    badge: 'Year 7–13 · Junior & Senior',
    description: 'Comprehensive evaluation of auditory comprehension across CEFR levels.',
    icon: '🎧',
    color: 'bg-cyan-500',
    lightBg: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    route: '/assessment/listening'
  },
  {
    id: 'speaking',
    title: 'Speaking Assessment',
    badge: 'Year 7–13 · Junior & Senior',
    description: 'Assess verbal fluency, pronunciation, and interactive communication.',
    icon: '🎙️',
    color: 'bg-purple-500',
    lightBg: 'bg-purple-50 text-purple-700 border-purple-200',
    route: '/assessment/speaking'
  },
  {
    id: 'reading',
    title: 'Reading Assessment',
    badge: 'Year 7–13 · Junior & Senior',
    description: 'Evaluate textual comprehension, vocabulary usage, and speed.',
    icon: '📖',
    color: 'bg-emerald-500',
    lightBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    route: '/assessment/reading'
  },
  {
    id: 'writing',
    title: 'Writing Assessment',
    badge: 'Year 7–13 · Junior & Senior',
    description: 'Assess grammatical accuracy, structure, and written expression.',
    icon: '✏️',
    color: 'bg-pink-500',
    lightBg: 'bg-pink-50 text-pink-700 border-pink-200',
    route: '/assessment/writing'
  }
];

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Read initial school tier from: 1. URL search param (?tier=primary), 2. localStorage, 3. fallback 'primary'
  const getInitialTier = () => {
    const fromUrl = searchParams.get('tier') || searchParams.get('stage') || searchParams.get('school');
    if (fromUrl && (fromUrl.toLowerCase() === 'primary' || fromUrl.toLowerCase() === 'secondary' || fromUrl.toLowerCase() === 'all')) {
      return fromUrl.toLowerCase();
    }
    const saved = localStorage.getItem('assessmentSchoolTier');
    if (saved && (saved === 'primary' || saved === 'secondary' || saved === 'all')) {
      return saved;
    }
    return 'primary';
  };

  const [activeTier, setActiveTier] = useState(getInitialTier);
  const [user, setUser] = useState(null);
  const [allAssessments, setAllAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState('');

  // Sync state if URL changes
  useEffect(() => {
    const fromUrl = searchParams.get('tier') || searchParams.get('stage') || searchParams.get('school');
    if (fromUrl && (fromUrl.toLowerCase() === 'primary' || fromUrl.toLowerCase() === 'secondary' || fromUrl.toLowerCase() === 'all')) {
      const normalized = fromUrl.toLowerCase();
      setActiveTier(normalized);
      if (normalized !== 'all') {
        localStorage.setItem('assessmentSchoolTier', normalized);
      }
    }
  }, [searchParams]);

  const handleTierChange = (newTier) => {
    setActiveTier(newTier);
    if (newTier !== 'all') {
      localStorage.setItem('assessmentSchoolTier', newTier);
    }
    const updated = new URLSearchParams(searchParams);
    updated.set('tier', newTier);
    setSearchParams(updated, { replace: true });
  };

  useEffect(() => {
    loadDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const currentUser = authService.getCurrentUser();
      setUser(currentUser);

      const assessments = await assessmentAPI.getAllAssessments();
      setAllAssessments(assessments);
    } catch (error) {
      toast.error('Failed to load dashboard data');
      console.error('Dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Group assessments by school tier
  const primaryAssessments = useMemo(
    () => allAssessments.filter(isPrimaryAssessment),
    [allAssessments]
  );
  const secondaryAssessments = useMemo(
    () => allAssessments.filter((a) => !isPrimaryAssessment(a)),
    [allAssessments]
  );

  // Active dataset according to selected tier
  const currentAssessments = useMemo(() => {
    if (activeTier === 'primary') return primaryAssessments;
    if (activeTier === 'secondary') return secondaryAssessments;
    return allAssessments;
  }, [activeTier, primaryAssessments, secondaryAssessments, allAssessments]);

  // Students available in current tier
  const students = useMemo(() => {
    return Array.from(new Set(currentAssessments.map((a) => a.studentName)))
      .filter(Boolean)
      .sort();
  }, [currentAssessments]);

  // Auto-select first student when list changes
  useEffect(() => {
    if (students.length > 0) {
      if (!selectedStudent || !students.includes(selectedStudent)) {
        setSelectedStudent(students[0]);
      }
    } else {
      setSelectedStudent('');
    }
  }, [students, selectedStudent]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calculate stats for current tier
  const getAssessmentStats = (list) => {
    const stats = {
      total: list.length,
      thisWeek: 0,
      byType: {},
      phonicsCount: 0,
    };

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    list.forEach(assessment => {
      if (new Date(assessment.createdAt) > oneWeekAgo) {
        stats.thisWeek++;
      }
      const type = assessment.assessmentType || 'Other';
      stats.byType[type] = (stats.byType[type] || 0) + 1;
      if (type.toLowerCase().includes('phonic')) {
        stats.phonicsCount++;
      }
    });

    return stats;
  };

  const getChartData = (dataToProcess, tier = activeTier) => {
    const isPrimaryMode = tier === 'primary';

    // 1. Termly Data by Subject
    const termlyData = isPrimaryMode ? [
      { name: 'Phonics', T1: 0, T2: 0, T3: 0, count: { T1: 0, T2: 0, T3: 0 } },
      { name: 'Reading', T1: 0, T2: 0, T3: 0, count: { T1: 0, T2: 0, T3: 0 } },
      { name: 'Writing', T1: 0, T2: 0, T3: 0, count: { T1: 0, T2: 0, T3: 0 } },
      { name: 'Speaking', T1: 0, T2: 0, T3: 0, count: { T1: 0, T2: 0, T3: 0 } },
      { name: 'Listening', T1: 0, T2: 0, T3: 0, count: { T1: 0, T2: 0, T3: 0 } },
    ] : tier === 'all' ? [
      { name: 'Phonics', T1: 0, T2: 0, T3: 0, count: { T1: 0, T2: 0, T3: 0 } },
      { name: 'Reading', T1: 0, T2: 0, T3: 0, count: { T1: 0, T2: 0, T3: 0 } },
      { name: 'Writing', T1: 0, T2: 0, T3: 0, count: { T1: 0, T2: 0, T3: 0 } },
      { name: 'Speaking', T1: 0, T2: 0, T3: 0, count: { T1: 0, T2: 0, T3: 0 } },
      { name: 'Listening', T1: 0, T2: 0, T3: 0, count: { T1: 0, T2: 0, T3: 0 } },
    ] : [
      { name: 'Reading', T1: 0, T2: 0, T3: 0, count: { T1: 0, T2: 0, T3: 0 } },
      { name: 'Writing', T1: 0, T2: 0, T3: 0, count: { T1: 0, T2: 0, T3: 0 } },
      { name: 'Speaking', T1: 0, T2: 0, T3: 0, count: { T1: 0, T2: 0, T3: 0 } },
      { name: 'Listening', T1: 0, T2: 0, T3: 0, count: { T1: 0, T2: 0, T3: 0 } },
    ];

    dataToProcess.forEach(a => {
      const term = (a.term || 'T1').toUpperCase();
      const type = (a.assessmentType || '').toLowerCase();
      const score = getDisplayScore(a);

      let index = -1;
      if (isPrimaryMode || tier === 'all') {
        if (type.includes('phonic')) index = 0;
        else if (type.includes('reading')) index = 1;
        else if (type.includes('writing')) index = 2;
        else if (type.includes('speaking')) index = 3;
        else if (type.includes('listening')) index = 4;
      } else {
        if (type.includes('reading')) index = 0;
        else if (type.includes('writing')) index = 1;
        else if (type.includes('speaking')) index = 2;
        else if (type.includes('listening')) index = 3;
      }

      if (index !== -1 && termlyData[index] && termlyData[index].count[term] !== undefined) {
        termlyData[index][term] += score;
        termlyData[index].count[term] += 1;
      }
    });

    const finalTermlyData = termlyData.map(item => ({
      name: item.name,
      T1: item.count.T1 > 0 ? parseFloat((item.T1 / item.count.T1).toFixed(1)) : 0,
      T2: item.count.T2 > 0 ? parseFloat((item.T2 / item.count.T2).toFixed(1)) : 0,
      T3: item.count.T3 > 0 ? parseFloat((item.T3 / item.count.T3).toFixed(1)) : 0,
    }));

    // 2. CEFR Level Distribution By Skill (Stacked Bar Chart)
    // Primary levels: Pre-A1, A1.0–A1.2, A2.0–A2.2, A2.3–B1.1, B1.2–B1.3, B2–C1
    // Secondary levels: A1, A2, B1, B2, C1, C2
    let levelSkillCounts = {};
    if (isPrimaryMode) {
      levelSkillCounts = {
        'Pre-A1': { name: 'Pre-A1', Phonics: 0, Reading: 0, Writing: 0, Speaking: 0, Listening: 0 },
        'A1.0–A1.2': { name: 'A1.0–A1.2', Phonics: 0, Reading: 0, Writing: 0, Speaking: 0, Listening: 0 },
        'A2.0–A2.2': { name: 'A2.0–A2.2', Phonics: 0, Reading: 0, Writing: 0, Speaking: 0, Listening: 0 },
        'A2.3–B1.1': { name: 'A2.3–B1.1', Phonics: 0, Reading: 0, Writing: 0, Speaking: 0, Listening: 0 },
        'B1.2–B1.3': { name: 'B1.2–B1.3', Phonics: 0, Reading: 0, Writing: 0, Speaking: 0, Listening: 0 },
        'B2–C1': { name: 'B2–C1', Phonics: 0, Reading: 0, Writing: 0, Speaking: 0, Listening: 0 },
      };
    } else {
      levelSkillCounts = {
        'A1': { name: 'A1', Reading: 0, Writing: 0, Speaking: 0, Listening: 0 },
        'A2': { name: 'A2', Reading: 0, Writing: 0, Speaking: 0, Listening: 0 },
        'B1': { name: 'B1', Reading: 0, Writing: 0, Speaking: 0, Listening: 0 },
        'B2': { name: 'B2', Reading: 0, Writing: 0, Speaking: 0, Listening: 0 },
        'C1': { name: 'C1', Reading: 0, Writing: 0, Speaking: 0, Listening: 0 },
        'C2': { name: 'C2', Reading: 0, Writing: 0, Speaking: 0, Listening: 0 },
      };
    }

    dataToProcess.forEach(a => {
      const rawLvl = (a.cefrLevel || a.level || '').trim();
      const type = (a.assessmentType || '').toLowerCase();

      let targetLvl = '';
      if (isPrimaryMode) {
        if (rawLvl.includes('Pre') || rawLvl.includes('pre') || rawLvl === 'Pre-A1') targetLvl = 'Pre-A1';
        else if (rawLvl.includes('A1.0') || rawLvl.includes('A1.2') || rawLvl === 'A1') targetLvl = 'A1.0–A1.2';
        else if (rawLvl.includes('A2.0') || rawLvl.includes('A2.2') || rawLvl === 'A2') targetLvl = 'A2.0–A2.2';
        else if (rawLvl.includes('A2.3') || rawLvl.includes('B1.1')) targetLvl = 'A2.3–B1.1';
        else if (rawLvl.includes('B1.2') || rawLvl.includes('B1.3') || rawLvl === 'B1') targetLvl = 'B1.2–B1.3';
        else if (rawLvl.includes('B2') || rawLvl.includes('C1')) targetLvl = 'B2–C1';
        else targetLvl = 'Pre-A1';
      } else {
        const base = rawLvl.substring(0, 2);
        if (['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].includes(base)) targetLvl = base;
        else {
          const grades = { 'A': 'A1', 'B': 'A2', 'C': 'B1', 'D': 'B2', 'E': 'C1' };
          targetLvl = grades[rawLvl.substring(0, 1)] || 'A1';
        }
      }

      if (levelSkillCounts[targetLvl]) {
        if (type.includes('phonic') && levelSkillCounts[targetLvl].Phonics !== undefined) levelSkillCounts[targetLvl].Phonics++;
        else if (type.includes('reading')) levelSkillCounts[targetLvl].Reading++;
        else if (type.includes('writing')) levelSkillCounts[targetLvl].Writing++;
        else if (type.includes('speaking')) levelSkillCounts[targetLvl].Speaking++;
        else if (type.includes('listening')) levelSkillCounts[targetLvl].Listening++;
      }
    });

    const distributionData = Object.values(levelSkillCounts);

    // 3. Donut Counts
    const donutCounts = {};
    Object.keys(levelSkillCounts).forEach(k => { donutCounts[k] = 0; });
    dataToProcess.forEach(a => {
      const rawLvl = (a.cefrLevel || a.level || '').trim();
      let targetLvl = '';
      if (isPrimaryMode) {
        if (rawLvl.includes('Pre') || rawLvl.includes('pre') || rawLvl === 'Pre-A1') targetLvl = 'Pre-A1';
        else if (rawLvl.includes('A1.0') || rawLvl.includes('A1.2') || rawLvl === 'A1') targetLvl = 'A1.0–A1.2';
        else if (rawLvl.includes('A2.0') || rawLvl.includes('A2.2') || rawLvl === 'A2') targetLvl = 'A2.0–A2.2';
        else if (rawLvl.includes('A2.3') || rawLvl.includes('B1.1')) targetLvl = 'A2.3–B1.1';
        else if (rawLvl.includes('B1.2') || rawLvl.includes('B1.3') || rawLvl === 'B1') targetLvl = 'B1.2–B1.3';
        else if (rawLvl.includes('B2') || rawLvl.includes('C1')) targetLvl = 'B2–C1';
        else targetLvl = 'Pre-A1';
      } else {
        const base = rawLvl.substring(0, 2);
        if (['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].includes(base)) targetLvl = base;
        else {
          const grades = { 'A': 'A1', 'B': 'A2', 'C': 'B1', 'D': 'B2', 'E': 'C1' };
          targetLvl = grades[rawLvl.substring(0, 1)] || 'A1';
        }
      }
      if (donutCounts[targetLvl] !== undefined) donutCounts[targetLvl]++;
    });

    const overallDistributionData = Object.keys(donutCounts)
      .map(key => ({ name: key, count: donutCounts[key] }))
      .filter(d => d.count > 0);

    // 4. Student Termly Averages
    const studentStats = {};
    dataToProcess.forEach(a => {
      const term = (a.term || 'T1').toUpperCase();
      const sName = a.studentName || 'Unknown';
      const score = getDisplayScore(a);

      if (!studentStats[sName]) {
        studentStats[sName] = { name: sName, T1: 0, T2: 0, T3: 0, count: { T1: 0, T2: 0, T3: 0 } };
      }
      studentStats[sName][term] += score;
      studentStats[sName].count[term] += 1;
    });

    const studentTermlyData = Object.values(studentStats).map(item => ({
      name: item.name,
      T1: item.count.T1 > 0 ? parseFloat((item.T1 / item.count.T1).toFixed(1)) : 0,
      T2: item.count.T2 > 0 ? parseFloat((item.T2 / item.count.T2).toFixed(1)) : 0,
      T3: item.count.T3 > 0 ? parseFloat((item.T3 / item.count.T3).toFixed(1)) : 0,
    }));

    return {
      termlyData: finalTermlyData,
      distributionData,
      overallDistributionData,
      studentTermlyData
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner w-8 h-8 mx-auto mb-4"></div>
          <p className="text-slate-600 font-semibold">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const stats = getAssessmentStats(currentAssessments);
  const selectedStudentData = currentAssessments.filter(a => a.studentName === selectedStudent);
  const studentChartData = getChartData(selectedStudentData, activeTier);
  const overallChartData = getChartData(currentAssessments, activeTier);

  // Active action cards (Primary vs Secondary vs All)
  const activeActionCards =
    activeTier === 'primary'
      ? PRIMARY_ACTION_CARDS
      : activeTier === 'secondary'
      ? SECONDARY_ACTION_CARDS
      : [...PRIMARY_ACTION_CARDS, ...SECONDARY_ACTION_CARDS];

  // Helper for counting matching records for each action card
  const getCardRecordCount = (card) => {
    const isPrimCard = card.id.startsWith('primary');
    return allAssessments.filter(a => {
      const matchesTier = isPrimCard ? isPrimaryAssessment(a) : !isPrimaryAssessment(a);
      const type = (a.assessmentType || '').toLowerCase();
      let matchesType = false;
      if (card.id.includes('listening')) matchesType = type.includes('listening');
      else if (card.id.includes('speaking')) matchesType = type.includes('speaking');
      else if (card.id.includes('reading')) matchesType = type.includes('reading');
      else if (card.id.includes('writing')) matchesType = type.includes('writing');
      else if (card.id.includes('phonic')) matchesType = type.includes('phonic');
      return matchesTier && matchesType;
    }).length;
  };

  // Assessment Distribution Bar Data
  const typeDistributionData = activeActionCards.map(c => ({
    name: c.title.replace(' Assessment', ''),
    count: getCardRecordCount(c),
    color: c.color.replace('bg-', '')
  }));

  // CEFR Badge style helper
  const getCefrBadge = (lvl) => {
    const l = (lvl || '').trim();
    if (l.includes('Pre') || l === 'Pre-A1') return 'bg-red-50 text-red-700 border-red-200';
    if (l.includes('A1.0') || l.includes('A1.2') || l === 'A1') return 'bg-orange-50 text-orange-700 border-orange-200';
    if (l.includes('A2.0') || l.includes('A2.2') || l === 'A2') return 'bg-amber-50 text-amber-700 border-amber-200';
    if (l.includes('A2.3') || l.includes('B1.1') || l === 'B1') return 'bg-blue-50 text-blue-700 border-blue-200';
    if (l.includes('B1.2') || l.includes('B1.3') || l === 'B2') return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    if (l.includes('B2') || l.includes('C1') || l === 'C1' || l === 'C2') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    return 'bg-slate-50 text-slate-700 border-slate-200';
  };

  // Stage Badge helper
  const getStageBadge = (a) => {
    const isPrim = isPrimaryAssessment(a);
    const type = (a.assessmentType || '').toUpperCase();
    const yg = (a.yearGroupAndClass || '').toUpperCase();

    if (isPrim) {
      let stageText = 'FS1';
      if (type.includes('FS2') || yg.includes('FS2') || type.includes('KG1') || yg.includes('KG1')) stageText = 'FS2 - KG1';
      else if (type.includes('KG2') || type.includes('YEAR 1') || yg.includes('KG2') || yg.includes('YEAR 1')) stageText = 'KG2 / Year 1';
      else if (type.includes('FS1') || yg.includes('FS1')) stageText = 'FS1';
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-pink-50 text-pink-700 border border-pink-200">
          🎒 {stageText}
        </span>
      );
    } else {
      let stageText = 'Year 7–9';
      if (type.includes('SENIOR') || yg.includes('10') || yg.includes('11') || yg.includes('12') || yg.includes('13')) stageText = 'Year 10–13';
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-50 text-blue-700 border border-blue-200">
          🎓 {stageText}
        </span>
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                <span className="text-blue-700 font-black text-xs uppercase tracking-widest">
                  Honour Education Dashboard
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-xs font-bold text-slate-500">
                  {activeTier === 'primary'
                    ? '🎒 Primary School (FS1 · FS2 - KG1 · KG2 / Year 1)'
                    : activeTier === 'secondary'
                    ? '🎓 Secondary School (Year 7–13)'
                    : '🌐 Combined All Tiers'}
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
                Welcome back, {user?.firstName || 'Teacher'}!
              </h1>
              <p className="text-slate-500 mt-2 font-medium flex items-center gap-2 text-sm">
                <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                {user?.school || 'Honour Education'} <span className="text-slate-300">|</span> {user?.department || 'Academic Department'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() =>
                  navigate(
                    activeTier === 'primary'
                      ? '/assessments?tier=primary'
                      : '/assessments?tier=secondary'
                  )
                }
                className="btn-primary flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md hover:shadow-blue-500/20"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                New {activeTier === 'primary' ? 'Primary' : activeTier === 'secondary' ? 'Secondary' : ''} Assessment
              </button>
              <button
                onClick={() => navigate('/profile')}
                className="btn-secondary flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm border border-slate-200 hover:bg-slate-50 transition-all"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                My Profile
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* ========================================== */}
        {/* 🎒 SCHOOL TIER SWITCHER (PRIMARY / SECONDARY / ALL) */}
        {/* ========================================== */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 pl-2">
              School Tier:
            </span>
            <div className="inline-flex bg-slate-100 p-1.5 rounded-2xl shadow-inner gap-1">
              {/* PRIMARY TOGGLE */}
              <button
                onClick={() => handleTierChange('primary')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 ${
                  activeTier === 'primary'
                    ? 'bg-white text-pink-700 shadow-sm scale-[1.02]'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <span>🎒 Primary School</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    activeTier === 'primary'
                      ? 'bg-pink-100 text-pink-800'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {primaryAssessments.length}
                </span>
              </button>

              {/* SECONDARY TOGGLE */}
              <button
                onClick={() => handleTierChange('secondary')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 ${
                  activeTier === 'secondary'
                    ? 'bg-white text-blue-700 shadow-sm scale-[1.02]'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <span>🎓 Secondary School</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    activeTier === 'secondary'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {secondaryAssessments.length}
                </span>
              </button>

              {/* ALL TOGGLE */}
              <button
                onClick={() => handleTierChange('all')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 ${
                  activeTier === 'all'
                    ? 'bg-white text-indigo-700 shadow-sm scale-[1.02]'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <span>🌐 All</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    activeTier === 'all'
                      ? 'bg-indigo-100 text-indigo-800'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {allAssessments.length}
                </span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 pr-2">
            {activeTier === 'primary' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-50 text-pink-700 border border-pink-200 text-xs font-black">
                🌸 FS1 · FS2 - KG1 · KG2 / Year 1
              </span>
            )}
            {activeTier === 'secondary' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-black">
                📘 Year 7–9 (Junior) · Year 10–13 (Senior)
              </span>
            )}
            {activeTier === 'all' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-black">
                ✨ Unified School Portfolio
              </span>
            )}
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="stat-card bg-indigo-50 border-indigo-200">
            <div className="stat-icon bg-indigo-100 text-indigo-600">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <div className="stat-value text-indigo-600">{students.length}</div>
              <div className="stat-label">
                {activeTier === 'primary' ? 'Primary Students' : activeTier === 'secondary' ? 'Secondary Students' : 'Total Students'}
              </div>
            </div>
          </div>

          <div className={`stat-card ${activeTier === 'primary' ? 'bg-pink-50 border-pink-200' : 'bg-blue-50 border-blue-200'}`}>
            <div className={`stat-icon ${activeTier === 'primary' ? 'bg-pink-100 text-pink-600' : 'bg-blue-100 text-blue-600'}`}>
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 0 012 2" />
              </svg>
            </div>
            <div>
              <div className={`stat-value ${activeTier === 'primary' ? 'text-pink-600' : 'text-blue-600'}`}>
                {stats.total}
              </div>
              <div className="stat-label">
                {activeTier === 'primary' ? 'Primary Assessments' : activeTier === 'secondary' ? 'Secondary Assessments' : 'Total Assessments'}
              </div>
            </div>
          </div>

          <div className="stat-card bg-emerald-50 border-emerald-200">
            <div className="stat-icon bg-emerald-100 text-emerald-600">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <div className="stat-value text-emerald-600">{stats.thisWeek}</div>
              <div className="stat-label">This Week</div>
            </div>
          </div>

          <div className="stat-card bg-amber-50 border-amber-200">
            <div className="stat-icon bg-amber-100 text-amber-600">
              <span className="text-xl font-black">
                {activeTier === 'primary' ? '🔤' : '⭐'}
              </span>
            </div>
            <div>
              <div className="stat-value text-amber-600">
                {activeTier === 'primary' ? stats.phonicsCount : user?.teachingExperience || 0}
              </div>
              <div className="stat-label">
                {activeTier === 'primary' ? 'Phonics Evaluations' : 'Years Experience'}
              </div>
            </div>
          </div>
        </div>

        {/* Analytics Section */}
        <div className="space-y-8">

          {/* Individual Student Report */}
          <div className="card-section bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Individual Student Performance
                  {activeTier === 'primary' && <span className="text-xs font-bold text-pink-600">(Primary Cohort)</span>}
                  {activeTier === 'secondary' && <span className="text-xs font-bold text-blue-600">(Secondary Cohort)</span>}
                </h2>
                <p className="text-slate-500 text-sm">Select a student to view their detailed termly score progression and assessment history.</p>
              </div>
              <div className="w-full md:w-72">
                <select
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 text-slate-700 font-bold shadow-inner transition-all"
                >
                  <option value="">Select a student...</option>
                  {students.map(student => (
                    <option key={student} value={student}>{student}</option>
                  ))}
                </select>
              </div>
            </div>

            {selectedStudent ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8">
                  <div className="h-[350px] w-full bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={studentChartData.termlyData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 700 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f1f5f9' }} />
                        <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                        <Bar dataKey="T1" name="Term 1" fill="#4f46e5" radius={[6, 6, 0, 0]} barSize={20}>
                          <LabelList dataKey="T1" content={renderCustomBarLabel} />
                        </Bar>
                        <Bar dataKey="T2" name="Term 2" fill="#ef4444" radius={[6, 6, 0, 0]} barSize={20}>
                          <LabelList dataKey="T2" content={renderCustomBarLabel} />
                        </Bar>
                        <Bar dataKey="T3" name="Term 3" fill="#f59e0b" radius={[6, 6, 0, 0]} barSize={20}>
                          <LabelList dataKey="T3" content={renderCustomBarLabel} />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="lg:col-span-4">
                  <div className="bg-indigo-50/50 rounded-2xl p-6 border border-indigo-100 h-full flex flex-col justify-between">
                    <div>
                      <h3 className="text-xs font-black text-indigo-900 mb-4 uppercase tracking-widest flex items-center justify-between">
                        <span>Recent Assessments</span>
                        <span className="text-[10px] font-bold text-indigo-600 bg-white px-2 py-0.5 rounded-full border border-indigo-200">
                          {selectedStudentData.length} Total
                        </span>
                      </h3>
                      <div className="space-y-3 max-h-[280px] overflow-y-auto pr-2 custom-scrollbar">
                        {selectedStudentData.length === 0 ? (
                          <p className="text-slate-400 text-sm italic py-10 text-center">No records found for this student.</p>
                        ) : selectedStudentData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map((a, i) => (
                          <div key={i} className="bg-white p-3.5 rounded-xl border border-indigo-100 shadow-2xs hover:border-indigo-300 transition-colors">
                            <div className="flex justify-between items-start mb-1">
                              <p className="text-xs font-bold text-slate-900 leading-tight">{a.assessmentType}</p>
                              <span className="px-1.5 py-0.5 bg-indigo-600 text-white text-[10px] font-black rounded-md ml-2 shrink-0">
                                {getDisplayScore(a)} Pts
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-[10px] mt-1 pt-1 border-t border-slate-50">
                              <span className="text-slate-400 font-bold uppercase">{a.term || 'T1'} · {formatDate(a.createdAt).split(',')[0]}</span>
                              <span className={`px-2 py-0.5 rounded-md font-black ${getCefrBadge(a.cefrLevel || a.level)}`}>
                                {a.cefrLevel || a.level || 'Pre-A1'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-[250px] flex flex-col items-center justify-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                <div className="w-14 h-14 bg-white rounded-2xl shadow-xs flex items-center justify-center mb-3">
                  <svg className="w-7 h-7 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <p className="text-slate-500 font-bold text-sm">
                  {students.length > 0 ? 'Select a student above to view progress' : 'No students registered for this school tier yet.'}
                </p>
              </div>
            )}
          </div>

          {/* TOTAL CLASS PERFORMANCE */}
          <div className="card-section bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                  <svg className="w-7 h-7 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Total Class Performance
                </h2>
                <p className="text-slate-500 text-sm">
                  Overall class progression across all evaluated subjects and CEFR proficiency breakdown.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8">
                <div className="h-[350px] w-full bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={overallChartData.studentTermlyData.slice(0, 10)}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11, fontWeight: 700 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f1f5f9' }} />
                      <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                      <Bar dataKey="T1" name="Term 1" fill="#4f46e5" radius={[6, 6, 0, 0]} barSize={20}>
                        <LabelList dataKey="T1" content={renderCustomBarLabel} />
                      </Bar>
                      <Bar dataKey="T2" name="Term 2" fill="#ef4444" radius={[6, 6, 0, 0]} barSize={20}>
                        <LabelList dataKey="T2" content={renderCustomBarLabel} />
                      </Bar>
                      <Bar dataKey="T3" name="Term 3" fill="#f59e0b" radius={[6, 6, 0, 0]} barSize={20}>
                        <LabelList dataKey="T3" content={renderCustomBarLabel} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="lg:col-span-4">
                <div className="bg-indigo-50/50 rounded-2xl p-6 border border-indigo-100 h-full">
                  <h3 className="text-xs font-black text-indigo-900 mb-4 uppercase tracking-widest">
                    {activeTier === 'primary' ? 'Primary CEFR Skills Mapping' : 'Secondary CEFR Skills Mapping'}
                  </h3>
                  <div className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart layout="vertical" data={overallChartData.distributionData}>
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10, fontWeight: 800 }} width={75} />
                        <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
                        <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', bottom: -5 }} />
                        {activeTier === 'primary' && <Bar dataKey="Phonics" stackId="a" fill="#f59e0b" />}
                        <Bar dataKey="Reading" stackId="a" fill="#10b981" />
                        <Bar dataKey="Writing" stackId="a" fill="#ec4899" />
                        <Bar dataKey="Speaking" stackId="a" fill="#8b5cf6" />
                        <Bar dataKey="Listening" stackId="a" fill="#06b6d4" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Aggregate Distribution and Types */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="card-section bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
              <h2 className="text-sm font-bold text-slate-400 mb-6 uppercase tracking-widest flex items-center justify-between">
                <span>Class Proficiency Distribution</span>
                <span className="text-xs font-medium bg-slate-100 px-2.5 py-1 rounded-md text-slate-600">
                  {activeTier === 'primary' ? 'Primary CEFR' : 'Secondary CEFR'}
                </span>
              </h2>
              <div className="h-[250px]">
                {overallChartData.overallDistributionData.length > 0 ? (
                  <Chart
                    options={{
                      labels: overallChartData.overallDistributionData.map(d => d.name),
                      colors: ['#ef4444', '#f97316', '#f59e0b', '#3b82f6', '#6366f1', '#10b981'],
                      legend: { position: 'right', fontSize: '11px', fontWeight: 'bold' },
                      dataLabels: {
                        enabled: true,
                        formatter: (val) => `${val.toFixed(1)}%`
                      },
                      tooltip: {
                        y: {
                          formatter: (val) => `${val} assessments`
                        }
                      }
                    }}
                    series={overallChartData.overallDistributionData.map(d => d.count)}
                    type="donut"
                    height={250}
                  />
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-400 text-xs italic">
                    No CEFR distribution data yet.
                  </div>
                )}
              </div>
            </div>

            <div className="card-section bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
              <h2 className="text-sm font-bold text-slate-400 mb-6 uppercase tracking-widest flex items-center justify-between">
                <span>Assessment Records</span>
                <span className="text-xs font-medium bg-slate-100 px-2.5 py-1 rounded-md text-slate-600">
                  By Skill
                </span>
              </h2>
              <div className="h-[250px]">
                <Chart
                  options={{
                    chart: { type: 'bar', height: 250, toolbar: { show: false } },
                    xaxis: {
                      categories: typeDistributionData.map(d => d.name),
                      labels: { style: { fontWeight: 'bold', colors: '#64748b', fontSize: '11px' } }
                    },
                    colors: ['#06b6d4', '#8b5cf6', '#10b981', '#ec4899', '#f59e0b'],
                    plotOptions: { bar: { distributed: true, borderRadius: 6 } },
                    dataLabels: { enabled: true, style: { fontSize: '10px' } },
                    legend: { show: false },
                  }}
                  series={[{ name: 'Records', data: typeDistributionData.map(d => d.count) }]}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ========================================== */}
        {/* CREATE NEW ASSESSMENT SECTION */}
        {/* ========================================== */}
        <div className="card-section bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                {activeTier === 'primary' ? '🎒 Launch Primary Assessment' : activeTier === 'secondary' ? '🎓 Launch Secondary Assessment' : 'Launch Any Assessment'}
              </h2>
              <p className="text-slate-500 text-xs mt-1">
                Choose an assessment to evaluate pupils with structured guidance, picture prompts, and rubric scoring.
              </p>
            </div>
            <Link
              to={activeTier === 'primary' ? '/assessments?tier=primary' : '/assessments?tier=secondary'}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 underline self-start sm:self-auto"
            >
              Open Full Assessment Portal →
            </Link>
          </div>

          <div className={`grid grid-cols-1 md:grid-cols-2 ${activeTier === 'primary' ? 'lg:grid-cols-3' : 'lg:grid-cols-4'} gap-6`}>
            {activeActionCards.map((type) => {
              const records = getCardRecordCount(type);
              return (
                <button
                  key={type.id}
                  onClick={() => navigate(type.route)}
                  className="group text-left bg-slate-50 rounded-2xl border border-slate-100 p-6 hover:bg-white hover:border-blue-200 hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <div className={`w-12 h-12 ${type.color} rounded-2xl flex items-center justify-center text-white text-2xl group-hover:scale-110 transition-transform shadow-md`}>
                        {type.icon}
                      </div>
                      <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${type.lightBg}`}>
                        {type.badge}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-900 mb-1.5 group-hover:text-blue-600 transition-colors text-sm">
                      {type.title}
                    </h3>
                    <p className="text-xs text-slate-500 mb-6 leading-relaxed line-clamp-2">
                      {type.description}
                    </p>
                  </div>
                  <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      {records} Records
                    </span>
                    <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-slate-300 group-hover:text-blue-600 group-hover:bg-blue-50 transition-all">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ========================================== */}
        {/* RECENT ASSESSMENTS TABLE */}
        {/* ========================================== */}
        <div className="card-section bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Recent Assessment Activity
              </h2>
              <p className="text-slate-400 text-xs mt-0.5">
                Showing most recent assessments for {activeTier === 'primary' ? 'Primary School' : activeTier === 'secondary' ? 'Secondary School' : 'All Tiers'}.
              </p>
            </div>
            <button
              onClick={() => navigate('/records')}
              className="px-4 py-2 bg-slate-50 text-slate-600 rounded-xl font-bold text-xs hover:bg-slate-100 transition-all border border-slate-200"
            >
              See All Records
            </button>
          </div>

          {currentAssessments.length === 0 ? (
            <div className="text-center py-16 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4 text-3xl">
                {activeTier === 'primary' ? '🎒' : '🎓'}
              </div>
              <p className="text-slate-500 font-bold mb-2">No {activeTier} assessments found yet</p>
              <p className="text-slate-400 text-xs mb-4">Start your first evaluation to view real-time progression and cohort analytics.</p>
              <button
                onClick={() =>
                  navigate(
                    activeTier === 'primary'
                      ? '/assessments?tier=primary'
                      : '/assessments?tier=secondary'
                  )
                }
                className="btn-primary"
              >
                Create First {activeTier === 'primary' ? 'Primary' : 'Secondary'} Assessment
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="pb-4 font-black text-[10px] text-slate-400 uppercase tracking-widest px-4">Student</th>
                    <th className="pb-4 font-black text-[10px] text-slate-400 uppercase tracking-widest px-4">Tier & Stage</th>
                    <th className="pb-4 font-black text-[10px] text-slate-400 uppercase tracking-widest px-4">Assessment Type</th>
                    <th className="pb-4 font-black text-[10px] text-slate-400 uppercase tracking-widest px-4">CEFR Level</th>
                    <th className="pb-4 font-black text-[10px] text-slate-400 uppercase tracking-widest px-4">Score</th>
                    <th className="pb-4 font-black text-[10px] text-slate-400 uppercase tracking-widest px-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {currentAssessments
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                    .slice(0, 7)
                    .map((assessment) => (
                      <tr key={assessment._id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="py-4 px-4">
                          <div>
                            <p className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors text-sm">
                              {assessment.studentName}
                            </p>
                            <p className="text-[10px] text-slate-400 font-bold">{assessment.yearGroupAndClass}</p>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          {getStageBadge(assessment)}
                        </td>
                        <td className="py-4 px-4">
                          <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold">
                            {assessment.assessmentType}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-black ${getCefrBadge(assessment.cefrLevel || assessment.level)}`}>
                            {assessment.cefrLevel || assessment.level || 'Pre-A1'}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="font-black text-slate-800 text-xs">
                            {getDisplayScore(assessment)} Pts
                          </span>
                        </td>
                        <td className="py-4 px-4 text-xs font-bold text-slate-400">
                          {formatDate(assessment.createdAt)}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Support & Documentation Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
          <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-3xl p-8 text-white shadow-xl shadow-blue-200 overflow-hidden relative group">
            <div className="relative z-10">
              <h3 className="text-2xl font-bold mb-2">Need Assistance?</h3>
              <p className="text-blue-100 mb-6 text-sm">Our support team is here to help you with any questions regarding primary and secondary assessments.</p>
              <button onClick={() => navigate('/contact')} className="px-6 py-3 bg-white text-indigo-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:shadow-lg transition-all active:scale-95">Contact Support</button>
            </div>
            <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
          </div>
          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex flex-col justify-center">
            <h3 className="text-xl font-bold text-slate-800 mb-2">Primary & Secondary Rubrics</h3>
            <p className="text-slate-500 mb-6 text-sm">Learn more about the CEFR descriptors (Pre-A1 to C2), scoring thresholds, and real-time AI keyword criteria.</p>
            <button onClick={() => navigate('/about')} className="text-blue-600 font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:gap-4 transition-all">View Assessment Guide <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7-7 7" /></svg></button>
          </div>
        </div>

      </div>
    </div>
  );
}
