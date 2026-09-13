import React, { useState, useRef, useEffect } from 'react';
import {
  ShieldCheck,
  Search,
  Bell,
  Share2,
  Lock,
  ChevronDown,
  User,
  Users,
  ExternalLink,
  Sparkles,
  LayoutDashboard,
  Clock,
  FileText,
  Pill,
  Calendar,
  GitBranch,
  Plus,
  Copy,
  Check,
  PanelLeft,
  MoreHorizontal,
} from 'lucide-react';
import { Family, FamilyMember, NotificationItem } from '../types';
import { NavView } from './Sidebar';

interface NavbarProps {
  family: Family;
  members: FamilyMember[];
  currentUser: FamilyMember;
  activeMember?: FamilyMember;
  currentView?: NavView;
  onSelectView?: (view: NavView) => void;
  onSelectUser: (member: FamilyMember) => void;
  onOpenSearch: () => void;
  onOpenDoctorShare: () => void;
  onOpenPrivacy: () => void;
  onOpenUpload: () => void;
  notifications: NotificationItem[];
  onMarkNotificationRead: (id: string) => void;
  onViewLanding: () => void;
  isLandingActive: boolean;
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  family,
  members,
  currentUser,
  activeMember = currentUser,
  currentView = 'overview',
  onSelectView,
  onSelectUser,
  onOpenSearch,
  onOpenDoctorShare,
  onOpenPrivacy,
  onOpenUpload,
  notifications,
  onMarkNotificationRead,
  onViewLanding,
  isLandingActive,
  isSidebarOpen,
  onToggleSidebar,
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const userMenuRef = useRef<HTMLDivElement>(null);
  const notifMenuRef = useRef<HTMLDivElement>(null);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (userMenuRef.current && !userMenuRef.current.contains(target)) {
        setShowUserMenu(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(target)) {
        setShowNotifMenu(false);
      }
      if (moreMenuRef.current && !moreMenuRef.current.contains(target)) {
        setShowMoreMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadNotifs = notifications.filter((n) => n.unread);

  const handleCopyInvite = () => {
    navigator.clipboard.writeText(family.inviteCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Primary desktop navigation tabs
  const primaryTabs: { id: NavView; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'members', label: 'Members', icon: Users },
    { id: 'timeline', label: 'Timeline', icon: Clock },
    { id: 'reports', label: 'Reports & Labs', icon: FileText },
    { id: 'medications', label: 'Medications', icon: Pill },
    { id: 'ai_assistant', label: 'AI Assistant', icon: Sparkles },
    { id: 'family_history', label: 'Family Insights', icon: GitBranch },
  ];

  // Secondary items placed under the "More" dropdown
  const secondaryTabs: { id: NavView; label: string; icon: React.ComponentType<{ className?: string }>; desc: string }[] = [
    { id: 'appointments', label: 'Appointments & Doctors', icon: Calendar, desc: 'Physicians, clinics, and schedules' },
    { id: 'doctor_sharing', label: 'Doctor Sharing Links', icon: Share2, desc: 'PIN-protected temporary provider links' },
    { id: 'settings', label: 'Privacy & Security', icon: Lock, desc: 'Permissions, invite codes, and audits' },
  ];

  const isSecondaryActive = secondaryTabs.some((tab) => tab.id === currentView);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 h-16 flex items-center justify-between gap-2 lg:gap-4">
        
        {/* LEFT SECTION: Logo & Family Context */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-shrink-0">
          {/* Optional Sidebar Toggle for Desktop */}
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className={`hidden md:flex items-center justify-center p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition ${
                isSidebarOpen ? 'bg-slate-100 text-teal-700' : ''
              }`}
              title={isSidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
              aria-label="Toggle navigation sidebar"
            >
              <PanelLeft className="w-4 h-4" />
            </button>
          )}

          {/* Logo & Brand */}
          <button
            onClick={onViewLanding}
            className="flex items-center gap-2 text-left group focus:outline-none"
            title="Go to Home / Public Landing"
          >
            <div className="w-9 h-9 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-xs shadow-teal-700/20 group-hover:bg-teal-700 transition">
              <ShieldCheck className="w-5 h-5 text-teal-50" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-base tracking-tight text-slate-900 group-hover:text-teal-700 transition leading-none">
                Family Health AI
              </span>
              <span className="text-[10px] font-semibold text-slate-400 tracking-wide mt-0.5 hidden sm:inline">
                Secure Health Vault
              </span>
            </div>
          </button>

          {/* Family Space Badge with 1-click invite copy */}
          {!isLandingActive && (
            <div className="hidden xl:flex items-center ml-1 pl-3 border-l border-slate-200">
              <button
                onClick={handleCopyInvite}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200/90 rounded-lg text-xs font-medium text-slate-700 transition group"
                title={`Family Space: ${family.name}. Click to copy invite code: ${family.inviteCode}`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-semibold text-slate-800">{family.name}</span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {family.inviteCode}
                </span>
                {copiedCode ? (
                  <Check className="w-3 h-3 text-emerald-600" />
                ) : (
                  <Copy className="w-3 h-3 text-slate-400 group-hover:text-slate-600" />
                )}
              </button>
            </div>
          )}
        </div>

        {/* CENTER SECTION: Desktop Navigation Bar */}
        {onSelectView && !isLandingActive && (
          <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1 flex-1 justify-center max-w-2xl px-2">
            {primaryTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = currentView === tab.id;
              const isAI = tab.id === 'ai_assistant';

              return (
                <button
                  key={tab.id}
                  onClick={() => onSelectView(tab.id)}
                  className={`relative flex items-center gap-1.5 px-2.5 xl:px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap ${
                    isActive
                      ? 'bg-teal-50 text-teal-800 font-semibold border border-teal-200/80 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                  title={tab.label}
                >
                  <Icon
                    className={`w-3.5 h-3.5 ${
                      isActive ? 'text-teal-700' : isAI ? 'text-teal-600' : 'text-slate-500'
                    }`}
                  />
                  <span>{tab.label}</span>
                  {isAI && (
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-600 ring-2 ring-teal-100 animate-pulse" />
                  )}
                </button>
              );
            })}

            {/* "More" Navigation Dropdown */}
            <div className="relative" ref={moreMenuRef}>
              <button
                onClick={() => setShowMoreMenu(!showMoreMenu)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap ${
                  isSecondaryActive || showMoreMenu
                    ? 'bg-teal-50 text-teal-800 font-semibold border border-teal-200/80'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
                title="More navigation options"
              >
                <MoreHorizontal className="w-3.5 h-3.5 text-slate-500" />
                <span>More</span>
                <ChevronDown className="w-3 h-3 text-slate-400 ml-0.5" />
              </button>

              {showMoreMenu && (
                <div className="absolute left-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-lg z-50 p-2 text-xs animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Additional Health Tools
                  </div>
                  <div className="space-y-1">
                    {secondaryTabs.map((item) => {
                      const ItemIcon = item.icon;
                      const isActive = currentView === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            onSelectView(item.id);
                            setShowMoreMenu(false);
                          }}
                          className={`w-full flex items-start gap-2.5 px-3 py-2 rounded-lg text-left transition ${
                            isActive
                              ? 'bg-teal-50 text-teal-900 font-semibold'
                              : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <ItemIcon className={`w-4 h-4 mt-0.5 ${isActive ? 'text-teal-700' : 'text-slate-500'}`} />
                          <div>
                            <div className="font-medium text-slate-900 leading-snug">{item.label}</div>
                            <div className="text-[11px] text-slate-500 font-normal leading-tight">{item.desc}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </nav>
        )}

        {/* RIGHT SECTION: Quick Actions & Profile */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          {/* Global Search Button */}
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100/80 hover:bg-slate-100 text-slate-600 hover:text-slate-900 rounded-lg text-xs font-medium transition border border-transparent hover:border-slate-200/80"
            title="Global search records, conditions, medications (Cmd+K)"
          >
            <Search className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden xl:inline text-slate-600">Search</span>
            <kbd className="hidden sm:inline-block px-1 py-0.2 text-[10px] bg-white border border-slate-200 rounded text-slate-500 shadow-2xs font-mono">
              ⌘K
            </kbd>
          </button>

          {/* Quick Record Upload */}
          <button
            onClick={onOpenUpload}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow-xs transition"
            title="Upload laboratory test, prescription, or clinical document"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Upload</span>
          </button>

          {/* Doctor Share Quick Link (Hidden on smaller screens) */}
          <button
            onClick={onOpenDoctorShare}
            className="hidden 2xl:flex items-center gap-1.5 px-2.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 rounded-lg text-xs font-medium transition"
            title="Create a PIN-protected temporary link for a physician"
          >
            <Share2 className="w-3.5 h-3.5 text-slate-500" />
            <span>Doctor Link</span>
          </button>

          {/* Notifications Dropdown */}
          <div className="relative" ref={notifMenuRef}>
            <button
              onClick={() => setShowNotifMenu(!showNotifMenu)}
              className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
              title="Notifications and updates"
              aria-label="View notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifs.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-teal-600 rounded-full ring-2 ring-white" />
              )}
            </button>

            {showNotifMenu && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-xl shadow-lg z-50 p-3 animate-in fade-in zoom-in-95 duration-100">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm text-slate-900">Notifications</span>
                    {unreadNotifs.length > 0 && (
                      <span className="text-[11px] bg-teal-50 text-teal-700 font-semibold px-2 py-0.5 rounded-full">
                        {unreadNotifs.length} unread
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400">Calm health alerts</span>
                </div>

                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-400">
                      No notifications at this time.
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => onMarkNotificationRead(n.id)}
                        className={`p-2.5 rounded-lg text-xs cursor-pointer transition ${
                          n.unread ? 'bg-teal-50/50 border border-teal-100' : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <span className="font-semibold text-slate-900">{n.title}</span>
                          <span className="text-[10px] text-slate-400 whitespace-nowrap">{n.timestamp}</span>
                        </div>
                        <p className="text-slate-600 leading-relaxed">{n.message}</p>
                        {n.memberName && (
                          <div className="mt-1.5 flex items-center gap-1 text-[10px] font-semibold text-teal-700">
                            <User className="w-3 h-3" />
                            <span>{n.memberName}</span>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Privacy & Permissions Trigger */}
          <button
            onClick={onOpenPrivacy}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
            title="Privacy controls and member record permissions"
            aria-label="Open privacy settings"
          >
            <Lock className="w-4 h-4 text-slate-500" />
          </button>

          {/* User Profile & Family Member Switcher */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 pl-1.5 pr-1 py-1 rounded-lg hover:bg-slate-100 transition text-left border border-transparent hover:border-slate-200/80"
              title={`Viewing as ${activeMember.name}. Click to switch family member.`}
            >
              <div className="relative">
                <img
                  src={activeMember.avatar || currentUser.avatar}
                  alt={activeMember.name}
                  className="w-7 h-7 rounded-full object-cover border border-slate-200"
                />
                <span
                  className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full ring-2 ring-white ${
                    activeMember.status === 'healthy'
                      ? 'bg-emerald-500'
                      : activeMember.status === 'stable'
                      ? 'bg-teal-500'
                      : 'bg-amber-500'
                  }`}
                />
              </div>

              <div className="hidden md:block">
                <div className="text-xs font-bold text-slate-800 leading-tight">
                  {activeMember.name}
                </div>
                <div className="text-[10px] text-slate-500 leading-none mt-0.5">
                  {activeMember.relationship === 'Self' ? 'Family Admin' : activeMember.relationship}
                </div>
              </div>

              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-lg z-50 p-2 text-xs animate-in fade-in zoom-in-95 duration-100">
                {/* Active Member Status Header */}
                <div className="px-3 py-2 border-b border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{activeMember.name}</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {activeMember.bloodType} • {activeMember.age}y
                    </span>
                  </div>
                  <div className="text-slate-500 text-[11px] mt-0.5">{family.name}</div>
                  <div className="mt-1.5 inline-flex items-center gap-1 text-[10px] text-teal-700 font-semibold bg-teal-50 px-2 py-0.5 rounded-md">
                    <ShieldCheck className="w-3 h-3" />
                    Encrypted Family Health Space
                  </div>
                </div>

                {/* Profile Switcher List */}
                <div className="py-1">
                  <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Switch Active Member Profile
                  </div>
                  {members.map((m) => {
                    const isSelected = m.id === activeMember.id;
                    return (
                      <button
                        key={m.id}
                        onClick={() => {
                          onSelectUser(m);
                          setShowUserMenu(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg hover:bg-slate-50 text-left transition ${
                          isSelected ? 'bg-teal-50/80 font-semibold text-teal-900' : 'text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <img src={m.avatar} alt={m.name} className="w-6 h-6 rounded-full object-cover" />
                          <span>{m.name}</span>
                        </div>
                        <span className="text-[10px] text-slate-400">{m.relationship}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Quick Vault & Public Links */}
                <div className="pt-1 mt-1 border-t border-slate-100 space-y-0.5">
                  <button
                    onClick={() => {
                      onOpenDoctorShare();
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition"
                  >
                    <Share2 className="w-3.5 h-3.5 text-slate-500" />
                    <span>Generate Doctor Share Link</span>
                  </button>
                  <button
                    onClick={() => {
                      onOpenPrivacy();
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition"
                  >
                    <Lock className="w-3.5 h-3.5 text-slate-500" />
                    <span>Privacy & Access Permissions</span>
                  </button>
                  <button
                    onClick={() => {
                      onViewLanding();
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                    <span>Public Overview Page</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </header>
  );
};
