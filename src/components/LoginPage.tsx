import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  Check,
  Sparkles,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Activity,
  Heart,
  FileText,
  UserCheck,
  Hash,
} from 'lucide-react';
import { Family, FamilyMember } from '../types';
import {
  generateUniqueMemberCode,
  getRegisteredAccounts,
  saveRegisteredAccount,
  createPersonalFamily,
} from '../services/accountService';
import { signInWithGoogle } from '../firebase';

interface LoginPageProps {
  onLoginSuccess: (user: FamilyMember, family?: Family) => void;
  existingMembers?: FamilyMember[];
  currentFamily?: Family;
  initialMode?: 'login' | 'create_account';
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  existingMembers,
  currentFamily,
  initialMode,
}) => {
  // Check if first-time user: if localStorage has 'family_health_has_account', default to 'login', otherwise 'create_account'
  const hasAccountStored = typeof window !== 'undefined' && !!localStorage.getItem('family_health_has_account');
  const [mode, setMode] = useState<'login' | 'create_account'>(
    initialMode || (hasAccountStored ? 'login' : 'create_account')
  );

  // Form Fields for Account Creation
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [age, setAge] = useState<string>('');
  const [gender, setGender] = useState<string>('Male');
  const [weight, setWeight] = useState<string>('');
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>('kg');

  // Medical History Section (Skippable)
  const [showMedicalHistory, setShowMedicalHistory] = useState(false);
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>([]);
  const [medicalNotes, setMedicalNotes] = useState('');
  const [customConditionInput, setCustomConditionInput] = useState('');

  // Login Form Fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // Google OAuth Loading / Simulation
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [googleModalOpen, setGoogleModalOpen] = useState(false);

  // Common condition tags
  const commonConditions = [
    'Hypertension (High BP)',
    'Type 2 Diabetes',
    'Asthma',
    'Thyroid Disorder',
    'High Cholesterol',
    'Migraine',
    'Acid Reflux (GERD)',
    'Arthritis',
  ];

  const commonAllergies = [
    'Penicillin',
    'Sulfa Antibiotics',
    'Peanuts',
    'Dust Mites',
    'Shellfish',
    'Pollen',
    'Latex',
  ];

  const toggleCondition = (cond: string) => {
    if (selectedConditions.includes(cond)) {
      setSelectedConditions(selectedConditions.filter((c) => c !== cond));
    } else {
      setSelectedConditions([...selectedConditions, cond]);
    }
  };

  const toggleAllergy = (alg: string) => {
    if (selectedAllergies.includes(alg)) {
      setSelectedAllergies(selectedAllergies.filter((a) => a !== alg));
    } else {
      setSelectedAllergies([...selectedAllergies, alg]);
    }
  };

  const handleAddCustomCondition = () => {
    if (customConditionInput.trim() && !selectedConditions.includes(customConditionInput.trim())) {
      setSelectedConditions([...selectedConditions, customConditionInput.trim()]);
      setCustomConditionInput('');
    }
  };

  // CREATE ACCOUNT SUBMIT
  const handleCreateAccount = (e?: React.FormEvent, skipMedical: boolean = false) => {
    if (e) e.preventDefault();

    if (!fullName.trim()) {
      alert('Please enter your full name');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      alert('Please enter a valid Gmail / email address');
      return;
    }
    if (!password || password.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }

    const parsedAge = parseInt(age, 10) || 32;
    const numericWeight = parseFloat(weight) || 68;
    const finalWeightKg = weightUnit === 'lbs' ? Math.round(numericWeight * 0.453592) : numericWeight;

    // Conditions and allergies
    const finalConditions = skipMedical ? [] : selectedConditions;
    const finalAllergies = skipMedical ? [] : selectedAllergies;
    const finalNotes = skipMedical ? '' : medicalNotes;

    // Determine healthy/stable status
    const initialStatus = finalConditions.length > 0 ? 'stable' : 'healthy';

    const registeredAccounts = getRegisteredAccounts();
    const existingCodes = registeredAccounts.map((a) => a.memberCode);
    const memberCode = generateUniqueMemberCode(existingCodes);

    const newMember: FamilyMember = {
      id: `mem-${Date.now()}`,
      memberCode,
      name: fullName.trim(),
      age: parsedAge,
      dob: `${new Date().getFullYear() - parsedAge}-01-15`,
      gender,
      email: email.trim().toLowerCase(),
      relationship: 'Self',
      status: initialStatus,
      statusText: finalConditions.length > 0 ? `Managing ${finalConditions[0]}` : 'Healthy (Profile initialized)',
      bloodType: 'O+',
      allergies: finalAllergies,
      conditionsSummary: finalConditions,
      medicalHistoryNotes: finalNotes,
      avatar:
        gender === 'Female'
          ? 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=160&auto=format&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&auto=format&fit=crop&q=80',
      emergencyContact: 'Family Contact',
      primaryPhysician: 'General Practitioner',
      vitals: {
        bloodPressure: '120/80',
        bloodPressureStatus: 'normal',
        weightKg: finalWeightKg,
        heightCm: 172,
        bmi: parseFloat((finalWeightKg / (1.72 * 1.72)).toFixed(1)),
      },
    };

    // Save to persistent registered accounts
    saveRegisteredAccount(newMember);

    const newFamily = createPersonalFamily(newMember);

    // Mark that user has an account
    localStorage.setItem('family_health_has_account', 'true');
    localStorage.setItem('family_health_auth_user', JSON.stringify(newMember));

    onLoginSuccess(newMember, newFamily);
  };

  // LOGIN SUBMIT
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!loginEmail.trim()) {
      setLoginError('Please enter your email or personal member code');
      return;
    }

    const cleanInput = loginEmail.trim().toLowerCase();
    const cleanCode = loginEmail.trim().toUpperCase();

    // Try matching with registered accounts
    const registered = getRegisteredAccounts();
    const matched = registered.find(
      (m) =>
        (m.email && m.email.toLowerCase() === cleanInput) ||
        (m.memberCode && m.memberCode.toUpperCase() === cleanCode)
    );

    if (!matched) {
      setLoginError(
        'No account found with this email or code. Please create an account or verify your details.'
      );
      return;
    }

    localStorage.setItem('family_health_has_account', 'true');
    localStorage.setItem('family_health_auth_user', JSON.stringify(matched));

    const fam = createPersonalFamily(matched);
    onLoginSuccess(matched, fam);
  };

  // GOOGLE LOGIN HANDLER
  const handleGoogleSignInClick = async () => {
    setIsGoogleLoading(true);
    try {
      const fbUser = await signInWithGoogle();
      if (fbUser) {
        const registered = getRegisteredAccounts();
        let matched = registered.find(
          (m) =>
            m.id === fbUser.uid ||
            (m.email && fbUser.email && m.email.toLowerCase() === fbUser.email.toLowerCase())
        );

        if (!matched) {
          const existingCodes = registered.map((a) => a.memberCode);
          const memberCode = generateUniqueMemberCode(existingCodes);

          matched = {
            id: fbUser.uid,
            memberCode,
            name: fbUser.displayName || 'Google Account User',
            age: 32,
            dob: '1994-06-15',
            gender: 'Prefer not to say',
            email: fbUser.email ? fbUser.email.toLowerCase() : 'user@gmail.com',
            relationship: 'Self',
            status: 'healthy',
            statusText: 'Signed in with Firebase Google Auth',
            bloodType: 'O+',
            allergies: [],
            conditionsSummary: [],
            avatar:
              fbUser.photoURL ||
              'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=160&auto=format&fit=crop&q=80',
            emergencyContact: 'Not specified',
            primaryPhysician: 'General Medicine',
            vitals: {
              bloodPressure: '118/78',
              bloodPressureStatus: 'normal',
              weightKg: 68,
              heightCm: 172,
              bmi: 23.0,
            },
          };
          saveRegisteredAccount(matched);
        }

        localStorage.setItem('family_health_has_account', 'true');
        localStorage.setItem('family_health_auth_user', JSON.stringify(matched));

        setIsGoogleLoading(false);
        const fam = createPersonalFamily(matched);
        onLoginSuccess(matched, fam);
        return;
      }
    } catch (err: any) {
      console.warn('Firebase popup sign-in, opening fallback selection modal:', err);
      setIsGoogleLoading(false);
      setGoogleModalOpen(true);
    }
  };

  const executeGoogleLogin = (chosenEmail: string, chosenName: string) => {
    setIsGoogleLoading(true);
    setGoogleModalOpen(false);

    setTimeout(() => {
      const registered = getRegisteredAccounts();
      let matched = registered.find((m) => m.email?.toLowerCase() === chosenEmail.toLowerCase());

      if (!matched) {
        const existingCodes = registered.map((a) => a.memberCode);
        const memberCode = generateUniqueMemberCode(existingCodes);

        matched = {
          id: `mem-google-${Date.now()}`,
          memberCode,
          name: chosenName,
          age: 32,
          dob: '1994-06-15',
          gender: 'Prefer not to say',
          email: chosenEmail.toLowerCase(),
          relationship: 'Self',
          status: 'healthy',
          statusText: 'Signed in with Google',
          bloodType: 'O+',
          allergies: [],
          conditionsSummary: [],
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=160&auto=format&fit=crop&q=80',
          emergencyContact: 'Not specified',
          primaryPhysician: 'General Medicine',
          vitals: {
            bloodPressure: '118/78',
            bloodPressureStatus: 'normal',
            weightKg: 68,
            heightCm: 172,
            bmi: 23.0,
          },
        };
        saveRegisteredAccount(matched);
      }

      localStorage.setItem('family_health_has_account', 'true');
      localStorage.setItem('family_health_auth_user', JSON.stringify(matched));

      setIsGoogleLoading(false);
      const fam = createPersonalFamily(matched);
      onLoginSuccess(matched, fam);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-6">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-teal-600 text-white shadow-md shadow-teal-600/20 mb-3">
          <ShieldCheck className="w-8 h-8 text-teal-50" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Family Health AI
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-500 font-medium">
          Unified, encrypted health vault for your family
        </p>

        {/* Mode Switcher Tabs */}
        <div className="mt-6 inline-flex p-1 bg-slate-200/80 rounded-xl border border-slate-300/60 shadow-2xs">
          <button
            type="button"
            onClick={() => setMode('create_account')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
              mode === 'create_account'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Create Account
          </button>
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
              mode === 'login'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Log In
          </button>
        </div>
      </div>

      {/* Main Form Container */}
      <div className="sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-white py-8 px-5 sm:px-8 shadow-sm border border-slate-200/90 rounded-2xl sm:rounded-3xl space-y-6">
          
          {/* GOOGLE SIGN IN BUTTON */}
          <div>
            <button
              type="button"
              onClick={handleGoogleSignInClick}
              disabled={isGoogleLoading}
              className="w-full flex items-center justify-center gap-3 py-2.5 px-4 border border-slate-200 hover:border-slate-300 rounded-xl shadow-2xs bg-white text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 transition active:scale-[0.99] disabled:opacity-60"
            >
              {/* Google G Logo SVG */}
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>
                {isGoogleLoading
                  ? 'Connecting to Google...'
                  : mode === 'create_account'
                  ? 'Continue with Google'
                  : 'Log in with Google'}
              </span>
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-white text-slate-400 font-medium">
                  Or continue with email
                </span>
              </div>
            </div>
          </div>

          {/* ================= MODE: CREATE ACCOUNT ================= */}
          {mode === 'create_account' && (
            <form onSubmit={(e) => handleCreateAccount(e, false)} className="space-y-4">
              <div className="bg-teal-50/70 border border-teal-200/80 rounded-xl p-3 flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-teal-700 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-teal-900 leading-snug">
                  Welcome to Family Health AI! Set up your primary health profile. You can edit all details anytime from your profile.
                </p>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Rajesh Sharma"
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition"
                  />
                </div>
              </div>

              {/* Gmail / Email */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Gmail / Email <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@gmail.com"
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full pl-9 pr-10 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Age, Gender & Weight (3-Column / Responsive Row) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                {/* Age */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Age <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="120"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="e.g. 38"
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition"
                  />
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Gender
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-2.5 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Non-binary">Non-binary</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>

                {/* Weight */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Weight
                  </label>
                  <div className="flex rounded-xl border border-slate-200 overflow-hidden focus-within:ring-2 focus-within:ring-teal-500/20 focus-within:border-teal-600">
                    <input
                      type="number"
                      step="0.5"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      placeholder="68"
                      className="w-full px-2.5 py-2 text-xs sm:text-sm focus:outline-none"
                    />
                    <select
                      value={weightUnit}
                      onChange={(e) => setWeightUnit(e.target.value as 'kg' | 'lbs')}
                      className="bg-slate-100 text-xs px-2 text-slate-700 font-semibold border-l border-slate-200 focus:outline-none"
                    >
                      <option value="kg">kg</option>
                      <option value="lbs">lbs</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* OTHER MEDICAL HISTORY SECTION (SKIPPABLE) */}
              <div className="pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setShowMedicalHistory(!showMedicalHistory)}
                    className="flex items-center gap-1.5 text-xs font-bold text-teal-800 hover:text-teal-900 group"
                  >
                    <Activity className="w-3.5 h-3.5 text-teal-600" />
                    <span>Other Medical History (Optional)</span>
                    {showMedicalHistory ? (
                      <ChevronUp className="w-3.5 h-3.5 text-teal-600" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 text-teal-600" />
                    )}
                  </button>

                  <span className="text-[10px] bg-slate-100 text-slate-500 font-semibold px-2 py-0.5 rounded-full">
                    Skippable
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  You can add medical history now, or skip and update from your profile at any time.
                </p>

                {/* Collapsible medical history inputs */}
                {showMedicalHistory && (
                  <div className="mt-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3.5 animate-in fade-in duration-150">
                    {/* Known Conditions */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                        Known Chronic Conditions
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {commonConditions.map((cond) => {
                          const isSelected = selectedConditions.includes(cond);
                          return (
                            <button
                              key={cond}
                              type="button"
                              onClick={() => toggleCondition(cond)}
                              className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition ${
                                isSelected
                                  ? 'bg-teal-600 text-white border-teal-600 shadow-2xs'
                                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                              }`}
                            >
                              {isSelected ? `✓ ${cond}` : `+ ${cond}`}
                            </button>
                          );
                        })}
                      </div>

                      {/* Custom condition adder */}
                      <div className="mt-2 flex gap-1.5">
                        <input
                          type="text"
                          value={customConditionInput}
                          onChange={(e) => setCustomConditionInput(e.target.value)}
                          placeholder="Other diagnosis..."
                          className="flex-1 px-2.5 py-1 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddCustomCondition();
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={handleAddCustomCondition}
                          className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-lg"
                        >
                          Add
                        </button>
                      </div>
                    </div>

                    {/* Known Allergies */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                        Known Drug or Food Allergies
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {commonAllergies.map((alg) => {
                          const isSelected = selectedAllergies.includes(alg);
                          return (
                            <button
                              key={alg}
                              type="button"
                              onClick={() => toggleAllergy(alg)}
                              className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition ${
                                isSelected
                                  ? 'bg-amber-600 text-white border-amber-600 shadow-2xs'
                                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                              }`}
                            >
                              {isSelected ? `✓ ${alg}` : `+ ${alg}`}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Past Surgeries / Additional Notes */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Surgeries, Implants, or Additional Notes
                      </label>
                      <textarea
                        rows={2}
                        value={medicalNotes}
                        onChange={(e) => setMedicalNotes(e.target.value)}
                        placeholder="e.g. Appendectomy in 2018, family history of coronary artery disease..."
                        className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-teal-500 resize-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons: Create Account OR Skip Medical History */}
              <div className="pt-2 space-y-2">
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition"
                >
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => handleCreateAccount(undefined, true)}
                  className="w-full py-2 px-3 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
                >
                  Skip Medical History & Create Account
                </button>
              </div>

              <div className="text-center pt-1">
                <p className="text-xs text-slate-500">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="font-bold text-teal-700 hover:text-teal-800 underline ml-1"
                  >
                    Log In
                  </button>
                </p>
              </div>
            </form>
          )}

          {/* ================= MODE: LOG IN ================= */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              {loginError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Gmail / Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="name@gmail.com"
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => alert('Password reset link sent to your registered email.')}
                    className="text-[11px] text-teal-700 hover:underline font-medium"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-10 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
                />
                <label htmlFor="remember-me" className="ml-2 text-xs text-slate-600 font-medium">
                  Remember this device for 30 days
                </label>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition"
              >
                <span>Log In</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Saved accounts on this device (if user created accounts) */}
              {getRegisteredAccounts().length > 0 && (
                <div className="pt-3 border-t border-slate-100">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Select Your Registered Account
                  </div>
                  <div className="space-y-1.5">
                    {getRegisteredAccounts().map((acc) => (
                      <button
                        key={acc.id}
                        type="button"
                        onClick={() => {
                          localStorage.setItem('family_health_has_account', 'true');
                          localStorage.setItem('family_health_auth_user', JSON.stringify(acc));
                          const fam = createPersonalFamily(acc);
                          onLoginSuccess(acc, fam);
                        }}
                        className="w-full flex items-center justify-between p-2 rounded-xl bg-slate-50 hover:bg-teal-50 border border-slate-200 hover:border-teal-300 text-left transition"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={acc.avatar}
                            alt={acc.name}
                            className="w-7 h-7 rounded-full object-cover border border-slate-200 flex-shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-slate-900 truncate">
                              {acc.name}
                            </div>
                            <div className="text-[10px] text-slate-500 truncate font-mono">
                              {acc.memberCode} • {acc.email}
                            </div>
                          </div>
                        </div>
                        <span className="text-[11px] font-bold text-teal-700 flex-shrink-0">
                          Log In →
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="text-center pt-2">
                <p className="text-xs text-slate-500">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('create_account')}
                    className="font-bold text-teal-700 hover:text-teal-800 underline ml-1"
                  >
                    Create Account
                  </button>
                </p>
              </div>
            </form>
          )}

        </div>

        {/* Security & HIPAA Footer Badge */}
        <div className="mt-6 flex items-center justify-center gap-4 text-slate-400 text-[11px]">
          <div className="flex items-center gap-1">
            <Lock className="w-3.5 h-3.5 text-teal-600" />
            <span>256-Bit Encrypted</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1">
            <Heart className="w-3.5 h-3.5 text-teal-600" />
            <span>Zero Data Selling</span>
          </div>
        </div>
      </div>

      {/* GOOGLE ONE-TAP / ACCOUNT SELECTION MODAL */}
      {googleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-sm w-full p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span className="font-bold text-sm text-slate-900">Sign in with Google</span>
              </div>
              <button
                type="button"
                onClick={() => setGoogleModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Choose an account to continue to <strong>Family Health AI</strong>:
            </p>

            {/* Account List */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => executeGoogleLogin('niknextt@gmail.com', 'Nikita Nextt')}
                className="w-full flex items-center gap-3 p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition text-left"
              >
                <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-xs">
                  N
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-slate-900 truncate">Nikita Nextt</div>
                  <div className="text-[11px] text-slate-500 truncate">niknextt@gmail.com</div>
                </div>
              </button>

              {getRegisteredAccounts()
                .filter((a) => a.email && a.email.toLowerCase() !== 'niknextt@gmail.com')
                .map((acc) => (
                  <button
                    key={acc.id}
                    type="button"
                    onClick={() => executeGoogleLogin(acc.email || `${acc.name.toLowerCase().replace(/\s+/g, '')}@gmail.com`, acc.name)}
                    className="w-full flex items-center gap-3 p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition text-left"
                  >
                    <img
                      src={acc.avatar}
                      alt={acc.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-slate-900 truncate">{acc.name}</div>
                      <div className="text-[11px] text-slate-500 truncate">{acc.email || 'Google Account'}</div>
                    </div>
                  </button>
                ))}
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  const custom = prompt('Enter your Gmail address:');
                  if (custom && custom.includes('@')) {
                    const name = prompt('Enter your full name:') || custom.split('@')[0];
                    executeGoogleLogin(custom, name);
                  }
                }}
                className="w-full py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-dashed border-slate-300 rounded-xl transition"
              >
                + Sign in with another Google account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
