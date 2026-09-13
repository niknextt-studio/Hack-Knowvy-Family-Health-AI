import React, { useState } from 'react';
import {
  X,
  Share2,
  Lock,
  Calendar,
  Check,
  Copy,
  Clock,
  ShieldCheck,
  Eye,
  AlertCircle,
} from 'lucide-react';
import { FamilyMember, ShareLink } from '../types';

interface DoctorShareModalProps {
  isOpen: boolean;
  member: FamilyMember;
  onClose: () => void;
  existingLinks: ShareLink[];
  onCreateLink: (link: ShareLink) => void;
}

export const DoctorShareModal: React.FC<DoctorShareModalProps> = ({
  isOpen,
  member,
  onClose,
  existingLinks,
  onCreateLink,
}) => {
  const [recipientDoctor, setRecipientDoctor] = useState('Dr. Sameer Gupta');
  const [expiryHours, setExpiryHours] = useState('48');
  const [includeSummary, setIncludeSummary] = useState(true);
  const [includeMeds, setIncludeMeds] = useState(true);
  const [includeTimeline, setIncludeTimeline] = useState(true);
  const [includeReports, setIncludeReports] = useState(true);
  const [generatedLink, setGeneratedLink] = useState<ShareLink | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const pin = Math.floor(1000 + Math.random() * 9000).toString();
    const token = Math.random().toString(36).substring(2, 10);
    const linkUrl = `https://familyhealth.ai/share/${token}`;

    const newLink: ShareLink = {
      id: `share-${Date.now()}`,
      memberId: member.id,
      recipientDoctor,
      expiresAt: `${expiryHours} hours`,
      accessPin: pin,
      sectionsIncluded: [
        includeSummary ? 'Personal Health Summary' : '',
        includeMeds ? 'Current Medications' : '',
        includeTimeline ? 'Health Timeline' : '',
        includeReports ? 'Diagnostic Reports' : '',
      ].filter(Boolean),
      status: 'active',
      url: linkUrl,
      createdAt: 'Just now',
    };

    setGeneratedLink(newLink);
    onCreateLink(newLink);
  };

  const copyUrl = () => {
    if (!generatedLink) return;
    navigator.clipboard.writeText(`${generatedLink.url} (Access PIN: ${generatedLink.accessPin})`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Share Health Records with Doctor
              </h3>
              <p className="text-[11px] text-slate-500">
                Generate secure, time-limited access for <strong className="text-slate-700">{member.name}</strong>
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

        {/* Content */}
        <div className="p-6 space-y-5 text-xs">
          {!generatedLink ? (
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="p-3 bg-teal-50/70 rounded-xl border border-teal-200/80 text-teal-900 leading-relaxed">
                Doctors do not need an account. They access a clean read-only summary protected by a 4-digit PIN that automatically expires.
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Recipient Doctor / Clinic Name
                </label>
                <input
                  type="text"
                  required
                  value={recipientDoctor}
                  onChange={(e) => setRecipientDoctor(e.target.value)}
                  placeholder="e.g. Dr. Sameer Gupta, MD"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Link Expiration</label>
                <select
                  value={expiryHours}
                  onChange={(e) => setExpiryHours(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                >
                  <option value="24">Expires in 24 Hours</option>
                  <option value="48">Expires in 48 Hours</option>
                  <option value="168">Expires in 7 Days</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Select Sections to Include:
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeSummary}
                      onChange={(e) => setIncludeSummary(e.target.checked)}
                      className="rounded text-teal-600 focus:ring-teal-500"
                    />
                    <span className="text-slate-700 font-medium">Personal Health Summary</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeMeds}
                      onChange={(e) => setIncludeMeds(e.target.checked)}
                      className="rounded text-teal-600 focus:ring-teal-500"
                    />
                    <span className="text-slate-700 font-medium">Active Medications & Dosing</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeReports}
                      onChange={(e) => setIncludeReports(e.target.checked)}
                      className="rounded text-teal-600 focus:ring-teal-500"
                    />
                    <span className="text-slate-700 font-medium">Recent Laboratory & Diagnostic Reports</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeTimeline}
                      onChange={(e) => setIncludeTimeline(e.target.checked)}
                      className="rounded text-teal-600 focus:ring-teal-500"
                    />
                    <span className="text-slate-700 font-medium">Chronological Health Timeline</span>
                  </label>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-xs transition"
                >
                  Generate Secure Access Link
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-teal-50 rounded-xl border border-teal-200 text-teal-900 space-y-3">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <ShieldCheck className="w-5 h-5 text-teal-700" />
                  <span>Secure Share Link Created</span>
                </div>
                <p className="text-[11px] text-teal-800 leading-relaxed">
                  Provide this link and security PIN to {generatedLink.recipientDoctor}. This link will expire automatically in {generatedLink.expiresAt}.
                </p>

                <div className="p-3 bg-white rounded-lg border border-teal-200 space-y-2">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Web Link</span>
                    <div className="font-mono font-semibold text-slate-800 break-all text-xs">
                      {generatedLink.url}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Required Access PIN</span>
                    <div className="font-mono font-bold text-base text-teal-800 tracking-wider">
                      {generatedLink.accessPin}
                    </div>
                  </div>
                </div>

                <button
                  onClick={copyUrl}
                  className="w-full py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold flex items-center justify-center gap-1.5 transition"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copied Link & PIN to Clipboard!' : 'Copy Link and Access PIN'}</span>
                </button>
              </div>

              <button
                onClick={() => setGeneratedLink(null)}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold transition text-center"
              >
                Create Another Link
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
