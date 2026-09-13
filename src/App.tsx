import React, { useState, useEffect } from 'react';
import {
  mockFamily,
  mockMembers,
  mockDocuments,
  mockConditions,
  mockMedications,
  mockTreatments,
  mockDoctors,
  mockAppointments,
  mockTimelineEvents,
  mockNotifications,
  mockPrivacyPermissions,
  mockShareLinks,
} from './data/mockData';
import {
  Family,
  FamilyMember,
  MedicalDocument,
  MedicalCondition,
  Medication,
  Treatment,
  Doctor,
  Appointment,
  TimelineEvent,
  NotificationItem,
  PrivacyPermission,
  ShareLink,
  PersonalHealthSummary,
} from './types';
import { Navbar } from './components/Navbar';
import { Sidebar, NavView } from './components/Sidebar';
import { MobileNav } from './components/MobileNav';
import { LandingPage } from './components/LandingPage';
import { AuthModal, AuthMode } from './components/AuthModal';
import { FamilyDashboard } from './components/FamilyDashboard';
import { MemberProfile, ProfileTab } from './components/MemberProfile';
import { DocumentUploadModal } from './components/DocumentUploadModal';
import { ReportDetailModal } from './components/ReportDetailModal';
import { AIAssistantView } from './components/AIAssistantView';
import { HealthSummaryModal } from './components/HealthSummaryModal';
import { DoctorVisitModal } from './components/DoctorVisitModal';
import { DoctorShareModal } from './components/DoctorShareModal';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { PrivacySettingsModal } from './components/PrivacySettingsModal';
import { FamilyInsightsView } from './components/FamilyInsightsView';
import { LoginPage } from './components/LoginPage';
import { InviteMemberModal } from './components/InviteMemberModal';
import { PendingInvitationsBanner } from './components/PendingInvitationsBanner';
import {
  getUserFamilyAndMembers,
  getPendingInvitationsForUser,
  acceptFamilyInvitation,
  declineFamilyInvitation,
  generateUniqueMemberCode,
  getRegisteredAccounts,
} from './services/accountService';
import { FamilyInvitation } from './types';
import {
  auth,
  logOutFromFirebase,
  subscribeToUserInvitations,
  syncMedicalDocumentToFirestore,
} from './firebase';
import { onAuthStateChanged } from 'firebase/auth';

