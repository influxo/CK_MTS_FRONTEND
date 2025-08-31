export interface KpiDefinition {
  id: string;
  name: string;
  description?: string;
  calculationType: 'COUNT' | 'SUM' | 'AVERAGE' | 'MIN' | 'MAX' | 'PERCENTAGE' | 'CUSTOM';
  fieldId: string;
  aggregationType: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY' | 'ALL_TIME';
  filterCriteria?: any;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface KpiCalculateParams {
  fromDate?: string; // ISO
  toDate?: string;   // ISO
  entityId?: string;
  entityType?: 'project' | 'subproject' | 'activity';
  projectId?: string;
  subprojectId?: string;
  activityId?: string;
}

export interface KpiValueResult {
  value: number;
  unit?: string | null;
}

// Matches backend calculate response data
export interface KpiCalculation {
  kpiId: string;
  name: string;
  description?: string;
  result: number;
  fieldName?: string;
  calculationType: 'COUNT' | 'SUM' | 'AVERAGE' | 'MIN' | 'MAX' | 'PERCENTAGE' | 'CUSTOM';
  aggregationType: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY' | 'ALL_TIME';
  timestamp: string; // ISO
}

export type TimeUnit = 'day' | 'week' | 'month' | 'quarter' | 'year';

export interface KpiSeriesPoint {
  periodStart: string; // ISO
  value: number;
}

export interface KpiSeriesParams extends KpiCalculateParams {
  groupBy?: TimeUnit;
  dataFilters?: Array<{ field: string; op: string; value: any }>;
}
