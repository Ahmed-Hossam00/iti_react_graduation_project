import React, { useState, useEffect, useCallback } from 'react';
import { useClinic } from '../context/ClinicContext';
import { clinicApi } from '../api/clinicApi';
import {
  Settings,
  Clock,
  Calendar,
  Save,
  PlusCircle,
  Trash2,
  CheckCircle2,
} from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';

export function DashboardSettingsPage() {
  const { refreshClinic } = useClinic();


  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'hours' | 'closures'

  // Clinic Profile State
  const [profileData, setProfileData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    timezone: 'Africa/Cairo',
    defaultAppointmentDurationMinutes: 20,
    bookingWindowDays: 30,
    minimumNoticeMinutes: 60,
    cancellationCutoffMinutes: 120,
  });

  // Business Hours State
  const [hours, setHours] = useState([]);

  // Closures State
  const [closures, setClosures] = useState([]);
  const [createClosureOpen, setCreateClosureOpen] = useState(false);
  const [newClosure, setNewClosure] = useState({
    startsAt: '',
    endsAt: '',
    reason: '',
  });
  const [deleteClosureTarget, setDeleteClosureTarget] = useState(null);

  // Status & Feedback
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState('');
  const [error, setError] = useState(null);


  const daysLabels = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];

  const [loadedTabs, setLoadedTabs] = useState({ profile: false, hours: false, closures: false });
  const [loading, setLoading] = useState(true);
  const [tabLoading, setTabLoading] = useState(false);

  // Loaders for each tab
  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const clinicRes = await clinicApi.getClinic();
      if (clinicRes) {
        setProfileData({
          name: clinicRes.name || '',
          address: clinicRes.address || '',
          phone: clinicRes.phone || '',
          email: clinicRes.email || '',
          timezone: clinicRes.timezone || 'Africa/Cairo',
          defaultAppointmentDurationMinutes:
            clinicRes.defaultAppointmentDurationMinutes || 20,
          bookingWindowDays: clinicRes.bookingWindowDays || 30,
          minimumNoticeMinutes: clinicRes.minimumNoticeMinutes || 60,
          cancellationCutoffMinutes: clinicRes.cancellationCutoffMinutes || 120,
        });
      }
      setLoadedTabs((prev) => ({ ...prev, profile: true }));
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchHours = useCallback(async () => {
    setTabLoading(true);
    setError(null);
    try {
      const hoursRes = await clinicApi.getBusinessHours();
      setHours(hoursRes || []);
      setLoadedTabs((prev) => ({ ...prev, hours: true }));
    } catch (err) {
      setError(err);
    } finally {
      setTabLoading(false);
    }
  }, []);

  const fetchClosures = useCallback(async () => {
    setTabLoading(true);
    setError(null);
    try {
      const closuresRes = await clinicApi.getClosures();
      setClosures(closuresRes || []);
      setLoadedTabs((prev) => ({ ...prev, closures: true }));
    } catch (err) {
      setError(err);
    } finally {
      setTabLoading(false);
    }
  }, []);

  // Fetch only active tab on demand
  useEffect(() => {
    if (activeTab === 'profile' && !loadedTabs.profile) {
      fetchProfile();
    } else if (activeTab === 'hours' && !loadedTabs.hours) {
      fetchHours();
    } else if (activeTab === 'closures' && !loadedTabs.closures) {
      fetchClosures();
    }
  }, [activeTab, loadedTabs, fetchProfile, fetchHours, fetchClosures]);

  // Save Clinic Profile
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaveSuccess('');
    try {
      await clinicApi.updateClinic(profileData);
      setSaveSuccess('Clinic parameters updated successfully.');
      refreshClinic();
    } catch (err) {
      setError(err);
    } finally {
      setSaving(false);
    }
  };

  // Toggle or Update Business Hours Day
  const handleHourChange = (index, field, value) => {
    setHours((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleSaveHours = async () => {
    setSaving(true);
    setError(null);
    setSaveSuccess('');
    try {
      const formatted = hours.map((h) => ({
        dayOfWeek: h.dayOfWeek,
        opensAt: h.opensAt,
        closesAt: h.closesAt,
        isClosed: Boolean(h.isClosed),
      }));
      await clinicApi.setBusinessHours(formatted);
      setSaveSuccess('Weekly opening hours updated successfully.');
      refreshClinic();
    } catch (err) {
      setError(err);
    } finally {
      setSaving(false);
    }
  };

  // Create Closure
  const handleCreateClosure = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await clinicApi.createClosure({
        startsAt: new Date(newClosure.startsAt).toISOString(),
        endsAt: new Date(newClosure.endsAt).toISOString(),
        reason: newClosure.reason.trim() || undefined,
      });
      setCreateClosureOpen(false);
      setNewClosure({ startsAt: '', endsAt: '', reason: '' });
      fetchClosures();
    } catch (err) {
      setError(err);
    } finally {
      setSaving(false);
    }
  };

  // Delete Closure
  const handleDeleteClosure = async () => {
    if (!deleteClosureTarget) return;
    setSaving(true);
    setError(null);
    try {
      await clinicApi.deleteClosure(deleteClosureTarget.id);
      setDeleteClosureTarget(null);
      fetchClosures();
    } catch (err) {
      setError(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        title="Clinic Configuration & Policies"
        description="Configure operational hours, booking horizons, timezone, and calendar closures (Admin Only)."
      />

      {error && <ErrorMessage error={error} onDismiss={() => setError(null)} />}

      {saveSuccess && (
        <div className="p-4 rounded-none bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold">{saveSuccess}</span>
          </div>
          <button
            type="button"
            onClick={() => setSaveSuccess('')}
            className="text-emerald-500 hover:text-emerald-700 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-300">
        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'profile'
              ? 'border-[#0F766E] text-[#0F766E]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          General & Booking Policies
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('hours')}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'hours'
              ? 'border-[#0F766E] text-[#0F766E]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Weekly Business Hours
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('closures')}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'closures'
              ? 'border-[#0F766E] text-[#0F766E]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Clinic Closures & Holidays {loadedTabs.closures ? `(${closures.length})` : ''}
        </button>
      </div>

      {/* Tab 1: General & Booking Policies */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="space-y-6">
          <div className="bg-white rounded-none border border-slate-300 p-6 sm:p-8 space-y-5">
            <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-200 uppercase tracking-wider text-xs text-slate-500">
              Clinic Contact & Identity
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Clinic Name"
                required
                value={profileData.name}
                onChange={(e) =>
                  setProfileData((p) => ({ ...p, name: e.target.value }))
                }
              />

              <Input
                label="IANA Timezone"
                required
                value={profileData.timezone}
                onChange={(e) =>
                  setProfileData((p) => ({ ...p, timezone: e.target.value }))
                }
                helperText="e.g. Africa/Cairo, Europe/London"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Telephone"
                value={profileData.phone}
                onChange={(e) =>
                  setProfileData((p) => ({ ...p, phone: e.target.value }))
                }
              />

              <Input
                label="Contact Email"
                type="email"
                value={profileData.email}
                onChange={(e) =>
                  setProfileData((p) => ({ ...p, email: e.target.value }))
                }
              />
            </div>

            <Input
              label="Physical Address"
              value={profileData.address}
              onChange={(e) =>
                setProfileData((p) => ({ ...p, address: e.target.value }))
              }
            />
          </div>

          <div className="bg-white rounded-none border border-slate-300 p-6 sm:p-8 space-y-5">
            <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-200 uppercase tracking-wider text-xs text-slate-500">
              Appointment Timing & Cancellation Rules
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Slot Duration (Minutes)"
                type="number"
                min={5}
                max={240}
                required
                value={profileData.defaultAppointmentDurationMinutes}
                onChange={(e) =>
                  setProfileData((p) => ({
                    ...p,
                    defaultAppointmentDurationMinutes: Number(e.target.value),
                  }))
                }
                helperText="Default slot duration for patient bookings"
              />

              <Input
                label="Booking Window (Days)"
                type="number"
                min={1}
                max={365}
                required
                value={profileData.bookingWindowDays}
                onChange={(e) =>
                  setProfileData((p) => ({
                    ...p,
                    bookingWindowDays: Number(e.target.value),
                  }))
                }
                helperText="Maximum days in advance a slot can be booked"
              />

              <Input
                label="Cancellation Cutoff (Minutes)"
                type="number"
                min={0}
                required
                value={profileData.cancellationCutoffMinutes}
                onChange={(e) =>
                  setProfileData((p) => ({
                    ...p,
                    cancellationCutoffMinutes: Number(e.target.value),
                  }))
                }
                helperText="e.g. 120 mins (2h) prior to visit start"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={saving}
              icon={Save}
            >
              Save Policy Changes
            </Button>
          </div>
        </form>
      )}

      {/* Tab 2: Weekly Business Hours */}
      {activeTab === 'hours' && (
        tabLoading && !loadedTabs.hours ? (
          <div className="bg-white rounded-none border border-slate-300 p-8 flex items-center justify-center text-slate-500 text-xs">
            Loading weekly business hours...
          </div>
        ) : (
        <div className="bg-white rounded-none border border-slate-300 p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Weekly Operating Shifts
              </h3>
              <p className="text-xs text-slate-500">
                Set opening and closing times for each day of the week.
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              icon={Save}
              loading={saving}
              onClick={handleSaveHours}
            >
              Save Working Hours
            </Button>
          </div>

          <div className="divide-y divide-slate-200">
            {hours.map((h, idx) => (
              <div
                key={idx}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
              >
                <div className="w-32 font-bold text-slate-900 text-sm">
                  {daysLabels[h.dayOfWeek] || `Day ${h.dayOfWeek}`}
                </div>

                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 select-none cursor-pointer">
                    <input
                      type="checkbox"
                      checked={h.isClosed}
                      onChange={(e) =>
                        handleHourChange(idx, 'isClosed', e.target.checked)
                      }
                      className="rounded-none border-slate-300 text-rose-600 focus:ring-rose-500"
                    />
                    <span className={h.isClosed ? 'font-bold text-rose-600' : 'text-slate-600'}>
                      Closed on this day
                    </span>
                  </label>
                </div>

                {!h.isClosed ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="time"
                      value={h.opensAt}
                      onChange={(e) =>
                        handleHourChange(idx, 'opensAt', e.target.value)
                      }
                      className="rounded-none border border-slate-300 px-2.5 py-1.5 text-xs text-slate-900"
                    />
                    <span className="text-slate-400">to</span>
                    <input
                      type="time"
                      value={h.closesAt}
                      onChange={(e) =>
                        handleHourChange(idx, 'closesAt', e.target.value)
                      }
                      className="rounded-none border border-slate-300 px-2.5 py-1.5 text-xs text-slate-900"
                    />
                  </div>
                ) : (
                  <div className="text-slate-400 italic">No slots generated</div>
                )}
              </div>
            ))}
          </div>
        </div>
        )
      )}

      {/* Tab 3: Clinic Closures & Holidays */}
      {activeTab === 'closures' && (
        tabLoading && !loadedTabs.closures ? (
          <div className="bg-white rounded-none border border-slate-300 p-8 flex items-center justify-center text-slate-500 text-xs">
            Loading clinic closures...
          </div>
        ) : (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button
              variant="primary"
              size="sm"
              icon={PlusCircle}
              onClick={() => setCreateClosureOpen(true)}
            >
              Add Closure / Holiday Block
            </Button>
          </div>

          <div className="bg-white rounded-none border border-slate-300 overflow-hidden">
            {closures.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No active calendar closures or holiday blocks recorded.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 text-xs">
                {closures.map((cl) => (
                  <div
                    key={cl.id}
                    className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors"
                  >
                    <div>
                      <div className="font-bold text-slate-900 text-sm">
                        {cl.reason || 'General Clinic Closure'}
                      </div>
                      <div className="text-slate-500 mt-0.5">
                        {new Date(cl.startsAt).toLocaleString()} –{' '}
                        {new Date(cl.endsAt).toLocaleString()}
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      icon={Trash2}
                      className="text-red-500 hover:text-red-700"
                      onClick={() => setDeleteClosureTarget(cl)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        )
      )}

      {/* Create Closure Modal */}
      <Modal
        isOpen={createClosureOpen}
        onClose={() => setCreateClosureOpen(false)}
        title="Add Clinic Closure / Holiday Block"
        description="Blocks appointment booking across the clinic during this specific period."
      >
        <form onSubmit={handleCreateClosure} className="space-y-4">
          <Input
            label="Start Date & Time"
            type="datetime-local"
            required
            value={newClosure.startsAt}
            onChange={(e) =>
              setNewClosure((prev) => ({ ...prev, startsAt: e.target.value }))
            }
          />

          <Input
            label="End Date & Time"
            type="datetime-local"
            required
            value={newClosure.endsAt}
            onChange={(e) =>
              setNewClosure((prev) => ({ ...prev, endsAt: e.target.value }))
            }
          />

          <Input
            label="Reason / Holiday Name"
            placeholder="e.g. National Holiday, Facility Maintenance..."
            value={newClosure.reason}
            onChange={(e) =>
              setNewClosure((prev) => ({ ...prev, reason: e.target.value }))
            }
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCreateClosureOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={saving}
            >
              Save Closure
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Closure Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteClosureTarget)}
        onClose={() => setDeleteClosureTarget(null)}
        onConfirm={handleDeleteClosure}
        title="Remove Closure Period"
        message={`Are you sure you want to remove the closure "${
          deleteClosureTarget?.reason || 'Closure'
        }"? Slots in this period will become bookable according to normal hours.`}
        confirmText="Remove Closure"
        variant="danger"
        loading={saving}
      />
    </div>
  );
}

export default DashboardSettingsPage;
