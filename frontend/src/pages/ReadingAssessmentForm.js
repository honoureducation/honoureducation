import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { assessmentAPI } from '../services/api';
import readingImg1 from '../assets/reading1.jpg.jpeg';
import readingImg2 from '../assets/reading2.jpg.jpeg';
import readingImg3 from '../assets/reading3.jpg.jpeg';

const PICTURES = [readingImg1, readingImg2, readingImg3];

const STORY = `The Mountain Field

Asha and Rafi met at the rocky edge of their village, where the mountain winds rushed across the open field. Asha was the only girl who played football in the whole valley, and she carried her ball with pride. Some leaders shake their heads when they saw her train, saying the game was not for girls, but she refused to stop. Rafi walked beside her each day, cheering her on as they climbed the steep path.

The ground was uneven, with stones hidden under the grass, and the thin air made their breaths short. Still, Asha dribbled and kicked with fierce joy. Rafi practised with her, blocking shots and passing the ball across the slope. Sometimes they slipped, sometimes the wind blew the ball too far, but they always tried again.

Asha's brother often joined them, laughing as he chased the ball down the hill. Their father watched from the field's edge, nodding proudly whenever Asha made a strong strike. He told her she had the spirit of a true player.

One evening, as the sun dipped behind the mountains, Asha scored a goal that echoed across the valley. She stood tall, imagining a stadium full of cheering fans. One day, she whispered, she would be a football hero. And with Rafi, her brother, and her father believing in her, the dream felt closer than ever.`;

const SCORING = [
  { level: 'A1 - Emerging', scoreRange: '1–4', descriptor: 'Very limited comprehension', capabilities: 'Recognises familiar words; understands extremely simple ideas with strong support; relies on visuals and prompts.', errorFreq: '25+ errors' },
  { level: 'A2 - Developing', scoreRange: '5–8', descriptor: 'Basic comprehension of simple details', capabilities: 'Understands simple sentences; identifies characters, setting, main events; answers basic WH-questions.', errorFreq: '15–20 errors' },
  { level: 'B1 - Secure', scoreRange: '9–12', descriptor: 'Understands main ideas and simple inferences', capabilities: 'Explains character motivations; identifies themes (perseverance, support); makes basic inferences using evidence.', errorFreq: '≈15 errors' },
  { level: 'B2 - Proficient', scoreRange: '13–15', descriptor: 'Analyses deeper meaning and implied ideas', capabilities: 'Interprets relationships and social context; identifies themes with evidence; summarises accurately; explains symbolism.', errorFreq: '10–15 errors' },
  { level: 'C1 - Advanced', scoreRange: '16–17', descriptor: 'Critical, analytical reading', capabilities: 'Evaluates themes, tone, author intention; analyses how language and setting create effect; connects ideas across text.', errorFreq: '≈10 errors' },
  { level: 'C2 - Mastery', scoreRange: '18–20', descriptor: 'Near-native academic reading', capabilities: 'Interprets nuance, symbolism, implied meaning; critiques perspective, bias, representation; produces sophisticated analysis.', errorFreq: '0–5 errors' }
];

const LEVEL_COLORS = {
  'A1 - Emerging': 'text-red-600 bg-red-50 border-red-200',
  'A2 - Developing': 'text-orange-600 bg-orange-50 border-orange-200',
  'B1 - Secure': 'text-amber-600 bg-amber-50 border-amber-200',
  'B2 - Proficient': 'text-lime-600 bg-lime-50 border-lime-200',
  'C1 - Advanced': 'text-emerald-600 bg-emerald-50 border-emerald-200',
  'C2 - Mastery': 'text-blue-600 bg-blue-50 border-blue-200'
};

