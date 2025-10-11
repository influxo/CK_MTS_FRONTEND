import { useEffect, useState } from 'react';
import { syncService, type SyncState } from '../services/offline/syncService';

/**
 * Hook to monitor offline/online status and sync state
 * 
 * Usage:
 *   const { isOnline, isSyncing, pendingMutations, lastSyncedAt } = useOfflineStatus()
 */
export function useOfflineStatus() {
    const [syncState, setSyncState] = useState<SyncState>(syncService.getState());

    useEffect(() => {
        // Subscribe to sync state changes
        const unsubscribe = syncService.subscribe((state) => {
            setSyncState(state);
        });

        // Cleanup subscription on unmount
        return () => {
            unsubscribe();
        };
    }, []);

    return {
        isOnline: syncState.isOnline,
        isSyncing: syncState.isSyncing,
        pendingMutations: syncState.pendingMutations,
        lastSyncedAt: syncState.lastSyncedAt,
        syncStatus: syncState.syncStatus,
        errorMessage: syncState.errorMessage,
    };
}

export default useOfflineStatus;
