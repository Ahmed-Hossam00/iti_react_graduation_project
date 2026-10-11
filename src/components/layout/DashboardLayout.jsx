import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useClinic } from '../../context/ClinicContext';
import { DashboardSidebar } from './DashboardSidebar';
import { Menu, LogOut, Clock, Globe } from 'lucide-react';
import { Button } from '../common/Button';
import { StatusBadge } from '../common/StatusBadge';

export function DashboardLayout() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const { clinic } = useClinic();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const displayName = user?.staffProfile
    ? `${user.staffProfile.firstName} ${user.staffProfile.lastName}`
    : user?.email;

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Sidebar */}
      <DashboardSidebar
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-slate-300">
          <div className="px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
            {/* Left mobile menu toggle */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileSidebarOpen(true)}
                className="md:hidden p-2 rounded-none text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                aria-label="Open sidebar"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div className="hidden sm:flex items-center gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1 font-medium text-slate-700">
                  <Globe className="w-3.5 h-3.5 text-[#0F766E]" />
                  {clinic?.name || 'Central City Clinic'}
                </span>
                <span className="text-slate-300">•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  Timezone: {clinic?.timezone || 'Africa/Cairo'}
                </span>
              </div>
            </div>

            {/* Right user & logout */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-right">
                <div>
                  <div className="text-xs font-semibold text-slate-800 leading-tight">
                    {displayName}
                  </div>
                  <div className="text-[11px] text-slate-500 leading-tight">
                    {user?.staffProfile?.jobTitle || 'Clinic Staff'}
                  </div>
                </div>
                <StatusBadge status={user?.role} type="role" />
              </div>

              <div className="h-6 w-px bg-slate-200 mx-1" />

              <Button
                variant="ghost"
                size="sm"
                icon={LogOut}
                onClick={handleLogout}
                className="text-slate-600 hover:text-red-700"
              >
                Logout
              </Button>
            </div>
          </div>
        </header>

        {/* Content body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
