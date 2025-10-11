/**
 * Data Preloader Service
 * 
 * Preloads ALL data into IndexedDB on login/app start.
 * This ensures the app works identically whether online or offline.
 */

import { db } from '../../db/db';
import axiosInstance from '../axiosInstance';
import { toast } from 'sonner';

interface PreloadProgress {
    total: number;
    completed: number;
    current: string;
    percentage: number;
}

type ProgressCallback = (progress: PreloadProgress) => void;

class DataPreloader {
    private isPreloading = false;
    private progressCallbacks: Set<ProgressCallback> = new Set();

    /**
     * Subscribe to preload progress
     */
    subscribeToProgress(callback: ProgressCallback): () => void {
        this.progressCallbacks.add(callback);
        return () => this.progressCallbacks.delete(callback);
    }

    /**
     * Notify progress
     */
    private notifyProgress(progress: PreloadProgress) {
        this.progressCallbacks.forEach(cb => {
            try {
                cb(progress);
            } catch (error) {
                console.error('Error in progress callback:', error);
            }
        });
    }

    /**
     * Check if data is already preloaded
     */
    async isDataPreloaded(): Promise<boolean> {
        const projectCount = await db.projects.count();
        const templateCount = await db.formTemplates.count();
        
        // Consider preloaded if we have at least some projects and templates
        return projectCount > 0 && templateCount > 0;
    }

    /**
     * Preload ALL data into IndexedDB
     */
    async preloadAllData(userId?: string): Promise<void> {
        if (this.isPreloading) {
            console.log('⏳ Preload already in progress');
            return;
        }

        this.isPreloading = true;
        const startTime = Date.now();

        try {
            console.log('🔄 Starting data preload...');
            toast.info('Loading data for offline use...', { duration: 2000 });

            const steps = [
                { name: 'Projects', fn: () => this.preloadProjects() },
                { name: 'Subprojects', fn: () => this.preloadSubprojects() },
                { name: 'Activities', fn: () => this.preloadActivities() },
                { name: 'Beneficiaries', fn: () => this.preloadBeneficiaries() },
                { name: 'Form Templates', fn: () => this.preloadFormTemplates() },
                { name: 'Services', fn: () => this.preloadServices() },
                { name: 'Users', fn: () => this.preloadUsers() },
                { name: 'Project Users', fn: () => this.preloadProjectUsers() },
                { name: 'Subproject Users', fn: () => this.preloadSubprojectUsers() },
                { name: 'Entity Services', fn: () => this.preloadEntityServices() },
                { name: 'User Data', fn: () => userId ? this.preloadUserData(userId) : Promise.resolve(0) },
            ];

            let completed = 0;
            const total = steps.length;

            for (const step of steps) {
                this.notifyProgress({
                    total,
                    completed,
                    current: step.name,
                    percentage: Math.round((completed / total) * 100),
                });

                try {
                    const count = await step.fn();
                    console.log(`✅ Preloaded ${count} ${step.name}`);
                } catch (error) {
                    console.error(`❌ Failed to preload ${step.name}:`, error);
                }

                completed++;
            }

            this.notifyProgress({
                total,
                completed: total,
                current: 'Complete',
                percentage: 100,
            });

            const duration = ((Date.now() - startTime) / 1000).toFixed(1);
            console.log(`✅ Data preload complete in ${duration}s`);
            toast.success('Data loaded successfully!', { duration: 2000 });

        } catch (error: any) {
            console.error('❌ Data preload failed:', error);
            toast.error('Failed to load data: ' + error.message);
            throw error;
        } finally {
            this.isPreloading = false;
        }
    }

    /**
     * Preload projects
     */
    private async preloadProjects(): Promise<number> {
        try {
            const response = await axiosInstance.get<{ success: boolean; data: any[] }>('/projects');
            
            if (response.data.success && response.data.data) {
                const projects = response.data.data;
                const now = new Date().toISOString();

                for (const project of projects) {
                    await db.projects.put({
                        ...project,
                        synced: true,
                        _localUpdatedAt: now,
                    });
                }

                return projects.length;
            }

            return 0;
        } catch (error) {
            console.error('Failed to preload projects:', error);
            return 0;
        }
    }

    /**
     * Preload subprojects for all projects
     */
    private async preloadSubprojects(): Promise<number> {
        try {
            const projects = await db.projects.toArray();
            let totalCount = 0;
            const now = new Date().toISOString();

            for (const project of projects) {
                try {
                    const response = await axiosInstance.get<{ success: boolean; data: any[] }>(
                        `/projects/${project.id}/subprojects`
                    );

                    if (response.data.success && response.data.data) {
                        for (const subproject of response.data.data) {
                            await db.subprojects.put({
                                ...subproject,
                                synced: true,
                                _localUpdatedAt: now,
                            });
                            totalCount++;
                        }
                    }
                } catch (error) {
                    console.warn(`Failed to preload subprojects for project ${project.id}`);
                }
            }

            return totalCount;
        } catch (error) {
            console.error('Failed to preload subprojects:', error);
            return 0;
        }
    }

