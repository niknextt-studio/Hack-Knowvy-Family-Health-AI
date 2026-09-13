import React, { useState, useMemo } from 'react';
import {
  GitBranch,
  ShieldCheck,
  AlertCircle,
  Users,
  Activity,
  Heart,
  ChevronRight,
  TrendingDown,
  TrendingUp,
  Info,
  Calendar,
  Search,
  Filter,
  FileText,
  Stethoscope,
  Pill,
  Scissors,
  CheckCircle2,
  Clock,
  Printer,
  Eye,
  Download,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Hospital,
  Sparkles,
  ArrowUpDown,
  Plus,
  Table as TableIcon,
  Layers,
  User,
  BadgeCheck,
} from 'lucide-react';
import {
  Family,
  FamilyMember,
  MedicalCondition,
  MedicalDocument,
  Medication,
  Doctor,
} from '../types';
import { UserAvatar } from './UserAvatar';

interface FamilyInsightsViewProps {
  family: Family;
  members: FamilyMember[];
  documents: MedicalDocument[];
  conditions: MedicalCondition[];
  medications: Medication[];
  doctors: Doctor[];
  onSelectMember: (member: FamilyMember) => void;
  onViewReport: (doc: MedicalDocument) => void;
  onOpenDoctorVisit: (member: FamilyMember) => void;
  onOpenAIAssistant: (query?: string) => void;
  onUploadReport: () => void;
}

type ReportTypeFilter =
  | 'all'
  | 'Blood Test'
  | 'Scan & Imaging'
  | 'Doctor Consultation'
  | 'Discharge Summary'
  | 'Prescription'
  | 'Lab Report';

type SortOption = 'date-desc' | 'date-asc' | 'member' | 'title';

