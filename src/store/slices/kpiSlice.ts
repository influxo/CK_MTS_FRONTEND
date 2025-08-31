import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "..";
import kpiService from "../../services/forms/kpiService";
import type { KpiDefinition, KpiCalculation, KpiCalculateParams } from "../../services/forms/kpiModels";

export interface KpiState {
  items: KpiDefinition[];
  values: Record<string, KpiCalculation | undefined>; // key by kpiId
  loading: boolean;
  error: string | null;
  loaded: boolean; // definitions loaded at least once
}

const initialState: KpiState = {
  items: [],
  values: {},
  loading: false,
  error: null,
  loaded: false,
};

export const fetchKpis = createAsyncThunk(
  "kpis/fetchAll",
  async () => {
    const res = await kpiService.getAll();
    if (!res.success) throw new Error(res.message || "Failed to load KPIs");
    return res.data;
  },
  {
    condition: (_, { getState }) => {
      const state = getState() as RootState;
      // Skip if already loaded
      return !state.kpis.loaded && !state.kpis.loading;
    },
  }
);

export const fetchKpiValue = createAsyncThunk(
  "kpis/fetchValue",
  async (id: string) => {
    const res = await kpiService.calculate(id, {});
    if (!res.success) throw new Error(res.message || "Failed to calculate KPI");
    return res.data as KpiCalculation;
  },
  {
    condition: (id: string, { getState }) => {
      const state = getState() as RootState;
      // Skip if value is already cached
      return !state.kpis.values[id];
    },
  }
);

// New: filtered KPI value thunk (does not affect original signature)
export const fetchKpiValueWithFilters = createAsyncThunk<
  KpiCalculation,
  { id: string; params?: KpiCalculateParams }
>(
  "kpis/fetchValueWithFilters",
  async ({ id, params }) => {
    const res = await kpiService.calculate(id, params || {});
    if (!res.success) throw new Error(res.message || "Failed to calculate KPI");
    return res.data as KpiCalculation;
  }
);

const kpiSlice = createSlice({
  name: "kpis",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchKpis.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchKpis.fulfilled,
        (state, action: PayloadAction<KpiDefinition[]>) => {
          state.items = action.payload;
          state.loading = false;
          state.loaded = true;
        }
      )
      .addCase(fetchKpis.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to load KPIs";
      })
      .addCase(
        fetchKpiValue.fulfilled,
        (state, action: PayloadAction<KpiCalculation>) => {
          const calc = action.payload;
          state.values[calc.kpiId] = calc;
        }
      )
      .addCase(
        fetchKpiValueWithFilters.fulfilled,
        (state, action: PayloadAction<KpiCalculation>) => {
          const calc = action.payload;
          state.values[calc.kpiId] = calc;
        }
      );
  },
});

export const selectKpis = (state: RootState) => state.kpis;

export default kpiSlice.reducer;
