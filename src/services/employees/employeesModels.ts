// Employee status based on current API payload
export type EmployeeStatus = "active" | "invited";

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
