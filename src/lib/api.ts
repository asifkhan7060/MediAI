import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach JWT token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('mediai_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401 (expired token)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('mediai_token');
      localStorage.removeItem('mediai_user');
      // Only redirect if not already on login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ========================
// AUTH API
// ========================
export const authAPI = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: { email: string; password: string }) => api.post('/auth/login', data),
  googleLogin: (data: { idToken: string; email: string; name: string; picture: string; googleId: string }) =>
    api.post('/auth/google', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data: any) => api.put('/auth/profile', data),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.put('/auth/change-password', data),
};

// ========================
// DOCTORS API
// ========================
export const doctorsAPI = {
  getAll: (params?: any) => api.get('/doctors', { params }),
  getById: (id: string) => api.get(`/doctors/${id}`),
  getSpecializations: () => api.get('/doctors/specializations'),
  updateProfile: (data: any) => api.put('/doctors/profile', data),
  updateAvailability: (data: any) => api.put('/doctors/availability', data),
  recommend: (symptoms: string[]) => api.post('/doctors/recommend', { symptoms }),
  nearby: (lat: number, lng: number, radius?: number) =>
    api.get('/doctors/nearby', { params: { lat, lng, radius: radius || 50 } }),
};

// ========================
// APPOINTMENTS API
// ========================
export const appointmentsAPI = {
  book: (data: any) => api.post('/appointments', data),
  getMy: (params?: any) => api.get('/appointments/my', { params }),
  getDoctor: (params?: any) => api.get('/appointments/doctor', { params }),
  getById: (id: string) => api.get(`/appointments/${id}`),
  updateStatus: (id: string, data: { status: string; notes?: string }) =>
    api.put(`/appointments/${id}/status`, data),
  cancel: (id: string) => api.put(`/appointments/${id}/cancel`),
};

// ========================
// ADMIN API
// ========================
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: (params?: any) => api.get('/admin/users', { params }),
  deleteUser: (id: string) => api.delete(`/admin/users/${id}`),
  getDoctors: (params?: any) => api.get('/admin/doctors', { params }),
  approveDoctor: (id: string, status: string) =>
    api.put(`/admin/doctors/${id}/approve`, { status }),
  getAppointments: (params?: any) => api.get('/admin/appointments', { params }),
  getAnalytics: () => api.get('/admin/analytics'),
};

// ========================
// PAYMENTS API
// ========================
export const paymentsAPI = {
  getKey: () => api.get('/payments/key'),
  createOrder: (appointmentId: string) =>
    api.post('/payments/create-order', { appointmentId }),
  verify: (data: any) => api.post('/payments/verify', data),
  getMy: () => api.get('/payments/my'),
  demoPay: (appointmentId: string, paymentMethod: string) =>
    api.post('/payments/demo-pay', { appointmentId, paymentMethod }),
  markCashPaid: (appointmentId: string) =>
    api.post('/payments/mark-cash', { appointmentId }),
};

// ========================
// SYMPTOMS API
// ========================
export const symptomsAPI = {
  predict: (symptoms: string[]) => api.post('/symptoms/predict', { symptoms }),
  getList: () => api.get('/symptoms/list'),
  normalize: (input: string) => api.post('/symptoms/normalize', { input }),
};

// ========================
// REVIEWS API
// ========================
export const reviewsAPI = {
  getDoctorReviews: (doctorId: string) => api.get(`/reviews/doctor/${doctorId}`),
  add: (data: { appointmentId: string; rating: number; comment?: string }) =>
    api.post('/reviews', data),
};

// ========================
// CHAT API
// ========================
export const chatAPI = {
  getConversations: () => api.get('/chat/conversations'),
  getHistory: (otherUserId: string, params?: any) => api.get(`/chat/history/${otherUserId}`, { params }),
  send: (data: { receiverId: string; receiverModel: string; message: string }) => api.post('/chat/send', data),
};

// ========================
// EMERGENCY API
// ========================
export const emergencyAPI = {
  activate: (data: { lat?: number; lng?: number }) => api.post('/emergency/activate', data),
  getContacts: () => api.get('/emergency/contacts'),
  updateContacts: (data: { emergencyContacts?: any[]; bloodGroup?: string }) =>
    api.put('/emergency/contacts', data),
};

// ========================
// AI API
// ========================
export const aiAPI = {
  analyzeReport: (file: File) => {
    const formData = new FormData();
    formData.append('report', file);
    return api.post('/ai/analyze-report', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 120000, // 2 min timeout for OCR + AI
    });
  },
  homeRemedies: (symptoms: string[]) => api.post('/ai/home-remedies', { symptoms }, {
    timeout: 60000, // 60s timeout for AI generation
  }),
};

// ========================
// SUPPORT / HOSPITAL API
// ========================
export const supportAPI = {
  get: () => api.get('/support'),
  update: (data: any) => api.put('/support', data),
};

export default api;
