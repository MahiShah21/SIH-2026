import api from './apiClient';

export const notificationApi = {
  getNotifications: async (params = {}) => {
    return api.get('/notifications', { params });
  },

  markAsRead: async (id) => {
    return api.patch(`/notifications/${id}/read`);
  },

  markAllAsRead: async (role = 'university') => {
    return api.patch('/notifications/read-all', { role });
  },

  createNotification: async (data) => {
    return api.post('/notifications', data);
  }
};

export default notificationApi;
