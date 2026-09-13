import React, { useState } from 'react';
import {
  X,
  Stethoscope,
  Sparkles,
  Printer,
  Copy,
  Check,
  Calendar,
  Building,
  AlertCircle,
  FileText,
  ShieldCheck,
  ChevronRight,
  ArrowLeft,
} from 'lucide-react';
import { FamilyMember, Doctor, DoctorVisitSummary, MedicalDocument } from '../types';

interface DoctorVisitModalProps {
  isOpen: boolean;
  member: FamilyMember;
  doctors: Doctor[];
  documents: MedicalDocument[];
  onClose: () => void;
}

export const DoctorVisitModal: React.FC<DoctorVisitModalProps> = ({
  isOpen,
  member,
  doctors,
  documents,
  onClose,
}) => {
  const [step, setStep] = useState<'input' | 'summary'>('input');
  const [specialty, setSpecialty] = useState('Endocrinology & Diabetes');
  const [selectedDoctor, setSelectedDoctor] = useState(doctors[0]?.name || 'Dr. Sameer Gupta');
  const [mainConcern, setMainConcern] = useState('Persistent fatigue for 2 weeks & routine glycemic follow-up');
  const [duration, setDuration] = useState('2–3 weeks');
  const [isLoading, setIsLoading] = useState(false);
  const [visitSummary, setVisitSummary] = useState<DoctorVisitSummary | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStep('summary');

    try {
      const res = await fetch('/api/ai/doctor-visit-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberName: member.name,
          age: member.age,
          specialty,
          doctorName: selectedDoctor,
          mainConcern,
          duration,
          conditions: member.conditionsSummary,
          records: documents
            .filter((d) => d.memberId === member.id)
            .map((d) => ({
              title: d.title,
              date: d.date,
              summary: d.aiSummary,
              labs: d.extractedData.labResults,
            })),
        }),
      });

      const data = await res.json();
      setVisitSummary(data.visitSummary);
    } catch (err) {
      console.error('Failed to generate doctor visit summary:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const copySummaryText = () => {
    if (!visitSummary) return;
    const text = `
DOCTOR VISIT CLINICAL BRIEF
Patient: ${visitSummary.patientName}, Age: ${visitSummary.age}
Physician: ${visitSummary.doctorName} (${visitSummary.specialty})
Date: ${visitSummary.generatedDate}

CHIEF CONCERN / REASON FOR VISIT:
${visitSummary.mainConcern} (Duration: ${visitSummary.duration})

RELEVANT MEDICAL HISTORY:
${visitSummary.relevantMedicalHistory.map((h) => `• ${h}`).join('\n')}

CURRENT MEDICATIONS:
${visitSummary.currentMedications.map((m) => `• ${m}`).join('\n')}

RECENT RELEVANT REPORTS & LAB FINDINGS:
${visitSummary.relevantRecentReports.map((r) => `• ${r.title} (${r.date}): ${r.keyFindings}`).join('\n')}

PREVIOUS RELATED EVENTS:
${visitSummary.previousRelatedEvents.map((e) => `• ${e}`).join('\n')}

TARGETED QUESTIONS FOR PHYSICIAN:
${visitSummary.questionsForDoctor.map((q) => `• ${q}`).join('\n')}

DISCLAIMER:
${visitSummary.disclaimer}
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Prepare Doctor Visit Summary
              </h3>
              <p className="text-xs text-slate-500">
                1-page structured clinical brief for <strong className="text-slate-800">{member.name}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {step === 'summary' && (
              <>
                <button
                  onClick={copySummaryText}
                  className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
                <button
                  onClick={() => window.print()}
                  className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
                >
                  <Printer className="w-4 h-4" />
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* STEP 1: CONFIGURE VISIT */}
        {step === 'input' && (
          <form onSubmit={handleGenerate} className="p-6 space-y-5 text-xs overflow-y-auto">
            <div className="p-3.5 bg-teal-50/70 border border-teal-200/80 rounded-xl text-teal-900 leading-relaxed">
              Generate a high-density, 1-page summary to bring to your doctor. It automatically pulls relevant history, current medications, latest test numbers, and prepares 3 sharp questions.
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Doctor Name / Clinic</label>
                <select
                  value={selectedDoctor}
                  onChange={(e) => setSelectedDoctor(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                >
                  {doctors.map((d) => (
                    <option key={d.id} value={d.name}>
                      {d.name} ({d.specialty})
                    </option>
                  ))}
                  <option value="Other Specialist">Other Physician / Specialist</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Medical Specialty</label>
                <select
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                >
                  <option value="Endocrinology & Diabetes">Endocrinology & Diabetes</option>
                  <option value="Cardiology">Cardiology</option>
                  <option value="Internal Medicine / General Physician">Internal Medicine / GP</option>
                  <option value="Orthopedic Surgery">Orthopedic Surgery</option>
                  <option value="Nephrology">Nephrology</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Main Health Concern or Symptoms
              </label>
              <input
                type="text"
                required
                value={mainConcern}
                onChange={(e) => setMainConcern(e.target.value)}
                placeholder="e.g. Mild persistent fatigue after meals & routine 6-month checkup"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
              <div className="mt-2 flex flex-wrap gap-1.5">
                {[
                  'Routine 6-month diabetes review',
                  'Persistent mild afternoon fatigue',
                  'Blood pressure elevation check',
                  'Post-op knee flexibility follow-up',
                ].map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setMainConcern(chip)}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-teal-50 text-slate-700 hover:text-teal-900 rounded-lg text-[11px] font-medium border border-slate-200 transition"
                  >
                    + {chip}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Duration of Concern</label>
              <input
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="e.g. 2–3 weeks"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-slate-600 hover:text-slate-800 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-xs transition flex items-center gap-1.5"
              >
                <Sparkles className="w-4 h-4" />
                <span>Generate Doctor Visit Brief</span>
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: SUMMARY VIEW */}
        {step === 'summary' && (
          <div className="p-6 space-y-6 overflow-y-auto flex-1 text-xs">
            {isLoading || !visitSummary ? (
              <div className="p-12 text-center space-y-3">
                <div className="w-10 h-10 rounded-full border-3 border-teal-600 border-t-transparent animate-spin mx-auto" />
                <p className="font-bold text-slate-800">Synthesizing clinical visit brief...</p>
                <p className="text-slate-400 text-xs">Matching pertinent history, active prescriptions, and recent lab results...</p>
              </div>
            ) : (
              <div className="space-y-5">
                {/* Clinical Header */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="font-bold text-slate-900 text-sm">{visitSummary.patientName}</div>
                    <div className="text-slate-500">
                      Age: {visitSummary.age} yrs • Scheduled: {visitSummary.doctorName} ({visitSummary.specialty})
                    </div>
                  </div>
                  <div className="text-[11px] font-semibold text-slate-500">
                    {visitSummary.generatedDate}
                  </div>
                </div>

                {/* Chief Concern */}
                <div className="p-4 bg-teal-50/60 rounded-xl border border-teal-200/80 space-y-1">
                  <span className="text-[11px] font-bold text-teal-900 uppercase tracking-wider block">
                    Chief Concern & Duration
                  </span>
                  <div className="text-sm font-bold text-slate-900">{visitSummary.mainConcern}</div>
                  <div className="text-slate-600 text-xs">Duration: {visitSummary.duration}</div>
                </div>

                {/* Relevant History */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <span className="text-[11px] font-bold text-slate-900 uppercase tracking-wider block">
                    Relevant Medical Background
                  </span>
                  <ul className="list-disc pl-4 space-y-1 text-slate-700">
                    {visitSummary.relevantMedicalHistory.map((h, i) => (
                      <li key={i}>{h}</li>
                    ))}
                  </ul>
                </div>

                {/* Current Medications */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <span className="text-[11px] font-bold text-slate-900 uppercase tracking-wider block">
                    Current Active Medications (Dosage & Timing)
                  </span>
                  <ul className="list-disc pl-4 space-y-1 text-slate-700">
                    {visitSummary.currentMedications.map((m, i) => (
                      <li key={i} className="font-medium">{m}</li>
                    ))}
                  </ul>
                </div>

                {/* Recent Relevant Reports */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-slate-900 uppercase tracking-wider block">
                    Recent Relevant Diagnostic Findings
                  </span>
                  <div className="space-y-2">
                    {visitSummary.relevantRecentReports.map((r, i) => (
                      <div key={i} className="p-3 bg-white border border-slate-200 rounded-lg space-y-0.5">
                        <div className="flex items-center justify-between font-bold text-slate-800">
                          <span>{r.title}</span>
                          <span className="text-slate-400 font-normal">{r.date}</span>
                        </div>
                        <p className="text-slate-600 text-[11px]">{r.keyFindings}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3 High Value Questions for Doctor */}
                <div className="p-4 bg-teal-50/70 border border-teal-200 rounded-xl space-y-2">
                  <span className="text-[11px] font-bold text-teal-950 uppercase tracking-wider block">
                    Targeted Questions to Review with Physician
                  </span>
                  <ol className="list-decimal pl-4 space-y-1.5 text-slate-800 font-medium">
                    {visitSummary.questionsForDoctor.map((q, i) => (
                      <li key={i} className="leading-relaxed">{q}</li>
                    ))}
                  </ol>
                </div>

                {/* Disclaimer */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-500 leading-relaxed italic">
                  {visitSummary.disclaimer}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        {step === 'summary' && (
          <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
            <button
              onClick={() => setStep('input')}
              className="text-slate-600 hover:text-slate-900 font-semibold flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Edit Visit Details</span>
            </button>

            <button
              onClick={onClose}
              className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold shadow-xs transition"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
