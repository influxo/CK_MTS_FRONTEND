import axiosInstance from "../axiosInstance";
import getApiUrl from "../apiUrl";
import type {
  SubProject,
  GetAllSubProjectsResponse,
  CreateSubProjectRequest,
  CreateSubProjectResponse,
  GetSubProjectByIdRequest,
  GetSubProjectByIdResponse,
  UpdateSubProjectRequest,
  UpdateSubProjectResponse,
  DeleteSubProjectRequest,
  DeleteSubProjectResponse,
  GetSubProjectsByProjectIdRequest,
  GetSubProjectsByProjectIdResponse,
  AssignUserToSubProjectRequest,
  AssignUserToSubProjectResponse,
  RemoveUserFromSubProjectRequest,
  RemoveUserFromSubProjectResponse,
  GetSubProjectUsersRequest,
  GetSubProjectUsersResponse,
} from "./subprojectModels";

class SubProjectService {
  private baseUrl = getApiUrl();
  private subprojectEndpoint = `${this.baseUrl}/subprojects`;

  async createSubProject(
    req: CreateSubProjectRequest
  ): Promise<CreateSubProjectResponse> {
    try {
      const response = await axiosInstance.post<CreateSubProjectResponse>(
        `${this.subprojectEndpoint}`,
        req
      );
      return response.data;
    } catch (error: any) {
      if (error.response) {
        return error.response.data as CreateSubProjectResponse;
      }
      return {
        success: false,
        message: error.message || "Failed to create subproject",
        data: {} as SubProject,
      };
    }
  }

  async getSubProjectUsers(
    req: GetSubProjectUsersRequest
  ): Promise<GetSubProjectUsersResponse> {
    try {
      const response = await axiosInstance.get<GetSubProjectUsersResponse>(
        `${this.subprojectEndpoint}/${encodeURIComponent(
          req.subProjectId
        )}/users`
      );
      return response.data;
    } catch (error: any) {
      if (error.response) {
        return error.response.data as GetSubProjectUsersResponse;
      }
      return {
        success: false,
        message: error.message || "Failed to fetch subproject users",
        data: [],
      } as GetSubProjectUsersResponse;
    }
  }

  async getAllSubProjects(): Promise<GetAllSubProjectsResponse> {
    try {
      const response = await axiosInstance.get<GetAllSubProjectsResponse>(
        `${this.subprojectEndpoint}`
      );
      return response.data;
    } catch (error: any) {
      if (error.response) {
        return error.response.data as GetAllSubProjectsResponse;
      }
      return {
        success: false,
        message: error.message || "Failed to fetch subprojects.",
        data: [],
      };
    }
  }

  async getSubProjectById(
    req: GetSubProjectByIdRequest
  ): Promise<GetSubProjectByIdResponse> {
    try {
      const response = await axiosInstance.get<GetSubProjectByIdResponse>(
        `${this.subprojectEndpoint}/${encodeURIComponent(req.id)}`
      );
      return response.data;
    } catch (error: any) {
      if (error.response) {
        return error.response.data as GetSubProjectByIdResponse;
      }
      return {
        success: false,
        message: error.message || "Failed to fetch subproject by id.",
        data: {} as SubProject,
      };
    }
  }

  async updateSubProject(
    req: UpdateSubProjectRequest
  ): Promise<UpdateSubProjectResponse> {
    try {
      const { id, ...body } = req;
      const response = await axiosInstance.put<UpdateSubProjectResponse>(
        `${this.subprojectEndpoint}/${encodeURIComponent(id)}`,
        body
      );
      return response.data;
    } catch (error: any) {
      if (error.response) {
        return error.response.data as UpdateSubProjectResponse;
      }
      return {
        success: false,
        message: error.message || "Failed to update subproject",
        data: {} as SubProject,
      };
    }
  }

  async deleteSubProject(
    req: DeleteSubProjectRequest
  ): Promise<DeleteSubProjectResponse> {
    try {
      const response = await axiosInstance.delete<DeleteSubProjectResponse>(
        `${this.subprojectEndpoint}/${encodeURIComponent(req.id)}`
      );
      return response.data;
    } catch (error: any) {
      if (error.response) {
        return error.response.data as DeleteSubProjectResponse;
      }
      return {
        success: false,
        message: error.message || "Failed to delete subproject",
      };
    }
  }

  async getSubProjectsByProjectId(
    req: GetSubProjectsByProjectIdRequest
  ): Promise<GetSubProjectsByProjectIdResponse> {
    try {
      const response =
        await axiosInstance.get<GetSubProjectsByProjectIdResponse>(
          `${this.subprojectEndpoint}/project/${encodeURIComponent(
            req.projectId
          )}`
        );
      return response.data;
    } catch (error: any) {
      if (error.response) {
        return error.response.data as GetSubProjectsByProjectIdResponse;
      }
      return {
        success: false,
        message: error.message || "Failed to fetch subprojects by projectId.",
        data: [],
      };
    }
  }

  async assignUserToSubProject(
    req: AssignUserToSubProjectRequest
  ): Promise<AssignUserToSubProjectResponse> {
    try {
      const response = await axiosInstance.post<AssignUserToSubProjectResponse>(
        `${this.subprojectEndpoint}/${encodeURIComponent(
          req.subProjectId
        )}/users`,
        { userId: req.userId }
      );
      return response.data;
    } catch (error: any) {
      if (error.response) {
        return error.response.data as AssignUserToSubProjectResponse;
      }
      return {
        success: false,
        message: error.message || "Failed to assign user to subproject",
        data: {
          id: "",
          firstName: "",
          lastName: "",
          email: "",
          status: "",
        },
      } as AssignUserToSubProjectResponse;
    }
  }

  async removeUserFromSubProject(
    req: RemoveUserFromSubProjectRequest
  ): Promise<RemoveUserFromSubProjectResponse> {
    try {
      const response =
        await axiosInstance.delete<RemoveUserFromSubProjectResponse>(
          `${this.subprojectEndpoint}/${encodeURIComponent(
            req.subProjectId
          )}/users/${encodeURIComponent(req.userId)}`
        );
      return response.data;
    } catch (error: any) {
      if (error.response) {
        return error.response.data as RemoveUserFromSubProjectResponse;
      }
      return {
        success: false,
        message: error.message || "Failed to remove user from subproject",
      } as RemoveUserFromSubProjectResponse;
    }
  }
}

const subProjectService = new SubProjectService();
export default subProjectService;
