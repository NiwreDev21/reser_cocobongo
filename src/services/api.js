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
// Nueva función para crear mesa
export const createTable = async (tableData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/tables`, tableData);
    return response.data;
  } catch (error) {
    console.error('Error creating table:', error);
    throw error;
  }
};

// Nueva función para eliminar mesa
export const deleteTable = async (tableId) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/tables/${tableId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting table:', error);
    throw error;
  }
};

// Nueva función para activar mesa
export const activateTable = async (tableId) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/tables/${tableId}/activate`);
    return response.data;
  } catch (error) {
    console.error('Error activating table:', error);
    throw error;
  }
};
export const getMaxTableNumber = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/tables/max-table-number`);
    return response.data.maxTableNumber;
  } catch (error) {
    console.error('Error getting max table number:', error);
    throw error;
  }
};
// Nueva función para obtener mesas activas
export const getActiveTables = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/tables/active/all`);
    return response.data;
  } catch (error) {
    console.error('Error fetching active tables:', error);
    throw error;
  }
};

export default api;