export default function ReadingAssessmentForm() {
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
  const [score, setScore] = useState(null);
  const [teacherNotes, setTeacherNotes] = useState('');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.studentName || !formData.yearGroupAndClass) {
      toast.error('Please fill in all required fields.');
      return;
    }
    if (!score) {
      toast.error('Please select a reading assessment score.');
      return;
    }
    setLoading(true);
    try {
      await assessmentAPI.createAssessment({
        assessmentType: 'Reading Assessment',
        yearGroupType: 'junior',
        email: formData.email,
        studentName: formData.studentName,
        yearGroupAndClass: formData.yearGroupAndClass,
        teacherName: formData.teacherName,
        readingScore: score,
        level: score,
        term: formData.term,
        totalScore: SCORING.findIndex(s => s.level === score),
        readingNotes: teacherNotes,
      });
      toast.success('Assessment submitted successfully!');
      setFormData({
        email: '',
        studentName: '',
        yearGroupAndClass: '',
        teacherName: '',
        term: preSelectedTerm
      });
      setScore(null);
      setTeacherNotes('');
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
            <button onClick={() => navigate('/assessment/reading')} className="hover:text-slate-700 transition-colors">Reading</button>
            <span className="breadcrumb-sep">/</span>
            <span className="text-slate-700 font-medium">Junior</span>
          </nav>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="page-title">Reading Assessment</h1>
              <p className="page-subtitle">Year 7–9 · Grade 6–8 · Reading Assessment Scores</p>
            </div>
            {score && (
              <span className={`badge text-sm px-3 py-1.5 border ${LEVEL_COLORS[score]}`}>
                {score}
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
              <li>Present the story and ask the pupil to read aloud.</li>
              <li>Allow 10–20 seconds per line.</li>
              <li>Use the Teacher Notes box to mark accuracy, fluency, and comments.</li>
            </ul>
          </div>
        </div>

        {/* Story */}
        <div className="card-section">
          <h2 className="section-heading">
            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
            Reading Passage
          </h2>
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 mb-5 text-sm text-slate-700 leading-relaxed">
            {STORY.split('\n\n').map((para, i) => (
              <p key={i} className={`${i === 0 ? 'font-semibold text-slate-900 mb-3' : 'mb-3'}`}>{para}</p>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-3">
            {PICTURES.map((src, i) => (
              <div key={i} className="rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                <img src={src} alt={`Story scene ${i + 1}`} className="w-full h-auto object-contain" />
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

          {/* Scoring */}
          <div className="card-section">
            <h2 className="section-heading">
              <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
              </svg>
              Reading Assessment Score
            </h2>
            <div className="space-y-3 md:space-y-0 md:bg-white md:border md:border-purple-500 md:rounded-xl md:overflow-hidden mt-4">
              {/* Desktop Header */}
              <div className="hidden md:grid md:grid-cols-12 gap-4 p-5 border-b border-purple-500 font-bold text-slate-900 text-[13px] bg-white items-end">
                <div className="col-span-2">CEFR Level</div>
                <div className="col-span-2">Score Range<br />(20 pts)</div>
                <div className="col-span-3">Descriptor</div>
                <div className="col-span-3">What the Student Can Do<br />(Reading)</div>
                <div className="col-span-2">Error Frequency<br />(per 100 words)</div>
              </div>

              {/* Rows */}
              <div className="flex flex-col gap-3 md:gap-0">
                {SCORING.map(({ level, scoreRange, descriptor, capabilities, errorFreq }, idx) => (
                  <label
                    key={level}
                    className={`block md:grid md:grid-cols-12 gap-4 p-5 border md:border-t-0 md:border-x-0 cursor-pointer transition-colors duration-150 items-center rounded-xl md:rounded-none ${
                      idx === SCORING.length - 1 ? 'md:border-b-0' : 'md:border-b md:border-purple-300'
                    } ${
                      score === level
                        ? 'bg-purple-50/50 shadow-sm md:shadow-none border-purple-500 md:border-purple-300'
                        : 'border-slate-200 hover:bg-slate-50/50 bg-white'
                    }`}
                  >
                    {/* CEFR Level & Radio */}
                    <div className="col-span-2 flex items-center gap-3 font-bold text-slate-900 mb-3 md:mb-0">
                      <input
                        type="radio"
                        name="readingScore"
                        value={level}
                        checked={score === level}
                        onChange={() => setScore(level)}
                        className="w-4 h-4 accent-purple-600 flex-shrink-0 cursor-pointer"
                      />
                      <span className="text-sm md:text-[13px] whitespace-nowrap">{level}</span>
                    </div>

                    {/* Score Range */}
                    <div className="col-span-2 text-sm md:text-[13px] font-bold text-slate-900 mb-2 md:mb-0 flex justify-between md:block">
                      <span className="md:hidden text-slate-500 font-normal">Score Range:</span>
                      {scoreRange}
                    </div>

                    {/* Descriptor */}
                    <div className="col-span-3 text-sm md:text-[13px] text-slate-700 mb-2 md:mb-0">
                      <span className="md:hidden text-slate-500 font-normal block mb-1">Descriptor:</span>
                      {descriptor}
                    </div>

                    {/* Capabilities */}
                    <div className="col-span-3 text-sm md:text-[13px] text-slate-700 leading-relaxed mb-3 md:mb-0">
                      <span className="md:hidden text-slate-500 font-normal block mb-1">Student can:</span>
                      {capabilities}
                    </div>

                    {/* Error Freq */}
                    <div className="col-span-2 text-sm md:text-[13px] font-bold text-slate-900 flex justify-between md:block pt-3 border-t border-slate-100 md:border-0 md:pt-0">
                      <span className="md:hidden text-slate-500 font-normal">Error Freq:</span>
                      {errorFreq}
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Teacher notes */}
          <div className="card-section">
            <h2 className="section-heading">Teacher Notes</h2>
            <textarea
              value={teacherNotes}
              onChange={e => setTeacherNotes(e.target.value)}
              placeholder="Mark accuracy, fluency errors, and additional comments..."
              className="form-textarea"
            />
          </div>

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
            <button type="button" onClick={() => navigate('/assessments')} className="btn-secondary btn-lg">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
