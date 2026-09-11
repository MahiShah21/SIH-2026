import api from './apiClient';

export const aiApi = {
  classifyProblem: async (payload) => {
    return api.post('/ai/classify-problem', payload);
  },

  checkDuplicates: async (payload) => {
    return api.post('/ai/check-duplicates', payload);
  },

  chatCopilot: async (payload) => {
    return api.post('/ai/chat', payload);
  }
};

export default aiApi;
