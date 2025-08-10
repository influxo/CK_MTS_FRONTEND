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

 
