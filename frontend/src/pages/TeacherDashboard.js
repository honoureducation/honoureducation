import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { authService } from '../services/authService';
import { assessmentAPI } from '../services/api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import Chart from 'react-apexcharts';

// ... (rest of the file remains unchanged)

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [allAssessments, setAllAssessments] = useState([]);
  const [recentAssessments, setRecentAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState('');

  useEffect(() => {
    loadDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const currentUser = authService.getCurrentUser();
      setUser(currentUser);

      // Backend now returns ONLY this teacher's assessments — no client-side filtering needed
      const assessments = await assessmentAPI.getAllAssessments();

      setAllAssessments(assessments);
      setRecentAssessments(assessments.slice(0, 10));

      // Select first student by default if available
      const uniqueStudents = Array.from(new Set(assessments.map(a => a.studentName))).filter(Boolean);
      if (uniqueStudents.length > 0 && !selectedStudent) {
        setSelectedStudent(uniqueStudents[0]);
      }
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
      total: allAssessments.length,
      thisWeek: 0,
      byType: {}
    };

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    allAssessments.forEach(assessment => {
      if (new Date(assessment.createdAt) > oneWeekAgo) {
        stats.thisWeek++;
      }
      const type = assessment.assessmentType;
      stats.byType[type] = (stats.byType[type] || 0) + 1;
    });

    return stats;
  };

  const getChartData = (dataToProcess) => {
    const termlyData = [
      { name: 'Reading', T1: 0, T2: 0, T3: 0, count: { T1: 0, T2: 0, T3: 0 } },
      { name: 'Writing', T1: 0, T2: 0, T3: 0, count: { T1: 0, T2: 0, T3: 0 } },
      { name: 'Speaking', T1: 0, T2: 0, T3: 0, count: { T1: 0, T2: 0, T3: 0 } },
      { name: 'Listening', T1: 0, T2: 0, T3: 0, count: { T1: 0, T2: 0, T3: 0 } },
    ];

    const termScores = { T1: 0, T2: 0, T3: 0 };

    dataToProcess.forEach(a => {
      const term = (a.term || 'T1').toUpperCase();
      const type = a.assessmentType.toLowerCase();

      const score = a.totalScore || (a.cefrLevel ? (['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].indexOf(a.cefrLevel) + 1) * 4 : 5);

      if (termScores[term] !== undefined) termScores[term] += score;

      let index = -1;
      if (type.includes('reading')) index = 0;
      else if (type.includes('writing')) index = 1;
      else if (type.includes('speaking')) index = 2;
      else if (type.includes('listening')) index = 3;

      if (index !== -1) {
        termlyData[index][term] += score;
        termlyData[index].count[term] += 1;
      }
    });

    // Calculate averages
    const finalTermlyData = termlyData.map(item => ({
      name: item.name,
      T1: item.count.T1 > 0 ? parseFloat((item.T1 / item.count.T1).toFixed(1)) : 0,
      T2: item.count.T2 > 0 ? parseFloat((item.T2 / item.count.T2).toFixed(1)) : 0,
      T3: item.count.T3 > 0 ? parseFloat((item.T3 / item.count.T3).toFixed(1)) : 0,
    }));

    // CEFR Level Distribution
    const levelCounts = { A1: 0, A2: 0, B1: 0, B2: 0, C1: 0, C2: 0 };
    dataToProcess.forEach(a => {
      const level = a.cefrLevel || a.level;
      if (levelCounts[level] !== undefined) levelCounts[level]++;
    });

    const distributionData = Object.keys(levelCounts).map(level => ({
      name: level,
      count: levelCounts[level]
    }));

    // FIXED: Overall Assessment Distribution by Student Name (Pie Chart Data)
    // Count total assessments per student to show overall progress
    const studentCounts = {};
    dataToProcess.forEach(a => {
      const studentName = a.studentName || 'Unknown';
      studentCounts[studentName] = (studentCounts[studentName] || 0) + 1;
    });

    const overallDistributionData = Object.keys(studentCounts).map(student => ({
      name: student,
      count: studentCounts[student]
    }));

    return {
      termlyData: finalTermlyData,
      distributionData,
      overallDistributionData // NEW: Overall assessment count by student
    };
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
  const students = Array.from(new Set(allAssessments.map(a => a.studentName))).filter(Boolean).sort();
  const selectedStudentData = allAssessments.filter(a => a.studentName === selectedStudent);
  const studentChartData = getChartData(selectedStudentData);
  const overallChartData = getChartData(allAssessments);
  // Data for overall student assessments per type
  const overallAssessmentsData = assessmentTypes.map(t => ({
    name: t.title,
    count: stats.byType[t.title] || 0,
  }));

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
        <div className="space-y-8">
          {/* Individual Student Report */}
          <div className="card-section bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Individual Student Performance
                </h2>
                <p className="text-slate-500 text-sm">Select a student to view their detailed progress report.</p>
              </div>
              <div className="w-full md:w-72">
                <select
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 text-slate-700 font-bold shadow-inner transition-all"
                >
                  <option value="">Select a student...</option>
                  {students.map(student => (
                    <option key={student} value={student}>{student}</option>
                  ))}
                </select>
              </div>
            </div>

            {selectedStudent ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8">
                  <div className="h-[350px] w-full bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={studentChartData.termlyData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} />
                        <Tooltip
                          contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                          cursor={{ fill: '#f1f5f9' }}
                        />
                        <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                        <Bar dataKey="T1" name="Term 1" fill="#4f46e5" radius={[6, 6, 0, 0]} barSize={20} />
                        <Bar dataKey="T2" name="Term 2" fill="#ef4444" radius={[6, 6, 0, 0]} barSize={20} />
                        <Bar dataKey="T3" name="Term 3" fill="#f59e0b" radius={[6, 6, 0, 0]} barSize={20} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="lg:col-span-4">
                  <div className="bg-indigo-50/50 rounded-2xl p-6 border border-indigo-100 h-full">
                    <h3 className="text-xs font-black text-indigo-900 mb-4 uppercase tracking-widest">Recent Assessments</h3>
                    <div className="space-y-3 max-h-[280px] overflow-y-auto pr-2 custom-scrollbar">
                      {selectedStudentData.length === 0 ? (
                        <p className="text-slate-400 text-sm italic py-10 text-center">No records found.</p>
                      ) : selectedStudentData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map((a, i) => (
                        <div key={i} className="bg-white p-4 rounded-xl border border-indigo-100 flex justify-between items-center shadow-sm hover:border-indigo-300 transition-colors">
                          <div>
                            <p className="text-sm font-bold text-slate-900">{a.assessmentType}</p>
                            <p className="text-[10px] text-indigo-500 font-black uppercase">{a.term || 'T1'}</p>
                          </div>
                          <div className="text-right">
                            <span className="px-2 py-1 bg-indigo-600 text-white text-[10px] font-bold rounded-lg">{a.totalScore || a.level}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-[300px] flex flex-col items-center justify-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <p className="text-slate-500 font-bold">Select a student above to view report</p>
              </div>
            )}
          </div>

          {/* Overall Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="card-section bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
              <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <svg className="w-6 h-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Class Average
              </h2>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={overallChartData.termlyData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }} />
                    <Tooltip
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
                    <Bar dataKey="T1" name="T1" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="T2" name="T2" fill="#ef4444" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="T3" name="T3" fill="#eab308" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card-section bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
              <h2 className="text-sm font-bold text-slate-400 mb-6 uppercase tracking-widest">
                Total Student Progress - All Assessments
              </h2>
              <div className="h-[250px]">
                <Chart
                  options={{
                    labels: overallChartData.overallDistributionData.map(d => d.name),
                    colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'],
                    legend: { position: 'bottom', fontSize: '11px', fontWeight: 'bold' },
                    dataLabels: {
                      enabled: true,
                      formatter: (val) => `${val.toFixed(1)}%`
                    },
                    tooltip: {
                      y: {
                        formatter: (val) => `${val} assessments`
                      }
                    }
                  }}
                  series={overallChartData.overallDistributionData.map(d => d.count)}
                  type="pie"
                  height={250}
                />
              </div>
            </div>

            <div className="card-section bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">

              <h2 className="text-sm font-bold text-slate-400 mb-6 uppercase tracking-widest">
                Overall Student Assessments by Type
              </h2>
              <div className="h-[250px]">
                <Chart
                  options={{
                    chart: { type: 'bar', height: 250, toolbar: { show: false } },
                    xaxis: { categories: overallAssessmentsData.map(d => d.name.replace(' Assessment', '')) },
                    colors: ['#6b7280'],
                    plotOptions: { bar: { distributed: true, borderRadius: 4 } },
                    dataLabels: { enabled: false },
                    legend: { show: false },
                  }}
                  series={[{ name: 'Count', data: overallAssessmentsData.map(d => d.count) }]}
                />
              </div>
            </div>
            <div className="card-section bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
              <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <svg className="w-6 h-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Proficiency
              </h2>
              <div className="h-[250px] flex items-center">
                <ResponsiveContainer width="100%" height="80%">
                  <BarChart layout="vertical" data={overallChartData.distributionData}>
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} />
                    <Tooltip cursor={{ fill: 'transparent' }} />
                    <Bar dataKey="count" fill="#8b5cf6" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Assessment Types */}
        <div className="card-section bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <h2 className="text-xl font-bold text-slate-800 mb-8 flex items-center gap-2">
            <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            Create New Assessment
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {assessmentTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => navigate(type.route)}
                className="group text-left bg-slate-50 rounded-2xl border border-slate-100 p-6 hover:bg-white hover:border-blue-200 hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-14 h-14 ${type.color} rounded-2xl flex items-center justify-center text-white text-2xl group-hover:scale-110 transition-transform shadow-lg`}>
                    {type.icon}
                  </div>
                </div>
                <h3 className="font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {type.title}
                </h3>
                <p className="text-xs text-slate-500 mb-6 leading-relaxed">{type.description}</p>
                <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    {stats.byType[type.title] || 0} Records
                  </span>
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-slate-300 group-hover:text-blue-600 group-hover:bg-blue-50 transition-all">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Assessments */}
        <div className="card-section bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Recent Activity
            </h2>
            <button
              onClick={() => navigate('/records')}
              className="px-4 py-2 bg-slate-50 text-slate-600 rounded-xl font-bold text-xs hover:bg-slate-100 transition-all border border-slate-200"
            >
              See All Records
            </button>
          </div>

          {recentAssessments.length === 0 ? (
            <div className="text-center py-16 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 0 012 2" />
                </svg>
              </div>
              <p className="text-slate-500 font-bold mb-4">No assessments found yet</p>
              <button
                onClick={() => navigate('/assessments')}
                className="btn-primary"
              >
                Create Your First Assessment
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="pb-4 font-black text-[10px] text-slate-400 uppercase tracking-widest px-4">Student</th>
                    <th className="pb-4 font-black text-[10px] text-slate-400 uppercase tracking-widest px-4">Assessment</th>
                    <th className="pb-4 font-black text-[10px] text-slate-400 uppercase tracking-widest px-4">Proficiency</th>
                    <th className="pb-4 font-black text-[10px] text-slate-400 uppercase tracking-widest px-4">Date</th>
                    <th className="pb-4 font-black text-[10px] text-slate-400 uppercase tracking-widest px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {recentAssessments.slice(0, 5).map((assessment) => (
                    <tr key={assessment._id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{assessment.studentName}</p>
                          <p className="text-[10px] text-slate-400 font-bold">{assessment.yearGroupAndClass}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-black uppercase">
                          {assessment.assessmentType}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-black ${assessment.level === 'A1' || assessment.level === 'A' ? 'bg-red-50 text-red-600' :
                            assessment.level === 'A2' || assessment.level === 'B' ? 'bg-orange-50 text-orange-600' :
                              assessment.level === 'B1' || assessment.level === 'C' ? 'bg-amber-50 text-amber-600' :
                                assessment.level === 'B2' || assessment.level === 'D' ? 'bg-blue-50 text-blue-600' :
                                  assessment.level === 'C1' || assessment.level === 'E' ? 'bg-emerald-50 text-emerald-600' :
                                    assessment.level === 'C2' ? 'bg-purple-50 text-purple-600' : 'bg-slate-50 text-slate-600'
                            }`}>
                            {assessment.level}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-[10px] font-bold text-slate-400 uppercase">
                        {formatDate(assessment.createdAt)}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <button className="w-8 h-8 rounded-lg bg-slate-50 text-slate-400 hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center ml-auto">
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

        {/* Support Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
          <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-3xl p-8 text-white shadow-xl shadow-blue-200 overflow-hidden relative group">
            <div className="relative z-10">
              <h3 className="text-2xl font-bold mb-2">Need Assistance?</h3>
              <p className="text-blue-100 mb-6 text-sm">Our support team is here to help you with any questions about the assessment platform.</p>
              <button onClick={() => navigate('/contact')} className="px-6 py-3 bg-white text-indigo-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:shadow-lg transition-all active:scale-95">Contact Support</button>
            </div>
            <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
          </div>
          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex flex-col justify-center">
            <h3 className="text-xl font-bold text-slate-800 mb-2">Documentation</h3>
            <p className="text-slate-500 mb-6 text-sm">Learn more about how to use the assessment tools and interpret the proficiency levels.</p>
            <button onClick={() => navigate('/about')} className="text-blue-600 font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:gap-4 transition-all">View Guide <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7-7 7" /></svg></button>
          </div>
        </div>
      </div>
    </div>
  );
}