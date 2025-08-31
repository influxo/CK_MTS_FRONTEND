// Service domain models and API contracts

export interface CreateServiceRequest {
  name: string;
  description: string;
  category: string;
  status: string; // e.g., "active"
}

export interface Service {
  id: string;
  name: string;
  description: string;
  category: string;
  status: string;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

export interface CreateServiceResponse {
  success: boolean;
  data?: Service;
  message?: string;
}

export interface GetAllServicesRequest {
  page?: number;
  limit?: number;
  status?: "active" | "inactive";
}

export interface GetAllServicesResponse {
  success: boolean;
  items: Service[];
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  message?: string;
}

// Get service by ID (GET /services/{id})
export interface GetServiceByIdResponse {
  success: boolean;
  data?: Service;
  message?: string;
}

// Update service by ID (PUT /services/{id})
export type UpdateServiceRequest = CreateServiceRequest;

export interface UpdateServiceResponse {
  success: boolean;
  data?: Service;
  message?: string;
}

// Assign service to an entity (POST /services/{id}/assign)
export interface AssignServiceToEntityRequest {
  entityId: string;
  entityType: string; // e.g., "subproject"
}

export interface AssignedServiceEntity {
  id: string;
  serviceId: string;
  entityId: string;
  entityType: string;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

export interface AssignServiceToEntityResponse {
  success: boolean;
  data?: AssignedServiceEntity;
  message?: string;
}

// Batch assign services (POST /services/assignments/batch)
export interface AssignServicesBatchRequest {
  entityId: string;
  entityType: string; // e.g., "subproject"
  serviceIds: string[];
  removeUnlisted: boolean;
}

export interface AssignmentsBatchData {
  created: string[]; // newly created serviceIds
  removed: number; // number of removed assignments
  assignments: AssignedServiceEntity[]; // resulting assignments
}

export interface AssignServicesBatchResponse {
  success: boolean;
  data?: AssignmentsBatchData;
  message?: string;
}

// Get services assigned to an entity (GET /services/assigned?entityId=..&entityType=..)
export interface GetEntityServicesRequest {
  entityId: string;
  entityType: "project" | "subproject";
}

export interface GetEntityServicesResponse {
  success: boolean;
  items: Service[];
  message?: string;
}

// Unassign service from an entity (POST /services/{id}/unassign)
export interface UnassignServiceFromEntityRequest {
  entityId: string;
  entityType: "project" | "subproject";
}

export interface UnassignServiceFromEntityResponse {
  success: boolean;
  data?: { deleted: number };
  message?: string;
}
