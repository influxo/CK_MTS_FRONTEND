/**
 * COMPLETE Database Schema - Mirrors ALL Backend Tables
 * 
 * This file contains the complete IndexedDB schema that mirrors
 * every table from the PostgreSQL backend database.
 */

import Dexie, { type Table } from 'dexie';

// ============================================
// COMPLETE TYPE DEFINITIONS (All Backend Tables)
// ============================================

export interface OfflineProject {
    id: string;
    name: string;
    description?: string;
    status: string;
    startDate?: string;
    endDate?: string;
    budget?: number;
    createdAt: string;
    updatedAt: string;
    // Offline tracking
    synced?: boolean;
    _localUpdatedAt?: string;
}

export interface OfflineSubproject {
    id: string;
    projectId: string;
    name: string;
    description?: string;
    status: string;
    startDate?: string;
    endDate?: string;
    budget?: number;
    createdAt: string;
    updatedAt: string;
    synced?: boolean;
    _localUpdatedAt?: string;
}

export interface OfflineActivity {
    id: string;
    subprojectId: string;
    name: string;
    description?: string;
    status: string;
    startDate?: string;
    endDate?: string;
    budget?: number;
    createdAt: string;
    updatedAt: string;
    synced?: boolean;
    _localUpdatedAt?: string;
}

export interface OfflineUser {
    id: string;
    email: string;
    username: string;
    firstName?: string;
    lastName?: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    synced?: boolean;
    _localUpdatedAt?: string;
}

export interface OfflineRole {
    id: string;
    name: string;
    description?: string;
    createdAt: string;
    updatedAt: string;
    synced?: boolean;
}

export interface OfflineUserRole {
    id: string;
    userId: string;
    roleId: string;
    createdAt: string;
    synced?: boolean;
}

export interface OfflinePermission {
    id: string;
    name: string;
    description?: string;
    resource: string;
    action: string;
    createdAt: string;
    synced?: boolean;
}

export interface OfflineRolePermission {
    id: string;
    roleId: string;
    permissionId: string;
    createdAt: string;
    synced?: boolean;
}

export interface OfflineProjectUser {
    id: string;
    projectId: string;
    userId: string;
    roleId?: string;
    createdAt: string;
    synced?: boolean;
}

export interface OfflineSubprojectUser {
    id: string;
    subprojectId: string;
    userId: string;
    roleId?: string;
    createdAt: string;
    synced?: boolean;
}

export interface OfflineActivityUser {
    id: string;
    activityId: string;
    userId: string;
    roleId?: string;
    createdAt: string;
    synced?: boolean;
}

export interface OfflineBeneficiary {
    id: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    createdBy?: string;
    synced?: boolean;
    _localUpdatedAt?: string;
}

export interface OfflineBeneficiaryDetails {
    id: string;
    beneficiaryId: string;
    encryptedData: string;
    createdAt: string;
    updatedAt: string;
    synced?: boolean;
}

export interface OfflineBeneficiaryAssignment {
    id: string;
    beneficiaryId: string;
    entityId: string;
    entityType: string;
    createdAt: string;
    synced?: boolean;
}

export interface OfflineBeneficiaryMapping {
    id: string;
    beneficiaryId: string;
    externalSystemId: string;
    externalId: string;
    createdAt: string;
    synced?: boolean;
}

export interface OfflineBeneficiaryMatchKey {
    id: string;
    beneficiaryId: string;
    matchKey: string;
    createdAt: string;
    synced?: boolean;
}

export interface OfflineFormTemplate {
    id: string;
    title: string;
    description?: string;
    status: string;
    fields: any;
    createdBy?: string;
    createdAt: string;
    updatedAt: string;
    synced?: boolean;
    _localUpdatedAt?: string;
}

export interface OfflineFormField {
    id: string;
    templateId: string;
    fieldName: string;
    fieldType: string;
    fieldLabel: string;
    required: boolean;
    options?: any;
    validation?: any;
    order: number;
    createdAt: string;
    synced?: boolean;
}

export interface OfflineFormEntityAssociation {
    id: string;
    formTemplateId: string;
    entityId: string;
    entityType: string;
    createdAt: string;
    synced?: boolean;
}

export interface OfflineFormResponse {
    id: string;
    templateId: string;
    entityId: string;
    entityType: string;
    beneficiaryId?: string;
    responseData: any;
    submittedBy: string;
    submittedAt: string;
    createdAt: string;
    updatedAt: string;
    synced?: boolean;
    _localUpdatedAt?: string;
}

