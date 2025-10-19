import axiosInstance from "../axiosInstance";
import getApiUrl from "../apiUrl";
import type {
  CreateSubprojectActivityRequest,
  CreateActivityResponse,
  GetSubprojectActivitiesResponse,
  GetActivityByIdResponse,
} from "./activityModels";
import { toast } from "sonner";

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
      toast.success("Aktiviteti u krijua me sukses.", {
        style: {
          backgroundColor: "#d1fae5",
          color: "#065f46",
          border: "1px solid #10b981",
        },
      });
      return response.data;
    } catch (error: any) {
      toast.error("Diçka shkoi gabim.", {
        style: {
          backgroundColor: "#fee2e2",
          color: "#991b1b",
          border: "1px solid #ef4444",
        },
      });
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

  async getActivityById(id: string): Promise<GetActivityByIdResponse> {
    try {
      const url = `${this.activityEndpoint}/${id}`;
      const response = await axiosInstance.get<GetActivityByIdResponse>(url);
      return response.data;
    } catch (error: any) {
      if (error.response) {
        return error.response.data as GetActivityByIdResponse;
      }
      return {
        success: false,
        message: error.message || "Failed to fetch activity",
      } as GetActivityByIdResponse;
    }
  }
}

const activityService = new ActivityService();
export default activityService;
