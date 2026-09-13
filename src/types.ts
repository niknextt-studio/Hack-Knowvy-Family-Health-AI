export type HealthStatus = 'healthy' | 'stable' | 'attention';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'member';
  dateOfBirth?: string;
  phone?: string;
  familyId: string;
  avatar?: string;
}

export interface Family {
  id: string;
  name: string;
  adminName: string;
  adminId: string;
  inviteCode: string;
  createdAt: string;
  memberCount: number;
}

export interface FamilyMember {
  id: string;
  memberCode: string; // Unique personal code e.g. "FH-492019" used to personally invite
  name: string;
  age: number;
  dob: string;
  relationship: 'Self' | 'Spouse' | 'Father' | 'Mother' | 'Son' | 'Daughter' | 'Grandmother' | 'Grandfather' | 'Sibling' | 'Other';
  status: HealthStatus;
  statusText: string;
  bloodType: string;
  allergies: string[];
  conditionsSummary: string[];
  avatar: string;
  emergencyContact: string;
  primaryPhysician: string;
  email?: string;
  gender?: 'Male' | 'Female' | 'Non-binary' | 'Other' | 'Prefer not to say' | string;
  medicalHistoryNotes?: string;
  familyId?: string;
  vitals: {
    bloodPressure: string;
    bloodPressureStatus: 'normal' | 'monitoring' | 'elevated';
    hba1c?: string;
    hba1cTrend?: 'improving' | 'stable' | 'elevated';
    ldl?: string;
    ldlTrend?: 'improving' | 'stable' | 'elevated';
    weightKg: number;
    heightCm: number;
    bmi: number;
  };
}

export interface FamilyInvitation {
  id: string;
  familyId: string;
  familyName: string;
  inviterId: string;
  inviterName: string;
  inviterEmail?: string;
  inviterCode: string;
  inviteeId: string;
  inviteeCode: string;
  inviteeName: string;
  proposedRelationship: FamilyMember['relationship'];
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
  note?: string;
}

export interface LabResult {
  name: string;
  value: string;
  numericValue?: number;
  unit: string;
  referenceRange: string;
  status: 'normal' | 'low' | 'elevated' | 'monitoring';
  previousValue?: string;
  previousDate?: string;
  trend?: 'improving' | 'stable' | 'needs_attention';
}

export interface ExtractedMedicalData {
  documentType: string;
  date: string;
  patientName: string;
  doctorName?: string;
  facility?: string;
  labResults: LabResult[];
  diagnosisNotes?: string;
  medicationsDetected?: string[];
  summaryNote?: string;
}

export interface MedicalDocument {
  id: string;
  memberId: string;
  title: string;
  type: 'Blood Test' | 'Prescription' | 'Scan & Imaging' | 'Discharge Summary' | 'Doctor Consultation' | 'Lab Report';
  date: string;
  doctor: string;
  facility: string;
  fileSize: string;
  fileType: 'pdf' | 'jpg' | 'png';
  previewText: string;
  extractedData: ExtractedMedicalData;
  status: 'confirmed' | 'pending_review' | 'rejected';
  aiSummary?: string;
  comparedReportId?: string;
  comparisonNotes?: string;
  uploadDate?: string;
  remarks?: string;
  tags?: string[];
}

export interface MedicalCondition {
  id: string;
  memberId: string;
  name: string;
  dateDiagnosed: string;
  status: 'Active' | 'Managed' | 'Resolved' | 'Under Investigation';
  treatingDoctor: string;
  relatedDocCount: number;
  relatedDocIds: string[];
  treatments: string[];
  notes: string;
}

export interface Medication {
  id: string;
  memberId: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  reason: string;
  prescribingDoctor: string;
  doctorSpecialty?: string;
  facility?: string;
  rxNumber?: string;
  prescribedDate?: string;
  prescriptionDocId?: string;
  prescriptionDocTitle?: string;
  consumptionStatus?: 'active' | 'completed' | 'discontinued' | 'tapered' | 'as_needed';
  durationText?: string;
  adherenceRate?: number;
  instructions?: string;
  notes?: string;
  timing?: string;
  refillsRemaining?: number;
  lastConsumedDate?: string;
  sideEffects?: string;
}

export interface Treatment {
  id: string;
  memberId: string;
  name: string;
  date: string;
  type: 'Surgery' | 'Therapy' | 'Procedure' | 'Lifestyle';
  facility: string;
  doctor: string;
  description: string;
  outcome: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  hospital: string;
  phone: string;
  email: string;
  notes?: string;
  membersUnderCare: string[];
}

