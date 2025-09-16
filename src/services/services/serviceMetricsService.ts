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

  async getDeliveriesSummary(
    params: DeliveriesFilters = {}
  ): Promise<DeliveriesSummaryResponse> {
    try {
      // Map legacy params to new dynamic metrics filters
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
      };

      const response = await axiosInstance.get(
        `${this.formsEndpoint}/metrics/summary`,
        { params: mapped }
      );

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
      // Adapt dynamic summary -> deliveries summary model
      return {
        success: true,
        data: {
          totalDeliveries: Number(d.serviceDeliveries || 0),
          uniqueBeneficiaries: Number(d.uniqueBeneficiariesByDeliveries || 0),
          uniqueStaff: 0, // not provided by dynamic summary (can be added later)
          uniqueServices: Number(d.servicesUsed || 0),
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
      // Map to new dynamic series API (metric=submissions)
      const mapped: any = {
        metric: (params as any).metric || "submissions",
        groupBy: params.groupBy,
        entityId: params.entityId,
        entityType: params.entityType,
        fromDate: params.startDate,
        toDate: params.endDate,
        serviceId: params.serviceId,
        serviceIds: params.serviceIds,
        beneficiaryId: params.beneficiaryId,
        formTemplateId: params.formTemplateId,
        formTemplateIds: params.formTemplateIds,
      };

      const response = await axiosInstance.get(
        `${this.formsEndpoint}/metrics/series`,
        { params: mapped }
      );

      const dyn = response.data as {
        success: boolean;
        data?: {
          metric: string;
          granularity: any;
          series: Array<{ periodStart: string; value: number }>;
        };
        message?: string;
      };
      if (!dyn.success || !dyn.data) {
        return {
          success: false,
          message: dyn.message || "Failed to fetch deliveries series",
          items: [],
          granularity: (params.groupBy as any) || "month",
          groupedBy: null,
        };
      }

      // Adapt dynamic series -> deliveries series model
      const items = (dyn.data.series || []).map((s) => ({
        periodStart:
          typeof s.periodStart === "string"
            ? s.periodStart
            : new Date(s.periodStart as any).toISOString(),
        count: Number(s.value || 0),
      }));

      return {
        success: true,
        items,
        granularity: dyn.data.granularity,
        groupedBy: null,
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
