import api from './api';

export const billingService = {
  async getPayments(params = {}) {
    const response = await api.get('/billing', { params });
    return response.data;
  },

  async processSquarePayment(paymentData) {
    const response = await api.post('/billing/square', paymentData);
    return response.data;
  },

  async recordManualPayment(paymentData) {
    const response = await api.post('/billing/manual', paymentData);
    return response.data;
  },

  async getPayment(id) {
    const response = await api.get(`/billing/${id}`);
    return response.data;
  }
};