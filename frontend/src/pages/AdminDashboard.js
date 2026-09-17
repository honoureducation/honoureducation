import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { adminService, authService } from '../services/authService';
import TeacherAnalytics from './TeacherAnalytics';
import AdminContactMessages from './AdminContactMessages';
import AssessmentList from './AssessmentList';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import Chart from 'react-apexcharts';


export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [pendingTeachers, setPendingTeachers] = useState([]);
  const [allTeachers, setAllTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [teacherAssessments, setTeacherAssessments] = useState([]);
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, pendingData, teachersData] = await Promise.all([
        adminService.getDashboardStats(),
        adminService.getPendingTeachers(),
        adminService.getAllTeachers()
      ]);

      setStats(statsData);
      setPendingTeachers(pendingData.teachers || []);
      setAllTeachers(teachersData.teachers || []);
      console.log('Teachers Data Loaded:', teachersData.teachers);
    } catch (error) {
      toast.error('Failed to load dashboard data');
      console.error('Dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveTeacher = async (teacherId) => {
    try {
      setActionLoading(prev => ({ ...prev, [teacherId]: 'approving' }));
      await adminService.approveTeacher(teacherId);
      toast.success('Teacher approved successfully');
      loadDashboardData();
    } catch (error) {
      toast.error(error.message || 'Failed to approve teacher');
    } finally {
      setActionLoading(prev => ({ ...prev, [teacherId]: null }));
    }
  };

  const handleRejectTeacher = async (teacherId, reason) => {
    try {
      setActionLoading(prev => ({ ...prev, [teacherId]: 'rejecting' }));
      await adminService.rejectTeacher(teacherId, reason);
      toast.success('Teacher rejected');
      loadDashboardData();
    } catch (error) {
      toast.error(error.message || 'Failed to reject teacher');
    } finally {
      setActionLoading(prev => ({ ...prev, [teacherId]: null }));
    }
  };

  const handleViewTeacher = async (teacherId) => {
    try {
      setIsViewModalOpen(true);
      const data = await adminService.getTeacherDetails(teacherId);
      setSelectedTeacher(data.teacher);
      setTeacherAssessments(data.assessments.recent);
    } catch (error) {
      toast.error('Failed to load teacher details');
      setIsViewModalOpen(false);
    }
  };

  const handleEditTeacher = (teacher) => {
    setSelectedTeacher(teacher);
    setIsEditModalOpen(true);
  };

  const handleUpdateTeacher = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const updates = {
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      department: formData.get('department'),
      status: formData.get('status')
    };

    try {
      setActionLoading(prev => ({ ...prev, [selectedTeacher._id]: 'updating' }));
      await adminService.updateTeacher(selectedTeacher._id, updates);
      toast.success('Teacher updated successfully');
      setIsEditModalOpen(false);
      loadDashboardData();
    } catch (error) {
      toast.error(error.message || 'Failed to update teacher');
    } finally {
      setActionLoading(prev => ({ ...prev, [selectedTeacher._id]: null }));
    }
  };

  const confirmDeleteTeacher = (teacher) => {
    setSelectedTeacher(teacher);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteTeacher = async () => {
    try {
      setActionLoading(prev => ({ ...prev, [selectedTeacher._id]: 'deleting' }));
      await adminService.deleteTeacher(selectedTeacher._id);
      toast.success('Teacher permanently deleted');
      setIsDeleteModalOpen(false);
      loadDashboardData();
    } catch (error) {
      toast.error(error.message || 'Failed to delete teacher');
    } finally {
      setActionLoading(prev => ({ ...prev, [selectedTeacher._id]: null }));
    }
  };

  const handleSuspendTeacher = async (teacherId, suspend) => {
    try {
      setActionLoading(prev => ({ ...prev, [teacherId]: suspend ? 'suspending' : 'revoking' }));
      await adminService.toggleTeacherSuspension(teacherId, suspend, suspend ? 'Suspended by admin' : '');
      toast.success(suspend ? 'Teacher suspended — data preserved, access revoked' : 'Teacher access restored');
      loadDashboardData();
    } catch (error) {
      toast.error(error.message || 'Failed to update teacher status');
    } finally {
      setActionLoading(prev => ({ ...prev, [teacherId]: null }));
    }
  };

  const getAssessmentChartData = () => {
    return stats?.termProgress || [];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-slate-500 font-medium animate-pulse">Initializing Administrative Console...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={`fixed inset-y-0 left-0 w-64 bg-slate-900 text-white z-50 transform transition-transform duration-300 lg:relative lg:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } flex flex-col border-r border-slate-800`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center text-white">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <span className="font-bold text-xl tracking-tight">Admin OS</span>
            </div>
            <button
              className="lg:hidden p-2 text-slate-400 hover:text-white"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <nav className="space-y-1">
            {[
              { id: 'overview', label: 'Dashboard', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
              { id: 'assessments', label: 'All Records', icon: 'M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2' },
              { id: 'messages', label: 'Messages', icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z' },
              { id: 'students', label: 'Teacher View', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 01-9-5.497' },
              { id: 'teachers', label: 'Manage Teachers', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37a1.724 1.724 0 002.572-1.065z' },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${activeTab === item.id
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                </svg>
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-slate-800">
          <button
            onClick={() => authService.logout()}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-rose-400 hover:bg-rose-400/10 transition-all"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div>
              <h2 className="text-lg lg:text-xl font-bold text-slate-800 capitalize leading-tight">{activeTab} View</h2>
              <p className="text-[10px] lg:text-sm text-slate-500">System Status: <span className="text-emerald-500 font-semibold">Healthy</span></p>
            </div>
          </div>

          <div className="flex items-center gap-2 lg:gap-4">
            <div className="relative hidden sm:block">
              <input
                type="text"
                placeholder="Search..."
                className="bg-slate-100 border-none rounded-full px-5 py-2 text-sm w-40 lg:w-64 focus:ring-2 focus:ring-indigo-500 transition-all"
              />
              <svg className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </div>
            <button onClick={loadDashboardData} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
              <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            <div className="w-px h-8 bg-slate-200 hidden sm:block"></div>
            <div className="flex items-center gap-2 lg:gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-900">{authService.getCurrentUser('admin')?.firstName || 'Admin'}</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                  {authService.getCurrentUser('admin')?.role.replace('_', ' ') || 'Root'}
                </p>
              </div>
              <div className="w-8 h-8 lg:w-10 lg:h-10 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold text-xs lg:text-sm uppercase">
                {authService.getCurrentUser('admin')?.firstName?.[0] || 'A'}{authService.getCurrentUser('admin')?.lastName?.[0] || 'D'}
              </div>
            </div>
          </div>
        </header>

        <div className="p-4 lg:p-8 space-y-8 animate-fade-in-up">
          {activeTab === 'overview' && (
            <>
              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: 'Total Teachers', value: stats?.teachers?.total || 0, color: 'indigo', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
                  { label: 'Pending Approval', value: stats?.teachers?.pending || 0, color: 'amber', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
                  { label: 'Assessments', value: Object.values(stats?.assessments || {}).reduce((s, c) => s + c, 0) || 0, color: 'emerald', icon: 'M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2' },
                  { label: 'Avg Proficiency', value: stats?.avgProficiency || 'N/A', color: 'rose', icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' },
                ].map((item, idx) => (
                  <div key={idx} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl bg-${item.color}-50 text-${item.color}-600 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-500">{item.label}</p>
                        <p className="text-2xl font-bold text-slate-900">{item.value}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Bar Chart: Termly Progress */}
                <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h3 className="text-lg font-bold text-slate-800">Individual Termly Student Progress</h3>
                      <p className="text-xs text-slate-400">Comparing scores across T1, T2, and T3</p>
                    </div>
                    <div className="flex gap-2">
                      <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        <span className="w-2.5 h-2.5 rounded-sm bg-[#3b82f6]"></span> T1
                      </span>
                      <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        <span className="w-2.5 h-2.5 rounded-sm bg-[#ef4444]"></span> T2
                      </span>
                      <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        <span className="w-2.5 h-2.5 rounded-sm bg-[#f59e0b]"></span> T3
                      </span>
                    </div>
                  </div>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={getAssessmentChartData()}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                          dataKey="name"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }}
                          dy={10}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }}
                        />
                        <Tooltip
                          cursor={{ fill: '#f8fafc' }}
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        />
                        <Bar dataKey="T1" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={12} />
                        <Bar dataKey="T2" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={12} />
                        <Bar dataKey="T3" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={12} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Pie Chart: Overall Teacher Performance */}
                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-800 mb-2">Teacher Assessment Contributions</h3>
                  <p className="text-xs text-slate-400 mb-8">Total assessments submitted per teacher</p>
                  <div className="h-[300px] w-full">
                    <Chart
                      options={{
                        chart: { type: 'pie', height: 300 },
                        labels: (stats?.teacherPerformance?.length > 0 ? stats.teacherPerformance.map(entry => entry.name) : []),
                        legend: { position: 'bottom', fontSize: '11px', formatter: (val, opts) => `${val}: ${opts.w.globals.series[opts.seriesIndex]}` },
                        tooltip: { enabled: true },
                        noData: { text: "No Assessments Recorded", align: 'center', verticalAlign: 'middle' },
                        responsive: [{
                          breakpoint: 480,
                          options: { chart: { width: '100%' } }
                        }]
                      }}
                      series={stats?.teacherPerformance?.length > 0 ? stats.teacherPerformance.map(entry => entry.value) : []}
                      type="pie"
                      width="100%"
                    />
                  </div>
                </div>
              </div>

              {/* Pending Approvals Table */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-800">Pending Approvals</h3>
                  <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold">{pendingTeachers.length} Action Items</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase tracking-widest font-bold">
                      <tr>
                        <th className="px-8 py-4">Teacher</th>
                        <th className="px-8 py-4">School & Dept</th>
                        <th className="px-8 py-4">Experience</th>
                        <th className="px-8 py-4 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {pendingTeachers.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="px-8 py-12 text-center text-slate-400">No applications awaiting review.</td>
                        </tr>
                      ) : pendingTeachers.map((teacher) => (
                        <tr key={teacher._id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600">
                                {teacher.firstName[0]}{teacher.lastName[0]}
                              </div>
                              <div>
                                <p className="text-sm font-bold text-slate-900">{teacher.firstName} {teacher.lastName}</p>
                                <p className="text-xs text-slate-500">{teacher.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <p className="text-sm text-slate-700 font-medium">{teacher.school?.name || teacher.school}</p>
                            <p className="text-xs text-slate-500">{teacher.department}</p>
                          </td>
                          <td className="px-8 py-6">
                            <span className="text-sm font-bold text-indigo-600">{teacher.teachingExperience} Years</span>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleApproveTeacher(teacher._id)}
                                disabled={actionLoading[teacher._id]}
                                className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                              >
                                {actionLoading[teacher._id] === 'approving' ? '...' : 'Approve'}
                              </button>
                              <button
                                onClick={() => handleRejectTeacher(teacher._id, 'Requirements not met')}
                                disabled={actionLoading[teacher._id]}
                                className="bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 px-4 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                              >
                                {actionLoading[teacher._id] === 'rejecting' ? '...' : 'Reject'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
          {activeTab === 'assessments' && (
            <AssessmentList />
          )}

          {activeTab === 'students' && (
            <TeacherAnalytics />
          )}

          {activeTab === 'messages' && <AdminContactMessages />}

          {activeTab === 'teachers' && (
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-800">All Registered Teachers</h3>
                <div className="flex gap-2">
                  <button className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-bold">+ Add Teacher</button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase tracking-widest font-bold">
                    <tr>
                      <th className="px-8 py-4">Teacher</th>
                      <th className="px-8 py-4">School</th>
                      <th className="px-8 py-4 text-center">Status</th>
                      <th className="px-8 py-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {allTeachers.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="px-8 py-12 text-center text-slate-400">
                          <div className="flex flex-col items-center gap-2">
                            <svg className="w-12 h-12 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            <p className="font-medium">No registered teachers found.</p>
                          </div>
                        </td>
                      </tr>
                    ) : allTeachers.map((teacher) => (
                      <tr key={teacher._id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                              {teacher.firstName ? teacher.firstName[0] : '?'}{teacher.lastName ? teacher.lastName[0] : ''}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900">{teacher.firstName} {teacher.lastName}</p>
                              <p className="text-xs text-slate-500">{teacher.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <p className="text-sm text-slate-700">{teacher.school?.name || teacher.school || 'N/A'}</p>
                        </td>
                        <td className="px-8 py-6 text-center">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${teacher.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                            teacher.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                              teacher.status === 'suspended' ? 'bg-orange-100 text-orange-700' :
                                'bg-red-100 text-red-700'
                            }`}>
                            {teacher.status}
                          </span>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center justify-center gap-1">
                            {/* Approve & Reject for pending teachers */}
                            {teacher.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleApproveTeacher(teacher._id)}
                                  disabled={actionLoading[teacher._id]}
                                  className="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all shadow-sm disabled:opacity-50"
                                  title="Approve Teacher"
                                >
                                  {actionLoading[teacher._id] === 'approving' ? '...' : '✓ Approve'}
                                </button>
                                <button
                                  onClick={() => handleRejectTeacher(teacher._id, 'Requirements not met')}
                                  disabled={actionLoading[teacher._id]}
                                  className="bg-rose-500 hover:bg-rose-600 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all shadow-sm disabled:opacity-50"
                                  title="Reject Teacher"
                                >
                                  {actionLoading[teacher._id] === 'rejecting' ? '...' : '✕ Reject'}
                                </button>
                              </>
                            )}
                            {/* View */}
                            <button
                              onClick={() => handleViewTeacher(teacher._id)}
                              className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
                              title="View Profile"
                            >
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                            {/* Edit */}
                            <button
                              onClick={() => handleEditTeacher(teacher)}
                              className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
                              title="Edit Teacher"
                            >
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            {/* Suspend / Revoke (temporary) */}
                            {teacher.status === 'approved' && (
                              <button
                                onClick={() => handleSuspendTeacher(teacher._id, true)}
                                disabled={actionLoading[teacher._id]}
                                className="p-2 text-slate-400 hover:text-orange-600 transition-colors"
                                title="Suspend (Temporary — data preserved)"
                              >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                </svg>
                              </button>
                            )}
                            {teacher.status === 'suspended' && (
                              <button
                                onClick={() => handleSuspendTeacher(teacher._id, false)}
                                disabled={actionLoading[teacher._id]}
                                className="p-2 text-slate-400 hover:text-emerald-600 transition-colors"
                                title="Revoke Suspension (Restore access)"
                              >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                              </button>
                            )}
                            {/* Permanent Delete */}
                            <button
                              onClick={() => confirmDeleteTeacher(teacher)}
                              className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
                              title="Permanently Delete (Cannot be undone)"
                            >
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'schools' && (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm">
              <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">School Management</h3>
              <p className="text-slate-500 max-w-md mx-auto">This module is currently being optimized for platform-wide multi-tenancy. You can still manage teachers on the Teachers tab.</p>
            </div>
          )}
        </div>
      </main>

      {/* View Teacher Modal */}
      {isViewModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsViewModalOpen(false)}></div>
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative z-10 shadow-2xl animate-fade-in-up">
            {selectedTeacher ? (
              <div className="p-0">
                <div className="bg-slate-900 p-8 text-white">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-indigo-500 flex items-center justify-center text-2xl font-bold">
                        {selectedTeacher.firstName[0]}{selectedTeacher.lastName[0]}
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold">{selectedTeacher.firstName} {selectedTeacher.lastName}</h3>
                        <p className="text-slate-400">{selectedTeacher.email}</p>
                      </div>
                    </div>
                    <button onClick={() => setIsViewModalOpen(false)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div className="flex gap-4">
                    <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-bold uppercase tracking-widest">{selectedTeacher.role}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${selectedTeacher.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                      }`}>{selectedTeacher.status}</span>
                  </div>
                </div>

                <div className="p-8 space-y-8">
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">School</p>
                      <p className="font-bold text-slate-900">{selectedTeacher.school?.name || selectedTeacher.school || 'Not Assigned'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Department</p>
                      <p className="font-bold text-slate-900">{selectedTeacher.department || 'General'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Experience</p>
                      <p className="font-bold text-slate-900">{selectedTeacher.teachingExperience || 0} Years</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Phone</p>
                      <p className="font-bold text-slate-900">{selectedTeacher.phoneNumber || 'N/A'}</p>
                    </div>
                  </div>

                  {selectedTeacher.bio && (
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Biography</p>
                      <p className="text-slate-600 text-sm leading-relaxed italic">"{selectedTeacher.bio}"</p>
                    </div>
                  )}

                  <div>
                    <h4 className="font-bold text-slate-900 mb-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        All Filled Assessments
                      </div>
                      <span className="text-xs font-bold bg-slate-100 text-slate-500 px-3 py-1 rounded-full border border-slate-200">
                        {teacherAssessments.length} Records
                      </span>
                    </h4>
                    <div className="bg-slate-50 rounded-2xl overflow-hidden border border-slate-100">
                      {teacherAssessments.length === 0 ? (
                        <p className="p-8 text-center text-slate-400 text-sm italic">No assessments recorded yet.</p>
                      ) : (
                        <table className="w-full text-left text-sm">
                          <thead className="bg-slate-100/50 text-[10px] font-bold text-slate-500 uppercase">
                            <tr>
                              <th className="px-6 py-3">Student</th>
                              <th className="px-6 py-3">Type</th>
                              <th className="px-6 py-3">Level</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {teacherAssessments.map(item => (
                              <tr key={item._id}>
                                <td className="px-6 py-4 font-bold text-slate-900">{item.studentName}</td>
                                <td className="px-6 py-4 text-slate-500">{item.assessmentType}</td>
                                <td className="px-6 py-4">
                                  <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-bold uppercase">{item.level}</span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center">
                <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-slate-500">Loading profile details...</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Teacher Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsEditModalOpen(false)}></div>
          <div className="bg-white rounded-3xl w-full max-w-md relative z-10 shadow-2xl animate-fade-in-up overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-xl font-bold text-slate-800">Edit Teacher</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleUpdateTeacher} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">First Name</label>
                  <input
                    name="firstName"
                    defaultValue={selectedTeacher?.firstName}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Last Name</label>
                  <input
                    name="lastName"
                    defaultValue={selectedTeacher?.lastName}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
                    required
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Department</label>
                <input
                  name="department"
                  defaultValue={selectedTeacher?.department}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Status</label>
                <select
                  name="status"
                  defaultValue={selectedTeacher?.status}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none bg-white"
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="suspended">Suspended</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 py-3 border border-slate-200 rounded-xl text-slate-600 font-bold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading[selectedTeacher?._id] === 'updating'}
                  className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50"
                >
                  {actionLoading[selectedTeacher?._id] === 'updating' ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Teacher Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsDeleteModalOpen(false)}></div>
          <div className="bg-white rounded-3xl w-full max-w-sm relative z-10 shadow-2xl animate-fade-in-up p-8 text-center">
            <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Permanent Delete?</h3>
            <p className="text-slate-500 text-sm mb-4">Are you sure you want to <strong className="text-rose-600">permanently delete</strong> <strong>{selectedTeacher?.firstName} {selectedTeacher?.lastName}</strong>?</p>
            <p className="text-rose-500 text-xs font-bold mb-6 bg-rose-50 rounded-xl px-4 py-3">⚠️ This will remove ALL data from the database. This action cannot be undone. Use <strong>Suspend</strong> instead to temporarily revoke access.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 py-3 border border-slate-200 rounded-xl text-slate-600 font-bold hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteTeacher}
                disabled={actionLoading[selectedTeacher?._id] === 'deleting'}
                className="flex-1 py-3 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 transition-all shadow-lg shadow-rose-600/20 disabled:opacity-50"
              >
                {actionLoading[selectedTeacher?._id] === 'deleting' ? 'Deleting...' : 'Delete Forever'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}