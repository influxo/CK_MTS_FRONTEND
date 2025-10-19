// Activity domain models and API contracts

export interface Activity {
  id: string;
  name: string;
  description: string;
  category: string;
  frequency: string; // e.g., "monthly"
  reportingFields: Record<string, string>; // e.g., { beneficiaries: "number", location: "text" }
  subprojectId: string;
  status: string; // e.g., "active"
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

export interface CreateSubprojectActivityRequest {
  name: string;
  description: string;
  category: string;
  frequency: string;
  reportingFields: Record<string, string>;
  status: string;
  subprojectId: string;
}

export interface CreateActivityResponse {
  success: boolean;
  message: string;
  data?: Activity;
}

export interface GetSubprojectActivitiesResponse {
  success: boolean;
  data: Activity[];
  message?: string;
}

export interface GetActivityByIdResponse {
  success: boolean;
  data: Activity;
  message?: string;
}

export interface UpdateActivityRequest {
  name: string;
  description: string;
  category: string;
  frequency: string;
  reportingFields: Record<string, string>;
  status: string;
}

export interface UpdateActivityResponse {
  success: boolean;
  message: string;
  data?: Activity;
}

export interface DeleteActivityResponse {
  success: boolean;
  message: string;
}

export interface ActivityUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  status: string;
}

export interface GetActivityUsersResponse {
  success: boolean;
  data: ActivityUser[];
  message?: string;
}

export interface AssignUserToActivityRequest {
  userId: string;
}

export interface AssignUserToActivityResponse {
  success: boolean;
  message: string;
  data?: ActivityUser;
}

export interface RemoveUserFromActivityResponse {
  success: boolean;
  message: string;
}
