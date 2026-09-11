import api from './apiClient';

export const authApi = {
  login: async (credentials) => {
    return api.post('/auth/login', credentials);
  },

  register: async (userData) => {
    return api.post('/auth/register', userData);
  },

  quickDemo: async (role) => {
    return api.post('/auth/quick-demo', { role });
  },

  getMe: async () => {
    return api.get('/auth/me');
  },

  getDemoCredentials: async () => {
    return api.get('/auth/demo-credentials');
  }
};

export default authApi;
