import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  FileText,
  AlertTriangle,
  HelpCircle,
  Stethoscope,
  ShieldCheck,
  User,
  CheckCircle2,
  ExternalLink,
  ChevronDown,
  RefreshCw,
} from 'lucide-react';
import { FamilyMember, AIMessage, MedicalDocument } from '../types';

interface AIAssistantViewProps {
  members: FamilyMember[];
  selectedMember: FamilyMember;
  documents: MedicalDocument[];
  onSelectMember: (member: FamilyMember) => void;
  onViewReport: (doc: MedicalDocument) => void;
  initialQuery?: string;
}

export const AIAssistantView: React.FC<AIAssistantViewProps> = ({
  members,
  selectedMember,
  documents,
  onSelectMember,
  onViewReport,
  initialQuery,
}) => {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize with introductory response
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome-msg',
          sender: 'ai',
          memberId: selectedMember.id,
          timestamp: 'Just now',
          structuredAnswer: {
            recordsShow: `I have indexed 4 medical records for ${selectedMember.name}, spanning Type 2 Diabetes Mellitus, Essential Hypertension, and status-post Left Total Knee Replacement (2023). Latest lab markers from September 12, 2026, show HbA1c at 6.9% (improved from 7.4%), fasting glucose at 118 mg/dL, and serum creatinine at 1.05 mg/dL.`,
            possibleFactors: 'All active records reflect continuous outpatient management with Metformin, Amlodipine, and Atorvastatin.',
            whatIsUncertain: 'Recent urine microalbumin/creatinine tests and home daily blood pressure logs are not present in the files.',
            discussWithDoctor: [
              'Is the current Metformin 500mg BD dose optimal given the 6.9% HbA1c result?',
              'Should home blood pressure monitoring be formally logged for the next review?',
            ],
            urgentAttention: null,
            citations: [
              {
                docTitle: 'Comprehensive Metabolic Panel & Glycemic Audit',
                date: 'September 12, 2026',
                quoteSnippet: 'HbA1c: 6.9%, Glucose: 118 mg/dL',
              },
            ],
          },
        },
      ]);
    }
  }, [selectedMember.id]);

  // Handle passed initial query
  useEffect(() => {
    if (initialQuery && initialQuery.trim()) {
      handleAskQuestion(initialQuery);
    }
  }, [initialQuery]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleAskQuestion = async (queryText: string) => {
    if (!queryText.trim()) return;

    const userMsg: AIMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      memberId: selectedMember.id,
      text: queryText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    const relevantDocs = documents.filter((d) => d.memberId === selectedMember.id);

    try {
      const res = await fetch('/api/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId: selectedMember.id,
          memberName: selectedMember.name,
          question: queryText,
          recordsContext: {
            conditions: selectedMember.conditionsSummary,
            vitals: selectedMember.vitals,
            allergies: selectedMember.allergies,
            documents: relevantDocs.map((d) => ({
              title: d.title,
              date: d.date,
              type: d.type,
              facility: d.facility,
              summary: d.aiSummary,
              labs: d.extractedData.labResults,
            })),
          },
        }),
      });

      const data = await res.json();
      const structured = data.structuredAnswer;

      const aiMsg: AIMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        memberId: selectedMember.id,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        structuredAnswer: structured,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error('Failed to ask AI:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestedQuestions = [
    'Give me a summary of his health.',
    'What changed in his health over the last year?',
    'What medications is he currently taking?',
    'Show me his diabetes history.',
    'Which reports mention kidney function?',
    'What treatments has he received?',
    'What should we ask the doctor during the next visit?',
    'Why might he be experiencing fatigue?',
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      {/* Header & Member Selector */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Conversational Health Assistant
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Answers are strictly synthesized from uploaded family medical files with exact citations.
          </p>
        </div>

        {/* Member toggle dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Inquiring About:</span>
          <select
            value={selectedMember.id}
            onChange={(e) => {
              const m = members.find((mem) => mem.id === e.target.value);
              if (m) onSelectMember(m);
            }}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500"
          >
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.relationship} • {m.age}y)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Strict Medical Safety Notice Banner */}
      <div className="p-3.5 rounded-xl bg-teal-50/70 border border-teal-200/80 text-xs text-teal-900 flex items-start gap-2.5">
        <ShieldCheck className="w-4 h-4 text-teal-700 flex-shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-bold">Strict Clinical Safety Framework:</span>
          <p className="text-[11px] text-teal-800 leading-relaxed">
            Family Health AI is a records-organization and medical inquiry system, not a diagnostic platform. We never provide clinical diagnoses or instruct dosage adjustments. Always discuss health inquiries with your treating physician.
          </p>
        </div>
      </div>

      {/* Suggested Prompt Chips */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs space-y-2.5">
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          Suggested Inquiries for {selectedMember.name}:
        </div>
        <div className="flex flex-wrap gap-2">
          {suggestedQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleAskQuestion(q)}
              className="px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-teal-50 hover:border-teal-300 border border-slate-200/80 text-slate-700 hover:text-teal-900 text-xs font-medium transition shadow-2xs"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Thread */}
      <div className="space-y-4 min-h-[350px]">
        {messages.map((msg) => {
          if (msg.sender === 'user') {
            return (
              <div key={msg.id} className="flex justify-end">
                <div className="max-w-xl bg-teal-700 text-white rounded-2xl rounded-tr-xs p-4 text-xs shadow-xs space-y-1">
                  <div className="font-semibold">{msg.text}</div>
                  <div className="text-[10px] text-teal-200 text-right">{msg.timestamp}</div>
                </div>
              </div>
            );
          }

          const ans = msg.structuredAnswer;
          if (!ans) return null;

          return (
            <div key={msg.id} className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                <Sparkles className="w-4 h-4" />
              </div>

              <div className="flex-1 bg-white rounded-2xl rounded-tl-xs border border-slate-200/90 shadow-2xs p-5 space-y-4 text-xs">
                {/* Urgent Red Flag Alert (If present) */}
                {ans.urgentAttention && (
                  <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-rose-900 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-xs">Clinical Alert Notice:</span>
                      <p className="text-[11px] text-rose-800 leading-relaxed mt-0.5">
                        {ans.urgentAttention}
                      </p>
                    </div>
                  </div>
                )}

                {/* 1. What your records show */}
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs uppercase tracking-wider">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                    <span>What Your Records Show:</span>
                  </div>
                  <p className="text-slate-700 leading-relaxed pl-5">{ans.recordsShow}</p>
                </div>

                {/* 2. Possible factors */}
                {ans.possibleFactors && (
                  <div className="space-y-1 pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs uppercase tracking-wider">
                      <HelpCircle className="w-3.5 h-3.5 text-teal-600" />
                      <span>Possible Factors & Clinical Associations:</span>
                    </div>
                    <p className="text-slate-700 leading-relaxed pl-5">{ans.possibleFactors}</p>
                  </div>
                )}

                {/* 3. What is uncertain */}
                {ans.whatIsUncertain && (
                  <div className="space-y-1 pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs uppercase tracking-wider">
                      <span className="w-3.5 h-3.5 text-amber-600 font-bold text-center">?</span>
                      <span>Information Uncertain / Not in Records:</span>
                    </div>
                    <p className="text-slate-600 leading-relaxed pl-5 italic">{ans.whatIsUncertain}</p>
                  </div>
                )}

                {/* 4. Discuss with a doctor */}
                {ans.discussWithDoctor && ans.discussWithDoctor.length > 0 && (
                  <div className="space-y-1 pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs uppercase tracking-wider">
                      <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
                      <span>Questions to Discuss with Your Doctor:</span>
                    </div>
                    <ul className="list-disc pl-9 space-y-1 text-slate-700">
                      {ans.discussWithDoctor.map((q, idx) => (
                        <li key={idx} className="leading-relaxed">
                          {q}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 5. Source Citations */}
                {ans.citations && ans.citations.length > 0 && (
                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Cited Source Records:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {ans.citations.map((cit, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 text-[11px] space-y-1"
                        >
                          <div className="flex items-center justify-between font-bold text-slate-800">
                            <span className="truncate">{cit.docTitle}</span>
                            <span className="text-slate-400 font-normal whitespace-nowrap ml-1">
                              {cit.date}
                            </span>
                          </div>
                          <div className="text-slate-600 font-mono text-[10px] truncate">
                            "{cit.quoteSnippet}"
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-1 text-[10px] text-slate-400 flex items-center justify-between">
                  <span>Synthesized by Family Health AI</span>
                  <span>{msg.timestamp}</span>
                </div>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center flex-shrink-0 animate-pulse">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="bg-white rounded-2xl rounded-tl-xs border border-slate-200 p-4 text-xs text-slate-500 flex items-center gap-2">
              <div className="w-4 h-4 rounded-full border-2 border-teal-600 border-t-transparent animate-spin" />
              <span>Analyzing {selectedMember.name}'s medical records and timeline...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="sticky bottom-4 z-20">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAskQuestion(inputQuery);
          }}
          className="p-2 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-lg flex items-center gap-2"
        >
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder={`Ask a question about ${selectedMember.name}'s records, medications, or trends...`}
            className="flex-1 px-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 bg-transparent focus:outline-none"
          />
          <button
            type="submit"
            disabled={!inputQuery.trim() || isLoading}
            className="p-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:bg-slate-200 text-white font-bold transition shadow-xs flex items-center justify-center"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
