// slices/subprojectsSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type {
  AssignUserToSubProjectRequest,
  AssignUserToSubProjectResponse,
  CreateSubProjectRequest,
  CreateSubProjectResponse,
  DeleteSubProjectRequest,
  DeleteSubProjectResponse,
  GetAllSubProjectsResponse,
  GetSubProjectByIdRequest,
  GetSubProjectByIdResponse,
  GetSubProjectsByProjectIdRequest,
  GetSubProjectsByProjectIdResponse,
  GetSubProjectUsersRequest,
  GetSubProjectUsersResponse,
  AssignedSubProjectUser,
  RemoveUserFromSubProjectRequest,
  RemoveUserFromSubProjectResponse,
  SubProject,
  UpdateSubProjectRequest,
  UpdateSubProjectResponse,
} from "../../services/subprojects/subprojectModels";
import subProjectService from "../../services/subprojects/subprojectService";
import serviceMetricsService from "../../services/services/serviceMetricsService";
import type {
  DeliveriesFilters,
  DeliveriesSeriesParams,
  DeliveriesSeriesResponse,
  DeliveriesSummaryData,
  DeliveriesSummaryResponse,
  TimeUnit,
} from "../../services/services/serviceMetricsModels";

interface SubProjectsState {
  subprojects: SubProject[];
  selectedSubproject: SubProject | null;
  isLoading: boolean;
  error: string | null;
  createSuccessMessage: string | null;
  updateSuccessMessage: string | null;
  deleteSuccessMessage: string | null;
  assignUserSuccessMessage: string | null;
  removeUserSuccessMessage: string | null;
  // users assigned to a subproject
  assignedUsers: AssignedSubProjectUser[];
  assignedUsersLoading: boolean;
  assignedUsersError: string | null;
  // Subproject-scoped metrics (Overview tab)
  metrics: {
    summary: {
      loading: boolean;
      error: string | null;
      data: DeliveriesSummaryData | null;
      lastKey?: string | null;
    };
    series: {
      loading: boolean;
      error: string | null;
      items: DeliveriesSeriesResponse["items"];
      granularity: TimeUnit;
      groupedBy: DeliveriesSeriesResponse["groupedBy"];
      lastKey?: string | null;
    };
  };
}

const initialState: SubProjectsState = {
  subprojects: [],
  selectedSubproject: null,
  isLoading: false,
  error: null,
  createSuccessMessage: null,
  updateSuccessMessage: null,
  deleteSuccessMessage: null,
  assignUserSuccessMessage: null,
  removeUserSuccessMessage: null,
  assignedUsers: [],
  assignedUsersLoading: false,
  assignedUsersError: null,
  metrics: {
    summary: {
      loading: false,
      error: null,
      data: null,
      lastKey: null,
    },
    series: {
      loading: false,
      error: null,
      items: [],
      granularity: "month",
      groupedBy: null,
      lastKey: null,
    },
  },
};

// Thunks
export const fetchSubProjectsByProjectId = createAsyncThunk<
  GetSubProjectsByProjectIdResponse,
  GetSubProjectsByProjectIdRequest,
  { rejectValue: string }
>("subprojects/fetchByProjectId", async (req, { rejectWithValue }) => {
  const response = await subProjectService.getSubProjectsByProjectId(req);
  if (!response.success) {
    return rejectWithValue(response.message || "Failed to fetch subprojects");
  }
  return response;
});

// Fetch all subprojects
export const fetchAllSubProjects = createAsyncThunk<
  GetAllSubProjectsResponse,
  void,
  { rejectValue: string }
>("subprojects/fetch", async (_, { rejectWithValue }) => {
  const response = await subProjectService.getAllSubProjects();
  if (!response.success) {
    return rejectWithValue(response.message || "Failed to fetch subprojects");
  }
  return response;
});

export const getSubProjectById = createAsyncThunk<
  GetSubProjectByIdResponse,
  GetSubProjectByIdRequest,
  { rejectValue: string }
>("subprojects/getById", async (req, { rejectWithValue }) => {
  const response = await subProjectService.getSubProjectById(req);
  if (!response.success) {
    return rejectWithValue(response.message || "Failed to fetch subproject");
  }
  return response;
});

  

