import React, { useState } from 'react';
import {
  Pill,
  Sun,
  Sunset,
  Moon,
  Check,
  Clock,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { Medication, FamilyMember } from '../../types';

interface CareScheduleCardProps {
  medications: Medication[];
  members: FamilyMember[];
  activeMemberFilter?: string;
}

export const CareScheduleCard: React.FC<CareScheduleCardProps> = ({
  medications,
  members,
  activeMemberFilter,
}) => {
  const currentMeds = medications.filter((m) => m.isCurrent);
  const filteredMeds = activeMemberFilter
    ? currentMeds.filter((m) => m.memberId === activeMemberFilter)
    : currentMeds;

  // Local state for checking off medications today
  const [takenMap, setTakenMap] = useState<{ [medId: string]: boolean }>({});

  const toggleTaken = (id: string) => {
    setTakenMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const takenCount = Object.values(takenMap).filter(Boolean).length;
  const totalCount = filteredMeds.length;
  const adherencePct = totalCount > 0 ? Math.round((takenCount / totalCount) * 100) : 100;

  // Group medications by inferred time of day
  const morningMeds = filteredMeds.filter((m) => {
    const timing = (m.timing || m.frequency || '').toLowerCase();
    return timing.includes('morning') || timing.includes('breakfast') || timing.includes('daily') || timing.includes('once');
  });

  const eveningMeds = filteredMeds.filter((m) => {
    const timing = (m.timing || m.frequency || '').toLowerCase();
    return timing.includes('night') || timing.includes('evening') || timing.includes('bedtime') || timing.includes('dinner');
  });

  const otherMeds = filteredMeds.filter(
    (m) => !morningMeds.includes(m) && !eveningMeds.includes(m)
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5">
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
            <Pill className="w-4 h-4 text-teal-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Today's Care & Medication Schedule</h3>
            <p className="text-[11px] text-slate-500">
              {takenCount} of {totalCount} completed today
            </p>
          </div>
        </div>

        {/* Adherence Mini Circular Progress */}
        <div className="flex items-center gap-2">
          <div className="relative w-8 h-8 flex items-center justify-center">
            <svg className="w-8 h-8 transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-100"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className={adherencePct === 100 ? 'text-emerald-500' : 'text-teal-600'}
                strokeDasharray={`${adherencePct}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute text-[10px] font-bold text-slate-700">{adherencePct}%</span>
          </div>
        </div>
      </div>

      {filteredMeds.length === 0 ? (
        <div className="py-6 text-center text-xs text-slate-400">
          No active medication schedule for this selection.
        </div>
      ) : (
        <div className="space-y-3">
          {/* Morning Slots */}
          {morningMeds.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-700 mb-1.5 uppercase tracking-wider">
                <Sun className="w-3.5 h-3.5" />
                <span>Morning Routine</span>
              </div>
              <div className="space-y-2">
                {morningMeds.map((med) => {
                  const member = members.find((m) => m.id === med.memberId);
                  const isChecked = Boolean(takenMap[med.id]);
                  return (
                    <div
                      key={med.id}
                      onClick={() => toggleTaken(med.id)}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isChecked
                          ? 'bg-emerald-50/50 border-emerald-200'
                          : 'bg-slate-50/70 border-slate-200 hover:border-teal-300'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <button
                          type="button"
                          className={`w-5 h-5 rounded-md flex items-center justify-center transition ${
                            isChecked
                              ? 'bg-emerald-600 text-white'
                              : 'border border-slate-300 bg-white hover:border-teal-500'
                          }`}
                        >
                          {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </button>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className={`text-xs font-bold ${isChecked ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                              {med.name} {med.dosage}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-white border border-slate-200 text-slate-600 font-medium">
                              {med.reason.split(' ')[0]}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500">
                            {member?.name} • {med.timing || med.frequency}
                          </p>
                        </div>
                      </div>

                      <span className="text-[10px] text-slate-400 font-mono whitespace-nowrap">
                        {isChecked ? 'Taken' : 'Due 8:00 AM'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Evening / Night Slots */}
          {eveningMeds.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-700 mb-1.5 uppercase tracking-wider">
                <Moon className="w-3.5 h-3.5" />
                <span>Evening Routine</span>
              </div>
              <div className="space-y-2">
                {eveningMeds.map((med) => {
                  const member = members.find((m) => m.id === med.memberId);
                  const isChecked = Boolean(takenMap[med.id]);
                  return (
                    <div
                      key={med.id}
                      onClick={() => toggleTaken(med.id)}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isChecked
                          ? 'bg-emerald-50/50 border-emerald-200'
                          : 'bg-slate-50/70 border-slate-200 hover:border-teal-300'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <button
                          type="button"
                          className={`w-5 h-5 rounded-md flex items-center justify-center transition ${
                            isChecked
                              ? 'bg-emerald-600 text-white'
                              : 'border border-slate-300 bg-white hover:border-teal-500'
                          }`}
                        >
                          {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </button>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className={`text-xs font-bold ${isChecked ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                              {med.name} {med.dosage}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-white border border-slate-200 text-slate-600 font-medium">
                              {med.reason.split(' ')[0]}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500">
                            {member?.name} • {med.timing || med.frequency}
                          </p>
                        </div>
                      </div>

                      <span className="text-[10px] text-slate-400 font-mono whitespace-nowrap">
                        {isChecked ? 'Taken' : 'Due 8:00 PM'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Any other remaining medications */}
          {otherMeds.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                <Clock className="w-3.5 h-3.5" />
                <span>As Prescribed</span>
              </div>
              <div className="space-y-2">
                {otherMeds.map((med) => {
                  const member = members.find((m) => m.id === med.memberId);
                  const isChecked = Boolean(takenMap[med.id]);
                  return (
                    <div
                      key={med.id}
                      onClick={() => toggleTaken(med.id)}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isChecked
                          ? 'bg-emerald-50/50 border-emerald-200'
                          : 'bg-slate-50/70 border-slate-200 hover:border-teal-300'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <button
                          type="button"
                          className={`w-5 h-5 rounded-md flex items-center justify-center transition ${
                            isChecked
                              ? 'bg-emerald-600 text-white'
                              : 'border border-slate-300 bg-white hover:border-teal-500'
                          }`}
                        >
                          {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </button>
                        <div className="min-w-0">
                          <span className={`text-xs font-bold ${isChecked ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                            {med.name} {med.dosage}
                          </span>
                          <p className="text-[11px] text-slate-500">
                            {member?.name} • {med.frequency}
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {isChecked ? 'Taken' : 'Pending'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
