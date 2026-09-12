import api from './apiClient';

export const industryApi = {
  getIndustryPartners: async () => {
    return api.get('/api/industry');
  },

  createIndustryPartner: async (partnerData) => {
    return api.post('/api/industry', partnerData);
  },

  getIndustryProblems: async () => {
    return api.get('/api/industry/problems');
  }
};

export default industryApi;

