import axiosInstance from '../axiosInstance';
import type { ActivitySummaryResponse } from './activitySummaryModels';

export async function fetchActivitySummary(params?: {
  startDate?: string;
  endDate?: string;
}): Promise<ActivitySummaryResponse> {
  const searchParams = new URLSearchParams();
  if (params?.startDate) searchParams.set('startDate', params.startDate);
  if (params?.endDate) searchParams.set('endDate', params.endDate);
  const query = searchParams.toString();
  const url = `/dashboard/activity-summary${query ? `?${query}` : ''}`;
  const { data } = await axiosInstance.get<ActivitySummaryResponse>(url);
  return data;
}
