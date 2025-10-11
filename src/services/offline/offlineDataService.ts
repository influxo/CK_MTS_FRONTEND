/**
 * Offline Data Service
 * 
 * Abstraction layer that provides transparent data access,
 * automatically switching between API and local IndexedDB based on connectivity.
 * 
 * When online: Fetches from API and caches in IndexedDB
 * When offline: Reads from IndexedDB
 * When modifying data offline: Queues mutations for later sync
 * 
 * Usage:
 *   import { offlineDataService } from '@/services/offline/offlineDataService'
 *   
 *   // Get projects (works online and offline)
 *   const projects = await offlineDataService.getProjects()
 *   
 *   // Create project (queues if offline)
 *   const newProject = await offlineDataService.createProject(data)
 *   
 *   // Update activity (queues if offline)
 *   await offlineDataService.updateActivity(id, data)
 */

import { db } from '../../db/db';
import { syncService } from './syncService';
import axiosInstance from '../axiosInstance';
import type { Project, CreateProjectRequest } from '../projects/projectModels';
import type { Activity, CreateSubprojectActivityRequest } from '../activities/activityModels';

// Form types
interface FormTemplate {
    id: string;
    name: string;
    description?: string;
    fields: any[];
    status: 'active' | 'inactive';
    entityType?: string;
    projectId?: string;
    subprojectId?: string;
    activityId?: string;
    createdAt: string;
    updatedAt: string;
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
}

// ===========================
// Offline Data Service Class
// ===========================

class OfflineDataService {
    // ===========================
    // Projects
    // ===========================

    /**
     * Get all projects
     * Online: Fetches from API and caches
     * Offline: Returns cached projects
     */
    async getProjects(): Promise<Project[]> {
        const isOnline = syncService.isOnline();

        if (isOnline) {
            try {
                // Fetch from API
                const response = await axiosInstance.get<{ success: boolean; data: Project[] }>('/projects');

                if (response.data.success && response.data.data) {
                    const projects = response.data.data;

                    // Cache in IndexedDB
                    for (const project of projects) {
                        await db.projects.put({
                            ...project,
                            synced: true,
                            _localUpdatedAt: new Date().toISOString(),
                        });
                    }

                    return projects;
                }

                return [];
            } catch (error: any) {
                // Only fall back to cache for network errors, not auth errors
                const isNetworkError = !error.response || error.code === 'ERR_NETWORK';

                if (isNetworkError) {
                    console.log('📱 Network error, using cached projects');
                    const cachedProjects = await db.projects.toArray();
                    return cachedProjects.map(this.stripOfflineFields);
                }

                // For auth errors or other API errors, throw the error
                throw error;
            }
        }

        // Offline - use cache
        console.log('📱 Offline mode - using cached projects');
        const cachedProjects = await db.projects.toArray();
        return cachedProjects.map(this.stripOfflineFields);
    }

    /**
     * Get a single project by ID
     */
    async getProject(id: string): Promise<Project | null> {
        const isOnline = syncService.isOnline();

        if (isOnline) {
            try {
                // Fetch from API
                const response = await axiosInstance.get<{ success: boolean; data: Project }>(`/projects/${id}`);

                if (response.data.success && response.data.data) {
                    const project = response.data.data;

                    // Cache in IndexedDB
                    await db.projects.put({
                        ...project,
                        synced: true,
                        _localUpdatedAt: new Date().toISOString(),
                    });

                    return project;
                }

                return null;
            } catch (error) {
                console.error('Failed to fetch project from API, falling back to cache:', error);
            }
        }

        // Offline or API failed - use cache
        const cachedProject = await db.projects.get(id);
        return cachedProject ? this.stripOfflineFields(cachedProject) : null;
    }

