import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { assessmentAPI } from '../services/api';

const LISTENING_P1_QUESTIONS = [
  'What is your name?', 'What is your age?', 'What language do you speak at home?',
  'Where do you live?', 'Have you got brothers and sisters?', 'What hobbies or sports do you like?',
  'How did you come to school today?', 'Did you go to school in another place? Where?',
  'Tell me about your last school.', 'What was your best subject?',
  'What did you not like in school?', 'What will you do after school today?',
  'What would you like to do when you finish school?',
];

const SPEAKING_QUESTIONS_JUNIOR = [
  'What do you see in picture 1?',
  'Can you tell me what happens next after picture 1?',
  'Can you tell the whole story from the first picture to the last one?',
  'Why do you think the team is celebrating at the end, and what helped them succeed?',
  'What does this story show about teamwork and solving problems under pressure?',
  'How could different audiences interpret this story differently, and why?',
];

const TYPE_META = {
  'EAL & ELL': { label: 'EAL & ELL', color: 'bg-purple-100 text-purple-700' },
  'Listening Part 1': { label: 'Listening P1', color: 'bg-blue-100 text-blue-700' },
  'Listening Part 2': { label: 'Listening P2', color: 'bg-cyan-100 text-cyan-700' },
  'Speaking Assessment': { label: 'Speaking', color: 'bg-violet-100 text-violet-700' },
  'Reading Assessment': { label: 'Reading', color: 'bg-emerald-100 text-emerald-700' },
  'Writing Assessment': { label: 'Writing', color: 'bg-amber-100 text-amber-700' },
};

const CEFR_COLORS = {
  A1: 'bg-red-100 text-red-700',
  A2: 'bg-orange-100 text-orange-700',
  B1: 'bg-amber-100 text-amber-700',
  B2: 'bg-blue-100 text-blue-700',
  C1: 'bg-emerald-100 text-emerald-700',
  'C1-C2': 'bg-emerald-100 text-emerald-700',
  C2: 'bg-violet-100 text-violet-700',
};

const AE_COLORS = {
  A: 'bg-red-100 text-red-700',
  B: 'bg-orange-100 text-orange-700',
  C: 'bg-amber-100 text-amber-700',
  D: 'bg-blue-100 text-blue-700',
  E: 'bg-emerald-100 text-emerald-700',
};

function getLevelBadge(a) {
  const level = a.cefrLevel || a.level || '—';
  const colorClass = CEFR_COLORS[level] || AE_COLORS[level] || 'bg-slate-100 text-slate-600';
  return <span className={`badge ${colorClass}`}>{level}</span>;
}

function getScoreMax(a) {
  if (a.assessmentType === 'Listening Part 1') return '/26';
  if (a.assessmentType === 'Listening Part 2') return a.yearGroupType === 'junior' ? '/8' : '/20';
  if (a.assessmentType === 'Speaking Assessment') return '/12';
  if (a.assessmentType === 'Writing Assessment') return '/20';
  return '';
}

function getDisplayScore(a) {
  let score = a.totalScore;
  const type = (a.assessmentType || '').toLowerCase();
  const WRITING_SCORES = [4, 8, 12, 15, 17, 20];

  if (score !== undefined && score !== null && score >= 0) {
    if (score <= 5 && type.includes('writing')) {
      return WRITING_SCORES[score] || 0;
    }
    return score;
  }

  const lvl = a.cefrLevel || a.level || 'A1';
  const baseLvl = lvl.substring(0, 2);
  const idx = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].indexOf(baseLvl);
  return idx >= 0 ? WRITING_SCORES[idx] : 5;
}

function getInitials(name) {
  return name ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : '?';
}

const AVATAR_COLORS = [
  'bg-blue-500', 'bg-violet-500', 'bg-emerald-500', 'bg-amber-500',
  'bg-rose-500', 'bg-cyan-500', 'bg-indigo-500', 'bg-teal-500',
];