export function App() {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('family_health_auth_user');
      return !!savedUser;
    }
    return false;
  });

  const [currentUser, setCurrentUser] = useState<FamilyMember>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('family_health_auth_user');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // fallback
        }
      }
    }
    return mockMembers[0];
  });

  // App Domain State: strictly isolated to currentUser's family (no cross-account leakage)
  const [family, setFamily] = useState<Family>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('family_health_auth_user');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          return getUserFamilyAndMembers(parsed).family;
        } catch {}
      }
    }
    return mockFamily;
  });

  const [members, setMembers] = useState<FamilyMember[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('family_health_auth_user');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          return getUserFamilyAndMembers(parsed).members;
        } catch {}
      }
    }
    return mockMembers;
  });

  const [activeMember, setActiveMember] = useState<FamilyMember>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('family_health_auth_user');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // fallback
        }
      }
    }
    return mockMembers[0];
  });
  const [documents, setDocuments] = useState<MedicalDocument[]>(mockDocuments);
  const [conditions, setConditions] = useState<MedicalCondition[]>(mockConditions);
  const [medications, setMedications] = useState<Medication[]>(mockMedications);
  const [treatments, setTreatments] = useState<Treatment[]>(mockTreatments);
  const [doctors, setDoctors] = useState<Doctor[]>(mockDoctors);
  const [appointments, setAppointments] = useState<Appointment[]>(mockAppointments);
  const [timeline, setTimeline] = useState<TimelineEvent[]>(mockTimelineEvents);
  const [notifications, setNotifications] = useState<NotificationItem[]>(mockNotifications);
  const [permissions, setPermissions] = useState<PrivacyPermission[]>(mockPrivacyPermissions);
  const [shareLinks, setShareLinks] = useState<ShareLink[]>(mockShareLinks);

  // Navigation State
  const [currentView, setCurrentView] = useState<NavView>('overview');
  const [memberProfileInitialTab, setMemberProfileInitialTab] = useState<ProfileTab>('overview');
  const [isLandingActive, setIsLandingActive] = useState<boolean>(false);
  const [aiAssistantInitialQuery, setAiAssistantInitialQuery] = useState<string>('');

  // Modals
  const [authModal, setAuthModal] = useState<{ isOpen: boolean; mode: AuthMode }>({
    isOpen: false,
    mode: 'login',
  });
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState<boolean>(false);
  const [selectedReportForDetail, setSelectedReportForDetail] = useState<MedicalDocument | null>(null);
  const [doctorVisitModal, setDoctorVisitModal] = useState<{ isOpen: boolean; member: FamilyMember }>({
    isOpen: false,
    member: mockMembers[0],
  });
  const [healthSummaryModal, setHealthSummaryModal] = useState<{
    isOpen: boolean;
    member: FamilyMember;
    summary: PersonalHealthSummary | null;
    isLoading: boolean;
  }>({
    isOpen: false,
    member: mockMembers[0],
    summary: null,
    isLoading: false,
  });
  const [doctorShareModal, setDoctorShareModal] = useState<{ isOpen: boolean; member: FamilyMember }>({
    isOpen: false,
    member: mockMembers[0],
  });
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState<boolean>(false);
  const [pendingInvitations, setPendingInvitations] = useState<FamilyInvitation[]>([]);
  const [firebaseUser, setFirebaseUser] = useState<any>(() => auth.currentUser);

  // Realtime Firebase Auth synchronization
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser && !isAuthenticated) {
        const registered = getRegisteredAccounts();
        const matched = registered.find(
          (m) =>
            m.id === fbUser.uid ||
            (m.email && fbUser.email && m.email.toLowerCase() === fbUser.email.toLowerCase())
        );
        if (matched) {
          const { family: userFamily, members: userMembers } = getUserFamilyAndMembers(matched);
          setFamily(userFamily);
          setMembers(userMembers);
          setCurrentUser(matched);
          setActiveMember(matched);
          setIsAuthenticated(true);
        }
      }
    });
    return () => unsubscribe();
  }, [isAuthenticated]);

  // Refresh pending invitations for currentUser
  const refreshInvitations = () => {
    if (currentUser && currentUser.memberCode) {
      const pending = getPendingInvitationsForUser(currentUser.memberCode, currentUser.id);
      setPendingInvitations(pending);
    }
  };

  useEffect(() => {
    refreshInvitations();
    const interval = setInterval(refreshInvitations, 3000);

    // Live subscription to Firestore incoming invitations - only when authenticated in Firebase
    let unsubFirestore: (() => void) | undefined;
    if (currentUser?.memberCode && firebaseUser) {
      try {
        unsubFirestore = subscribeToUserInvitations(currentUser.memberCode, (firestoreInvs) => {
          if (firestoreInvs.length > 0) {
            setPendingInvitations((prev) => {
              const map = new Map<string, FamilyInvitation>();
              prev.forEach((inv) => map.set(inv.id, inv));
              firestoreInvs.forEach((inv) => map.set(inv.id, inv));
              return Array.from(map.values()).filter((inv) => inv.status === 'pending');
            });
          }
        });
      } catch (err) {
        console.warn('Firestore subscription fallback:', err);
      }
    }

    return () => {
      clearInterval(interval);
      if (unsubFirestore) unsubFirestore();
    };
  }, [currentUser, firebaseUser]);

  const handleAcceptInvitation = (invitation: FamilyInvitation) => {
    const result = acceptFamilyInvitation(invitation.id, currentUser);
    if (result.success && result.family && result.members) {
      setFamily(result.family);
      setMembers(result.members);
      const updatedUser = result.members.find((m) => m.id === currentUser.id) || currentUser;
      setCurrentUser(updatedUser);
      refreshInvitations();
      // Add celebratory notification
      const notif: NotificationItem = {
        id: `notif-${Date.now()}`,
        title: 'Family Vault Connected!',
        message: `You accepted ${invitation.inviterName}'s invite and joined ${result.family.name}.`,
        timestamp: 'Just now',
        unread: true,
      };
      setNotifications((prev) => [notif, ...prev]);
    }
  };

  const handleDeclineInvitation = (invitation: FamilyInvitation) => {
    declineFamilyInvitation(invitation.id);
    refreshInvitations();
  };

  // Global Keyboard listener for Cmd+K search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handlers
  const handleUpdateMember = (updated: FamilyMember) => {
    setMembers((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
    if (currentUser.id === updated.id) {
      setCurrentUser(updated);
      if (typeof window !== 'undefined') {
        localStorage.setItem('family_health_auth_user', JSON.stringify(updated));
      }
    }
    if (activeMember.id === updated.id) {
      setActiveMember(updated);
    }
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('family_health_auth_user');
    }
    logOutFromFirebase().catch(() => {});
    setIsAuthenticated(false);
  };

  const handleOpenAuth = (mode: AuthMode) => {
    setAuthModal({ isOpen: true, mode });
  };

  const handleAuthSuccess = (user: FamilyMember, updatedFamily?: Family) => {
    setCurrentUser(user);
    setActiveMember(user);
    if (updatedFamily) {
      setFamily(updatedFamily);
    }
    setIsLandingActive(false);
  };

  const handleAddMember = (newMemberData: Partial<FamilyMember>) => {
    const newMember: FamilyMember = {
      id: `mem-${Date.now()}`,
      memberCode: generateUniqueMemberCode(),
      name: newMemberData.name || 'New Member',
      age: newMemberData.age || 30,
      dob: newMemberData.dob || '1995-01-01',
      relationship: newMemberData.relationship || 'Other',
      status: 'healthy',
      statusText: 'Healthy (Profile initialized)',
      bloodType: newMemberData.bloodType || 'O+',
      allergies: [],
      conditionsSummary: [],
      avatar:
        newMemberData.avatar ||
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      emergencyContact: newMemberData.emergencyContact || 'Not specified',
      primaryPhysician: newMemberData.primaryPhysician || 'General Practice',
      vitals: {
        bloodPressure: '120/80',
        bloodPressureStatus: 'normal',
        weightKg: 65,
        heightCm: 168,
        bmi: 23.0,
      },
    };

    setMembers((prev) => [...prev, newMember]);
    setFamily((prev) => ({ ...prev, memberCount: prev.memberCount + 1 }));

    // Add timeline milestone
    const newEvent: TimelineEvent = {
      id: `evt-${Date.now()}`,
      memberId: newMember.id,
      year: new Date().getFullYear(),
      month: new Date().toLocaleString('default', { month: 'short' }),
      date: new Date().toISOString().split('T')[0],
      title: `${newMember.name} joined ${family.name}`,
      eventType: 'milestone',
      description: `Health profile created and initialized in private family health vault.`,
      notes: 'Initial record baseline created.',
    };
    setTimeline((prev) => [newEvent, ...prev]);

    // Add notification
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: 'New Member Added',
      message: `${newMember.name} has been added to ${family.name}.`,
      timestamp: 'Just now',
      unread: true,
      memberName: newMember.name,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const handleUploadSuccess = (newDoc: MedicalDocument) => {
    setDocuments((prev) => [newDoc, ...prev]);

    // Securely sync document to Firestore
    syncMedicalDocumentToFirestore(newDoc, family.id).catch((err) => {
      console.warn('Background Firestore document sync:', err);
    });

    const targetMember = members.find((m) => m.id === newDoc.memberId) || activeMember;

    // Add automatic timeline event for the document
    const newEvent: TimelineEvent = {
      id: `evt-${Date.now()}`,
      memberId: newDoc.memberId,
      year: new Date(newDoc.date).getFullYear() || new Date().getFullYear(),
      month: new Date(newDoc.date).toLocaleString('default', { month: 'short' }),
      date: newDoc.date,
      title: newDoc.title,
      eventType: 'investigation',
      description: newDoc.aiSummary || `Uploaded ${newDoc.type} at ${newDoc.facility}.`,
      doctor: newDoc.doctor,
      relatedDocId: newDoc.id,
    };
    setTimeline((prev) => [newEvent, ...prev]);

    // Add notification
    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: 'New Medical Report Indexed',
      message: `${newDoc.title} for ${targetMember.name} was successfully organized into the timeline.`,
      timestamp: 'Just now',
      unread: true,
      memberName: targetMember.name,
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  const handleAddMedication = (medData: Partial<Medication>) => {
    const newMed: Medication = {
      id: `med-${Date.now()}`,
      memberId: medData.memberId || activeMember.id,
      name: medData.name || 'Prescription',
      dosage: medData.dosage || '10 mg',
      frequency: medData.frequency || 'Once daily',
      reason: medData.reason || 'Management',
      prescribingDoctor: medData.prescribingDoctor || 'Attending Physician',
      isCurrent: true,
      startDate: medData.startDate || new Date().toISOString().split('T')[0],
      notes: medData.notes,
    };

    setMedications((prev) => [newMed, ...prev]);

    const targetMember = members.find((m) => m.id === newMed.memberId) || activeMember;

    // Timeline event
    const newEvent: TimelineEvent = {
      id: `evt-${Date.now()}`,
      memberId: newMed.memberId,
      year: new Date().getFullYear(),
      month: new Date().toLocaleString('default', { month: 'short' }),
      date: new Date().toISOString().split('T')[0],
      title: `Prescribed ${newMed.name} ${newMed.dosage}`,
      eventType: 'medication_change',
      description: `${newMed.name} (${newMed.frequency}) initiated by ${newMed.prescribingDoctor} for ${newMed.reason}.`,
      doctor: newMed.prescribingDoctor,
    };
    setTimeline((prev) => [newEvent, ...prev]);
  };

  const handleGenerateHealthSummary = async (member: FamilyMember) => {
    setHealthSummaryModal({
      isOpen: true,
      member,
      summary: null,
      isLoading: true,
    });

    const relevantDocs = documents.filter((d) => d.memberId === member.id);
    const relevantMeds = medications.filter((m) => m.memberId === member.id);
    const relevantConds = conditions.filter((c) => c.memberId === member.id);
    const relevantTreatments = treatments.filter((t) => t.memberId === member.id);

    try {
      const res = await fetch('/api/ai/generate-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberName: member.name,
          age: member.age,
          records: relevantDocs,
          medications: relevantMeds,
          conditions: relevantConds,
          treatments: relevantTreatments,
        }),
      });

      const data = await res.json();
      setHealthSummaryModal((prev) => ({
        ...prev,
        summary: data.summary,
        isLoading: false,
      }));
    } catch (err) {
      console.error('Failed to generate summary:', err);
      setHealthSummaryModal((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const handleOpenAIAssistant = (member: FamilyMember, suggestedQ?: string) => {
    setActiveMember(member);
    if (suggestedQ) {
      setAiAssistantInitialQuery(suggestedQ);
    }
    setCurrentView('ai_assistant');
  };

  // If not authenticated, display the full LoginPage
  if (!isAuthenticated) {
    return (
      <LoginPage
        existingMembers={members}
        currentFamily={family}
        onLoginSuccess={(user, updatedFamily) => {
          const { family: userFamily, members: userMembers } = getUserFamilyAndMembers(user);
          setFamily(updatedFamily || userFamily);
          setMembers(userMembers);
          setCurrentUser(user);
          setActiveMember(user);
          setIsAuthenticated(true);
        }}
      />
    );
  }

  // If viewing Public Landing Page
  if (isLandingActive) {
    return (
      <>
        <LandingPage
          onEnterApp={() => setIsLandingActive(false)}
          onOpenAuth={handleOpenAuth}
        />
        <AuthModal
          isOpen={authModal.isOpen}
          initialMode={authModal.mode}
          onClose={() => setAuthModal((prev) => ({ ...prev, isOpen: false }))}
          onSuccess={handleAuthSuccess}
          demoMembers={members}
          currentFamily={family}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans text-slate-900 selection:bg-teal-100 selection:text-teal-900">
      {/* Top Navigation Bar with Desktop Navigation */}
      <Navbar
        family={family}
        members={members}
        currentUser={currentUser}
        activeMember={activeMember}
        currentView={currentView}
        onSelectView={(v) => {
          setCurrentView(v);
          if (v === 'timeline') setMemberProfileInitialTab('timeline');
          if (v === 'reports') setMemberProfileInitialTab('reports');
          if (v === 'medications') setMemberProfileInitialTab('medications');
          if (v === 'appointments') setMemberProfileInitialTab('doctors');
        }}
        onSelectUser={(m) => {
          setCurrentUser(m);
          setActiveMember(m);
        }}
        onOpenSearch={() => setIsSearchModalOpen(true)}
        onOpenDoctorShare={() => setDoctorShareModal({ isOpen: true, member: activeMember })}
        onOpenPrivacy={() => setIsPrivacyModalOpen(true)}
        onOpenUpload={() => setIsUploadModalOpen(true)}
        onOpenInviteModal={() => setIsInviteModalOpen(true)}
        onLogout={handleLogout}
        onEditProfile={() => {
          setCurrentView('members');
          setMemberProfileInitialTab('overview');
        }}
        notifications={notifications}
        onMarkNotificationRead={(id) => {
          setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
          );
        }}
        onViewLanding={() => setIsLandingActive(true)}
        isLandingActive={false}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {/* Main Body with Optional Desktop Sidebar and View Switcher */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Desktop Sidebar Navigation (collapsible or toggleable) */}
        {isSidebarOpen && (
          <div className="hidden md:block flex-shrink-0 animate-in slide-in-from-left-2 duration-150">
            <Sidebar
              currentView={currentView}
              onSelectView={(v) => {
                setCurrentView(v);
                if (v === 'timeline') setMemberProfileInitialTab('timeline');
                if (v === 'reports') setMemberProfileInitialTab('reports');
                if (v === 'medications') setMemberProfileInitialTab('medications');
                if (v === 'appointments') setMemberProfileInitialTab('doctors');
              }}
              onOpenUpload={() => setIsUploadModalOpen(true)}
              activeMember={activeMember}
              members={members}
              onSelectMember={(m) => setActiveMember(m)}
            />
          </div>
        )}

        {/* Content Area */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
          {/* Incoming Family Invitations Banner */}
          <PendingInvitationsBanner
            invitations={pendingInvitations}
            onAccept={handleAcceptInvitation}
            onDecline={handleDeclineInvitation}
          />

          {/* 1. FAMILY OVERVIEW DASHBOARD */}
          {currentView === 'overview' && (
            <FamilyDashboard
              family={family}
              members={members}
              currentUser={currentUser}
              documents={documents}
              appointments={appointments}
              medications={medications}
              timeline={timeline}
              onSelectMember={(m) => {
                setActiveMember(m);
                setMemberProfileInitialTab('overview');
                setCurrentView('members');
              }}
              onOpenUpload={() => setIsUploadModalOpen(true)}
              onOpenDoctorVisit={(m) => setDoctorVisitModal({ isOpen: true, member: m })}
              onOpenAIAssistant={handleOpenAIAssistant}
              onViewReport={(doc) => setSelectedReportForDetail(doc)}
              onAddMember={handleAddMember}
              onOpenInviteModal={() => setIsInviteModalOpen(true)}
            />
          )}

          {/* 2. FAMILY MEMBERS PROFILE VIEW */}
          {(currentView === 'members' ||
            currentView === 'timeline' ||
            currentView === 'reports' ||
            currentView === 'medications' ||
            currentView === 'appointments') && (
            <MemberProfile
              member={activeMember}
              allMembers={members}
              documents={documents}
              conditions={conditions}
              medications={medications}
              treatments={treatments}
              doctors={doctors}
              timeline={timeline}
              initialTab={memberProfileInitialTab}
              onSelectMember={(m) => setActiveMember(m)}
              onOpenUpload={() => setIsUploadModalOpen(true)}
              onOpenDoctorVisit={(m) => setDoctorVisitModal({ isOpen: true, member: m })}
              onGenerateHealthSummary={handleGenerateHealthSummary}
              onOpenDoctorShare={(m) => setDoctorShareModal({ isOpen: true, member: m })}
              onViewReport={(doc) => setSelectedReportForDetail(doc)}
              onOpenAIAssistant={handleOpenAIAssistant}
              onAddMedication={handleAddMedication}
              onUpdateMember={handleUpdateMember}
            />
          )}

          {/* 3. CONVERSATIONAL AI HEALTH ASSISTANT */}
          {currentView === 'ai_assistant' && (
            <AIAssistantView
              members={members}
              selectedMember={activeMember}
              documents={documents}
              onSelectMember={(m) => setActiveMember(m)}
              onViewReport={(doc) => setSelectedReportForDetail(doc)}
              initialQuery={aiAssistantInitialQuery}
            />
          )}

          {/* 4. FAMILY HEALTH HISTORY & PATTERNS */}
          {currentView === 'family_history' && (
            <FamilyInsightsView
              family={family}
              members={members}
              conditions={conditions}
              onSelectMember={(m) => {
                setActiveMember(m);
                setCurrentView('members');
              }}
              onOpenDoctorVisit={(m) => setDoctorVisitModal({ isOpen: true, member: m })}
            />
          )}

          {/* 5. DOCTOR SHARING LINKS OVERVIEW */}
          {currentView === 'doctor_sharing' && (
            <div className="max-w-4xl mx-auto space-y-6 pb-16">
              <div className="p-6 bg-white rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-bold text-slate-900">Doctor Sharing Links</h1>
                  <p className="text-xs text-slate-500 mt-1">
                    Manage temporary, PIN-protected read-only links issued to healthcare providers.
                  </p>
                </div>
                <button
                  onClick={() => setDoctorShareModal({ isOpen: true, member: activeMember })}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
                >
                  + Generate New Doctor Link
                </button>
              </div>

              <div className="space-y-3">
                {shareLinks.map((link) => {
                  const targetMem = members.find((m) => m.id === link.memberId) || activeMember;
                  return (
                    <div
                      key={link.id}
                      className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">
                            {link.recipientDoctor}
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-semibold">
                            ACTIVE
                          </span>
                        </div>
                        <div className="text-slate-500 text-xs">
                          Patient: <strong className="text-slate-800">{targetMem.name}</strong> • Expires in {link.expiresAt}
                        </div>
                        <div className="text-[11px] text-teal-700 font-mono">
                          Access PIN: <strong>{link.accessPin}</strong> • URL: {link.url}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(`${link.url} (PIN: ${link.accessPin})`);
                            alert('Copied share link and PIN to clipboard!');
                          }}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
                        >
                          Copy Link
                        </button>
                        <button
                          onClick={() => {
                            setShareLinks((prev) => prev.filter((l) => l.id !== link.id));
                          }}
                          className="px-3 py-1.5 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-semibold"
                        >
                          Revoke
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 6. SETTINGS & PRIVACY */}
          {currentView === 'settings' && (
            <div className="max-w-4xl mx-auto space-y-6 pb-16">
              <div className="p-6 bg-white rounded-2xl border border-slate-200/90 shadow-2xs">
                <h1 className="text-xl font-bold text-slate-900">Privacy & Family Security</h1>
                <p className="text-xs text-slate-500 mt-1">
                  Manage record permissions, invite codes, and encryption settings for {family.name}.
                </p>
              </div>

              <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-2xs space-y-4 text-xs">
                <h3 className="font-bold text-slate-900 text-sm">Family Space Invitation</h3>
                <p className="text-slate-600">
                  Share this code with trusted family members to let them create profiles or join this space.
                </p>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between font-mono font-bold text-teal-800 text-sm">
                  <span>{family.inviteCode}</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(family.inviteCode);
                      alert('Family invitation code copied!');
                    }}
                    className="text-xs text-teal-700 hover:text-teal-900 font-sans font-semibold"
                  >
                    Copy Code
                  </button>
                </div>
              </div>

              <button
                onClick={() => setIsPrivacyModalOpen(true)}
                className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs transition shadow-xs"
              >
                Open Detailed Member Access & Audit Log Controls
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav
        currentView={currentView}
        onSelectView={(v) => {
          setCurrentView(v);
          if (v === 'timeline') setMemberProfileInitialTab('timeline');
        }}
        onOpenUpload={() => setIsUploadModalOpen(true)}
      />

      {/* Modals */}
      <AuthModal
        isOpen={authModal.isOpen}
        initialMode={authModal.mode}
        onClose={() => setAuthModal((prev) => ({ ...prev, isOpen: false }))}
        onSuccess={handleAuthSuccess}
        demoMembers={members}
        currentFamily={family}
      />

      <DocumentUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        members={members}
        selectedMember={activeMember}
        onUploadSuccess={handleUploadSuccess}
      />

      <ReportDetailModal
        document={selectedReportForDetail}
        member={activeMember}
        allDocuments={documents}
        onClose={() => setSelectedReportForDetail(null)}
        onOpenAIAssistant={handleOpenAIAssistant}
      />

      <DoctorVisitModal
        isOpen={doctorVisitModal.isOpen}
        member={doctorVisitModal.member}
        doctors={doctors}
        documents={documents}
        onClose={() => setDoctorVisitModal((prev) => ({ ...prev, isOpen: false }))}
      />

      <HealthSummaryModal
        isOpen={healthSummaryModal.isOpen}
        member={healthSummaryModal.member}
        summary={healthSummaryModal.summary}
        isLoading={healthSummaryModal.isLoading}
        onClose={() => setHealthSummaryModal((prev) => ({ ...prev, isOpen: false }))}
      />

      <DoctorShareModal
        isOpen={doctorShareModal.isOpen}
        member={doctorShareModal.member}
        onClose={() => setDoctorShareModal((prev) => ({ ...prev, isOpen: false }))}
        existingLinks={shareLinks}
        onCreateLink={(link) => setShareLinks((prev) => [link, ...prev])}
      />

      <GlobalSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        members={members}
        documents={documents}
        medications={medications}
        conditions={conditions}
        timeline={timeline}
        onSelectMember={(m) => {
          setActiveMember(m);
          setCurrentView('members');
        }}
        onViewReport={(doc) => setSelectedReportForDetail(doc)}
      />

      <PrivacySettingsModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
        currentUser={currentUser}
        family={family}
        members={members}
        permissions={permissions}
        onUpdatePermission={(updated) => {
          setPermissions((prev) =>
            prev.map((p) => (p.memberId === updated.memberId ? updated : p))
          );
        }}
      />

      <InviteMemberModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        currentUser={currentUser}
        currentFamilyMembers={members}
        onInviteCreated={() => {
          refreshInvitations();
        }}
      />
    </div>
  );
}

export default App;

