import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useClinic } from '../context/ClinicContext';
import { useAuth } from '../context/AuthContext';
import { staffApi } from '../api/staffApi';
import {
  Calendar,
  Clock,
  ShieldCheck,
  Stethoscope,
  FileCheck,
  ArrowRight,
  Phone,
  MapPin,
  CheckCircle2,
  Users,
} from 'lucide-react';
import { Button } from '../components/common/Button';

export function LandingPage() {
  const { clinic, businessHours, loadBusinessHours } = useClinic();
  const { isAuthenticated, isPatient, isStaff } = useAuth();
  const [prescribers, setPrescribers] = useState([]);

  useEffect(() => {
    staffApi.listPrescribers().then(setPrescribers).catch(() => { });
    if (businessHours.length === 0 && loadBusinessHours) {
      loadBusinessHours();
    }
  }, [businessHours.length, loadBusinessHours]);

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-16 py-4">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-none bg-slate-900 border border-slate-700 text-white p-8 sm:p-14">
        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-none bg-teal-900/60 border border-teal-500/50 text-teal-200 text-xs font-semibold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-teal-300" />
            Reliable Healthcare & Outpatient Booking
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            Comprehensive Clinical Care, Designed Around Your Time
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
            Welcome to <span className="text-white font-semibold">{clinic?.name || 'Central City Clinic'}</span>.
            Check real-time slot availability, reserve consultation appointments without waiting,
            and access your verified digital prescriptions anytime.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link to="/book-appointment">
              <Button
                variant="white"
                size="lg"
                icon={Calendar}
                className="hover:bg-slate-100 transition-colors"
              >
                Book an Appointment
              </Button>
            </Link>

            {isAuthenticated ? (
              <Link to={isStaff ? '/dashboard' : '/my-appointments'}>
                <Button
                  variant="outline"
                  size="lg"
                  className="bg-white/0 text-white border-white/30 hover:bg-white/10"
                >
                  {isStaff ? 'Open Staff Dashboard' : 'View My Appointments'}
                </Button>
              </Link>
            ) : (
              <Link to="/register">
                <Button
                  variant="outline"
                  size="lg"
                  className="bg-white/0 text-white border-white/30 hover:bg-white/10"
                >
                  Register as New Patient
                </Button>
              </Link>
            )}
          </div>

          {/* Quick Stats Badges */}
          <div className="pt-8 border-t border-slate-700/60 grid grid-cols-2 sm:grid-cols-3 gap-6 text-slate-300">
            <div>
              <div className="text-2xl font-bold text-white">
                {clinic?.defaultAppointmentDurationMinutes || 20}m
              </div>
              <div className="text-xs text-slate-400 mt-0.5">Consultation Duration</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">100% Real-Time</div>
              <div className="text-xs text-slate-400 mt-0.5">Direct Slot Booking</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">Digital Rx</div>
              <div className="text-xs text-slate-400 mt-0.5">Instant Prescription Records</div>
            </div>
          </div>
        </div>

        {/* Decorative background glow removed for flat design */}
      </section>

      {/* Feature Highlights */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight uppercase">
            Why Patients Choose Our Clinic
          </h2>
          <p className="text-sm text-slate-600">
            Streamlined clinical appointments without guesswork, phone queues, or schedule conflicts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-none border border-slate-300 p-6 hover:border-[#0F766E] transition-colors">
            <div className="w-12 h-12 rounded-none bg-teal-50 text-[#0F766E] border border-teal-200 flex items-center justify-center mb-4">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">
              Server-Calculated Availability
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Never book a double-booked slot. Our server dynamically accounts for clinic
              operating hours, holidays, and active doctor appointments.
            </p>
          </div>

          <div className="bg-white rounded-none border border-slate-300 p-6 hover:border-[#0F766E] transition-colors">
            <div className="w-12 h-12 rounded-none bg-sky-50 text-sky-700 border border-sky-200 flex items-center justify-center mb-4">
              <FileCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">
              Verified Digital Prescriptions
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Issued prescriptions are recorded directly in your patient portal, complete
              with authorized doctor credentials, dosage schedules, and printable sheets.
            </p>
          </div>

          <div className="bg-white rounded-none border border-slate-300 p-6 hover:border-[#0F766E] transition-colors">
            <div className="w-12 h-12 rounded-none bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center mb-4">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">
              Punctual Consultation Queue
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Arrive at the clinic, check in at reception with our assistant, and be called
              into your physician’s consultation room in real time.
            </p>
          </div>
        </div>
      </section>

      {/* Operating Hours & Doctor Showcase */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Working Hours Card */}
        <div className="bg-white rounded-none border border-slate-300 p-6">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-200">
            <Clock className="w-5 h-5 text-[#0F766E]" />
            <h3 className="text-base font-bold text-slate-900 uppercase tracking-wide">
              Weekly Business Hours
            </h3>
          </div>

          {businessHours.length === 0 ? (
            <p className="text-xs text-slate-500 py-4">Standard hours: Sun - Thu 09:00 - 17:00</p>
          ) : (
            <div className="divide-y divide-slate-100 text-xs">
              {businessHours.map((bh) => (
                <div key={bh.id || bh.dayOfWeek} className="py-2.5 flex items-center justify-between">
                  <span className="font-semibold text-slate-800">
                    {daysOfWeek[bh.dayOfWeek]}
                  </span>
                  {bh.isClosed ? (
                    <span className="text-rose-600 font-medium">Closed</span>
                  ) : (
                    <span className="text-slate-600 font-mono">
                      {bh.opensAt} – {bh.closesAt}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 pt-3 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
            <span>Notice period: {clinic?.minimumNoticeMinutes || 60}m before slot</span>
            <span>Timezone: {clinic?.timezone || 'Africa/Cairo'}</span>
          </div>
        </div>

        {/* Clinical Staff Showcase */}
        <div className="bg-white rounded-none border border-slate-300 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-200">
              <Stethoscope className="w-5 h-5 text-[#0F766E]" />
              <h3 className="text-base font-bold text-slate-900 uppercase tracking-wide">
                Our Medical Practitioners
              </h3>
            </div>

            {prescribers.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-500">
                Licensed clinicians available daily for consultations.
              </div>
            ) : (
              <div className="space-y-3">
                {prescribers.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-3.5 rounded-none border border-slate-200 bg-slate-50 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-none bg-teal-100 text-[#0F766E] border border-teal-200 flex items-center justify-center font-bold text-sm">
                        Dr
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">
                          {doc.displayName || `${doc.staffProfile?.firstName} ${doc.staffProfile?.lastName}`}
                        </h4>
                        <p className="text-xs text-slate-600 font-medium">
                          {doc.professionalTitle || 'General Physician'}
                        </p>
                      </div>
                    </div>

                    <Link to={`/book-appointment?prescriberId=${doc.id}`}>
                      <Button variant="outline" size="sm">
                        Book Slot
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              {clinic?.phone || '+201011112222'}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              {clinic?.address || 'Cairo, Egypt'}
            </span>
          </div>
        </div>
      </section>

      {/* Booking CTA Banner */}
      <section className="bg-teal-50 border border-teal-300 rounded-none p-8 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center sm:text-left">
          <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
            Ready to schedule your appointment?
          </h3>
          <p className="text-sm text-slate-600 max-w-xl">
            Select a convenient date and time with our certified clinical staff. Confirmation is
            immediate with zero booking fees.
          </p>
        </div>

        <Link to="/book-appointment" className="shrink-0">
          <Button variant="primary" size="lg" icon={ArrowRight} iconPosition="right">
            Book Now
          </Button>
        </Link>
      </section>
    </div>
  );
}

export default LandingPage;
