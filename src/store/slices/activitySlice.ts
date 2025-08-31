import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import activityService from "../../services/activities/activityService";
import type {
  CreateSubprojectActivityRequest,
  CreateActivityResponse,
  Activity,
  GetSubprojectActivitiesResponse,
} from "../../services/activities/activityModels";

interface ActivityState {
  isLoading: boolean;
  error: string | null;
  createSuccessMessage: string | null;
  list: Activity[];
  listLoading: boolean;
  listError: string | null;
}

const initialState: ActivityState = {
  isLoading: false,
  error: null,
  createSuccessMessage: null,
  list: [],
  listLoading: false,
  listError: null,
};

export const createActivity = createAsyncThunk<
  CreateActivityResponse,
  CreateSubprojectActivityRequest,
  { rejectValue: string }
>("activities/create", async (payload, { rejectWithValue }) => {
  const res = await activityService.createActivity(payload);
  if (!res.success) {
    return rejectWithValue(res.message || "Failed to create activity");
  }
  return res;
});

export const fetchSubprojectActivities = createAsyncThunk<
  GetSubprojectActivitiesResponse,
  string,
  { rejectValue: string }
>("activities/fetchBySubproject", async (subprojectId, { rejectWithValue }) => {
  const res = await activityService.getSubprojectActivities(subprojectId);
  if (!res.success) {
    return rejectWithValue(res.message || "Failed to fetch activities");
  }
  return res;
});

const activitySlice = createSlice({
  name: "activities",
  initialState,
  reducers: {
    clearActivityMessages(state) {
      state.createSuccessMessage = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createActivity.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.createSuccessMessage = null;
      })
      .addCase(createActivity.fulfilled, (state, action) => {
        state.isLoading = false;
        state.createSuccessMessage =
          action.payload.message || "Activity created successfully";
      })
      .addCase(createActivity.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? "Failed to create activity";
      })
      .addCase(fetchSubprojectActivities.pending, (state) => {
        state.listLoading = true;
        state.listError = null;
      })
      .addCase(fetchSubprojectActivities.fulfilled, (state, action) => {
        state.listLoading = false;
        state.list = action.payload.data;
      })
      .addCase(fetchSubprojectActivities.rejected, (state, action) => {
        state.listLoading = false;
        state.listError = action.payload ?? "Failed to fetch activities";
      });
  },
});

export const { clearActivityMessages } = activitySlice.actions;

export const selectActivityIsLoading = (state: { activities: ActivityState }) =>
  state.activities.isLoading;
export const selectActivityError = (state: { activities: ActivityState }) =>
  state.activities.error;
export const selectActivityCreateSuccessMessage = (state: {
  activities: ActivityState;
}) => state.activities.createSuccessMessage;
export const selectSubprojectActivities = (state: { activities: ActivityState }) =>
  state.activities.list;
export const selectSubprojectActivitiesLoading = (state: {
  activities: ActivityState;
}) => state.activities.listLoading;
export const selectSubprojectActivitiesError = (state: {
  activities: ActivityState;
}) => state.activities.listError;

export default activitySlice.reducer;
