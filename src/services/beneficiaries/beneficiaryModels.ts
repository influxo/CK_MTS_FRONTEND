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
}

export interface Beneficiary {
  id: string;
  pseudonym: string;
  status: string;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
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
