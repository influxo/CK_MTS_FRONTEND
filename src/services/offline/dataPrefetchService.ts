/**
 * Data Prefetch Service
 * 
 * Automatically fetches and caches all necessary data for offline use.
 * Call this after login to ensure user has access to data when offline.
 * 
 * Usage:
 *   import { dataPrefetchService } from '@/services/offline/dataPrefetchService'
 *   
 *   // After login:
 *   await dataPrefetchService.prefetchAllData()
 *   
 *   // Or prefetch specific data:
 *   await dataPrefetchService.prefetchProjects()
 */

import { db } from '../../db/db';
import axiosInstance from '../axiosInstance';

interface PrefetchResult {
    success: boolean;
    cached: number;
    error?: string;
}

interface PrefetchSummary {
    projects: PrefetchResult;
    subprojects: PrefetchResult;
    activities: PrefetchResult;
    beneficiaries: PrefetchResult;
    formTemplates: PrefetchResult;
    users: PrefetchResult;
    services: PrefetchResult;
    total: {
        success: number;
        failed: number;
        totalCached: number;
    };
}

class DataPrefetchService {
    private isPrefetching = false;

    /**
     * Prefetch all data needed for offline use
     * Call this after successful login
     */
    async prefetchAllData(): Promise<PrefetchSummary> {
        if (this.isPrefetching) {
            console.log('⏳ Prefetch already in progress...');
            throw new Error('Prefetch already in progress');
        }

        this.isPrefetching = true;
        console.log('🔄 Starting data prefetch for offline use...');

        const results: PrefetchSummary = {
            projects: { success: false, cached: 0 },
            subprojects: { success: false, cached: 0 },
            activities: { success: false, cached: 0 },
            beneficiaries: { success: false, cached: 0 },
            formTemplates: { success: false, cached: 0 },
            users: { success: false, cached: 0 },
            services: { success: false, cached: 0 },
            total: {
                success: 0,
                failed: 0,
                totalCached: 0,
            },
        };

        // Fetch all data in parallel
        const prefetchPromises = [
            this.prefetchProjects().then(r => { results.projects = r; }),
            this.prefetchSubprojects().then(r => { results.subprojects = r; }),
            this.prefetchActivities().then(r => { results.activities = r; }),
            this.prefetchBeneficiaries().then(r => { results.beneficiaries = r; }),
            this.prefetchFormTemplates().then(r => { results.formTemplates = r; }),
            this.prefetchUsers().then(r => { results.users = r; }),
            this.prefetchServices().then(r => { results.services = r; }),
        ];

        await Promise.allSettled(prefetchPromises);

        // Calculate totals
        Object.values(results).forEach((result) => {
            if (typeof result === 'object' && 'success' in result) {
                if (result.success) {
                    results.total.success++;
                    results.total.totalCached += result.cached;
                } else {
                    results.total.failed++;
                }
            }
        });

        this.isPrefetching = false;
        console.log('✅ Prefetch complete:', results.total);

        return results;
    }

    /**
     * Prefetch projects
     */
    async prefetchProjects(): Promise<PrefetchResult> {
        try {
            const response = await axiosInstance.get<{ success: boolean; data: any[] }>('/projects');

            if (response.data.success && response.data.data) {
                for (const project of response.data.data) {
                    await db.projects.put({
                        ...project,
                        synced: true,
                        _localUpdatedAt: new Date().toISOString(),
                    });
                }

                console.log('✅ Cached', response.data.data.length, 'projects');
                return { success: true, cached: response.data.data.length };
            }

            return { success: false, cached: 0, error: 'No data returned' };
        } catch (error: any) {
            console.error('❌ Failed to prefetch projects:', error.message);
            return { success: false, cached: 0, error: error.message };
        }
    }

