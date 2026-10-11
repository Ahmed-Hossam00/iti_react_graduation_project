import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { prescriptionsApi } from '../api/prescriptionsApi';
import { PageHeader } from '../components/common/PageHeader';
import { PrescriptionDocument } from '../components/prescriptions/PrescriptionDocument';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { Button } from '../components/common/Button';
import { useClinic } from '../context/ClinicContext';

export function PrescriptionDetailPage() {
  const { prescriptionId } = useParams();
  const [prescription, setPrescription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { clinic } = useClinic();

  const fetchPrescription = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await prescriptionsApi.getById(prescriptionId);
      setPrescription(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [prescriptionId]);

  useEffect(() => {
    fetchPrescription();
  }, [fetchPrescription]);

  if (loading) {
    return <LoadingSpinner fullPage message="Loading official prescription record..." />;
  }

  if (error || !prescription) {
    return (
      <div className="max-w-xl mx-auto py-10">
        <ErrorMessage
          title="Prescription not accessible"
          error={error || 'Could not find this prescription.'}
          onRetry={fetchPrescription}
        />
        <div className="mt-4 text-center">
          <Link to="/my-prescriptions">
            <Button variant="outline">Back to Prescriptions</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="no-print">
        <PageHeader
          title={`Prescription Record #${prescription.id.substring(0, 8)}`}
          description="Official verified medical prescription from Central City Clinic"
          backTo="/my-prescriptions"
          backLabel="All Prescriptions"
        />
      </div>

      <PrescriptionDocument prescription={prescription} showPrintButton={true} clinic={clinic} />
    </div>
  );
}

export default PrescriptionDetailPage;
