import React from 'react';
import { Printer, Activity, ShieldCheck, Calendar, FileText } from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';
import { Button } from '../common/Button';

export function PrescriptionDocument({ prescription, showPrintButton = true, clinic: clinicData }) {
  if (!prescription) return null;

  const handlePrint = () => {
    window.print();
  };


  const clinic = prescription.clinic || {
    name: clinicData?.name || 'Central City Clinic',
    address: clinicData?.address || '100 Medical Plaza, Cairo, Egypt',
    phone: clinicData?.phone || '+201011112222',
    email: clinicData?.email || 'info@centralcityclinic.example.com',
  };

  const patient = prescription.patient;
  const prescriber = prescription.prescriber;
  const prescriberStaff = prescriber?.staffProfile;

  const doctorName =
    prescriber?.displayName ||
    (prescriberStaff
      ? `Dr. ${prescriberStaff.firstName} ${prescriberStaff.lastName}`
      : 'Authorised Clinician');

  const doctorTitle = prescriber?.professionalTitle || prescriberStaff?.jobTitle || 'Medical Practitioner';
  const licenseNumber = prescriber?.licenseNumber;

  const issuedDate = prescription.issuedAt
    ? new Date(prescription.issuedAt).toLocaleDateString([], {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
    : 'Pending Issuance (Draft)';

  const validUntilDate = prescription.validUntil
    ? new Date(prescription.validUntil).toLocaleDateString([], {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
    : null;

  const items = prescription.items || [];

  return (
    <div className="space-y-4">
      {showPrintButton && (
        <div className="flex justify-end no-print">
          <Button
            variant="outline"
            size="sm"
            icon={Printer}
            onClick={handlePrint}
            className="shadow-xs"
          >
            Print Prescription
          </Button>
        </div>
      )}

      {/* Official Medical Prescription Sheet */}
      <div className="print-prescription-card bg-white rounded-none border border-slate-400 p-8 font-sans text-slate-900 max-w-3xl mx-auto">
        {/* Clinic Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between pb-6 border-b-2 border-[#0F766E] gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-none bg-[#0F766E] text-white flex items-center justify-center shrink-0">
              <Activity className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900">
                {clinic.name}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">{clinic.address}</p>
              <div className="text-xs text-slate-500 flex items-center gap-3 mt-1">
                {clinic.phone && <span>Tel: {clinic.phone}</span>}
                {clinic.email && <span>• Email: {clinic.email}</span>}
              </div>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <StatusBadge status={prescription.status} type="prescription" />
            <div className="text-[11px] font-mono text-slate-400 mt-2">
              Rx ID: {prescription.id?.substring(0, 8)}...
            </div>
            {prescription.revisionNumber > 1 && (
              <div className="text-[11px] text-amber-600 font-medium">
                Revision #{prescription.revisionNumber}
              </div>
            )}
          </div>
        </div>

        {/* Doctor & Patient Metadata Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-6 border-b border-slate-200 text-xs">
          {/* Doctor Info */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Prescribing Clinician
            </span>
            <div className="text-sm font-bold text-slate-900">{doctorName}</div>
            <div className="text-slate-600 font-medium">{doctorTitle}</div>
            {licenseNumber && (
              <div className="text-slate-500">License: {licenseNumber}</div>
            )}
          </div>

          {/* Patient Info */}
          <div className="space-y-1 sm:text-right">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Patient Information
            </span>
            <div className="text-sm font-bold text-slate-900">
              {patient?.firstName} {patient?.lastName}
            </div>
            <div className="text-slate-600">
              Patient ID: <span className="font-mono font-medium">{patient?.patientNumber}</span>
            </div>
            {patient?.phone && (
              <div className="text-slate-500">Phone: {patient.phone}</div>
            )}
          </div>
        </div>

        {/* Date Row */}
        <div className="flex flex-wrap items-center justify-between py-3 border-b border-slate-100 text-xs text-slate-600">
          <div>
            <span className="font-medium text-slate-700">Issued On: </span>
            <span>{issuedDate}</span>
          </div>
          {validUntilDate && (
            <div>
              <span className="font-medium text-slate-700">Valid Until: </span>
              <span className="text-emerald-700 font-medium">{validUntilDate}</span>
            </div>
          )}
        </div>

        {/* Diagnosis / Indication (if recorded) */}
        {prescription.diagnosisOrIndication && (
          <div className="py-4 border-b border-slate-100 text-xs">
            <span className="font-bold text-slate-700 block mb-1">
              Diagnosis / Clinical Indication:
            </span>
            <p className="text-slate-800 bg-slate-50 p-2.5 rounded-none border border-slate-300">
              {prescription.diagnosisOrIndication}
            </p>
          </div>
        )}

        {/* Rx Medication Items */}
        <div className="py-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl font-serif font-black text-[#0F766E]">℞</span>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Prescribed Medications
            </h3>
          </div>

          {items.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No medication items entered.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase font-semibold">
                    <th className="py-2 pr-3">#</th>
                    <th className="py-2 pr-3">Medication & Strength</th>
                    <th className="py-2 pr-3">Form</th>
                    <th className="py-2 pr-3">Dose & Route</th>
                    <th className="py-2 pr-3">Frequency</th>
                    <th className="py-2 pr-3">Duration / Qty</th>
                    <th className="py-2">Instructions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item, idx) => (
                    <tr key={item.id || idx} className="align-top">
                      <td className="py-3 pr-3 text-slate-400 font-medium">{idx + 1}</td>
                      <td className="py-3 pr-3">
                        <span className="font-bold text-slate-900 block text-sm">
                          {item.medicationName}
                        </span>
                        {item.strength && (
                          <span className="text-slate-500 text-[11px]">{item.strength}</span>
                        )}
                      </td>
                      <td className="py-3 pr-3 text-slate-700">{item.form || '-'}</td>
                      <td className="py-3 pr-3 text-slate-800 font-medium">
                        {item.dose} {item.route ? `(${item.route})` : ''}
                      </td>
                      <td className="py-3 pr-3 text-slate-800">{item.frequency}</td>
                      <td className="py-3 pr-3 text-slate-700">
                        {item.duration || item.quantity || '-'}
                        {item.refills > 0 && (
                          <span className="block text-[10px] text-teal-700 font-semibold">
                            Refills: {item.refills}
                          </span>
                        )}
                      </td>
                      <td className="py-3 text-slate-600 italic">
                        {item.instructions || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* General Instructions */}
        {prescription.instructions && (
          <div className="py-4 border-t border-slate-100 text-xs">
            <span className="font-bold text-slate-700 block mb-1">
              General Doctor Instructions:
            </span>
            <p className="text-slate-700 leading-relaxed bg-teal-50/40 p-3 rounded-none border border-teal-200">
              {prescription.instructions}
            </p>
          </div>
        )}

        {/* Footer Signature & Legal Stamp */}
        <div className="mt-8 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-end justify-between gap-6 text-xs text-slate-500">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-[#0F766E] font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>Electronically Issued Clinical Record</span>
            </div>
            <p className="text-[10px] text-slate-400 max-w-xs">
              This prescription is valid only for the named patient. Any alterations
              render it invalid.
            </p>
          </div>

          <div className="text-center sm:text-right w-48">
            <div className="h-10 border-b border-slate-400 border-dashed mb-1" />
            <div className="font-bold text-slate-800 text-xs">{doctorName}</div>
            <div className="text-[10px] text-slate-400">Authorized Signature & Stamp</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PrescriptionDocument;
