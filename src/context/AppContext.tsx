import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { 
  Role, 
  Language, 
  UserProfile, 
  Complaint, 
  VerificationResult,
  RecurringAssetInsight, 
  SystemAlert, 
  NotificationItem, 
  Toast,
  ComplaintStatus,
  CitizenVerificationStatus
} from '../types';
import { 
  INITIAL_USERS, 
  DEPARTMENT_OFFICERS,
  DEPARTMENT_OFFICERS_ROSTER,
  INITIAL_COMPLAINTS, 
  RECURRING_ASSETS, 
  SYSTEM_ALERTS, 
  NOTIFICATIONS,
  autoAssignDepartmentComplaints,
  assignGrievancesToOfficers
} from '../data/mockData';
import {
  useOnlineStatus,
  getOfflineQueue,
  getAllDrafts,
  processOfflineSync,
  GrievanceDraft,
  QueuedComplaint,
} from '../utils/draftSyncStore';
import { getTranslation } from '../utils/translations';
import { 
  validateAndNormalizeGrievance, 
  hasOfficerEvidence, 
  NAMMADHWANI_STORAGE_VERSION_KEY,
  CURRENT_STORAGE_VERSION
} from '../utils/grievanceWorkflow';
import { 
  authenticateOfficerCredentials, 
  AuthValidationResult 
} from '../services/officerAuthService';
import {
  BASE_GRIEVANCES,
  GrievanceMutation,
  getStoredMutations,
  saveStoredMutations,
  getStoredRuntimeGrievances,
  saveStoredRuntimeGrievances,
  buildUnifiedGrievances,
  getDynamicRecurringAssets,
  resetAllGrievanceState
} from '../services/grievanceStore';

