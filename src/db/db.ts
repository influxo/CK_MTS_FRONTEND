/**
 * IndexedDB Database Configuration using Dexie.js
 * 
 * This database stores user-specific data for offline functionality.
 * Only data that the user views or edits is cached locally.
 * 
 * Storage strategy:
 * - Limit cached items to recent/relevant data (last 100 items per collection)
 * - All entities include updatedAt for conflict resolution
 * - synced flag tracks which records need to be pushed to server
 */

import Dexie, { type Table } from 'dexie';

// ===========================
// Entity Interfaces
// ===========================

/**
 * Base interface for all offline entities
 */
export interface OfflineEntity {
    id: string;
    updatedAt: string; // ISO timestamp for conflict resolution
    synced: boolean; // true if synced with server, false if pending
    _localUpdatedAt?: string; // Local modification timestamp
}

/**
 * Offline Project entity
 * Mirrors the Project model from projectModels.ts
 */
export interface OfflineProject extends OfflineEntity {
    name: string;
    description: string;
    category: string;
    status: 'active' | 'inactive' | 'pending';
    createdAt: string;
}

/**
 * Offline Activity entity
 * Mirrors the Activity model from activityModels.ts
 */
export interface OfflineActivity extends OfflineEntity {
    name: string;
    description: string;
    category: string;
    frequency: string;
    reportingFields: Record<string, string>;
    subprojectId: string;
    status: string;
    createdAt: string;
}

/**
 * Offline Beneficiary entity
 */
export interface OfflineBeneficiary extends OfflineEntity {
    firstName: string;
    lastName: string;
    dateOfBirth?: string;
    gender?: string;
    phone?: string;
    email?: string;
    address?: string;
    projectId?: string;
    createdAt: string;
}

/**
 * Offline Subproject entity
 */
export interface OfflineSubproject extends OfflineEntity {
    name: string;
    description: string;
    projectId: string;
    status: string;
    createdAt: string;
}

/**
 * Pending mutation entry
 * Tracks operations that need to be synced to the server
 */
export interface PendingMutation {
    id: string; // Unique mutation ID
    entityType: 'project' | 'activity' | 'beneficiary' | 'subproject';
    entityId: string; // ID of the entity being modified
    operation: 'create' | 'update' | 'delete';
    data: any; // The data to send to the server
    endpoint: string; // API endpoint to call
    method: 'POST' | 'PUT' | 'DELETE';
    createdAt: string; // When the mutation was created
    retryCount: number; // Number of sync attempts
    lastError?: string; // Last error message if sync failed
}

/**
 * Sync metadata
 * Tracks when each entity type was last synced
 */
export interface SyncMetadata {
    entityType: string;
    lastSyncedAt: string;
    status: 'idle' | 'syncing' | 'error';
    errorMessage?: string;
}

// ===========================
// Database Class
// ===========================

/**
 * OfflineDB - IndexedDB database for offline data storage
 * 
 * This database is designed for PWA offline functionality:
 * - Projects: User's accessible projects
 * - Activities: Activities within viewed subprojects
 * - Beneficiaries: Beneficiaries related to user's work
 * - Subprojects: Subprojects within user's projects
 * - Pending Mutations: Queue of operations to sync when online
 * - Sync Metadata: Tracks sync status for each entity type
 */
class OfflineDB extends Dexie {
    // Tables
    projects!: Table<OfflineProject, string>;
    activities!: Table<OfflineActivity, string>;
    beneficiaries!: Table<OfflineBeneficiary, string>;
    subprojects!: Table<OfflineSubproject, string>;
    pendingMutations!: Table<PendingMutation, string>;
    syncMetadata!: Table<SyncMetadata, string>;

    constructor() {
        super('CaritasOfflineDB');

        // Define schema
        // Version 1 of the database
        this.version(1).stores({
            // Indexed fields for efficient querying
            projects: 'id, updatedAt, synced, status',
            activities: 'id, subprojectId, updatedAt, synced, status',
            beneficiaries: 'id, projectId, updatedAt, synced',
            subprojects: 'id, projectId, updatedAt, synced, status',
            pendingMutations: 'id, entityType, entityId, operation, createdAt',
            syncMetadata: 'entityType, lastSyncedAt',
        });
    }

    /**
     * Clear all data from the database
     * Useful for logout or cache reset
     */
    async clearAllData() {
        await this.transaction(
            'rw',
            [this.projects, this.activities, this.beneficiaries, this.subprojects, this.pendingMutations, this.syncMetadata],
            async () => {
                await this.projects.clear();
                await this.activities.clear();
                await this.beneficiaries.clear();
                await this.subprojects.clear();
                await this.pendingMutations.clear();
                await this.syncMetadata.clear();
            }
        );
    }

    /**
     * Get the count of pending mutations
     */
    async getPendingMutationsCount(): Promise<number> {
        return await this.pendingMutations.count();
    }

    /**
     * Get all pending mutations for a specific entity type
     */
    async getPendingMutationsByType(entityType: string): Promise<PendingMutation[]> {
        return await this.pendingMutations
            .where('entityType')
            .equals(entityType)
            .sortBy('createdAt');
    }

    /**
     * Evict old records to manage storage size
     * Keeps only the most recent N records per table
     */
    async evictOldRecords(maxRecordsPerTable: number = 100) {
        const tables = [
            this.projects,
            this.activities,
            this.beneficiaries,
            this.subprojects,
        ];

        for (const table of tables) {
            const count = await table.count();
            if (count > maxRecordsPerTable) {
                // Get all records sorted by updatedAt
                const records = await table.orderBy('updatedAt').toArray();

                // Keep only synced records and delete oldest
                const recordsToDelete = records
                    .filter(r => r.synced) // Only delete synced records
                    .slice(0, count - maxRecordsPerTable);

                const idsToDelete = recordsToDelete.map(r => r.id);
                await table.bulkDelete(idsToDelete);
            }
        }
    }
}

// ===========================
// Database Instance Export
// ===========================

/**
 * Singleton instance of the offline database
 * Import this in your services and components
 */
export const db = new OfflineDB();

// ===========================
// Helper Functions
// ===========================

/**
 * Check if the database is accessible
 * Useful for checking if IndexedDB is available in the browser
 */
export async function isDatabaseAvailable(): Promise<boolean> {
    try {
        await db.open();
        return true;
    } catch (error) {
        console.error('IndexedDB not available:', error);
        return false;
    }
}

/**
 * Initialize the database and run any necessary migrations
 */
export async function initializeDatabase() {
    try {
        await db.open();
        console.log('Offline database initialized');

        // Run eviction on startup to clean up old data
        await db.evictOldRecords(100);

        return true;
    } catch (error) {
        console.error('Failed to initialize offline database:', error);
        return false;
    }
}

export default db;

