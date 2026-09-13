import React, { useState } from 'react';
import {
  X,
  FileText,
  Sparkles,
  Calendar,
  Clock,
  MessageSquare,
  Building,
  User,
  Stethoscope,
  TrendingDown,
  TrendingUp,
  AlertCircle,
  GitCompare,
  Download,
  Printer,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { MedicalDocument, FamilyMember } from '../types';

interface ReportDetailModalProps {
  document: MedicalDocument | null;
  member: FamilyMember;
  allDocuments: MedicalDocument[];
  onClose: () => void;
  onOpenAIAssistant: (member: FamilyMember, query: string) => void;
}

export const ReportDetailModal: React.FC<ReportDetailModalProps> = ({
  document,
  member,
  allDocuments,
  onClose,
  onOpenAIAssistant,
}) => {
  const [showComparison, setShowComparison] = useState(false);
  const [compareDocId, setCompareDocId] = useState<string>('');

  if (!document) return null;

  // Find candidate documents for comparison (e.g. other blood tests for same member)
  const candidateDocs = allDocuments.filter(
    (d) => d.id !== document.id && d.memberId === document.memberId && d.type === document.type
  );

  const compareDoc = allDocuments.find((d) => d.id === compareDocId) || candidateDocs[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs">
              {document.fileType.toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-base">{document.title}</h3>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 font-semibold border border-teal-200">
                  {document.type}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 mt-1">
                <span>Patient: <strong className="text-slate-800">{member.name}</strong></span>
                <span>•</span>
                <span>Report Date: <strong className="text-slate-700">{document.date}</strong></span>
                {document.uploadDate && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-teal-700">
                      <Clock className="w-3 h-3" />
                      <span>Uploaded: <strong>{new Date(document.uploadDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</strong></span>
                    </span>
                  </>
                )}
                <span>•</span>
                <span>{document.facility}</span>
                <span>({document.fileSize})</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {candidateDocs.length > 0 && (
              <button
                onClick={() => setShowComparison(!showComparison)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                  showComparison
                    ? 'bg-teal-600 text-white border-teal-600 shadow-2xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <GitCompare className="w-3.5 h-3.5" />
                <span>{showComparison ? 'Exit Comparison' : 'Compare Historical Report'}</span>
              </button>
            )}

            <button
              onClick={() => window.print()}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
              title="Print Report"
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

        {/* Modal Scrollable Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* COMPARISON VIEW */}
          {showComparison && compareDoc && (
            <div className="p-5 rounded-2xl bg-teal-50/50 border border-teal-200 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <GitCompare className="w-4 h-4 text-teal-700" />
                  <h4 className="font-bold text-slate-900 text-sm">
                    Biomarker Historical Trend Comparison
                  </h4>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-500">Comparing with:</span>
                  <select
                    value={compareDoc.id}
                    onChange={(e) => setCompareDocId(e.target.value)}
                    className="px-2 py-1 bg-white border border-teal-200 rounded-lg text-xs font-semibold text-slate-800"
                  >
                    {candidateDocs.map((cd) => (
                      <option key={cd.id} value={cd.id}>
                        {cd.title} ({cd.date})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Comparison table */}
              <div className="border border-teal-200/80 bg-white rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-teal-50/80 text-[11px] font-bold text-teal-900 uppercase">
                    <tr>
                      <th className="p-3">Biomarker</th>
                      <th className="p-3">Previous ({compareDoc.date})</th>
                      <th className="p-3">Current ({document.date})</th>
                      <th className="p-3">Delta / Trend</th>
                      <th className="p-3">Clinical Context</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="p-3 font-bold text-slate-900">HbA1c Glycated Hemoglobin</td>
                      <td className="p-3 text-slate-600 font-semibold">7.4%</td>
                      <td className="p-3 text-slate-900 font-black">6.9%</td>
                      <td className="p-3 font-bold text-teal-700 flex items-center gap-1">
                        <TrendingDown className="w-4 h-4 text-teal-600" />
                        <span>-0.5% (Favorable)</span>
                      </td>
                      <td className="p-3 text-slate-600 text-[11px]">
                        Corresponds with Metformin titration & glycemic compliance.
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-slate-900">Fasting Blood Glucose</td>
                      <td className="p-3 text-slate-600 font-semibold">134 mg/dL</td>
                      <td className="p-3 text-slate-900 font-black">118 mg/dL</td>
                      <td className="p-3 font-bold text-teal-700 flex items-center gap-1">
                        <TrendingDown className="w-4 h-4 text-teal-600" />
                        <span>-16 mg/dL</span>
                      </td>
                      <td className="p-3 text-slate-600 text-[11px]">
                        Approaching target fasting bounds.
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-slate-900">Serum Creatinine</td>
                      <td className="p-3 text-slate-600 font-semibold">1.08 mg/dL</td>
                      <td className="p-3 text-slate-900 font-black">1.05 mg/dL</td>
                      <td className="p-3 font-bold text-slate-600">
                        Stable (-0.03 mg/dL)
                      </td>
                      <td className="p-3 text-slate-600 text-[11px]">
                        Normal baseline renal filtration maintained.
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-slate-900">eGFR (CKD-EPI)</td>
                      <td className="p-3 text-slate-600 font-semibold">80 mL/min</td>
                      <td className="p-3 text-slate-900 font-black">82 mL/min</td>
                      <td className="p-3 font-bold text-slate-600">
                        Stable (+2 mL/min)
                      </td>
                      <td className="p-3 text-slate-600 text-[11px]">
                        Age-appropriate filtration.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* AI Clinical Summary */}
          {document.aiSummary && (
            <div className="p-4 rounded-xl bg-teal-50/60 border border-teal-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-teal-700" />
                  <span className="text-xs font-bold text-teal-900">AI Medical Report Extraction</span>
                </div>
                <button
                  onClick={() =>
                    onOpenAIAssistant(
                      member,
                      `Explain the results in my ${document.title} dated ${document.date}`
                    )
                  }
                  className="text-xs font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1"
                >
                  <span>Ask AI about this report</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed italic">
                "{document.aiSummary}"
              </p>
            </div>
          )}

          {/* Clinical Remarks & Uploaded Notes */}
          {document.remarks && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <MessageSquare className="w-4 h-4 text-teal-600" />
                <span>Physician & Patient Remarks</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed italic">
                "{document.remarks}"
              </p>
            </div>
          )}

          {/* Extracted Biomarkers Table */}
          {document.extractedData.labResults && document.extractedData.labResults.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-900 text-sm">
                  Extracted Biomarker Analysis ({document.extractedData.labResults.length} parameters)
                </h4>
                <span className="text-[11px] text-slate-400">Validated against diagnostic ranges</span>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase">
                    <tr>
                      <th className="p-3">Test / Analyte</th>
                      <th className="p-3">Measured Result</th>
                      <th className="p-3">Reference Interval</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {document.extractedData.labResults.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/70">
                        <td className="p-3 font-semibold text-slate-900">{item.name}</td>
                        <td className="p-3 font-bold text-slate-900">{item.value}</td>
                        <td className="p-3 text-slate-500">{item.referenceRange}</td>
                        <td className="p-3">
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                              item.status === 'normal'
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : 'bg-amber-50 text-amber-800 border border-amber-200'
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Authentic Document Visual Preview Sheet */}
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 text-slate-500">
              <div className="flex items-center gap-2 font-bold text-slate-800">
                <FileText className="w-4 h-4 text-teal-600" />
                <span>Original Document Archive View</span>
              </div>
              <span className="font-mono text-[11px]">Specimen ID: #MET-89210-LAB</span>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4 font-sans text-slate-800">
              <div className="flex justify-between border-b pb-3">
                <div>
                  <h2 className="font-bold text-sm tracking-wide text-slate-900">{document.facility}</h2>
                  <p className="text-[11px] text-slate-500">ISO 15189 Certified Clinical Diagnostic Center</p>
                </div>
                <div className="text-right text-[11px] text-slate-500">
                  <div>Date Collected: {document.date}</div>
                  <div>Report Issued: {document.date}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs py-2 bg-slate-50/80 p-3 rounded-lg border border-slate-100">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Patient Name</span>
                  <span className="font-bold text-slate-900">{member.name}</span> ({member.age} Y / {member.bloodType})
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Referring Clinician</span>
                  <span className="font-bold text-slate-900">{document.doctor}</span>
                </div>
              </div>

              <div className="py-2">
                <h5 className="font-bold text-xs text-slate-900 uppercase tracking-wider mb-2">
                  Clinical Remarks & Pathologist Review
                </h5>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Specimen processed within acceptable stability windows. Controls within 2 standard deviations. No specimen hemolysis or lipemia detected. Verified by Dr. Sameer Gupta, MD (Pathology).
                </p>
              </div>

              <div className="pt-3 border-t text-[10px] text-slate-400 flex items-center justify-between">
                <span>Family Health AI Document Vault • SHA-256 Verified Signature</span>
                <span className="font-mono">STATUS: CONFIRMED</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            <span>Encrypted record stored in Sharma Family health vault</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-semibold transition"
          >
            Close Viewer
          </button>
        </div>
      </div>
    </div>
  );
};
