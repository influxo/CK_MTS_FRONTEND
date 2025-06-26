import getApiUrl from "../apiUrl";
import axiosInstance from "../axiosInstance";
import type { InviteUserRequest, InviteUserResponse } from "./userModels";


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
