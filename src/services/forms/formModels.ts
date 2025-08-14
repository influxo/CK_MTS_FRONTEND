export interface FormFieldOption {
  value: string;
  label: string;
}

export interface FormField {
  id: string;
  type: string;
  label: string;
  required?: boolean;
  placeholder?: string;
  helpText?: string;
  options?: FormFieldOption[];
  validations?: {
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
  };
}

export interface FormTemplate {
  id?: string;
  name: string;
  description: string;
  category: string;
  status: string;
  version: string;
  fields: FormField[];
  lastUpdated?: string;
  createdBy?: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface GetFormsResponse extends ApiResponse<FormTemplate[]> {}
export interface GetFormResponse extends ApiResponse<FormTemplate> {}
export interface CreateFormRequest extends Omit<FormTemplate, 'id' | 'lastUpdated' | 'createdBy'> {}
export interface CreateFormResponse extends ApiResponse<FormTemplate> {}
export interface UpdateFormRequest extends Omit<FormTemplate, 'lastUpdated' | 'createdBy'> {}
export interface UpdateFormResponse extends ApiResponse<FormTemplate> {}
export interface DeleteFormResponse extends ApiResponse<{ id: string }> {}
