/**
 * useOfflineSync Hook
 * 
 * React hook that provides access to offline sync state and operations
 * 
 * Usage:
 *   import { useOfflineSync } from '@/hooks/useOfflineSync'
 *   
 *   function MyComponent() {
 *     const { 
 *       isOnline, 
 *       isSyncing, 
 *       pendingMutations,
 *       syncNow,
 *       clearCache 
 *     } = useOfflineSync()
 *     
 *     return (
 *       <div>
 *         <p>Status: {isOnline ? 'Online' : 'Offline'}</p>
 *         {pendingMutations > 0 && (
 *           <p>Pending changes: {pendingMutations}</p>
 *         )}
 *         <button onClick={syncNow}>Sync Now</button>
 *       </div>
 *     )
 *   }
 */

import { useState, useEffect, useCallback } from 'react';
import { syncService, type SyncState } from '../services/offline/syncService';
import { toast } from 'sonner';

// ===========================
// Hook Interface
// ===========================

export interface UseOfflineSyncReturn {
    /** Whether the app is currently online */
    isOnline: boolean;

    /** Whether a sync is currently in progress */
    isSyncing: boolean;

    /** Timestamp of last successful sync */
    lastSyncedAt: string | null;

    /** Number of pending mutations waiting to be synced */
    pendingMutations: number;

    /** Current sync status */
    syncStatus: 'idle' | 'syncing' | 'error';

    /** Error message if sync failed */
    errorMessage?: string;

    /** Manually trigger a sync */
    syncNow: () => Promise<void>;

    /** Force a full refresh from server (clears cache and re-downloads) */
    forceRefresh: () => Promise<void>;

    /** Clear local cache (keeps pending mutations) */
    clearCache: () => Promise<void>;
}

// ===========================
// Hook Implementation
// ===========================

/**
 * Hook for accessing offline sync state and operations
 */
export function useOfflineSync(): UseOfflineSyncReturn {
    const [syncState, setSyncState] = useState<SyncState>(() => syncService.getState());

    // Subscribe to sync state changes
    useEffect(() => {
        const unsubscribe = syncService.subscribe((newState) => {
            setSyncState(newState);
        });

        return () => {
            unsubscribe();
        };
    }, []);

    // Manually trigger sync
    const syncNow = useCallback(async () => {
        if (!syncState.isOnline) {
            toast.error('Cannot sync while offline', {
                description: 'Please check your internet connection',
            });
            return;
        }

        if (syncState.isSyncing) {
            toast.info('Sync already in progress', {
                description: 'Please wait for the current sync to complete',
            });
            return;
        }

        try {
            await syncService.syncNow();
        } catch (error: any) {
            toast.error('Sync failed', {
                description: error.message || 'Failed to sync data',
            });
        }
    }, [syncState.isOnline, syncState.isSyncing]);

    // Force refresh from server
    const forceRefresh = useCallback(async () => {
        if (!syncState.isOnline) {
            toast.error('Cannot refresh while offline', {
                description: 'Please check your internet connection',
            });
            return;
        }

        try {
            toast.info('Refreshing data...', {
                description: 'Downloading latest data from server',
            });

            await syncService.forceRefresh();

            toast.success('Data refreshed', {
                description: 'Successfully downloaded latest data',
            });
        } catch (error: any) {
            toast.error('Refresh failed', {
                description: error.message || 'Failed to refresh data',
            });
        }
    }, [syncState.isOnline]);

    // Clear cache
    const clearCache = useCallback(async () => {
        try {
            if (syncState.pendingMutations > 0) {
                const confirmed = window.confirm(
                    `You have ${syncState.pendingMutations} pending change(s). ` +
                    'Clearing cache will not affect these changes. Continue?'
                );

                if (!confirmed) {
                    return;
                }
            }

            await syncService.clearCache();

            toast.success('Cache cleared', {
                description: 'Local cache has been cleared',
            });
        } catch (error: any) {
            toast.error('Failed to clear cache', {
                description: error.message || 'An error occurred',
            });
        }
    }, [syncState.pendingMutations]);

    return {
        isOnline: syncState.isOnline,
        isSyncing: syncState.isSyncing,
        lastSyncedAt: syncState.lastSyncedAt,
        pendingMutations: syncState.pendingMutations,
        syncStatus: syncState.syncStatus,
        errorMessage: syncState.errorMessage,
        syncNow,
        forceRefresh,
        clearCache,
    };
}

// ===========================
// Offline Status Hook
// ===========================

/**
 * Simpler hook that only returns online/offline status
 * Useful when you only need to know connectivity status
 */
export function useOnlineStatus(): boolean {
    const [isOnline, setIsOnline] = useState(navigator.onLine);

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
}

export default useOfflineSync;

