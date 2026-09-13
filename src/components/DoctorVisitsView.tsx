import React, { useState, useMemo } from 'react';
import {
  Stethoscope,
  Calendar,
  Clock,
  MapPin,
  Search,
  Plus,
  FileText,
  CheckCircle2,
  AlertCircle,
  Pill,
  Activity,
  Heart,
  Eye,
  Sparkles,
  Share2,
  Printer,
  ChevronRight,
  User,
  ArrowRight,
  ClipboardCheck,
  Building,
  Phone,
  Mail,
  ShieldCheck,
  X,
  SlidersHorizontal,
  ExternalLink,
} from 'lucide-react';
import {
  FamilyMember,
  Appointment,
  Doctor,
  MedicalDocument,
} from '../types';

interface DoctorVisitsViewProps {
  appointments: Appointment[];
  members: FamilyMember[];
  activeMember: FamilyMember;
  onSelectMember: (member: FamilyMember) => void;
  doctors: Doctor[];
  documents: MedicalDocument[];
  onViewReport: (doc: MedicalDocument) => void;
  onOpenAIAssistant: (query?: string) => void;
  onOpenDoctorVisitModal: (member: FamilyMember) => void;
  onOpenDoctorShare: (member: FamilyMember) => void;
  onAddAppointment: (apt: Partial<Appointment>) => void;
}

type StatusFilter = 'all' | 'completed' | 'upcoming';
type ViewMode = 'cards' | 'table' | 'doctors';

