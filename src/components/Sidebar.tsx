import React from 'react';
import {
  LayoutDashboard,
  Users,
  Clock,
  FileText,
  Pill,
  Calendar,
  Stethoscope,
  Sparkles,
  GitBranch,
  Share2,
  Lock,
  Upload,
  ChevronRight,
  X,
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
  activeMember?: FamilyMember;
  members?: FamilyMember[];
  onSelectMember?: (member: FamilyMember) => void;
  onClose?: () => void;
}

interface NavItemConfig {
  id: NavView;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  iconColor: string;
  badge?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  onOpenUpload,
  onClose,
}) => {
  const navItems: NavItemConfig[] = [
    {
      id: 'overview',
      label: 'Overview',
      icon: LayoutDashboard,
      iconBg: 'bg-teal-50 text-teal-600',
      iconColor: 'text-teal-600',
    },
    {
      id: 'ai_assistant',
      label: 'AI Assistant',
      icon: Sparkles,
      iconBg: 'bg-purple-50 text-purple-600',
      iconColor: 'text-purple-600',
      badge: 'AI',
    },
    {
      id: 'reports',
      label: 'Lab Reports',
      icon: FileText,
      iconBg: 'bg-blue-50 text-blue-600',
      iconColor: 'text-blue-600',
    },
    {
      id: 'medications',
      label: 'Medications',
      icon: Pill,
      iconBg: 'bg-amber-50 text-amber-600',
      iconColor: 'text-amber-600',
    },
    {
      id: 'members',
      label: 'Family Members',
      icon: Users,
      iconBg: 'bg-emerald-50 text-emerald-600',
      iconColor: 'text-emerald-600',
    },
    {
      id: 'timeline',
      label: 'Timeline',
      icon: Clock,
      iconBg: 'bg-cyan-50 text-cyan-600',
      iconColor: 'text-cyan-600',
    },
    {
      id: 'appointments',
      label: 'Doctor Visits',
      icon: Stethoscope,
      iconBg: 'bg-teal-50 text-teal-600',
      iconColor: 'text-teal-600',
    },
    {
      id: 'family_history',
      label: 'Family Insights',
      icon: GitBranch,
      iconBg: 'bg-indigo-50 text-indigo-600',
      iconColor: 'text-indigo-600',
    },
    {
      id: 'doctor_sharing',
      label: 'Doctor Sharing',
      icon: Share2,
      iconBg: 'bg-sky-50 text-sky-600',
      iconColor: 'text-sky-600',
    },
    {
      id: 'settings',
      label: 'Privacy & Security',
      icon: Lock,
      iconBg: 'bg-slate-100 text-slate-600',
      iconColor: 'text-slate-600',
    },
  ];

  return (
    <div className="w-full h-full flex flex-col bg-white select-none">
      {/* 1. Header with visual title & close button on mobile */}
      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Navigation
        </span>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="md:hidden p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
            title="Close menu"
            aria-label="Close menu"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* 2. Visual Action: Quick Upload Record */}
      <div className="p-3 pb-2 flex-shrink-0">
        <button
          type="button"
          onClick={onOpenUpload}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-xs shadow-teal-700/15 transition cursor-pointer active:scale-[0.99]"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Upload Record</span>
        </button>
      </div>

      {/* 3. Visual Navigation List with Color Indicators */}
      <nav className="flex-1 overflow-y-auto px-2.5 py-1 space-y-1 scrollbar-thin">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectView(item.id)}
              className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-semibold transition group cursor-pointer ${
                isActive
                  ? 'bg-teal-50 text-teal-900 font-bold border border-teal-200/80 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center transition flex-shrink-0 ${
                  isActive ? 'bg-teal-600 text-white shadow-2xs' : item.iconBg
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : item.iconColor}`} />
              </div>

              <span className="truncate flex-1 text-left">{item.label}</span>

              {item.badge && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-purple-100 text-purple-700">
                  {item.badge}
                </span>
              )}

              {isActive && (
                <ChevronRight className="w-3.5 h-3.5 text-teal-600 ml-auto flex-shrink-0" />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};