    /**
     * Preload activities for all subprojects
     */
    private async preloadActivities(): Promise<number> {
        try {
            const subprojects = await db.subprojects.toArray();
            let totalCount = 0;
            const now = new Date().toISOString();

            for (const subproject of subprojects) {
                try {
                    const response = await axiosInstance.get<{ success: boolean; data: any[] }>(
                        `/activities/subproject/${subproject.id}`
                    );

                    if (response.data.success && response.data.data) {
                        for (const activity of response.data.data) {
                            await db.activities.put({
                                ...activity,
                                synced: true,
                                _localUpdatedAt: now,
                            });
                            totalCount++;
                        }
                    }
                } catch (error) {
                    console.warn(`Failed to preload activities for subproject ${subproject.id}`);
                }
            }

            return totalCount;
        } catch (error) {
            console.error('Failed to preload activities:', error);
            return 0;
        }
    }

    /**
     * Preload beneficiaries
     */
    private async preloadBeneficiaries(): Promise<number> {
        try {
            const response = await axiosInstance.get<{ success: boolean; data: any[] }>('/beneficiaries');
            
            if (response.data.success && response.data.data) {
                const beneficiaries = response.data.data;
                const now = new Date().toISOString();

                for (const beneficiary of beneficiaries) {
                    await db.beneficiaries.put({
                        ...beneficiary,
                        synced: true,
                        _localUpdatedAt: now,
                    });
                }

                return beneficiaries.length;
            }

            return 0;
        } catch (error) {
            console.error('Failed to preload beneficiaries:', error);
            return 0;
        }
    }

    /**
     * Preload form templates
     */
    private async preloadFormTemplates(): Promise<number> {
        try {
            const response = await axiosInstance.get<{ success: boolean; data: any[] }>('/forms/templates');
            
            if (response.data.success && response.data.data) {
                const templates = response.data.data;
                const now = new Date().toISOString();

                for (const template of templates) {
                    await db.formTemplates.put({
                        ...template,
                        synced: true,
                        _localUpdatedAt: now,
                    });
                }

                return templates.length;
            }

            return 0;
        } catch (error) {
            console.error('Failed to preload form templates:', error);
            return 0;
        }
    }

    /**
     * Preload services
     */
    private async preloadServices(): Promise<number> {
        try {
            const response = await axiosInstance.get<{ success: boolean; data: any[] }>('/services');
            
            if (response.data.success && response.data.data) {
                const services = response.data.data;
                const now = new Date().toISOString();

                for (const service of services) {
                    await db.services.put({
                        ...service,
                        synced: true,
                        _localUpdatedAt: now,
                    });
                }

                return services.length;
            }

            return 0;
        } catch (error) {
            console.error('Failed to preload services:', error);
            return 0;
        }
    }

    /**
     * Preload users
     */
    private async preloadUsers(): Promise<number> {
        try {
            const response = await axiosInstance.get<{ success: boolean; data: any[] }>('/users');
            
            if (response.data.success && response.data.data) {
                const users = response.data.data;
                const now = new Date().toISOString();

                for (const user of users) {
                    await db.users.put({
                        ...user,
                        synced: true,
                        _localUpdatedAt: now,
                    });
                }

                return users.length;
            }

            return 0;
        } catch (error) {
            console.error('Failed to preload users:', error);
            return 0;
        }
    }

    /**
     * Preload project user assignments
     */
    private async preloadProjectUsers(): Promise<number> {
        try {
            const projects = await db.projects.toArray();
            let totalCount = 0;
            const now = new Date().toISOString();

            for (const project of projects) {
                try {
                    const response = await axiosInstance.get<{ success: boolean; data: any[] }>(
                        `/projects/${project.id}/users`
                    );

                    if (response.data.success && response.data.data) {
                        for (const assignment of response.data.data) {
                            await db.projectUsers.put({
                                id: `${project.id}-${assignment.userId}`,
                                projectId: project.id,
                                userId: assignment.userId,
                                role: assignment.role,
                                assignedAt: assignment.assignedAt || now,
                                updatedAt: now,
                                synced: true,
                                _localUpdatedAt: now,
                            });
                            totalCount++;
                        }
                    }
                } catch (error) {
                    console.warn(`Failed to preload users for project ${project.id}`);
                }
            }

            return totalCount;
        } catch (error) {
            console.error('Failed to preload project users:', error);
            return 0;
        }
    }

