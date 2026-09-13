import React, { useState } from 'react';
import {
  X,
  Sparkles,
  FileText,
  Printer,
  Copy,
  Check,
  Download,
  AlertCircle,
  HelpCircle,
  TrendingDown,
  ShieldCheck,
  Stethoscope,
} from 'lucide-react';
import { FamilyMember, PersonalHealthSummary } from '../types';

interface HealthSummaryModalProps {
  isOpen: boolean;
  member: FamilyMember;
  onClose: () => void;
  summary: PersonalHealthSummary | null;
  isLoading: boolean;
}

export const HealthSummaryModal: React.FC<HealthSummaryModalProps> = ({
  isOpen,
  member,
  onClose,
  summary,
  isLoading,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const copySummaryText = () => {
    if (!summary) return;
    const text = `
PERSONAL HEALTH SUMMARY
Patient: ${summary.patientName} (Age: ${summary.age})
Generated: ${summary.generatedDate}

KNOWN CONDITIONS:
${summary.knownConditions.map((c) => `• ${c}`).join('\n')}

CURRENT MEDICATIONS:
${summary.currentMedications.map((m) => `• ${m.name} ${m.dosage} - ${m.frequency} (${m.reason})`).join('\n')}

ALLERGIES:
${summary.allergies.join(', ')}

MAJOR TREATMENTS / SURGERIES:
${summary.majorTreatments.map((t) => `• ${t}`).join('\n')}

RECENT INVESTIGATIONS:
${summary.recentInvestigations.map((i) => `• ${i.name} (${i.date}): ${i.result} [${i.trend}]`).join('\n')}

HEALTH TRENDS:
${summary.healthTrends.map((t) => `• ${t}`).join('\n')}

QUESTIONS FOR DOCTOR:
${summary.questionsForDoctor.map((q) => `• ${q}`).join('\n')}

DATA GAPS:
${summary.dataGaps.map((g) => `• ${g}`).join('\n')}

Disclaimer: This summary is an organizational synthesis of patient records. It is not medical advice or a diagnosis.
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
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Structured Personal Health Summary
              </h3>
              <p className="text-xs text-slate-500">
                Patient: <strong className="text-slate-800">{member.name}</strong> • {member.age} yrs • {member.bloodType}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={copySummaryText}
              className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Text'}</span>
            </button>
            <button
              onClick={() => window.print()}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
              title="Print Summary"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 text-xs">
          {isLoading || !summary ? (
            <div className="p-12 text-center space-y-3">
              <div className="w-10 h-10 rounded-full border-3 border-teal-600 border-t-transparent animate-spin mx-auto" />
              <p className="font-bold text-slate-800">Synthesizing comprehensive health summary...</p>
              <p className="text-slate-400 text-xs">Compiling conditions, medications, lab trends, and identifying gaps...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Top Meta banner */}
              <div className="p-4 bg-teal-50/60 rounded-xl border border-teal-200/80 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="font-bold text-teal-900 text-sm">{summary.patientName}</span>
                  <span className="text-teal-700 ml-2">({summary.age} years old)</span>
                </div>
                <div className="text-teal-800 font-medium text-[11px]">
                  Generated on {summary.generatedDate}
                </div>
              </div>

              {/* Known Conditions & History */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                    Known Medical Conditions
                  </h4>
                  <ul className="space-y-1.5 list-disc pl-4 text-slate-700">
                    {summary.knownConditions.map((c, i) => (
                      <li key={i} className="leading-relaxed">{c}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                    Key Historical Milestones
                  </h4>
                  <ul className="space-y-1.5 list-disc pl-4 text-slate-700">
                    {summary.medicalHistory.map((h, i) => (
                      <li key={i} className="leading-relaxed">{h}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Current Medications */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                  Current Active Medications & Indication
                </h4>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 text-[11px] font-bold text-slate-600 uppercase border-b border-slate-200">
                      <tr>
                        <th className="p-2.5">Medication</th>
                        <th className="p-2.5">Dosage & Frequency</th>
                        <th className="p-2.5">Clinical Reason</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {summary.currentMedications.map((m, i) => (
                        <tr key={i} className="hover:bg-slate-50/60">
                          <td className="p-2.5 font-bold text-slate-900">{m.name}</td>
                          <td className="p-2.5 text-slate-700">{m.dosage} ({m.frequency})</td>
                          <td className="p-2.5 text-slate-600">{m.reason}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Recent Investigations Table */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                  Recent Key Investigations & Lab Markers
                </h4>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 text-[11px] font-bold text-slate-600 uppercase border-b border-slate-200">
                      <tr>
                        <th className="p-2.5">Investigation</th>
                        <th className="p-2.5">Date</th>
                        <th className="p-2.5">Result</th>
                        <th className="p-2.5">Observed Trend</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {summary.recentInvestigations.map((inv, i) => (
                        <tr key={i} className="hover:bg-slate-50/60">
                          <td className="p-2.5 font-semibold text-slate-900">{inv.name}</td>
                          <td className="p-2.5 text-slate-500">{inv.date}</td>
                          <td className="p-2.5 font-bold text-slate-800">{inv.result}</td>
                          <td className="p-2.5 text-teal-700 font-semibold">{inv.trend}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Health Trends */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                  Synthesized Long-Term Health Trends
                </h4>
                <ul className="space-y-1.5 list-disc pl-4 text-slate-700">
                  {summary.healthTrends.map((t, i) => (
                    <li key={i} className="leading-relaxed">{t}</li>
                  ))}
                </ul>
              </div>

              {/* High-Value Questions for Next Doctor Visit */}
              <div className="p-4 bg-teal-50/70 rounded-xl border border-teal-200 space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-teal-950 uppercase tracking-wider text-[11px]">
                  <Stethoscope className="w-3.5 h-3.5 text-teal-700" />
                  <span>High-Priority Questions for Upcoming Doctor Visit</span>
                </div>
                <ul className="space-y-1.5 list-disc pl-4 text-slate-800">
                  {summary.questionsForDoctor.map((q, i) => (
                    <li key={i} className="leading-relaxed font-medium">{q}</li>
                  ))}
                </ul>
              </div>

              {/* Identified Data Gaps */}
              <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-200/80 space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-amber-900 uppercase tracking-wider text-[11px]">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-700" />
                  <span>Identified Record Gaps & Missing Routine Screenings</span>
                </div>
                <ul className="space-y-1.5 list-disc pl-4 text-amber-900">
                  {summary.dataGaps.map((gap, i) => (
                    <li key={i} className="leading-relaxed">{gap}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            <span>Non-diagnostic summary for patient empowerment & doctor dialogue</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
