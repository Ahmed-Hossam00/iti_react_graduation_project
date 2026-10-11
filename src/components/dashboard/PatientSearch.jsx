import React, { useState, useEffect } from 'react';
import { Search, User, Phone, X, Loader2 } from 'lucide-react';
import { patientsApi } from '../../api/patientsApi';

export function PatientSearch({
  onSelectPatient,
  selectedPatient = null,
  onClear = null,
  label = 'Search Patient',
  placeholder = 'Type patient name, phone, or PAT#...',
  required = false,
  className = '',
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await patientsApi.searchPatients({ search: query.trim(), limit: 5 });
        setResults(res.patients || []);
        setDropdownOpen(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (patient) => {
    onSelectPatient(patient);
    setQuery('');
    setResults([]);
    setDropdownOpen(false);
  };

  const handleClear = () => {
    if (onClear) onClear();
    setQuery('');
    setResults([]);
  };

  return (
    <div className={`relative w-full ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-slate-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {selectedPatient ? (
        <div className="flex items-center justify-between p-3 rounded-none border border-teal-200 bg-teal-50/60 text-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-none bg-[#0F766E] text-white flex items-center justify-center font-bold text-xs">
              {selectedPatient.firstName?.[0]}
              {selectedPatient.lastName?.[0]}
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-900">
                {selectedPatient.firstName} {selectedPatient.lastName}
              </div>
              <div className="text-xs text-slate-500 flex items-center gap-2">
                <span>{selectedPatient.patientNumber}</span>
                {selectedPatient.phone && <span>• {selectedPatient.phone}</span>}
              </div>
            </div>
          </div>

          {onClear && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded-none text-slate-400 hover:text-slate-700 hover:bg-slate-200/50"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      ) : (
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin text-[#0F766E]" />
            ) : (
              <Search className="w-4 h-4" />
            )}
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => results.length > 0 && setDropdownOpen(true)}
            placeholder={placeholder}
            className="block w-full rounded-none border border-slate-300 text-sm transition-colors pl-9 pr-3.5 py-2.5 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#0F766E] focus:border-[#0F766E]"
          />

          {dropdownOpen && results.length > 0 && (
            <div className="absolute z-20 left-0 right-0 mt-1 bg-white rounded-none border border-slate-300 max-h-60 overflow-y-auto">
              {results.map((p) => (
                <div
                  key={p.id}
                  onClick={() => handleSelect(p)}
                  className="px-4 py-3 hover:bg-teal-50 cursor-pointer border-b border-slate-50 last:border-b-0 transition-colors"
                >
                  <div className="text-sm font-medium text-slate-900">
                    {p.firstName} {p.lastName}
                  </div>
                  <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                    <span className="font-mono text-teal-700">{p.patientNumber}</span>
                    {p.phone && <span>• {p.phone}</span>}
                    {p.email && <span>• {p.email}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default PatientSearch;
