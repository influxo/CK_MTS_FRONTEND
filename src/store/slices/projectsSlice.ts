// slices/projectsSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type {
  Project,
  GetProjectsResponse,
  CreateProjectRequest,
  CreateProjectResponse,
  AssignUserToProjectRequest,
  AssignUserToProjectResponse,
  GetProjectUsersResponse,
  AssignedProjectUser,
  RemoveUserFromProjectRequest,
  RemoveUserFromProjectResponse,
} from "../../services/projects/projectModels";
import projectService from "../../services/projects/projectService";

interface ProjectsState {
  projects: Project[];
  isLoading: boolean;
  error: string | null;
  createSuccessMessage: string | null;
  assignUserSuccessMessage: string | null;
  removeUserSuccessMessage: string | null;
  assignedUsers: AssignedProjectUser[];
  assignedUsersLoading: boolean;
  assignedUsersError: string | null;
}

const initialState: ProjectsState = {
  projects: [],
  isLoading: false,
  error: null,
  createSuccessMessage: null,
  assignUserSuccessMessage: null,
  removeUserSuccessMessage: null,
  assignedUsers: [],
  assignedUsersLoading: false,
  assignedUsersError: null,
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

export const assignUserToProject = createAsyncThunk<
  AssignUserToProjectResponse,
  AssignUserToProjectRequest,
  { rejectValue: string }
>("projects/assignUser", async (req, { rejectWithValue }) => {
  const response = await projectService.assignUserToProject(req);
  if (!response.success) {
    return rejectWithValue(response.message || "Failed to assign user to project");
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

const projectsSlice = createSlice({
  name: "projects",
  initialState,
  reducers: {
    clearProjectMessages(state) {
      state.createSuccessMessage = null;
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
      // assign user to project
      .addCase(assignUserToProject.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.assignUserSuccessMessage = null;
      })
      .addCase(assignUserToProject.fulfilled, (state) => {
        state.isLoading = false;
        state.assignUserSuccessMessage = "User assigned to project successfully";
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
        state.assignedUsersError = action.payload ?? "Failed to fetch project users";
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
export const selectAssignedUsersLoading = (state: { projects: ProjectsState }) =>
  state.projects.assignedUsersLoading;
export const selectAssignedUsersError = (state: { projects: ProjectsState }) =>
  state.projects.assignedUsersError;

export default projectsSlice.reducer;
