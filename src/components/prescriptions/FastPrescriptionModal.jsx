import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { prescriptionsApi } from '../../api/prescriptionsApi';
import { MEDICATION_PRESETS } from '../../data/medicationTemplates';
import {
  FileSignature,
  Plus,
  Trash2,
  Zap,
  Printer,
  CheckCircle2,
  Clock,
  AlertCircle,
  Stethoscope,
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Textarea } from '../common/Textarea';
import { PatientSearch } from '../dashboard/PatientSearch';
import { ErrorMessage } from '../common/ErrorMessage';

export function FastPrescriptionModal({
  isOpen,
  onClose,
  initialPatient = null,
  initialAppointmentId = null,
  onSuccess = () => { },
}) {
  const { isDoctor } = useAuth();

  const [selectedPatient, setSelectedPatient] = useState(null);
  const [diagnosis, setDiagnosis] = useState('');
  const [instructions, setInstructions] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [items, setItems] = useState([]);

  // Derived effective patient: manually picked patient > initialPatient with id > null
  const currentPatient = selectedPatient || (initialPatient?.id ? initialPatient : null);

  const [activeCategory, setActiveCategory] = useState(MEDICATION_PRESETS[0].category);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [issuedResult, setIssuedResult] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setSelectedPatient(initialPatient?.id ? initialPatient : null);
      setDiagnosis('');
      setInstructions('');
      setValidUntil('');
      setItems([]);
      setError(null);
      setIssuedResult(null);
    }
  }, [isOpen, initialPatient]);

  // Add preset medication with 1 click
  const handleAddPreset = (presetItem) => {
    setItems((prev) => [
      ...prev,
      {
        medicationName: presetItem.medicationName,
        strength: presetItem.strength || '',
        form: presetItem.form || 'tablet',
        dose: presetItem.dose || '1 tablet',
        route: presetItem.route || 'oral',
        frequency: presetItem.frequency || 'Twice daily',
        duration: presetItem.duration || '7 days',
        quantity: presetItem.quantity || '1 box',
        refills: 0,
        instructions: presetItem.instructions || '',
      },
    ]);
  };

  // Add blank medication item
  const handleAddBlank = () => {
    setItems((prev) => [
      ...prev,
      {
        medicationName: '',
        strength: '',
        form: 'tablet',
        dose: '1 tablet',
        route: 'oral',
        frequency: 'Twice daily',
        duration: '5 days',
        quantity: '1 box',
        refills: 0,
        instructions: '',
      },
    ]);
  };

  const handleRemoveItem = (index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleItemChange = (index, field, value) => {
    setItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  // Submit Handler (draft or immediate issue)
  const handleSubmit = async (shouldIssueImmediately = false) => {
    setError(null);

    if (!currentPatient?.id) {
      setError({ message: 'Please select a patient before issuing.' });
      return;
    }

    if (items.length === 0) {
      setError({ message: 'Please add at least one medication item (click any preset below).' });
      return;
    }

    for (let i = 0; i < items.length; i++) {
      if (!items[i].medicationName.trim() || !items[i].dose.trim() || !items[i].frequency.trim()) {
        setError({ message: `Medication #${i + 1} requires Name, Dose, and Frequency.` });
        return;
      }
    }

    setLoading(true);

    try {
      const payload = {
        patientId: currentPatient.id,
        appointmentId: initialAppointmentId || undefined,
        diagnosisOrIndication: diagnosis.trim() || undefined,
        instructions: instructions.trim() || undefined,
        validUntil: validUntil ? new Date(validUntil).toISOString() : undefined,
        items: items.map((it, idx) => ({
          ...it,
          sortOrder: idx,
        })),
      };

      const createdDraft = await prescriptionsApi.createDraft(payload);

      if (shouldIssueImmediately && isDoctor) {
        // Step 2: Issue immediately
        await prescriptionsApi.issue(createdDraft.id);
        const fullRx = await prescriptionsApi.getById(createdDraft.id);
        setIssuedResult(fullRx);
        onSuccess(fullRx);
      } else {
        onSuccess(createdDraft);
        onClose();
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        isDoctor
          ? '⚡ Rapid Physician Prescription Desk'
          : 'Prepare Prescription Draft'
      }
      description="Quick presets and 1-click issuance for high-volume consultations."
      maxWidth="max-w-4xl"
    >
      {issuedResult ? (
        <div className="py-6 text-center space-y-5">
          <div className="w-12 h-12 bg-emerald-100 border border-emerald-300 text-emerald-800 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div>
            <h3 className="text-lg font-bold text-slate-900 uppercase">
              Prescription Issued Successfully!
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Prescription #{issuedResult.id?.substring(0, 8)} is verified and ready for the patient.
            </p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-300 max-w-md mx-auto text-left text-xs space-y-1.5 font-mono">
            <div>Patient: <strong className="text-slate-900">{currentPatient?.firstName} {currentPatient?.lastName}</strong> ({currentPatient?.patientNumber})</div>
            <div>Medications: {issuedResult.items?.length || items.length} prescribed</div>
            <div>Status: <span className="text-emerald-700 font-bold">ISSUED</span></div>
          </div>

          <div className="flex items-center justify-center gap-3 pt-3">
            <a
              href={`/my-prescriptions/${issuedResult.id}`}
              target="_blank"
              rel="noreferrer"
            >
              <Button variant="primary" icon={Printer}>
                Print Prescription Sheet
              </Button>
            </a>
            <Button variant="outline" onClick={onClose}>
              Done & Return
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          {error && <ErrorMessage error={error} onDismiss={() => setError(null)} />}

          {/* Patient Selection Row */}
          {currentPatient ? (
            <div className="p-3 bg-slate-100 border border-slate-300 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-500 uppercase">Patient:</span>
                <span className="font-bold text-slate-900 text-sm">
                  {currentPatient?.firstName || ''} {currentPatient?.lastName || ''}
                </span>
                {currentPatient?.patientNumber && (
                  <span className="font-mono text-teal-800 bg-teal-50 px-1.5 py-0.5 border border-teal-300 font-bold">
                    {currentPatient.patientNumber}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {initialAppointmentId && (
                  <span className="text-slate-500 text-[11px]">
                    Linked to Consultation Visit
                  </span>
                )}
                {!initialPatient?.id && (
                  <button
                    type="button"
                    onClick={() => setSelectedPatient(null)}
                    className="text-xs text-slate-600 hover:text-slate-900 underline cursor-pointer ml-2"
                  >
                    Change
                  </button>
                )}
              </div>
            </div>
          ) : (
            <PatientSearch
              label="Select Patient"
              selectedPatient={currentPatient}
              onSelectPatient={(p) => setSelectedPatient(p)}
              onClear={() => setSelectedPatient(null)}
              required
            />
          )}

          {/* Quick Preset Medications Bar */}
          <div className="bg-slate-50 border border-slate-300 p-3 space-y-2">
            <div className="flex items-center justify-between pb-1 border-b border-slate-200">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-[#0F766E]" />
                1-Click Medication Templates (Click to Add)
              </span>
              <div className="flex items-center gap-1">
                {MEDICATION_PRESETS.map((cat) => (
                  <button
                    key={cat.category}
                    type="button"
                    onClick={() => setActiveCategory(cat.category)}
                    className={`text-[10px] px-2 py-0.5 border font-semibold transition-colors cursor-pointer ${activeCategory === cat.category
                      ? 'bg-[#0F766E] text-white border-[#0F766E]'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                  >
                    {cat.category.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Presets in active category */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {MEDICATION_PRESETS.find((c) => c.category === activeCategory)?.items.map(
                (preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleAddPreset(preset)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs bg-white hover:bg-teal-50 border border-slate-300 hover:border-[#0F766E] text-slate-800 transition-colors cursor-pointer text-left"
                    title={`Click to add ${preset.medicationName} (${preset.dose}, ${preset.frequency})`}
                  >
                    <Plus className="w-3 h-3 text-[#0F766E]" />
                    <span className="font-bold">{preset.medicationName}</span>
                    <span className="text-slate-500 text-[11px]">{preset.strength}</span>
                  </button>
                )
              )}
            </div>
          </div>

          {/* Prescribed Items Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                Prescription Items ({items.length})
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                icon={Plus}
                onClick={handleAddBlank}
              >
                Add Custom Drug
              </Button>
            </div>

            {items.length === 0 ? (
              <div className="p-6 text-center border-2 border-dashed border-slate-300 bg-white text-xs text-slate-500">
                Click any template medication above or "Add Custom Drug" to start.
              </div>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {items.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-white border border-slate-300 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                      <span className="font-bold text-[#0F766E]">
                        Rx #{idx + 1}: {item.medicationName || 'Medication'}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="text-red-500 hover:text-red-700 p-1"
                        title="Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                      <div className="sm:col-span-2">
                        <input
                          type="text"
                          placeholder="Drug Name (e.g. Amoxicillin)"
                          value={item.medicationName}
                          onChange={(e) =>
                            handleItemChange(idx, 'medicationName', e.target.value)
                          }
                          className="w-full border border-slate-300 px-2 py-1.5 text-xs text-slate-900 font-semibold focus:outline-none focus:border-[#0F766E]"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          placeholder="Strength (e.g. 500mg)"
                          value={item.strength}
                          onChange={(e) =>
                            handleItemChange(idx, 'strength', e.target.value)
                          }
                          className="w-full border border-slate-300 px-2 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-[#0F766E]"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          placeholder="Form (e.g. tab, syrup)"
                          value={item.form}
                          onChange={(e) => handleItemChange(idx, 'form', e.target.value)}
                          className="w-full border border-slate-300 px-2 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-[#0F766E]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <div>
                        <input
                          type="text"
                          placeholder="Dose (e.g. 1 tablet)"
                          value={item.dose}
                          onChange={(e) => handleItemChange(idx, 'dose', e.target.value)}
                          className="w-full border border-slate-300 px-2 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-[#0F766E]"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          placeholder="Frequency (e.g. Twice daily)"
                          value={item.frequency}
                          onChange={(e) =>
                            handleItemChange(idx, 'frequency', e.target.value)
                          }
                          className="w-full border border-slate-300 px-2 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-[#0F766E]"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          placeholder="Duration (e.g. 7 days)"
                          value={item.duration}
                          onChange={(e) =>
                            handleItemChange(idx, 'duration', e.target.value)
                          }
                          className="w-full border border-slate-300 px-2 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-[#0F766E]"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          placeholder="Directions / Meal instructions"
                          value={item.instructions}
                          onChange={(e) =>
                            handleItemChange(idx, 'instructions', e.target.value)
                          }
                          className="w-full border border-slate-300 px-2 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-[#0F766E]"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">

                      <div className="col-span-3">
                        <input
                          label="Instructions / Meal instructions"
                          placeholder="instructions e.g. 3 times daily after meals"
                          value={item.instructions}
                          onChange={(e) =>
                            handleItemChange(idx, 'instructions', e.target.value)
                          }
                          className="w-full border border-slate-300 px-2 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-[#0F766E]"
                        />
                      </div>

                      <div>
                        <input
                          type="text"
                          placeholder="Route"
                          value={item.route}
                          onChange={(e) =>
                            handleItemChange(idx, 'route', e.target.value)
                          }
                          className="w-full border border-slate-300 px-2 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-[#0F766E]"
                        />
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Diagnosis & Instructions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Diagnosis / Clinical Indication (Optional)"
              placeholder="e.g. Pharyngitis, Gastritis, URI..."
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
            />
            <Input
              label="General Doctor Advice (Optional)"
              placeholder="e.g. Plenty of rest, avoid cold drinks..."
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-300">
            <Button variant="ghost" size="sm" onClick={onClose} disabled={loading}>
              Cancel
            </Button>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                size="md"
                onClick={() => handleSubmit(false)}
                disabled={loading}
                className="w-full sm:w-auto"
              >
                Save as Draft
              </Button>

              {isDoctor && (
                <Button
                  variant="primary"
                  size="md"
                  icon={Zap}
                  onClick={() => handleSubmit(true)}
                  loading={loading}
                  className="w-full sm:w-auto bg-[#0F766E] hover:bg-[#115E59] font-bold"
                >
                  ⚡ Save & Issue Now
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}

export default FastPrescriptionModal;
