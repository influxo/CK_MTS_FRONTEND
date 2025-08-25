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
      return response.data;
    } catch (error: any) {
      if (error.response) {
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
      return response.data;
    } catch (error: any) {
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
      const response = await axiosInstance.delete<RemoveUserFromProjectResponse>(
        `${this.projectEndpoint}/${encodeURIComponent(req.projectId)}/users/${encodeURIComponent(
          req.userId
        )}`
      );
      return response.data;
    } catch (error: any) {
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
