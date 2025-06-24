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
