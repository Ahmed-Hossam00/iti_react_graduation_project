import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { appointmentsApi } from '../api/appointmentsApi';
import { availabilityApi } from '../api/availabilityApi';
import {
  Calendar,
  Clock,
  Stethoscope,
  MapPin,
  FileText,
  User,
  Ban,
  CalendarCheck,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  FileSignature,
} from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { StatusBadge } from '../components/common/StatusBadge';
import { Button } from '../components/common/Button';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { Modal } from '../components/common/Modal';
import { DatePicker } from '../components/common/DatePicker';
import { AvailableTimeSlots } from '../components/booking/AvailableTimeSlots';

export function AppointmentDetailPage() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();

  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cancellation
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState(null);

  // Reschedule
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleSlots, setRescheduleSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedRescheduleSlot, setSelectedRescheduleSlot] = useState(null);
  const [rescheduling, setRescheduling] = useState(false);
  const [rescheduleError, setRescheduleError] = useState(null);

  const fetchAppointment = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await appointmentsApi.getById(appointmentId);
      setAppointment(data);
      if (data?.startsAt) {
        setRescheduleDate(new Date(data.startsAt).toISOString().split('T')[0]);
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [appointmentId]);

  useEffect(() => {
    fetchAppointment();
  }, [fetchAppointment]);

  useEffect(() => {
    if (!rescheduleModalOpen || !rescheduleDate) return;

    setSlotsLoading(true);
    setRescheduleError(null);
    setSelectedRescheduleSlot(null);

    availabilityApi
      .getAvailabilityForDate(rescheduleDate, appointment?.prescriberId)
      .then((data) => {
        setRescheduleSlots(data?.slots || []);
      })
      .catch((err) => {
        setRescheduleError(err);
      })
      .finally(() => {
        setSlotsLoading(false);
      });
  }, [rescheduleModalOpen, rescheduleDate, appointment?.prescriberId]);

  const handleCancel = async () => {
    setCancelling(true);
    setCancelError(null);
    try {
      await appointmentsApi.cancel(appointmentId, cancelReason || 'Patient requested');
      setCancelModalOpen(false);
      fetchAppointment();
    } catch (err) {
      setCancelError(err);
    } finally {
      setCancelling(false);
    }
  };

  const handleReschedule = async () => {
    if (!selectedRescheduleSlot) return;
    setRescheduling(true);
    setRescheduleError(null);
    try {
      await appointmentsApi.reschedule(appointmentId, selectedRescheduleSlot.startsAt);
      setRescheduleModalOpen(false);
      fetchAppointment();
    } catch (err) {
      setRescheduleError(err);
    } finally {
      setRescheduling(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullPage message="Loading appointment details..." />;
  }

  if (error || !appointment) {
    return (
      <div className="max-w-xl mx-auto py-10">
        <ErrorMessage
          title="Appointment not found"
          error={error || 'Could not retrieve this appointment record.'}
          onRetry={fetchAppointment}
        />
        <div className="mt-4 text-center">
          <Link to="/my-appointments">
            <Button variant="outline">Back to Appointments</Button>
          </Link>
        </div>
      </div>
    );
  }

  const startsDate = new Date(appointment.startsAt);
  const endsDate = appointment.endsAt ? new Date(appointment.endsAt) : null;

  const prescriber = appointment.prescriber;
  const prescriberName =
    prescriber?.displayName ||
    (prescriber?.staffProfile
      ? `Dr. ${prescriber.staffProfile.firstName} ${prescriber.staffProfile.lastName}`
      : 'General Practitioner');

  const canModify = ['BOOKED', 'CONFIRMED'].includes(appointment.status);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader
        title="Appointment Details"
        description={`Record ID: ${appointment.id}`}
        backTo="/my-appointments"
        backLabel="All Appointments"
        badge={<StatusBadge status={appointment.status} type="appointment" />}
        actions={
          canModify && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                icon={CalendarCheck}
                onClick={() => setRescheduleModalOpen(true)}
              >
                Reschedule
              </Button>
              <Button
                variant="dangerOutline"
                size="sm"
                icon={Ban}
                onClick={() => setCancelModalOpen(true)}
              >
                Cancel Visit
              </Button>
            </div>
          )
        }
      />

      <div className="bg-white rounded-none border border-slate-300 p-6 sm:p-8 space-y-6">
        <div className="p-5 rounded-none bg-teal-50 border border-teal-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-none bg-[#0F766E] text-white flex flex-col items-center justify-center font-bold">
              <span className="text-xs uppercase leading-none">
                {startsDate.toLocaleDateString([], { month: 'short' })}
              </span>
              <span className="text-xl leading-tight">{startsDate.getDate()}</span>
            </div>

            <div>
              <div className="text-lg font-bold text-slate-900">
                {startsDate.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true,
                })}
                {endsDate && (
                  <span className="text-sm font-normal text-slate-500">
                    {' '}
                    –{' '}
                    {endsDate.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true,
                    })}
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                {startsDate.toLocaleDateString([], {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </div>
            </div>
          </div>

          <StatusBadge status={appointment.status} type="appointment" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Consulting Clinician
            </span>
            <div className="flex items-center gap-2 text-slate-800 font-bold text-base">
              <Stethoscope className="w-5 h-5 text-[#0F766E]" />
              <span>{prescriberName}</span>
            </div>
            {prescriber?.professionalTitle && (
              <p className="text-xs text-slate-500">{prescriber.professionalTitle}</p>
            )}
          </div>

          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Clinic Location
            </span>
            <div className="flex items-center gap-2 text-slate-800 font-bold text-base">
              <MapPin className="w-5 h-5 text-[#0F766E]" />
              <span>{appointment.clinic?.name || 'Central City Clinic'}</span>
            </div>
            <p className="text-xs text-slate-500">
              {appointment.clinic?.address || '100 Medical Plaza, Cairo, Egypt'}
            </p>
          </div>
        </div>

        {appointment.reason && (
          <div className="pt-4 border-t border-slate-200">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              Patient Reason
            </span>
            <p className="text-sm text-slate-800 bg-slate-50 p-3.5 rounded-none border border-slate-200">
              {appointment.reason}
            </p>
          </div>
        )}

        {appointment.doctorNotes && (
          <div className="pt-4 border-t border-slate-200">
            <span className="text-xs font-semibold text-purple-700 uppercase tracking-wider block mb-1">
              Doctor Clinical Notes & Observations
            </span>
            <p className="text-sm text-slate-800 bg-purple-50/50 p-4 rounded-none border border-purple-200 leading-relaxed">
              {appointment.doctorNotes}
            </p>
          </div>
        )}

        <div className="pt-4 border-t border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-slate-500">
          <div>
            <span className="text-slate-400 block">Booked On</span>
            <span className="font-medium text-slate-800">
              {new Date(appointment.createdAt).toLocaleDateString()}
            </span>
          </div>

          {appointment.checkedInAt && (
            <div>
              <span className="text-amber-600 block">Checked In</span>
              <span className="font-medium text-slate-800">
                {new Date(appointment.checkedInAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          )}

          {appointment.completedAt && (
            <div>
              <span className="text-emerald-600 block">Completed</span>
              <span className="font-medium text-slate-800">
                {new Date(appointment.completedAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          )}

          {appointment.cancelledAt && (
            <div>
              <span className="text-red-600 block">Cancelled</span>
              <span className="font-medium text-slate-800">
                {new Date(appointment.cancelledAt).toLocaleDateString()}
              </span>
            </div>
          )}


          {
            appointment.cancellationReason && (
              <div className="col-span-2 sm:col-span-4">
                <span className="text-red-600 block">Cancellation Reason</span>
                <span className="font-medium text-slate-800">
                  {appointment.cancellationReason}
                </span>
              </div>
            )
          }
        </div>

        {appointment.prescriptions && appointment.prescriptions.length > 0 && (
          <div className="pt-4 border-t border-slate-200">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
              Prescriptions Issued in This Visit
            </span>
            <div className="space-y-2">
              {appointment.prescriptions.map((p) => (
                <Link
                  key={p.id}
                  to={`/my-prescriptions/${p.id}`}
                  className="flex items-center justify-between p-3 rounded-none border border-teal-200 bg-teal-50/40 hover:bg-teal-50 transition-colors"
                >
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-900">
                    <FileSignature className="w-4 h-4 text-[#0F766E]" />
                    <span>Prescription #{p.id.substring(0, 8)}</span>
                    <StatusBadge status={p.status} type="prescription" />
                  </div>
                  <span className="text-xs text-[#0F766E] font-medium">
                    View Record →
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        onConfirm={handleCancel}
        title="Cancel This Appointment"
        message="Are you certain you wish to cancel this visit? Your slot will be released back to the clinic's public availability."
        confirmText="Confirm Cancellation"
        variant="danger"
        loading={cancelling}
      />

      <Modal
        isOpen={rescheduleModalOpen}
        onClose={() => setRescheduleModalOpen(false)}
        title="Reschedule Appointment"
        description="Pick a new date and open time slot to move your appointment."
        maxWidth="max-w-2xl"
      >
        <div className="space-y-4">
          {rescheduleError && <ErrorMessage error={rescheduleError} />}

          <DatePicker
            label="New Date"
            value={rescheduleDate}
            onChange={setRescheduleDate}
            required
          />

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Available Slots for New Date
            </label>
            <AvailableTimeSlots
              slots={rescheduleSlots}
              selectedSlot={selectedRescheduleSlot}
              onSelectSlot={setSelectedRescheduleSlot}
              loading={slotsLoading}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRescheduleModalOpen(false)}
            >
              Close
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={!selectedRescheduleSlot || rescheduling}
              loading={rescheduling}
              onClick={handleReschedule}
            >
              Confirm New Slot
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default AppointmentDetailPage;
