// src/services/api.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('expense_tracker_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('expense_tracker_token');
      localStorage.removeItem('expense_tracker_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (userData) => api.put('/auth/profile', userData),
  changePassword: (passwordData) => api.put('/auth/change-password', passwordData),
  deleteAccount: () => api.delete('/auth/profile'),
};

// Transactions API
export const transactionsAPI = {
  getAll: (params = {}) => api.get('/transactions', { params }),
  getByDate: (date) => api.get(`/transactions/date/${date}`),
  getByDateRange: (startDate, endDate) => api.get(`/transactions/range`, {
    params: { startDate, endDate }
  }),
  create: (transactionData) => api.post('/transactions', transactionData),
  update: (id, transactionData) => api.put(`/transactions/${id}`, transactionData),
  delete: (id) => api.delete(`/transactions/${id}`),
  bulkDelete: (ids) => api.delete('/transactions/bulk', { data: { ids } }),
  getCategories: () => api.get('/transactions/categories'),
  getCategoryTotals: (startDate, endDate) => api.get('/transactions/category-totals', {
    params: { startDate, endDate }
  }),
};

// Analytics API
export const analyticsAPI = {
  getDashboard: (date) => api.get('/analytics/dashboard', { params: { date } }),
  getMonthlyStats: (year, month) => api.get('/analytics/monthly', {
    params: { year, month }
  }),
  getTrends: (days = 30) => api.get('/analytics/trends', { params: { days } }),
  getCategoryBreakdown: (startDate, endDate) => api.get('/analytics/categories', {
    params: { startDate, endDate }
  }),
  getSpendingPatterns: () => api.get('/analytics/spending-patterns'),
};

// Budget API
export const budgetAPI = {
  getAll: () => api.get('/budgets'),
  create: (budgetData) => api.post('/budgets', budgetData),
  update: (id, budgetData) => api.put(`/budgets/${id}`, budgetData),
  delete: (id) => api.delete(`/budgets/${id}`),
  getProgress: (id) => api.get(`/budgets/${id}/progress`),
};

// Export/Import API
export const dataAPI = {
  export: (format = 'json', startDate, endDate) => api.get('/data/export', {
    params: { format, startDate, endDate },
    responseType: 'blob'
  }),
  import: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/data/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  backup: () => api.post('/data/backup'),
  restore: (backupId) => api.post(`/data/restore/${backupId}`),
  getBackups: () => api.get('/data/backups'),
};

// Settings API
export const settingsAPI = {
  get: () => api.get('/settings'),
  update: (settings) => api.put('/settings', settings),
  reset: () => api.delete('/settings'),
};

// Generic API helper functions
export const apiHelpers = {
  handleError: (error) => {
    if (error.response) {
      // Server responded with error status
      const message = error.response.data?.message || error.response.data?.error || 'Server error';
      return { success: false, error: message, status: error.response.status };
    } else if (error.request) {
      // Network error
      return { success: false, error: 'Network error. Please check your connection.' };
    } else {
      // Other error
      return { success: false, error: error.message || 'An unexpected error occurred' };
    }
  },

  handleSuccess: (response, message = 'Operation successful') => {
    return {
      success: true,
      data: response.data,
      message: response.data?.message || message
    };
  },

  makeRequest: async (apiCall, successMessage) => {
    try {
      const response = await apiCall();
      return apiHelpers.handleSuccess(response, successMessage);
    } catch (error) {
      return apiHelpers.handleError(error);
    }
  }
};

export default api;