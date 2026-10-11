import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useClinic } from '../context/ClinicContext';
import { staffApi } from '../api/staffApi';
import { availabilityApi } from '../api/availabilityApi';
import { appointmentsApi } from '../api/appointmentsApi';
import {
  Clock,
  Stethoscope,
  CheckCircle2,
  ArrowRight,
  FileText,
  User,
} from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { DatePicker } from '../components/common/DatePicker';
import { AvailableTimeSlots } from '../components/booking/AvailableTimeSlots';
import { PatientSearch } from '../components/dashboard/PatientSearch';
import { Button } from '../components/common/Button';
import { Textarea } from '../components/common/Textarea';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { StatusBadge } from '../components/common/StatusBadge';

export function BookAppointmentPage() {
  const { isAuthenticated, isStaff } = useAuth();
  const { clinic } = useClinic();

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Step 1: Practitioner & Date
  const [prescribers, setPrescribers] = useState([]);
  const [selectedPrescriberId, setSelectedPrescriberId] = useState(
    searchParams.get('prescriberId') || ''
  );
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  // Step 2: Available Slots
  const [slotsData, setSlotsData] = useState({ slots: [], timezone: 'Africa/Cairo' });
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);

  // Step 3: Reason & Staff patient selection
  const [reason, setReason] = useState('');
  const [internalNote, setInternalNote] = useState('');
  const [selectedPatientForStaff, setSelectedPatientForStaff] = useState(null);

  // Submission & Conflict states
  const [submitting, setSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState(null);
  const [confirmedAppointment, setConfirmedAppointment] = useState(null);

  // Load Prescribers
  useEffect(() => {
    staffApi
      .listPrescribers()
      .then((data) => {
        setPrescribers(data || []);
      })
      .catch(() => {});
  }, []);

  // Fetch slots whenever selectedDate or selectedPrescriberId changes
  const fetchSlots = useCallback(async () => {
    if (!selectedDate) return;
    setSlotsLoading(true);
    setSlotsError(null);
    setSelectedSlot(null);

    try {
      const data = await availabilityApi.getAvailabilityForDate(
        selectedDate,
        selectedPrescriberId || null
      );
      setSlotsData({
        slots: data?.slots || [],
        timezone: data?.timezone || clinic?.timezone || 'Africa/Cairo',
      });
    } catch (err) {
      setSlotsError(err);
      setSlotsData({ slots: [], timezone: clinic?.timezone || 'Africa/Cairo' });
    } finally {
      setSlotsLoading(false);
    }
  }, [selectedDate, selectedPrescriberId, clinic?.timezone]);

  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  // Handle Booking Confirmation
  const handleConfirmBooking = async () => {
    if (!selectedSlot) return;

    if (!isAuthenticated) {
      // Redirect to login with intent
      navigate('/login', {
        state: {
          from: { pathname: '/book-appointment' },
          savedBooking: {
            startsAt: selectedSlot.startsAt,
            prescriberId: selectedPrescriberId,
            reason,
          },
        },
      });
      return;
    }

    if (isStaff && !selectedPatientForStaff) {
      setBookingError({
        message: 'As staff, please select a patient to book on their behalf.',
      });
      return;
    }

    setSubmitting(true);
    setBookingError(null);

    const payload = {
      startsAt: selectedSlot.startsAt,
      reason: reason.trim() || undefined,
    };

    if (selectedPrescriberId) {
      payload.prescriberId = selectedPrescriberId;
    }

    if (isStaff && selectedPatientForStaff) {
      payload.patientId = selectedPatientForStaff.id;
      if (internalNote.trim()) {
        payload.internalNote = internalNote.trim();
      }
    }

    try {
      const created = await appointmentsApi.book(payload);
      setConfirmedAppointment(created);
    } catch (err) {
      setBookingError(err);
      // If 409 Conflict: refresh availability immediately
      if (err.status === 409 || err.code === 'SLOT_UNAVAILABLE') {
        setSelectedSlot(null);
        fetchSlots();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const selectedPrescriber = prescribers.find(
    (p) => p.id === selectedPrescriberId
  );

  // Success view if confirmed
  if (confirmedAppointment) {
    const aptTime = new Date(confirmedAppointment.startsAt);
    return (
      <div className="max-w-xl mx-auto py-10">
        <div className="bg-white rounded-none border border-emerald-300 p-8 text-center space-y-6">
          <div className="w-16 h-16 rounded-none bg-emerald-100 text-emerald-600 border border-emerald-300 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight uppercase">
              Appointment Confirmed!
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Your appointment has been successfully recorded in the clinic calendar.
            </p>
          </div>

          {/* Booking Summary Box */}
          <div className="p-5 rounded-none bg-slate-50 border border-slate-300 text-left space-y-3 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500">Date & Time</span>
              <span className="font-bold text-slate-900">
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
                  hour12: true,
                })}
              </span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500">Clinic Practitioner</span>
              <span className="font-semibold text-slate-900">
                {confirmedAppointment.prescriber?.displayName ||
                  selectedPrescriber?.displayName ||
                  'Consultant Physician'}
              </span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500">Status</span>
              <StatusBadge
                status={confirmedAppointment.status || 'BOOKED'}
                type="appointment"
              />
            </div>

            {confirmedAppointment.reason && (
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Reason</span>
                <span className="italic text-slate-800">
                  {confirmedAppointment.reason}
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              to={
                isStaff
                  ? '/dashboard/appointments'
                  : `/my-appointments/${confirmedAppointment.id}`
              }
            >
              <Button variant="primary" icon={ArrowRight} iconPosition="right">
                {isStaff ? 'View in Schedule' : 'View Appointment Details'}
              </Button>
            </Link>

            <Button
              variant="outline"
              onClick={() => {
                setConfirmedAppointment(null);
                setSelectedSlot(null);
                setReason('');
                fetchSlots();
              }}
            >
              Book Another
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <PageHeader
        title="Book a Clinical Appointment"
        description="Select a practitioner, pick an open date and time slot, and confirm your consultation."
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Book Appointment' },
        ]}
      />

      {bookingError && (
        <ErrorMessage
          title="Booking Notice"
          error={bookingError}
          onDismiss={() => setBookingError(null)}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Form & Slot picker (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Staff Mode: Patient selection */}
          {isStaff && (
            <div className="bg-amber-50/70 border border-amber-300 rounded-none p-5 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-800 uppercase tracking-wider">
                <User className="w-4 h-4" />
                <span>Staff Action: Select Patient</span>
              </div>
              <p className="text-xs text-amber-700">
                You are booking as staff. Search for the patient to book on their behalf:
              </p>
              <PatientSearch
                selectedPatient={selectedPatientForStaff}
                onSelectPatient={setSelectedPatientForStaff}
                onClear={() => setSelectedPatientForStaff(null)}
                required
              />
              <Textarea
                label="Staff Internal Note (Restricted)"
                placeholder="Optional private note for reception or doctor..."
                rows={2}
                value={internalNote}
                onChange={(e) => setInternalNote(e.target.value)}
              />
            </div>
          )}

          {/* Practitioner & Date Picker Card */}
          <div className="bg-white rounded-none border border-slate-300 p-6 space-y-5">
            <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-200 flex items-center gap-2 uppercase tracking-wide">
              <Stethoscope className="w-5 h-5 text-[#0F766E]" />
              <span>1. Practitioner & Date</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Practitioner Select */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Practitioner / Doctor
                </label>
                <select
                  value={selectedPrescriberId}
                  onChange={(e) => setSelectedPrescriberId(e.target.value)}
                  className="block w-full rounded-none border border-slate-300 text-sm py-2.5 px-3 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#0F766E]"
                >
                  <option value="">Any Available Practitioner</option>
                  {prescribers.map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      {doc.displayName ||
                        `${doc.staffProfile?.firstName} ${doc.staffProfile?.lastName}`}{' '}
                      ({doc.professionalTitle || 'Physician'})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  Leave as "Any" to see all open clinic consultation slots.
                </p>
              </div>

              {/* Date Picker */}
              <DatePicker
                label="Appointment Date"
                value={selectedDate}
                onChange={setSelectedDate}
                required
              />
            </div>
          </div>

          {/* Available Slots Card */}
          <div className="bg-white rounded-none border border-slate-300 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 uppercase tracking-wide">
                <Clock className="w-5 h-5 text-[#0F766E]" />
                <span>2. Select Time Slot</span>
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={fetchSlots}
                loading={slotsLoading}
              >
                Refresh Slots
              </Button>
            </div>

            {slotsError && (
              <ErrorMessage
                error={slotsError}
                onRetry={fetchSlots}
                className="my-2"
              />
            )}

            <AvailableTimeSlots
              slots={slotsData.slots}
              selectedSlot={selectedSlot}
              onSelectSlot={(slot) => {
                setSelectedSlot(slot);
                setBookingError(null);
              }}
              loading={slotsLoading}
              timezone={slotsData.timezone}
            />
          </div>

          {/* Reason / Notes Card */}
          <div className="bg-white rounded-none border border-slate-300 p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-200 flex items-center gap-2 uppercase tracking-wide">
              <FileText className="w-5 h-5 text-[#0F766E]" />
              <span>3. Consultation Reason</span>
            </h3>

            <Textarea
              label="Reason for Visit (Optional)"
              placeholder="Briefly state your symptoms or reason for visit (e.g. routine checkup, persistent cough, followup)..."
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              helperText="Do not enter emergency details. Call emergency services if immediate urgent care is needed."
            />
          </div>
        </div>

        {/* Right Column: Sticky Summary & Confirmation Box (1 col) */}
        <div className="space-y-6">
          <div className="bg-white rounded-none border border-slate-300 p-6 sticky top-24 space-y-5">
            <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-200 uppercase tracking-wide">
              Booking Summary
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 block mb-0.5">Clinic</span>
                <span className="font-semibold text-slate-800 text-sm">
                  {clinic?.name || 'Central City Clinic'}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block mb-0.5">Doctor</span>
                <span className="font-medium text-slate-800">
                  {selectedPrescriber
                    ? selectedPrescriber.displayName
                    : 'Any Available Practitioner'}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block mb-0.5">Date</span>
                <span className="font-medium text-slate-800">
                  {selectedDate
                    ? new Date(selectedDate).toLocaleDateString([], {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })
                    : 'Not selected'}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block mb-0.5">Time Slot</span>
                {selectedSlot ? (
                  <span className="inline-block px-2.5 py-1 rounded-none bg-teal-50 text-[#0F766E] border border-teal-200 font-bold text-xs">
                    {new Date(selectedSlot.startsAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true,
                    })}
                  </span>
                ) : (
                  <span className="text-amber-600 italic">
                    Please select an open slot from step 2
                  </span>
                )}
              </div>

              {reason && (
                <div>
                  <span className="text-slate-400 block mb-0.5">Reason</span>
                  <span className="text-slate-700 italic truncate block">
                    {reason}
                  </span>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-200 space-y-3">
              {!isAuthenticated && (
                <div className="p-3 rounded-none bg-amber-50 border border-amber-300 text-amber-800 text-xs">
                  <p className="font-semibold">Sign in required to confirm</p>
                  <p className="mt-0.5 text-[11px] text-amber-700">
                    You can proceed to sign in or register; your chosen slot will be held.
                  </p>
                </div>
              )}

              <Button
                type="button"
                variant="primary"
                size="lg"
                disabled={!selectedSlot || submitting}
                loading={submitting}
                onClick={handleConfirmBooking}
                icon={CheckCircle2}
                className="w-full shadow-md"
              >
                {!isAuthenticated
                  ? 'Sign In & Confirm'
                  : submitting
                  ? 'Reserving Slot...'
                  : 'Confirm Appointment'}
              </Button>

              <p className="text-[11px] text-slate-400 text-center leading-tight">
                No payment needed. Free cancellation up to{' '}
                {clinic?.cancellationCutoffMinutes ? Math.round(clinic.cancellationCutoffMinutes / 60) : 2}
                h before appointment.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookAppointmentPage;
