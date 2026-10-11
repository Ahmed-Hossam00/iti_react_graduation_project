import React, { useState, useEffect, useCallback } from 'react';
import { staffApi } from '../api/staffApi';
import {
  UserCog,
  PlusCircle,
  RefreshCw,
  UserCheck,
  UserX,
  Stethoscope,
  Shield,
  Edit,
  Mail,
  Phone,
} from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { StatusBadge } from '../components/common/StatusBadge';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { Skeleton } from '../components/common/Skeleton';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { EmptyState } from '../components/common/EmptyState';

export function DashboardStaffPage() {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deactivateTarget, setDeactivateTarget] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    jobTitle: '',
    role: 'ASSISTANT',
    isPrescriber: false,
    prescriberDisplayName: '',
    prescriberTitle: '',
    prescriberLicense: '',
  });

  const fetchStaff = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await staffApi.listStaff();
      setStaffList(res.staff || []);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  const handleFieldChange = (field, value) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === 'role') {
        updated.isPrescriber = value === 'PRESCRIBER';
      }
      return updated;
    });
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setActionError(null);

    const payload = {
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim() || undefined,
      password: formData.password,
      jobTitle: formData.jobTitle.trim(),
      role: formData.role,
      isPrescriber: formData.isPrescriber,
    };

    if (formData.isPrescriber) {
      payload.prescriberDetails = {
        displayName:
          formData.prescriberDisplayName.trim() ||
          `Dr. ${formData.firstName} ${formData.lastName}`,
        professionalTitle:
          formData.prescriberTitle.trim() || 'Consultant Physician',
        licenseNumber: formData.prescriberLicense.trim() || undefined,
      };
    }

    try {
      await staffApi.createStaff(payload);
      setCreateModalOpen(false);
      fetchStaff();
    } catch (err) {
      setActionError(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeactivate = async () => {
    if (!deactivateTarget) return;
    setActionLoading(true);
    setActionError(null);
    try {
      await staffApi.deactivateStaff(deactivateTarget.id);
      setDeactivateTarget(null);
      fetchStaff();
    } catch (err) {
      setActionError(err);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Staff Directory & Permissions"
        description="Manage clinical assistants, prescribers, and administrative team members."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={RefreshCw}
              onClick={fetchStaff}
              loading={loading}
            >
              Refresh
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={PlusCircle}
              onClick={() => {
                setFormData({
                  firstName: '',
                  lastName: '',
                  email: '',
                  phone: '',
                  password: '',
                  jobTitle: '',
                  role: 'ASSISTANT',
                  isPrescriber: false,
                  prescriberDisplayName: '',
                  prescriberTitle: '',
                  prescriberLicense: '',
                });
                setCreateModalOpen(true);
              }}
            >
              Add Staff Member
            </Button>
          </div>
        }
      />

      {error && <ErrorMessage error={error} onDismiss={() => setError(null)} />}

      {/* Staff Table */}
      {loading ? (
        <div className="bg-white rounded-none border border-slate-300 p-6">
          <Skeleton variant="card" count={3} />
        </div>
      ) : staffList.length === 0 ? (
        <EmptyState
          icon={UserCog}
          title="No Staff Accounts Found"
          description="Create staff member accounts to grant access to the clinic dashboard."
        />
      ) : (
        <div className="bg-white rounded-none border border-slate-300 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Staff Member</th>
                  <th className="py-3.5 px-4">Job Title</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Prescriber</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {staffList.map((member) => {
                  const userRecord = member.user;
                  const isActive = userRecord?.isActive ?? true;

                  return (
                    <tr key={member.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-semibold text-slate-900">
                          {member.firstName} {member.lastName}
                        </div>
                        <div className="text-xs text-slate-400">
                          {userRecord?.email || member.phone || '-'}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap text-xs text-slate-700">
                        {member.jobTitle || 'Staff'}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <StatusBadge status={userRecord?.role} type="role" />
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap text-xs">
                        {member.isPrescriber ? (
                          <span className="inline-flex items-center gap-1 text-teal-700 font-semibold bg-teal-50 px-2 py-0.5 rounded-none border border-teal-200">
                            <Stethoscope className="w-3 h-3" />
                            Authorized
                          </span>
                        ) : (
                          <span className="text-slate-400">No</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {isActive ? (
                          <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-none border border-emerald-200">
                            Active
                          </span>
                        ) : (
                          <span className="text-xs font-medium text-red-700 bg-red-50 px-2 py-0.5 rounded-none border border-red-200">
                            Deactivated
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isActive && (
                            <Button
                              variant="ghost"
                              size="sm"
                              icon={UserX}
                              onClick={() => setDeactivateTarget(member)}
                              className="text-red-500 hover:text-red-700"
                              title="Deactivate staff access"
                            >
                              Deactivate
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Staff Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Add Staff Member"
        description="Create account for assistant, clinician, or administrator."
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          {actionError && <ErrorMessage error={actionError} />}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="First Name"
              required
              value={formData.firstName}
              onChange={(e) => handleFieldChange('firstName', e.target.value)}
            />
            <Input
              label="Last Name"
              required
              value={formData.lastName}
              onChange={(e) => handleFieldChange('lastName', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Email Address"
              type="email"
              required
              value={formData.email}
              onChange={(e) => handleFieldChange('email', e.target.value)}
            />
            <Input
              label="Phone Number"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleFieldChange('phone', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Temporary Password"
              type="password"
              required
              placeholder="Min 8 characters"
              value={formData.password}
              onChange={(e) => handleFieldChange('password', e.target.value)}
            />
            <Input
              label="Job Title"
              required
              placeholder="e.g. Clinic Receptionist"
              value={formData.jobTitle}
              onChange={(e) => handleFieldChange('jobTitle', e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Role & Permissions
            </label>
            <select
              value={formData.role}
              onChange={(e) => handleFieldChange('role', e.target.value)}
              className="block w-full rounded-none border border-slate-300 text-sm py-2.5 px-3 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#0F766E]"
            >
              <option value="ASSISTANT">Assistant (Schedule, Patients, Draft Rx)</option>
              <option value="PRESCRIBER">Prescriber (Doctor - Issue Rx, Consultation)</option>
              <option value="ADMIN">Administrator (Full settings & staff management)</option>
            </select>
          </div>

          {formData.role === 'PRESCRIBER' && (
            <div className="p-4 rounded-none bg-teal-50 border border-teal-200 space-y-3">
              <span className="text-xs font-bold text-[#0F766E] uppercase tracking-wider block">
                Prescriber Credentials
              </span>
              <Input
                label="Display Name"
                placeholder="e.g. Dr. Ahmed Hassan"
                value={formData.prescriberDisplayName}
                onChange={(e) => handleFieldChange('prescriberDisplayName', e.target.value)}
              />
              <Input
                label="Professional Title"
                placeholder="e.g. MD, Internal Medicine"
                value={formData.prescriberTitle}
                onChange={(e) => handleFieldChange('prescriberTitle', e.target.value)}
              />
              <Input
                label="License Number"
                placeholder="e.g. LIC-EGY-98765"
                value={formData.prescriberLicense}
                onChange={(e) => handleFieldChange('prescriberLicense', e.target.value)}
              />
            </div>
          )}

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={actionLoading}
            >
              Create Staff Account
            </Button>
          </div>
        </form>
      </Modal>

      {/* Deactivate Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deactivateTarget)}
        onClose={() => setDeactivateTarget(null)}
        onConfirm={handleDeactivate}
        title="Deactivate Staff Account"
        message={`Are you sure you want to deactivate ${deactivateTarget?.firstName} ${deactivateTarget?.lastName}? They will be logged out and unable to access the staff portal.`}
        confirmText="Confirm Deactivation"
        variant="danger"
        loading={actionLoading}
      />
    </div>
  );
}

export default DashboardStaffPage;
