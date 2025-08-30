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
