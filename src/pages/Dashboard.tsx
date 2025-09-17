import { useEffect, useMemo } from "react";
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
import { fetchUserProjectsByUserId } from "../store/slices/userProjectsSlice";
import { selectAllProjects } from "../store/slices/projectsSlice";

export function Dashboard() {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector(selectCurrentUser);
  const metricsFilters = useSelector(selectMetricsFilters);

  const projects = useSelector(selectAllProjects);

  console.log("projects from dashboard", projects);

  // Determine role: field operator
  const normalizedRoles = useMemo(
    () => (user?.roles || []).map((r: any) => r.name?.toLowerCase?.() || ""),
    [user?.roles]
  );
  const isSysOrSuperAdmin = useMemo(() => {
    return normalizedRoles.some(
      (r: string) =>
        r === "sysadmin" ||
        r === "superadmin" ||
        r.includes("system admin") ||
        r.includes("super admin")
    );
  }, [normalizedRoles]);
  const isFieldOperator = useMemo(() => {
    return (
      normalizedRoles.includes("field operator") ||
      normalizedRoles.includes("field-operator") ||
      normalizedRoles.includes("fieldoperator") ||
      normalizedRoles.includes("field_op") ||
      normalizedRoles.some((r: string) => r.includes("field") && r.includes("operator"))
    );
  }, [normalizedRoles]);

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchUserProjectsByUserId(String(user.id)));
    }
  }, [dispatch, user?.id]);

  // Load service delivery metrics (summary + series)
  useEffect(() => {
    if (!user) return; // wait until user profile is available to determine role filters
    const base = metricsFilters || ({} as any);
    const filters = isFieldOperator && user?.id
      ? { ...base, staffUserId: String(user.id) }
      : base;
    dispatch(fetchDeliveriesSummary(filters));
    dispatch(fetchDeliveriesSeries(filters));
  }, [dispatch, metricsFilters, isFieldOperator, user?.id]);

  if (isFieldOperator && !isSysOrSuperAdmin) {
    // Simplified dashboard for Field Operator: only cards + graph, filtered by staffUserId
    return (
      <>
        <SummaryMetrics />
        <div className="grid grid-cols-1 lg:grid-cols-1 py-6 gap-6 mb-6">
          <ServiceDelivery />
        </div>
      </>
    );
  }

  // Default dashboard for other roles
  return (
    <>
      <FilterControls projects={projects} />
      <div className="flex justify-end mb-4">
        {/* Create Project Dialog */}
        {/* TODO: make this a component */}
      </div>
      <SummaryMetrics />

      <FormSubmissions projects={projects} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <KpiHighlights />
          <div className="lg:col-span-2 py-6">
            <BeneficiaryDemographics />
          </div>
          {/* <div className="lg:col-span-2">
            <KpiHighlights />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-1 py-6 gap-6 mb-6">
            <ServiceDelivery />
          </div> */}
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
