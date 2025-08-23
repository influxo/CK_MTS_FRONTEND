import axiosInstance from "../axiosInstance";
import getApiUrl from "../apiUrl";
import type {
  GetEmployeesResponse,
  GetEmployeeByIdResponse,
  UpdateUserRequest,
  UpdateUserResponse,
} from "./employeesModels";

class EmployeesService {
  private baseUrl = getApiUrl();
  private employeesEndpoint = `${this.baseUrl}/users`;

  async getAllEmployees(): Promise<GetEmployeesResponse> {
    try {
      const response = await axiosInstance.get<GetEmployeesResponse>(
        `${this.employeesEndpoint}`
      );
      return response.data;
    } catch (error: any) {
      if (error.response) {
        return error.response.data as GetEmployeesResponse;
      }
      return {
        success: false,
        message: error.message || "Failed to fetch employees.",
        data: [],
      };
    }
  }

  async getEmployeeById(userId: string): Promise<GetEmployeeByIdResponse> {
    try {
      const response = await axiosInstance.get<GetEmployeeByIdResponse>(
        `${this.employeesEndpoint}/${userId}`
      );
      return response.data;
    } catch (error: any) {
      if (error.response) {
        return error.response.data as GetEmployeeByIdResponse;
      }
      return {
        success: false,
        message: error.message || "Failed to fetch employee.",
        //  provide a fallback Employee type if request fails
        data: {} as any,
      };
    }
  }

  async updateEmployee(
    userId: string,
    payload: UpdateUserRequest
  ): Promise<UpdateUserResponse> {
    try {
      const response = await axiosInstance.put<UpdateUserResponse>(
        `${this.employeesEndpoint}/${userId}`,
        payload
      );
      return response.data;
    } catch (error: any) {
      if (error.response) {
        return error.response.data as UpdateUserResponse;
      }
      return {
        success: false,
        message: error.message || "Failed to update user",
        // fall back; server shape on error typically includes success/message
        data: {} as any,
      };
    }
  }
}

const employeesService = new EmployeesService();
export default employeesService;
