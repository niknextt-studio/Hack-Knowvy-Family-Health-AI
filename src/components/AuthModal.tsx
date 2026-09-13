import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  Users,
  KeyRound,
  UserPlus,
  ArrowRight,
  Check,
  Copy,
} from 'lucide-react';
import { Family, FamilyMember } from '../types';

export type AuthMode = 'login' | 'signup' | 'create_family' | 'join_family';

interface AuthModalProps {
  isOpen: boolean;
  initialMode: AuthMode;
  onClose: () => void;
  onSuccess: (user: FamilyMember, family?: Family) => void;
  demoMembers: FamilyMember[];
  currentFamily: Family;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode,
  onClose,
  onSuccess,
  demoMembers,
  currentFamily,
}) => {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('');
  const [phone, setPhone] = useState('');
  const [familyName, setFamilyName] = useState('');
  const [adminName, setAdminName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Default to Rajesh or matching user
    const matched = demoMembers.find((m) => m.name.toLowerCase().includes(fullName.toLowerCase())) || demoMembers[0];
    onSuccess(matched, currentFamily);
    onClose();
  };

  const handleQuickDemoLogin = (member: FamilyMember) => {
    onSuccess(member, currentFamily);
    onClose();
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    const newMember: FamilyMember = {
      id: `mem-${Date.now()}`,
      name: fullName || 'New Family Member',
      age: dob ? Math.max(1, new Date().getFullYear() - new Date(dob).getFullYear()) : 35,
      dob: dob || '1990-01-01',
      relationship: 'Self',
      status: 'healthy',
      statusText: 'Healthy (New profile initialized)',
      bloodType: 'O+',
      allergies: [],
      conditionsSummary: [],
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      emergencyContact: phone || 'Not specified',
      primaryPhysician: 'General Physician',
      vitals: {
        bloodPressure: '120/80',
        bloodPressureStatus: 'normal',
        weightKg: 68,
        heightCm: 170,
        bmi: 23.5,
      },
    };
    onSuccess(newMember, currentFamily);
    onClose();
  };

  const handleCreateFamily = (e: React.FormEvent) => {
    e.preventDefault();
    const code = `${(familyName || 'CARE').toUpperCase().replace(/\s+/g, '-')}-${Math.floor(1000 + Math.random() * 9000)}`;
    setGeneratedCode(code);

    const newFamily: Family = {
      id: `fam-${Date.now()}`,
      name: familyName || 'Our Family Health Space',
      adminName: adminName || 'Family Admin',
      adminId: 'admin-user',
      inviteCode: code,
      createdAt: new Date().toISOString().split('T')[0],
      memberCount: 1,
    };

    const adminMember: FamilyMember = {
      id: `mem-${Date.now()}`,
      name: adminName || 'Family Admin',
      age: 42,
      dob: '1984-05-12',
      relationship: 'Self',
      status: 'healthy',
      statusText: 'Healthy (Admin)',
      bloodType: 'A+',
      allergies: [],
      conditionsSummary: [],
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
      emergencyContact: 'Not specified',
      primaryPhysician: 'Family Practice',
      vitals: {
        bloodPressure: '120/80',
        bloodPressureStatus: 'normal',
        weightKg: 72,
        heightCm: 175,
        bmi: 23.5,
      },
    };

    setTimeout(() => {
      onSuccess(adminMember, newFamily);
      onClose();
    }, 1200);
  };

  const handleJoinFamily = (e: React.FormEvent) => {
    e.preventDefault();
    // Joins the active family space
    const joinedMember = demoMembers[1] || demoMembers[0];
    onSuccess(joinedMember, currentFamily);
    onClose();
  };

  const copyCode = () => {
    navigator.clipboard.writeText(generatedCode || currentFamily.inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                {mode === 'login' && 'Sign in to Family Health AI'}
                {mode === 'signup' && 'Create Your Member Account'}
                {mode === 'create_family' && 'Create a Private Family Space'}
                {mode === 'join_family' && 'Join Family via Invitation'}
              </h3>
              <p className="text-[11px] text-slate-500">One secure health memory for your entire family</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switchers */}
        <div className="grid grid-cols-4 bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 text-center">
          <button
            onClick={() => setMode('login')}
            className={`py-2.5 transition ${mode === 'login' ? 'bg-white text-teal-800 border-b-2 border-teal-600 font-bold' : 'hover:bg-slate-100'}`}
          >
            Sign In
          </button>
          <button
            onClick={() => setMode('signup')}
            className={`py-2.5 transition ${mode === 'signup' ? 'bg-white text-teal-800 border-b-2 border-teal-600 font-bold' : 'hover:bg-slate-100'}`}
          >
            Sign Up
          </button>
          <button
            onClick={() => setMode('create_family')}
            className={`py-2.5 transition ${mode === 'create_family' ? 'bg-white text-teal-800 border-b-2 border-teal-600 font-bold' : 'hover:bg-slate-100'}`}
          >
            New Family
          </button>
          <button
            onClick={() => setMode('join_family')}
            className={`py-2.5 transition ${mode === 'join_family' ? 'bg-white text-teal-800 border-b-2 border-teal-600 font-bold' : 'hover:bg-slate-100'}`}
          >
            Join
          </button>
        </div>

        {/* Body */}
        <div className="p-5">
          {/* LOGIN */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. rajesh.sharma@example.com"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold shadow-xs transition"
              >
                Sign In
              </button>

              <div className="pt-3 border-t border-slate-100">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Or One-Click Demo Login
                </div>
                <div className="space-y-1.5">
                  {demoMembers.slice(0, 2).map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => handleQuickDemoLogin(m)}
                      className="w-full flex items-center justify-between p-2 rounded-lg bg-slate-50 hover:bg-teal-50 text-slate-700 hover:text-teal-900 border border-slate-200 transition text-xs text-left"
                    >
                      <div className="flex items-center gap-2">
                        <img src={m.avatar} alt={m.name} className="w-6 h-6 rounded-full object-cover" />
                        <span className="font-semibold">{m.name}</span>
                      </div>
                      <span className="text-[10px] text-slate-500">{m.relationship === 'Self' ? 'Family Admin' : m.relationship}</span>
                    </button>
                  ))}
                </div>
              </div>
            </form>
          )}

          {/* SIGN UP */}
          {mode === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Vikram Sharma"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone (optional)</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 555-0192"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vikram@example.com"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 mt-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold shadow-xs transition"
              >
                Create Account
              </button>
            </form>
          )}

          {/* CREATE FAMILY */}
          {mode === 'create_family' && (
            <form onSubmit={handleCreateFamily} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Family Name</label>
                <input
                  type="text"
                  required
                  value={familyName}
                  onChange={(e) => setFamilyName(e.target.value)}
                  placeholder="e.g. Verma Family Health Vault"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Family Admin Full Name</label>
                <input
                  type="text"
                  required
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  placeholder="e.g. Ananya Verma"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>

              {generatedCode ? (
                <div className="p-3 bg-teal-50 rounded-xl border border-teal-200 text-xs space-y-2">
                  <div className="font-bold text-teal-900">Family Created! Invitation Code:</div>
                  <div className="flex items-center justify-between p-2 bg-white rounded border border-teal-200 font-mono font-bold text-sm text-teal-800">
                    <span>{generatedCode}</span>
                    <button
                      type="button"
                      onClick={copyCode}
                      className="p-1 text-teal-600 hover:text-teal-800"
                    >
                      {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-teal-700">Redirecting to your new family space...</p>
                </div>
              ) : (
                <button
                  type="submit"
                  className="w-full py-2.5 mt-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold shadow-xs transition"
                >
                  Create Family & Generate Invite Code
                </button>
              )}
            </form>
          )}

          {/* JOIN FAMILY */}
          {mode === 'join_family' && (
            <form onSubmit={handleJoinFamily} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Family Invitation Code</label>
                <input
                  type="text"
                  required
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  placeholder="e.g. SHARMA-CARE-2026"
                  className="w-full px-3 py-2 text-xs uppercase font-mono border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Ask your family admin for their 16-character invitation code or link.
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
                <div className="font-semibold text-slate-800">Try Sharma Family Demo Code:</div>
                <div className="font-mono text-teal-700 font-bold">{currentFamily.inviteCode}</div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold shadow-xs transition"
              >
                Join Family Space
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