interface AppContextType {
  currentPath: string;
  navigate: (path: string) => void;
  isAuthenticated: boolean;
  currentUser: UserProfile | null;
  activeRole: Role | null;
  switchRole: (role: Role, department?: string, authenticatedUser?: UserProfile) => void;
  logout: () => void;
  loginOfficer: (department: string, email: string, password: string) => AuthValidationResult;
  logoutOfficer: () => void;
  switchOfficer: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, fallback?: string) => string;
  updateProfile: (updatedFields: Partial<UserProfile>) => void;
  complaints: Complaint[];
  addComplaint: (newComplaint: Partial<Complaint>) => Complaint;
  updateComplaintStatus: (id: string, status: Complaint['status'], notes?: string, afterImage?: string) => void;
  confirmResolution: (id: string, feedback: 'fully_fixed' | 'partially_fixed' | 'not_fixed', rebuttalNotes?: string) => void;
  supportComplaint: (id: string) => void;
  resetDemoData: () => void;
  recurringAssets: RecurringAssetInsight[];
  alerts: SystemAlert[];
  acknowledgeAlert: (id: string) => void;
  notifications: NotificationItem[];
  markNotificationRead: (id: string) => void;
  clearAllNotifications: () => void;
  toasts: Toast[];
  showToast: (title: string, message?: string, type?: Toast['type']) => void;
  removeToast: (id: string) => void;
  // Officer Roster & Priority Auto-Assignment
  officerRosters: Record<string, UserProfile[]>;
  toggleOfficerAvailability: (officerId: string) => void;
  switchOfficerUser: (officer: UserProfile) => void;
  reassignAllComplaints: () => void;
  // Offline & Service Worker Sync State
  isOnline: boolean;
  offlineQueueCount: number;
  draftsCount: number;
  syncOfflineQueueNow: () => Promise<void>;
  refreshDraftsAndQueue: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Navigation path state initialized from window location hash/pathname
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname || '/';
  });

  const navigate = (path: string) => {
    setCurrentPath(path);
    window.history.pushState({}, '', path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // User & Role State - Restored from localStorage if available
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const savedAuth = localStorage.getItem('civicloop_auth_state');
      if (savedAuth) {
        const parsed = JSON.parse(savedAuth);
        return Boolean(parsed.isAuthenticated);
      }
    } catch (e) {}
    return false;
  });

  const [activeRole, setActiveRole] = useState<Role | null>(() => {
    try {
      const savedAuth = localStorage.getItem('civicloop_auth_state');
      if (savedAuth) {
        const parsed = JSON.parse(savedAuth);
        return (parsed.activeRole as Role) || null;
      }
    } catch (e) {}
    return null;
  });

  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const savedAuth = localStorage.getItem('civicloop_auth_state');
      if (savedAuth) {
        const parsed = JSON.parse(savedAuth);
        if (parsed.activeRole) {
          const savedUser = localStorage.getItem(`civicloop_user_${parsed.activeRole}`);
          if (savedUser) return JSON.parse(savedUser);
          return INITIAL_USERS[parsed.activeRole as Role] || null;
        }
      }
    } catch (e) {}
    return null;
  });

  const [language, setLanguageState] = useState<Language>(() => currentUser?.language || 'en');

  const switchRole = (role: Role, department?: string, authenticatedUser?: UserProfile) => {
    setIsAuthenticated(true);
    setActiveRole(role);
    let userToSet = authenticatedUser || INITIAL_USERS[role] || null;

    if (role === 'officer' && !authenticatedUser) {
      if (department && DEPARTMENT_OFFICERS[department]) {
        userToSet = { ...DEPARTMENT_OFFICERS[department] };
      } else {
        try {
          const savedOfficer = localStorage.getItem('civicloop_user_officer');
          if (savedOfficer) {
            userToSet = JSON.parse(savedOfficer);
          } else {
            userToSet = { ...DEPARTMENT_OFFICERS['Roads & Infrastructure'] };
          }
        } catch (e) {
          userToSet = { ...DEPARTMENT_OFFICERS['Roads & Infrastructure'] };
        }
      }
    } else if (!authenticatedUser) {
      try {
        const savedUser = localStorage.getItem(`civicloop_user_${role}`);
        if (savedUser) {
          userToSet = JSON.parse(savedUser);
        }
      } catch (e) {}
    }

    try {
      if (userToSet) {
        localStorage.setItem(`civicloop_user_${role}`, JSON.stringify(userToSet));
      }
      localStorage.setItem('civicloop_auth_state', JSON.stringify({ isAuthenticated: true, activeRole: role }));
    } catch (e) {
      console.warn('Failed to persist auth state', e);
    }

    setCurrentUser(userToSet);
    if (userToSet?.language) {
      setLanguageState(userToSet.language);
    }
    showToast(`Session Active`, `Logged in as ${role.toUpperCase()}${role === 'officer' && userToSet?.department ? ` (${userToSet.department})` : ''}`, 'info');
    if (role === 'citizen' && (currentPath.startsWith('/officer') || currentPath.startsWith('/admin'))) {
      navigate('/citizen/dashboard');
    } else if (role === 'officer' && (currentPath.startsWith('/citizen') || currentPath.startsWith('/admin'))) {
      navigate('/officer/dashboard');
    } else if (role === 'admin' && (currentPath.startsWith('/citizen') || currentPath.startsWith('/officer'))) {
      navigate('/admin/dashboard');
    }
  };

  const loginOfficer = (department: string, email: string, password: string): AuthValidationResult => {
    const res = authenticateOfficerCredentials(department, email, password);
    if (res.success && res.officer) {
      const targetDept = res.officer.department || department;
      const deptRoster = officerRosters[targetDept] || [];
      const matchedRosterProfile = deptRoster.find(o => o.id === res.officer?.id);
      
      const officerToSet: UserProfile = matchedRosterProfile 
        ? { ...res.officer, isAvailable: matchedRosterProfile.isAvailable }
        : res.officer;

      setIsAuthenticated(true);
      setActiveRole('officer');
      setCurrentUser(officerToSet);

      try {
        localStorage.setItem('civicloop_auth_state', JSON.stringify({ isAuthenticated: true, activeRole: 'officer' }));
        localStorage.setItem('civicloop_user_officer', JSON.stringify(officerToSet));
      } catch (e) {
        console.warn('Failed to persist officer auth', e);
      }

      return { success: true, officer: officerToSet };
    }
    return res;
  };

  const logoutOfficer = () => {
    setIsAuthenticated(false);
    setActiveRole(null);
    setCurrentUser(null);
    try {
      localStorage.removeItem('civicloop_user_officer');
      localStorage.removeItem('civicloop_auth_state');
    } catch (e) {}
    showToast('Logged Out', 'Officer session cleared.', 'info');
    navigate('/officer/dashboard');
  };

  const switchOfficer = () => {
    setIsAuthenticated(false);
    setActiveRole(null);
    setCurrentUser(null);
    try {
      localStorage.removeItem('civicloop_user_officer');
      localStorage.removeItem('civicloop_auth_state');
    } catch (e) {}
    showToast('Switch Officer', 'Please enter officer credentials.', 'info');
    navigate('/officer/dashboard');
  };

  const logout = () => {
    setIsAuthenticated(false);
    setActiveRole(null);
    setCurrentUser(null);
    try {
      localStorage.removeItem('civicloop_auth_state');
    } catch (e) {}
    showToast('Logged Out', 'Session cleared', 'info');
    navigate('/');
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (currentUser) {
      const updated = { ...currentUser, language: lang };
      setCurrentUser(updated);
      try {
        localStorage.setItem(`civicloop_user_${currentUser.role}`, JSON.stringify(updated));
      } catch (e) {}
    }
    showToast(`Language Updated`, `Language changed to ${lang.toUpperCase()}`, 'info');
  };

  const updateProfile = (updatedFields: Partial<UserProfile>) => {
    if (!currentUser) return;
    const updatedUser: UserProfile = {
      ...currentUser,
      ...updatedFields,
    };
    setCurrentUser(updatedUser);
    if (updatedFields.language) {
      setLanguageState(updatedFields.language);
    }
    if (updatedUser.role) {
      try {
        localStorage.setItem(`civicloop_user_${updatedUser.role}`, JSON.stringify(updatedUser));
      } catch (e) {
        console.warn('Failed to save user profile', e);
      }
    }
  };

  // Data Collections with Versioned Storage Migration
  const [officerRosters, setOfficerRosters] = useState<Record<string, UserProfile[]>>(DEPARTMENT_OFFICERS_ROSTER);

  useEffect(() => {
    fetch('/api/officers')
      .then((response) => response.ok ? response.json() : null)
      .then((payload) => {
        if (!Array.isArray(payload?.officers)) return;
        const liveRosters: Record<string, UserProfile[]> = {};
        for (const officer of payload.officers) {
          if (!officer.department) continue;
          const profile: UserProfile = {
            id: officer.id,
            name: officer.name,
            email: '',
            role: 'officer',
            department: officer.department,
            designation: officer.designation || undefined,
            phone: officer.phone || undefined,
            ward: officer.ward || undefined,
            language: officer.language || 'en',
            isAvailable: officer.is_available !== false,
            isSupervisor: officer.is_supervisor === true,
            avatarUrl: officer.avatar_url || undefined,
          };
          (liveRosters[profile.department] ||= []).push(profile);
        }
        if (Object.keys(liveRosters).length > 0) setOfficerRosters(liveRosters);
      })
      .catch(() => undefined);
  }, []);

  // Single Unified Mutable State for ALL Grievances
  const [complaints, setComplaints] = useState<Complaint[]>(() => {
    return buildUnifiedGrievances(
      BASE_GRIEVANCES,
      getStoredMutations(),
      getStoredRuntimeGrievances(),
      DEPARTMENT_OFFICERS_ROSTER
    );
  });

  // Dynamic Recurring Assets derived from live complaints
  const recurringAssets = useMemo<RecurringAssetInsight[]>(() => {
    return getDynamicRecurringAssets(complaints, RECURRING_ASSETS);
  }, [complaints]);

  const [alerts, setAlerts] = useState<SystemAlert[]>(SYSTEM_ALERTS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(NOTIFICATIONS);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toggleOfficerAvailability = (officerId: string) => {
    // Only allow changing the current logged-in officer's availability
    if (currentUser && currentUser.id !== officerId) {
      showToast('Permission Restricted', 'Officers can only modify their own duty availability status.', 'warning');
      return;
    }

    setOfficerRosters((prev) => {
      const nextRoster: Record<string, UserProfile[]> = {};
      let toggledName = '';
      let newStatus = true;

      for (const [dept, officers] of Object.entries(prev)) {
        nextRoster[dept] = (officers as UserProfile[]).map((off) => {
          if (off.id === officerId) {
            toggledName = off.name;
            newStatus = off.isAvailable === false ? true : false;
            return { ...off, isAvailable: newStatus };
          }
          return off;
        });
      }

      // Update current user state if matching
      if (currentUser && currentUser.id === officerId) {
        const updatedCurrentUser = { ...currentUser, isAvailable: newStatus };
        setCurrentUser(updatedCurrentUser);
        try {
          localStorage.setItem(`civicloop_user_${currentUser.role}`, JSON.stringify(updatedCurrentUser));
        } catch (e) {}
      }

      const recomputed = buildUnifiedGrievances(
        BASE_GRIEVANCES,
        getStoredMutations(),
        getStoredRuntimeGrievances(),
        nextRoster
      );
      setComplaints(recomputed);

      showToast(
        `Duty Status Updated`,
        `${toggledName || 'Your status'} is now ${newStatus ? 'AVAILABLE 🟢' : 'UNAVAILABLE 🔴'}.`,
        newStatus ? 'success' : 'info'
      );

      return nextRoster;
    });
  };

  const switchOfficerUser = (officer: UserProfile) => {
    setCurrentUser(officer);
    try {
      localStorage.setItem('civicloop_user_officer', JSON.stringify(officer));
    } catch (e) {}
  };

  const reassignAllComplaints = () => {
    const recomputed = buildUnifiedGrievances(
      BASE_GRIEVANCES,
      getStoredMutations(),
      getStoredRuntimeGrievances(),
      officerRosters
    );
    setComplaints(recomputed);
  };

  // Offline & Service Worker Sync State
  const isOnline = useOnlineStatus();
  const [offlineQueueCount, setOfflineQueueCount] = useState<number>(() => getOfflineQueue().length);
  const [draftsCount, setDraftsCount] = useState<number>(0);

  const refreshDraftsAndQueue = useCallback(() => {
    setOfflineQueueCount(getOfflineQueue().length);
    if (isAuthenticated && activeRole === 'citizen' && currentUser?.id) {
      setDraftsCount(getAllDrafts(currentUser.id).length);
    } else {
      setDraftsCount(0);
    }
  }, [isAuthenticated, activeRole, currentUser]);

  useEffect(() => {
    refreshDraftsAndQueue();
  }, [refreshDraftsAndQueue]);

  // Add Complaint - Clean runtime grievance creation
  const addComplaint = useCallback((data: Partial<Complaint>): Complaint => {
    const newId = `GRV-2026-${Math.floor(100000 + Math.random() * 900000)}`;
    const now = new Date().toISOString();
    const citizenPhoto = data.citizenEvidenceImage !== undefined 
      ? data.citizenEvidenceImage 
      : (data.beforeImages && data.beforeImages.length > 0 ? data.beforeImages[0] : null);

    const rawComplaint: Complaint = {
      id: newId,
      citizenId: currentUser?.id || 'usr-citizen-101',
      citizenName: currentUser?.name || 'Citizen User',
      title: data.title || 'Reported Civic Issue',
      description: data.description || '',
      category: data.category || 'Roads',
      subcategory: data.subcategory || 'General Issue',
      severity: data.severity || 'Medium',
      status: 'Submitted',
      location: data.location || {
        address: 'Indiranagar 100ft Road, Ward 18',
        ward: 'Ward 18 - Indiranagar',
        lat: 12.9784,
        lng: 77.6408,
      },
      department: data.department || 'Roads & Infrastructure',
      aiSummary: data.aiSummary || 'Civic grievance registered and categorized via NammaDhwani AI.',
      citizensAffected: data.citizensAffected || 1,
      priorityScore: data.priorityScore || 65,
      submittedDate: new Date().toISOString().split('T')[0],
      submittedTime: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      createdAt: now,
      updatedAt: now,
      citizenEvidenceImage: citizenPhoto,
      officerEvidenceImage: null, // STRICT: new grievance NEVER has officer evidence
      officerResolutionNote: null,
      resolutionNotes: undefined,
      citizenVerificationStatus: null, // STRICT: verification is null
      citizenVerification: undefined,
      beforeImages: citizenPhoto ? [citizenPhoto] : (data.beforeImages || []),
      originalDescription: data.originalDescription || data.description || '',
      issueType: data.issueType || data.subcategory || 'General Issue',
      slaHours: data.slaHours || 48,
      isRecurring: data.isRecurring || false,
      recurringCount: data.recurringCount || 1,
      assetId: data.assetId,
      slaDeadline: data.slaDeadline || new Date(Date.now() + (data.slaHours || 48) * 3600 * 1000).toISOString(),
      slaStatus: data.slaStatus || 'Within SLA',
      reopenedCount: 0,
      evidence: citizenPhoto ? [citizenPhoto] : [],
      timeline: [],
    };

    const created = validateAndNormalizeGrievance(rawComplaint);

    const runtimeList = getStoredRuntimeGrievances();
    const updatedRuntime = [created, ...runtimeList];
    saveStoredRuntimeGrievances(updatedRuntime);

    const unified = buildUnifiedGrievances(
      BASE_GRIEVANCES,
      getStoredMutations(),
      updatedRuntime,
      officerRosters
    );
    setComplaints(unified);

    // Add notification
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: 'Complaint Created',
      message: `Your grievance ${created.id} (${created.severity} Priority) was submitted and routed to ${created.department}.`,
      timestamp: 'Just now',
      read: false,
      type: 'status_update',
      linkUrl: `/citizen/complaints/${created.id}`,
    };
    setNotifications((prev) => [newNotif, ...prev]);

    // Sync with backend API (Supabase Database + Resend Email Platform Dispatches)
    fetch('/api/complaints', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...created,
        citizenEmail: currentUser?.email || 'citizen@nammadhwani.gov.in',
      }),
    }).catch((err) => console.warn('[AppContext] Background complaint sync warning:', err));

    return created;
  }, [officerRosters, currentUser]);

  // Reset Demo Data to initial 27 mock records
  const resetDemoData = useCallback(() => {
    const cleanList = resetAllGrievanceState();
    setComplaints(cleanList);
    showToast('Demo Data Reset', 'All grievance modifications have been cleared. Restored original 27 mock grievances.', 'info');
  }, []);

  // Sync Offline Queue function
  const syncOfflineQueueNow = useCallback(async () => {
    const queue = getOfflineQueue();
    if (queue.length === 0) return;

    const result = await processOfflineSync((data) => {
      const created = addComplaint(data);
      return created;
    });

    refreshDraftsAndQueue();

    if (result.syncedCount > 0) {
      showToast(
        'Offline Queue Synchronized',
        `${result.syncedCount} offline grievance report${result.syncedCount > 1 ? 's' : ''} submitted successfully!`,
        'success'
      );
    }
  }, [addComplaint, refreshDraftsAndQueue]);

  // Register Service Worker on mount safely in production only
  useEffect(() => {
    try {
      if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
        const isDev = process.env.NODE_ENV !== 'production';
        if (isDev) {
          navigator.serviceWorker.getRegistrations().then((registrations) => {
            registrations.forEach((reg) => {
              reg.unregister().catch(() => {});
            });
          }).catch(() => {});
          return;
        }

        navigator.serviceWorker
          .register('/sw.js')
          .then((reg) => {
            console.log('[Service Worker] Registered successfully with scope:', reg.scope);
          })
          .catch((err) => {
            console.warn('[Service Worker] Registration non-fatal error:', err);
          });

        const handleSWMessage = (event: MessageEvent) => {
          if (event.data && event.data.type === 'PROCESS_OFFLINE_SYNC') {
            syncOfflineQueueNow();
          }
        };

        navigator.serviceWorker.addEventListener('message', handleSWMessage);
        return () => {
          navigator.serviceWorker.removeEventListener('message', handleSWMessage);
        };
      }
    } catch (e) {
      console.warn('[Service Worker] Registration skipped or unavailable:', e);
    }
  }, [syncOfflineQueueNow]);

  // Auto-sync when coming back online
  useEffect(() => {
    refreshDraftsAndQueue();
    if (isOnline) {
      const queue = getOfflineQueue();
      if (queue.length > 0) {
        showToast('Connection Restored', `Syncing ${queue.length} pending offline report(s)...`, 'info');
        syncOfflineQueueNow();
      }
    } else {
      showToast('Offline Mode Active', 'Grievances submitted offline will be saved locally & auto-synced.', 'warning');
    }
  }, [isOnline, syncOfflineQueueNow, refreshDraftsAndQueue]);

  // Toast System
  const showToast = (title: string, message?: string, type: Toast['type'] = 'info') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Update Officer Resolution
  const updateComplaintStatus = (id: string, status: Complaint['status'], notes?: string, afterImage?: string) => {
    const now = new Date().toISOString();
    const currentMutations = getStoredMutations();
    const existingMutation = currentMutations[id] || {};

    const targetComplaint = complaints.find((c) => c.id === id);
    const officerPhoto = afterImage !== undefined ? afterImage : (existingMutation.officerEvidenceImage || targetComplaint?.officerEvidenceImage || null);
    const nextStatus: ComplaintStatus = officerPhoto ? 'Awaiting Verification' : (status as ComplaintStatus);

    const updatedMutation: GrievanceMutation = {
      ...existingMutation,
      status: nextStatus,
      officerEvidenceImage: officerPhoto,
      resolutionNotes: notes || existingMutation.resolutionNotes || targetComplaint?.resolutionNotes || 'Field work completed with proof.',
      officerResolutionNote: notes || existingMutation.officerResolutionNote || targetComplaint?.officerResolutionNote || 'Field work completed with proof.',
      resolutionDate: officerPhoto ? now : (existingMutation.resolutionDate || targetComplaint?.resolutionDate),
      resolvedByOfficerId: currentUser?.id,
      resolvedByOfficerName: currentUser?.name,
      citizenVerificationStatus: null,
      citizenVerification: undefined,
      updatedAt: now,
    };

    const newMutations = {
      ...currentMutations,
      [id]: updatedMutation,
    };

    saveStoredMutations(newMutations);

    const unified = buildUnifiedGrievances(
      BASE_GRIEVANCES,
      newMutations,
      getStoredRuntimeGrievances(),
      officerRosters
    );
    setComplaints(unified);

    showToast(
      'Resolution Evidence Recorded',
      `Grievance ${id} status set to "${nextStatus}". Awaiting citizen verification.`,
      'success'
    );

    // Sync with backend API (Supabase DB + Resend Email Verification Dispatch)
    fetch(`/api/complaints/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: nextStatus,
        officerEvidenceImage: officerPhoto,
        officerResolutionNote: notes || 'Field repair completed with proof.',
        officerName: currentUser?.name || 'Assigned Officer',
        citizenName: targetComplaint?.citizenName || 'Citizen User',
        title: targetComplaint?.title || 'Civic Grievance',
      }),
    }).catch((err) => console.warn('[AppContext] Background resolution status sync warning:', err));
  };

  // Confirm Citizen Resolution Feedback
  const confirmResolution = (id: string, feedback: 'fully_fixed' | 'partially_fixed' | 'not_fixed', rebuttalNotes?: string) => {
    const targetComplaint = complaints.find((c) => c.id === id);
    if (!targetComplaint) {
      showToast('Error', 'Grievance not found.', 'error');
      return;
    }

    if (!targetComplaint.officerEvidenceImage) {
      showToast('Cannot Verify', 'Officer resolution evidence has not yet been submitted for this grievance.', 'warning');
      return;
    }

    const now = new Date().toISOString();
    const currentMutations = getStoredMutations();
    const existingMutation = currentMutations[id] || {};

    const verificationStatus: CitizenVerificationStatus = feedback === 'fully_fixed' 
      ? 'FULLY_FIXED' 
      : (feedback === 'partially_fixed' ? 'PARTIALLY_FIXED' : 'STILL_NOT_FIXED');

    const nextStatus: ComplaintStatus = feedback === 'fully_fixed' 
      ? 'Resolved' 
      : (feedback === 'partially_fixed' ? 'Partially Resolved' : 'Reopened');

    const currentReopenCount = targetComplaint.reopenedCount || 0;
    const nextReopenCount = feedback === 'not_fixed' ? currentReopenCount + 1 : currentReopenCount;

    const updatedMutation: GrievanceMutation = {
      ...existingMutation,
      status: nextStatus,
      citizenVerificationStatus: verificationStatus,
      citizenVerification: feedback,
      citizenRebuttalNotes: rebuttalNotes || null,
      reopenedCount: nextReopenCount,
      updatedAt: now,
    };

    const newMutations = {
      ...currentMutations,
      [id]: updatedMutation,
    };

    saveStoredMutations(newMutations);

    const unified = buildUnifiedGrievances(
      BASE_GRIEVANCES,
      newMutations,
      getStoredRuntimeGrievances(),
      officerRosters
    );
    setComplaints(unified);

    // Sync with backend API (Supabase DB verification state update)
    fetch(`/api/complaints/${id}/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        feedback,
        rebuttalNotes,
        citizenName: currentUser?.name || 'Citizen User',
      }),
    }).catch((err) => console.warn('[AppContext] Background verification sync warning:', err));

    if (feedback === 'fully_fixed') {
      showToast('Resolution Verified', 'Grievance confirmed as Fully Fixed and marked Resolved across all workspaces.', 'success');
    } else if (feedback === 'partially_fixed') {
      showToast('Feedback Logged', 'Grievance marked as Partially Resolved. Follow-up dispatched.', 'info');
    } else {
      showToast('Grievance Reopened', 'Grievance marked Still Not Fixed and escalated back to officer queue.', 'warning');
    }
  };

  // Support Existing Complaint
  const supportComplaint = (id: string) => {
    const currentMutations = getStoredMutations();
    const target = complaints.find((c) => c.id === id);
    if (!target) return;

    const updatedAffected = target.citizensAffected + 1;
    const updatedPriority = Math.min(100, target.priorityScore + 2);

    const updatedMutation: GrievanceMutation = {
      ...(currentMutations[id] || {}),
      citizensAffected: updatedAffected,
      priorityScore: updatedPriority,
    };

    const newMutations = {
      ...currentMutations,
      [id]: updatedMutation,
    };

    saveStoredMutations(newMutations);

    const unified = buildUnifiedGrievances(
      BASE_GRIEVANCES,
      newMutations,
      getStoredRuntimeGrievances(),
      officerRosters
    );
    setComplaints(unified);

    showToast('Added Support', `You supported complaint ${id}. Affected count is now ${updatedAffected}.`, 'info');
  };

  const acknowledgeAlert = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'Acknowledged' as const } : a))
    );
    showToast('Alert Acknowledged', `Alert ID ${id} marked as acknowledged.`, 'info');
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    showToast('Notifications Cleared', 'All notifications cleared.', 'info');
  };

  const t = useCallback(
    (key: string, fallback?: string) => getTranslation(language, key, fallback),
    [language]
  );

  return (
    <AppContext.Provider
      value={{
        currentPath,
        navigate,
        isAuthenticated,
        currentUser,
        activeRole,
        switchRole,
        logout,
        loginOfficer,
        logoutOfficer,
        switchOfficer,
        language,
        setLanguage,
        t,
        updateProfile,
        complaints,
        addComplaint,
        updateComplaintStatus,
        confirmResolution,
        supportComplaint,
        resetDemoData,
        recurringAssets,
        alerts,
        acknowledgeAlert,
        notifications,
        markNotificationRead,
        clearAllNotifications,
        toasts,
        showToast,
        removeToast,
        officerRosters,
        toggleOfficerAvailability,
        switchOfficerUser,
        reassignAllComplaints,
        isOnline,
        offlineQueueCount,
        draftsCount,
        syncOfflineQueueNow,
        refreshDraftsAndQueue,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
