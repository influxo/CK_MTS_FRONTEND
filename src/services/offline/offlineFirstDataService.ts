/**
 * Offline-First Data Service
 * 
 * ALWAYS reads from local IndexedDB first, then syncs in background.
 * This ensures the app works identically whether online or offline.
 * 
 * Strategy:
 * 1. Return cached data immediately (fast UI)
 * 2. Fetch from API in background (if online)
 * 3. Update cache with fresh data
 * 4. Notify subscribers of updates
 */

import { db } from '../../db/db';
import { syncService } from './syncService';
import axiosInstance from '../axiosInstance';

// Type definitions
interface Project {
    id: string;
    name: string;
    description: string;
    category: string;
    status: 'active' | 'inactive' | 'pending';
    createdAt: string;
    updatedAt: string;
    [key: string]: any;
}

interface Subproject {
    id: string;
    name: string;
    description: string;
    projectId: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    [key: string]: any;
}

interface Activity {
    id: string;
    name: string;
    description: string;
    category: string;
    frequency: string;
    reportingFields: Record<string, string>;
    subprojectId: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    [key: string]: any;
}

interface Beneficiary {
    id: string;
    firstName: string;
    lastName: string;
    dateOfBirth?: string;
    gender?: string;
    phone?: string;
    email?: string;
    address?: string;
    projectId?: string;
    createdAt: string;
    updatedAt: string;
    [key: string]: any;
}

interface FormTemplate {
    id: string;
    name: string;
    description?: string;
    schema?: any;
    fields: any[];
    status: 'active' | 'inactive';
    entityType?: string;
    projectId?: string;
    subprojectId?: string;
    activityId?: string;
    createdAt: string;
    updatedAt: string;
    [key: string]: any;
}

interface FormSubmission {
    id: string;
    templateId: string;
    entityId: string;
    entityType: string;
    data: Record<string, any>;
    submittedBy: string;
    submittedAt: string;
    beneficiaryId?: string;
    createdAt: string;
    updatedAt: string;
    [key: string]: any;
}

type DataUpdateCallback = () => void;

class OfflineFirstDataService {
    private updateCallbacks: Set<DataUpdateCallback> = new Set();

    /**
     * Subscribe to data updates
     */
    subscribe(callback: DataUpdateCallback): () => void {
        this.updateCallbacks.add(callback);
        return () => this.updateCallbacks.delete(callback);
    }

    /**
     * Notify all subscribers of data update
     */
    private notifyUpdate() {
        this.updateCallbacks.forEach(cb => {
            try {
                cb();
            } catch (error) {
                console.error('Error in update callback:', error);
            }
        });
    }

    /**
     * Strip offline-specific fields
     */
    private stripOfflineFields<T extends Record<string, any>>(
        entity: T & { synced?: boolean; _localUpdatedAt?: string }
    ): T {
        const { synced, _localUpdatedAt, ...rest } = entity;
        return rest as T;
    }

    /**
     * Background sync helper
     */
    private async backgroundSync<T>(
        endpoint: string,
        table: any,
        idField: string = 'id'
    ): Promise<void> {
        if (!syncService.isOnline()) return;

        try {
            const response = await axiosInstance.get<{ success: boolean; data: T[] }>(endpoint);
            
            if (response.data.success && response.data.data) {
                const items = response.data.data;
                const now = new Date().toISOString();

                // Update cache
                for (const item of items) {
                    await table.put({
                        ...item,
                        synced: true,
                        _localUpdatedAt: now,
                    });
                }

                console.log(`✅ Background synced ${items.length} items from ${endpoint}`);
                this.notifyUpdate();
            }
        } catch (error) {
            console.warn(`Background sync failed for ${endpoint}:`, error);
        }
    }

    // ===========================
    // PROJECTS
    // ===========================

    /**
     * Get all projects - ALWAYS from local DB first
     */
    async getProjects(): Promise<Project[]> {
        // 1. Get from local DB immediately
        const cached = await db.projects.toArray();
        const projects = cached.map(this.stripOfflineFields);

        // 2. Sync in background if online
        this.backgroundSync<Project>('/projects', db.projects);

        return projects;
    }

    /**
     * Get project by ID
     */
    async getProject(id: string): Promise<Project | null> {
        const cached = await db.projects.get(id);
        
        // Background sync single project
        if (syncService.isOnline()) {
            this.backgroundSync<Project>(`/projects/${id}`, db.projects).catch(() => {});
        }

        return cached ? this.stripOfflineFields(cached) : null;
    }

    /**
     * Get subprojects for a project
     */
    async getSubprojects(projectId: string): Promise<Subproject[]> {
        // 1. Get from local DB
        const cached = await db.subprojects
            .where('projectId')
            .equals(projectId)
            .toArray();
        
        const subprojects = cached.map(this.stripOfflineFields);

        // 2. Background sync
        this.backgroundSync<Subproject>(`/projects/${projectId}/subprojects`, db.subprojects);

        return subprojects;
    }

    // ===========================
    // ACTIVITIES
    // ===========================

    /**
     * Get activities for a subproject
     */
    async getActivities(subprojectId: string): Promise<Activity[]> {
        const cached = await db.activities
            .where('subprojectId')
            .equals(subprojectId)
            .toArray();
        
        const activities = cached.map(this.stripOfflineFields);

        // Background sync
        this.backgroundSync<Activity>(`/activities/subproject/${subprojectId}`, db.activities);

        return activities;
    }

