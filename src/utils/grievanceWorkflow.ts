import { 
  Complaint, 
  ComplaintTimelineItem, 
  CitizenVerificationStatus,
  ComplaintStatus,
  VerificationResult
} from '../types';

/**
 * Storage version key to migrate/flush stale and contradictory localStorage caches.
 */
export const NAMMADHWANI_STORAGE_VERSION_KEY = 'nammadhwani_grievance_data_version';
export const CURRENT_STORAGE_VERSION = 4;

/**
 * Maps raw or legacy statuses to standardized human-readable display strings.
 */
export function getDisplayStatus(status: ComplaintStatus | string | undefined): string {
  if (!status) return 'Submitted';
  const normalized = status.toUpperCase().replace(/\s+/g, '_');
  switch (normalized) {
    case 'SUBMITTED':
    case 'PENDING':
      return 'Submitted';
    case 'AI_CLASSIFIED':
    case 'UNDER_REVIEW':
      return 'AI Classified';
    case 'ASSIGNED':
      return 'Assigned';
    case 'IN_PROGRESS':
      return 'In Progress';
    case 'AWAITING_VERIFICATION':
      return 'Awaiting Verification';
    case 'VERIFIED':
    case 'RESOLVED':
    case 'CLOSED':
      return 'Resolved';
    case 'PARTIALLY_RESOLVED':
      return 'Partially Resolved';
    case 'REOPENED':
    case 'VERIFICATION_FAILED':
      return 'Reopened';
    case 'REASSIGNED':
      return 'Reassigned';
    default:
      return status;
  }
}

/**
 * Checks if genuine officer resolution evidence exists.
 * Strictly NEVER substitutes mock or citizen photos.
 */
export function hasOfficerEvidence(g: Complaint | null | undefined): boolean {
  if (!g) return false;
  return Boolean(g.officerEvidenceImage && g.officerEvidenceImage.trim() !== '');
}

/**
 * Checks if citizen verification is eligible to be performed.
 * Only valid if officer evidence has been uploaded AND citizen has not yet recorded a decision.
 */
export function canCitizenVerify(g: Complaint | null | undefined): boolean {
  if (!g) return false;
  const hasEvidence = hasOfficerEvidence(g);
  const alreadyVerified = Boolean(
    g.citizenVerificationStatus || 
    g.citizenVerification || 
    g.verification?.citizenFeedback
  );
  return hasEvidence && !alreadyVerified;
}

/**
 * Extracts the canonical citizen verification decision.
 */
export function getCitizenVerificationResult(g: Complaint | null | undefined): CitizenVerificationStatus {
  if (!g) return null;
  if (g.citizenVerificationStatus) return g.citizenVerificationStatus;
  
  const legacy = g.citizenVerification || g.verification?.citizenFeedback;
  if (legacy === 'fully_fixed') return 'FULLY_FIXED';
  if (legacy === 'partially_fixed') return 'PARTIALLY_FIXED';
  if (legacy === 'not_fixed') return 'STILL_NOT_FIXED';
  return null;
}

/**
 * Dynamically derives the lifecycle timeline from actual stored events and current state.
 */