// Fetch users assigned to a subproject
export const fetchSubProjectUsers = createAsyncThunk<
  GetSubProjectUsersResponse,
  GetSubProjectUsersRequest,
  { rejectValue: string }
>("subprojects/fetchUsers", async (req, { rejectWithValue }) => {
  const response = await subProjectService.getSubProjectUsers(req);
  if (!response.success) {
    return rejectWithValue(
      response.message || "Failed to fetch subproject users"
    );
  }
  return response;
});

export const createSubProject = createAsyncThunk<
  CreateSubProjectResponse,
  CreateSubProjectRequest,
  { rejectValue: string }
>("subprojects/create", async (req, { rejectWithValue }) => {
  const response = await subProjectService.createSubProject(req);
  if (!response.success) {
    return rejectWithValue(response.message || "Failed to create subproject");
  }
  return response;
});

export const updateSubProject = createAsyncThunk<
  UpdateSubProjectResponse,
  UpdateSubProjectRequest,
  { rejectValue: string }
>("subprojects/update", async (req, { rejectWithValue }) => {
  const response = await subProjectService.updateSubProject(req);
  if (!response.success) {
    return rejectWithValue(response.message || "Failed to update subproject");
  }
  return response;
});

export const deleteSubProject = createAsyncThunk<
  DeleteSubProjectResponse,
  DeleteSubProjectRequest,
  { rejectValue: string }
>("subprojects/delete", async (req, { rejectWithValue }) => {
  const response = await subProjectService.deleteSubProject(req);
  if (!response.success) {
    return rejectWithValue(response.message || "Failed to delete subproject");
  }
  return response;
});

export const assignUserToSubProject = createAsyncThunk<
  AssignUserToSubProjectResponse,
  AssignUserToSubProjectRequest,
  { rejectValue: string }
>("subprojects/assignUser", async (req, { rejectWithValue }) => {
  const response = await subProjectService.assignUserToSubProject(req);
  if (!response.success) {
    return rejectWithValue(
      response.message || "Failed to assign user to subproject"
    );
  }
  return response;
});

export const removeUserFromSubProject = createAsyncThunk<
  RemoveUserFromSubProjectResponse,
  RemoveUserFromSubProjectRequest,
  { rejectValue: string }
>("subprojects/removeUser", async (req, { rejectWithValue }) => {
  const response = await subProjectService.removeUserFromSubProject(req);
  if (!response.success) {
    return rejectWithValue(
      response.message || "Failed to remove user from subproject"
    );
  }
  return response;
});

// Subproject-scoped metrics thunks (always enforce entityType: 'subproject')
export const fetchSubProjectDeliveriesSummary = createAsyncThunk<
  DeliveriesSummaryResponse,
  { entityId: string } & Partial<DeliveriesFilters>,
  { state: any; rejectValue: string }
>(
  "subprojects/fetchSubProjectDeliveriesSummary",
  async (args, { rejectWithValue }) => {
    const response = await serviceMetricsService.getDeliveriesSummary({
      ...args,
      entityType: (args as any).entityType || "subproject",
      entityId: args.entityId,
    });
    if (!response.success) {
      return rejectWithValue(
        response.message || "Failed to fetch subproject deliveries summary"
      );
    }
    return response;
  },
  {
    condition: (args, { getState }) => {
      const st = getState() as any;
      const prevKey = st.subprojects.metrics.summary.lastKey;
      const key = JSON.stringify({
        ...args,
        entityType: (args as any).entityType || "subproject",
      });
      return prevKey !== key && !st.subprojects.metrics.summary.loading;
    },
  }
);

export const fetchSubProjectDeliveriesSeries = createAsyncThunk<
  DeliveriesSeriesResponse,
  { entityId: string } & Partial<DeliveriesSeriesParams>,
  { state: any; rejectValue: string }
>(
  "subprojects/fetchSubProjectDeliveriesSeries",
  async (args, { rejectWithValue }) => {
    const response = await serviceMetricsService.getDeliveriesSeries({
      ...args,
      entityType: (args as any).entityType || "subproject",
      entityId: args.entityId,
    });
    if (!response.success) {
      return rejectWithValue(
        response.message || "Failed to fetch subproject deliveries series"
      );
    }
    return response;
  },
  {
    condition: (args, { getState }) => {
      const st = getState() as any;
      const prevKey = st.subprojects.metrics.series.lastKey;
      const key = JSON.stringify({
        ...args,
        entityType: (args as any).entityType || "subproject",
      });
      return prevKey !== key && !st.subprojects.metrics.series.loading;
    },
  }
);

