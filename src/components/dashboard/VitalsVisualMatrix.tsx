import React from 'react';
import {
  Heart,
  Scale,
  Activity,
  Droplets,
  TrendingUp,
  TrendingDown,
  Info,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { FamilyMember } from '../../types';

interface VitalsVisualMatrixProps {
  member: FamilyMember;
}

export const VitalsVisualMatrix: React.FC<VitalsVisualMatrixProps> = ({ member }) => {
  const vitals = member.vitals;

  // Calculate BMI positioning on spectrum bar (15 to 35 range)
  const bmiVal = vitals.bmi || 23.0;
  const bmiPct = Math.min(Math.max(((bmiVal - 15) / (35 - 15)) * 100, 5), 95);

  const getBmiCategory = (bmi: number) => {
    if (bmi < 18.5) return { label: 'Underweight', color: 'text-sky-600', bg: 'bg-sky-50' };
    if (bmi <= 24.9) return { label: 'Normal / Healthy', color: 'text-emerald-700', bg: 'bg-emerald-50' };
    if (bmi <= 29.9) return { label: 'Overweight', color: 'text-amber-700', bg: 'bg-amber-50' };
    return { label: 'Obese', color: 'text-rose-700', bg: 'bg-rose-50' };
  };

  const bmiCat = getBmiCategory(bmiVal);

  // Parse Blood Pressure values
  const [systolicStr, diastolicStr] = (vitals.bloodPressure || '120/80').split('/');
  const systolic = parseInt(systolicStr, 10) || 120;
  const diastolic = parseInt(diastolicStr, 10) || 80;

  const isBpNormal = systolic < 130 && diastolic < 85;
  const bpPct = Math.min(Math.max(((systolic - 90) / (180 - 90)) * 100, 10), 95);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
            <Activity className="w-4 h-4 text-teal-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Key Physiological Vitals</h3>
            <p className="text-[11px] text-slate-500">Live clinical measurements for {member.name}</p>
          </div>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
          Last Verified 2026
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 1. Blood Pressure Visual Meter */}
        <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-200/70 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-rose-500" /> Blood Pressure
            </span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                isBpNormal
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {isBpNormal ? 'Optimal' : 'Monitoring'}
            </span>
          </div>

          <div className="my-2.5">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-slate-900 font-mono tracking-tight">
                {vitals.bloodPressure || '120/80'}
              </span>
              <span className="text-xs font-semibold text-slate-500">mmHg</span>
            </div>

            {/* Micro visual gauge */}
            <div className="relative w-full h-2.5 bg-slate-200 rounded-full mt-2 overflow-hidden flex">
              {/* Normal zone (90-120) */}
              <div className="w-1/3 h-full bg-emerald-400/80" title="Normal: <120" />
              {/* Elevated zone (120-140) */}
              <div className="w-1/3 h-full bg-amber-300" title="Elevated: 120-140" />
              {/* High zone (140+) */}
              <div className="w-1/3 h-full bg-rose-400" title="Stage 1/2 Hypertension" />
            </div>

            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>90/60</span>
              <span className="font-semibold text-emerald-600">Goal &lt;120/80</span>
              <span>180+</span>
            </div>
          </div>

          <p className="text-[10px] text-slate-500">
            {isBpNormal
              ? 'Cardiovascular pressure is within healthy limits.'
              : 'Borderline systolic pressure; routine logging recommended.'}
          </p>
        </div>

        {/* 2. BMI & Weight Spectrum Bar */}
        <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-200/70 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-teal-600" /> Body Mass Index (BMI)
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${bmiCat.bg} ${bmiCat.color}`}>
              {bmiCat.label}
            </span>
          </div>

          <div className="my-2.5">
            <div className="flex items-baseline justify-between">
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-slate-900 font-mono tracking-tight">
                  {vitals.bmi.toFixed(1)}
                </span>
                <span className="text-xs font-semibold text-slate-500">kg/m²</span>
              </div>
              <span className="text-xs font-medium text-slate-500">
                {vitals.weightKg} kg • {vitals.heightCm} cm
              </span>
            </div>

            {/* Spectrum Bar with Cursor */}
            <div className="relative mt-2 pt-1">
              <div className="w-full h-2.5 rounded-full overflow-hidden flex">
                <div className="w-[17%] bg-sky-300" title="Underweight <18.5" />
                <div className="w-[33%] bg-emerald-400" title="Normal 18.5-24.9" />
                <div className="w-[25%] bg-amber-300" title="Overweight 25-29.9" />
                <div className="w-[25%] bg-rose-400" title="Obese 30+" />
              </div>
              {/* Pointer indicator */}
              <div
                className="absolute top-0 w-2.5 h-4 bg-slate-900 rounded-sm transform -translate-x-1/2 shadow-xs"
                style={{ left: `${bmiPct}%` }}
                title={`BMI: ${bmiVal}`}
              />
            </div>

            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>18.5</span>
              <span className="font-semibold text-emerald-600">22.0 Healthy</span>
              <span>30.0</span>
            </div>
          </div>

          <p className="text-[10px] text-slate-500">
            Healthy range is 18.5 – 24.9 for adult metabolic profile.
          </p>
        </div>

        {/* 3. Glycemic / Metabolic Indicator */}
        <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-200/70 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
              <Droplets className="w-3.5 h-3.5 text-amber-500" /> Glycemic Control (HbA1c)
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              vitals.hba1c ? 'bg-teal-100 text-teal-800' : 'bg-slate-100 text-slate-500'
            }`}>
              {vitals.hba1c ? (vitals.hba1cTrend === 'improving' ? 'Improving Trend' : 'Documented') : 'Not Recorded'}
            </span>
          </div>

          <div className="my-2.5">
            <div className="flex items-baseline justify-between">
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-slate-900 font-mono tracking-tight">
                  {vitals.hba1c || '—'}
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  {vitals.hba1c ? '3-month avg' : 'No blood test'}
                </span>
              </div>
              {vitals.ldl && (
                <span className="text-xs font-medium text-slate-500">
                  LDL: {vitals.ldl}
                </span>
              )}
            </div>

            {/* Micro visual progress */}
            <div className="relative w-full h-2.5 bg-slate-200 rounded-full mt-2 overflow-hidden flex">
              <div className="w-[50%] bg-emerald-400" title="Normal: <5.7%" />
              <div className="w-[20%] bg-amber-300" title="Prediabetes: 5.7 - 6.4%" />
              <div className="w-[30%] bg-rose-400" title="Diabetes: >=6.5%" />
            </div>

            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>&lt;5.7%</span>
              <span className="font-semibold text-amber-600">6.5% Threshold</span>
              <span>10%+</span>
            </div>
          </div>

          <p className="text-[10px] text-slate-500">
            {vitals.hba1c
              ? parseFloat(vitals.hba1c) >= 6.5
                ? 'Glycemic level under active medication management.'
                : 'HbA1c is within the non-diabetic reference range.'
              : 'Upload a lab blood report or update profile vitals to track glycemic indices.'}
          </p>
        </div>
      </div>
    </div>
  );
};