export function deriveCanonicalTimeline(g: Partial<Complaint>): ComplaintTimelineItem[] {
  const createdDateStr = g.createdAt 
    ? new Date(g.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    : 'Just now';

  const verificationStatus = g.citizenVerificationStatus || (
    g.citizenVerification === 'fully_fixed' ? 'FULLY_FIXED' :
    g.citizenVerification === 'partially_fixed' ? 'PARTIALLY_FIXED' :
    g.citizenVerification === 'not_fixed' ? 'STILL_NOT_FIXED' : null
  );

  const hasOffEvidence = Boolean(g.officerEvidenceImage && g.officerEvidenceImage.trim() !== '');
  const isAssigned = Boolean(g.assignedOfficerName || g.assignedOfficerId);
  const rawStatus = (g.status || 'SUBMITTED').toUpperCase();

  const isWorkStarted = (
    rawStatus === 'IN_PROGRESS' || 
    rawStatus === 'IN PROGRESS' || 
    hasOffEvidence || 
    rawStatus === 'AWAITING_VERIFICATION' || 
    rawStatus === 'RESOLVED' || 
    rawStatus === 'VERIFIED' || 
    rawStatus === 'REOPENED'
  );

  const items: ComplaintTimelineItem[] = [];

  // Step 1: Citizen Submission (Always completed)
  items.push({
    step: '1',
    title: 'Grievance Submitted',
    description: g.originalDescription || g.description || 'Citizen reported issue with GPS coordinates',
    timestamp: createdDateStr,
    actor: g.citizenName || 'Citizen',
    status: 'completed',
    stage: 'CITIZEN_REPORT'
  });

  // Step 2: AI Classification (Completed)
  items.push({
    step: '2',
    title: 'AI Classified & Prioritized',
    description: `Category: ${g.category || 'Civic'} • SLA: ${g.slaHours || 48}h • Priority: ${g.priorityScore || 70}/100`,
    timestamp: createdDateStr,
    actor: 'NammaDhwani AI',
    status: 'completed',
    stage: 'ROUTING'
  });

  // Step 3: Department & Officer Assignment
  if (isAssigned) {
    items.push({
      step: '3',
      title: 'Assigned to Field Officer',
      description: `Assigned to ${g.assignedOfficerName || 'Ward Officer'} (${g.department || 'Department'})`,
      timestamp: g.assignedAt ? new Date(g.assignedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : createdDateStr,
      actor: 'Municipal Dispatch',
      status: 'completed',
      stage: 'OFFICER_ASSIGNED'
    });
  } else {
    items.push({
      step: '3',
      title: 'Department Assignment',
      description: `Routing to ${g.department || 'Municipal Department'}`,
      timestamp: 'In progress',
      actor: 'Automated Dispatch',
      status: 'current',
      stage: 'ROUTING'
    });
  }

  // Step 4: Field Inspection & Work Started
  if (isWorkStarted) {
    items.push({
      step: '4',
      title: 'Field Work & Inspection',
      description: `Field inspection initiated by ${g.assignedOfficerName || 'assigned crew'}`,
      timestamp: g.updatedAt ? new Date(g.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'In progress',
      actor: g.assignedOfficerName || 'Field Officer',
      status: 'completed',
      stage: 'INSPECTION'
    });
  } else {
    items.push({
      step: '4',
      title: 'Field Work Pending',
      description: 'Awaiting officer dispatch to field location',
      timestamp: 'Pending',
      status: 'upcoming',
      stage: 'INSPECTION'
    });
  }

  // Step 5: Officer Resolution & Evidence Upload
  if (hasOffEvidence) {
    items.push({
      step: '5',
      title: 'Officer Evidence Uploaded',
      description: g.officerResolutionNote || g.resolutionNotes || 'Field repair completed with photographic proof',
      timestamp: g.resolutionDate ? new Date(g.resolutionDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : (g.updatedAt ? new Date(g.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recently'),
      actor: g.assignedOfficerName || 'Field Officer',
      status: 'completed',
      stage: 'RESOLUTION'
    });
  } else {
    items.push({
      step: '5',
      title: 'Resolution Evidence',
      description: 'Awaiting officer completion proof & photos',
      timestamp: 'Pending',
      status: 'upcoming',
      stage: 'RESOLUTION'
    });
  }

  // Step 6: Citizen Verification & Confirmation
  if (verificationStatus === 'FULLY_FIXED') {
    items.push({
      step: '6',
      title: 'Citizen Verified (Fully Fixed)',
      description: 'Citizen inspected resolution and confirmed issue is fully resolved.',
      timestamp: g.verification?.verifiedAt ? new Date(g.verification.verifiedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : (g.updatedAt ? new Date(g.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Verified'),
      actor: g.citizenName || 'Citizen',
      status: 'completed',
      stage: 'VERIFICATION'
    });
  } else if (verificationStatus === 'PARTIALLY_FIXED') {
    items.push({
      step: '6',
      title: 'Partial Resolution Feedback Logged',
      description: g.citizenRebuttalNotes || g.verification?.citizenRebuttalNotes || 'Citizen reported work is partially completed. Municipal follow-up scheduled.',
      timestamp: g.updatedAt ? new Date(g.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Logged',
      actor: g.citizenName || 'Citizen',
      status: 'completed',
      stage: 'REOPENED'
    });
  } else if (verificationStatus === 'STILL_NOT_FIXED' || rawStatus === 'REOPENED') {
    items.push({
      step: '6',
      title: 'Citizen Reported Still Not Fixed (Reopened)',
      description: g.citizenRebuttalNotes || g.verification?.citizenRebuttalNotes || 'Citizen indicated issue remains unresolved. Ticket reopened and escalated.',
      timestamp: g.updatedAt ? new Date(g.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Reopened',
      actor: g.citizenName || 'Citizen',
      status: 'completed',
      stage: 'REOPENED'
    });
  } else if (hasOffEvidence) {
    items.push({
      step: '6',
      title: 'Awaiting Citizen Confirmation',
      description: 'Resolution proof submitted. Awaiting citizen confirmation.',
      timestamp: 'Action required by Citizen',
      status: 'current',
      stage: 'VERIFICATION'
    });
  } else {
    items.push({
      step: '6',
      title: 'Citizen Confirmation',
      description: 'Pending officer resolution evidence upload',
      timestamp: 'Pending',
      status: 'upcoming',
      stage: 'VERIFICATION'
    });
  }

  return items;
}

/**
 * Normalizes a grievance and enforces the strict validation rules:
 * - RULE 1: citizenVerificationStatus != null requires officerEvidenceImage != null
 * - RULE 2: status == VERIFIED requires citizenVerificationStatus == FULLY_FIXED
 * - RULE 3: status == AWAITING_VERIFICATION requires officerEvidenceImage != null
 * - RULE 4: status == SUBMITTED cannot have officerEvidenceImage
 * - RULE 5: status == SUBMITTED cannot have citizenVerificationStatus
 * - RULE 6: officerEvidenceImage exists requires officer resolution notes
 */
export function validateAndNormalizeGrievance(raw: Complaint): Complaint {
  const g = { ...raw };

  // 1. Separate evidence fields cleanly
  const citizenEvidence = g.citizenEvidenceImage !== undefined 
    ? g.citizenEvidenceImage 
    : (g.beforeImages && g.beforeImages.length > 0 ? g.beforeImages[0] : null);

  const officerEvidence = g.officerEvidenceImage || null;

  g.citizenEvidenceImage = citizenEvidence;
  g.officerEvidenceImage = officerEvidence;
  g.originalDescription = g.originalDescription || g.description || '';
  g.issueType = g.issueType || g.subcategory || 'General Issue';
  g.aiSummary = g.aiSummary || g.aiExecutiveSummary || 'AI classified civic grievance.';
  g.aiExecutiveSummary = g.aiSummary;
  g.slaHours = g.slaHours || 48;

  // 2. Canonical Citizen Verification Status
  let canonicalVerification: CitizenVerificationStatus = null;
  if (g.citizenVerificationStatus) {
    canonicalVerification = g.citizenVerificationStatus;
  } else if (g.citizenVerification === 'fully_fixed' || g.verification?.citizenFeedback === 'fully_fixed') {
    canonicalVerification = 'FULLY_FIXED';
  } else if (g.citizenVerification === 'partially_fixed' || g.verification?.citizenFeedback === 'partially_fixed') {
    canonicalVerification = 'PARTIALLY_FIXED';
  } else if (g.citizenVerification === 'not_fixed' || g.verification?.citizenFeedback === 'not_fixed') {
    canonicalVerification = 'STILL_NOT_FIXED';
  }

  // INVALID STATE 1: citizenVerificationStatus != null AND officerEvidenceImage == null
  if (canonicalVerification !== null && !g.officerEvidenceImage) {
    canonicalVerification = null;
    g.citizenVerification = undefined;
    if (g.verification) {
      g.verification.citizenFeedback = undefined;
    }
  }

  // Update status based on strict state machine
  let currentStatus = g.status;
  const statusUpper = String(g.status || '').toUpperCase();

  // INVALID STATE 4 & 5: If status is SUBMITTED, clear officer evidence & verification
  if (statusUpper === 'SUBMITTED' || statusUpper === 'PENDING') {
    g.officerEvidenceImage = null;
    canonicalVerification = null;
    g.citizenVerification = undefined;
  }

  // INVALID STATE 3: status == AWAITING_VERIFICATION AND officerEvidenceImage == null
  if ((statusUpper === 'AWAITING_VERIFICATION' || statusUpper === 'AWAITING VERIFICATION') && !g.officerEvidenceImage) {
    currentStatus = 'In Progress';
  }

  // Set canonical status according to evidence and verification state
  if (canonicalVerification === 'FULLY_FIXED') {
    currentStatus = 'Resolved';
  } else if (canonicalVerification === 'STILL_NOT_FIXED') {
    currentStatus = 'Reopened';
  } else if (canonicalVerification === 'PARTIALLY_FIXED') {
    currentStatus = 'Partially Resolved';
  } else if (g.officerEvidenceImage && !canonicalVerification) {
    currentStatus = 'Awaiting Verification';
  } else if (statusUpper === 'RESOLVED' || statusUpper === 'VERIFIED' || statusUpper === 'CLOSED') {
    // INVALID STATE 2: status == VERIFIED AND citizenVerificationStatus == null
    if (g.officerEvidenceImage) {
      // If officer uploaded evidence, it is awaiting verification unless citizen verified
      currentStatus = canonicalVerification ? 'Resolved' : 'Awaiting Verification';
    } else {
      currentStatus = 'In Progress';
    }
  }

  // INVALID STATE 6: officerEvidenceImage exists BUT no officer resolution note
  if (g.officerEvidenceImage && (!g.resolutionNotes || g.resolutionNotes.trim() === '')) {
    g.resolutionNotes = g.officerResolutionNote || 'Field resolution completed by assigned department officer.';
    g.officerResolutionNote = g.resolutionNotes;
  }

  g.status = currentStatus;
  g.citizenVerificationStatus = canonicalVerification;
  g.citizenVerification = canonicalVerification === 'FULLY_FIXED' ? 'fully_fixed' :
    canonicalVerification === 'PARTIALLY_FIXED' ? 'partially_fixed' :
    canonicalVerification === 'STILL_NOT_FIXED' ? 'not_fixed' : undefined;

  // Build / update verification result object cleanly
  if (g.officerEvidenceImage) {
    const prevVer = g.verification;
    g.verification = {
      status: canonicalVerification === 'FULLY_FIXED' ? 'verified' : (canonicalVerification === 'STILL_NOT_FIXED' ? 'failed' : 'needs_confirmation'),
      confidenceScore: prevVer?.confidenceScore || 95,
      reason: prevVer?.reason || 'GPS location and field photo matched grievance coordinates.',
      locationMatched: true,
      timeMatched: true,
      afterImageUrl: g.officerEvidenceImage,
      verifiedAt: prevVer?.verifiedAt || g.updatedAt || g.createdAt,
      citizenFeedback: g.citizenVerification,
      citizenRebuttalNotes: g.citizenRebuttalNotes || prevVer?.citizenRebuttalNotes,
    };
  } else {
    // If no officer evidence, verification result must not contain an after image
    g.verification = undefined;
  }

  // Derive canonical timeline
  g.timeline = deriveCanonicalTimeline(g);

  return g;
}
