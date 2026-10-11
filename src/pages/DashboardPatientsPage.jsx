import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { patientsApi } from '../api/patientsApi';
import {
  Users,
  Search,
  CalendarPlus,
  FileSignature,
  Eye,
  RefreshCw,
  Phone,
  Mail,
  User,
  Zap,
} from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Pagination } from '../components/common/Pagination';
import { Skeleton } from '../components/common/Skeleton';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { FastPrescriptionModal } from '../components/prescriptions/FastPrescriptionModal';

export function DashboardPatientsPage() {
  const { isDoctor } = useAuth();
  const [patients, setPatients] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quickRxOpen, setQuickRxOpen] = useState(false);
  const [quickRxPatient, setQuickRxPatient] = useState(null);

  const fetchPatients = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await patientsApi.searchPatients({
        search: searchQuery.trim() || undefined,
        page,
        limit: 20,
      });
      setPatients(res.patients || []);
      setMeta(res.meta || null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, page]);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchPatients();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Patient Directory"
        description="Search, view clinical history, and manage registered clinic patients."
        actions={
          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            onClick={fetchPatients}
            loading={loading}
          >
            Refresh
          </Button>
        }
      />

      {error && <ErrorMessage error={error} onDismiss={() => setError(null)} />}

      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} className="bg-white rounded-none border border-slate-300 p-4">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex-1 w-full">
            <Input
              placeholder="Search by first/last name, phone number, or patient ID..."
              leftIcon={Search}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button type="submit" variant="primary" icon={Search} className="w-full sm:w-auto">
              Search
            </Button>
            {searchQuery && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery('');
                  setPage(1);
                }}
              >
                Clear
              </Button>
            )}
          </div>
        </div>
      </form>

      {/* Table */}
      {loading ? (
        <div className="bg-white rounded-none border border-slate-300 p-6">
          <Skeleton variant="card" count={3} />
        </div>
      ) : patients.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No Patients Found"
          description={
            searchQuery
              ? `No patient records matched "${searchQuery}".`
              : 'There are currently no patient profiles in the database.'
          }
        />
      ) : (
        <div className="bg-white rounded-none border border-slate-300 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Patient ID</th>
                  <th className="py-3.5 px-4">Patient Name</th>
                  <th className="py-3.5 px-4">Phone</th>
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4">Registered</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {patients.map((p) => {
                  const regDate = p.createdAt
                    ? new Date(p.createdAt).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : '-';

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-mono text-xs font-bold text-[#0F766E] bg-teal-50 px-2 py-1 rounded-none border border-teal-200">
                          {p.patientNumber}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap font-medium text-slate-900">
                        {p.firstName} {p.lastName}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-600 text-xs">
                        {p.phone || <span className="text-slate-300 italic">None</span>}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-600 text-xs">
                        {p.email || <span className="text-slate-300 italic">None</span>}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-500 text-xs">
                        {regDate}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isDoctor && (
                            <Button
                              variant="primary"
                              size="sm"
                              icon={Zap}
                              onClick={() => {
                                setQuickRxPatient(p);
                                setQuickRxOpen(true);
                              }}
                              className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold"
                              title="Write and issue prescription for this patient"
                            >
                              New Rx
                            </Button>
                          )}
                          <Link to={`/dashboard/patients/${p.id}`}>
                            <Button variant="outline" size="sm" icon={Eye}>
                              Profile
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
              totalItems={meta.total || patients.length}
              pageSize={20}
              onPageChange={(newPage) => setPage(newPage)}
            />
          )}
        </div>
      )}

      {/* Fast Prescription Modal */}
      <FastPrescriptionModal
        isOpen={quickRxOpen}
        onClose={() => {
          setQuickRxOpen(false);
          setQuickRxPatient(null);
        }}
        initialPatient={quickRxPatient}
        onSuccess={() => {
          setQuickRxOpen(false);
          setQuickRxPatient(null);
          fetchPatients();
        }}
      />
    </div>
  );
}

export default DashboardPatientsPage;
