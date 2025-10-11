/**
 * Offline Middleware for Redux
 * 
 * Intercepts Redux thunks and reads from IndexedDB instead of API
 * This allows existing Redux code to work offline without changes
 */

import type { Middleware } from '@reduxjs/toolkit';
import { completeDb as db } from '../../db/completeSchema';

const offlineMiddleware: Middleware = (store) => (next) => async (action: any) => {
  // If it's a pending async thunk, try to fulfill from IndexedDB FIRST
  if (action.type && action.type.endsWith('/pending')) {
    const actionType = action.type.replace('/pending', '');
    console.log('🔍 Middleware intercepting:', actionType);
    
    try {
      // Intercept fetchProjects
      if (actionType === 'projects/fetchProjects') {
        console.log('📦 Reading projects from IndexedDB (no API call)');
        const projects = await db.projects.toArray();
        console.log(`✅ Found ${projects.length} projects in IndexedDB`);
        
        // Dispatch fulfilled action - this prevents the API call
        store.dispatch({
          type: 'projects/fetchProjects/fulfilled',
          payload: { success: true, data: projects.map(stripOfflineFields) },
          meta: action.meta,
        });
        
        // Return WITHOUT calling next() - this prevents the original async thunk from running
        return Promise.resolve(projects);
      }

      // Intercept fetchSubProjectsByProjectId
      if (actionType === 'subprojects/fetchByProjectId') {
        console.log('📦 Reading subprojects from IndexedDB (no API call)');
        const projectId = action.meta?.arg?.projectId;
        if (projectId) {
          const subprojects = await db.subprojects
            .where('projectId')
            .equals(projectId)
            .toArray();
          store.dispatch({
            type: 'subprojects/fetchByProjectId/fulfilled',
            payload: { success: true, data: subprojects.map(stripOfflineFields) },
            meta: action.meta,
          });
        }
        return Promise.resolve();
      }

      // Intercept fetchAllSubProjects
      if (actionType === 'subprojects/fetch') {
        console.log('📦 Reading all subprojects from IndexedDB (no API call)');
        const subprojects = await db.subprojects.toArray();
        store.dispatch({
          type: 'subprojects/fetch/fulfilled',
          payload: { success: true, data: subprojects.map(stripOfflineFields) },
        });
        return Promise.resolve();
      }

      // Intercept fetchSubprojectActivities
      if (actionType === 'activities/fetchBySubproject') {
        console.log('📦 Reading activities from IndexedDB (no API call)');
        const subprojectId = action.meta?.arg;
        if (subprojectId) {
          const activities = await db.activities
            .where('subprojectId')
            .equals(subprojectId)
            .toArray();
          store.dispatch({
            type: 'activities/fetchBySubproject/fulfilled',
            payload: { success: true, data: activities.map(stripOfflineFields) },
            meta: action.meta,
          });
        }
        return Promise.resolve();
      }

      // Intercept getSubProjectById
      if (actionType === 'subprojects/getById') {
        console.log('📦 Reading subproject by id from IndexedDB (no API call)');
        const id = action.meta?.arg?.id;
        if (id) {
          const subproject = await db.subprojects.get(id);
          if (subproject) {
            store.dispatch({
              type: 'subprojects/getById/fulfilled',
              payload: { success: true, data: stripOfflineFields(subproject) },
              meta: action.meta,
            });
            return Promise.resolve();
          }
          // If offline and not found locally, reject to avoid network call
          if (typeof navigator !== 'undefined' && !navigator.onLine) {
            store.dispatch({
              type: 'subprojects/getById/rejected',
              payload: 'Subproject not available offline',
              meta: action.meta,
              error: { message: 'offline' },
            });
            return Promise.resolve();
          }
        }
        // If not found locally, let the thunk proceed
      }

      // Intercept fetchFormTemplates
      if (actionType === 'form/fetchFormTemplates') {
        const params = action.meta?.arg || {};
        let query = db.formTemplates.toCollection();
        
        if (params.projectId) {
          query = db.formTemplates.where('projectId').equals(params.projectId);
        } else if (params.subprojectId) {
          query = db.formTemplates.where('subprojectId').equals(params.subprojectId);
        } else if (params.activityId) {
          query = db.formTemplates.where('activityId').equals(params.activityId);
        }

        const templates = await query.toArray();
        store.dispatch({
          type: 'form/fetchFormTemplates/fulfilled',
          payload: {
            success: true,
            data: {
              templates: templates.map(stripOfflineFields),
              pagination: {
                page: 1,
                limit: 100,
                totalItems: templates.length,
                totalPages: 1,
              },
            },
          },
          meta: action.meta,
        });
        return Promise.resolve();
      }

      // Intercept fetchFormTemplateById
      if (actionType === 'form/fetchFormTemplateById') {
        console.log('📦 Reading form template by id from IndexedDB (no API call)');
        const id = action.meta?.arg?.id;
        if (id) {
          const template = await db.formTemplates.get(id);
          if (template) {
            store.dispatch({
              type: 'form/fetchFormTemplateById/fulfilled',
              payload: { success: true, data: stripOfflineFields(template) },
              meta: action.meta,
            });
            return Promise.resolve();
          }
          // If offline and not found locally, reject to avoid network call
          if (typeof navigator !== 'undefined' && !navigator.onLine) {
            store.dispatch({
              type: 'form/fetchFormTemplateById/rejected',
              payload: 'Template not available offline',
              meta: action.meta,
              error: { message: 'offline' },
            });
            return Promise.resolve();
          }
        }
        // If not found locally, let the thunk proceed
      }

      // Intercept fetchEmployees
      if (actionType === 'employees/fetchEmployees') {
        const users = await db.users.toArray();
        store.dispatch({
          type: 'employees/fetchEmployees/fulfilled',
          payload: { success: true, data: users.map(stripOfflineFields) },
        });
        return Promise.resolve();
      }

      // Intercept getAllServices
      if (actionType === 'services/getAll') {
        const services = await db.services.toArray();
        store.dispatch({
          type: 'services/getAll/fulfilled',
          payload: {
            success: true,
            data: {
              items: services.map(stripOfflineFields),
              page: 1,
              limit: 100,
              totalItems: services.length,
              totalPages: 1,
            },
          },
          meta: action.meta,
        });
        return Promise.resolve();
      }

      // Intercept getEntityServices
      if (actionType === 'services/getEntityServices') {
        const { entityId, entityType } = action.meta?.arg || {};
        if (entityId && entityType) {
          const entityServices = await db.entityServices
            .where('entityId')
            .equals(entityId)
            .and((s) => s.entityType === entityType)
            .toArray();

          // Get the actual service details
          const serviceIds = entityServices.map((es) => es.serviceId);
          const services = await db.services.bulkGet(serviceIds);
          const validServices = services.filter((s): s is NonNullable<typeof s> => s !== undefined);

          store.dispatch({
            type: 'services/getEntityServices/fulfilled',
            payload: {
              success: true,
              items: validServices.map(stripOfflineFields),
            },
            meta: action.meta,
          });
        }
        return Promise.resolve();
      }

      // Intercept fetchUserProjectsByUserId
      if (actionType === 'userProjects/fetchByUserId') {
        const userId = action.meta?.arg;
        if (userId) {
          // Get user's projects
          const projectUsers = await db.projectUsers
            .where('userId')
            .equals(userId)
            .toArray();

          const projectIds = projectUsers.map((pu) => pu.projectId);
          const projects = await db.projects.bulkGet(projectIds);
          const validProjects = projects.filter((p): p is NonNullable<typeof p> => p !== undefined);

          // Build nested structure
          const userProjects = [];
          for (const project of validProjects) {
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
                ...stripOfflineFields(subproject),
                activities: activities.map(stripOfflineFields),
              });
            }

            userProjects.push({
              ...stripOfflineFields(project),
              subprojects: subprojectsWithActivities,
            });
          }

          store.dispatch({
            type: 'userProjects/fetchByUserId/fulfilled',
            payload: { success: true, data: userProjects },
            meta: action.meta,
          });
        }
        return Promise.resolve();
      }

      // Intercept fetchBeneficiariesByEntityForForm
      if (actionType === 'form/fetchBeneficiariesByEntity') {
        const beneficiaries = await db.beneficiaries.toArray();

        // Filter by entity if needed (this is a simplified version)
        // In production, you'd need proper entity-beneficiary relationships

        store.dispatch({
          type: 'form/fetchBeneficiariesByEntity/fulfilled',
          payload: {
            success: true,
            items: beneficiaries.map(stripOfflineFields),
            page: 1,
            limit: 100,
            totalItems: beneficiaries.length,
            totalPages: 1,
          },
          meta: action.meta,
        });
        return Promise.resolve();
      }

      // Intercept beneficiaries/fetchByEntity (used in SubProjectDetails)
      if (actionType === 'beneficiaries/fetchByEntity') {
        const beneficiaries = await db.beneficiaries.toArray();
        store.dispatch({
          type: 'beneficiaries/fetchByEntity/fulfilled',
          payload: {
            items: beneficiaries.map(stripOfflineFields),
            page: 1,
            limit: 100,
            totalItems: beneficiaries.length,
            totalPages: 1,
          },
          meta: action.meta,
        });
        return Promise.resolve();
      }

    } catch (error) {
      console.error('❌ Offline middleware error:', error);
      // Let the original async thunk continue (will hit API)
    }
  }

  // For non-intercepted actions, let them pass through normally
  return next(action);
};

/**
 * Strip offline-specific fields
 */
function stripOfflineFields<T extends Record<string, any>>(
  entity: T & { synced?: boolean; _localUpdatedAt?: string }
): T {
  const { synced, _localUpdatedAt, ...rest } = entity;
  return rest as T;
}

export default offlineMiddleware;
