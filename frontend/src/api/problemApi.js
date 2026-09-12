import api from './apiClient';

export const problemApi = {
  getProblems: async (params = {}) => {
    return api.get('/api/problems', { params });
  },

  getProblemById: async (id) => {
    return api.get(`/api/problems/${id}`);
  },

  createProblem: async (problemData) => {
    return api.post('/api/problems', problemData);
  },

  upvoteProblem: async (id) => {
    return api.post(`/api/problems/${id}/upvote`, {});
  },

  updateStatus: async (id, status, remarks) => {
    return api.patch(`/api/problems/${id}/status`, { status, remarks });
  }
};

export default problemApi;

