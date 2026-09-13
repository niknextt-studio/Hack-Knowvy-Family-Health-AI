import React, { useState } from 'react';
import {
  Users,
  Plus,
  ArrowUpRight,
  FileText,
  Calendar,
  Pill,
  Sparkles,
  Activity,
  Heart,
  AlertCircle,
  CheckCircle,
  TrendingDown,
  TrendingUp,
  Clock,
  ChevronRight,
  ShieldCheck,
  Stethoscope,
} from 'lucide-react';
import {
  Family,
  FamilyMember,
  MedicalDocument,
  Appointment,
  Medication,
  TimelineEvent,
} from '../types';

interface FamilyDashboardProps {
  family: Family;
  members: FamilyMember[];
  currentUser: FamilyMember;
  documents: MedicalDocument[];
  appointments: Appointment[];
  medications: Medication[];
  timeline: TimelineEvent[];
  onSelectMember: (member: FamilyMember) => void;
  onOpenUpload: () => void;
  onOpenDoctorVisit: (member: FamilyMember) => void;
  onOpenAIAssistant: (member: FamilyMember) => void;
  onViewReport: (doc: MedicalDocument) => void;
  onAddMember: (newMember: Partial<FamilyMember>) => void;
}

export const FamilyDashboard: React.FC<FamilyDashboardProps> = ({
  family,
  members,
  currentUser,
  documents,
  appointments,
  medications,
  timeline,
  onSelectMember,
  onOpenUpload,
  onOpenDoctorVisit,
  onOpenAIAssistant,
  onViewReport,
  onAddMember,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberAge, setNewMemberAge] = useState('');
  const [newMemberRelation, setNewMemberRelation] = useState<FamilyMember['relationship']>('Other');
  const [newMemberBlood, setNewMemberBlood] = useState('O+');

  const upcomingApts = appointments.filter((a) => a.status === 'upcoming');
  const currentMeds = medications.filter((m) => m.isCurrent);

  const handleCreateMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;
    onAddMember({
      name: newMemberName,
      age: parseInt(newMemberAge, 10) || 30,
      relationship: newMemberRelation,
      bloodType: newMemberBlood,
      status: 'healthy',
      statusText: 'Healthy (Profile active)',
      conditionsSummary: [],
      allergies: [],
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      emergencyContact: 'Emergency contact on file',
      primaryPhysician: 'General Practice',
      vitals: {
        bloodPressure: '120/80',
        bloodPressureStatus: 'normal',
        weightKg: 65,
        heightCm: 168,
        bmi: 23.0,
      },
    });
    setNewMemberName('');
    setNewMemberAge('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Good morning, {currentUser.name.split(' ')[0]}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Here's your family's health overview for <span className="font-medium text-slate-700">{family.name}</span>.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onOpenAIAssistant(currentUser)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-teal-50 hover:bg-teal-100/80 text-teal-800 border border-teal-200/80 rounded-xl text-xs font-bold transition shadow-2xs"
          >
            <Sparkles className="w-4 h-4 text-teal-600" />
            <span>Ask Health AI</span>
          </button>
          <button
            onClick={onOpenUpload}
            className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-teal-700/20 transition"
          >
            <span>+ Upload Record</span>
          </button>
        </div>
      </div>

      {/* AI Longitudinal Insight Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-teal-50/80 via-white to-slate-50 border border-teal-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-teal-900 uppercase tracking-wider">AI Family Insight</span>
              <span className="text-[10px] px-2 py-0.2 bg-teal-100 text-teal-800 rounded-full font-semibold">
                Updated Today
              </span>
            </div>
            <p className="text-xs text-slate-700 mt-1 leading-relaxed">
              <strong>Rajesh Sharma's</strong> glycemic control continues to show steady progress: HbA1c dropped to <strong>6.9%</strong> from 7.4%. Meanwhile, blood pressure (142/88) is stabilized but warrants discussion at his upcoming follow-up on Sept 28 with Dr. Sameer Gupta.
            </p>
          </div>
        </div>
        <button
          onClick={() => onOpenDoctorVisit(members[0])}
          className="flex-shrink-0 inline-flex items-center gap-1 text-xs font-bold text-teal-700 hover:text-teal-900 transition"
        >
          <span>Prepare Doctor Visit</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Family Members Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">Family Members</h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold">
              {members.length} members
            </span>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Family Member</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {members.map((member) => {
            const isAttention = member.status === 'attention';
            const isStable = member.status === 'stable';

            return (
              <div
                key={member.id}
                onClick={() => onSelectMember(member)}
                className="group relative p-5 bg-white rounded-2xl border border-slate-200/80 hover:border-teal-300 hover:shadow-md transition cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="relative">
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="w-12 h-12 rounded-full object-cover border border-slate-200"
                      />
                      <span
                        className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ring-2 ring-white ${
                          isAttention
                            ? 'bg-amber-400'
                            : isStable
                            ? 'bg-teal-500'
                            : 'bg-emerald-500'
                        }`}
                        title={member.statusText}
                      />
                    </div>

                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                        isAttention
                          ? 'bg-amber-50 text-amber-800 border-amber-200/80'
                          : isStable
                          ? 'bg-teal-50 text-teal-800 border-teal-200/80'
                          : 'bg-emerald-50 text-emerald-800 border-emerald-200/80'
                      }`}
                    >
                      {isAttention ? '🟡 Needs attention' : isStable ? '🟢 Stable' : '🟢 Healthy'}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm group-hover:text-teal-700 transition">
                    {member.name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {member.age} years old • {member.relationship === 'Self' ? 'Family Admin' : member.relationship}
                  </p>

                  <div className="mt-3 pt-3 border-t border-slate-100 text-xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Recorded Conditions
                    </span>
                    {member.conditionsSummary && member.conditionsSummary.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {member.conditionsSummary.map((cond, i) => (
                          <span
                            key={i}
                            className="inline-block px-1.5 py-0.5 rounded text-[11px] bg-slate-100 text-slate-700 font-medium"
                          >
                            {cond}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-slate-400 text-xs italic">No major conditions recorded</span>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="text-[11px]">Blood: {member.bloodType}</span>
                  <span className="font-semibold text-teal-700 group-hover:translate-x-0.5 transition flex items-center gap-0.5">
                    View profile <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main 2-column dashboard layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Uploads */}
          <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-teal-600" />
                <h3 className="font-bold text-slate-900 text-sm">Recent Medical Uploads</h3>
              </div>
              <button
                onClick={onOpenUpload}
                className="text-xs font-semibold text-teal-700 hover:text-teal-800"
              >
                Upload new record
              </button>
            </div>

            <div className="space-y-3">
              {documents.slice(0, 3).map((doc) => {
                const member = members.find((m) => m.id === doc.memberId) || members[0];
                return (
                  <div
                    key={doc.id}
                    onClick={() => onViewReport(doc)}
                    className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-teal-50/30 hover:border-teal-200 transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs flex-shrink-0">
                        {doc.fileType.toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900 text-xs hover:text-teal-700">
                            {doc.title}
                          </h4>
                          <span className="text-[10px] bg-slate-200/80 text-slate-700 px-1.5 py-0.2 rounded font-medium">
                            {doc.type}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Patient: <strong className="text-slate-700">{member.name}</strong> • {doc.facility} • {doc.date}
                        </p>
                        {doc.aiSummary && (
                          <p className="text-xs text-slate-600 mt-1 line-clamp-1 italic">
                            "{doc.aiSummary}"
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 sm:self-center self-end">
                      <span className="text-[11px] font-semibold text-teal-700">Review & Extract</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Health Activity & Timeline */}
          <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-teal-600" />
                <h3 className="font-bold text-slate-900 text-sm">Recent Health Activity</h3>
              </div>
              <span className="text-xs text-slate-400">Chronological history</span>
            </div>

            <div className="space-y-4">
              {timeline.slice(0, 4).map((event) => {
                const member = members.find((m) => m.id === event.memberId) || members[0];
                return (
                  <div key={event.id} className="flex items-start gap-3 text-xs">
                    <div className="w-2 h-2 rounded-full bg-teal-600 mt-1.5 ring-4 ring-teal-50" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-slate-900">{event.title}</span>
                        <span className="text-[10px] text-slate-400 whitespace-nowrap">{event.date}</span>
                      </div>
                      <p className="text-slate-600 mt-0.5 leading-relaxed">{event.description}</p>
                      <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-500">
                        <span>Patient: <strong className="text-slate-700">{member.name}</strong></span>
                        {event.doctor && <span>• {event.doctor}</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Appointments, Medications, Stats */}
        <div className="space-y-6">
          {/* Upcoming Appointments */}
          <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-teal-600" />
                <h3 className="font-bold text-slate-900 text-sm">Upcoming Appointments</h3>
              </div>
              <span className="text-[11px] font-semibold text-teal-700">
                {upcomingApts.length} scheduled
              </span>
            </div>

            <div className="space-y-3">
              {upcomingApts.map((apt) => {
                const member = members.find((m) => m.id === apt.memberId) || members[0];
                return (
                  <div
                    key={apt.id}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{apt.doctorName}</span>
                      <span className="text-[10px] font-semibold bg-teal-50 text-teal-800 px-1.5 py-0.5 rounded border border-teal-200">
                        {apt.specialty}
                      </span>
                    </div>
                    <div className="text-slate-600">
                      Patient: <strong className="text-slate-800">{member.name}</strong>
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-1 font-medium">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{apt.date} • {apt.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 italic">"{apt.reason}"</p>

                    <button
                      onClick={() => onOpenDoctorVisit(member)}
                      className="mt-1 w-full py-1 bg-white hover:bg-teal-50 text-teal-800 font-semibold text-[11px] rounded border border-slate-200 transition text-center"
                    >
                      Prepare Doctor Visit Summary →
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Medication Reminders */}
          <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Pill className="w-4 h-4 text-teal-600" />
                <h3 className="font-bold text-slate-900 text-sm">Active Medications</h3>
              </div>
              <span className="text-xs text-slate-400">{currentMeds.length} active</span>
            </div>

            <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
              {currentMeds.map((med) => {
                const member = members.find((m) => m.id === med.memberId) || members[0];
                return (
                  <div
                    key={med.id}
                    className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/70 text-xs flex items-center justify-between gap-2"
                  >
                    <div>
                      <div className="font-bold text-slate-900">{med.name} {med.dosage}</div>
                      <div className="text-[11px] text-slate-500">
                        {member.name} • {med.frequency}
                      </div>
                      {med.timing && (
                        <div className="text-[10px] text-teal-700 font-medium">{med.timing}</div>
                      )}
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-600 font-medium whitespace-nowrap">
                      {med.reason.split(' ')[0]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Family Health Statistics Card */}
          <div className="p-5 bg-slate-900 text-white rounded-2xl shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-xs text-slate-300">
                <Activity className="w-4 h-4 text-teal-400" />
                <span>Family Health Vault Stats</span>
              </div>
              <span className="text-[10px] text-teal-400 font-mono">ENCRYPTED</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
                <div className="text-xl font-extrabold text-white">{documents.length}</div>
                <div className="text-[10px] text-slate-400">Total Medical Files</div>
              </div>
              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
                <div className="text-xl font-extrabold text-teal-400">{timeline.length}</div>
                <div className="text-[10px] text-slate-400">Timeline Milestones</div>
              </div>
              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
                <div className="text-xl font-extrabold text-white">{currentMeds.length}</div>
                <div className="text-[10px] text-slate-400">Active Prescriptions</div>
              </div>
              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
                <div className="text-xl font-extrabold text-emerald-400">100%</div>
                <div className="text-[10px] text-slate-400">Verified Records</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-900 text-base">Add Family Member</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateMember} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  placeholder="e.g. Priya Sharma"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Age</label>
                  <input
                    type="number"
                    required
                    value={newMemberAge}
                    onChange={(e) => setNewMemberAge(e.target.value)}
                    placeholder="e.g. 26"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Relationship</label>
                  <select
                    value={newMemberRelation}
                    onChange={(e) => setNewMemberRelation(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 bg-white"
                  >
                    <option value="Spouse">Spouse</option>
                    <option value="Father">Father</option>
                    <option value="Mother">Mother</option>
                    <option value="Son">Son</option>
                    <option value="Daughter">Daughter</option>
                    <option value="Grandmother">Grandmother</option>
                    <option value="Grandfather">Grandfather</option>
                    <option value="Sibling">Sibling</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Blood Type</label>
                <select
                  value={newMemberBlood}
                  onChange={(e) => setNewMemberBlood(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 bg-white"
                >
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg shadow-xs"
                >
                  Save Member Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
