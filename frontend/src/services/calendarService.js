import api from './api';

export const calendarService = {
  async getTodayItems() {
    const response = await api.get('/calendar/today');
    return response.data;
  },

  async getDateItems(date) {
    const response = await api.get(`/calendar/date/${date}`);
    return response.data;
  },

  async getWeekItems(startDate) {
    const response = await api.get(`/calendar/week/${startDate}`);
    return response.data;
  }
};