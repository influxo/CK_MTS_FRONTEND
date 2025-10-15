import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type {
  FormTemplate,
  Pagination,
  GetFormTemplatesRequest,
  GetFormTemplatesResponse,
  GetFormTemplateByIdResponse,
  FormSubmissionRequest,
  FormSubmissionResponse,
  GetFormResponseByIdResponse,
  FormResponseData,
  GetFormResponsesByEntityRequest,
  GetFormResponsesByEntityResponse,
  GetAllFormResponsesRequest,
  GetAllFormResponsesResponse,
} from "../../services/forms/formModels";
import formService from "../../services/forms/formServices";
import beneficiaryService from "../../services/beneficiaries/beneficiaryService";
import type {
  GetBeneficiariesByEntityRequest,
  GetBeneficiariesByEntityResponse,
  BeneficiaryListItem,
} from "../../services/beneficiaries/beneficiaryModels";

interface FormTemplatesState {
  templates: FormTemplate[];
  pagination: Pagination | null;
  isLoading: boolean;
  error: string | null;
  // submission state
  submitLoading: boolean;
  submitError: string | null;
  lastSubmission: FormSubmissionResponse | null;
  // selected template state
  selectedTemplate: FormTemplate | null;
  selectedTemplateLoading: boolean;
  selectedTemplateError: string | null;
  // selected response state
  selectedResponse: FormResponseData | null;
  selectedResponseLoading: boolean;
  selectedResponseError: string | null;
  // beneficiaries by entity (for data-entry context)
  byEntityBeneficiaries: BeneficiaryListItem[];
  byEntityBeneficiariesLoading: boolean;
  byEntityBeneficiariesError: string | null;
  byEntityPage: number;
  byEntityLimit: number;
  byEntityTotalItems: number;
  byEntityTotalPages: number;
  // responses list (by entity)
  responses: FormResponseData[];
  responsesPagination: Pagination | null;
  responsesLoading: boolean;
  responsesError: string | null;
}

const initialState: FormTemplatesState = {
  templates: [],
  pagination: null,
  isLoading: false,
  error: null,
  submitLoading: false,
  submitError: null,
  lastSubmission: null,
  selectedTemplate: null,
  selectedTemplateLoading: false,
  selectedTemplateError: null,
  selectedResponse: null,
  selectedResponseLoading: false,
  selectedResponseError: null,
  byEntityBeneficiaries: [],
  byEntityBeneficiariesLoading: false,
  byEntityBeneficiariesError: null,
  byEntityPage: 1,
  byEntityLimit: 20,
  byEntityTotalItems: 0,
  byEntityTotalPages: 0,
  responses: [],
  responsesPagination: null,
  responsesLoading: false,
  responsesError: null,
};

export const fetchFormTemplates = createAsyncThunk<
  GetFormTemplatesResponse,
  GetFormTemplatesRequest,
  { rejectValue: string }
>("form/fetchFormTemplates", async (params, { rejectWithValue }) => {
  const response = await formService.getFormTemplates(params);
  if (!response.success) {
    return rejectWithValue(
      response.message || "Failed to fetch form templates"
    );
  }
  return response;
});

export const submitFormResponse = createAsyncThunk<
  FormSubmissionResponse,
  { templateId: string; payload: FormSubmissionRequest },
  { rejectValue: string }
>(
  "form/submitFormResponse",
  async ({ templateId, payload }, { rejectWithValue }) => {
    const response = await formService.submitForm(templateId, payload);
    if (!response.success) {
      return rejectWithValue(
        response.message || "Failed to submit form response"
      );
    }
    return response;
  }
);

export const fetchFormTemplateById = createAsyncThunk<
  GetFormTemplateByIdResponse,
  { id: string },
  { rejectValue: string }
>("form/fetchFormTemplateById", async ({ id }, { rejectWithValue }) => {
  const response = await formService.getFormTemplateById(id);
  if (!response.success) {
    return rejectWithValue(response.message || "Failed to fetch form template");
  }
  return response;
});

export const fetchFormResponseById = createAsyncThunk<
  GetFormResponseByIdResponse,
  { id: string },
  { rejectValue: string }
