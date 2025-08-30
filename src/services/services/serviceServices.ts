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
}

const servicesService = new ServicesService();
export default servicesService;
