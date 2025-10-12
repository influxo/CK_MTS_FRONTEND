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
 * Offline Form Template entity
 */
export interface OfflineFormTemplate extends OfflineEntity {
    name: string;
    description?: string;
    fields: any[]; // JSON schema for form fields
    status: 'active' | 'inactive';
    entityType?: string;
    projectId?: string;
    subprojectId?: string;
    activityId?: string;
    createdAt: string;
}

/**
 * Offline Form Submission entity
 */
export interface OfflineFormSubmission extends OfflineEntity {
    templateId: string;
    entityId: string;
    entityType: string;
    data: Record<string, any>; // Form response data
    submittedBy: string;
    submittedAt: string;
    beneficiaryId?: string;
    createdAt: string;
}

/**
 * Offline Service entity
 */
export interface OfflineService extends OfflineEntity {
    name: string;
    description?: string;
    category?: string;
    status: 'active' | 'inactive';
    createdAt: string;
}

/**
 * Offline User entity
 */
export interface OfflineUser extends OfflineEntity {
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    status: string;
    createdAt: string;
}

/**
 * Offline Project User Assignment
 */
export interface OfflineProjectUser extends OfflineEntity {
    projectId: string;
    userId: string;
    role?: string;
    assignedAt: string;
}

/**
 * Offline Subproject User Assignment
 */
export interface OfflineSubprojectUser extends OfflineEntity {
    subprojectId: string;
    userId: string;
    role?: string;
    assignedAt: string;
}

/**
 * Offline Entity Service Assignment
 */
export interface OfflineEntityService extends OfflineEntity {
    serviceId: string;
    entityId: string;
    entityType: 'project' | 'subproject' | 'activity';
    assignedAt: string;
}

/**
 * Offline Activity-User assignment
 */
export interface OfflineActivityUser extends OfflineEntity {
    activityId: string;
    userId: string;
    role?: string;
    assignedAt?: string;
    createdAt: string;
}

/**
 * Offline Service Delivery
 */
export interface OfflineServiceDelivery extends OfflineEntity {
    serviceId: string;
    beneficiaryId: string | null;
    entityId: string;
    entityType: 'project' | 'subproject' | 'activity';
    formResponseId: string | null;
    staffUserId: string | null;
    deliveredAt: string;
    notes?: any;
    createdAt: string;
}

/** Role/Permission models for offline gating */
export interface OfflineRole extends OfflineEntity { name: string; createdAt: string; }
export interface OfflinePermission extends OfflineEntity { name: string; createdAt: string; }
export interface OfflineRolePermission extends OfflineEntity { roleId: string; permissionId: string; createdAt: string; }
export interface OfflineUserRole extends OfflineEntity { userId: string; roleId: string; createdAt: string; }

/** Form field definitions */
export interface OfflineFormField extends OfflineEntity { templateId: string; name: string; type: string; config?: any; createdAt: string; }

/** Beneficiary details and assignments */
export interface OfflineBeneficiaryDetails extends OfflineEntity { beneficiaryId: string; details: any; createdAt: string; }
export interface OfflineBeneficiaryAssignment extends OfflineEntity { beneficiaryId: string; entityId: string; entityType: 'project' | 'subproject' | 'activity'; createdAt: string; }

/** KPI definition */
export interface OfflineKpi extends OfflineEntity { fieldId: string; name: string; type: string; config?: any; createdAt: string; }

/** Beneficiary mapping and match keys */
export interface OfflineBeneficiaryMapping extends OfflineEntity { formTemplateId: string; mapping: any; createdAt: string; }
export interface OfflineBeneficiaryMatchKey extends OfflineEntity { beneficiaryId: string; keyType: string; keyHash: string; createdAt: string; }

/**
 * Pending mutation entry
 * Tracks operations that need to be synced to the server
 */
export interface PendingMutation {
    id: string; // Unique mutation ID
    entityType: 'project' | 'activity' | 'beneficiary' | 'subproject' | 'formTemplate' | 'formSubmission' | 'service' | 'user' | 'projectUser' | 'subprojectUser' | 'entityService';
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

/**
 * Auth cache for offline login
 * Stores hashed credentials for offline authentication
 */
export interface AuthCache {
    email: string; // Primary key
    passwordHash: string; // Hashed password for verification
    token: string; // Last valid JWT token
    userData: any; // User object from server
    lastLoginAt: string; // Last successful login timestamp
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
    formTemplates!: Table<OfflineFormTemplate, string>;
    formSubmissions!: Table<OfflineFormSubmission, string>;
    services!: Table<OfflineService, string>;
    users!: Table<OfflineUser, string>;
    projectUsers!: Table<OfflineProjectUser, string>;
    subprojectUsers!: Table<OfflineSubprojectUser, string>;
    entityServices!: Table<OfflineEntityService, string>;
    activityUsers!: Table<OfflineActivityUser, string>;
    serviceDeliveries!: Table<OfflineServiceDelivery, string>;
    roles!: Table<OfflineRole, string>;
    permissions!: Table<OfflinePermission, string>;
    rolePermissions!: Table<OfflineRolePermission, string>;
    userRoles!: Table<OfflineUserRole, string>;
    formFields!: Table<OfflineFormField, string>;
    beneficiaryDetails!: Table<OfflineBeneficiaryDetails, string>;
    beneficiaryAssignments!: Table<OfflineBeneficiaryAssignment, string>;
    kpis!: Table<OfflineKpi, string>;
    beneficiaryMappings!: Table<OfflineBeneficiaryMapping, string>;
    beneficiaryMatchKeys!: Table<OfflineBeneficiaryMatchKey, string>;
    pendingMutations!: Table<PendingMutation, string>;
    syncMetadata!: Table<SyncMetadata, string>;
    authCache!: Table<AuthCache, string>;

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

