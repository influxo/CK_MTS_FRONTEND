import axiosInstance from "../axiosInstance";
import getApiUrl from "../apiUrl";
import type {
  ApiResponse,
  KpiDefinition,
  KpiCalculateParams,
  KpiCalculation,
  KpiSeriesParams,
  KpiSeriesPoint,
} from "./kpiModels";

class KpiService {
  private baseUrl = getApiUrl();
  private formsEndpoint = `${this.baseUrl}/forms`;

  async getAll(): Promise<ApiResponse<KpiDefinition[]>> {
    const url = `${this.formsEndpoint}/kpis`;
    try {
      const res = await axiosInstance.get<ApiResponse<KpiDefinition[]>>(url);
      return res.data;
    } catch (error: any) {
      if (error?.response) return error.response.data;
      return { success: false, message: error?.message || "Failed to load KPIs", data: [] };
    }
  }

  async calculate(
    id: string,
    params: KpiCalculateParams = {}
  ): Promise<ApiResponse<KpiCalculation>> {
    const url = `${this.formsEndpoint}/kpis/${id}/calculate`;
    try {
      const res = await axiosInstance.get<ApiResponse<KpiCalculation>>(url, { params });
      return res.data;
    } catch (error: any) {
      if (error?.response) return error.response.data;
      return { success: false, message: error?.message || "Failed to calculate KPI", data: undefined as any };
    }
  }

  async series(
    id: string,
    params: KpiSeriesParams
  ): Promise<ApiResponse<KpiSeriesPoint[]>> {
    const url = `${this.formsEndpoint}/kpis/${id}/series`;
    try {
      const res = await axiosInstance.get<ApiResponse<KpiSeriesPoint[]>>(url, { params });
      return res.data;
    } catch (error: any) {
      if (error?.response) return error.response.data;
      return { success: false, message: error?.message || "Failed to fetch KPI series", data: [] };
    }
  }
}

const kpiService = new KpiService();
export default kpiService;
