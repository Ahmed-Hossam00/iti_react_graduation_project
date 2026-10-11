import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { prescriptionsApi } from '../api/prescriptionsApi';
import { patientsApi } from '../api/patientsApi';
import {
  FileSignature,
  PlusCircle,
  RefreshCw,
  Printer,
  CheckCircle2,
  XCircle,
  FileEdit,
  Zap,
} from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { StatusBadge } from '../components/common/StatusBadge';
import { Button } from '../components/common/Button';
import { Textarea } from '../components/common/Textarea';
import { Pagination } from '../components/common/Pagination';
import { Skeleton } from '../components/common/Skeleton';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { Modal } from '../components/common/Modal';
import { FastPrescriptionModal } from '../components/prescriptions/FastPrescriptionModal';

export function DashboardPrescriptionsPage() {
  const { isDoctor, isAdmin } = useAuth();
  const [searchParams] = useSearchParams();

  const [prescriptions, setPrescriptions] = useState([]);
  const [filterStatus, setFilterStatus] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fast Prescription Modal state
  const [fastModalOpen, setFastModalOpen] = useState(false);
  const [selectedPatientForRx, setSelectedPatientForRx] = useState(null);

  // Revoke modal state
  const [revokeTarget, setRevokeTarget] = useState(null);
  const [revokeReason, setRevokeReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState(null);

  const fetchPrescriptions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await prescriptionsApi.list({
        status: filterStatus || undefined,
        page,
        limit: 20,
      });
      setPrescriptions(res.prescriptions || []);
      setMeta(res.meta || null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [filterStatus, page]);

  useEffect(() => {
    fetchPrescriptions();
  }, [fetchPrescriptions]);

  // If query string has createFor patientId
  useEffect(() => {
    const preselectedPatientId = searchParams.get('createFor');
    if (preselectedPatientId) {
      patientsApi
        .getPatientById(preselectedPatientId)
        .then((p) => {
          setSelectedPatientForRx(p);
          setFastModalOpen(true);
        })
        .catch(() => {});
    }
  }, [searchParams]);

  // Issue Prescription (Doctor only)
  const handleIssue = async (prescriptionId) => {
    try {
      await prescriptionsApi.issue(prescriptionId);
      fetchPrescriptions();
    } catch (err) {
      setError(err);
    }
  };

  // Revoke Prescription
  const handleRevokeSubmit = async () => {
    if (!revokeTarget || !revokeReason.trim()) return;
    setActionLoading(true);
    setActionError(null);
    try {
      await prescriptionsApi.revoke(revokeTarget.id, revokeReason.trim());
      setRevokeTarget(null);
      setRevokeReason('');
      fetchPrescriptions();
    } catch (err) {
      setActionError(err);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Prescription Management"
        description="Rapid 1-click clinical presets, instant authorization issuance, and official print formatting."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={RefreshCw}
              onClick={fetchPrescriptions}
              loading={loading}
            >
              Refresh
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={Zap}
              onClick={() => {
                setSelectedPatientForRx(null);
                setFastModalOpen(true);
              }}
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold"
            >
              ⚡ Fast Prescription (1-Click)
            </Button>
          </div>
        }
      />

      {error && <ErrorMessage error={error} onDismiss={() => setError(null)} />}

      {/* Filter Bar */}
      <div className="bg-white rounded-none border border-slate-300 p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {['', 'DRAFT', 'ISSUED', 'REVOKED'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => {
                setFilterStatus(st);
                setPage(1);
              }}
              className={`text-xs px-3 py-1.5 rounded-none font-semibold uppercase tracking-wider transition-colors cursor-pointer border ${
                filterStatus === st
                  ? 'bg-[#0F766E] text-white border-[#0F766E]'
                  : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
              }`}
            >
              {st === '' ? 'All Prescriptions' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Prescriptions Table */}
      {loading ? (
        <div className="bg-white rounded-none border border-slate-300 p-6">
          <Skeleton variant="card" count={3} />
        </div>
      ) : prescriptions.length === 0 ? (
        <EmptyState
          icon={FileSignature}
          title="No Prescriptions Found"
          description="There are currently no prescription records matching this filter."
          action={
            <Button
              variant="primary"
              icon={Zap}
              onClick={() => {
                setSelectedPatientForRx(null);
                setFastModalOpen(true);
              }}
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold"
            >
              Create Rapid Prescription
            </Button>
          }
        />
      ) : (
        <div className="bg-white rounded-none border border-slate-300 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Rx Number</th>
                  <th className="py-3.5 px-4">Patient</th>
                  <th className="py-3.5 px-4">Prescriber</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Date & Validity</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {prescriptions.map((rx) => {
                  const issuedDate = rx.issuedAt
                    ? new Date(rx.issuedAt).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : 'Draft';

                  const doctorName =
                    rx.prescriber?.displayName ||
                    (rx.prescriber?.staffProfile
                      ? `Dr. ${rx.prescriber.staffProfile.firstName} ${rx.prescriber.staffProfile.lastName}`
                      : 'Doctor');

                  return (
                    <tr key={rx.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 whitespace-nowrap font-mono text-xs font-bold text-slate-800">
                        #{rx.id.substring(0, 8)}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-semibold text-slate-900">
                          {rx.patient?.firstName} {rx.patient?.lastName}
                        </div>
                        <div className="text-xs text-slate-400 font-mono">
                          {rx.patient?.patientNumber}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap text-xs text-slate-700 font-medium">
                        {doctorName}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <StatusBadge status={rx.status} type="prescription" />
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap text-xs text-slate-600">
                        <div>Issued: {issuedDate}</div>
                        {rx.validUntil && (
                          <div className="text-slate-400">
                            Valid to: {new Date(rx.validUntil).toLocaleDateString()}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Issue Prescription (Doctor strictly) */}
                          {rx.status === 'DRAFT' && isDoctor && (
                            <Button
                              variant="primary"
                              size="sm"
                              icon={CheckCircle2}
                              onClick={() => handleIssue(rx.id)}
                              className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold"
                            >
                              Issue Rx
                            </Button>
                          )}

                          {/* Revoke (Doctor or Admin) */}
                          {rx.status === 'ISSUED' && (isDoctor || isAdmin) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              icon={XCircle}
                              onClick={() => {
                                setRevokeTarget(rx);
                                setRevokeReason('');
                              }}
                              className="text-red-500 hover:text-red-700"
                            >
                              Revoke
                            </Button>
                          )}

                          {/* View & Print Document */}
                          <Link to={`/my-prescriptions/${rx.id}`}>
                            <Button variant="outline" size="sm" icon={Printer} title="View & Print Document">
                              Print
                            </Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {meta && (
            <Pagination
              page={page}
              totalPages={meta.totalPages || 1}
              totalItems={meta.total || prescriptions.length}
              pageSize={20}
              onPageChange={(newPage) => setPage(newPage)}
            />
          )}
        </div>
      )}

      {/* Rapid Prescription Modal with 1-click clinical templates */}
      <FastPrescriptionModal
        isOpen={fastModalOpen}
        onClose={() => setFastModalOpen(false)}
        initialPatient={selectedPatientForRx}
        onSuccess={() => {
          setFastModalOpen(false);
          fetchPrescriptions();
        }}
      />

      {/* Revoke Modal */}
      <Modal
        isOpen={Boolean(revokeTarget)}
        onClose={() => setRevokeTarget(null)}
        title="Revoke Issued Prescription"
        description="Revoking an issued prescription requires documenting the clinical or administrative reason."
      >
        <div className="space-y-4">
          {actionError && <ErrorMessage error={actionError} />}
          <Textarea
            label="Revocation Reason"
            required
            rows={3}
            placeholder="e.g. Medication contraindication identified, superseded by new treatment regimen..."
            value={revokeReason}
            onChange={(e) => setRevokeReason(e.target.value)}
          />
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRevokeTarget(null)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              loading={actionLoading}
              onClick={handleRevokeSubmit}
            >
              Confirm Revocation
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default DashboardPrescriptionsPage;
