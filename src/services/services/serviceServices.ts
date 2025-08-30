import axiosInstance from "../axiosInstance";
import getApiUrl from "../apiUrl";
import type {
  CreateServiceRequest,
  CreateServiceResponse,
  GetAllServicesRequest,
  GetAllServicesResponse,
  GetServiceByIdResponse,
  UpdateServiceRequest,
  UpdateServiceResponse,
  AssignServiceToEntityRequest,
  AssignServiceToEntityResponse,
  AssignServicesBatchRequest,
  AssignServicesBatchResponse,
  GetEntityServicesRequest,
  GetEntityServicesResponse,
  UnassignServiceFromEntityRequest,
  UnassignServiceFromEntityResponse,
} from "./serviceModels";

class ServicesService {
  private baseUrl = getApiUrl();
  private servicesEndpoint = `${this.baseUrl}/services`;

  async createService(
    req: CreateServiceRequest
  ): Promise<CreateServiceResponse> {
    try {
      const response = await axiosInstance.post<CreateServiceResponse>(
        this.servicesEndpoint,
        req
      );
      return response.data;
    } catch (error: any) {
      if (error?.response) {
        return error.response.data as CreateServiceResponse;
      }
      return {
        success: false,
        message: error?.message || "Failed to create service",
      } as CreateServiceResponse;
    }
  }

  async getAllServices(
    req: GetAllServicesRequest
  ): Promise<GetAllServicesResponse> {
    try {
      const response = await axiosInstance.get<GetAllServicesResponse>(
        this.servicesEndpoint,
        {
          params: req,
        }
      );
      return response.data;
    } catch (error: any) {
      if (error?.response) {
        return error.response.data as GetAllServicesResponse;
      }
      return {
        success: false,
        items: [],
        page: req.page || 1,
        limit: req.limit || 20,
        totalItems: 0,
        totalPages: 0,
        message: error?.message || "Failed to fetch services",
      } as GetAllServicesResponse;
    }
  }

  async getServiceById(id: string): Promise<GetServiceByIdResponse> {
    try {
      const response = await axiosInstance.get<GetServiceByIdResponse>(
        `${this.servicesEndpoint}/${encodeURIComponent(id)}`
      );
      return response.data;
    } catch (error: any) {
      if (error?.response) {
        return error.response.data as GetServiceByIdResponse;
      }
      return {
        success: false,
        message: error?.message || "Failed to fetch service",
      } as GetServiceByIdResponse;
    }
  }

  async updateServiceById(
    id: string,
    req: UpdateServiceRequest
  ): Promise<UpdateServiceResponse> {
    try {
      const response = await axiosInstance.put<UpdateServiceResponse>(
        `${this.servicesEndpoint}/${encodeURIComponent(id)}`,
        req
      );
      return response.data;
    } catch (error: any) {
      if (error?.response) {
        return error.response.data as UpdateServiceResponse;
      }
      return {
        success: false,
        message: error?.message || "Failed to update service",
      } as UpdateServiceResponse;
    }
  }

  async assignServiceToEntity(
    id: string,
    req: AssignServiceToEntityRequest
  ): Promise<AssignServiceToEntityResponse> {
    try {
      const response = await axiosInstance.post<AssignServiceToEntityResponse>(
        `${this.servicesEndpoint}/${encodeURIComponent(id)}/assign`,
        req
      );
      return response.data;
    } catch (error: any) {
      if (error?.response) {
        return error.response.data as AssignServiceToEntityResponse;
      }
      return {
        success: false,
        message: error?.message || "Failed to assign service to entity",
      } as AssignServiceToEntityResponse;
    }
  }

  async assignServicesBatch(
    req: AssignServicesBatchRequest
  ): Promise<AssignServicesBatchResponse> {
    try {
      const response = await axiosInstance.post<AssignServicesBatchResponse>(
        `${this.servicesEndpoint}/assignments/batch`,
        req
      );
      return response.data;
    } catch (error: any) {
      if (error?.response) {
        return error.response.data as AssignServicesBatchResponse;
      }
      return {
        success: false,
        message: error?.message || "Failed to assign services batch",
      } as AssignServicesBatchResponse;
    }
  }

  async getEntityServices(
    req: GetEntityServicesRequest
  ): Promise<GetEntityServicesResponse> {
    try {
      const response = await axiosInstance.get<GetEntityServicesResponse>(
        `${this.servicesEndpoint}/assigned`,
        { params: req }
      );
      return response.data;
    } catch (error: any) {
      if (error?.response) {
        return error.response.data as GetEntityServicesResponse;
      }
      return {
        success: false,
        items: [],
        message: error?.message || "Failed to fetch entity services",
      } as GetEntityServicesResponse;
    }
  }

  async unassignServiceFromEntity(
    id: string,
    req: UnassignServiceFromEntityRequest
  ): Promise<UnassignServiceFromEntityResponse> {
    try {
      const response = await axiosInstance.post<UnassignServiceFromEntityResponse>(
        `${this.servicesEndpoint}/${encodeURIComponent(id)}/unassign`,
        req
      );
      return response.data;
    } catch (error: any) {
      if (error?.response) {
        return error.response.data as UnassignServiceFromEntityResponse;
      }
      return {
        success: false,
        data: { deleted: 0 },
        message: error?.message || "Failed to unassign service from entity",
      } as UnassignServiceFromEntityResponse;
    }
  }
}

const servicesService = new ServicesService();
export default servicesService;
