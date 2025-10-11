import axiosInstance from "../axiosInstance";
import getApiUrl from "../apiUrl";
import type {
  CreateSubprojectActivityRequest,
  CreateActivityResponse,
  GetSubprojectActivitiesResponse,
} from "./activityModels";
import { toast } from "sonner";
import { db } from "../../db/db";
import { syncService } from "../offline/syncService";

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

      // Cache activities in IndexedDB for offline use
      if (response.data.success && response.data.data) {
        try {
          for (const activity of response.data.data) {
            await db.activities.put({
              ...activity,
              synced: true,
              _localUpdatedAt: new Date().toISOString(),
            });
          }
          console.log('✅ Cached', response.data.data.length, 'activities for offline use');
        } catch (cacheError) {
          console.warn('Failed to cache activities:', cacheError);
        }
      }

      return response.data;
    } catch (error: any) {
      // Check if we're offline or have network error
      const isNetworkError = !error.response || error.code === 'ERR_NETWORK';

      if (isNetworkError || !syncService.isOnline()) {
        // Try to return cached data
        console.log('📱 Network error - loading cached activities');
        try {
          const cachedActivities = await db.activities
            .where('subprojectId')
            .equals(subprojectId)
            .toArray();
          const activities = cachedActivities.map(({ synced, _localUpdatedAt, ...activity }) => activity);

          if (activities.length > 0) {
            console.log('✅ Loaded', activities.length, 'cached activities');
            return {
              success: true,
              data: activities,
              message: 'Loaded from cache (offline)',
            };
          }
        } catch (cacheError) {
          console.error('Failed to load cache:', cacheError);
        }
      }

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
