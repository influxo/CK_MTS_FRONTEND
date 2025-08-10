import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type {
  FormTemplate,
  Pagination,
  GetFormTemplatesRequest,
  GetFormTemplatesResponse,
} from "../../services/forms/formModels";
import formService from "../../services/forms/formServices";

interface FormTemplatesState {
  templates: FormTemplate[];
  pagination: Pagination | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: FormTemplatesState = {
  templates: [],
  pagination: null,
  isLoading: false,
  error: null,
};

export const fetchFormTemplates = createAsyncThunk<
  GetFormTemplatesResponse,
  GetFormTemplatesRequest,
  { rejectValue: string }
>("forms/fetchFormTemplates", async (params, { rejectWithValue }) => {
  const response = await formService.getFormTemplates(params);
  if (!response.success) {
    return rejectWithValue(
      response.message || "Failed to fetch form templates"
    );
  }
  return response;
});

const formSlice = createSlice({
  name: "forms",
  initialState,
  reducers: {
    clearFormErrors(state) {
      state.error = null;
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
      });
  },
});

export const { clearFormErrors } = formSlice.actions;

export const selectFormTemplates = (state: { forms: FormTemplatesState }) =>
  state.forms.templates;
export const selectFormTemplatesLoading = (state: {
  forms: FormTemplatesState;
}) => state.forms.isLoading;
export const selectFormTemplatesError = (state: {
  forms: FormTemplatesState;
}) => state.forms.error;
export const selectFormTemplatesPagination = (state: {
  forms: FormTemplatesState;
}) => state.forms.pagination;

export default formSlice.reducer;