    /**
     * Create a new project
     * Online: Creates immediately via API
     * Offline: Queues mutation for later sync
     */
    async createProject(projectData: CreateProjectRequest): Promise<Project> {
        const isOnline = syncService.isOnline();

        if (isOnline) {
            try {
                // Create via API
                const response = await axiosInstance.post<{ success: boolean; message: string; data?: Project }>(
                    '/projects',
                    projectData
                );

                if (response.data.success && response.data.data) {
                    const project = response.data.data;

                    // Cache in IndexedDB
                    await db.projects.put({
                        ...project,
                        synced: true,
                        _localUpdatedAt: new Date().toISOString(),
                    });

                    return project;
                }

                throw new Error(response.data.message || 'Failed to create project');
            } catch (error: any) {
                console.error('Failed to create project via API:', error);
                throw error;
            }
        }

        // Offline - create locally and queue
        console.log('Creating project offline');

        const tempId = `temp-${crypto?.randomUUID ? crypto.randomUUID() : Date.now()}`;
        const now = new Date().toISOString();

        const newProject: Project = {
            id: tempId,
            ...projectData,
            createdAt: now,
            updatedAt: now,
        };

        // Store in local DB as unsynced
        await db.projects.put({
            ...newProject,
            synced: false,
            _localUpdatedAt: now,
        });

        // Queue mutation
        await syncService.queueMutation({
            entityType: 'project',
            entityId: tempId,
            operation: 'create',
            data: projectData,
            endpoint: '/projects',
            method: 'POST',
        });

        return newProject;
    }

    /**
     * Update an existing project
     * Online: Updates immediately via API
     * Offline: Queues mutation for later sync
     */
    async updateProject(id: string, updates: Partial<Project>): Promise<Project> {
        const isOnline = syncService.isOnline();

        if (isOnline) {
            try {
                // Update via API
                const response = await axiosInstance.put<{ success: boolean; data?: Project }>(
                    `/projects/${id}`,
                    updates
                );

                if (response.data.success && response.data.data) {
                    const project = response.data.data;

                    // Update cache
                    await db.projects.put({
                        ...project,
                        synced: true,
                        _localUpdatedAt: new Date().toISOString(),
                    });

                    return project;
                }

                throw new Error('Failed to update project');
            } catch (error: any) {
                console.error('Failed to update project via API:', error);
                throw error;
            }
        }

        // Offline - update locally and queue
        console.log('Updating project offline');

        const existingProject = await db.projects.get(id);
        if (!existingProject) {
            throw new Error('Project not found in local cache');
        }

        const now = new Date().toISOString();
        const { synced, _localUpdatedAt, ...baseProject } = existingProject;
        const updatedProject: Project = {
            ...baseProject,
            ...updates,
            id: existingProject.id,
            updatedAt: now,
        } as Project;

        // Update in local DB as unsynced
        await db.projects.put({
            ...updatedProject,
            synced: false,
            _localUpdatedAt: now,
        });

        // Queue mutation
        await syncService.queueMutation({
            entityType: 'project',
            entityId: id,
            operation: 'update',
            data: updates,
            endpoint: `/projects/${id}`,
            method: 'PUT',
        });

        return updatedProject;
    }

    // ===========================
    // Activities
    // ===========================

    /**
     * Get activities for a subproject
     * Online: Fetches from API and caches
     * Offline: Returns cached activities
     */
    async getActivitiesForSubproject(subprojectId: string): Promise<Activity[]> {
        const isOnline = syncService.isOnline();

        if (isOnline) {
            try {
                // Fetch from API
                const response = await axiosInstance.get<{ success: boolean; data: Activity[] }>(
                    `/activities/subproject/${subprojectId}`
                );

                if (response.data.success && response.data.data) {
                    const activities = response.data.data;

                    // Cache in IndexedDB
                    for (const activity of activities) {
                        await db.activities.put({
                            ...activity,
                            synced: true,
                            _localUpdatedAt: new Date().toISOString(),
                        });
                    }

                    return activities;
                }

                return [];
            } catch (error: any) {
                // Only fall back to cache for network errors, not auth errors
                const isNetworkError = !error.response || error.code === 'ERR_NETWORK';

                if (isNetworkError) {
                    console.log('📱 Network error, using cached activities');
                    const cachedActivities = await db.activities
                        .where('subprojectId')
                        .equals(subprojectId)
                        .toArray();
                    return cachedActivities.map(this.stripOfflineFields);
                }

                // For auth errors or other API errors, throw the error
                throw error;
            }
        }

        // Offline - use cache
        console.log('📱 Offline mode - using cached activities');
        const cachedActivities = await db.activities
            .where('subprojectId')
            .equals(subprojectId)
            .toArray();

        return cachedActivities.map(this.stripOfflineFields);
    }