export interface OfflineService {
    id: string;
    name: string;
    description?: string;
    category?: string;
    unit?: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    synced?: boolean;
    _localUpdatedAt?: string;
}

export interface OfflineServiceAssignment {
    id: string;
    serviceId: string;
    entityId: string;
    entityType: string;
    targetValue?: number;
    targetUnit?: string;
    createdAt: string;
    updatedAt: string;
    synced?: boolean;
}

export interface OfflineServiceDelivery {
    id: string;
    serviceId: string;
    entityId: string;
    entityType: string;
    beneficiaryId?: string;
    quantity: number;
    deliveredAt: string;
    deliveredBy: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
    synced?: boolean;
    _localUpdatedAt?: string;
}

export interface OfflineKpi {
    id: string;
    name: string;
    description?: string;
    type: string;
    target?: number;
    entityId?: string;
    entityType?: string;
    createdAt: string;
    updatedAt: string;
    synced?: boolean;
}

export interface OfflineLog {
    id: string;
    level: string;
    message: string;
    metadata?: any;
    userId?: string;
    createdAt: string;
    synced?: boolean;
}

export interface OfflineAuditLog {
    id: string;
    userId?: string;
    action: string;
    entity: string;
    entityId: string;
    changes?: any;
    ipAddress?: string;
    userAgent?: string;
    createdAt: string;
    synced?: boolean;
}

export interface PendingMutation {
    id: string;
    entityType: string;
    entityId: string;
    operation: 'create' | 'update' | 'delete';
    data: any;
    endpoint: string;
    method: 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    createdAt: string;
    retryCount: number;
    lastError?: string;
}

export interface SyncMetadata {
    entityType: string;
    lastSyncedAt: string;
    status: 'idle' | 'syncing' | 'error';
    errorMessage?: string;
}

export interface AuthCache {
    email: string;
    passwordHash: string;
    token: string;
    userData: any;
    lastLoginAt: string;
}

// ============================================
// COMPLETE DATABASE CLASS
// ============================================

class CompleteOfflineDB extends Dexie {
    // Core entities
    projects!: Table<OfflineProject, string>;
    subprojects!: Table<OfflineSubproject, string>;
    activities!: Table<OfflineActivity, string>;
    
    // Users and authentication
    users!: Table<OfflineUser, string>;
    roles!: Table<OfflineRole, string>;
    userRoles!: Table<OfflineUserRole, string>;
    permissions!: Table<OfflinePermission, string>;
    rolePermissions!: Table<OfflineRolePermission, string>;
    
    // Assignments
    projectUsers!: Table<OfflineProjectUser, string>;
    subprojectUsers!: Table<OfflineSubprojectUser, string>;
    activityUsers!: Table<OfflineActivityUser, string>;
    
    // Beneficiaries
    beneficiaries!: Table<OfflineBeneficiary, string>;
    beneficiaryDetails!: Table<OfflineBeneficiaryDetails, string>;
    beneficiaryAssignments!: Table<OfflineBeneficiaryAssignment, string>;
    beneficiaryMappings!: Table<OfflineBeneficiaryMapping, string>;
    beneficiaryMatchKeys!: Table<OfflineBeneficiaryMatchKey, string>;
    
    // Forms
    formTemplates!: Table<OfflineFormTemplate, string>;
    formFields!: Table<OfflineFormField, string>;
    formEntityAssociations!: Table<OfflineFormEntityAssociation, string>;
    formResponses!: Table<OfflineFormResponse, string>;
    
    // Services
    services!: Table<OfflineService, string>;
    serviceAssignments!: Table<OfflineServiceAssignment, string>;
    serviceDeliveries!: Table<OfflineServiceDelivery, string>;
    entityServices!: Table<OfflineServiceAssignment, string>; // Alias for serviceAssignments
    
    // KPIs and Logs
    kpis!: Table<OfflineKpi, string>;
    logs!: Table<OfflineLog, string>;
    auditLogs!: Table<OfflineAuditLog, string>;
    
    // Offline management
    pendingMutations!: Table<PendingMutation, string>;
    syncMetadata!: Table<SyncMetadata, string>;
    authCache!: Table<AuthCache, string>;

