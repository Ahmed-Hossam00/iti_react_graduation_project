import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Button } from '../common/Button';

export function RoleGuard({ allowedRoles = [], children }) {
  const { user, role, loading } = useAuth();

  if (loading) {
    return null;
  }

  const isAllowed = allowedRoles.length === 0 || (role && allowedRoles.includes(role));

  if (!isAllowed) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-center p-6 bg-white rounded-none border border-slate-300 my-8 max-w-lg mx-auto">
        <div className="w-12 h-12 rounded-none bg-red-100 border border-red-300 text-red-600 flex items-center justify-center mb-4">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Access Restricted</h2>
        <p className="mt-2 text-sm text-slate-600 leading-relaxed">
          You do not have the required staff privileges ({allowedRoles.join(' or ')}) to view
          this administrative section. Your current role is{' '}
          <span className="font-semibold text-slate-800">{role || 'None'}</span>.
        </p>
        <div className="mt-6">
          <Link to={role === 'PATIENT' ? '/' : '/dashboard'}>
            <Button variant="primary" icon={ArrowLeft}>
              Back to Safety
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return children;
}

export default RoleGuard;
