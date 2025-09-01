import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type {
  Role,
  GetRolesRequest,
  GetRolesResponse,
  Permission,
  GetRolePermissionsResponse,
} from "../../services/roles/roleModels";
import rolesService from "../../services/roles/roleServices";

interface RolesState {
  roles: Role[];
  isLoading: boolean;
  error: string | null;
  permissionsByRoleId: Record<string, Permission[]>;
  isPermissionsLoading: boolean;
  permissionsError: string | null;
}

const initialState: RolesState = {
  roles: [],
  isLoading: false,
  error: null,
  permissionsByRoleId: {},
  isPermissionsLoading: false,
  permissionsError: null,
};

export const fetchRoles = createAsyncThunk<
  GetRolesResponse,
  GetRolesRequest | undefined,
  { rejectValue: string }
>("roles/fetchRoles", async (params, { rejectWithValue }) => {
  const response = await rolesService.getRoles(params);
  if (!response.success) {
    return rejectWithValue(response.message || "Failed to fetch roles");
  }
  return response;
});

export const fetchRolePermissions = createAsyncThunk<
  GetRolePermissionsResponse,
  string,
  { rejectValue: string }
>("roles/fetchRolePermissions", async (roleId, { rejectWithValue }) => {
  const response = await rolesService.getRolePermissions(roleId);
  if (!response.success) {
    return rejectWithValue(
      response.message || "Failed to fetch role permissions"
    );
  }
  return response;
});

const roleSlice = createSlice({
  name: "roles",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRoles.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRoles.fulfilled, (state, action) => {
        state.isLoading = false;
        state.roles = action.payload.items;
      })
      .addCase(fetchRoles.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? "Failed to fetch roles";
      })
      .addCase(fetchRolePermissions.pending, (state) => {
        state.isPermissionsLoading = true;
        state.permissionsError = null;
      })
      .addCase(fetchRolePermissions.fulfilled, (state, action) => {
        state.isPermissionsLoading = false;
        const { role, permissions } = action.payload;
        state.permissionsByRoleId[role.id] = permissions;
      })
      .addCase(fetchRolePermissions.rejected, (state, action) => {
        state.isPermissionsLoading = false;
        state.permissionsError =
          action.payload ?? "Failed to fetch role permissions";
      });
  },
});

// Selectors
export const selectAllRoles = (state: { roles: RolesState }) =>
  state.roles.roles;
export const selectRolesLoading = (state: { roles: RolesState }) =>
  state.roles.isLoading;
export const selectRolesError = (state: { roles: RolesState }) =>
  state.roles.error;

export const selectRolePermissions = (
  state: { roles: RolesState },
  roleId: string
) => state.roles.permissionsByRoleId[roleId] ?? [];
export const selectRolePermissionsLoading = (state: { roles: RolesState }) =>
  state.roles.isPermissionsLoading;
export const selectRolePermissionsError = (state: { roles: RolesState }) =>
  state.roles.permissionsError;

export default roleSlice.reducer;