    constructor() {
        super('CaritasCompleteDB');

        // Version 1: Complete schema with ALL backend tables
        this.version(1).stores({
            // Core entities
            projects: 'id, name, status, startDate, endDate, createdAt, updatedAt, synced',
            subprojects: 'id, projectId, name, status, startDate, endDate, createdAt, updatedAt, synced',
            activities: 'id, subprojectId, name, status, startDate, endDate, createdAt, updatedAt, synced',
            
            // Users and auth
            users: 'id, email, username, status, createdAt, updatedAt, synced',
            roles: 'id, name, createdAt, synced',
            userRoles: 'id, userId, roleId, createdAt, synced',
            permissions: 'id, name, resource, action, createdAt, synced',
            rolePermissions: 'id, roleId, permissionId, createdAt, synced',
            
            // Assignments
            projectUsers: 'id, projectId, userId, roleId, createdAt, synced',
            subprojectUsers: 'id, subprojectId, userId, roleId, createdAt, synced',
            activityUsers: 'id, activityId, userId, roleId, createdAt, synced',
            
            // Beneficiaries
            beneficiaries: 'id, status, createdAt, updatedAt, createdBy, synced',
            beneficiaryDetails: 'id, beneficiaryId, createdAt, updatedAt, synced',
            beneficiaryAssignments: 'id, beneficiaryId, entityId, entityType, createdAt, synced',
            beneficiaryMappings: 'id, beneficiaryId, externalSystemId, externalId, createdAt, synced',
            beneficiaryMatchKeys: 'id, beneficiaryId, matchKey, createdAt, synced',
            
            // Forms
            formTemplates: 'id, title, status, createdBy, createdAt, updatedAt, synced',
            formFields: 'id, templateId, fieldName, fieldType, order, createdAt, synced',
            formEntityAssociations: 'id, formTemplateId, entityId, entityType, createdAt, synced',
            formResponses: 'id, templateId, entityId, entityType, beneficiaryId, submittedBy, submittedAt, createdAt, updatedAt, synced',
            
            // Services
            services: 'id, name, category, status, createdAt, updatedAt, synced',
            serviceAssignments: 'id, serviceId, entityId, entityType, createdAt, updatedAt, synced',
            serviceDeliveries: 'id, serviceId, entityId, entityType, beneficiaryId, deliveredAt, deliveredBy, createdAt, updatedAt, synced',
            entityServices: 'id, serviceId, entityId, entityType, createdAt, updatedAt, synced',
            
            // KPIs and logs
            kpis: 'id, name, type, entityId, entityType, createdAt, updatedAt, synced',
            logs: 'id, level, userId, createdAt, synced',
            auditLogs: 'id, userId, action, entity, entityId, createdAt, synced',
            
            // Offline management
            pendingMutations: 'id, entityType, entityId, operation, createdAt, retryCount',
            syncMetadata: 'entityType, lastSyncedAt, status',
            authCache: 'email, lastLoginAt',
        });
    }

    /**
     * Clear all data
     */
    async clearAllData() {
        await this.transaction('rw', [
            this.projects, this.subprojects, this.activities,
            this.users, this.roles, this.userRoles, this.permissions, this.rolePermissions,
            this.projectUsers, this.subprojectUsers, this.activityUsers,
            this.beneficiaries, this.beneficiaryDetails, this.beneficiaryAssignments,
            this.beneficiaryMappings, this.beneficiaryMatchKeys,
            this.formTemplates, this.formFields, this.formEntityAssociations, this.formResponses,
            this.services, this.serviceAssignments, this.serviceDeliveries,
            this.kpis, this.logs, this.auditLogs,
            this.pendingMutations, this.syncMetadata
        ], async () => {
            await Promise.all([
                this.projects.clear(),
                this.subprojects.clear(),
                this.activities.clear(),
                this.users.clear(),
                this.roles.clear(),
                this.userRoles.clear(),
                this.permissions.clear(),
                this.rolePermissions.clear(),
                this.projectUsers.clear(),
                this.subprojectUsers.clear(),
                this.activityUsers.clear(),
                this.beneficiaries.clear(),
                this.beneficiaryDetails.clear(),
                this.beneficiaryAssignments.clear(),
                this.beneficiaryMappings.clear(),
                this.beneficiaryMatchKeys.clear(),
                this.formTemplates.clear(),
                this.formFields.clear(),
                this.formEntityAssociations.clear(),
                this.formResponses.clear(),
                this.services.clear(),
                this.serviceAssignments.clear(),
                this.serviceDeliveries.clear(),
                this.kpis.clear(),
                this.logs.clear(),
                this.auditLogs.clear(),
                this.pendingMutations.clear(),
                this.syncMetadata.clear(),
            ]);
        });
    }
}

export const completeDb = new CompleteOfflineDB();
export default completeDb;
