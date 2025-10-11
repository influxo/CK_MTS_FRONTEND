/**
 * Offline Sync Service
 * 
 * Handles bidirectional synchronization between local IndexedDB and remote API
 * 
 * Key responsibilities:
 * 1. Monitor online/offline status
 * 2. Pull data from API and cache locally when online
 * 3. Queue mutations (create/update/delete) when offline
 * 4. Push queued mutations when connection is restored
 * 5. Resolve conflicts using updatedAt timestamps
 * 
 * Usage:
 *   import { syncService } from '@/services/offline/syncService'
 *   
 *   // Initialize on app start
 *   await syncService.initialize()
 *   
 *   // Manually trigger sync
 *   await syncService.syncNow()
 *   
 *   // Check online status
 *   const isOnline = syncService.isOnline()
 */

import { db, type PendingMutation } from '../../db/db';
import axiosInstance from '../axiosInstance';
import { toast } from 'sonner';
import type { Project } from '../projects/projectModels';
import type { Activity } from '../activities/activityModels';

// ===========================
// Type Definitions
// ===========================

export type SyncStatus = 'idle' | 'syncing' | 'error';

export interface SyncState {
    isOnline: boolean;
    isSyncing: boolean;
    lastSyncedAt: string | null;
    pendingMutations: number;
    syncStatus: SyncStatus;
    errorMessage?: string;
}

export type SyncEventType =
    | 'online'
    | 'offline'
    | 'sync-start'
    | 'sync-complete'
    | 'sync-error'
    | 'status-change';

export type SyncEventListener = (state: SyncState) => void;

// ===========================
// Sync Service Class
// ===========================

class SyncService {
    private syncState: SyncState = {
        isOnline: navigator.onLine,
        isSyncing: false,
        lastSyncedAt: null,
        pendingMutations: 0,
        syncStatus: 'idle',
    };

    private listeners: Set<SyncEventListener> = new Set();
    private syncInProgress = false;
    private syncInterval: number | null = null;
    private isInitialized = false;

    /**
     * Initialize the sync service
     * Sets up event listeners and performs initial sync
     */
    async initialize(): Promise<void> {
        if (this.isInitialized) {
            console.log('Sync service already initialized');
            return;
        }

        console.log('Initializing offline sync service...');

        // Set up online/offline event listeners
        window.addEventListener('online', this.handleOnline);
        window.addEventListener('offline', this.handleOffline);

        // Update initial state
        await this.updatePendingMutationsCount();

        // Perform initial sync if online
        if (this.syncState.isOnline) {
            // Don't await - let it happen in background
            this.syncFromServer().catch(error => {
                console.error('Initial sync failed:', error);
            });
        }

        // Set up periodic sync (every 5 minutes when online)
        this.startPeriodicSync(5 * 60 * 1000);

        this.isInitialized = true;
        console.log(' Sync service initialized');
    }

    /**
     * Clean up listeners and intervals
     */
    destroy() {
        window.removeEventListener('online', this.handleOnline);
        window.removeEventListener('offline', this.handleOffline);

        if (this.syncInterval !== null) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
        }

