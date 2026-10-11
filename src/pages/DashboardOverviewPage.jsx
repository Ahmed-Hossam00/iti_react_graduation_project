import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { appointmentsApi } from '../api/appointmentsApi';
import { reportsApi } from '../api/reportsApi';
import {
  Calendar,
  Clock,
  UserCheck,
  Stethoscope,
  CheckCircle,
  FileSignature,
  Users,
  AlertCircle,
  ArrowRight,
  PlusCircle,
  Search,
  Zap,
} from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { StatusBadge } from '../components/common/StatusBadge';
import { Button } from '../components/common/Button';
import { Skeleton } from '../components/common/Skeleton';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { FastPrescriptionModal } from '../components/prescriptions/FastPrescriptionModal';

export function DashboardOverviewPage() {
  const { user, isDoctor, isAssistant, isAdmin } = useAuth();

  const [stats, setStats] = useState(null);
  const [currentConsultation, setCurrentConsultation] = useState(null);
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [quickRxOpen, setQuickRxOpen] = useState(false);
  const [quickRxPatient, setQuickRxPatient] = useState(null);
  const [quickRxAppointmentId, setQuickRxAppointmentId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);

    const todayStr = new Date().toISOString().split('T')[0];
    const from = `${todayStr}T00:00:00.000Z`;
    const to = `${todayStr}T23:59:59.999Z`;

    try {
      const [summaryRes, activeConsultRes, scheduleRes] = await Promise.allSettled([
        reportsApi.getSummary({ from, to }),
        appointmentsApi.getCurrentConsultation(),
        appointmentsApi.listSchedule({ from, to, limit: 10 }),
      ]);

      if (summaryRes.status === 'fulfilled') {
        setStats(summaryRes.value || null);
      }
      if (activeConsultRes.status === 'fulfilled') {
        setCurrentConsultation(activeConsultRes.value || null);
      }
      if (scheduleRes.status === 'fulfilled') {
        setTodayAppointments(scheduleRes.value?.appointments || []);
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const totalToday = stats?.total || todayAppointments.length || 0;
  const bookedCount = stats?.byStatus?.BOOKED || 0;
  const checkedInCount = stats?.byStatus?.CHECKED_IN || 0;
  const inConsultCount = stats?.byStatus?.IN_CONSULTATION || 0;
  const completedCount = stats?.byStatus?.COMPLETED || 0;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Clinical Operations Overview"
        description={`Welcome back, ${
          user?.staffProfile?.firstName || 'Staff'
        }. Here is today's schedule and waiting room status.`}
        actions={
          <div className="flex items-center gap-2">
            {isDoctor && (
              <Button
                variant="primary"
                size="sm"
                icon={Zap}
                onClick={() => {
                  setQuickRxPatient(null);
                  setQuickRxAppointmentId(null);
                  setQuickRxOpen(true);
                }}
                className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold"
              >
                Quick Rx
              </Button>
            )}
            <Link to="/dashboard/appointments">
              <Button variant="outline" size="sm" icon={Calendar}>
                Full Schedule
              </Button>
            </Link>
            <Link to="/book-appointment">
              <Button variant="primary" size="sm" icon={PlusCircle}>
                New Booking
              </Button>
            </Link>
          </div>
        }
      />

      {error && <ErrorMessage error={error} onRetry={fetchDashboardData} />}

      {/* Real-time Consultation Banner (Single Patient with Doctor) */}
      <div className="bg-white rounded-none border border-slate-300 p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-none bg-purple-100 text-purple-700 flex items-center justify-center border border-purple-200">
              <Stethoscope className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                Active Consultation Room
              </h3>
              <p className="text-xs text-slate-500">
                Current patient undergoing clinical consultation
              </p>
            </div>
          </div>
          <span className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-none bg-purple-50 text-purple-700 border border-purple-300">
            <span className="w-2 h-2 rounded-none bg-purple-600 animate-ping" />
            Live Status
          </span>
        </div>

        {currentConsultation ? (
          <div className="mt-4 p-4 rounded-none bg-purple-50/50 border border-purple-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-none bg-purple-700 text-white flex items-center justify-center font-bold text-base">
                {currentConsultation.patient?.firstName?.[0]}
                {currentConsultation.patient?.lastName?.[0]}
              </div>
              <div>
                <div className="text-base font-bold text-slate-900">
                  {currentConsultation.patient?.firstName}{' '}
                  {currentConsultation.patient?.lastName}
                </div>
                <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                  <span className="font-mono text-purple-800 font-semibold bg-purple-100 px-1 border border-purple-200">
                    {currentConsultation.patient?.patientNumber}
                  </span>
                  <span>•</span>
                  <span>
                    Started at:{' '}
                    {currentConsultation.checkedInAt
                      ? new Date(currentConsultation.checkedInAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : 'Just now'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              {isDoctor && (
                <Button
                  variant="primary"
                  size="sm"
                  icon={Zap}
                  onClick={() => {
                    setQuickRxPatient(currentConsultation.patient);
                    setQuickRxAppointmentId(currentConsultation.id);
                    setQuickRxOpen(true);
                  }}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold"
                  title="Immediately prescribe medication for this patient"
                >
                  ⚡ Rapid Rx
                </Button>
              )}
              <Link to="/dashboard/appointments">
                <Button variant="outline" size="sm">
                  Manage Visit
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-4 p-6 text-center rounded-none bg-slate-50 border border-dashed border-slate-300 text-xs text-slate-500">
            No patient is currently in the consultation room. Ready for the next checked-in patient.
          </div>
        )}
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-none border border-slate-300 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Today
            </span>
            <div className="w-8 h-8 rounded-none bg-teal-50 text-[#0F766E] border border-teal-200 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {loading ? <Skeleton variant="title" /> : totalToday}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Scheduled visits</span>
        </div>

        <div className="bg-white rounded-none border border-slate-300 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Waiting / Arrived
            </span>
            <div className="w-8 h-8 rounded-none bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600 mt-2">
            {loading ? <Skeleton variant="title" /> : checkedInCount}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">In clinic waiting area</span>
        </div>

        <div className="bg-white rounded-none border border-slate-300 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Pending Slots
            </span>
            <div className="w-8 h-8 rounded-none bg-sky-50 text-sky-600 border border-sky-200 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-sky-600 mt-2">
            {loading ? <Skeleton variant="title" /> : bookedCount}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Upcoming arrivals</span>
        </div>

        <div className="bg-white rounded-none border border-slate-300 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Completed
            </span>
            <div className="w-8 h-8 rounded-none bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600 mt-2">
            {loading ? <Skeleton variant="title" /> : completedCount}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Visits finished</span>
        </div>
      </div>

      {/* Today's Schedule Preview Table */}
      <div className="bg-white rounded-none border border-slate-300 p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div>
            <h3 className="text-base font-bold text-slate-900 uppercase tracking-wide">
              Today's Patient Schedule
            </h3>
            <p className="text-xs text-slate-500">
              Upcoming consultation slots for current day
            </p>
          </div>
          <Link to="/dashboard/appointments">
            <Button variant="ghost" size="sm" icon={ArrowRight} iconPosition="right">
              View All
            </Button>
          </Link>
        </div>

        {loading ? (
          <Skeleton variant="card" count={2} />
        ) : todayAppointments.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500">
            No visits scheduled for today yet.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {todayAppointments.map((apt) => {
              const aptTime = new Date(apt.startsAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
              });
              const patient = apt.patient;
              const patientName = patient
                ? `${patient.firstName} ${patient.lastName}`
                : 'Walk-in';

              return (
                <div
                  key={apt.id}
                  className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-900 text-sm w-20">
                      {aptTime}
                    </span>
                    <div>
                      <div className="font-semibold text-slate-800 text-sm">
                        {patientName}
                      </div>
                      <div className="text-slate-400">
                        {patient?.patientNumber} {patient?.phone ? `• ${patient.phone}` : ''}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <StatusBadge status={apt.status} type="appointment" />
                    {isDoctor && (
                      <Button
                        variant="primary"
                        size="sm"
                        icon={Zap}
                        onClick={() => {
                          setQuickRxPatient(patient);
                          setQuickRxAppointmentId(apt.id);
                          setQuickRxOpen(true);
                        }}
                        className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold"
                        title="Quick Rx"
                      >
                        Quick Rx
                      </Button>
                    )}
                    <Link to="/dashboard/appointments">
                      <Button variant="outline" size="sm">
                        Manage
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Action Navigation Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/dashboard/patients"
          className="p-5 rounded-none bg-white border border-slate-300 hover:border-[#0F766E] transition-all group"
        >
          <div className="w-10 h-10 rounded-none bg-teal-50 text-[#0F766E] border border-teal-200 flex items-center justify-center mb-3 group-hover:bg-[#0F766E] group-hover:text-white transition-colors">
            <Users className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-slate-900">Patient Directory</h4>
          <p className="text-xs text-slate-500 mt-1">
            Search patients by name, telephone, or clinical patient number.
          </p>
        </Link>

        <Link
          to="/dashboard/prescriptions"
          className="p-5 rounded-none bg-white border border-slate-300 hover:border-[#0F766E] transition-all group"
        >
          <div className="w-10 h-10 rounded-none bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center mb-3 group-hover:bg-purple-700 group-hover:text-white transition-colors">
            <FileSignature className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-slate-900">Prescription Center</h4>
          <p className="text-xs text-slate-500 mt-1">
            Create drafts, verify medications, issue official records, and print.
          </p>
        </Link>

        <Link
          to={isAdmin ? '/dashboard/settings' : '/dashboard/appointments'}
          className="p-5 rounded-none bg-white border border-slate-300 hover:border-[#0F766E] transition-all group"
        >
          <div className="w-10 h-10 rounded-none bg-sky-50 text-sky-700 border border-sky-200 flex items-center justify-center mb-3 group-hover:bg-sky-700 group-hover:text-white transition-colors">
            <Clock className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-slate-900">
            {isAdmin ? 'Clinic Settings' : 'Schedule Queue'}
          </h4>
          <p className="text-xs text-slate-500 mt-1">
            {isAdmin
              ? 'Configure weekly working shifts, closures, and appointment rules.'
              : 'Review waiting room status, check-in arrivals, and complete visits.'}
          </p>
        </Link>
      </div>

      {/* Fast Prescription Modal */}
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
          fetchDashboardData();
        }}
      />
    </div>
  );
}

export default DashboardOverviewPage;