function avatarColor(name) {
  let hash = 0;
  for (let i = 0; i < (name || '').length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function formatDate(d) {
  const date = new Date(d);
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

/* ── Detail Modal ─────────────────────────────────────────── */
function DetailModal({ assessment: a, onClose }) {
  if (!a) return null;
  const scoreLabel = s => s === 0 ? 'No response' : s === 1 ? 'Some comprehension' : 'Full comprehension';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="flex items-center gap-3">
            <div className={`avatar ${avatarColor(a.studentName)}`}>{getInitials(a.studentName)}</div>
            <div>
              <h2 className="text-base font-bold text-slate-900">{a.studentName}</h2>
              <p className="text-xs text-slate-500">{a.assessmentType} · {a.yearGroupAndClass}</p>
            </div>
          </div>
          <button onClick={onClose} className="btn-ghost btn-sm p-1.5 rounded-lg">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="modal-body">
          {/* Meta grid */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Email', value: a.email },
              { label: 'Year & Class', value: a.yearGroupAndClass },
              { label: 'Term', value: a.term || 'T1' },
              a.teacherName && { label: 'Teacher', value: a.teacherName },
              { label: 'Date', value: new Date(a.createdAt).toLocaleString() },
            ].filter(Boolean).map(({ label, value }) => (
              <div key={label} className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide mb-0.5">{label}</p>
                <p className="text-sm text-slate-800 font-medium">{value}</p>
              </div>
            ))}
          </div>

          {/* Score + Level */}
          <div className="grid grid-cols-2 gap-3">
            <div className="score-box-blue">
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">Total Score</p>
              <p className="text-3xl font-bold text-blue-700">{getDisplayScore(a)}{getScoreMax(a)}</p>
            </div>
            <div className={`score-box border ${CEFR_COLORS[a.cefrLevel || a.level] || AE_COLORS[a.level] || 'bg-slate-50 border-slate-200'}`}>
              <p className="text-xs font-semibold uppercase tracking-wide mb-1 opacity-70">Level</p>
              <p className="text-3xl font-bold">{a.cefrLevel || a.level || '—'}</p>
            </div>
          </div>

          {/* Listening / Speaking answers */}
          {(a.listeningAssessmentAnswers?.length > 0 || a.speakingAssessmentAnswers?.length > 0) && (
            <div>
              <h3 className="text-sm font-semibold text-slate-800 mb-3">Question Scores</h3>
              <div className="table-wrapper">
                <table className="data-table">
                  <thead><tr><th>Question</th><th className="text-center">Score</th><th>Result</th></tr></thead>
                  <tbody>
                    {(a.listeningAssessmentAnswers || a.speakingAssessmentAnswers).map((ans, i) => {
                      const questions = a.listeningAssessmentAnswers ? LISTENING_P1_QUESTIONS : SPEAKING_QUESTIONS_JUNIOR;
                      return (
                        <tr key={i}>
                          <td className="text-xs">{questions[i] || `Question ${ans.questionId}`}</td>
                          <td className="text-center font-bold">{ans.score}/2</td>
                          <td className="text-xs text-slate-500">{scoreLabel(ans.score)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Reading details */}
          {a.assessmentType === 'Reading Assessment' && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-800">Reading Details</h3>
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                <p className="text-xs text-slate-400 uppercase font-semibold mb-0.5">Reading Score</p>
                <p className="text-2xl font-bold text-emerald-600">{a.readingScore}</p>
              </div>
              {a.readingNotes && (
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                  <p className="text-xs text-slate-400 uppercase font-semibold mb-0.5">Notes</p>
                  <p className="text-sm text-slate-700">{a.readingNotes}</p>
                </div>
              )}
            </div>
          )}

          {/* Writing details */}
          {a.assessmentType === 'Writing Assessment' && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-800">Writing Details</h3>
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                <p className="text-xs text-slate-400 uppercase font-semibold mb-0.5">Writing Score</p>
                <p className="text-2xl font-bold text-amber-600">{a.writingScore}</p>
              </div>
              {a.writingNotes && (
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                  <p className="text-xs text-slate-400 uppercase font-semibold mb-0.5">Notes</p>
                  <p className="text-sm text-slate-700">{a.writingNotes}</p>
                </div>
              )}
            </div>
          )}

          {/* Teacher comments */}
          {a.teacherComments && (
            <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
              <p className="text-xs text-amber-600 uppercase font-semibold mb-1">Teacher Comments</p>
              <p className="text-sm text-slate-700">{a.teacherComments}</p>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn-secondary">Close</button>
        </div>
      </div>
    </div>
  );
}

/* ── Main Component ───────────────────────────────────────── */
export default function AssessmentList() {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterTerm, setFilterTerm] = useState('All');

  useEffect(() => { fetchAssessments(); }, []);

  const fetchAssessments = async () => {
    try {
      setLoading(true);
      const data = await assessmentAPI.getAllAssessments();
      setAssessments(data);
    } catch (err) {
      toast.error(`Failed to load assessments: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this assessment? This cannot be undone.')) return;
    try {
      setDeletingId(id);
      await assessmentAPI.deleteAssessment(id);
      setAssessments(prev => prev.filter(a => a._id !== id));
      toast.success('Assessment deleted.');
    } catch (err) {
      toast.error(`Failed to delete: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  const handleExportCSV = () => {
    if (filtered.length === 0) {
      toast.warning('No data to export');
      return;
    }

    const headers = [
      'Student Name',
      'Year & Class',
      'Term',
      'Assessment Type',
      'Score',
      'Max Score',
      'Level',
      'Date',
      'Teacher Name',
      'Teacher Comments'
    ];

    const rows = filtered.map(a => [
      a.studentName,
      a.yearGroupAndClass,
      a.term || 'T1',
      a.assessmentType,
      getDisplayScore(a),
      getScoreMax(a).replace('/', ''),
      a.cefrLevel || a.level || '—',
      new Date(a.createdAt).toLocaleString(),
      a.teacherName || '',
      (a.teacherComments || '').replace(/\n/g, ' ')
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `honour_assessments_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const types = ['All', ...Object.keys(TYPE_META)];

  const filtered = assessments.filter(a => {
    const matchType = filterType === 'All' || a.assessmentType === filterType;
    const matchTerm = filterTerm === 'All' || (a.term || 'T1') === filterTerm;
    const matchSearch = !search || a.studentName?.toLowerCase().includes(search.toLowerCase()) || a.yearGroupAndClass?.toLowerCase().includes(search.toLowerCase());
    return matchType && matchTerm && matchSearch;
  });

  const stats = [
    { label: 'Total', value: assessments.length, color: 'bg-blue-50 text-blue-600 border-blue-200' },
    { label: 'Listening', value: assessments.filter(a => a.assessmentType?.startsWith('Listening')).length, color: 'bg-cyan-50 text-cyan-600 border-cyan-200' },
    { label: 'Speaking', value: assessments.filter(a => a.assessmentType === 'Speaking Assessment').length, color: 'bg-violet-50 text-violet-600 border-violet-200' },
    { label: 'Reading', value: assessments.filter(a => a.assessmentType === 'Reading Assessment').length, color: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
    { label: 'Writing', value: assessments.filter(a => a.assessmentType === 'Writing Assessment').length, color: 'bg-amber-50 text-amber-600 border-amber-200' },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Page header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="page-title">Assessment Records</h1>
              <p className="page-subtitle">Track and manage all student assessments.</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportCSV}
                className="btn-primary btn-sm flex items-center gap-1.5"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M7.5 12l4.5 4.5m0 0l4.5-4.5M12 3v13.5" />
                </svg>
                Export CSV
              </button>
              <button
                onClick={fetchAssessments}
                className="btn-secondary btn-sm flex items-center gap-1.5"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {stats.map(({ label, value, color }) => (
            <div key={label} className={`rounded-2xl border p-4 text-center ${color}`}>
              <div className="text-2xl font-bold">{value}</div>
              <div className="text-xs font-medium mt-0.5 opacity-80">{label}</div>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="card-section flex flex-col items-center justify-center py-20 gap-3">
            <span className="spinner w-8 h-8 border-2 border-blue-600 border-t-transparent" />
            <p className="text-sm text-slate-500">Loading assessments...</p>
          </div>
        ) : assessments.length === 0 ? (
          <div className="card-section flex flex-col items-center justify-center py-20 gap-3 text-center">
            <svg className="w-12 h-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
            </svg>
            <div>
              <p className="text-slate-700 font-semibold">No assessments yet</p>
              <p className="text-slate-400 text-sm mt-0.5">Create your first assessment to see it here.</p>
            </div>
          </div>
        ) : (
          <>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1 max-w-xs">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search student or class..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="form-input pl-9"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {types.map(t => (
                  <button
                    key={t}
                    onClick={() => setFilterType(t)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${filterType === t
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                      }`}
                  >
                    {t === 'All' ? 'All Skills' : (TYPE_META[t]?.label || t)}
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                {['All', 'T1', 'T2', 'T3'].map(t => (
                  <button
                    key={t}
                    onClick={() => setFilterTerm(t)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${filterTerm === t
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                      }`}
                  >
                    {t === 'All' ? 'All Terms' : t}
                  </button>
                ))}
              </div>
            </div>

            {/* Table */}
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
                      <td colSpan={8} className="text-center py-10 text-slate-400 text-sm">
                        No results match your search.
                      </td>
                    </tr>
                  ) : filtered.map((a) => {
                    const typeMeta = TYPE_META[a.assessmentType] || { label: a.assessmentType, color: 'bg-slate-100 text-slate-600' };
                    return (
                      <tr key={a._id}>
                        <td>
                          <div className="flex items-center gap-2.5">
                            <div className={`avatar text-xs ${avatarColor(a.studentName)}`}>
                              {getInitials(a.studentName)}
                            </div>
                            <span className="font-semibold text-slate-900 text-sm">{a.studentName}</span>
                          </div>
                        </td>
                        <td className="text-sm">{a.yearGroupAndClass}</td>
                        <td className="text-sm">
                          <span className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded-md font-bold text-[10px]">
                            {a.term || 'T1'}
                          </span>
                        </td>
                        <td>
                          <span className={`type-pill ${typeMeta.color}`}>
                            {typeMeta.label}
                          </span>
                        </td>
                        <td className="text-center">
                          <span className="font-bold text-slate-900 text-sm">
                            {getDisplayScore(a)}{getScoreMax(a)}
                          </span>
                        </td>
                        <td className="text-center">{getLevelBadge(a)}</td>
                        <td className="text-xs text-slate-500">{formatDate(a.createdAt)}</td>
                        <td>
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => setViewing(a)}
                              className="btn-ghost btn-sm p-1.5 rounded-lg"
                              title="View details"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
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
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                </svg>
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <p className="text-xs text-slate-400">
              Showing {filtered.length} of {assessments.length} assessment{assessments.length !== 1 ? 's' : ''}
            </p>
          </>
        )}
      </div>

      <DetailModal assessment={viewing} onClose={() => setViewing(null)} />
    </div>
  );
}
