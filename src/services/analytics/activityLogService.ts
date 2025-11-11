import axiosInstance from '../axiosInstance';
import type { AuditLogListResponse } from './activityLogModels';

export async function fetchAuditLogs(params?: {
  page?: number;
  limit?: number;
  userId?: string;
  action?: string;
  startDate?: string;
  endDate?: string;
}): Promise<AuditLogListResponse> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set('page', String(params.page));
  if (params?.limit) searchParams.set('limit', String(params.limit));
  if (params?.userId) searchParams.set('userId', params.userId);
  if (params?.action) searchParams.set('action', params.action);
  if (params?.startDate) searchParams.set('startDate', params.startDate);
  if (params?.endDate) searchParams.set('endDate', params.endDate);

  const query = searchParams.toString();
  const url = `/audit-logs${query ? `?${query}` : ''}`;
  const { data } = await axiosInstance.get<AuditLogListResponse>(url);
  return data;
}
