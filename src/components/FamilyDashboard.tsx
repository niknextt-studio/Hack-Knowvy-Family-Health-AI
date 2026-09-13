import React, { useState } from 'react';
import {
  Users,
  Plus,
  ArrowUpRight,
  FileText,
  Calendar,
  Pill,
  Sparkles,
  Activity,
  Heart,
  CheckCircle2,
  AlertCircle,
  Clock,
  ChevronRight,
  ShieldCheck,
  Stethoscope,
  Copy,
  Check,
  UserPlus,
  Hash,
  SlidersHorizontal,
  Flame,
  Droplets,
  Layers,
} from 'lucide-react';
import {
  Family,
  FamilyMember,
  MedicalDocument,
  Appointment,
  Medication,
  TimelineEvent,
  MedicalCondition,
} from '../types';
import { ConditionOverviewCard } from './dashboard/ConditionOverviewCard';
import { VitalsVisualMatrix } from './dashboard/VitalsVisualMatrix';
import { CareScheduleCard } from './dashboard/CareScheduleCard';

interface FamilyDashboardProps {
  family: Family;
  members: FamilyMember[];
  currentUser: FamilyMember;
  documents: MedicalDocument[];
  appointments: Appointment[];
  medications: Medication[];
  timeline: TimelineEvent[];
  conditions?: MedicalCondition[];
  onSelectMember: (member: FamilyMember) => void;
  onOpenUpload: () => void;
  onOpenDoctorVisit: (member: FamilyMember) => void;
  onOpenAIAssistant: (member: FamilyMember) => void;
  onViewReport: (doc: MedicalDocument) => void;
  onAddMember?: (newMember: Partial<FamilyMember>) => void;
  onOpenInviteModal?: () => void;
  onNavigateView?: (view: any) => void;
}