    /**
     * Get a single activity by ID
     */
    async getActivity(id: string): Promise<Activity | null> {
        const isOnline = syncService.isOnline();

        if (isOnline) {
            try {
                // Fetch from API
                const response = await axiosInstance.get<{ success: boolean; data: Activity }>(
                    `/activities/${id}`
                );

                if (response.data.success && response.data.data) {
                    const activity = response.data.data;

                    // Cache in IndexedDB
                    await db.activities.put({
                        ...activity,
                        synced: true,
                        _localUpdatedAt: new Date().toISOString(),
                    });

                    return activity;
                }

                return null;
            } catch (error) {
                console.error('Failed to fetch activity from API, falling back to cache:', error);
            }
        }

        // Offline or API failed - use cache
        const cachedActivity = await db.activities.get(id);
        return cachedActivity ? this.stripOfflineFields(cachedActivity) : null;
    }

    /**
     * Create a new activity
     * Online: Creates immediately via API
     * Offline: Queues mutation for later sync
     */
    async createActivity(activityData: CreateSubprojectActivityRequest): Promise<Activity> {
        const isOnline = syncService.isOnline();

        if (isOnline) {
            try {
                // Create via API
                const response = await axiosInstance.post<{ success: boolean; message: string; data?: Activity }>(
                    '/activities',
                    activityData
                );

                if (response.data.success && response.data.data) {
                    const activity = response.data.data;

                    // Cache in IndexedDB
                    await db.activities.put({
                        ...activity,
                        synced: true,
                        _localUpdatedAt: new Date().toISOString(),
                    });

                    return activity;
                }

                throw new Error(response.data.message || 'Failed to create activity');
            } catch (error: any) {
                console.error('Failed to create activity via API:', error);
                throw error;
            }
        }

        // Offline - create locally and queue
        console.log('Creating activity offline');

        const tempId = `temp-${crypto?.randomUUID ? crypto.randomUUID() : Date.now()}`;
        const now = new Date().toISOString();

        const newActivity: Activity = {
            id: tempId,
            ...activityData,
            createdAt: now,
            updatedAt: now,
        };

        // Store in local DB as unsynced
        await db.activities.put({
            ...newActivity,
            synced: false,
            _localUpdatedAt: now,
        });

        // Queue mutation
        await syncService.queueMutation({
            entityType: 'activity',
            entityId: tempId,
            operation: 'create',
            data: activityData,
            endpoint: '/activities',
            method: 'POST',
        });

        return newActivity;
    }

    /**
     * Update an existing activity
     * Online: Updates immediately via API
     * Offline: Queues mutation for later sync
     */
    async updateActivity(id: string, updates: Partial<Activity>): Promise<Activity> {
        const isOnline = syncService.isOnline();

        if (isOnline) {
            try {
                // Update via API
                const response = await axiosInstance.put<{ success: boolean; data?: Activity }>(
                    `/activities/${id}`,
                    updates
                );

                if (response.data.success && response.data.data) {
                    const activity = response.data.data;

                    // Update cache
                    await db.activities.put({
                        ...activity,
                        synced: true,
                        _localUpdatedAt: new Date().toISOString(),
                    });

                    return activity;
                }

                throw new Error('Failed to update activity');
            } catch (error: any) {
                console.error('Failed to update activity via API:', error);
                throw error;
            }
        }

        // Offline - update locally and queue
        console.log('Updating activity offline');

        const existingActivity = await db.activities.get(id);
        if (!existingActivity) {
            throw new Error('Activity not found in local cache');
        }

        const now = new Date().toISOString();
        const { synced, _localUpdatedAt, ...baseActivity } = existingActivity;
        const updatedActivity: Activity = {
            ...baseActivity,
            ...updates,
            id: existingActivity.id,
            updatedAt: now,
        } as Activity;

        // Update in local DB as unsynced
        await db.activities.put({
            ...updatedActivity,
            synced: false,
            _localUpdatedAt: now,
        });

        // Queue mutation
        await syncService.queueMutation({
            entityType: 'activity',
            entityId: id,
            operation: 'update',
            data: updates,
            endpoint: `/activities/${id}`,
            method: 'PUT',
        });

        return updatedActivity;
    }

    // ===========================
    // Form Templates
    // ===========================

