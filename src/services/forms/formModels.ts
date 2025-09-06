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
  required: boolean;
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
  id: string;
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
