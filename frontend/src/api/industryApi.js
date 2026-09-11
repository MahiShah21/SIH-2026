import api from './apiClient';

export const industryApi = {
  getIndustryPartners: async () => {
    return api.get('/industry');
  },

  createIndustryPartner: async (partnerData) => {
    return api.post('/industry', partnerData);
  }
};

export default industryApi;
