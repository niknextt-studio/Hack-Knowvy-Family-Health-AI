import React from 'react';
import {
  Heart,
  Droplet,
  Activity,
  Wind,
  ShieldAlert,
  Calendar,
  User,
  ChevronRight,
  Stethoscope,
  TrendingDown,
  TrendingUp,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';
import { MedicalCondition, FamilyMember, MedicalDocument } from '../../types';

interface ConditionOverviewCardProps {
  condition: MedicalCondition;
  member?: FamilyMember;
  latestDoc?: MedicalDocument;
  onOpenDoctorVisit?: (member: FamilyMember) => void;
  onSelectMember?: (member: FamilyMember) => void;
}

export const ConditionOverviewCard: React.FC<ConditionOverviewCardProps> = ({
  condition,
  member,
  latestDoc,
  onOpenDoctorVisit,
  onSelectMember,
}) => {
  // Infer visual theme and metrics based on condition name
  const isDiabetes = condition.name.toLowerCase().includes('diabetes') || condition.name.toLowerCase().includes('glucose');
  const isBP = condition.name.toLowerCase().includes('hypertension') || condition.name.toLowerCase().includes('blood pressure');
  const isThyroid = condition.name.toLowerCase().includes('thyroid');
  const isAsthma = condition.name.toLowerCase().includes('asthma') || condition.name.toLowerCase().includes('respiratory');

  const getTheme = () => {
    if (isBP) {
      return {
        icon: Heart,
        accent: 'rose',
        bgLight: 'bg-rose-50',
        textAccent: 'text-rose-700',
        borderAccent: 'border-rose-200',
        badgeBg: 'bg-rose-100/70 text-rose-800',
        ringColor: '#F43F5E',
        metricLabel: 'Blood Pressure',
        metricValue: member?.vitals.bloodPressure || '138/86 mmHg',
        targetLabel: 'Target: <130/80',
        progressPct: 75,
        statusText: member?.vitals.bloodPressureStatus === 'normal' ? 'Optimal' : 'Monitoring',
      };
    }
    if (isDiabetes) {
      return {
        icon: Droplet,
        accent: 'amber',
        bgLight: 'bg-amber-50',
        textAccent: 'text-amber-700',
        borderAccent: 'border-amber-200',
        badgeBg: 'bg-amber-100/70 text-amber-800',
        ringColor: '#F59E0B',
        metricLabel: 'HbA1c Level',
        metricValue: member?.vitals.hba1c || '6.9%',
        targetLabel: 'Goal: <7.0%',
        progressPct: 82,
        statusText: member?.vitals.hba1cTrend === 'improving' ? 'Improving (-0.5%)' : 'Managed',
      };
    }
    if (isThyroid) {
      return {
        icon: Activity,
        accent: 'teal',
        bgLight: 'bg-teal-50',
        textAccent: 'text-teal-700',
        borderAccent: 'border-teal-200',
        badgeBg: 'bg-teal-100/70 text-teal-800',
        ringColor: '#0D9488',
        metricLabel: 'TSH Hormone',
        metricValue: '2.4 mIU/L',
        targetLabel: 'Optimal: 0.4 - 4.0',
        progressPct: 90,
        statusText: 'Euthyroid / Stable',
      };
    }
    if (isAsthma) {
      return {
        icon: Wind,
        accent: 'sky',
        bgLight: 'bg-sky-50',
        textAccent: 'text-sky-700',
        borderAccent: 'border-sky-200',
        badgeBg: 'bg-sky-100/70 text-sky-800',
        ringColor: '#0284C7',
        metricLabel: 'Peak Flow',
        metricValue: '450 L/min',
        targetLabel: 'Green Zone: >400',
        progressPct: 88,
        statusText: 'Controlled',
      };
    }
    return {
      icon: ShieldAlert,
      accent: 'indigo',
      bgLight: 'bg-indigo-50',
      textAccent: 'text-indigo-700',
      borderAccent: 'border-indigo-200',
      badgeBg: 'bg-indigo-100/70 text-indigo-800',
      ringColor: '#6366F1',
      metricLabel: 'Management Status',
      metricValue: condition.status,
      targetLabel: 'Under Clinical Observation',
      progressPct: 80,
      statusText: condition.status,
    };
  };

  const theme = getTheme();
  const IconComp = theme.icon;

  const isManaged = condition.status === 'Managed' || condition.status === 'Resolved';
  const isUnderInvestigation = condition.status === 'Under Investigation';

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 hover:border-teal-300/80 transition-all duration-200 shadow-2xs hover:shadow-xs p-5 flex flex-col justify-between group">
      <div>
        {/* Top Header */}
        <div className="flex items-start justify-between gap-3 mb-3.5">
          <div className="flex items-center gap-2.5">
            <div className={`w-10 h-10 rounded-xl ${theme.bgLight} ${theme.textAccent} flex items-center justify-center flex-shrink-0 border ${theme.borderAccent}`}>
              <IconComp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base group-hover:text-teal-800 transition">
                {condition.name}
              </h3>
              <p className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                {member && (
                  <span
                    onClick={() => onSelectMember && onSelectMember(member)}
                    className="font-semibold text-slate-700 hover:text-teal-700 cursor-pointer underline decoration-dotted underline-offset-2"
                  >
                    {member.name}
                  </span>
                )}
                <span>• Diagnosed {condition.dateDiagnosed.slice(0, 4)}</span>
              </p>
            </div>
          </div>

          <span
            className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
              isManaged
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : isUnderInvestigation
                ? 'bg-amber-50 text-amber-800 border-amber-200'
                : 'bg-teal-50 text-teal-800 border-teal-200'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isManaged ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            {condition.status}
          </span>
        </div>

        {/* Visual Progress / Target Gauge Bar */}
        <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100 my-3">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-slate-500 font-medium">{theme.metricLabel}</span>
            <div className="flex items-center gap-1 font-bold text-slate-900">
              <span>{theme.metricValue}</span>
              {theme.statusText.includes('Improving') ? (
                <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded font-semibold flex items-center gap-0.5">
                  <TrendingDown className="w-3 h-3" /> Impr.
                </span>
              ) : null}
            </div>
          </div>

          {/* Visual Range Indicator Bar */}
          <div className="relative w-full h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                theme.progressPct >= 80 ? 'bg-teal-600' : theme.progressPct >= 60 ? 'bg-amber-500' : 'bg-rose-500'
              }`}
              style={{ width: `${theme.progressPct}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1.5">
            <span>{theme.targetLabel}</span>
            <span className="font-semibold text-teal-700">{theme.statusText}</span>
          </div>
        </div>

        {/* Active Treatments / Medications Pills */}
        <div className="space-y-1.5 mb-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Active Management & Plan
          </span>
          <div className="flex flex-wrap gap-1.5">
            {condition.treatments && condition.treatments.length > 0 ? (
              condition.treatments.map((treatment, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 text-[11px] font-medium bg-white px-2 py-0.5 rounded-md border border-slate-200 text-slate-700 shadow-2xs"
                >
                  <CheckCircle2 className="w-3 h-3 text-teal-600" />
                  <span>{treatment}</span>
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-500 italic">Lifestyle & regular clinical review</span>
            )}
          </div>
        </div>
      </div>

      {/* Footer Doctor & Action */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-slate-500 text-[11px] min-w-0">
          <Stethoscope className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          <span className="truncate">{condition.treatingDoctor || 'Primary Care Physician'}</span>
        </div>

        {member && onOpenDoctorVisit && (
          <button
            type="button"
            onClick={() => onOpenDoctorVisit(member)}
            className="inline-flex items-center gap-1 font-bold text-teal-700 hover:text-teal-900 group-hover:translate-x-0.5 transition flex-shrink-0"
          >
            <span>Doctor Prep</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
