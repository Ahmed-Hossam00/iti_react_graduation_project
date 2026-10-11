import { apiClient } from './client';

export const reportsApi = {
  async getSummary(params = {}) {
    const res = await apiClient('/reports/appointments/summary', { params });
    return res.data;
  },

  async getDailyTotals(params = {}) {
    const res = await apiClient('/reports/appointments/daily', { params });
    return res.data;
  },
};

export default reportsApi;
