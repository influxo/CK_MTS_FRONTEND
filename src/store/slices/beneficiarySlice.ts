import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import beneficiaryService from "../../services/beneficiaries/beneficiaryService";
import type {
  CreateBeneficiaryRequest,
  CreateBeneficiaryResponse,
  Beneficiary,
  GetBeneficiariesRequest,
  GetBeneficiariesResponse,
  BeneficiaryListItem,
  GetBeneficiaryByIdResponse,
  UpdateBeneficiaryRequest,
  UpdateBeneficiaryResponse,
  DeleteBeneficiaryResponse,
  GetBeneficiaryServicesRequest,
  GetBeneficiaryServicesResponse,
  BeneficiaryServiceItem,
  GetBeneficiaryEntitiesRequest,
  GetBeneficiaryEntitiesResponse,
  BeneficiaryEntityLinkItem,
  GetBeneficiariesByEntityRequest,
  GetBeneficiariesByEntityResponse,
  AssociateBeneficiaryToEntitiesRequest,
  AssociateBeneficiaryToEntitiesResponse,
} from "../../services/beneficiaries/beneficiaryModels";

interface BeneficiaryState {
  isLoading: boolean;
  error: string | null;
  createSuccessMessage: string | null;
  created: Beneficiary | null;
  // list state
  list: BeneficiaryListItem[];
  listIsLoading: boolean;
  listError: string | null;
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  // by-entity list state
  byEntityList: BeneficiaryListItem[];
  byEntityIsLoading: boolean;
  byEntityError: string | null;
  byEntityPage: number;
  byEntityLimit: number;
  byEntityTotalItems: number;
  byEntityTotalPages: number;
  // detail state
  detail: BeneficiaryListItem | null;
  detailIsLoading: boolean;
  detailError: string | null;
  // update state
  updateIsLoading: boolean;
  updateError: string | null;
  updateSuccessMessage: string | null;
  updated: Beneficiary | null;
  // services state
  services: BeneficiaryServiceItem[];
  servicesIsLoading: boolean;
  servicesError: string | null;
  servicesPage: number;
  servicesLimit: number;
  servicesTotalItems: number;
  servicesTotalPages: number;
  // entities state
  entities: BeneficiaryEntityLinkItem[];
  entitiesIsLoading: boolean;
  entitiesError: string | null;
  entitiesPage: number;
  entitiesLimit: number;
  entitiesTotalItems: number;
  entitiesTotalPages: number;
  // delete state
  deleteIsLoading: boolean;
  deleteError: string | null;
  deleteSuccessMessage: string | null;
  deleted: Beneficiary | null;
  // association state
  associateIsLoading: boolean;
  associateError: string | null;
  associateResult: AssociateBeneficiaryToEntitiesResponse["data"] | null;
}

const initialState: BeneficiaryState = {
  isLoading: false,
  error: null,
  createSuccessMessage: null,
  created: null,
  // list state
  list: [],
  listIsLoading: false,
  listError: null,
  page: 1,
  limit: 20,
  totalItems: 0,
  totalPages: 0,
  // by-entity list state
  byEntityList: [],
  byEntityIsLoading: false,
  byEntityError: null,
  byEntityPage: 1,
  byEntityLimit: 20,
  byEntityTotalItems: 0,
  byEntityTotalPages: 0,
  // detail state
  detail: null,
  detailIsLoading: false,
  detailError: null,
  // update state
  updateIsLoading: false,
  updateError: null,
  updateSuccessMessage: null,
  updated: null,
  // services state
  services: [],
  servicesIsLoading: false,
  servicesError: null,
  servicesPage: 1,
  servicesLimit: 20,
  servicesTotalItems: 0,
  servicesTotalPages: 0,
  // entities state
  entities: [],
  entitiesIsLoading: false,
  entitiesError: null,
  entitiesPage: 1,
  entitiesLimit: 20,
  entitiesTotalItems: 0,
  entitiesTotalPages: 0,
  // delete state
  deleteIsLoading: false,
  deleteError: null,
  deleteSuccessMessage: null,
  deleted: null,
  // association state
  associateIsLoading: false,
  associateError: null,
  associateResult: null,
};

export const createBeneficiary = createAsyncThunk<
  CreateBeneficiaryResponse,
  CreateBeneficiaryRequest,
  { rejectValue: string }
