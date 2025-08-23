import axiosInstance from "../axiosInstance";
import getApiUrl from "../apiUrl";
import type { GetRolesRequest, GetRolesResponse } from "./roleModels";

class RolesService {
  private baseUrl = getApiUrl();
  private rolesEndpoint = `${this.baseUrl}/roles`;

  async getRoles(params?: GetRolesRequest): Promise<GetRolesResponse> {
    try {
      const response = await axiosInstance.get<GetRolesResponse>(
        `${this.rolesEndpoint}`,
        { params }
      );
      return response.data;
    } catch (error: any) {
      if (error.response) {
        return error.response.data as GetRolesResponse;
      }
      return {
        success: false,
        message: error.message || "Failed to fetch roles.",
        items: [],
      };
    }
  }
}

const rolesService = new RolesService();
export default rolesService;
