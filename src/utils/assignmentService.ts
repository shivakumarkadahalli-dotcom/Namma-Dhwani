import { Complaint, UserProfile } from '../types';

/**
 * Global Severity & Priority Weighting
 * CRITICAL -> HIGH -> MEDIUM -> LOW
 */
export const SEVERITY_PRIORITY_MAP: Record<string, number> = {
  CRITICAL: 1,
  Critical: 1,
  HIGH: 2,
  High: 2,
  MEDIUM: 3,
  Medium: 3,
  LOW: 4,
  Low: 4,
};

export const getSeverityWeight = (severity?: string): number => {
  if (!severity) return 3;
  return SEVERITY_PRIORITY_MAP[severity] || 3;
};

/**
 * Deterministic tie-breaker comparator for grievances
 * Sorts by:
 * 1. Severity Rank (Critical=1 -> High=2 -> Medium=3 -> Low=4)
 * 2. Priority Score (Highest score first: 100 -> 0)
 * 3. SLA Breach urgency (Breached first)
 * 4. Created Date (Oldest first)
 * 5. Complaint ID (Alphabetical string compare for absolute deterministic stability)
 */
export const sortGrievancesByPriority = (complaints: Complaint[]): Complaint[] => {
  return [...complaints].sort((a, b) => {
    // 1. Severity
    const sevA = getSeverityWeight(a.severity);
    const sevB = getSeverityWeight(b.severity);
    if (sevA !== sevB) return sevA - sevB;

    // 2. Priority Score
    const scoreA = typeof a.priorityScore === 'number' ? a.priorityScore : 50;
    const scoreB = typeof b.priorityScore === 'number' ? b.priorityScore : 50;
    if (scoreA !== scoreB) return scoreB - scoreA;

    // 3. SLA Breach status (Breached higher priority)
    const isBreachedA = a.slaStatus === 'Breached' ? 1 : 0;
    const isBreachedB = b.slaStatus === 'Breached' ? 1 : 0;
    if (isBreachedA !== isBreachedB) return isBreachedB - isBreachedA;

    // 4. Submission date/time (older tickets first)
    const timeA = new Date(a.createdAt || a.submittedDate || '2026-01-01').getTime();
    const timeB = new Date(b.createdAt || b.submittedDate || '2026-01-01').getTime();
    if (timeA !== timeB) return timeA - timeB;

    // 5. Stable ID tie-breaker (guarantees pure determinism without Math.random)
    return (a.id || '').localeCompare(b.id || '');
  });
};

/**
 * Standardizes department name matching (handles case and whitespace variances)
 */
export const normalizeDeptName = (deptName?: string): string => {
  if (!deptName) return '';
  return deptName.trim().toLowerCase();
};

/**
 * Finds matching department officers from rosters dictionary
 */
export const getOfficersForDepartment = (
  department: string,
  rosters: Record<string, UserProfile[]>
): UserProfile[] => {
  if (!department) return [];

  // Direct lookup
  if (rosters[department]) {
    return rosters[department];
  }

  // Normalized fuzzy lookup
  const normTarget = normalizeDeptName(department);
  for (const [deptKey, officerList] of Object.entries(rosters)) {
    const normKey = normalizeDeptName(deptKey);
    if (normKey === normTarget || normKey.includes(normTarget) || normTarget.includes(normKey)) {
      return officerList;
    }
  }

  return [];
};

/**
 * Global Centralized Officer Assignment & Load-Balancing Engine
 * 
 * Rules:
 * 1. Consistent across all departments (Drainage, Roads, Waste, Water, Street Lighting, etc.).
 * 2. Department isolation: Officers only receive tickets from their department.
 * 3. Deterministic: Pure function with stable ordering, no Math.random.
 * 4. Balanced load: Difference between available officers is <= 1 ticket.
 * 5. Priority-aware: Critical grievances are distributed evenly first, followed by High, Medium, Low.
 * 6. Availability-aware: Unavailable officers receive 0 new/active tickets.
 */