>("beneficiaries/create", async (payload, { rejectWithValue }) => {
  const res = await beneficiaryService.createBeneficiary(payload);
  if (!res.success) {
    return rejectWithValue(res.message || "Failed to create beneficiary");
  }
  return res;
});

export const fetchBeneficiaries = createAsyncThunk<
  GetBeneficiariesResponse,
  GetBeneficiariesRequest | undefined,
  { rejectValue: string }
>("beneficiaries/fetchAll", async (params, { rejectWithValue }) => {
  const res = await beneficiaryService.getBeneficiaries(params);
  if (!res.success) {
    return rejectWithValue(res.message || "Failed to fetch beneficiaries");
  }
  return res;
});

export const fetchBeneficiaryById = createAsyncThunk<
  GetBeneficiaryByIdResponse,
  string,
  { rejectValue: string }
>("beneficiaries/fetchById", async (id, { rejectWithValue }) => {
  const res = await beneficiaryService.getBeneficiaryById(id);
  if (!res.success) {
    return rejectWithValue(res.message || "Failed to fetch beneficiary");
  }
  return res;
});

export const associateBeneficiaryToEntities = createAsyncThunk<
  AssociateBeneficiaryToEntitiesResponse,
  AssociateBeneficiaryToEntitiesRequest,
  { rejectValue: string }
>(
  "beneficiaries/associateToEntities",
  async (params, { rejectWithValue }) => {
    const res = await beneficiaryService.associateBeneficiaryToEntities(params);
    if (!res.success) {
      return rejectWithValue(
        res.message || "Failed to associate beneficiary to entities"
      );
    }
    return res;
  }
);

export const fetchBeneficiariesByEntity = createAsyncThunk<
  GetBeneficiariesByEntityResponse,
  GetBeneficiariesByEntityRequest,
  { rejectValue: string }
>(
  "beneficiaries/fetchByEntity",
  async (params, { rejectWithValue }) => {
    const res = await beneficiaryService.getBeneficiariesByEntity(params);
    if (!res.success) {
      return rejectWithValue(
        res.message || "Failed to fetch beneficiaries by entity"
      );
    }
    return res;
  }
);

export const updateBeneficiaryById = createAsyncThunk<
  UpdateBeneficiaryResponse,
  { id: string; data: UpdateBeneficiaryRequest },
  { rejectValue: string }
>("beneficiaries/updateById", async ({ id, data }, { rejectWithValue }) => {
  const res = await beneficiaryService.updateBeneficiaryById(id, data);
  if (!res.success) {
    return rejectWithValue(res.message || "Failed to update beneficiary");
  }
  return res;
});

export const fetchBeneficiaryServices = createAsyncThunk<
  GetBeneficiaryServicesResponse,
  GetBeneficiaryServicesRequest,
  { rejectValue: string }
>(
  "beneficiaries/fetchServices",
  async (params, { rejectWithValue }) => {
    const res = await beneficiaryService.getBeneficiaryServices(params);
    if (!res.success) {
      return rejectWithValue(res.message || "Failed to fetch beneficiary services");
    }
    return res;
  }
);

export const fetchBeneficiaryEntities = createAsyncThunk<
  GetBeneficiaryEntitiesResponse,
  GetBeneficiaryEntitiesRequest,
  { rejectValue: string }
>("beneficiaries/fetchEntities", async (params, { rejectWithValue }) => {
  const res = await beneficiaryService.getBeneficiaryEntities(params);
  if (!res.success) {
    return rejectWithValue(res.message || "Failed to fetch beneficiary entities");
  }
  return res;
});

export const deleteBeneficiaryById = createAsyncThunk<
  DeleteBeneficiaryResponse,
  string,
  { rejectValue: string }
>("beneficiaries/deleteById", async (id, { rejectWithValue }) => {
  const res = await beneficiaryService.deleteBeneficiaryById(id);
  if (!res.success) {
    return rejectWithValue(res.message || "Failed to delete beneficiary");
  }
  return res;
});

