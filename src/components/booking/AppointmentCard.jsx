import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Stethoscope, ChevronRight, Ban } from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';
import { Button } from '../common/Button';

export function AppointmentCard({
  appointment,
  onCancel = null,
  showActions = true,
  className = '',
}) {
  if (!appointment) return null;

  const startsDate = new Date(appointment.startsAt);
  const formattedDate = startsDate.toLocaleDateString(undefined, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  const formattedTime = startsDate.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  const prescriberName =
    appointment.prescriber?.displayName ||
    (appointment.prescriber?.staffProfile
      ? `Dr. ${appointment.prescriber.staffProfile.firstName} ${appointment.prescriber.staffProfile.lastName}`
      : 'General Practitioner');

  const canCancel =
    appointment.status === 'BOOKED' || appointment.status === 'CONFIRMED';

  return (
    <div
      className={`bg-white rounded-none border border-slate-300 p-5 hover:border-[#0F766E] transition-colors ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-none bg-teal-50 border border-teal-200 text-[#0F766E] flex flex-col items-center justify-center font-bold">
            <span className="text-xs uppercase leading-none">
              {startsDate.toLocaleDateString(undefined, { month: 'short' })}
            </span>
            <span className="text-lg leading-tight">{startsDate.getDate()}</span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-semibold text-slate-900">
                {formattedTime}
              </span>
              <StatusBadge status={appointment.status} type="appointment" />
            </div>
            <div className="text-xs text-slate-500 mt-0.5">{formattedDate}</div>
          </div>
        </div>

        {showActions && (
          <div className="flex items-center gap-2 self-end sm:self-center">
            {canCancel && onCancel && (
              <Button
                variant="dangerOutline"
                size="sm"
                icon={Ban}
                onClick={() => onCancel(appointment)}
              >
                Cancel
              </Button>
            )}

            <Link to={`/my-appointments/${appointment.id}`}>
              <Button variant="outline" size="sm" icon={ChevronRight} iconPosition="right">
                Details
              </Button>
            </Link>
          </div>
        )}
      </div>

      <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <Stethoscope className="w-4 h-4 text-[#0F766E] shrink-0" />
          <span className="font-medium text-slate-800">{prescriberName}</span>
        </div>

        {appointment.reason && (
          <div className="truncate">
            <span className="text-slate-400">Reason: </span>
            <span className="italic text-slate-700">{appointment.reason}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default AppointmentCard;
