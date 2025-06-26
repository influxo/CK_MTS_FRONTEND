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
  