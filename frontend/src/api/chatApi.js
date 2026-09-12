import api from './apiClient';

export const chatApi = {
  getConversations: async (params = {}) => {
    return api.get('/api/chat/conversations', { params });
  },

  createConversation: async (convData) => {
    return api.post('/api/chat/conversations', convData);
  },

  getMessages: async (conversationId) => {
    return api.get(`/api/chat/conversations/${conversationId}/messages`);
  },

  sendMessage: async (conversationId, messageData) => {
    return api.post(`/api/chat/conversations/${conversationId}/messages`, messageData);
  }
};

export default chatApi;

