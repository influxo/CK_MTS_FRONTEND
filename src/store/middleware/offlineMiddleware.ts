/**
 * Offline Middleware for Redux
 * 
 * Intercepts Redux thunks and reads from IndexedDB instead of API
 * This allows existing Redux code to work offline without changes
 */

import type { Middleware } from '@reduxjs/toolkit';
import { db } from '../../db/db';

const offlineMiddleware: Middleware = (store) => (next) => async (action: any) => {
  // If it's a pending async thunk, try to fulfill from IndexedDB FIRST
  if (action.type && action.type.endsWith('/pending')) {
    const actionType = action.type.replace('/pending', '');
    console.log('🔍 Middleware intercepting:', actionType);
    const isOffline = typeof navigator !== 'undefined' ? !navigator.onLine : false;
    
    try {
      // Intercept fetchProjects
      if (actionType === 'projects/fetchProjects') {
        if (!isOffline) return next(action);
        const projects = await db.projects.toArray();
        store.dispatch({
          type: 'projects/fetchProjects/fulfilled',
          payload: { success: true, data: projects.map(stripOfflineFields) },
          meta: action.meta,
        });
        return Promise.resolve();
      }

      // Intercept subprojects/fetchUsers -> join subprojectUsers with users
      if (actionType === 'subprojects/fetchUsers') {
        if (!isOffline) return next(action);
        const subprojectId = action.meta?.arg?.subprojectId || action.meta?.arg?.id || action.meta?.arg;
        if (subprojectId) {
          const assignments = await db.subprojectUsers
            .where('subprojectId')
            .equals(subprojectId)
            .toArray();
          const userIds = assignments.map((a) => a.userId);
          const users = await db.users.bulkGet(userIds);
          const items = assignments.map((a) => {
            const u = users.find((x) => x && x.id === a.userId);
            return stripOfflineFields({
              id: a.id,
              subprojectId: a.subprojectId,
              userId: a.userId,
              role: a.role,
              assignedAt: a.assignedAt,
              user: u ? stripOfflineFields(u as any) : undefined,
            });
          });
          store.dispatch({
            type: 'subprojects/fetchUsers/fulfilled',
            payload: { success: true, data: items },
            meta: action.meta,
          });
        }
        return Promise.resolve();
      }

      // Intercept fetchSubProjectsByProjectId
      if (actionType === 'subprojects/fetchByProjectId') {
        if (!isOffline) return next(action);
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
        if (!isOffline) return next(action);
        const subprojects = await db.subprojects.toArray();
        store.dispatch({
          type: 'subprojects/fetch/fulfilled',
          payload: { success: true, data: subprojects.map(stripOfflineFields) },
        });
        return Promise.resolve();
      }

      // Intercept fetchSubprojectActivities
      if (actionType === 'activities/fetchBySubproject') {
        if (!isOffline) return next(action);
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
        if (!isOffline) return next(action);
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
          store.dispatch({
            type: 'subprojects/getById/rejected',
            payload: 'Subproject not available offline',
            meta: action.meta,
            error: { message: 'offline' },
          });
          return Promise.resolve();
        }
        // If not found locally, let the thunk proceed
      }

      // Intercept fetchFormTemplates
      if (actionType === 'form/fetchFormTemplates') {
        if (!isOffline) return next(action);
        const params = action.meta?.arg || {};
        const { projectId, subprojectId, activityId, entityType } = params;
        const templates = await db.formTemplates.toArray();
        const targetId = projectId || subprojectId || activityId;
        const filtered = Array.isArray(templates)
          ? templates.filter((tpl: any) => {
              // Prefer association array if present
              const assoc: any[] = Array.isArray(tpl?.entityAssociations)
                ? tpl.entityAssociations
                : [];
              if (assoc.length && targetId && entityType) {
                return assoc.some(
                  (a) => String(a.entityId) === String(targetId) && String(a.entityType) === String(entityType)
                );
              }
              // Fallback to legacy fields if provided
              if (projectId && tpl.projectId === projectId) return true;
              if (subprojectId && tpl.subprojectId === subprojectId) return true;
              if (activityId && tpl.activityId === activityId) return true;
              // If no filters, include
              return !targetId;
            })
          : [];
        store.dispatch({
          type: 'form/fetchFormTemplates/fulfilled',
          payload: {
            success: true,
            data: {
              templates: filtered.map(stripOfflineFields),
              pagination: {
                page: 1,
                limit: 100,
                totalPages: 1,
                totalCount: filtered.length,
              },
            },
          },
          meta: action.meta,
        });
        return Promise.resolve();
      }

      // Intercept fetchFormTemplateById
      if (actionType === 'form/fetchFormTemplateById') {
        if (!isOffline) return next(action);
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
          store.dispatch({
            type: 'form/fetchFormTemplateById/rejected',
            payload: 'Template not available offline',
            meta: action.meta,
            error: { message: 'offline' },
          });
          return Promise.resolve();
        }
        // If not found locally, let the thunk proceed
      }

      // Intercept fetchEmployees
      if (actionType === 'employees/fetchEmployees') {
        if (!isOffline) return next(action);
        const users = await db.users.toArray();
        store.dispatch({
          type: 'employees/fetchEmployees/fulfilled',
          payload: { success: true, data: users.map(stripOfflineFields) },
        });
        return Promise.resolve();
      }

      // Intercept getAllServices
      if (actionType === 'services/getAll') {
        if (!isOffline) return next(action);
        const services = await db.services.toArray();
        store.dispatch({
          type: 'services/getAll/fulfilled',
          payload: {
            items: services.map(stripOfflineFields),
            page: 1,
            limit: 100,
            totalItems: services.length,
            totalPages: 1,
          },
          meta: action.meta,
        });
        return Promise.resolve();
      }

      // Intercept getEntityServices
      if (actionType === 'services/getEntityServices') {
        if (!isOffline) return next(action);
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
              items: validServices.map(stripOfflineFields),
            },
            meta: action.meta,
          });
        }
        return Promise.resolve();
      }

      // Intercept fetchUserProjectsByUserId
      if (actionType === 'userProjects/fetchByUserId') {
        if (!isOffline) return next(action);
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
        if (!isOffline) return next(action);
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
        if (!isOffline) return next(action);
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
