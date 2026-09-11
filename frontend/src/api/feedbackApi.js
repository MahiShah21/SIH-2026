import api from './apiClient';

export const feedbackApi = {
  getFeedbacks: async (params = {}) => {
    return api.get('/feedback', { params });
  },

  submitFeedback: async (feedbackData) => {
    return api.post('/feedback', feedbackData);
  },

  getImpactStats: async () => {
    return api.get('/feedback/impact-stats');
  }
};

export default feedbackApi;
