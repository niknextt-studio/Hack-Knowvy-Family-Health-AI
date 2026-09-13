import React from 'react';
import {
  LayoutDashboard,
  Clock,
  FileText,
  Sparkles,
  Users,
  Upload,
} from 'lucide-react';
import { NavView } from './Sidebar';

interface MobileNavProps {
  currentView: NavView;
  onSelectView: (view: NavView) => void;
  onOpenUpload: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  currentView,
  onSelectView,
  onOpenUpload,
}) => {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 py-2 flex items-center justify-around shadow-lg">
      <button
        onClick={() => onSelectView('overview')}
        className={`flex flex-col items-center gap-0.5 text-[10px] font-medium transition ${
          currentView === 'overview' ? 'text-teal-700 font-bold' : 'text-slate-500'
        }`}
      >
        <LayoutDashboard className="w-4 h-4" />
        <span>Overview</span>
      </button>

      <button
        onClick={() => onSelectView('members')}
        className={`flex flex-col items-center gap-0.5 text-[10px] font-medium transition ${
          currentView === 'members' ? 'text-teal-700 font-bold' : 'text-slate-500'
        }`}
      >
        <Users className="w-4 h-4" />
        <span>Members</span>
      </button>

      {/* Floating center upload */}
      <button
        onClick={onOpenUpload}
        className="flex flex-col items-center justify-center -mt-5 w-12 h-12 rounded-full bg-teal-600 text-white shadow-md shadow-teal-700/30 hover:bg-teal-700 transition"
        title="Upload Record"
      >
        <Upload className="w-5 h-5" />
      </button>

      <button
        onClick={() => onSelectView('timeline')}
        className={`flex flex-col items-center gap-0.5 text-[10px] font-medium transition ${
          currentView === 'timeline' ? 'text-teal-700 font-bold' : 'text-slate-500'
        }`}
      >
        <Clock className="w-4 h-4" />
        <span>Timeline</span>
      </button>

      <button
        onClick={() => onSelectView('ai_assistant')}
        className={`flex flex-col items-center gap-0.5 text-[10px] font-medium transition ${
          currentView === 'ai_assistant' ? 'text-teal-700 font-bold' : 'text-slate-500'
        }`}
      >
        <Sparkles className="w-4 h-4" />
        <span>AI Assistant</span>
      </button>
    </div>
  );
};
