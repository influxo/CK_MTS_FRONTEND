import axiosInstance from "../axiosInstance";
import type { DemographicsResponse } from "./demographicsModels";

export async function fetchDemographics(): Promise<DemographicsResponse> {
  const res = await axiosInstance.get<DemographicsResponse>("/beneficiaries/demographics", {
    headers: {
      "Cache-Control": "no-cache",
    },
  });
  return res.data;
}