export interface Appointment {
  id: string;
  memberId: string;
  doctorName: string;
  doctorTitle?: string;
  specialty: string;
  date: string;
  time: string;
  clinic: string;
  reason: string; // "Why visited" (Chief complaint / clinical objective)
  status: 'upcoming' | 'completed' | 'cancelled';
  // Redesign fields: "What was the report & findings"
  reportSummary?: string; // Summary of what the clinical report or doctor concluded
  diagnosis?: string; // Clinical diagnosis or assessment
  vitalsRecorded?: {
    bloodPressure?: string;
    pulse?: string;
    weight?: string;
    temperature?: string;
    bloodSugar?: string;
  };
  keyFindings?: string[]; // Bulleted takeaways from the report
  prescriptionsGiven?: string[]; // Medications prescribed or renewed
  followUpPlan?: string; // Recommendations, lifestyle advice, or next checkup date
  relatedDocId?: string; // ID of linked document/lab report
  relatedDocTitle?: string; // Display title of the linked report
  visitType?: 'Routine Checkup' | 'Specialist Consultation' | 'Diagnostic Review' | 'Follow-up' | 'Post-Op Review' | 'Urgent Care';
}

export interface TimelineEvent {
  id: string;
  memberId: string;
  date: string;
  year: number;
  month: string;
  eventType: 'document' | 'consultation' | 'surgery' | 'medication_change' | 'diagnosis' | 'lab_test' | 'milestone' | 'investigation';
  title: string;
  description: string;
  doctor?: string;
  treatment?: string;
  relatedDocId?: string;
  notes?: string;
  healthImpact?: string;
  biomarkerChange?: {
    label: string;
    from: string;
    to: string;
    trend: 'improved' | 'stable' | 'needs_attention';
  };
  era?: string;
  facility?: string;
  category?: string;
}

export interface Citation {
  docId?: string;
  docTitle: string;
  date: string;
  quoteSnippet: string;
}

export interface StructuredAIAnswer {
  recordsShow: string;
  possibleFactors: string;
  whatIsUncertain: string;
  discussWithDoctor: string[];
  urgentAttention?: string | null;
  citations: Citation[];
}

export interface AIMessage {
  id: string;
  sender: 'user' | 'ai';
  text?: string;
  timestamp: string;
  memberId?: string;
  structuredAnswer?: StructuredAIAnswer;
  citations?: Citation[];
  analyzedMemberName?: string;
}

export interface PersonalHealthSummary {
  patientName: string;
  age: number;
  generatedDate: string;
  knownConditions: string[];
  medicalHistory: string[];
  currentMedications: { name: string; dosage: string; frequency: string; reason: string }[];
  allergies: string[];
  majorTreatments: string[];
  recentInvestigations: { name: string; date: string; result: string; trend?: string }[];
  healthTrends: string[];
  recentChanges: string[];
  questionsForDoctor: string[];
  dataGaps: string[];
}

export interface DoctorVisitSummary {
  patientName: string;
  age: number;
  generatedDate: string;
  specialty: string;
  doctorName?: string;
  mainConcern: string;
  duration?: string;
  relevantMedicalHistory: string[];
  currentMedications: string[];
  relevantRecentReports: { title: string; date: string; keyFindings: string }[];
  previousRelatedEvents: string[];
  questionsForDoctor: string[];
  disclaimer: string;
}

export interface PrivacyPermission {
  id?: string;
  memberId: string;
  accessLevel?: 'only_me' | 'my_family' | 'selected_members';
  viewAccess?: 'family' | 'self';
  allowedMemberIds: string[];
  sensitiveRecordsHidden?: boolean;
  allowSensitiveRecords?: boolean;
}

export interface ShareLink {
  id: string;
  memberId: string;
  memberName?: string;
  recipientDoctor?: string;
  accessPin?: string;
  accessCode?: string;
  url: string;
  createdAt: string;
  expiresAt: string;
  expiresInHours?: number;
  sections?: {
    summary: boolean;
    reports: boolean;
    medications: boolean;
    conditions: boolean;
    timeline: boolean;
  };
  sectionsIncluded?: string[];
  status?: 'active' | 'expired' | 'revoked';
  isActive?: boolean;
}

export interface NotificationItem {
  id: string;
  type?: 'appointment' | 'document_processed' | 'medication_reminder' | 'summary_generated' | 'family_activity';
  title: string;
  message: string;
  timestamp: string;
  unread: boolean;
  memberId?: string;
  memberName?: string;
}

