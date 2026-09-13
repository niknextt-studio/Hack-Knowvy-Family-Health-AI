import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Calendar,
  FileText,
  Clock,
  Pill,
  Activity,
  User,
  Share2,
  Upload,
  Heart,
  Plus,
  ArrowRight,
  ArrowLeft,
  TrendingDown,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Stethoscope,
  Scissors,
  Check,
  ExternalLink,
  ChevronDown,
  Phone,
  Building,
  MessageSquare,
  Edit3,
  Users,
  Hash,
  UserPlus,
  Copy,
} from 'lucide-react';
import {
  FamilyMember,
  Family,
  MedicalDocument,
  MedicalCondition,
  Medication,
  Treatment,
  Doctor,
  TimelineEvent,
} from '../types';
import { EditProfileModal } from './EditProfileModal';

export type ProfileTab =
  | 'overview'
  | 'timeline'
  | 'reports'
  | 'conditions'
  | 'medications'
  | 'treatments'
  | 'doctors'
  | 'ai_assistant';

interface MemberProfileProps {
  member: FamilyMember;
  allMembers: FamilyMember[];
  documents: MedicalDocument[];
  conditions: MedicalCondition[];
  medications: Medication[];
  treatments: Treatment[];
  doctors: Doctor[];
  timeline: TimelineEvent[];
  initialTab?: ProfileTab;
  family?: Family;
  currentUser?: FamilyMember;
  onSelectMember: (member: FamilyMember) => void;
  onOpenUpload: () => void;
  onOpenDoctorVisit: (member: FamilyMember) => void;
  onGenerateHealthSummary: (member: FamilyMember) => void;
  onOpenDoctorShare: (member: FamilyMember) => void;
  onViewReport: (doc: MedicalDocument) => void;
  onOpenAIAssistant: (member: FamilyMember, suggestedQ?: string) => void;
  onAddMedication: (med: Partial<Medication>) => void;
  onAddMember?: (newMember: Partial<FamilyMember>) => void;
  onOpenInviteModal?: () => void;
  onUpdateMember?: (member: FamilyMember) => void;
  onBackToOverview?: () => void;
}

