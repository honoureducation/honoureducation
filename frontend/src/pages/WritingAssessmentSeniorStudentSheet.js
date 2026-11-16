import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { assessmentAPI } from '../services/api';
import AIAssistantConductor from '../components/AIAssistantConductor';
// Landmark images served from /public
const writingImg1 = '/img1.png';
const writingImg2 = '/img2.png';
const writingImg3 = '/img3.png';

const WRITING_QUESTIONS = [
  'What can you see and where?',
  'What significance do these buildings have?',
  'Can you write a story using these landmarks?'
];

// Local writing images
const PICTURES = [writingImg1, writingImg2, writingImg3];

export default function WritingAssessmentSeniorStudentSheet() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    studentName: '',
    yearGroupAndClass: '',
    teacherName: ''
  });
  const [studentWriting, setStudentWriting] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiAnswers, setAiAnswers] = useState([]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.email || !formData.studentName || !formData.yearGroupAndClass) {
      toast.error('❌ Please fill in email, student name, and year group/class', {
        position: 'top-right', autoClose: 4000,
      });
      setLoading(false);
      return;
    }

    try {
      await assessmentAPI.createAssessment({
        assessmentType: 'Writing Assessment',
        yearGroupType: 'senior',
        email: formData.email,
        studentName: formData.studentName,
        yearGroupAndClass: formData.yearGroupAndClass,
        teacherName: formData.teacherName,
        studentWriting: studentWriting,
        totalScore: 0,
        level: 'C'
      });
      toast.success('✅ Assessment submitted successfully!', {
        position: 'top-right', autoClose: 4000,
      });
      setFormData({ email: '', studentName: '', yearGroupAndClass: '', teacherName: '' });
      setStudentWriting('');
    } catch (err) {
      toast.error(`❌ Error: ${err.message || 'Failed to submit'}`, {
        position: 'top-right', autoClose: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm text-slate-500 mb-6 font-medium">
          <button
            onClick={() => navigate('/assessments')}
            className="hover:text-blue-600 transition-colors"
          >
            Assessments
          </button>
          <span className="text-slate-300">/</span>
          <button
            onClick={() => navigate('/assessment/writing')}
            className="hover:text-blue-600 transition-colors"
          >
            Writing
          </button>
          <span className="text-slate-300">/</span>
          <span className="text-slate-900">Senior</span>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-1">Writing Assessment</h1>
          <p className="text-gray-600 mb-6 font-medium uppercase tracking-wider text-xs">Year 10–13 / Grade 9–12</p>
        </div>

        {/* Questions + Pictures */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-2">Questions</h2>
          <p className="text-sm font-semibold text-blue-600 mb-4 bg-blue-50 inline-block px-3 py-1 rounded-md">
            Note: Allow 10 minutes for student to write.
          </p>
          <div className="space-y-3 text-gray-700 mb-6">
            {WRITING_QUESTIONS.map((q, idx) => (
              <div key={idx}>
                <div className="flex gap-2">
                  <span className="font-semibold text-slate-400 flex-shrink-0">{idx + 1}.</span>
                  <span className="font-medium text-slate-900">{q}</span>
                </div>
                {aiAnswers && aiAnswers[idx] && (
                  <div className="mt-2 text-sm text-indigo-700 bg-indigo-50/50 p-2.5 rounded-lg border border-indigo-100 shadow-inner">
                    <span className="font-bold mr-1">Student Answer (AI):</span> "{aiAnswers[idx]}"
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* 3 Landmark Pictures */}
          <div className="grid grid-cols-3 gap-4">
            {PICTURES.map((url, i) => (
              <img
                key={i}
                src={url}
                alt={`Writing prompt scene ${i + 1}`}
                className="w-full h-44 object-cover rounded-lg shadow-md"
                onError={(e) => {
                  e.target.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%23e5e7eb' width='400' height='300'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='16' fill='%236b7280'%3EPicture ${i + 1}%3C/text%3E%3C/svg%3E`;
                }}
              />
            ))}
          </div>
        </div>

        {/* Lined Writing Area / AI Assistant */}
        <AIAssistantConductor
          questions={WRITING_QUESTIONS}
          onCompleteTextChange={(text) => setStudentWriting(text)}
          onAnswersArrayChange={setAiAnswers}
        />

        {/* Student Info + Submit */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Student Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Student Name</label>
                <input type="text" name="studentName" value={formData.studentName} onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Year Group & Class</label>
                <input type="text" name="yearGroupAndClass" value={formData.yearGroupAndClass} onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Teacher Name</label>
                <input type="text" name="teacherName" value={formData.teacherName} onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-8 py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold rounded-2xl hover:from-orange-600 hover:to-red-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none shadow-xl shadow-orange-600/20 flex items-center justify-center gap-2 text-lg"
          >
            {loading ? (
              <>
                <span className="spinner" /> Submitting...
              </>
            ) : (
              <>
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Submit My Assessment
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
