// Request payload for creating a project
export interface CreateProjectRequest {
  name: string;
  description: string;
  category: string;
  status: "active" | "inactive" | "pending"; // if your status is enum-like
}

// Project model
export interface Project {
  id: string;
  name: string;
  description: string;
  category: string;
  status: "active" | "inactive" | "pending";
  createdAt: string; // string is better for ISO timestamps
  updatedAt: string;
}

// Create Project Response
export interface CreateProjectResponse {
  success: boolean;
  message: string;
  data?: Project;
}

export interface GetProjectsResponse {
  success: boolean;
  message?: string;
  data: Project[];
}

// Assign user to project
export interface AssignUserToProjectRequest {
  projectId: string; // path parameter
  userId: string; // body field
}

export interface AssignedProjectUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  status: string;
}

export interface AssignUserToProjectResponse {
  success: boolean;
  message: string;
  data: AssignedProjectUser;
}

// Get users assigned to a specific project
export interface GetProjectUsersRequest {
  projectId: string;
}

export interface GetProjectUsersResponse {
  success: boolean;
  data: AssignedProjectUser[];
  message?: string;
}

// Remove user from project
export interface RemoveUserFromProjectRequest {
  projectId: string; // path parameter
  userId: string; // path parameter
}

export interface RemoveUserFromProjectResponse {
  success: boolean;
  message: string;
}
