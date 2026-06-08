import { authAPI } from './authService';

// Create assessment
const createAssessment = async (assessmentData) => {
  try {
    const response = await authAPI.post('/assessments', assessmentData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get all assessments (backend now filters by teacher automatically)
const getAllAssessments = async () => {
  try {
    const response = await authAPI.get('/assessments');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get single assessment
const getAssessmentById = async (id) => {
  try {
    const response = await authAPI.get(`/assessments/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Delete assessment
const deleteAssessment = async (id) => {
  try {
    const response = await authAPI.delete(`/assessments/${id}`);
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
      const response = await authAPI.post('/contact', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
  getMessages: async () => {
    try {
      const response = await authAPI.get('/contact');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
  markAsRead: async (id) => {
    try {
      const response = await authAPI.put(`/contact/${id}/read`, {});
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

// Also export individual functions for backwards compatibility
export { createAssessment, getAllAssessments, getAssessmentById, deleteAssessment };

