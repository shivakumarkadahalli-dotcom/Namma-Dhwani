import { 
  Complaint, 
  CitizenVerificationStatus, 
  ComplaintStatus,
  UserProfile,
  RecurringAssetInsight
} from '../types';
import { 
  INITIAL_COMPLAINTS, 
  RECURRING_ASSETS, 
  DEPARTMENT_OFFICERS_ROSTER,
  autoAssignDepartmentComplaints, 
  assignGrievancesToOfficers 
} from '../data/mockData';
import { validateAndNormalizeGrievance } from '../utils/grievanceWorkflow';

/**
 * Storage keys for runtime grievance state separation.
 */
export const NAMMADHWANI_STORAGE_VERSION_KEY = 'nammadhwani_grievance_data_version';
export const NAMMADHWANI_GRIEVANCE_MUTATIONS_KEY = 'civicloop_grievance_mutations_v5';
export const NAMMADHWANI_RUNTIME_GRIEVANCES_KEY = 'civicloop_runtime_grievances_v5';
export const NAMMADHWANI_UNIFIED_COMPLAINTS_KEY = 'civicloop_complaints_data';
export const CURRENT_STORAGE_VERSION = 5;

/**
 * Immutable Base Grievance Seed (The original 27 mock records).
 */
export const BASE_GRIEVANCES: ReadonlyArray<Complaint> = Object.freeze(
  INITIAL_COMPLAINTS.map((c) => Object.freeze({ ...c }))
);

/**
 * Interface representing a runtime modification to any grievance.
 */
export interface GrievanceMutation {
  status?: ComplaintStatus | string;
  officerEvidenceImage?: string | null;
  officerResolutionNote?: string | null;
  resolutionNotes?: string;
  resolutionDate?: string;
  resolvedByOfficerId?: string;
  resolvedByOfficerName?: string;
  assignedOfficerId?: string;
  assignedOfficerName?: string;
  assignedOfficerDesignation?: string;
  assignedAt?: string;
  citizenVerificationStatus?: CitizenVerificationStatus;
  citizenVerification?: 'fully_fixed' | 'partially_fixed' | 'not_fixed';
  citizenRebuttalNotes?: string | null;
  reopenedCount?: number;
  citizensAffected?: number;
  priorityScore?: number;
  updatedAt?: string;
}

/**
 * Safely reads stored mutations from localStorage.
 */
