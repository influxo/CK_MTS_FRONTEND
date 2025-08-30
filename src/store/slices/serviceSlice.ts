import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import servicesService from "../../services/services/serviceServices";
import type {
  CreateServiceRequest,
  CreateServiceResponse,
  GetAllServicesRequest,
  GetAllServicesResponse,
  Service,
  GetServiceByIdResponse,
  UpdateServiceRequest,
  UpdateServiceResponse,
} from "../../services/services/serviceModels";

interface ServiceState {
  isLoading: boolean;
  error: string | null;
  createSuccessMessage: string | null;
  created: Service | null;
  servicesList: Service[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  // detail state
  detail: Service | null;
  detailIsLoading: boolean;
  detailError: string | null;
  // update state
  updateIsLoading: boolean;
  updateError: string | null;
  updateSuccessMessage: string | null;
  updated: Service | null;
}

const initialState: ServiceState = {
  isLoading: false,
  error: null,
  createSuccessMessage: null,
  created: null,
  servicesList: [],
  totalItems: 0,
  totalPages: 0,
  currentPage: 1,
  // detail state
  detail: null,
  detailIsLoading: false,
  detailError: null,
  // update state
  updateIsLoading: false,
  updateError: null,
  updateSuccessMessage: null,
  updated: null,
};

export const createService = createAsyncThunk<
  CreateServiceResponse,
  CreateServiceRequest,
  { rejectValue: string }
>("services/create", async (payload, { rejectWithValue }) => {
  const res = await servicesService.createService(payload);
  if (!res.success) {
    return rejectWithValue(res.message || "Failed to create service");
  }
  return res;
});

export const getAllServices = createAsyncThunk<
  GetAllServicesResponse,
  GetAllServicesRequest,
  { rejectValue: string }
>("services/getAll", async (payload, { rejectWithValue }) => {
  const res = await servicesService.getAllServices(payload);
  if (!res.success) {
    return rejectWithValue(res.message || "Failed to fetch services");
  }
  return res;
});

export const getServiceById = createAsyncThunk<
  GetServiceByIdResponse,
  string,
  { rejectValue: string }
>("services/getById", async (id, { rejectWithValue }) => {
  const res = await servicesService.getServiceById(id);
  if (!res.success) {
    return rejectWithValue(res.message || "Failed to fetch service");
  }
  return res;
});

export const updateServiceById = createAsyncThunk<
  UpdateServiceResponse,
  { id: string; data: UpdateServiceRequest },
  { rejectValue: string }
>("services/updateById", async ({ id, data }, { rejectWithValue }) => {
  const res = await servicesService.updateServiceById(id, data);
  if (!res.success) {
    return rejectWithValue(res.message || "Failed to update service");
  }
  return res;
});

const serviceSlice = createSlice({
  name: "services",
  initialState,
  reducers: {
    clearServiceMessages(state) {
      state.createSuccessMessage = null;
      state.error = null;
      state.created = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createService.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.createSuccessMessage = null;
        state.created = null;
      })
      .addCase(createService.fulfilled, (state, action) => {
        state.isLoading = false;
        state.createSuccessMessage =
          action.payload.message || "Service created successfully";
        state.created = action.payload.data ?? null;
      })
      .addCase(createService.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? "Failed to create service";
      })

      .addCase(getAllServices.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAllServices.fulfilled, (state, action) => {
        state.isLoading = false;
        state.servicesList = action.payload.items;
        state.totalItems = action.payload.totalItems;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.page;
      })
      .addCase(getAllServices.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? "Failed to fetch services";
      })
      // detail
      .addCase(getServiceById.pending, (state) => {
        state.detailIsLoading = true;
        state.detailError = null;
        state.detail = null;
      })
      .addCase(getServiceById.fulfilled, (state, action) => {
        state.detailIsLoading = false;
        state.detail = action.payload.data ?? null;
      })
      .addCase(getServiceById.rejected, (state, action) => {
        state.detailIsLoading = false;
        state.detailError = action.payload ?? "Failed to fetch service";
        state.detail = null;
      })
      // update
      .addCase(updateServiceById.pending, (state) => {
        state.updateIsLoading = true;
        state.updateError = null;
        state.updateSuccessMessage = null;
        state.updated = null;
      })
      .addCase(updateServiceById.fulfilled, (state, action) => {
        state.updateIsLoading = false;
        state.updateSuccessMessage =
          action.payload.message || "Service updated successfully";
        state.updated = action.payload.data ?? null;
        // Sync detail if same record is open
        if (state.detail && action.payload.data && state.detail.id === action.payload.data.id) {
          state.detail = { ...state.detail, ...action.payload.data };
        }
        // Optionally update list item if present
        if (action.payload.data) {
          state.servicesList = state.servicesList.map((s) =>
            s.id === action.payload.data!.id ? { ...s, ...action.payload.data } : s
          );
        }
      })
      .addCase(updateServiceById.rejected, (state, action) => {
        state.updateIsLoading = false;
        state.updateError = action.payload ?? "Failed to update service";
        state.updated = null;
      });
  },
});

export const { clearServiceMessages } = serviceSlice.actions;

export const selectServiceIsLoading = (state: { services: ServiceState }) =>
  state.services.isLoading;

export const selectServiceError = (state: { services: ServiceState }) =>
  state.services.error;

export const selectServiceCreateSuccessMessage = (state: {
  services: ServiceState;
}) => state.services.createSuccessMessage;

export const selectAllServices = (state: { services: ServiceState }) =>
  state.services.servicesList;
export const selectServicesTotalPages = (state: { services: ServiceState }) =>
  state.services.totalPages;
export const selectServicesCurrentPage = (state: { services: ServiceState }) =>
  state.services.currentPage;

export const selectCreatedService = (state: { services: ServiceState }) =>
  state.services.created;

export const selectServiceDetail = (state: { services: ServiceState }) =>
  state.services.detail;
export const selectServiceDetailLoading = (state: { services: ServiceState }) =>
  state.services.detailIsLoading;
export const selectServiceDetailError = (state: { services: ServiceState }) =>
  state.services.detailError;

export const selectServiceUpdateLoading = (state: { services: ServiceState }) =>
  state.services.updateIsLoading;
export const selectServiceUpdateError = (state: { services: ServiceState }) =>
  state.services.updateError;
export const selectServiceUpdateSuccessMessage = (state: { services: ServiceState }) =>
  state.services.updateSuccessMessage;
export const selectUpdatedService = (state: { services: ServiceState }) =>
  state.services.updated;

export default serviceSlice.reducer;