>("form/fetchFormResponseById", async ({ id }, { rejectWithValue }) => {
  const response = await formService.getFormResponseById(id);
  if (!response.success) {
    return rejectWithValue(response.message || "Failed to fetch form response");
  }
  return response;
});

// Fetch beneficiaries by entity (for use within form submission flows)
export const fetchBeneficiariesByEntityForForm = createAsyncThunk<
  GetBeneficiariesByEntityResponse,
  GetBeneficiariesByEntityRequest,
  { rejectValue: string }
>("form/fetchBeneficiariesByEntity", async (params, { rejectWithValue }) => {
  const res = await beneficiaryService.getBeneficiariesByEntity(params);
  if (!res.success) {
    return rejectWithValue(
      res.message || "Failed to fetch beneficiaries for this entity"
    );
  }
  return res;
});
export const fetchFormResponsesByEntity = createAsyncThunk<
  GetFormResponsesByEntityResponse,
  GetFormResponsesByEntityRequest,
  { rejectValue: string }
>("form/fetchFormResponsesByEntity", async (params, {}) => {
  const response = await formService.getFormResponsesByEntity(params);
  if (!response.success && response.message) {
    // Still return mapping so UI can show empty with error
  }
  return response;
});

export const fetchAllFormResponses = createAsyncThunk<
  GetAllFormResponsesResponse,
  GetAllFormResponsesRequest,
  { rejectValue: string }
>("form/fetchAllFormResponses", async (params, {}) => {
  const response = await formService.getAllFormResponses(params);
  if (!response.success && response.message) {
    // Return response with pagination even on error mapping
  }
  return response;
});

const formSlice = createSlice({
  name: "form",
  initialState,
  reducers: {
    clearFormErrors(state) {
      state.error = null;
      state.submitError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFormTemplates.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFormTemplates.fulfilled, (state, action) => {
        state.isLoading = false;
        state.templates = action.payload.data.templates;
        state.pagination = action.payload.data.pagination;
      })
      .addCase(fetchFormTemplates.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? "Failed to fetch form templates";
      })
      // submit form response
      .addCase(submitFormResponse.pending, (state) => {
        state.submitLoading = true;
        state.submitError = null;
        state.lastSubmission = null;
      })
      .addCase(submitFormResponse.fulfilled, (state, action) => {
        state.submitLoading = false;
        state.lastSubmission = action.payload;
      })
      .addCase(submitFormResponse.rejected, (state, action) => {
        state.submitLoading = false;
        state.submitError = action.payload ?? "Failed to submit form response";
      })
      // fetch single template by id
      .addCase(fetchFormTemplateById.pending, (state) => {
        state.selectedTemplateLoading = true;
        state.selectedTemplateError = null;
        state.selectedTemplate = null;
      })
      .addCase(fetchFormTemplateById.fulfilled, (state, action) => {
        state.selectedTemplateLoading = false;
        state.selectedTemplate = action.payload.data;
      })
      .addCase(fetchFormTemplateById.rejected, (state, action) => {
        state.selectedTemplateLoading = false;
        state.selectedTemplateError =
          action.payload ?? "Failed to fetch form template";
      })
      // fetch single response by id
      .addCase(fetchFormResponseById.pending, (state) => {
        state.selectedResponseLoading = true;
        state.selectedResponseError = null;
        state.selectedResponse = null;
      })
      .addCase(fetchFormResponseById.fulfilled, (state, action) => {
        state.selectedResponseLoading = false;
        state.selectedResponse = action.payload.data;
      })
      .addCase(fetchFormResponseById.rejected, (state, action) => {
        state.selectedResponseLoading = false;
        state.selectedResponseError =
          action.payload ?? "Failed to fetch form response";
      })
      // beneficiaries by entity
      .addCase(fetchBeneficiariesByEntityForForm.pending, (state) => {
        state.byEntityBeneficiariesLoading = true;
        state.byEntityBeneficiariesError = null;
      })
      .addCase(fetchBeneficiariesByEntityForForm.fulfilled, (state, action) => {
        state.byEntityBeneficiariesLoading = false;
        state.byEntityBeneficiaries = action.payload.items;
        state.byEntityPage = action.payload.page;
        state.byEntityLimit = action.payload.limit;
        state.byEntityTotalItems = action.payload.totalItems;
        state.byEntityTotalPages = action.payload.totalPages;
      })
      .addCase(fetchBeneficiariesByEntityForForm.rejected, (state, action) => {
        state.byEntityBeneficiariesLoading = false;
        state.byEntityBeneficiariesError =
          action.payload ?? "Failed to fetch beneficiaries for this entity";
        state.byEntityBeneficiaries = [];
      })
      // list responses by entity
      .addCase(fetchFormResponsesByEntity.pending, (state) => {
        state.responsesLoading = true;
        state.responsesError = null;
      })
      .addCase(fetchFormResponsesByEntity.fulfilled, (state, action) => {
        state.responsesLoading = false;
        state.responses = action.payload.data.items;
        state.responsesPagination = action.payload.data.pagination;
      })
      .addCase(fetchFormResponsesByEntity.rejected, (state, action) => {
        state.responsesLoading = false;
        state.responsesError =
          action.payload ?? "Failed to fetch form responses";
      })
      // list all responses
      .addCase(fetchAllFormResponses.pending, (state) => {
        state.responsesLoading = true;
        state.responsesError = null;
      })
      .addCase(fetchAllFormResponses.fulfilled, (state, action) => {
        state.responsesLoading = false;
        state.responses = action.payload.data.items;
        state.responsesPagination = action.payload.data.pagination;
      })
      .addCase(fetchAllFormResponses.rejected, (state, action) => {
        state.responsesLoading = false;
        state.responsesError =
          action.payload ?? "Failed to fetch form responses";
      });
  },
});

