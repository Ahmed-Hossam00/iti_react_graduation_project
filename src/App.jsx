import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ClinicProvider } from './context/ClinicContext';

// Layouts & Guards
import { PublicLayout } from './components/layout/PublicLayout';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { RoleGuard } from './components/layout/RoleGuard';

// Public & Patient Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { BookAppointmentPage } from './pages/BookAppointmentPage';
import { MyAppointmentsPage } from './pages/MyAppointmentsPage';
import { AppointmentDetailPage } from './pages/AppointmentDetailPage';
import { MyPrescriptionsPage } from './pages/MyPrescriptionsPage';
import { PrescriptionDetailPage } from './pages/PrescriptionDetailPage';

// Dashboard Pages
import { DashboardOverviewPage } from './pages/DashboardOverviewPage';
import { DashboardAppointmentsPage } from './pages/DashboardAppointmentsPage';
import { DashboardPatientsPage } from './pages/DashboardPatientsPage';
import { DashboardPatientDetailPage } from './pages/DashboardPatientDetailPage';
import { DashboardPrescriptionsPage } from './pages/DashboardPrescriptionsPage';
import { DashboardStaffPage } from './pages/DashboardStaffPage';
import { DashboardSettingsPage } from './pages/DashboardSettingsPage';
import { NotFoundPage } from './pages/NotFoundPage';

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ClinicProvider>
          <Routes>
            <Route element={<PublicLayout />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/book-appointment" element={<BookAppointmentPage />} />

              <Route
                path="/my-appointments"
                element={
                  <ProtectedRoute>
                    <MyAppointmentsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-appointments/:appointmentId"
                element={
                  <ProtectedRoute>
                    <AppointmentDetailPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-prescriptions"
                element={
                  <ProtectedRoute>
                    <MyPrescriptionsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-prescriptions/:prescriptionId"
                element={
                  <ProtectedRoute>
                    <PrescriptionDetailPage />
                  </ProtectedRoute>
                }
              />

              <Route path="*" element={<NotFoundPage />} />
            </Route>

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <RoleGuard allowedRoles={['ASSISTANT', 'PRESCRIBER', 'ADMIN']}>
                    <DashboardLayout />
                  </RoleGuard>
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardOverviewPage />} />
              <Route path="appointments" element={<DashboardAppointmentsPage />} />
              <Route path="patients" element={<DashboardPatientsPage />} />
              <Route path="patients/:patientId" element={<DashboardPatientDetailPage />} />
              <Route path="prescriptions" element={<DashboardPrescriptionsPage />} />

              <Route
                path="staff"
                element={
                  <RoleGuard allowedRoles={['ADMIN']}>
                    <DashboardStaffPage />
                  </RoleGuard>
                }
              />
              <Route
                path="settings"
                element={
                  <RoleGuard allowedRoles={['ADMIN']}>
                    <DashboardSettingsPage />
                  </RoleGuard>
                }
              />
            </Route>
          </Routes>
        </ClinicProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
