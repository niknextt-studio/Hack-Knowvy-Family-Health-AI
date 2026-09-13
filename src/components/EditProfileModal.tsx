import React, { useState } from 'react';
import {
  X,
  User,
  Mail,
  Activity,
  Heart,
  Save,
  Check,
  Plus,
  Trash2,
  ShieldCheck,
} from 'lucide-react';
import { FamilyMember } from '../types';

interface EditProfileModalProps {
  isOpen: boolean;
  member: FamilyMember;
  onClose: () => void;
  onSave: (updated: FamilyMember) => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  member,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState(member.name);
  const [email, setEmail] = useState(member.email || '');
  const [age, setAge] = useState(member.age.toString());
  const [gender, setGender] = useState(member.gender || 'Male');
  const [weightKg, setWeightKg] = useState(member.vitals.weightKg.toString());
  const [bloodType, setBloodType] = useState(member.bloodType);
  const [emergencyContact, setEmergencyContact] = useState(member.emergencyContact);
  const [primaryPhysician, setPrimaryPhysician] = useState(member.primaryPhysician);
  const [conditions, setConditions] = useState<string[]>(member.conditionsSummary || []);
  const [allergies, setAllergies] = useState<string[]>(member.allergies || []);
  const [notes, setNotes] = useState(member.medicalHistoryNotes || '');
  const [newCondition, setNewCondition] = useState('');
  const [newAllergy, setNewAllergy] = useState('');

  if (!isOpen) return null;

  const handleAddCondition = () => {
    if (newCondition.trim() && !conditions.includes(newCondition.trim())) {
      setConditions([...conditions, newCondition.trim()]);
      setNewCondition('');
    }
  };

  const handleRemoveCondition = (cond: string) => {
    setConditions(conditions.filter((c) => c !== cond));
  };

  const handleAddAllergy = () => {
    if (newAllergy.trim() && !allergies.includes(newAllergy.trim())) {
      setAllergies([...allergies, newAllergy.trim()]);
      setNewAllergy('');
    }
  };

  const handleRemoveAllergy = (alg: string) => {
    setAllergies(allergies.filter((a) => a !== alg));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedWeight = parseFloat(weightKg) || member.vitals.weightKg;
    const parsedAge = parseInt(age, 10) || member.age;
    const heightM = (member.vitals.heightCm || 170) / 100;
    const calculatedBmi = parseFloat((parsedWeight / (heightM * heightM)).toFixed(1));

    const updated: FamilyMember = {
      ...member,
      name: name.trim() || member.name,
      email: email.trim() || member.email,
      age: parsedAge,
      gender,
      bloodType,
      emergencyContact: emergencyContact.trim() || member.emergencyContact,
      primaryPhysician: primaryPhysician.trim() || member.primaryPhysician,
      conditionsSummary: conditions,
      allergies: allergies,
      medicalHistoryNotes: notes,
      status: conditions.length > 0 ? (conditions.length > 2 ? 'attention' : 'stable') : 'healthy',
      vitals: {
        ...member.vitals,
        weightKg: parsedWeight,
        bmi: calculatedBmi,
      },
    };

    onSave(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-xs">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-extrabold text-base text-slate-900 leading-tight">
                Edit Health Profile
              </h2>
              <p className="text-[11px] text-slate-500 font-medium">
                Update vitals, personal info & medical history
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Full Name & Gmail */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Gmail / Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@gmail.com"
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 outline-none"
              />
            </div>
          </div>

          {/* Age, Gender, Weight */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Age
              </label>
              <input
                type="number"
                min="1"
                max="120"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Gender
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-2 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl bg-white outline-none focus:border-teal-600"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Non-binary">Non-binary</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Weight (kg)
              </label>
              <input
                type="number"
                step="0.5"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 outline-none"
              />
            </div>
          </div>

          {/* Blood Type & Emergency Contact */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Blood Group
              </label>
              <select
                value={bloodType}
                onChange={(e) => setBloodType(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl bg-white outline-none focus:border-teal-600"
              >
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Primary Doctor
              </label>
              <input
                type="text"
                value={primaryPhysician}
                onChange={(e) => setPrimaryPhysician(e.target.value)}
                placeholder="Dr. Name"
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 outline-none"
              />
            </div>
          </div>

          {/* Medical History: Chronic Conditions */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">
                Medical Conditions & Diagnoses
              </span>
              <span className="text-[10px] text-slate-400">
                {conditions.length} active
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5 min-h-[32px]">
              {conditions.length === 0 ? (
                <span className="text-xs text-slate-400 italic">No conditions recorded</span>
              ) : (
                conditions.map((cond) => (
                  <span
                    key={cond}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold rounded-lg"
                  >
                    <span>{cond}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveCondition(cond)}
                      className="text-teal-600 hover:text-rose-600"
                    >
                      ×
                    </button>
                  </span>
                ))
              )}
            </div>

            <div className="flex gap-1.5 pt-1">
              <input
                type="text"
                value={newCondition}
                onChange={(e) => setNewCondition(e.target.value)}
                placeholder="Add condition (e.g. Hypertension)..."
                className="flex-1 px-3 py-1.5 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCondition();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAddCondition}
                className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-xl"
              >
                Add
              </button>
            </div>
          </div>

          {/* Medical History: Allergies */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">
                Known Allergies
              </span>
              <span className="text-[10px] text-slate-400">
                {allergies.length} recorded
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5 min-h-[32px]">
              {allergies.length === 0 ? (
                <span className="text-xs text-slate-400 italic">No known allergies</span>
              ) : (
                allergies.map((alg) => (
                  <span
                    key={alg}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold rounded-lg"
                  >
                    <span>{alg}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveAllergy(alg)}
                      className="text-amber-600 hover:text-rose-600"
                    >
                      ×
                    </button>
                  </span>
                ))
              )}
            </div>

            <div className="flex gap-1.5 pt-1">
              <input
                type="text"
                value={newAllergy}
                onChange={(e) => setNewAllergy(e.target.value)}
                placeholder="Add allergy (e.g. Penicillin)..."
                className="flex-1 px-3 py-1.5 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddAllergy();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAddAllergy}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl"
              >
                Add
              </button>
            </div>
          </div>

          {/* Medical Notes / Past Surgeries */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Past Surgeries & Clinical Notes
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Appendectomy in 2018, family history of coronary artery disease..."
              className="w-full p-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
            />
          </div>

          {/* Save Button Footer */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
            >
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
