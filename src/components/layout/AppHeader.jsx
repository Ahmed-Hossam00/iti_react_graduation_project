import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useClinic } from '../../context/ClinicContext';
import {
  Activity,
  Calendar,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  User,
  LogIn,
  UserPlus,
} from 'lucide-react';
import { Button } from '../common/Button';
import { StatusBadge } from '../common/StatusBadge';
import Skeleton from '../common/Skeleton';

export function AppHeader() {
  const { user, isAuthenticated, isStaff, isPatient, logout, loading } = useAuth();
  const { clinic } = useClinic();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navLinkClass = ({ isActive }) =>
    `px-3 py-2 rounded-none text-sm font-medium transition-colors ${isActive
      ? 'text-[#0F766E] bg-teal-50 border-b-2 border-[#0F766E] font-semibold'
      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
    }`;

  const displayName =
    user?.patientProfile
      ? `${user.patientProfile.firstName} ${user.patientProfile.lastName}`
      : user?.staffProfile
        ? `${user.staffProfile.firstName} ${user.staffProfile.lastName}`
        : user?.email || 'User';

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2.5 group">
            <div className="w-10 h-10 rounded-none bg-[#0F766E] flex items-center justify-center text-white group-hover:bg-[#115E59] transition-colors">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base font-bold text-slate-900 tracking-tight block leading-tight">
                {clinic?.name || 'Central City Clinic'}
              </span>
              <span className="text-xs text-slate-500 block leading-tight">
                Healthcare & Booking Platform
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <NavLink to="/" end className={navLinkClass}>
              Home
            </NavLink>
            <NavLink to="/book-appointment" className={navLinkClass}>
              Book Appointment
            </NavLink>

            {isAuthenticated && isPatient && (
              <>
                <NavLink to="/my-appointments" className={navLinkClass}>
                  My Appointments
                </NavLink>
                <NavLink to="/my-prescriptions" className={navLinkClass}>
                  My Prescriptions
                </NavLink>
              </>
            )}

            {isAuthenticated && isStaff && (
              <Link
                to="/dashboard"
                className="ml-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-none text-xs font-semibold bg-teal-50 text-[#0F766E] border border-teal-200 hover:bg-teal-100 transition-colors"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                Staff Dashboard
              </Link>
            )}
          </nav>

          {/* Desktop Right Auth / Profile */}
          <div className="hidden md:flex items-center space-x-3">
            {loading ? (
              <div className="flex items-center space-x-3">
                <Skeleton variant="button" />
              </div>
            ) : (
              isAuthenticated ? (
                <div className="flex items-center space-x-3">
                  <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
                    <div className="w-8 h-8 rounded-none bg-teal-100 text-[#0F766E] flex items-center justify-center text-xs font-bold">
                      <User className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <div className="text-xs font-semibold text-slate-800 leading-tight">
                        {displayName}
                      </div>
                      <StatusBadge status={user.role} type="role" className="mt-0.5" />
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    icon={LogOut}
                    onClick={handleLogout}
                    title="Sign out"
                  >
                    Logout
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={LogIn}
                    onClick={() => navigate('/login')}
                  >
                    Sign In
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    icon={UserPlus}
                    onClick={() => navigate('/register')}
                  >
                    Register
                  </Button>
                </div>
              )
            )}

          </div>

          {/* Mobile hamburger */}
          <div className="flex md:hidden items-center">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-none text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-300 bg-white px-4 pt-3 pb-6 space-y-2">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-none text-base font-medium text-slate-700 hover:bg-slate-100"
          >
            Home
          </Link>
          <Link
            to="/book-appointment"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-none text-base font-medium text-slate-700 hover:bg-slate-100"
          >
            Book Appointment
          </Link>

          {isAuthenticated && isPatient && (
            <>
              <Link
                to="/my-appointments"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-none text-base font-medium text-slate-700 hover:bg-slate-100"
              >
                My Appointments
              </Link>
              <Link
                to="/my-prescriptions"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-none text-base font-medium text-slate-700 hover:bg-slate-100"
              >
                My Prescriptions
              </Link>
            </>
          )}

          {isAuthenticated && isStaff && (
            <Link
              to="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-none text-base font-semibold text-[#0F766E] bg-teal-50"
            >
              Staff Dashboard
            </Link>
          )}

          <div className="pt-4 border-t border-slate-200">
            {isAuthenticated ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-800">
                    {displayName}
                  </span>
                  <StatusBadge status={user.role} type="role" />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  icon={LogOut}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full"
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate('/login');
                  }}
                >
                  Sign In
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate('/register');
                  }}
                >
                  Register
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default AppHeader;