const beneficiarySlice = createSlice({
  name: "beneficiaries",
  initialState,
  reducers: {
    clearBeneficiaryMessages(state) {
      state.createSuccessMessage = null;
      state.error = null;
      state.created = null;
    },
    clearBeneficiaryList(state) {
      state.list = [];
      state.listError = null;
      state.page = 1;
      state.limit = 20;
      state.totalItems = 0;
      state.totalPages = 0;
    },
    clearBeneficiaryDetail(state) {
      state.detail = null;
      state.detailError = null;
      state.detailIsLoading = false;
    },
    clearBeneficiaryUpdate(state) {
      state.updateIsLoading = false;
      state.updateError = null;
      state.updateSuccessMessage = null;
      state.updated = null;
    },
    clearBeneficiaryDelete(state) {
      state.deleteIsLoading = false;
      state.deleteError = null;
      state.deleteSuccessMessage = null;
      state.deleted = null;
    },
    clearBeneficiaryAssociation(state) {
      state.associateIsLoading = false;
      state.associateError = null;
      state.associateResult = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createBeneficiary.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.createSuccessMessage = null;
        state.created = null;
      })
      .addCase(createBeneficiary.fulfilled, (state, action) => {
        state.isLoading = false;
        state.createSuccessMessage =
          action.payload.message || "Beneficiary created successfully";
        state.created = action.payload.data ?? null;
      })
      .addCase(createBeneficiary.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? "Failed to create beneficiary";
      })
      // list
      .addCase(fetchBeneficiaries.pending, (state) => {
        state.listIsLoading = true;
        state.listError = null;
      })
      .addCase(fetchBeneficiaries.fulfilled, (state, action) => {
        state.listIsLoading = false;
        state.list = action.payload.items;
        state.page = action.payload.page;
        state.limit = action.payload.limit;
        state.totalItems = action.payload.totalItems;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchBeneficiaries.rejected, (state, action) => {
        state.listIsLoading = false;
        state.listError = action.payload ?? "Failed to fetch beneficiaries";
        state.list = [];
      })
      // by-entity list
      .addCase(fetchBeneficiariesByEntity.pending, (state) => {
        state.byEntityIsLoading = true;
        state.byEntityError = null;
      })
      .addCase(fetchBeneficiariesByEntity.fulfilled, (state, action) => {
        state.byEntityIsLoading = false;
        state.byEntityList = action.payload.items;
        state.byEntityPage = action.payload.page;
        state.byEntityLimit = action.payload.limit;
        state.byEntityTotalItems = action.payload.totalItems;
        state.byEntityTotalPages = action.payload.totalPages;
      })
      .addCase(fetchBeneficiariesByEntity.rejected, (state, action) => {
        state.byEntityIsLoading = false;
        state.byEntityError =
          action.payload ?? "Failed to fetch beneficiaries by entity";
        state.byEntityList = [];
      })
      // detail
      .addCase(fetchBeneficiaryById.pending, (state) => {
        state.detailIsLoading = true;
        state.detailError = null;
        state.detail = null;
      })
      .addCase(fetchBeneficiaryById.fulfilled, (state, action) => {
        state.detailIsLoading = false;
        state.detail = action.payload.data ?? null;
      })
      .addCase(fetchBeneficiaryById.rejected, (state, action) => {
        state.detailIsLoading = false;
        state.detailError = action.payload ?? "Failed to fetch beneficiary";
        state.detail = null;
      })
      // update
      .addCase(updateBeneficiaryById.pending, (state) => {
        state.updateIsLoading = true;
        state.updateError = null;
        state.updateSuccessMessage = null;
        state.updated = null;
      })
      .addCase(updateBeneficiaryById.fulfilled, (state, action) => {
        state.updateIsLoading = false;
        state.updateSuccessMessage =
          action.payload.message || "Beneficiary updated successfully";
        state.updated = action.payload.data ?? null;
        // Optionally sync detail if the same record is open
        if (state.detail && action.payload.data && state.detail.id === action.payload.data.id) {
          state.detail = {
            ...state.detail,
            ...action.payload.data,
          };
        }
      })
      .addCase(updateBeneficiaryById.rejected, (state, action) => {
        state.updateIsLoading = false;
        state.updateError = action.payload ?? "Failed to update beneficiary";
        state.updated = null;
      })
      // services
      .addCase(fetchBeneficiaryServices.pending, (state) => {
        state.servicesIsLoading = true;
        state.servicesError = null;
      })
      .addCase(fetchBeneficiaryServices.fulfilled, (state, action) => {
        state.servicesIsLoading = false;
        state.services = action.payload.data;
        state.servicesPage = action.payload.meta.page;
        state.servicesLimit = action.payload.meta.limit;
        state.servicesTotalItems = action.payload.meta.totalItems;
        state.servicesTotalPages = action.payload.meta.totalPages;
      })
      .addCase(fetchBeneficiaryServices.rejected, (state, action) => {
        state.servicesIsLoading = false;
        state.servicesError = action.payload ?? "Failed to fetch beneficiary services";
        state.services = [];
      })
      // entities
      .addCase(fetchBeneficiaryEntities.pending, (state) => {
        state.entitiesIsLoading = true;
        state.entitiesError = null;
      })
      .addCase(fetchBeneficiaryEntities.fulfilled, (state, action) => {
        state.entitiesIsLoading = false;
        state.entities = action.payload.data;
      })
      .addCase(fetchBeneficiaryEntities.rejected, (state, action) => {
        state.entitiesIsLoading = false;
        state.entitiesError = action.payload ?? "Failed to fetch beneficiary entities";
        state.entities = [];
      })
      // delete
      .addCase(deleteBeneficiaryById.pending, (state) => {
        state.deleteIsLoading = true;
        state.deleteError = null;
        state.deleteSuccessMessage = null;
        state.deleted = null;
      })
      .addCase(deleteBeneficiaryById.fulfilled, (state, action) => {
        state.deleteIsLoading = false;
        state.deleteSuccessMessage =
          action.payload.message || "Beneficiary deleted successfully";
        state.deleted = action.payload.data ?? null;
        // Sync list: reflect status change or remove if desired. Here we update item fields.
        if (action.payload.data) {
          state.list = state.list.map((item) =>
            item.id === action.payload.data!.id
              ? { ...item, ...action.payload.data }
              : item
          );
        }
        // Sync detail if same record is open
        if (
          state.detail &&
          action.payload.data &&
          state.detail.id === action.payload.data.id
        ) {
          state.detail = { ...state.detail, ...action.payload.data };
        }
      })
      .addCase(deleteBeneficiaryById.rejected, (state, action) => {
        state.deleteIsLoading = false;
        state.deleteError = action.payload ?? "Failed to delete beneficiary";
        state.deleted = null;
      })
      // associate to entities
      .addCase(associateBeneficiaryToEntities.pending, (state) => {
        state.associateIsLoading = true;
        state.associateError = null;
        state.associateResult = null;
      })
      .addCase(associateBeneficiaryToEntities.fulfilled, (state, action) => {
        state.associateIsLoading = false;
        state.associateResult = action.payload.data ?? null;
      })
      .addCase(associateBeneficiaryToEntities.rejected, (state, action) => {
        state.associateIsLoading = false;
        state.associateError =
          action.payload ?? "Failed to associate beneficiary to entities";
        state.associateResult = null;
      });
  },
});

