import React from 'react';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  UserCheck,
  Stethoscope,
  FileEdit,
  FileCheck,
  FileX,
  FileText,
} from 'lucide-react';

export function StatusBadge({ status, type = 'appointment', className = '' }) {
  if (!status) return null;

  const normalized = status.toUpperCase();

  // Appointment Status configs (Flat Design)
  if (type === 'appointment') {
    switch (normalized) {
      case 'BOOKED':
        return (
          <span
            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-none text-[11px] font-bold uppercase tracking-wider bg-sky-50 text-sky-800 border border-sky-300 ${className}`}
          >
            <Clock className="w-3 h-3" />
            Booked
          </span>
        );
      case 'CHECKED_IN':
        return (
          <span
            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-none text-[11px] font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-300 ${className}`}
          >
            <UserCheck className="w-3 h-3" />
            Checked In
          </span>
        );
      case 'IN_CONSULTATION':
        return (
          <span
            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-none text-[11px] font-bold uppercase tracking-wider bg-purple-50 text-purple-800 border border-purple-300 animate-pulse ${className}`}
          >
            <Stethoscope className="w-3 h-3" />
            With Doctor
          </span>
        );
      case 'COMPLETED':
        return (
          <span
            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-none text-[11px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-300 ${className}`}
          >
            <CheckCircle2 className="w-3 h-3" />
            Completed
          </span>
        );
      case 'CANCELLED':
        return (
          <span
            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-none text-[11px] font-bold uppercase tracking-wider bg-rose-50 text-rose-800 border border-rose-300 ${className}`}
          >
            <XCircle className="w-3 h-3" />
            Cancelled
          </span>
        );
      case 'NO_SHOW':
        return (
          <span
            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-none text-[11px] font-bold uppercase tracking-wider bg-slate-100 text-slate-800 border border-slate-300 ${className}`}
          >
            <AlertCircle className="w-3 h-3" />
            No Show
          </span>
        );
      default:
        return (
          <span
            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-none text-[11px] font-bold uppercase tracking-wider bg-slate-100 text-slate-800 border border-slate-300 ${className}`}
          >
            {status}
          </span>
        );
    }
  }

  // Prescription Status configs
  if (type === 'prescription') {
    switch (normalized) {
      case 'DRAFT':
        return (
          <span
            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-none text-[11px] font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-300 ${className}`}
          >
            <FileEdit className="w-3 h-3" />
            Draft
          </span>
        );
      case 'ISSUED':
        return (
          <span
            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-none text-[11px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-300 ${className}`}
          >
            <FileCheck className="w-3 h-3" />
            Issued
          </span>
        );
      case 'REVOKED':
        return (
          <span
            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-none text-[11px] font-bold uppercase tracking-wider bg-red-50 text-red-800 border border-red-300 ${className}`}
          >
            <FileX className="w-3 h-3" />
            Revoked
          </span>
        );
      case 'SUPERSEDED':
        return (
          <span
            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-none text-[11px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-300 ${className}`}
          >
            <FileText className="w-3 h-3" />
            Superseded
          </span>
        );
      default:
        return (
          <span
            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-none text-[11px] font-bold uppercase tracking-wider bg-slate-100 text-slate-800 border border-slate-300 ${className}`}
          >
            {status}
          </span>
        );
    }
  }

  // Role configs
  if (type === 'role') {
    switch (normalized) {
      case 'ADMIN':
        return (
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-none text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-800 border border-purple-300 ${className}`}
          >
            Admin
          </span>
        );
      case 'PRESCRIBER':
        return (
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-none text-[10px] font-bold uppercase tracking-wider bg-teal-100 text-teal-800 border border-teal-300 ${className}`}
          >
            Doctor
          </span>
        );
      case 'ASSISTANT':
        return (
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-none text-[10px] font-bold uppercase tracking-wider bg-sky-100 text-sky-800 border border-sky-300 ${className}`}
          >
            Assistant
          </span>
        );
      case 'PATIENT':
        return (
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-none text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-800 border border-slate-300 ${className}`}
          >
            Patient
          </span>
        );
      default:
        return (
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-none text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-800 border border-slate-300 ${className}`}
          >
            {status}
          </span>
        );
    }
  }

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-none text-[11px] font-semibold bg-slate-100 text-slate-800 border border-slate-300 ${className}`}
    >
      {status}
    </span>
  );
}

export default StatusBadge;
