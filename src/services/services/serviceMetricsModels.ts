export type TimeUnit = "day" | "week" | "month" | "quarter" | "year";
export type GroupField = "service" | "user" | "beneficiary";
export type GroupedByKey = "serviceId" | "staffUserId" | "beneficiaryId" | null;
export type MetricType = "submissions" | "serviceDeliveries" | "uniqueBeneficiaries";

export interface DeliveriesFilters {
  serviceId?: string;
  serviceIds?: string[];
  staffUserId?: string;
  beneficiaryId?: string;
  entityId?: string;
  entityType?: "project" | "subproject" | "activity";
  formResponseId?: string;
  formTemplateId?: string;
  formTemplateIds?: string[];
  startDate?: string; // ISO date
  endDate?: string; // ISO date
}

export interface DeliveriesSeriesParams extends DeliveriesFilters {
  groupBy?: TimeUnit;
  groupField?: GroupField;
  metric?: MetricType;
}

export interface DeliveriesSummaryData {
  totalDeliveries: number;
  uniqueBeneficiaries: number;
  uniqueStaff: number;
  uniqueServices: number;
}

export interface DeliveriesSummaryResponse {
  success: boolean;
  message?: string;
  data: DeliveriesSummaryData;
}

export interface DeliveriesSeriesItem {
  periodStart: string; // ISO string
  count: number;
  serviceId?: string;
  staffUserId?: string;
  beneficiaryId?: string;
}

// Optional extra data some APIs may return alongside the series
export interface MostFrequentService {
  serviceId: string;
  name: string;
  count: number;
}

export interface DeliveriesSeriesResponse {
  success: boolean;
  message?: string;
  items: DeliveriesSeriesItem[];
  granularity: TimeUnit;
  groupedBy: GroupedByKey;
  // Optional extras if provided by the API
  summary?: {
    totalSubmissions?: number;
    totalServiceDeliveries?: number;
    totalUniqueBeneficiaries?: number;
  };
  mostFrequentServices?: MostFrequentService[];
}
