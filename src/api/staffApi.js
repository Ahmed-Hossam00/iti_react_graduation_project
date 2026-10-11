import { apiClient } from './client';

export const staffApi = {
  async listStaff(params = {}) {
    const res = await apiClient('/staff', { params });
    return {
      staff: res.data || [],
      meta: res.meta || null,
    };
  },

  async createStaff(data) {
    const res = await apiClient('/staff', {
      method: 'POST',
      body: data,
    });
    return res.data;
  },

  async getStaffById(staffId) {
    const res = await apiClient(`/staff/${staffId}`);
    return res.data;
  },

  async updateStaff(staffId, data) {
    const res = await apiClient(`/staff/${staffId}`, {
      method: 'PATCH',
      body: data,
    });
    return res.data;
  },

  async deactivateStaff(staffId) {
    const res = await apiClient(`/staff/${staffId}/deactivate`, {
      method: 'POST',
    });
    return res.data;
  },

  async listPrescribers() {
    const res = await apiClient('/prescribers', { requiresAuth: false });
    return res.data || [];
  },

  async getPrescriberAvailability(prescriberId, date) {
    const res = await apiClient(`/prescribers/${prescriberId}/availability`, {
      params: { date },
      requiresAuth: false,
    });
    return res.data;
  },
};

export default staffApi;
