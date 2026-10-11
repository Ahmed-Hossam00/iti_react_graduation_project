import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/authApi';
import {
  Activity,
  Mail,
  Lock,
  ArrowRight,
  Shield,
  Stethoscope,
  Users,
  CheckCircle2,
} from 'lucide-react';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { Modal } from '../components/common/Modal';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Forgot Password modal
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(null);
  const [forgotLoading, setForgotLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const isEmail = identifier.includes('@');
    const credentials = {
      ...(isEmail ? { email: identifier.trim() } : { phone: identifier.trim() }),
      password,
      rememberMe,
    };

    try {
      const data = await login(credentials);
      const userRole = data?.user?.role;
      const redirectTarget = location.state?.from?.pathname;

      if (redirectTarget) {
        navigate(redirectTarget, { replace: true });
      } else if (['ADMIN', 'PRESCRIBER', 'ASSISTANT'].includes(userRole)) {
        navigate('/dashboard', { replace: true });
      } else {
        navigate('/my-appointments', { replace: true });
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = (email, pass) => {
    setIdentifier(email);
    setPassword(pass);
    setError(null);
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotLoading(true);
    try {
      const res = await authApi.forgotPassword(forgotEmail);
      setForgotSuccess(
        res?.message || 'Password reset instructions have been dispatched.'
      );
    } catch (err) {
      setError(err);
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-8">
      {/* Brand Header */}
      <div className="text-center mb-8">
        <div className="w-12 h-12 rounded-none bg-[#0F766E] text-white flex items-center justify-center mx-auto mb-3">
          <Activity className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight uppercase">
          Sign In to Your Account
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Access your appointment records or clinical staff dashboard
        </p>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-none border border-slate-300 p-6 sm:p-8">
        {error && (
          <ErrorMessage
            error={error}
            onDismiss={() => setError(null)}
            className="mb-5"
          />
        )}

        <form onSubmit={handleSubmit} className="space-y-4 ">
          <Input
            label="Email or Phone Number"
            type="text"
            required
            placeholder="e.g. sara@example.com or +201..."
            leftIcon={Mail}
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
          />

          <Input
            label="Password"
            type="password"
            required
            placeholder="••••••••"
            leftIcon={Lock}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center text-slate-600 select-none cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded-none border-slate-300 text-[#0F766E] focus:ring-[#0F766E] mr-2"
              />
              Remember me
            </label>
            <button
              type="button"
              onClick={() => {
                setForgotModalOpen(true);
                setForgotSuccess(null);
                setForgotEmail(identifier.includes('@') ? identifier : '');
              }}
              className="text-[#0F766E] hover:text-[#115E59] font-medium"
            >
              Forgot password?
            </button>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            icon={ArrowRight}
            iconPosition="right"
            className="w-full mt-2"
          >
            Sign In
          </Button>
        </form>

        <div className="mt-6 pt-5 border-t border-slate-100 text-center text-xs text-slate-500">
          Don't have a patient account yet?{' '}
          <Link
            to="/register"
            className="text-[#0F766E] font-semibold hover:underline"
          >
            Create an account
          </Link>
        </div>
      </div>

      {/* Quick Demo Credentials Assistant */}
      <div className="mt-8 bg-slate-100 rounded-none p-5 border border-slate-300">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          <Shield className="w-4 h-4 text-[#0F766E]" />
          <span>Quick Demo Logins (Seed Accounts)</span>
        </div>
        <p className="text-[11px] text-slate-500 mb-3">
          Click any role to autofill seeded credentials from the local database:
        </p>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() =>
              fillDemoCredentials('admin@clinic.example.com', 'SecureClinicPass123!')
            }
            className="p-2 bg-white rounded-none border border-slate-300 hover:border-purple-600 text-left cursor-pointer transition-colors"
          >
            <div className="text-[11px] font-bold text-purple-700 flex items-center gap-1">
              <Shield className="w-3 h-3" /> Admin
            </div>
            <div className="text-[10px] text-slate-400 truncate">Director</div>
          </button>

          <button
            type="button"
            onClick={() =>
              fillDemoCredentials('doctor@clinic.example.com', 'SecureClinicPass123!')
            }
            className="p-2 bg-white rounded-none border border-slate-300 hover:border-teal-600 text-left cursor-pointer transition-colors"
          >
            <div className="text-[11px] font-bold text-teal-700 flex items-center gap-1">
              <Stethoscope className="w-3 h-3" /> Doctor
            </div>
            <div className="text-[10px] text-slate-400 truncate">Prescriber</div>
          </button>

          <button
            type="button"
            onClick={() =>
              fillDemoCredentials('assistant@clinic.example.com', 'SecureClinicPass123!')
            }
            className="p-2 bg-white rounded-none border border-slate-300 hover:border-sky-600 text-left cursor-pointer transition-colors"
          >
            <div className="text-[11px] font-bold text-sky-700 flex items-center gap-1">
              <Users className="w-3 h-3" /> Assistant
            </div>
            <div className="text-[10px] text-slate-400 truncate">Reception</div>
          </button>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <Modal
        isOpen={forgotModalOpen}
        onClose={() => setForgotModalOpen(false)}
        title="Reset Your Password"
        description="Enter your registered email to receive password reset instructions."
      >
        {forgotSuccess ? (
          <div className="space-y-4">
            <div className="p-4 rounded-none bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{forgotSuccess}</span>
            </div>
            <Button
              variant="outline"
              size="md"
              onClick={() => setForgotModalOpen(false)}
              className="w-full"
            >
              Close
            </Button>
          </div>
        ) : (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <Input
              label="Account Email"
              type="email"
              required
              placeholder="sara@example.com"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
            />
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setForgotModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                loading={forgotLoading}
              >
                Send Reset Link
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}

export default LoginPage;
