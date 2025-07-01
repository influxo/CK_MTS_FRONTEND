// slices/projectsSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type {
  Project,
  GetProjectsResponse,
  CreateProjectRequest,
  CreateProjectResponse,
} from "../../services/projects/projectModels";
import projectService from "../../services/projects/projectService";

interface ProjectsState {
  projects: Project[];
  isLoading: boolean;
  error: string | null;
  createSuccessMessage: string | null;
}

const initialState: ProjectsState = {
  projects: [],
  isLoading: false,
  error: null,
  createSuccessMessage: null,
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

const projectsSlice = createSlice({
  name: "projects",
  initialState,
  reducers: {
    clearProjectMessages(state) {
      state.createSuccessMessage = null;
      state.error = null;
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

export default projectsSlice.reducer;
