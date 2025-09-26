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
import { toast } from "sonner";

class FormService {
  private baseUrl = getApiUrl();
  private formsEndpoint = `${this.baseUrl}/forms/templates`;

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
      toast.success("Forma u krijua me sukses", {
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
      toast.success("Forma u modifikua me sukses", {
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
      if (error.response) {
        return error.response.data as UpdateFormResponse;
      }
      return {
        success: false,
        message: error.message || `Failed to update form with ID: ${formId}`,
      };
    }
  }

  async updateFormToInactive(formId: string): Promise<UpdateFormResponse> {
    try {
      const response = await axiosInstance.patch<UpdateFormResponse>(
        `${this.formsEndpoint}/${formId}/inactivate`,
        { status: "inactive" }
      );
      toast.success("Forma u deaktivua me sukses", {
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
      toast.success("Forma u fshi me sukses", {
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
