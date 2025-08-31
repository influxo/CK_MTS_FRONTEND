import axiosInstance from "../axiosInstance";
import getApiUrl from "../apiUrl";
import type {
  CreateSubprojectActivityRequest,
  CreateActivityResponse,
  GetSubprojectActivitiesResponse,
} from "./activityModels";

class ActivityService {
  private baseUrl = getApiUrl();
  private activityEndpoint = `${this.baseUrl}/activities`;

  async createActivity(
    req: CreateSubprojectActivityRequest
  ): Promise<CreateActivityResponse> {
    try {
      const response = await axiosInstance.post<CreateActivityResponse>(
        this.activityEndpoint,
        req
      );
      return response.data;
    } catch (error: any) {
      if (error.response) {
        return error.response.data as CreateActivityResponse;
      }
      return {
        success: false,
        message: error.message || "Failed to create activity",
      } as CreateActivityResponse;
    }
  }

  async getSubprojectActivities(
    subprojectId: string
  ): Promise<GetSubprojectActivitiesResponse> {
    try {
      const url = `${this.activityEndpoint}/subproject/${subprojectId}`;
      const response = await axiosInstance.get<GetSubprojectActivitiesResponse>(
        url
      );
      return response.data;
    } catch (error: any) {
      if (error.response) {
        return error.response.data as GetSubprojectActivitiesResponse;
      }
      return {
        success: false,
        data: [],
        message: error.message || "Failed to fetch activities",
      } as GetSubprojectActivitiesResponse;
    }
  }
}

const activityService = new ActivityService();
export default activityService;
