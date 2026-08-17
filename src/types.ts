export type Role = 'citizen' | 'officer' | 'admin';

export type Language = 'en' | 'hi' | 'kn' | 'ta' | 'te' | 'bn' | 'mr' | 'ml';

export const DEPARTMENT_OPTIONS = [
  'Stormwater Drainage',
  'Roads & Infrastructure',
  'Waste Management',
  'Water Supply',
  'Street Lighting',
] as const;

export type DepartmentOption = typeof DEPARTMENT_OPTIONS[number];

export type ComplaintCategory = 
  | 'Roads' 
  | 'Waste' 
  | 'Water' 
  | 'Electricity' 
  | 'Drainage' 
  | 'Streetlight'
  | 'Other';

export type Category = ComplaintCategory | string;

export type Severity = 'Low' | 'Medium' | 'High' | 'Critical';

export type CitizenVerificationStatus = 'FULLY_FIXED' | 'PARTIALLY_FIXED' | 'STILL_NOT_FIXED' | null;

export type CanonicalGrievanceState = 
  | 'SUBMITTED'
  | 'AI_CLASSIFIED'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'AWAITING_VERIFICATION'
  | 'VERIFIED'
  | 'REOPENED'
  | 'REASSIGNED';

export type ComplaintStatus = 
  | 'Submitted'
  | 'Under Review'
  | 'Assigned'
  | 'In Progress' 
  | 'Awaiting Verification'
  | 'Resolved' 
  | 'Verification Failed' 
  | 'Reopened' 
  | 'Closed'
  | 'Partially Resolved'
  | 'Pending'
  | 'SUBMITTED'
  | 'AI_CLASSIFIED'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'AWAITING_VERIFICATION'
  | 'VERIFIED'
  | 'REOPENED'
  | 'REASSIGNED';

export type SLAStatus = 'Within SLA' | 'Breached' | 'Resolved Within SLA' | 'Resolved Post SLA';

export type VerificationStatus = 'verified' | 'needs_confirmation' | 'failed' | 'pending';

export interface UserProfile {
  id: string;
  name: string;
  designation?: string;
  email: string;
  role: Role;
  department?: string;
  phone?: string;
  language: Language;
  avatarUrl?: string;
  ward?: string;
  isAvailable?: boolean;
  isSupervisor?: boolean;
  assignedCount?: number;
  resolvedCount?: number;
  pendingCount?: number;
  reopenedCount?: number;
  slaBreachCount?: number;
  workloadStatus?: 'Optimal' | 'High' | 'Overloaded';
}

export interface ComplaintLocation {
  address: string;
  ward: string;
  lat: number;
  lng: number;
}

export interface VerificationResult {
  status: VerificationStatus;
  confidenceScore: number;
  reason: string;
  locationMatched: boolean;
  timeMatched: boolean;
  afterImageUrl?: string;
  verifiedAt?: string;
  citizenFeedback?: 'fully_fixed' | 'partially_fixed' | 'not_fixed';
  citizenRebuttalNotes?: string;
  citizenRebuttalImageUrl?: string;
}

export interface ComplaintTimelineItem {
  step: string;
  title: string;
  description: string;
  timestamp: string;
  actor?: string;
  status: 'completed' | 'current' | 'upcoming';
  stage?: 'CITIZEN_REPORT' | 'ROUTING' | 'OFFICER_ASSIGNED' | 'INSPECTION' | 'ACTION_TAKEN' | 'RESOLUTION' | 'VERIFICATION' | 'REOPENED';
}

export interface Complaint {
  id: string;
  citizenId: string;
  citizenName?: string;
  title: string;
  description: string;
  originalDescription?: string;

  category: ComplaintCategory;
  subcategory: string;
  issueType?: string;
  department: string;

  location: ComplaintLocation;
  ward?: string;

  citizenEvidenceImage?: string | null;
  officerEvidenceImage?: string | null;

  priorityScore: number; // 0-100
  severity: Severity;
  slaHours?: number;
  slaDeadline: string; // ISO date string
  slaStatus: SLAStatus;

  status: ComplaintStatus;

  assignedOfficer?: string;
  assignedOfficerId?: string;
  assignedOfficerName?: string;
  assignedOfficerDesignation?: string;
  assignedAt?: string;

  resolvedByOfficerId?: string;
  resolvedByOfficerName?: string;

  aiExecutiveSummary?: string;
  aiSummary: string;

  officerResolutionNote?: string | null;
  resolutionNotes?: string;
  resolutionDate?: string;

  citizenVerificationStatus?: CitizenVerificationStatus;
  citizenVerification?: 'fully_fixed' | 'partially_fixed' | 'not_fixed' | null;
  citizenRebuttalNotes?: string | null;

  citizensAffected: number;
  submittedDate: string;
  submittedTime: string;
  createdAt: string;
  updatedAt: string;

  beforeImages: string[];
  audioRecordingUrl?: string;
  isRecurring: boolean;
  recurringCount: number;
  assetId?: string;
  reopenedCount: number;
  evidence?: string[];
  assignmentRoutingReason?: string;
  timeline: ComplaintTimelineItem[];
  verification?: VerificationResult;
  photos?: string[];
  reopened?: boolean;
  reopenCount?: number;
  recurringAssetId?: string;
}

export interface HistoricalGrievanceRecord {
  id: string;
  citizenLabel: string;
  title: string;
  date: string;
  status: ComplaintStatus;
  assignedOfficer: string;
  actionTaken: string;
  reopenReason?: string;
  reopenedDate?: string;
}

export interface RecurringAssetInsight {
  id: string;
  assetId: string;
  assetType: string; // e.g. 'Stormwater Culvert & Drain', 'Arterial Road Segment'
  locationName: string;
  ward: string;
  department: string;
  lat: number;
  lng: number;
  totalComplaints: number;
  reopenedCount: number;
  avgRepairTimeDays: number;
  riskScore: number; // 0 - 100
  riskLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  aiRootCause: string;
  recommendedFix: string;
  estimatedCost: string;
  estimatedRecurringCost: string;
  potentialSavings: string;
  roiPeriod: string;
  confidenceScore: number; // 0-100
  lastInspected: string;
  repairHistory: { date: string; action: string; cost: string }[];
  linkedGrievances: Complaint[];
  reopeningHistory: { date: string; stage: string; note: string; officerName?: string }[];
}

export interface DepartmentSummary {
  name: string;
  active: number;
  resolved: number;
  resolutionRate: number; // percentage e.g. 100, 0
  slaBreaches: number;
  historicalReopened: number;
  status: 'Stable' | 'Critical' | 'Needs Attention';
  headOfficerName: string;
  description: string;
  totalOfficers: number;
}

export interface SystemAlert {
  id: string;
  type: 'emerging_issue' | 'verification_spike' | 'sla_breach' | 'system_maintenance';
  title: string;
  description: string;
  ward: string;
  timestamp: string;
  status: 'New' | 'Acknowledged' | 'Resolved';
  severity: 'Critical' | 'Warning' | 'Info';
  actionUrl?: string;
}

export interface DepartmentStat {
  name: string;
  performancePct: number;
  totalComplaints: number;
  resolvedCount: number;
  avgResolutionDays: number;
  slaCompliancePct: number;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'status_update' | 'verification_request' | 'insight_alert' | 'assignment';
  linkUrl?: string;
}

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
}
