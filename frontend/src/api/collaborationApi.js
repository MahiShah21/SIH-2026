import api from './apiClient';

export const collaborationApi = {
  getCollaborations: async (params = {}) => {
    return api.get('/collaborations', { params });
  },

  createCollaboration: async (data) => {
    return api.post('/collaborations', data);
  },

  updateCollaboration: async (id, data) => {
    return api.patch(`/collaborations/${id}`, data);
  }
};

export default collaborationApi;
