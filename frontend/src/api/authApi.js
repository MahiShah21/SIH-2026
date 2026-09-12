import api from './apiClient';

export const authApi = {
  login: async (credentials) => {
    return api.post('/api/auth/login', credentials);
  },

  register: async (userData) => {
    return api.post('/api/auth/register', userData);
  },

  quickDemo: async (role) => {
    return api.post('/api/auth/quick-demo', { role });
  },

  getMe: async () => {
    return api.get('/api/auth/me');
  },

  getDemoCredentials: async () => {
    return api.get('/api/auth/demo-credentials');
  },

  getUsers: async (params) => {
    return api.get('/api/auth/users', { params });
  }
};

export default authApi;

