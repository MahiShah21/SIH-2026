import api from './apiClient';

export const feedbackApi = {
  getFeedbacks: async (params = {}) => {
    return api.get('/api/feedback', { params });
  },

  submitFeedback: async (feedbackData) => {
    return api.post('/api/feedback', feedbackData);
  },

  getImpactStats: async () => {
    return api.get('/api/feedback/impact-stats');
  }
};

export default feedbackApi;

