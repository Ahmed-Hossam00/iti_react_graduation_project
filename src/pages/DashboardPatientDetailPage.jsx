import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { patientsApi } from '../api/patientsApi';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  FileSignature,
  CalendarPlus,
  Clock,
  ShieldCheck,
  ChevronRight,
  Zap,
} from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { StatusBadge } from '../components/common/StatusBadge';
import { Button } from '../components/common/Button';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { EmptyState } from '../components/common/EmptyState';
import { FastPrescriptionModal } from '../components/prescriptions/FastPrescriptionModal';

export function DashboardPatientDetailPage() {
  const { patientId } = useParams();
  const { isDoctor } = useAuth();

  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loadedTabs, setLoadedTabs] = useState({ appointments: false, prescriptions: false });
  const [tabLoading, setTabLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('appointments'); // 'appointments' | 'prescriptions'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quickRxModalOpen, setQuickRxModalOpen] = useState(false);

  // Fetch base patient demographic data
  const fetchPatient = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const patientRes = await patientsApi.getPatientById(patientId);
      setPatient(patientRes);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    fetchPatient();
  }, [fetchPatient]);

  // Fetch tab data only when that tab becomes active and hasn't been loaded yet
  useEffect(() => {
    if (!patientId) return;

    if (activeTab === 'appointments' && !loadedTabs.appointments) {
      setTabLoading(true);
      patientsApi
        .getPatientAppointments(patientId)
        .then((res) => {
          setAppointments(res.appointments || []);
          setLoadedTabs((prev) => ({ ...prev, appointments: true }));
        })
        .catch(() => { })
        .finally(() => setTabLoading(false));
    } else if (activeTab === 'prescriptions' && !loadedTabs.prescriptions) {
      setTabLoading(true);
      patientsApi
        .getPatientPrescriptions(patientId)
        .then((res) => {
          setPrescriptions(res.prescriptions || []);
          setLoadedTabs((prev) => ({ ...prev, prescriptions: true }));
        })
        .catch(() => { })
        .finally(() => setTabLoading(false));
    }
  }, [patientId, activeTab, loadedTabs]);

  if (loading) {
    return <LoadingSpinner fullPage message="Loading patient profile..." />;
  }

  if (error || !patient) {
    return (
      <div className="max-w-xl mx-auto py-10">
        <ErrorMessage
          title="Patient record error"
          error={error || 'Could not load patient profile.'}
          onRetry={fetchPatient}
        />
        <div className="mt-4 text-center">
          <Link to="/dashboard/patients">
            <Button variant="outline">Back to Patients</Button>
          </Link>
        </div>
      </div>
    );
  }

  const fullName = `${patient.firstName} ${patient.lastName}`;

  return (
    <div className="space-y-6">
      <PageHeader
        title={fullName}
        description={`Clinical ID: ${patient.patientNumber}`}
        backTo="/dashboard/patients"
        backLabel="Patient Directory"
        badge={
          <span className="font-mono text-xs font-bold text-[#0F766E] bg-teal-50 px-2.5 py-1 rounded-none border border-teal-200">
            {patient.patientNumber}
          </span>
        }
        actions={
          <div className="flex items-center gap-2">
            {isDoctor && (
              <Button
                variant="primary"
                size="sm"
                icon={Zap}
                onClick={() => setQuickRxModalOpen(true)}
                className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold"
                title="Rapidly prescribe and issue medication"
              >
                ⚡ Quick Rx
              </Button>
            )}
            <Link to={`/dashboard/prescriptions?createFor=${patient.id}`}>
              <Button variant="outline" size="sm" icon={FileSignature}>
                New Rx Draft
              </Button>
            </Link>
            <Link to="/book-appointment">
              <Button variant="primary" size="sm" icon={CalendarPlus}>
                Book Appointment
              </Button>
            </Link>
          </div>
        }
      />

      {/* Patient Demographic Card */}
      <div className="bg-white rounded-none border border-slate-300 p-6">
        <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-200 uppercase tracking-wider text-xs text-slate-500">
          Demographic & Contact Details
        </h3>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-400 block mb-0.5">Telephone</span>
            <div className="flex items-center gap-1.5 font-medium text-slate-800">
              <Phone className="w-3.5 h-3.5 text-[#0F766E]" />
              <span>{patient.phone || 'None provided'}</span>
            </div>
          </div>

          <div>
            <span className="text-slate-400 block mb-0.5">Email</span>
            <div className="flex items-center gap-1.5 font-medium text-slate-800">
              <Mail className="w-3.5 h-3.5 text-[#0F766E]" />
              <span className="truncate">{patient.email || 'None provided'}</span>
            </div>
          </div>

          <div>
            <span className="text-slate-400 block mb-0.5">Date of Birth</span>
            <span className="font-medium text-slate-800">
              {patient.dateOfBirth
                ? new Date(patient.dateOfBirth).toLocaleDateString()
                : 'Not recorded'}
            </span>
          </div>

          <div>
            <span className="text-slate-400 block mb-0.5">Address</span>
            <span className="font-medium text-slate-800 truncate block">
              {patient.address || 'Cairo, Egypt'}
            </span>
          </div>
        </div>

        {patient.emergencyContactName && (
          <div className="mt-4 pt-3 border-t border-slate-200 flex items-center gap-3 text-xs text-slate-500">
            <span className="font-semibold text-slate-700">Emergency Contact:</span>
            <span>{patient.emergencyContactName}</span>
            {patient.emergencyContactPhone && (
              <span>({patient.emergencyContactPhone})</span>
            )}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-300">
        <button
          type="button"
          onClick={() => setActiveTab('appointments')}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${activeTab === 'appointments'
            ? 'border-[#0F766E] text-[#0F766E]'
            : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
        >
          <span>Appointments History</span>
          {loadedTabs.appointments && (
            <span className="px-2 py-0.5 rounded-none text-xs bg-teal-50 text-[#0F766E] font-bold border border-teal-200">
              {appointments.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('prescriptions')}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${activeTab === 'prescriptions'
            ? 'border-[#0F766E] text-[#0F766E]'
            : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
        >
          <span>Prescriptions History</span>
          {loadedTabs.prescriptions && (
            <span className="px-2 py-0.5 rounded-none text-xs bg-purple-50 text-purple-700 font-bold border border-purple-200">
              {prescriptions.length}
            </span>
          )}
        </button>
      </div>

      {/* Tab 1: Appointments */}
      {activeTab === 'appointments' && (
        tabLoading && !loadedTabs.appointments ? (
          <div className="bg-white rounded-none border border-slate-300 p-8 flex justify-center">
            <LoadingSpinner message="Loading patient appointments..." />
          </div>
        ) : (
          <div className="space-y-3">
            {appointments.length === 0 ? (
              <EmptyState
                icon={Calendar}
                title="No Appointments Recorded"
                description="This patient has not booked any consultations yet."
              />
            ) : (
              appointments.map((apt) => {
                const aptTime = new Date(apt.startsAt);
                return (
                  <div
                    key={apt.id}
                    className="p-4 bg-white rounded-none border border-slate-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-none bg-teal-50 text-[#0F766E] border border-teal-200 flex items-center justify-center font-bold">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-sm">
                          {aptTime.toLocaleDateString([], {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}{' '}
                          at{' '}
                          {aptTime.toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                        <div className="text-slate-500 mt-0.5">
                          Practitioner:{' '}
                          {apt.prescriber?.displayName || 'Assigned Clinician'}
                        </div>
                        <div className="text-slate-500 mt-0.5">
                          Doctor's Note:{' '}
                          {apt.doctorNotes || 'N/A'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center">
                      <StatusBadge status={apt.status} type="appointment" />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )
      )}

      {/* Tab 2: Prescriptions */}
      {activeTab === 'prescriptions' && (
        tabLoading && !loadedTabs.prescriptions ? (
          <div className="bg-white rounded-none border border-slate-300 p-8 flex justify-center">
            <LoadingSpinner message="Loading patient prescriptions..." />
          </div>
        ) : (
          <div className="space-y-3">
            {prescriptions.length === 0 ? (
              <EmptyState
                icon={FileSignature}
                title="No Prescriptions Issued"
                description="No clinical prescriptions have been prepared for this patient yet."
              />
            ) : (
              prescriptions.map((rx) => (
                <div
                  key={rx.id}
                  className="p-4 bg-white rounded-none border border-slate-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-none bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center font-serif text-xl font-bold">
                      ℞
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-sm">
                        Rx #{rx.id.substring(0, 8)}
                      </div>
                      <div className="text-slate-500 mt-0.5">
                        Issued:{' '}
                        {rx.issuedAt
                          ? new Date(rx.issuedAt).toLocaleDateString()
                          : 'Draft'}
                        {' • '}
                        {rx.items?.length || 0} medications
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <StatusBadge status={rx.status} type="prescription" />
                    <Link to={`/my-prescriptions/${rx.id}`}>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        )
      )}

      {/* Fast Prescription Modal */}
      <FastPrescriptionModal
        isOpen={quickRxModalOpen}
        onClose={() => setQuickRxModalOpen(false)}
        initialPatient={patient}
        onSuccess={() => {
          setQuickRxModalOpen(false);
          patientsApi.getPatientPrescriptions(patientId).then((res) => {
            setPrescriptions(res.prescriptions || []);
            setLoadedTabs((prev) => ({ ...prev, prescriptions: true }));
          });
        }}
      />
    </div>
  );
}

export default DashboardPatientDetailPage;
