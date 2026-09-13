import React, { useState, useMemo } from 'react';
import {
  Users,
  Plus,
  Search,
  Stethoscope,
  Calendar,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  FileText,
  Sparkles,
  Printer,
  ChevronRight,
  ChevronDown,
  Layers,
  History,
  Activity,
  Heart,
  Pill,
  Share2,
  Clock,
  ShieldCheck,
  UserPlus,
  ExternalLink,
  Edit3,
  X,
  Check,
  Info,
  Dna,
  Building,
  Phone,
  Mail,
  SlidersHorizontal,
} from 'lucide-react';
import {
  FamilyMember,
  MedicalCondition,
  Medication,
  MedicalDocument,
  Doctor,
  Family,
} from '../types';

interface FamilyMembersViewProps {
  members: FamilyMember[];
  conditions: MedicalCondition[];
  medications: Medication[];
  documents: MedicalDocument[];
  doctors: Doctor[];
  family: Family;
  onSelectMemberForProfile: (member: FamilyMember) => void;
  onViewReport: (doc: MedicalDocument) => void;
  onOpenAIAssistant: (initialPrompt?: string) => void;
  onOpenDoctorShare: (member: FamilyMember) => void;
  onOpenDoctorVisit: (member: FamilyMember) => void;
  onAddCondition: (condData: Partial<MedicalCondition>) => void;
  onUpdateCondition?: (condId: string, updates: Partial<MedicalCondition>) => void;
  onAddMember?: () => void;
  onOpenInviteModal?: () => void;
}

type ViewMode = 'cards' | 'grouped_category' | 'matrix';
type StatusFilter = 'all' | 'active' | 'managed' | 'resolved' | 'investigation';

// Condition Clinical Category definitions
interface ConditionCategoryConfig {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
  conditionKeywords: string[];
}

const CONDITION_CATEGORIES: ConditionCategoryConfig[] = [
  {
    id: 'metabolic',
    name: 'Metabolic & Endocrine',
    icon: Activity,
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    description: 'Glycemic regulation, thyroid hormones, and metabolic panel tracking.',
    conditionKeywords: ['diabetes', 'thyroid', 'hypothyroid', 'glucose', 'metabolic', 'vitamin d', 'hba1c'],
  },
  {
    id: 'cardiovascular',
    name: 'Cardiovascular & Circulatory',
    icon: Heart,
    color: 'text-rose-700',
    bgColor: 'bg-rose-50',
    borderColor: 'border-rose-200',
    description: 'Blood pressure surveillance, lipid control, and cardiac health.',
    conditionKeywords: ['hypertension', 'blood pressure', 'cardiac', 'cholesterol', 'artery', 'heart'],
  },
  {
    id: 'musculoskeletal',
    name: 'Musculoskeletal & Bone Health',
    icon: Layers,
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    description: 'Bone density preservation, osteoarthritis, joint rehab, and sports recovery.',
    conditionKeywords: ['osteoporosis', 'osteoarthritis', 'knee', 'ankle', 'sprain', 'bone', 'joint', 'ligament', 'fracture'],
  },
  {
    id: 'sensory',
    name: 'Sensory & Ophthalmology',
    icon: Stethoscope,
    color: 'text-teal-700',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-200',
    description: 'Intraocular pressure monitoring, visual acuity, and ophthalmology care.',
    conditionKeywords: ['glaucoma', 'eye', 'vision', 'cataract', 'ocular'],
  },
  {
    id: 'immunology',
    name: 'Immunology, Allergy & ENT',
    icon: ShieldCheck,
    color: 'text-purple-700',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    description: 'Allergic sensitivities, seasonal rhinitis, and ENT management.',
    conditionKeywords: ['rhinitis', 'allergic', 'allergy', 'sinus', 'pollen', 'asthma'],
  },
  {
    id: 'gastrointestinal',
    name: 'Gastrointestinal & Surgical',
    icon: Dna,
    color: 'text-indigo-700',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
    description: 'Post-surgical histories, digestive health, and gallbladder care.',
    conditionKeywords: ['cholecystectomy', 'cholelithiasis', 'gallstones', 'stomach', 'gerd', 'colon'],
  },
];

