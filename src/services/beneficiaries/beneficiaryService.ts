import axiosInstance from "../axiosInstance";
import getApiUrl from "../apiUrl";
import type {
  CreateBeneficiaryRequest,
  CreateBeneficiaryResponse,
  GetBeneficiariesRequest,
  GetBeneficiariesResponse,
  GetBeneficiaryByIdResponse,
  UpdateBeneficiaryRequest,
  UpdateBeneficiaryResponse,
  DeleteBeneficiaryResponse,
  GetBeneficiaryPIIByIdResponse,
  GetBeneficiaryServicesRequest,
  GetBeneficiaryServicesResponse,
  GetBeneficiaryEntitiesRequest,
  GetBeneficiaryEntitiesResponse,
  RemoveBeneficiaryEntityAssociationRequest,
  RemoveBeneficiaryEntityAssociationResponse,
  GetBeneficiariesByEntityRequest,
  GetBeneficiariesByEntityResponse,
  AssociateBeneficiaryToEntitiesRequest,
  AssociateBeneficiaryToEntitiesResponse,
  GetServiceDeliveriesSummaryRequest,
  GetServiceDeliveriesSummaryResponse,
} from "./beneficiaryModels";
import { toast } from "sonner";

class BeneficiaryService {
  private baseUrl = getApiUrl();
  private beneficiaryEndpoint = `${this.baseUrl}/beneficiaries`;
  private serviceEndpoint = `${this.baseUrl}/services`;

  async createBeneficiary(
    req: CreateBeneficiaryRequest
  ): Promise<CreateBeneficiaryResponse> {
    try {
      const response = await axiosInstance.post<CreateBeneficiaryResponse>(
        this.beneficiaryEndpoint,
        req
      );
      return response.data;
    } catch (error: any) {
      toast.error("Diçka shkoi gabim. ", {
        style: {
          backgroundColor: "#fee2e2",
          color: "#991b1b",
          border: "1px solid #ef4444",
        },
      });
      if (error?.response) {
        return error.response.data as CreateBeneficiaryResponse;
      }
      return {
        success: false,
        message: error?.message || "Failed to create beneficiary",
      } as CreateBeneficiaryResponse;
    }
  }

  async associateBeneficiaryToEntities(
    params: AssociateBeneficiaryToEntitiesRequest
  ): Promise<AssociateBeneficiaryToEntitiesResponse> {
    const { id, links } = params;
    try {
      const response =
        await axiosInstance.post<AssociateBeneficiaryToEntitiesResponse>(
          `${this.beneficiaryEndpoint}/${id}/entities`,
          links
        );
      return response.data;
    } catch (error: any) {
      toast.error("Diçka shkoi gabim. ", {
        style: {
          backgroundColor: "#fee2e2",
          color: "#991b1b",
          border: "1px solid #ef4444",
        },
      });
      if (error?.response) {
        return error.response.data as AssociateBeneficiaryToEntitiesResponse;
      }
      return {
        success: false,
        message:
          error?.message || "Failed to associate beneficiary to entities",
      } as AssociateBeneficiaryToEntitiesResponse;
    }
  }

  async getBeneficiariesByEntity(
    params: GetBeneficiariesByEntityRequest
  ): Promise<GetBeneficiariesByEntityResponse> {
    const { entityId, entityType, status, page, limit } = params;
    try {
      const response =
        await axiosInstance.get<GetBeneficiariesByEntityResponse>(
          `${this.beneficiaryEndpoint}/by-entity`,
          {
            params: {
              entityId,
              entityType,
              status,
              page,
              limit,
            },
          }
        );
      return response.data;
    } catch (error: any) {
      if (error?.response) {
        return error.response.data as GetBeneficiariesByEntityResponse;
      }
      return {
        success: false,
        items: [],
        page: page ?? 1,
        limit: limit ?? 20,
        totalItems: 0,
        totalPages: 0,
        message: error?.message || "Failed to fetch beneficiaries by entity",
      } as GetBeneficiariesByEntityResponse;
    }
  }

  async getBeneficiaries(
    params?: GetBeneficiariesRequest
  ): Promise<GetBeneficiariesResponse> {
    try {
      const response = await axiosInstance.get<GetBeneficiariesResponse>(
        this.beneficiaryEndpoint,
        { params }
      );
      return response.data;
    } catch (error: any) {
      if (error?.response) {
        return error.response.data as GetBeneficiariesResponse;
      }
      return {
        success: false,
        items: [],
        page: params?.page ?? 1,
        limit: params?.limit ?? 20,
        totalItems: 0,
        totalPages: 0,
        message: error?.message || "Failed to fetch beneficiaries",
      } as GetBeneficiariesResponse;
    }
  }

  async getBeneficiaryById(id: string): Promise<GetBeneficiaryByIdResponse> {
    try {
      const response = await axiosInstance.get<GetBeneficiaryByIdResponse>(
        `${this.beneficiaryEndpoint}/${id}`
      );
      return response.data;
    } catch (error: any) {
      if (error?.response) {
        return error.response.data as GetBeneficiaryByIdResponse;
      }
      return {
        success: false,
        message: error?.message || "Failed to fetch beneficiary",
      } as GetBeneficiaryByIdResponse;
    }
  }

