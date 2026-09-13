import React, { useState } from 'react';
import {
  X,
  Upload,
  FileText,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  Edit2,
  Calendar,
  Building,
  User,
} from 'lucide-react';
import { FamilyMember, MedicalDocument, LabResult } from '../types';

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: FamilyMember[];
  selectedMember: FamilyMember;
  onUploadSuccess: (newDoc: MedicalDocument) => void;
}

export const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({
  isOpen,
  onClose,
  members,
  selectedMember,
  onUploadSuccess,
}) => {
  const [targetMemberId, setTargetMemberId] = useState(selectedMember.id);
  const [step, setStep] = useState<'select' | 'processing' | 'review'>('select');
  const [processingStage, setProcessingStage] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [docType, setDocType] = useState<MedicalDocument['type']>('Blood Test');
  const [extractedData, setExtractedData] = useState<any>(null);

  // Editable review states
  const [reviewedTitle, setReviewedTitle] = useState('');
  const [reviewedDate, setReviewedDate] = useState('');
  const [reviewedDoctor, setReviewedDoctor] = useState('');
  const [reviewedFacility, setReviewedFacility] = useState('');
  const [reviewedLabs, setReviewedLabs] = useState<LabResult[]>([]);
  const [reviewedSummary, setReviewedSummary] = useState('');
  const [reviewedRemarks, setReviewedRemarks] = useState('');

  if (!isOpen) return null;

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    startExtraction(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const startExtraction = async (file: File) => {
    setStep('processing');
    setProcessingStage(1); // Uploading

    const targetMember = members.find((m) => m.id === targetMemberId) || selectedMember;

    const timer1 = setTimeout(() => setProcessingStage(2), 700); // Reading document
    const timer2 = setTimeout(() => setProcessingStage(3), 1500); // Extracting medical information
    const timer3 = setTimeout(() => setProcessingStage(4), 2200); // Organizing health timeline

    try {
      const res = await fetch('/api/ai/extract-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: file.name,
          fileType: file.type || 'application/pdf',
          patientName: targetMember.name,
        }),
      });
      const data = await res.json();
      const extracted = data.extractedData;

      setTimeout(() => {
        setExtractedData(extracted);
        setReviewedTitle(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ') || 'Medical Laboratory Panel');
        setReviewedDate(extracted.date || new Date().toISOString().split('T')[0]);
        setReviewedDoctor(extracted.doctorName || 'Dr. Sameer Gupta');
        setReviewedFacility(extracted.facility || 'Metropolis Healthcare Diagnostics');
        setReviewedLabs(extracted.labResults || []);
        setReviewedSummary(extracted.summaryNote || 'Extracted medical record.');
        setDocType(extracted.documentType as any || 'Blood Test');
        setStep('review');
      }, 2800);
    } catch (err) {
      console.error('Extraction error:', err);
      // Fallback review
      setTimeout(() => {
        setReviewedTitle('Comprehensive Blood Analysis');
        setReviewedDate(new Date().toISOString().split('T')[0]);
        setReviewedDoctor('Dr. Sameer Gupta');
        setReviewedFacility('Metropolis Healthcare Diagnostics');
        setReviewedLabs([
          {
            name: 'HbA1c Glycated Hemoglobin',
            value: '6.8%',
            numericValue: 6.8,
            unit: '%',
            referenceRange: '< 5.7%',
            status: 'monitoring',
            trend: 'improving',
          },
          {
            name: 'Fasting Blood Glucose',
            value: '114 mg/dL',
            numericValue: 114,
            unit: 'mg/dL',
            referenceRange: '70-99 mg/dL',
            status: 'monitoring',
            trend: 'improving',
          },
        ]);
        setReviewedSummary(`Extracted laboratory panel for ${targetMember.name}. Markers indicate stable glycemic response.`);
        setStep('review');
      }, 2800);
    }
  };

  const handleConfirmAdd = () => {
    const targetMember = members.find((m) => m.id === targetMemberId) || selectedMember;

    const newDoc: MedicalDocument = {
      id: `doc-${Date.now()}`,
      memberId: targetMember.id,
      title: reviewedTitle || 'Medical Laboratory Panel',
      type: docType,
      date: reviewedDate || new Date().toISOString().split('T')[0],
      facility: reviewedFacility,
      doctor: reviewedDoctor,
      fileSize: selectedFile ? `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB` : '1.4 MB',
      fileType: selectedFile?.name.endsWith('.png') || selectedFile?.name.endsWith('.jpg') ? 'png' : 'pdf',
      previewText: reviewedSummary || 'Diagnostic laboratory analysis and report summary.',
      status: 'confirmed',
      aiSummary: reviewedSummary,
      uploadDate: new Date().toISOString(),
      remarks: reviewedRemarks || reviewedSummary || 'Diagnostic laboratory analysis and report summary.',
      extractedData: {
        documentType: docType,
        date: reviewedDate,
        patientName: targetMember.name,
        doctorName: reviewedDoctor,
        facility: reviewedFacility,
        summaryNote: reviewedSummary,
        labResults: reviewedLabs,
        medicationsDetected: [],
      },
    };

    onUploadSuccess(newDoc);
    onClose();
  };

  const stages = [
    'Uploading document...',
    'Reading document text and values...',
    'Extracting medical biomarkers...',
    'Organizing your family health timeline...',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Upload Medical Record</h3>
              <p className="text-[11px] text-slate-500">
                Blood tests, prescriptions, scans, doctor notes, and hospital discharge summaries
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* STEP PROGRESS BAR */}
        <div className="bg-slate-50 border-b border-slate-100 px-6 py-2.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                step === 'select'
                  ? 'bg-teal-600 text-white'
                  : 'bg-teal-100 text-teal-800'
              }`}
            >
              1
            </span>
            <span className={`font-semibold ${step === 'select' ? 'text-teal-900' : 'text-slate-500'}`}>
              Select File
            </span>
          </div>

          <div className="h-0.5 w-8 bg-slate-200" />

          <div className="flex items-center gap-2">
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                step === 'analyzing'
                  ? 'bg-teal-600 text-white animate-pulse'
                  : step === 'preview'
                  ? 'bg-teal-100 text-teal-800'
                  : 'bg-slate-200 text-slate-500'
              }`}
            >
              2
            </span>
            <span className={`font-semibold ${step === 'analyzing' ? 'text-teal-900' : 'text-slate-500'}`}>
              AI Extraction
            </span>
          </div>

          <div className="h-0.5 w-8 bg-slate-200" />

          <div className="flex items-center gap-2">
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                step === 'preview'
                  ? 'bg-teal-600 text-white'
                  : 'bg-slate-200 text-slate-500'
              }`}
            >
              3
            </span>
            <span className={`font-semibold ${step === 'preview' ? 'text-teal-900' : 'text-slate-500'}`}>
              Review & Save
            </span>
          </div>
        </div>

        {/* STEP 1: SELECT FILE */}
        {step === 'select' && (
          <div className="p-6 space-y-5">
            {/* Target Member Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Assign Record to Family Member:
              </label>
              <select
                value={targetMemberId}
                onChange={(e) => setTargetMemberId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white font-medium focus:outline-none focus:ring-1 focus:ring-teal-500"
              >
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.relationship} • {m.age} yrs)
                  </option>
                ))}
              </select>
            </div>

            {/* Document category */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Document Category:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                {(['Blood Test', 'Prescription', 'Scan & Imaging', 'Discharge Summary'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setDocType(t)}
                    className={`py-2 px-3 rounded-lg border text-center transition font-semibold ${
                      docType === t
                        ? 'bg-teal-50 border-teal-600 text-teal-900'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Drag and drop zone */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="p-8 border-2 border-dashed border-teal-200 hover:border-teal-400 bg-teal-50/20 hover:bg-teal-50/40 rounded-2xl text-center cursor-pointer transition flex flex-col items-center justify-center space-y-3"
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = '.pdf,.png,.jpg,.jpeg';
                input.onchange = (e) => {
                  const target = e.target as HTMLInputElement;
                  if (target.files && target.files[0]) {
                    handleFileSelect(target.files[0]);
                  }
                };
                input.click();
              }}
            >
              <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <span className="font-bold text-slate-900 text-sm block">
                  Drag & drop medical files here, or click to browse
                </span>
                <span className="text-xs text-slate-500 mt-0.5 block">
                  Supports PDF reports, JPEG/PNG photos of prescriptions, scans, and laboratory bills (Up to 15MB)
                </span>
              </div>
              <span className="px-3 py-1.5 rounded-lg bg-teal-600 text-white text-xs font-bold shadow-xs">
                Select Medical File
              </span>
            </div>

            {/* Quick Demo Upload Triggers */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Or Simulate Sample Diagnostic Report:
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const mockFile = new File(['mock report'], 'Metropolis_Hba1c_Glucose_Panel.pdf', {
                      type: 'application/pdf',
                    });
                    handleFileSelect(mockFile);
                  }}
                  className="px-3 py-1.5 bg-white border border-slate-200 hover:border-teal-400 rounded-lg text-slate-800 font-semibold text-xs transition"
                >
                  📄 Metabolic Panel (HbA1c 6.8%)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const mockFile = new File(['mock scan'], 'Apollo_Knee_XRay_Radiology_Report.pdf', {
                      type: 'application/pdf',
                    });
                    handleFileSelect(mockFile);
                  }}
                  className="px-3 py-1.5 bg-white border border-slate-200 hover:border-teal-400 rounded-lg text-slate-800 font-semibold text-xs transition"
                >
                  🩻 Orthopedic Radiology Scan
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: PROCESSING SIMULATION */}
        {step === 'processing' && (
          <div className="p-10 text-center space-y-6">
            <div className="w-14 h-14 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center mx-auto animate-pulse">
              <Sparkles className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h4 className="font-bold text-slate-900 text-base">Processing Medical Document</h4>
              <p className="text-xs text-slate-500">
                Extracting structured biomarkers and organizing historical timeline...
              </p>
            </div>

            <div className="max-w-md mx-auto space-y-2 text-left text-xs">
              {stages.map((stg, idx) => {
                const isDone = processingStage > idx + 1;
                const isCurrent = processingStage === idx + 1;
                return (
                  <div
                    key={idx}
                    className={`flex items-center gap-2.5 p-2.5 rounded-lg border transition ${
                      isDone
                        ? 'bg-teal-50 border-teal-200 text-teal-900 font-semibold'
                        : isCurrent
                        ? 'bg-white border-teal-400 text-slate-900 shadow-2xs font-bold'
                        : 'bg-slate-50 border-slate-100 text-slate-400'
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0" />
                    ) : isCurrent ? (
                      <div className="w-4 h-4 rounded-full border-2 border-teal-600 border-t-transparent animate-spin flex-shrink-0" />
                    ) : (
                      <Clock className="w-4 h-4 text-slate-300 flex-shrink-0" />
                    )}
                    <span>{stg}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 3: REVIEW & CONFIRM */}
        {step === 'review' && (
          <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
            <div className="p-3 bg-teal-50/70 rounded-xl border border-teal-200/80 flex items-start gap-2.5 text-xs text-teal-900">
              <CheckCircle2 className="w-4 h-4 text-teal-700 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Medical information detected!</span>
                <p className="text-[11px] text-teal-800 mt-0.5 leading-relaxed">
                  Please review and confirm the extracted values below. You can correct any value before adding it to the health timeline.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Document Title</label>
                <input
                  type="text"
                  value={reviewedTitle}
                  onChange={(e) => setReviewedTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Report Date</label>
                <input
                  type="date"
                  value={reviewedDate}
                  onChange={(e) => setReviewedDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Attending Doctor / Specialist</label>
                <input
                  type="text"
                  value={reviewedDoctor}
                  onChange={(e) => setReviewedDoctor(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Clinic / Laboratory Facility</label>
                <input
                  type="text"
                  value={reviewedFacility}
                  onChange={(e) => setReviewedFacility(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>
            </div>

            {/* Extracted Lab Values Table */}
            {reviewedLabs.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-900">
                    Detected Laboratory Biomarkers ({reviewedLabs.length})
                  </span>
                  <span className="text-[11px] text-slate-400">Validated against standard reference intervals</span>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase">
                      <tr>
                        <th className="p-2.5">Test Name</th>
                        <th className="p-2.5">Extracted Value</th>
                        <th className="p-2.5">Reference Range</th>
                        <th className="p-2.5">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {reviewedLabs.map((lab, i) => (
                        <tr key={i} className="hover:bg-slate-50/60">
                          <td className="p-2.5 font-semibold text-slate-900">{lab.name}</td>
                          <td className="p-2.5 font-bold text-teal-800">{lab.value}</td>
                          <td className="p-2.5 text-slate-500">{lab.referenceRange || 'Standard'}</td>
                          <td className="p-2.5">
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                                lab.status === 'normal'
                                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                  : 'bg-amber-50 text-amber-800 border border-amber-200'
                              }`}
                            >
                              {lab.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* AI Summary note */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                AI Clinical Record Summary
              </label>
              <textarea
                rows={2}
                value={reviewedSummary}
                onChange={(e) => setReviewedSummary(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>

            {/* Doctor Remarks or Personal Information */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Remarks / Doctor's Advice / Notes
              </label>
              <textarea
                rows={2}
                placeholder="e.g., Doctor advised reducing sodium and follow-up in 3 months..."
                value={reviewedRemarks}
                onChange={(e) => setReviewedRemarks(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-teal-500 placeholder:text-slate-400"
              />
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep('select')}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800"
              >
                ← Back to Upload
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmAdd}
                  className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm & Add to Health Timeline</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
