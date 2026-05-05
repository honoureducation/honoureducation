import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { assessmentAPI } from '../services/api';
import writingImg1 from '../assets/writing1.jpg.jpeg';
import writingImg2 from '../assets/writing2.jpg.jpeg';
import writingImg3 from '../assets/writing3.jpg.jpeg';

const PICTURES = [writingImg1, writingImg2, writingImg3];

const QUESTIONS = [
  'Who and what can you see?',
  'What are they doing?',
  'Can you write a story for these pictures?',
];

const SCORING = [
  { level: 'A', desc: 'Labels or single words only; no sentences; meaning unclear.' },
  { level: 'B', desc: 'Fragmented or very short sentences; many errors; little sequence or link to pictures.' },
  { level: 'C', desc: 'Simple sentences with some sequence; basic vocabulary; capitals and full stops mostly correct.' },
  { level: 'D', desc: 'Organised into short paragraphs; clear sequence; developing vocabulary; mostly correct tense and punctuation.' },
  { level: 'E', desc: 'Fluent, cohesive narrative; varied sentences and precise vocabulary; accurate punctuation; minimal errors.' },
];

const LEVEL_COLORS = { A: 'text-red-600 bg-red-50 border-red-200', B: 'text-orange-600 bg-orange-50 border-orange-200', C: 'text-amber-600 bg-amber-50 border-amber-200', D: 'text-blue-600 bg-blue-50 border-blue-200', E: 'text-emerald-600 bg-emerald-50 border-emerald-200' };

export default function WritingAssessmentForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', studentName: '', yearGroupAndClass: '', teacherName: '', term: 'T1' });
  const [score, setScore] = useState(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleInput = (e) => {
    const { name, value } = e.target;
    setFormData(p => ({ ...p, [name]: value }));
    if (errors[name]) setErrors(p => ({ ...p, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!formData.email) errs.email = 'Required';
    if (!formData.studentName) errs.studentName = 'Required';
    if (!formData.yearGroupAndClass) errs.yearGroupAndClass = 'Required';
    if (!score) errs.score = 'Please select a score';
    if (Object.keys(errs).length) {
      setErrors(errs);
      toast.error('Please fill in all required fields.');
      return;
    }
    setLoading(true);
    try {
      await assessmentAPI.createAssessment({
        assessmentType: 'Writing Assessment',
        yearGroupType: 'junior',
        email: formData.email,
        studentName: formData.studentName,
        yearGroupAndClass: formData.yearGroupAndClass,
        teacherName: formData.teacherName,
        writingScore: score,
        level: score,
        term: formData.term,
        totalScore: ['A', 'B', 'C', 'D', 'E'].indexOf(score),
        writingNotes: notes,
      });
      toast.success('Assessment submitted successfully!');
      setFormData({ email: '', studentName: '', yearGroupAndClass: '', teacherName: '', term: 'T1' });
      setScore(null);
      setNotes('');
      setErrors({});
    } catch (err) {
      toast.error(`Failed to submit: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Page header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <nav className="breadcrumb mb-2">
            <button onClick={() => navigate('/assessments')} className="hover:text-slate-700 transition-colors">Assessments</button>
            <span className="breadcrumb-sep">/</span>
            <button onClick={() => navigate('/assessment/writing')} className="hover:text-slate-700 transition-colors">Writing</button>
            <span className="breadcrumb-sep">/</span>
            <span className="text-slate-700 font-medium">Junior — Assessor</span>
          </nav>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="page-title">Writing Assessment</h1>
              <p className="page-subtitle">Year 7–9 · Grade 6–8 · A–E Scoring</p>
            </div>
            {score && (
              <span className={`badge text-sm px-3 py-1.5 border ${LEVEL_COLORS[score]}`}>
                Level {score}
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
            <ul className="text-slate-600 space-y-0.5 text-xs list-disc list-inside">
              <li>Sit with the pupil in a calm, distraction-free space.</li>
              <li>Ask the pupil to write paragraphs / sentences for these pictures.</li>
              <li>Use the questions below to prompt the student.</li>
            </ul>
          </div>
        </div>

        {/* Picture prompts */}
        <div className="card-section">
          <h2 className="section-heading">
            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
            Picture Prompts & Questions
          </h2>
          <ol className="space-y-1 mb-5">
            {QUESTIONS.map((q, i) => (
              <li key={i} className="text-sm text-slate-700 flex gap-2">
                <span className="font-semibold text-slate-400 flex-shrink-0">{i + 1}.</span>
                {q}
              </li>
            ))}
          </ol>
          <div className="grid grid-cols-3 gap-3">
            {PICTURES.map((src, i) => (
              <div key={i} className="rounded-xl overflow-hidden border border-slate-200 aspect-video bg-slate-100">
                <img src={src} alt={`Writing prompt ${i + 1}`} className="w-full h-full object-cover" />
              </div>
            ))}
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
                <input type="email" name="email" value={formData.email} onChange={handleInput} placeholder="assessor@school.edu" className={`form-input ${errors.email ? 'form-input-error' : ''}`} required />
                {errors.email && <p className="form-error">{errors.email}</p>}
              </div>
              <div>
                <label className="form-label">Student Name <span className="text-red-500">*</span></label>
                <input type="text" name="studentName" value={formData.studentName} onChange={handleInput} placeholder="Full name" className={`form-input ${errors.studentName ? 'form-input-error' : ''}`} required />
                {errors.studentName && <p className="form-error">{errors.studentName}</p>}
              </div>
              <div>
                <label className="form-label">Year Group & Class <span className="text-red-500">*</span></label>
                <input type="text" name="yearGroupAndClass" value={formData.yearGroupAndClass} onChange={handleInput} placeholder="e.g. Year 8A" className={`form-input ${errors.yearGroupAndClass ? 'form-input-error' : ''}`} required />
                {errors.yearGroupAndClass && <p className="form-error">{errors.yearGroupAndClass}</p>}
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

          {/* Scoring */}
          <div className="card-section">
            <h2 className="section-heading">
              <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
              </svg>
              Writing Quality Score (A–E)
            </h2>
            <div className="space-y-2">
              {SCORING.map(({ level, desc }) => (
                <label
                  key={level}
                  className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all duration-150 ${
                    score === level
                      ? `${LEVEL_COLORS[level]} border-2`
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="writingScore"
                    value={level}
                    checked={score === level}
                    onChange={() => { setScore(level); setErrors(p => ({ ...p, score: '' })); }}
                    className="mt-0.5 w-4 h-4 accent-blue-600 cursor-pointer flex-shrink-0"
                  />
                  <div>
                    <span className="font-bold text-slate-900 text-sm">{level}</span>
                    <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
                  </div>
                </label>
              ))}
            </div>
            {errors.score && <p className="form-error mt-2">{errors.score}</p>}
          </div>

          {/* Teacher observations */}
          <div className="card-section">
            <h2 className="section-heading">Teacher Observations</h2>
            <p className="form-hint mb-3">Optional: Record observations about sentence construction, vocabulary, spelling, punctuation, and engagement.</p>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Good vocabulary use but needs work on punctuation..."
              className="form-textarea"
            />
          </div>

          <div className="flex gap-3">
            <button type="submit" disabled={loading} className="btn-primary btn-lg flex-1">
              {loading ? <><span className="spinner" /> Submitting...</> : 'Submit Assessment'}
            </button>
            <button type="button" onClick={() => navigate('/assessments')} className="btn-secondary btn-lg">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
