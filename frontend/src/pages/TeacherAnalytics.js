import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { assessmentAPI } from '../services/api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, AreaChart, Area
} from 'recharts';

function getInitials(name) {
  return name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : '?';
}

const COLORS = ['#3b82f6', '#ef4444', '#f59e0b', '#10b981', '#6366f1'];

export default function StudentDashboard() {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  useEffect(() => {
    fetchAssessments();
  }, []);

  const fetchAssessments = async () => {
    try {
      setLoading(true);
      const data = await assessmentAPI.getAllAssessments();
      setAssessments(data);
    } catch (err) {
      toast.error('Failed to load assessments');
    } finally {
      setLoading(false);
    }
  };

  const teachersMap = assessments.reduce((acc, a) => {
    const key = a.teacherName || 'Unknown Teacher';
    if (!acc[key]) acc[key] = [];
    acc[key].push(a);
    return acc;
  }, {});

  const teacherList = Object.entries(teachersMap).map(([name, list]) => ({ 
    name, 
    assessments: list,
    email: list[0]?.email || 'N/A'
  }));

  const termScores = (list) => {
    const scores = { T1: 0, T2: 0, T3: 0 };
    list.forEach(a => {
      const term = (a.term || 'T1').toUpperCase();
      const score = a.totalScore ?? 0;
      if (term === 'T1') scores.T1 += score;
      else if (term === 'T2') scores.T2 += score;
      else if (term === 'T3') scores.T3 += score;
    });
    return scores;
  };

  const overallData = teacherList.map(s => {
    const ts = termScores(s.assessments);
    return { name: s.name, ...ts };
  });

  const pieData = [
    { name: 'T1 Assessments', value: assessments.filter(a => (a.term || 'T1').toUpperCase() === 'T1').length },
    { name: 'T2 Assessments', value: assessments.filter(a => (a.term || 'T1').toUpperCase() === 'T2').length },
    { name: 'T3 Assessments', value: assessments.filter(a => (a.term || 'T1').toUpperCase() === 'T3').length },
  ].filter(d => d.value > 0);

  const getTeacherProgressData = (list) => {
    const ts = termScores(list);
    return [
      { name: 'T1', score: ts.T1 },
      { name: 'T2', score: ts.T2 },
      { name: 'T3', score: ts.T3 },
    ];
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Teacher Performance Analytics</h2>
          <p className="text-slate-500 text-sm">Detailed overview of teacher assessment submissions across all terms.</p>
        </div>
        <button 
          onClick={fetchAssessments}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl font-bold text-sm hover:bg-indigo-100 transition-all"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh Data
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-slate-500 font-medium">Analyzing teacher data...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Teacher List Sidebar */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col h-[600px]">
              <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                <h3 className="font-bold text-slate-800">Teachers</h3>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Select to view detailed records</p>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {teacherList.length === 0 ? (
                  <p className="text-center text-slate-400 text-sm py-10 italic">No teachers found.</p>
                ) : teacherList.map(s => (
                  <button 
                    key={s.name} 
                    onClick={() => setSelectedTeacher(s)}
                    className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all group ${
                      selectedTeacher?.name === s.name ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-3 text-left">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                        selectedTeacher?.name === s.name ? 'bg-white/20' : 'bg-indigo-50 text-indigo-600'
                      }`}>
                        {getInitials(s.name)}
                      </div>
                      <div>
                        <p className="text-sm font-bold truncate max-w-[120px]">{s.name}</p>
                        <p className={`text-[10px] ${selectedTeacher?.name === s.name ? 'text-indigo-100' : 'text-slate-400'}`}>{s.email}</p>
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
                      selectedTeacher?.name === s.name ? 'bg-white/20' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {s.assessments.length}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Analytics Area */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Global Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                <h3 className="text-lg font-bold text-slate-800 mb-1">Overall Term Progress</h3>
                <p className="text-xs text-slate-400 mb-6">Aggregate score distribution across terms</p>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={8}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend verticalAlign="bottom" height={36} formatter={(value) => <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{value}</span>} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                <h3 className="text-lg font-bold text-slate-800 mb-1">Term Comparison</h3>
                <p className="text-xs text-slate-400 mb-6">Student performance across T1, T2, T3</p>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={overallData.slice(0, 5)}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }} />
                      <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                      <Bar dataKey="T1" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={8} />
                      <Bar dataKey="T2" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={8} />
                      <Bar dataKey="T3" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={8} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Individual Selection Detail */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden min-h-[300px]">
              {selectedTeacher ? (
                <div className="p-8 space-y-8 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-xl font-bold">
                        {getInitials(selectedTeacher.name)}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-800">{selectedTeacher.name}</h3>
                        <p className="text-sm text-slate-500">{selectedTeacher.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Assessments</p>
                      <p className="text-2xl font-bold text-indigo-600">{selectedTeacher.assessments.length}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="text-sm font-bold text-slate-700 mb-4">Assessment History</h4>
                      <div className="space-y-3">
                        {selectedTeacher.assessments.map((a, i) => (
                          <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100 group hover:border-indigo-200 transition-colors">
                            <div>
                              <p className="text-xs font-bold text-slate-800">{a.assessmentType}</p>
                              <p className="text-[10px] text-slate-400 uppercase font-bold">Term: {a.term || 'T1'}</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-bold text-indigo-600">{a.totalScore ?? 0} pts</span>
                              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition-colors">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-700 mb-4">Progress Trend</h4>
                      <div className="h-[200px] bg-slate-50 rounded-3xl p-4 border border-slate-100">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={getTeacherProgressData(selectedTeacher.assessments)}>
                            <defs>
                              <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                            <Area type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                      <p className="mt-4 text-[10px] text-center text-slate-400 italic font-medium">Visualizing progress across T1, T2, and T3 terms</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full py-20 text-center">
                  <div className="w-16 h-16 bg-slate-50 text-slate-200 rounded-2xl flex items-center justify-center mb-4">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h3 className="text-slate-800 font-bold">No Teacher Selected</h3>
                  <p className="text-slate-500 text-sm max-w-[200px]">Select a teacher from the list to view their detailed performance analytics.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

