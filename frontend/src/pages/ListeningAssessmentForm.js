import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { assessmentAPI } from '../services/api';

const LISTENING_QUESTIONS = [
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
  'What would you like to do when you finish school?'
];

const CEFR_LEVELS = {
  '0-5': { level: 'A1', descriptor: 'Very limited English. Can answer isolated personal questions.' },
  '6-10': { level: 'A2', descriptor: 'Basic user. Can describe simple personal information with support.' },
  '11-15': { level: 'B1', descriptor: 'Intermediate. Can describe past events, preferences, and school topics.' },
  '16-20': { level: 'B2', descriptor: 'Upper intermediate. Can give detail, reasons, and extended responses.' },
  '21-24': { level: 'C1', descriptor: 'Advanced. Fluent, coherent, accurate, extended speaking.' },
  '25-26': { level: 'C2', descriptor: 'Near-native. Precise, nuanced, sophisticated responses.' }
};

export default function ListeningAssessmentForm() {
  const [formData, setFormData] = useState({
    email: '',
    studentName: '',
    yearGroupAndClass: '',
    teacherName: ''
  });

  const [scores, setScores] = useState(Array(LISTENING_QUESTIONS.length).fill(null));
  const [totalScore, setTotalScore] = useState(0);
  const [cefrLevel, setCefrLevel] = useState('');
  const [loading, setLoading] = useState(false);
const [error, setError] = useState('');
const [success, setSuccess] = useState(false);
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleScoreChange = (index, score) => {
    const newScores = [...scores];
    newScores[index] = score;
    setScores(newScores);

    // Calculate total score
    const total = newScores.reduce((sum, s) => sum + (s !== null ? s : 0), 0);
    setTotalScore(total);

    // Calculate CEFR level
    let level = '';
    if (total >= 0 && total <= 5) level = 'A1';
    else if (total >= 6 && total <= 10) level = 'A2';
    else if (total >= 11 && total <= 15) level = 'B1';
    else if (total >= 16 && total <= 20) level = 'B2';
    else if (total >= 21 && total <= 24) level = 'C1';
    else if (total >= 25 && total <= 26) level = 'C2';

    setCefrLevel(level);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.email || !formData.studentName || !formData.yearGroupAndClass) {
      toast.error('❌ Please fill in email, student name, and year group/class', {
        position: 'top-right',
        autoClose: 4000,
      });
      setLoading(false);
      return;
    }

    if (scores.includes(null)) {
      toast.error('❌ Please score all 13 questions', {
        position: 'top-right',
        autoClose: 4000,
      });
      setLoading(false);
      return;
    }

    try {
      const listeningAssessmentAnswers = scores.map((score, index) => ({
        questionId: index + 1,
        score: parseInt(score)
      }));

      const assessmentData = {
        assessmentType: 'Listening Part 1',
        email: formData.email,
        studentName: formData.studentName,
        yearGroupAndClass: formData.yearGroupAndClass,
        teacherName: formData.teacherName,
        listeningAssessmentAnswers,
        totalScore,
        cefrLevel,
        level: cefrLevel
      };

      await assessmentAPI.createAssessment(assessmentData);
      toast.success('✅ Assessment submitted successfully!', {
        position: 'top-right',
        autoClose: 4000,
      });

      // Reset form
      setFormData({
        email: '',
        studentName: '',
        yearGroupAndClass: '',
        teacherName: ''
      });
      setScores(Array(LISTENING_QUESTIONS.length).fill(null));
      setTotalScore(0);
      setCefrLevel('');
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
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Listening Assessment Part 1</h1>
          <p className="text-gray-600 mb-4">Year 7-13 / Grade 6-12</p>
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
            <p className="text-sm text-gray-700"><strong>Instructions for assessor:</strong></p>
            <ol className="text-sm text-gray-700 ml-4 mt-2 space-y-1">
              <li>1. Ask each question once.</li>
              <li>2. Accept the first answer given.</li>
              <li>3. Do not probe further.</li>
              <li>4. Record score '0' for no response, '1' for good response and '2' for a complete response.</li>
            </ol>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-100 border-l-4 border-green-500 text-green-700 rounded">
            ✅ Assessment submitted successfully!
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded">
            ❌ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-lg p-8 border-t-4 border-blue-500">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span className="text-blue-500">📋</span> Student Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="assessor@school.edu"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">Student Name *</label>
                <input
                  type="text"
                  name="studentName"
                  value={formData.studentName}
                  onChange={handleInputChange}
                  placeholder="Student name"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">Year Group & Class *</label>
                <input
                  type="text"
                  name="yearGroupAndClass"
                  value={formData.yearGroupAndClass}
                  onChange={handleInputChange}
                  placeholder="e.g. Year 7 - 7A"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">Teacher Name</label>
                <input
                  type="text"
                  name="teacherName"
                  value={formData.teacherName}
                  onChange={handleInputChange}
                  placeholder="Your name (optional)"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Assessment Questions */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden border-t-4 border-purple-500">
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span className="text-purple-500">🎧</span> Assessment Questions
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-100 to-gray-50">
                      <th className="px-4 py-3 text-left font-bold text-gray-800">Question</th>
                      <th className="px-4 py-3 text-center font-bold text-gray-800">
                        No Response (0)
                      </th>
                      <th className="px-4 py-3 text-center font-bold text-gray-800">
                        Some Comprehension (1)
                      </th>
                      <th className="px-4 py-3 text-center font-bold text-gray-800">
                        Full Comprehension (2)
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {LISTENING_QUESTIONS.map((question, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        <td className="px-4 py-4 font-medium text-gray-900 max-w-xs">
                          <span className="font-bold text-purple-600">{index + 1}.</span> {question}
                        </td>
                        <td className="px-4 py-4 text-center">
                          <input
                            type="radio"
                            name={`q-${index}`}
                            value="0"
                            checked={scores[index] === 0}
                            onChange={() => handleScoreChange(index, 0)}
                            className="w-5 h-5 cursor-pointer"
                          />
                        </td>
                        <td className="px-4 py-4 text-center">
                          <input
                            type="radio"
                            name={`q-${index}`}
                            value="1"
                            checked={scores[index] === 1}
                            onChange={() => handleScoreChange(index, 1)}
                            className="w-5 h-5 cursor-pointer"
                          />
                        </td>
                        <td className="px-4 py-4 text-center">
                          <input
                            type="radio"
                            name={`q-${index}`}
                            value="2"
                            checked={scores[index] === 2}
                            onChange={() => handleScoreChange(index, 2)}
                            className="w-5 h-5 cursor-pointer"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Score Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border-2 border-blue-300">
              <div className="flex justify-between items-center mb-2">
                <span className="text-lg font-semibold text-gray-800">Total Score:</span>
                <span className="text-4xl font-bold text-blue-600">{totalScore}/26</span>
              </div>
              <p className="text-sm text-gray-700">Maximum possible: 26 points (13 questions × 2)</p>
            </div>

            <div className={`bg-gradient-to-br rounded-lg p-6 border-2 ${
              cefrLevel === 'A1' ? 'from-red-50 to-red-100 border-red-300' :
              cefrLevel === 'A2' ? 'from-orange-50 to-orange-100 border-orange-300' :
              cefrLevel === 'B1' ? 'from-yellow-50 to-yellow-100 border-yellow-300' :
              cefrLevel === 'B2' ? 'from-blue-50 to-blue-100 border-blue-300' :
              cefrLevel === 'C1' ? 'from-green-50 to-green-100 border-green-300' :
              cefrLevel === 'C2' ? 'from-emerald-50 to-emerald-100 border-emerald-300' :
              'from-gray-50 to-gray-100 border-gray-300'
            }`}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-lg font-semibold text-gray-800">CEFR Level:</span>
                <span className={`text-4xl font-bold ${
                  cefrLevel === 'A1' ? 'text-red-600' :
                  cefrLevel === 'A2' ? 'text-orange-600' :
                  cefrLevel === 'B1' ? 'text-yellow-600' :
                  cefrLevel === 'B2' ? 'text-blue-600' :
                  cefrLevel === 'C1' ? 'text-green-600' :
                  cefrLevel === 'C2' ? 'text-emerald-600' :
                  'text-gray-600'
                }`}>
                  {cefrLevel || '-'}
                </span>
              </div>
              {cefrLevel && (
                <p className="text-sm text-gray-700">{CEFR_LEVELS[totalScore < 6 ? '0-5' : totalScore < 11 ? '6-10' : totalScore < 16 ? '11-15' : totalScore < 21 ? '16-20' : totalScore < 25 ? '21-24' : '25-26'].descriptor}</p>
              )}
            </div>
          </div>

          {/* CEFR Scoring Table */}
          <div className="bg-white rounded-lg shadow-lg p-8 border-t-4 border-indigo-500">
            <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-indigo-500">📊</span> CEFR Level Scoring
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-indigo-100">
                    <th className="px-4 py-3 text-left font-bold">Total Score (26 max)</th>
                    <th className="px-4 py-3 text-center font-bold">CEFR Level</th>
                    <th className="px-4 py-3 text-left font-bold">Descriptor</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-red-50">
                    <td className="px-4 py-3 font-semibold">0 - 5</td>
                    <td className="px-4 py-3 text-center font-bold text-red-600">A1</td>
                    <td className="px-4 py-3">Very limited English. Can answer isolated personal questions.</td>
                  </tr>
                  <tr className="bg-orange-50">
                    <td className="px-4 py-3 font-semibold">6 - 10</td>
                    <td className="px-4 py-3 text-center font-bold text-orange-600">A2</td>
                    <td className="px-4 py-3">Basic user. Can describe simple personal information with support.</td>
                  </tr>
                  <tr className="bg-yellow-50">
                    <td className="px-4 py-3 font-semibold">11 - 15</td>
                    <td className="px-4 py-3 text-center font-bold text-yellow-600">B1</td>
                    <td className="px-4 py-3">Intermediate. Can describe past events, preferences, and school topics.</td>
                  </tr>
                  <tr className="bg-blue-50">
                    <td className="px-4 py-3 font-semibold">16 - 20</td>
                    <td className="px-4 py-3 text-center font-bold text-blue-600">B2</td>
                    <td className="px-4 py-3">Upper intermediate. Can give detail, reasons, and extended responses.</td>
                  </tr>
                  <tr className="bg-green-50">
                    <td className="px-4 py-3 font-semibold">21 - 24</td>
                    <td className="px-4 py-3 text-center font-bold text-green-600">C1</td>
                    <td className="px-4 py-3">Advanced. Fluent, coherent, accurate, extended speaking.</td>
                  </tr>
                  <tr className="bg-emerald-50">
                    <td className="px-4 py-3 font-semibold">25 - 26</td>
                    <td className="px-4 py-3 text-center font-bold text-emerald-600">C2</td>
                    <td className="px-4 py-3">Near-native. Precise, nuanced, sophisticated responses.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold rounded-lg transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Submitting...' : '✓ Submit Assessment'}
            </button>
            <button
              type="reset"
              className="px-8 py-4 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold rounded-lg transition-all"
              onClick={() => window.location.reload()}
            >
              Clear Form
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
