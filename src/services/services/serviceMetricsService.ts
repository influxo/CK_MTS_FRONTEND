import axiosInstance from "../axiosInstance";
import getApiUrl from "../apiUrl";
import type {
  DeliveriesFilters,
  DeliveriesSeriesParams,
  DeliveriesSeriesResponse,
  DeliveriesSummaryResponse,
} from "./serviceMetricsModels";

class ServiceMetricsService {
  private baseUrl = getApiUrl();
  private formsEndpoint = `${this.baseUrl}/forms`;
  private servicesEndpoint = `${this.baseUrl}/services`;

  async getDeliveriesSummary(
    params: DeliveriesFilters = {}
  ): Promise<DeliveriesSummaryResponse> {
    try {
      // Map params
      const mapped: any = {
        // entity filters
        entityId: params.entityId,
        entityType: params.entityType,
        // date range
        fromDate: params.startDate,
        toDate: params.endDate,
        // service filter(s)
        serviceId: params.serviceId,
        serviceIds: params.serviceIds,
        // beneficiary filter
        beneficiaryId: params.beneficiaryId,
        // staff filter
        staffUserId: params.staffUserId,
      };

      // Use services metrics endpoint when filtering by staff (field operator view)
      const endpoint = params.staffUserId
        ? `${this.servicesEndpoint}/metrics/deliveries/summary`
        : `${this.formsEndpoint}/metrics/summary`;

      const response = await axiosInstance.get(endpoint, { params: mapped });

      const dyn = response.data as {
        success: boolean;
        data?: any;
        message?: string;
      };
      if (!dyn.success) {
        return {
          success: false,
          message: dyn.message || "Failed to fetch metrics summary",
          data: {
            totalDeliveries: 0,
            uniqueBeneficiaries: 0,
            uniqueStaff: 0,
            uniqueServices: 0,
          },
        };
      }

      const d = dyn.data || {};
      // Adapt response. Prefer direct fields if available from /services endpoint
      const totalDeliveries =
        d.totalDeliveries ?? d.serviceDeliveries ?? d.total ?? 0;
      const uniqueBeneficiaries =
        d.uniqueBeneficiaries ?? d.uniqueBeneficiariesByDeliveries ?? 0;
      const uniqueStaff = d.uniqueStaff ?? d.staffCount ?? 0;
      const uniqueServices = d.uniqueServices ?? d.servicesUsed ?? 0;

      return {
        success: true,
        data: {
          totalDeliveries: Number(totalDeliveries || 0),
          uniqueBeneficiaries: Number(uniqueBeneficiaries || 0),
          uniqueStaff: Number(uniqueStaff || 0),
          uniqueServices: Number(uniqueServices || 0),
        },
      };
    } catch (error: any) {
      if (error?.response) {
        return error.response.data as DeliveriesSummaryResponse;
      }
      return {
        success: false,
        message: error?.message || "Failed to fetch deliveries summary",
        data: {
          totalDeliveries: 0,
          uniqueBeneficiaries: 0,
          uniqueStaff: 0,
          uniqueServices: 0,
        },
      };
    }
  }

  async getDeliveriesSeries(
    params: DeliveriesSeriesParams = {}
  ): Promise<DeliveriesSeriesResponse> {
    try {
      // Decide which endpoint to use
      const useServices = !!params.staffUserId;

      // Map to API params
      const mapped: any = {
        metric: (params as any).metric || (useServices ? "serviceDeliveries" : "submissions"),
        groupBy: params.groupBy,
        // Some APIs expect 'granularity' instead of 'groupBy'
        granularity: params.groupBy,
        entityId: params.entityId,
        entityType: params.entityType,
        fromDate: params.startDate,
        toDate: params.endDate,
        serviceId: params.serviceId,
        serviceIds: params.serviceIds,
        beneficiaryId: params.beneficiaryId,
        formTemplateId: params.formTemplateId,
        formTemplateIds: params.formTemplateIds,
        staffUserId: params.staffUserId,
      };

      // Use services metrics endpoint when filtering by staff
      const endpoint = useServices
        ? `${this.servicesEndpoint}/metrics/deliveries/series`
        : `${this.formsEndpoint}/metrics/series`;

      const response = await axiosInstance.get(endpoint, { params: mapped });

      const dyn = response.data as {
        success: boolean;
        // Some endpoints wrap in data, others return fields at top-level
        data?: {
          metric?: string;
          granularity?: any;
          series?: Array<{ periodStart: string; value: number }>;
          items?: Array<{ periodStart?: string; timestamp?: string; value?: number; count?: number }>;
          summary?: any;
          mostFrequentServices?: Array<{ serviceId: string; name: string; count: number }>;
        };
        // Top-level fallbacks
        items?: Array<{ periodStart?: string; timestamp?: string; value?: number; count?: number }>;
        granularity?: any;
        summary?: any;
        mostFrequentServices?: Array<{ serviceId: string; name: string; count: number }>;
        message?: string;
      };
      if (!dyn.success || (!dyn.data && !dyn.items)) {
        return {
          success: false,
          message: dyn.message || "Failed to fetch deliveries series",
          items: [],
          granularity: (params.groupBy as any) || "month",
          groupedBy: null,
        };
      }

      // Adapt dynamic series -> deliveries series model
      const dataNode: any = (dyn as any).data || {};
      const itemsNode: any =
        (dataNode && dataNode.items !== undefined ? dataNode.items : undefined) ??
        (dyn as any).items;

      let rawSeries: any[] = [];
      if (Array.isArray(itemsNode)) {
        rawSeries = itemsNode as any[];
      } else if (itemsNode && typeof itemsNode === "object") {
        rawSeries = (itemsNode.series || itemsNode.items || []) as any[];
      } else {
        rawSeries = (dataNode.series || dataNode.items || []) as any[];
      }

      const items = (rawSeries || []).map((s) => ({
        periodStart:
          typeof s.periodStart === "string"
            ? s.periodStart
            : typeof s.timestamp === "string"
            ? s.timestamp
            : new Date((s.periodStart || s.timestamp) as any).toISOString(),
        count: Number((s.value ?? s.count) || 0),
      }));

      // Extract optional extras
      const summary =
        (dataNode && dataNode.summary) ||
        (itemsNode && typeof itemsNode === "object" && itemsNode.summary) ||
        (dyn as any).summary;
      const mostFrequentServices =
        (dataNode && dataNode.mostFrequentServices) ||
        (itemsNode && typeof itemsNode === "object" && itemsNode.mostFrequentServices) ||
        (summary && (summary as any).mostFrequentServices) ||
        (dyn as any).mostFrequentServices;

      return {
        success: true,
        items,
        granularity:
          (dyn.data && (dyn.data as any).granularity) ||
          (dyn as any).granularity ||
          (params.groupBy as any) ||
          "month",
        groupedBy: null,
        summary,
        mostFrequentServices,
      };
    } catch (error: any) {
      if (error?.response) {
        return error.response.data as DeliveriesSeriesResponse;
      }
      return {
        success: false,
        message: error?.message || "Failed to fetch deliveries series",
        items: [],
        granularity: (params.groupBy as any) || "month",
        groupedBy: null,
      };
    }
  }
}

const serviceMetricsService = new ServiceMetricsService();
export default serviceMetricsService;
