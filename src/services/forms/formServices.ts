import axiosInstance from "../axiosInstance";
import getApiUrl from "../apiUrl";
import type {
  GetFormTemplatesRequest,
  GetFormTemplatesResponse,
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
}

const formService = new FormService();
export default formService;