export const DoctorVisitsView: React.FC<DoctorVisitsViewProps> = ({
  appointments,
  members,
  activeMember,
  onSelectMember,
  doctors,
  documents,
  onViewReport,
  onOpenAIAssistant,
  onOpenDoctorVisitModal,
  onOpenDoctorShare,
  onAddAppointment,
}) => {
  // Filter States
  const [selectedMemberId, setSelectedMemberId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('cards');

  // Selected visit for deep inspection modal
  const [inspectingVisit, setInspectingVisit] = useState<Appointment | null>(null);

  // Modal State for logging a new doctor visit
  const [isAddVisitModalOpen, setIsAddVisitModalOpen] = useState(false);
  const [newVisitData, setNewVisitData] = useState({
    memberId: activeMember.id,
    doctorName: '',
    doctorTitle: '',
    specialty: 'Internal Medicine',
    clinic: '',
    date: new Date().toISOString().split('T')[0],
    time: '10:00 AM',
    status: 'completed' as 'completed' | 'upcoming',
    visitType: 'Specialist Consultation' as Appointment['visitType'],
    reason: '',
    reportSummary: '',
    diagnosis: '',
    bloodPressure: '',
    pulse: '',
    weight: '',
    bloodSugar: '',
    keyFindings: '',
    prescriptionsGiven: '',
    followUpPlan: '',
    relatedDocId: '',
  });

  // Extract all unique specialties from appointments & doctors
  const specialties = useMemo(() => {
    const list = new Set<string>();
    appointments.forEach((apt) => {
      if (apt.specialty) list.add(apt.specialty);
    });
    doctors.forEach((doc) => {
      if (doc.specialty) list.add(doc.specialty.split('&')[0].trim());
    });
    return Array.from(list);
  }, [appointments, doctors]);

  // Filtered Appointments
  const filteredAppointments = useMemo(() => {
    return appointments
      .filter((apt) => {
        // Member filter
        if (selectedMemberId !== 'all' && apt.memberId !== selectedMemberId) {
          return false;
        }

        // Status filter
        if (statusFilter !== 'all' && apt.status !== statusFilter) {
          return false;
        }

        // Specialty filter
        if (selectedSpecialty !== 'all' && !apt.specialty.toLowerCase().includes(selectedSpecialty.toLowerCase())) {
          return false;
        }

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchDoc = apt.doctorName.toLowerCase().includes(q);
          const matchReason = (apt.reason || '').toLowerCase().includes(q);
          const matchReport = (apt.reportSummary || '').toLowerCase().includes(q);
          const matchDiag = (apt.diagnosis || '').toLowerCase().includes(q);
          const matchClinic = (apt.clinic || '').toLowerCase().includes(q);
          const matchSpec = (apt.specialty || '').toLowerCase().includes(q);
          const matchMeds = (apt.prescriptionsGiven || []).some((m) => m.toLowerCase().includes(q));

          return matchDoc || matchReason || matchReport || matchDiag || matchClinic || matchSpec || matchMeds;
        }

        return true;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [appointments, selectedMemberId, statusFilter, selectedSpecialty, searchQuery]);

  // Key Statistics
  const stats = useMemo(() => {
    const relevantApts =
      selectedMemberId === 'all'
        ? appointments
        : appointments.filter((a) => a.memberId === selectedMemberId);

    const completed = relevantApts.filter((a) => a.status === 'completed');
    const upcoming = relevantApts.filter((a) => a.status === 'upcoming');
    const distinctDoctors = new Set(relevantApts.map((a) => a.doctorName.toLowerCase())).size;
    const withReports = relevantApts.filter((a) => Boolean(a.reportSummary || a.relatedDocId)).length;

    return {
      total: relevantApts.length,
      completed: completed.length,
      upcoming: upcoming.length,
      distinctDoctors,
      withReports,
    };
  }, [appointments, selectedMemberId]);

  // Helper to find family member by ID
  const getMember = (id: string) => members.find((m) => m.id === id);

  // Helper to get matching document
  const getDocument = (docId?: string) => {
    if (!docId) return null;
    return documents.find((d) => d.id === docId);
  };

  // Helper to get specialty badge icon
  const getSpecialtyIcon = (specialty: string) => {
    const specLower = specialty.toLowerCase();
    if (specLower.includes('cardio') || specLower.includes('heart')) {
      return Heart;
    }
    if (specLower.includes('endo') || specLower.includes('diabet') || specLower.includes('metabol')) {
      return Activity;
    }
    if (specLower.includes('ortho') || specLower.includes('joint') || specLower.includes('bone')) {
      return Activity;
    }
    if (specLower.includes('opht') || specLower.includes('eye') || specLower.includes('vision')) {
      return Eye;
    }
    return Stethoscope;
  };

  // Handle Form Submit
  const handleCreateVisit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVisitData.doctorName.trim() || !newVisitData.reason.trim()) return;

    const findingsArray = newVisitData.keyFindings
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const medsArray = newVisitData.prescriptionsGiven
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const linkedDoc = documents.find((d) => d.id === newVisitData.relatedDocId);

    const createdApt: Partial<Appointment> = {
      memberId: newVisitData.memberId,
      doctorName: newVisitData.doctorName.trim(),
      doctorTitle: newVisitData.doctorTitle.trim() || undefined,
      specialty: newVisitData.specialty.trim() || 'General Medicine',
      clinic: newVisitData.clinic.trim() || 'Family Care Clinic',
      date: newVisitData.date,
      time: newVisitData.time,
      status: newVisitData.status,
      visitType: newVisitData.visitType,
      reason: newVisitData.reason.trim(),
      reportSummary: newVisitData.reportSummary.trim() || undefined,
      diagnosis: newVisitData.diagnosis.trim() || undefined,
      vitalsRecorded:
        newVisitData.bloodPressure || newVisitData.pulse || newVisitData.weight || newVisitData.bloodSugar
          ? {
              bloodPressure: newVisitData.bloodPressure.trim() || undefined,
              pulse: newVisitData.pulse.trim() || undefined,
              weight: newVisitData.weight.trim() || undefined,
              bloodSugar: newVisitData.bloodSugar.trim() || undefined,
            }
          : undefined,
      keyFindings: findingsArray.length > 0 ? findingsArray : undefined,
      prescriptionsGiven: medsArray.length > 0 ? medsArray : undefined,
      followUpPlan: newVisitData.followUpPlan.trim() || undefined,
      relatedDocId: newVisitData.relatedDocId || undefined,
      relatedDocTitle: linkedDoc ? linkedDoc.title : undefined,
    };

    onAddAppointment(createdApt);
    setIsAddVisitModalOpen(false);

    // Reset Form
    setNewVisitData({
      memberId: activeMember.id,
      doctorName: '',
      doctorTitle: '',
      specialty: 'Internal Medicine',
      clinic: '',
      date: new Date().toISOString().split('T')[0],
      time: '10:00 AM',
      status: 'completed',
      visitType: 'Specialist Consultation',
      reason: '',
      reportSummary: '',
      diagnosis: '',
      bloodPressure: '',
      pulse: '',
      weight: '',
      bloodSugar: '',
      keyFindings: '',
      prescriptionsGiven: '',
      followUpPlan: '',
      relatedDocId: '',
    });
  };

  return (
    <div className="space-y-6 pb-20">
      {/* 1. HERO HEADER */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-10 w-64 h-64 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-semibold uppercase tracking-wider">
              <Stethoscope className="w-3.5 h-3.5" />
              <span>Clinical Encounters & Doctor Reports</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Doctor Visits & Medical Reports
            </h1>
            <p className="text-slate-300 text-sm leading-relaxed">
              Track every doctor consultation, understand <strong>why you visited</strong>, inspect
              the <strong>resulting diagnostic reports & clinical conclusions</strong>, and monitor follow-up treatment plans across your family.
            </p>
          </div>

          {/* Quick Header Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onOpenDoctorVisitModal(activeMember)}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition inline-flex items-center gap-2 shadow-sm"
            >
              <Sparkles className="w-4 h-4 text-teal-300" />
              <span>AI Visit Briefing Prep</span>
            </button>
            <button
              onClick={() => onOpenDoctorShare(activeMember)}
              className="px-4 py-2.5 rounded-xl bg-teal-600/60 hover:bg-teal-600 text-teal-100 hover:text-white text-xs font-bold border border-teal-500/40 transition inline-flex items-center gap-2 shadow-sm"
            >
              <Share2 className="w-4 h-4" />
              <span>Share History with Doctor</span>
            </button>
            <button
              onClick={() => setIsAddVisitModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-teal-400 hover:bg-teal-300 text-slate-950 text-xs font-extrabold transition inline-flex items-center gap-2 shadow-lg shadow-teal-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Log Doctor Visit</span>
            </button>
          </div>
        </div>

        {/* STATS BANNER */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 mt-6 border-t border-white/10">
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
            <div className="text-xs text-slate-400 font-medium">Total Encounters</div>
            <div className="text-xl sm:text-2xl font-black text-white mt-0.5">{stats.total}</div>
            <div className="text-[11px] text-teal-300 mt-0.5 font-medium">Logged in health record</div>
          </div>
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
            <div className="text-xs text-slate-400 font-medium">Physicians Visited</div>
            <div className="text-xl sm:text-2xl font-black text-teal-300 mt-0.5">
              {stats.distinctDoctors}
            </div>
            <div className="text-[11px] text-slate-300 mt-0.5 font-medium">Specialists & PCPs</div>
          </div>
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
            <div className="text-xs text-slate-400 font-medium">Reports Documented</div>
            <div className="text-xl sm:text-2xl font-black text-emerald-300 mt-0.5">
              {stats.withReports}
            </div>
            <div className="text-[11px] text-emerald-400 mt-0.5 font-medium">Clinical conclusions on file</div>
          </div>
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
            <div className="text-xs text-slate-400 font-medium">Upcoming Visits</div>
            <div className="text-xl sm:text-2xl font-black text-cyan-300 mt-0.5">
              {stats.upcoming}
            </div>
            <div className="text-[11px] text-cyan-300 mt-0.5 font-medium">Scheduled follow-ups</div>
          </div>
        </div>
      </div>

      {/* 2. FAMILY MEMBER SELECTOR BAR */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-teal-600" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Filter by Patient / Family Member:
            </span>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Showing visits for:{' '}
            <strong className="text-slate-800">
              {selectedMemberId === 'all'
                ? 'All Family Members'
                : members.find((m) => m.id === selectedMemberId)?.name || 'Selected'}
            </strong>
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSelectedMemberId('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              selectedMemberId === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <span>All Family ({appointments.length})</span>
          </button>

          {members.map((member) => {
            const memberVisitsCount = appointments.filter((a) => a.memberId === member.id).length;
            const isSelected = selectedMemberId === member.id;

            return (
              <button
                key={member.id}
                onClick={() => {
                  setSelectedMemberId(member.id);
                  onSelectMember(member);
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 border ${
                  isSelected
                    ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-teal-300 hover:bg-teal-50/50'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold ${
                    isSelected ? 'bg-white text-teal-800' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {member.name.charAt(0)}
                </div>
                <span>{member.name}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    isSelected ? 'bg-teal-700 text-teal-100' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {memberVisitsCount}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. CONTROLS, SEARCH & VIEW MODE SWITCHER */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by doctor name, reason for visit, diagnosis, hospital, or medicine..."
              className="w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Controls Cluster */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Status Selector */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  statusFilter === 'all'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All ({stats.total})
              </button>
              <button
                onClick={() => setStatusFilter('completed')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  statusFilter === 'completed'
                    ? 'bg-white text-emerald-800 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Completed ({stats.completed})
              </button>
              <button
                onClick={() => setStatusFilter('upcoming')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  statusFilter === 'upcoming'
                    ? 'bg-white text-cyan-800 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Upcoming ({stats.upcoming})
              </button>
            </div>

            {/* Specialty Filter Dropdown */}
            <select
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            >
              <option value="all">All Specialties</option>
              {specialties.map((spec) => (
                <option key={spec} value={spec}>
                  {spec}
                </option>
              ))}
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 border border-slate-200 rounded-xl p-1 bg-slate-50">
              <button
                onClick={() => setViewMode('cards')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  viewMode === 'cards'
                    ? 'bg-teal-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Detailed Cards
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  viewMode === 'table'
                    ? 'bg-teal-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Ledger Table
              </button>
              <button
                onClick={() => setViewMode('doctors')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  viewMode === 'doctors'
                    ? 'bg-teal-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Care Team Directory
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4. MAIN CONTENT AREA */}
      {viewMode === 'cards' && (
        <div className="space-y-6">
          {filteredAppointments.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-2xs space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto">
                <Stethoscope className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-800 text-base">No doctor visits match your filter</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Try clearing your search query or selecting "All Family Members" to view past consultations and reports.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                  setSelectedSpecialty('all');
                  setSelectedMemberId('all');
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            filteredAppointments.map((apt) => {
              const patient = getMember(apt.memberId);
              const linkedDoc = getDocument(apt.relatedDocId);
              const SpecIcon = getSpecialtyIcon(apt.specialty);
              const isCompleted = apt.status === 'completed';

              return (
                <article
                  key={apt.id}
                  className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all duration-200 overflow-hidden"
                >
                  {/* CARD HEADER: DOCTOR INFO + PATIENT + STATUS */}
                  <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-50 via-white to-slate-50 border-b border-slate-200/70">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Left: Doctor Profile Info */}
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200/80 flex items-center justify-center text-teal-700 flex-shrink-0 shadow-xs">
                          <SpecIcon className="w-6 h-6" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
                              {apt.doctorName}
                            </h2>
                            {apt.doctorTitle && (
                              <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                                {apt.doctorTitle}
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600">
                            <span className="font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200/60">
                              {apt.specialty}
                            </span>
                            <span className="flex items-center gap-1 text-slate-500">
                              <MapPin className="w-3.5 h-3.5 text-slate-400" />
                              <span>{apt.clinic}</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Patient & Visit Metadata */}
                      <div className="flex flex-wrap lg:flex-col lg:items-end gap-2 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-bold flex items-center gap-1.5 border border-slate-200">
                            <User className="w-3.5 h-3.5 text-slate-500" />
                            <span>
                              Patient: <strong className="text-slate-900">{patient?.name || 'Family Member'}</strong>
                            </span>
                            {patient && (
                              <span className="text-[10px] text-slate-500 font-normal">
                                ({patient.relationship})
                              </span>
                            )}
                          </span>

                          <span
                            className={`px-3 py-1 rounded-lg font-extrabold uppercase text-[10px] tracking-wider border flex items-center gap-1.5 ${
                              isCompleted
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : 'bg-cyan-50 text-cyan-800 border-cyan-200'
                            }`}
                          >
                            {isCompleted ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Completed Consultation</span>
                              </>
                            ) : (
                              <>
                                <Clock className="w-3.5 h-3.5 text-cyan-600" />
                                <span>Upcoming Appointment</span>
                              </>
                            )}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-slate-500 font-medium">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>
                            {new Date(apt.date).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}{' '}
                            at {apt.time}
                          </span>
                          {apt.visitType && (
                            <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[11px] font-semibold">
                              {apt.visitType}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* CARD BODY: "WHY VISITED" AND "WHAT WAS THE REPORT" */}
                  <div className="p-5 sm:p-6 space-y-5">
                    {/* 1. WHY VISITED SECTION */}
                    <div className="p-4 rounded-2xl bg-cyan-50/50 border border-cyan-200/80 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-cyan-900 font-extrabold text-xs uppercase tracking-wider">
                          <div className="w-2 h-2 rounded-full bg-cyan-600" />
                          <span>Why Visited (Reason & Clinical Objective)</span>
                        </div>
                        <span className="text-[11px] font-semibold text-cyan-800 bg-cyan-100/80 px-2 py-0.5 rounded">
                          Chief Complaint / Purpose
                        </span>
                      </div>
                      <p className="text-sm font-medium text-slate-800 leading-relaxed pl-4 border-l-2 border-cyan-400">
                        {apt.reason}
                      </p>
                    </div>

                    {/* 2. WHAT WAS THE REPORT & FINDINGS SECTION */}
                    {isCompleted ? (
                      <div className="p-4 sm:p-5 rounded-2xl bg-teal-50/60 border border-teal-200/90 space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2 text-teal-950 font-extrabold text-xs uppercase tracking-wider">
                            <ClipboardCheck className="w-4 h-4 text-teal-700" />
                            <span>What Was The Report & Doctor Findings</span>
                          </div>

                          {apt.diagnosis && (
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-teal-100 text-teal-900 border border-teal-300 text-xs font-bold">
                              <span className="text-[10px] uppercase text-teal-700 font-semibold">Diagnosis:</span>
                              <span>{apt.diagnosis}</span>
                            </div>
                          )}
                        </div>

                        {/* Report Narrative Summary */}
                        {apt.reportSummary && (
                          <div className="space-y-1">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-teal-900">
                              Clinical Conclusion / Report Summary:
                            </span>
                            <p className="text-xs sm:text-sm text-slate-800 leading-relaxed bg-white/80 p-3.5 rounded-xl border border-teal-100 shadow-2xs font-normal">
                              {apt.reportSummary}
                            </p>
                          </div>
                        )}

                        {/* Recorded Vitals Strip */}
                        {apt.vitalsRecorded && (
                          <div className="space-y-1.5">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                              Vitals Recorded During Visit:
                            </span>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                              {apt.vitalsRecorded.bloodPressure && (
                                <div className="p-2.5 rounded-xl bg-white border border-slate-200/80">
                                  <span className="text-[10px] text-slate-400 font-medium block">Blood Pressure</span>
                                  <strong className="text-slate-800 font-bold text-sm">
                                    {apt.vitalsRecorded.bloodPressure}
                                  </strong>
                                </div>
                              )}
                              {apt.vitalsRecorded.pulse && (
                                <div className="p-2.5 rounded-xl bg-white border border-slate-200/80">
                                  <span className="text-[10px] text-slate-400 font-medium block">Pulse / Heart Rate</span>
                                  <strong className="text-slate-800 font-bold text-sm">
                                    {apt.vitalsRecorded.pulse}
                                  </strong>
                                </div>
                              )}
                              {apt.vitalsRecorded.weight && (
                                <div className="p-2.5 rounded-xl bg-white border border-slate-200/80">
                                  <span className="text-[10px] text-slate-400 font-medium block">Weight</span>
                                  <strong className="text-slate-800 font-bold text-sm">
                                    {apt.vitalsRecorded.weight}
                                  </strong>
                                </div>
                              )}
                              {apt.vitalsRecorded.bloodSugar && (
                                <div className="p-2.5 rounded-xl bg-white border border-slate-200/80">
                                  <span className="text-[10px] text-slate-400 font-medium block">Blood Sugar</span>
                                  <strong className="text-slate-800 font-bold text-sm">
                                    {apt.vitalsRecorded.bloodSugar}
                                  </strong>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Key Findings Bullet points */}
                        {apt.keyFindings && apt.keyFindings.length > 0 && (
                          <div className="space-y-1.5">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-teal-900">
                              Key Clinical Takeaways:
                            </span>
                            <ul className="space-y-1 pl-1">
                              {apt.keyFindings.map((finding, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 flex-shrink-0 mt-0.5" />
                                  <span>{finding}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Prescriptions & Medications Changed */}
                        {apt.prescriptionsGiven && apt.prescriptionsGiven.length > 0 && (
                          <div className="pt-2 border-t border-teal-200/60 space-y-1.5">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1">
                              <Pill className="w-3 h-3 text-teal-600" />
                              <span>Prescriptions Prescribed / Titrated During Consultation:</span>
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {apt.prescriptionsGiven.map((rx, idx) => (
                                <span
                                  key={idx}
                                  className="px-2.5 py-1 bg-white border border-teal-200 rounded-lg text-xs font-semibold text-slate-800 shadow-2xs"
                                >
                                  {rx}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Follow-up Plan */}
                        {apt.followUpPlan && (
                          <div className="pt-2 border-t border-teal-200/60 flex items-start gap-2 text-xs text-teal-950">
                            <span className="font-bold uppercase text-[10px] tracking-wider text-teal-800 flex-shrink-0 mt-0.5">
                              Next Steps / Advice:
                            </span>
                            <span className="font-medium text-slate-700">{apt.followUpPlan}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      /* Upcoming appointment preparation instructions */
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                        <div className="flex items-center gap-2 text-slate-800 font-bold text-xs uppercase tracking-wider">
                          <Clock className="w-4 h-4 text-cyan-600" />
                          <span>Visit Preparation & Scheduled Next Steps</span>
                        </div>
                        <p className="text-xs text-slate-700 leading-relaxed">
                          {apt.followUpPlan || 'Prepare previous lab results and list of current medications for the physician.'}
                        </p>
                        <div className="flex items-center gap-3 pt-2 border-t border-slate-200/80">
                          {patient && (
                            <button
                              onClick={() => onOpenDoctorVisitModal(patient)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>Generate Pre-Visit AI Summary</span>
                            </button>
                          )}
                          <span className="text-[11px] text-slate-500">
                            Reminder will trigger 24 hours prior to appointment.
                          </span>
                        </div>
                      </div>
                    )}

                    {/* 3. LINKED MEDICAL REPORT DOCUMENT */}
                    {linkedDoc ? (
                      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-teal-100 border border-teal-200 flex items-center justify-center text-teal-700 flex-shrink-0">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-900 truncate">
                                {linkedDoc.title}
                              </span>
                              <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">
                                {linkedDoc.fileType}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 truncate max-w-md">
                              {linkedDoc.previewText || linkedDoc.extractedData.summaryNote || 'Diagnostic laboratory documentation'}
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => onViewReport(linkedDoc)}
                          className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 flex-shrink-0 shadow-xs"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>View Full Medical Report</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : apt.relatedDocTitle ? (
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2 text-xs">
                        <span className="text-slate-600 font-medium">
                          Associated Clinical Document: <strong>{apt.relatedDocTitle}</strong>
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium">Archive on file</span>
                      </div>
                    ) : null}

                    {/* 4. CARD FOOTER ACTIONS */}
                    <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs border-t border-slate-100">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            const query = `What were the key takeaways from ${patient?.name || 'the patient'}'s visit with ${apt.doctorName} regarding "${apt.reason}"?`;
                            onOpenAIAssistant(query);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold transition border border-teal-200/80"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                          <span>Ask AI About This Visit</span>
                        </button>

                        <button
                          onClick={() => setInspectingVisit(apt)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition"
                        >
                          <span>Inspect Clinical Summary</span>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                        </button>
                      </div>

                      <span className="text-[11px] text-slate-400">
                        Record ID: <span className="font-mono text-slate-500">{apt.id}</span>
                      </span>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>
      )}

      {/* 5. TABLE / LEDGER VIEW */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[10px] tracking-wider">
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Patient</th>
                  <th className="py-3.5 px-4">Doctor & Specialty</th>
                  <th className="py-3.5 px-4">Why Visited (Reason)</th>
                  <th className="py-3.5 px-4">What Was The Report / Findings</th>
                  <th className="py-3.5 px-4">Linked Report</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAppointments.map((apt) => {
                  const patient = getMember(apt.memberId);
                  const doc = getDocument(apt.relatedDocId);

                  return (
                    <tr key={apt.id} className="hover:bg-slate-50/80 transition group">
                      <td className="py-4 px-4 font-semibold text-slate-700 whitespace-nowrap">
                        <div>{apt.date}</div>
                        <div className="text-[10px] text-slate-400 font-normal">{apt.time}</div>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="font-bold text-slate-900 block">{patient?.name || 'Unknown'}</span>
                        <span className="text-[10px] text-slate-500">{patient?.relationship}</span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-bold text-slate-900">{apt.doctorName}</div>
                        <div className="text-[11px] text-teal-700 font-semibold">{apt.specialty}</div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[180px]">{apt.clinic}</div>
                      </td>
                      <td className="py-4 px-4 max-w-xs">
                        <div className="text-slate-800 font-medium line-clamp-2">{apt.reason}</div>
                        {apt.visitType && (
                          <span className="inline-block mt-1 text-[9px] font-bold uppercase tracking-wider bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                            {apt.visitType}
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 max-w-sm">
                        {apt.status === 'completed' ? (
                          <div className="space-y-1">
                            {apt.diagnosis && (
                              <div className="font-bold text-teal-800 text-[11px] truncate">
                                {apt.diagnosis}
                              </div>
                            )}
                            <div className="text-slate-600 line-clamp-2 text-[11px]">
                              {apt.reportSummary || 'Visit completed and reviewed.'}
                            </div>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-cyan-800 bg-cyan-50 px-2 py-0.5 rounded">
                            <Clock className="w-3 h-3" />
                            <span>Upcoming visit</span>
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        {doc ? (
                          <button
                            onClick={() => onViewReport(doc)}
                            className="text-teal-700 hover:text-teal-900 font-bold text-[11px] inline-flex items-center gap-1"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>{doc.fileType} Report</span>
                          </button>
                        ) : (
                          <span className="text-slate-400 text-[11px]">—</span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => setInspectingVisit(apt)}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition inline-flex items-center gap-1"
                        >
                          <span>Details</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. CARE TEAM DIRECTORY VIEW */}
      {viewMode === 'doctors' && (
        <div className="space-y-4">
          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
            <h2 className="font-bold text-slate-900 text-base">Physicians & Specialists Care Team</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Direct contact coordinates, hospital clinics, and patient assignments for doctors providing care to {activeMember.name}'s family.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {doctors.map((doc) => {
              // Find visits by this doctor
              const doctorVisits = appointments.filter(
                (a) => a.doctorName.toLowerCase().includes(doc.name.split(',')[0].toLowerCase())
              );
              const caredMembers = members.filter((m) => doc.membersUnderCare.includes(m.id));

              return (
                <div
                  key={doc.id}
                  className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md transition space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 flex-shrink-0 font-bold text-lg">
                        <Stethoscope className="w-6 h-6" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-extrabold text-slate-900 text-sm leading-snug">
                          {doc.name}
                        </h3>
                        <p className="text-xs font-semibold text-teal-700">{doc.specialty}</p>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                      <div className="flex items-center gap-2">
                        <Building className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className="truncate">{doc.hospital}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span>{doc.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className="truncate">{doc.email}</span>
                      </div>
                    </div>

                    {doc.notes && (
                      <p className="text-xs text-slate-500 italic bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                        "{doc.notes}"
                      </p>
                    )}

                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Family Members Under Care:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {caredMembers.map((m) => (
                          <span
                            key={m.id}
                            className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold text-[11px]"
                          >
                            {m.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-medium">
                      <strong>{doctorVisits.length}</strong> recorded visits
                    </span>
                    <button
                      onClick={() => {
                        setNewVisitData((prev) => ({
                          ...prev,
                          doctorName: doc.name.split(',')[0],
                          specialty: doc.specialty,
                          clinic: doc.hospital,
                        }));
                        setIsAddVisitModalOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold text-xs transition"
                    >
                      Log Encounter
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 7. INSPECT VISIT DETAILS MODAL */}
      {inspectingVisit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 flex flex-col animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-200 flex items-start justify-between bg-slate-50/80 sticky top-0 z-10">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-teal-800 bg-teal-100 px-2 py-0.5 rounded">
                    {inspectingVisit.visitType || 'Clinical Encounter'}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    {inspectingVisit.date} • {inspectingVisit.time}
                  </span>
                </div>
                <h3 className="text-xl font-black text-slate-900">{inspectingVisit.doctorName}</h3>
                <p className="text-xs text-teal-700 font-semibold">{inspectingVisit.specialty} • {inspectingVisit.clinic}</p>
              </div>

              <button
                onClick={() => setInspectingVisit(null)}
                className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Patient */}
              <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-slate-500" />
                  <span className="text-xs text-slate-600 font-medium">Patient:</span>
                  <strong className="text-xs text-slate-900">
                    {getMember(inspectingVisit.memberId)?.name}
                  </strong>
                </div>
                <span
                  className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full uppercase ${
                    inspectingVisit.status === 'completed'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-cyan-100 text-cyan-800'
                  }`}
                >
                  {inspectingVisit.status}
                </span>
              </div>

              {/* WHY VISITED */}
              <div className="p-4 rounded-2xl bg-cyan-50/60 border border-cyan-200 space-y-2">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-cyan-900">
                  Why Visited (Reason for Consultation)
                </h4>
                <p className="text-sm text-slate-800 font-medium leading-relaxed">
                  {inspectingVisit.reason}
                </p>
              </div>

              {/* WHAT WAS THE REPORT */}
              <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-200 space-y-3">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-teal-950 flex items-center gap-1.5">
                  <ClipboardCheck className="w-4 h-4 text-teal-700" />
                  <span>Doctor's Clinical Report & Findings</span>
                </h4>

                {inspectingVisit.diagnosis && (
                  <div className="p-2.5 rounded-xl bg-white border border-teal-200 text-xs">
                    <span className="font-bold text-teal-900 block text-[10px] uppercase">
                      Diagnosed Condition / Clinical Assessment:
                    </span>
                    <span className="font-extrabold text-slate-900 text-sm">
                      {inspectingVisit.diagnosis}
                    </span>
                  </div>
                )}

                <p className="text-xs sm:text-sm text-slate-800 leading-relaxed bg-white/80 p-3.5 rounded-xl border border-teal-100">
                  {inspectingVisit.reportSummary || 'Consultation completed without written diagnostic summary.'}
                </p>

                {inspectingVisit.vitalsRecorded && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                    {inspectingVisit.vitalsRecorded.bloodPressure && (
                      <div className="p-2 rounded-lg bg-white border border-slate-200 text-xs">
                        <span className="text-[10px] text-slate-400 block">BP</span>
                        <strong className="text-slate-800">{inspectingVisit.vitalsRecorded.bloodPressure}</strong>
                      </div>
                    )}
                    {inspectingVisit.vitalsRecorded.pulse && (
                      <div className="p-2 rounded-lg bg-white border border-slate-200 text-xs">
                        <span className="text-[10px] text-slate-400 block">Heart Rate</span>
                        <strong className="text-slate-800">{inspectingVisit.vitalsRecorded.pulse}</strong>
                      </div>
                    )}
                    {inspectingVisit.vitalsRecorded.weight && (
                      <div className="p-2 rounded-lg bg-white border border-slate-200 text-xs">
                        <span className="text-[10px] text-slate-400 block">Weight</span>
                        <strong className="text-slate-800">{inspectingVisit.vitalsRecorded.weight}</strong>
                      </div>
                    )}
                    {inspectingVisit.vitalsRecorded.bloodSugar && (
                      <div className="p-2 rounded-lg bg-white border border-slate-200 text-xs">
                        <span className="text-[10px] text-slate-400 block">Blood Sugar</span>
                        <strong className="text-slate-800">{inspectingVisit.vitalsRecorded.bloodSugar}</strong>
                      </div>
                    )}
                  </div>
                )}

                {inspectingVisit.keyFindings && (
                  <div className="space-y-1 pt-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Key Takeaways:
                    </span>
                    <ul className="space-y-1 text-xs text-slate-700">
                      {inspectingVisit.keyFindings.map((f, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 mt-0.5 flex-shrink-0" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {inspectingVisit.prescriptionsGiven && inspectingVisit.prescriptionsGiven.length > 0 && (
                  <div className="space-y-1 pt-2 border-t border-teal-100">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Prescriptions Given:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {inspectingVisit.prescriptionsGiven.map((p, i) => (
                        <span key={i} className="px-2 py-0.5 bg-white border border-teal-200 rounded text-xs font-semibold text-slate-800">
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Next Steps / Advice */}
              {inspectingVisit.followUpPlan && (
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                  <span className="font-bold text-slate-700 block uppercase text-[10px] tracking-wider">
                    Follow-Up Instructions:
                  </span>
                  <p className="text-slate-600">{inspectingVisit.followUpPlan}</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-5 border-t border-slate-200 bg-slate-50/80 flex items-center justify-between">
              <button
                onClick={() => {
                  const targetDoc = getDocument(inspectingVisit.relatedDocId);
                  if (targetDoc) {
                    setInspectingVisit(null);
                    onViewReport(targetDoc);
                  }
                }}
                disabled={!inspectingVisit.relatedDocId}
                className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-40 text-white font-bold text-xs transition inline-flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                <span>Open Linked Medical Report</span>
              </button>

              <button
                onClick={() => setInspectingVisit(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. LOG / ADD DOCTOR VISIT MODAL */}
      {isAddVisitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 flex flex-col animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50/80 sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Log Doctor Visit & Report</h3>
                  <p className="text-xs text-slate-500">
                    Record why you visited the doctor and document the clinical findings.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddVisitModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateVisit} className="p-6 space-y-4">
              {/* Family Member Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Patient (Family Member) *
                </label>
                <select
                  value={newVisitData.memberId}
                  onChange={(e) => setNewVisitData({ ...newVisitData, memberId: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                >
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.relationship})
                    </option>
                  ))}
                </select>
              </div>

              {/* Doctor Name & Specialty */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Doctor Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newVisitData.doctorName}
                    onChange={(e) => setNewVisitData({ ...newVisitData, doctorName: e.target.value })}
                    placeholder="e.g. Dr. Anita Desai"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Specialty
                  </label>
                  <input
                    type="text"
                    value={newVisitData.specialty}
                    onChange={(e) => setNewVisitData({ ...newVisitData, specialty: e.target.value })}
                    placeholder="e.g. Cardiology, Endocrinology"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>
              </div>

              {/* Clinic & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Hospital / Clinic Facility
                  </label>
                  <input
                    type="text"
                    value={newVisitData.clinic}
                    onChange={(e) => setNewVisitData({ ...newVisitData, clinic: e.target.value })}
                    placeholder="e.g. Heart & Vascular Clinic"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Consultation Status
                  </label>
                  <select
                    value={newVisitData.status}
                    onChange={(e) =>
                      setNewVisitData({
                        ...newVisitData,
                        status: e.target.value as 'completed' | 'upcoming',
                      })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  >
                    <option value="completed">Completed Consultation (Past Visit)</option>
                    <option value="upcoming">Upcoming Scheduled Appointment</option>
                  </select>
                </div>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Visit Date
                  </label>
                  <input
                    type="date"
                    value={newVisitData.date}
                    onChange={(e) => setNewVisitData({ ...newVisitData, date: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Time
                  </label>
                  <input
                    type="text"
                    value={newVisitData.time}
                    onChange={(e) => setNewVisitData({ ...newVisitData, time: e.target.value })}
                    placeholder="e.g. 10:30 AM"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>
              </div>

              {/* WHY VISITED (CORE FIELD) */}
              <div className="p-4 rounded-2xl bg-cyan-50/60 border border-cyan-200 space-y-1.5">
                <label className="block text-xs font-extrabold uppercase tracking-wider text-cyan-950">
                  Why Visited (Reason for Consultation / Chief Complaint) *
                </label>
                <p className="text-[11px] text-cyan-800">
                  Explain what prompted the visit (e.g., routine quarterly blood pressure check, post-operative knee review, elevated blood sugar follow-up).
                </p>
                <textarea
                  required
                  rows={2}
                  value={newVisitData.reason}
                  onChange={(e) => setNewVisitData({ ...newVisitData, reason: e.target.value })}
                  placeholder="e.g. Blood pressure evaluation following home readings fluctuating around 138/88 mmHg, assessment of cardiac rhythm, and review of Amlodipine 5mg efficacy."
                  className="w-full px-3.5 py-2.5 bg-white border border-cyan-300 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 mt-1"
                />
              </div>

              {/* WHAT WAS THE REPORT (CORE FIELD) */}
              <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-200 space-y-3">
                <label className="block text-xs font-extrabold uppercase tracking-wider text-teal-950">
                  What Was The Report / Doctor's Findings
                </label>
                <p className="text-[11px] text-teal-800">
                  Summarize what the doctor found, ECG/scan conclusions, lab analysis, or clinical impression.
                </p>
                <textarea
                  rows={3}
                  value={newVisitData.reportSummary}
                  onChange={(e) => setNewVisitData({ ...newVisitData, reportSummary: e.target.value })}
                  placeholder="e.g. Blood pressure controlled at 126/82 mmHg under monotherapy. Resting 12-lead ECG showed normal sinus rhythm at 72 bpm with normal axis. Lipid audit shows LDL well-managed at 94 mg/dL."
                  className="w-full px-3.5 py-2.5 bg-white border border-teal-300 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase">
                      Clinical Diagnosis / Assessment
                    </label>
                    <input
                      type="text"
                      value={newVisitData.diagnosis}
                      onChange={(e) => setNewVisitData({ ...newVisitData, diagnosis: e.target.value })}
                      placeholder="e.g. Essential Hypertension (Well Controlled)"
                      className="w-full px-3 py-2 bg-white border border-teal-200 rounded-xl text-xs font-medium text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase">
                      Vitals (BP / Pulse)
                    </label>
                    <input
                      type="text"
                      value={newVisitData.bloodPressure}
                      onChange={(e) => setNewVisitData({ ...newVisitData, bloodPressure: e.target.value })}
                      placeholder="e.g. 126/82 mmHg (Pulse 72 bpm)"
                      className="w-full px-3 py-2 bg-white border border-teal-200 rounded-xl text-xs font-medium text-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Prescriptions Given / Titrated (One per line)
                  </label>
                  <textarea
                    rows={2}
                    value={newVisitData.prescriptionsGiven}
                    onChange={(e) => setNewVisitData({ ...newVisitData, prescriptionsGiven: e.target.value })}
                    placeholder="e.g. Amlodipine 5mg (Oral, 1 daily)&#10;Atorvastatin 20mg (Oral, 1 nightly)"
                    className="w-full px-3 py-2 bg-white border border-teal-200 rounded-xl text-xs font-medium text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Follow-up Instructions / Next Steps
                  </label>
                  <input
                    type="text"
                    value={newVisitData.followUpPlan}
                    onChange={(e) => setNewVisitData({ ...newVisitData, followUpPlan: e.target.value })}
                    placeholder="e.g. Return in 6 months for repeat routine ECG and lipid panel."
                    className="w-full px-3 py-2 bg-white border border-teal-200 rounded-xl text-xs font-medium text-slate-800"
                  />
                </div>
              </div>

              {/* Link an existing uploaded document */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Link Uploaded Medical Report (Optional)
                </label>
                <select
                  value={newVisitData.relatedDocId}
                  onChange={(e) => setNewVisitData({ ...newVisitData, relatedDocId: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                >
                  <option value="">-- No document attached --</option>
                  {documents.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.title} ({d.date} • {d.type})
                    </option>
                  ))}
                </select>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddVisitModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs transition shadow-md shadow-teal-600/20"
                >
                  Save Doctor Visit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
