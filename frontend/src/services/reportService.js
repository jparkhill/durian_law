import api from './api';

export const reportService = {
  async getDashboardStats() {
    const response = await api.get('/reports/dashboard');
    return response.data;
  },

  async exportCases(params = {}) {
    const response = await api.get('/reports/cases/export', {
      params,
      responseType: 'blob'
    });
    return response.data;
  },

  async exportPayments(params = {}) {
    const response = await api.get('/reports/payments/export', {
      params,
      responseType: 'blob'
    });
    return response.data;
  },

  async exportLeads(params = {}) {
    const response = await api.get('/reports/leads/export', {
      params,
      responseType: 'blob'
    });
    return response.data;
  }
};