export const FamilyDashboard: React.FC<FamilyDashboardProps> = ({
  family,
  members,
  currentUser,
  documents,
  appointments,
  medications,
  timeline,
  conditions = [],
  onSelectMember,
  onOpenUpload,
  onOpenDoctorVisit,
  onOpenAIAssistant,
  onViewReport,
  onAddMember,
  onOpenInviteModal,
  onNavigateView,
}) => {
  // Filter by selected family member tab ("all" or member ID)
  const [activeFilterId, setActiveFilterId] = useState<string>('all');

  // Currently focused member for vitals / specific drilldown
  const focusedMember =
    activeFilterId === 'all'
      ? members.find((m) => m.id === currentUser.id) || members[0]
      : members.find((m) => m.id === activeFilterId) || members[0];

  // Filtered conditions according to active filter
  const filteredConditions =
    activeFilterId === 'all'
      ? conditions
      : conditions.filter((c) => c.memberId === activeFilterId);

  // Filtered documents
  const filteredDocuments =
    activeFilterId === 'all'
      ? documents
      : documents.filter((d) => d.memberId === activeFilterId);

  // Filtered appointments
  const upcomingApts = appointments
    .filter((a) => a.status === 'upcoming')
    .filter((a) => (activeFilterId === 'all' ? true : a.memberId === activeFilterId));

  // Compute family vitality metrics
  const totalConditions = conditions.length;
  const managedConditions = conditions.filter(
    (c) => c.status === 'Managed' || c.status === 'Resolved'
  ).length;
  const conditionControlRate =
    totalConditions > 0 ? Math.round((managedConditions / totalConditions) * 100) : 100;

  return (
    <div className="space-y-6 pb-14 max-w-7xl mx-auto">
      {/* 1. TOP HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200/80">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
              <span>{family.name}</span>
            </span>
            <span className="text-[11px] text-slate-400 font-mono">PRIVATE VAULT</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
            Health Overview
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Active medical conditions, vital matrices, and care schedules across your health space.
          </p>
        </div>
      </div>

      {/* 2. INTERACTIVE MEMBER SELECTOR RIBBON */}
      <div className="p-2 bg-white rounded-2xl border border-slate-200/90 shadow-2xs flex items-center gap-2 overflow-x-auto scrollbar-none">
        {/* All Family Chip */}
        <button
          type="button"
          onClick={() => setActiveFilterId('all')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition flex-shrink-0 ${
            activeFilterId === 'all'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/70'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Entire Family</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded-full ${
              activeFilterId === 'all' ? 'bg-slate-800 text-slate-300' : 'bg-slate-200 text-slate-700'
            }`}
          >
            {members.length}
          </span>
        </button>

        {/* Member Avatar Pills */}
        {members.map((member) => {
          const isSelected = activeFilterId === member.id;
          const isAttention = member.status === 'attention';
          const isStable = member.status === 'stable';

          return (
            <button
              key={member.id}
              type="button"
              onClick={() => setActiveFilterId(member.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition flex-shrink-0 ${
                isSelected
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/70'
              }`}
            >
              <div className="relative">
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="w-6 h-6 rounded-full object-cover border border-white/60"
                />
                <span
                  className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ring-2 ${
                    isSelected ? 'ring-teal-600' : 'ring-white'
                  } ${
                    isAttention ? 'bg-amber-400' : isStable ? 'bg-teal-400' : 'bg-emerald-500'
                  }`}
                  title={member.statusText}
                />
              </div>
              <span>{member.name.split(' ')[0]}</span>
              {member.conditionsSummary && member.conditionsSummary.length > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                    isSelected
                      ? 'bg-teal-700 text-teal-100'
                      : 'bg-slate-200/80 text-slate-600'
                  }`}
                >
                  {member.conditionsSummary.length} cond
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 3. VISUAL HEALTH STABILITY & VITALITY HERO CARD */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Vitality Gauge (5 cols) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 text-white rounded-2xl p-6 shadow-sm flex flex-col justify-between relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-teal-400 uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-4 h-4" />
                {activeFilterId === 'all' ? 'Family Health Stability' : `${focusedMember.name}'s Stability`}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-emerald-400 border border-emerald-500/30">
                ACTIVE AUDIT
              </span>
            </div>

            {/* Radial Score Gauge */}
            <div className="flex items-center gap-5 my-5">
              <div className="relative w-24 h-24 flex items-center justify-center flex-shrink-0">
                <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-800"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-teal-400"
                    strokeDasharray={`${conditionControlRate}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-2xl font-black text-white font-mono leading-none">
                    {conditionControlRate}%
                  </span>
                  <span className="text-[9px] uppercase font-bold text-slate-400 mt-0.5">Control</span>
                </div>
              </div>

              <div>
                <h3 className="text-base font-bold text-white leading-tight">
                  {conditionControlRate >= 80 ? 'Optimal Clinical Control' : 'Active Management Required'}
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  {managedConditions} of {totalConditions} documented conditions are within optimal treatment targets.
                </p>
              </div>
            </div>
          </div>

          {/* Micro Stat Indicators */}
          <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-800 text-center">
            <div className="p-2 bg-slate-800/60 rounded-xl">
              <div className="text-sm font-black text-white font-mono">{filteredConditions.length}</div>
              <div className="text-[10px] text-slate-400">Conditions</div>
            </div>
            <div className="p-2 bg-slate-800/60 rounded-xl">
              <div className="text-sm font-black text-teal-400 font-mono">{filteredDocuments.length}</div>
              <div className="text-[10px] text-slate-400">Lab Records</div>
            </div>
            <div className="p-2 bg-slate-800/60 rounded-xl">
              <div className="text-sm font-black text-emerald-400 font-mono">{upcomingApts.length}</div>
              <div className="text-[10px] text-slate-400">Visits Due</div>
            </div>
          </div>
        </div>

        {/* Right Vitals Matrix (7 cols) */}
        <div className="lg:col-span-7">
          <VitalsVisualMatrix member={focusedMember} />
        </div>
      </div>

      {/* 4. DEDICATED CONDITION OVERVIEW SECTION ("the overview of the condition") */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
              <Heart className="w-4 h-4 text-teal-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Condition Overview & Longitudinal Management
              </h2>
              <p className="text-xs text-slate-500">
                Visual severity, clinical target progress, and treatment adherence
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 hidden sm:inline">
              {filteredConditions.length} tracked {filteredConditions.length === 1 ? 'condition' : 'conditions'}
            </span>
            <button
              type="button"
              onClick={() => onSelectMember(focusedMember)}
              className="text-xs font-bold text-teal-700 hover:text-teal-900 inline-flex items-center gap-1"
            >
              <span>Full Medical History</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Condition Cards Grid */}
        {filteredConditions.length === 0 ? (
          <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
            <h4 className="font-bold text-slate-800 text-sm">No Active Medical Conditions Recorded</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              This profile has no chronic conditions or active clinical alerts logged. Upload diagnostic reports to let AI organize clinical findings.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredConditions.map((cond) => {
              const condMember = members.find((m) => m.id === cond.memberId) || focusedMember;
              const condDoc = documents.find((d) => d.id === cond.relatedDocIds[0]);
              return (
                <ConditionOverviewCard
                  key={cond.id}
                  condition={cond}
                  member={condMember}
                  latestDoc={condDoc}
                  onOpenDoctorVisit={onOpenDoctorVisit}
                  onSelectMember={onSelectMember}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* 5. CARE SCHEDULE & RECENT RECORDS (2 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Today's Care & Medication Schedule (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          <CareScheduleCard
            medications={medications}
            members={members}
            activeMemberFilter={activeFilterId === 'all' ? undefined : activeFilterId}
          />

          {/* Upcoming Clinical Appointments */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5">
            <div className="flex items-center justify-between mb-3.5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                  <Calendar className="w-4 h-4 text-teal-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Upcoming Consultations</h3>
                  <p className="text-[11px] text-slate-500">{upcomingApts.length} scheduled visits</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {onNavigateView && (
                  <button
                    type="button"
                    onClick={() => onNavigateView('appointments')}
                    className="text-xs font-bold text-teal-700 hover:text-teal-900 inline-flex items-center gap-1 transition"
                  >
                    <span>All Doctor Visits & Reports</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                )}
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  Calendar
                </span>
              </div>
            </div>

            {upcomingApts.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">
                No upcoming appointments scheduled for this filter.
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingApts.map((apt) => {
                  const aptMember = members.find((m) => m.id === apt.memberId) || focusedMember;
                  return (
                    <div
                      key={apt.id}
                      className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-teal-50/30 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex flex-col items-center justify-center flex-shrink-0 text-center shadow-2xs">
                          <span className="text-[9px] font-bold text-teal-700 uppercase">
                            {apt.date.split('-')[1] || 'SEP'}
                          </span>
                          <span className="text-base font-black text-slate-900 font-mono leading-none">
                            {apt.date.split('-')[2] || '24'}
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-xs">{apt.doctorName}</span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-teal-50 text-teal-800 border border-teal-200 font-semibold">
                              {apt.specialty}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Patient: <strong className="text-slate-700">{aptMember.name}</strong> • {apt.time}
                          </p>
                          <p className="text-[11px] text-slate-600 italic mt-0.5">"{apt.reason}"</p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => onOpenDoctorVisit(aptMember)}
                        className="px-3 py-1.5 bg-white hover:bg-teal-50 text-teal-800 border border-slate-200 rounded-lg text-[11px] font-bold transition flex-shrink-0 shadow-2xs text-center"
                      >
                        Prepare Visit →
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Recent Verified Documents & Lab Findings (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5">
            <div className="flex items-center justify-between mb-3.5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                  <FileText className="w-4 h-4 text-teal-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Recent Medical Documents</h3>
                  <p className="text-[11px] text-slate-500">AI-extracted diagnostic and clinical reports</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onOpenUpload}
                className="text-xs font-bold text-teal-700 hover:text-teal-900"
              >
                + Upload New
              </button>
            </div>

            {filteredDocuments.length === 0 ? (
              <div className="py-8 px-4 text-center bg-slate-50/70 rounded-xl border border-slate-200/70 space-y-2">
                <FileText className="w-8 h-8 text-slate-300 mx-auto" />
                <div className="font-bold text-slate-700 text-xs">No Medical Documents Yet</div>
                <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                  Upload lab reports, prescriptions, or discharge summaries to see AI clinical summaries here.
                </p>
                <button
                  type="button"
                  onClick={onOpenUpload}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition shadow-2xs mt-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Upload First Document</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredDocuments.slice(0, 4).map((doc) => {
                  const docMember = members.find((m) => m.id === doc.memberId) || focusedMember;
                  return (
                    <div
                      key={doc.id}
                      onClick={() => onViewReport(doc)}
                      className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/60 hover:bg-teal-50/40 hover:border-teal-300/80 transition cursor-pointer flex items-start justify-between gap-3 text-xs group"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 font-black text-[11px] flex items-center justify-center flex-shrink-0">
                          {doc.fileType.toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-bold text-slate-900 text-xs truncate group-hover:text-teal-800">
                              {doc.title}
                            </h4>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200/80 text-slate-700 font-semibold">
                              {doc.type}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {docMember.name} • {doc.facility} • {doc.date}
                          </p>

                          {/* Visual Key Findings Chips */}
                          {doc.extractedData?.labResults && doc.extractedData.labResults.length > 0 && (
                            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                              {doc.extractedData.labResults.slice(0, 3).map((res, i) => (
                                <span
                                  key={i}
                                  className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 shadow-2xs"
                                >
                                  <span>{res.name.split(' ')[0]}:</span>
                                  <strong className="text-teal-700">{res.value}</strong>
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-teal-700 font-bold group-hover:translate-x-0.5 transition flex-shrink-0 self-center">
                        <span className="text-[11px]">View</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
