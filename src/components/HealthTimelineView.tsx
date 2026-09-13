import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Clock,
  Activity,
  Sparkles,
  Stethoscope,
  Pill,
  Scissors,
  FileText,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Filter,
  Search,
  Plus,
  Printer,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  HeartPulse,
  Eye,
  ShieldCheck,
  Hospital,
  User,
  Users,
  Award,
  BookOpen,
  X,
  Sparkle,
  Info,
  Check,
  Star,
  Layers,
} from 'lucide-react';
import {
  FamilyMember,
  TimelineEvent,
  MedicalDocument,
  MedicalCondition,
  Medication,
  Doctor,
  Family,
} from '../types';
import { UserAvatar } from './UserAvatar';

interface HealthTimelineViewProps {
  members: FamilyMember[];
  activeMember: FamilyMember;
  onSelectMember: (member: FamilyMember) => void;
  timeline: TimelineEvent[];
  documents: MedicalDocument[];
  conditions: MedicalCondition[];
  medications: Medication[];
  doctors: Doctor[];
  family: Family;
  onViewReport: (doc: MedicalDocument) => void;
  onOpenAIAssistant: (query?: string) => void;
  onAddTimelineEvent: (event: Partial<TimelineEvent>) => void;
  onOpenUpload: () => void;
}

type EventCategoryFilter =
  | 'all'
  | 'surgery'
  | 'diagnosis'
  | 'lab_test'
  | 'medication_change'
  | 'consultation'
  | 'milestone'
  | 'investigation';

type ViewLayout = 'timeline' | 'table';

