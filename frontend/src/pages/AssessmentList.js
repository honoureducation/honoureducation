import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { assessmentAPI } from '../services/api';

export default function AssessmentList() {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);

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
        toast.success('✅ Assessment deleted successfully!', {
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

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl shadow-lg animate-slide-down">
            <div className="flex items-center gap-3">
              <span className="text-2xl">❌</span>
              <span className="font-semibold">{error}</span>
            </div>
          </div>
        )}

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
                        className={`border-b border-gray-200 hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 transition-all duration-200 ${
                          index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
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
                          <span className={`px-3 py-1 rounded-full text-white text-sm font-bold ${
                            assessment.assessmentType === 'EAL & ELL' 
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
                          <button
                            onClick={() => handleDelete(assessment._id)}
                            disabled={deletingId === assessment._id}
                            className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 disabled:from-gray-400 disabled:to-gray-400 text-white rounded-lg font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-md"
                          >
                            {deletingId === assessment._id ? '⏳' : '🗑️'}
                          </button>
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
      </div>
    </div>
  );
}
