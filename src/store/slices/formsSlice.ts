import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type {
  FormTemplate,
  GetFormsResponse,
  CreateFormRequest,
  CreateFormResponse,
  UpdateFormRequest,
  UpdateFormResponse,
  DeleteFormResponse,
  FormTemplateAndPagination,
  UpdateFormToInactiveResponse,
} from "../../services/forms/formModels";
import formService from "../../services/forms/formService";

interface FormsState {
  forms: FormTemplateAndPagination;
  currentForm: FormTemplate | null;
  isLoading: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: FormsState = {
  forms: {
    templates: [],
    pagination: { page: 0, limit: 0, totalPages: 0, totalCount: 0 },
  },
  currentForm: null,
  isLoading: false,
  error: null,
  successMessage: null,
};

export const fetchForms = createAsyncThunk<
  GetFormsResponse,
  void,
  { rejectValue: string }
>("forms/templates", async (_, { rejectWithValue }) => {
  const response = await formService.getForms();
  if (!response.success) {
    return rejectWithValue(response.message || "Failed to fetch forms");
  }
  return response;
});

export const fetchFormById = createAsyncThunk<
  FormTemplate,
  string,
  { rejectValue: string }
>("forms/templates/fetchFormById", async (formId, { rejectWithValue }) => {
  const response = await formService.getFormById(formId);
  if (!response.success || !response.data) {
    return rejectWithValue(
      response.message || `Failed to fetch form with ID: ${formId}`
    );
  }
  return response.data;
});

export const createForm = createAsyncThunk<
  CreateFormResponse,
  CreateFormRequest,
  { rejectValue: string }
>("forms/createTemplate", async (formData, { rejectWithValue }) => {
  const response = await formService.createForm(formData);
  if (!response.success) {
    return rejectWithValue(response.message || "Failed to create form");
  }
  return response;
});

export const updateForm = createAsyncThunk<
  UpdateFormResponse,
  { formId: string; formData: UpdateFormRequest },
  { rejectValue: string }
>("forms/updateForm", async ({ formId, formData }, { rejectWithValue }) => {
  const response = await formService.updateForm(formId, formData);
  if (!response.success) {
    return rejectWithValue(
      response.message || `Failed to update form with ID: ${formId}`
    );
  }
  return response;
});

export const updateFormToInactive = createAsyncThunk<
  UpdateFormToInactiveResponse,
  { formId: string },
  { rejectValue: string }
>("forms/updateFormToInactive", async ({ formId }, { rejectWithValue }) => {
  const response = await formService.updateFormToInactive(formId);
  if (!response.success) {
    return rejectWithValue(
      response.message || `Failed to update form with ID: ${formId}`
    );
  }
  return response;
});

export const deleteForm = createAsyncThunk<
  DeleteFormResponse,
  string,
  { rejectValue: string }
>("forms/deleteForm", async (formId, { rejectWithValue }) => {
  const response = await formService.deleteForm(formId);
  if (!response.success) {
    return rejectWithValue(
      response.message || `Failed to delete form with ID: ${formId}`
    );
  }
  return response;
});

const formsSlice = createSlice({
  name: "forms",
  initialState,
  reducers: {
    clearFormMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
    setCurrentForm: (state, action) => {
      state.currentForm = action.payload;
    },
    clearCurrentForm: (state) => {
      state.currentForm = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchForms
      .addCase(fetchForms.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchForms.fulfilled, (state, action) => {
        state.isLoading = false;
        state.forms = action.payload.data || [];
      })
      .addCase(fetchForms.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to fetch forms";
      })

      // fetchFormById
      .addCase(fetchFormById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFormById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentForm = action.payload;
      })
      .addCase(fetchFormById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to fetch form";
      })

      // createForm
      .addCase(createForm.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(createForm.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.data) {
          // state.forms.push(action.payload.data);
          // state.successMessage = 'Form created successfully';
        }
      })
      .addCase(createForm.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to create form";
      })

      // updateForm
      .addCase(updateForm.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(updateForm.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.data) {
          // const index = state.forms.findIndex(form => form.id === action.payload.data?.id);
          // if (index !== -1) {
          //   state.forms[index] = action.payload.data;
          // }
          state.currentForm = action.payload.data;
          state.successMessage = "Form updated successfully";
        }
      })
      .addCase(updateForm.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to update form";
      })

      // updateFormToInactive
      .addCase(updateFormToInactive.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.data) {
          state.currentForm = action.payload.data;
          state.successMessage = "Form updated successfully";
        }
      })
      .addCase(updateFormToInactive.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(updateFormToInactive.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to update form to inactive";
      })

      // deleteForm
      .addCase(deleteForm.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(deleteForm.fulfilled, (state, action) => {
        state.isLoading = false;
        // state.forms = state.forms.filter(form => form.id !== action.meta.arg);
        // if (state.currentForm?.id === action.meta.arg) {
        //   state.currentForm = null;
        // }
        state.successMessage = "Form deleted successfully";
      })
      .addCase(deleteForm.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to delete form";
      });
  },
});

export const { clearFormMessages, setCurrentForm, clearCurrentForm } =
  formsSlice.actions;
export const selectAllForms = (state: { forms: FormsState }) =>
  state.forms.forms;
export const selectCurrentForm = (state: { forms: FormsState }) =>
  state.forms.currentForm;
export const selectFormsLoading = (state: { forms: FormsState }) =>
  state.forms.isLoading;
export const selectFormsError = (state: { forms: FormsState }) =>
  state.forms.error;
export const selectFormsSuccessMessage = (state: { forms: FormsState }) =>
  state.forms.successMessage;

export default formsSlice.reducer;
