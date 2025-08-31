import type { User } from "../globalModels/User";

export interface InviteUserRequest {
    firstName: string;
    lastName: string;
    email: string;
    roleIds: number[];
    expiration: string,
    projectIds: number[],
    subProjectIds: number[] ,
    message: string
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

// Nested user-assignment models for /users/:id/projects
export interface UserActivity {
  id: string;
  name: string;
  description?: string | null;
  category?: string | null;
  frequency?: string | null;
  status: string;
  subprojectId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserSubproject {
  id: string;
  name: string;
  description?: string | null;
  category?: string | null;
  status: string;
  projectId: string;
  createdAt?: string;
  updatedAt?: string;
  activities: UserActivity[];
}

export interface UserProject {
  id: string;
  name: string;
  description?: string | null;
  category?: string | null;
  status: string;
  createdAt?: string;
  updatedAt?: string;
  subprojects: UserSubproject[];
}

export interface GetUserProjectsResponse {
  success: boolean;
  message?: string;
  data: UserProject[];
}