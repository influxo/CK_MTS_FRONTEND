import axiosInstance from "../axiosInstance";
import getApiUrl from "../apiUrl";
import type {
  CreateProjectRequest,
  CreateProjectResponse,
  GetProjectsResponse,
  AssignUserToProjectRequest,
  AssignUserToProjectResponse,
  GetProjectUsersResponse,
  RemoveUserFromProjectRequest,
  RemoveUserFromProjectResponse,
} from "./projectModels";
import { toast } from "sonner";
import { db } from "../../db/db";
import { syncService } from "../offline/syncService";

class ProjectService {
  private baseUrl = getApiUrl();
  private projectEndpoint = `${this.baseUrl}/projects`;

  async createProject(
    project: CreateProjectRequest
  ): Promise<CreateProjectResponse> {
    try {
      const response = await axiosInstance.post<CreateProjectResponse>(
        `${this.projectEndpoint}`,
        project
      );

      return response.data;
    } catch (error: any) {
      if (error.response) {
        return error.response.data as CreateProjectResponse;
      }

      return {
        success: false,
        message: error.message || "Failed to create project",
      };
    }
  }

  async getAllProjects(): Promise<GetProjectsResponse> {
    try {
      const response = await axiosInstance.get<GetProjectsResponse>(
        `${this.projectEndpoint}`
      );
      console.log('Projects API Response:', response.data);

      // Cache projects in IndexedDB for offline use
      if (response.data.success && response.data.data) {
        try {
          for (const project of response.data.data) {
            await db.projects.put({
              ...project,
              synced: true,
              _localUpdatedAt: new Date().toISOString(),
            });
          }
          console.log('✅ Cached', response.data.data.length, 'projects for offline use');
        } catch (cacheError) {
          console.warn('Failed to cache projects:', cacheError);
        }
      }

      return response.data;
    } catch (error: any) {
      console.error('Projects API Error:', error);

      // Check if we're offline or have network error
      const isNetworkError = !error.response || error.code === 'ERR_NETWORK';

      if (isNetworkError || !syncService.isOnline()) {
        // Try to return cached data
        console.log('📱 Network error - loading cached projects');
        try {
          const cachedProjects = await db.projects.toArray();
          const projects = cachedProjects.map(({ synced, _localUpdatedAt, ...project }) => project);

          if (projects.length > 0) {
            console.log('✅ Loaded', projects.length, 'cached projects');
            return {
              success: true,
              data: projects,
              message: 'Loaded from cache (offline)',
            };
          }
        } catch (cacheError) {
          console.error('Failed to load cache:', cacheError);
        }
      }

      if (error.response) {
        console.error('Error response:', error.response.data);
        return error.response.data as GetProjectsResponse;
      }
      return {
        success: false,
        message: error.message || "Failed to fetch projects.",
        data: [],
      };
    }
  }

  async assignUserToProject(
    req: AssignUserToProjectRequest
  ): Promise<AssignUserToProjectResponse> {
    try {
      const response = await axiosInstance.post<AssignUserToProjectResponse>(
        `${this.projectEndpoint}/${encodeURIComponent(req.projectId)}/users`,
        { userId: req.userId }
      );
      toast.success("Punëtori u shtua me sukses", {
        style: {
          backgroundColor: "#d1fae5",
          color: "#065f46",
          border: "1px solid #10b981",
        },
      });
      return response.data;
    } catch (error: any) {
      toast.error("Diçka shkoi gabim", {
        style: {
          backgroundColor: "#fee2e2",
          color: "#991b1b",
          border: "1px solid #ef4444",
        },
      });
      if (error.response) {
        return error.response.data as AssignUserToProjectResponse;
      }
      return {
        success: false,
        message: error.message || "Failed to assign user to project",
        data: {
          id: "",
          firstName: "",
          lastName: "",
          email: "",
          status: "",
        },
      } as AssignUserToProjectResponse;
    }
  }

  async getProjectUsers(projectId: string): Promise<GetProjectUsersResponse> {
    try {
      const response = await axiosInstance.get<GetProjectUsersResponse>(
        `${this.projectEndpoint}/${encodeURIComponent(projectId)}/users`
      );
      return response.data;
    } catch (error: any) {
      if (error.response) {
        return error.response.data as GetProjectUsersResponse;
      }
      return {
        success: false,
        message: error.message || "Failed to fetch project users",
        data: [],
      } as GetProjectUsersResponse;
    }
  }

  async removeUserFromProject(
    req: RemoveUserFromProjectRequest
  ): Promise<RemoveUserFromProjectResponse> {
    try {
      const response =
        await axiosInstance.delete<RemoveUserFromProjectResponse>(
          `${this.projectEndpoint}/${encodeURIComponent(
            req.projectId
          )}/users/${encodeURIComponent(req.userId)}`
        );
      toast.success("Punëtori u largua nga projekti me sukses", {
        style: {
          backgroundColor: "#d1fae5",
          color: "#065f46",
          border: "1px solid #10b981",
        },
      });
      return response.data;
    } catch (error: any) {
      toast.error("Diçka shkoi gabim", {
        style: {
          backgroundColor: "#fee2e2",
          color: "#991b1b",
          border: "1px solid #ef4444",
        },
      });
      if (error.response) {
        return error.response.data as RemoveUserFromProjectResponse;
      }
      return {
        success: false,
        message: error.message || "Failed to remove user from project",
      } as RemoveUserFromProjectResponse;
    }
  }
}

const projectService = new ProjectService();
export default projectService;