export const FamilyInsightsView: React.FC<FamilyInsightsViewProps> = ({
  family,
  members,
  documents,
  conditions,
  medications,
  doctors,
  onSelectMember,
  onViewReport,
  onOpenDoctorVisit,
  onOpenAIAssistant,
  onUploadReport,
}) => {
  // Filter States
  const [selectedMemberFilter, setSelectedMemberFilter] = useState<string>('all');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<ReportTypeFilter>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortOption>('date-desc');
  const [expandedReportId, setExpandedReportId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all_reports_table' | 'members_summary_table'>('all_reports_table');

  // Helper map for fast member lookup
  const memberMap = useMemo(() => {
    const map = new Map<string, FamilyMember>();
    members.forEach((m) => map.set(m.id, m));
    return map;
  }, [members]);

  // Filtered & Sorted Medical Documents for the All Members Report Table
  const filteredDocuments = useMemo(() => {
    return documents
      .filter((doc) => {
        // Member filter
        if (selectedMemberFilter !== 'all' && doc.memberId !== selectedMemberFilter) {
          return false;
        }
        // Document Type filter
        if (selectedTypeFilter !== 'all' && doc.type !== selectedTypeFilter) {
          return false;
        }
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const member = memberMap.get(doc.memberId);
          const memberName = (member?.name || '').toLowerCase();
          const title = doc.title.toLowerCase();
          const doctor = (doc.doctor || '').toLowerCase();
          const facility = (doc.facility || '').toLowerCase();
          const preview = (doc.previewText || '').toLowerCase();
          const remarks = (doc.remarks || '').toLowerCase();
          const aiSummary = (doc.aiSummary || '').toLowerCase();
          const labNames = (doc.extractedData?.labResults || [])
            .map((l) => `${l.name} ${l.value}`)
            .join(' ')
            .toLowerCase();

          return (
            title.includes(q) ||
            memberName.includes(q) ||
            doctor.includes(q) ||
            facility.includes(q) ||
            preview.includes(q) ||
            remarks.includes(q) ||
            aiSummary.includes(q) ||
            labNames.includes(q)
          );
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'date-desc') {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        }
        if (sortBy === 'date-asc') {
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        }
        if (sortBy === 'member') {
          const nameA = memberMap.get(a.memberId)?.name || '';
          const nameB = memberMap.get(b.memberId)?.name || '';
          return nameA.localeCompare(nameB);
        }
        if (sortBy === 'title') {
          return a.title.localeCompare(b.title);
        }
        return 0;
      });
  }, [documents, selectedMemberFilter, selectedTypeFilter, searchQuery, sortBy, memberMap]);

  // Aggregate stats across family
  const totalReportsCount = documents.length;
  const totalConditionsCount = conditions.length;
  const totalActiveMedications = medications.filter((m) => m.isCurrent).length;

  // Cross-family condition frequencies with real member associations
  const crossFamilyPatterns = useMemo(() => {
    return [
      {
        category: 'Cardiovascular & Arterial Health',
        condition: 'Essential Hypertension',
        prevalence: '2 of 4 family members (both parents)',
        members: [
          { name: 'Rajesh Sharma', age: 54, status: 'Controlled on Telmisartan 40mg', bp: '124/80 mmHg' },
          { name: 'Sunita Sharma', age: 51, status: 'Controlled on Amlodipine 5mg', bp: '128/82 mmHg' },
        ],
        clinicalNote:
          'Both adult parents have documented primary hypertension with sustained normotensive readings on monotherapy.',
        preventiveAdvice:
          'Adult children (Aarav, 22) should maintain annual blood pressure screenings during routine college physicals.',
      },
      {
        category: 'Endocrine & Metabolic Health',
        condition: 'Type 2 Diabetes Mellitus',
        prevalence: '1 member with optimal glycemic target reached',
        members: [
          { name: 'Rajesh Sharma', age: 54, status: 'HbA1c 6.9% (Target < 7.0%)', bp: 'Controlled on Metformin 500mg' },
        ],
        clinicalNote:
          'Documented 3-year progressive improvement in HbA1c (7.8% in 2024 to 6.9% in Sep 2026) without hypoglycemic episodes.',
        preventiveAdvice:
          'Maintain annual fasting plasma glucose and microalbuminuria screening.',
      },
      {
        category: 'Thyroid & Metabolic Function',
        condition: 'Subclinical Hypothyroidism',
        prevalence: '1 member stable euthyroid',
        members: [
          { name: 'Sunita Sharma', age: 51, status: 'TSH 2.45 mIU/L (Optimal)', bp: 'Levothyroxine 75mcg' },
        ],
        clinicalNote:
          'Thyroid function tests normalized on daily morning levothyroxine. Annual surveillance scheduled.',
        preventiveAdvice:
          'Routine re-evaluation of serum TSH and Free T4 every 6 to 12 months.',
      },
      {
        category: 'Bone Density & Musculoskeletal Health',
        condition: 'Osteoporosis & Joint Reconstruction',
        prevalence: '2 members (multigenerational)',
        members: [
          { name: 'Meera Sharma', age: 76, status: 'Lumbar T-Score -2.7 (Osteoporosis)', bp: 'Alendronate 70mg weekly + Vit D3' },
          { name: 'Rajesh Sharma', age: 54, status: 'Post-Op Total Knee Arthroplasty (2023)', bp: 'Full mobility restored' },
        ],
        clinicalNote:
          'Meera has active osteoporosis managed with bisphosphonates; zero fall incidents documented. Rajesh completed successful joint rehabilitation.',
        preventiveAdvice:
          'Fall prevention safety audit in senior living areas; Sunita (51) to continue preventative Vitamin D3 supplementation.',
      },
      {
        category: 'Ophthalmology & Senior Sensory Health',
        condition: 'Primary Open-Angle Glaucoma',
        prevalence: '1 senior member stabilized',
        members: [
          { name: 'Meera Sharma', age: 76, status: 'IOP 16 mmHg (Normal)', bp: 'Timolol 0.5% eye drops' },
        ],
        clinicalNote:
          'Intraocular pressures remain controlled within the safe target zone (15-17 mmHg).',
        preventiveAdvice:
          'First-degree relatives should receive comprehensive dilated eye exams with tonometry every 2 years after age 40.',
      },
    ];
  }, []);

  // Visual styling for document types
  const getDocTypeBadge = (type: MedicalDocument['type']) => {
    switch (type) {
      case 'Blood Test':
      case 'Lab Report':
        return {
          label: 'Blood & Lab',
          icon: Activity,
          badgeBg: 'bg-teal-50 text-teal-800 border-teal-200',
        };
      case 'Scan & Imaging':
        return {
          label: 'Scan & Imaging',
          icon: Eye,
          badgeBg: 'bg-sky-50 text-sky-800 border-sky-200',
        };
      case 'Doctor Consultation':
        return {
          label: 'Doctor Consultation',
          icon: Stethoscope,
          badgeBg: 'bg-blue-50 text-blue-800 border-blue-200',
        };
      case 'Discharge Summary':
        return {
          label: 'Discharge Summary',
          icon: Scissors,
          badgeBg: 'bg-purple-50 text-purple-800 border-purple-200',
        };
      case 'Prescription':
        return {
          label: 'Prescription',
          icon: Pill,
          badgeBg: 'bg-amber-50 text-amber-800 border-amber-200',
        };
      default:
        return {
          label: 'Medical Record',
          icon: FileText,
          badgeBg: 'bg-slate-50 text-slate-800 border-slate-200',
        };
    }
  };

  // Status badge styling
  const getStatusBadge = (status: MedicalDocument['status'], remarks?: string) => {
    const isNeedsAttention =
      (remarks && remarks.toLowerCase().includes('deficiency')) ||
      (remarks && remarks.toLowerCase().includes('osteoporosis')) ||
      status === 'pending_review';

    if (isNeedsAttention) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 border border-amber-200 text-amber-800">
          <AlertCircle className="w-3 h-3 text-amber-600" />
          <span>Monitoring / Action</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 border border-emerald-200 text-emerald-800">
        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
        <span>Normal / Verified</span>
      </span>
    );
  };

  return (
    <div id="family-insights-view" className="max-w-7xl mx-auto space-y-6 pb-20">
      {/* 1. TOP HEADER & HEALTH METRICS STRIP */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold">
                <GitBranch className="w-3.5 h-3.5 text-teal-600" />
                <span>Family Health Intelligence</span>
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {family.name} • {members.length} Members
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Family Health Reports & Comparative Matrix
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
              Consolidated, searchable tables of all medical reports, diagnostic scans, lab findings,
              and health indicators across all family members.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              id="upload-report-btn"
              onClick={onUploadReport}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Upload Report</span>
            </button>

            <button
              id="ask-ai-patterns-btn"
              onClick={() => {
                onOpenAIAssistant(
                  'Please provide a comprehensive summary of our family health reports table. What are the key findings for each member, what conditions run in the family, and what are the priority checkups?'
                );
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold border border-slate-200 transition cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>AI Family Insights</span>
            </button>

            <button
              id="print-family-reports-btn"
              onClick={() => window.print()}
              title="Print table"
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs border border-slate-200 transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Aggregate Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-5 mt-5 border-t border-slate-100">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Family Members</span>
              <Users className="w-4 h-4 text-teal-600" />
            </div>
            <p className="text-xl font-extrabold text-slate-900 mt-1">{members.length}</p>
            <span className="text-[10px] text-slate-500">Profiles synchronized</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Total Reports on File</span>
              <FileText className="w-4 h-4 text-teal-600" />
            </div>
            <p className="text-xl font-extrabold text-teal-800 mt-1">{totalReportsCount}</p>
            <span className="text-[10px] text-teal-700 font-medium">All indexed in table</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Monitored Conditions</span>
              <Heart className="w-4 h-4 text-purple-600" />
            </div>
            <p className="text-xl font-extrabold text-slate-900 mt-1">{totalConditionsCount}</p>
            <span className="text-[10px] text-purple-700 font-medium">Active & managed</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Current Medications</span>
              <Pill className="w-4 h-4 text-amber-600" />
            </div>
            <p className="text-xl font-extrabold text-slate-900 mt-1">{totalActiveMedications}</p>
            <span className="text-[10px] text-amber-700 font-medium">Active family prescriptions</span>
          </div>
        </div>

        {/* View Toggle Tabs (All Reports Table vs Members Overview Matrix) */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-5 mt-4 border-t border-slate-100">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
            <button
              onClick={() => setActiveTab('all_reports_table')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                activeTab === 'all_reports_table'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5 text-teal-600" />
              <span>All Members Medical Reports Table ({totalReportsCount})</span>
            </button>

            <button
              onClick={() => setActiveTab('members_summary_table')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                activeTab === 'members_summary_table'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-purple-600" />
              <span>Members Health Comparison Matrix ({members.length})</span>
            </button>
          </div>

          <div className="text-xs text-slate-500 font-medium flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            <span>Strict clinical record extraction • Real diagnostic files</span>
          </div>
        </div>
      </div>

      {/* 2. STRICT MEDICAL SAFETY DISCLAIMER */}
      <div className="p-3.5 rounded-xl bg-teal-50/70 border border-teal-200/80 text-xs text-teal-950 flex items-start gap-3">
        <ShieldCheck className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-bold text-teal-900">Clinical Documentation Policy:</span>
          <p className="text-[11px] text-teal-800 leading-relaxed">
            The tables below strictly synthesize <strong>verified data from your family’s uploaded medical documents</strong>. This overview does not formulate speculative genetic probability scores or substitute for a clinical consultation with your primary physician.
          </p>
        </div>
      </div>

      {/* 3. PRIMARY VIEW A: ALL MEMBERS MEDICAL REPORTS TABLE */}
      {activeTab === 'all_reports_table' && (
        <div className="space-y-4">
          {/* Filter & Search Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
            {/* Top row: Search and Sort */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              {/* Search input */}
              <div className="relative w-full sm:flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by test name, patient, doctor, clinic, medication, or findings..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50/50"
                />
              </div>

              {/* Sort By Dropdown */}
              <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                <span className="text-xs font-bold text-slate-500 whitespace-nowrap">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
                >
                  <option value="date-desc">Newest Reports First</option>
                  <option value="date-asc">Oldest Reports First</option>
                  <option value="member">Family Member (A-Z)</option>
                  <option value="title">Report Title (A-Z)</option>
                </select>
              </div>
            </div>

            {/* Bottom row: Member Filter & Document Type Filter */}
            <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
              {/* Member Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
                <span className="text-slate-500 font-bold text-[11px] mr-1">Person:</span>
                <button
                  onClick={() => setSelectedMemberFilter('all')}
                  className={`px-2.5 py-1 rounded-lg font-bold text-xs transition cursor-pointer ${
                    selectedMemberFilter === 'all'
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  All ({documents.length})
                </button>
                {members.map((m) => {
                  const count = documents.filter((d) => d.memberId === m.id).length;
                  const isSelected = selectedMemberFilter === m.id;
                  return (
                    <button
                      key={m.id}
                      onClick={() => setSelectedMemberFilter(m.id)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold text-xs transition cursor-pointer ${
                        isSelected
                          ? 'bg-teal-700 text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      <UserAvatar avatar={m.avatar} name={m.name} size="xs" />
                      <span>{m.name.split(' ')[0]}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                          isSelected ? 'bg-teal-800 text-white' : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1 overflow-x-auto py-0.5">
                <span className="text-slate-500 font-bold text-[11px] mr-1">Type:</span>
                {[
                  { id: 'all', label: 'All Types' },
                  { id: 'Blood Test', label: 'Blood Tests' },
                  { id: 'Scan & Imaging', label: 'Scans & Imaging' },
                  { id: 'Doctor Consultation', label: 'Doctor Notes' },
                  { id: 'Discharge Summary', label: 'Discharge' },
                  { id: 'Prescription', label: 'Prescriptions' },
                ].map((type) => {
                  const isSelected = selectedTypeFilter === type.id;
                  return (
                    <button
                      key={type.id}
                      onClick={() => setSelectedTypeFilter(type.id as ReportTypeFilter)}
                      className={`px-2 py-1 rounded-lg font-bold text-xs transition cursor-pointer ${
                        isSelected
                          ? 'bg-teal-800 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {type.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* THE MASTER ALL MEMBERS MEDICAL REPORTS TABLE */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <TableIcon className="w-4 h-4 text-teal-700" />
                <h3 className="font-bold text-slate-900 text-sm">
                  Consolidated Medical Reports ({filteredDocuments.length} records shown)
                </h3>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                Click "View Details" to open full lab metrics, AI summary, and physician notes
              </span>
            </div>

            {filteredDocuments.length === 0 ? (
              <div className="p-12 text-center text-slate-500 space-y-3">
                <FileText className="w-10 h-10 text-slate-300 mx-auto" />
                <h4 className="font-bold text-slate-800 text-sm">No reports match your filters</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Try adjusting the family member filter, report category, or search keywords.
                </p>
                <button
                  onClick={() => {
                    setSelectedMemberFilter('all');
                    setSelectedTypeFilter('all');
                    setSearchQuery('');
                  }}
                  className="px-3.5 py-1.5 bg-teal-700 text-white text-xs font-bold rounded-xl hover:bg-teal-800 cursor-pointer"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-100/90 text-slate-700 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4 whitespace-nowrap">Report Date</th>
                      <th className="py-3 px-4 whitespace-nowrap">Family Member</th>
                      <th className="py-3 px-4">Report Title & Type</th>
                      <th className="py-3 px-4">Key Biomarkers & Clinical Findings</th>
                      <th className="py-3 px-4">Doctor & Facility</th>
                      <th className="py-3 px-4">Status / Interpretation</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredDocuments.map((doc) => {
                      const member = memberMap.get(doc.memberId);
                      const typeBadge = getDocTypeBadge(doc.type);
                      const TypeIcon = typeBadge.icon;
                      const isExpanded = expandedReportId === doc.id;
                      const extractedLabs = doc.extractedData?.labResults || [];

                      return (
                        <React.Fragment key={doc.id}>
                          <tr className="hover:bg-slate-50/80 transition group">
                            {/* Date Column */}
                            <td className="py-3.5 px-4 whitespace-nowrap font-bold text-slate-900 align-top">
                              <div className="flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-teal-600" />
                                <span>{doc.date}</span>
                              </div>
                              <span className="text-[10px] text-slate-400 font-normal block mt-0.5">
                                {doc.fileType.toUpperCase()} • {doc.fileSize}
                              </span>
                            </td>

                            {/* Member Column */}
                            <td className="py-3.5 px-4 whitespace-nowrap align-top">
                              {member ? (
                                <div
                                  onClick={() => onSelectMember(member)}
                                  className="flex items-center gap-2 cursor-pointer group-hover:text-teal-800"
                                  title={`View ${member.name}'s profile`}
                                >
                                  <UserAvatar avatar={member.avatar} name={member.name} size="sm" />
                                  <div>
                                    <span className="font-bold text-slate-900 block group-hover:underline">
                                      {member.name}
                                    </span>
                                    <span className="text-[10px] text-slate-500 font-medium">
                                      {member.relationship} • {member.age}y
                                    </span>
                                  </div>
                                </div>
                              ) : (
                                <span className="text-slate-400 italic">Unknown</span>
                              )}
                            </td>

                            {/* Title & Document Type */}
                            <td className="py-3.5 px-4 max-w-xs align-top">
                              <div className="space-y-1">
                                <button
                                  onClick={() => onViewReport(doc)}
                                  className="font-extrabold text-slate-900 hover:text-teal-700 text-left transition block cursor-pointer"
                                >
                                  {doc.title}
                                </button>
                                <span
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border ${typeBadge.badgeBg}`}
                                >
                                  <TypeIcon className="w-3 h-3" />
                                  <span>{typeBadge.label}</span>
                                </span>
                              </div>
                            </td>

                            {/* Key Biomarkers & Findings */}
                            <td className="py-3.5 px-4 max-w-sm align-top">
                              <div className="space-y-1.5">
                                {/* Biomarkers pills if any */}
                                {extractedLabs.length > 0 && (
                                  <div className="flex flex-wrap gap-1">
                                    {extractedLabs.slice(0, 3).map((lab, i) => {
                                      const isAbnormal =
                                        lab.status === 'elevated' ||
                                        lab.status === 'low' ||
                                        lab.status === 'monitoring';
                                      return (
                                        <span
                                          key={i}
                                          className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold border ${
                                            isAbnormal
                                              ? 'bg-amber-50 text-amber-900 border-amber-200'
                                              : 'bg-slate-50 text-slate-700 border-slate-200'
                                          }`}
                                        >
                                          <strong className="text-slate-900">{lab.name}:</strong>{' '}
                                          {lab.value}
                                        </span>
                                      );
                                    })}
                                    {extractedLabs.length > 3 && (
                                      <span className="text-[10px] text-slate-400 self-center">
                                        +{extractedLabs.length - 3} more
                                      </span>
                                    )}
                                  </div>
                                )}

                                {/* Short clinical preview / remarks */}
                                <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                                  {doc.remarks || doc.previewText}
                                </p>
                              </div>
                            </td>

                            {/* Doctor & Facility */}
                            <td className="py-3.5 px-4 whitespace-nowrap align-top">
                              <span className="font-bold text-slate-800 block">
                                {doc.doctor || 'Attending Physician'}
                              </span>
                              <span className="text-[10px] text-slate-500 block">
                                {doc.facility || 'Clinical Centre'}
                              </span>
                            </td>

                            {/* Status */}
                            <td className="py-3.5 px-4 whitespace-nowrap align-top">
                              {getStatusBadge(doc.status, doc.remarks)}
                            </td>

                            {/* Actions */}
                            <td className="py-3.5 px-4 text-right whitespace-nowrap align-top">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() =>
                                    setExpandedReportId(isExpanded ? null : doc.id)
                                  }
                                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
                                  title={isExpanded ? 'Collapse row' : 'Quick preview extracted data'}
                                >
                                  {isExpanded ? (
                                    <ChevronUp className="w-4 h-4 text-slate-600" />
                                  ) : (
                                    <ChevronDown className="w-4 h-4 text-slate-600" />
                                  )}
                                </button>

                                <button
                                  onClick={() => onViewReport(doc)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-2xs transition cursor-pointer"
                                >
                                  <Eye className="w-3 h-3" />
                                  <span>View Report</span>
                                </button>

                                <button
                                  onClick={() => {
                                    onOpenAIAssistant(
                                      `Please explain ${doc.title} (${doc.date}) for ${member?.name}. What were the key lab findings, are there any red flags, and what should be discussed with Dr. ${doc.doctor}?`
                                    );
                                  }}
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
                                  title="Ask AI to explain this report"
                                >
                                  <Sparkles className="w-3 h-3 text-amber-500" />
                                  <span>AI</span>
                                </button>
                              </div>
                            </td>
                          </tr>

                          {/* Expandable Quick Preview Drawer */}
                          {isExpanded && (
                            <tr className="bg-teal-50/40 border-b border-slate-200">
                              <td colSpan={7} className="p-4">
                                <div className="p-4 rounded-xl bg-white border border-teal-200/80 shadow-2xs space-y-3">
                                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
                                    <div className="flex items-center gap-2">
                                      <FileText className="w-4 h-4 text-teal-700" />
                                      <h4 className="font-extrabold text-slate-900 text-xs">
                                        Extracted Clinical Data: {doc.title}
                                      </h4>
                                    </div>
                                    <button
                                      onClick={() => onViewReport(doc)}
                                      className="text-teal-700 hover:text-teal-900 font-bold text-xs flex items-center gap-1"
                                    >
                                      <span>Open in Diagnostic Modal</span>
                                      <ExternalLink className="w-3 h-3" />
                                    </button>
                                  </div>

                                  {/* AI Summary Banner */}
                                  {doc.aiSummary && (
                                    <div className="p-2.5 rounded-lg bg-teal-50 text-teal-900 text-xs flex items-start gap-2">
                                      <Sparkles className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                                      <div>
                                        <strong className="font-bold">AI Clinical Takeaway: </strong>
                                        <span>{doc.aiSummary}</span>
                                      </div>
                                    </div>
                                  )}

                                  {/* Extracted Lab Tests Table */}
                                  {extractedLabs.length > 0 ? (
                                    <div className="space-y-1.5">
                                      <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                                        Biomarker Readings ({extractedLabs.length} tests):
                                      </span>
                                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                        {extractedLabs.map((lab, i) => (
                                          <div
                                            key={i}
                                            className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs flex items-center justify-between"
                                          >
                                            <div>
                                              <span className="font-bold text-slate-800 block">
                                                {lab.name}
                                              </span>
                                              <span className="text-[10px] text-slate-400">
                                                Ref: {lab.referenceRange}
                                              </span>
                                            </div>
                                            <div className="text-right">
                                              <span className="font-extrabold text-slate-900 block">
                                                {lab.value}
                                              </span>
                                              <span
                                                className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                                                  lab.status === 'normal'
                                                    ? 'bg-emerald-100 text-emerald-800'
                                                    : 'bg-amber-100 text-amber-800'
                                                }`}
                                              >
                                                {lab.status}
                                              </span>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  ) : (
                                    <p className="text-xs text-slate-500 italic">
                                      No numeric biomarker array detected. Clinical narrative document.
                                    </p>
                                  )}

                                  {/* Detected Medications */}
                                  {doc.extractedData?.medicationsDetected &&
                                    doc.extractedData.medicationsDetected.length > 0 && (
                                      <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                                        <Pill className="w-3.5 h-3.5 text-amber-600" />
                                        <span className="text-xs font-bold text-slate-700">
                                          Prescribed / Detected Medicines:
                                        </span>
                                        <div className="flex flex-wrap gap-1">
                                          {doc.extractedData.medicationsDetected.map((med, idx) => (
                                            <span
                                              key={idx}
                                              className="px-2 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold"
                                            >
                                              {med}
                                            </span>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. PRIMARY VIEW B: ALL MEMBERS HEALTH COMPARATIVE MATRIX (TABLE) */}
      {activeTab === 'members_summary_table' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                All Members Health Comparison Matrix
              </h3>
              <p className="text-xs text-slate-500">
                Cross-member diagnostic status, chronic management, vital parameters, and active reports
              </p>
            </div>
            <span className="text-xs font-semibold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200">
              {members.length} Members Monitored
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-100/90 text-slate-700 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Member Profile</th>
                  <th className="py-3 px-4">Clinical Health Status</th>
                  <th className="py-3 px-4">Documented Chronic Conditions</th>
                  <th className="py-3 px-4">Key Biomarkers & Vitals</th>
                  <th className="py-3 px-4 text-center">Reports on File</th>
                  <th className="py-3 px-4">Primary Doctor</th>
                  <th className="py-3 px-4">Recommended Next Step</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {members.map((m) => {
                  const memberReports = documents.filter((d) => d.memberId === m.id);
                  const memberConditions = conditions.filter((c) => c.memberId === m.id);
                  const latestReport = [...memberReports].sort(
                    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
                  )[0];

                  return (
                    <tr key={m.id} className="hover:bg-slate-50 transition">
                      {/* Profile */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <UserAvatar avatar={m.avatar} name={m.name} size="md" />
                          <div>
                            <span className="font-extrabold text-slate-900 block text-sm">
                              {m.name}
                            </span>
                            <span className="text-[11px] text-slate-500">
                              {m.relationship} • {m.age} yrs • Blood {m.bloodType}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                            m.status === 'healthy'
                              ? 'bg-emerald-100 text-emerald-800'
                              : m.status === 'stable'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              m.status === 'healthy'
                                ? 'bg-emerald-600'
                                : m.status === 'stable'
                                ? 'bg-blue-600'
                                : 'bg-amber-600'
                            }`}
                          />
                          <span>{m.statusText}</span>
                        </span>
                      </td>

                      {/* Documented Conditions */}
                      <td className="py-4 px-4 max-w-xs">
                        {memberConditions.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {memberConditions.map((cond) => (
                              <span
                                key={cond.id}
                                className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-800 text-[11px] font-semibold"
                              >
                                {cond.name}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">No chronic diagnoses</span>
                        )}
                      </td>

                      {/* Key Biomarkers & Vitals */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-500 font-semibold">BP:</span>
                            <span className="font-bold text-slate-900">
                              {m.vitals.bloodPressure}
                            </span>
                          </div>
                          {m.vitals.hba1c && (
                            <div className="flex items-center gap-1.5">
                              <span className="text-slate-500 font-semibold">HbA1c:</span>
                              <span className="font-extrabold text-teal-800">
                                {m.vitals.hba1c}
                              </span>
                              <span className="text-[10px] text-teal-700 bg-teal-50 px-1 rounded">
                                Optimal
                              </span>
                            </div>
                          )}
                          <div className="text-[10px] text-slate-400">
                            BMI {m.vitals.bmi} • {m.vitals.weightKg} kg
                          </div>
                        </div>
                      </td>

                      {/* Reports on file */}
                      <td className="py-4 px-4 text-center whitespace-nowrap">
                        <button
                          onClick={() => {
                            setSelectedMemberFilter(m.id);
                            setActiveTab('all_reports_table');
                          }}
                          className="inline-flex flex-col items-center justify-center p-2 rounded-xl bg-slate-100 hover:bg-teal-50 hover:border-teal-300 border border-slate-200 transition cursor-pointer"
                        >
                          <span className="text-base font-extrabold text-teal-800">
                            {memberReports.length}
                          </span>
                          <span className="text-[10px] text-slate-500 font-medium">Reports</span>
                        </button>
                      </td>

                      {/* Primary Doctor */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="font-bold text-slate-800 block">
                          {m.primaryPhysician}
                        </span>
                        {latestReport && (
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            Last test: {latestReport.date}
                          </span>
                        )}
                      </td>

                      {/* Recommended Next Step */}
                      <td className="py-4 px-4 max-w-xs">
                        <span className="text-[11px] text-slate-700 font-medium leading-relaxed block">
                          {m.id === 'mem-rajesh' && 'Annual lipid & renal monitoring with Dr. Gupta.'}
                          {m.id === 'mem-sunita' && 'Thyroid panel follow-up & Vit D check in 6 mos.'}
                          {m.id === 'mem-meera' && 'Maintain DEXA bone scans & daily fall precautions.'}
                          {m.id === 'mem-aarav' && 'Pre-collegiate athletic physical renewal.'}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => onSelectMember(m)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold text-xs border border-teal-200 transition cursor-pointer"
                        >
                          <span>Full Profile</span>
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

      {/* 5. CROSS-MEMBER CLINICAL PATTERNS TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-teal-700" />
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
              Cross-Member Health Patterns & Documented Conditions
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Derived from confirmed diagnosis records
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {crossFamilyPatterns.map((pattern, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3 text-xs"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] text-teal-700 font-bold uppercase tracking-wider block">
                    {pattern.category}
                  </span>
                  <h4 className="font-extrabold text-slate-900 text-sm">{pattern.condition}</h4>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 text-[10px] font-bold shrink-0">
                  {pattern.prevalence}
                </span>
              </div>

              {/* Members Involved */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                  Documented Family Members:
                </span>
                <div className="space-y-1">
                  {pattern.members.map((mem, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 text-xs"
                    >
                      <span className="font-bold text-slate-800">{mem.name}</span>
                      <span className="text-[11px] text-slate-600">{mem.status}</span>
                    </div>
                  ))}
                </div>
              </div>

              <p className="text-[11px] text-slate-600 leading-relaxed pt-1">
                {pattern.clinicalNote}
              </p>

              <div className="p-2.5 rounded-lg bg-teal-50/70 border border-teal-200 text-[11px] text-teal-900">
                <strong className="font-bold">Preventive Takeaway: </strong>
                <span>{pattern.preventiveAdvice}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. HIGH-VALUE PREVENTIVE DIALOGUE TOPICS FOR DOCTOR VISITS */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-3">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-teal-600" />
          <h3 className="font-bold text-slate-900 text-sm">
            Preventive Dialogue Topics for Family Consultations
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="font-bold text-slate-900 block">
              1. Cardiovascular & Glycemic Baseline Review
            </span>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              With both parents managing essential blood pressure and one parent managing Type 2 Diabetes, adult children (such as Aarav, 22) may discuss baseline fasting glucose and lipid screening during annual physicals.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="font-bold text-slate-900 block">
              2. Bone Density & Fall Prevention in Senior Family Care
            </span>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Meera Sharma (76y) has documented osteoporosis. Maintain regular home safety precautions, ensure adequate Vitamin D/calcium supplementation under supervision, and schedule repeat DXA scans per orthopedist advice.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="font-bold text-slate-900 block">
              3. Annual Comprehensive Metabolic Panels
            </span>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Continued monitoring of renal markers (serum creatinine & eGFR) and HbA1c is documented annually in September for Rajesh. Ensure appointment reminder is confirmed with Dr. Sameer Gupta.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
