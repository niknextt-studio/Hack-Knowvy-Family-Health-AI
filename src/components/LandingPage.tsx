import React from 'react';
import {
  ShieldCheck,
  Sparkles,
  FileText,
  Clock,
  Pill,
  Lock,
  ArrowRight,
  CheckCircle2,
  Users,
  ChevronRight,
  Search,
} from 'lucide-react';

interface LandingPageProps {
  onEnterApp: () => void;
  onOpenAuth: (mode: 'login' | 'signup' | 'create_family' | 'join_family') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp, onOpenAuth }) => {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900">
      {/* Public Navigation */}
      <nav className="border-b border-slate-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-sm shadow-teal-700/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-slate-900">
                Family Health AI
              </span>
              <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200/60 hidden sm:inline-block">
                One Secure Health Memory
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => onOpenAuth('login')}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-950 transition"
            >
              Sign In
            </button>
            <button
              onClick={() => onOpenAuth('join_family')}
              className="hidden sm:inline-flex px-3.5 py-1.5 text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100/80 border border-teal-200 rounded-lg transition"
            >
              Join Family
            </button>
            <button
              onClick={onEnterApp}
              className="px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-xs shadow-teal-700/20 transition flex items-center gap-1.5"
            >
              <span>Explore Demo</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-16 sm:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200/80 text-teal-800 text-xs font-semibold mb-6">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              <span>Private, Non-Diagnostic Healthcare SaaS Platform</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15] mb-6">
              Your family's health.{' '}
              <span className="text-teal-700 font-serif italic font-normal">One intelligent place.</span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto mb-8 font-normal">
              Securely organize medical records, understand years of health history, and use AI to make sense of your family’s healthcare journey.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-10">
              <button
                onClick={() => onOpenAuth('create_family')}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-md shadow-teal-700/20 transition flex items-center justify-center gap-2"
              >
                <span>Create Your Family Space</span>
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={onEnterApp}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-semibold text-sm border border-slate-200/90 shadow-2xs transition flex items-center justify-center gap-2"
              >
                <span>Launch Live Sharma Family Demo</span>
              </button>
              <button
                onClick={() => onOpenAuth('join_family')}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 font-semibold text-sm transition"
              >
                Enter Invite Code
              </button>
            </div>

            {/* Micro proof points */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-teal-600" />
                <span>Strict Non-Diagnostic Safety Rules</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-teal-600" />
                <span>Per-Member Privacy & Access Controls</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-teal-600" />
                <span>Full Citations & Source Document Audit</span>
              </div>
            </div>
          </div>

          {/* Interactive Hero Preview Card */}
          <div className="mt-14 max-w-5xl mx-auto rounded-2xl bg-white border border-slate-200/90 shadow-xl overflow-hidden">
            <div className="bg-slate-50/80 px-4 py-3 border-b border-slate-200/80 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-slate-300" />
                <span className="w-3 h-3 rounded-full bg-slate-300" />
                <span className="w-3 h-3 rounded-full bg-slate-300" />
                <span className="font-semibold text-slate-700 ml-2">Sharma Family Health Space • Active Memory</span>
              </div>
              <span className="text-teal-700 font-medium">4 Registered Members</span>
            </div>

            <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Member Card preview */}
              <div className="p-4 rounded-xl bg-slate-50/60 border border-slate-200/70 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Patient Profile
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                    🟡 Needs attention
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80"
                    alt="Rajesh Sharma"
                    className="w-12 h-12 rounded-full object-cover border border-slate-200"
                  />
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Rajesh Sharma</h4>
                    <p className="text-xs text-slate-500">54 years old • Diabetes, Hypertension</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/60 grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 bg-white rounded-lg border border-slate-100">
                    <span className="text-[10px] text-slate-400 block font-medium">HbA1c Glycemic</span>
                    <span className="font-bold text-slate-900">6.9%</span>
                    <span className="text-[10px] text-teal-700 ml-1 font-semibold">↓ Improving</span>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-slate-100">
                    <span className="text-[10px] text-slate-400 block font-medium">Blood Pressure</span>
                    <span className="font-bold text-slate-900">142/88</span>
                    <span className="text-[10px] text-amber-700 ml-1 font-semibold">Monitoring</span>
                  </div>
                </div>
              </div>

              {/* AI Assistant Preview */}
              <div className="lg:col-span-2 p-4 rounded-xl bg-teal-50/40 border border-teal-200/70 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-teal-900">
                      <Sparkles className="w-4 h-4 text-teal-700" />
                      <span>Family Health AI • Inquiry Analysis</span>
                    </div>
                    <span className="text-[10px] bg-white text-teal-800 px-2 py-0.5 rounded border border-teal-200 font-medium">
                      Based on Uploaded Records
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-800 italic mb-2">
                    "What changed in his diabetes health over the last year?"
                  </p>
                  <div className="text-xs text-slate-700 bg-white p-3 rounded-lg border border-slate-200/80 space-y-1.5">
                    <p>
                      <strong>What your records show:</strong> Your father's HbA1c decreased from <strong>7.4% in March 2025</strong> to <strong>6.9% in September 2026</strong>. Fasting glucose improved from 134 mg/dL to 118 mg/dL following the titration of Metformin to 500mg twice daily.
                    </p>
                    <div className="text-[11px] text-teal-700 pt-1 flex items-center gap-1 font-medium">
                      <FileText className="w-3 h-3" />
                      <span>Source: Blood Test — September 12, 2026 (Metropolis Diagnostics)</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end">
                  <button
                    onClick={onEnterApp}
                    className="text-xs font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1"
                  >
                    <span>View full interactive dashboard</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Everything your family needs */}
      <section className="py-16 sm:py-20 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-3">
              Everything your family needs to stay healthy
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              Built specifically for multi-generational families caring for elderly parents, children, and themselves.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-md transition space-y-2.5">
              <div className="w-9 h-9 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Medical Records & Document AI</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Drag-and-drop blood reports, scan images, discharge summaries, and prescriptions. AI reads the documents, detects biomarkers, and lets you confirm every value.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-md transition space-y-2.5">
              <div className="w-9 h-9 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Chronological Health Timeline</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                A single historical timeline spanning years of surgeries, diagnoses, lab tests, and medication changes. Never lose track of when a procedure took place.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-md transition space-y-2.5">
              <div className="w-9 h-9 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Conversational AI Assistant</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Ask natural questions about medications, trends, and previous lab panels. Answers are strictly based on your documents, with exact citations and medical safety boundaries.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-md transition space-y-2.5">
              <div className="w-9 h-9 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
                <Pill className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Medication Tracking</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Maintain active and historical medications, dosages, frequencies, and prescribing physicians across all family members.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-md transition space-y-2.5">
              <div className="w-9 h-9 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Doctor Visit Summary Generator</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Heading to a specialist? Select your main concern and generate a professional, 1-page summary with relevant history, lab findings, and questions for the physician.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-md transition space-y-2.5">
              <div className="w-9 h-9 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Privacy-First Permissions</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Members choose who sees their records. Create temporary, expiration-bound doctor sharing links without exposing full family accounts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 sm:py-20 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-3">
              How Family Health AI Works
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              Simple 5-step workflow designed for zero stress and complete transparency.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[
              { step: '01', title: 'Create Family', desc: 'Set up your private space and generate an invitation code.' },
              { step: '02', title: 'Add Members', desc: 'Add individual health profiles for parents, spouse, or kids.' },
              { step: '03', title: 'Upload Records', desc: 'Upload PDF reports, prescriptions, scans, or discharge notes.' },
              { step: '04', title: 'AI Organizes', desc: 'Extract biomarkers, organize the timeline, and verify details.' },
              { step: '05', title: 'Gain Clarity', desc: 'Ask questions, review trends, and prepare for doctor appointments.' },
            ].map((s, idx) => (
              <div key={idx} className="p-4 bg-white rounded-xl border border-slate-200 relative space-y-2">
                <div className="text-xs font-bold text-teal-700 bg-teal-50 w-7 h-7 rounded-lg flex items-center justify-center">
                  {s.step}
                </div>
                <h4 className="font-bold text-slate-900 text-sm">{s.title}</h4>
                <p className="text-xs text-slate-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Privacy First Section */}
      <section className="py-16 bg-slate-900 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="w-12 h-12 rounded-2xl bg-teal-500/20 text-teal-400 flex items-center justify-center mx-auto border border-teal-500/30">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight">
            Your health information belongs strictly to you.
          </h2>
          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Joining a family doesn't mean surrendering personal privacy. Each member controls who can view their sensitive records. We never sell data, never auto-diagnose, and store structured medical facts separately from original files.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={onEnterApp}
              className="px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-sm shadow-md transition"
            >
              Open Sharma Family Demo
            </button>
            <button
              onClick={() => onOpenAuth('create_family')}
              className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm border border-slate-700 transition"
            >
              Create New Family Space
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-slate-950 text-slate-400 text-xs border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="font-bold text-slate-200">Family Health AI</span> — One secure health memory for your entire family.
          </div>
          <div className="text-slate-500 text-[11px]">
            Medical disclaimer: Family Health AI is a health organization platform and does not provide medical diagnoses or treatment prescriptions.
          </div>
        </div>
      </footer>
    </div>
  );
};
