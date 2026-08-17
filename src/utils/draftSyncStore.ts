import { useState, useEffect } from 'react';
import { Category, Complaint } from '../types';

export interface GrievanceDraft {
  id: string;
  userId?: string;
  title: string;
  description: string;
  category: Category;
  subcategory: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  department: string;
  address: string;
  lat: number;
  lng: number;
  uploadedPhotos: string[];
  reportMethod: 'text' | 'voice';
  language: string;
  updatedAt: string;
}

export interface QueuedComplaint {
  id: string;
  draftId?: string;
  complaintData: Partial<Complaint>;
  queuedAt: string;
  attempts: number;
  status: 'pending' | 'syncing' | 'failed';
  lastError?: string;
}

const STORAGE_KEY_DRAFTS = 'civicloop_grievance_drafts';
const STORAGE_KEY_QUEUE = 'civicloop_offline_queue';

// Save or Update a Draft
export const saveDraft = (
  draftData: Omit<GrievanceDraft, 'id' | 'updatedAt'> & { id?: string; userId?: string }
): GrievanceDraft => {
  const existingDrafts = getAllDrafts();
  const id = draftData.id || `draft_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
  const now = new Date().toISOString();

  const completeDraft: GrievanceDraft = {
    ...draftData,
    id,
    updatedAt: now,
  };

  const existingIndex = existingDrafts.findIndex((d) => d.id === id);
  let updatedDrafts: GrievanceDraft[];

  if (existingIndex >= 0) {
    updatedDrafts = [...existingDrafts];
    updatedDrafts[existingIndex] = completeDraft;
  } else {
    updatedDrafts = [completeDraft, ...existingDrafts];
  }

  try {
    localStorage.setItem(STORAGE_KEY_DRAFTS, JSON.stringify(updatedDrafts));
  } catch (e) {
    console.error('Failed to save draft to localStorage:', e);
  }

  return completeDraft;
};

// Retrieve All Saved Drafts (optionally filtered by userId)
export const getAllDrafts = (userId?: string): GrievanceDraft[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DRAFTS);
    if (raw) {
      const parsed: GrievanceDraft[] = JSON.parse(raw);
      if (userId) {
        return parsed.filter((d) => !d.userId || d.userId === userId);
      }
      return parsed;
    }
  } catch (e) {
    console.error('Failed to parse grievance drafts:', e);
  }
  return [];
};

// Get a single draft by ID
export const getDraftById = (id: string): GrievanceDraft | null => {
  const drafts = getAllDrafts();
  return drafts.find((d) => d.id === id) || null;
};

// Delete a draft by ID
export const deleteDraft = (id: string): void => {
  const drafts = getAllDrafts();
  const filtered = drafts.filter((d) => d.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY_DRAFTS, JSON.stringify(filtered));
  } catch (e) {
    console.error('Failed to delete draft:', e);
  }
};

// Clear all drafts
export const clearAllDrafts = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY_DRAFTS);
  } catch (e) {
    console.error('Failed to clear drafts:', e);
  }
};

// Queue a Complaint for Offline Sync when network is unavailable
export const addToOfflineQueue = (
  complaintData: Partial<Complaint>,
  draftId?: string
): QueuedComplaint => {
  const existingQueue = getOfflineQueue();
  const queueId = `queue_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
  
  const newItem: QueuedComplaint = {
    id: queueId,
    draftId,
    complaintData,
    queuedAt: new Date().toISOString(),
    attempts: 0,
    status: 'pending',
  };

  const updated = [newItem, ...existingQueue];

  try {
    localStorage.setItem(STORAGE_KEY_QUEUE, JSON.stringify(updated));
    if (draftId) {
      deleteDraft(draftId);
    }
  } catch (e) {
    console.error('Failed to update offline queue:', e);
  }

  // Request SW background sync if supported
  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    navigator.serviceWorker.ready.then((reg) => {
      // @ts-ignore - Background sync API
      reg.sync.register('sync-grievances').catch((err) => {
        console.log('Background sync registration optional fallback:', err);
      });
    });
  }

  return newItem;
};

// Get Offline Submission Queue
export const getOfflineQueue = (): QueuedComplaint[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_QUEUE);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to parse offline queue:', e);
  }
  return [];
};

// Remove item from Offline Queue
export const removeFromOfflineQueue = (id: string): void => {
  const queue = getOfflineQueue();
  const filtered = queue.filter((item) => item.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY_QUEUE, JSON.stringify(filtered));
  } catch (e) {
    console.error('Failed to remove queue item:', e);
  }
};

// Clear whole Offline Queue
export const clearOfflineQueue = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY_QUEUE);
  } catch (e) {
    console.error('Failed to clear offline queue:', e);
  }
};

// Process / Sync Offline Queue
export const processOfflineSync = async (
  addComplaintFn: (data: Partial<Complaint>) => Complaint
): Promise<{ syncedCount: number; errors: string[] }> => {
  const queue = getOfflineQueue();
  if (queue.length === 0) return { syncedCount: 0, errors: [] };

  let syncedCount = 0;
  const errors: string[] = [];

  for (const item of queue) {
    try {
      // Execute registration via AppContext / Backend
      addComplaintFn(item.complaintData);
      removeFromOfflineQueue(item.id);
      syncedCount++;
    } catch (err: any) {
      console.error(`Failed to sync queued item ${item.id}:`, err);
      errors.push(err.message || 'Unknown sync failure');
    }
  }

  return { syncedCount, errors };
};

// React Hook for Online / Offline Connectivity
export const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
};
