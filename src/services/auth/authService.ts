import getApiUrl from "../apiUrl";
import axiosInstance from "../axiosInstance";
import type {
  LoginRequest,
  LoginResponse,
  ProfileResponse,
  ChangePasswordRequest,
  ResetPasswordRequest,
  ApiResponse,
  AcceptInvitationRequest,
} from "./authModels";

/**
 * Authentication service for handling user authentication and profile management
 */
class AuthService {
  private baseUrl: string;
  private authEndpoint: string = "/auth";

  constructor() {
    this.baseUrl = getApiUrl();
    this.authEndpoint = `${this.baseUrl}/auth`;
  }

  /**
   * Login user and get authentication token
   * @param credentials User login credentials
   * @returns Promise with login response containing user data and token
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await axiosInstance.post<LoginResponse>(
        `${this.authEndpoint}/login`,
        credentials
      );

      // Store token in localStorage if login successful
      if (response.data.success && response.data.data?.token) {
        localStorage.setItem("token", response.data.data.token);

        // Set the token in axios headers for subsequent requests
        this.setAuthHeader(response.data.data.token);
      }

      return response.data;
    } catch (error: any) {
      // Handle error response from server
      if (error.response) {
        return error.response.data as LoginResponse;
      }

      // Handle network or other errors
      return {
        success: false,
        message: error.message || "Login failed. Please try again.",
      };
    }
  }

  /**
   * Get current user profile
   * @returns Promise with user profile data
   */
  async getProfile(): Promise<ProfileResponse> {
    try {
      const response = await axiosInstance.get<ProfileResponse>(
        `${this.authEndpoint}/profile`
      );

      return response.data;
    } catch (error: any) {
      // Handle error response from server
      if (error.response) {
        return error.response.data as ProfileResponse;
      }

      // Handle network or other errors
      return {
        success: false,
        message: error.message || "Failed to fetch profile. Please try again.",
      };
    }
  }

  /**
   * Change user password
   * @param passwordData Current and new password
   * @returns Promise with API response
   */
  async changePassword(
    passwordData: ChangePasswordRequest
  ): Promise<ApiResponse> {
    try {
      const response = await axiosInstance.put<ApiResponse>(
        `${this.authEndpoint}/change-password`,
        passwordData
      );

      return response.data;
    } catch (error: any) {
      // Handle error response from server
      if (error.response) {
        return error.response.data as ApiResponse;
      }

      // Handle network or other errors
      return {
        success: false,
        message:
          error.message || "Failed to change password. Please try again.",
      };
    }
  }

  /**
   * Verify email with token (for invited users)
   * @param data { email, token, password }
   * @returns Promise with login-like response containing user data and token
   */
  async verifyEmail(data: AcceptInvitationRequest): Promise<LoginResponse> {
    try {
      const response = await axiosInstance.post<LoginResponse>(
        `${this.authEndpoint}/accept-invitation`,
        data
      );

      // Store token on success, similar to login
      if (response.data.success && response.data.data?.token) {
        localStorage.setItem("token", response.data.data.token);
        this.setAuthHeader(response.data.data.token);
      }

      return response.data;
    } catch (error: any) {
      // Handle error response from server
      if (error.response) {
        return error.response.data as LoginResponse;
      }

      // Handle network or other errors
      return {
        success: false,
        message: error.message || "Failed to verify email. Please try again.",
      };
    }
  }

  /**
   * Reset user password
   * @param resetData Password reset data
   * @returns Promise with API response
   */
  async resetPassword(resetData: ResetPasswordRequest): Promise<ApiResponse> {
    try {
      const response = await axiosInstance.post<ApiResponse>(
        `${this.authEndpoint}/reset-password`,
        resetData
      );

      return response.data;
    } catch (error: any) {
      // Handle error response from server
      if (error.response) {
        return error.response.data as ApiResponse;
      }

      // Handle network or other errors
      return {
        success: false,
        message: error.message || "Failed to reset password. Please try again.",
      };
    }
  }

  /**
   * Check if user is authenticated
   * @returns Boolean indicating if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem("token");
  }

  /**
   * Logout user
   */
  logout(): void {
    localStorage.removeItem("token");
    // Remove auth header
    this.removeAuthHeader();
  }

  /**
   * Set authentication header for axios requests
   * @param token JWT token
   */
  setAuthHeader(token: string): void {
    axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }

  /**
   * Remove authentication header
   */
  removeAuthHeader(): void {
    delete axiosInstance.defaults.headers.common["Authorization"];
  }

  /**
   * Initialize auth from stored token
   * This should be called when the app starts
   */
  initializeAuth(): void {
    const token = localStorage.getItem("token");
    if (token) {
      this.setAuthHeader(token);
    }
  }
}

// Create singleton instance
const authService = new AuthService();
export default authService;
