import React, { useState } from 'react';
import {
  X,
  UserPlus,
  Copy,
  Check,
  ShieldCheck,
  AlertCircle,
  Clock,
  Send,
  Heart,
  HelpCircle,
} from 'lucide-react';
import { FamilyMember, FamilyInvitation } from '../types';
import {
  findAccountByCode,
  findAccountByCodeAsync,
  saveInvitation,
  getSentInvitationsByUser,
} from '../services/accountService';

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: FamilyMember;
  currentFamilyMembers: FamilyMember[];
  onInviteCreated: (invitation: FamilyInvitation) => void;
}

export const InviteMemberModal: React.FC<InviteMemberModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  currentFamilyMembers,
  onInviteCreated,
}) => {
  const [targetCode, setTargetCode] = useState('');
  const [relationship, setRelationship] = useState<FamilyMember['relationship']>('Spouse');
  const [note, setNote] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [copiedMyCode, setCopiedMyCode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleCopyMyCode = () => {
    navigator.clipboard.writeText(currentUser.memberCode);
    setCopiedMyCode(true);
    setTimeout(() => setCopiedMyCode(false), 2000);
  };

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const formattedCode = targetCode.trim().toUpperCase();
    if (!formattedCode) {
      setErrorMsg('Please enter your family member’s unique code.');
      return;
    }

    // Check if inviting own code
    if (formattedCode === currentUser.memberCode.toUpperCase()) {
      setErrorMsg('You cannot invite yourself. Please enter a family member’s code.');
      return;
    }

    setIsSubmitting(true);

    // Look up target account in registered accounts or Firestore
    const targetUser = await findAccountByCodeAsync(formattedCode);
    if (!targetUser) {
      setIsSubmitting(false);
      setErrorMsg(
        `No account found with code "${formattedCode}". Please verify the code with your family member, or ensure they have registered their account first.`
      );
      return;
    }

    // Check if already in family
    const alreadyInFamily = currentFamilyMembers.some((m) => m.id === targetUser.id);
    if (alreadyInFamily) {
      setErrorMsg(`${targetUser.name} is already a member of your family vault.`);
      return;
    }

    // Check if invitation already pending
    const existingSent = getSentInvitationsByUser(currentUser.id);
    const alreadyPending = existingSent.some(
      (inv) => inv.inviteeId === targetUser.id && inv.status === 'pending'
    );
    if (alreadyPending) {
      setErrorMsg(`An invitation is already pending for ${targetUser.name}.`);
      return;
    }

    setIsSubmitting(true);

    const newInvitation: FamilyInvitation = {
      id: `inv-${Date.now()}`,
      familyId: currentUser.familyId || `fam-${currentUser.id.replace('mem-', '')}`,
      familyName: `${currentUser.name.split(' ')[0]}'s Family Vault`,
      inviterId: currentUser.id,
      inviterName: currentUser.name,
      inviterEmail: currentUser.email,
      inviterCode: currentUser.memberCode,
      inviteeId: targetUser.id,
      inviteeCode: targetUser.memberCode,
      inviteeName: targetUser.name,
      proposedRelationship: relationship,
      status: 'pending',
      createdAt: new Date().toISOString(),
      note: note.trim() || undefined,
    };

    saveInvitation(newInvitation);
    onInviteCreated(newInvitation);

    setTimeout(() => {
      setIsSubmitting(false);
      setSuccessMsg(
        `Invitation sent to ${targetUser.name}! Once they log in with their account and click "Accept", your family vault will be formed and both profiles will be visible.`
      );
      setTargetCode('');
      setNote('');
    }, 400);
  };

  const sentInvitations = getSentInvitationsByUser(currentUser.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-xs">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Invite Family Member</h2>
              <p className="text-xs text-slate-500">Connect securely using unique personal codes</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Card: Current User's Personal Code */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-teal-50/90 to-emerald-50/70 border border-teal-200/80">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold text-teal-800 uppercase tracking-wider block">
                  Your Unique Member Code
                </span>
                <div className="mt-1 flex items-center gap-2">
                  <span className="font-mono text-xl sm:text-2xl font-black text-teal-900 tracking-wider">
                    {currentUser.memberCode}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyMyCode}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-teal-100 border border-teal-300 rounded-lg text-xs font-bold text-teal-800 transition shadow-2xs"
                  >
                    {copiedMyCode ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
              <div className="hidden sm:block text-right">
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-700 bg-teal-100/70 px-2 py-0.5 rounded-md">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Private & Unique
                </span>
              </div>
            </div>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              Give this code in person or via message to your family member. For privacy, only users who enter your exact code can send you an invitation.
            </p>
          </div>

          {/* Form: Invite by Code */}
          <form onSubmit={handleSendInvite} className="space-y-4">
            <div className="border-t border-slate-100 pt-4">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                Send Invitation to Family Member
              </h3>

              {errorMsg && (
                <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                  <div>{errorMsg}</div>
                </div>
              )}

              {successMsg && (
                <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>{successMsg}</div>
                </div>
              )}

              {/* Code input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Member's Unique Code <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={targetCode}
                    onChange={(e) => setTargetCode(e.target.value.toUpperCase())}
                    placeholder="e.g. FH-849201"
                    className="w-full px-3.5 py-2.5 font-mono text-sm uppercase tracking-wider font-semibold border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition"
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  Ask your family member to open their profile and give you their 6-digit code.
                </p>
              </div>

              {/* Relationship input */}
              <div className="mt-4 space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Relationship to You <span className="text-rose-500">*</span>
                </label>
                <select
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value as FamilyMember['relationship'])}
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition bg-white"
                >
                  <option value="Spouse">Spouse</option>
                  <option value="Father">Father</option>
                  <option value="Mother">Mother</option>
                  <option value="Son">Son</option>
                  <option value="Daughter">Daughter</option>
                  <option value="Grandmother">Grandmother</option>
                  <option value="Grandfather">Grandfather</option>
                  <option value="Sibling">Sibling</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Personal Note */}
              <div className="mt-4 space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Invitation Note <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g., Let's organize our medical reports and consultations together."
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-5 w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? 'Verifying & Sending...' : 'Send Family Invitation'}</span>
              </button>
            </div>
          </form>

          {/* Sent Invitations Tracker */}
          {sentInvitations.length > 0 && (
            <div className="border-t border-slate-100 pt-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Sent Invitations ({sentInvitations.length})
                </h4>
              </div>
              <div className="space-y-2">
                {sentInvitations.map((inv) => (
                  <div
                    key={inv.id}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-900">
                        {inv.inviteeName} ({inv.proposedRelationship})
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Code: <span className="font-mono font-semibold">{inv.inviteeCode}</span>
                      </div>
                    </div>
                    <div>
                      {inv.status === 'pending' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                          <Clock className="w-3 h-3" />
                          Waiting for approval
                        </span>
                      ) : inv.status === 'accepted' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                          <Check className="w-3 h-3" />
                          Accepted & Connected
                        </span>
                      ) : (
                        <span className="text-[11px] font-semibold text-slate-400">Declined</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1">
            <Heart className="w-3.5 h-3.5 text-teal-600" />
            <span>Encrypted Family Circle</span>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
