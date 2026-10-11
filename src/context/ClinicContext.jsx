import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { clinicApi } from '../api/clinicApi';

const ClinicContext = createContext(null);

export function ClinicProvider({ children }) {
  const [clinic, setClinic] = useState({
    name: 'Central City Clinic',
    address: '100 Medical Plaza, Cairo, Egypt',
    phone: '+201011112222',
    email: 'info@centralcityclinic.example.com',
    timezone: 'Africa/Cairo',
    defaultAppointmentDurationMinutes: 20,
    bookingWindowDays: 30,
    minimumNoticeMinutes: 60,
    cancellationCutoffMinutes: 120,
  });
  const [businessHours, setBusinessHours] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadClinicInfo = useCallback(async () => {
    try {
      setLoading(true);
      const clinicData = await clinicApi.getClinic();
      if (clinicData) {
        setClinic((prev) => ({ ...prev, ...clinicData }));
      }
    } catch {
      // Keep sensible default state if backend not immediately reached
    } finally {
      setLoading(false);
    }
  }, []);

  const loadBusinessHours = useCallback(async () => {
    try {
      const data = await clinicApi.getBusinessHours();
      setBusinessHours(data || []);
      return data || [];
    } catch {
      return [];
    }
  }, []);

  useEffect(() => {
    loadClinicInfo();
  }, [loadClinicInfo]);

  const value = {
    clinic,
    businessHours,
    loading,
    refreshClinic: loadClinicInfo,
    loadBusinessHours,
  };

  return <ClinicContext.Provider value={value}>{children}</ClinicContext.Provider>;
}

export function useClinic() {
  const context = useContext(ClinicContext);
  if (!context) {
    throw new Error('useClinic must be used within a ClinicProvider');
  }
  return context;
}

export default ClinicContext;
