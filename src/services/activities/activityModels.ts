// Activity domain models and API contracts

export interface Activity {
  id: string;
  name: string;
  description: string;
  category: string;
  frequency: string; // e.g., "monthly"
  reportingFields: Record<string, string>; // e.g., { beneficiaries: "number", location: "text" }
  subprojectId: string;
  status: string; // e.g., "active"
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

export interface CreateSubprojectActivityRequest {
  name: string;
  description: string;
  category: string;
  frequency: string;
  reportingFields: Record<string, string>;
  status: string;
  subprojectId: string;
}

export interface CreateActivityResponse {
  success: boolean;
  message: string;
  data?: Activity;
}

export interface GetSubprojectActivitiesResponse {
  success: boolean;
  data: Activity[];
  message?: string;
}

export interface GetActivityByIdResponse {
  success: boolean;
  data: Activity;
  message?: string;
}
