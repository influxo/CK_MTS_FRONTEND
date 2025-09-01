export interface AgeBucketItem {
  name: '0-20' | '19-35' | '36-55' | '55+';
  value: number;
}

export interface GenderItem {
  name: 'Male' | 'Female' | 'Unknown';
  count: number;
}

export interface DemographicsData {
  age: AgeBucketItem[];
  gender: GenderItem[];
}

export interface DemographicsResponse {
  success: boolean;
  message?: string;
  data: DemographicsData;
}
