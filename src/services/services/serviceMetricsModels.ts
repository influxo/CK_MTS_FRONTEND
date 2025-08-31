export type TimeUnit = 'day' | 'week' | 'month' | 'quarter' | 'year';
export type GroupField = 'service' | 'user' | 'beneficiary';
export type GroupedByKey = 'serviceId' | 'staffUserId' | 'beneficiaryId' | null;

export interface DeliveriesFilters {
  serviceId?: string;
  serviceIds?: string[];
  staffUserId?: string;
  beneficiaryId?: string;
  entityId?: string;
  entityType?: 'project' | 'subproject' | 'activity';
  formResponseId?: string;
  startDate?: string; // ISO date
  endDate?: string;   // ISO date
}

export interface DeliveriesSeriesParams extends DeliveriesFilters {
  groupBy?: TimeUnit;
  groupField?: GroupField;
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

export interface DeliveriesSeriesResponse {
  success: boolean;
  message?: string;
  items: DeliveriesSeriesItem[];
  granularity: TimeUnit;
  groupedBy: GroupedByKey;
}
