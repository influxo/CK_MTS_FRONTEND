// slices/projectsSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type {
  Project,
  GetProjectsResponse,
  CreateProjectRequest,
  CreateProjectResponse,
  UpdateProjectRequest,
  UpdateProjectResponse,
  AssignUserToProjectRequest,
  AssignUserToProjectResponse,
  GetProjectUsersResponse,
  AssignedProjectUser,
  RemoveUserFromProjectRequest,
  RemoveUserFromProjectResponse,
} from "../../services/projects/projectModels";
import projectService from "../../services/projects/projectService";
import serviceMetricsService from "../../services/services/serviceMetricsService";
import type {
  DeliveriesFilters,
  DeliveriesSeriesParams,
  DeliveriesSeriesResponse,
  DeliveriesSummaryData,
  DeliveriesSummaryResponse,
  TimeUnit,
} from "../../services/services/serviceMetricsModels";

interface ProjectsState {
  projects: Project[];
  isLoading: boolean;
  error: string | null;
  createSuccessMessage: string | null;
  updateSuccessMessage: string | null;
  assignUserSuccessMessage: string | null;
  removeUserSuccessMessage: string | null;
  assignedUsers: AssignedProjectUser[];
  assignedUsersLoading: boolean;
  assignedUsersError: string | null;
  // Project-scoped metrics (Overview tab)
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

const initialState: ProjectsState = {
  projects: [],
  isLoading: false,
  error: null,
  createSuccessMessage: null,
  updateSuccessMessage: null,
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

export const fetchProjects = createAsyncThunk<
  GetProjectsResponse,
  void,
  { rejectValue: string }
>("projects/fetchProjects", async (_, { rejectWithValue }) => {
  const response = await projectService.getAllProjects();
  if (!response.success) {
    return rejectWithValue(response.message || "Failed to fetch projects");
  }
  return response;
});

export const createProject = createAsyncThunk<
  CreateProjectResponse,
  CreateProjectRequest,
  { rejectValue: string }
>("projects/createProject", async (formData, { rejectWithValue }) => {
  const response = await projectService.createProject(formData);
  if (!response.success) {
    return rejectWithValue(response.message || "Failed to create project");
  }
  return response;
});

export const updateProject = createAsyncThunk<
  UpdateProjectResponse,
  { id: string; body: UpdateProjectRequest },
  { rejectValue: string }
>("projects/updateProject", async ({ id, body }, { rejectWithValue }) => {
  const response = await projectService.updateProject(id, body);
  if (!response.success) {
    return rejectWithValue(response.message || "Failed to update project");
  }
  return response;
});

export const assignUserToProject = createAsyncThunk<
  AssignUserToProjectResponse,
  AssignUserToProjectRequest,
  { rejectValue: string }
>("projects/assignUser", async (req, { rejectWithValue }) => {
  const response = await projectService.assignUserToProject(req);
  if (!response.success) {
    return rejectWithValue(
      response.message || "Failed to assign user to project"
    );
  }
  return response;
});

export const fetchProjectUsers = createAsyncThunk<
  GetProjectUsersResponse,
  string,
  { rejectValue: string }
>("projects/fetchProjectUsers", async (projectId, { rejectWithValue }) => {
  const response = await projectService.getProjectUsers(projectId);
  if (!response.success) {
    return rejectWithValue(response.message || "Failed to fetch project users");
  }
  return response;
});

export const removeUserFromProject = createAsyncThunk<
  RemoveUserFromProjectResponse,
  RemoveUserFromProjectRequest,
  { rejectValue: string }
>("projects/removeUser", async (req, { rejectWithValue }) => {
  const response = await projectService.removeUserFromProject(req);
  if (!response.success) {
    return rejectWithValue(
      response.message || "Failed to remove user from project"
    );
  }
  return response;
});

// Project-scoped metrics thunks (always enforce entityType: 'project')
export const fetchProjectDeliveriesSummary = createAsyncThunk<
  DeliveriesSummaryResponse,
  { entityId: string } & Partial<DeliveriesFilters>,
  { state: any; rejectValue: string }
>(
  "projects/fetchProjectDeliveriesSummary",
  async (args, { rejectWithValue }) => {
    const response = await serviceMetricsService.getDeliveriesSummary({
      ...args,
      entityType: (args as any).entityType || "project",
      entityId: args.entityId,
    });
    if (!response.success) {
      return rejectWithValue(
        response.message || "Failed to fetch project deliveries summary"
      );
    }
    return response;
  },
  {
    condition: (args, { getState }) => {
      const st = getState() as any;
      const prevKey = st.projects.metrics.summary.lastKey;
      const key = JSON.stringify({
        ...args,
        entityType: (args as any).entityType || "project",
      });
      return prevKey !== key && !st.projects.metrics.summary.loading;
    },
  }
);

export const fetchProjectDeliveriesSeries = createAsyncThunk<
  DeliveriesSeriesResponse,
  { entityId: string } & Partial<DeliveriesSeriesParams>,
  { state: any; rejectValue: string }
>(
  "projects/fetchProjectDeliveriesSeries",
  async (args, { rejectWithValue }) => {
    const response = await serviceMetricsService.getDeliveriesSeries({
      ...args,
      entityType: (args as any).entityType || "project",
      entityId: args.entityId,
    });
    if (!response.success) {
      return rejectWithValue(
        response.message || "Failed to fetch project deliveries series"
      );
    }
    return response;
  },
  {
    condition: (args, { getState }) => {
      const st = getState() as any;
      const prevKey = st.projects.metrics.series.lastKey;
      const key = JSON.stringify({
        ...args,
        entityType: (args as any).entityType || "project",
      });
      return prevKey !== key && !st.projects.metrics.series.loading;
    },
  }
);

const projectsSlice = createSlice({
  name: "projects",
  initialState,
  reducers: {
    clearProjectMessages(state) {
      state.createSuccessMessage = null;
      state.updateSuccessMessage = null;
      state.error = null;
      state.assignUserSuccessMessage = null;
      state.removeUserSuccessMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchProjects
      .addCase(fetchProjects.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.isLoading = false;
        state.projects = action.payload.data;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? "Failed to fetch projects";
      })

      // createProject
      .addCase(createProject.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.createSuccessMessage = null;
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.data) {
          state.projects.push(action.payload.data);
          state.createSuccessMessage = "Project created successfully";
        }
      })
      .addCase(createProject.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? "Failed to create project";
      })
      // updateProject
      .addCase(updateProject.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.updateSuccessMessage = null;
      })
      .addCase(updateProject.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.data) {
          const updated = action.payload.data;
          const idx = state.projects.findIndex((p) => p.id === updated.id);
          if (idx !== -1) {
            state.projects[idx] = updated;
          } else {
            // if project not in list, push it to keep store consistent
            state.projects.push(updated);
          }
          state.updateSuccessMessage = "Project updated successfully";
        }
      })
      .addCase(updateProject.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? "Failed to update project";
      })
      // assign user to project
      .addCase(assignUserToProject.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.assignUserSuccessMessage = null;
      })
      .addCase(assignUserToProject.fulfilled, (state) => {
        state.isLoading = false;
        state.assignUserSuccessMessage =
          "User assigned to project successfully";
      })
      .addCase(assignUserToProject.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? "Failed to assign user to project";
      })
      // fetch assigned users for a project
      .addCase(fetchProjectUsers.pending, (state) => {
        state.assignedUsersLoading = true;
        state.assignedUsersError = null;
      })
      .addCase(fetchProjectUsers.fulfilled, (state, action) => {
        state.assignedUsersLoading = false;
        state.assignedUsers = action.payload.data;
      })
      .addCase(fetchProjectUsers.rejected, (state, action) => {
        state.assignedUsersLoading = false;
        state.assignedUsersError =
          action.payload ?? "Failed to fetch project users";
      })
      // remove user from project
      .addCase(removeUserFromProject.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.removeUserSuccessMessage = null;
      })
      .addCase(removeUserFromProject.fulfilled, (state, action) => {
        state.isLoading = false;
        state.removeUserSuccessMessage = action.payload
          ? "User removed from project successfully"
          : "Failed to remove user from project";
      })
      .addCase(removeUserFromProject.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? "Failed to remove user from project";
      })
      // project metrics: summary
      .addCase(fetchProjectDeliveriesSummary.pending, (state) => {
        state.metrics.summary.loading = true;
        state.metrics.summary.error = null;
      })
      .addCase(fetchProjectDeliveriesSummary.fulfilled, (state, action) => {
        state.metrics.summary.loading = false;
        state.metrics.summary.error = null;
        state.metrics.summary.data = action.payload.data;
        // @ts-ignore meta is available on action
        const key = JSON.stringify({
          ...(action.meta.arg || {}),
          entityType:
            ((action.meta as any).arg && (action.meta as any).arg.entityType) ||
            "project",
        });
        state.metrics.summary.lastKey = key;
      })
      .addCase(fetchProjectDeliveriesSummary.rejected, (state, action) => {
        state.metrics.summary.loading = false;
        state.metrics.summary.error =
          action.payload || "Failed to fetch project deliveries summary";
      })
      // project metrics: series
      .addCase(fetchProjectDeliveriesSeries.pending, (state) => {
        state.metrics.series.loading = true;
        state.metrics.series.error = null;
      })
      .addCase(fetchProjectDeliveriesSeries.fulfilled, (state, action) => {
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
            "project",
        });
        state.metrics.series.lastKey = key;
      })
      .addCase(fetchProjectDeliveriesSeries.rejected, (state, action) => {
        state.metrics.series.loading = false;
        state.metrics.series.error =
          action.payload || "Failed to fetch project deliveries series";
      });
  },
});

