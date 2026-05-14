import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { assessmentAPI } from '../services/api';
import car1 from '../assets/car1.png';
import car2 from '../assets/car2.png';
import car3 from '../assets/car3.png';

const SPEAKING_QUESTIONS = [
  { id: 1, question: 'What do you see in picture 1?' },
  { id: 2, question: 'Can you tell me what happens next after picture 1?' },
  { id: 3, question: 'Can you tell the whole story from the first picture to the last one?' },
  { id: 4, question: 'Why do you think the team is celebrating at the end, and what helped them succeed?' },
  { id: 5, question: 'What does this story show about teamwork and solving problems under pressure?' },
  { id: 6, question: 'How could different audiences interpret this story differently, and why?' }
];

function getPictureUrl(picNum) {
  const pictures = [car1, car2, car3];
  return pictures[picNum % pictures.length];
}

export default function SpeakingAssessmentForm() {
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

  const [scores, setScores] = useState(Array(SPEAKING_QUESTIONS.length).fill(null));
  const [totalScore, setTotalScore] = useState(0);
  const [cefrLevel, setCefrLevel] = useState('');
  const [teacherComments, setTeacherComments] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (preSelectedTerm) {
      setFormData(prev => ({ ...prev, term: preSelectedTerm }));
    }
  }, [preSelectedTerm]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleScoreChange = (index, score) => {
    const newScores = [...scores];
    newScores[index] = parseInt(score);
    setScores(newScores);

    // Calculate total score and CEFR level
    const total = newScores.reduce((sum, s) => sum + (s !== null ? s : 0), 0);
    setTotalScore(total);

    // Determine CEFR level
    if (total <= 2) setCefrLevel('A1');
    else if (total <= 4) setCefrLevel('A2');
    else if (total <= 6) setCefrLevel('B1');
    else if (total <= 8) setCefrLevel('B2');
    else if (total <= 10) setCefrLevel('C1');
    else setCefrLevel('C2');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.email || !formData.studentName || !formData.yearGroupAndClass) {
      toast.error('❌ Please fill in email, student name, and year group/class', {
        position: 'top-right',
        autoClose: 4000,
      });
      setLoading(false);
      return;
    }

    if (scores.includes(null)) {
      toast.error('❌ Please score all 6 questions', {
        position: 'top-right',
        autoClose: 4000,
      });
      setLoading(false);
      return;
    }

    try {
      const speakingAssessmentAnswers = scores.map((score, index) => ({
        questionId: index + 1,
        score: parseInt(score)
      }));

      const assessmentData = {
        assessmentType: 'Speaking Assessment',
        yearGroupType: 'junior',
        email: formData.email,
        studentName: formData.studentName,
        yearGroupAndClass: formData.yearGroupAndClass,
        teacherName: formData.teacherName,
        speakingAssessmentAnswers,
        totalScore,
        cefrLevel,
        level: cefrLevel,
        term: formData.term,
        teacherComments
      };

      await assessmentAPI.createAssessment(assessmentData);
      toast.success('✅ Assessment submitted successfully!', {
        position: 'top-right',
        autoClose: 4000,
      });

      setFormData({
        email: '',
        studentName: '',
        yearGroupAndClass: '',
        teacherName: '',
        term: preSelectedTerm
      });
      setScores(Array(SPEAKING_QUESTIONS.length).fill(null));
      setTotalScore(0);
      setCefrLevel('');
      setTeacherComments('');
    } catch (err) {
      toast.error(`❌ Error: ${err.message || 'Failed to submit assessment'}`, {
        position: 'top-right',
        autoClose: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Page Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-sm text-slate-500 mb-4 font-medium">
            <button 
              onClick={() => navigate('/assessments')}
              className="hover:text-blue-600 transition-colors"
            >
              Assessments
            </button>
            <span className="text-slate-300">/</span>
            <button 
              onClick={() => navigate('/assessment/speaking')}
              className="hover:text-blue-600 transition-colors"
            >
              Speaking
            </button>
            <span className="text-slate-300">/</span>
            <span className="text-slate-900 font-semibold">Junior</span>
          </nav>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Speaking Assessment</h1>
              <p className="text-slate-500 text-sm mt-1 font-medium uppercase tracking-wider">Year 7-9 / Grade 6-8</p>
            </div>
            {cefrLevel && (
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Current CEFR</span>
                <span className="px-4 py-1.5 bg-purple-50 text-purple-700 border border-purple-200 rounded-full font-bold text-lg">
                  Level {cefrLevel}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Pictures Section */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
            <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
            Visual Prompts
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="aspect-video rounded-xl overflow-hidden border border-slate-100 bg-slate-50 shadow-sm">
                <img
                  src={getPictureUrl(i)}
                  alt={`Assessment scene ${i + 1}`}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Student Information */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-6 flex items-center gap-2">
              <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
              Student Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Student Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900"
                  placeholder="e.g. student@school.com"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Student Name</label>
                <input
                  type="text"
                  name="studentName"
                  value={formData.studentName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900"
                  placeholder="Full Name"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Year Group & Class</label>
                <input
                  type="text"
                  name="yearGroupAndClass"
                  value={formData.yearGroupAndClass}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900"
                  placeholder="e.g. Year 8-B"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Teacher Name</label>
                <input
                  type="text"
                  name="teacherName"
                  value={formData.teacherName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900"
                  placeholder="Assessor's Name"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Assessment Term</label>
                <select
                  name="term"
                  value={formData.term}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900 appearance-none"
                  required
                >
                  <option value="T1">Term 1 (T1)</option>
                  <option value="T2">Term 2 (T2)</option>
                  <option value="T3">Term 3 (T3)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Questions Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
                Oral Proficiency Assessment
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Question Prompt</th>
                    <th className="px-6 py-4 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest w-28">No Response (0)</th>
                    <th className="px-6 py-4 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest w-36">Unsure (1)</th>
                    <th className="px-6 py-4 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest w-28">Proficient (2)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {SPEAKING_QUESTIONS.map((q, index) => (
                    <tr key={q.id} className="hover:bg-slate-50/30 transition-colors">
                      <td className="px-6 py-5 text-sm font-semibold text-slate-700 leading-relaxed">{q.question}</td>
                      <td className="px-6 py-5 text-center">
                        <label className="relative flex items-center justify-center cursor-pointer group">
                          <input
                            type="radio"
                            name={`question-${q.id}`}
                            value="0"
                            checked={scores[index] === 0}
                            onChange={() => handleScoreChange(index, 0)}
                            className="sr-only"
                          />
                          <div className={`w-6 h-6 rounded-full border-2 transition-all flex items-center justify-center ${scores[index] === 0 ? 'border-red-500 bg-red-50' : 'border-slate-200 group-hover:border-slate-300'}`}>
                            {scores[index] === 0 && <div className="w-2.5 h-2.5 rounded-full bg-red-500" />}
                          </div>
                        </label>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <label className="relative flex items-center justify-center cursor-pointer group">
                          <input
                            type="radio"
                            name={`question-${q.id}`}
                            value="1"
                            checked={scores[index] === 1}
                            onChange={() => handleScoreChange(index, 1)}
                            className="sr-only"
                          />
                          <div className={`w-6 h-6 rounded-full border-2 transition-all flex items-center justify-center ${scores[index] === 1 ? 'border-amber-500 bg-amber-50' : 'border-slate-200 group-hover:border-slate-300'}`}>
                            {scores[index] === 1 && <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />}
                          </div>
                        </label>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <label className="relative flex items-center justify-center cursor-pointer group">
                          <input
                            type="radio"
                            name={`question-${q.id}`}
                            value="2"
                            checked={scores[index] === 2}
                            onChange={() => handleScoreChange(index, 2)}
                            className="sr-only"
                          />
                          <div className={`w-6 h-6 rounded-full border-2 transition-all flex items-center justify-center ${scores[index] === 2 ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 group-hover:border-slate-300'}`}>
                            {scores[index] === 2 && <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />}
                          </div>
                        </label>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* CEFR Reference & Results */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">CEFR Scoring Reference</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { range: '0-2', level: 'A1', label: 'Beginner' },
                  { range: '3-4', level: 'A2', label: 'Elementary' },
                  { range: '5-6', level: 'B1', label: 'Intermediate' },
                  { range: '7-8', level: 'B2', label: 'Upper Int.' },
                  { range: '9-10', level: 'C1', label: 'Advanced' },
                  { range: '11-12', level: 'C2', label: 'Native' },
                ].map((item) => (
                  <div key={item.level} className={`p-3 rounded-xl border text-center transition-all ${cefrLevel === item.level ? 'bg-blue-50 border-blue-200' : 'bg-slate-50/50 border-slate-100'}`}>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{item.range} Pts</p>
                    <p className={`text-sm font-bold ${cefrLevel === item.level ? 'text-blue-600' : 'text-slate-700'}`}>{item.level}</p>
                    <p className="text-[9px] text-slate-500 leading-tight">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-slate-900 rounded-2xl shadow-xl p-6 flex flex-col justify-between text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-white/10 transition-colors" />
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Assessment Summary</h3>
                <p className="text-slate-300 text-[10px]">Auto-calculated based on scores</p>
              </div>
              
              <div className="space-y-4 my-6">
                <div className="flex items-end justify-between">
                  <span className="text-xs font-medium text-slate-400 uppercase tracking-widest">Total Points</span>
                  <span className="text-3xl font-black text-white">{totalScore}<span className="text-xs font-bold text-slate-500 ml-1">/ 12</span></span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500" 
                    style={{ width: `${(totalScore / 12) * 100}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-black text-blue-400">
                  {cefrLevel || '?'}
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Final CEFR Level</p>
                  <p className="text-xs font-semibold text-slate-200">Proficiency Result</p>
                </div>
              </div>
            </div>
          </div>

          {/* Teacher Observations */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3h9m-9 3h9m-6.75-12.75h1.5A2.25 2.25 0 0115.75 4.5v15A2.25 2.25 0 0113.5 21.75h-3A2.25 2.25 0 018.25 19.5v-15A2.25 2.25 0 0110.5 2.25z" />
              </svg>
              Teacher Observations
            </h2>
            <textarea
              value={teacherComments}
              onChange={(e) => setTeacherComments(e.target.value)}
              placeholder="Record specific strengths, areas for development, or behavioral observations..."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900 h-28 resize-none text-sm"
            />
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-2xl hover:from-blue-700 hover:to-indigo-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none shadow-xl shadow-blue-600/20 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Submit Assessment Result
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate('/assessment/speaking')}
              className="px-8 py-4 bg-white text-slate-600 font-bold rounded-2xl border-2 border-slate-200 hover:bg-slate-50 hover:border-slate-300 active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-base shadow-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
