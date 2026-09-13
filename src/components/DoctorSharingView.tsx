import React, { useState } from 'react';
import {
  Share2,
  Copy,
  Check,
  Trash2,
  Eye,
  Plus,
  FileCheck,
  Clock,
  Key,
  X,
  CheckCircle,
} from 'lucide-react';
import { FamilyMember, ShareLink } from '../types';
import { UserAvatar, formatMemberOptionLabel } from './UserAvatar';

interface DoctorSharingViewProps {
  members: FamilyMember[];
  activeMember: FamilyMember;
  shareLinks: ShareLink[];
  onGenerateLinkClick: () => void;
  onRevokeLink: (linkId: string) => void;
}

export const DoctorSharingView: React.FC<DoctorSharingViewProps> = ({
  members,
  activeMember,
  shareLinks,
  onGenerateLinkClick,
  onRevokeLink,
}) => {
  const [copiedLinkId, setCopiedLinkId] = useState<string | null>(null);
  const [previewLink, setPreviewLink] = useState<ShareLink | null>(null);
  const [filterMemberId, setFilterMemberId] = useState<string>('all');

  // Quick 1-click generator state
  const [quickMemberId, setQuickMemberId] = useState<string>(activeMember.id);
  const [quickDoctor, setQuickDoctor] = useState<string>('Dr. Sameer Gupta');
  const [quickExpiry, setQuickExpiry] = useState<string>('48');
  const [quickSuccess, setQuickSuccess] = useState<ShareLink | null>(null);

  const handleCopy = (link: ShareLink) => {
    navigator.clipboard.writeText(`${link.url} (PIN: ${link.accessPin})`);
    setCopiedLinkId(link.id);
    setTimeout(() => setCopiedLinkId(null), 2000);
  };

  const handleQuickCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const target = members.find((m) => m.id === quickMemberId) || activeMember;
    const pin = Math.floor(1000 + Math.random() * 9000).toString();
    // Anonymous token - strictly no patient names in links
    const token = Math.floor(100000 + Math.random() * 900000).toString();
    const linkUrl = `${window.location.origin}/share/${token}`;

    const newLink: ShareLink = {
      id: `share-${Date.now()}`,
      memberId: target.id,
      recipientDoctor: quickDoctor.trim() || 'Attending Physician',
      expiresAt: `${quickExpiry}h remaining`,
      accessPin: pin,
      sectionsIncluded: [
        'Full Health Summary',
        'All Diagnostic & Lab Reports',
        'Active Medications & Dosages',
        'Medical Timeline & Procedures',
        'Vital Signs & Biomarkers',
      ],
      status: 'active',
      url: linkUrl,
      createdAt: 'Just now',
    };

    shareLinks.unshift(newLink);
    setQuickSuccess(newLink);
  };

  const filteredLinks = shareLinks.filter((l) => {
    if (filterMemberId === 'all') return true;
    return l.memberId === filterMemberId;
  });

  return (
    <div id="doctor-sharing-page" className="max-w-6xl mx-auto space-y-5 pb-16">
      {/* 1. COMPACT CLEAN HEADER */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Doctor Sharing
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage temporary PIN-protected portals for healthcare providers
          </p>
        </div>

        <button
          onClick={onGenerateLinkClick}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Share Full Health Report</span>
        </button>
      </div>

      {/* 2. QUICK ONE-CLICK GENERATOR */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-teal-700" />
            <h2 className="font-extrabold text-slate-900 text-sm">
              Quick Share: Full Health Report
            </h2>
          </div>
          <span className="text-[11px] text-teal-700 font-bold bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
            Includes all records, vitals & labs
          </span>
        </div>

        <form onSubmit={handleQuickCreate} className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
          {/* Member */}
          <div className="sm:col-span-4">
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Family Member</label>
            <select
              value={quickMemberId}
              onChange={(e) => setQuickMemberId(e.target.value)}
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
          <div className="sm:col-span-4">
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Doctor / Clinic</label>
            <input
              type="text"
              required
              value={quickDoctor}
              onChange={(e) => setQuickDoctor(e.target.value)}
              placeholder="e.g. Dr. Sameer Gupta"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Expiry */}
          <div className="sm:col-span-2">
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Validity</label>
            <select
              value={quickExpiry}
              onChange={(e) => setQuickExpiry(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
            >
              <option value="24">24 Hours</option>
              <option value="48">48 Hours</option>
              <option value="72">3 Days</option>
              <option value="168">7 Days</option>
            </select>
          </div>

          {/* Submit */}
          <div className="sm:col-span-2 flex items-end">
            <button
              type="submit"
              className="w-full py-2 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl shadow-xs transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Generate Link</span>
            </button>
          </div>
        </form>

        {/* Clean instant feedback card after quick create - NO long raw URL printed */}
        {quickSuccess && (
          <div className="p-3.5 rounded-xl bg-teal-50 border border-teal-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-teal-600 shrink-0" />
              <div>
                <span className="font-bold text-teal-900 block">
                  Link Ready for {quickSuccess.recipientDoctor}
                </span>
                <span className="text-[11px] text-teal-700">
                  Full Health Report access • Valid for {quickSuccess.expiresAt}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="font-mono text-xs font-extrabold text-slate-900 bg-white px-2.5 py-1 rounded-lg border border-teal-200">
                PIN: {quickSuccess.accessPin}
              </span>
              <button
                onClick={() => handleCopy(quickSuccess)}
                className="px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-lg font-bold transition flex items-center gap-1 cursor-pointer"
              >
                {copiedLinkId === quickSuccess.id ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Link & PIN</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 3. ACTIVE LINKS TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {/* Table Controls */}
        <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-900 text-sm">Active Shared Links</span>
            <span className="text-xs font-bold text-slate-500 bg-slate-200/80 px-2 py-0.5 rounded-full">
              {filteredLinks.length}
            </span>
          </div>

          {/* Member Filter Pills */}
          <div className="flex items-center gap-1 overflow-x-auto text-xs">
            <button
              onClick={() => setFilterMemberId('all')}
              className={`px-2.5 py-1 rounded-lg font-bold cursor-pointer transition ${
                filterMemberId === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              All
            </button>
            {members.map((m) => (
              <button
                key={m.id}
                onClick={() => setFilterMemberId(m.id)}
                className={`px-2.5 py-1 rounded-lg font-bold cursor-pointer transition flex items-center gap-1.5 ${
                  filterMemberId === m.id
                    ? 'bg-teal-700 text-white'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <UserAvatar avatar={m.avatar} name={m.name} size="xs" />
                <span>{m.name.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Links List */}
        {filteredLinks.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs space-y-1">
            <p className="font-bold text-slate-700">No active links for this filter</p>
            <p>Use the quick generator above to create a doctor access link.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-100/70 text-slate-600 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Patient</th>
                  <th className="py-3 px-4">Doctor / Clinic</th>
                  <th className="py-3 px-4">Scope</th>
                  <th className="py-3 px-4">Access PIN</th>
                  <th className="py-3 px-4">Validity</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLinks.map((link) => {
                  const targetMem = members.find((m) => m.id === link.memberId) || activeMember;
                  const isCopied = copiedLinkId === link.id;

                  return (
                    <tr key={link.id} className="hover:bg-slate-50/80 transition">
                      {/* Patient */}
                      <td className="py-3.5 px-4 whitespace-nowrap font-medium text-slate-900">
                        <div className="flex items-center gap-2.5">
                          <UserAvatar avatar={targetMem.avatar} name={targetMem.name} size="md" />
                          <div>
                            <span className="font-bold block">{targetMem.name}</span>
                            <span className="text-[10px] text-slate-400">
                              {targetMem.relationship} • {targetMem.age}y
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Doctor */}
                      <td className="py-3.5 px-4 whitespace-nowrap font-bold text-slate-800">
                        {link.recipientDoctor}
                      </td>

                      {/* Scope Badge */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          <FileCheck className="w-3 h-3 text-emerald-600" />
                          <span>Full Health Report</span>
                        </span>
                      </td>

                      {/* Clean PIN pill - NO long URL string displayed */}
                      <td className="py-3.5 px-4">
                        <span className="font-mono px-2 py-1 rounded-md bg-slate-100 text-slate-900 text-xs font-bold border border-slate-200">
                          PIN: {link.accessPin}
                        </span>
                      </td>

                      {/* Expiry */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-500 font-medium">
                        <div className="flex items-center gap-1 text-[11px]">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{link.expiresAt}</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleCopy(link)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                              isCopied
                                ? 'bg-emerald-600 text-white'
                                : 'bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200'
                            }`}
                          >
                            {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{isCopied ? 'Copied' : 'Copy Link'}</span>
                          </button>

                          <button
                            onClick={() => setPreviewLink(link)}
                            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 border border-slate-200 cursor-pointer"
                            title="Preview Doctor View"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => onRevokeLink(link.id)}
                            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 border border-rose-200 cursor-pointer"
                            title="Revoke link"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 4. CLEAN DOCTOR VIEW PREVIEW MODAL */}
      {previewLink && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-xl w-full max-h-[85vh] overflow-y-auto">
            {/* Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                  Doctor Portal (Read-Only)
                </span>
                <h3 className="font-bold text-slate-900 text-sm mt-1">
                  Provider View for {previewLink.recipientDoctor}
                </h3>
              </div>
              <button
                onClick={() => setPreviewLink(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Doctor View Content */}
            <div className="p-5 space-y-4 text-xs">
              {(() => {
                const target = members.find((m) => m.id === previewLink.memberId) || activeMember;
                return (
                  <>
                    {/* Patient Header */}
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                      <UserAvatar avatar={target.avatar} name={target.name} size="xl" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-extrabold text-slate-900 text-base">{target.name}</h4>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                            Full Health Report
                          </span>
                        </div>
                        <span className="text-slate-500 text-[11px]">
                          {target.age} yrs • Blood Group: {target.bloodType} • Primary: {target.primaryPhysician}
                        </span>
                      </div>
                    </div>

                    {/* Vitals Summary */}
                    <div className="grid grid-cols-3 gap-2">
                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                        <span className="text-slate-400 text-[10px] block font-semibold">Blood Pressure</span>
                        <strong className="text-slate-900 text-xs">{target.vitals.bloodPressure}</strong>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                        <span className="text-slate-400 text-[10px] block font-semibold">HbA1c</span>
                        <strong className="text-teal-800 text-xs">{target.vitals.hba1c || 'None'}</strong>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                        <span className="text-slate-400 text-[10px] block font-semibold">BMI & Weight</span>
                        <strong className="text-slate-900 text-xs">{target.vitals.bmi} ({target.vitals.weightKg}kg)</strong>
                      </div>
                    </div>

                    {/* Included Dossier Items */}
                    <div className="space-y-1.5 pt-1">
                      <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px] block">
                        Full Records Accessible to Physician:
                      </span>
                      <div className="space-y-1">
                        {[
                          'Comprehensive Clinical Summary & Diagnostic Trajectory',
                          'Complete Blood Tests & Pathology Panels',
                          'Diagnostic Imaging (DEXA Scan, Knee X-Rays)',
                          'Active Prescription Regimen & Dosages',
                          'Documented Drug Allergies & Clinical History',
                        ].map((item, i) => (
                          <div key={i} className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex items-center gap-2">
                            <Check className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                            <span className="font-medium text-slate-800">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
