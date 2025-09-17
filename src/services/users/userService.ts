import getApiUrl from "../apiUrl";
import axiosInstance from "../axiosInstance";
import type { InviteUserRequest, InviteUserResponse, GetUserProjectsResponse } from "./userModels";


/**
 * Authentication service for handling user authentication and profile management
 */
class UserService {
  private baseUrl: string;
  private authEndpoint: string = '/auth';

  constructor() {
    this.baseUrl = getApiUrl();
    this.authEndpoint = `${this.baseUrl}/users`;
  }


  /**
   * Invite a new user with specified roles
   * @param userData User data including firstName, lastName, email, and roleIds
   * @returns Promise with invite response
   */
  async inviteUser(userData: InviteUserRequest): Promise<InviteUserResponse> {
    try {
      const response = await axiosInstance.post<InviteUserResponse>(
        `${this.authEndpoint}/invite`,
        userData
      );
      
      return response.data;
    } catch (error: any) {
      // Handle error response from server
      if (error.response) {
        return error.response.data as InviteUserResponse;
      }
      
      // Handle network or other errors
      return {
        success: false,
        message: error.message || 'Failed to invite user. Please try again.'
      };
    }
  }

  /**
   * Get nested user projects with subprojects and activities
   */
  async getUserProjects(userId: string): Promise<GetUserProjectsResponse> {
    try {
      const response = await axiosInstance.get(
        `${this.authEndpoint}/${userId}/projects`
      );
      const raw = response.data as any;
      // Normalize backend shape: accept either { data: [...] } or { items: [...] }
      if (Array.isArray(raw?.data)) {
        return raw as GetUserProjectsResponse;
      }
      if (Array.isArray(raw?.items)) {
        return {
          success: !!raw.success,
          message: raw.message,
          data: raw.items,
        } as GetUserProjectsResponse;
      }
      // Fallback safe shape
      return {
        success: !!raw?.success,
        message: raw?.message ?? 'Unexpected response shape',
        data: Array.isArray(raw) ? raw : [],
      } as GetUserProjectsResponse;
    } catch (error: any) {
      if (error.response) {
        const raw = error.response.data as any;
        // Normalize error responses too
        if (Array.isArray(raw?.data)) {
          return raw as GetUserProjectsResponse;
        }
        if (Array.isArray(raw?.items)) {
          return {
            success: !!raw.success,
            message: raw.message,
            data: raw.items,
          } as GetUserProjectsResponse;
        }
        return {
          success: false,
          message: raw?.message || 'Failed to fetch user projects',
          data: [],
        } as GetUserProjectsResponse;
      }
      return {
        success: false,
        message: error.message || 'Failed to fetch user projects',
        data: [],
      };
    }
  }

  /**
   * Check if user is authenticated
   * @returns Boolean indicating if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  /**
   * Logout user
   */
  logout(): void {
    localStorage.removeItem('token');
    // Remove auth header
    this.removeAuthHeader();
  }

  /**
   * Set authentication header for axios requests
   * @param token JWT token
   */
  setAuthHeader(token: string): void {
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  /**
   * Remove authentication header
   */
  removeAuthHeader(): void {
    delete axiosInstance.defaults.headers.common['Authorization'];
  }

  /**
   * Initialize auth from stored token
   * This should be called when the app starts
   */
  initializeAuth(): void {
    const token = localStorage.getItem('token');
    if (token) {
      this.setAuthHeader(token);
    }
  }
}

// Create singleton instance
const userService = new UserService();
export default userService;