    /**
     * Get all form templates
     * Online: Fetches from API and caches
     * Offline: Returns cached templates
     */
    async getFormTemplates(): Promise<FormTemplate[]> {
        const isOnline = syncService.isOnline();

        if (isOnline) {
            try {
                const response = await axiosInstance.get<{ success: boolean; data: FormTemplate[] }>('/forms/templates');

                if (response.data.success && response.data.data) {
                    const templates = response.data.data;

                    // Cache in IndexedDB
                    for (const template of templates) {
                        await db.formTemplates.put({
                            ...template,
                            synced: true,
                            _localUpdatedAt: new Date().toISOString(),
                        });
                    }

                    return templates;
                }

                return [];
            } catch (error: any) {
                const isNetworkError = !error.response || error.code === 'ERR_NETWORK';

                if (isNetworkError) {
                    console.log('📱 Network error, using cached form templates');
                    const cachedTemplates = await db.formTemplates.toArray();
                    return cachedTemplates.map(this.stripOfflineFields);
                }

                throw error;
            }
        }

        // Offline - use cache
        console.log('📱 Offline mode - using cached form templates');
        const cachedTemplates = await db.formTemplates.toArray();
        return cachedTemplates.map(this.stripOfflineFields);
    }

    /**
     * Get form template by ID
     */
    async getFormTemplate(id: string): Promise<FormTemplate | null> {
        const isOnline = syncService.isOnline();

        if (isOnline) {
            try {
                const response = await axiosInstance.get<{ success: boolean; data: FormTemplate }>(
                    `/forms/templates/${id}`
                );

                if (response.data.success && response.data.data) {
                    const template = response.data.data;

                    await db.formTemplates.put({
                        ...template,
                        synced: true,
                        _localUpdatedAt: new Date().toISOString(),
                    });

                    return template;
                }

                return null;
            } catch (error) {
                console.error('Failed to fetch form template from API, falling back to cache:', error);
            }
        }

        // Offline or API failed - use cache
        const cachedTemplate = await db.formTemplates.get(id);
        return cachedTemplate ? this.stripOfflineFields(cachedTemplate) : null;
    }

    /**
     * Get form templates by entity
     */
    async getFormTemplatesByEntity(params: {
        projectId?: string;
        subprojectId?: string;
        activityId?: string;
        entityType?: string;
    }): Promise<FormTemplate[]> {
        const isOnline = syncService.isOnline();

        if (isOnline) {
            try {
                const response = await axiosInstance.get<{ success: boolean; data: FormTemplate[] }>(
                    '/forms/templates',
                    { params }
                );

                if (response.data.success && response.data.data) {
                    const templates = response.data.data;

                    for (const template of templates) {
                        await db.formTemplates.put({
                            ...template,
                            synced: true,
                            _localUpdatedAt: new Date().toISOString(),
                        });
                    }

                    return templates;
                }

                return [];
            } catch (error: any) {
                const isNetworkError = !error.response || error.code === 'ERR_NETWORK';

                if (isNetworkError) {
                    console.log('📱 Network error, using cached form templates');
                    // Filter locally
                    let query = db.formTemplates.toCollection();
                    
                    if (params.projectId) {
                        query = db.formTemplates.where('projectId').equals(params.projectId);
                    } else if (params.subprojectId) {
                        query = db.formTemplates.where('subprojectId').equals(params.subprojectId);
                    } else if (params.activityId) {
                        query = db.formTemplates.where('activityId').equals(params.activityId);
                    }

                    const cachedTemplates = await query.toArray();
                    return cachedTemplates.map(this.stripOfflineFields);
                }

                throw error;
            }
        }

        // Offline - filter locally
        let query = db.formTemplates.toCollection();
        
        if (params.projectId) {
            query = db.formTemplates.where('projectId').equals(params.projectId);
        } else if (params.subprojectId) {
            query = db.formTemplates.where('subprojectId').equals(params.subprojectId);
        } else if (params.activityId) {
            query = db.formTemplates.where('activityId').equals(params.activityId);
        }

        const cachedTemplates = await query.toArray();
        return cachedTemplates.map(this.stripOfflineFields);
    }

    // ===========================
    // Form Submissions
    // ===========================

