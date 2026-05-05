import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { authService } from '../services/authService';
import { assessmentAPI } from '../services/api';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [recentAssessments, setRecentAssessments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const currentUser = authService.getCurrentUser();
      setUser(currentUser);

      // Load recent assessments (you'll need to modify the API to filter by teacher)
      const assessments = await assessmentAPI.getAllAssessments();
      // Filter assessments by current teacher
      const teacherAssessments = assessments.filter(assessment => {
        const tName = (assessment.teacherName || '').toLowerCase();
        const tEmail = (assessment.email || '').toLowerCase();
        const curName = (currentUser.fullName || '').toLowerCase();
        const curFirst = (currentUser.firstName || '').toLowerCase();
        const curEmail = (currentUser.email || '').toLowerCase();

        return tName === curName || 
               tName === curFirst ||
               tEmail === curEmail ||
               (curFirst === 'demo' && assessments.length > 0); // Show all if demo user
      });
      setRecentAssessments(teacherAssessments.slice(0, 10));
    } catch (error) {
      toast.error('Failed to load dashboard data');
      console.error('Dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  const assessmentTypes = [
    {
      id: 'listening',
      title: 'Listening Assessment',
      description: 'Comprehensive evaluation of auditory comprehension across CEFR levels.',
      icon: '🎧',
      color: 'bg-blue-500',
      route: '/assessment/listening'
    },
    {
      id: 'speaking',
      title: 'Speaking Assessment',
      description: 'Assess verbal fluency, pronunciation, and interactive communication.',
      icon: '🎙️',
      color: 'bg-purple-500',
      route: '/assessment/speaking'
    },
    {
      id: 'reading',
      title: 'Reading Assessment',
      description: 'Evaluate textual comprehension, vocabulary usage, and speed.',
      icon: '📖',
      color: 'bg-emerald-500',
      route: '/assessment/reading'
    },
    {
      id: 'writing',
      title: 'Writing Assessment',
      description: 'Assess grammatical accuracy, structure, and written expression.',
      icon: '✏️',
      color: 'bg-orange-500',
      route: '/assessment/writing'
    }
  ];

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getAssessmentStats = () => {
    const stats = {
      total: recentAssessments.length,
      thisWeek: 0,
      byType: {}
    };

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    recentAssessments.forEach(assessment => {
      // Count this week's assessments
      if (new Date(assessment.createdAt) > oneWeekAgo) {
        stats.thisWeek++;
      }

      // Count by type
      const type = assessment.assessmentType;
      stats.byType[type] = (stats.byType[type] || 0) + 1;
    });

    return stats;
  };

  const getChartData = () => {
    // 1. Termly Progress Data (Sample based on recent assessments)
    const termlyData = [
      { name: 'Reading', T1: 0, T2: 0, T3: 0 },
      { name: 'Writing', T1: 0, T2: 0, T3: 0 },
      { name: 'Speaking', T1: 0, T2: 0, T3: 0 },
      { name: 'Listening', T1: 0, T2: 0, T3: 0 },
    ];

    recentAssessments.forEach(a => {
      const term = a.term || 'T1';
      const type = a.assessmentType.toLowerCase();
      
      let index = -1;
      if (type.includes('reading')) index = 0;
      else if (type.includes('writing')) index = 1;
      else if (type.includes('speaking')) index = 2;
      else if (type.includes('listening')) index = 3;

      if (index !== -1) {
        // Simple average/score mapping for demo
        const score = a.totalScore || (a.cefrLevel ? (['A1','A2','B1','B2','C1','C2'].indexOf(a.cefrLevel) + 1) * 4 : 5);
        termlyData[index][term] = (termlyData[index][term] || 0) + score;
      }
    });

    // 2. CEFR Level Distribution
    const levelCounts = { A1: 0, A2: 0, B1: 0, B2: 0, C1: 0, C2: 0 };
    recentAssessments.forEach(a => {
      const level = a.cefrLevel || a.level;
      if (levelCounts[level] !== undefined) levelCounts[level]++;
    });

    const distributionData = Object.keys(levelCounts).map(level => ({
      name: level,
      count: levelCounts[level]
    }));

    // 3. Progress Overview (Pie Chart)
    const termCounts = { T1: 0, T2: 0, T3: 0 };
    recentAssessments.forEach(a => {
      const term = a.term || 'T1';
      if (termCounts[term] !== undefined) termCounts[term]++;
    });

    const pieData = [
      { name: 'Term 1', value: termCounts.T1 || 1 },
      { name: 'Term 2', value: termCounts.T2 || 0 },
      { name: 'Term 3', value: termCounts.T3 || 0 },
    ];

    return { termlyData, distributionData, pieData };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner w-8 h-8 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const stats = getAssessmentStats();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-widest mb-2">
                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                Honour Education Dashboard
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
                Welcome back, {user?.firstName}!
              </h1>
              <p className="text-slate-500 mt-2 font-medium flex items-center gap-2">
                <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                {user?.school} <span className="text-slate-300">|</span> {user?.department}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/assessments')}
                className="btn-primary flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-md hover:shadow-blue-500/20"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                New Assessment
              </button>
              <button
                onClick={() => navigate('/profile')}
                className="btn-secondary flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm border border-slate-200 hover:bg-slate-50 transition-all"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                My Profile
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="stat-card bg-blue-50 border-blue-200">
            <div className="stat-icon bg-blue-100 text-blue-600">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 0 012 2" />
              </svg>
            </div>
            <div>
              <div className="stat-value text-blue-600">{stats.total}</div>
              <div className="stat-label">Total Assessments</div>
            </div>
          </div>

          <div className="stat-card bg-emerald-50 border-emerald-200">
            <div className="stat-icon bg-emerald-100 text-emerald-600">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <div className="stat-value text-emerald-600">{stats.thisWeek}</div>
              <div className="stat-label">This Week</div>
            </div>
          </div>

          <div className="stat-card bg-purple-50 border-purple-200">
            <div className="stat-icon bg-purple-100 text-purple-600">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <div className="stat-value text-purple-600">
                {user?.teachingExperience || 0}
              </div>
              <div className="stat-label">Years Experience</div>
            </div>
          </div>
        </div>

        {/* Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Individual Termly Progress */}
          <div className="card-section">
            <h2 className="section-heading">
              <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              </svg>
              Individual Termly Student Progress
            </h2>
            <div className="h-[300px] mt-6">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={getChartData().termlyData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend iconType="circle" />
                  <Bar dataKey="T1" name="Term 1" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="T2" name="Term 2" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="T3" name="Term 3" fill="#eab308" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* CEFR Level Distribution */}
          <div className="card-section">
            <h2 className="section-heading">
              <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
              </svg>
              EAL Proficiency Scale Distribution
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[300px] mt-6">
              <div className="h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={getChartData().pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {getChartData().pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={['#3b82f6', '#ef4444', '#eab308'][index % 3]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart layout="vertical" data={getChartData().distributionData}>
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Assessment Types */}
        <div className="card-section">
          <h2 className="section-heading">
            <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            Create New Assessment
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {assessmentTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => navigate(type.route)}
                className="group text-left bg-white rounded-xl border border-slate-200 p-6 hover:border-slate-300 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-12 h-12 ${type.color} rounded-xl flex items-center justify-center text-white text-xl group-hover:scale-110 transition-transform`}>
                    {type.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {type.title}
                    </h3>
                  </div>
                </div>
                <p className="text-sm text-slate-600 mb-4">{type.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    {stats.byType[type.title] || 0} completed
                  </span>
                  <svg className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Assessments */}
        <div className="card-section">
          <div className="flex items-center justify-between mb-6">
            <h2 className="section-heading mb-0">
              <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Recent Assessments
            </h2>
            <button
              onClick={() => navigate('/records')}
              className="btn-secondary btn-sm"
            >
              View All
            </button>
          </div>

          {recentAssessments.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-12 h-12 text-slate-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-slate-500 mb-4">No assessments yet</p>
              <button
                onClick={() => navigate('/assessments')}
                className="btn-primary"
              >
                Create Your First Assessment
              </button>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Assessment Type</th>
                    <th>Level/Score</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recentAssessments.slice(0, 5).map((assessment) => (
                    <tr key={assessment._id}>
                      <td>
                        <div>
                          <p className="font-medium text-slate-900">{assessment.studentName}</p>
                          <p className="text-xs text-slate-500">{assessment.yearGroupAndClass}</p>
                        </div>
                      </td>
                      <td>
                        <span className="type-pill bg-slate-100 text-slate-700">
                          {assessment.assessmentType}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <span className={`badge ${
                            assessment.level === 'A1' || assessment.level === 'A' ? 'badge-red' :
                            assessment.level === 'A2' || assessment.level === 'B' ? 'badge-orange' :
                            assessment.level === 'B1' || assessment.level === 'C' ? 'badge-amber' :
                            assessment.level === 'B2' || assessment.level === 'D' ? 'badge-blue' :
                            assessment.level === 'C1' || assessment.level === 'E' ? 'badge-emerald' :
                            assessment.level === 'C2' ? 'badge-purple' : 'badge-slate'
                          }`}>
                            {assessment.level}
                          </span>
                          {assessment.totalScore && (
                            <span className="text-xs text-slate-500">
                              ({assessment.totalScore})
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="text-sm text-slate-600">
                        {formatDate(assessment.createdAt)}
                      </td>
                      <td>
                        <button className="btn-ghost btn-sm">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button
            onClick={() => navigate('/assessments')}
            className="card-hover p-6 text-left"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">New Assessment</h3>
                <p className="text-sm text-slate-600">Create a new student assessment</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => navigate('/records')}
            className="card-hover p-6 text-left"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">View Records</h3>
                <p className="text-sm text-slate-600">Browse all assessment records</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => navigate('/profile')}
            className="card-hover p-6 text-left"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">My Profile</h3>
                <p className="text-sm text-slate-600">Update your information</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}