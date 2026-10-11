import { apiClient } from './client';

export const patientsApi = {
  async getMe() {
    const res = await apiClient('/patients/me');
    return res.data;
  },

  async updateMe(data) {
    const res = await apiClient('/patients/me', {
      method: 'PATCH',
      body: data,
    });
    return res.data;
  },

  async searchPatients(params = {}) {
    const res = await apiClient('/patients', { params });
    return {
      patients: res.data || [],
      meta: res.meta || null,
    };
  },

  async getPatientById(patientId) {
    const res = await apiClient(`/patients/${patientId}`);
    return res.data;
  },

  async getPatientAppointments(patientId, params = {}) {
    const res = await apiClient(`/patients/${patientId}/appointments`, { params });
    return {
      appointments: res.data || [],
      meta: res.meta || null,
    };
  },

  async getPatientPrescriptions(patientId, params = {}) {
    const res = await apiClient(`/patients/${patientId}/prescriptions`, { params });
    return {
      prescriptions: res.data || [],
      meta: res.meta || null,
    };
  },
};

export default patientsApi;
