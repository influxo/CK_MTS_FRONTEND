import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { DemographicsData, DemographicsResponse } from "../../services/analytics/demographicsModels";
import { fetchDemographics } from "../../services/analytics/demographicsService";

export interface DemographicsState {
  loading: boolean;
  error?: string;
  data?: DemographicsData;
  lastLoadedAt?: string; // ISO
}

const initialState: DemographicsState = {
  loading: false,
  error: undefined,
  data: undefined,
  lastLoadedAt: undefined,
};

export const loadDemographics = createAsyncThunk<DemographicsResponse>(
  "demographics/load",
  async () => {
    const res = await fetchDemographics();
    return res;
  }
);

const demographicsSlice = createSlice({
  name: "demographics",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadDemographics.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(loadDemographics.fulfilled, (state, action) => {
        state.loading = false;
        if (!action.payload.success) {
          state.error = action.payload.message || "Failed to load demographics";
          state.data = undefined;
          return;
        }
        state.data = action.payload.data;
        state.lastLoadedAt = new Date().toISOString();
      })
      .addCase(loadDemographics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error?.message || "Failed to load demographics";
      });
  },
});

export const selectDemographics = (root: any): DemographicsState =>
  (root.demographics as DemographicsState) || initialState;

export default demographicsSlice.reducer;