export const { clearBeneficiaryMessages, clearBeneficiaryList, clearBeneficiaryDetail, clearBeneficiaryUpdate, clearBeneficiaryDelete, clearBeneficiaryAssociation } = beneficiarySlice.actions;

export const selectBeneficiaryIsLoading = (state: {
  beneficiaries: BeneficiaryState;
}) => state.beneficiaries.isLoading;

export const selectBeneficiaryError = (state: {
  beneficiaries: BeneficiaryState;
}) => state.beneficiaries.error;

export const selectBeneficiaryCreateSuccessMessage = (state: {
  beneficiaries: BeneficiaryState;
}) => state.beneficiaries.createSuccessMessage;

export const selectCreatedBeneficiary = (state: {
  beneficiaries: BeneficiaryState;
}) => state.beneficiaries.created;

export const selectBeneficiaries = (state: { beneficiaries: BeneficiaryState }) =>
  state.beneficiaries.list;

export const selectBeneficiariesLoading = (state: { beneficiaries: BeneficiaryState }) =>
  state.beneficiaries.listIsLoading;

export const selectBeneficiariesError = (state: { beneficiaries: BeneficiaryState }) =>
  state.beneficiaries.listError;

export const selectBeneficiariesPagination = (state: { beneficiaries: BeneficiaryState }) => ({
  page: state.beneficiaries.page,
  limit: state.beneficiaries.limit,
  totalItems: state.beneficiaries.totalItems,
  totalPages: state.beneficiaries.totalPages,
});

