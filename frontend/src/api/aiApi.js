import api from './apiClient';

export const aiApi = {
  classifyProblem: async (payload) => {
    return api.post('/api/ai/classify-problem', payload);
  },

  checkDuplicates: async (payload) => {
    return api.post('/api/ai/check-duplicates', payload);
  },

  chatCopilot: async (payload) => {
    return api.post('/api/ai/chat', payload);
  }
};

export default aiApi;

