import axios from 'axios';

// Use environment variable for API URL, fallback to localhost for development
const API_BASE_URL = process.env.REACT_APP_API_URL 
  ? `${process.env.REACT_APP_API_URL}/api`
  : 'http://localhost:5002/api';

console.log('API Base URL:', API_BASE_URL);

// Helper to get the auth token based on current context
const getAuthHeaders = () => {
  const isAdminPath = window.location.pathname.startsWith('/admin');
  const token = isAdminPath 
    ? localStorage.getItem('admin_token') 
    : localStorage.getItem('teacher_token');
  
  if (token) {
    return { Authorization: `Bearer ${token}` };
  }
  return {};
};

// Create assessment
const createAssessment = async (assessmentData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/assessments`, assessmentData, {
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get all assessments (backend now filters by teacher automatically)
const getAllAssessments = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/assessments`, {
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get single assessment
const getAssessmentById = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/assessments/${id}`, {
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Delete assessment
const deleteAssessment = async (id) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/assessments/${id}`, {
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Export as object for cleaner usage
export const assessmentAPI = {
  createAssessment,
  getAllAssessments,
  getAssessmentById,
  deleteAssessment
};

export const contactAPI = {
  submitMessage: async (data) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/contact`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
  getMessages: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/contact`, {
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
  markAsRead: async (id) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/contact/${id}/read`, {}, {
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

// Also export individual functions for backwards compatibility
export { createAssessment, getAllAssessments, getAssessmentById, deleteAssessment };