export const selectBeneficiaryDetail = (state: { beneficiaries: BeneficiaryState }) =>
  state.beneficiaries.detail;

export const selectBeneficiaryDetailLoading = (state: { beneficiaries: BeneficiaryState }) =>
  state.beneficiaries.detailIsLoading;

export const selectBeneficiaryDetailError = (state: { beneficiaries: BeneficiaryState }) =>
  state.beneficiaries.detailError;

export const selectBeneficiaryUpdateLoading = (state: { beneficiaries: BeneficiaryState }) =>
  state.beneficiaries.updateIsLoading;

export const selectBeneficiaryUpdateError = (state: { beneficiaries: BeneficiaryState }) =>
  state.beneficiaries.updateError;

export const selectBeneficiaryUpdateSuccessMessage = (state: { beneficiaries: BeneficiaryState }) =>
  state.beneficiaries.updateSuccessMessage;

export const selectUpdatedBeneficiary = (state: { beneficiaries: BeneficiaryState }) =>
  state.beneficiaries.updated;

export const selectBeneficiaryServices = (state: { beneficiaries: BeneficiaryState }) =>
  state.beneficiaries.services;

export const selectBeneficiaryServicesLoading = (state: { beneficiaries: BeneficiaryState }) =>
  state.beneficiaries.servicesIsLoading;

export const selectBeneficiaryServicesError = (state: { beneficiaries: BeneficiaryState }) =>
  state.beneficiaries.servicesError;

export const selectBeneficiaryServicesMeta = (state: { beneficiaries: BeneficiaryState }) => ({
  page: state.beneficiaries.servicesPage,
  limit: state.beneficiaries.servicesLimit,
  totalItems: state.beneficiaries.servicesTotalItems,
  totalPages: state.beneficiaries.servicesTotalPages,
});

export const selectBeneficiaryEntities = (state: { beneficiaries: BeneficiaryState }) =>
  state.beneficiaries.entities;

export const selectBeneficiaryEntitiesLoading = (state: { beneficiaries: BeneficiaryState }) =>
  state.beneficiaries.entitiesIsLoading;

export const selectBeneficiaryEntitiesError = (state: { beneficiaries: BeneficiaryState }) =>
  state.beneficiaries.entitiesError;

export const selectBeneficiaryDeleteLoading = (state: { beneficiaries: BeneficiaryState }) =>
  state.beneficiaries.deleteIsLoading;

export const selectBeneficiaryDeleteError = (state: { beneficiaries: BeneficiaryState }) =>
  state.beneficiaries.deleteError;

export const selectBeneficiaryDeleteSuccessMessage = (state: { beneficiaries: BeneficiaryState }) =>
  state.beneficiaries.deleteSuccessMessage;

export const selectDeletedBeneficiary = (state: { beneficiaries: BeneficiaryState }) =>
  state.beneficiaries.deleted;

// by-entity selectors
export const selectBeneficiariesByEntity = (state: { beneficiaries: BeneficiaryState }) =>
  state.beneficiaries.byEntityList;

export const selectBeneficiariesByEntityLoading = (state: { beneficiaries: BeneficiaryState }) =>
  state.beneficiaries.byEntityIsLoading;

export const selectBeneficiariesByEntityError = (state: { beneficiaries: BeneficiaryState }) =>
  state.beneficiaries.byEntityError;

export const selectBeneficiariesByEntityPagination = (state: { beneficiaries: BeneficiaryState }) => ({
  page: state.beneficiaries.byEntityPage,
  limit: state.beneficiaries.byEntityLimit,
  totalItems: state.beneficiaries.byEntityTotalItems,
  totalPages: state.beneficiaries.byEntityTotalPages,
});

// association selectors
export const selectBeneficiaryAssociateLoading = (state: { beneficiaries: BeneficiaryState }) =>
  state.beneficiaries.associateIsLoading;

export const selectBeneficiaryAssociateError = (state: { beneficiaries: BeneficiaryState }) =>
  state.beneficiaries.associateError;

export const selectBeneficiaryAssociateResult = (state: { beneficiaries: BeneficiaryState }) =>
  state.beneficiaries.associateResult;

export default beneficiarySlice.reducer;
