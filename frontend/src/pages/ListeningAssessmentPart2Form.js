import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { assessmentAPI } from '../services/api';

const LISTENING_PART2_QUESTIONS_JUNIOR = [
  'What time does the student wake up?',
  'How does the student travel to school?',
  'What subject does the student enjoy?',
  'What does the student do at the weekend?'
];

const LISTENING_PART2_QUESTIONS_SENIOR = [
  'What types of volunteering activities were available?',
  'How many students took part in the event?',
  'What unexpected problem affected one of the teams?',
  'What did some students want before arriving at their locations?',
  'Which group had delays, and why?',
  'What kind of feedback did the community partners give?',
  'Why is the school considering changing the frequency of the event?',
  'Which student qualities were mentioned positively?',
  'Identify one challenge and one positive outcome mentioned in the passage.',
  'Summarise the overall success of the event in one sentence.'
];

const CEFR_LEVELS_JUNIOR = {
  '0-1': { level: 'A1', descriptor: 'Understands very little; isolated words only.' },
  '2-4': { level: 'A2', descriptor: 'Understands simple, clear factual details with support.' },
  '5-6': { level: 'B1', descriptor: 'Can follow main points and extract key information.' },
  '6-7': { level: 'B2', descriptor: 'Accurate, detailed listening; understands all essential information.' },
  '8': { level: 'C1-C2', descriptor: 'Fully accurate, precise, confident comprehension. No errors.' }
};

const CEFR_LEVELS_SENIOR = {
  '0-4': { level: 'A1', descriptor: 'Understands almost none of the text; isolated words only.' },
  '5-8': { level: 'A2', descriptor: 'Understands basic, simple information; may catch 1-2 details.' },
  '9-12': { level: 'B1', descriptor: 'Understands main ideas but misses detail; partial comprehension.' },
  '13-16': { level: 'B2', descriptor: 'Good comprehension of details, reasons, cause/effect; mostly accurate.' },
  '17-18': { level: 'C1', descriptor: 'Very accurate and detailed understanding; able to interpret implied meaning.' },
  '19-20': { level: 'C2', descriptor: 'Near-native comprehension; precise, complete, nuanced understanding.' }
};