export function getStoredMutations(): Record<string, GrievanceMutation> {
  try {
    const raw = localStorage.getItem(NAMMADHWANI_GRIEVANCE_MUTATIONS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('[GrievanceStore] Failed to load mutations from storage:', e);
  }
  return {};
}

/**
 * Safely persists mutations to localStorage.
 */
export function saveStoredMutations(mutations: Record<string, GrievanceMutation>): void {
  try {
    localStorage.setItem(NAMMADHWANI_GRIEVANCE_MUTATIONS_KEY, JSON.stringify(mutations));
    localStorage.setItem(NAMMADHWANI_STORAGE_VERSION_KEY, String(CURRENT_STORAGE_VERSION));
  } catch (e) {
    console.warn('[GrievanceStore] Failed to save mutations to storage:', e);
  }
}

/**
 * Safely reads manually created runtime grievances from localStorage.
 */
export function getStoredRuntimeGrievances(): Complaint[] {
  try {
    const raw = localStorage.getItem(NAMMADHWANI_RUNTIME_GRIEVANCES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('[GrievanceStore] Failed to load runtime grievances from storage:', e);
  }
  return [];
}

/**
 * Safely persists manually created runtime grievances to localStorage.
 */
export function saveStoredRuntimeGrievances(runtimeList: Complaint[]): void {
  try {
    localStorage.setItem(NAMMADHWANI_RUNTIME_GRIEVANCES_KEY, JSON.stringify(runtimeList));
    localStorage.setItem(NAMMADHWANI_STORAGE_VERSION_KEY, String(CURRENT_STORAGE_VERSION));
  } catch (e) {
    console.warn('[GrievanceStore] Failed to save runtime grievances to storage:', e);
  }
}

/**
 * Merges Immutable Base Grievances with Runtime Mutations and Runtime Created Grievances.
 * Enforces strict validation and state machine normalization on every record.
 */
export function buildUnifiedGrievances(
  baseList: ReadonlyArray<Complaint> = BASE_GRIEVANCES,
  mutations: Record<string, GrievanceMutation> = getStoredMutations(),
  runtimeList: Complaint[] = getStoredRuntimeGrievances(),
  roster: Record<string, UserProfile[]> = DEPARTMENT_OFFICERS_ROSTER
): Complaint[] {
  // 1. Merge base grievances with mutations
  const normalizedBase = baseList.map((baseGrievance) => {
    const clone: Complaint = { ...baseGrievance };
    const mutation = mutations[clone.id];

    if (mutation) {
      if (mutation.status !== undefined) clone.status = mutation.status as ComplaintStatus;
      if (mutation.officerEvidenceImage !== undefined) clone.officerEvidenceImage = mutation.officerEvidenceImage;
      if (mutation.officerResolutionNote !== undefined) clone.officerResolutionNote = mutation.officerResolutionNote;
      if (mutation.resolutionNotes !== undefined) clone.resolutionNotes = mutation.resolutionNotes;
      if (mutation.resolutionDate !== undefined) clone.resolutionDate = mutation.resolutionDate;
      if (mutation.resolvedByOfficerId !== undefined) clone.resolvedByOfficerId = mutation.resolvedByOfficerId;
      if (mutation.resolvedByOfficerName !== undefined) clone.resolvedByOfficerName = mutation.resolvedByOfficerName;
      if (mutation.assignedOfficerId !== undefined) clone.assignedOfficerId = mutation.assignedOfficerId;
      if (mutation.assignedOfficerName !== undefined) clone.assignedOfficerName = mutation.assignedOfficerName;
      if (mutation.assignedOfficerDesignation !== undefined) clone.assignedOfficerDesignation = mutation.assignedOfficerDesignation;
      if (mutation.assignedAt !== undefined) clone.assignedAt = mutation.assignedAt;
      if (mutation.citizenVerificationStatus !== undefined) clone.citizenVerificationStatus = mutation.citizenVerificationStatus;
      if (mutation.citizenVerification !== undefined) clone.citizenVerification = mutation.citizenVerification;
      if (mutation.citizenRebuttalNotes !== undefined) clone.citizenRebuttalNotes = mutation.citizenRebuttalNotes;
      if (mutation.reopenedCount !== undefined) clone.reopenedCount = mutation.reopenedCount;
      if (mutation.citizensAffected !== undefined) clone.citizensAffected = mutation.citizensAffected;
      if (mutation.priorityScore !== undefined) clone.priorityScore = mutation.priorityScore;
      if (mutation.updatedAt !== undefined) clone.updatedAt = mutation.updatedAt;
    }

    return validateAndNormalizeGrievance(clone);
  });

  // 2. Merge runtime-created grievances with mutations
  const normalizedRuntime = runtimeList.map((runtimeGrievance) => {
    const clone: Complaint = { ...runtimeGrievance };
    const mutation = mutations[clone.id];

    if (mutation) {
      if (mutation.status !== undefined) clone.status = mutation.status as ComplaintStatus;
      if (mutation.officerEvidenceImage !== undefined) clone.officerEvidenceImage = mutation.officerEvidenceImage;
      if (mutation.officerResolutionNote !== undefined) clone.officerResolutionNote = mutation.officerResolutionNote;
      if (mutation.resolutionNotes !== undefined) clone.resolutionNotes = mutation.resolutionNotes;
      if (mutation.resolutionDate !== undefined) clone.resolutionDate = mutation.resolutionDate;
      if (mutation.citizenVerificationStatus !== undefined) clone.citizenVerificationStatus = mutation.citizenVerificationStatus;
      if (mutation.citizenVerification !== undefined) clone.citizenVerification = mutation.citizenVerification;
      if (mutation.citizenRebuttalNotes !== undefined) clone.citizenRebuttalNotes = mutation.citizenRebuttalNotes;
      if (mutation.reopenedCount !== undefined) clone.reopenedCount = mutation.reopenedCount;
      if (mutation.citizensAffected !== undefined) clone.citizensAffected = mutation.citizensAffected;
      if (mutation.priorityScore !== undefined) clone.priorityScore = mutation.priorityScore;
      if (mutation.updatedAt !== undefined) clone.updatedAt = mutation.updatedAt;
    }

    return validateAndNormalizeGrievance(clone);
  });

  // 3. Combine runtime created first, followed by base records
  const combined = [...normalizedRuntime, ...normalizedBase];

  // 4. Ensure consistent officer assignments across all departments
  const assigned = assignGrievancesToOfficers(combined, roster);

  return assigned.map(validateAndNormalizeGrievance);
}

/**
 * Dynamically links live complaints to recurring infrastructure assets.
 */
export function getDynamicRecurringAssets(
  complaintsList: Complaint[],
  baseAssets: RecurringAssetInsight[] = RECURRING_ASSETS
): RecurringAssetInsight[] {
  return baseAssets.map((ast) => {
    const linked = complaintsList.filter((c) => c.assetId === ast.assetId || c.assetId === ast.id);
    const reopened = linked.filter((c) => c.status === 'Reopened' || (c.reopenedCount && c.reopenedCount > 0)).length;

    return {
      ...ast,
      totalComplaints: linked.length > 0 ? linked.length : ast.totalComplaints,
      reopenedCount: reopened,
      linkedGrievances: linked.length > 0 ? linked : ast.linkedGrievances,
    };
  });
}

/**
 * Completely resets all demo modifications and restores pristine seed state.
 */
export function resetAllGrievanceState(): Complaint[] {
  try {
    localStorage.removeItem(NAMMADHWANI_GRIEVANCE_MUTATIONS_KEY);
    localStorage.removeItem(NAMMADHWANI_RUNTIME_GRIEVANCES_KEY);
    localStorage.removeItem(NAMMADHWANI_UNIFIED_COMPLAINTS_KEY);
    localStorage.setItem(NAMMADHWANI_STORAGE_VERSION_KEY, String(CURRENT_STORAGE_VERSION));
  } catch (e) {
    console.warn('[GrievanceStore] Failed to clear localStorage during reset:', e);
  }

  return buildUnifiedGrievances(BASE_GRIEVANCES, {}, [], DEPARTMENT_OFFICERS_ROSTER);
}
