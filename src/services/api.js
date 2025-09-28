import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar el token de autenticación si existe
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Reservas
export const getReservations = () => api.get('/reservations').then(res => res.data);
export const getReservation = (id) => api.get(`/reservations/${id}`).then(res => res.data);
export const createReservation = (data) => api.post('/reservations', data).then(res => res.data);
export const updateReservation = (id, data) => api.put(`/reservations/${id}`, data).then(res => res.data);
export const deleteReservation = (id) => api.delete(`/reservations/${id}`).then(res => res.data);

// Mesas
export const getTables = () => api.get('/tables').then(res => res.data);
export const getAvailableTables = (capacity) => api.get(`/tables/available/${capacity}`).then(res => res.data);
export const updateTable = (id, data) => api.put(`/tables/${id}`, data).then(res => res.data);

// Notificaciones
export const sendWhatsAppNotification = (data) => api.post('/notifications/whatsapp', data).then(res => res.data);

// Autenticación
export const login = (credentials) => api.post('/auth/login', credentials).then(res => res.data);
export const logout = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('adminSession');
  return Promise.resolve();
};

export default api;