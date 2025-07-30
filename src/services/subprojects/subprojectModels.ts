// SubProject Model
export interface SubProject {
  id: string;
  name: string;
  description: string;
  category: string;
  status: "active" | "inactive" | "pending";
  projectId: string;
  createdAt: string; // string is better for ISO timestamps
  updatedAt: string;
}

// Get All SubProjects Response
export interface GetAllSubProjectsResponse {
  success: boolean;
  message?: string;
  data: SubProject[];
}

// Create SubProject Request
export interface CreateSubProjectRequest {
  name: string;
  description: string;
  category: string;
  status: "active" | "inactive" | "pending";
  projectId: string;
}

// Create SubProject Response
export interface CreateSubProjectResponse {
  success: boolean;
  message: string;
  data: SubProject;
}

// Get SubProject By Id Request
export interface GetSubProjectByIdRequest {
  id: string; // this is a query parameter
}

// Get SubProject By Id Response
export interface GetSubProjectByIdResponse {
  success: boolean;
  message?: string;
  data: SubProject;
}

// Update Single SubProject Request
export interface UpdateSubProjectRequest {
  id: string; // this is a query parameter
  name: string;
  description: string;
  category: string;
  status: "active" | "inactive" | "pending";
}

// Update Single SubProject Response
export interface UpdateSubProjectResponse {
  success: boolean;
  message: string;
  data: SubProject;
}

// Delete Single SubProject Request
export interface DeleteSubProjectRequest {
  id: string; // this is a query parameter
}

// Delete Single SubProject Response
export interface DeleteSubProjectResponse {
  success: boolean;
  message: string;
}

// Get SubProjects By ProjectId Request
export interface GetSubProjectsByProjectIdRequest {
  projectId: string; // this is a query parameter
}

// Get SubProjects By ProjectId Response
export interface GetSubProjectsByProjectIdResponse {
  success: boolean;
  message?: string;
  data: SubProject[];
}

// ktu vjen get all users assignet to a subproject

export interface AssignUserToSubProjectRequest {
  subProjectId: string; // this is a query parameter
  userId: string; // this is a body request
}

// ?????
// export interface AssignUserToSubProjectResponse {
//     success: boolean;
//     message: string;
//     data: SubProject;
// }

export interface RemoveUserFromSubProjectRequest {
  subProjectId: string; // this is a query parameter
  userId: string; // this is a query parameter
}

// export interface RemoveUserFromSubProjectResponse {
//     success: boolean;
//     message: string;
// }
