import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  UserCheck,
  Stethoscope,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  FileEdit,
  Zap,
  Printer,
  MoreVertical,
} from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { PrescriptionDocument } from '../prescriptions/PrescriptionDocument';
import { useClinic } from '../../context/ClinicContext';

// -------------------------------------------------------------
// Helper Functions
// -------------------------------------------------------------

function formatDateTime(isoString) {
  try {
    const d = new Date(isoString);
    return {
      date: d.toLocaleDateString([], { month: 'short', day: 'numeric', weekday: 'short' }),
      time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
    };
  } catch {
    return { date: '', time: isoString };
  }
}

// -------------------------------------------------------------
// TD Subcomponents
// -------------------------------------------------------------

export function TDTimeDate({ startsAt }) {
  const { date, time } = formatDateTime(startsAt);
  return (
    <td className="py-3.5 px-4 whitespace-nowrap">
      <div className="font-semibold text-slate-900">{time}</div>
      <div className="text-xs text-slate-500">{date}</div>
    </td>
  );
}
export const TDDateTime = TDTimeDate;

export function TDPatient({ patient }) {
  const patientName = patient
    ? `${patient.firstName} ${patient.lastName}`
    : 'Walk-in / Unknown';

  return (
    <td className="py-3.5 px-4 whitespace-nowrap">
      <div className="font-medium text-slate-900">{patientName}</div>
      <div className="text-xs text-slate-500 flex items-center gap-1.5">
        <span>{patient?.patientNumber || 'No ID'}</span>
        {patient?.phone && <span>• {patient.phone}</span>}
      </div>
    </td>
  );
}

export function TDDoctor({ prescriber }) {
  const doctorName =
    prescriber?.displayName ||
    (prescriber?.staffProfile
      ? `Dr. ${prescriber.staffProfile.firstName} ${prescriber.staffProfile.lastName}`
      : 'Assigned Physician');

  return (
    <td className="py-3.5 px-4 whitespace-nowrap">
      <div className="text-slate-800 font-medium">{doctorName}</div>
    </td>
  );
}

export function TDStatus({ status }) {
  return (
    <td className="py-3.5 px-4 whitespace-nowrap">
      <StatusBadge status={status} type="appointment" />
    </td>
  );
}

export function TDReasonNotes({ reason, internalNote, doctorNotes, isDoctor }) {
  return (
    <td className="py-3.5 px-4 max-w-xs">
      {reason && (
        <p className="text-xs text-slate-700 truncate" title={reason}>
          <span className="font-medium text-slate-500">Reason:</span> {reason}
        </p>
      )}
      {internalNote && (
        <p className="text-xs text-amber-700 truncate mt-0.5" title={internalNote}>
          <span className="font-medium">Note:</span> {internalNote}
        </p>
      )}
      {doctorNotes && isDoctor && (
        <p className="text-xs text-purple-700 truncate mt-0.5" title={doctorNotes}>
          <span className="font-medium">Dr. Notes:</span> {doctorNotes}
        </p>
      )}
    </td>
  );
}
export const TDNotes = TDReasonNotes;

