import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type {
  Employee,
  GetEmployeesResponse,
  GetEmployeeByIdResponse,
} from "../../services/employees/employeesModels";
import employeesService from "../../services/employees/employeesService";

interface EmployeesState {
  employees: Employee[];
  singleEmployee: Employee | null;
  isLoading: boolean;
  isSingleLoading: boolean;
  error: string | null;
  singleError: string | null;
}

const initialState: EmployeesState = {
  employees: [],
  singleEmployee: null,
  isLoading: false,
  isSingleLoading: false,
  error: null,
  singleError: null,
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

// Actions
export const { clearSingleEmployee } = employeesSlice.actions;

export default employeesSlice.reducer;
