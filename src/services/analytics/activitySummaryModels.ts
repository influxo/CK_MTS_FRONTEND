export type ActivitySummaryResponse = {
  success: boolean;
  data: {
    formSubmissionsCount: number;
    projectSubprojectChangesCount: number;
    range: {
      startDate: string | null;
      endDate: string | null;
    };
  };
};
