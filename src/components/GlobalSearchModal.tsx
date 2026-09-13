import React, { useState, useEffect } from 'react';
import {
  Search,
  X,
  FileText,
  Pill,
  Clock,
  User,
  Activity,
  ArrowRight,
} from 'lucide-react';
import {
  FamilyMember,
  MedicalDocument,
  Medication,
  MedicalCondition,
  TimelineEvent,
} from '../types';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: FamilyMember[];
  documents: MedicalDocument[];
  medications: Medication[];
  conditions: MedicalCondition[];
  timeline: TimelineEvent[];
  onSelectMember: (member: FamilyMember) => void;
  onViewReport: (doc: MedicalDocument) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  members,
  documents,
  medications,
  conditions,
  timeline,
  onSelectMember,
  onViewReport,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!isOpen) return null;

  const q = searchQuery.toLowerCase().trim();

  // Search matches
  const matchedDocs = q
    ? documents.filter(
        (d) =>
          d.title.toLowerCase().includes(q) ||
          d.facility.toLowerCase().includes(q) ||
          d.doctor.toLowerCase().includes(q) ||
          d.aiSummary.toLowerCase().includes(q) ||
          d.extractedData.labResults.some((l) => l.name.toLowerCase().includes(q))
      )
    : [];

  const matchedMeds = q
    ? medications.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.reason.toLowerCase().includes(q) ||
          m.prescribingDoctor.toLowerCase().includes(q)
      )
    : [];

  const matchedConditions = q
    ? conditions.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.notes.toLowerCase().includes(q) ||
          c.treatingDoctor.toLowerCase().includes(q)
      )
    : [];

  const matchedMembers = q
    ? members.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.bloodType.toLowerCase().includes(q) ||
          m.relationship.toLowerCase().includes(q)
      )
    : [];

  const totalResults =
    matchedDocs.length + matchedMeds.length + matchedConditions.length + matchedMembers.length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Search Input */}
        <div className="p-4 border-b border-slate-200 flex items-center gap-3">
          <Search className="w-5 h-5 text-slate-400 flex-shrink-0" />
          <input
            type="text"
            autoFocus
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search all records, medications, conditions, doctors, or lab tests (e.g. 'HbA1c', 'Metformin', 'kidney')..."
            className="flex-1 text-sm bg-transparent focus:outline-none placeholder-slate-400 text-slate-900"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded text-xs font-semibold"
          >
            ESC
          </button>
        </div>

        {/* Results Area */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4 text-xs">
          {!q && (
            <div className="py-8 text-center text-slate-400 space-y-2">
              <p>Type keywords to search the entire family health archive.</p>
              <div className="flex justify-center gap-2 text-[11px]">
                <button
                  onClick={() => setSearchQuery('HbA1c')}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-teal-50 text-slate-600 rounded-lg"
                >
                  "HbA1c"
                </button>
                <button
                  onClick={() => setSearchQuery('Metformin')}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-teal-50 text-slate-600 rounded-lg"
                >
                  "Metformin"
                </button>
                <button
                  onClick={() => setSearchQuery('Creatinine')}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-teal-50 text-slate-600 rounded-lg"
                >
                  "Creatinine"
                </button>
                <button
                  onClick={() => setSearchQuery('Gupta')}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-teal-50 text-slate-600 rounded-lg"
                >
                  "Dr. Gupta"
                </button>
              </div>
            </div>
          )}

          {q && totalResults === 0 && (
            <div className="py-8 text-center text-slate-500">
              No matching medical records or terms found for "<strong>{searchQuery}</strong>".
            </div>
          )}

          {/* Members */}
          {matchedMembers.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Family Members ({matchedMembers.length})
              </span>
              {matchedMembers.map((m) => (
                <div
                  key={m.id}
                  onClick={() => {
                    onSelectMember(m);
                    onClose();
                  }}
                  className="p-2.5 rounded-xl bg-slate-50 hover:bg-teal-50 hover:border-teal-200 border border-slate-200/70 transition cursor-pointer flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <img src={m.avatar} alt={m.name} className="w-7 h-7 rounded-full object-cover" />
                    <div>
                      <div className="font-bold text-slate-900">{m.name}</div>
                      <div className="text-[11px] text-slate-500">
                        {m.age} yrs • {m.relationship} • Blood: {m.bloodType}
                      </div>
                    </div>
                  </div>
                  <span className="text-teal-700 font-semibold flex items-center gap-1">
                    Open profile <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Documents */}
          {matchedDocs.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Medical Reports & Scans ({matchedDocs.length})
              </span>
              {matchedDocs.map((doc) => {
                const mem = members.find((m) => m.id === doc.memberId) || members[0];
                return (
                  <div
                    key={doc.id}
                    onClick={() => {
                      onViewReport(doc);
                      onClose();
                    }}
                    className="p-3 rounded-xl bg-slate-50 hover:bg-teal-50 hover:border-teal-200 border border-slate-200/70 transition cursor-pointer flex items-center justify-between"
                  >
                    <div className="flex items-start gap-2.5">
                      <FileText className="w-4 h-4 text-teal-600 mt-0.5" />
                      <div>
                        <div className="font-bold text-slate-900">{doc.title}</div>
                        <div className="text-[11px] text-slate-500">
                          {mem.name} • {doc.date} • {doc.facility}
                        </div>
                        {doc.aiSummary && (
                          <div className="text-[11px] text-slate-600 mt-0.5 line-clamp-1 italic">
                            "{doc.aiSummary}"
                          </div>
                        )}
                      </div>
                    </div>
                    <span className="text-teal-700 font-semibold whitespace-nowrap ml-2">
                      View report →
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Medications */}
          {matchedMeds.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Prescriptions & Medications ({matchedMeds.length})
              </span>
              {matchedMeds.map((med) => {
                const mem = members.find((m) => m.id === med.memberId) || members[0];
                return (
                  <div
                    key={med.id}
                    onClick={() => {
                      onSelectMember(mem);
                      onClose();
                    }}
                    className="p-2.5 rounded-xl bg-slate-50 hover:bg-teal-50 hover:border-teal-200 border border-slate-200/70 transition cursor-pointer flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <Pill className="w-4 h-4 text-teal-600" />
                      <div>
                        <span className="font-bold text-slate-900">
                          {med.name} {med.dosage}
                        </span>
                        <span className="text-slate-500 ml-2">({med.frequency})</span>
                        <div className="text-[11px] text-slate-500">
                          Patient: {mem.name} • Indication: {med.reason}
                        </div>
                      </div>
                    </div>
                    <span className="text-[11px] font-semibold text-teal-700">Patient profile →</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Conditions */}
          {matchedConditions.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Recorded Conditions ({matchedConditions.length})
              </span>
              {matchedConditions.map((cond) => {
                const mem = members.find((m) => m.id === cond.memberId) || members[0];
                return (
                  <div
                    key={cond.id}
                    onClick={() => {
                      onSelectMember(mem);
                      onClose();
                    }}
                    className="p-2.5 rounded-xl bg-slate-50 hover:bg-teal-50 hover:border-teal-200 border border-slate-200/70 transition cursor-pointer flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <Activity className="w-4 h-4 text-teal-600" />
                      <div>
                        <span className="font-bold text-slate-900">{cond.name}</span>
                        <span className="text-slate-500 ml-2">({cond.status})</span>
                        <div className="text-[11px] text-slate-500">
                          Patient: {mem.name} • Diagnosed: {cond.dateDiagnosed}
                        </div>
                      </div>
                    </div>
                    <span className="text-[11px] font-semibold text-teal-700">View details →</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