export const { clearFormErrors } = formSlice.actions;

export const selectFormTemplates = (state: { form: FormTemplatesState }) =>
  state.form.templates;
export const selectFormTemplatesLoading = (state: {
  form: FormTemplatesState;
}) => state.form.isLoading;
export const selectFormTemplatesError = (state: { form: FormTemplatesState }) =>
  state.form.error;
export const selectFormTemplatesPagination = (state: {
  form: FormTemplatesState;
}) => state.form.pagination;
export const selectFormSubmitLoading = (state: { form: FormTemplatesState }) =>
  state.form.submitLoading;
export const selectFormSubmitError = (state: { form: FormTemplatesState }) =>
  state.form.submitError;
export const selectLastFormSubmission = (state: { form: FormTemplatesState }) =>
  state.form.lastSubmission;
export const selectSelectedTemplate = (state: { form: FormTemplatesState }) =>
  state.form.selectedTemplate;
export const selectSelectedTemplateLoading = (state: {
  form: FormTemplatesState;
}) => state.form.selectedTemplateLoading;
export const selectSelectedTemplateError = (state: {
  form: FormTemplatesState;
}) => state.form.selectedTemplateError;

export const selectSelectedResponse = (state: { form: FormTemplatesState }) =>
  state.form.selectedResponse;
export const selectSelectedResponseLoading = (state: {
  form: FormTemplatesState;
}) => state.form.selectedResponseLoading;
export const selectSelectedResponseError = (state: {
  form: FormTemplatesState;
}) => state.form.selectedResponseError;

// Beneficiaries by entity selectors
export const selectFormBeneficiariesByEntity = (state: {
  form: FormTemplatesState;
}) => state.form.byEntityBeneficiaries;
export const selectFormBeneficiariesByEntityLoading = (state: {
  form: FormTemplatesState;
}) => state.form.byEntityBeneficiariesLoading;
export const selectFormBeneficiariesByEntityError = (state: {
  form: FormTemplatesState;
}) => state.form.byEntityBeneficiariesError;
export const selectFormBeneficiariesByEntityPagination = (state: {
  form: FormTemplatesState;
}) => ({
  page: state.form.byEntityPage,
  limit: state.form.byEntityLimit,
  totalItems: state.form.byEntityTotalItems,
  totalPages: state.form.byEntityTotalPages,
});
export const selectResponses = (state: { form: FormTemplatesState }) =>
  state.form.responses;
export const selectResponsesLoading = (state: { form: FormTemplatesState }) =>
  state.form.responsesLoading;
export const selectResponsesError = (state: { form: FormTemplatesState }) =>
  state.form.responsesError;
export const selectResponsesPagination = (state: {
  form: FormTemplatesState;
}) => state.form.responsesPagination;

export default formSlice.reducer;