const subprojectsSlice = createSlice({
  name: "subprojects",
  initialState,
  reducers: {
    clearSubprojectMessages(state) {
      state.error = null;
      state.createSuccessMessage = null;
      state.updateSuccessMessage = null;
      state.deleteSuccessMessage = null;
      state.assignUserSuccessMessage = null;
      state.removeUserSuccessMessage = null;
    },
    clearSelectedSubproject(state) {
      state.selectedSubproject = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetch all subprojects
      .addCase(fetchAllSubProjects.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllSubProjects.fulfilled, (state, action) => {
        state.isLoading = false;
        state.subprojects = action.payload.data;
      })
      .addCase(fetchAllSubProjects.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? "Failed to fetch all subprojects";
      })
      // fetchByProjectId
      .addCase(fetchSubProjectsByProjectId.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSubProjectsByProjectId.fulfilled, (state, action) => {
        state.isLoading = false;
        state.subprojects = action.payload.data;
      })
      .addCase(fetchSubProjectsByProjectId.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? "Failed to fetch subprojects";
      })

      // getById
      .addCase(getSubProjectById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getSubProjectById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedSubproject = action.payload.data;
      })
      .addCase(getSubProjectById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? "Failed to fetch subproject";
      })

      // fetch users assigned to subproject
      .addCase(fetchSubProjectUsers.pending, (state) => {
        state.assignedUsersLoading = true;
        state.assignedUsersError = null;
      })
      .addCase(fetchSubProjectUsers.fulfilled, (state, action) => {
        state.assignedUsersLoading = false;
        state.assignedUsers = action.payload.data;
      })
      .addCase(fetchSubProjectUsers.rejected, (state, action) => {
        state.assignedUsersLoading = false;
        state.assignedUsersError = action.payload ?? "Failed to fetch users";
      })

      // create
      .addCase(createSubProject.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.createSuccessMessage = null;
      })
      .addCase(createSubProject.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.data) {
          state.subprojects.push(action.payload.data);
          state.createSuccessMessage = "Subproject created successfully";
        }
      })
      .addCase(createSubProject.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? "Failed to create subproject";
      })

      // update
      .addCase(updateSubProject.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.updateSuccessMessage = null;
      })
      .addCase(updateSubProject.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.data) {
          const updated = action.payload.data;
          const idx = state.subprojects.findIndex((s) => s.id === updated.id);
          if (idx !== -1) {
            state.subprojects[idx] = updated;
          }
          if (
            state.selectedSubproject &&
            state.selectedSubproject.id === updated.id
          ) {
            state.selectedSubproject = updated;
          }
          state.updateSuccessMessage = "Subproject updated successfully";
        }
      })
      .addCase(updateSubProject.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? "Failed to update subproject";
      })

      // delete
      .addCase(deleteSubProject.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.deleteSuccessMessage = null;
      })
      .addCase(deleteSubProject.fulfilled, (state, action) => {
        state.isLoading = false;
        // assuming no data returned, just remove by id from request; if backend returns deleted id adapt accordingly
        // can't access request here, so consumer should refetch or you could store lastDeletedId separately
        state.deleteSuccessMessage = action.payload
          ? "Subproject deleted successfully"
          : "Failed to delete subproject";
      })
      .addCase(deleteSubProject.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? "Failed to delete subproject";
      })

      // assign user
      .addCase(assignUserToSubProject.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.assignUserSuccessMessage = null;
      })
      .addCase(assignUserToSubProject.fulfilled, (state, action) => {
        state.isLoading = false;
        state.assignUserSuccessMessage = action.payload
          ? "User assigned successfully"
          : "Failed to assign user";
        // optionally: update selectedSubproject or list if returned data contains updated subproject
      })
      .addCase(assignUserToSubProject.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? "Failed to assign user";
      })

      // remove user
      .addCase(removeUserFromSubProject.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.removeUserSuccessMessage = null;
      })
      .addCase(removeUserFromSubProject.fulfilled, (state, action) => {
        state.isLoading = false;
        state.removeUserSuccessMessage = action.payload
          ? "User removed successfully"
          : "Failed to remove user";
      })
      .addCase(removeUserFromSubProject.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? "Failed to remove user";
      })
      // subproject metrics: summary
      .addCase(fetchSubProjectDeliveriesSummary.pending, (state) => {
        state.metrics.summary.loading = true;
        state.metrics.summary.error = null;
      })
      .addCase(fetchSubProjectDeliveriesSummary.fulfilled, (state, action) => {
        state.metrics.summary.loading = false;
        state.metrics.summary.error = null;
        state.metrics.summary.data = action.payload.data;
        // @ts-ignore meta is available on action
        const key = JSON.stringify({
          ...(action.meta.arg || {}),
          entityType:
            ((action.meta as any).arg && (action.meta as any).arg.entityType) ||
            "subproject",
        });
        state.metrics.summary.lastKey = key;
      })
      .addCase(fetchSubProjectDeliveriesSummary.rejected, (state, action) => {
        state.metrics.summary.loading = false;
        state.metrics.summary.error = action.payload ||
          "Failed to fetch subproject deliveries summary";
      })
      // subproject metrics: series
      .addCase(fetchSubProjectDeliveriesSeries.pending, (state) => {
        state.metrics.series.loading = true;
        state.metrics.series.error = null;
      })
      .addCase(fetchSubProjectDeliveriesSeries.fulfilled, (state, action) => {
        state.metrics.series.loading = false;
        state.metrics.series.error = null;
        state.metrics.series.items = action.payload.items;
        state.metrics.series.granularity = action.payload.granularity;
        state.metrics.series.groupedBy = action.payload.groupedBy;
        // @ts-ignore meta is available on action
        const key = JSON.stringify({
          ...(action.meta.arg || {}),
          entityType:
            ((action.meta as any).arg && (action.meta as any).arg.entityType) ||
            "subproject",
        });
        state.metrics.series.lastKey = key;
      })
      .addCase(fetchSubProjectDeliveriesSeries.rejected, (state, action) => {
        state.metrics.series.loading = false;
        state.metrics.series.error = action.payload ||
          "Failed to fetch subproject deliveries series";
      });
  },
});

