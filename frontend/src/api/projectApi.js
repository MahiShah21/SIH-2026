import api from './apiClient';

export const projectApi = {
  getProjects: async (params = {}) => {
    return api.get('/api/projects', { params });
  },

  createProject: async (projectData) => {
    return api.post('/api/projects', projectData);
  },

  getProjectById: async (id) => {
    return api.get(`/api/projects/${id}`);
  },

  getChallenges: async () => {
    return api.get('/api/projects/challenges');
  },

  updateLifecycle: async (projectId, lifecycleData) => {
    return api.patch(`/api/projects/${projectId}/lifecycle`, lifecycleData);
  },

  updateBudget: async (projectId, budgetData) => {
    return api.patch(`/api/projects/${projectId}/budget`, budgetData);
  },

  addDocument: async (projectId, docData) => {
    return api.post(`/api/projects/${projectId}/documents`, docData);
  },

  addTeamMember: async (projectId, memberData) => {
    return api.post(`/api/projects/${projectId}/teams`, memberData);
  },

  updateProposalGrant: async (projectId, proposalData) => {
    return api.put(`/api/projects/${projectId}/proposals`, proposalData);
  }
};

export default projectApi;

