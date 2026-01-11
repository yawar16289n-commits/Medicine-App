/**
 * Centralized API utility with axios interceptor
 * Handles authentication headers and token management
 */
import axios from 'axios';
import { API_BASE } from '../config';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - automatically add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle specific error cases
    if (error.response?.status === 401) {
      const errorMessage = error.response?.data?.error || '';
      
      // Only logout for token-specific errors
      if (
        errorMessage === 'token expired' ||
        errorMessage === 'invalid token' ||
        errorMessage === 'token required'
      ) {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('username');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;

// Helper function for file uploads with FormData
export const uploadFile = (url, formData) => {
  return api.post(url, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

// Convenience exports for common endpoints
export const authAPI = {
  login: (credentials) => api.post('/api/login', credentials),
  register: (userData) => api.post('/api/register', userData),
  getProfile: () => api.get('/api/profile'),
  updateProfile: (data) => api.put('/api/profile', data),
};

export const usersAPI = {
  getAll: () => api.get('/api/users'),
  getById: (id) => api.get(`/api/users/${id}`),
  update: (id, data) => api.put(`/api/users/${id}`, data),
  delete: (id) => api.delete(`/api/users/${id}`),
};

export const medicinesAPI = {
  getAll: () => api.get('/api/medicines'),
  getStats: () => api.get('/api/medicines/stats'),
  getById: (id) => api.get(`/api/medicines/${id}`),
  create: (data) => api.post('/api/medicines', data),
  update: (id, data) => api.put(`/api/medicines/${id}`, data),
  delete: (id) => api.delete(`/api/medicines/${id}`),
  upload: (formData) => uploadFile('/api/medicines/upload', formData),
  getSalesRecords: (params) => api.get('/api/medicines/sales', { params }),
  createSalesRecord: (data) => api.post('/api/medicines/sales', data),
  uploadSales: (formData) => uploadFile('/api/medicines/sales/upload', formData),
  downloadSalesTemplate: () => api.get('/api/medicines/sales/template', { responseType: 'blob' }),
  uploadStockAdjustments: (formData) => uploadFile('/api/medicines/stock/upload', formData),
  downloadStockTemplate: () => api.get('/api/medicines/stock/template', { responseType: 'blob' }),
};

export const forecastAPI = {
  getByMedicine: (medicineName, params) => 
    api.get(`/api/forecast/${medicineName}`, { params }),
  trainModel: (medicineName) => 
    api.post(`/api/forecast/${medicineName}/train`),
  getCityForecast: (params) => 
    api.get('/api/forecast/city', { params }),
  getDistrictForecast: (districtName, params) => 
    api.get(`/api/forecast/district/${districtName}`, { params }),
  getAreaFormulaForecast: (params) =>
    api.get('/api/forecast', { params }), // area, formula, days
  // Get areas/formulas with sales data for forecast dropdowns
  getAvailableAreas: () => api.get('/api/forecast/metadata/areas'),
  getAvailableFormulas: (area) => api.get('/api/forecast/metadata/formulas', { params: { area } }),
};

export const weatherAPI = {
  getAll: (params) => api.get('/api/weather', { params }),
  getForecastOnly: () => api.get('/api/weather/forecast'),
  triggerUpdate: () => api.post('/api/weather/update'),
  uploadFile: (formData) => uploadFile('/api/weather/upload', formData),
  downloadTemplate: () => api.get('/api/weather/template', { responseType: 'blob' }),
};

export const districtsAPI = {
  getAll: () => api.get('/api/districts'),
  getById: (id) => api.get(`/api/districts/${id}`),
  create: (data) => api.post('/api/districts', data),
  update: (id, data) => api.put(`/api/districts/${id}`, data),
  delete: (id) => api.delete(`/api/districts/${id}`),
  getFormulas: (districtId) => api.get(`/api/districts/${districtId}/formulas`),
  getMedicines: (districtId, formulaId) => api.get(`/api/districts/${districtId}/formulas/${formulaId}/medicines`),
};

export const formulasAPI = {
  getAll: () => api.get('/api/formulas'),
  getById: (id) => api.get(`/api/formulas/${id}`),
  create: (data) => api.post('/api/formulas', data),
  update: (id, data) => api.put(`/api/formulas/${id}`, data),
  delete: (id) => api.delete(`/api/formulas/${id}`),
  getDistricts: (formulaId) => api.get(`/api/formulas/${formulaId}/districts`),
};

export const activitiesAPI = {
  getAll: () => api.get('/api/activities'),
  getRecent: () => api.get('/api/activities/recent'),
  getById: (id) => api.get(`/api/activities/${id}`),
};