    // ===========================
    // BENEFICIARIES
    // ===========================

    /**
     * Get all beneficiaries
     */
    async getBeneficiaries(params?: {
        projectId?: string;
        entityId?: string;
        entityType?: string;
    }): Promise<Beneficiary[]> {
        let query = db.beneficiaries.toCollection();

        if (params?.projectId) {
            query = db.beneficiaries.where('projectId').equals(params.projectId);
        }

        const cached = await query.toArray();
        const beneficiaries = cached.map(this.stripOfflineFields);

        // Background sync
        const endpoint = params?.entityId && params?.entityType
            ? `/beneficiaries?entityId=${params.entityId}&entityType=${params.entityType}`
            : '/beneficiaries';
        
        this.backgroundSync<Beneficiary>(endpoint, db.beneficiaries);

        return beneficiaries;
    }

    // ===========================
    // FORM TEMPLATES
    // ===========================

    /**
     * Get all form templates
     */
    async getFormTemplates(params?: {
        projectId?: string;
        subprojectId?: string;
        activityId?: string;
        entityType?: string;
    }): Promise<FormTemplate[]> {
        let query = db.formTemplates.toCollection();

        if (params?.projectId) {
            query = db.formTemplates.where('projectId').equals(params.projectId);
        } else if (params?.subprojectId) {
            query = db.formTemplates.where('subprojectId').equals(params.subprojectId);
        } else if (params?.activityId) {
            query = db.formTemplates.where('activityId').equals(params.activityId);
        }

        const cached = await query.toArray();
        const templates = cached.map(this.stripOfflineFields);

        // Background sync
        const queryParams = new URLSearchParams(params as any).toString();
        const endpoint = `/forms/templates${queryParams ? '?' + queryParams : ''}`;
        this.backgroundSync<FormTemplate>(endpoint, db.formTemplates);

        return templates;
    }

    /**
     * Get form template by ID
     */
    async getFormTemplate(id: string): Promise<FormTemplate | null> {
        const cached = await db.formTemplates.get(id);
        
        // Background sync
        if (syncService.isOnline()) {
            this.backgroundSync<FormTemplate>(`/forms/templates/${id}`, db.formTemplates).catch(() => {});
        }

        return cached ? this.stripOfflineFields(cached) : null;
    }

    // ===========================
    // FORM SUBMISSIONS
    // ===========================

    /**
     * Submit form response
     */
    async submitFormResponse(data: {
        templateId: string;
        entityId: string;
        entityType: string;
        data: Record<string, any>;
    }): Promise<FormSubmission> {
        const tempId = `temp-${crypto?.randomUUID ? crypto.randomUUID() : Date.now()}`;
        const now = new Date().toISOString();
        const currentUser = localStorage.getItem('userId') || 'unknown';

        const submission: FormSubmission = {
            id: tempId,
            ...data,
            submittedBy: currentUser,
            submittedAt: now,
            createdAt: now,
            updatedAt: now,
        };

        // Store locally immediately
        await db.formSubmissions.put({
            ...submission,
            synced: false,
            _localUpdatedAt: now,
        });

        // Queue for sync
        await syncService.queueMutation({
            entityType: 'formSubmission',
            entityId: tempId,
            operation: 'create',
            data,
            endpoint: '/forms/responses',
            method: 'POST',
        });

        console.log('📝 Form submission saved locally:', tempId);
        this.notifyUpdate();

        return submission;
    }

    /**
     * Get form submissions
     */
    async getFormSubmissions(params?: {
        templateId?: string;
        entityId?: string;
        entityType?: string;
    }): Promise<FormSubmission[]> {
        let submissions = await db.formSubmissions.toArray();

        if (params?.templateId) {
            submissions = submissions.filter(s => s.templateId === params.templateId);
        }
        if (params?.entityId) {
            submissions = submissions.filter(s => s.entityId === params.entityId);
        }
        if (params?.entityType) {
            submissions = submissions.filter(s => s.entityType === params.entityType);
        }

        const result = submissions.map(this.stripOfflineFields);

        // Background sync
        const queryParams = new URLSearchParams(params as any).toString();
        const endpoint = `/forms/responses${queryParams ? '?' + queryParams : ''}`;
        this.backgroundSync<FormSubmission>(endpoint, db.formSubmissions);

        return result;
    }

    // ===========================
    // USER PROJECTS (for sidebar)
    // ===========================

    /**
     * Get user's projects with nested structure
     */
    async getUserProjects(userId: string): Promise<any[]> {
        // Get all projects from cache
        const projects = await db.projects.toArray();
        
        // Build nested structure
        const result = [];
        for (const project of projects) {
            const subprojects = await db.subprojects
                .where('projectId')
                .equals(project.id)
                .toArray();
            
            const subprojectsWithActivities = [];
            for (const subproject of subprojects) {
                const activities = await db.activities
                    .where('subprojectId')
                    .equals(subproject.id)
                    .toArray();
                
                subprojectsWithActivities.push({
                    ...this.stripOfflineFields(subproject),
                    activities: activities.map(this.stripOfflineFields),
                });
            }
            
            result.push({
                ...this.stripOfflineFields(project),
                subprojects: subprojectsWithActivities,
            });
        }

        // Background sync
        if (syncService.isOnline()) {
            this.backgroundSync<any>(`/users/${userId}/projects`, db.projects).catch(() => {});
        }

        return result;
    }
}

export const offlineFirstDataService = new OfflineFirstDataService();
export default offlineFirstDataService;
