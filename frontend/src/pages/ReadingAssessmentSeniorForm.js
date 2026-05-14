import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { assessmentAPI } from '../services/api';
import readin2nd1 from '../assets/readin2nd1.jpg.jpeg';
import readin2nd2 from '../assets/readin2nd2.jpg.jpeg';
import reading2nd3 from '../assets/reading2nd3.jpg.jpeg';

const READING_STORY_SENIOR = `A World Between Worlds

In a small international school nestled in the heart of Tokyo, a group of 17-year-old students gathered in the bustling cafeteria, their laughter and chatter a blend of various accents and languages. These students had grown up in a unique environment, navigating the complexities of living in a culture different from their parents' and the one they were born into.

Ava, originally from Brazil, moved to Japan with her family when she was just eight. As she shared stories of her recent trip back to São Paulo, her classmates listened intently, fascinated by her tales of vibrant street festivals and tropical beaches. Meanwhile, Amir, whose parents came from Egypt but who spent his early years in London, nodded along, relating Ava's experiences to his own summer visits to Cairo, filled with bustling bazaars and aromatic spices. Despite their diverse backgrounds, the common thread of living in Japan tied them together.

Their lives were a tapestry of cultural experiences, from celebrating Japanese festivals to observing Ramadan with their families. This multicultural environment had its challenges, too. Sometimes, Ava felt like she was living in a state of in-betweenness, not entirely fitting in with her Brazilian roots nor fully embracing Japanese customs. However, with each other's support, they found solace in their shared experiences, carving out a unique identity that was neither here nor there but entirely their own.

These third culture students, had developed a profound understanding of the value of diversity. They learned to appreciate different perspectives and adapt to ever-changing environments, skills they knew would serve them well in life. As they prepared for university applications and life beyond their school, they carried with them not just academic knowledge but also a deeper wisdom that came from growing up between worlds.`;

const READING_SCORING = {
  'A': 'Very limited decoding and blending; frequent pauses; >15 errors per 100 words.',
  'B': 'Many errors, often misreads common digraphs; choppy phrasing; 11–15 errors per 100 words.',
  'C': 'Some errors; blends most words; occasional mistakes on longer words; 6–10 errors per 100 words.',
  'D': 'Few errors; reads in phrases with steady pace; self-corrects; 1–5 errors per 100 words.',
  'E': 'Accurate, fluent, and expressive; handles unfamiliar words; 0–1 errors per 100 words.'
};

function getPictureUrlSenior(picNum) {
  const pictures = [readin2nd1, readin2nd2, reading2nd3];
  return pictures[picNum % pictures.length];
}

export default function ReadingAssessmentSeniorForm() {
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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

    if (score === null) {
      toast.error('❌ Please select a reading accuracy score (A-E)', {
        position: 'top-right',
        autoClose: 4000,
      });
      setLoading(false);
      return;
    }

    try {
      const assessmentData = {
        assessmentType: 'Reading Assessment',
        yearGroupType: 'senior',
        email: formData.email,
        studentName: formData.studentName,
        yearGroupAndClass: formData.yearGroupAndClass,
        teacherName: formData.teacherName,
        term: formData.term,
        readingScore: score,
        level: score,
        totalScore: ['A', 'B', 'C', 'D', 'E'].indexOf(score),
        readingNotes: teacherNotes
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
      setScore(null);
      setTeacherNotes('');
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
            onClick={() => navigate('/assessment/reading')}
            className="hover:text-blue-600 transition-colors"
          >
            Reading
          </button>
          <span className="text-slate-300">/</span>
          <span className="text-slate-900">Senior</span>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Reading Assessment</h1>
          <p className="text-gray-600 mb-4 font-medium uppercase tracking-wider text-xs">Year 10-13 / Grade 9-12</p>
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded space-y-2">
            <p className="text-sm text-gray-700"><strong>Instructions for assessor:</strong></p>
            <ul className="text-sm text-gray-700 space-y-1 ml-4">
              <li>• Present the story and ask the pupil to read aloud.</li>
              <li>• Allow 10-15 seconds per line.</li>
              <li>• Use the Teacher Notes box to mark accuracy, fluency, and comments.</li>
            </ul>
          </div>
        </div>

        {/* Story Section */}
        <div className="bg-gray-100 rounded-lg p-8 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">The Story</h2>
          <div className="bg-white p-6 rounded-lg mb-6 text-gray-800 leading-relaxed border-l-4 border-teal-500">
            {READING_STORY_SENIOR.split('\n\n').map((paragraph, idx) => (
              <p key={idx} className="mb-4">{paragraph}</p>
            ))}
          </div>

          {/* Supporting Pictures */}
          <div className="grid grid-cols-3 gap-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="relative bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={getPictureUrlSenior(i)}
                  alt={`Story scene ${i + 1}`}
                  className="w-full h-48 object-cover rounded-lg shadow-md border-2 border-teal-300"
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23e5e7eb" width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="16" fill="%236b7280"%3EImage ' + (i + 1) + '%3C/text%3E%3C/svg%3E';
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Student Information Section */}
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Student Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Student Name</label>
                <input
                  type="text"
                  name="studentName"
                  value={formData.studentName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Year Group & Class</label>
                <input
                  type="text"
                  name="yearGroupAndClass"
                  value={formData.yearGroupAndClass}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Teacher Name</label>
                <input
                  type="text"
                  name="teacherName"
                  value={formData.teacherName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Assessment Term</label>
                <select
                  name="term"
                  value={formData.term}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  required
                >
                  <option value="T1">Term 1 (T1)</option>
                  <option value="T2">Term 2 (T2)</option>
                  <option value="T3">Term 3 (T3)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Reading Accuracy Scoring */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Reading Accuracy Score (A-E)</h3>
            <div className="space-y-4">
              {Object.entries(READING_SCORING).map(([level, description]) => (
                <label key={level} className="flex items-start p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-all" style={{ borderColor: score === level ? '#14b8a6' : '#e5e7eb', backgroundColor: score === level ? '#f0fdfa' : 'transparent' }}>
                  <input
                    type="radio"
                    name="readingScore"
                    value={level}
                    checked={score === level}
                    onChange={() => setScore(level)}
                    className="w-5 h-5 mt-1 cursor-pointer"
                  />
                  <div className="ml-4">
                    <p className="font-bold text-lg text-gray-900">{level}</p>
                    <p className="text-sm text-gray-600">{description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Teacher Notes */}
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Teacher Notes</h3>
            <textarea
              value={teacherNotes}
              onChange={(e) => setTeacherNotes(e.target.value)}
              placeholder="Mark accuracy, fluency errors, and additional comments..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 h-24 resize-none"
            />
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-8 py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold rounded-2xl hover:from-orange-600 hover:to-red-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none shadow-xl shadow-orange-600/20 flex items-center justify-center gap-2 text-base"
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
          </div>
        </form>
      </div>
    </div>
  );
}
