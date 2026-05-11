import axios from 'axios';

// Use environment variable for API URL, fallback to localhost for development
const API_BASE_URL = process.env.REACT_APP_API_URL 
  ? `${process.env.REACT_APP_API_URL}/api`
  : 'http://localhost:5002/api';

// Create axios instance with default config
const authAPI = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests if available
authAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
authAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
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
  async login(email, password) {
    try {
      console.log('Attempting login for:', email);
      const response = await authAPI.post('/auth/login', { email, password });
      const { token, user } = response.data;
      
      console.log('Login successful for:', user.email);
      
      // Store token and user data
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      console.error('Error response:', error.response?.data);
      throw error.response?.data || { message: error.message };
    }
  },

  // Logout
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  },

  // Get current user
  getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Check if user is authenticated
  isAuthenticated() {
    return !!localStorage.getItem('token');
  },

  // Check if user is admin
  isAdmin() {
    const user = this.getCurrentUser();
    return user?.role === 'platform_admin' || user?.role === 'school_admin' || user?.role === 'admin';
  },

  // Check if user is approved teacher
  isApprovedTeacher() {
    const user = this.getCurrentUser();
    return user?.role === 'teacher' && user?.status === 'approved';
  },

  // Get profile
  async getProfile() {
    try {
      const response = await authAPI.get('/auth/profile');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: error.message };
    }
  },

  // Update profile
  async updateProfile(userData) {
    try {
      const response = await authAPI.put('/auth/profile', userData);
      // Update stored user data
      localStorage.setItem('user', JSON.stringify(response.data.user));
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

  // Set password (after approval)
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