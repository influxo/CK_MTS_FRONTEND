import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BeneficiaryDemographics } from "../components/dashboard/BeneficiaryDemographics";
import { FilterControls } from "../components/dashboard/FilterControls";
import { FormSubmissions } from "../components/dashboard/FormSubmissions";
import { KpiHighlights } from "../components/dashboard/KpiHighlights";
import { RecentActivity } from "../components/dashboard/RecentActivity";
import { ServiceDelivery } from "../components/dashboard/ServiceDelivery";
import { SummaryMetrics } from "../components/dashboard/SummaryMetrics";

import type { AppDispatch } from "../store";

import { selectCurrentUser } from "../store/slices/authSlice";

import {
  fetchDeliveriesSeries,
  fetchDeliveriesSummary,
  selectMetricsFilters,
} from "../store/slices/serviceMetricsSlice";
import {
  fetchUserProjectsByUserId,
  selectUserProjectsError,
  selectUserProjectsLoading,
  selectUserProjectsTree,
} from "../store/slices/userProjectsSlice";
import { selectAllProjects } from "../store/slices/projectsSlice";

export function Dashboard() {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector(selectCurrentUser);
  // Artisi i ka bo qeto useSelectors, duhet me kqyr qka jan
  const userProjects = useSelector(selectUserProjectsTree);
  const userProjectsLoading = useSelector(selectUserProjectsLoading);
  const userProjectsError = useSelector(selectUserProjectsError);
  const metricsFilters = useSelector(selectMetricsFilters);

  const projects = useSelector(selectAllProjects);

  console.log("projects from dashboard", projects);

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchUserProjectsByUserId(String(user.id)));
    }
  }, [dispatch, user?.id]);

  // Load service delivery metrics (summary + series)
  useEffect(() => {
    dispatch(fetchDeliveriesSummary(metricsFilters));
    dispatch(fetchDeliveriesSeries(metricsFilters));
  }, [dispatch, metricsFilters]);

  return (
    <>
      <FilterControls projects={projects} />
      <div className="flex justify-end mb-4">
        {/* Create Project Dialog */}
        {/* TODO: make this a component */}
      </div>
      <SummaryMetrics />

      <FormSubmissions />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <KpiHighlights />
          <div className="lg:col-span-2 py-6">
            <BeneficiaryDemographics />
          </div>
          <div className="lg:col-span-2">
            <KpiHighlights />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-1 py-6 gap-6 mb-6">
            <ServiceDelivery />
          </div>
        </div>
        <div className=" space-y-6">
          {/* <SyncStatus />
          <SystemAlerts /> */}
          <RecentActivity />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div>{/* Empty space for future components or expansion */}</div>
      </div>
    </>
  );
}
