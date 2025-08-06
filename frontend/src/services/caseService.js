import api from './api';

export const caseService = {
  async getCases(params = {}) {
    const response = await api.get('/cases', { params });
    return response.data;
  },

  async createCase(caseData) {
    const response = await api.post('/cases', caseData);
    return response.data;
  },

  async getCase(id) {
    const response = await api.get(`/cases/${id}`);
    return response.data;
  },

  async updateCase(id, caseData) {
    const response = await api.put(`/cases/${id}`, caseData);
    return response.data;
  },

  async uploadDocument(id, formData) {
    const response = await api.post(`/cases/${id}/documents`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async addImportantDate(id, dateData) {
    const response = await api.post(`/cases/${id}/dates`, dateData);
    return response.data;
  },

  async addNote(id, content) {
    const response = await api.post(`/cases/${id}/notes`, { content });
    return response.data;
  }
};