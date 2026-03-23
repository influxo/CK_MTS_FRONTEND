import axiosInstance from "../axiosInstance";

export interface ChronicCondition {
  id: string;
  code: string;
  label: string;
}

export interface ChronicConditionsResponse {
  success: boolean;
  data: ChronicCondition[];
}

export const fetchChronicConditions =
  async (): Promise<ChronicConditionsResponse> => {
    const response = await axiosInstance.get<ChronicConditionsResponse>(
      "/constants/chronic-conditions",
    );
    return response.data;
  };
