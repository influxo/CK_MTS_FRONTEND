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

export interface EntityReference {
  id: string;
  entityType: string;
  formTemplateId: string;
  entityId: string;
}

export interface FormFieldForTemplate {
  name: string;
  label: string;
  type: string;
  placeholder?: string;
  helpText?: string;
  validations?: {
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
  };
  required: boolean;
  options?: string[];
}

export interface FormSchema {
  fields: FormFieldForTemplate[];
}

export interface FormTemplate {
  id: string;
  name: string;
  description?: string;
  category?: string;
  status?: string;
  version?: string;
  entityAssociations: EntityReference[];
  schema: FormSchema;
  updatedAt?: string;
  createdAt?: string;
}

export interface FormTemplatePagination {
  page: number;
  limit: number;
  totalPages: number;
  totalCount: number;
}

export interface FormTemplateAndPagination {
  templates: FormTemplate[];
  pagination: FormTemplatePagination;
}


// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  // data?: T;
  data?: any;
}

export interface GetFormsResponse extends ApiResponse<FormTemplate[]> {}
export interface GetFormResponse extends ApiResponse<FormTemplate> {}
export interface CreateFormRequest extends Omit<FormTemplate, 'id' | 'lastUpdated' | 'createdBy'> {}
export interface CreateFormResponse extends ApiResponse<FormTemplate> {}
export interface UpdateFormRequest extends Omit<FormTemplate, 'lastUpdated' | 'createdBy'> {}
export interface UpdateFormResponse extends ApiResponse<FormTemplate> {}
export interface UpdateFormToInactiveResponse extends ApiResponse<FormTemplate> {}
export interface DeleteFormResponse extends ApiResponse<{ id: string }> {}