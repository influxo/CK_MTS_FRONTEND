// Beneficiary domain models and API contracts

export interface CreateBeneficiaryRequest {
  firstName: string;
  lastName: string;
  dob: string; // ISO date (YYYY-MM-DD)
  nationalId: string;
  phone: string;
  email: string;
  address: string;
  gender: string;
  municipality: string;
  nationality: string;
  status: string; // e.g., "active"
  // Optional medical and additional details
  details?: BeneficiaryDetails;
}

// Extended medical and additional details for a beneficiary
export interface BeneficiaryDetails {
  allergies: string[];
  disabilities: string[];
  chronicConditions: string[];
  medications: string[];
  bloodType: string;
  notes?: string;
}

export interface Beneficiary {
  id: string;
  pseudonym: string;
  status: string;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  // Present on create/get when available
  details?: BeneficiaryDetails;
}

export interface CreateBeneficiaryResponse {
  success: boolean;
  data?: Beneficiary;
  message?: string;
}

// List beneficiaries (GET /beneficiaries)
export interface GetBeneficiariesRequest {
  page?: number;
  limit?: number;
  status?: "active" | "inactive";
}

// List beneficiaries filtered by an entity (GET /beneficiaries/by-entity)
export interface GetBeneficiariesByEntityRequest {
  entityId: string; // required
  entityType: string; // required (e.g., "project" | "subproject" | "activity")
  status?: "active" | "inactive";
  page?: number;
  limit?: number;
}

export interface BeneficiaryPIIEncField {
  iv: string;
  alg: string;
  tag: string;
  data: string;
}

export interface BeneficiaryPIIEnc {
  firstNameEnc: BeneficiaryPIIEncField;
  lastNameEnc: BeneficiaryPIIEncField;
  dobEnc: BeneficiaryPIIEncField;
  nationalIdEnc: BeneficiaryPIIEncField;
  phoneEnc: BeneficiaryPIIEncField;
  emailEnc: BeneficiaryPIIEncField;
  addressEnc: BeneficiaryPIIEncField;
  genderEnc: BeneficiaryPIIEncField;
  municipalityEnc: BeneficiaryPIIEncField;
  nationalityEnc: BeneficiaryPIIEncField;
}

export interface BeneficiaryPII {
  firstName: string;
  lastName: string;
  dob: string;
  nationalId: string;
  phone: string;
  email: string;
  address: string;
  gender: string;
  municipality: string;
  nationality: string;
}

export interface BeneficiaryListItem extends Beneficiary {
  piiEnc?: BeneficiaryPIIEnc;
  pii?: BeneficiaryPII;
}

export interface GetBeneficiariesResponse {
  success: boolean;
  items: BeneficiaryListItem[];
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  message?: string;
}

// Response for by-entity list uses the same paging envelope
export type GetBeneficiariesByEntityResponse = GetBeneficiariesResponse;

// Get beneficiary by ID (GET /beneficiaries/{id})
export interface GetBeneficiaryByIdResponse {
  success: boolean;
  data?: BeneficiaryListItem;
  message?: string;
}

// Update beneficiary by ID (PUT /beneficiaries/{id})
export type UpdateBeneficiaryRequest = CreateBeneficiaryRequest;

export interface UpdateBeneficiaryResponse {
  success: boolean;
  data?: Beneficiary; // API returns core fields without PII for update
  message?: string;
}

// Delete beneficiary by ID (DELETE /beneficiaries/{id})
export interface DeleteBeneficiaryResponse {
  success: boolean;
  data?: Beneficiary; // API may return the affected record (e.g., set to inactive)
  message?: string;
}

// Get decrypted PII for a beneficiary (GET /beneficiaries/{id}/pii)
export interface GetBeneficiaryPIIByIdResponse {
  success: boolean;
  data?: {
    id: string;
    pseudonym: string;
    status: string;
    pii: BeneficiaryPII;
  };
  message?: string;
}

// Get beneficiary services (GET /beneficiaries/{id}/services)
export interface GetBeneficiaryServicesRequest {
  id: string;
  page?: number;
  limit?: number;
  fromDate?: string; // ISO date string
  toDate?: string; // ISO date string
}

export interface BeneficiaryServiceItem {
  id: string;
  service: {
    id: string;
    name: string;
    category: string;
  };
  deliveredAt: string; // ISO datetime
  staff: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  notes?: string;
  entity: {
    id: string;
    name: string;
    type: string;
    subprojectId?: string;
  };
  formResponseId?: string;
}

export interface GetBeneficiaryServicesResponse {
  success: boolean;
  data: BeneficiaryServiceItem[];
  meta: {
    page: number;
    limit: number;
    totalPages: number;
    totalItems: number;
  };
  message?: string;
}

// Get beneficiary linked entities (GET /beneficiaries/{id}/entities)
export interface GetBeneficiaryEntitiesRequest {
  id: string;
}

export interface BeneficiaryEntityRef {
  id: string;
  type: string; // e.g., "project" | "subproject" | "activity"
  name: string;
}

export interface BeneficiaryFormResponseLite {
  id: string;
  formTemplateId: string;
  submittedAt: string; // ISO datetime
}

export interface BeneficiaryEntityLinkItem {
  entity: BeneficiaryEntityRef;
  formResponses: BeneficiaryFormResponseLite[];
  services: BeneficiaryServiceItem[];
}

export interface GetBeneficiaryEntitiesResponse {
  success: boolean;
  data: BeneficiaryEntityLinkItem[];
  message?: string;
}

// Associate beneficiary to entities (POST /beneficiaries/{id}/entities)
export interface BeneficiaryEntityAssociationItem {
  entityId: string;
  entityType: string; // "project" | "subproject" | other entity types
}

export interface AssociateBeneficiaryToEntitiesRequest {
  id: string; // beneficiary id (path param)
  links: BeneficiaryEntityAssociationItem[]; // request body array
}

export interface AssociateBeneficiaryToEntitiesResponse {
  success: boolean;
  data?: {
    created: number;
    existing: number;
    results: Array<{
      entityId: string;
      entityType: string;
      created: boolean;
      id: string; // association/link id
    }>;
  };
  message?: string;
}

// Service deliveries summary metrics (GET /services/metrics/deliveries/summary)
// We only implement the beneficiaryId query for now
export interface GetServiceDeliveriesSummaryRequest {
  beneficiaryId?: string;
}

export interface ServiceDeliveriesSummaryData {
  totalDeliveries: number;
  uniqueBeneficiaries: number;
  uniqueStaff: number;
  uniqueServices: number;
}

export interface GetServiceDeliveriesSummaryResponse {
  success: boolean;
  data?: ServiceDeliveriesSummaryData;
  message?: string;
}
