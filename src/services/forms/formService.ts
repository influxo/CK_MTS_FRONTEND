import axiosInstance from "../axiosInstance";
import getApiUrl from "../apiUrl";
import type {
  CreateFormRequest,
  CreateFormResponse,
  GetFormsResponse,
  GetFormResponse,
  UpdateFormRequest,
  UpdateFormResponse,
  DeleteFormResponse,
} from "./formModels";

class FormService {
  private baseUrl = getApiUrl();
  private formsEndpoint = `${this.baseUrl}/forms`;

  async getForms(): Promise<GetFormsResponse> {
    try {
      const response = await axiosInstance.get<GetFormsResponse>(
        this.formsEndpoint
      );
      return response.data;
    } catch (error: any) {
      if (error.response) {
        return error.response.data as GetFormsResponse;
      }
      return {
        success: false,
        message: error.message || "Failed to fetch forms",
        data: [],
      };
    }
  }

  async getFormById(formId: string): Promise<GetFormResponse> {
    try {
      const response = await axiosInstance.get<GetFormResponse>(
        `${this.formsEndpoint}/${formId}`
      );
      return response.data;
    } catch (error: any) {
      if (error.response) {
        return error.response.data as GetFormResponse;
      }
      return {
        success: false,
        message: error.message || `Failed to fetch form with ID: ${formId}`,
      };
    }
  }

  async createForm(formData: CreateFormRequest): Promise<CreateFormResponse> {
    try {
      const response = await axiosInstance.post<CreateFormResponse>(
        this.formsEndpoint,
        formData
      );
      return response.data;
    } catch (error: any) {
      if (error.response) {
        return error.response.data as CreateFormResponse;
      }
      return {
        success: false,
        message: error.message || "Failed to create form",
      };
    }
  }

  async updateForm(
    formId: string,
    formData: UpdateFormRequest
  ): Promise<UpdateFormResponse> {
    try {
      const response = await axiosInstance.put<UpdateFormResponse>(
        `${this.formsEndpoint}/${formId}`,
        formData
      );
      return response.data;
    } catch (error: any) {
      if (error.response) {
        return error.response.data as UpdateFormResponse;
      }
      return {
        success: false,
        message: error.message || `Failed to update form with ID: ${formId}`,
      };
    }
  }

  async deleteForm(formId: string): Promise<DeleteFormResponse> {
    try {
      const response = await axiosInstance.delete<DeleteFormResponse>(
        `${this.formsEndpoint}/${formId}`
      );
      return response.data;
    } catch (error: any) {
      if (error.response) {
        return error.response.data as DeleteFormResponse;
      }
      return {
        success: false,
        message: error.message || `Failed to delete form with ID: ${formId}`,
      };
    }
  }
}

const formService = new FormService();
export default formService;
