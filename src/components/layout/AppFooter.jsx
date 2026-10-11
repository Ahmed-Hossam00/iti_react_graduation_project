import React from 'react';
import { Link } from 'react-router-dom';
import { useClinic } from '../../context/ClinicContext';
import { Activity, MapPin, Phone, Mail, Clock, ShieldCheck } from 'lucide-react';

export function AppFooter() {
  const { clinic } = useClinic();

  return (
    <footer className="bg-main text-slate-300 mt-auto border-t border-slate-800 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Clinic Brand Column */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-none bg-[#0F766E] flex items-center justify-center text-white">
                <Activity className="w-5 h-5" />
              </div>
              <span className="text-base font-bold text-white tracking-tight">
                {clinic?.name || 'Central City Clinic'}
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Providing dependable, high-quality outpatient care and seamless clinical
              appointment booking with trusted medical professionals.
            </p>
            <div className="flex items-center text-xs text-emerald-400 gap-1.5 pt-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Certified Healthcare Facility</span>
            </div>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Contact & Location
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#0F766E] shrink-0 mt-0.5" />
                <span>{clinic?.address || '100 Medical Plaza, Cairo, Egypt'}</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#0F766E] shrink-0" />
                <span>{clinic?.phone || '+201011112222'}</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#0F766E] shrink-0" />
                <span>{clinic?.email || 'info@centralcityclinic.example.com'}</span>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Patient Services
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link to="/book-appointment" className="hover:text-white transition-colors">
                  Book an Appointment
                </Link>
              </li>
              <li>
                <Link to="/my-appointments" className="hover:text-white transition-colors">
                  My Appointments
                </Link>
              </li>
              <li>
                <Link to="/my-prescriptions" className="hover:text-white transition-colors">
                  Prescription Records
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition-colors">
                  Patient Portal Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Operating Rules */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Clinic Guidelines
            </h4>
            <div className="space-y-2 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#0F766E] shrink-0" />
                <span>Timezone: {clinic?.timezone || 'Africa/Cairo'}</span>
              </div>
              <p>
                Default slot duration: <span className="text-slate-200">{clinic?.defaultAppointmentDurationMinutes || 20} mins</span>
              </p>
              <p>
                Booking horizon: <span className="text-slate-200">Up to {clinic?.bookingWindowDays || 30} days in advance</span>
              </p>
              <p>
                Cancellation window: <span className="text-slate-200">{clinic?.cancellationCutoffMinutes ? Math.round(clinic.cancellationCutoffMinutes / 60) : 2} hours notice required</span>
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <p>© {new Date().getFullYear()} {clinic?.name || 'Central City Clinic'}. All rights reserved.</p>
          <div className="flex items-center space-x-6">
            <span className="hover:text-slate-400">Confidential Medical Privacy</span>
            <span className="hover:text-slate-400">Patient Rights</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default AppFooter;
