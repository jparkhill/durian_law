import api from './api';

export const leadService = {
  async getLeads(params = {}) {
    const response = await api.get('/leads', { params });
    return response.data;
  },

  async createLead(leadData) {
    const response = await api.post('/leads', leadData);
    return response.data;
  },

  async getLead(id) {
    const response = await api.get(`/leads/${id}`);
    return response.data;
  },

  async updateLead(id, leadData) {
    const response = await api.put(`/leads/${id}`, leadData);
    return response.data;
  },

  async addNote(id, content) {
    const response = await api.post(`/leads/${id}/notes`, { content });
    return response.data;
  }
};