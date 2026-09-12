import api from './apiClient';

export const collaborationApi = {
  getCollaborations: async (params = {}) => {
    return api.get('/api/collaborations', { params });
  },

  createCollaboration: async (data) => {
    return api.post('/api/collaborations', data);
  },

  updateCollaboration: async (id, data) => {
    return api.patch(`/api/collaborations/${id}`, data);
  }
};

export default collaborationApi;

