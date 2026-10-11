import { apiClient } from './client';

export const availabilityApi = {
  /**
   * Fetch availability for a specific date or date range.
   * Query options: { date: 'YYYY-MM-DD', prescriberId?: string }
   * OR { from: 'YYYY-MM-DD', to: 'YYYY-MM-DD', prescriberId?: string }
   */
  async getAvailability(params = {}) {
    const res = await apiClient('/availability', {
      params,
      requiresAuth: false,
    });
    return res.data;
  },

  /**
   * Helper to fetch availability specifically for a single date
   */
  async getAvailabilityForDate(date, prescriberId = null) {
    const params = { date };
    if (prescriberId) {
      params.prescriberId = prescriberId;
    }
    const res = await apiClient('/availability', {
      params,
      requiresAuth: false,
    });
    return res.data;
  },
};

export default availabilityApi;