export default function ListeningAssessmentPart2Form() {
  const [yearGroup, setYearGroup] = useState('junior'); // 'junior' or 'senior'
  const [formData, setFormData] = useState({
    email: '',
    studentName: '',
    yearGroupAndClass: '',
    teacherName: ''
  });
const [success, setSuccess] = useState(false);
  const questions = yearGroup === 'junior' ? LISTENING_PART2_QUESTIONS_JUNIOR : LISTENING_PART2_QUESTIONS_SENIOR;
  const cefrLevels = yearGroup === 'junior' ? CEFR_LEVELS_JUNIOR : CEFR_LEVELS_SENIOR;
  const maxScore = yearGroup === 'junior' ? 8 : 20;

  const [scores, setScores] = useState(Array(questions.length).fill(null));
  const [totalScore, setTotalScore] = useState(0);
  const [cefrLevel, setCefrLevel] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

    const total = newScores.reduce((sum, s) => sum + (s !== null ? s : 0), 0);
    setTotalScore(total);

    // Calculate CEFR level
    let level = '';
    if (yearGroup === 'junior') {
      if (total >= 0 && total <= 1) level = 'A1';
      else if (total >= 2 && total <= 4) level = 'A2';
      else if (total >= 5 && total <= 5) level = 'B1';
      else if (total >= 6 && total <= 7) level = 'B2';
      else if (total >= 8) level = 'C1-C2';
    } else {
      if (total >= 0 && total <= 4) level = 'A1';
      else if (total >= 5 && total <= 8) level = 'A2';
      else if (total >= 9 && total <= 12) level = 'B1';
      else if (total >= 13 && total <= 16) level = 'B2';
      else if (total >= 17 && total <= 18) level = 'C1';
      else if (total >= 19 && total <= 20) level = 'C2';
    }

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
      toast.error(`❌ Please score all ${questions.length} questions`, {
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
        assessmentType: 'Listening Part 2',
        yearGroupType: yearGroup,
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

      setFormData({
        email: '',
        studentName: '',
        yearGroupAndClass: '',
        teacherName: ''
      });
      setScores(Array(questions.length).fill(null));
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
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Listening Assessment Part 2 {yearGroup === 'junior' ? 'Year 7-9 / Grade 6-8' : 'Year 10-13 / Grade 9-12'}
          </h1>
          <p className="text-gray-600 mb-4">Teacher reads a paragraph aloud, students answer comprehension questions</p>

          {/* Year Group Selector */}
          <div className="bg-white border-l-4 border-blue-500 p-4 rounded mb-6">
            <p className="text-sm text-gray-700 font-semibold mb-3">Select Year Group:</p>
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setYearGroup('junior');
                  setScores(Array(LISTENING_PART2_QUESTIONS_JUNIOR.length).fill(null));
                  setTotalScore(0);
                  setCefrLevel('');
                }}
                className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                  yearGroup === 'junior'
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                📚 Year 7-9 / Grade 6-8
              </button>
              <button
                onClick={() => {
                  setYearGroup('senior');
                  setScores(Array(LISTENING_PART2_QUESTIONS_SENIOR.length).fill(null));
                  setTotalScore(0);
                  setCefrLevel('');
                }}
                className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                  yearGroup === 'senior'
                    ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                🎓 Year 10-13 / Grade 9-12
              </button>
            </div>
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
          {/* Student Information */}
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

          {/* Teacher Script */}
          <div className="bg-blue-50 rounded-lg shadow-lg p-8 border-t-4 border-blue-500">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-blue-500">🎤</span> Teacher Reads Aloud:
            </h3>
            {yearGroup === 'junior' ? (
              <p className="text-gray-800 leading-relaxed text-base">
                "I usually wake up at 6:30 in the morning. After breakfast, I take the bus to school. I enjoy science because we do lots of experiments. At the weekend, I like to play football with my friends or watch movies with my family."
              </p>
            ) : (
              <p className="text-gray-800 leading-relaxed text-base">
                "Last weekend, our school organised a community volunteering event in the city. Students were able to choose from several activities, including helping at a local food bank, supporting a beach clean-up, and assisting elderly residents with digital skills training. More than two hundred students took part.
                <br /><br />
                Although the event was successful overall, the organisers identified a few challenges. Firstly, the weather forecast changed unexpectedly, causing delays for the beach clean-up team. Secondly, some students mentioned that they would have liked clearer instructions before arriving at their assigned locations.
                <br /><br />
                Despite these issues, feedback from community partners was extremely positive. They especially appreciated the students' professionalism and teamwork. As a result, the school is considering making the event a monthly programme rather than an annual one."
              </p>
            )}
            <p className="text-sm text-gray-600 mt-4">
              Record score '0' for no response, '1' for good response and '2' for a complete response.
            </p>
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
                      <th className="px-4 py-3 text-center font-bold text-gray-800">No Response (0)</th>
                      <th className="px-4 py-3 text-center font-bold text-gray-800">Some Comprehension (1)</th>
                      <th className="px-4 py-3 text-center font-bold text-gray-800">Full Comprehension (2)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {questions.map((question, index) => (
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
                <span className="text-4xl font-bold text-blue-600">{totalScore}/{maxScore}</span>
              </div>
              <p className="text-sm text-gray-700">Maximum possible: {maxScore} points ({questions.length} questions × 2)</p>
            </div>

            <div className={`bg-gradient-to-br rounded-lg p-6 border-2 ${
              cefrLevel === 'A1' ? 'from-red-50 to-red-100 border-red-300' :
              cefrLevel === 'A2' ? 'from-orange-50 to-orange-100 border-orange-300' :
              cefrLevel === 'B1' ? 'from-yellow-50 to-yellow-100 border-yellow-300' :
              cefrLevel === 'B2' ? 'from-blue-50 to-blue-100 border-blue-300' :
              cefrLevel === 'C1' ? 'from-green-50 to-green-100 border-green-300' :
              cefrLevel === 'C1-C2' ? 'from-green-50 to-green-100 border-green-300' :
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
                  cefrLevel === 'C1-C2' ? 'text-green-600' :
                  cefrLevel === 'C2' ? 'text-emerald-600' :
                  'text-gray-600'
                }`}>
                  {cefrLevel || '-'}
                </span>
              </div>
              {cefrLevel && cefrLevels[
                yearGroup === 'junior'
                  ? totalScore <= 1 ? '0-1' : totalScore <= 4 ? '2-4' : totalScore <= 5 ? '5-6' : totalScore <= 7 ? '6-7' : '8'
                  : totalScore <= 4 ? '0-4' : totalScore <= 8 ? '5-8' : totalScore <= 12 ? '9-12' : totalScore <= 16 ? '13-16' : totalScore <= 18 ? '17-18' : '19-20'
              ] && (
                <p className="text-sm text-gray-700">{cefrLevels[
                  yearGroup === 'junior'
                    ? totalScore <= 1 ? '0-1' : totalScore <= 4 ? '2-4' : totalScore <= 5 ? '5-6' : totalScore <= 7 ? '6-7' : '8'
                    : totalScore <= 4 ? '0-4' : totalScore <= 8 ? '5-8' : totalScore <= 12 ? '9-12' : totalScore <= 16 ? '13-16' : totalScore <= 18 ? '17-18' : '19-20'
                ].descriptor}</p>
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
                    <th className="px-4 py-3 text-left font-bold">Total Score</th>
                    <th className="px-4 py-3 text-center font-bold">CEFR Level</th>
                    <th className="px-4 py-3 text-left font-bold">Descriptor</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(cefrLevels).map(([scoreRange, data], idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="px-4 py-3 font-semibold">{scoreRange}</td>
                      <td className="px-4 py-3 text-center font-bold text-indigo-600">{data.level}</td>
                      <td className="px-4 py-3">{data.descriptor}</td>
                    </tr>
                  ))}
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