export function TDActions({
  apt,
  index,
  totalAppointments,
  isMenuOpen,
  onToggleMenu,
  onCloseMenu,
  onPrintPrescription,
  onViewDetails,
  onCheckIn,
  onStartConsultation,
  onQuickRx,
  onAddDoctorNotes,
  onComplete,
  onMarkNoShow,
  onCancel,
  isDoctor,
  isAssistant,
  isAdmin,
}) {
  const buttonRef = useRef(null);
  const [menuStyle, setMenuStyle] = useState(null);

  const status = apt.status;
  const hasCheckIn = (isAssistant || isAdmin || isDoctor) && status === 'BOOKED' && Boolean(onCheckIn);
  const hasStartConsultation =
    (isAssistant || isAdmin || isDoctor) &&
    (status === 'CHECKED_IN' || status === 'BOOKED') &&
    Boolean(onStartConsultation);
  const hasQuickRx =
    isDoctor &&
    (status === 'IN_CONSULTATION' || status === 'CHECKED_IN' || status === 'COMPLETED') &&
    Boolean(onQuickRx);
  const hasDoctorNotes =
    isDoctor &&
    (status === 'IN_CONSULTATION' || status === 'CHECKED_IN' || status === 'COMPLETED') &&
    Boolean(onAddDoctorNotes);
  const hasComplete =
    (isDoctor || isAssistant || isAdmin) &&
    (status === 'IN_CONSULTATION' || status === 'CHECKED_IN') &&
    Boolean(onComplete);
  const hasNoShow = (isAssistant || isAdmin || isDoctor) && status === 'BOOKED' && Boolean(onMarkNoShow);
  const hasCancel = (isAssistant || isAdmin) && ['BOOKED', 'CHECKED_IN'].includes(status) && Boolean(onCancel);
  const hasViewDetails = Boolean(onViewDetails);
  const hasPrescriptions = apt.prescriptions && apt.prescriptions.length > 0;
  const hasSecondaryActions = hasNoShow || hasCancel;

  useLayoutEffect(() => {
    if (!isMenuOpen || !buttonRef.current) {
      setMenuStyle(null);
      return;
    }

    const updatePosition = () => {
      if (!buttonRef.current) return;
      const rect = buttonRef.current.getBoundingClientRect();

      // If button scrolled completely out of view, close menu
      if (rect.bottom < 0 || rect.top > window.innerHeight) {
        onCloseMenu();
        return;
      }

      const menuWidth = 224; // w-56
      const estimatedHeight = 280;
      const spaceBelow = window.innerHeight - rect.bottom;
      const openUpwards = spaceBelow < estimatedHeight && rect.top > estimatedHeight;

      setMenuStyle({
        position: 'fixed',
        top: openUpwards ? undefined : `${rect.bottom + 4}px`,
        bottom: openUpwards ? `${window.innerHeight - rect.top + 4}px` : undefined,
        left: `${Math.max(8, rect.right - menuWidth)}px`,
        width: `${menuWidth}px`,
        zIndex: 9999,
      });
    };

    updatePosition();

    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [isMenuOpen, onCloseMenu]);

  return (
    <td className="py-3.5 px-4 text-right whitespace-nowrap">
      <div className="flex items-center justify-end gap-1.5">
        {/* Linked Prescriptions: Quick direct print */}
        {hasPrescriptions && (
          <div className="flex items-center gap-1">
            {apt.prescriptions.map((rx) => (
              <Button
                key={rx.id}
                variant="outline"
                size="sm"
                icon={Printer}
                onClick={() =>
                  onPrintPrescription({
                    ...rx,
                    patient: rx.patient || apt.patient,
                    prescriber: rx.prescriber || apt.prescriber,
                  })
                }
                className="bg-purple-50 text-purple-700 border-purple-300 hover:bg-purple-100 font-semibold text-xs shadow-xs"
                title="Print prescription directly"
              >
                Print Rx
              </Button>
            ))}
          </div>
        )}

        {/* 3-dots Dropdown Trigger */}
        <div className="relative inline-block text-left" data-actions-menu>
          <button
            ref={buttonRef}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleMenu();
            }}
            className={`p-1.5 rounded-none border transition-colors inline-flex items-center justify-center cursor-pointer ${isMenuOpen
              ? 'bg-slate-200 border-slate-400 text-slate-900 shadow-inner'
              : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-100 hover:text-slate-900 hover:border-slate-400'
              }`}
            title="Actions"
            aria-label="Appointment actions"
            aria-expanded={isMenuOpen}
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {/* Dropdown Menu rendered via Portal to escape table overflow-x-auto clipping */}
          {isMenuOpen &&
            menuStyle &&
            typeof document !== 'undefined' &&
            createPortal(
              <div
                style={menuStyle}
                data-actions-menu
                className="bg-white border border-slate-200 shadow-xl py-1 divide-y divide-slate-100 animate-in fade-in zoom-in-95 duration-100"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Primary Workflow Actions */}
                <div className="py-1">
                  {hasViewDetails && (
                    <button
                      type="button"
                      onClick={() => {
                        onCloseMenu();
                        onViewDetails(apt);
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs flex items-center gap-2.5 text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer"
                    >
                      <Eye className="w-4 h-4 text-slate-500" />
                      <span>View Details</span>
                    </button>
                  )}

                  {hasCheckIn && (
                    <button
                      type="button"
                      onClick={() => {
                        onCloseMenu();
                        onCheckIn(apt);
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs flex items-center gap-2.5 text-emerald-700 hover:bg-emerald-50 font-medium transition-colors cursor-pointer"
                    >
                      <UserCheck className="w-4 h-4 text-emerald-600" />
                      <span>Check In Patient</span>
                    </button>
                  )}

                  {hasStartConsultation && (
                    <button
                      type="button"
                      onClick={() => {
                        onCloseMenu();
                        onStartConsultation(apt);
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs flex items-center gap-2.5 text-[#0F766E] hover:bg-teal-50 font-medium transition-colors cursor-pointer"
                    >
                      <Stethoscope className="w-4 h-4 text-[#0F766E]" />
                      <span>With Doctor</span>
                    </button>
                  )}

                  {hasQuickRx && (
                    <button
                      type="button"
                      onClick={() => {
                        onCloseMenu();
                        onQuickRx(apt);
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs flex items-center gap-2.5 text-emerald-800 hover:bg-emerald-50 font-medium transition-colors cursor-pointer"
                    >
                      <Zap className="w-4 h-4 text-emerald-600 fill-emerald-600" />
                      <span>Quick Rx (Prescription)</span>
                    </button>
                  )}

                  {hasDoctorNotes && (
                    <button
                      type="button"
                      onClick={() => {
                        onCloseMenu();
                        onAddDoctorNotes(apt);
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs flex items-center gap-2.5 text-purple-700 hover:bg-purple-50 transition-colors cursor-pointer"
                    >
                      <FileEdit className="w-4 h-4 text-purple-600" />
                      <span>Clinical Notes</span>
                    </button>
                  )}

                  {hasComplete && (
                    <button
                      type="button"
                      onClick={() => {
                        onCloseMenu();
                        onComplete(apt);
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs flex items-center gap-2.5 text-teal-700 hover:bg-teal-50 font-medium transition-colors cursor-pointer"
                    >
                      <CheckCircle className="w-4 h-4 text-teal-600" />
                      <span>Complete Visit</span>
                    </button>
                  )}

                  {/* Prescriptions item inside dropdown */}
                  {hasPrescriptions &&
                    apt.prescriptions.map((rx) => (
                      <button
                        key={rx.id}
                        type="button"
                        onClick={() => {
                          onCloseMenu();
                          onPrintPrescription({
                            ...rx,
                            patient: rx.patient || apt.patient,
                            prescriber: rx.prescriber || apt.prescriber,
                          });
                        }}
                        className="w-full text-left px-3.5 py-2 text-xs flex items-center gap-2.5 text-purple-700 hover:bg-purple-50 transition-colors cursor-pointer"
                      >
                        <Printer className="w-4 h-4 text-purple-600" />
                        <span>Print Rx #{rx.id.substring(0, 8)}</span>
                      </button>
                    ))}
                </div>

                {/* Secondary / Destructive Actions */}
                {hasSecondaryActions && (
                  <div className="py-1">
                    {hasNoShow && (
                      <button
                        type="button"
                        onClick={() => {
                          onCloseMenu();
                          onMarkNoShow(apt);
                        }}
                        className="w-full text-left px-3.5 py-2 text-xs flex items-center gap-2.5 text-amber-700 hover:bg-amber-50 transition-colors cursor-pointer"
                      >
                        <AlertCircle className="w-4 h-4 text-amber-600" />
                        <span>Mark as No Show</span>
                      </button>
                    )}

                    {hasCancel && (
                      <button
                        type="button"
                        onClick={() => {
                          onCloseMenu();
                          onCancel(apt);
                        }}
                        className="w-full text-left px-3.5 py-2 text-xs flex items-center gap-2.5 text-red-600 hover:bg-red-50 font-medium transition-colors cursor-pointer"
                      >
                        <XCircle className="w-4 h-4 text-red-600" />
                        <span>Cancel Appointment</span>
                      </button>
                    )}
                  </div>
                )}
              </div>,
              document.body
            )}
        </div>
      </div>
    </td>
  );
}

// -------------------------------------------------------------
// Main Component
// -------------------------------------------------------------

export function AppointmentTable({
  appointments = [],
  onCheckIn,
  onStartConsultation,
  onComplete,
  onMarkNoShow,
  onCancel,
  onViewDetails,
  onAddDoctorNotes,
  onQuickRx,
  isDoctor = false,
  isAssistant = false,
  isAdmin = false,
}) {
  const [printModalPrescription, setPrintModalPrescription] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const { clinic } = useClinic();

  useEffect(() => {
    if (!openMenuId) return;
    const handleOutsideClick = (e) => {
      if (!e.target.closest('[data-actions-menu]')) {
        setOpenMenuId(null);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setOpenMenuId(null);
      }
    };

    document.addEventListener('click', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('click', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [openMenuId]);

  if (!appointments || appointments.length === 0) {
    return null;
  }

  return (
    <div className="w-full bg-white rounded-none border border-slate-300">
      <div className="overflow-x-auto  min-h-60">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <th className="py-3.5 px-4">Time & Date</th>
              <th className="py-3.5 px-4">Patient</th>
              <th className="py-3.5 px-4">Doctor</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">Reason / Notes</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {appointments.map((apt, index) => {
              const status = apt.status;
              const isMenuOpen = openMenuId === apt.id;

              return (
                <tr
                  key={apt.id}
                  className={`hover:bg-slate-50/80 transition-colors ${status === 'IN_CONSULTATION' ? 'bg-purple-50/40' : ''
                    } ${isMenuOpen ? 'relative z-30' : ''}`}
                >
                  <TDTimeDate startsAt={apt.startsAt} />
                  <TDPatient patient={apt.patient} />
                  <TDDoctor prescriber={apt.prescriber} />
                  <TDStatus status={status} />
                  <TDReasonNotes
                    reason={apt.reason}
                    internalNote={apt.internalNote}
                    doctorNotes={apt.doctorNotes}
                    isDoctor={isDoctor}
                  />
                  <TDActions
                    apt={apt}
                    index={index}
                    totalAppointments={appointments.length}
                    isMenuOpen={isMenuOpen}
                    onToggleMenu={() => setOpenMenuId(isMenuOpen ? null : apt.id)}
                    onCloseMenu={() => setOpenMenuId(null)}
                    onPrintPrescription={setPrintModalPrescription}
                    onViewDetails={onViewDetails}
                    onCheckIn={onCheckIn}
                    onStartConsultation={onStartConsultation}
                    onQuickRx={onQuickRx}
                    onAddDoctorNotes={onAddDoctorNotes}
                    onComplete={onComplete}
                    onMarkNoShow={onMarkNoShow}
                    onCancel={onCancel}
                    isDoctor={isDoctor}
                    isAssistant={isAssistant}
                    isAdmin={isAdmin}
                  />
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Quick Print Prescription Modal */}
      {printModalPrescription && (
        <Modal
          isOpen={Boolean(printModalPrescription)}
          onClose={() => setPrintModalPrescription(null)}
          title={`Prescription Record #${printModalPrescription.id?.substring(0, 8)}`}
          description="Official verified medical prescription from Central City Clinic"
          maxWidth="max-w-4xl"
        >
          <div className="space-y-4">
            <PrescriptionDocument
              prescription={printModalPrescription}
              showPrintButton={true}
              clinic={clinic}
            />
          </div>
        </Modal>
      )}
    </div>
  );
}

export default AppointmentTable;
