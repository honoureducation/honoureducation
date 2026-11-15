import axios from 'axios';

// Automatically detect whether we are running on localhost or production
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const API_BASE_URL = process.env.REACT_APP_API_URL
  ? (process.env.REACT_APP_API_URL.endsWith('/api') ? process.env.REACT_APP_API_URL : `${process.env.REACT_APP_API_URL}/api`)
  : (isLocalhost ? 'http://localhost:5002/api' : 'https://honoureducation.onrender.com/api');

// Create axios instance with default config
export const authAPI = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests if available
authAPI.interceptors.request.use((config) => {
  // Use admin token for admin routes, otherwise teacher token
  const isAdminPath = window.location.pathname.startsWith('/admin');
  const token = isAdminPath
    ? localStorage.getItem('admin_token')
    : localStorage.getItem('teacher_token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
authAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    // If logged in as demo teacher, do NOT log out on 401 or network errors
    const teacherUserStr = localStorage.getItem('teacher_user');
    let isDemo = false;
    try {
      const parsed = JSON.parse(teacherUserStr || '{}');
      if (parsed?.email === 'teacher@school.edu') {
        isDemo = true;
      }
    } catch (e) {}

    if (isDemo) {
      // In demo mode without DB, do not redirect to login
      console.warn('API returned error in demo mode, maintaining demo session:', error.response?.status);
      return Promise.reject(error);
    }

    if (error.response?.status === 401) {
      const isAdminPath = window.location.pathname.startsWith('/admin');
      if (isAdminPath) {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
        window.location.href = '/admin';
      } else {
        localStorage.removeItem('teacher_token');
        localStorage.removeItem('teacher_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth functions
export const authService = {
  // Register teacher
  async registerTeacher(userData) {
    try {
      const response = await authAPI.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: error.message };
    }
  },

  // Login
  async login(email, password, forceRole = null) {
    try {
      console.log('Attempting login for:', email);
      
      const isDemoTeacher = email?.toLowerCase().trim() === 'teacher@school.edu' && password === 'teacher123';
      let data;

      try {
        const response = await authAPI.post('/auth/login', { email, password });
        data = response.data;
      } catch (err) {
        // Fallback for demo teacher if database is offline or backend is unreachable
        if (isDemoTeacher) {
          console.warn('API error encountered, using local demo teacher credentials');
          data = {
            token: 'demo-teacher-token',
            user: {
              id: '507f1f77bcf86cd799439011',
              _id: '507f1f77bcf86cd799439011',
              firstName: 'Demo',
              lastName: 'Teacher',
              fullName: 'Demo Teacher',
              email: 'teacher@school.edu',
              role: 'teacher',
              status: 'approved',
              school: 'Demo School',
              department: 'English Language Learning',
              lastLogin: new Date().toISOString()
            }
          };
        } else {
          throw err;
        }
      }

      const { token, user } = data;
      console.log('Login successful for:', user.email);

      const role = forceRole || (user.role.includes('admin') ? 'admin' : 'teacher');

      // Store token and user data with role-specific keys
      if (role === 'admin') {
        localStorage.setItem('admin_token', token);
        localStorage.setItem('admin_user', JSON.stringify(user));
      } else {
        localStorage.setItem('teacher_token', token);
        localStorage.setItem('teacher_user', JSON.stringify(user));
      }

      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error.response?.data || { message: error.message };
    }
  },

  // Send admin OTP
  async sendAdminOtp(email) {
    try {
      const response = await authAPI.post('/auth/admin/send-otp', { email });
      return response.data;
    } catch (error) {
      console.error('Send OTP error:', error);
      throw error.response?.data || { message: error.message };
    }
  },

  // Verify admin OTP and login
  async verifyAdminOtp(email, otp) {
    try {
      const response = await authAPI.post('/auth/admin/verify-otp', { email, otp });
      const { token, user } = response.data;

      // Store token and user data with role-specific keys
      localStorage.setItem('admin_token', token);
      localStorage.setItem('admin_user', JSON.stringify(user));

      return response.data;
    } catch (error) {
      console.error('Verify OTP error:', error);
      throw error.response?.data || { message: error.message };
    }
  },

  // Logout
  logout(role = null) {
    const isAdminPath = window.location.pathname.startsWith('/admin');
    const targetRole = role || (isAdminPath ? 'admin' : 'teacher');

    if (targetRole === 'admin') {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      window.location.href = '/admin';
    } else {
      localStorage.removeItem('teacher_token');
      localStorage.removeItem('teacher_user');
      window.location.href = '/login';
    }
  },

  // Get current user
  getCurrentUser(role = null) {
    const isAdminPath = window.location.pathname.startsWith('/admin');
    const targetRole = role || (isAdminPath ? 'admin' : 'teacher');

    const key = targetRole === 'admin' ? 'admin_user' : 'teacher_user';
    const user = localStorage.getItem(key);
    return user ? JSON.parse(user) : null;
  },

  // Check if user is authenticated
  isAuthenticated(role = null) {
    const isAdminPath = window.location.pathname.startsWith('/admin');
    const targetRole = role || (isAdminPath ? 'admin' : 'teacher');

    const key = targetRole === 'admin' ? 'admin_token' : 'teacher_token';
    return !!localStorage.getItem(key);
  },

  // Check if user is admin
  isAdmin() {
    const user = this.getCurrentUser('admin');
    return user?.role === 'platform_admin' || user?.role === 'school_admin' || user?.role === 'admin';
  },

  // Check if user is approved teacher
  isApprovedTeacher() {
    const user = this.getCurrentUser('teacher');
    return user?.role === 'teacher' && user?.status === 'approved';
  },

  // Get profile
  async getProfile() {
    try {
      const response = await authAPI.get('/auth/profile');
      return response.data;
    } catch (error) {
      const user = this.getCurrentUser('teacher');
      if (user?.email === 'teacher@school.edu') {
        return { user };
      }
      throw error.response?.data || { message: error.message };
    }
  },

  // Update profile
  async updateProfile(userData) {
    try {
      const isAdminPath = window.location.pathname.startsWith('/admin');
      const userKey = isAdminPath ? 'admin_user' : 'teacher_user';

      const response = await authAPI.put('/auth/profile', userData);
      localStorage.setItem(userKey, JSON.stringify(response.data.user));
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: error.message };
    }
  },

  // Change password
  async changePassword(currentPassword, newPassword) {
    try {
      const response = await authAPI.put('/auth/change-password', {
        currentPassword,
        newPassword
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: error.message };
    }
  },

  async forgotPassword(email) {
    try {
      const response = await authAPI.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to request password reset' };
    }
  },

  // Set password (after approval or reset)
  async setPassword(token, password) {
    try {
      const response = await authAPI.post('/auth/set-password', {
        token,
        password
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: error.message };
    }
  }
};

// Admin functions
export const adminService = {
  // Get dashboard stats
  async getDashboardStats() {
    try {
      const response = await authAPI.get('/admin/dashboard/stats');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: error.message };
    }
  },

  // Get pending teachers
  async getPendingTeachers() {
    try {
      const response = await authAPI.get('/admin/teachers/pending');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: error.message };
    }
  },

  // Get all teachers
  async getAllTeachers(params = {}) {
    try {
      const response = await authAPI.get('/admin/teachers', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: error.message };
    }
  },

  // Get teacher details
  async getTeacherDetails(teacherId) {
    try {
      const response = await authAPI.get(`/admin/teachers/${teacherId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: error.message };
    }
  },

  // Approve teacher
  async approveTeacher(teacherId) {
    try {
      const response = await authAPI.put(`/admin/teachers/${teacherId}/approve`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: error.message };
    }
  },

  // Reject teacher
  async rejectTeacher(teacherId, reason) {
    try {
      const response = await authAPI.put(`/admin/teachers/${teacherId}/reject`, { reason });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: error.message };
    }
  },

  // Suspend/unsuspend teacher
  async toggleTeacherSuspension(teacherId, suspend, reason) {
    try {
      const response = await authAPI.put(`/admin/teachers/${teacherId}/suspend`, { suspend, reason });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: error.message };
    }
  },

  // Update teacher
  async updateTeacher(teacherId, userData) {
    try {
      const response = await authAPI.put(`/admin/teachers/${teacherId}`, userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: error.message };
    }
  },

  // Delete teacher
  async deleteTeacher(teacherId) {
    try {
      const response = await authAPI.delete(`/admin/teachers/${teacherId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: error.message };
    }
  }
};