    /**
     * Preload subproject user assignments
     */
    private async preloadSubprojectUsers(): Promise<number> {
        try {
            const subprojects = await db.subprojects.toArray();
            let totalCount = 0;
            const now = new Date().toISOString();

            for (const subproject of subprojects) {
                try {
                    const response = await axiosInstance.get<{ success: boolean; data: any[] }>(
                        `/subprojects/${subproject.id}/users`
                    );

                    if (response.data.success && response.data.data) {
                        for (const assignment of response.data.data) {
                            await db.subprojectUsers.put({
                                id: `${subproject.id}-${assignment.userId}`,
                                subprojectId: subproject.id,
                                userId: assignment.userId,
                                role: assignment.role,
                                assignedAt: assignment.assignedAt || now,
                                updatedAt: now,
                                synced: true,
                                _localUpdatedAt: now,
                            });
                            totalCount++;
                        }
                    }
                } catch (error) {
                    console.warn(`Failed to preload users for subproject ${subproject.id}`);
                }
            }

            return totalCount;
        } catch (error) {
            console.error('Failed to preload subproject users:', error);
            return 0;
        }
    }

    /**
     * Preload entity service assignments
     */
    private async preloadEntityServices(): Promise<number> {
        try {
            let totalCount = 0;
            const now = new Date().toISOString();

            // Get services for all projects
            const projects = await db.projects.toArray();
            for (const project of projects) {
                try {
                    const response = await axiosInstance.get<{ success: boolean; data: any[] }>(
                        `/services/entity?entityId=${project.id}&entityType=project`
                    );

                    if (response.data.success && response.data.data) {
                        for (const service of response.data.data) {
                            await db.entityServices.put({
                                id: `${project.id}-project-${service.id}`,
                                serviceId: service.id,
                                entityId: project.id,
                                entityType: 'project',
                                assignedAt: service.assignedAt || now,
                                updatedAt: now,
                                synced: true,
                                _localUpdatedAt: now,
                            });
                            totalCount++;
                        }
                    }
                } catch (error) {
                    console.warn(`Failed to preload services for project ${project.id}`);
                }
            }

            // Get services for all subprojects
            const subprojects = await db.subprojects.toArray();
            for (const subproject of subprojects) {
                try {
                    const response = await axiosInstance.get<{ success: boolean; data: any[] }>(
                        `/services/entity?entityId=${subproject.id}&entityType=subproject`
                    );

                    if (response.data.success && response.data.data) {
                        for (const service of response.data.data) {
                            await db.entityServices.put({
                                id: `${subproject.id}-subproject-${service.id}`,
                                serviceId: service.id,
                                entityId: subproject.id,
                                entityType: 'subproject',
                                assignedAt: service.assignedAt || now,
                                updatedAt: now,
                                synced: true,
                                _localUpdatedAt: now,
                            });
                            totalCount++;
                        }
                    }
                } catch (error) {
                    console.warn(`Failed to preload services for subproject ${subproject.id}`);
                }
            }

            return totalCount;
        } catch (error) {
            console.error('Failed to preload entity services:', error);
            return 0;
        }
    }

    /**
     * Preload user-specific data
     */
    private async preloadUserData(userId: string): Promise<number> {
        try {
            const response = await axiosInstance.get<{ success: boolean; data: any }>(
                `/users/${userId}/projects`
            );
            
            if (response.data.success && response.data.data) {
                // This endpoint returns nested structure, already handled by other preloads
                return 1;
            }

            return 0;
        } catch (error) {
            console.error('Failed to preload user data:', error);
            return 0;
        }
    }

    /**
     * Force refresh all data
     */
    async forceRefresh(userId?: string): Promise<void> {
        console.log('🔄 Force refreshing all data...');
        
        // Clear existing data
        await db.clearAllData();
        
        // Preload fresh data
        await this.preloadAllData(userId);
    }

    /**
     * Get preload statistics
     */
    async getStats(): Promise<{
        projects: number;
        subprojects: number;
        activities: number;
        beneficiaries: number;
        formTemplates: number;
        formSubmissions: number;
        services: number;
        users: number;
        projectUsers: number;
        subprojectUsers: number;
        entityServices: number;
        pendingMutations: number;
        totalSize: number;
    }> {
        const [projects, subprojects, activities, beneficiaries, formTemplates, formSubmissions, services, users, projectUsers, subprojectUsers, entityServices, pendingMutations] = await Promise.all([
            db.projects.count(),
            db.subprojects.count(),
            db.activities.count(),
            db.beneficiaries.count(),
            db.formTemplates.count(),
            db.formSubmissions.count(),
            db.services.count(),
            db.users.count(),
            db.projectUsers.count(),
            db.subprojectUsers.count(),
            db.entityServices.count(),
            db.pendingMutations.count(),
        ]);

        // Estimate total size (rough calculation)
        const totalSize = projects + subprojects + activities + beneficiaries + formTemplates + formSubmissions + services + users + projectUsers + subprojectUsers + entityServices;

        return {
            projects,
            subprojects,
            activities,
            beneficiaries,
            formTemplates,
            formSubmissions,
            services,
            users,
            projectUsers,
            subprojectUsers,
            entityServices,
            pendingMutations,
            totalSize,
        };
    }
}

export const dataPreloader = new DataPreloader();
export default dataPreloader;
