import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ── Service wrappers ─────────────────────────────────────────
export const authService = {
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
};

export const patientService = {
  getAll: (params) => api.get('/patients', { params }),
  getById: (id) => api.get(`/patients/${id}`),
  create: (data) => api.post('/patients', data),
  update: (id, data) => api.put(`/patients/${id}`, data),
  delete: (id) => api.delete(`/patients/${id}`),
};

export const registrationService = {
  getAll: (params) => api.get('/registrations', { params }),
  create: (data) => api.post('/registrations', data),
  updateStatus: (id, data) => api.put(`/registrations/${id}`, data),
};

export const queueService = {
  getAll: (params) => api.get('/queues', { params }),
  callNext: (id) => api.put(`/queues/${id}/call`),
  updateStatus: (id, data) => api.put(`/queues/${id}/status`, data),
};

export const medicalRecordService = {
  create: (data) => api.post('/medical-records', data),
  getByPatient: (patientId) => api.get(`/medical-records/${patientId}`),
  createPrescription: (data) => api.post('/medical-records/prescriptions', data),
  getPrescription: (id) => api.get(`/medical-records/prescriptions/${id}`),
};

export const dashboardService = {
  getSummary: () => api.get('/dashboard'),
};

export default api;
