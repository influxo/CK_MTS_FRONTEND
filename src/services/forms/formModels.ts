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

export interface GetFormTemplatesResponse {
  success: boolean;
  message?: string;
  data: {
    templates: FormTemplate[];
    pagination: Pagination;
  };
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

export interface EntityReference {
  id: string;
  entityType: string;
  formTemplateId: string;
  entityId: string;
  entityName?: string;
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
  programId: string;
  description?: string;
  category?: string;
  status?: string;
  version?: string;
  entityAssociations: EntityReference[];
  schema: FormSchema;
  updatedAt?: string;
  createdAt?: string;
  deletedAt?: string;
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

// Minimal user info (submitter or staff)
export interface MinimalUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

// Template summary inside a response
export interface TemplateSummary {
  id: string;
  name: string;
  version: number;
}

// Beneficiary summary inside a response
export interface BeneficiarySummary {
  id: string;
  pseudonym: string;
  status: string;
}

// Service summary for deliveries
export interface ServiceSummary {
  id: string;
  name: string;
  category: string;
}

// Service delivery record linked to a form response
export interface ServiceDelivery {
  id: string;
  serviceId: string;
  deliveredAt: string;
  staffUserId: string;
  notes: string | null;
  entityId: string;
  entityType: string; // e.g., "project" | "subproject" | "activity"
  service: ServiceSummary;
  staff: MinimalUser;
}

// Single form response payload
export interface FormResponseData {
  id: string;
  formTemplateId: string;
  entityId: string;
  entityType: string;
  submittedBy: string;
  beneficiaryId: string | null;
  data: Record<string, any>; // dynamic fields per template
  latitude: string | null;
  longitude: string | null;
  submittedAt: string;
  createdAt: string;
  updatedAt: string;
  template: TemplateSummary;
  submitter: MinimalUser;
  beneficiary: BeneficiarySummary | null;
  serviceDeliveries: ServiceDelivery[];
}

// API response for fetching a form response by id
export interface GetFormResponseByIdResponse {
  success: boolean;
  message?: string;
  data: FormResponseData;
}

// List form responses by entity (project, subproject, activity)
export interface GetFormResponsesByEntityRequest {
  entityId: string;
  entityType: "project" | "subproject" | "activity";
  templateId?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  limit?: number;
}

export interface GetFormResponsesByEntityResponse {
  success: boolean;
  message?: string;
  data: {
    items: FormResponseData[];
    pagination: Pagination;
  };
}

// Global list of form responses (no required entity)
export interface GetAllFormResponsesRequest {
  templateId?: string;
  entityId?: string;
  entityType?: "project" | "subproject" | "activity";
  fromDate?: string;
  toDate?: string;
  page?: number;
  limit?: number;
}

export interface GetAllFormResponsesResponse {
  success: boolean;
  message?: string;
  data: {
    items: FormResponseData[];
    pagination: Pagination;
  };
}

export interface GetFormsResponse extends ApiResponse<FormTemplate[]> {}
export interface GetFormResponse extends ApiResponse<FormTemplate> {}
export interface CreateFormRequest
  extends Omit<FormTemplate, "id" | "lastUpdated" | "createdBy"> {}
export interface CreateFormResponse extends ApiResponse<FormTemplate> {}
export interface UpdateFormRequest
  extends Omit<FormTemplate, "lastUpdated" | "createdBy"> {}
export interface UpdateFormResponse extends ApiResponse<FormTemplate> {}
export interface UpdateFormToInactiveResponse
  extends ApiResponse<FormTemplate> {}
export interface DeleteFormResponse extends ApiResponse<{ id: string }> {}
