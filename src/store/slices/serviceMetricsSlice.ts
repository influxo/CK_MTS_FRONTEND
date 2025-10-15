import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import serviceMetricsService from "../../services/services/serviceMetricsService";
import type {
  DeliveriesFilters,
  DeliveriesSeriesParams,
  DeliveriesSeriesResponse,
  DeliveriesSummaryData,
  DeliveriesSummaryResponse,
  TimeUnit,
  GroupField,
  MetricType,
} from "../../services/services/serviceMetricsModels";

export interface MetricsFilters extends DeliveriesFilters {
  groupBy?: TimeUnit;
  groupField?: GroupField;
  metric?: MetricType;
}

interface SummaryState {
  loading: boolean;
  error: string | null;
  data: DeliveriesSummaryData | null;
  lastKey?: string | null;
}

interface SeriesState {
  loading: boolean;
  error: string | null;
  items: DeliveriesSeriesResponse["items"];
  granularity: TimeUnit;
  groupedBy: DeliveriesSeriesResponse["groupedBy"];
  lastKey?: string | null;
}

interface ServiceMetricsState {
  filters: MetricsFilters;
  summary: SummaryState;
  series: SeriesState;
}

const initialState: ServiceMetricsState = {
  filters: {
    startDate: undefined,
    endDate: undefined,
    entityId: undefined,
    entityType: undefined,
    groupBy: "month",
    groupField: undefined,
    metric: "submissions",
  },
  summary: {
    loading: false,
    error: null,
    data: null,
    lastKey: null,
  },
  series: {
    loading: false,
    error: null,
    items: [],
    granularity: "month",
    groupedBy: null,
    lastKey: null,
  },
};

export const fetchDeliveriesSummary = createAsyncThunk<
  DeliveriesSummaryResponse,
  DeliveriesFilters | void,
  { state: any; rejectValue: string }
>(
  "serviceMetrics/fetchSummary",
  async (filters, { rejectWithValue }) => {
    const response = await serviceMetricsService.getDeliveriesSummary(filters || {});
    if (!response.success) {
      return rejectWithValue(response.message || "Failed to fetch deliveries summary");
    }
    return response;
  },
  {
    condition: (filters, { getState }) => {
      const st = getState() as any;
      const prevKey = st.serviceMetrics.summary.lastKey;
      const key = JSON.stringify(filters || {});
      // Skip if same params and not currently loading
      return prevKey !== key && !st.serviceMetrics.summary.loading;
    },
  }
);

export const fetchDeliveriesSeries = createAsyncThunk<
  DeliveriesSeriesResponse,
  DeliveriesSeriesParams | void,
  { state: any; rejectValue: string }
>(
  "serviceMetrics/fetchSeries",
  async (params, { rejectWithValue }) => {
    const response = await serviceMetricsService.getDeliveriesSeries(params || {});
    if (!response.success) {
      return rejectWithValue(response.message || "Failed to fetch deliveries series");
    }
    return response;
  },
  {
    condition: (params, { getState }) => {
      const st = getState() as any;
      const prevKey = st.serviceMetrics.series.lastKey;
      const key = JSON.stringify(params || {});
      return prevKey !== key && !st.serviceMetrics.series.loading;
    },
  }
);

const serviceMetricsSlice = createSlice({
  name: "serviceMetrics",
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<MetricsFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },
  },
  extraReducers: (builder) => {
    builder
      // Summary
      .addCase(fetchDeliveriesSummary.pending, (state) => {
        state.summary.loading = true;
        state.summary.error = null;
      })
      .addCase(fetchDeliveriesSummary.fulfilled, (state, action) => {
        state.summary.loading = false;
        state.summary.error = null; // clear any previous error on success
        state.summary.data = action.payload.data;
        // Record last request key for caching
        // @ts-ignore meta is available on action
        const key = JSON.stringify(action.meta.arg || {});
        state.summary.lastKey = key;
      })
      .addCase(fetchDeliveriesSummary.rejected, (state, action) => {
        state.summary.loading = false;
        state.summary.error = action.payload || "Failed to fetch deliveries summary";
      })
      // Series
      .addCase(fetchDeliveriesSeries.pending, (state) => {
        state.series.loading = true;
        state.series.error = null;
      })
      .addCase(fetchDeliveriesSeries.fulfilled, (state, action) => {
        state.series.loading = false;
        state.series.error = null; // clear any previous error on success
        state.series.items = action.payload.items;
        state.series.granularity = action.payload.granularity;
        state.series.groupedBy = action.payload.groupedBy;
        // Record last request key for caching
        // @ts-ignore meta is available on action
        const key = JSON.stringify(action.meta.arg || {});
        state.series.lastKey = key;
      })
      .addCase(fetchDeliveriesSeries.rejected, (state, action) => {
        state.series.loading = false;
        state.series.error = action.payload || "Failed to fetch deliveries series";
      });
  },
});

export const { setFilters, resetFilters } = serviceMetricsSlice.actions;

// Selectors
export const selectMetricsFilters = (state: any) => state.serviceMetrics.filters as MetricsFilters;
export const selectSummary = (state: any) => state.serviceMetrics.summary as SummaryState;
export const selectSeries = (state: any) => state.serviceMetrics.series as SeriesState;

export default serviceMetricsSlice.reducer;
