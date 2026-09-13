import React, { useState, useMemo } from 'react';
import {
  FileText,
  Search,
  Upload,
  Calendar,
  Clock,
  User,
  Building,
  Stethoscope,
  MessageSquare,
  Sparkles,
  Eye,
  Download,
  Edit3,
  AlertCircle,
  CheckCircle2,
  LayoutGrid,
  List,
  ArrowUpDown,
  X,
  Plus,
  Activity,
  Check,
  Filter,
} from 'lucide-react';
import { MedicalDocument, FamilyMember } from '../types';

interface LabReportsViewProps {
  documents: MedicalDocument[];
  members: FamilyMember[];
  activeMember: FamilyMember;
  onSelectMember: (member: FamilyMember) => void;
  onOpenUpload: () => void;
  onViewReport: (doc: MedicalDocument) => void;
  onOpenAIAssistant: (member: FamilyMember, initialQuery?: string) => void;
  onUpdateDocumentRemarks?: (docId: string, newRemarks: string) => void;
}

export const LabReportsView: React.FC<LabReportsViewProps> = ({
  documents,
  members,
  activeMember,
  onSelectMember,
  onOpenUpload,
  onViewReport,
  onOpenAIAssistant,
  onUpdateDocumentRemarks,
}) => {
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMemberId, setSelectedMemberId] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'upload-desc' | 'upload-asc' | 'date-desc' | 'date-asc' | 'title-asc'>('upload-desc');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [onlyAbnormal, setOnlyAbnormal] = useState(false);

  // Edit remarks modal state
  const [editingDoc, setEditingDoc] = useState<MedicalDocument | null>(null);
  const [editRemarkText, setEditRemarkText] = useState('');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Download notification toast
  const [downloadToast, setDownloadToast] = useState<string | null>(null);

  // Member map helper
  const memberMap = useMemo(() => {
    const map = new Map<string, FamilyMember>();
    members.forEach((m) => map.set(m.id, m));
    return map;
  }, [members]);

  // Categories list
  const categories = ['all', 'Blood Test', 'Lab Report', 'Scan & Imaging', 'Prescription', 'Discharge Summary'];

  // Helper to format date and time nicely
  const formatUploadDateTime = (uploadDateStr?: string, fallbackDate?: string) => {
    const dateToUse = uploadDateStr || fallbackDate;
    if (!dateToUse) return 'Not recorded';
    try {
      const d = new Date(dateToUse);
      if (isNaN(d.getTime())) return dateToUse;
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }) + (uploadDateStr && uploadDateStr.includes('T') ? ` • ${d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}` : '');
    } catch {
      return dateToUse;
    }
  };

  const formatReportDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  // Helper: check if a doc has abnormal lab results
  const hasAbnormalBiomarkers = (doc: MedicalDocument) => {
    return (
      doc.extractedData?.labResults?.some(
        (l) => l.status === 'monitoring' || l.status === 'elevated' || l.status === 'low'
      ) ?? false
    );
  };

  // Filter and Sort Logic
  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      // 1. Member filter
      if (selectedMemberId !== 'all' && doc.memberId !== selectedMemberId) {
        return false;
      }

      // 2. Category filter
      if (selectedCategory !== 'all' && doc.type !== selectedCategory) {
        return false;
      }

      // 3. Only abnormal toggle
      if (onlyAbnormal && !hasAbnormalBiomarkers(doc)) {
        return false;
      }

      // 4. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const member = memberMap.get(doc.memberId);
        const matchTitle = doc.title.toLowerCase().includes(q);
        const matchDoctor = doc.doctor?.toLowerCase().includes(q);
        const matchFacility = doc.facility?.toLowerCase().includes(q);
        const matchType = doc.type.toLowerCase().includes(q);
        const matchMemberName = member?.name?.toLowerCase().includes(q);
        const matchRemarks = doc.remarks?.toLowerCase().includes(q);
        const matchPreview = doc.previewText?.toLowerCase().includes(q);
        const matchSummary = doc.aiSummary?.toLowerCase().includes(q);
        const matchLabs = doc.extractedData?.labResults?.some(
          (l) => l.name.toLowerCase().includes(q) || l.value.toLowerCase().includes(q)
        );

        if (
          !matchTitle &&
          !matchDoctor &&
          !matchFacility &&
          !matchType &&
          !matchMemberName &&
          !matchRemarks &&
          !matchPreview &&
          !matchSummary &&
          !matchLabs
        ) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'upload-desc') {
        const dateA = a.uploadDate || a.date;
        const dateB = b.uploadDate || b.date;
        return new Date(dateB).getTime() - new Date(dateA).getTime();
      }
      if (sortBy === 'upload-asc') {
        const dateA = a.uploadDate || a.date;
        const dateB = b.uploadDate || b.date;
        return new Date(dateA).getTime() - new Date(dateB).getTime();
      }
      if (sortBy === 'date-desc') {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      if (sortBy === 'date-asc') {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      }
      if (sortBy === 'title-asc') {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });
  }, [documents, selectedMemberId, selectedCategory, onlyAbnormal, searchQuery, sortBy, memberMap]);

  // Overall Statistics
  const stats = useMemo(() => {
    const totalDocs = documents.length;
    const labReportsCount = documents.filter((d) => d.type === 'Blood Test' || d.type === 'Lab Report').length;
    const flaggedCount = documents.filter(hasAbnormalBiomarkers).length;
    const membersWithDocs = new Set(documents.map((d) => d.memberId)).size;
    return { totalDocs, labReportsCount, flaggedCount, membersWithDocs };
  }, [documents]);

  const handleOpenEditRemark = (doc: MedicalDocument, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingDoc(doc);
    setEditRemarkText(doc.remarks || doc.extractedData?.summaryNote || doc.aiSummary || '');
  };

  const handleSaveRemark = () => {
    if (!editingDoc) return;
    if (onUpdateDocumentRemarks) {
      onUpdateDocumentRemarks(editingDoc.id, editRemarkText);
    } else {
      editingDoc.remarks = editRemarkText;
    }
    setSaveSuccessMsg('Remark updated successfully');
    setTimeout(() => setSaveSuccessMsg(null), 2500);
    setEditingDoc(null);
  };

  const handleTriggerDownload = (doc: MedicalDocument, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setDownloadToast(`Preparing download for "${doc.title}.${doc.fileType}"...`);
    setTimeout(() => {
      setDownloadToast(null);
    }, 3000);
  };

  // Badge styling helper
  const getTypeBadgeColor = (type: MedicalDocument['type']) => {
    switch (type) {
      case 'Blood Test':
        return 'bg-teal-50 text-teal-800 border-teal-200';
      case 'Lab Report':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'Scan & Imaging':
        return 'bg-indigo-50 text-indigo-800 border-indigo-200';
      case 'Prescription':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'Discharge Summary':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      default:
        return 'bg-slate-50 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {downloadToast && (
        <div className="fixed bottom-20 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 text-xs border border-slate-700 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <Download className="w-4 h-4 text-teal-400 animate-bounce" />
          <span>{downloadToast}</span>
        </div>
      )}

      {/* Success Notification */}
      {saveSuccessMsg && (
        <div className="fixed bottom-20 right-6 z-50 bg-emerald-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 text-xs border border-emerald-700 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* 1. TOP HEADER & SUMMARY METRICS */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                  Lab Reports & Uploaded Documents
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Browse, search, and audit all uploaded diagnostic records, upload timestamps, and clinical remarks.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={onOpenUpload}
              id="upload-record-main-btn"
              className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 active:scale-98 text-white text-xs font-bold rounded-xl transition flex items-center gap-2 shadow-xs"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Document</span>
            </button>
          </div>
        </div>

        {/* METRICS ROW */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-5 mt-5 border-t border-slate-100">
          <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100">
            <span className="text-[11px] font-medium text-slate-500 block">Total Documents</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-black text-slate-900">{stats.totalDocs}</span>
              <span className="text-[11px] text-slate-500 font-medium">files uploaded</span>
            </div>
          </div>

          <div className="p-3 bg-teal-50/50 rounded-xl border border-teal-100/60">
            <span className="text-[11px] font-medium text-teal-700 block">Lab & Blood Panels</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-black text-teal-900">{stats.labReportsCount}</span>
              <span className="text-[11px] text-teal-700 font-medium">investigations</span>
            </div>
          </div>

          <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-100/60">
            <span className="text-[11px] font-medium text-amber-700 block">Flagged Biomarkers</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-black text-amber-900">{stats.flaggedCount}</span>
              <span className="text-[11px] text-amber-700 font-medium">needs attention</span>
            </div>
          </div>

          <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100/60">
            <span className="text-[11px] font-medium text-indigo-700 block">Family Members Covered</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-black text-indigo-900">{stats.membersWithDocs}</span>
              <span className="text-[11px] text-indigo-700 font-medium">of {members.length} members</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. SEARCH, FILTERS & VIEW CONTROLS */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-2xs space-y-4">
        {/* Row 1: Search bar + View mode + Sorting */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* SEARCH INPUT */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              id="lab-reports-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by document title, doctor, facility, biomarker (e.g. HbA1c, TSH), remarks..."
              className="w-full pl-9 pr-8 py-2.5 text-xs bg-slate-50/80 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-md"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* SORT DROPDOWN */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-slate-500 text-[11px] font-medium hidden md:inline">Sort:</span>
              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="bg-transparent font-semibold text-slate-700 focus:outline-none cursor-pointer text-xs"
              >
                <option value="upload-desc">Upload Date: Newest First</option>
                <option value="upload-asc">Upload Date: Oldest First</option>
                <option value="date-desc">Report Date: Newest First</option>
                <option value="date-asc">Report Date: Oldest First</option>
                <option value="title-asc">Document Name (A-Z)</option>
              </select>
            </div>

            {/* VIEW MODE TOGGLE (Grid vs Table) */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition ${
                  viewMode === 'grid'
                    ? 'bg-white text-teal-700 shadow-xs font-bold'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
                title="Grid Card View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition ${
                  viewMode === 'table'
                    ? 'bg-white text-teal-700 shadow-xs font-bold'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
                title="Table Ledger View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Row 2: Family Member Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex-shrink-0 mr-1 flex items-center gap-1">
            <User className="w-3.5 h-3.5" /> Member:
          </span>
          <button
            onClick={() => setSelectedMemberId('all')}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
              selectedMemberId === 'all'
                ? 'bg-teal-600 text-white border-teal-600 shadow-2xs'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span>All Family</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
              selectedMemberId === 'all' ? 'bg-teal-700 text-white' : 'bg-slate-100 text-slate-600'
            }`}>
              {documents.length}
            </span>
          </button>

          {members.map((member) => {
            const memberDocCount = documents.filter((d) => d.memberId === member.id).length;
            const isSelected = selectedMemberId === member.id;
            return (
              <button
                key={member.id}
                onClick={() => setSelectedMemberId(member.id)}
                className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-teal-600 text-white border-teal-600 shadow-2xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <img
                  src={member.avatar}
                  alt={member.name}
                  referrerPolicy="no-referrer"
                  className="w-4 h-4 rounded-full object-cover border border-white/40"
                />
                <span>{member.name.split(' ')[0]}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isSelected ? 'bg-teal-700 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  {memberDocCount}
                </span>
              </button>
            );
          })}
        </div>

        {/* Row 3: Category & Abnormal Status Filters */}
        <div className="flex items-center justify-between gap-2 flex-wrap pt-2 border-t border-slate-100 text-xs">
          {/* Categories */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex-shrink-0 mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Type:
            </span>
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                    isSelected
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {cat === 'all' ? 'All Types' : cat}
                </button>
              );
            })}
          </div>

          {/* Quick toggle for abnormal */}
          <button
            onClick={() => setOnlyAbnormal(!onlyAbnormal)}
            className={`px-2.5 py-1 rounded-lg border text-xs font-semibold transition flex items-center gap-1.5 ${
              onlyAbnormal
                ? 'bg-amber-100 border-amber-300 text-amber-900'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
            <span>Abnormal Values Only</span>
            {onlyAbnormal && <Check className="w-3 h-3 text-amber-800" />}
          </button>
        </div>
      </div>

      {/* 3. DOCUMENT LISTING / GRID */}
      {filteredDocuments.length === 0 ? (
        /* ZERO-STATE */
        <div className="bg-white rounded-2xl border border-slate-200/90 p-12 text-center shadow-2xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">No medical records found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {searchQuery
              ? `No documents matching "${searchQuery}" with the selected filters.`
              : 'No documents match the selected filters.'}
          </p>
          <div className="flex items-center justify-center gap-2 pt-2">
            {(searchQuery || selectedCategory !== 'all' || selectedMemberId !== 'all' || onlyAbnormal) && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setSelectedMemberId('all');
                  setOnlyAbnormal(false);
                }}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
              >
                Clear all filters
              </button>
            )}
            <button
              onClick={onOpenUpload}
              className="px-3.5 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition flex items-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5" />
              Upload New Record
            </button>
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID CARDS VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {filteredDocuments.map((doc) => {
            const member = memberMap.get(doc.memberId);
            const isAbnormal = hasAbnormalBiomarkers(doc);
            const labCount = doc.extractedData?.labResults?.length || 0;

            return (
              <div
                key={doc.id}
                className="bg-white rounded-2xl border border-slate-200/90 hover:border-slate-300 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between overflow-hidden group"
              >
                <div className="p-5 space-y-4">
                  {/* Top Bar: Type Badge + Patient Tag + File Format */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold border ${getTypeBadgeColor(
                          doc.type
                        )}`}
                      >
                        {doc.type}
                      </span>
                      <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                        {doc.fileType.toUpperCase()} • {doc.fileSize}
                      </span>
                    </div>

                    {/* Patient attribution pill */}
                    {member && (
                      <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/80 px-2 py-0.5 rounded-full">
                        <img
                          src={member.avatar}
                          alt={member.name}
                          referrerPolicy="no-referrer"
                          className="w-4 h-4 rounded-full object-cover"
                        />
                        <span className="text-[11px] font-semibold text-slate-700">
                          {member.name}
                        </span>
                        <span className="text-[10px] text-slate-400">({member.relationship})</span>
                      </div>
                    )}
                  </div>

                  {/* Title & Preview */}
                  <div>
                    <h3
                      onClick={() => onViewReport(doc)}
                      className="font-bold text-slate-900 text-base group-hover:text-teal-700 transition cursor-pointer"
                    >
                      {doc.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {doc.previewText || doc.aiSummary || 'Medical report record extracted and indexed.'}
                    </p>
                  </div>

                  {/* UPLOAD DATE & REPORT DATE ROW */}
                  <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-700">
                      <Clock className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
                      <span className="text-slate-500 font-medium">Uploaded:</span>
                      <span className="font-semibold text-slate-900">
                        {formatUploadDateTime(doc.uploadDate, doc.date)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-slate-700 sm:border-l sm:border-slate-200 sm:pl-3">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span className="text-slate-500 font-medium">Report Date:</span>
                      <span className="font-semibold text-slate-800">
                        {formatReportDate(doc.date)}
                      </span>
                    </div>
                  </div>

                  {/* DOCTOR & FACILITY */}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <Stethoscope className="w-3.5 h-3.5 text-slate-400" />
                      <span>{doc.doctor || 'Attending Physician'}</span>
                    </div>
                    <span className="text-slate-300">•</span>
                    <div className="flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate max-w-[200px]">{doc.facility || 'Diagnostic Center'}</span>
                    </div>
                  </div>

                  {/* REMARKS & INFORMATION SECTION */}
                  <div className="p-3 bg-teal-50/40 rounded-xl border border-teal-100/70 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-teal-900">
                        <MessageSquare className="w-3.5 h-3.5 text-teal-700" />
                        <span>Remarks & Clinical Information</span>
                      </div>
                      <button
                        onClick={(e) => handleOpenEditRemark(doc, e)}
                        className="text-[11px] text-teal-700 hover:text-teal-900 font-semibold flex items-center gap-1 hover:underline cursor-pointer"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Edit Note</span>
                      </button>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed italic">
                      "{doc.remarks || doc.extractedData?.summaryNote || doc.aiSummary || 'No specific remarks recorded.'}"
                    </p>
                  </div>

                  {/* EXTRACTED BIOMARKERS CHIPS (if any) */}
                  {labCount > 0 && (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
                        <span>Extracted Lab Values ({labCount})</span>
                        {isAbnormal && (
                          <span className="text-amber-700 font-bold flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> Action advised
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {doc.extractedData.labResults.slice(0, 4).map((lab, idx) => (
                          <span
                            key={idx}
                            className={`text-[11px] px-2 py-0.5 rounded-lg border font-medium flex items-center gap-1 ${
                              lab.status === 'normal'
                                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                                : 'bg-amber-50/80 border-amber-200 text-amber-900 font-bold'
                            }`}
                          >
                            <span>{lab.name}:</span>
                            <span className="font-bold">{lab.value}</span>
                          </span>
                        ))}
                        {labCount > 4 && (
                          <span className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600 font-medium self-center">
                            +{labCount - 4} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Action Footer */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onViewReport(doc)}
                      className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Full Report</span>
                    </button>

                    {member && (
                      <button
                        onClick={() =>
                          onOpenAIAssistant(
                            member,
                            `Explain the findings and remarks in the "${doc.title}" test from ${doc.date}.`
                          )
                        }
                        className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition flex items-center gap-1.5"
                        title="Analyze with AI"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                        <span className="hidden sm:inline">Ask AI</span>
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => handleTriggerDownload(doc, e)}
                      className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded-lg transition"
                      title="Download document copy"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE / LEDGER VIEW */
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <tr>
                  <th className="p-3.5">Document</th>
                  <th className="p-3.5">Patient</th>
                  <th className="p-3.5">Upload Timestamp</th>
                  <th className="p-3.5">Report Date</th>
                  <th className="p-3.5">Doctor & Lab</th>
                  <th className="p-3.5">Remarks & Information</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDocuments.map((doc) => {
                  const member = memberMap.get(doc.memberId);
                  const isAbnormal = hasAbnormalBiomarkers(doc);

                  return (
                    <tr
                      key={doc.id}
                      onClick={() => onViewReport(doc)}
                      className="hover:bg-slate-50/70 transition cursor-pointer group"
                    >
                      {/* Document Name & Type */}
                      <td className="p-3.5">
                        <div className="flex items-start gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">
                            {doc.fileType.toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 group-hover:text-teal-700 transition block">
                              {doc.title}
                            </span>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span
                                className={`text-[10px] px-2 py-0.2 rounded-full font-semibold border ${getTypeBadgeColor(
                                  doc.type
                                )}`}
                              >
                                {doc.type}
                              </span>
                              <span className="text-[10px] text-slate-400">{doc.fileSize}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Patient */}
                      <td className="p-3.5 whitespace-nowrap">
                        {member ? (
                          <div className="flex items-center gap-2">
                            <img
                              src={member.avatar}
                              alt={member.name}
                              referrerPolicy="no-referrer"
                              className="w-5 h-5 rounded-full object-cover"
                            />
                            <div>
                              <span className="font-semibold text-slate-800 block">
                                {member.name}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {member.relationship}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      {/* Upload Date & Time */}
                      <td className="p-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-slate-800 font-semibold">
                          <Clock className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
                          <span>{formatUploadDateTime(doc.uploadDate, doc.date)}</span>
                        </div>
                      </td>

                      {/* Report Clinical Date */}
                      <td className="p-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{formatReportDate(doc.date)}</span>
                        </div>
                      </td>

                      {/* Doctor & Lab */}
                      <td className="p-3.5">
                        <span className="font-medium text-slate-800 block truncate max-w-[140px]">
                          {doc.doctor || 'Attending Physician'}
                        </span>
                        <span className="text-[11px] text-slate-400 block truncate max-w-[140px]">
                          {doc.facility || 'Facility'}
                        </span>
                      </td>

                      {/* Remarks */}
                      <td className="p-3.5 max-w-xs">
                        <div className="flex items-start gap-1.5">
                          <p className="text-[11px] text-slate-600 line-clamp-2 italic">
                            "{doc.remarks || doc.extractedData?.summaryNote || doc.aiSummary || '—'}"
                          </p>
                          <button
                            onClick={(e) => handleOpenEditRemark(doc, e)}
                            className="p-1 text-slate-400 hover:text-teal-700 transition"
                            title="Edit remark"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                        </div>
                        {isAbnormal && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded mt-1">
                            <AlertCircle className="w-2.5 h-2.5" /> Flagged biomarker
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 text-right whitespace-nowrap">
                        <div
                          className="flex items-center justify-end gap-1.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => onViewReport(doc)}
                            className="px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-lg text-xs font-bold transition flex items-center gap-1"
                          >
                            <Eye className="w-3 h-3" />
                            <span>View</span>
                          </button>
                          <button
                            onClick={(e) => handleTriggerDownload(doc, e)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                            title="Download"
                          >
                            <Download className="w-3.5 h-3.5" />
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

      {/* 4. MODAL FOR EDITING REMARKS / NOTES */}
      {editingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Edit Document Remarks</h3>
                  <p className="text-[11px] text-slate-500 truncate max-w-[260px]">
                    {editingDoc.title}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingDoc(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Clinical Remarks / Doctor's Advice / Personal Notes:
                </label>
                <textarea
                  rows={4}
                  value={editRemarkText}
                  onChange={(e) => setEditRemarkText(e.target.value)}
                  placeholder="Enter remarks, doctor's recommendations, prescription reminders, or clinical observations..."
                  className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-xs text-slate-800 leading-relaxed"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-500 space-y-1">
                <div className="flex justify-between">
                  <span>Upload Date:</span>
                  <span className="font-medium text-slate-700">
                    {formatUploadDateTime(editingDoc.uploadDate, editingDoc.date)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Attending Doctor:</span>
                  <span className="font-medium text-slate-700">{editingDoc.doctor}</span>
                </div>
                <div className="flex justify-between">
                  <span>Facility:</span>
                  <span className="font-medium text-slate-700">{editingDoc.facility}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setEditingDoc(null)}
                className="px-4 py-2 font-semibold text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveRemark}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-xs transition"
              >
                Save Remarks
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
