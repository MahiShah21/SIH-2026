import api from './apiClient';

export const projectApi = {
  getProjects: async (params = {}) => {
    return api.get('/projects', { params });
  },

  createProject: async (projectData) => {
    return api.post('/projects', projectData);
  },

  getProjectById: async (id) => {
    return api.get(`/projects/${id}`);
  },

  getChallenges: async () => {
    return api.get('/projects/challenges');
  },

  updateLifecycle: async (projectId, lifecycleData) => {
    return api.patch(`/projects/${projectId}/lifecycle`, lifecycleData);
  },

  updateBudget: async (projectId, budgetData) => {
    return api.patch(`/projects/${projectId}/budget`, budgetData);
  },

  addDocument: async (projectId, docData) => {
    return api.post(`/projects/${projectId}/documents`, docData);
  },

  addTeamMember: async (projectId, memberData) => {
    return api.post(`/projects/${projectId}/teams`, memberData);
  },

  updateProposalGrant: async (projectId, proposalData) => {
    return api.put(`/projects/${projectId}/proposals`, proposalData);
  }
};

export default projectApi;
