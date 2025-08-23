import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type {
  Role,
  GetRolesRequest,
  GetRolesResponse,
} from "../../services/roles/roleModels";
import rolesService from "../../services/roles/roleServices";

interface RolesState {
  roles: Role[];
  isLoading: boolean;
  error: string | null;
}

const initialState: RolesState = {
  roles: [],
  isLoading: false,
  error: null,
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

export default roleSlice.reducer;
