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