export const { clearProjectMessages } = projectsSlice.actions;

export const selectAllProjects = (state: { projects: ProjectsState }) =>
  state.projects.projects;
export const selectProjectsLoading = (state: { projects: ProjectsState }) =>
  state.projects.isLoading;
export const selectProjectsError = (state: { projects: ProjectsState }) =>
  state.projects.error;
export const selectCreateSuccessMessage = (state: {
  projects: ProjectsState;
}) => state.projects.createSuccessMessage;
export const selectAssignUserSuccessMessage = (state: {
  projects: ProjectsState;
}) => state.projects.assignUserSuccessMessage;
export const selectRemoveUserSuccessMessage = (state: {
  projects: ProjectsState;
}) => state.projects.removeUserSuccessMessage;

export const selectAssignedUsers = (state: { projects: ProjectsState }) =>
  state.projects.assignedUsers;
export const selectAssignedUsersLoading = (state: {
  projects: ProjectsState;
}) => state.projects.assignedUsersLoading;
export const selectAssignedUsersError = (state: { projects: ProjectsState }) =>
  state.projects.assignedUsersError;

// Project metrics selectors
export const selectProjectMetricsSummary = (state: {
  projects: ProjectsState;
}) => state.projects.metrics.summary;
export const selectProjectMetricsSeries = (state: {
  projects: ProjectsState;
}) => state.projects.metrics.series;

export default projectsSlice.reducer;
