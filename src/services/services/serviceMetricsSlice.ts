import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import service from "./serviceMetricsService";
import type {
  DeliveriesSeriesParams,
  DeliveriesSeriesResponse,
  DeliveriesSeriesItem,
  TimeUnit,
  GroupedByKey,
} from "./serviceMetricsModels";

export interface ServiceMetricsState {
  loading: boolean;
  error?: string;
  items: DeliveriesSeriesItem[];
  granularity: TimeUnit;    // mirrors API's groupBy
  groupedBy: GroupedByKey;
}

const initialState: ServiceMetricsState = {
  loading: false,
  error: undefined,
  items: [],
  granularity: "month",
  groupedBy: null,
};

export const loadServiceMetrics = createAsyncThunk<
  DeliveriesSeriesResponse,
  DeliveriesSeriesParams
>("serviceMetrics/loadSeries", async (params) => {
  const res = await service.getDeliveriesSeries(params);
  return res;
});

const serviceMetricsSlice = createSlice({
  name: "serviceMetrics",
  initialState,
  reducers: {
    // Optional local update if you ever want to set granularity without fetching
    setGranularity(state, action: PayloadAction<TimeUnit>) {
      state.granularity = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadServiceMetrics.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(loadServiceMetrics.fulfilled, (state, action) => {
        state.loading = false;
        const { success, message, items, granularity, groupedBy } = action.payload;
        if (!success) {
          state.error = message || "Failed to load series";
          state.items = [];
          return;
        }
        state.items = items || [];
        // Prefer server-reported granularity, otherwise use the requested one
        state.granularity =
          granularity ||
          ((action.meta.arg.groupBy as TimeUnit) ?? state.granularity);
        state.groupedBy = groupedBy ?? null;
      })
      .addCase(loadServiceMetrics.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.error && (action.error.message || String(action.error))) ||
          "Failed to load series";
      });
  },
});

export const { setGranularity } = serviceMetricsSlice.actions;

// Selector used by the component
export const selectSeries = (root: any): ServiceMetricsState =>
  root.serviceMetrics as ServiceMetricsState;

export default serviceMetricsSlice.reducer;