    /**
     * Prefetch subprojects for all projects
     */
    async prefetchSubprojects(): Promise<PrefetchResult> {
        try {
            // Get all projects first
            const projects = await db.projects.toArray();
            let totalCached = 0;

            // Fetch subprojects for each project
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
                                _localUpdatedAt: new Date().toISOString(),
                            });
                            totalCached++;
                        }
                    }
                } catch (error) {
                    console.warn(`Failed to fetch subprojects for project ${project.id}`);
                }
            }

            console.log('✅ Cached', totalCached, 'subprojects');
            return { success: true, cached: totalCached };
        } catch (error: any) {
            console.error('❌ Failed to prefetch subprojects:', error.message);
            return { success: false, cached: 0, error: error.message };
        }
    }

    /**
     * Prefetch activities for all subprojects
     */
    async prefetchActivities(): Promise<PrefetchResult> {
        try {
            // Get all subprojects first
            const subprojects = await db.subprojects.toArray();
            let totalCached = 0;

            // Fetch activities for each subproject
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
                                _localUpdatedAt: new Date().toISOString(),
                            });
                            totalCached++;
                        }
                    }
                } catch (error) {
                    console.warn(`Failed to fetch activities for subproject ${subproject.id}`);
                }
            }

            console.log('✅ Cached', totalCached, 'activities');
            return { success: true, cached: totalCached };
        } catch (error: any) {
            console.error('❌ Failed to prefetch activities:', error.message);
            return { success: false, cached: 0, error: error.message };
        }
    }

    /**
     * Prefetch beneficiaries
     */
    async prefetchBeneficiaries(): Promise<PrefetchResult> {
        try {
            const response = await axiosInstance.get<{ success: boolean; data: any[] }>('/beneficiaries');

            if (response.data.success && response.data.data) {
                for (const beneficiary of response.data.data) {
                    await db.beneficiaries.put({
                        ...beneficiary,
                        synced: true,
                        _localUpdatedAt: new Date().toISOString(),
                    });
                }

                console.log('✅ Cached', response.data.data.length, 'beneficiaries');
                return { success: true, cached: response.data.data.length };
            }

            return { success: false, cached: 0, error: 'No data returned' };
        } catch (error: any) {
            console.error('❌ Failed to prefetch beneficiaries:', error.message);
            return { success: false, cached: 0, error: error.message };
        }
    }

    /**
     * Prefetch form templates
     */
    async prefetchFormTemplates(): Promise<PrefetchResult> {
        try {
            const response = await axiosInstance.get<{ success: boolean; data: any[] }>('/forms/templates');

            if (response.data.success && response.data.data) {
                // Store form templates in IndexedDB
                for (const template of response.data.data) {
                    await db.formTemplates.put({
                        ...template,
                        synced: true,
                        _localUpdatedAt: new Date().toISOString(),
                    });
                }

                console.log('✅ Cached', response.data.data.length, 'form templates');
                return { success: true, cached: response.data.data.length };
            }

            return { success: false, cached: 0, error: 'No data returned' };
        } catch (error: any) {
            console.error('❌ Failed to prefetch form templates:', error.message);
            return { success: false, cached: 0, error: error.message };
        }
    }

    /**
     * Prefetch users/employees
     */
    async prefetchUsers(): Promise<PrefetchResult> {
        try {
            const response = await axiosInstance.get<{ success: boolean; data: any[] }>('/users');

            if (response.data.success && response.data.data) {
                // Store users in localStorage for now
                // (You can add a users table to db.ts if needed)
                localStorage.setItem('cached_users', JSON.stringify(response.data.data));

                console.log('✅ Cached', response.data.data.length, 'users');
                return { success: true, cached: response.data.data.length };
            }

            return { success: false, cached: 0, error: 'No data returned' };
        } catch (error: any) {
            console.error('❌ Failed to prefetch users:', error.message);
            return { success: false, cached: 0, error: error.message };
        }
    }

    /**
     * Prefetch services
     */
    async prefetchServices(): Promise<PrefetchResult> {
        try {
            const response = await axiosInstance.get<{ success: boolean; data: any[] }>('/services');

            if (response.data.success && response.data.data) {
                // Store services in localStorage for now
                // (You can add a services table to db.ts if needed)
                localStorage.setItem('cached_services', JSON.stringify(response.data.data));

                console.log('✅ Cached', response.data.data.length, 'services');
                return { success: true, cached: response.data.data.length };
            }

            return { success: false, cached: 0, error: 'No data returned' };
        } catch (error: any) {
            console.error('❌ Failed to prefetch services:', error.message);
            return { success: false, cached: 0, error: error.message };
        }
    }

    /**
     * Check if data is cached
     */
    async isCached(): Promise<boolean> {
        const projectCount = await db.projects.count();
        return projectCount > 0;
    }

    /**
     * Clear all cached data
     */
    async clearCache(): Promise<void> {
        await db.clearAllData();
        localStorage.removeItem('cached_form_templates');
        localStorage.removeItem('cached_users');
        localStorage.removeItem('cached_services');
        console.log('🗑️ All cached data cleared');
    }
}

export const dataPrefetchService = new DataPrefetchService();
export default dataPrefetchService;

