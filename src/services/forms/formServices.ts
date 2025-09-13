import axiosInstance from "../axiosInstance";
import getApiUrl from "../apiUrl";
import type {
  GetFormTemplatesRequest,
  GetFormTemplatesResponse,
  GetFormTemplateByIdResponse,
  FormSubmissionRequest,
  FormSubmissionResponse,
  GetFormResponseByIdResponse,
} from "./formModels";

class FormService {
  private baseUrl = getApiUrl();
  private formsEndpoint = `${this.baseUrl}/forms`;

  async getFormTemplates(
    params: GetFormTemplatesRequest
  ): Promise<GetFormTemplatesResponse> {
    try {
      const response = await axiosInstance.get<GetFormTemplatesResponse>(
        `${this.formsEndpoint}/templates`,
        {
          params: {
            projectId: params.projectId,
            subprojectId: params.subprojectId,
            activityId: params.activityId,
            entityType: params.entityType,
            page: params.page,
            limit: params.limit,
          },
        }
      );
      return response.data;
    } catch (error: any) {
      if (error.response) {
        return error.response.data as GetFormTemplatesResponse;
      }

      return {
        success: false,
        message: error.message || "Failed to fetch form templates.",
        data: {
          templates: [],
          pagination: {
            page: params?.page ?? 1,
            limit: params?.limit ?? 20,
            totalPages: 0,
            totalCount: 0,
          },
        },
      };
    }
  }

  async getFormTemplateById(id: string): Promise<GetFormTemplateByIdResponse> {
    try {
      const response = await axiosInstance.get<GetFormTemplateByIdResponse>(
        `${this.formsEndpoint}/templates/${id}`
      );
      return response.data;
    } catch (error: any) {
      if (error?.response) {
        return error.response.data as GetFormTemplateByIdResponse;
      }
      return {
        success: false,
        message: error?.message || "Failed to fetch form template.",
        data: {
          id,
          name: "",
          schema: { fields: [] },
          version: "",
          createdAt: "",
          updatedAt: "",
          deletedAt: "",
          programId: "",
          entityAssociations: [],
        },
      };
    }
  }

  async submitForm(
    templateId: string,
    payload: FormSubmissionRequest
  ): Promise<FormSubmissionResponse> {
    try {
      const response = await axiosInstance.post<FormSubmissionResponse>(
        `${this.formsEndpoint}/templates/${templateId}/responses`,
        payload
      );
      return response.data;
    } catch (error: any) {
      if (error?.response) {
        return error.response.data as FormSubmissionResponse;
      }

      // Fallback shape to satisfy typing when network error occurs
      return {
        success: false,
        message: error?.message || "Failed to submit form response.",
        data: {
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          id: "",
          formTemplateId: templateId,
          entityId: payload.entityId,
          entityType: payload.entityType,
          submittedBy: "",
          data: payload.data,
          latitude: String(payload.latitude ?? ""),
          longitude: String(payload.longitude ?? ""),
          submittedAt: new Date().toISOString(),
        },
      };
    }
  }

  async getFormResponseById(id: string): Promise<GetFormResponseByIdResponse> {
    try {
      const response = await axiosInstance.get<GetFormResponseByIdResponse>(
        `${this.formsEndpoint}/responses/${id}`
      );
      return response.data;
    } catch (error: any) {
      if (error?.response) {
        return error.response.data as GetFormResponseByIdResponse;
      }
      // Fallback shape to satisfy typing when network error occurs
      return {
        success: false,
        message: error?.message || "Failed to fetch form response.",
        data: {
          id,
          formTemplateId: "",
          entityId: "",
          entityType: "",
          submittedBy: "",
          beneficiaryId: null,
          data: {},
          latitude: null,
          longitude: null,
          submittedAt: "",
          createdAt: "",
          updatedAt: "",
          template: { id: "", name: "", version: 0 },
          submitter: { id: "", firstName: "", lastName: "", email: "" },
          beneficiary: null,
          serviceDeliveries: [],
        },
      };
    }
  }
}

const formService = new FormService();
export default formService;