  async updateBeneficiaryById(
    id: string,
    req: UpdateBeneficiaryRequest
  ): Promise<UpdateBeneficiaryResponse> {
    try {
      const response = await axiosInstance.put<UpdateBeneficiaryResponse>(
        `${this.beneficiaryEndpoint}/${id}`,
        req
      );
      toast.success("Përfituesi u modifikua me sukses", {
        style: {
          backgroundColor: "#d1fae5",
          color: "#065f46",
          border: "1px solid #10b981",
        },
      });
      return response.data;
    } catch (error: any) {
      toast.error("Diçka shkoi gabim. ", {
        style: {
          backgroundColor: "#fee2e2",
          color: "#991b1b",
          border: "1px solid #ef4444",
        },
      });
      if (error?.response) {
        return error.response.data as UpdateBeneficiaryResponse;
      }
      return {
        success: false,
        message: error?.message || "Failed to update beneficiary",
      } as UpdateBeneficiaryResponse;
    }
  }

  async deleteBeneficiaryById(id: string): Promise<DeleteBeneficiaryResponse> {
    try {
      const response = await axiosInstance.delete<DeleteBeneficiaryResponse>(
        `${this.beneficiaryEndpoint}/${id}`
      );
      return response.data;
    } catch (error: any) {
      toast.error("Diçka shkoi gabim. ", {
        style: {
          backgroundColor: "#fee2e2",
          color: "#991b1b",
          border: "1px solid #ef4444",
        },
      });
      if (error?.response) {
        return error.response.data as DeleteBeneficiaryResponse;
      }
      return {
        success: false,
        message: error?.message || "Failed to delete beneficiary",
      } as DeleteBeneficiaryResponse;
    }
  }

  async getDecryptedPiiForBeneficiaryById(
    id: string
  ): Promise<GetBeneficiaryPIIByIdResponse> {
    try {
      const response = await axiosInstance.get<GetBeneficiaryPIIByIdResponse>(
        `${this.beneficiaryEndpoint}/${id}/pii`
      );
      return response.data;
    } catch (error: any) {
      if (error?.response) {
        return error.response.data as GetBeneficiaryPIIByIdResponse;
      }
      return {
        success: false,
        message: error?.message || "Failed to fetch beneficiary PII",
      } as GetBeneficiaryPIIByIdResponse;
    }
  }

  async getBeneficiaryServices(
    params: GetBeneficiaryServicesRequest
  ): Promise<GetBeneficiaryServicesResponse> {
    const { id, page, limit, fromDate, toDate } = params;
    try {
      const response = await axiosInstance.get<GetBeneficiaryServicesResponse>(
        `${this.beneficiaryEndpoint}/${id}/services`,
        {
          params: {
            page,
            limit,
            fromDate,
            toDate,
          },
        }
      );
      return response.data;
    } catch (error: any) {
      if (error?.response) {
        return error.response.data as GetBeneficiaryServicesResponse;
      }
      return {
        success: false,
        data: [],
        meta: {
          page: page ?? 1,
          limit: limit ?? 20,
          totalItems: 0,
          totalPages: 0,
        },
        message: error?.message || "Failed to fetch beneficiary services",
      } as GetBeneficiaryServicesResponse;
    }
  }

  async getBeneficiaryEntities(
    params: GetBeneficiaryEntitiesRequest
  ): Promise<GetBeneficiaryEntitiesResponse> {
    const { id } = params;
    try {
      const response = await axiosInstance.get<GetBeneficiaryEntitiesResponse>(
        `${this.beneficiaryEndpoint}/${id}/entities`
      );
      return response.data;
    } catch (error: any) {
      if (error?.response) {
        return error.response.data as GetBeneficiaryEntitiesResponse;
      }
      return {
        success: false,
        data: [],
        message: error?.message || "Failed to fetch beneficiary entities",
      } as GetBeneficiaryEntitiesResponse;
    }
  }

  async removeBeneficiaryEntityAssociation(
    params: RemoveBeneficiaryEntityAssociationRequest
  ): Promise<RemoveBeneficiaryEntityAssociationResponse> {
    const { id, entityId, entityType } = params;
    try {
      const response = await (axiosInstance as any).delete(
        `${this.beneficiaryEndpoint}/${id}/entities`,
        { data: { entityId, entityType } }
      );
      toast.success("Asociimi u fshi me sukses", {
        style: {
          backgroundColor: "#d1fae5",
          color: "#065f46",
          border: "1px solid #10b981",
        },
      });
      return response.data;
    } catch (error: any) {
      toast.error("Diçka shkoi gabim. ", {
        style: {
          backgroundColor: "#fee2e2",
          color: "#991b1b",
          border: "1px solid #ef4444",
        },
      });
      if (error?.response) {
        return error.response
          .data as RemoveBeneficiaryEntityAssociationResponse;
      }
      return {
        success: false,
        message:
          error?.message || "Failed to remove beneficiary entity association",
      } as RemoveBeneficiaryEntityAssociationResponse;
    }
  }

  // Service deliveries summary metrics
  async getServiceDeliveriesSummary(
    params?: GetServiceDeliveriesSummaryRequest
  ): Promise<GetServiceDeliveriesSummaryResponse> {
    try {
      const response =
        await axiosInstance.get<GetServiceDeliveriesSummaryResponse>(
          `${this.serviceEndpoint}/metrics/deliveries/summary`,
          {
            params: {
              beneficiaryId: params?.beneficiaryId,
            },
          }
        );
      return response.data;
    } catch (error: any) {
      if (error?.response) {
        return error.response.data as GetServiceDeliveriesSummaryResponse;
      }
      return {
        success: false,
        message: error?.message || "Failed to fetch service deliveries summary",
      } as GetServiceDeliveriesSummaryResponse;
    }
  }
}

const beneficiaryService = new BeneficiaryService();
export default beneficiaryService;
