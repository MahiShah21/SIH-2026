import api from './apiClient';

export const notificationApi = {
  getNotifications: async (params = {}) => {
    return api.get('/api/notifications', { params });
  },

  markAsRead: async (id) => {
    return api.patch(`/api/notifications/${id}/read`);
  },

  markAllAsRead: async (role = 'university') => {
    return api.patch('/api/notifications/read-all', { role });
  },

  createNotification: async (data) => {
    return api.post('/api/notifications', data);
  }
};

export default notificationApi;

