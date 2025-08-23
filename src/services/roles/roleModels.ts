export interface GetRolesRequest {
  page?: number; // optional, default could be 1
  limit?: number; // optional, default could be 10/20
  search?: string; // optional search string
}

// Join model inside permissions[].RolePermission
export interface RolePermission {
  id: string;
  roleId: string;
  permissionId: string;
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
}

// Permission model as returned in permissions[]
export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
  RolePermission: RolePermission;
}

// Role model
export interface Role {
  id: string;
  name: string;
  description: string;
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
  permissions: Permission[];
}

export interface GetRolesResponse {
  success: boolean;
  message?: string;
  items: Role[];
}

// Request for fetching a role's permissions using a path param id
export interface GetRolePermissionsRequest {
  id: string; // role id (UUID)
}

// Response for GET /roles/{id}/permissions
export interface GetRolePermissionsResponse {
  success: boolean;
  message?: string;
  role: {
    id: string;
    name: string;
  };
  permissions: Permission[];
}
