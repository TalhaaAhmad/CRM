import axios, { type AxiosInstance, type AxiosResponse } from 'axios';
// API service for CRM System

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_URL,
});

// Request interceptor to add auth token
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

// Response interceptor for error handling
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (data: { name: string; email: string; password: string; role?: string }) =>
    api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  updateDetails: (data: { name: string; email: string }) =>
    api.put('/auth/updatedetails', data),
  updatePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.put('/auth/updatepassword', data),
};

// Orders API
export const ordersAPI = {
  getAll: (params?: { status?: string; search?: string; startDate?: string; endDate?: string }) =>
    api.get('/orders', { params }),
  getById: (id: string) => api.get(`/orders/${id}`),
  create: (data: any) => api.post('/orders', data),
  update: (id: string, data: any) => api.put(`/orders/${id}`, data),
  delete: (id: string) => api.delete(`/orders/${id}`),
  updateStatus: (id: string, status: string) =>
    api.put(`/orders/${id}/status`, { status }),
  getStats: () => api.get('/orders/stats/overview'),
};

// Courier API
export const courierAPI = {
  generateLabels: (orderIds: string[]) =>
    api.post('/courier/generate-labels', { orderIds }),
  downloadLabel: (filename: string) =>
    api.get(`/courier/download/${filename}`, { responseType: 'blob' }),
  previewLabel: (orderId: string) =>
    api.get(`/courier/preview/${orderId}`, { responseType: 'blob' }),
};

// Employees API
export const employeesAPI = {
  getAll: (params?: { status?: string; department?: string; search?: string }) =>
    api.get('/employees', { params }),
  getById: (id: string) => api.get(`/employees/${id}`),
  create: (data: any) => api.post('/employees', data),
  update: (id: string, data: any) => api.put(`/employees/${id}`, data),
  delete: (id: string) => api.delete(`/employees/${id}`),
  updateStatus: (id: string, status: string) =>
    api.put(`/employees/${id}/status`, { status }),
  getStats: () => api.get('/employees/stats/overview'),
};

// Salary API
export const salaryAPI = {
  getAll: (params?: { employeeId?: string; month?: string; status?: string }) =>
    api.get('/salary', { params }),
  getById: (id: string) => api.get(`/salary/${id}`),
  generate: (data: any) => api.post('/salary/generate', data),
  update: (id: string, data: any) => api.put(`/salary/${id}`, data),
  delete: (id: string) => api.delete(`/salary/${id}`),
  markAsPaid: (id: string) => api.put(`/salary/${id}/pay`, {}),
  download: (id: string) => api.get(`/salary/${id}/download`, { responseType: 'blob' }),
  getStats: (month?: string) => api.get('/salary/stats/overview', { params: { month } }),
};

// Dashboard API
export const dashboardAPI = {
  getStats: () => api.get('/dashboard'),
  getQuickStats: () => api.get('/dashboard/quick-stats'),
};

// Users API (Admin)
export const usersAPI = {
  getAll: () => api.get('/users'),
  getById: (id: string) => api.get(`/users/${id}`),
  create: (data: any) => api.post('/users', data),
  update: (id: string, data: any) => api.put(`/users/${id}`, data),
  delete: (id: string) => api.delete(`/users/${id}`),
  resetPassword: (id: string, password: any) =>
    api.put(`/users/${id}/resetpassword`, { password }),
};

export default api;
