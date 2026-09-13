import React, { useState } from 'react';
import {
  X,
  Share2,
  Copy,
  Check,
  FileCheck,
  Key,
} from 'lucide-react';
import { FamilyMember, ShareLink } from '../types';
import { formatMemberOptionLabel } from './UserAvatar';

interface DoctorShareModalProps {
  isOpen: boolean;
  member: FamilyMember;
  members?: FamilyMember[];
  onClose: () => void;
  existingLinks: ShareLink[];
  onCreateLink: (link: ShareLink) => void;
}

export const DoctorShareModal: React.FC<DoctorShareModalProps> = ({
  isOpen,
  member,
  members = [],
  onClose,
  existingLinks,
  onCreateLink,
}) => {
  const [selectedMemberId, setSelectedMemberId] = useState<string>(member.id);
  const [recipientDoctor, setRecipientDoctor] = useState('Dr. Sameer Gupta');
  const [expiryHours, setExpiryHours] = useState('48');
  const [shareScope, setShareScope] = useState<'full' | 'custom'>('full');
  const [includeSummary, setIncludeSummary] = useState(true);
  const [includeMeds, setIncludeMeds] = useState(true);
  const [includeTimeline, setIncludeTimeline] = useState(true);
  const [includeReports, setIncludeReports] = useState(true);
  const [generatedLink, setGeneratedLink] = useState<ShareLink | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentTargetMember = members.find((m) => m.id === selectedMemberId) || member;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const pin = Math.floor(1000 + Math.random() * 9000).toString();
    // Use an anonymous random short token — no patient names in links
    const token = Math.floor(100000 + Math.random() * 900000).toString();
    const linkUrl = `${window.location.origin}/share/${token}`;

    const sections =
      shareScope === 'full'
        ? [
            'Full Health Summary',
            'All Diagnostic & Lab Reports',
            'Active Medications & Dosages',
            'Medical Timeline & Procedures',
            'Vital Signs & Biomarkers',
          ]
        : [
            includeSummary ? 'Health Summary' : '',
            includeReports ? 'Lab Reports' : '',
            includeMeds ? 'Medications' : '',
            includeTimeline ? 'Timeline' : '',
          ].filter(Boolean);

    const newLink: ShareLink = {
      id: `share-${Date.now()}`,
      memberId: currentTargetMember.id,
      recipientDoctor: recipientDoctor.trim() || 'Attending Physician',
      expiresAt: `${expiryHours}h remaining`,
      accessPin: pin,
      sectionsIncluded: sections,
      status: 'active',
      url: linkUrl,
      createdAt: 'Just now',
    };

    setGeneratedLink(newLink);
    onCreateLink(newLink);
  };

  const copyUrl = () => {
    if (!generatedLink) return;
    navigator.clipboard.writeText(`${generatedLink.url} (PIN: ${generatedLink.accessPin})`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Share Full Health Report</h3>
              <p className="text-[11px] text-slate-500">Generate secure PIN-protected doctor link</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 text-xs">
          {!generatedLink ? (
            <form onSubmit={handleCreate} className="space-y-4">
              {/* Member Selection */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Family Member</label>
                <select
                  value={selectedMemberId}
                  onChange={(e) => setSelectedMemberId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
                >
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {formatMemberOptionLabel(m)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Doctor Name */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Doctor or Clinic</label>
                <input
                  type="text"
                  required
                  value={recipientDoctor}
                  onChange={(e) => setRecipientDoctor(e.target.value)}
                  placeholder="e.g. Dr. Sameer Gupta"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {/* Report Scope Selector */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Report Scope</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setShareScope('full')}
                    className={`p-2.5 rounded-xl border text-left cursor-pointer transition ${
                      shareScope === 'full'
                        ? 'border-teal-500 bg-teal-50/70 text-teal-900 ring-1 ring-teal-500'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <FileCheck className="w-3.5 h-3.5 text-teal-700" />
                      <span>Full Health Report</span>
                    </div>
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      All records, labs & vitals
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShareScope('custom')}
                    className={`p-2.5 rounded-xl border text-left cursor-pointer transition ${
                      shareScope === 'custom'
                        ? 'border-teal-500 bg-teal-50/70 text-teal-900 ring-1 ring-teal-500'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <Share2 className="w-3.5 h-3.5 text-slate-600" />
                      <span>Custom Sections</span>
                    </div>
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      Choose specific items
                    </span>
                  </button>
                </div>

                {shareScope === 'custom' && (
                  <div className="mt-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includeSummary}
                        onChange={(e) => setIncludeSummary(e.target.checked)}
                        className="rounded text-teal-600"
                      />
                      <span>Health Summary</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includeReports}
                        onChange={(e) => setIncludeReports(e.target.checked)}
                        className="rounded text-teal-600"
                      />
                      <span>Diagnostic & Lab Reports</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includeMeds}
                        onChange={(e) => setIncludeMeds(e.target.checked)}
                        className="rounded text-teal-600"
                      />
                      <span>Active Medications</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includeTimeline}
                        onChange={(e) => setIncludeTimeline(e.target.checked)}
                        className="rounded text-teal-600"
                      />
                      <span>Health Timeline</span>
                    </label>
                  </div>
                )}
              </div>

              {/* Expiry */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Link Validity</label>
                <select
                  value={expiryHours}
                  onChange={(e) => setExpiryHours(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
                >
                  <option value="24">Expires in 24 Hours</option>
                  <option value="48">Expires in 48 Hours</option>
                  <option value="72">Expires in 3 Days</option>
                  <option value="168">Expires in 7 Days</option>
                </select>
              </div>

              {/* Actions */}
              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-2 text-slate-600 hover:text-slate-800 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl shadow-xs transition cursor-pointer"
                >
                  Generate Share Link
                </button>
              </div>
            </form>
          ) : (
            /* Link Result - Clean, no long raw url written out */
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-teal-50 border border-teal-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-teal-900 text-sm">Doctor Access Link Ready</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-200/70 text-teal-800">
                    {generatedLink.expiresAt}
                  </span>
                </div>

                <div className="p-3 bg-white rounded-lg border border-teal-200 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Recipient</span>
                    <span className="font-bold text-slate-800 text-xs">{generatedLink.recipientDoctor}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Access PIN</span>
                    <span className="font-mono font-extrabold text-sm text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {generatedLink.accessPin}
                    </span>
                  </div>
                </div>

                <button
                  onClick={copyUrl}
                  className="w-full py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copied Link & PIN!' : 'Copy Link and PIN'}</span>
                </button>
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => setGeneratedLink(null)}
                  className="px-3 py-2 text-slate-600 hover:text-slate-800 font-semibold cursor-pointer"
                >
                  Create Another
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
