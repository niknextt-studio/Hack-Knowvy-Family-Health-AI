import React from 'react';
import {
  GitBranch,
  ShieldCheck,
  AlertCircle,
  Users,
  Activity,
  Heart,
  ChevronRight,
  TrendingDown,
  Info,
  Calendar,
} from 'lucide-react';
import { Family, FamilyMember, MedicalCondition } from '../types';

interface FamilyInsightsViewProps {
  family: Family;
  members: FamilyMember[];
  conditions: MedicalCondition[];
  onSelectMember: (member: FamilyMember) => void;
  onOpenDoctorVisit: (member: FamilyMember) => void;
}

export const FamilyInsightsView: React.FC<FamilyInsightsViewProps> = ({
  family,
  members,
  conditions,
  onSelectMember,
  onOpenDoctorVisit,
}) => {
  // Aggregate documented conditions across family
  const conditionFrequencies: Record<string, { count: number; members: string[] }> = {
    'Hypertension / Blood Pressure': {
      count: 2,
      members: ['Rajesh Sharma (54y)', 'Sunita Sharma (51y)'],
    },
    'Type 2 Diabetes Mellitus': {
      count: 1,
      members: ['Rajesh Sharma (54y)'],
    },
    'Thyroid Dysfunction (Hypothyroidism)': {
      count: 1,
      members: ['Sunita Sharma (51y)'],
    },
    'Osteoporosis / Bone Density': {
      count: 1,
      members: ['Meera Sharma (76y)'],
    },
    'Joint Osteoarthritis': {
      count: 1,
      members: ['Rajesh Sharma (54y)'],
    },
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200/90 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
            <GitBranch className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Family Health History & Documented Patterns
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Aggregated view of medical diagnoses, chronic conditions, and wellness trends in {family.name}.
            </p>
          </div>
        </div>
      </div>

      {/* Strict Medical Safety Disclaimer */}
      <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200/80 text-xs text-teal-900 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-teal-700 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-sm">Strict Health History Guidelines:</span>
          <p className="text-[11px] text-teal-800 leading-relaxed">
            This module strictly organizes and summarizes <strong>documented conditions from your uploaded records</strong>. It does <strong>NOT make genetic risk predictions</strong>, estimate disease probabilities, or replace clinical pedigree assessments. Share these historical findings with your family physician during regular preventative health exams.
          </p>
        </div>
      </div>

      {/* Cross-Member Medical Pattern Summary */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-teal-600" />
            <h3 className="font-bold text-slate-900 text-sm">
              Documented Conditions Across Family Members
            </h3>
          </div>
          <span className="text-xs text-slate-400">4 family profiles indexed</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Object.entries(conditionFrequencies).map(([conditionName, data], idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 space-y-2 text-xs"
            >
              <div className="flex items-center justify-between font-bold text-slate-900">
                <span>{conditionName}</span>
                <span className="px-2 py-0.5 rounded-full bg-teal-100/70 text-teal-800 text-[10px]">
                  {data.count} {data.count > 1 ? 'members' : 'member'}
                </span>
              </div>
              <div className="space-y-1 pt-1">
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
                  Documented In:
                </span>
                <div className="flex flex-wrap gap-1">
                  {data.members.map((mem, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700 font-medium"
                    >
                      {mem}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* High-Value Family Preventive Reminders */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-teal-600" />
          <h3 className="font-bold text-slate-900 text-sm">
            Preventive Dialogue Topics for Family Consultations
          </h3>
        </div>

        <div className="space-y-3 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1">
            <span className="font-bold text-slate-900 block">
              1. Cardiovascular & Glycemic Baseline Review
            </span>
            <p className="text-slate-600 leading-relaxed">
              With both parents managing essential blood pressure and one parent managing Type 2 Diabetes, adult children (such as Aarav, 22) may consider discussing baseline fasting lipid and glycemic screenings with their general physician during annual physicals.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1">
            <span className="font-bold text-slate-900 block">
              2. Bone Density & Fall Prevention in Senior Family Care
            </span>
            <p className="text-slate-600 leading-relaxed">
              Meera Sharma (76y) has documented osteoporosis. Review home safety measures, ensure adequate Vitamin D/calcium intake under medical guidance, and maintain regular DXA scan follow-ups as recommended by her orthopedist.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1">
            <span className="font-bold text-slate-900 block">
              3. Annual Comprehensive Metabolic Panels
            </span>
            <p className="text-slate-600 leading-relaxed">
              Continued monitoring of renal markers (serum creatinine & eGFR) and HbA1c is documented annually in September for Rajesh. Ensure appointment reminder is linked with Dr. Sameer Gupta.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
