import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { patientsApi } from '../api/patientsApi';
import { prescriptionsApi } from '../api/prescriptionsApi';
import {
  FileText,
  Calendar,
  Stethoscope,
  ChevronRight,
  Printer,
  Pill,
} from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { StatusBadge } from '../components/common/StatusBadge';
import { Button } from '../components/common/Button';
import { EmptyState } from '../components/common/EmptyState';
import { Skeleton } from '../components/common/Skeleton';
import { ErrorMessage } from '../components/common/ErrorMessage';

export function MyPrescriptionsPage() {
  const { user } = useAuth();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPrescriptions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const patientId = user?.patientProfile?.id;
      if (patientId) {
        const res = await patientsApi.getPatientPrescriptions(patientId);
        setPrescriptions(res.prescriptions || []);
      } else {
        // Fallback for staff viewing patient view or general list
        const res = await prescriptionsApi.list();
        setPrescriptions(res.prescriptions || []);
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchPrescriptions();
  }, [fetchPrescriptions]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        title="My Prescriptions"
        description="Access verified clinical prescriptions, instructions, and print-ready medical records."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'My Prescriptions' }]}
      />

      {error && (
        <ErrorMessage
          error={error}
          onRetry={fetchPrescriptions}
          className="mb-4"
        />
      )}

      {loading ? (
        <div className="space-y-4">
          <Skeleton variant="card" count={3} />
        </div>
      ) : prescriptions.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No Prescriptions Issued"
          description="You do not have any prescriptions recorded yet. Prescriptions issued by your doctor following consultations will appear here."
          action={
            <Link to="/book-appointment">
              <Button variant="primary">Book a Consultation</Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {prescriptions.map((rx) => {
            const issuedDate = rx.issuedAt
              ? new Date(rx.issuedAt).toLocaleDateString([], {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })
              : 'Draft (Pending Issue)';

            const doctorName =
              rx.prescriber?.displayName ||
              (rx.prescriber?.staffProfile
                ? `Dr. ${rx.prescriber.staffProfile.firstName} ${rx.prescriber.staffProfile.lastName}`
                : 'Doctor');

            const itemCount = rx.items?.length || 0;

            return (
              <div
                key={rx.id}
                className="bg-white rounded-none border border-slate-300 p-5 hover:border-[#0F766E] transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-none bg-teal-50 border border-teal-200 text-[#0F766E] flex items-center justify-center font-serif text-2xl font-bold">
                      ℞
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-base">
                          Prescription #{rx.id.substring(0, 8)}
                        </span>
                        <StatusBadge status={rx.status} type="prescription" />
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                        <span>Issued: {issuedDate}</span>
                        {rx.validUntil && (
                          <span>
                            • Valid until:{' '}
                            {new Date(rx.validUntil).toLocaleDateString([], {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <Link to={`/my-prescriptions/${rx.id}`}>
                    <Button
                      variant="outline"
                      size="sm"
                      icon={ChevronRight}
                      iconPosition="right"
                    >
                      View & Print
                    </Button>
                  </Link>
                </div>

                <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Stethoscope className="w-4 h-4 text-[#0F766E] shrink-0" />
                    <span>Prescribed by: <strong className="text-slate-800">{doctorName}</strong></span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Pill className="w-4 h-4 text-[#0F766E] shrink-0" />
                    <span>
                      Medications: <strong className="text-slate-800">{itemCount} items</strong>
                    </span>
                  </div>
                </div>

                {rx.items && rx.items.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-200 flex flex-wrap gap-1.5">
                    {rx.items.map((med, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center px-2 py-0.5 rounded-none bg-slate-100 border border-slate-200 text-slate-700 text-[11px]"
                      >
                        {med.medicationName} ({med.dose})
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default MyPrescriptionsPage;
