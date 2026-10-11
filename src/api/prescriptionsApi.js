import { apiClient } from './client';

export const prescriptionsApi = {
  async createDraft(data) {
    const res = await apiClient('/prescriptions', {
      method: 'POST',
      body: data,
    });
    return res.data;
  },

  async list(params = {}) {
    const res = await apiClient('/prescriptions', { params });
    return {
      prescriptions: res.data || [],
      meta: res.meta || null,
    };
  },

  async getById(prescriptionId) {
    const res = await apiClient(`/prescriptions/${prescriptionId}`);
    return res.data;
  },

  async updateDraft(prescriptionId, data) {
    const res = await apiClient(`/prescriptions/${prescriptionId}`, {
      method: 'PATCH',
      body: data,
    });
    return res.data;
  },

  async issue(prescriptionId) {
    const res = await apiClient(`/prescriptions/${prescriptionId}/issue`, {
      method: 'POST',
    });
    return res.data;
  },

  async revoke(prescriptionId, reason) {
    const res = await apiClient(`/prescriptions/${prescriptionId}/revoke`, {
      method: 'POST',
      body: { reason },
    });
    return res.data;
  },

  async supersede(prescriptionId) {
    const res = await apiClient(`/prescriptions/${prescriptionId}/supersede`, {
      method: 'POST',
    });
    return res.data;
  },

  getPrintUrl(prescriptionId) {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';
    return `${baseUrl}/prescriptions/${prescriptionId}/print`;
  },
};

export default prescriptionsApi;
