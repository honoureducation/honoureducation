import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { assessmentAPI } from '../services/api';

// Questions data for display in view modal
const LISTENING_P1_QUESTIONS = [
  'What is your name?', 'What is your age?', 'What language do you speak at home?',
  'Where do you live?', 'Have you got brothers and sisters?', 'What hobbies or sports do you like?',
  'How did you come to school today?', 'Did you go to school in another place? Where?',
  'Tell me about your last school.', 'What was your best subject?',
  'What did you not like in school?', 'What will you do after school today?',
  'What would you like to do when you finish school?'
];

const SPEAKING_QUESTIONS_JUNIOR = [
  'What do you see in picture 1?',
  'Can you tell me what happens next after picture 1?',
  'Can you tell the whole story from the first picture to the last one?',
  'Why do you think the team is celebrating at the end, and what helped them succeed?',
  'What does this story show about teamwork and solving problems under pressure?',
  'How could different audiences interpret this story differently, and why?'
];

function DetailModal({ assessment, onClose }) {
  if (!assessment) return null;

  const scoreLabel = (s) => s === 0 ? 'No response' : s === 1 ? 'Some comprehension' : 'Full comprehension';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white px-8 py-6 rounded-t-2xl flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold">{assessment.studentName}</h2>
            <p className="text-slate-300 mt-1">{assessment.assessmentType}</p>
          </div>
          <button onClick={onClose} className="text-white text-2xl hover:text-red-300 transition">✕</button>
        </div>

        <div className="p-8 space-y-6">
          {/* Student Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-500 font-semibold uppercase">Email</p>
              <p className="text-gray-800 font-medium">{assessment.email}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-500 font-semibold uppercase">Year & Class</p>
              <p className="text-gray-800 font-medium">{assessment.yearGroupAndClass}</p>
            </div>
            {assessment.teacherName && (
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs text-gray-500 font-semibold uppercase">Teacher</p>
                <p className="text-gray-800 font-medium">{assessment.teacherName}</p>
              </div>
            )}
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-500 font-semibold uppercase">Date</p>
              <p className="text-gray-800 font-medium">{new Date(assessment.createdAt).toLocaleString()}</p>
            </div>
          </div>

          {/* Score & Level */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-5 border border-blue-200">
              <p className="text-sm text-blue-600 font-semibold">Total Score</p>
              <p className="text-3xl font-bold text-blue-700">
                {assessment.totalScore || 0}
                {assessment.assessmentType === 'Listening Part 1' ? '/26' : assessment.assessmentType === 'Speaking Assessment' ? '/12' : ''}
              </p>
            </div>
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-5 border border-purple-200">
              <p className="text-sm text-purple-600 font-semibold">Level</p>
              <p className="text-3xl font-bold text-purple-700">
                {assessment.cefrLevel || assessment.level || '-'}
              </p>
            </div>
          </div>

          {/* EAL & ELL Details */}
          {assessment.assessmentType === 'EAL & ELL' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-800 border-b pb-2">EAL & ELL Details</h3>
              <div className="grid grid-cols-2 gap-3">
                {assessment.respondToGreeting && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 uppercase font-semibold">Respond to Greeting</p>
                    <p className="font-medium">{assessment.respondToGreeting}</p>
                  </div>
                )}
                {assessment.followSimpleInstructions && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 uppercase font-semibold">Follow Simple Instructions</p>
                    <p className="font-medium">{assessment.followSimpleInstructions}</p>
                  </div>
                )}
              </div>
              {/* Skills */}
              <div className="grid grid-cols-4 gap-3">
                {['listening', 'reading', 'speaking', 'writing'].map(skill => {
                  const val = assessment[`${skill}SkillsLevel`];
                  return val ? (
                    <div key={skill} className="bg-gray-50 rounded-lg p-3 text-center">
                      <p className="text-xs text-gray-500 uppercase font-semibold">{skill}</p>
                      <p className="text-2xl font-bold text-indigo-600">{val}/5</p>
                    </div>
                  ) : null;
                })}
              </div>
              {assessment.englishLanguageSupport?.length > 0 && (
                <div><p className="text-xs text-gray-500 uppercase font-semibold mb-1">Language Support</p>
                  <div className="flex flex-wrap gap-2">{assessment.englishLanguageSupport.map((s, i) => <span key={i} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">{s}</span>)}</div>
                </div>
              )}
              {assessment.supportNeeds?.length > 0 && (
                <div><p className="text-xs text-gray-500 uppercase font-semibold mb-1">Support Needs</p>
                  <div className="flex flex-wrap gap-2">{assessment.supportNeeds.map((s, i) => <span key={i} className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm">{s}</span>)}</div>
                </div>
              )}
              {[{ k: 'readingAge', l: 'Reading Age' }, { k: 'cat4Levels', l: 'CAT4 Levels' }, { k: 'bookBandLevel', l: 'Book Band Level' }, { k: 'phonicsLevel', l: 'Phonics Level' }].map(({ k, l }) => assessment[k] ? (
                <div key={k} className="bg-gray-50 rounded-lg p-3"><p className="text-xs text-gray-500 uppercase font-semibold">{l}</p><p className="font-medium">{assessment[k]}</p></div>
              ) : null)}
              {[{ k: 'developmentAreas', l: 'Development Areas' }, { k: 'suggestionsForMaterials', l: 'Suggestions for Materials' }, { k: 'classroomSupportIdeas', l: 'Classroom Support Ideas' }].map(({ k, l }) => assessment[k] ? (
                <div key={k} className="bg-gray-50 rounded-lg p-3"><p className="text-xs text-gray-500 uppercase font-semibold">{l}</p><p className="text-gray-700 text-sm">{assessment[k]}</p></div>
              ) : null)}
            </div>
          )}

          {/* Listening Part 1 & 2 answers */}
          {(assessment.assessmentType === 'Listening Part 1' || assessment.assessmentType === 'Listening Part 2') && assessment.listeningAssessmentAnswers?.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-gray-800 border-b pb-2 mb-3">Question Scores</h3>
              <table className="w-full text-sm">
                <thead><tr className="bg-gray-100"><th className="px-4 py-2 text-left">Question</th><th className="px-4 py-2 text-center">Score</th><th className="px-4 py-2 text-left">Result</th></tr></thead>
                <tbody>
                  {assessment.listeningAssessmentAnswers.map((a, i) => (
                    <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-2 font-medium">{LISTENING_P1_QUESTIONS[i] || `Question ${a.questionId}`}</td>
                      <td className="px-4 py-2 text-center font-bold">{a.score}/2</td>
                      <td className="px-4 py-2 text-gray-600">{scoreLabel(a.score)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Speaking Assessment answers */}
          {assessment.assessmentType === 'Speaking Assessment' && assessment.speakingAssessmentAnswers?.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-gray-800 border-b pb-2 mb-3">Question Scores</h3>
              <table className="w-full text-sm">
                <thead><tr className="bg-gray-100"><th className="px-4 py-2 text-left">Question</th><th className="px-4 py-2 text-center">Score</th><th className="px-4 py-2 text-left">Result</th></tr></thead>
                <tbody>
                  {assessment.speakingAssessmentAnswers.map((a, i) => (
                    <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-2 font-medium">{SPEAKING_QUESTIONS_JUNIOR[i] || `Question ${a.questionId}`}</td>
                      <td className="px-4 py-2 text-center font-bold">{a.score}/2</td>
                      <td className="px-4 py-2 text-gray-600">{scoreLabel(a.score)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Reading Assessment details */}
          {assessment.assessmentType === 'Reading Assessment' && (
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-gray-800 border-b pb-2">Reading Details</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs text-gray-500 uppercase font-semibold">Reading Score</p>
                <p className="text-2xl font-bold text-green-600">{assessment.readingScore}</p>
              </div>
              {assessment.readingNotes && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 uppercase font-semibold">Reading Notes</p>
                  <p className="text-gray-700">{assessment.readingNotes}</p>
                </div>
              )}
            </div>
          )}

          {/* Writing Assessment details */}
          {assessment.assessmentType === 'Writing Assessment' && (
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-gray-800 border-b pb-2">Writing Details</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs text-gray-500 uppercase font-semibold">Writing Score</p>
                <p className="text-2xl font-bold text-orange-600">{assessment.writingScore}</p>
              </div>
              {assessment.writingNotes && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 uppercase font-semibold">Writing Notes</p>
                  <p className="text-gray-700">{assessment.writingNotes}</p>
                </div>
              )}
              {assessment.studentWriting && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 uppercase font-semibold">Student Writing</p>
                  <p className="text-gray-700">{assessment.studentWriting}</p>
                </div>
              )}
            </div>
          )}

          {/* Teacher Comments (shown for all types if present) */}
          {assessment.teacherComments && (
            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
              <p className="text-xs text-yellow-600 uppercase font-semibold">Teacher Comments</p>
              <p className="text-gray-700 mt-1">{assessment.teacherComments}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-4 bg-gray-50 rounded-b-2xl flex justify-end">
          <button onClick={onClose} className="px-6 py-2 bg-gradient-to-r from-slate-700 to-slate-800 text-white rounded-lg font-semibold hover:from-slate-800 hover:to-slate-900 transition-all">Close</button>
        </div>
      </div>
    </div>
  );
}

export default function AssessmentList() {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [viewingAssessment, setViewingAssessment] = useState(null);

  useEffect(() => {
    fetchAssessments();
  }, []);

  const fetchAssessments = async () => {
    try {
      setLoading(true);
      const data = await assessmentAPI.getAllAssessments();
      setAssessments(data);
    } catch (err) {
      toast.error(`❌ Failed to load assessments: ${err.message || 'Unknown error'}`, {
        position: 'top-right',
        autoClose: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this assessment?')) {
      try {
        setDeletingId(id);
        await assessmentAPI.deleteAssessment(id);
        setAssessments(assessments.filter((a) => a._id !== id));
        toast.success('Assessment deleted successfully!', {
          position: 'top-right',
          autoClose: 4000,
        });
      } catch (err) {
        toast.error(`❌ Failed to delete assessment: ${err.message}`, {
          position: 'top-right',
          autoClose: 4000,
        });
      } finally {
        setDeletingId(null);
      }
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getLevelColor = (assessment) => {
    if (assessment.assessmentType === 'Listening Part 1' || assessment.assessmentType === 'Listening Part 2' || assessment.assessmentType === 'Speaking Assessment') {
      // CEFR colors for Listening and Speaking Assessments
      switch (assessment.cefrLevel) {
        case 'A1': return 'bg-gradient-to-r from-red-500 to-red-600 text-white';
        case 'A2': return 'bg-gradient-to-r from-orange-500 to-orange-600 text-white';
        case 'B1': return 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white';
        case 'B2': return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white';
        case 'C1': return 'bg-gradient-to-r from-green-500 to-green-600 text-white';
        case 'C1-C2': return 'bg-gradient-to-r from-green-500 to-emerald-600 text-white';
        case 'C2': return 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white';
        default: return 'bg-gray-500 text-white';
      }
    } else if (assessment.assessmentType === 'Reading Assessment' || assessment.assessmentType === 'Writing Assessment') {
      // A-E colors for Reading and Writing
      switch (assessment.level) {
        case 'A': return 'bg-gradient-to-r from-red-500 to-red-600 text-white';
        case 'B': return 'bg-gradient-to-r from-orange-500 to-orange-600 text-white';
        case 'C': return 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white';
        case 'D': return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white';
        case 'E': return 'bg-gradient-to-r from-green-500 to-green-600 text-white';
        default: return 'bg-gray-500 text-white';
      }
    } else {
      // EAL & ELL colors
      switch (assessment.level) {
        case 'Beginner':
          return 'bg-gradient-to-r from-red-500 to-red-600 text-white';
        case 'Developing':
          return 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white';
        case 'Competent':
          return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white';
        case 'Advanced':
          return 'bg-gradient-to-r from-green-500 to-green-600 text-white';
        default:
          return 'bg-gray-500 text-white';
      }
    }
  };

  const getLevelIcon = (assessment) => {
    if (assessment.assessmentType === 'Listening Part 1' || assessment.assessmentType === 'Listening Part 2' || assessment.assessmentType === 'Speaking Assessment') {
      // CEFR icons for Listening and Speaking Assessments
      switch (assessment.cefrLevel) {
        case 'A1': return '🌱';
        case 'A2': return '📚';
        case 'B1': return '📈';
        case 'B2': return '🎯';
        case 'C1': return '⭐';
        case 'C1-C2': return '🌟';
        case 'C2': return '🏆';
        default: return '?';
      }
    } else if (assessment.assessmentType === 'Reading Assessment' || assessment.assessmentType === 'Writing Assessment') {
      // A-E icons
      switch (assessment.level) {
        case 'A': return '🌱';
        case 'B': return '📚';
        case 'C': return '📈';
        case 'D': return '⭐';
        case 'E': return '🏆';
        default: return '?';
      }
    } else {
      // EAL & ELL icons
      switch (assessment.level) {
        case 'Beginner':
          return '🌱';
        case 'Developing':
          return '📈';
        case 'Competent':
          return '✓';
        case 'Advanced':
          return '🏆';
        default:
          return '⭐';
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-block mb-4">
            <span className="text-5xl">📋</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
            Assessment Records
          </h1>
          <p className="text-purple-200 text-lg">
            Track and manage all student assessments
          </p>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="bg-white bg-opacity-95 rounded-2xl shadow-2xl p-12 text-center backdrop-blur-lg">
            <div className="inline-block mb-4">
              <div className="text-5xl animate-bounce">⏳</div>
            </div>
            <p className="text-gray-600 text-lg font-semibold">Loading assessments...</p>
          </div>
        ) : assessments.length === 0 ? (
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl p-12 text-center backdrop-blur-lg">
            <div className="inline-block mb-4">
              <span className="text-6xl">📭</span>
            </div>
            <p className="text-gray-600 text-xl font-semibold mb-2">No assessments found yet.</p>
            <p className="text-gray-500">Create your first assessment using the form.</p>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">Total Assessments</p>
                    <p className="text-3xl font-bold">{assessments.length}</p>
                  </div>
                  <span className="text-4xl">📊</span>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-purple-100 text-sm font-medium">EAL & ELL</p>
                    <p className="text-3xl font-bold">
                      {assessments.filter(a => a.assessmentType === 'EAL & ELL').length}
                    </p>
                  </div>
                  <span className="text-4xl">📝</span>
                </div>
              </div>

              <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl p-6 text-white shadow-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-cyan-100 text-sm font-medium">Listening Part 1</p>
                    <p className="text-3xl font-bold">
                      {assessments.filter(a => a.assessmentType === 'Listening Part 1').length}
                    </p>
                  </div>
                  <span className="text-4xl">🎧</span>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-green-100 text-sm font-medium">Average Score</p>
                    <p className="text-3xl font-bold">
                      {(assessments.reduce((sum, a) => sum + (a.totalScore || 0), 0) / assessments.length).toFixed(1)}
                    </p>
                  </div>
                  <span className="text-4xl">⭐</span>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white bg-opacity-95 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-lg">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-slate-800 to-slate-900 text-white">
                      <th className="px-6 py-4 text-left font-bold">Student Name</th>
                      <th className="px-6 py-4 text-left font-bold">Year & Class</th>
                      <th className="px-6 py-4 text-left font-bold">Assessment Type</th>
                      <th className="px-6 py-4 text-center font-bold">Score</th>
                      <th className="px-6 py-4 text-center font-bold">Level</th>
                      <th className="px-6 py-4 text-left font-bold">Date</th>
                      <th className="px-6 py-4 text-center font-bold">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assessments.map((assessment, index) => (
                      <tr
                        key={assessment._id}
                        className={`border-b border-gray-200 hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 transition-all duration-200 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                          }`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full flex items-center justify-center text-white font-bold">
                              {assessment.studentName.charAt(0)}
                            </div>
                            <span className="text-gray-800 font-semibold">
                              {assessment.studentName}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-700">{assessment.yearGroupAndClass}</td>
                        <td className="px-6 py-4 text-gray-700 font-semibold">
                          <span className={`px-3 py-1 rounded-full text-white text-sm font-bold ${assessment.assessmentType === 'EAL & ELL'
                              ? 'bg-gradient-to-r from-purple-500 to-purple-600'
                              : assessment.assessmentType === 'Listening Part 1'
                                ? 'bg-gradient-to-r from-cyan-500 to-cyan-600'
                                : assessment.assessmentType === 'Listening Part 2'
                                  ? 'bg-gradient-to-r from-indigo-500 to-indigo-600'
                                  : assessment.assessmentType === 'Speaking Assessment'
                                    ? 'bg-gradient-to-r from-red-500 to-red-600'
                                    : assessment.assessmentType === 'Reading Assessment'
                                      ? 'bg-gradient-to-r from-green-500 to-green-600'
                                      : 'bg-gradient-to-r from-orange-500 to-orange-600'
                            }`}>
                            {assessment.assessmentType === 'EAL & ELL'
                              ? '📝 EAL & ELL'
                              : assessment.assessmentType === 'Listening Part 1'
                                ? '🎧 Listening P1'
                                : assessment.assessmentType === 'Listening Part 2'
                                  ? `🎤 Listening P2 ${assessment.yearGroupType === 'junior' ? '(Y7-9)' : '(Y10-13)'}`
                                  : assessment.assessmentType === 'Speaking Assessment'
                                    ? '🎙️ Speaking'
                                    : assessment.assessmentType === 'Reading Assessment'
                                      ? '📚 Reading'
                                      : '✏️ Writing'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-block px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-lg shadow-md">
                            {assessment.totalScore || 0}
                            {assessment.assessmentType === 'Listening Part 1' ? '/26'
                              : assessment.assessmentType === 'Listening Part 2' ? (assessment.yearGroupType === 'junior' ? '/8' : '/20')
                                : assessment.assessmentType === 'Speaking Assessment' ? '/12'
                                  : assessment.assessmentType === 'EAL & ELL' ? ''
                                    : ''}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm ${getLevelColor(assessment)} shadow-md`}>
                            {getLevelIcon(assessment)}
                            {assessment.assessmentType === 'EAL & ELL' ? assessment.level : assessment.cefrLevel || assessment.level}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-600 text-sm">
                          {formatDate(assessment.createdAt)}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => setViewingAssessment(assessment)}
                              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-lg font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-md"
                              title="View Details"
                            >
                              👁️
                            </button>
                            <button
                              onClick={() => handleDelete(assessment._id)}
                              disabled={deletingId === assessment._id}
                              className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 disabled:from-gray-400 disabled:to-gray-400 text-white rounded-lg font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-md"
                            >
                              {deletingId === assessment._id ? '⏳' : '🗑️'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary Footer */}
              <div className="bg-gradient-to-r from-slate-50 to-purple-50 border-t border-gray-200 px-6 py-4">
                <p className="text-gray-700 font-medium flex items-center gap-2">
                  <span className="text-2xl">✨</span>
                  <span>Showing <span className="font-bold text-purple-600">{assessments.length}</span> assessment{assessments.length !== 1 ? 's' : ''}</span>
                </p>
              </div>
            </div>

            {/* Refresh Button */}
            <div className="mt-8 text-center">
              <button
                onClick={fetchAssessments}
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl font-bold transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg"
              >
                🔄 Refresh
              </button>
            </div>
          </>
        )}
        {/* View Detail Modal */}
        <DetailModal assessment={viewingAssessment} onClose={() => setViewingAssessment(null)} />
      </div>
    </div>
  );
}
