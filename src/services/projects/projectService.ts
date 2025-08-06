import axiosInstance from "../axiosInstance";
import getApiUrl from "../apiUrl";
import type {
  CreateProjectRequest,
  CreateProjectResponse,
  GetProjectsResponse,
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
}

const projectService = new ProjectService();
export default projectService;