export function assignGrievancesToOfficers(
  complaints: Complaint[],
  rosters: Record<string, UserProfile[]>
): Complaint[] {
  if (!complaints || complaints.length === 0) return [];
  if (!rosters || Object.keys(rosters).length === 0) return complaints;

  // Group complaints by department
  const complaintsByDept: Record<string, Complaint[]> = {};
  const departmentKeys = Object.keys(rosters);

  // Initialize department complaint lists
  for (const dept of departmentKeys) {
    complaintsByDept[dept] = [];
  }

  // Assign complaints to department buckets
  const unmappedComplaints: Complaint[] = [];

  for (const complaint of complaints) {
    const matchedDept = departmentKeys.find((d) => {
      const normD = normalizeDeptName(d);
      const normC = normalizeDeptName(complaint.department);
      return normD === normC || normD.includes(normC) || normC.includes(normD);
    });

    if (matchedDept) {
      complaintsByDept[matchedDept].push(complaint);
    } else {
      unmappedComplaints.push(complaint);
    }
  }

  const updatedComplaints: Complaint[] = [];

  // Process each department independently to ensure strict department isolation
  for (const [deptName, deptComplaints] of Object.entries(complaintsByDept)) {
    if (deptComplaints.length === 0) continue;

    const allOfficers = rosters[deptName] || [];
    if (allOfficers.length === 0) {
      updatedComplaints.push(...deptComplaints);
      continue;
    }

    // Identify active available officers
    const availableOfficers = allOfficers.filter((o) => o.isAvailable !== false);

    // If no officers are available in this department, retain existing officer information
    if (availableOfficers.length === 0) {
      updatedComplaints.push(...deptComplaints);
      continue;
    }

    // Sort available officers deterministically by ID so assignment round-robin order is stable
    const sortedOfficers = [...availableOfficers].sort((a, b) => a.id.localeCompare(b.id));

    // Sort department grievances deterministically: Critical -> High -> Medium -> Low
    const sortedDeptComplaints = sortGrievancesByPriority(deptComplaints);

    // Track active assigned load and critical tickets per officer
    const officerLoad: Record<string, number> = {};
    const officerCriticalLoad: Record<string, number> = {};
    for (const officer of sortedOfficers) {
      officerLoad[officer.id] = 0;
      officerCriticalLoad[officer.id] = 0;
    }

    // Balanced assignment loop
    // For each complaint, assign to the available officer with the lowest total load.
    // If tied, prefer officer with the lowest critical load, then lower index in sorted roster.
    const deptAssignedComplaints: Complaint[] = [];

    for (const c of sortedDeptComplaints) {
      const isCritical = getSeverityWeight(c.severity) === 1 || (c.priorityScore || 0) >= 90;

      // Find the available officer with minimum load
      let bestOfficer = sortedOfficers[0];
      let minLoad = officerLoad[bestOfficer.id];
      let minCritLoad = officerCriticalLoad[bestOfficer.id];

      for (let i = 1; i < sortedOfficers.length; i++) {
        const off = sortedOfficers[i];
        const load = officerLoad[off.id];
        const critLoad = officerCriticalLoad[off.id];

        if (load < minLoad) {
          bestOfficer = off;
          minLoad = load;
          minCritLoad = critLoad;
        } else if (load === minLoad) {
          // If total load is tied and ticket is critical, prefer officer with fewer critical tickets
          if (isCritical && critLoad < minCritLoad) {
            bestOfficer = off;
            minCritLoad = critLoad;
          }
        }
      }

      // Increment tracking load
      officerLoad[bestOfficer.id] += 1;
      if (isCritical) {
        officerCriticalLoad[bestOfficer.id] += 1;
      }

      // Build updated complaint with assigned officer details and auto-dispatch notes
      const assignedComplaint: Complaint = {
        ...c,
        department: deptName, // Ensure exact department naming
        assignedOfficerId: bestOfficer.id,
        assignedOfficerName: bestOfficer.name,
        assignedOfficerDesignation: bestOfficer.designation || 'Field Municipal Inspector',
        assignedAt: c.assignedAt || c.createdAt || new Date().toISOString(),
        assignmentRoutingReason: `Deterministically routed to ${bestOfficer.name} (${deptName}) based on load-balancing algorithm and active duty availability.`,
      };

      deptAssignedComplaints.push(assignedComplaint);
    }

    updatedComplaints.push(...deptAssignedComplaints);
  }

  // Combine processed department complaints and preserve original ID ordering where possible
  const idMap = new Map<string, Complaint>();
  for (const c of [...updatedComplaints, ...unmappedComplaints]) {
    idMap.set(c.id, c);
  }

  // Return complaints preserving original sequence
  return complaints.map((orig) => idMap.get(orig.id) || orig);
}

/**
 * Returns workload analytics for a specific department
 */
export function getDepartmentWorkloadStats(
  complaints: Complaint[],
  officers: UserProfile[]
): {
  officerStats: Array<{
    officer: UserProfile;
    totalTickets: number;
    criticalTickets: number;
    resolvedTickets: number;
    pendingTickets: number;
  }>;
  maxLoadDiff: number;
  isBalanced: boolean;
} {
  const availableOfficers = officers.filter((o) => o.isAvailable !== false);
  const officerStats = officers.map((officer) => {
    const officerTickets = complaints.filter((c) => c.assignedOfficerId === officer.id);
    const criticalTickets = officerTickets.filter(
      (c) => getSeverityWeight(c.severity) === 1 || (c.priorityScore || 0) >= 85
    ).length;
    const resolvedTickets = officerTickets.filter(
      (c) => c.status === 'Resolved' || c.status === 'Closed'
    ).length;
    const pendingTickets = officerTickets.length - resolvedTickets;

    return {
      officer,
      totalTickets: officerTickets.length,
      criticalTickets,
      resolvedTickets,
      pendingTickets,
    };
  });

  const availableLoads = officerStats
    .filter((s) => s.officer.isAvailable !== false)
    .map((s) => s.totalTickets);

  const maxLoad = availableLoads.length > 0 ? Math.max(...availableLoads) : 0;
  const minLoad = availableLoads.length > 0 ? Math.min(...availableLoads) : 0;
  const maxLoadDiff = maxLoad - minLoad;

  return {
    officerStats,
    maxLoadDiff,
    isBalanced: maxLoadDiff <= 1,
  };
}
