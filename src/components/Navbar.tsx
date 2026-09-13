import React, { useState, useRef, useEffect } from 'react';
import {
  ShieldCheck,
  Bell,
  User,
  Menu,
  X,
  ChevronDown,
  LayoutDashboard,
  Users,
  Clock,
  FileText,
  Pill,
  Sparkles,
  GitBranch,
  Calendar,
  Share2,
  Lock,
  Plus,
  Search,
  Copy,
  Check,
  ExternalLink,
  ChevronRight,
  Activity,
  ArrowUpRight,
  LogOut,
  Edit3,
  UserPlus,
  Hash,
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
  onLogout?: () => void;
  onEditProfile?: () => void;
  onOpenInviteModal?: () => void;
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
  onLogout,
  onEditProfile,
  onOpenInviteModal,
  notifications,
  onMarkNotificationRead,
  onViewLanding,
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const userMenuRef = useRef<HTMLDivElement>(null);
  const notifMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (userMenuRef.current && !userMenuRef.current.contains(target)) {
        setShowUserMenu(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(target)) {
        setShowNotifMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close drawer on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsDrawerOpen(false);
        setShowUserMenu(false);
        setShowNotifMenu(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isDrawerOpen]);

  const unreadNotifs = notifications.filter((n) => n.unread);

  const handleCopyInvite = () => {
    navigator.clipboard.writeText(family.inviteCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleNavigate = (view: NavView) => {
    if (onSelectView) {
      onSelectView(view);
    }
    setIsDrawerOpen(false);
  };

  // Visually rich menu items categorized and clean
  const mainNavItems: {
    id: NavView;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    bgColor: string;
    borderColor: string;
    badge?: string;
  }[] = [
    {
      id: 'overview',
      label: 'Overview',
      icon: LayoutDashboard,
      color: 'text-teal-700',
      bgColor: 'bg-teal-50 hover:bg-teal-100/80',
      borderColor: 'border-teal-200/80',
    },
    {
      id: 'ai_assistant',
      label: 'AI Assistant',
      icon: Sparkles,
      color: 'text-purple-700',
      bgColor: 'bg-purple-50 hover:bg-purple-100/80',
      borderColor: 'border-purple-200/80',
      badge: 'AI',
    },
    {
      id: 'reports',
      label: 'Lab Reports',
      icon: FileText,
      color: 'text-blue-700',
      bgColor: 'bg-blue-50 hover:bg-blue-100/80',
      borderColor: 'border-blue-200/80',
      badge: 'Trends',
    },
    {
      id: 'medications',
      label: 'Medications',
      icon: Pill,
      color: 'text-amber-700',
      bgColor: 'bg-amber-50 hover:bg-amber-100/80',
      borderColor: 'border-amber-200/80',
    },
    {
      id: 'members',
      label: 'Members',
      icon: Users,
      color: 'text-emerald-700',
      bgColor: 'bg-emerald-50 hover:bg-emerald-100/80',
      borderColor: 'border-emerald-200/80',
    },
    {
      id: 'timeline',
      label: 'Timeline',
      icon: Clock,
      color: 'text-cyan-700',
      bgColor: 'bg-cyan-50 hover:bg-cyan-100/80',
      borderColor: 'border-cyan-200/80',
    },
    {
      id: 'family_history',
      label: 'Family Insights',
      icon: GitBranch,
      color: 'text-indigo-700',
      bgColor: 'bg-indigo-50 hover:bg-indigo-100/80',
      borderColor: 'border-indigo-200/80',
    },
    {
      id: 'appointments',
      label: 'Doctor Visits',
      icon: Calendar,
      color: 'text-rose-700',
      bgColor: 'bg-rose-50 hover:bg-rose-100/80',
      borderColor: 'border-rose-200/80',
    },
    {
      id: 'doctor_sharing',
      label: 'Doctor Links',
      icon: Share2,
      color: 'text-sky-700',
      bgColor: 'bg-sky-50 hover:bg-sky-100/80',
      borderColor: 'border-sky-200/80',
      badge: 'PIN',
    },
    {
      id: 'settings',
      label: 'Privacy & Security',
      icon: Lock,
      color: 'text-slate-700',
      bgColor: 'bg-slate-100 hover:bg-slate-200/80',
      borderColor: 'border-slate-200',
    },
  ];

  return (
    <>
      <header
        id="main-app-header"
        className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* 1. LEFT: LOGO & NAME ONLY */}
          <div className="flex items-center gap-3">
            <button
              id="brand-logo-btn"
              onClick={onViewLanding}
              className="flex items-center gap-2.5 text-left group focus:outline-none"
              title="Go to Home / Overview"
            >
              <div className="w-9 h-9 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-xs shadow-teal-700/20 group-hover:bg-teal-700 transition">
                <ShieldCheck className="w-5 h-5 text-teal-50" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900 group-hover:text-teal-700 transition leading-none">
                  Family Health AI
                </span>
                <span className="text-[10px] font-semibold text-slate-400 tracking-wide mt-0.5 hidden sm:inline">
                  Secure Health Vault
                </span>
              </div>
            </button>
          </div>

          {/* 2. RIGHT: NOTIFICATION, ACCOUNT, AND HAMBURGER ICON */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* NOTIFICATION ICON */}
            <div className="relative" ref={notifMenuRef}>
              <button
                id="navbar-notification-btn"
                onClick={() => {
                  setShowNotifMenu(!showNotifMenu);
                  setShowUserMenu(false);
                }}
                className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                title="Notifications"
                aria-label="View notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadNotifs.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 min-w-4 h-4 px-1 bg-teal-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
                    {unreadNotifs.length}
                  </span>
                )}
              </button>

              {/* Notifications Popup */}
              {showNotifMenu && (
                <div
                  id="navbar-notification-popup"
                  className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-3.5 animate-in fade-in zoom-in-95 duration-100"
                >
                  <div className="flex items-center justify-between pb-2.5 mb-2 border-b border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-sm text-slate-900">Notifications</span>
                      {unreadNotifs.length > 0 && (
                        <span className="text-[11px] bg-teal-50 text-teal-700 font-semibold px-2 py-0.5 rounded-full">
                          {unreadNotifs.length} new
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400">Health alerts</span>
                  </div>

                  <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                    {notifications.length === 0 ? (
                      <div className="py-8 text-center text-xs text-slate-400">
                        No health alerts or notifications at this time.
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => onMarkNotificationRead(n.id)}
                          className={`p-3 rounded-xl text-xs cursor-pointer transition ${
                            n.unread
                              ? 'bg-teal-50/60 border border-teal-100/90 text-slate-900'
                              : 'hover:bg-slate-50 text-slate-700 border border-transparent'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <span className="font-semibold text-slate-900 leading-snug">{n.title}</span>
                            <span className="text-[10px] text-slate-400 whitespace-nowrap">{n.timestamp}</span>
                          </div>
                          <p className="text-slate-600 leading-relaxed text-[11px]">{n.message}</p>
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

            {/* ACCOUNT / PROFILE */}
            <div className="relative" ref={userMenuRef}>
              <button
                id="navbar-account-btn"
                onClick={() => {
                  setShowUserMenu(!showUserMenu);
                  setShowNotifMenu(false);
                }}
                className="flex items-center gap-2 pl-1.5 pr-2 py-1 rounded-xl hover:bg-slate-100 transition text-left border border-slate-200/80 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                title={`Account: ${activeMember.name}. Click to switch profiles.`}
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

                <div className="hidden sm:block">
                  <div className="text-xs font-bold text-slate-800 leading-tight">
                    {activeMember.name}
                  </div>
                  <div className="text-[10px] text-slate-500 leading-none mt-0.5">
                    {activeMember.relationship === 'Self' ? 'Account Admin' : activeMember.relationship}
                  </div>
                </div>

                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Account Dropdown */}
              {showUserMenu && (
                <div
                  id="navbar-account-popup"
                  className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-2.5 text-xs animate-in fade-in zoom-in-95 duration-100"
                >
                  <div className="px-3 py-2 border-b border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-sm">{activeMember.name}</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-100">
                        {activeMember.bloodType} • {activeMember.age}y
                      </span>
                    </div>
                    <div className="text-slate-500 text-[11px] mt-0.5">{family.name}</div>
                    <div className="mt-1.5 inline-flex items-center gap-1 text-[10px] text-teal-700 font-semibold">
                      <ShieldCheck className="w-3 h-3 text-teal-600" />
                      Family Health Vault
                    </div>
                  </div>

                  {/* Personal Member Code Badge */}
                  <div className="mx-1 my-1.5 p-2 bg-teal-50/80 border border-teal-200/80 rounded-xl">
                    <div className="text-[10px] font-bold text-teal-900 uppercase tracking-wider flex items-center gap-1">
                      <Hash className="w-3 h-3 text-teal-700" />
                      <span>Your Unique Code</span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="font-mono font-black text-teal-950 text-xs tracking-wider">
                        {currentUser.memberCode || 'FH-PENDING'}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (currentUser.memberCode) {
                            navigator.clipboard.writeText(currentUser.memberCode);
                            setCopiedCode(true);
                            setTimeout(() => setCopiedCode(false), 2000);
                          }
                        }}
                        className="text-[10px] font-bold text-teal-700 hover:text-teal-900 bg-white px-2 py-0.5 rounded border border-teal-200 hover:border-teal-300 transition"
                      >
                        {copiedCode ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                  </div>

                  {/* Profile Switcher List */}
                  <div className="py-1.5">
                    <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Family Profiles ({members.length})
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
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-50 text-left transition ${
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

                  {/* Account Quick Links */}
                  <div className="pt-1.5 mt-1 border-t border-slate-100 space-y-0.5">
                    {onOpenInviteModal && (
                      <button
                        onClick={() => {
                          onOpenInviteModal();
                          setShowUserMenu(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-teal-700 hover:text-teal-900 hover:bg-teal-50 rounded-xl transition font-semibold"
                      >
                        <UserPlus className="w-3.5 h-3.5 text-teal-600" />
                        <span>Invite Member by Code</span>
                      </button>
                    )}
                    {onEditProfile && (
                      <button
                        onClick={() => {
                          onEditProfile();
                          setShowUserMenu(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-teal-600" />
                        <span>Edit Health Profile</span>
                      </button>
                    )}
                    <button
                      onClick={() => {
                        onOpenPrivacy();
                        setShowUserMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition"
                    >
                      <Lock className="w-3.5 h-3.5 text-slate-500" />
                      <span>Privacy & Access Control</span>
                    </button>
                    <button
                      onClick={() => {
                        onViewLanding();
                        setShowUserMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                      <span>Public Health Portal</span>
                    </button>
                    {onLogout && (
                      <button
                        onClick={() => {
                          onLogout();
                          setShowUserMenu(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition font-medium"
                      >
                        <LogOut className="w-3.5 h-3.5 text-rose-600" />
                        <span>Log Out / Switch Account</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* HAMBURGER ICON FOR FULL PAGES */}
            <button
              id="navbar-hamburger-btn"
              onClick={() => setIsDrawerOpen(true)}
              className="p-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              title="Open full pages menu"
              aria-label="Open full pages menu"
            >
              <Menu className="w-5 h-5" />
            </button>

          </div>
        </div>
      </header>

      {/* CRISP, VISUAL FULL PAGES NAVIGATION DRAWER */}
      {isDrawerOpen && (
        <div
          id="full-pages-drawer-overlay"
          className="fixed inset-0 z-50 flex justify-end"
          role="dialog"
          aria-modal="true"
        >
          {/* Backdrop with subtle blur */}
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={() => setIsDrawerOpen(false)}
          />

          {/* Slide-over Drawer Panel: Clean, crisp, visual layout */}
          <aside
            id="full-pages-drawer-panel"
            className="relative w-full max-w-sm sm:max-w-[420px] bg-white h-full shadow-2xl z-50 flex flex-col border-l border-slate-200/90 animate-in slide-in-from-right duration-200"
          >
            {/* Header: Crisp & minimal */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-xs">
                  <ShieldCheck className="w-4 h-4 text-teal-50" />
                </div>
                <div>
                  <h2 className="font-extrabold text-sm sm:text-base text-slate-900 leading-none">
                    Pages & Tools
                  </h2>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {family.name}
                  </span>
                </div>
              </div>

              {/* Close Button */}
              <button
                id="full-pages-drawer-close-btn"
                onClick={() => setIsDrawerOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition focus:outline-none"
                title="Close (Esc)"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Action Strip: 2 Compact Visual Buttons */}
            <div className="px-5 py-3 border-b border-slate-100/90 bg-slate-50/50 flex items-center gap-2.5">
              <button
                onClick={() => {
                  onOpenUpload();
                  setIsDrawerOpen(false);
                }}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold shadow-xs transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Upload</span>
              </button>
              <button
                onClick={() => {
                  onOpenSearch();
                  setIsDrawerOpen(false);
                }}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/90 rounded-xl text-xs font-medium transition"
              >
                <Search className="w-3.5 h-3.5 text-slate-500" />
                <span>Search</span>
                <kbd className="text-[9px] bg-slate-100 text-slate-400 px-1 py-0.2 rounded font-mono">⌘K</kbd>
              </button>
            </div>

            {/* Visual Grid: 2-column tiles with zero long descriptions */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
              {/* Grid Section */}
              <div className="grid grid-cols-2 gap-2.5">
                {mainNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentView === item.id;
                  const isAI = item.id === 'ai_assistant';

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavigate(item.id)}
                      className={`relative flex flex-col items-start p-3 rounded-2xl border text-left transition-all duration-150 group ${
                        isActive
                          ? 'bg-teal-50/90 border-teal-300 shadow-xs ring-1 ring-teal-200'
                          : 'bg-white hover:bg-slate-50/90 border-slate-200/90 hover:border-slate-300 shadow-2xs hover:-translate-y-0.5'
                      }`}
                    >
                      {/* Top Row: Icon and Badge */}
                      <div className="w-full flex items-center justify-between mb-2">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center transition ${
                            isActive
                              ? 'bg-teal-600 text-white shadow-xs'
                              : `${item.bgColor} ${item.color}`
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>

                        {item.badge && (
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                              isAI
                                ? 'bg-purple-100 text-purple-700'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                        {isActive && !item.badge && (
                          <span className="w-2 h-2 rounded-full bg-teal-600" />
                        )}
                      </div>

                      {/* Label */}
                      <span
                        className={`text-xs font-bold tracking-tight transition truncate w-full ${
                          isActive
                            ? 'text-teal-950'
                            : 'text-slate-800 group-hover:text-slate-900'
                        }`}
                      >
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Family Code Pill */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[11px] font-semibold text-slate-700">Invite Code:</span>
                  <span className="text-[11px] font-mono text-slate-600 font-bold">{family.inviteCode}</span>
                </div>
                <button
                  onClick={handleCopyInvite}
                  className="flex items-center gap-1 text-[11px] font-semibold text-teal-700 hover:text-teal-800 px-2 py-0.5 rounded-lg hover:bg-teal-50 transition"
                  title="Copy code"
                >
                  {copiedCode ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Drawer Footer: Active Profile & Landing link */}
            <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img
                  src={activeMember.avatar}
                  alt={activeMember.name}
                  className="w-7 h-7 rounded-full object-cover border border-slate-200"
                />
                <div className="leading-tight">
                  <span className="text-xs font-bold text-slate-800 block">
                    {activeMember.name}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {activeMember.relationship} • {activeMember.bloodType}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    onViewLanding();
                    setIsDrawerOpen(false);
                  }}
                  className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-teal-700 px-2 py-1 rounded-lg hover:bg-white border border-transparent hover:border-slate-200 transition"
                >
                  <span>Portal</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
                {onLogout && (
                  <button
                    onClick={() => {
                      onLogout();
                      setIsDrawerOpen(false);
                    }}
                    className="flex items-center gap-1 text-[11px] font-semibold text-rose-600 hover:text-rose-700 px-2 py-1 rounded-lg hover:bg-rose-50 transition"
                    title="Log Out"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Log Out</span>
                  </button>
                )}
              </div>
            </div>
          </aside>
        </div>
      )}
    </>
  );
};
