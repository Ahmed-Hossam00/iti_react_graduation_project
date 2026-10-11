import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { appointmentsApi } from '../api/appointmentsApi';
import {
  Calendar,
  CalendarPlus,
  Clock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { AppointmentCard } from '../components/booking/AppointmentCard';
import { Button } from '../components/common/Button';
import { EmptyState } from '../components/common/EmptyState';
import { Skeleton } from '../components/common/Skeleton';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { ConfirmDialog } from '../components/common/ConfirmDialog';

export function MyAppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming' | 'past'

  // Cancellation state
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState(null);

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await appointmentsApi.listMy();
      setAppointments(res.appointments || []);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const handleConfirmCancel = async () => {
    if (!cancelTarget) return;
    setCancelling(true);
    setCancelError(null);
    try {
      await appointmentsApi.cancel(cancelTarget.id, 'Cancelled by patient');
      setCancelTarget(null);
      fetchAppointments();
    } catch (err) {
      setCancelError(err);
    } finally {
      setCancelling(false);
    }
  };

  const now = new Date();
  const upcomingList = appointments.filter((apt) => {
    const isFuture = new Date(apt.startsAt) >= now;
    const isPending = ['BOOKED', 'CONFIRMED', 'CHECKED_IN', 'IN_CONSULTATION'].includes(
      apt.status
    );
    return isFuture && isPending;
  });

  const pastList = appointments.filter((apt) => {
    const isFuture = new Date(apt.startsAt) >= now;
    const isPending = ['BOOKED', 'CONFIRMED', 'CHECKED_IN', 'IN_CONSULTATION'].includes(
      apt.status
    );
    return !isFuture || !isPending;
  });

  const displayedList = activeTab === 'upcoming' ? upcomingList : pastList;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        title="My Appointments"
        description="Track your scheduled visits, past consultations, and cancellation status."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'My Appointments' }]}
        actions={
          <Link to="/book-appointment">
            <Button variant="primary" icon={CalendarPlus}>
              Book New Appointment
            </Button>
          </Link>
        }
      />

      {error && (
        <ErrorMessage
          error={error}
          onRetry={fetchAppointments}
          className="mb-4"
        />
      )}

      {cancelError && (
        <ErrorMessage
          title="Could not cancel appointment"
          error={cancelError}
          onDismiss={() => setCancelError(null)}
          className="mb-4"
        />
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-300">
        <button
          type="button"
          onClick={() => setActiveTab('upcoming')}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'upcoming'
              ? 'border-[#0F766E] text-[#0F766E]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>Upcoming</span>
          <span className="px-2 py-0.5 rounded-none text-xs bg-teal-50 text-[#0F766E] font-bold border border-teal-200">
            {upcomingList.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('past')}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'past'
              ? 'border-[#0F766E] text-[#0F766E]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>Past & Completed</span>
          <span className="px-2 py-0.5 rounded-none text-xs bg-slate-100 text-slate-600 font-bold border border-slate-200">
            {pastList.length}
          </span>
        </button>
      </div>

      {/* List Content */}
      {loading ? (
        <div className="space-y-4">
          <Skeleton variant="card" count={3} />
        </div>
      ) : displayedList.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title={
            activeTab === 'upcoming'
              ? 'No upcoming appointments scheduled'
              : 'No past appointments found'
          }
          description={
            activeTab === 'upcoming'
              ? 'You do not have any upcoming visits booked. Need medical consultation?'
              : 'Your appointment history will be displayed here once completed.'
          }
          action={
            activeTab === 'upcoming' ? (
              <Link to="/book-appointment">
                <Button variant="primary" icon={CalendarPlus}>
                  Schedule Appointment
                </Button>
              </Link>
            ) : null
          }
        />
      ) : (
        <div className="space-y-4">
          {displayedList.map((apt) => (
            <AppointmentCard
              key={apt.id}
              appointment={apt}
              onCancel={(target) => setCancelTarget(target)}
            />
          ))}
        </div>
      )}

      {/* Cancel Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(cancelTarget)}
        onClose={() => setCancelTarget(null)}
        onConfirm={handleConfirmCancel}
        title="Cancel Appointment"
        message={`Are you sure you want to cancel your appointment scheduled for ${
          cancelTarget ? new Date(cancelTarget.startsAt).toLocaleString() : ''
        }? This slot will be released for other patients.`}
        confirmText="Yes, Cancel Appointment"
        variant="danger"
        loading={cancelling}
      />
    </div>
  );
}

export default MyAppointmentsPage;
