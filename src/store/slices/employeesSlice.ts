import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type {
  Employee,
  GetEmployeesResponse,
  GetEmployeeByIdResponse,
  UpdateUserRequest,
  UpdateUserResponse,
  EmployeeProject,
  GetUserProjectsResponse,
} from "../../services/employees/employeesModels";
import employeesService from "../../services/employees/employeesService";

interface EmployeesState {
  employees: Employee[];
  singleEmployee: Employee | null;
  isLoading: boolean;
  isSingleLoading: boolean;
  isUpdating: boolean;
  error: string | null;
  singleError: string | null;
  updateError: string | null;
  // user projects tree
  userProjects: EmployeeProject[];
  isUserProjectsLoading: boolean;
  userProjectsError: string | null;
}

const initialState: EmployeesState = {
  employees: [],
  singleEmployee: null,
  isLoading: false,
  isSingleLoading: false,
  isUpdating: false,
  error: null,
  singleError: null,
  updateError: null,
  userProjects: [],
  isUserProjectsLoading: false,
  userProjectsError: null,
};

// Fetch all employees
export const fetchEmployees = createAsyncThunk<
  GetEmployeesResponse,
  void,
  { rejectValue: string }
>("employees/fetchEmployees", async (_, { rejectWithValue }) => {
  const response = await employeesService.getAllEmployees();
  if (!response.success) {
    return rejectWithValue(response.message || "Failed to fetch employees");
  }
  return response;
});

// Fetch single employee by ID
export const fetchSingleEmployee = createAsyncThunk<
  GetEmployeeByIdResponse,
  string,
  { rejectValue: string }
>("employees/fetchSingleEmployee", async (employeeId, { rejectWithValue }) => {
  const response = await employeesService.getEmployeeById(employeeId);
  if (!response.success) {
    return rejectWithValue(response.message || "Failed to fetch employee");
  }
  return response;
});

// Update employee (user)
export const updateEmployee = createAsyncThunk<
  UpdateUserResponse,
  { userId: string; data: UpdateUserRequest },
  { rejectValue: string }
>("employees/updateEmployee", async ({ userId, data }, { rejectWithValue }) => {
  const response = await employeesService.updateEmployee(userId, data);
  if (!response.success) {
    return rejectWithValue(response.message || "Failed to update user");
  }
  return response;
});

// Fetch user's projects tree
export const fetchUserProjects = createAsyncThunk<
  GetUserProjectsResponse,
  string,
  { rejectValue: string }
>("employees/fetchUserProjects", async (userId, { rejectWithValue }) => {
  const response = await employeesService.getUserProjects(userId);
  if (!response.success) {
    return rejectWithValue(response.message || "Failed to fetch user projects");
  }
  return response;
});

const employeesSlice = createSlice({
  name: "employees",
  initialState,
  reducers: {
    clearSingleEmployee: (state) => {
      state.singleEmployee = null;
      state.singleError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchEmployees
      .addCase(fetchEmployees.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchEmployees.fulfilled, (state, action) => {
        state.isLoading = false;
        state.employees = action.payload.data;
      })
      .addCase(fetchEmployees.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? "Failed to fetch employees";
      })

      // fetchSingleEmployee
      .addCase(fetchSingleEmployee.pending, (state) => {
        state.isSingleLoading = true;
        state.singleError = null;
      })
      .addCase(fetchSingleEmployee.fulfilled, (state, action) => {
        state.isSingleLoading = false;
        state.singleEmployee = action.payload.data;
      })
      .addCase(fetchSingleEmployee.rejected, (state, action) => {
        state.isSingleLoading = false;
        state.singleError = action.payload ?? "Failed to fetch employee";
      })
      // updateEmployee
      .addCase(updateEmployee.pending, (state) => {
        state.isUpdating = true;
        state.updateError = null;
      })
      .addCase(updateEmployee.fulfilled, (state, action) => {
        state.isUpdating = false;
        const updated = action.payload.data;
        // update singleEmployee if it matches
        if (state.singleEmployee && state.singleEmployee.id === updated.id) {
          state.singleEmployee = updated;
        }
        // update in list
        const idx = state.employees.findIndex((e) => e.id === updated.id);
        if (idx !== -1) {
          state.employees[idx] = updated;
        }
      })
      .addCase(updateEmployee.rejected, (state, action) => {
        state.isUpdating = false;
        state.updateError = action.payload ?? "Failed to update user";
      })
      // fetchUserProjects
      .addCase(fetchUserProjects.pending, (state) => {
        state.isUserProjectsLoading = true;
        state.userProjectsError = null;
      })
      .addCase(fetchUserProjects.fulfilled, (state, action) => {
        state.isUserProjectsLoading = false;
        state.userProjects = action.payload.items;
      })
      .addCase(fetchUserProjects.rejected, (state, action) => {
        state.isUserProjectsLoading = false;
        state.userProjectsError = action.payload ?? "Failed to fetch user projects";
      });
  },
});

// Selectors
export const selectAllEmployees = (state: { employees: EmployeesState }) =>
  state.employees.employees;
export const selectEmployeesLoading = (state: { employees: EmployeesState }) =>
  state.employees.isLoading;
export const selectEmployeesError = (state: { employees: EmployeesState }) =>
  state.employees.error;

export const selectSingleEmployee = (state: { employees: EmployeesState }) =>
  state.employees.singleEmployee;
export const selectSingleEmployeeLoading = (state: {
  employees: EmployeesState;
}) => state.employees.isSingleLoading;
export const selectSingleEmployeeError = (state: {
  employees: EmployeesState;
}) => state.employees.singleError;

export const selectEmployeeUpdating = (state: { employees: EmployeesState }) =>
  state.employees.isUpdating;
export const selectEmployeeUpdateError = (state: {
  employees: EmployeesState;
}) => state.employees.updateError;

export const selectUserProjects = (state: { employees: EmployeesState }) =>
  state.employees.userProjects;
export const selectUserProjectsLoading = (state: { employees: EmployeesState }) =>
  state.employees.isUserProjectsLoading;
export const selectUserProjectsError = (state: { employees: EmployeesState }) =>
  state.employees.userProjectsError;

// Actions
export const { clearSingleEmployee } = employeesSlice.actions;

export default employeesSlice.reducer;
