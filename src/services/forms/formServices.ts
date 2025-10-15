import axiosInstance from "../axiosInstance";
import getApiUrl from "../apiUrl";
import type {
  GetFormTemplatesRequest,
  GetFormTemplatesResponse,
  GetFormTemplateByIdResponse,
  FormSubmissionRequest,
  FormSubmissionResponse,
  GetFormResponseByIdResponse,
  GetFormResponsesByEntityRequest,
  GetFormResponsesByEntityResponse,
  GetAllFormResponsesRequest,
  GetAllFormResponsesResponse,
} from "./formModels";
import { toast } from "sonner";

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
          includeBeneficiaries: false,
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
      toast.success("Forma u dërgua me sukses", {
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

  async getFormResponsesByEntity(
    params: GetFormResponsesByEntityRequest
  ): Promise<GetFormResponsesByEntityResponse> {
    try {
      const response = await axiosInstance.get<any>(
        `${this.formsEndpoint}/responses/by-entity`,
        { params }
      );
      // Backend returns { success, data: FormResponseData[], meta }
      const { data, meta, success, message } = response.data || {};
      const mapped = {
        success: Boolean(success),
        message,
        data: {
          items: Array.isArray(data) ? data : [],
          pagination: {
            page: meta?.page ?? params.page ?? 1,
            limit: meta?.limit ?? params.limit ?? 20,
            totalPages: meta?.totalPages ?? 0,
            totalCount: meta?.totalItems ?? 0,
          },
        },
      } as GetFormResponsesByEntityResponse;
      return mapped;
    } catch (error: any) {
      if (error?.response) {
        const resp = error.response.data;
        // Attempt to map if shape differs
        if (resp && Array.isArray(resp.data) && resp.meta) {
          return {
            success: false,
            message: resp.message,
            data: {
              items: resp.data,
              pagination: {
                page: resp.meta.page ?? params.page ?? 1,
                limit: resp.meta.limit ?? params.limit ?? 20,
                totalPages: resp.meta.totalPages ?? 0,
                totalCount: resp.meta.totalItems ?? 0,
              },
            },
          };
        }
        return {
          success: false,
          message: resp?.message || "Failed to fetch form responses.",
          data: {
            items: [],
            pagination: {
              page: params.page ?? 1,
              limit: params.limit ?? 20,
              totalPages: 0,
              totalCount: 0,
            },
          },
        };
      }
      return {
        success: false,
        message: error?.message || "Failed to fetch form responses.",
        data: {
          items: [],
          pagination: {
            page: params.page ?? 1,
            limit: params.limit ?? 20,
            totalPages: 0,
            totalCount: 0,
          },
        },
      };
    }
  }

  async getAllFormResponses(
    params: GetAllFormResponsesRequest
  ): Promise<GetAllFormResponsesResponse> {
    try {
      const response = await axiosInstance.get<any>(
        `${this.formsEndpoint}/responses`,
        { params }
      );
      const { data, meta, success, message } = response.data || {};
      return {
        success: Boolean(success),
        message,
        data: {
          items: Array.isArray(data) ? data : [],
          pagination: {
            page: meta?.page ?? params.page ?? 1,
            limit: meta?.limit ?? params.limit ?? 20,
            totalPages: meta?.totalPages ?? 0,
            totalCount: meta?.totalItems ?? 0,
          },
        },
      };
    } catch (error: any) {
      if (error?.response) {
        const resp = error.response.data;
        if (resp && Array.isArray(resp.data) && resp.meta) {
          return {
            success: false,
            message: resp.message,
            data: {
              items: resp.data,
              pagination: {
                page: resp.meta.page ?? params.page ?? 1,
                limit: resp.meta.limit ?? params.limit ?? 20,
                totalPages: resp.meta.totalPages ?? 0,
                totalCount: resp.meta.totalItems ?? 0,
              },
            },
          };
        }
      }
      return {
        success: false,
        message: error?.message || "Failed to fetch form responses.",
        data: {
          items: [],
          pagination: {
            page: params.page ?? 1,
            limit: params.limit ?? 20,
            totalPages: 0,
            totalCount: 0,
          },
        },
      };
    }
  }
}

const formService = new FormService();
export default formService;
