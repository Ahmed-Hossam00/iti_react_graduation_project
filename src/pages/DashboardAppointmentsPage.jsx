import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { appointmentsApi } from '../api/appointmentsApi';
import { staffApi } from '../api/staffApi';
import {
  Calendar,
  PlusCircle,
  RefreshCw,
} from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { AppointmentTable } from '../components/booking/AppointmentTable';
import { FastPrescriptionModal } from '../components/prescriptions/FastPrescriptionModal';
import { Button } from '../components/common/Button';
import { Select } from '../components/common/Select';
import { Textarea } from '../components/common/Textarea';
import { Pagination } from '../components/common/Pagination';
import { Skeleton } from '../components/common/Skeleton';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { StatusBadge } from '../components/common/StatusBadge';

export function DashboardAppointmentsPage() {
  const { isDoctor, isAssistant, isAdmin } = useAuth();


  // Filters
  const [filterDate, setFilterDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPrescriberId, setFilterPrescriberId] = useState('');
  const [prescribers, setPrescribers] = useState([]);

  // Data & Pagination
  const [appointments, setAppointments] = useState([]);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Actions modals
  const [activeModal, setActiveModal] = useState(null); // 'cancel' | 'doctorNotes' | 'consultationConflict' | 'viewDetails'
  const [targetAppointment, setTargetAppointment] = useState(null);
  const [quickRxOpen, setQuickRxOpen] = useState(false);
  const [quickRxPatient, setQuickRxPatient] = useState(null);
  const [quickRxAppointmentId, setQuickRxAppointmentId] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState(null);

  // Form states
  const [cancelReason, setCancelReason] = useState('');
  const [doctorNotesText, setDoctorNotesText] = useState('');

  // Fetch prescribers
  useEffect(() => {
    staffApi.listPrescribers().then(setPrescribers).catch(() => { });
  }, []);

  const fetchSchedule = useCallback(async () => {
    setLoading(true);
    setError(null);

    const params = {
      page,
      limit: 20,
    };

    if (filterDate) {
      params.from = `${filterDate}T00:00:00.000Z`;
      params.to = `${filterDate}T23:59:59.999Z`;
    }
    if (filterStatus) {
      params.status = filterStatus;
    }
    if (filterPrescriberId) {
      params.prescriberId = filterPrescriberId;
    }

    try {
      const res = await appointmentsApi.listSchedule(params);
      setAppointments(res.appointments || []);
      setMeta(res.meta || null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [page, filterDate, filterStatus, filterPrescriberId]);

  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  // Handle Check In
  const handleCheckIn = async (apt) => {
    try {
      await appointmentsApi.checkIn(apt.id);
      fetchSchedule();
    } catch (err) {
      setError(err);
    }
  };

  // Handle Start Consultation
  const handleStartConsultation = async (apt, forceSwitch = false) => {
    try {
      await appointmentsApi.startConsultation(apt.id, forceSwitch);
      setActiveModal(null);
      fetchSchedule();
    } catch (err) {
      if (err.status === 409) {
        // Another patient is currently with doctor: prompt user to switch
        setTargetAppointment(apt);
        setActiveModal('consultationConflict');
      } else {
        setError(err);
      }
    }
  };

  // Handle Complete
  const handleComplete = async (apt) => {
    try {
      await appointmentsApi.complete(apt.id);
      fetchSchedule();
    } catch (err) {
      setError(err);
    }
  };

  // Handle Mark No Show
  const handleMarkNoShow = async (apt) => {
    try {
      await appointmentsApi.markNoShow(apt.id);
      fetchSchedule();
    } catch (err) {
      setError(err);
    }
  };

  // Handle Cancel
  const handleCancelSubmit = async () => {
    if (!targetAppointment) return;
    setActionLoading(true);
    setActionError(null);
    try {
      await appointmentsApi.cancel(targetAppointment.id, cancelReason || 'Staff cancelled');
      setActiveModal(null);
      fetchSchedule();
    } catch (err) {
      setActionError(err);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Doctor Notes submit
  const handleDoctorNotesSubmit = async () => {
    if (!targetAppointment || !doctorNotesText.trim()) return;
    setActionLoading(true);
    setActionError(null);
    try {
      await appointmentsApi.updateDoctorNotes(targetAppointment.id, doctorNotesText.trim());
      setActiveModal(null);
      fetchSchedule();
    } catch (err) {
      setActionError(err);
    } finally {
      setActionLoading(false);
    }
  };

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'BOOKED', label: 'Booked' },
    { value: 'CHECKED_IN', label: 'Checked In (Arrived)' },
    { value: 'IN_CONSULTATION', label: 'In Consultation (With Doctor)' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'CANCELLED', label: 'Cancelled' },
    { value: 'NO_SHOW', label: 'No Show' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Schedule & Appointment Management"
        description="Monitor daily arrivals, update consultation milestones, and manage clinic queue."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={RefreshCw}
              onClick={fetchSchedule}
              loading={loading}
            >
              Refresh
            </Button>
            <Link to="/book-appointment">
              <Button variant="primary" size="sm" icon={PlusCircle}>
                New Booking
              </Button>
            </Link>
          </div>
        }
      />

      {error && <ErrorMessage error={error} onDismiss={() => setError(null)} />}

      {/* Filter Bar */}
      <div className="bg-white rounded-none border border-slate-300 p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-3 items-end">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Date Filter
            </label>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => {
                setFilterDate(e.target.value);
                setPage(1);
              }}
              className="block w-full rounded-none border border-slate-300 text-sm py-2 px-3 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#0F766E]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Status Filter
            </label>
            <Select
              options={statusOptions}
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setPage(1);
              }}
              placeholder=""
              selectClassName="py-2"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Doctor Filter
            </label>
            <select
              value={filterPrescriberId}
              onChange={(e) => {
                setFilterPrescriberId(e.target.value);
                setPage(1);
              }}
              className="block w-full rounded-none border border-slate-300 text-sm py-2 px-3 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#0F766E]"
            >
              <option value="">All Practitioners</option>
              {prescribers.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.displayName || doc.staffProfile?.firstName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Button
              variant="outline"
              size="md"
              onClick={() => {
                const today = new Date().toISOString().split('T')[0];
                setFilterDate(today);
                setFilterStatus('');
                setFilterPrescriberId('');
                setPage(1);
              }}
              className="w-full text-xs"
            >
              Reset Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Appointments List / Table */}
      {loading ? (
        <div className="bg-white rounded-none border border-slate-300 p-6">
          <Skeleton variant="card" count={3} />
        </div>
      ) : appointments.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No Appointments Found"
          description="There are no appointments matching your selected filters and date range."
          action={
            <Link to="/book-appointment">
              <Button variant="primary" icon={PlusCircle}>
                Create an Appointment
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          <AppointmentTable
            appointments={appointments}
            onCheckIn={handleCheckIn}
            onStartConsultation={(apt) => handleStartConsultation(apt, false)}
            onComplete={handleComplete}
            onMarkNoShow={handleMarkNoShow}
            onQuickRx={(apt) => {
              setQuickRxPatient(apt.patient);
              setQuickRxAppointmentId(apt.id);
              setQuickRxOpen(true);
            }}
            onCancel={(apt) => {
              setTargetAppointment(apt);
              setCancelReason('');
              setActiveModal('cancel');
            }}
            onAddDoctorNotes={(apt) => {
              setTargetAppointment(apt);
              setDoctorNotesText(apt.doctorNotes || '');
              setActiveModal('doctorNotes');
            }}
            onViewDetails={(apt) => {
              setTargetAppointment(apt);
              setActiveModal('viewDetails');
            }}
            isDoctor={isDoctor}
            isAssistant={isAssistant}
            isAdmin={isAdmin}
          />

          {meta && (
            <Pagination
              page={page}
              totalPages={meta.totalPages || 1}
              totalItems={meta.total || appointments.length}
              pageSize={20}
              onPageChange={(newPage) => setPage(newPage)}
            />
          )}

          {/* Fast Prescription Modal for Doctors */}
          <FastPrescriptionModal
            isOpen={quickRxOpen}
            onClose={() => {
              setQuickRxOpen(false);
              setQuickRxPatient(null);
              setQuickRxAppointmentId(null);
            }}
            initialPatient={quickRxPatient}
            initialAppointmentId={quickRxAppointmentId}
            onSuccess={() => {
              setQuickRxOpen(false);
              setQuickRxPatient(null);
              setQuickRxAppointmentId(null);
              fetchSchedule();
            }}
          />
        </div>
      )}

      {/* Cancel Modal */}
      <Modal
        isOpen={activeModal === 'cancel'}
        onClose={() => setActiveModal(null)}
        title="Cancel Appointment"
        description="Cancel this appointment slot on behalf of patient or clinic."
      >
        <div className="space-y-4">
          {actionError && <ErrorMessage error={actionError} />}
          <Textarea
            label="Cancellation Reason"
            required
            placeholder="e.g. Patient called to cancel, doctor unavailable, etc."
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
          />
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveModal(null)}
            >
              Back
            </Button>
            <Button
              variant="danger"
              size="sm"
              loading={actionLoading}
              onClick={handleCancelSubmit}
            >
              Confirm Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* Doctor Consultation Notes Modal */}
      <Modal
        isOpen={activeModal === 'doctorNotes'}
        onClose={() => setActiveModal(null)}
        title="Clinical Consultation Notes"
        description="Record medical observations and clinical notes for this patient visit (Doctor Only)."
        maxWidth="max-w-2xl"
      >
        <div className="space-y-4">
          {actionError && <ErrorMessage error={actionError} />}
          <Textarea
            label="Doctor Clinical Notes & Observations"
            required
            rows={5}
            placeholder="Document patient chief complaint, clinical examination findings, diagnoses, and medical advice..."
            value={doctorNotesText}
            onChange={(e) => setDoctorNotesText(e.target.value)}
          />
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveModal(null)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              loading={actionLoading}
              onClick={handleDoctorNotesSubmit}
            >
              Save Clinical Notes
            </Button>
          </div>
        </div>
      </Modal>

      {/* Consultation Room Conflict Switch Modal */}
      <ConfirmDialog
        isOpen={activeModal === 'consultationConflict'}
        onClose={() => setActiveModal(null)}
        onConfirm={() => {
          if (targetAppointment) {
            handleStartConsultation(targetAppointment, true);
          }
        }}
        title="Consultation Room Active"
        message="Another patient is currently recorded as being in the consultation room with the doctor. Do you want to conclude the prior session and switch to this patient?"
        confirmText="Yes, Switch Patient"
        variant="warning"
      />

      {/* View Appointment Details Modal */}
      <Modal
        isOpen={activeModal === 'viewDetails'}
        onClose={() => setActiveModal(null)}
        title="Appointment Summary"
        maxWidth="max-w-lg"
      >
        {targetAppointment && (
          <div className="space-y-3 text-xs text-slate-600">
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-400">Appointment ID</span>
              <span className="font-mono text-slate-800">{targetAppointment.id}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-400">Patient</span>
              <span className="font-semibold text-slate-900">
                {targetAppointment.patient?.firstName} {targetAppointment.patient?.lastName}
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-400">Patient Number</span>
              <span className="font-mono text-teal-700">{targetAppointment.patient?.patientNumber}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-400">Status</span>
              <StatusBadge status={targetAppointment.status} type="appointment" />
            </div>
            {targetAppointment.reason && (
              <div className="py-1.5 border-b border-slate-100">
                <span className="text-slate-400 block mb-1">Reason</span>
                <p className="text-slate-800 bg-slate-50 p-2 rounded-none border border-slate-200">{targetAppointment.reason}</p>
              </div>
            )}
            {targetAppointment.internalNote && (
              <div className="py-1.5 border-b border-slate-100">
                <span className="text-amber-700 font-semibold block mb-1">Staff Internal Note</span>
                <p className="text-amber-900 bg-amber-50 p-2 rounded-none border border-amber-200">
                  {targetAppointment.internalNote}
                </p>
              </div>
            )}
            {targetAppointment.doctorNotes && (
              <div className="py-1.5">
                <span className="text-purple-700 font-semibold block mb-1">Doctor Consultation Notes</span>
                <p className="text-purple-900 bg-purple-50 p-2 rounded-none border border-purple-200">
                  {targetAppointment.doctorNotes}
                </p>
              </div>
            )}

            {
              targetAppointment.cancellationReason && (
                <div className="py-1.5 border-b border-slate-100">
                  <span className="text-red-600 block mb-1">Cancellation Reason</span>
                  <p className="text-red-800 bg-slate-50 p-2 rounded-none border border-red-200">{targetAppointment.cancellationReason}</p>
                </div>
              )
            }
            <div className="flex justify-end pt-3 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setActiveModal(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default DashboardAppointmentsPage;
