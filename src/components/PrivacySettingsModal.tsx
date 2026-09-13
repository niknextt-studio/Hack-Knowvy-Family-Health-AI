import React, { useState } from 'react';
import {
  X,
  Lock,
  ShieldCheck,
  Eye,
  EyeOff,
  UserCheck,
  Clock,
  Check,
  AlertCircle,
} from 'lucide-react';
import { FamilyMember, PrivacyPermission, Family } from '../types';

interface PrivacySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: FamilyMember;
  family: Family;
  members: FamilyMember[];
  permissions: PrivacyPermission[];
  onUpdatePermission: (updated: PrivacyPermission) => void;
}

export const PrivacySettingsModal: React.FC<PrivacySettingsModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  family,
  members,
  permissions,
  onUpdatePermission,
}) => {
  const [activeTab, setActiveTab] = useState<'permissions' | 'audit'>('permissions');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Find or create default permission for current user
  const userPerm = permissions.find((p) => p.memberId === currentUser.id) || {
    id: `perm-${currentUser.id}`,
    memberId: currentUser.id,
    viewAccess: 'family' as const,
    allowSensitiveRecords: true,
    allowedMemberIds: members.map((m) => m.id),
  };

  const [viewAccess, setViewAccess] = useState(userPerm.viewAccess);
  const [allowSensitive, setAllowSensitive] = useState(userPerm.allowSensitiveRecords);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdatePermission({
      ...userPerm,
      viewAccess,
      allowSensitiveRecords: allowSensitive,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const mockAuditLogs = [
    {
      id: 'log-1',
      date: 'Today, 09:15 AM',
      actor: currentUser.name,
      action: 'Updated medical document view permissions',
      status: 'Security event verified',
    },
    {
      id: 'log-2',
      date: 'Yesterday, 04:30 PM',
      actor: 'Dr. Sameer Gupta',
      action: 'Accessed temporary doctor share link for Blood Panel',
      status: 'PIN verification passed',
    },
    {
      id: 'log-3',
      date: 'Sept 10, 2026',
      actor: 'Sunita Sharma',
      action: 'Viewed Rajesh Sharma Health Timeline milestone',
      status: 'Family permission verified',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Privacy & Access Controls</h3>
              <p className="text-[11px] text-slate-500">
                You control who in your family can view your health records
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

        {/* Tabs */}
        <div className="grid grid-cols-2 bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 text-center">
          <button
            onClick={() => setActiveTab('permissions')}
            className={`py-2.5 transition ${
              activeTab === 'permissions'
                ? 'bg-white text-teal-800 border-b-2 border-teal-600 font-bold'
                : 'hover:bg-slate-100'
            }`}
          >
            My Record Permissions
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`py-2.5 transition ${
              activeTab === 'audit'
                ? 'bg-white text-teal-800 border-b-2 border-teal-600 font-bold'
                : 'hover:bg-slate-100'
            }`}
          >
            Security Audit Log
          </button>
        </div>

        {/* Tab 1: Permissions */}
        {activeTab === 'permissions' && (
          <form onSubmit={handleSave} className="p-6 space-y-5 text-xs">
            <div className="p-3 bg-teal-50/70 border border-teal-200/80 rounded-xl text-teal-900 leading-relaxed">
              Family membership does not override individual privacy. Each member chooses whether their records are visible to the family or strictly private to themselves.
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-2">
                Who can view your health profile and documents?
              </label>

              <div className="space-y-2">
                <label
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${
                    viewAccess === 'family'
                      ? 'bg-teal-50/50 border-teal-300'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="viewAccess"
                    checked={viewAccess === 'family'}
                    onChange={() => setViewAccess('family')}
                    className="mt-0.5 text-teal-600 focus:ring-teal-500"
                  />
                  <div>
                    <span className="font-bold text-slate-900 block">All Registered Family Members</span>
                    <span className="text-slate-500 text-[11px]">
                      Members in "{family.name}" can view your timeline, medications, and non-sensitive reports.
                    </span>
                  </div>
                </label>

                <label
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${
                    viewAccess === 'self'
                      ? 'bg-teal-50/50 border-teal-300'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="viewAccess"
                    checked={viewAccess === 'self'}
                    onChange={() => setViewAccess('self')}
                    className="mt-0.5 text-teal-600 focus:ring-teal-500"
                  />
                  <div>
                    <span className="font-bold text-slate-900 block">Only Me (Private Vault)</span>
                    <span className="text-slate-500 text-[11px]">
                      Your records are completely invisible to other family members. Only you can view or query them.
                    </span>
                  </div>
                </label>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowSensitive}
                  onChange={(e) => setAllowSensitive(e.target.checked)}
                  className="mt-0.5 rounded text-teal-600 focus:ring-teal-500"
                />
                <div>
                  <span className="font-bold text-slate-900 block">Allow Sensitive Records Visibility</span>
                  <span className="text-slate-500 text-[11px]">
                    If unchecked, confidential records (such as mental health notes or sensitive scans) will require explicit PIN unlocking even for family members.
                  </span>
                </div>
              </label>
            </div>

            {savedSuccess && (
              <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5 font-semibold">
                <Check className="w-4 h-4" />
                <span>Privacy preferences saved successfully!</span>
              </div>
            )}

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
                className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-xs transition"
              >
                Save Permissions
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: Audit Logs */}
        {activeTab === 'audit' && (
          <div className="p-6 space-y-4 text-xs">
            <p className="text-slate-500">
              Every access to health records, doctor share links, and permission changes is cryptographically timestamped and logged.
            </p>

            <div className="space-y-2.5">
              {mockAuditLogs.map((log) => (
                <div key={log.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 space-y-1">
                  <div className="flex items-center justify-between font-bold text-slate-900">
                    <span>{log.actor}</span>
                    <span className="text-slate-400 font-normal text-[11px]">{log.date}</span>
                  </div>
                  <p className="text-slate-700">{log.action}</p>
                  <div className="text-[10px] text-teal-700 font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    <span>{log.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
