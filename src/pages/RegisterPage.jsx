import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Activity,
  User,
  Mail,
  Phone,
  Lock,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { ErrorMessage } from '../components/common/ErrorMessage';

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (formData.password.length < 8) {
      setError({ message: 'Password must be at least 8 characters long.' });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError({ message: 'Passwords do not match. Please re-check.' });
      return;
    }

    setLoading(true);

    try {
      await register({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim() || undefined,
        phone: formData.phone.trim() || undefined,
        password: formData.password,
      });

      navigate('/book-appointment', { replace: true });
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto py-8">
      {/* Brand Header */}
      <div className="text-center mb-8">
        <div className="w-12 h-12 rounded-none bg-[#0F766E] text-white flex items-center justify-center mx-auto mb-3">
          <Activity className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight uppercase">
          Create Your Patient Account
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Register to book appointments, manage visits, and receive digital prescriptions
        </p>
      </div>

      {/* Main Registration Card */}
      <div className="bg-white rounded-none border border-slate-300 p-6 sm:p-8">
        {error && (
          <ErrorMessage
            error={error}
            onDismiss={() => setError(null)}
            className="mb-5"
          />
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="First Name"
              required
              placeholder="e.g. Sara"
              leftIcon={User}
              value={formData.firstName}
              onChange={(e) => handleChange('firstName', e.target.value)}
            />

            <Input
              label="Last Name"
              required
              placeholder="e.g. Ali"
              leftIcon={User}
              value={formData.lastName}
              onChange={(e) => handleChange('lastName', e.target.value)}
            />
          </div>

          <Input
            label="Email Address"
            type="email"
            placeholder="sara@example.com"
            leftIcon={Mail}
            helperText="Used for booking confirmations and account recovery"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
          />

          <Input
            label="Phone Number"
            type="tel"
            placeholder="+201000000000"
            leftIcon={Phone}
            helperText="Include country code for SMS / contact"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Password"
              type="password"
              required
              placeholder="Minimum 8 characters"
              leftIcon={Lock}
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
            />

            <Input
              label="Confirm Password"
              type="password"
              required
              placeholder="Repeat password"
              leftIcon={Lock}
              value={formData.confirmPassword}
              onChange={(e) => handleChange('confirmPassword', e.target.value)}
            />
          </div>

          <div className="pt-2">
            <div className="flex items-start gap-2 text-xs text-slate-500 mb-4 bg-slate-50 p-3 rounded-none border border-slate-200">
              <ShieldCheck className="w-4 h-4 text-[#0F766E] shrink-0 mt-0.5" />
              <span>
                Your medical and personal information is kept strictly confidential and protected
                under medical privacy protocols.
              </span>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              icon={ArrowRight}
              iconPosition="right"
              className="w-full"
            >
              Complete Registration
            </Button>
          </div>
        </form>

        <div className="mt-6 pt-5 border-t border-slate-100 text-center text-xs text-slate-500">
          Already registered?{' '}
          <Link to="/login" className="text-[#0F766E] font-semibold hover:underline">
            Sign in to your account
          </Link>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
