// Employee status based on current API payload
export type EmployeeStatus = "active" | "invited" | "inactive";

// Join model inside roles[]: roles[].UserRole
export interface EmployeeUserRole {
  id: string;
  userId: string;
  roleId: string;
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
}

// Role model as returned in roles[]
export interface EmployeeRole {
  id: string;
  name: string;
  description: string;
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
  UserRole: EmployeeUserRole;
}

// Main employee model
export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  status: EmployeeStatus;
  emailVerified: boolean;
  verificationToken: string;
  tokenExpiry: string; // ISO timestamp
  invitedBy: string | null;
  twoFactorEnabled: boolean;
  lastLogin: string | null; // ISO timestamp or null
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
  roles: EmployeeRole[];
}

export interface GetEmployeesResponse {
  success: boolean;
  message?: string;
  data: Employee[];
}

export interface GetEmployeeByIdResponse {
  success: boolean;
  message?: string;
  data: Employee;
}

// Response model for /users/my-team
export interface GetMyTeamData {
  teamMembers: Employee[];
  count: number;
}

export interface GetMyTeamResponse {
  success: boolean;
  message?: string;
  data: GetMyTeamData;
}

// Update User (Employee) request/response
export interface UpdateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  status: EmployeeStatus; // if backend supports more (e.g., "inactive"), extend EmployeeStatus accordingly
  roleIds: string[];
}

export interface UpdateUserResponse {
  success: boolean;
  message?: string;
  data: Employee;
}

// Projects tree for a User: /users/{id}/projects
export interface EmployeeActivity {
  id: string;
  name: string;
  description: string;
  category: string;
  frequency?: string; // e.g., "monthly" (optional as not guaranteed for all activities)
  status: string;
  subprojectId: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeSubproject {
  id: string;
  name: string;
  description: string;
  category: string;
  status: string;
  projectId: string;
  createdAt: string;
  updatedAt: string;
  activities: EmployeeActivity[];
}

export interface EmployeeProject {
  id: string;
  name: string;
  description: string;
  category: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  subprojects: EmployeeSubproject[];
}

export interface GetUserProjectsResponse {
  success: boolean;
  message?: string;
  items: EmployeeProject[];
}

// Delete User (Employee) response
export interface DeleteUserResponse {
  success: boolean;
  message: string;
}
