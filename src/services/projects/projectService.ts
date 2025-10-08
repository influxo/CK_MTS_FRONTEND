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
  UpdateProjectRequest,
  UpdateProjectResponse,
} from "./projectModels";
import { toast } from "sonner";

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
      return response.data;
    } catch (error: any) {
      console.error('Projects API Error:', error);
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

  async updateProject(
    id: string,
    body: UpdateProjectRequest
  ): Promise<UpdateProjectResponse> {
    try {
      const response = await axiosInstance.put<UpdateProjectResponse>(
        `${this.projectEndpoint}/${encodeURIComponent(id)}`,
        body
      );
      return response.data;
    } catch (error: any) {
      if (error.response) {
        return error.response.data as UpdateProjectResponse;
      }
      return {
        success: false,
        message: error.message || "Failed to update project",
      } as UpdateProjectResponse;
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
