import { apiClient } from './client';

export const clinicApi = {
  async getClinic() {
    const res = await apiClient('/clinic', { requiresAuth: false });
    return res.data;
  },

  async updateClinic(data) {
    const res = await apiClient('/clinic', {
      method: 'PATCH',
      body: data,
    });
    return res.data;
  },

  async getBusinessHours() {
    const res = await apiClient('/clinic/business-hours', { requiresAuth: false });
    return res.data;
  },

  async setBusinessHours(hours) {
    const res = await apiClient('/clinic/business-hours', {
      method: 'PUT',
      body: { hours },
    });
    return res.data;
  },

  async getClosures() {
    const res = await apiClient('/clinic/closures', { requiresAuth: false });
    return res.data;
  },

  async createClosure(data) {
    const res = await apiClient('/clinic/closures', {
      method: 'POST',
      body: data,
    });
    return res.data;
  },

  async updateClosure(closureId, data) {
    const res = await apiClient(`/clinic/closures/${closureId}`, {
      method: 'PATCH',
      body: data,
    });
    return res.data;
  },

  async deleteClosure(closureId) {
    const res = await apiClient(`/clinic/closures/${closureId}`, {
      method: 'DELETE',
    });
    return res.data;
  },
};

export default clinicApi;