export const MemberProfile: React.FC<MemberProfileProps> = ({
  member,
  allMembers,
  documents,
  conditions,
  medications,
  treatments,
  doctors,
  timeline,
  initialTab = 'overview',
  family,
  currentUser,
  onSelectMember,
  onOpenUpload,
  onOpenDoctorVisit,
  onGenerateHealthSummary,
  onOpenDoctorShare,
  onViewReport,
  onOpenAIAssistant,
  onAddMedication,
  onAddMember,
  onOpenInviteModal,
  onUpdateMember,
  onBackToOverview,
}) => {
  const [activeTab, setActiveTab] = useState<ProfileTab>(initialTab);

  // Synchronize when parent navigation changes initialTab
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [showAddMedModal, setShowAddMedModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [copiedMemberCode, setCopiedMemberCode] = useState(false);
  const [copiedFamilyCode, setCopiedFamilyCode] = useState(false);

  // Add Member State
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberAge, setNewMemberAge] = useState('');
  const [newMemberRelation, setNewMemberRelation] = useState<'Spouse' | 'Father' | 'Mother' | 'Son' | 'Daughter' | 'Grandmother' | 'Grandfather' | 'Sibling' | 'Other'>('Spouse');
  const [newMemberBlood, setNewMemberBlood] = useState('O+');

  const [medName, setMedName] = useState('');
  const [medDose, setMedDose] = useState('');
  const [medFreq, setMedFreq] = useState('');
  const [medReason, setMedReason] = useState('');
  const [medDoctor, setMedDoctor] = useState('');
  const [selectedTimelineYear, setSelectedTimelineYear] = useState<string>('all');

  // Filtered dataset for this patient
  const memberDocs = documents.filter((d) => d.memberId === member.id);
  const memberConditions = conditions.filter((c) => c.memberId === member.id);
  const memberMeds = medications.filter((m) => m.memberId === member.id);
  const memberTreatments = treatments.filter((t) => t.memberId === member.id);
  const memberTimeline = timeline.filter((t) => t.memberId === member.id);

  const currentMeds = memberMeds.filter((m) => m.isCurrent);
  const pastMeds = memberMeds.filter((m) => !m.isCurrent);

  // Group timeline by year
  const timelineYears = Array.from<number>(new Set(memberTimeline.map((e) => Number(e.year)))).sort((a, b) => b - a);
  const filteredTimeline =
    selectedTimelineYear === 'all'
      ? memberTimeline
      : memberTimeline.filter((e) => e.year === parseInt(selectedTimelineYear, 10));

  const handleSaveMed = (e: React.FormEvent) => {
    e.preventDefault();
    if (!medName.trim()) return;
    onAddMedication({
      memberId: member.id,
      name: medName,
      dosage: medDose,
      frequency: medFreq,
      reason: medReason,
      prescribingDoctor: medDoctor || 'Attending Physician',
      isCurrent: true,
      startDate: new Date().toISOString().split('T')[0],
    });
    setMedName('');
    setMedDose('');
    setMedFreq('');
    setMedReason('');
    setMedDoctor('');
    setShowAddMedModal(false);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* 0. BREADCRUMBS & BACK BUTTON - ALWAYS CLEAR FLOW AND POSITION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 sm:px-4 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div className="flex items-center gap-3 text-xs">
          {onBackToOverview && (
            <button
              type="button"
              onClick={onBackToOverview}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-200/80 font-bold rounded-xl transition shadow-2xs group cursor-pointer"
              title="Return to Family Overview"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-teal-700 group-hover:-translate-x-0.5 transition" />
              <span>Back to Overview</span>
            </button>
          )}

          <div className="hidden sm:flex items-center gap-1.5 text-slate-400 font-medium">
            <span className="hover:text-slate-600 cursor-pointer" onClick={onBackToOverview}>Overview</span>
            <span>/</span>
            <span className="text-slate-600">Family Members</span>
            <span>/</span>
            <span className="font-bold text-slate-900">{member.name}</span>
          </div>
        </div>

        {/* Quick Family Member Switcher */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
          <span className="text-[11px] text-slate-400 font-medium whitespace-nowrap hidden sm:inline">Switch Patient:</span>
          {allMembers.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => onSelectMember(m)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
                m.id === member.id
                  ? 'bg-teal-600 text-white shadow-2xs font-bold'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/70'
              }`}
            >
              {m.name.split(' ')[0]}
            </button>
          ))}
          {onAddMember && (
            <button
              type="button"
              onClick={() => setShowAddMemberModal(true)}
              className="px-2.5 py-1 rounded-lg text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200/80 transition whitespace-nowrap inline-flex items-center gap-1 cursor-pointer"
              title="Add family member profile"
            >
              <Plus className="w-3 h-3" />
              <span>Add</span>
            </button>
          )}
        </div>
      </div>

      {/* Patient Header Card */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200/90 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <img
              src={member.avatar}
              alt={member.name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-slate-100 shadow-sm"
            />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {member.name}
                </h1>
                <span
                  className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                    member.status === 'attention'
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : member.status === 'stable'
                      ? 'bg-teal-50 text-teal-800 border-teal-200'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  }`}
                >
                  {member.status === 'attention'
                    ? '🟡 Needs attention'
                    : member.status === 'stable'
                    ? '🟢 Stable'
                    : '🟢 Healthy'}
                </span>
                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                  {member.relationship === 'Self' ? 'Family Admin' : member.relationship}
                </span>
                {member.memberCode && (
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 border border-teal-200" title="Personal unique member code">
                    Code: {member.memberCode}
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-500 mt-1 font-medium">
                {member.age}y {member.gender ? `• ${member.gender}` : ''} • Weight: <strong className="text-slate-800">{member.vitals.weightKg} kg</strong> (BMI {member.vitals.bmi}) • Blood: <strong className="text-slate-800">{member.bloodType}</strong>
              </p>

              <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                {member.email && <span>Gmail: <strong className="text-slate-800">{member.email}</strong></span>}
                <span>Emergency: <strong className="text-slate-800">{member.emergencyContact}</strong></span>
                <span>• Primary: <strong className="text-slate-800">{member.primaryPhysician}</strong></span>
              </div>

              {member.medicalHistoryNotes && (
                <div className="mt-2 text-xs bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-1 text-slate-600 line-clamp-1">
                  <span className="font-semibold text-slate-700">Notes:</span> {member.medicalHistoryNotes}
                </div>
              )}
            </div>
          </div>

          {/* Quick Action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsEditProfileOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition shadow-2xs"
              title="Edit personal vitals and medical history"
            >
              <Edit3 className="w-3.5 h-3.5 text-slate-600" />
              <span>Edit Profile</span>
            </button>

            <button
              onClick={() => onGenerateHealthSummary(member)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-200 rounded-xl text-xs font-bold transition shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-teal-700" />
              <span>Generate Health Summary</span>
            </button>

            <button
              onClick={() => onOpenDoctorVisit(member)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 rounded-xl text-xs font-bold transition shadow-2xs"
            >
              <Stethoscope className="w-3.5 h-3.5 text-slate-600" />
              <span>Prepare Doctor Visit</span>
            </button>

            <button
              onClick={onOpenUpload}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition shadow-2xs"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Document</span>
            </button>

            <button
              onClick={() => onOpenDoctorShare(member)}
              className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl transition"
              title="Share with Doctor"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Member tabs */}
        <div className="mt-6 border-t border-slate-100 pt-3 flex items-center gap-2 overflow-x-auto no-scrollbar text-xs font-semibold">
          {[
            { id: 'overview', label: 'Overview', count: null },
            { id: 'timeline', label: 'Timeline', count: memberTimeline.length },
            { id: 'reports', label: 'Reports', count: memberDocs.length },
            { id: 'conditions', label: 'Conditions', count: memberConditions.length },
            { id: 'medications', label: 'Medications', count: memberMeds.length },
            { id: 'treatments', label: 'Treatments', count: memberTreatments.length },
            { id: 'doctors', label: 'Doctors', count: doctors.length },
            { id: 'ai_assistant', label: 'AI Assistant', count: 'AI' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as ProfileTab)}
              className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-teal-600 text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== null && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    activeTab === tab.id
                      ? 'bg-teal-700 text-teal-100'
                      : 'bg-slate-200/70 text-slate-600'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Family Connection & Member Management (One-Time Tasks) */}
          <div className="p-5 bg-gradient-to-r from-teal-50/70 via-slate-50 to-emerald-50/40 rounded-2xl border border-teal-100 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold shadow-2xs">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Family Space & Sharing Connections</h3>
                  <p className="text-xs text-slate-500">
                    Setup actions: share your patient code, connect family members, or add new profiles.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {onOpenInviteModal && (
                  <button
                    type="button"
                    onClick={onOpenInviteModal}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200/90 rounded-xl text-xs font-bold transition shadow-2xs cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5 text-teal-600" />
                    <span>Connect Family</span>
                  </button>
                )}
                {onAddMember && (
                  <button
                    type="button"
                    onClick={() => setShowAddMemberModal(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition shadow-2xs cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Member</span>
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* Member Code */}
              <div className="p-3 bg-white rounded-xl border border-slate-200/80 flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-semibold text-slate-500">Your Patient Code</div>
                  <div className="text-sm font-black font-mono text-slate-900 mt-0.5">
                    {member.memberCode || currentUser?.memberCode || 'FH-749210'}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(member.memberCode || currentUser?.memberCode || 'FH-749210');
                    setCopiedMemberCode(true);
                    setTimeout(() => setCopiedMemberCode(false), 2000);
                  }}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 inline-flex items-center gap-1 cursor-pointer"
                >
                  {copiedMemberCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                  <span>{copiedMemberCode ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              {/* Family Vault Invite Code */}
              <div className="p-3 bg-white rounded-xl border border-slate-200/80 flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-semibold text-slate-500">Family Vault Code</div>
                  <div className="text-sm font-black font-mono text-teal-700 mt-0.5">
                    {family?.inviteCode || 'CARE-749210'}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(family?.inviteCode || 'CARE-749210');
                    setCopiedFamilyCode(true);
                    setTimeout(() => setCopiedFamilyCode(false), 2000);
                  }}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 inline-flex items-center gap-1 cursor-pointer"
                >
                  {copiedFamilyCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                  <span>{copiedFamilyCode ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Latest Reports Metrics */}
          <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-teal-600" />
                <h3 className="font-bold text-slate-900 text-sm">Verified Health Biomarkers</h3>
              </div>
              <span className="text-[11px] text-slate-400">Validated against standard reference intervals</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Metric 1: HbA1c */}
              <div className="p-4 rounded-xl bg-teal-50/40 border border-teal-100 space-y-1">
                <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                  <span>Glycated HbA1c</span>
                  {member.vitals.hba1c && (
                    <span className="text-teal-700 font-bold text-[11px] flex items-center">
                      <TrendingDown className="w-3.5 h-3.5 mr-0.5" />
                      Recorded
                    </span>
                  )}
                </div>
                <div className="text-2xl font-black text-slate-900 font-mono">
                  {member.vitals.hba1c || '—'}
                </div>
                <div className="text-[11px] text-slate-500">
                  {member.vitals.hba1c ? '3-month average • Target: < 7.0%' : 'No HbA1c test logged yet'}
                </div>
              </div>

              {/* Metric 2: Blood Pressure */}
              <div className="p-4 rounded-xl bg-amber-50/40 border border-amber-100 space-y-1">
                <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                  <span>Blood Pressure</span>
                  {member.vitals.bloodPressure && (
                    <span className="text-amber-700 font-bold text-[11px]">Recorded</span>
                  )}
                </div>
                <div className="text-2xl font-black text-slate-900 font-mono">
                  {member.vitals.bloodPressure || '—'}
                </div>
                <div className="text-[11px] text-slate-500">
                  {member.vitals.bloodPressure ? 'Resting clinical reading' : 'No blood pressure logged yet'}
                </div>
              </div>

              {/* Metric 3: LDL */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1">
                <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                  <span>LDL Cholesterol</span>
                  {member.vitals.ldl && (
                    <span className="text-slate-600 font-bold text-[11px]">Recorded</span>
                  )}
                </div>
                <div className="text-2xl font-black text-slate-900 font-mono">
                  {member.vitals.ldl || '—'}
                </div>
                <div className="text-[11px] text-slate-500">
                  {member.vitals.ldl ? 'Cardiovascular target < 100 mg/dL' : 'No lipid panel logged yet'}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Known Conditions & Allergies */}
            <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-sm">Known Medical Conditions</h3>
                <span className="text-xs text-slate-400">{memberConditions.length} active</span>
              </div>

              {memberConditions.length === 0 ? (
                <div className="py-6 px-4 bg-slate-50/70 rounded-xl border border-slate-200/70 text-center space-y-1">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto" />
                  <div className="text-xs font-bold text-slate-700">No Chronic Conditions Recorded</div>
                  <p className="text-[11px] text-slate-400">
                    No active conditions or clinical diagnoses are logged for this profile.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {memberConditions.map((c) => (
                    <div key={c.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                      <div className="flex items-center justify-between font-bold text-slate-900 mb-1">
                        <span>{c.name}</span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
                          {c.status}
                        </span>
                      </div>
                      <div className="text-slate-500 text-[11px] mb-1.5">
                        Diagnosed: {c.dateDiagnosed} • Doctor: {c.treatingDoctor}
                      </div>
                      <p className="text-slate-600 leading-relaxed">{c.notes}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-3 border-t border-slate-100">
                <h4 className="font-bold text-slate-900 text-xs mb-2">Documented Allergies</h4>
                {member.allergies.length === 0 ? (
                  <p className="text-[11px] text-slate-400">No known drug or environmental allergies logged.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {member.allergies.map((all, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-800 border border-rose-200 text-xs font-semibold flex items-center gap-1"
                      >
                        <AlertCircle className="w-3 h-3 text-rose-600" />
                        <span>{all}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Current Medications */}
            <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-sm">Current Active Medications</h3>
                <button
                  onClick={() => setShowAddMedModal(true)}
                  className="text-xs font-semibold text-teal-700 hover:text-teal-800 cursor-pointer"
                >
                  + Add Medication
                </button>
              </div>

              {currentMeds.length === 0 ? (
                <div className="py-6 px-4 bg-slate-50/70 rounded-xl border border-slate-200/70 text-center space-y-1">
                  <Pill className="w-6 h-6 text-slate-300 mx-auto" />
                  <div className="text-xs font-bold text-slate-700">No Active Medications</div>
                  <p className="text-[11px] text-slate-400">
                    No daily prescriptions or active treatments currently recorded.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {currentMeds.map((med) => (
                    <div key={med.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                      <div className="flex items-center justify-between font-bold text-slate-900 mb-0.5">
                        <span>{med.name} {med.dosage}</span>
                        <span className="text-[10px] bg-white border border-slate-200 px-1.5 py-0.5 rounded text-teal-800 font-semibold">
                          {med.frequency}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Reason: <strong className="text-slate-700">{med.reason}</strong> • Prescribed by: {med.prescribingDoctor}
                      </div>
                      {med.notes && (
                        <p className="text-[11px] text-slate-600 mt-1 italic">"{med.notes}"</p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-3 border-t border-slate-100">
                <h4 className="font-bold text-slate-900 text-xs mb-2">Important Medical History</h4>
                {memberTimeline.length === 0 && memberTreatments.length === 0 ? (
                  <p className="text-[11px] text-slate-400">No past surgeries or major medical events recorded.</p>
                ) : (
                  <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-4">
                    {memberTimeline.slice(0, 3).map((item) => (
                      <li key={item.id}>
                        <span className="font-bold">{item.year}</span> — {item.title}: {item.description}
                      </li>
                    ))}
                    {memberTreatments.slice(0, 2).map((t) => (
                      <li key={t.id}>
                        <span className="font-bold">{t.date}</span> — {t.title} ({t.doctor})
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MEDICAL TIMELINE */}
      {activeTab === 'timeline' && (
        <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-2xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Longitudinal Health Timeline</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Chronological ledger of surgeries, consultations, prescriptions, and lab tests for {member.name}.
              </p>
            </div>

            {/* Year filter */}
            <div className="flex items-center gap-2 text-xs">
              <span className="font-medium text-slate-500">Filter Year:</span>
              <select
                value={selectedTimelineYear}
                onChange={(e) => setSelectedTimelineYear(e.target.value)}
                className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-slate-700 font-medium bg-white focus:outline-none focus:ring-1 focus:ring-teal-500"
              >
                <option value="all">All Years</option>
                {timelineYears.map((yr) => (
                  <option key={yr} value={yr}>
                    {yr}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="relative pl-6 sm:pl-8 border-l-2 border-teal-100 space-y-8 my-4">
            {filteredTimeline.map((item) => (
              <div key={item.id} className="relative group">
                {/* Node icon */}
                <div className="absolute -left-[31px] sm:-left-[39px] top-0 w-6 h-6 rounded-full bg-white border-2 border-teal-600 flex items-center justify-center text-teal-700 shadow-xs">
                  <div className="w-2 h-2 rounded-full bg-teal-600" />
                </div>

                <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 hover:bg-white hover:border-teal-200 hover:shadow-sm transition space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">{item.title}</span>
                      <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-teal-100/70 text-teal-800">
                        {item.eventType.replace('_', ' ')}
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-slate-500">
                      {item.month} {item.year} ({item.date})
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed">{item.description}</p>

                  {item.healthImpact && (
                    <div className="p-2.5 rounded-lg bg-teal-50/80 border border-teal-200 text-xs text-teal-950 font-medium">
                      <strong className="text-teal-900 block text-[11px] uppercase tracking-wider">Clinical Impact:</strong>
                      {item.healthImpact}
                    </div>
                  )}

                  {item.biomarkerChange && (
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                      <span className="font-semibold text-slate-700">{item.biomarkerChange.label}:</span>
                      <span className="text-slate-400 line-through">{item.biomarkerChange.from}</span>
                      <span className="text-teal-600 font-bold">→</span>
                      <span className="font-bold text-teal-700 bg-teal-100 px-1.5 py-0.5 rounded">
                        {item.biomarkerChange.to}
                      </span>
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-200/60 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                    {item.doctor && (
                      <span className="flex items-center gap-1">
                        <Stethoscope className="w-3 h-3 text-slate-400" />
                        <span>Doctor: <strong className="text-slate-700">{item.doctor}</strong></span>
                      </span>
                    )}
                    {item.facility && (
                      <span>Facility: <strong className="text-slate-700">{item.facility}</strong></span>
                    )}
                    {item.treatment && (
                      <span>Treatment: <strong className="text-slate-700">{item.treatment}</strong></span>
                    )}
                    {item.notes && (
                      <span className="text-slate-500 italic">Notes: {item.notes}</span>
                    )}
                  </div>

                  {item.relatedDocId && (
                    <div className="pt-1">
                      <button
                        onClick={() => {
                          const doc = documents.find((d) => d.id === item.relatedDocId);
                          if (doc) onViewReport(doc);
                        }}
                        className="text-xs font-bold text-teal-700 hover:text-teal-900 inline-flex items-center gap-1"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>View linked medical document</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: REPORTS & DOCUMENTS */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Medical Reports & Scans</h3>
              <p className="text-xs text-slate-500">
                All uploaded documents with AI structured extractions and verified reference ranges.
              </p>
            </div>
            <button
              onClick={onOpenUpload}
              className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition shadow-2xs flex items-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Report</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {memberDocs.map((doc) => (
              <div
                key={doc.id}
                onClick={() => onViewReport(doc)}
                className="p-5 bg-white rounded-2xl border border-slate-200/80 hover:border-teal-300 hover:shadow-md transition cursor-pointer flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[11px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                      {doc.type}
                    </span>
                    <div className="text-right text-[11px] text-slate-500">
                      <div>Date: <strong className="text-slate-700">{doc.date}</strong></div>
                      {doc.uploadDate && (
                        <div className="text-[10px] text-teal-700 flex items-center gap-1 justify-end mt-0.5">
                          <Clock className="w-3 h-3" />
                          <span>Uploaded: {new Date(doc.uploadDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <h4 className="font-bold text-slate-900 text-sm hover:text-teal-700 transition">
                    {doc.title}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Facility: {doc.facility} • {doc.doctor}
                  </p>

                  {doc.remarks && (
                    <div className="mt-2.5 p-2 bg-teal-50/50 rounded-xl border border-teal-100 text-xs text-slate-700">
                      <div className="flex items-center gap-1 text-[10px] font-bold text-teal-800 uppercase tracking-wider mb-0.5">
                        <MessageSquare className="w-3 h-3 text-teal-700" />
                        <span>Remarks & Notes</span>
                      </div>
                      <p className="line-clamp-2 leading-relaxed italic text-[11px]">"{doc.remarks}"</p>
                    </div>
                  )}

                  {doc.aiSummary && !doc.remarks && (
                    <div className="mt-3 p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-700">
                      <div className="text-[10px] font-bold text-teal-700 uppercase tracking-wider mb-0.5">
                        AI Clinical Summary
                      </div>
                      <p className="line-clamp-2 leading-relaxed italic">"{doc.aiSummary}"</p>
                    </div>
                  )}

                  {doc.extractedData.labResults && doc.extractedData.labResults.length > 0 && (
                    <div className="mt-3 space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Extracted Lab Values ({doc.extractedData.labResults.length})
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {doc.extractedData.labResults.slice(0, 3).map((res, i) => (
                          <span
                            key={i}
                            className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-medium"
                          >
                            {res.name.split(' ')[0]}: <strong>{res.value}</strong>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="text-[11px] font-mono">{doc.fileSize} • {doc.fileType.toUpperCase()}</span>
                  <span className="font-semibold text-teal-700 flex items-center gap-1">
                    Open detailed report & comparison <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: CONDITIONS */}
      {activeTab === 'conditions' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Recorded Medical Conditions</h3>
              <p className="text-xs text-slate-500">
                Track status, diagnosing physician, treatments, and linked lab panels.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {memberConditions.map((cond) => (
              <div
                key={cond.id}
                className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-900 text-base">{cond.name}</h4>
                    <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-teal-50 text-teal-800 border border-teal-200">
                      {cond.status}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 font-medium">
                    Diagnosed: {cond.dateDiagnosed}
                  </span>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed">{cond.notes}</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2 border-t border-slate-100">
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Treating Physician
                    </span>
                    <span className="font-semibold text-slate-800">{cond.treatingDoctor}</span>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Active Treatments & Management
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {cond.treatments.map((t, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-slate-100 rounded text-slate-700">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: MEDICATIONS */}
      {activeTab === 'medications' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Medication Management</h3>
              <p className="text-xs text-slate-500">
                Prescribed doses, timings, and historical medications. (Never adjust dosages without doctor supervision).
              </p>
            </div>
            <button
              onClick={() => setShowAddMedModal(true)}
              className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition shadow-2xs flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Medication</span>
            </button>
          </div>

          {/* Current Medications */}
          <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Active Prescriptions & Ongoing Regimens</span>
              </h4>
              <span className="text-xs text-slate-500 font-semibold">{currentMeds.length} active</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {currentMeds.map((med) => {
                const linkedDoc = med.prescriptionDocId ? documents.find((d) => d.id === med.prescriptionDocId) : null;
                return (
                  <div key={med.id} className="p-4 rounded-xl bg-slate-50/90 border border-slate-200/80 text-xs space-y-2">
                    <div className="flex items-start justify-between font-bold text-slate-900 gap-2">
                      <div>
                        <span className="text-sm font-black">{med.name}</span>
                        <span className="ml-2 px-2 py-0.5 bg-teal-50 text-teal-800 border border-teal-200 rounded font-mono text-[11px]">
                          {med.dosage}
                        </span>
                      </div>
                      <span className="px-2 py-0.5 bg-white border border-slate-200 rounded text-slate-700 text-[11px] shrink-0 font-medium">
                        {med.frequency}
                      </span>
                    </div>

                    <div className="text-slate-600">
                      Reason: <strong className="text-slate-800">{med.reason}</strong>
                    </div>

                    {/* Prescribing Doctor & Facility Box */}
                    <div className="p-2.5 rounded-lg bg-white border border-slate-200/80 space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-slate-900 flex items-center gap-1">
                          <Stethoscope className="w-3 h-3 text-teal-600" />
                          <span>{med.prescribingDoctor}</span>
                        </span>
                        {med.rxNumber && (
                          <span className="font-mono text-[10px] text-slate-500">{med.rxNumber}</span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-500 flex flex-wrap gap-x-2">
                        {med.doctorSpecialty && <span>{med.doctorSpecialty}</span>}
                        {med.facility && <span>• {med.facility}</span>}
                      </div>
                      {linkedDoc && (
                        <button
                          type="button"
                          onClick={() => onViewReport(linkedDoc)}
                          className="mt-1 inline-flex items-center gap-1 text-[10px] text-teal-700 hover:text-teal-900 font-bold hover:underline"
                        >
                          <FileText className="w-3 h-3" />
                          <span>View Signed Prescription</span>
                        </button>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                      <span>Started: {med.startDate}</span>
                      {med.timing && <span className="text-teal-700 font-semibold">{med.timing}</span>}
                    </div>

                    {med.notes && (
                      <p className="text-[11px] text-slate-500 italic bg-white p-2 rounded border border-slate-100">
                        {med.notes}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Past / Consumed Medications */}
          {pastMeds.length > 0 && (
            <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Medicines Consumed & Completed Courses</span>
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Finished antibiotic courses, tapered medications, and post-surgical analgesics with prescribing physician attribution.
                  </p>
                </div>
                <span className="text-xs text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full font-bold border border-emerald-200">
                  {pastMeds.length} consumed
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {pastMeds.map((med) => {
                  const linkedDoc = med.prescriptionDocId ? documents.find((d) => d.id === med.prescriptionDocId) : null;
                  return (
                    <div key={med.id} className="p-3.5 rounded-xl bg-slate-50/60 border border-slate-200/70 text-xs space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-bold text-slate-900 text-sm">
                            {med.name} <span className="text-xs font-mono text-teal-800">({med.dosage})</span>
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">{med.reason}</div>
                        </div>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
                          {med.consumptionStatus === 'discontinued' ? 'Discontinued' : 'Consumed'}
                        </span>
                      </div>

                      {/* Prescribing Doctor Info */}
                      <div className="p-2 rounded-lg bg-white border border-slate-200 text-[11px] space-y-1">
                        <div className="font-semibold text-slate-800 flex items-center gap-1">
                          <Stethoscope className="w-3 h-3 text-teal-600" />
                          <span>Prescribed by: {med.prescribingDoctor}</span>
                        </div>
                        {med.doctorSpecialty && (
                          <div className="text-[10px] text-slate-500">{med.doctorSpecialty} • {med.facility}</div>
                        )}
                        {linkedDoc && (
                          <button
                            type="button"
                            onClick={() => onViewReport(linkedDoc)}
                            className="mt-1 inline-flex items-center gap-1 text-[10px] text-teal-700 hover:text-teal-900 font-bold hover:underline"
                          >
                            <FileText className="w-3 h-3" />
                            <span>View Original Prescription Document</span>
                          </button>
                        )}
                      </div>

                      <div className="text-[11px] text-emerald-800 font-medium">
                        {med.durationText || `Course: ${med.startDate} to ${med.endDate || 'Finished'}`}
                      </div>

                      {med.notes && (
                        <p className="text-[10px] text-slate-500 italic">{med.notes}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 6: TREATMENTS & SURGERIES */}
      {activeTab === 'treatments' && (
        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Treatments, Surgeries & Procedures</h3>
            <p className="text-xs text-slate-500">
              Documented surgical history, clinical interventions, and post-operative outcomes.
            </p>
          </div>

          <div className="space-y-3">
            {memberTreatments.map((t) => (
              <div key={t.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 text-xs space-y-2">
                <div className="flex items-center justify-between font-bold text-slate-900">
                  <span className="text-sm">{t.name}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200 font-semibold">
                    {t.type}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500">
                  Date: {t.date} • Facility: {t.facility} • Surgeon/Doctor: {t.doctor}
                </div>
                <p className="text-slate-700 leading-relaxed">{t.description}</p>
                <div className="p-2 bg-white rounded-lg border border-slate-100 text-[11px] text-teal-900 font-medium">
                  <strong>Outcome:</strong> {t.outcome}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 7: DOCTORS */}
      {activeTab === 'doctors' && (
        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Care Team & Treating Physicians</h3>
            <p className="text-xs text-slate-500">
              Specialists and clinics managing {member.name}'s ongoing healthcare.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {doctors.map((doc) => (
              <div key={doc.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 text-xs space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{doc.name}</h4>
                    <span className="text-teal-700 font-semibold text-xs">{doc.specialty}</span>
                  </div>
                </div>
                <div className="text-slate-600 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-slate-400" />
                  <span>{doc.hospital}</span>
                </div>
                <div className="text-slate-600 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{doc.phone}</span>
                </div>
                {doc.notes && (
                  <p className="text-[11px] text-slate-500 italic pt-1 border-t border-slate-200/60">
                    "{doc.notes}"
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 8: AI ASSISTANT EMBEDDED */}
      {activeTab === 'ai_assistant' && (
        <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-2xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-teal-600" />
                <h3 className="font-bold text-slate-900 text-base">
                  Family Health AI • Analyzing {member.name}
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Ask questions about {member.name}'s medical records, trends, and history.
              </p>
            </div>
            <button
              onClick={() => onOpenAIAssistant(member)}
              className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold"
            >
              Open Full-Screen AI Chat
            </button>
          </div>

          <div className="p-4 bg-teal-50/50 rounded-xl border border-teal-100 space-y-3">
            <span className="text-xs font-bold text-teal-900">Suggested Inquiries for {member.name}:</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {[
                'Give me a summary of his health.',
                'What changed in his health over the last year?',
                'What medications is he currently taking?',
                'Show me his diabetes history.',
                'Which reports mention kidney function?',
                'What treatments has he received?',
                'What should we ask the doctor during the next visit?',
                'Why might he be experiencing fatigue?',
              ].map((q, i) => (
                <button
                  key={i}
                  onClick={() => onOpenAIAssistant(member, q)}
                  className="text-left p-2.5 rounded-lg bg-white border border-teal-200/70 hover:bg-teal-100/50 hover:border-teal-300 text-slate-800 transition font-medium text-xs flex items-center justify-between group"
                >
                  <span>"{q}"</span>
                  <ArrowRight className="w-3.5 h-3.5 text-teal-600 group-hover:translate-x-0.5 transition" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add Medication Modal */}
      {showAddMedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-900 text-base">Add Medication for {member.name}</h3>
              <button
                onClick={() => setShowAddMedModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveMed} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Medication Name</label>
                <input
                  type="text"
                  required
                  value={medName}
                  onChange={(e) => setMedName(e.target.value)}
                  placeholder="e.g. Metformin Hydrochloride"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Dosage</label>
                  <input
                    type="text"
                    required
                    value={medDose}
                    onChange={(e) => setMedDose(e.target.value)}
                    placeholder="e.g. 500 mg"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Frequency</label>
                  <input
                    type="text"
                    required
                    value={medFreq}
                    onChange={(e) => setMedFreq(e.target.value)}
                    placeholder="e.g. 2 times / day"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Reason / Indication</label>
                <input
                  type="text"
                  required
                  value={medReason}
                  onChange={(e) => setMedReason(e.target.value)}
                  placeholder="e.g. Glycemic management for Type 2 Diabetes"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Prescribing Doctor</label>
                <input
                  type="text"
                  value={medDoctor}
                  onChange={(e) => setMedDoctor(e.target.value)}
                  placeholder="e.g. Dr. Sameer Gupta"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <div className="p-2.5 rounded-lg bg-amber-50/70 border border-amber-200/80 text-[11px] text-amber-800 leading-relaxed">
                Medical reminder: Do not alter dosages or discontinue medications without consulting your physician.
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddMedModal(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg shadow-xs"
                >
                  Save Medication
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showAddMemberModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
                  <UserPlus className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">Add Family Member</h3>
              </div>
              <button
                onClick={() => setShowAddMemberModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newMemberName.trim()) return;
                if (onAddMember) {
                  onAddMember({
                    name: newMemberName.trim(),
                    age: parseInt(newMemberAge, 10) || 30,
                    relationship: newMemberRelation,
                    bloodGroup: newMemberBlood,
                  });
                }
                setNewMemberName('');
                setNewMemberAge('');
                setShowAddMemberModal(false);
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  placeholder="e.g. Maya Sharma"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Relationship</label>
                  <select
                    value={newMemberRelation}
                    onChange={(e) => setNewMemberRelation(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 bg-white"
                  >
                    <option value="Spouse">Spouse</option>
                    <option value="Son">Son</option>
                    <option value="Daughter">Daughter</option>
                    <option value="Mother">Mother</option>
                    <option value="Father">Father</option>
                    <option value="Grandmother">Grandmother</option>
                    <option value="Grandfather">Grandfather</option>
                    <option value="Sibling">Sibling</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Age</label>
                  <input
                    type="number"
                    value={newMemberAge}
                    onChange={(e) => setNewMemberAge(e.target.value)}
                    placeholder="e.g. 28"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Blood Group</label>
                <select
                  value={newMemberBlood}
                  onChange={(e) => setNewMemberBlood(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 bg-white"
                >
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddMemberModal(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg shadow-xs"
                >
                  Add to Family
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditProfileOpen}
        member={member}
        onClose={() => setIsEditProfileOpen(false)}
        onSave={(updated) => {
          if (onUpdateMember) {
            onUpdateMember(updated);
          }
        }}
      />
    </div>
  );
};
