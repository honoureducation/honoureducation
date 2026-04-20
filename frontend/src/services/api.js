import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001/api';

// Create assessment
const createAssessment = async (assessmentData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/assessments`, assessmentData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get all assessments
const getAllAssessments = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/assessments`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get single assessment
const getAssessmentById = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/assessments/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Delete assessment
const deleteAssessment = async (id) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/assessments/${id}`);
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

// Also export individual functions for backwards compatibility
export { createAssessment, getAllAssessments, getAssessmentById, deleteAssessment };
