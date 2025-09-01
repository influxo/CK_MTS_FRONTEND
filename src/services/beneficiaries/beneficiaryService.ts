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
} from "./beneficiaryModels";

class BeneficiaryService {
  private baseUrl = getApiUrl();
  private beneficiaryEndpoint = `${this.baseUrl}/beneficiaries`;

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
      if (error?.response) {
        return error.response.data as CreateBeneficiaryResponse;
      }
      return {
        success: false,
        message: error?.message || "Failed to create beneficiary",
      } as CreateBeneficiaryResponse;
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
      return response.data;
    } catch (error: any) {
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
}

const beneficiaryService = new BeneficiaryService();
export default beneficiaryService;
