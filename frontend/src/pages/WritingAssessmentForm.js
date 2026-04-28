import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { assessmentAPI } from '../services/api';
import writingImg1 from '../assets/writing1.jpg.jpeg';
import writingImg2 from '../assets/writing2.jpg.jpeg';
import writingImg3 from '../assets/writing3.jpg.jpeg';

const WRITING_QUESTIONS = [
  'Who and what can you see?',
  'What are they doing?',
  'Can you write a story for these pictures?'
];

const WRITING_SCORING = {
  'A': 'Labels or single words only; no sentences; meaning unclear.',
  'B': 'Fragmented or very short sentences; many errors; little sequence or link to pictures.',
  'C': 'Simple sentences with some sequence; basic vocabulary; capitals and full stops mostly correct.',
  'D': 'Organised into short paragraphs; clear sequence; developing vocabulary; mostly correct tense and punctuation.',
  'E': 'Fluent, cohesive narrative; varied sentences and precise vocabulary; accurate punctuation; minimal errors.'
};

// Local writing images
function getPictureUrl(picNum) {
  const pictures = [writingImg1, writingImg2, writingImg3];
  return pictures[picNum % pictures.length];
}

export default function WritingAssessmentForm() {
  const [formData, setFormData] = useState({
    email: '',
    studentName: '',
    yearGroupAndClass: '',
    teacherName: ''
  });

  const [score, setScore] = useState(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

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
      toast.error('❌ Please select a writing quality score (A-E)', {
        position: 'top-right',
        autoClose: 4000,
      });
      setLoading(false);
      return;
    }

    try {
      const assessmentData = {
        assessmentType: 'Writing Assessment',
        yearGroupType: 'junior',
        email: formData.email,
        studentName: formData.studentName,
        yearGroupAndClass: formData.yearGroupAndClass,
        teacherName: formData.teacherName,
        writingScore: score,
        level: score,
        totalScore: ['A', 'B', 'C', 'D', 'E'].indexOf(score),
        writingNotes: notes
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
        teacherName: ''
      });
      setScore(null);
      setNotes('');
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
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Writing Assessment</h1>
          <p className="text-gray-600 mb-4">Year 7-9 / Grade 6-8</p>
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded space-y-2">
            <p className="text-sm text-gray-700"><strong>Instructions for assessor:</strong></p>
            <ul className="text-sm text-gray-700 space-y-1 ml-4">
              <li>• Sit with the pupil in a calm, distraction-free space.</li>
              <li>• Ask the pupil to write paragraphs / sentences for this picture.</li>
              <li>• Use the questions to prompt.</li>
            </ul>
          </div>
        </div>

        {/* Pictures and Questions */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Questions</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-700 mb-6">
            {WRITING_QUESTIONS.map((q, idx) => (
              <li key={idx} className="font-medium">{q}</li>
            ))}
          </ol>

          {/* Pictures */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[0, 1, 2].map((i) => (
              <div key={i} className="relative bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={getPictureUrl(i)}
                  alt={`Writing prompt picture ${i + 1}`}
                  className="w-full h-48 object-cover rounded-lg shadow-md border-4 border-purple-300"
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23e5e7eb" width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="16" fill="%236b7280"%3EImage %23' + (i + 1) + '%3C/text%3E%3C/svg%3E';
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
            </div>
          </div>

          {/* Writing Quality Scoring Table */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-2">
            <table className="w-full border border-gray-300">
              <thead>
                <tr className="bg-blue-50">
                  <th className="px-6 py-3 text-left font-bold text-gray-800 border-b border-r border-gray-300 w-24">Score</th>
                  <th className="px-6 py-3 text-left font-bold text-gray-800 border-b border-gray-300">Description</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(WRITING_SCORING).map(([level, description], idx) => (
                  <tr
                    key={level}
                    onClick={() => setScore(level)}
                    className="cursor-pointer transition-colors duration-150"
                    style={{
                      backgroundColor: score === level ? '#dbeafe' : idx % 2 === 0 ? '#ffffff' : '#f9fafb',
                      borderLeft: score === level ? '4px solid #6366f1' : '4px solid transparent'
                    }}
                  >
                    <td className="px-6 py-4 font-bold text-gray-900 border-b border-r border-gray-200 align-top">{level}</td>
                    <td className="px-6 py-4 text-gray-700 border-b border-gray-200 text-sm leading-relaxed">{description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {score && (
              <div className="px-6 py-3 bg-indigo-50 border-t border-indigo-200">
                <p className="text-indigo-700 font-semibold text-sm">✅ Selected Score: <span className="text-lg font-bold">{score}</span></p>
              </div>
            )}
          </div>

          {/* Teacher Observations */}
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Teacher Observations</h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Record observations about sentence construction, vocabulary use, spelling, punctuation, and engagement..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 h-24 resize-none"
            />
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-bold rounded-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 shadow-lg"
            >
              {loading ? 'Submitting...' : '📤 Submit Assessment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
