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
     * Apply server ID remapping for records created offline with a temporary ID
     */
    private async applyServerIdMapping(entityType: string, tempId: string, serverId: string): Promise<void> {
        let table: any;
        switch (entityType) {
            case 'project': table = db.projects; break;
            case 'activity': table = db.activities; break;
            case 'beneficiary': table = db.beneficiaries; break;
            case 'subproject': table = db.subprojects; break;
            case 'formTemplate': table = db.formTemplates; break;
            case 'formSubmission': table = db.formSubmissions; break;
            case 'service': table = db.services; break;
            case 'user': table = db.users; break;
            case 'projectUser': table = db.projectUsers; break;
            case 'subprojectUser': table = db.subprojectUsers; break;
            case 'entityService': table = db.entityServices; break;
            default:
                return;
        }
        const existing = await table.get(tempId);
        if (!existing) return;
        const now = new Date().toISOString();
        const copy = { ...existing, id: serverId, synced: true, _localUpdatedAt: now };
        try { await table.delete(tempId); } catch {}
        await table.put(copy);
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
            // Determine delta vs full
            const metaAll = await db.syncMetadata.get('all');
            const since = metaAll?.lastSyncedAt;
            const body: any = since ? { since } : { full: true };

            const resp = await axiosInstance.post<any>('/sync/pull', body);
            const payload = resp?.data || {};
            const data = payload?.data || {};
            const now = new Date().toISOString();

            // Build template associations map
            const assocByTemplate = new Map<string, any[]>();
            const fea = Array.isArray(data.formEntityAssociations) ? data.formEntityAssociations : [];
            for (const a of fea) {
                const tid = String(a.formTemplateId);
                const list = assocByTemplate.get(tid) || [];
                list.push({
                    formTemplateId: tid,
                    entityId: a.entityId,
                    entityType: a.entityType,
                    updatedAt: a.updatedAt,
                    createdAt: a.createdAt,
                });
                assocByTemplate.set(tid, list);
            }

            await db.transaction('rw', [
                db.projects,
                db.subprojects,
                db.activities,
                db.formTemplates,
                db.services,
                db.users,
                db.projectUsers,
                db.subprojectUsers,
                db.entityServices,
                db.beneficiaries,
                db.activityUsers,
                db.serviceDeliveries,
                db.roles,
                db.permissions,
                db.rolePermissions,
                db.userRoles,
                db.formFields,
                db.kpis,
                db.beneficiaryDetails,
                db.beneficiaryAssignments,
                db.beneficiaryMappings,
                db.beneficiaryMatchKeys,
                db.formSubmissions,
                db.syncMetadata,
            ], async () => {
                // Upsert helpers
                const upsert = async (table: any, items: any[]) => {
                    if (!Array.isArray(items) || items.length === 0) return;
                    for (const it of items) {
                        await table.put({ ...it, synced: true, _localUpdatedAt: now });
                    }
                };

                await upsert(db.projects, data.projects || []);
                await upsert(db.subprojects, data.subprojects || []);
                await upsert(db.activities, data.activities || []);

                // Attach associations to templates before upsert
                const templates = Array.isArray(data.formTemplates) ? data.formTemplates : [];
                for (const t of templates) {
                    const tid = String(t.id);
                    const associations = assocByTemplate.get(tid) || [];
                    (t as any).entityAssociations = associations;
                    await db.formTemplates.put({ ...t, synced: true, _localUpdatedAt: now });
                }

                await upsert(db.services, data.services || []);
                await upsert(db.entityServices, data.entityServices || []);
                await upsert(db.users, data.users || []);
                await upsert(db.projectUsers, data.projectUsers || []);
                await upsert(db.subprojectUsers, data.subprojectUsers || []);
                await upsert(db.beneficiaries, data.beneficiaries || []);
                await upsert(db.activityUsers, data.activityUsers || []);
                await upsert(db.serviceDeliveries, data.serviceDeliveries || []);
                await upsert(db.roles, data.roles || []);
                await upsert(db.permissions, data.permissions || []);
                await upsert(db.rolePermissions, data.rolePermissions || []);
                await upsert(db.userRoles, data.userRoles || []);
                await upsert(db.formFields, data.formFields || []);
                await upsert(db.kpis, data.kpis || []);
                await upsert(db.beneficiaryDetails, data.beneficiaryDetails || []);
                await upsert(db.beneficiaryAssignments, data.beneficiaryAssignments || []);
                await upsert(db.beneficiaryMappings, data.beneficiaryMappings || []);
                await upsert(db.beneficiaryMatchKeys, data.beneficiaryMatchKeys || []);

                // Map formResponses -> formSubmissions
                const responses = Array.isArray(data.formResponses) ? data.formResponses : [];
                for (const r of responses) {
                    await db.formSubmissions.put({
                        id: r.id,
                        templateId: r.formTemplateId,
                        entityId: r.entityId,
                        entityType: r.entityType,
                        data: r.data,
                        submittedBy: r.submittedBy,
                        submittedAt: r.submittedAt,
                        beneficiaryId: r.beneficiaryId || null,
                        createdAt: r.createdAt,
                        updatedAt: r.updatedAt,
                        synced: true,
                        _localUpdatedAt: now,
                    } as any);
                }

                // Update sync metadata (global)
                await db.syncMetadata.put({ entityType: 'all', lastSyncedAt: now, status: 'idle' });
            });

            console.log('Cached snapshot via /sync/pull');
        } catch (error: any) {
            console.error('Failed to sync from server:', error);
            throw error;
        }
    }

    private async syncPendingChanges(): Promise<void> {
        const pendingMutations = await db.pendingMutations.orderBy('createdAt').toArray();

        if (pendingMutations.length === 0) {
            console.log(' No pending changes to sync');
            return;
        }

        console.log(`Syncing ${pendingMutations.length} pending changes (batch)...`);

        // Build batch payload
        const metaAll = await db.syncMetadata.get('all');
        const changes = pendingMutations.map(m => ({
            clientMutationId: m.id,
            entityType: m.entityType,
            operation: m.operation,
            method: m.method,
            endpoint: m.endpoint,
            entityId: m.entityId,
            data: m.data,
        }));

        let successCount = 0;
        let failureCount = 0;
        const fallback: typeof pendingMutations = [];

        try {
            const resp = await axiosInstance.post<any>('/sync/push', {
                lastSyncedAt: metaAll?.lastSyncedAt,
                changes,
            });
            const results: Array<any> = Array.isArray(resp?.data?.results) ? resp.data.results : [];

            // Map results by clientMutationId
            const byId = new Map(results.map(r => [r.clientMutationId, r]));
            for (const m of pendingMutations) {
                const r = byId.get(m.id);
                if (!r) { fallback.push(m); continue; }
                if (r.status === 'applied') {
                    // Handle serverId remap for creates
                    if (m.operation === 'create' && r.serverId && r.serverId !== m.entityId) {
                        await this.applyServerIdMapping(m.entityType, m.entityId, r.serverId);
                    }
                    // Mark as synced
                    if (m.operation !== 'delete') {
                        await this.markEntityAsSynced(m.entityType, r.serverId || m.entityId);
                    }
                    await db.pendingMutations.delete(m.id);
                    successCount++;
                } else if (r.status === 'ignored') {
                    fallback.push(m);
                } else if (r.status === 'error') {
                    failureCount++;
                    await db.pendingMutations.update(m.id, {
                        retryCount: m.retryCount + 1,
                        lastError: r.error || 'Unknown error',
                    });
                } else {
                    // Unknown outcome -> fallback
                    fallback.push(m);
                }
            }
        } catch (e) {
            // If batch push fails entirely, fallback to per-mutation
            console.warn('Batch /sync/push failed, falling back to individual requests:', e);
            fallback.push(...pendingMutations);
        }

        // Fallback: execute the ignored/unhandled mutations individually (legacy path)
        for (const mutation of fallback) {
            try {
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
                if (mutation.operation !== 'delete') {
                    await this.markEntityAsSynced(mutation.entityType, mutation.entityId, response?.data);
                }
                await db.pendingMutations.delete(mutation.id);
                successCount++;
            } catch (error: any) {
                failureCount++;
                await db.pendingMutations.update(mutation.id, {
                    retryCount: mutation.retryCount + 1,
                    lastError: error.message || 'Unknown error',
                });
            }
        }

        await this.updatePendingMutationsCount();

        console.log(` Sync complete: ${successCount} succeeded, ${failureCount} failed`);
        if (successCount > 0) {
            toast.success('Changes synced', { description: `${successCount} change(s) synced successfully` });
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
        await db.transaction('rw', [
            db.projects,
            db.activities,
            db.beneficiaries,
            db.subprojects,
            db.formTemplates,
            db.formSubmissions,
            db.services,
            db.users,
            db.projectUsers,
            db.subprojectUsers,
            db.entityServices,
            db.activityUsers,
            db.serviceDeliveries,
            db.roles,
            db.permissions,
            db.rolePermissions,
            db.userRoles,
            db.formFields,
            db.kpis,
            db.beneficiaryDetails,
            db.beneficiaryAssignments,
            db.beneficiaryMappings,
            db.beneficiaryMatchKeys,
        ], async () => {
            // Only delete synced records
            await db.projects.filter(p => p.synced === true).delete();
            await db.activities.filter(a => a.synced === true).delete();
            await db.beneficiaries.filter(b => b.synced === true).delete();
            await db.subprojects.filter(s => s.synced === true).delete();
            await db.formTemplates.filter(t => t.synced === true).delete();
            await db.formSubmissions.filter(s => s.synced === true).delete();
            await db.services.filter(s => s.synced === true).delete();
            await db.users.filter(u => u.synced === true).delete();
            await db.projectUsers.filter(pu => pu.synced === true).delete();
            await db.subprojectUsers.filter(su => su.synced === true).delete();
            await db.entityServices.filter(es => es.synced === true).delete();
            await db.activityUsers.filter(au => au.synced === true).delete();
            await db.serviceDeliveries.filter(sd => sd.synced === true).delete();
            await db.roles.filter(r => r.synced === true).delete();
            await db.permissions.filter(p => p.synced === true).delete();
            await db.rolePermissions.filter(rp => rp.synced === true).delete();
            await db.userRoles.filter(ur => ur.synced === true).delete();
            await db.formFields.filter(ff => ff.synced === true).delete();
            await db.kpis.filter(k => k.synced === true).delete();
            await db.beneficiaryDetails.filter(bd => bd.synced === true).delete();
            await db.beneficiaryAssignments.filter(ba => ba.synced === true).delete();
            await db.beneficiaryMappings.filter(bm => bm.synced === true).delete();
            await db.beneficiaryMatchKeys.filter(bmk => bmk.synced === true).delete();
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

