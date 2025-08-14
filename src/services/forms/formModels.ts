export interface GetFormTemplatesRequest {
  projectId?: string; // uuid string
  subprojectId?: string; // uuid string
  activityId?: string; // uuid string
  entityType?: string; // example: "project" | "subproject" | "activity"
  page?: number;
  limit?: number;
}

// Pagination model used in list responses
export interface Pagination {
  page: number;
  limit: number;
  totalPages: number;
  totalCount: number;
}

// Form field definition inside a template schema
export interface FormField {
  name: string;
  type: string; // e.g., "Text", "Dropdown"
  label: string;
  required?: boolean;
  options?: string[]; // present only for fields like Dropdown; optional
}

// Schema wrapper for a form template
export interface FormTemplateSchema {
  fields: FormField[];
}

// Entity association for a form template
export interface EntityAssociation {
  id: string;
  formTemplateId: string;
  entityId: string;
  entityType: string; // e.g., "project" | "subproject" | "activity"
  createdAt: string;
  updatedAt: string;
}

// Form Template model
export interface FormTemplate {
  id?: string;
  name: string;
  schema: FormTemplateSchema;
  version: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  programId: string | null;
  entityAssociations: EntityAssociation[];
}

// Get Form Templates response
export interface GetFormTemplatesResponse {
  success: boolean;
  message?: string;
  data: {
    templates: FormTemplate[];
    pagination: Pagination;
  };
}

// Get single Form Template by id response
export interface GetFormTemplateByIdResponse {
  success: boolean;
  message?: string;
  data: FormTemplate;
}

// Request for submitting a form
export interface FormSubmissionRequest {
  /**
   * UUID of the form template (provided as a path param in the API)
   */
  // id: string; // This is in the path, not in the request body

  /**
   * UUID of the entity (project, subproject, or activity) this submission belongs to
   */
  entityId: string;

  /**
   * The entity type this form is associated with
   * Example: "project" | "subproject" | "activity"
   */
  entityType: string;

  /**
   * Dynamic form field values
   * Keys come from FormField.name in the template
   */
  data: Record<string, any>;

  /**
   * GPS coordinates where the form was submitted
   */
  latitude: number;
  longitude: number;
}

// Data returned when a form is successfully submitted
export interface FormSubmissionData {
  createdAt: string;
  updatedAt: string;
  id: string;
  formTemplateId: string;
  entityId: string;
  entityType: string;
  submittedBy: string;
  data: Record<string, any>;
  latitude: string; // API returns these as strings
  longitude: string;
  submittedAt: string;
}

// API response for a form submission
export interface FormSubmissionResponse {
  success: boolean;
  message: string;
  data: FormSubmissionData;
}
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
  id: string;
  name: string;
  description: string;
  category: string;
  status: string;
  version: number;
  fields: FormField[];
  lastUpdated?: string;
  createdBy?: string;
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
export interface DeleteFormResponse extends ApiResponse<{ id: string }> {}
