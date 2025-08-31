import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import userService from "../../services/users/userService";
import type { GetUserProjectsResponse, UserProject } from "../../services/users/userModels";

interface UserProjectsState {
  tree: UserProject[];
  isLoading: boolean;
  error: string | null;
}

const initialState: UserProjectsState = {
  tree: [],
  isLoading: false,
  error: null,
};

export const fetchUserProjectsByUserId = createAsyncThunk<
  GetUserProjectsResponse,
  string,
  { rejectValue: string }
>("userProjects/fetchByUserId", async (userId, { rejectWithValue }) => {
  const response = await userService.getUserProjects(userId);
  if (!response.success) {
    return rejectWithValue(response.message || "Failed to fetch user projects");
  }
  return response;
});

const userProjectsSlice = createSlice({
  name: "userProjects",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserProjectsByUserId.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserProjectsByUserId.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tree = action.payload.data || [];
      })
      .addCase(fetchUserProjectsByUserId.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? "Failed to fetch user projects";
      });
  },
});

export const selectUserProjectsTree = (state: { userProjects: UserProjectsState }) => state.userProjects.tree;
export const selectUserProjectsLoading = (state: { userProjects: UserProjectsState }) => state.userProjects.isLoading;
export const selectUserProjectsError = (state: { userProjects: UserProjectsState }) => state.userProjects.error;

export default userProjectsSlice.reducer;
