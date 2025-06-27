import axios from 'axios';

// Créer une instance Axios sans header par défaut
const api = axios.create({
  baseURL: 'http://localhost:5000/api/v1'
});

// Intercepteur pour ajouter le token et gérer les Content-Types
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    // Si le corps de la requête est un FormData, laisser Axios définir le Content-Type
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
      console.log('FormData détecté, suppression de Content-Type pour permettre multipart boundary');
    } else {
      // Sinon, définir explicitement pour le JSON
      config.headers['Content-Type'] = 'application/json';
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Intercepteur pour gérer les erreurs (401 notamment)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API Auth
export const loginUser = (credentials) => api.post('/auth/login', credentials);
export const registerUser = (userData) => api.post('/auth/register', userData);
export const getCurrentUser = () => api.get('/auth/me');
export const forgotPassword = (email) => api.post('/auth/forgotpassword', { email });
export const resetPassword = (resetToken, password) => 
  api.put(`/auth/resetpassword/${resetToken}`, { password });

// API Signalements
export const getSignalements = (params) => api.get('/signalements', { params });
export const getSignalement = (id) => api.get(`/signalements/${id}`);
export const createSignalement = (data) => api.post('/signalements', data);
export const updateSignalement = (id, data) => api.put(`/signalements/${id}`, data);
export const deleteSignalement = (id) => api.delete(`/signalements/${id}`);
export const getUserSignalements = () => api.get('/signalements/user');

// Upload photo de signalement (FormData)
export const uploadSignalementPhoto = (id, formData) =>
  api.put(`/signalements/${id}/photo`, formData);

// NOUVEAU : API Commentaires
export const getCommentaires = (signalementId, params) => 
  api.get(`/signalements/${signalementId}/commentaires`, { params });
export const getCommentaire = (id) => api.get(`/commentaires/${id}`);
export const createCommentaire = (signalementId, data) => 
  api.post(`/signalements/${signalementId}/commentaires`, data);
export const updateCommentaire = (id, data) => api.put(`/commentaires/${id}`, data);
export const deleteCommentaire = (id) => api.delete(`/commentaires/${id}`);
export const getUserCommentaires = (userId) => api.get(`/commentaires/user/${userId}`);
export const moderateCommentaire = (id, statut) => 
  api.put(`/commentaires/${id}/moderate`, { statut });
export const getAllCommentaires = (params) => api.get('/commentaires/admin/all', { params });

// API Catégories
export const getCategories = () => api.get('/categories');

// API Services
export const getServices = () => api.get('/services');

// API Utilisateurs (admin)
export const getUsers = (params) => api.get('/users', { params });
export const getUser = (id) => api.get(`/users/${id}`);
export const createUser = (data) => api.post('/users', data);
export const updateUser = (id, data) => api.put(`/users/${id}`, data);
export const deleteUser = (id) => api.delete(`/users/${id}`);

// API Notifications
export const getNotifications = () => api.get('/notifications');
export const markNotificationAsRead = (id) => api.put(`/notifications/${id}/read`);

// API Statistiques
export const getStats = () => api.get('/stats');

export default api;