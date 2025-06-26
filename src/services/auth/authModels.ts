import type { User } from "../globalModels/User";

// Request types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ResetPasswordRequest {
  password: string;
  confirmPassword: string;
}

export interface InviteUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  roleIds: number[];
}


export interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    token: string;
    user: User;
  };
}

export interface ProfileResponse {
  success: boolean;
  data?: User;
  message?: string;
}

export interface ApiResponse {
  success: boolean;
  message: string;
  data?: any;
}

export interface InviteUserResponse {
  success: boolean;
  message: string;
  data?: {
    user: User;
    verificationToken?: string;
    verificationLink?: string;
  };
}
