import React from 'react';
import {
  LayoutDashboard,
  Users,
  Clock,
  FileText,
  Pill,
  Calendar,
  Sparkles,
  GitBranch,
  Share2,
  Lock,
  Upload,
  HeartPulse,
} from 'lucide-react';
import { FamilyMember } from '../types';

export type NavView =
  | 'overview'
  | 'members'
  | 'timeline'
  | 'reports'
  | 'medications'
  | 'appointments'
  | 'ai_assistant'
  | 'family_history'
  | 'doctor_sharing'
  | 'settings';

interface SidebarProps {
  currentView: NavView;
  onSelectView: (view: NavView) => void;
  onOpenUpload: () => void;
  activeMember: FamilyMember;
  members: FamilyMember[];
  onSelectMember: (member: FamilyMember) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  onOpenUpload,
  activeMember,
  members,
  onSelectMember,
}) => {
  const mainNavItems: { id: NavView; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'overview', label: 'Family Overview', icon: LayoutDashboard },
    { id: 'members', label: 'Family Members', icon: Users },
    { id: 'timeline', label: 'Health Timeline', icon: Clock },
    { id: 'reports', label: 'Medical Reports', icon: FileText },
    { id: 'medications', label: 'Medications', icon: Pill },
    { id: 'appointments', label: 'Appointments', icon: Calendar },
    { id: 'ai_assistant', label: 'AI Health Assistant', icon: Sparkles },
    { id: 'family_history', label: 'Family Health Insights', icon: GitBranch },
    { id: 'doctor_sharing', label: 'Doctor Sharing', icon: Share2 },
    { id: 'settings', label: 'Privacy & Access', icon: Lock },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between flex-shrink-0 min-h-[calc(100vh-4rem)] p-4">
      <div className="space-y-6">
        {/* Upload Action Button */}
        <button
          onClick={onOpenUpload}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-semibold shadow-sm shadow-teal-700/15 transition group"
        >
          <Upload className="w-4 h-4 transition group-hover:-translate-y-0.5" />
          <span>Upload Medical Record</span>
        </button>

        {/* Selected Member context card */}
        <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-xl">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>Viewing Profile</span>
            <span
              className={`w-2 h-2 rounded-full ${
                activeMember.status === 'healthy'
                  ? 'bg-emerald-500'
                  : activeMember.status === 'stable'
                  ? 'bg-teal-500'
                  : 'bg-amber-400 ring-2 ring-amber-200'
              }`}
            />
          </div>
          <div className="flex items-center gap-2.5">
            <img
              src={activeMember.avatar}
              alt={activeMember.name}
              className="w-9 h-9 rounded-full object-cover border border-slate-200"
            />
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-slate-900 truncate">{activeMember.name}</div>
              <div className="text-[11px] text-slate-500">{activeMember.age} yrs • {activeMember.bloodType}</div>
            </div>
          </div>

          <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between">
            <select
              value={activeMember.id}
              onChange={(e) => {
                const found = members.find((m) => m.id === e.target.value);
                if (found) onSelectMember(found);
              }}
              className="w-full text-xs bg-white border border-slate-200 rounded-lg px-2 py-1 text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-teal-500"
            >
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.relationship})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="space-y-1">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-1.5">
            Workspace
          </div>
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectView(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                  isActive
                    ? 'bg-teal-50 text-teal-800 font-bold border border-teal-200/60 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon
                  className={`w-4 h-4 transition ${
                    isActive ? 'text-teal-700' : 'text-slate-400 group-hover:text-slate-600'
                  }`}
                />
                <span>{item.label}</span>
                {item.id === 'ai_assistant' && (
                  <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full bg-teal-100/70 text-teal-800 font-bold">
                    AI
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Safety & Compliance notice */}
      <div className="pt-4 border-t border-slate-100">
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-600 leading-relaxed">
          <div className="flex items-center gap-1.5 font-bold text-slate-800 mb-1">
            <HeartPulse className="w-3.5 h-3.5 text-teal-600" />
            <span>Health Information Only</span>
          </div>
          <p className="text-[10px] text-slate-500">
            Family Health AI organizes medical records and does not provide clinical diagnoses. Always consult licensed doctors for medical concerns.
          </p>
        </div>
      </div>
    </aside>
  );
};
