import React from 'react';
import { Mail, Check, X, ShieldCheck, Users, Heart } from 'lucide-react';
import { FamilyInvitation } from '../types';

interface PendingInvitationsBannerProps {
  invitations: FamilyInvitation[];
  onAccept: (invitation: FamilyInvitation) => void;
  onDecline: (invitation: FamilyInvitation) => void;
}

export const PendingInvitationsBanner: React.FC<PendingInvitationsBannerProps> = ({
  invitations,
  onAccept,
  onDecline,
}) => {
  if (!invitations || invitations.length === 0) return null;

  return (
    <div className="space-y-3 mb-6 animate-in slide-in-from-top-3 duration-200">
      {invitations.map((inv) => (
        <div
          key={inv.id}
          className="p-4 sm:p-5 bg-gradient-to-r from-teal-900 via-slate-900 to-teal-950 text-white rounded-2xl shadow-lg border border-teal-700/50 flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-300 border border-teal-400/30 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Users className="w-5 h-5 text-teal-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-300">
                  Family Invitation Received
                </span>
                <span className="px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-200 text-[10px] font-semibold border border-teal-400/20">
                  Personal Code Match
                </span>
              </div>
              <h3 className="text-base font-extrabold text-white mt-0.5">
                <span className="text-teal-200">{inv.inviterName}</span> invited you to join their Family Vault
              </h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Vault: <strong className="text-white">{inv.familyName}</strong> • Relationship:{' '}
                <strong className="text-teal-200">{inv.proposedRelationship}</strong>
                {inv.note && (
                  <span className="block italic text-slate-400 mt-1">"{inv.note}"</span>
                )}
              </p>
              <div className="mt-2 flex items-center gap-2 text-[11px] text-teal-300/80">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Accepting will securely link your profiles together into this family vault.</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-shrink-0 self-end md:self-center">
            <button
              onClick={() => onDecline(inv)}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-bold transition flex items-center gap-1.5"
            >
              <X className="w-4 h-4" />
              <span>Decline</span>
            </button>
            <button
              onClick={() => onAccept(inv)}
              className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-black shadow-md transition flex items-center gap-1.5"
            >
              <Check className="w-4 h-4 text-slate-950" />
              <span>Accept & Join Family</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
