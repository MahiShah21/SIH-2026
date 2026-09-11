import api from './apiClient';

export const problemApi = {
  getProblems: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/problems${query ? `?${query}` : ''}`);
  },

  getProblemById: async (id) => {
    return api.get(`/problems/${id}`);
  },

  createProblem: async (problemData) => {
    return api.post('/problems', problemData);
  },

  upvoteProblem: async (id) => {
    return api.post(`/problems/${id}/upvote`, {});
  },

  updateStatus: async (id, status, remarks) => {
    return api.patch(`/problems/${id}/status`, { status, remarks });
  }
};

export default problemApi;