export const FamilyMembersView: React.FC<FamilyMembersViewProps> = ({
  members,
  conditions,
  medications,
  documents,
  doctors,
  family,
  onSelectMemberForProfile,
  onViewReport,
  onOpenAIAssistant,
  onOpenDoctorShare,
  onOpenDoctorVisit,
  onAddCondition,
  onUpdateCondition,
  onAddMember,
  onOpenInviteModal,
}) => {
  // State
  const [selectedMemberFilter, setSelectedMemberFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('cards');

  // Modals
  const [selectedConditionForDetail, setSelectedConditionForDetail] = useState<MedicalCondition | null>(null);
  const [isAddConditionModalOpen, setIsAddConditionModalOpen] = useState(false);
  const [preselectedMemberForAdd, setPreselectedMemberForAdd] = useState<string>(members[0]?.id || 'mem-rajesh');

  // Add Condition Form State
  const [newCondForm, setNewCondForm] = useState({
    memberId: members[0]?.id || 'mem-rajesh',
    name: '',
    dateDiagnosed: new Date().toISOString().split('T')[0],
    status: 'Active' as MedicalCondition['status'],
    treatingDoctor: 'Dr. Sameer Gupta',
    treatments: '',
    notes: '',
    relatedDocId: '',
  });

  // Calculate high-level summary metrics
  const stats = useMemo(() => {
    const totalMembers = members.length;
    const totalConditions = conditions.length;
    const activeConditions = conditions.filter((c) => c.status === 'Active').length;
    const managedConditions = conditions.filter((c) => c.status === 'Managed').length;
    const resolvedConditions = conditions.filter((c) => c.status === 'Resolved').length;
    const membersWithConditions = new Set(conditions.map((c) => c.memberId)).size;

    return {
      totalMembers,
      totalConditions,
      activeConditions,
      managedConditions,
      resolvedConditions,
      membersWithConditions,
    };
  }, [members, conditions]);

  // Helper to categorize condition
  const getConditionCategory = (condName: string): ConditionCategoryConfig => {
    const nameLower = condName.toLowerCase();
    for (const cat of CONDITION_CATEGORIES) {
      if (cat.conditionKeywords.some((keyword) => nameLower.includes(keyword))) {
        return cat;
      }
    }
    // Fallback category
    return CONDITION_CATEGORIES[0];
  };

  // Filtered conditions
  const filteredConditions = useMemo(() => {
    return conditions.filter((cond) => {
      // Member filter
      if (selectedMemberFilter !== 'all' && cond.memberId !== selectedMemberFilter) {
        return false;
      }

      // Status filter
      if (statusFilter === 'active' && cond.status !== 'Active') return false;
      if (statusFilter === 'managed' && cond.status !== 'Managed') return false;
      if (statusFilter === 'resolved' && cond.status !== 'Resolved') return false;
      if (statusFilter === 'investigation' && cond.status !== 'Under Investigation') return false;

      // Category filter
      if (categoryFilter !== 'all') {
        const cat = getConditionCategory(cond.name);
        if (cat.id !== categoryFilter) return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const member = members.find((m) => m.id === cond.memberId);
        const matchName = cond.name.toLowerCase().includes(query);
        const matchDoctor = cond.treatingDoctor.toLowerCase().includes(query);
        const matchNotes = (cond.notes || '').toLowerCase().includes(query);
        const matchTreatments = (cond.treatments || []).some((t) => t.toLowerCase().includes(query));
        const matchMember = member?.name.toLowerCase().includes(query) || false;

        return matchName || matchDoctor || matchNotes || matchTreatments || matchMember;
      }

      return true;
    });
  }, [conditions, selectedMemberFilter, statusFilter, categoryFilter, searchQuery, members]);

  // Filtered members (for cards view)
  const displayedMembers = useMemo(() => {
    if (selectedMemberFilter === 'all') {
      return members;
    }
    return members.filter((m) => m.id === selectedMemberFilter);
  }, [members, selectedMemberFilter]);

  // Group conditions by category for Category View
  const groupedByCategory = useMemo(() => {
    const map: { [catId: string]: { category: ConditionCategoryConfig; conditions: MedicalCondition[] } } = {};

    CONDITION_CATEGORIES.forEach((cat) => {
      map[cat.id] = { category: cat, conditions: [] };
    });

    filteredConditions.forEach((cond) => {
      const cat = getConditionCategory(cond.name);
      if (!map[cat.id]) {
        map[cat.id] = { category: cat, conditions: [] };
      }
      map[cat.id].conditions.push(cond);
    });

    return Object.values(map).filter((group) => group.conditions.length > 0);
  }, [filteredConditions]);

  // Handle open add condition for a specific member
  const handleOpenAddCondition = (memberId?: string) => {
    const targetId = memberId || (selectedMemberFilter !== 'all' ? selectedMemberFilter : members[0]?.id || 'mem-rajesh');
    setPreselectedMemberForAdd(targetId);
    setNewCondForm({
      memberId: targetId,
      name: '',
      dateDiagnosed: new Date().toISOString().split('T')[0],
      status: 'Active',
      treatingDoctor: 'Dr. Sameer Gupta',
      treatments: '',
      notes: '',
      relatedDocId: '',
    });
    setIsAddConditionModalOpen(true);
  };

  // Handle submit add condition
  const handleCreateConditionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCondForm.name.trim()) return;

    const treatmentsArray = newCondForm.treatments
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    onAddCondition({
      memberId: newCondForm.memberId,
      name: newCondForm.name.trim(),
      dateDiagnosed: newCondForm.dateDiagnosed,
      status: newCondForm.status,
      treatingDoctor: newCondForm.treatingDoctor.trim() || 'Attending Physician',
      treatments: treatmentsArray.length > 0 ? treatmentsArray : ['Routine monitoring'],
      notes: newCondForm.notes.trim(),
      relatedDocCount: newCondForm.relatedDocId ? 1 : 0,
      relatedDocIds: newCondForm.relatedDocId ? [newCondForm.relatedDocId] : [],
    });

    setIsAddConditionModalOpen(false);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-16">
      {/* 1. TOP EXECUTIVE HEADER BANNER */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-700">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <span>Family Members & Medical Conditions</span>
                </h1>
                <p className="text-xs md:text-sm text-slate-500 font-medium">
                  Holistic family registry of all members, diagnosed chronic & acute conditions, ongoing treatments, and treating physicians.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() =>
                onOpenAIAssistant(
                  "Analyze our family's complete conditions profile. Identify any shared hereditary risks, cross-condition interactions (like Diabetes and Hypertension), and recommended preventive screenings for each family member."
                )
              }
              className="px-3.5 py-2.5 rounded-xl bg-purple-50 hover:bg-purple-100/80 border border-purple-200/70 text-purple-700 font-bold text-xs flex items-center gap-1.5 transition shadow-2xs"
            >
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span>AI Hereditary Risk Audit</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3.5 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition shadow-2xs"
              title="Print clinical family condition summary sheet"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span className="hidden sm:inline">Print Family Summary</span>
            </button>

            <button
              onClick={() => handleOpenAddCondition()}
              className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Log Medical Condition</span>
            </button>
          </div>
        </div>

        {/* 2. FAMILY CONDITIONS KEY STATS METRICS */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-4 border-t border-slate-100">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center justify-between text-slate-600 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider">Family Members</span>
              <Users className="w-4 h-4 text-slate-500" />
            </div>
            <div className="text-2xl font-black text-slate-900">{stats.totalMembers}</div>
            <p className="text-[11px] text-slate-500 mt-0.5">{stats.membersWithConditions} with health histories</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-teal-50/70 border border-teal-100">
            <div className="flex items-center justify-between text-teal-700 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider">Tracked Conditions</span>
              <Dna className="w-4 h-4 text-teal-600" />
            </div>
            <div className="text-2xl font-black text-teal-950">{stats.totalConditions}</div>
            <p className="text-[11px] text-teal-800/80 mt-0.5">Diagnoses across family</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-100">
            <div className="flex items-center justify-between text-amber-700 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider">Active / Monitored</span>
              <Activity className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-black text-amber-950">{stats.activeConditions}</div>
            <p className="text-[11px] text-amber-800/80 mt-0.5">Needs regular surveillance</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-100">
            <div className="flex items-center justify-between text-emerald-700 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider">Well-Managed</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-emerald-950">{stats.managedConditions}</div>
            <p className="text-[11px] text-emerald-800/80 mt-0.5">Stable on therapy/lifestyle</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-100 col-span-2 md:col-span-1">
            <div className="flex items-center justify-between text-blue-700 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider">Resolved / Cured</span>
              <History className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-black text-blue-950">{stats.resolvedConditions}</div>
            <p className="text-[11px] text-blue-800/80 mt-0.5">Healed or post-surgical</p>
          </div>
        </div>

        {/* 3. MEMBER SELECTOR PILLS */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Filter by Family Member
            </div>
            {onOpenInviteModal && (
              <button
                onClick={onOpenInviteModal}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 transition"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Invite / Add Family Member</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            <button
              onClick={() => setSelectedMemberFilter('all')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
                selectedMemberFilter === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700'
              }`}
            >
              <span>All Family Members</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  selectedMemberFilter === 'all' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                }`}
              >
                {members.length}
              </span>
            </button>

            {members.map((member) => {
              const memberConds = conditions.filter((c) => c.memberId === member.id);
              const isSelected = selectedMemberFilter === member.id;
              return (
                <button
                  key={member.id}
                  onClick={() => setSelectedMemberFilter(member.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
                    isSelected
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700'
                  }`}
                >
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-4 h-4 rounded-full object-cover"
                  />
                  <span>{member.name}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {memberConds.length} {memberConds.length === 1 ? 'cond' : 'conds'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. FILTER CONTROLS & SEARCH BAR */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by condition name, member, treating physician, or treatment..."
              className="w-full pl-10 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
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

          {/* Category Dropdown & View Mode Switcher */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="relative">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                aria-label="Filter by Medical Category"
                className="pl-8 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 appearance-none cursor-pointer"
              >
                <option value="all">All Medical Categories</option>
                {CONDITION_CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <Dna className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setViewMode('cards')}
                className={`p-1.5 rounded-lg text-xs font-semibold transition ${
                  viewMode === 'cards' ? 'bg-white text-emerald-800 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Member Cards View"
              >
                <Users className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('grouped_category')}
                className={`p-1.5 rounded-lg text-xs font-semibold transition ${
                  viewMode === 'grouped_category'
                    ? 'bg-white text-emerald-800 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Group by Clinical Category"
              >
                <Layers className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('matrix')}
                className={`p-1.5 rounded-lg text-xs font-semibold transition ${
                  viewMode === 'matrix' ? 'bg-white text-emerald-800 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Full Conditions Table"
              >
                <FileText className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Condition Status Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">Condition Status:</span>

          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              statusFilter === 'all'
                ? 'bg-slate-800 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span>All Diagnoses</span>
            <span className="text-[10px] opacity-75">({conditions.length})</span>
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
            <span>Active & Under Surveillance</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-900/20 font-mono">
              {stats.activeConditions}
            </span>
          </button>

          <button
            onClick={() => setStatusFilter('managed')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              statusFilter === 'managed'
                ? 'bg-emerald-700 text-white shadow-2xs'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200/70'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Well-Managed / Stable</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-900/20 font-mono">
              {stats.managedConditions}
            </span>
          </button>

          <button
            onClick={() => setStatusFilter('resolved')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              statusFilter === 'resolved'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200/70'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Resolved / Cured</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-blue-900/20 font-mono">
              {stats.resolvedConditions}
            </span>
          </button>
        </div>
      </div>

      {/* 5. MAIN CONTENT DISPLAY */}
      {viewMode === 'cards' ? (
        /* ================= MEMBER CARDS WITH ALL THEIR CONDITIONS ================= */
        <div className="space-y-6">
          {displayedMembers.map((member) => {
            // Get all conditions for this member, filtered by current status/search/category
            const memberAllConditions = conditions.filter((c) => c.memberId === member.id);
            const memberFilteredConditions = filteredConditions.filter((c) => c.memberId === member.id);
            const memberMedications = medications.filter((m) => m.memberId === member.id && m.isCurrent);
            const memberReports = documents.filter((d) => d.memberId === member.id);

            return (
              <div
                key={member.id}
                className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden transition hover:border-slate-300"
              >
                {/* Member Header Banner */}
                <div className="p-5 md:p-6 bg-linear-to-r from-slate-50 via-teal-50/20 to-emerald-50/30 border-b border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-14 h-14 md:w-16 md:h-16 rounded-2xl object-cover border-2 border-white shadow-xs shrink-0"
                    />
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-lg md:text-xl font-black text-slate-900">{member.name}</h2>
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-200/80 text-slate-700 text-xs font-bold">
                          {member.relationship}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                          {member.age} yrs • {member.dob}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200 font-mono text-[11px] font-bold">
                          Blood: {member.bloodType}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
                          <span>PCP: {member.primaryPhysician}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>Emergency: {member.emergencyContact}</span>
                        </span>
                      </div>

                      {/* Allergies tag */}
                      {member.allergies && member.allergies.length > 0 && (
                        <div className="flex items-center gap-1.5 pt-0.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Allergies:</span>
                          {member.allergies.map((allergy, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] px-2 py-0.5 bg-rose-50 text-rose-800 rounded font-semibold border border-rose-200/80"
                            >
                              {allergy}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Header Actions for Member */}
                  <div className="flex flex-wrap items-center gap-2 self-start md:self-center">
                    <button
                      onClick={() => handleOpenAddCondition(member.id)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-bold text-xs flex items-center gap-1 transition shadow-2xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Condition</span>
                    </button>

                    <button
                      onClick={() => onSelectMemberForProfile(member)}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1 transition shadow-2xs"
                    >
                      <span>Full Health Profile</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Member Vitals & Health Snapshot Strip */}
                <div className="px-5 py-3 bg-slate-50/70 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <Heart className="w-3.5 h-3.5 text-rose-500" />
                      <span className="text-slate-500">Blood Pressure:</span>
                      <span className="font-bold text-slate-800">{member.vitals.bloodPressure} mmHg</span>
                    </div>

                    {member.vitals.hba1c && (
                      <div className="flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5 text-amber-500" />
                        <span className="text-slate-500">HbA1c:</span>
                        <span className="font-bold text-slate-800">{member.vitals.hba1c}</span>
                        {member.vitals.hba1cTrend && (
                          <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 rounded font-semibold">
                            {member.vitals.hba1cTrend}
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-500">BMI:</span>
                      <span className="font-bold text-slate-800">{member.vitals.bmi}</span>
                      <span className="text-[10px] text-slate-400">({member.vitals.weightKg} kg / {member.vitals.heightCm} cm)</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Pill className="w-3.5 h-3.5 text-amber-600" />
                      <span className="text-slate-500">Active Meds:</span>
                      <span className="font-bold text-slate-800">{memberMedications.length}</span>
                    </div>
                  </div>

                  <div className="text-[11px] font-semibold text-slate-500">
                    Status: <span className="font-bold text-slate-800">{member.statusText}</span>
                  </div>
                </div>

                {/* Member Diagnosed Conditions Section */}
                <div className="p-5 md:p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-black text-slate-900 text-sm tracking-tight flex items-center gap-2">
                      <Dna className="w-4 h-4 text-emerald-600" />
                      <span>Diagnosed Medical Conditions ({memberAllConditions.length})</span>
                    </h3>
                    <span className="text-xs text-slate-500">
                      Showing {memberFilteredConditions.length} of {memberAllConditions.length} records
                    </span>
                  </div>

                  {memberFilteredConditions.length === 0 ? (
                    <div className="p-6 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-2">
                      <p className="text-xs font-semibold text-slate-600">
                        {memberAllConditions.length === 0
                          ? 'No chronic medical conditions currently diagnosed. Routine wellness screenings are up to date.'
                          : 'No conditions matched your active status or search filters.'}
                      </p>
                      <button
                        onClick={() => handleOpenAddCondition(member.id)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline pt-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Log a diagnosis or condition for {member.name}</span>
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {memberFilteredConditions.map((cond) => {
                        const category = getConditionCategory(cond.name);
                        const isResolved = cond.status === 'Resolved';
                        const isActive = cond.status === 'Active';
                        const isManaged = cond.status === 'Managed';

                        // Find related medical documents
                        const linkedDocs = (cond.relatedDocIds || [])
                          .map((id) => documents.find((d) => d.id === id))
                          .filter(Boolean) as MedicalDocument[];

                        // Find related medications
                        const relatedMeds = medications.filter(
                          (m) =>
                            m.memberId === cond.memberId &&
                            (m.reason.toLowerCase().includes(cond.name.toLowerCase().split(' ')[0]) ||
                              cond.name.toLowerCase().includes(m.name.toLowerCase().split(' ')[0]))
                        );

                        return (
                          <div
                            key={cond.id}
                            className={`p-4 rounded-2xl border transition hover:shadow-sm space-y-3 ${
                              isActive
                                ? 'bg-amber-50/30 border-amber-200/90'
                                : isManaged
                                ? 'bg-emerald-50/20 border-emerald-200/80'
                                : 'bg-slate-50/60 border-slate-200'
                            }`}
                          >
                            {/* Condition Header */}
                            <div className="flex items-start justify-between gap-2">
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-2">
                                  <span className={`p-1 rounded-lg ${category.bgColor} ${category.color}`}>
                                    <category.icon className="w-3.5 h-3.5" />
                                  </span>
                                  <h4 className="text-sm font-black text-slate-900">{cond.name}</h4>
                                </div>
                                <div className="text-[11px] text-slate-500 font-medium">
                                  {category.name} • Diagnosed: {cond.dateDiagnosed}
                                </div>
                              </div>

                              {/* Status Badge */}
                              <span
                                className={`px-2.5 py-1 rounded-full text-[10px] font-bold shrink-0 flex items-center gap-1 ${
                                  isActive
                                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                    : isManaged
                                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                    : isResolved
                                    ? 'bg-slate-200 text-slate-800'
                                    : 'bg-purple-100 text-purple-900'
                                }`}
                              >
                                {isActive && <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse"></span>}
                                {isManaged && <Check className="w-3 h-3 text-emerald-700" />}
                                {isResolved && <CheckCircle2 className="w-3 h-3 text-slate-600" />}
                                <span>{cond.status}</span>
                              </span>
                            </div>

                            {/* Treating Doctor Attribution */}
                            <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 text-xs space-y-1">
                              <div className="flex items-center justify-between text-[11px]">
                                <span className="font-bold text-slate-800 flex items-center gap-1">
                                  <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
                                  <span>Treating Physician: {cond.treatingDoctor}</span>
                                </span>
                              </div>
                              {cond.notes && (
                                <p className="text-[11px] text-slate-600 leading-relaxed pt-0.5">
                                  {cond.notes}
                                </p>
                              )}
                            </div>

                            {/* Treatments & Therapies Chips */}
                            {cond.treatments && cond.treatments.length > 0 && (
                              <div className="space-y-1">
                                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                  Prescribed Therapies & Care Plan:
                                </div>
                                <div className="flex flex-wrap gap-1">
                                  {cond.treatments.map((treatment, tIdx) => (
                                    <span
                                      key={tIdx}
                                      className="px-2 py-0.5 bg-white text-slate-700 rounded-lg text-[10px] font-medium border border-slate-200"
                                    >
                                      {treatment}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Linked Medications or Reports */}
                            {(linkedDocs.length > 0 || relatedMeds.length > 0) && (
                              <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100/80 text-[10px]">
                                {linkedDocs.map((doc) => (
                                  <button
                                    key={doc.id}
                                    onClick={() => onViewReport(doc)}
                                    className="inline-flex items-center gap-1 text-teal-700 hover:text-teal-900 font-bold hover:underline"
                                  >
                                    <FileText className="w-3 h-3" />
                                    <span>{doc.title.split(' ')[0]} Report</span>
                                  </button>
                                ))}

                                {relatedMeds.map((med) => (
                                  <span
                                    key={med.id}
                                    className="inline-flex items-center gap-1 text-amber-800 font-medium bg-amber-50 px-1.5 py-0.5 rounded"
                                  >
                                    <Pill className="w-2.5 h-2.5" />
                                    <span>{med.name}</span>
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* Condition Card Actions */}
                            <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
                              <button
                                onClick={() => setSelectedConditionForDetail(cond)}
                                className="text-slate-600 hover:text-slate-900 font-bold text-[11px] flex items-center gap-1"
                              >
                                <Info className="w-3 h-3" />
                                <span>Condition Details & History</span>
                              </button>

                              <button
                                onClick={() =>
                                  onOpenAIAssistant(
                                    `Explain the medical management, optimal targets, and dietary precautions for ${cond.name} in a ${member.age}-year-old (${member.name}). Current doctor: ${cond.treatingDoctor}.`
                                  )
                                }
                                className="text-purple-700 hover:text-purple-900 font-bold text-[11px] flex items-center gap-1"
                              >
                                <Sparkles className="w-3 h-3 text-purple-600" />
                                <span>Ask AI</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : viewMode === 'grouped_category' ? (
        /* ================= GROUPED BY CLINICAL CATEGORY VIEW ================= */
        <div className="space-y-6">
          {groupedByCategory.map(({ category, conditions: catConditions }) => {
            return (
              <div key={category.id} className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
                {/* Category Header */}
                <div className={`p-5 md:p-6 border-b border-slate-200/80 flex items-center justify-between ${category.bgColor}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-2xl bg-white flex items-center justify-center shadow-2xs ${category.color}`}>
                      <category.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base md:text-lg font-black text-slate-900">{category.name}</h3>
                      <p className="text-xs text-slate-600 font-medium">{category.description}</p>
                    </div>
                  </div>

                  <span className="text-xs font-bold px-3 py-1 bg-white rounded-xl border border-slate-200 text-slate-700">
                    {catConditions.length} {catConditions.length === 1 ? 'Condition' : 'Conditions'}
                  </span>
                </div>

                {/* Conditions under this Category */}
                <div className="p-5 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {catConditions.map((cond) => {
                    const member = members.find((m) => m.id === cond.memberId);
                    return (
                      <div
                        key={cond.id}
                        className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-2.5 text-xs"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="font-black text-slate-900 text-sm">{cond.name}</div>
                            <div className="text-[11px] text-slate-500">Diagnosed: {cond.dateDiagnosed}</div>
                          </div>

                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              cond.status === 'Active'
                                ? 'bg-amber-100 text-amber-900'
                                : cond.status === 'Managed'
                                ? 'bg-emerald-100 text-emerald-900'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {cond.status}
                          </span>
                        </div>

                        {/* Member Attribution Pill */}
                        <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200/80">
                          <div className="flex items-center gap-2">
                            <img
                              src={member?.avatar}
                              alt={member?.name}
                              className="w-5 h-5 rounded-full object-cover"
                            />
                            <span className="font-bold text-slate-800">{member?.name}</span>
                            <span className="text-[10px] text-slate-500">({member?.relationship})</span>
                          </div>
                          <span className="text-[10px] text-teal-700 font-bold">{cond.treatingDoctor}</span>
                        </div>

                        {cond.notes && <p className="text-[11px] text-slate-600">{cond.notes}</p>}

                        {cond.treatments && cond.treatments.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {cond.treatments.map((t, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 bg-white text-slate-700 rounded text-[10px] border border-slate-200"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                          <button
                            onClick={() => setSelectedConditionForDetail(cond)}
                            className="text-[11px] text-emerald-700 font-bold hover:underline"
                          >
                            View Full Details
                          </button>
                          {member && (
                            <button
                              onClick={() => onSelectMemberForProfile(member)}
                              className="text-[11px] text-slate-600 font-bold hover:underline"
                            >
                              Go to {member.name} Profile →
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ================= COMPREHENSIVE AUDIT MATRIX / TABLE VIEW ================= */
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4">Family Member</th>
                  <th className="py-3.5 px-4">Diagnosed Condition</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Diagnosed Date</th>
                  <th className="py-3.5 px-4">Treating Doctor</th>
                  <th className="py-3.5 px-4">Prescribed Therapies</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredConditions.map((cond) => {
                  const member = members.find((m) => m.id === cond.memberId);
                  const category = getConditionCategory(cond.name);

                  return (
                    <tr key={cond.id} className="hover:bg-slate-50/70 transition">
                      {/* Family Member */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <img
                            src={member?.avatar}
                            alt={member?.name}
                            className="w-6 h-6 rounded-full object-cover"
                          />
                          <div>
                            <div className="font-bold text-slate-900">{member?.name}</div>
                            <div className="text-[10px] text-slate-500">{member?.relationship} • {member?.age}y</div>
                          </div>
                        </div>
                      </td>

                      {/* Condition Name */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{cond.name}</div>
                        {cond.notes && <div className="text-[10px] text-slate-500 line-clamp-1">{cond.notes}</div>}
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${category.bgColor} ${category.color}`}>
                          {category.name}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            cond.status === 'Active'
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : cond.status === 'Managed'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {cond.status}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600">
                        {cond.dateDiagnosed}
                      </td>

                      {/* Doctor */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800 flex items-center gap-1">
                          <Stethoscope className="w-3 h-3 text-teal-600" />
                          <span>{cond.treatingDoctor}</span>
                        </div>
                      </td>

                      {/* Therapies */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {(cond.treatments || []).slice(0, 2).map((t, idx) => (
                            <span
                              key={idx}
                              className="px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px]"
                            >
                              {t}
                            </span>
                          ))}
                          {(cond.treatments || []).length > 2 && (
                            <span className="text-[10px] text-slate-400">+{cond.treatments.length - 2} more</span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedConditionForDetail(cond)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition"
                          >
                            Details
                          </button>
                          <button
                            onClick={() =>
                              onOpenAIAssistant(
                                `Provide clinical guidelines and management review for ${cond.name} in ${member?.name}.`
                              )
                            }
                            className="p-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg transition"
                            title="Ask AI"
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
      )}

      {/* 6. DETAILED CONDITION MODAL / DRAWER */}
      {selectedConditionForDetail && (
        <ConditionDetailModal
          condition={selectedConditionForDetail}
          member={members.find((m) => m.id === selectedConditionForDetail.memberId)}
          documents={documents}
          medications={medications}
          onClose={() => setSelectedConditionForDetail(null)}
          onViewReport={onViewReport}
          onOpenAIAssistant={onOpenAIAssistant}
          onUpdateStatus={(newStatus) => {
            if (onUpdateCondition) {
              onUpdateCondition(selectedConditionForDetail.id, { status: newStatus });
            }
            setSelectedConditionForDetail({
              ...selectedConditionForDetail,
              status: newStatus,
            });
          }}
        />
      )}

      {/* 7. ADD / LOG NEW CONDITION MODAL */}
      {isAddConditionModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-5 bg-linear-to-r from-emerald-700 to-teal-800 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                  <Dna className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-bold">Log Medical Condition</h3>
                  <p className="text-xs text-emerald-100">
                    Record a new diagnosis, chronic condition, or health history entry for a family member.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddConditionModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateConditionSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Family Member Select */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Select Family Member *</label>
                <select
                  value={newCondForm.memberId}
                  onChange={(e) => setNewCondForm({ ...newCondForm, memberId: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                >
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.relationship} • {m.age} yrs)
                    </option>
                  ))}
                </select>
              </div>

              {/* Condition Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Condition / Diagnosis Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Type 2 Diabetes, Essential Hypertension, Asthma"
                  value={newCondForm.name}
                  onChange={(e) => setNewCondForm({ ...newCondForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                />

                {/* Quick suggestions */}
                <div className="flex flex-wrap gap-1 pt-1.5">
                  <span className="text-[10px] text-slate-400 font-bold self-center">Suggestions:</span>
                  {[
                    'Type 2 Diabetes',
                    'Essential Hypertension',
                    'Primary Hypothyroidism',
                    'Osteoporosis',
                    'Allergic Rhinitis',
                    'Asthma',
                    'Hyperlipidemia',
                  ].map((sug) => (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => setNewCondForm({ ...newCondForm, name: sug })}
                      className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[10px] font-medium"
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status & Diagnosed Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Status *</label>
                  <select
                    value={newCondForm.status}
                    onChange={(e) =>
                      setNewCondForm({ ...newCondForm, status: e.target.value as MedicalCondition['status'] })
                    }
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                  >
                    <option value="Active">Active (Under regular surveillance)</option>
                    <option value="Managed">Managed (Controlled on treatment)</option>
                    <option value="Resolved">Resolved / Cured</option>
                    <option value="Under Investigation">Under Investigation</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Date Diagnosed</label>
                  <input
                    type="date"
                    value={newCondForm.dateDiagnosed}
                    onChange={(e) => setNewCondForm({ ...newCondForm, dateDiagnosed: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                  />
                </div>
              </div>

              {/* Treating Doctor */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Treating Doctor / Specialist *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Sameer Gupta (Endocrinology)"
                  value={newCondForm.treatingDoctor}
                  onChange={(e) => setNewCondForm({ ...newCondForm, treatingDoctor: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                />
              </div>

              {/* Prescribed Treatments & Therapies */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Prescribed Treatments & Therapies (Comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Metformin 500mg, Low carbohydrate diet, Annual retinal exam"
                  value={newCondForm.treatments}
                  onChange={(e) => setNewCondForm({ ...newCondForm, treatments: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                />
              </div>

              {/* Clinical Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Clinical Notes & Targets
                </label>
                <textarea
                  rows={3}
                  placeholder="Notes on symptoms, lab targets (e.g. HbA1c < 7.0%), or physical therapy regimen..."
                  value={newCondForm.notes}
                  onChange={(e) => setNewCondForm({ ...newCondForm, notes: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                />
              </div>

              {/* Link to uploaded document */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Link to Relevant Medical Document (Optional)
                </label>
                <select
                  value={newCondForm.relatedDocId}
                  onChange={(e) => setNewCondForm({ ...newCondForm, relatedDocId: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                >
                  <option value="">No linked document</option>
                  {documents
                    .filter((d) => d.memberId === newCondForm.memberId)
                    .map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.title} ({d.date})
                      </option>
                    ))}
                </select>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddConditionModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl transition shadow-sm flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Condition Record</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Sub-component: Detailed Condition Modal
interface ConditionDetailModalProps {
  condition: MedicalCondition;
  member?: FamilyMember;
  documents: MedicalDocument[];
  medications: Medication[];
  onClose: () => void;
  onViewReport: (doc: MedicalDocument) => void;
  onOpenAIAssistant: (prompt?: string) => void;
  onUpdateStatus: (newStatus: MedicalCondition['status']) => void;
}

const ConditionDetailModal: React.FC<ConditionDetailModalProps> = ({
  condition,
  member,
  documents,
  medications,
  onClose,
  onViewReport,
  onOpenAIAssistant,
  onUpdateStatus,
}) => {
  const linkedDocs = (condition.relatedDocIds || [])
    .map((id) => documents.find((d) => d.id === id))
    .filter(Boolean) as MedicalDocument[];

  const relatedMeds = medications.filter(
    (m) =>
      m.memberId === condition.memberId &&
      (m.reason.toLowerCase().includes(condition.name.toLowerCase().split(' ')[0]) ||
        condition.name.toLowerCase().includes(m.name.toLowerCase().split(' ')[0]))
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 bg-linear-to-r from-teal-700 to-emerald-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
              <Dna className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-200">Condition Audit</span>
              <h3 className="text-lg font-black">{condition.name}</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto text-xs">
          {/* Patient Card */}
          {member && (
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="w-10 h-10 rounded-xl object-cover"
                />
                <div>
                  <div className="font-black text-slate-900 text-sm">{member.name}</div>
                  <div className="text-[11px] text-slate-500">
                    {member.relationship} • {member.age} yrs • Blood Type: {member.bloodType}
                  </div>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-white border border-slate-200 text-slate-700">
                PCP: {member.primaryPhysician.split('(')[0]}
              </span>
            </div>
          )}

          {/* Status Switcher Strip */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
              Update Condition Status
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Active', 'Managed', 'Resolved'] as MedicalCondition['status'][]).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => onUpdateStatus(st)}
                  className={`py-2 px-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 ${
                    condition.status === st
                      ? st === 'Active'
                        ? 'bg-amber-600 text-white shadow-xs'
                        : st === 'Managed'
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'bg-blue-700 text-white shadow-xs'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {condition.status === st && <Check className="w-3 h-3" />}
                  <span>{st}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Clinical Information Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Date Diagnosed</span>
              <span className="font-bold text-slate-800 text-xs mt-0.5 block">{condition.dateDiagnosed}</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Treating Doctor</span>
              <span className="font-bold text-teal-800 text-xs mt-0.5 block">{condition.treatingDoctor}</span>
            </div>
          </div>

          {/* Clinical Notes */}
          {condition.notes && (
            <div className="space-y-1">
              <h5 className="font-bold text-slate-800 text-xs">Physician Notes & Surveillance Plan</h5>
              <div className="p-3.5 rounded-xl bg-white border border-slate-200 text-slate-700 leading-relaxed">
                {condition.notes}
              </div>
            </div>
          )}

          {/* Prescribed Therapies */}
          {condition.treatments && condition.treatments.length > 0 && (
            <div className="space-y-1.5">
              <h5 className="font-bold text-slate-800 text-xs">Prescribed Therapies & Interventions</h5>
              <div className="flex flex-wrap gap-1.5">
                {condition.treatments.map((t, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-teal-50 text-teal-800 rounded-xl text-xs font-semibold border border-teal-200"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Linked Medications */}
          {relatedMeds.length > 0 && (
            <div className="space-y-1.5">
              <h5 className="font-bold text-slate-800 text-xs">Associated Prescriptions</h5>
              <div className="space-y-1.5">
                {relatedMeds.map((med) => (
                  <div
                    key={med.id}
                    className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-200 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-slate-900">{med.name} ({med.dosage})</div>
                      <div className="text-[10px] text-slate-500">{med.frequency} • {med.timing}</div>
                    </div>
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                      {med.isCurrent ? 'Active Rx' : 'Past Course'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Linked Reports */}
          {linkedDocs.length > 0 && (
            <div className="space-y-1.5">
              <h5 className="font-bold text-slate-800 text-xs">Referenced Lab Reports & Imaging</h5>
              <div className="space-y-1.5">
                {linkedDocs.map((doc) => (
                  <button
                    key={doc.id}
                    onClick={() => {
                      onClose();
                      onViewReport(doc);
                    }}
                    className="w-full text-left p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-between transition"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-teal-600" />
                      <div>
                        <div className="font-bold text-slate-900">{doc.title}</div>
                        <div className="text-[10px] text-slate-500">{doc.date} • {doc.facility}</div>
                      </div>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Footer AI Consultation */}
          <div className="p-3.5 rounded-2xl bg-purple-50/80 border border-purple-200/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600 shrink-0" />
              <div>
                <div className="font-bold text-purple-950 text-xs">Need Clinical Guidance?</div>
                <div className="text-[10px] text-purple-700">Get AI-generated questions to ask the doctor.</div>
              </div>
            </div>
            <button
              onClick={() => {
                onClose();
                onOpenAIAssistant(
                  `Generate 4 focused clinical questions for Dr. ${condition.treatingDoctor} regarding ${condition.name} management for ${member?.name}.`
                );
              }}
              className="px-3 py-1.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs transition"
            >
              Ask AI
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