        // Version 2: Add form templates and submissions
        this.version(2).stores({
            projects: 'id, updatedAt, synced, status',
            activities: 'id, subprojectId, updatedAt, synced, status',
            beneficiaries: 'id, projectId, updatedAt, synced',
            subprojects: 'id, projectId, updatedAt, synced, status',
            formTemplates: 'id, updatedAt, synced, status, projectId, subprojectId, activityId',
            formSubmissions: 'id, templateId, entityId, entityType, updatedAt, synced, submittedAt',
            pendingMutations: 'id, entityType, entityId, operation, createdAt',
            syncMetadata: 'entityType, lastSyncedAt',
        });

        // Version 3: Add services, users, and assignments
        this.version(3).stores({
            projects: 'id, updatedAt, synced, status',
            activities: 'id, subprojectId, updatedAt, synced, status',
            beneficiaries: 'id, projectId, updatedAt, synced',
            subprojects: 'id, projectId, updatedAt, synced, status',
            formTemplates: 'id, updatedAt, synced, status, projectId, subprojectId, activityId',
            formSubmissions: 'id, templateId, entityId, entityType, updatedAt, synced, submittedAt',
            services: 'id, updatedAt, synced, status',
            users: 'id, updatedAt, synced, email, username',
            projectUsers: 'id, projectId, userId, updatedAt, synced',
            subprojectUsers: 'id, subprojectId, userId, updatedAt, synced',
            entityServices: 'id, serviceId, entityId, entityType, updatedAt, synced',
            pendingMutations: 'id, entityType, entityId, operation, createdAt',
            syncMetadata: 'entityType, lastSyncedAt',
        });

        // Version 4: Add auth cache for offline login
        this.version(4).stores({
            projects: 'id, updatedAt, synced, status',
            activities: 'id, subprojectId, updatedAt, synced, status',
            beneficiaries: 'id, projectId, updatedAt, synced',
            subprojects: 'id, projectId, updatedAt, synced, status',
            formTemplates: 'id, updatedAt, synced, status, projectId, subprojectId, activityId',
            formSubmissions: 'id, templateId, entityId, entityType, updatedAt, synced, submittedAt',
            services: 'id, updatedAt, synced, status',
            users: 'id, updatedAt, synced, email, username',
            projectUsers: 'id, projectId, userId, updatedAt, synced',
            subprojectUsers: 'id, subprojectId, userId, updatedAt, synced',
            entityServices: 'id, serviceId, entityId, entityType, updatedAt, synced',
            pendingMutations: 'id, entityType, entityId, operation, createdAt',
            syncMetadata: 'entityType, lastSyncedAt',
            authCache: 'email, lastLoginAt',
        });

        // Version 5: Add additional tables to mirror backend models
        this.version(5).stores({
            projects: 'id, updatedAt, synced, status',
            activities: 'id, subprojectId, updatedAt, synced, status',
            beneficiaries: 'id, projectId, updatedAt, synced',
            subprojects: 'id, projectId, updatedAt, synced, status',
            formTemplates: 'id, updatedAt, synced, status, projectId, subprojectId, activityId',
            formSubmissions: 'id, templateId, entityId, entityType, updatedAt, synced, submittedAt',
            services: 'id, updatedAt, synced, status',
            users: 'id, updatedAt, synced, email, username',
            projectUsers: 'id, projectId, userId, updatedAt, synced',
            subprojectUsers: 'id, subprojectId, userId, updatedAt, synced',
            entityServices: 'id, serviceId, entityId, entityType, updatedAt, synced',
            activityUsers: 'id, activityId, userId, updatedAt, synced',
            serviceDeliveries: 'id, serviceId, beneficiaryId, entityId, entityType, deliveredAt, updatedAt, synced',
            roles: 'id, name, updatedAt, synced',
            permissions: 'id, name, updatedAt, synced',
            rolePermissions: 'id, roleId, permissionId, updatedAt, synced',
            userRoles: 'id, userId, roleId, updatedAt, synced',
            formFields: 'id, templateId, updatedAt, synced',
            beneficiaryDetails: 'id, beneficiaryId, updatedAt, synced',
            beneficiaryAssignments: 'id, beneficiaryId, entityId, entityType, updatedAt, synced',
            kpis: 'id, fieldId, updatedAt, synced',
            beneficiaryMappings: 'id, formTemplateId, updatedAt, synced',
            beneficiaryMatchKeys: 'id, beneficiaryId, keyType, keyHash, updatedAt, synced',
            pendingMutations: 'id, entityType, entityId, operation, createdAt',
            syncMetadata: 'entityType, lastSyncedAt',
            authCache: 'email, lastLoginAt',
        });
    }

    /**
     * Clear all data from the database
     * Useful for logout or cache reset
     */
    async clearAllData() {
        await this.transaction(
            'rw',
            [this.projects, this.activities, this.beneficiaries, this.subprojects, this.formTemplates, this.formSubmissions, this.services, this.users, this.projectUsers, this.subprojectUsers, this.entityServices, this.pendingMutations, this.syncMetadata],
            async () => {
                await this.projects.clear();
                await this.activities.clear();
                await this.beneficiaries.clear();
                await this.subprojects.clear();
                await this.formTemplates.clear();
                await this.formSubmissions.clear();
                await this.services.clear();
                await this.users.clear();
                await this.projectUsers.clear();
                await this.subprojectUsers.clear();
                await this.entityServices.clear();
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
            this.formTemplates,
            this.formSubmissions,
            this.services,
            this.users,
            this.projectUsers,
            this.subprojectUsers,
            this.entityServices,
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

