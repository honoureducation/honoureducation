import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { assessmentAPI } from '../services/api';

const QUESTIONS = [
  'What is your name?',
  'What is your age?',
  'What language do you speak at home?',
  'Where do you live?',
  'Have you got brothers and sisters?',
  'What hobbies or sports do you like?',
  'How did you come to school today?',
  'Did you go to school in another place? Where?',
  'Tell me about your last school.',
  'What was your best subject?',
  'What did you not like in school?',
  'What will you do after school today?',
  'What would you like to do when you finish school?',
];

const CEFR_BANDS = [
  { range: '0–5',   level: 'A1', desc: 'Very limited English. Can answer isolated personal questions.', color: 'text-red-600',     bg: 'bg-red-50 border-red-200' },
  { range: '6–10',  level: 'A2', desc: 'Basic user. Can describe simple personal information with support.', color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200' },
  { range: '11–15', level: 'B1', desc: 'Intermediate. Can describe past events, preferences, and school topics.', color: 'text-amber-600',  bg: 'bg-amber-50 border-amber-200' },
  { range: '16–20', level: 'B2', desc: 'Upper intermediate. Can give detail, reasons, and extended responses.', color: 'text-blue-600',   bg: 'bg-blue-50 border-blue-200' },
  { range: '21–24', level: 'C1', desc: 'Advanced. Fluent, coherent, accurate, extended speaking.', color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
  { range: '25–26', level: 'C2', desc: 'Near-native. Precise, nuanced, sophisticated responses.', color: 'text-violet-600',  bg: 'bg-violet-50 border-violet-200' },
];

function getCefr(total) {
  if (total <= 5)  return 'A1';
  if (total <= 10) return 'A2';
  if (total <= 15) return 'B1';
  if (total <= 20) return 'B2';
  if (total <= 24) return 'C1';
  return 'C2';
}

const CEFR_COLORS = { A1: 'text-red-600 bg-red-50 border-red-200', A2: 'text-orange-600 bg-orange-50 border-orange-200', B1: 'text-amber-600 bg-amber-50 border-amber-200', B2: 'text-blue-600 bg-blue-50 border-blue-200', C1: 'text-emerald-600 bg-emerald-50 border-emerald-200', C2: 'text-violet-600 bg-violet-50 border-violet-200' };

export default function ListeningAssessmentForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preSelectedTerm = searchParams.get('term') || 'T1';

  const [formData, setFormData] = useState({ 
    email: '', 
    studentName: '', 
    yearGroupAndClass: '', 
    teacherName: '',
    term: preSelectedTerm 
  });
  const [scores, setScores] = useState(Array(QUESTIONS.length).fill(null));
  const [totalScore, setTotalScore] = useState(0);
  const [cefrLevel, setCefrLevel] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (preSelectedTerm) {
      setFormData(prev => ({ ...prev, term: preSelectedTerm }));
    }
  }, [preSelectedTerm]);

  const handleInput = (e) => {
    const { name, value } = e.target;
    setFormData(p => ({ ...p, [name]: value }));
  };

  const handleScore = (idx, val) => {
    const next = [...scores];
    next[idx] = val;
    setScores(next);
    const total = next.reduce((s, v) => s + (v ?? 0), 0);
    setTotalScore(total);
    setCefrLevel(getCefr(total));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.studentName || !formData.yearGroupAndClass) {
      toast.error('Please fill in all required fields.');
      return;
    }
    if (scores.includes(null)) {
      toast.error('Please score all questions.');
      return;
    }
    setLoading(true);
    try {
      await assessmentAPI.createAssessment({
        assessmentType: 'Listening Part 1',
        email: formData.email,
        studentName: formData.studentName,
        yearGroupAndClass: formData.yearGroupAndClass,
        teacherName: formData.teacherName,
        term: formData.term,
        listeningAssessmentAnswers: scores.map((score, i) => ({ questionId: i + 1, score })),
        totalScore,
        cefrLevel,
        level: cefrLevel,
      });
      toast.success('Assessment submitted successfully!');
      setFormData({ 
        email: '', 
        studentName: '', 
        yearGroupAndClass: '', 
        teacherName: '',
        term: preSelectedTerm 
      });
      setScores(Array(QUESTIONS.length).fill(null));
      setTotalScore(0);
      setCefrLevel('');
    } catch (err) {
      toast.error(`Failed to submit: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const answered = scores.filter(s => s !== null).length;
  const progress = Math.round((answered / QUESTIONS.length) * 100);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Page header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <nav className="breadcrumb mb-2">
            <button onClick={() => navigate('/assessments')} className="hover:text-slate-700 transition-colors">Assessments</button>
            <span className="breadcrumb-sep">/</span>
            <button onClick={() => navigate('/assessment/listening')} className="hover:text-slate-700 transition-colors">Listening</button>
            <span className="breadcrumb-sep">/</span>
            <span className="text-slate-700 font-medium">Part 1</span>
          </nav>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="page-title">Listening Assessment Part 1</h1>
              <p className="page-subtitle">Year 7–13 · Grade 6–12 · Max score: 26</p>
            </div>
            {cefrLevel && (
              <span className={`badge text-sm px-3 py-1.5 border ${CEFR_COLORS[cefrLevel]}`}>
                CEFR {cefrLevel}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* Instructions */}
        <div className="info-banner">
          <svg className="info-banner-icon w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
          </svg>
          <div>
            <p className="font-semibold text-slate-800 mb-1">Instructions for assessor</p>
            <ol className="text-slate-600 space-y-0.5 text-xs list-decimal list-inside">
              <li>Ask each question once.</li>
              <li>Accept the first answer given.</li>
              <li>Do not probe further.</li>
              <li>Record score '0' for no response, '1' for good response and '2' for a complete response.</li>
            </ol>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Student info */}
          <div className="card-section">
            <h2 className="section-heading">
              <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
              Student Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Email <span className="text-red-500">*</span></label>
                <input type="email" name="email" value={formData.email} onChange={handleInput} placeholder="assessor@school.edu" className="form-input" required />
              </div>
              <div>
                <label className="form-label">Student Name <span className="text-red-500">*</span></label>
                <input type="text" name="studentName" value={formData.studentName} onChange={handleInput} placeholder="Full name" className="form-input" required />
              </div>
              <div>
                <label className="form-label">Year Group & Class <span className="text-red-500">*</span></label>
                <input type="text" name="yearGroupAndClass" value={formData.yearGroupAndClass} onChange={handleInput} placeholder="e.g. Year 8A" className="form-input" required />
              </div>
              <div>
                <label className="form-label">Teacher Name</label>
                <input type="text" name="teacherName" value={formData.teacherName} onChange={handleInput} placeholder="Optional" className="form-input" />
              </div>
              <div>
                <label className="form-label">Assessment Term <span className="text-red-500">*</span></label>
                <select name="term" value={formData.term} onChange={handleInput} className="form-input" required>
                  <option value="T1">Term 1 (T1)</option>
                  <option value="T2">Term 2 (T2)</option>
                  <option value="T3">Term 3 (T3)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Progress */}
          <div className="card-section">
            <div className="flex items-center justify-between mb-2">
              <h2 className="section-heading mb-0">
                <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
                </svg>
                Assessment Questions
              </h2>
              <span className="text-xs text-slate-500">{answered}/{QUESTIONS.length} scored</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mb-6">
              <div className="bg-blue-600 h-1.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>

            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th className="w-8">#</th>
                    <th>Question</th>
                    <th className="text-center w-28">No Response<br /><span className="font-normal normal-case">(0)</span></th>
                    <th className="text-center w-28">Some comprehension<br /><span className="font-normal normal-case">(1)</span></th>
                    <th className="text-center w-28">Full comprehension<br /><span className="font-normal normal-case">(2)</span></th>
                  </tr>
                </thead>
                <tbody>
                  {QUESTIONS.map((q, i) => (
                    <tr key={i} className={scores[i] !== null ? 'bg-blue-50/40' : ''}>
                      <td className="text-slate-400 text-xs font-medium">{i + 1}</td>
                      <td className="font-medium text-slate-800">{q}</td>
                      {[0, 1, 2].map(val => (
                        <td key={val} className="text-center">
                          <label className="inline-flex items-center justify-center cursor-pointer">
                            <input
                              type="radio"
                              name={`q-${i}`}
                              value={val}
                              checked={scores[i] === val}
                              onChange={() => handleScore(i, val)}
                              className="w-4 h-4 accent-blue-600 cursor-pointer"
                            />
                          </label>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Score summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="score-box-blue">
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">Total Score</p>
              <p className="text-4xl font-bold text-blue-700">{totalScore}<span className="text-lg text-blue-400">/26</span></p>
              <p className="text-xs text-slate-500 mt-1">13 questions × 2 points</p>
            </div>
            <div className={`score-box border ${cefrLevel ? CEFR_COLORS[cefrLevel] : 'bg-slate-50 border-slate-200'}`}>
              <p className="text-xs font-semibold uppercase tracking-wide mb-1 opacity-70">CEFR Level</p>
              <p className="text-4xl font-bold">{cefrLevel || '—'}</p>
              {cefrLevel && (
                <p className="text-xs mt-1 opacity-70">
                  {CEFR_BANDS.find(b => b.level === cefrLevel)?.desc}
                </p>
              )}
            </div>
          </div>

          {/* CEFR reference table */}
          <div className="card-section">
            <h2 className="section-heading">
              <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
              </svg>
              CEFR Scoring Reference
            </h2>
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Total Score (26 max)</th>
                    <th>CEFR Level</th>
                    <th>Descriptor</th>
                  </tr>
                </thead>
                <tbody>
                  {CEFR_BANDS.map(({ range, level, desc, color, bg }) => (
                    <tr key={level} className={cefrLevel === level ? 'ring-1 ring-inset ring-blue-300' : ''}>
                      <td className="font-semibold">{range}</td>
                      <td><span className={`font-bold ${color}`}>{level}</span></td>
                      <td className="text-slate-500 text-xs">{desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-3">
            <button 
              type="submit" 
              disabled={loading} 
              className="flex-1 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-2xl hover:from-blue-700 hover:to-indigo-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none shadow-xl shadow-blue-600/20 flex items-center justify-center gap-2 text-base"
            >
              {loading ? (
                <>
                  <span className="spinner" /> Submitting...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Submit Assessment
                </>
              )}
            </button>
            <button 
              type="button" 
              onClick={() => window.location.reload()} 
              className="px-8 py-4 bg-white text-slate-600 font-bold rounded-2xl border-2 border-slate-200 hover:bg-slate-50 hover:border-slate-300 active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-base shadow-sm"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
              Clear Form
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