export const { clearSubprojectMessages, clearSelectedSubproject } =
  subprojectsSlice.actions;

// Selectors
export const selectAllSubprojects = (state: {
  subprojects: SubProjectsState;
}) => state.subprojects.subprojects;
export const selectSelectedSubproject = (state: {
  subprojects: SubProjectsState;
}) => state.subprojects.selectedSubproject;
export const selectSubprojectsLoading = (state: {
  subprojects: SubProjectsState;
}) => state.subprojects.isLoading;
export const selectSubprojectsError = (state: {
  subprojects: SubProjectsState;
}) => state.subprojects.error;
export const selectCreateSuccessMessage = (state: {
  subprojects: SubProjectsState;
}) => state.subprojects.createSuccessMessage;
export const selectUpdateSuccessMessage = (state: {
  subprojects: SubProjectsState;
}) => state.subprojects.updateSuccessMessage;
export const selectDeleteSuccessMessage = (state: {
  subprojects: SubProjectsState;
}) => state.subprojects.deleteSuccessMessage;
export const selectAssignUserSuccessMessage = (state: {
  subprojects: SubProjectsState;
}) => state.subprojects.assignUserSuccessMessage;
export const selectRemoveUserSuccessMessage = (state: {
  subprojects: SubProjectsState;
}) => state.subprojects.removeUserSuccessMessage;

// Assigned users selectors
export const selectAssignedSubProjectUsers = (state: {
  subprojects: SubProjectsState;
}) => state.subprojects.assignedUsers;
export const selectAssignedSubProjectUsersLoading = (state: {
  subprojects: SubProjectsState;
}) => state.subprojects.assignedUsersLoading;
export const selectAssignedSubProjectUsersError = (state: {
  subprojects: SubProjectsState;
}) => state.subprojects.assignedUsersError;

// Subproject metrics selectors
export const selectSubProjectMetricsSummary = (state: {
  subprojects: SubProjectsState;
}) => state.subprojects.metrics.summary;
export const selectSubProjectMetricsSeries = (state: {
  subprojects: SubProjectsState;
}) => state.subprojects.metrics.series;

export default subprojectsSlice.reducer;
