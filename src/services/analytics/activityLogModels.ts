export type AuditLogItem = {
  id: string;
  userId: string;
  action: string;
  description: string;
  details?: string | null;
  timestamp: string;
  userDisplayName?: string;
};

export type AuditLogListResponse = {
  success: boolean;
  data: {
    items: AuditLogItem[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
};
