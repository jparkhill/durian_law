import api from './api';

export const employeeService = {
  async getEmployees(params = {}) {
    const response = await api.get('/employees', { params });
    return response.data;
  },

  async createEmployee(employeeData) {
    const response = await api.post('/employees', employeeData);
    return response.data;
  },

  async getEmployee(id) {
    const response = await api.get(`/employees/${id}`);
    return response.data;
  },

  async updateEmployee(id, employeeData) {
    const response = await api.put(`/employees/${id}`, employeeData);
    return response.data;
  },

  async changePassword(id, newPassword) {
    const response = await api.put(`/employees/${id}/password`, { newPassword });
    return response.data;
  },

  async deactivateEmployee(id) {
    const response = await api.delete(`/employees/${id}`);
    return response.data;
  }
};