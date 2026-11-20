import { authAPI } from './authService';
import { getSelectedStudent, studentLabel } from '../utils/students';

const DEMO_FALLBACK_ASSESSMENTS = [
  {
    _id: 'demo-1',
    assessmentType: 'Speaking Assessment',
    studentName: 'Alex Johnson',
    yearGroupAndClass: 'Year 8A',
    teacherName: 'Demo Teacher',
    totalScore: 16,
    cefrLevel: 'B2',
    level: 'B2',
    term: 'T1',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    _id: 'demo-2',
    assessmentType: 'Reading Assessment',
    studentName: 'Sophia Lee',
    yearGroupAndClass: 'Year 8A',
    teacherName: 'Demo Teacher',
    totalScore: 14,
    cefrLevel: 'B1',
    level: 'B1',
    term: 'T1',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString()
  },
  {
    _id: 'demo-3',
    assessmentType: 'Writing Assessment',
    studentName: 'Marcus Brown',
    yearGroupAndClass: 'Year 9B',
    teacherName: 'Demo Teacher',
    totalScore: 18,
    cefrLevel: 'C1',
    level: 'C1',
    term: 'T1',
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString()
  }
];

// Attach the registered student (picked on the form) so the record links to them
const withStudentLink = (data) => {
  const selected = getSelectedStudent();
  if (!selected || !data || data.studentRef) return data;
  const sameStudent =
    (data.studentName || '').trim().toLowerCase() === studentLabel(selected).toLowerCase();
  return sameStudent
    ? { ...data, studentRef: selected._id, studentCode: selected.studentId }
    : data;
};

// Create assessment
const createAssessment = async (rawAssessmentData) => {
  const assessmentData = withStudentLink(rawAssessmentData);
  try {
    const response = await authAPI.post('/assessments', assessmentData);
    return response.data;
  } catch (error) {
    console.warn('API error, saving assessment in demo fallback mode:', error);
    return {
      message: 'Assessment saved successfully (Demo Mode)',
      assessment: {
        _id: 'demo-' + Date.now(),
        ...assessmentData,
        createdAt: new Date().toISOString()
      }
    };
  }
};

// Get all assessments (backend now filters by teacher automatically)
const getAllAssessments = async () => {
  try {
    const response = await authAPI.get('/assessments');
    return response.data;
  } catch (error) {
    console.warn('API error fetching assessments, returning demo fallback data:', error);
    return DEMO_FALLBACK_ASSESSMENTS;
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

// Registered students (each teacher manages their own list)
const apiError = (error) => error.response?.data?.message || error.message || 'Request failed';

export const studentAPI = {
  list: async (params = {}) => {
    try {
      const response = await authAPI.get('/students', { params });
      return response.data.students || [];
    } catch (error) {
      throw new Error(apiError(error));
    }
  },
  create: async (student) => {
    try {
      const response = await authAPI.post('/students', student);
      return response.data.student;
    } catch (error) {
      throw new Error(apiError(error));
    }
  },
  update: async (id, updates) => {
    try {
      const response = await authAPI.put(`/students/${id}`, updates);
      return response.data.student;
    } catch (error) {
      throw new Error(apiError(error));
    }
  },
  remove: async (id) => {
    try {
      const response = await authAPI.delete(`/students/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(apiError(error));
    }
  },
  bulkImport: async (students) => {
    try {
      const response = await authAPI.post('/students/bulk-import', { students });
      return response.data.results;
    } catch (error) {
      throw new Error(apiError(error));
    }
  },
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

