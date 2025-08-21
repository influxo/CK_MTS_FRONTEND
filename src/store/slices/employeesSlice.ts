import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type {
  Employee,
  GetEmployeesResponse,
} from "../../services/employees/employeesModels";
import employeesService from "../../services/employees/employeesService";

interface EmployeesState {
  employees: Employee[];
  isLoading: boolean;
  error: string | null;
}

const initialState: EmployeesState = {
  employees: [],
  isLoading: false,
  error: null,
};

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

const employeesSlice = createSlice({
  name: "employees",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
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
      });
  },
});

export const selectAllEmployees = (state: { employees: EmployeesState }) =>
  state.employees.employees;
export const selectEmployeesLoading = (state: { employees: EmployeesState }) =>
  state.employees.isLoading;
export const selectEmployeesError = (state: { employees: EmployeesState }) =>
  state.employees.error;

export default employeesSlice.reducer;
