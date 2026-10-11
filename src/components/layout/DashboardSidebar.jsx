import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useClinic } from '../../context/ClinicContext';
import {
  Activity,
  LayoutDashboard,
  CalendarDays,
  Users,
  FileSignature,
  Settings,
  UserCog,
  ArrowLeft,
  X,
} from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';

export function DashboardSidebar({ mobileOpen = false, onCloseMobile = () => {} }) {
  const { user, isAdmin, isDoctor, isAssistant } = useAuth();
  const { clinic } = useClinic();

  const navItems = [
    {
      to: '/dashboard',
      label: 'Overview',
      icon: LayoutDashboard,
      exact: true,
      allowed: true,
    },
    {
      to: '/dashboard/appointments',
      label: 'Appointments',
      icon: CalendarDays,
      allowed: true,
    },
    {
      to: '/dashboard/patients',
      label: 'Patients',
      icon: Users,
      allowed: true,
    },
    {
      to: '/dashboard/prescriptions',
      label: 'Prescriptions',
      icon: FileSignature,
      allowed: true,
    },
    {
      to: '/dashboard/staff',
      label: 'Staff Directory',
      icon: UserCog,
      allowed: isAdmin,
    },
    {
      to: '/dashboard/settings',
      label: 'Clinic Settings',
      icon: Settings,
      allowed: isAdmin,
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-900 text-slate-300">
      {/* Clinic Header */}
      <div className="p-5 border-b border-slate-800 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-none bg-[#0F766E] flex items-center justify-center text-white">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <span className="text-sm font-bold text-white tracking-tight block">
              {clinic?.name || 'Central City Clinic'}
            </span>
            <span className="text-[11px] text-teal-400 font-medium block">
              Staff Portal
            </span>
          </div>
        </Link>
        {mobileOpen && (
          <button
            type="button"
            onClick={onCloseMobile}
            className="md:hidden p-1.5 rounded-none text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* User profile card */}
      <div className="px-5 py-4 border-b border-slate-800/80 bg-slate-800/30">
        <div className="text-xs text-slate-400">Signed in as:</div>
        <div className="text-sm font-semibold text-white truncate">
          {user?.staffProfile
            ? `${user.staffProfile.firstName} ${user.staffProfile.lastName}`
            : user?.email}
        </div>
        <div className="mt-1 flex items-center gap-1.5">
          <StatusBadge status={user?.role} type="role" />
          {user?.staffProfile?.jobTitle && (
            <span className="text-[10px] text-slate-400 truncate">
              • {user.staffProfile.jobTitle}
            </span>
          )}
        </div>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
          Management
        </div>
        {navItems
          .filter((item) => item.allowed)
          .map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.exact}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-none text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-[#0F766E] text-white font-semibold'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
      </nav>

      {/* Footer Return Link */}
      <div className="p-4 border-t border-slate-800">
        <Link
          to="/"
          className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded-none transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit to Public Clinic Site</span>
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <aside className="hidden md:flex flex-col w-64 shrink-0 border-r border-slate-800 h-screen sticky top-0">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex" role="dialog" aria-modal="true">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
            onClick={onCloseMobile}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-slate-900 z-10">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}

export default DashboardSidebar;