    /**
     * Submit a form response
     * Online: Submits immediately via API
     * Offline: Queues submission for later sync
     */
    async submitFormResponse(submissionData: {
        templateId: string;
        entityId: string;
        entityType: string;
        data: Record<string, any>;
    }): Promise<FormSubmission> {
        const isOnline = syncService.isOnline();

        if (isOnline) {
            try {
                const response = await axiosInstance.post<{ success: boolean; data?: FormSubmission }>(
                    '/forms/responses',
                    submissionData
                );

                if (response.data.success && response.data.data) {
                    const submission = response.data.data;

                    // Cache in IndexedDB
                    await db.formSubmissions.put({
                        ...submission,
                        synced: true,
                        _localUpdatedAt: new Date().toISOString(),
                    });

                    return submission;
                }

                throw new Error('Failed to submit form');
            } catch (error: any) {
                console.error('Failed to submit form via API:', error);
                throw error;
            }
        }

        // Offline - create locally and queue
        console.log('📱 Submitting form offline');

        const tempId = `temp-${crypto?.randomUUID ? crypto.randomUUID() : Date.now()}`;
        const now = new Date().toISOString();

        // Get current user from localStorage or auth context
        const currentUser = localStorage.getItem('userId') || 'unknown';

        const newSubmission: FormSubmission = {
            id: tempId,
            ...submissionData,
            submittedBy: currentUser,
            submittedAt: now,
            createdAt: now,
            updatedAt: now,
        };

        // Store in local DB as unsynced
        await db.formSubmissions.put({
            ...newSubmission,
            synced: false,
            _localUpdatedAt: now,
        });

        // Queue mutation
        await syncService.queueMutation({
            entityType: 'formSubmission',
            entityId: tempId,
            operation: 'create',
            data: submissionData,
            endpoint: '/forms/responses',
            method: 'POST',
        });

        return newSubmission;
    }

    /**
     * Get form submissions for an entity
     */
    async getFormSubmissions(params: {
        templateId?: string;
        entityId?: string;
        entityType?: string;
    }): Promise<FormSubmission[]> {
        const isOnline = syncService.isOnline();

        if (isOnline) {
            try {
                const response = await axiosInstance.get<{ success: boolean; data: FormSubmission[] }>(
                    '/forms/responses',
                    { params }
                );

                if (response.data.success && response.data.data) {
                    const submissions = response.data.data;

                    for (const submission of submissions) {
                        await db.formSubmissions.put({
                            ...submission,
                            synced: true,
                            _localUpdatedAt: new Date().toISOString(),
                        });
                    }

                    return submissions;
                }

                return [];
            } catch (error: any) {
                const isNetworkError = !error.response || error.code === 'ERR_NETWORK';

                if (isNetworkError) {
                    console.log('📱 Network error, using cached form submissions');
                    return this.getLocalFormSubmissions(params);
                }

                throw error;
            }
        }

        // Offline - use cache
        console.log('📱 Offline mode - using cached form submissions');
        return this.getLocalFormSubmissions(params);
    }

    /**
     * Get form submissions from local cache with filters
     */
    private async getLocalFormSubmissions(params: {
        templateId?: string;
        entityId?: string;
        entityType?: string;
    }): Promise<FormSubmission[]> {
        let submissions = await db.formSubmissions.toArray();

        if (params.templateId) {
            submissions = submissions.filter(s => s.templateId === params.templateId);
        }
        if (params.entityId) {
            submissions = submissions.filter(s => s.entityId === params.entityId);
        }
        if (params.entityType) {
            submissions = submissions.filter(s => s.entityType === params.entityType);
        }

        return submissions.map(this.stripOfflineFields);
    }

    // ===========================
    // Helper Methods
    // ===========================

    /**
     * Remove offline-specific fields before returning to application
     */
    private stripOfflineFields<T extends Record<string, any>>(
        entity: T & { synced?: boolean; _localUpdatedAt?: string }
    ): T {
        const { synced, _localUpdatedAt, ...rest } = entity;
        return rest as T;
    }

    /**
     * Check if an entity is locally modified (not synced)
     */
    async isEntityModified(entityType: 'project' | 'activity', entityId: string): Promise<boolean> {
        let table;

        switch (entityType) {
            case 'project':
                table = db.projects;
                break;
            case 'activity':
                table = db.activities;
                break;
            default:
                return false;
        }

        const entity = await table.get(entityId);
        return entity ? !entity.synced : false;
    }

    /**
     * Get count of unsynced entities
     */
    async getUnsyncedCount(): Promise<{
        projects: number;
        activities: number;
        formSubmissions: number;
        total: number;
    }> {
        const [projects, activities, formSubmissions] = await Promise.all([
            db.projects.filter(p => p.synced === false).count(),
            db.activities.filter(a => a.synced === false).count(),
            db.formSubmissions.filter(s => s.synced === false).count(),
        ]);

        return {
            projects,
            activities,
            formSubmissions,
            total: projects + activities + formSubmissions,
        };
    }
}

// ===========================
// Singleton Export
// ===========================

/**
 * Singleton instance of the offline data service
 * Use this for all data access in your application
 */
export const offlineDataService = new OfflineDataService();

export default offlineDataService;

