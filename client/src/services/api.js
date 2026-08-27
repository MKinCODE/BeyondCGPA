import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor: attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('beyond_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Response interceptor: handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (!window.location.pathname.startsWith('/auth')) {
        localStorage.removeItem('beyond_token');
        localStorage.removeItem('beyond_user');
      }
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  requestSignupOTP: (data) => api.post('/auth/signup-otp', data),
  verifyOTPAndRegister: (data) => api.post('/auth/verify-register', data),
  loginWithPassword: (data) => api.post('/auth/login-password', data),
  googleAuth: (credential) => api.post('/auth/google', { credential }),
  adminQuickLogin: () => api.post('/auth/admin-login'),
  getMe: () => api.get('/auth/me'),
  getConfigStatus: () => api.get('/auth/config-status')
};

// Profile APIs
export const profileAPI = {
  submitOnboarding: (data) => api.post('/profile/onboarding', data),
  getProfile: () => api.get('/profile'),
  updateProfile: (data) => api.put('/profile', data)
};

// CIE APIs
export const cieAPI = {
  getReadiness: () => api.get('/cie/readiness')
};

// Preparation & Roadmap APIs
export const preparationAPI = {
  getRoadmap: () => api.get('/preparation/roadmap'),
  getTodaysFocus: () => api.get('/preparation/todays-focus'),
  getTopicsByCategory: (category) => api.get(`/preparation/categories/${category}`),
  getTopicDetail: (idOrSlug) => api.get(`/preparation/topics/${idOrSlug}`),
  logEffort: (data) => api.post('/preparation/effort', data)
};

// Industry Topic & Calendar APIs
export const topicAPI = {
  getTopicByDate: (date) => api.get(date ? `/topics/date/${date}` : '/topics/today'),
  getCalendarOverview: () => api.get('/topics/calendar'),
  markViewed: (topicId) => api.post('/topics/viewed', { topicId }),
  getAllTopics: (params) => api.get('/topics/explore', { params })
};

// Opportunities APIs
export const opportunityAPI = {
  getFeed: (params) => api.get('/opportunities/feed', { params }),
  getTracked: () => api.get('/opportunities/tracked'),
  updateStatus: (opportunityId, data) => api.put(`/opportunities/${opportunityId}/status`, data)
};

// AI Mentor APIs
export const mentorAPI = {
  getConversation: () => api.get('/mentor/conversation'),
  sendMessage: (message) => api.post('/mentor/message', { message }),
  clearHistory: () => api.delete('/mentor/history')
};

// Notifications APIs
export const notificationAPI = {
  getNotifications: () => api.get('/notifications'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`)
};

export default api;
