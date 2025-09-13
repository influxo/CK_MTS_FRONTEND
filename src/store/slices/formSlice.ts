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
} from "../../services/forms/formModels";
import formService from "../../services/forms/formServices";

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

export default formSlice.reducer;
