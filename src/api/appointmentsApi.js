import { apiClient } from './client';

export const appointmentsApi = {
  async book(data) {
    const res = await apiClient('/appointments', {
      method: 'POST',
      body: data,
    });
    return res.data;
  },

  async listMy(params = {}) {
    const res = await apiClient('/appointments/me', { params });
    return {
      appointments: res.data || [],
      meta: res.meta || null,
    };
  },

  async listSchedule(params = {}) {
    const res = await apiClient('/appointments', { params });
    return {
      appointments: res.data || [],
      meta: res.meta || null,
    };
  },

  async getById(appointmentId) {
    const res = await apiClient(`/appointments/${appointmentId}`);
    return res.data;
  },

  async update(appointmentId, data) {
    const res = await apiClient(`/appointments/${appointmentId}`, {
      method: 'PATCH',
      body: data,
    });
    return res.data;
  },

  async updateDoctorNotes(appointmentId, doctorNotes) {
    const res = await apiClient(`/appointments/${appointmentId}/doctor-notes`, {
      method: 'PATCH',
      body: { doctorNotes },
    });
    return res.data;
  },

  async getCurrentConsultation() {
    const res = await apiClient('/appointments/current-consultation');
    return res.data;
  },

  async startConsultation(appointmentId, forceSwitch = false) {
    const res = await apiClient(`/appointments/${appointmentId}/start-consultation`, {
      method: 'POST',
      body: { forceSwitch },
    });
    return res.data;
  },

  async checkIn(appointmentId) {
    const res = await apiClient(`/appointments/${appointmentId}/check-in`, {
      method: 'POST',
    });
    return res.data;
  },

  async complete(appointmentId) {
    const res = await apiClient(`/appointments/${appointmentId}/complete`, {
      method: 'POST',
    });
    return res.data;
  },

  async markNoShow(appointmentId) {
    const res = await apiClient(`/appointments/${appointmentId}/no-show`, {
      method: 'POST',
    });
    return res.data;
  },

  async reschedule(appointmentId, startsAt) {
    const res = await apiClient(`/appointments/${appointmentId}/reschedule`, {
      method: 'POST',
      body: { startsAt },
    });
    return res.data;
  },

  async cancel(appointmentId, cancellationReason = '') {
    const res = await apiClient(`/appointments/${appointmentId}/cancel`, {
      method: 'POST',
      body: { cancellationReason },
    });
    return res.data;
  },
};

export default appointmentsApi;
