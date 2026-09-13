import React, { useState, useRef, useEffect } from 'react';
import {
  ShieldCheck,
  Bell,
  User,
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
  Check,
  LogOut,
  Edit3,
  UserPlus,
  Menu,
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
  onViewLanding?: () => void;
  isLandingActive?: boolean;
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
  isSidebarOpen,
  onToggleSidebar,
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
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

  // Close menus on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowUserMenu(false);
        setShowNotifMenu(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const unreadNotifs = notifications.filter((n) => n.unread);

  const handleNavigate = (view: NavView) => {
    if (onSelectView) {
      onSelectView(view);
    }
  };

  return (
    <>
      <header
        id="main-app-header"
        className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs w-full"
      >
        <div className="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* 1. LEFT: HAMBURGER MENU TOGGLE & BRAND LOGO */}
          <div className="flex items-center gap-2 sm:gap-2.5 flex-shrink-0">
            {onToggleSidebar && (
              <button
                id="navbar-hamburger-btn"
                type="button"
                onClick={onToggleSidebar}
                className={`p-2 rounded-xl transition cursor-pointer flex items-center justify-center border ${
                  isSidebarOpen
                    ? 'bg-teal-50 border-teal-200 text-teal-800 hover:bg-teal-100'
                    : 'bg-white border-slate-200/90 text-slate-700 hover:bg-slate-100 hover:text-slate-900 shadow-2xs'
                }`}
                title={isSidebarOpen ? 'Close Menu' : 'Open Menu'}
                aria-label={isSidebarOpen ? 'Close Menu' : 'Open Menu'}
              >
                <Menu className="w-5 h-5 text-slate-700" />
              </button>
            )}

            <button
              id="brand-logo-btn"
              onClick={() => handleNavigate('overview')}
              className="flex items-center gap-2.5 text-left group focus:outline-none cursor-pointer"
              title="Return to Health Overview"
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

          {/* 2. RIGHT: SEARCH, UPLOAD, NOTIFICATIONS, ACCOUNT */}
          <div className="flex items-center gap-2 sm:gap-2.5 flex-shrink-0">
            {/* Global Search button */}
            <button
              id="navbar-search-btn"
              onClick={onOpenSearch}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-xs text-slate-600 bg-slate-100/80 hover:bg-slate-200/70 border border-slate-200 rounded-xl transition"
              title="Search records, medications, vitals"
            >
              <Search className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden lg:inline text-[11px] font-medium">Search records...</span>
            </button>

            {/* Centralized Upload Record Action Button */}
            <button
              id="navbar-upload-btn"
              onClick={onOpenUpload}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-2xs transition"
              title="Upload lab report, prescription, or scan"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Upload</span>
            </button>
            
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

          </div>
        </div>
      </header>
    </>
  );
};