        this.listeners.clear();
        this.isInitialized = false;
    }

    /**
     * Subscribe to sync state changes
     */
    subscribe(listener: SyncEventListener): () => void {
        this.listeners.add(listener);

        // Immediately call with current state
        listener(this.getState());

        // Return unsubscribe function
        return () => {
            this.listeners.delete(listener);
        };
    }

    /**
     * Get current sync state
     */
    getState(): SyncState {
        return { ...this.syncState };
    }

    /**
     * Check if currently online
     */
    isOnline(): boolean {
        return this.syncState.isOnline;
    }

    /**
     * Check if sync is in progress
     */
    isSyncing(): boolean {
        return this.syncState.isSyncing;
    }

    /**
     * Manually trigger a sync
     */
    async syncNow(): Promise<void> {
        if (!this.syncState.isOnline) {
            throw new Error('Cannot sync while offline');
        }

        if (this.syncInProgress) {
            console.log('Sync already in progress, skipping...');
            return;
        }

        try {
            await this.performSync();
        } catch (error) {
            console.error('Manual sync failed:', error);
            throw error;
        }
    }

    /**
     * Force a full refresh from server
     * Clears local cache and re-downloads everything
     */
    async forceRefresh(): Promise<void> {
        if (!this.syncState.isOnline) {
            throw new Error('Cannot refresh while offline');
        }

        console.log('Force refreshing from server...');

        // Clear synced data (keep pending mutations)
        await this.clearSyncedData();

        // Re-download everything
        await this.syncFromServer();

        console.log(' Force refresh complete');
    }

    /**
     * Clear local cache
     * Keeps pending mutations but removes cached data
     */
    async clearCache(): Promise<void> {
        console.log(' Clearing local cache...');
        await this.clearSyncedData();

        this.updateState({
            lastSyncedAt: null,
        });

        this.notifyListeners();
        console.log('Cache cleared');
    }

    /**
     * Add a mutation to the pending queue
     */
    async queueMutation(mutation: Omit<PendingMutation, 'id' | 'createdAt' | 'retryCount'>): Promise<string> {
        const id = crypto?.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;

        const pendingMutation: PendingMutation = {
            ...mutation,
            id,
            createdAt: new Date().toISOString(),
            retryCount: 0,
        };

        await db.pendingMutations.add(pendingMutation);
        await this.updatePendingMutationsCount();

        console.log('Queued mutation:', mutation.operation, mutation.entityType, mutation.entityId);

        // Try to sync immediately if online
        if (this.syncState.isOnline && !this.syncInProgress) {
            this.performSync().catch(error => {
                console.error('Auto-sync after queue failed:', error);
            });
        }

        return id;
    }

    // ===========================
    // Private Methods
    // ===========================

    private handleOnline = async () => {
        console.log('Connection restored');

        this.updateState({
            isOnline: true,
        });

        this.notifyListeners();

        // Show toast notification
        toast.success('Back online', {
            description: 'Syncing your changes...',
        });

        // Trigger sync
        await this.performSync();

        // After pushing queued mutations and a light pull, optionally run a deeper background sync
        try {
            const mod = await import('./completeSyncService');
            const complete = (mod as any).completeSyncService;
            if (complete && typeof complete.syncAllData === 'function') {
                // Fire and forget
                complete.syncAllData().catch((e: any) => console.warn('Background complete sync failed:', e));
            }
        } catch (e) {
            // ignore if module path differs or not available in certain builds
        }
    };

    private handleOffline = () => {
        console.log('Connection lost');

        this.updateState({
            isOnline: false,
        });

        this.notifyListeners();

        // Show toast notification
        toast.info('You are offline', {
            description: 'Changes will be synced when connection is restored',
        });
    };

    private startPeriodicSync(intervalMs: number) {
        if (this.syncInterval !== null) {
            clearInterval(this.syncInterval);
        }

        this.syncInterval = window.setInterval(() => {
            if (this.syncState.isOnline && !this.syncInProgress) {
                this.performSync().catch(error => {
                    console.error('Periodic sync failed:', error);
                });
            }
        }, intervalMs);
    }

    private async performSync(): Promise<void> {
        if (this.syncInProgress) {
            return;
        }

        this.syncInProgress = true;

        this.updateState({
            isSyncing: true,
            syncStatus: 'syncing',
        });

        this.notifyListeners();

        try {
            // Step 1: Push pending mutations to server
            await this.syncPendingChanges();

            // Step 2: Pull fresh data from server
            await this.syncFromServer();

            // Step 3: Update sync state
            this.updateState({
                isSyncing: false,
                syncStatus: 'idle',
                lastSyncedAt: new Date().toISOString(),
                errorMessage: undefined,
            });

            console.log(' Sync completed successfully');
        } catch (error: any) {
            console.error('Sync failed:', error);

            this.updateState({
                isSyncing: false,
                syncStatus: 'error',
                errorMessage: error.message || 'Sync failed',
            });

            // Show error toast
            toast.error('Sync failed', {
                description: error.message || 'Failed to sync data',
            });
        } finally {
            this.syncInProgress = false;
            this.notifyListeners();
        }
    }

    /**
     * Pull data from server and cache locally
     */
    private async syncFromServer(): Promise<void> {
        console.log('Syncing from server...');

        try {
            // Fetch projects
            const projectsResponse = await axiosInstance.get<{ success: boolean; data: Project[] }>('/projects');

            if (projectsResponse.data.success && projectsResponse.data.data) {
                const projects = projectsResponse.data.data;

                // Store in local DB
                for (const project of projects) {
                    await db.projects.put({
                        ...project,
                        synced: true,
                        _localUpdatedAt: new Date().toISOString(),
                    });
                }

                console.log(` Cached ${projects.length} projects`);
            }

            // Update sync metadata
            await db.syncMetadata.put({
                entityType: 'projects',
                lastSyncedAt: new Date().toISOString(),
                status: 'idle',
            });

            // Fetch form templates
            try {
                const templatesResponse = await axiosInstance.get<{ success: boolean; data: any[] }>('/forms/templates');

                if (templatesResponse.data.success && templatesResponse.data.data) {
                    const templates = templatesResponse.data.data;

                    for (const template of templates) {
                        await db.formTemplates.put({
                            ...template,
                            synced: true,
                            _localUpdatedAt: new Date().toISOString(),
                        });
                    }

                    console.log(` Cached ${templates.length} form templates`);
                }

                await db.syncMetadata.put({
                    entityType: 'formTemplates',
                    lastSyncedAt: new Date().toISOString(),
                    status: 'idle',
                });
            } catch (error) {
                console.warn('Failed to sync form templates:', error);
            }

            // Note: Activities are typically loaded per subproject, so we don't fetch all activities here
            // The app should call syncActivitiesForSubproject(subprojectId) when viewing a subproject

        } catch (error: any) {
            console.error('Failed to sync from server:', error);
            throw error;
        }
    }

    /**
     * Push pending mutations to server
     */
    private async syncPendingChanges(): Promise<void> {
        const pendingMutations = await db.pendingMutations.orderBy('createdAt').toArray();

        if (pendingMutations.length === 0) {
            console.log(' No pending changes to sync');
            return;
        }

        console.log(`Syncing ${pendingMutations.length} pending changes...`);

        let successCount = 0;
        let failureCount = 0;

        for (const mutation of pendingMutations) {
            try {
                // Execute the mutation
                let response;

                switch (mutation.method) {
                    case 'POST':
                        response = await axiosInstance.post(mutation.endpoint, mutation.data);
                        break;
                    case 'PUT':
                        response = await axiosInstance.put(mutation.endpoint, mutation.data);
                        break;
                    case 'DELETE':
                        response = await axiosInstance.delete(mutation.endpoint);
                        break;
                }

                // Mark entity as synced in local DB
                if (mutation.operation !== 'delete') {
                    await this.markEntityAsSynced(mutation.entityType, mutation.entityId, response?.data);
                }

                // Remove from pending queue
                await db.pendingMutations.delete(mutation.id);

                successCount++;
                console.log(` Synced ${mutation.operation} ${mutation.entityType} ${mutation.entityId}`);
            } catch (error: any) {
                failureCount++;
                console.error(`Failed to sync ${mutation.operation} ${mutation.entityType}:`, error);

                // Update retry count and error
                await db.pendingMutations.update(mutation.id, {
                    retryCount: mutation.retryCount + 1,
                    lastError: error.message || 'Unknown error',
                });

                // If too many retries, we might want to remove or flag it
                if (mutation.retryCount >= 5) {
                    console.error(`Mutation ${mutation.id} has failed ${mutation.retryCount} times`);
                }
            }
        }

        await this.updatePendingMutationsCount();

        console.log(` Sync complete: ${successCount} succeeded, ${failureCount} failed`);

        if (successCount > 0) {
            toast.success('Changes synced', {
                description: `${successCount} change(s) synced successfully`,
            });
        }
    }

    /**
     * Mark an entity as synced in local DB
     */
    private async markEntityAsSynced(
        entityType: string,
        entityId: string,
        serverData?: any
    ): Promise<void> {
        let table;

        switch (entityType) {
            case 'project':
                table = db.projects;
                break;
            case 'activity':
                table = db.activities;
                break;
            case 'beneficiary':
                table = db.beneficiaries;
                break;
            case 'subproject':
                table = db.subprojects;
                break;
            case 'formTemplate':
                table = db.formTemplates;
                break;
            case 'formSubmission':
                table = db.formSubmissions;
                break;
            default:
                console.warn(`Unknown entity type: ${entityType}`);
                return;
        }

        const now = new Date().toISOString();

        // Update the entity with server data if available
        if (serverData?.data) {
            const newRecord = { ...serverData.data, synced: true, _localUpdatedAt: now };
            const newId = (serverData.data as any)?.id;

            // If this was a create with a temporary ID, remove the temp and insert the server record
            const isTemp = typeof entityId === 'string' && entityId.startsWith('temp-');
            if (isTemp && newId && newId !== entityId) {
                try {
                    await table.delete(entityId);
                } catch {}
            }

            await table.put(newRecord);
        } else {
            // Just mark as synced on the existing record
            await table.update(entityId, {
                synced: true,
                _localUpdatedAt: now,
            });
        }
    }

    /**
     * Clear synced data (keep pending mutations)
     */
    private async clearSyncedData(): Promise<void> {
        await db.transaction('rw', [db.projects, db.activities, db.beneficiaries, db.subprojects, db.formTemplates, db.formSubmissions], async () => {
            // Only delete synced records
            await db.projects.filter(p => p.synced === true).delete();
            await db.activities.filter(a => a.synced === true).delete();
            await db.beneficiaries.filter(b => b.synced === true).delete();
            await db.subprojects.filter(s => s.synced === true).delete();
            await db.formTemplates.filter(t => t.synced === true).delete();
            await db.formSubmissions.filter(s => s.synced === true).delete();
        });
    }

    /**
     * Update pending mutations count
     */
    private async updatePendingMutationsCount(): Promise<void> {
        const count = await db.getPendingMutationsCount();
        this.updateState({ pendingMutations: count });
    }

    /**
     * Update sync state
     */
    private updateState(partial: Partial<SyncState>): void {
        this.syncState = {
            ...this.syncState,
            ...partial,
        };
    }

    /**
     * Notify all listeners of state change
     */
    private notifyListeners(): void {
        const state = this.getState();
        this.listeners.forEach(listener => {
            try {
                listener(state);
            } catch (error) {
                console.error('Error in sync listener:', error);
            }
        });
    }

    /**
     * Sync activities for a specific subproject
     * Call this when user opens a subproject
     */
    async syncActivitiesForSubproject(subprojectId: string): Promise<void> {
        if (!this.syncState.isOnline) {
            console.log('Offline - using cached activities');
            return;
        }

        try {
            const response = await axiosInstance.get<{ success: boolean; data: Activity[] }>(
                `/activities/subproject/${subprojectId}`
            );

            if (response.data.success && response.data.data) {
                const activities = response.data.data;

                for (const activity of activities) {
                    await db.activities.put({
                        ...activity,
                        synced: true,
                        _localUpdatedAt: new Date().toISOString(),
                    });
                }

                console.log(` Cached ${activities.length} activities for subproject ${subprojectId}`);
            }
        } catch (error) {
            console.error('Failed to sync activities:', error);
        }
    }
}

// ===========================
// Singleton Export
// ===========================

/**
 * Singleton instance of the sync service
 * Import this in your app initialization and components
 */
export const syncService = new SyncService();

export default syncService;

