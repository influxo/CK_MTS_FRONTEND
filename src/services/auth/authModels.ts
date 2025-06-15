// Request types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// Response types
export interface Role {
  id: number;
  name: string;
  description?: string;
}

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  roles: Role[];
  status?: string;
  twoFactorEnabled?: boolean;
  lastLogin?: Date;
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
