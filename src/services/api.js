import { toast } from 'react-hot-toast';

// API Base URL
const API_URL = 'http://localhost:5001/api';

// Get token from localStorage
const getToken = () => localStorage.getItem('token');

// Set token in localStorage
export const setToken = (token) => localStorage.setItem('token', token);

// Remove token from localStorage
export const removeToken = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

// API Request helper
const request = async (endpoint, options = {}) => {
  const token = getToken();
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    ...options,
  };

  try {
    const response = await fetch(`${API_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }

    return data;
  } catch (error) {
    toast.error(error.message);
    throw error;
  }
};

// Auth API
export const authAPI = {
  login: async (email, password) => {
    const data = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (data.data.token) {
      setToken(data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));
    }
    return data;
  },

  register: async (userData) => {
    return request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  getMe: () => request('/auth/me'),
  
  logout: () => {
    removeToken();
    localStorage.removeItem('user');
  },
};

// Patients API
export const patientsAPI = {
  getAll: (params = '') => request(`/patients${params}`),
  getToday: () => request('/patients/today'),
  getById: (id) => request(`/patients/${id}`),
  create: (data) => request('/patients', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id, data) => request(`/patients/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id) => request(`/patients/${id}`, { method: 'DELETE' }),
  search: (q) => request(`/patients/search?q=${q}`),
  getStats: () => request('/patients/stats'),
};

// Medicines API
export const medicinesAPI = {
  getAll: (params = '') => request(`/medicines${params}`),
  getLowStock: () => request('/medicines/low-stock'),
  getExpiring: () => request('/medicines/expiring'),
  getById: (id) => request(`/medicines/${id}`),
  create: (data) => request('/medicines', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id, data) => request(`/medicines/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id) => request(`/medicines/${id}`, { method: 'DELETE' }),
  updateStock: (id, data) => request(`/medicines/${id}/stock`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  getStats: () => request('/medicines/stats'),
  search: (q) => request(`/medicines/search?q=${q}`),
};

// Services API
export const servicesAPI = {
  getAll: (params = '') => request(`/services${params}`),
  getAllList: () => request('/services/all'),
  getById: (id) => request(`/services/${id}`),
  create: (data) => request('/services', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id, data) => request(`/services/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id) => request(`/services/${id}`, { method: 'DELETE' }),
  getStats: () => request('/services/stats'),
  search: (q) => request(`/services/search?q=${q}`),
};

// Bills API
export const billsAPI = {
  getAll: (params = '') => request(`/bills${params}`),
  getToday: () => request('/bills/today'),
  getById: (id) => request(`/bills/${id}`),
  create: (data) => request('/bills', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id, data) => request(`/bills/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id) => request(`/bills/${id}`, { method: 'DELETE' }),
  getStats: () => request('/bills/stats'),
  getByPatient: (patientId) => request(`/bills/patient/${patientId}`),
};

// Analytics API
export const analyticsAPI = {
  getSummary: () => request('/analytics/summary'),
  getDailyEarnings: (days = 7) => request(`/analytics/daily-earnings?days=${days}`),
  getMonthlyGrowth: () => request('/analytics/monthly-growth'),
  getYearlyGrowth: () => request('/analytics/yearly-growth'),
  getRevenueSplit: (period = 'all') => request(`/analytics/revenue-split?period=${period}`),
  getRecentPatients: (limit = 5) => request(`/analytics/recent-patients?limit=${limit}`),
  getTopServices: (limit = 5, period = 'all') => request(`/analytics/top-services?limit=${limit}&period=${period}`),
  getTopMedicines: (limit = 5, period = 'all') => request(`/analytics/top-medicines?limit=${limit}&period=${period}`),
  getPerformance: (period = 'all') => request(`/analytics/performance?period=${period}`),
};

export default {
  auth: authAPI,
  patients: patientsAPI,
  medicines: medicinesAPI,
  services: servicesAPI,
  bills: billsAPI,
  analytics: analyticsAPI,
};