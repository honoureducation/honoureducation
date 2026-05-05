import React, { useState } from 'react';
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

const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

const CEFR_SCORING = {
  '0-2': 'A1',
  '3-4': 'A2',
  '5-6': 'B1',
  '7-8': 'B2',
  '9-10': 'C1',
  '11-12': 'C2'
};

function getPictureUrl(picNum) {
  const pictures = [car1, car2, car3];
  return pictures[picNum % pictures.length];
}

export default function SpeakingAssessmentForm() {
  const [formData, setFormData] = useState({
    email: '',
    studentName: '',
    yearGroupAndClass: '',
    teacherName: '',
    term: 'T1'
  });

  const [scores, setScores] = useState(Array(SPEAKING_QUESTIONS.length).fill(null));
  const [totalScore, setTotalScore] = useState(0);
  const [cefrLevel, setCefrLevel] = useState('');
  const [teacherComments, setTeacherComments] = useState('');
  const [loading, setLoading] = useState(false);

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
        term: 'T1'
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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Speaking Assessment</h1>
          <p className="text-gray-600 mb-4">Year 7-9 / Grade 6-8</p>
        </div>

        {/* Pictures */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[0, 1, 2].map((i) => (
            <img
              key={i}
              src={getPictureUrl(i)}
              alt={`Assessment picture ${i + 1}`}
              className="w-full h-48 object-cover rounded-lg shadow-md"
            />
          ))}
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="T1">Term 1 (T1)</option>
                  <option value="T2">Term 2 (T2)</option>
                  <option value="T3">Term 3 (T3)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Speaking Questions */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                  <th className="px-6 py-4 text-left font-bold">Question</th>
                  <th className="px-6 py-4 text-center font-bold">No response (0)</th>
                  <th className="px-6 py-4 text-center font-bold">Some comprehension but unsure response (1)</th>
                  <th className="px-6 py-4 text-center font-bold">Response indicating comprehension (2)</th>
                </tr>
              </thead>
              <tbody>
                {SPEAKING_QUESTIONS.map((q, index) => (
                  <tr key={q.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 font-semibold text-gray-800">{q.question}</td>
                    <td className="px-6 py-4 text-center">
                      <input
                        type="radio"
                        name={`question-${q.id}`}
                        value="0"
                        checked={scores[index] === 0}
                        onChange={() => handleScoreChange(index, 0)}
                        className="w-5 h-5 cursor-pointer"
                      />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <input
                        type="radio"
                        name={`question-${q.id}`}
                        value="1"
                        checked={scores[index] === 1}
                        onChange={() => handleScoreChange(index, 1)}
                        className="w-5 h-5 cursor-pointer"
                      />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <input
                        type="radio"
                        name={`question-${q.id}`}
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

          {/* CEFR Scoring Table */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">CEFR Speaking Level</h3>
            <table className="w-full mb-6">
              <thead>
                <tr className="border-b-2 border-gray-300">
                  <th className="px-4 py-3 text-left font-bold text-gray-700">Total Score (out of 12)</th>
                  <th className="px-4 py-3 text-left font-bold text-gray-700">CEFR Speaking Level</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-200"><td className="px-4 py-2">0-2</td><td className="px-4 py-2">A1 – Beginner</td></tr>
                <tr className="border-b border-gray-200"><td className="px-4 py-2">3-4</td><td className="px-4 py-2">A2 – Elementary</td></tr>
                <tr className="border-b border-gray-200"><td className="px-4 py-2">5-6</td><td className="px-4 py-2">B1 – Intermediate</td></tr>
                <tr className="border-b border-gray-200"><td className="px-4 py-2">7-8</td><td className="px-4 py-2">B2 – Upper Intermediate</td></tr>
                <tr className="border-b border-gray-200"><td className="px-4 py-2">9-10</td><td className="px-4 py-2">C1 – Advanced</td></tr>
                <tr><td className="px-4 py-2">11-12</td><td className="px-4 py-2">C2 – Near-native proficiency</td></tr>
              </tbody>
            </table>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Total Score</p>
                <p className="text-3xl font-bold text-blue-600">{totalScore}/12</p>
              </div>
              <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg">
                <p className="text-sm text-gray-600">CEFR Level</p>
                <p className="text-3xl font-bold text-purple-600">{cefrLevel || '-'}</p>
              </div>
            </div>
          </div>

          {/* Teacher Comments */}
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Teacher Comments</h3>
            <textarea
              value={teacherComments}
              onChange={(e) => setTeacherComments(e.target.value)}
              placeholder="Add any additional observations or comments..."
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
