import React, { useState, useMemo } from 'react';
import {
  Pill,
  Plus,
  Search,
  Stethoscope,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  ArrowRight,
  Sparkles,
  ExternalLink,
  Printer,
  Building,
  Check,
  X,
  Info,
  ChevronDown,
  Layers,
  History,
  Activity,
} from 'lucide-react';
import { Medication, FamilyMember, MedicalDocument, Doctor } from '../types';

interface MedicationsViewProps {
  medications: Medication[];
  members: FamilyMember[];
  activeMember?: FamilyMember;
  documents: MedicalDocument[];
  doctors: Doctor[];
  onSelectMember: (member: FamilyMember | undefined) => void;
  onViewReport: (doc: MedicalDocument) => void;
  onOpenAIAssistant: (initialPrompt?: string) => void;
  onAddMedication: (medData: Partial<Medication>) => void;
  onUpdateMedicationStatus?: (medId: string, status: 'active' | 'completed' | 'discontinued', endDate?: string) => void;
  onLogDose?: (medId: string) => void;
}

type StatusFilter = 'all' | 'consumed' | 'active' | 'as_needed' | 'discontinued';
type ViewMode = 'grid' | 'grouped_doctor' | 'table';

export const MedicationsView: React.FC<MedicationsViewProps> = ({
  medications,
  members,
  activeMember,
  documents,
  doctors,
  onSelectMember,
  onViewReport,
  onOpenAIAssistant,
  onAddMedication,
  onUpdateMedicationStatus,
  onLogDose,
}) => {
  // State
  const [selectedMemberId, setSelectedMemberId] = useState<string>(activeMember ? activeMember.id : 'all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [selectedDoctorFilter, setSelectedDoctorFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // Modal States
  const [selectedMedForDetail, setSelectedMedForDetail] = useState<Medication | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [justLoggedMedId, setJustLoggedMedId] = useState<string | null>(null);

  // New Medication Form State
  const [newMedForm, setNewMedForm] = useState({
    memberId: activeMember ? activeMember.id : (members[0]?.id || 'mem-rajesh'),
    name: '',
    dosage: '',
    frequency: '1 time / day',
    timing: 'Morning with food',
    isCurrent: true,
    consumptionStatus: 'active' as 'active' | 'completed' | 'discontinued' | 'as_needed',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    durationText: '',
    reason: '',
    prescribingDoctor: 'Dr. Sameer Gupta, MD, FACE',
    doctorSpecialty: 'Endocrinology & Diabetology',
    facility: 'Metropolis Metabolic Institute',
    rxNumber: '',
    prescribedDate: new Date().toISOString().split('T')[0],
    prescriptionDocId: '',
    instructions: '',
    notes: '',
  });

  // Unique list of prescribing doctors extracted from data
  const availableDoctors = useMemo(() => {
    const docNames = new Set<string>();
    medications.forEach((m) => {
      if (m.prescribingDoctor) {
        docNames.add(m.prescribingDoctor.trim());
      }
    });
    return Array.from(docNames).sort();
  }, [medications]);

  // Filtered medications
  const filteredMeds = useMemo(() => {
    return medications.filter((med) => {
      // Member filter
      if (selectedMemberId !== 'all' && med.memberId !== selectedMemberId) {
        return false;
      }

      // Status filter
      if (statusFilter === 'consumed') {
        // Must be completed or historical consumed
        if (med.isCurrent || (med.consumptionStatus !== 'completed' && med.consumptionStatus !== 'discontinued')) {
          return false;
        }
      } else if (statusFilter === 'active') {
        if (!med.isCurrent || med.consumptionStatus === 'completed' || med.consumptionStatus === 'discontinued') {
          return false;
        }
      } else if (statusFilter === 'as_needed') {
        if (med.consumptionStatus !== 'as_needed' && !med.frequency.toLowerCase().includes('sos') && !med.frequency.toLowerCase().includes('as needed')) {
          return false;
        }
      } else if (statusFilter === 'discontinued') {
        if (med.consumptionStatus !== 'discontinued') {
          return false;
        }
      }

      // Doctor filter
      if (selectedDoctorFilter !== 'all') {
        if (!med.prescribingDoctor.toLowerCase().includes(selectedDoctorFilter.toLowerCase())) {
          return false;
        }
      }

      // Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const member = members.find((m) => m.id === med.memberId);
        const matchName = med.name.toLowerCase().includes(query);
        const matchDosage = med.dosage.toLowerCase().includes(query);
        const matchDoctor = med.prescribingDoctor.toLowerCase().includes(query);
        const matchReason = med.reason.toLowerCase().includes(query);
        const matchFacility = (med.facility || '').toLowerCase().includes(query);
        const matchRx = (med.rxNumber || '').toLowerCase().includes(query);
        const matchNotes = (med.notes || '').toLowerCase().includes(query);
        const matchInstructions = (med.instructions || '').toLowerCase().includes(query);
        const matchMember = member?.name.toLowerCase().includes(query) || false;

        return matchName || matchDosage || matchDoctor || matchReason || matchFacility || matchRx || matchNotes || matchInstructions || matchMember;
      }

      return true;
    });
  }, [medications, selectedMemberId, statusFilter, selectedDoctorFilter, searchQuery, members]);

  // Metrics Calculations
  const metrics = useMemo(() => {
    const total = medications.length;
    const active = medications.filter((m) => m.isCurrent && m.consumptionStatus !== 'completed').length;
    const consumed = medications.filter((m) => !m.isCurrent || m.consumptionStatus === 'completed' || m.consumptionStatus === 'discontinued').length;
    const withPrescriptionLink = medications.filter((m) => m.prescriptionDocId || m.rxNumber).length;
    const uniqueDoctors = new Set(medications.map((m) => m.prescribingDoctor)).size;

    return { total, active, consumed, withPrescriptionLink, uniqueDoctors };
  }, [medications]);

  // Grouped by Prescribing Doctor
  const groupedByDoctor = useMemo(() => {
    const groups: { [doctorName: string]: Medication[] } = {};
    filteredMeds.forEach((m) => {
      const doc = m.prescribingDoctor || 'Unassigned Physician';
      if (!groups[doc]) {
        groups[doc] = [];
      }
      groups[doc].push(m);
    });
    return groups;
  }, [filteredMeds]);

  // Handle Log Dose Today
  const handleLogDoseClick = (medId: string) => {
    setJustLoggedMedId(medId);
    if (onLogDose) {
      onLogDose(medId);
    }
    setTimeout(() => {
      setJustLoggedMedId(null);
    }, 2500);
  };

  // Helper to find linked document
  const getLinkedDocument = (docId?: string) => {
    if (!docId) return null;
    return documents.find((d) => d.id === docId) || null;
  };

  // Handle Add Submit
  const handleCreateMedicationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMedForm.name.trim() || !newMedForm.dosage.trim()) return;

    const isConsumed = newMedForm.consumptionStatus === 'completed' || newMedForm.consumptionStatus === 'discontinued';

    onAddMedication({
      memberId: newMedForm.memberId,
      name: newMedForm.name.trim(),
      dosage: newMedForm.dosage.trim(),
      frequency: newMedForm.frequency.trim(),
      timing: newMedForm.timing.trim(),
      isCurrent: !isConsumed,
      consumptionStatus: newMedForm.consumptionStatus,
      startDate: newMedForm.startDate,
      endDate: isConsumed && newMedForm.endDate ? newMedForm.endDate : undefined,
      durationText: newMedForm.durationText || (isConsumed ? 'Course Completed' : 'Ongoing'),
      reason: newMedForm.reason.trim() || 'General medical maintenance',
      prescribingDoctor: newMedForm.prescribingDoctor.trim() || 'Consulting Physician',
      doctorSpecialty: newMedForm.doctorSpecialty.trim(),
      facility: newMedForm.facility.trim(),
      rxNumber: newMedForm.rxNumber.trim() || `RX-${Math.floor(1000 + Math.random() * 9000)}`,
      prescribedDate: newMedForm.prescribedDate,
      prescriptionDocId: newMedForm.prescriptionDocId || undefined,
      instructions: newMedForm.instructions.trim(),
      notes: newMedForm.notes.trim(),
      adherenceRate: 100,
    });

    setIsAddModalOpen(false);
    // Reset form
    setNewMedForm({
      memberId: activeMember ? activeMember.id : (members[0]?.id || 'mem-rajesh'),
      name: '',
      dosage: '',
      frequency: '1 time / day',
      timing: 'Morning with food',
      isCurrent: true,
      consumptionStatus: 'active',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      durationText: '',
      reason: '',
      prescribingDoctor: 'Dr. Sameer Gupta, MD, FACE',
      doctorSpecialty: 'Endocrinology & Diabetology',
      facility: 'Metropolis Metabolic Institute',
      rxNumber: '',
      prescribedDate: new Date().toISOString().split('T')[0],
      prescriptionDocId: '',
      instructions: '',
      notes: '',
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-16">
      {/* 1. TOP HEADER & AUDIT OVERVIEW BANNER */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-700">
                <Pill className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <span>Medication & Prescription Ledger</span>
                </h1>
                <p className="text-xs md:text-sm text-slate-500 font-medium">
                  Review active ongoing regimens and past consumed medicines with verified prescribing physician records.
                </p>
              </div>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => onOpenAIAssistant("Review our family's active and consumed medications for any potential drug interactions, food precautions, or duplicate therapies.")}
              className="px-3.5 py-2.5 rounded-xl bg-purple-50 hover:bg-purple-100/80 border border-purple-200/70 text-purple-700 font-bold text-xs flex items-center gap-1.5 transition shadow-2xs"
            >
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span>AI Drug Interactions</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3.5 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition shadow-2xs"
              title="Print medication summary for doctor appointment"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span className="hidden sm:inline">Print Prescription Sheet</span>
            </button>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Log New Medicine / Rx</span>
            </button>
          </div>
        </div>

        {/* 2. STATS SUMMARY METRICS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t border-slate-100">
          <div className="p-3.5 rounded-2xl bg-amber-50/50 border border-amber-100">
            <div className="flex items-center justify-between text-amber-700 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider">Active Regimens</span>
              <Activity className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-black text-amber-950">{metrics.active}</div>
            <p className="text-[11px] text-amber-800/80 mt-0.5">Currently taken daily/weekly</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-100">
            <div className="flex items-center justify-between text-emerald-700 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider">Consumed & Past</span>
              <History className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-emerald-950">{metrics.consumed}</div>
            <p className="text-[11px] text-emerald-800/80 mt-0.5">Completed courses & tapers</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-100">
            <div className="flex items-center justify-between text-blue-700 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider">Prescribing Doctors</span>
              <Stethoscope className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-black text-blue-950">{metrics.uniqueDoctors}</div>
            <p className="text-[11px] text-blue-800/80 mt-0.5">Specialists on medical record</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-indigo-50/60 border border-indigo-100">
            <div className="flex items-center justify-between text-indigo-700 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider">Linked Prescriptions</span>
              <FileText className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-2xl font-black text-indigo-950">{metrics.withPrescriptionLink}</div>
            <p className="text-[11px] text-indigo-800/80 mt-0.5">Referenced to signed docs</p>
          </div>
        </div>

        {/* 3. FAMILY MEMBER SWITCHER PILLS */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Select Family Member
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            <button
              onClick={() => {
                setSelectedMemberId('all');
                onSelectMember(undefined);
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
                selectedMemberId === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700'
              }`}
            >
              <span>All Family Members</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                selectedMemberId === 'all' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
              }`}>
                {medications.length}
              </span>
            </button>

            {members.map((member) => {
              const memberMeds = medications.filter((m) => m.memberId === member.id);
              const isSelected = selectedMemberId === member.id;
              return (
                <button
                  key={member.id}
                  onClick={() => {
                    setSelectedMemberId(member.id);
                    onSelectMember(member);
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
                    isSelected
                      ? 'bg-teal-700 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700'
                  }`}
                >
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-4 h-4 rounded-full object-cover"
                  />
                  <span>{member.name}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {memberMeds.length}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. FILTER BAR & SEARCH CONTROLS */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by medicine name, prescribing doctor, condition, dosage, or clinic..."
              className="w-full pl-10 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
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

          {/* Filter by Prescribing Doctor */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="relative">
              <select
                value={selectedDoctorFilter}
                onChange={(e) => setSelectedDoctorFilter(e.target.value)}
                aria-label="Filter by Prescribing Doctor"
                className="pl-8 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 appearance-none cursor-pointer"
              >
                <option value="all">All Prescribing Doctors</option>
                {availableDoctors.map((doc) => (
                  <option key={doc} value={doc}>
                    {doc}
                  </option>
                ))}
              </select>
              <Stethoscope className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg text-xs font-semibold transition ${
                  viewMode === 'grid' ? 'bg-white text-teal-800 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Card View"
              >
                <Layers className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('grouped_doctor')}
                className={`p-1.5 rounded-lg text-xs font-semibold transition ${
                  viewMode === 'grouped_doctor' ? 'bg-white text-teal-800 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Group by Prescribing Doctor"
              >
                <Stethoscope className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg text-xs font-semibold transition ${
                  viewMode === 'table' ? 'bg-white text-teal-800 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Audit Ledger Table"
              >
                <FileText className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Status Filter Tabs (Key Focus: Consumed vs Active) */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">Status:</span>

          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              statusFilter === 'all'
                ? 'bg-slate-800 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span>All Medications</span>
            <span className="text-[10px] opacity-75">({medications.length})</span>
          </button>

          <button
            onClick={() => setStatusFilter('consumed')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              statusFilter === 'consumed'
                ? 'bg-emerald-700 text-white shadow-2xs'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200/70'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Medicines I Have Consumed</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-900/20 font-mono">
              {metrics.consumed}
            </span>
          </button>

          <button
            onClick={() => setStatusFilter('active')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              statusFilter === 'active'
                ? 'bg-amber-600 text-white shadow-2xs'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200/70'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Currently Active</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-900/20 font-mono">
              {metrics.active}
            </span>
          </button>

          <button
            onClick={() => setStatusFilter('as_needed')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              statusFilter === 'as_needed'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200/70'
            }`}
          >
            <span>As Needed (SOS)</span>
          </button>

          <button
            onClick={() => setStatusFilter('discontinued')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              statusFilter === 'discontinued'
                ? 'bg-slate-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <span>Discontinued / Replaced</span>
          </button>
        </div>
      </div>

      {/* 5. MAIN CONTENT DISPLAY */}
      {filteredMeds.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/80 space-y-4 shadow-xs">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
            <Pill className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-slate-900 text-base">No matching medications found</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              No medications matched your filter criteria. Try clearing search filters or logging a new prescription.
            </p>
          </div>
          <button
            onClick={() => {
              setSearchQuery('');
              setStatusFilter('all');
              setSelectedDoctorFilter('all');
              setSelectedMemberId('all');
            }}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition"
          >
            Reset All Filters
          </button>
        </div>
      ) : viewMode === 'grouped_doctor' ? (
        /* ================= GROUPED BY DOCTOR VIEW ================= */
        <div className="space-y-6">
          {Object.entries(groupedByDoctor).map(([doctorName, meds]: [string, Medication[]]) => {
            const doctorObj = doctors.find((d) => d.name.toLowerCase().includes(doctorName.split(',')[0].toLowerCase()) || doctorName.toLowerCase().includes(d.name.toLowerCase()));
            const specialty = meds[0]?.doctorSpecialty || doctorObj?.specialty || 'Attending Physician';
            const facility = meds[0]?.facility || doctorObj?.hospital || 'Clinical Facility';

            return (
              <div key={doctorName} className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
                {/* Doctor Group Header */}
                <div className="p-5 md:p-6 bg-linear-to-r from-slate-50 to-teal-50/40 border-b border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-xs shrink-0">
                      <Stethoscope className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-base md:text-lg font-black text-slate-900">{doctorName}</h2>
                        <span className="px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 text-[11px] font-bold">
                          {specialty}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 mt-1">
                        <span className="flex items-center gap-1">
                          <Building className="w-3.5 h-3.5 text-slate-400" />
                          <span>{facility}</span>
                        </span>
                        {doctorObj?.phone && (
                          <>
                            <span>•</span>
                            <span>{doctorObj.phone}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start md:self-center">
                    <span className="text-xs text-slate-600 font-semibold px-3 py-1 bg-white rounded-xl border border-slate-200">
                      {meds.length} {meds.length === 1 ? 'Prescription' : 'Prescriptions'}
                    </span>
                  </div>
                </div>

                {/* List of Medications under this Doctor */}
                <div className="p-5 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {meds.map((med) => (
                    <MedicationCard
                      key={med.id}
                      medication={med}
                      member={members.find((m) => m.id === med.memberId)}
                      linkedDoc={getLinkedDocument(med.prescriptionDocId)}
                      justLogged={justLoggedMedId === med.id}
                      onOpenDetail={() => setSelectedMedForDetail(med)}
                      onViewReport={onViewReport}
                      onLogDose={() => handleLogDoseClick(med.id)}
                      onConsultAI={() => onOpenAIAssistant(`Tell me about ${med.name} ${med.dosage} prescribed by ${med.prescribingDoctor} for ${med.reason}. Are there precautions or interactions I should know?`)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : viewMode === 'table' ? (
        /* ================= AUDIT LEDGER TABLE VIEW ================= */
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4">Medicine & Dosage</th>
                  <th className="py-3.5 px-4">Patient</th>
                  <th className="py-3.5 px-4">Prescribed By Doctor</th>
                  <th className="py-3.5 px-4">Rx Number & Date</th>
                  <th className="py-3.5 px-4">Consumption Period</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredMeds.map((med) => {
                  const member = members.find((m) => m.id === med.memberId);
                  const linkedDoc = getLinkedDocument(med.prescriptionDocId);
                  const isConsumed = !med.isCurrent || med.consumptionStatus === 'completed' || med.consumptionStatus === 'discontinued';

                  return (
                    <tr key={med.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 text-sm">{med.name}</div>
                        <div className="text-[11px] text-teal-700 font-medium">
                          {med.dosage} • {med.frequency}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{med.reason}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <img
                            src={member?.avatar}
                            alt={member?.name}
                            className="w-5 h-5 rounded-full object-cover"
                          />
                          <span className="font-semibold text-slate-800">{member?.name}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
                          <span>{med.prescribingDoctor}</span>
                        </div>
                        <div className="text-[11px] text-slate-500">{med.doctorSpecialty || 'Specialist'}</div>
                        <div className="text-[10px] text-slate-400">{med.facility}</div>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[11px]">
                        <div className="text-slate-800 font-semibold">{med.rxNumber || 'RX-ON-FILE'}</div>
                        <div className="text-slate-400 text-[10px]">
                          {med.prescribedDate ? `Rx Date: ${med.prescribedDate}` : `Started: ${med.startDate}`}
                        </div>
                        {linkedDoc && (
                          <button
                            onClick={() => onViewReport(linkedDoc)}
                            className="mt-1 inline-flex items-center gap-1 text-[10px] text-teal-700 hover:text-teal-800 font-bold hover:underline"
                          >
                            <FileText className="w-3 h-3" />
                            <span>View Rx Document</span>
                          </button>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        {isConsumed ? (
                          <div>
                            <span className="font-semibold text-emerald-800 text-[11px] block">
                              {med.durationText || 'Course Completed'}
                            </span>
                            <span className="text-[10px] text-slate-500">
                              {med.startDate} {med.endDate ? `to ${med.endDate}` : ''}
                            </span>
                          </div>
                        ) : (
                          <div>
                            <span className="font-semibold text-amber-800 text-[11px] block">
                              {med.durationText || 'Ongoing Regimen'}
                            </span>
                            <span className="text-[10px] text-slate-500">Since {med.startDate}</span>
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        {isConsumed ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>{med.consumptionStatus === 'discontinued' ? 'Discontinued' : 'Consumed / Completed'}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            <Activity className="w-3 h-3 text-amber-600" />
                            <span>Active Daily</span>
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedMedForDetail(med)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition"
                          >
                            Audit
                          </button>
                          <button
                            onClick={() => onOpenAIAssistant(`Provide clinical analysis on ${med.name} ${med.dosage} for ${med.reason}.`)}
                            className="p-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg transition"
                            title="Ask AI about this medication"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* ================= STANDARD CARD GRID VIEW ================= */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
          {filteredMeds.map((med) => (
            <MedicationCard
              key={med.id}
              medication={med}
              member={members.find((m) => m.id === med.memberId)}
              linkedDoc={getLinkedDocument(med.prescriptionDocId)}
              justLogged={justLoggedMedId === med.id}
              onOpenDetail={() => setSelectedMedForDetail(med)}
              onViewReport={onViewReport}
              onLogDose={() => handleLogDoseClick(med.id)}
              onConsultAI={() => onOpenAIAssistant(`Tell me about ${med.name} ${med.dosage} prescribed by ${med.prescribingDoctor} for ${med.reason}. Are there precautions, food restrictions, or interaction alerts?`)}
            />
          ))}
        </div>
      )}

      {/* 6. DETAILED PRESCRIPTION & CONSUMPTION AUDIT MODAL */}
      {selectedMedForDetail && (
        <MedicationAuditModal
          medication={selectedMedForDetail}
          member={members.find((m) => m.id === selectedMedForDetail.memberId)}
          linkedDoc={getLinkedDocument(selectedMedForDetail.prescriptionDocId)}
          doctorObj={doctors.find((d) => d.name.toLowerCase().includes(selectedMedForDetail.prescribingDoctor.split(',')[0].toLowerCase()))}
          onClose={() => setSelectedMedForDetail(null)}
          onViewReport={onViewReport}
          onOpenAIAssistant={onOpenAIAssistant}
        />
      )}

      {/* 7. ADD / LOG NEW MEDICATION MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 bg-linear-to-r from-teal-700 to-teal-800 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                  <Pill className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-bold">Log Medication & Prescription</h3>
                  <p className="text-xs text-teal-100">
                    Record an active daily medicine or a previously consumed course with physician details.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateMedicationSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Patient Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Patient</label>
                <select
                  value={newMedForm.memberId}
                  onChange={(e) => setNewMedForm({ ...newMedForm, memberId: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                >
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.relation})
                    </option>
                  ))}
                </select>
              </div>

              {/* Medicine Status: Consumed vs Active */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                <label className="block text-xs font-bold text-slate-800">Consumption Status</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewMedForm({ ...newMedForm, consumptionStatus: 'active', isCurrent: true })}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      newMedForm.consumptionStatus === 'active'
                        ? 'bg-teal-600 text-white shadow-2xs'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Activity className="w-3.5 h-3.5" />
                    <span>Currently Active</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewMedForm({ ...newMedForm, consumptionStatus: 'completed', isCurrent: false })}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      newMedForm.consumptionStatus === 'completed'
                        ? 'bg-emerald-700 text-white shadow-2xs'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <History className="w-3.5 h-3.5" />
                    <span>Consumed / Completed</span>
                  </button>
                </div>
              </div>

              {/* Medicine Name & Dosage */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Medicine Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Amoxicillin, Metformin"
                    value={newMedForm.name}
                    onChange={(e) => setNewMedForm({ ...newMedForm, name: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Dosage & Strength *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 500 mg, 10 ml, 1 drop"
                    value={newMedForm.dosage}
                    onChange={(e) => setNewMedForm({ ...newMedForm, dosage: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                  />
                </div>
              </div>

              {/* Frequency & Timing */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Frequency</label>
                  <input
                    type="text"
                    placeholder="e.g. 2 times / day, Once weekly"
                    value={newMedForm.frequency}
                    onChange={(e) => setNewMedForm({ ...newMedForm, frequency: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Timing & Routine</label>
                  <input
                    type="text"
                    placeholder="e.g. Morning with food, Bedtime"
                    value={newMedForm.timing}
                    onChange={(e) => setNewMedForm({ ...newMedForm, timing: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                  />
                </div>
              </div>

              {/* Start Date & End Date (for consumed) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Date Started</label>
                  <input
                    type="date"
                    value={newMedForm.startDate}
                    onChange={(e) => setNewMedForm({ ...newMedForm, startDate: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Date Completed / Discontinued
                  </label>
                  <input
                    type="date"
                    value={newMedForm.endDate}
                    onChange={(e) => setNewMedForm({ ...newMedForm, endDate: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                  />
                </div>
              </div>

              {/* Prescribing Doctor & Facility */}
              <div className="p-3.5 bg-teal-50/50 rounded-2xl border border-teal-100 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-teal-900">
                  <Stethoscope className="w-4 h-4 text-teal-700" />
                  <span>Prescription Attribution & Doctor</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Prescribing Doctor *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dr. Sameer Gupta"
                      value={newMedForm.prescribingDoctor}
                      onChange={(e) => setNewMedForm({ ...newMedForm, prescribingDoctor: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Doctor Specialty</label>
                    <input
                      type="text"
                      placeholder="e.g. Cardiology, Orthopedics"
                      value={newMedForm.doctorSpecialty}
                      onChange={(e) => setNewMedForm({ ...newMedForm, doctorSpecialty: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Hospital / Clinic</label>
                    <input
                      type="text"
                      placeholder="e.g. Metropolis Metabolic Institute"
                      value={newMedForm.facility}
                      onChange={(e) => setNewMedForm({ ...newMedForm, facility: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Rx Number (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. RX-2026-441"
                      value={newMedForm.rxNumber}
                      onChange={(e) => setNewMedForm({ ...newMedForm, rxNumber: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800"
                    />
                  </div>
                </div>

                {/* Link to Uploaded Prescription Document */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Link to Scanned Prescription Document
                  </label>
                  <select
                    value={newMedForm.prescriptionDocId}
                    onChange={(e) => setNewMedForm({ ...newMedForm, prescriptionDocId: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800"
                  >
                    <option value="">-- None (Manual entry) --</option>
                    {documents.map((doc) => (
                      <option key={doc.id} value={doc.id}>
                        {doc.title} ({doc.date} • {doc.doctor})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Indication / Reason */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Reason for Prescription / Medical Condition
                </label>
                <input
                  type="text"
                  placeholder="e.g. Post-op pain relief, Type 2 Diabetes, Hypertension"
                  value={newMedForm.reason}
                  onChange={(e) => setNewMedForm({ ...newMedForm, reason: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                />
              </div>

              {/* Doctor Instructions & Remarks */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Doctor's Instructions & Notes on Consumption
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Take immediately after meals. Complete full 10-day course. Do not consume within 4 hours of calcium."
                  value={newMedForm.instructions}
                  onChange={(e) => setNewMedForm({ ...newMedForm, instructions: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition shadow-sm"
                >
                  Save to Medication Ledger
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

/* =========================================================================
   SUB-COMPONENT: MedicationCard
   Renders clear consumption details, prescribing physician, and direct Rx links
========================================================================= */

interface MedicationCardProps {
  medication: Medication;
  member?: FamilyMember;
  linkedDoc: MedicalDocument | null;
  justLogged: boolean;
  onOpenDetail: () => void;
  onViewReport: (doc: MedicalDocument) => void;
  onLogDose: () => void;
  onConsultAI: () => void;
}

const MedicationCard: React.FC<MedicationCardProps> = ({
  medication,
  member,
  linkedDoc,
  justLogged,
  onOpenDetail,
  onViewReport,
  onLogDose,
  onConsultAI,
}) => {
  const isConsumed = !medication.isCurrent || medication.consumptionStatus === 'completed' || medication.consumptionStatus === 'discontinued';
  const isDiscontinued = medication.consumptionStatus === 'discontinued';

  return (
    <div className={`p-5 rounded-3xl border transition-all duration-200 bg-white flex flex-col justify-between space-y-4 shadow-2xs hover:shadow-md ${
      isConsumed
        ? 'border-slate-200/80 hover:border-emerald-300'
        : 'border-slate-200/90 hover:border-teal-300'
    }`}>
      <div className="space-y-3.5">
        {/* Card Header: Patient & Status Badge */}
        <div className="flex items-start justify-between gap-2">
          {member && (
            <div className="flex items-center gap-2">
              <img
                src={member.avatar}
                alt={member.name}
                className="w-6 h-6 rounded-full object-cover border border-slate-200"
              />
              <span className="text-xs font-bold text-slate-800">{member.name}</span>
            </div>
          )}

          {/* Status Badge */}
          {isDiscontinued ? (
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1">
              <Info className="w-3 h-3 text-slate-500" />
              <span>Discontinued / Replaced</span>
            </span>
          ) : isConsumed ? (
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/80 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>Consumed & Completed</span>
            </span>
          ) : (
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200/80 flex items-center gap-1">
              <Activity className="w-3 h-3 text-amber-600" />
              <span>Active Regimen</span>
            </span>
          )}
        </div>

        {/* Medicine Name & Dosage */}
        <div>
          <div className="flex items-baseline justify-between gap-2">
            <h3
              onClick={onOpenDetail}
              className="text-base font-black text-slate-900 hover:text-teal-700 transition cursor-pointer"
            >
              {medication.name}
            </h3>
            <span className="text-xs font-mono font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-lg border border-teal-100 shrink-0">
              {medication.dosage}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-600 font-medium mt-1">
            <span>{medication.frequency}</span>
            {medication.timing && (
              <>
                <span>•</span>
                <span className="text-teal-700 font-semibold">{medication.timing}</span>
              </>
            )}
          </div>
        </div>

        {/* Indication / Medical Reason */}
        <div className="text-xs text-slate-600">
          Reason: <strong className="text-slate-800">{medication.reason}</strong>
        </div>

        {/* PRESCRIBING DOCTOR ATTRIBUTION (Key requirement) */}
        <div className="p-3 rounded-2xl bg-slate-50/80 border border-slate-200/70 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            <span className="flex items-center gap-1 text-teal-800">
              <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
              <span>Prescribed By</span>
            </span>
            {medication.rxNumber && (
              <span className="font-mono text-slate-500 lowercase">{medication.rxNumber}</span>
            )}
          </div>

          <div className="text-xs font-bold text-slate-900">
            {medication.prescribingDoctor}
          </div>

          <div className="flex flex-wrap items-center gap-x-2 text-[11px] text-slate-500">
            {medication.doctorSpecialty && <span>{medication.doctorSpecialty}</span>}
            {medication.facility && (
              <>
                <span>•</span>
                <span>{medication.facility}</span>
              </>
            )}
          </div>

          {/* Linked Scanned Prescription Document Button */}
          {linkedDoc && (
            <div className="pt-1.5 mt-1 border-t border-slate-200/60 flex items-center justify-between">
              <span className="text-[10px] text-slate-500 truncate max-w-[170px]">
                Doc: {linkedDoc.title}
              </span>
              <button
                type="button"
                onClick={() => onViewReport(linkedDoc)}
                className="text-[11px] text-teal-700 hover:text-teal-900 font-bold flex items-center gap-1 hover:underline"
              >
                <FileText className="w-3 h-3" />
                <span>View Original Prescription</span>
              </button>
            </div>
          )}
        </div>

        {/* CONSUMPTION TIMELINE & DETAILS */}
        <div className="space-y-1 text-xs">
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-400" />
              <span>{isConsumed ? 'Course Duration:' : 'Prescription Started:'}</span>
            </span>
            <span className="font-semibold text-slate-700">
              {medication.startDate} {medication.endDate ? `to ${medication.endDate}` : ''}
            </span>
          </div>

          {medication.durationText && (
            <div className="text-[11px] text-emerald-800 font-semibold flex items-center gap-1">
              <History className="w-3 h-3 text-emerald-600" />
              <span>{medication.durationText}</span>
            </div>
          )}

          {medication.instructions && (
            <p className="text-[11px] text-slate-600 italic bg-amber-50/40 p-2 rounded-xl border border-amber-100/60 leading-relaxed mt-2">
              "{medication.instructions}"
            </p>
          )}
        </div>
      </div>

      {/* Card Action Footer */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        <button
          onClick={onOpenDetail}
          className="text-xs font-bold text-slate-700 hover:text-teal-700 flex items-center gap-1 transition"
        >
          <span>Full Prescription Audit</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>

        <div className="flex items-center gap-1.5">
          <button
            onClick={onConsultAI}
            className="p-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold transition flex items-center gap-1"
            title="Ask AI regarding interactions and safety"
          >
            <Sparkles className="w-3.5 h-3.5" />
          </button>

          {!isConsumed && (
            <button
              onClick={onLogDose}
              disabled={justLogged}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                justLogged
                  ? 'bg-emerald-600 text-white'
                  : 'bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200/80'
              }`}
            >
              {justLogged ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Dose Logged!</span>
                </>
              ) : (
                <>
                  <Clock className="w-3.5 h-3.5 text-teal-600" />
                  <span>Log Today</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/* =========================================================================
   SUB-COMPONENT: MedicationAuditModal
   In-depth inspection modal showing complete physician credentials, linked document,
   consumption history, instructions, and safety interactions.
========================================================================= */

interface MedicationAuditModalProps {
  medication: Medication;
  member?: FamilyMember;
  linkedDoc: MedicalDocument | null;
  doctorObj?: Doctor;
  onClose: () => void;
  onViewReport: (doc: MedicalDocument) => void;
  onOpenAIAssistant: (initialPrompt?: string) => void;
}

const MedicationAuditModal: React.FC<MedicationAuditModalProps> = ({
  medication,
  member,
  linkedDoc,
  doctorObj,
  onClose,
  onViewReport,
  onOpenAIAssistant,
}) => {
  const isConsumed = !medication.isCurrent || medication.consumptionStatus === 'completed' || medication.consumptionStatus === 'discontinued';

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-6 bg-slate-900 text-white flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/20 border border-teal-500/40 text-teal-400 flex items-center justify-center shrink-0">
              <Pill className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="text-xs font-mono font-bold bg-teal-500/20 text-teal-300 px-2.5 py-0.5 rounded-full border border-teal-500/30">
                  {medication.dosage}
                </span>
                {isConsumed ? (
                  <span className="text-xs font-bold bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                    {medication.consumptionStatus === 'discontinued' ? 'Discontinued' : 'Consumed Course'}
                  </span>
                ) : (
                  <span className="text-xs font-bold bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                    Active Daily Regimen
                  </span>
                )}
              </div>
              <h2 className="text-xl font-black">{medication.name}</h2>
              <p className="text-xs text-slate-300 mt-0.5">
                Patient: <strong className="text-white">{member?.name}</strong> • {medication.frequency}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto text-xs">
          {/* Prescribing Doctor Profile Card */}
          <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-teal-800 uppercase tracking-wider flex items-center gap-1.5">
                <Stethoscope className="w-4 h-4 text-teal-700" />
                <span>Prescribing Physician Record</span>
              </span>
              {medication.rxNumber && (
                <span className="font-mono text-slate-500 font-semibold">
                  Rx #{medication.rxNumber}
                </span>
              )}
            </div>

            <div className="text-sm font-bold text-slate-900">
              {medication.prescribingDoctor}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600 pt-1">
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Specialty</span>
                <span className="font-semibold text-slate-800">{medication.doctorSpecialty || doctorObj?.specialty || 'Specialist'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Facility / Hospital</span>
                <span className="font-semibold text-slate-800">{medication.facility || doctorObj?.hospital || 'Hospital'}</span>
              </div>
            </div>

            {doctorObj?.phone && (
              <div className="pt-2 border-t border-teal-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>Contact: {doctorObj.phone}</span>
                <span>{doctorObj.email}</span>
              </div>
            )}
          </div>

          {/* Linked Scanned Prescription Document */}
          {linkedDoc && (
            <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200/80 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-sm">{linkedDoc.title}</div>
                  <div className="text-slate-500 text-[11px]">
                    Prescription Signed on {linkedDoc.date} • {linkedDoc.facility}
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  onClose();
                  onViewReport(linkedDoc);
                }}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shrink-0 shadow-2xs"
              >
                <span>Open File</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Consumption History & Duration */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <History className="w-4 h-4 text-slate-600" />
              <span>Consumption Timeline & Adherence</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <span className="text-[10px] text-slate-400 block">Date Started</span>
                <span className="font-bold text-slate-800">{medication.startDate}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">
                  {isConsumed ? 'Date Finished' : 'End / Renewal Date'}
                </span>
                <span className="font-bold text-slate-800">
                  {medication.endDate || 'Ongoing Regimen'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Course Summary</span>
                <span className="font-bold text-emerald-800">
                  {medication.durationText || (isConsumed ? 'Course Completed' : 'Active')}
                </span>
              </div>
            </div>

            {medication.lastConsumedDate && (
              <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
                Last consumed dose: <strong className="text-slate-700">{medication.lastConsumedDate}</strong>
              </div>
            )}
          </div>

          {/* Instructions & Guidelines */}
          {medication.instructions && (
            <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/70 space-y-1.5">
              <div className="text-[11px] font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1">
                <AlertCircle className="w-4 h-4 text-amber-700" />
                <span>Physician's Instructions on Administration</span>
              </div>
              <p className="text-slate-800 leading-relaxed font-medium">
                {medication.instructions}
              </p>
            </div>
          )}

          {/* Clinical Notes & Outcomes */}
          {medication.notes && (
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Clinical Progress & Notes
              </span>
              <p className="text-slate-700 leading-relaxed bg-white p-3 rounded-xl border border-slate-200">
                {medication.notes}
              </p>
            </div>
          )}

          {/* AI Clinical Assistant Recommendation */}
          <div className="p-4 rounded-2xl bg-linear-to-r from-purple-50 to-indigo-50 border border-purple-200/70 flex items-center justify-between gap-3">
            <div>
              <div className="font-bold text-purple-900 text-xs flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span>Ask AI Medical Assistant</span>
              </div>
              <p className="text-[11px] text-purple-800/80 mt-0.5">
                Check potential food interactions, common side effects, or questions to ask your doctor.
              </p>
            </div>
            <button
              onClick={() => {
                onClose();
                onOpenAIAssistant(`Provide clinical analysis for ${medication.name} ${medication.dosage} prescribed by ${medication.prescribingDoctor} for ${medication.reason}. What should we monitor?`);
              }}
              className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition shrink-0 shadow-2xs"
            >
              Consult AI
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Always consult your prescribing physician before altering dosages.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition"
          >
            Close Audit
          </button>
        </div>
      </div>
    </div>
  );
};