export const HealthTimelineView: React.FC<HealthTimelineViewProps> = ({
  members,
  activeMember,
  onSelectMember,
  timeline,
  documents,
  conditions,
  medications,
  doctors,
  family,
  onViewReport,
  onOpenAIAssistant,
  onAddTimelineEvent,
  onOpenUpload,
}) => {
  // Member scope: 'all' for whole family, or specific member ID
  const [selectedMemberId, setSelectedMemberId] = useState<string>(activeMember.id);
  const [selectedCategory, setSelectedCategory] = useState<EventCategoryFilter>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [viewLayout, setViewLayout] = useState<ViewLayout>('timeline');
  const [onlyMajorMilestones, setOnlyMajorMilestones] = useState<boolean>(false);
  const [showSummaryCard, setShowSummaryCard] = useState<boolean>(true);

  // Add Milestone Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newEventData, setNewEventData] = useState<{
    memberId: string;
    title: string;
    date: string;
    eventType: TimelineEvent['eventType'];
    doctor: string;
    facility: string;
    description: string;
    healthImpact: string;
    biomarkerLabel: string;
    biomarkerFrom: string;
    biomarkerTo: string;
    notes: string;
    relatedDocId: string;
  }>({
    memberId: activeMember.id,
    title: '',
    date: new Date().toISOString().split('T')[0],
    eventType: 'consultation',
    doctor: '',
    facility: '',
    description: '',
    healthImpact: '',
    biomarkerLabel: '',
    biomarkerFrom: '',
    biomarkerTo: '',
    notes: '',
    relatedDocId: '',
  });

  // Current active target member object if single member selected
  const currentScopedMember = members.find((m) => m.id === selectedMemberId);

  // Helper to find member by ID
  const getMemberById = (id: string) => members.find((m) => m.id === id);

  // Is an event considered a major clinical milestone?
  const isMajorEvent = (evt: TimelineEvent) => {
    return (
      evt.eventType === 'surgery' ||
      evt.eventType === 'diagnosis' ||
      evt.eventType === 'milestone' ||
      Boolean(evt.biomarkerChange) ||
      evt.title.toLowerCase().includes('breakthrough') ||
      evt.title.toLowerCase().includes('replacement') ||
      evt.title.toLowerCase().includes('clearance')
    );
  };

  // Filtered timeline events
  const filteredEvents = useMemo(() => {
    return timeline
      .filter((evt) => {
        // Member filter
        if (selectedMemberId !== 'all' && evt.memberId !== selectedMemberId) {
          return false;
        }
        // Major milestones toggle
        if (onlyMajorMilestones && !isMajorEvent(evt)) {
          return false;
        }
        // Category filter
        if (selectedCategory !== 'all' && evt.eventType !== selectedCategory) {
          return false;
        }
        // Year filter
        if (selectedYear !== 'all' && String(evt.year) !== selectedYear) {
          return false;
        }
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = evt.title.toLowerCase().includes(q);
          const matchDesc = evt.description.toLowerCase().includes(q);
          const matchDoc = (evt.doctor || '').toLowerCase().includes(q);
          const matchFac = (evt.facility || '').toLowerCase().includes(q);
          const matchTreat = (evt.treatment || '').toLowerCase().includes(q);
          const matchNotes = (evt.notes || '').toLowerCase().includes(q);
          const matchImpact = (evt.healthImpact || '').toLowerCase().includes(q);
          return (
            matchTitle ||
            matchDesc ||
            matchDoc ||
            matchFac ||
            matchTreat ||
            matchNotes ||
            matchImpact
          );
        }
        return true;
      })
      .sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
      });
  }, [
    timeline,
    selectedMemberId,
    onlyMajorMilestones,
    selectedCategory,
    selectedYear,
    searchQuery,
    sortOrder,
  ]);

  // Group events by Year for intuitive scanning
  const eventsByYear = useMemo(() => {
    const groups: { [year: string]: TimelineEvent[] } = {};
    filteredEvents.forEach((evt) => {
      const yr = String(evt.year);
      if (!groups[yr]) {
        groups[yr] = [];
      }
      groups[yr].push(evt);
    });
    // Return array of [year, events[]] sorted according to current sortOrder
    const sortedYears = Object.keys(groups).sort((a, b) => {
      const numA = Number(a);
      const numB = Number(b);
      return sortOrder === 'newest' ? numB - numA : numA - numB;
    });
    return sortedYears.map((yr) => ({
      year: yr,
      events: groups[yr],
    }));
  }, [filteredEvents, sortOrder]);

  // Available years from dataset for current member scope
  const availableYears = useMemo(() => {
    const relevantEvents =
      selectedMemberId === 'all'
        ? timeline
        : timeline.filter((e) => e.memberId === selectedMemberId);
    const yrs = Array.from(new Set<number>(relevantEvents.map((e) => Number(e.year)))).sort(
      (a, b) => b - a
    );
    return yrs;
  }, [timeline, selectedMemberId]);

  // Plain-English Quick Summary points for the active member
  const memberSummaries: Record<
    string,
    { title: string; badge: string; points: { year: string; text: string; icon: string }[] }
  > = {
    'mem-rajesh': {
      title: 'Rajesh Sharma • 9-Year Health Arc',
      badge: 'Well-Managed & Stable',
      points: [
        {
          year: '2017',
          text: 'Curative gallbladder excision (cholecystectomy) completely resolved acute abdominal attacks.',
          icon: 'surgical',
        },
        {
          year: '2019',
          text: 'Type 2 Diabetes identified via corporate health check; started Metformin & dietary lifestyle changes.',
          icon: 'diagnosis',
        },
        {
          year: '2021',
          text: 'Stage 1 Hypertension detected; blood pressure successfully stabilized with daily Telmisartan.',
          icon: 'diagnosis',
        },
        {
          year: '2023',
          text: 'Left Knee Replacement surgery restored pain-free mobility; completed full physical therapy rehab.',
          icon: 'surgical',
        },
        {
          year: '2026',
          text: 'Optimal glycemic control achieved: HbA1c dropped to 6.9%, crossing below the target 7.0% goal.',
          icon: 'milestone',
        },
      ],
    },
    'mem-sunita': {
      title: 'Sunita Sharma • Endocrine & Preventive Arc',
      badge: 'Euthyroid & Screened Clear',
      points: [
        {
          year: '2022',
          text: 'Subclinical hypothyroidism identified and stabilized on daily morning Levothyroxine.',
          icon: 'diagnosis',
        },
        {
          year: '2024',
          text: 'DEXA scan detected mild lumbar osteopenia; initiated Vitamin D3 & Calcium supplementation.',
          icon: 'diagnosis',
        },
        {
          year: '2026',
          text: 'Annual screening mammogram confirmed BIRADS 1 (clear/normal) and thyroid levels remain optimal.',
          icon: 'milestone',
        },
      ],
    },
    'mem-meera': {
      title: 'Meera Sharma • Senior Wellness & Bone Health Arc',
      badge: 'Protected & Vigilant',
      points: [
        {
          year: '2020',
          text: 'Early primary open-angle glaucoma detected; Timolol eye drops successfully lowered eye pressure to 16 mmHg.',
          icon: 'diagnosis',
        },
        {
          year: '2021',
          text: 'Osteoporosis diagnosed after DEXA scan; weekly Alendronate started with zero fall incidents since.',
          icon: 'milestone',
        },
        {
          year: '2025',
          text: 'Cataract evaluation showed mild lens changes managed conservatively without surgical need yet.',
          icon: 'consultation',
        },
      ],
    },
    'mem-aarav': {
      title: 'Aarav Sharma • Collegiate Athletics Arc',
      badge: 'Peak Athletic Fitness',
      points: [
        {
          year: '2024',
          text: 'Grade II right ankle sprain sustained during basketball; completed 6-week sports physical therapy.',
          icon: 'milestone',
        },
        {
          year: '2026',
          text: 'Pre-participation sports cardiovascular clearance approved with athletic resting heart rate (54 bpm).',
          icon: 'milestone',
        },
      ],
    },
    all: {
      title: 'Family Health Journey • 2017 to Present',
      badge: '9 Years of Continuous Care',
      points: [
        {
          year: '2017 – 2020',
          text: 'Baseline Diagnoses & Curative Surgery: Rajesh’s gallbladder procedure and early detection of diabetes.',
          icon: 'surgical',
        },
        {
          year: '2021 – 2024',
          text: 'Chronic Stabilization & Orthopedic Care: Knee replacement surgery, blood pressure management, and bone support.',
          icon: 'diagnosis',
        },
        {
          year: '2025 – 2026',
          text: 'Precision Targets Achieved: Rajesh’s HbA1c reached 6.9%, Sunita’s thyroid normalized, all screenings up to date.',
          icon: 'milestone',
        },
      ],
    },
  };

  const activeSummary =
    memberSummaries[selectedMemberId] || memberSummaries['all'];

  // Helper: Visual styling for event types
  const getEventBadge = (type: TimelineEvent['eventType']) => {
    switch (type) {
      case 'surgery':
        return {
          label: 'Surgery & Procedure',
          shortLabel: 'Surgery',
          icon: Scissors,
          badgeBg: 'bg-rose-100 text-rose-800 border-rose-200',
          pillBg: 'bg-rose-50 border-rose-200 text-rose-700',
          nodeBorder: 'border-rose-500',
          dotBg: 'bg-rose-600',
        };
      case 'diagnosis':
        return {
          label: 'Diagnosis',
          shortLabel: 'Diagnosis',
          icon: AlertCircle,
          badgeBg: 'bg-purple-100 text-purple-800 border-purple-200',
          pillBg: 'bg-purple-50 border-purple-200 text-purple-700',
          nodeBorder: 'border-purple-500',
          dotBg: 'bg-purple-600',
        };
      case 'lab_test':
        return {
          label: 'Lab & Test Result',
          shortLabel: 'Lab Test',
          icon: Activity,
          badgeBg: 'bg-teal-100 text-teal-800 border-teal-200',
          pillBg: 'bg-teal-50 border-teal-200 text-teal-700',
          nodeBorder: 'border-teal-500',
          dotBg: 'bg-teal-600',
        };
      case 'medication_change':
        return {
          label: 'Medicine Adjustment',
          shortLabel: 'Medicine',
          icon: Pill,
          badgeBg: 'bg-amber-100 text-amber-800 border-amber-200',
          pillBg: 'bg-amber-50 border-amber-200 text-amber-700',
          nodeBorder: 'border-amber-500',
          dotBg: 'bg-amber-600',
        };
      case 'consultation':
        return {
          label: 'Doctor Consultation',
          shortLabel: 'Doctor Visit',
          icon: Stethoscope,
          badgeBg: 'bg-blue-100 text-blue-800 border-blue-200',
          pillBg: 'bg-blue-50 border-blue-200 text-blue-700',
          nodeBorder: 'border-blue-500',
          dotBg: 'bg-blue-600',
        };
      case 'milestone':
        return {
          label: 'Health Milestone',
          shortLabel: 'Milestone',
          icon: Award,
          badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          pillBg: 'bg-emerald-50 border-emerald-200 text-emerald-700',
          nodeBorder: 'border-emerald-500',
          dotBg: 'bg-emerald-600',
        };
      case 'investigation':
        return {
          label: 'Imaging & Screening',
          shortLabel: 'Imaging',
          icon: Eye,
          badgeBg: 'bg-sky-100 text-sky-800 border-sky-200',
          pillBg: 'bg-sky-50 border-sky-200 text-sky-700',
          nodeBorder: 'border-sky-500',
          dotBg: 'bg-sky-600',
        };
      default:
        return {
          label: 'Medical Record',
          shortLabel: 'Record',
          icon: FileText,
          badgeBg: 'bg-slate-100 text-slate-800 border-slate-200',
          pillBg: 'bg-slate-50 border-slate-200 text-slate-700',
          nodeBorder: 'border-slate-500',
          dotBg: 'bg-slate-600',
        };
    }
  };

  const handleCreateMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventData.title.trim()) return;

    const eventDate = new Date(newEventData.date);
    const yr = eventDate.getFullYear() || new Date().getFullYear();
    const mo = eventDate.toLocaleString('default', { month: 'long' }) || 'September';

    const createdEvent: Partial<TimelineEvent> = {
      memberId: newEventData.memberId,
      title: newEventData.title.trim(),
      date: newEventData.date,
      year: yr,
      month: mo,
      eventType: newEventData.eventType,
      doctor: newEventData.doctor.trim() || undefined,
      facility: newEventData.facility.trim() || undefined,
      description: newEventData.description.trim() || 'Health milestone recorded.',
      healthImpact: newEventData.healthImpact.trim() || undefined,
      notes: newEventData.notes.trim() || undefined,
      relatedDocId: newEventData.relatedDocId || undefined,
      biomarkerChange:
        newEventData.biomarkerLabel && newEventData.biomarkerTo
          ? {
              label: newEventData.biomarkerLabel,
              from: newEventData.biomarkerFrom || 'Baseline',
              to: newEventData.biomarkerTo,
              trend: 'improved',
            }
          : undefined,
    };

    onAddTimelineEvent(createdEvent);
    setIsAddModalOpen(false);

    // Reset form
    setNewEventData({
      memberId: activeMember.id,
      title: '',
      date: new Date().toISOString().split('T')[0],
      eventType: 'consultation',
      doctor: '',
      facility: '',
      description: '',
      healthImpact: '',
      biomarkerLabel: '',
      biomarkerFrom: '',
      biomarkerTo: '',
      notes: '',
      relatedDocId: '',
    });
  };

  const totalEventCount = timeline.filter((e) =>
    selectedMemberId === 'all' ? true : e.memberId === selectedMemberId
  ).length;

  const majorEventCount = timeline.filter(
    (e) => (selectedMemberId === 'all' ? true : e.memberId === selectedMemberId) && isMajorEvent(e)
  ).length;

  return (
    <div id="health-timeline-container" className="space-y-6 pb-12 max-w-7xl mx-auto">
      {/* 1. SIMPLE, CLEAR HEADER */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold">
                <Calendar className="w-3.5 h-3.5 text-teal-600" />
                <span>Health History Timeline</span>
              </span>
              <span className="text-xs text-slate-500 font-medium">
                2017 – 2026 ({availableYears.length} Years Documented)
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              {selectedMemberId === 'all'
                ? 'Complete Family Health History'
                : `${currentScopedMember?.name}’s Medical Story & Milestones`}
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
              A clear chronological record of health events, surgeries, diagnoses, test results,
              and doctor visits. Click on any event to see medical notes or attached reports.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              id="open-add-milestone-btn"
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Log Milestone</span>
            </button>

            <button
              id="ask-ai-history-btn"
              onClick={() => {
                const prompt =
                  selectedMemberId === 'all'
                    ? 'Please summarize our entire family medical history timeline in plain, easy-to-understand English. What are the key surgeries, diagnoses, and current items to monitor?'
                    : `Please explain ${currentScopedMember?.name}’s medical history timeline in simple, everyday language. Highlight the most important surgeries, diagnoses, and current health improvements.`;
                onOpenAIAssistant(prompt);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold border border-slate-200 transition cursor-pointer"
            >
              <Sparkle className="w-3.5 h-3.5 text-amber-500" />
              <span>Explain in Plain English</span>
            </button>

            <button
              id="print-timeline-btn"
              onClick={() => window.print()}
              title="Print timeline"
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs border border-slate-200 transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 2. FAMILY MEMBER SELECTOR BAR */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-500 mr-1">View person:</span>

            <button
              id="tab-member-all"
              onClick={() => {
                setSelectedMemberId('all');
              }}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                selectedMemberId === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>All Family</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                  selectedMemberId === 'all'
                    ? 'bg-slate-800 text-teal-300'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {timeline.length}
              </span>
            </button>

            {members.map((m) => {
              const count = timeline.filter((e) => e.memberId === m.id).length;
              const isSelected = selectedMemberId === m.id;
              return (
                <button
                  key={m.id}
                  id={`tab-member-${m.id}`}
                  onClick={() => {
                    setSelectedMemberId(m.id);
                    onSelectMember(m);
                  }}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    isSelected
                      ? 'bg-teal-700 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <UserAvatar avatar={m.avatar} name={m.name} size="xs" />
                  <span>{m.name}</span>
                  <span className="text-[11px] opacity-75 font-normal">({m.relationship})</span>
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

          {/* Layout Mode Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
            <button
              onClick={() => setViewLayout('timeline')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                viewLayout === 'timeline'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-teal-600" />
              <span>Timeline View</span>
            </button>
            <button
              onClick={() => setViewLayout('table')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                viewLayout === 'table'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              <span>Summary Table</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. "AT A GLANCE" SUMMARY CARD (MAKES TIMELINE IMMEDIATELY UNDERSTANDABLE) */}
      {showSummaryCard && (
        <div className="bg-gradient-to-br from-teal-900 via-slate-900 to-slate-900 rounded-2xl p-5 sm:p-6 text-white shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-teal-500/20 text-teal-300 flex items-center justify-center border border-teal-500/30">
                  <Star className="w-4 h-4 fill-teal-300" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm sm:text-base">
                    {activeSummary.title}
                  </h3>
                  <p className="text-xs text-slate-300">
                    The big-picture story summarized in plain English
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-teal-300 bg-teal-500/20 border border-teal-400/30 px-2.5 py-1 rounded-full">
                  {activeSummary.badge}
                </span>
                <button
                  onClick={() => setShowSummaryCard(false)}
                  className="text-slate-400 hover:text-white text-xs p-1"
                  title="Hide summary card"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Stepper / Story points */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3 pt-1">
              {activeSummary.points.map((pt, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-white/10 border border-white/10 backdrop-blur-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-amber-300">{pt.year}</span>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                      Step {idx + 1}
                    </span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed font-medium">{pt.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. EASY FILTER & SEARCH CONTROLS */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
        {/* Row 1: Search & Major Events Toggle & Year Pills */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search surgeries, diagnoses, doctors, medicines, or results..."
              className="w-full pl-9 pr-8 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50/50"
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

          {/* Major Milestones Only Toggle */}
          <button
            onClick={() => setOnlyMajorMilestones(!onlyMajorMilestones)}
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer border ${
              onlyMajorMilestones
                ? 'bg-amber-50 border-amber-300 text-amber-900 shadow-2xs ring-1 ring-amber-400/40'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Star
              className={`w-3.5 h-3.5 ${
                onlyMajorMilestones ? 'text-amber-500 fill-amber-400' : 'text-slate-400'
              }`}
            />
            <span>Major Milestones Only</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                onlyMajorMilestones ? 'bg-amber-200 text-amber-900' : 'bg-slate-200 text-slate-600'
              }`}
            >
              {majorEventCount}
            </span>
          </button>

          {/* Sort Order Toggle */}
          <button
            onClick={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 shrink-0 cursor-pointer"
          >
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>{sortOrder === 'newest' ? 'Newest to Oldest' : 'Oldest to Newest'}</span>
          </button>
        </div>

        {/* Row 2: Year Quick Jump & Category Filters */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
          {/* Year selector pills */}
          <div className="flex items-center gap-1 overflow-x-auto py-0.5">
            <span className="text-slate-500 font-bold text-[11px] mr-1">Year:</span>
            <button
              onClick={() => setSelectedYear('all')}
              className={`px-2.5 py-1 rounded-lg font-bold text-xs transition cursor-pointer ${
                selectedYear === 'all'
                  ? 'bg-teal-700 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              All Years
            </button>
            {availableYears.map((yr) => (
              <button
                key={yr}
                onClick={() => setSelectedYear(String(yr))}
                className={`px-2.5 py-1 rounded-lg font-bold text-xs transition cursor-pointer ${
                  selectedYear === String(yr)
                    ? 'bg-teal-700 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {yr}
              </button>
            ))}
          </div>

          {/* Category filter pills */}
          <div className="flex items-center gap-1 overflow-x-auto py-0.5">
            <span className="text-slate-500 font-bold text-[11px] mr-1">Type:</span>
            {[
              { id: 'all', label: 'All' },
              { id: 'surgery', label: 'Surgeries', icon: Scissors },
              { id: 'diagnosis', label: 'Diagnoses', icon: AlertCircle },
              { id: 'lab_test', label: 'Labs', icon: Activity },
              { id: 'medication_change', label: 'Medicines', icon: Pill },
              { id: 'consultation', label: 'Visits', icon: Stethoscope },
            ].map((cat) => {
              const isCatSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id as EventCategoryFilter)}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold text-xs transition cursor-pointer ${
                    isCatSelected
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {cat.icon && <cat.icon className="w-3 h-3" />}
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 5. MAIN CONTENT DISPLAY: TIMELINE VS TABLE */}
      {viewLayout === 'timeline' ? (
        /* 5A. YEAR-GROUPED INTUITIVE TIMELINE */
        <div className="space-y-8">
          {filteredEvents.length === 0 ? (
            <div className="p-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200 space-y-3">
              <Activity className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="font-bold text-slate-800 text-base">No health events found</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                No events matched your current filters. Try changing years, resetting the search,
                or turning off "Major Milestones Only".
              </p>
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedYear('all');
                  setOnlyMajorMilestones(false);
                  setSearchQuery('');
                }}
                className="px-4 py-2 bg-teal-700 text-white text-xs font-bold rounded-xl hover:bg-teal-800 transition cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            eventsByYear.map((yearGroup) => (
              <div key={yearGroup.year} className="space-y-4">
                {/* Year Header Divider */}
                <div className="flex items-center gap-3">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900 text-white font-extrabold text-sm shadow-xs">
                    <Calendar className="w-4 h-4 text-teal-400" />
                    <span>Year {yearGroup.year}</span>
                  </div>
                  <span className="text-xs font-semibold text-slate-500">
                    {yearGroup.events.length} event{yearGroup.events.length > 1 ? 's' : ''} recorded
                  </span>
                  <div className="flex-1 h-px bg-slate-200" />
                </div>

                {/* Vertical Timeline Stack for this Year */}
                <div className="relative pl-6 sm:pl-8 space-y-4 before:absolute before:left-2.5 sm:before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
                  {yearGroup.events.map((evt) => {
                    const member = getMemberById(evt.memberId);
                    const badge = getEventBadge(evt.eventType);
                    const IconComponent = badge.icon;
                    const linkedDoc = evt.relatedDocId
                      ? documents.find((d) => d.id === evt.relatedDocId)
                      : null;

                    return (
                      <div key={evt.id} id={`timeline-card-${evt.id}`} className="relative group">
                        {/* Node icon on vertical line */}
                        <div
                          className={`absolute -left-[27px] sm:-left-[31px] top-4 w-6 h-6 rounded-full bg-white border-2 flex items-center justify-center shadow-xs transition-transform group-hover:scale-110 ${badge.nodeBorder}`}
                        >
                          <div className={`w-2 h-2 rounded-full ${badge.dotBg}`} />
                        </div>

                        {/* Event Card */}
                        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-teal-300 transition duration-150 space-y-3">
                          {/* Top Row: Category Tag, Member Name, Date */}
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex flex-wrap items-center gap-2">
                              {/* Category Badge */}
                              <span
                                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-bold border ${badge.badgeBg}`}
                              >
                                <IconComponent className="w-3.5 h-3.5" />
                                <span>{badge.label}</span>
                              </span>

                              {/* Family Member Tag (visible when viewing all family) */}
                              {selectedMemberId === 'all' && member && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200">
                                  <User className="w-3 h-3 text-slate-500" />
                                  <span>{member.name}</span>
                                  <span className="text-[10px] text-slate-400 font-normal">
                                    ({member.relationship})
                                  </span>
                                </span>
                              )}

                              {isMajorEvent(evt) && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-bold">
                                  <Star className="w-3 h-3 text-amber-500 fill-amber-400" />
                                  <span>Key Milestone</span>
                                </span>
                              )}
                            </div>

                            {/* Exact Date */}
                            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-slate-100/80 px-2.5 py-1 rounded-lg">
                              <Calendar className="w-3.5 h-3.5 text-teal-600" />
                              <span>
                                {evt.month} {evt.date.split('-')[2] || ''}, {evt.year}
                              </span>
                            </div>
                          </div>

                          {/* Event Title & Plain Description */}
                          <div>
                            <h3 className="font-extrabold text-slate-900 text-base sm:text-lg group-hover:text-teal-900 transition">
                              {evt.title}
                            </h3>
                            <p className="text-xs sm:text-sm text-slate-700 mt-1 leading-relaxed">
                              {evt.description}
                            </p>
                          </div>

                          {/* Biomarker Improvement Pill (e.g. HbA1c 7.4% -> 6.9%) */}
                          {evt.biomarkerChange && (
                            <div className="flex flex-wrap items-center gap-2 p-2.5 rounded-xl bg-teal-50/70 border border-teal-200 text-xs">
                              <TrendingUp className="w-4 h-4 text-teal-700 shrink-0" />
                              <span className="font-bold text-teal-900">
                                {evt.biomarkerChange.label}:
                              </span>
                              <span className="text-slate-500 line-through">
                                {evt.biomarkerChange.from}
                              </span>
                              <ArrowRight className="w-3.5 h-3.5 text-teal-600" />
                              <span className="font-extrabold text-teal-800 bg-teal-100 px-2 py-0.5 rounded">
                                {evt.biomarkerChange.to} (Target Achieved)
                              </span>
                            </div>
                          )}

                          {/* Plain English "Why This Matters" Health Impact Box */}
                          {evt.healthImpact && (
                            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                              <div className="flex items-center gap-1.5 text-teal-800 font-bold text-[11px] uppercase tracking-wider">
                                <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                                <span>Health Outcome & Why This Matters</span>
                              </div>
                              <p className="text-slate-700 font-medium leading-relaxed">
                                {evt.healthImpact}
                              </p>
                            </div>
                          )}

                          {/* Bottom Row: Doctor, Clinic, Actions */}
                          <div className="pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-y-2 text-xs">
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-600">
                              {evt.doctor && (
                                <span className="flex items-center gap-1 font-medium">
                                  <Stethoscope className="w-3.5 h-3.5 text-slate-400" />
                                  <span>
                                    Doctor: <strong className="text-slate-800">{evt.doctor}</strong>
                                  </span>
                                </span>
                              )}

                              {evt.facility && (
                                <span className="flex items-center gap-1 text-slate-500">
                                  <Hospital className="w-3 h-3 text-slate-400" />
                                  <span>{evt.facility}</span>
                                </span>
                              )}

                              {evt.treatment && (
                                <span className="flex items-center gap-1 text-slate-600">
                                  <Pill className="w-3 h-3 text-amber-600" />
                                  <span>
                                    Therapy: <strong className="text-slate-800">{evt.treatment}</strong>
                                  </span>
                                </span>
                              )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-2">
                              {linkedDoc && (
                                <button
                                  onClick={() => onViewReport(linkedDoc)}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold text-xs border border-teal-200 transition cursor-pointer"
                                >
                                  <FileText className="w-3.5 h-3.5 text-teal-600" />
                                  <span>View Report</span>
                                </button>
                              )}

                              <button
                                onClick={() => {
                                  onOpenAIAssistant(
                                    `Please explain this health timeline milestone for ${member?.name}: "${evt.title}" (${evt.date}). What does this mean for everyday health, and what questions should be asked at the next checkup?`
                                  );
                                }}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
                              >
                                <Sparkle className="w-3 h-3 text-amber-500" />
                                <span>Ask AI</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        /* 5B. TABULAR SUMMARY VIEW FOR FAST SCANNING */
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">
              Health History Table ({filteredEvents.length} records)
            </h3>
            <span className="text-xs text-slate-500 font-medium">
              Click "View Report" to inspect original lab tests or clinical documentation
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-100/80 text-slate-700 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Person</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Milestone Title & Details</th>
                  <th className="py-3 px-4">Health Outcome</th>
                  <th className="py-3 px-4">Doctor & Clinic</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEvents.map((evt) => {
                  const member = getMemberById(evt.memberId);
                  const badge = getEventBadge(evt.eventType);
                  const IconComp = badge.icon;
                  const linkedDoc = evt.relatedDocId
                    ? documents.find((d) => d.id === evt.relatedDocId)
                    : null;

                  return (
                    <tr key={evt.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-4 whitespace-nowrap font-bold text-slate-900">
                        {evt.date}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-bold text-slate-800">{member?.name}</span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border ${badge.badgeBg}`}
                        >
                          <IconComp className="w-3 h-3" />
                          <span>{badge.shortLabel}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 max-w-sm">
                        <span className="font-bold text-slate-900 block">{evt.title}</span>
                        <span className="text-[11px] text-slate-500 line-clamp-1">
                          {evt.description}
                        </span>
                      </td>
                      <td className="py-3 px-4 max-w-xs">
                        {evt.healthImpact ? (
                          <span className="text-[11px] text-teal-800 font-medium line-clamp-2">
                            {evt.healthImpact}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Routine milestone</span>
                        )}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-bold text-slate-800 block">
                          {evt.doctor || 'Attending Physician'}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {evt.facility || 'Clinical Clinic'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        {linkedDoc ? (
                          <button
                            onClick={() => onViewReport(linkedDoc)}
                            className="text-teal-700 hover:text-teal-900 font-bold text-xs mr-2"
                          >
                            View Report
                          </button>
                        ) : (
                          <button
                            onClick={() =>
                              onOpenAIAssistant(
                                `Tell me more about ${evt.title} on ${evt.date} for ${member?.name}.`
                              )
                            }
                            className="text-slate-600 hover:text-slate-900 font-bold text-xs"
                          >
                            Ask AI
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. LOG HEALTH MILESTONE MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full p-6 sm:p-7 space-y-5 border border-slate-200 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">
                    Log Health Milestone & Event
                  </h3>
                  <p className="text-xs text-slate-500">
                    Record a surgery, diagnosis, test result, or doctor consultation.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMilestone} className="space-y-4 text-xs">
              {/* Family Member & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Family Member *</label>
                  <select
                    value={newEventData.memberId}
                    onChange={(e) =>
                      setNewEventData({ ...newEventData, memberId: e.target.value })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-800 font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  >
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.relationship})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Category *</label>
                  <select
                    value={newEventData.eventType}
                    onChange={(e) =>
                      setNewEventData({
                        ...newEventData,
                        eventType: e.target.value as TimelineEvent['eventType'],
                      })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-800 font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  >
                    <option value="consultation">Doctor Consultation</option>
                    <option value="surgery">Surgery & Procedure</option>
                    <option value="diagnosis">Clinical Diagnosis</option>
                    <option value="lab_test">Lab & Test Result</option>
                    <option value="medication_change">Medicine Adjustment</option>
                    <option value="milestone">Recovery & Health Milestone</option>
                    <option value="investigation">Imaging & Screening</option>
                  </select>
                </div>
              </div>

              {/* Title & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">Milestone Title *</label>
                  <input
                    type="text"
                    required
                    value={newEventData.title}
                    onChange={(e) => setNewEventData({ ...newEventData, title: e.target.value })}
                    placeholder="e.g. Left Knee Replacement Rehab Finished, HbA1c in Target"
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-800 font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={newEventData.date}
                    onChange={(e) => setNewEventData({ ...newEventData, date: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-800 font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Doctor & Clinic */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Physician / Doctor</label>
                  <input
                    type="text"
                    value={newEventData.doctor}
                    onChange={(e) => setNewEventData({ ...newEventData, doctor: e.target.value })}
                    placeholder="e.g. Dr. Anita Desai"
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-800 font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Hospital / Clinic</label>
                  <input
                    type="text"
                    value={newEventData.facility}
                    onChange={(e) => setNewEventData({ ...newEventData, facility: e.target.value })}
                    placeholder="e.g. Metropolitan Heart Clinic"
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-800 font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  What Happened (Description) *
                </label>
                <textarea
                  rows={2}
                  required
                  value={newEventData.description}
                  onChange={(e) =>
                    setNewEventData({ ...newEventData, description: e.target.value })
                  }
                  placeholder="Summarize the procedure, diagnosis, or test result in plain words..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-800 font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              {/* Health Impact / Why It Matters */}
              <div>
                <label className="font-bold text-teal-800 block mb-1">
                  Health Outcome / Why This Matters
                </label>
                <input
                  type="text"
                  value={newEventData.healthImpact}
                  onChange={(e) =>
                    setNewEventData({ ...newEventData, healthImpact: e.target.value })
                  }
                  placeholder="e.g. Restored full pain-free walking; reduced cardiovascular risk"
                  className="w-full p-2.5 rounded-xl border border-teal-200 bg-teal-50/40 text-slate-800 font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              {/* Optional Biomarker Result (Before vs After) */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="font-bold text-slate-700 block text-[11px] uppercase tracking-wide">
                  Optional: Test Metric Change (Before vs After)
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={newEventData.biomarkerLabel}
                    onChange={(e) =>
                      setNewEventData({ ...newEventData, biomarkerLabel: e.target.value })
                    }
                    placeholder="Metric (e.g. HbA1c)"
                    className="p-2 rounded-lg border border-slate-200 bg-white text-xs font-medium"
                  />
                  <input
                    type="text"
                    value={newEventData.biomarkerFrom}
                    onChange={(e) =>
                      setNewEventData({ ...newEventData, biomarkerFrom: e.target.value })
                    }
                    placeholder="Before (e.g. 7.4%)"
                    className="p-2 rounded-lg border border-slate-200 bg-white text-xs font-medium"
                  />
                  <input
                    type="text"
                    value={newEventData.biomarkerTo}
                    onChange={(e) =>
                      setNewEventData({ ...newEventData, biomarkerTo: e.target.value })
                    }
                    placeholder="After (e.g. 6.9%)"
                    className="p-2 rounded-lg border border-slate-200 bg-white text-xs font-medium"
                  />
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold shadow-sm cursor-pointer"
                >
                  Save Milestone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
