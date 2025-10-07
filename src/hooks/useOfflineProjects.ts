/**
 * useOfflineProjects Hook
 * 
 * Example integration showing how to use the offline data service
 * for projects. This hook transparently handles online/offline scenarios.
 * 
 * This serves as a template for other entity hooks (useOfflineActivities, etc.)
 * 
 * Usage:
 *   import { useOfflineProjects } from '@/hooks/useOfflineProjects'
 *   
 *   function ProjectList() {
 *     const { 
 *       projects, 
 *       loading, 
 *       error,
 *       createProject,
 *       updateProject,
 *       refetch 
 *     } = useOfflineProjects()
 *     
 *     if (loading) return <Spinner />
 *     if (error) return <Error message={error} />
 *     
 *     return (
 *       <div>
 *         {projects.map(project => (
 *           <ProjectCard key={project.id} project={project} />
 *         ))}
 *       </div>
 *     )
 *   }
 */

import { useState, useEffect, useCallback } from 'react';
import { offlineDataService } from '../services/offline/offlineDataService';
import { syncService } from '../services/offline/syncService';
import type { Project, CreateProjectRequest } from '../services/projects/projectModels';
import { toast } from 'sonner';

// ===========================
// Hook Interface
// ===========================

export interface UseOfflineProjectsReturn {
    /** List of projects */
    projects: Project[];

    /** Loading state */
    loading: boolean;

    /** Error message if any */
    error: string | null;

    /** Whether currently online */
    isOnline: boolean;

    /** Create a new project */
    createProject: (data: CreateProjectRequest) => Promise<Project | null>;

    /** Update an existing project */
    updateProject: (id: string, updates: Partial<Project>) => Promise<Project | null>;

    /** Refetch projects from server (if online) */
    refetch: () => Promise<void>;

    /** Get a single project by ID */
    getProject: (id: string) => Project | undefined;
}

// ===========================
// Hook Implementation
// ===========================

/**
 * Hook for managing projects with offline support
 * 
 * This hook automatically:
 * - Fetches projects from API when online
 * - Uses cached data when offline
 * - Queues mutations when offline
 * - Re-fetches when connection is restored
 */
export function useOfflineProjects(): UseOfflineProjectsReturn {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isOnline, setIsOnline] = useState(syncService.isOnline());

    // Load projects
    const loadProjects = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const fetchedProjects = await offlineDataService.getProjects();
            setProjects(fetchedProjects);
        } catch (err: any) {
            console.error('Failed to load projects:', err);
            setError(err.message || 'Failed to load projects');

            toast.error('Failed to load projects', {
                description: err.message || 'An error occurred',
            });
        } finally {
            setLoading(false);
        }
    }, []);

    // Initial load
    useEffect(() => {
        loadProjects();
    }, [loadProjects]);

    // Subscribe to sync state changes (to know when to refetch)
    useEffect(() => {
        const unsubscribe = syncService.subscribe((state) => {
            setIsOnline(state.isOnline);

            // Refetch when sync completes (new data from server)
            if (state.syncStatus === 'idle' && state.lastSyncedAt) {
                loadProjects();
            }
        });

        return () => {
            unsubscribe();
        };
    }, [loadProjects]);

    // Create project
    const createProject = useCallback(async (data: CreateProjectRequest): Promise<Project | null> => {
        try {
            const newProject = await offlineDataService.createProject(data);

            // Update local state
            setProjects(prev => [...prev, newProject]);

            toast.success('Project created', {
                description: isOnline
                    ? 'Project has been created successfully'
                    : 'Project will be synced when you\'re back online',
            });

            return newProject;
        } catch (err: any) {
            console.error('Failed to create project:', err);

            toast.error('Failed to create project', {
                description: err.message || 'An error occurred',
            });

            return null;
        }
    }, [isOnline]);

    // Update project
    const updateProject = useCallback(async (
        id: string,
        updates: Partial<Project>
    ): Promise<Project | null> => {
        try {
            const updatedProject = await offlineDataService.updateProject(id, updates);

            // Update local state
            setProjects(prev =>
                prev.map(p => p.id === id ? updatedProject : p)
            );

            toast.success('Project updated', {
                description: isOnline
                    ? 'Project has been updated successfully'
                    : 'Changes will be synced when you\'re back online',
            });

            return updatedProject;
        } catch (err: any) {
            console.error('Failed to update project:', err);

            toast.error('Failed to update project', {
                description: err.message || 'An error occurred',
            });

            return null;
        }
    }, [isOnline]);

    // Refetch projects
    const refetch = useCallback(async () => {
        await loadProjects();
    }, [loadProjects]);

    // Get single project
    const getProject = useCallback((id: string): Project | undefined => {
        return projects.find(p => p.id === id);
    }, [projects]);

    return {
        projects,
        loading,
        error,
        isOnline,
        createProject,
        updateProject,
        refetch,
        getProject,
    };
}

// ===========================
// Activities Hook (Bonus Example)
// ===========================

/**
 * Example hook for activities with offline support
 * Shows how to implement hooks for other entities
 */
export function useOfflineActivities(subprojectId: string) {
    const [activities, setActivities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadActivities = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const fetchedActivities = await offlineDataService.getActivitiesForSubproject(subprojectId);
            setActivities(fetchedActivities);
        } catch (err: any) {
            console.error('Failed to load activities:', err);
            setError(err.message || 'Failed to load activities');
        } finally {
            setLoading(false);
        }
    }, [subprojectId]);

    useEffect(() => {
        if (subprojectId) {
            loadActivities();
        }
    }, [subprojectId, loadActivities]);

    const createActivity = useCallback(async (data: any) => {
        try {
            const newActivity = await offlineDataService.createActivity(data);
            setActivities(prev => [...prev, newActivity]);

            toast.success('Activity created', {
                description: syncService.isOnline()
                    ? 'Activity has been created successfully'
                    : 'Activity will be synced when you\'re back online',
            });

            return newActivity;
        } catch (err: any) {
            console.error('Failed to create activity:', err);
            toast.error('Failed to create activity', {
                description: err.message,
            });
            return null;
        }
    }, []);

    return {
        activities,
        loading,
        error,
        createActivity,
        refetch: loadActivities,
    };
}

export default useOfflineProjects;

