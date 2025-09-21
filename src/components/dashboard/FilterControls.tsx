import * as React from "react";
import { Download, Filter } from "lucide-react";
import { Button } from "../ui/button/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/form/select";
import type { Project } from "../../services/projects/projectModels";
import { useDispatch, useSelector } from "react-redux";
import {
  setFilters,
  selectMetricsFilters,
} from "../../store/slices/serviceMetricsSlice";
import {
  fetchSubProjectsByProjectId,
  selectAllSubprojects,
  selectSubprojectsLoading,
} from "../../store/slices/subProjectSlice";
import {
  getAllServices,
  getEntityServices,
  selectAllServices,
  selectEntityServices,
} from "../../store/slices/serviceSlice";
import { fetchForms, selectAllForms } from "../../store/slices/formsSlice";

export function FilterControls({ projects }: { projects: Project[] }) {
  const dispatch: any = useDispatch();
  const subprojects = useSelector(selectAllSubprojects);
  const subprojectsLoading = useSelector(selectSubprojectsLoading);
  const metricsFilters = useSelector(selectMetricsFilters);
  const entityServices = useSelector(selectEntityServices);
  const allServices = useSelector(selectAllServices);
  const formsState = useSelector(selectAllForms);

  const [projectId, setProjectId] = React.useState<string>("");
  const [subprojectId, setSubprojectId] = React.useState<string>("");
  const [timePreset, setTimePreset] = React.useState<string>("last-30-days");
  const [metric, setMetric] = React.useState<string>(
    metricsFilters.metric || "submissions"
  );
  const [serviceId, setServiceId] = React.useState<string>(
    metricsFilters.serviceId || ""
  );
  const [formTemplateId, setFormTemplateId] = React.useState<string>(
    metricsFilters.formTemplateId || ""
  );
  const [showMore, setShowMore] = React.useState<boolean>(false);

  // Fetch subprojects when project changes
  React.useEffect(() => {
    if (projectId) {
      dispatch(fetchSubProjectsByProjectId({ projectId }));
    }
  }, [dispatch, projectId]);

  // Fetch services globally depending on selected entity (project/subproject)
  React.useEffect(() => {
    if (subprojectId) {
      dispatch(
        getEntityServices({ entityId: subprojectId, entityType: "subproject" })
      );
    } else if (projectId) {
      dispatch(
        getEntityServices({ entityId: projectId, entityType: "project" })
      );
    } else {
      dispatch(getAllServices({ page: 1, limit: 100 }));
    }
  }, [dispatch, projectId, subprojectId]);

  // Fetch form templates once
  React.useEffect(() => {
    dispatch(fetchForms());
  }, [dispatch]);

  // Handlers
  const onProjectChange = (value: string) => {
    if (value === "all") {
      setProjectId("");
      setSubprojectId("");
      dispatch(setFilters({ entityId: undefined, entityType: undefined }));
      return;
    }
    setProjectId(value);
    setSubprojectId("");
    dispatch(setFilters({ entityId: value, entityType: "project" }));
    // Clear dependent filters
    setServiceId("");
    setFormTemplateId("");
    dispatch(setFilters({ serviceId: undefined, formTemplateId: undefined }));
  };

  const onSubprojectChange = (value: string) => {
    if (value === "all") {
      setSubprojectId("");
      if (projectId) {
        dispatch(setFilters({ entityId: projectId, entityType: "project" }));
      } else {
        dispatch(setFilters({ entityId: undefined, entityType: undefined }));
      }
      return;
    }
    setSubprojectId(value);
    dispatch(setFilters({ entityId: value, entityType: "subproject" }));
    // Clear dependent filters
    setServiceId("");
    setFormTemplateId("");
    dispatch(setFilters({ serviceId: undefined, formTemplateId: undefined }));
  };

  const onTimePresetChange = (value: string) => {
    setTimePreset(value);
    const now = new Date();
    const end = new Date(now);
    const start = new Date(now);
    if (value === "all-period") {
      // Clear dates entirely so queries omit fromDate/toDate
      dispatch(setFilters({ startDate: undefined, endDate: undefined }));
      return;
    } else if (value === "last-7-days") start.setDate(now.getDate() - 7);
    else if (value === "last-30-days") start.setDate(now.getDate() - 30);
    else if (value === "last-90-days") start.setDate(now.getDate() - 90);
    else return; // ignore custom here; handled elsewhere if needed
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    dispatch(
      setFilters({ startDate: start.toISOString(), endDate: end.toISOString() })
    );
  };

  const servicesForSelect =
    subprojectId || projectId ? entityServices : allServices;

  return (
    <div className="flex flex-col  bg-[#F7F9FB]   drop-shadow-sm shadow-gray-50 gap-4 mb-6 p-4 bg-card rounded-lg ">
      <div className="flex flex-wrap gap-4 items-center">
        <Select value={projectId || "all"} onValueChange={onProjectChange}>
          <SelectTrigger
            className="w-[200px] bg-white p-2 rounded-md border-0
             transition-transform duration-200 ease-in-out
             hover:scale-[1.02] hover:-translate-y-[1px] "
          >
            <SelectValue placeholder="Select Project" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Projects</SelectItem>
            {projects.map((project) => (
              <SelectItem key={project.id} value={project.id}>
                {project.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={subprojectId || "all"}
          onValueChange={onSubprojectChange}
          disabled={!projectId}
        >
          <SelectTrigger
            className="w-[180px] bg-white border-0 border-gray-100 p-2 rounded-md 
             transition-transform duration-200 ease-in-out
             hover:scale-[1.02] hover:-translate-y-[1px] "
          >
            <SelectValue placeholder="Select Subproject" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Subprojects</SelectItem>
            {subprojectsLoading ? (
              <SelectItem value="loading" disabled>
                Loading...
              </SelectItem>
            ) : (
              subprojects
                .filter((sp) => sp.projectId === projectId)
                .map((sp) => (
                  <SelectItem key={sp.id} value={sp.id}>
                    {sp.name}
                  </SelectItem>
                ))
            )}
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowMore((s) => !s)}
          className="ml-auto bg-[#E0F2FE] text-black border-0 
             transition-transform duration-200 ease-in-out 
             hover:scale-105 hover:-translate-y-[1px]"
        >
          <Filter className="h-4 w-4 mr-2" />
          {showMore ? "Hide Filters" : "More Filters"}
        </Button>

      </div>
      {showMore && (
        <div className="mt-2 p-3 rounded-md bg-white/60 border border-gray-100">
          <div className="flex flex-wrap gap-4 items-center">
            <Select value={timePreset} onValueChange={onTimePresetChange}>
              <SelectTrigger
                className="w-[200px] bg-white p-2 rounded-md border-0
                 transition-transform duration-200 ease-in-out
                 hover:scale-[1.02] hover:-translate-y-[1px] "
              >
                <SelectValue placeholder="Time Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-period">All Period</SelectItem>
                <SelectItem value="last-7-days">Last 7 days</SelectItem>
                <SelectItem value="last-30-days">Last 30 days</SelectItem>
                <SelectItem value="last-90-days">Last 90 days</SelectItem>
                <SelectItem value="custom">Custom range</SelectItem>
              </SelectContent>
            </Select>

            {/* Global Metric */}
            <Select
              value={metric}
              onValueChange={(v) => {
                setMetric(v);
                dispatch(setFilters({ metric: v as any }));
              }}
            >
              <SelectTrigger
                className="w-[200px] bg-white p-2 rounded-md border-0
                 transition-transform duration-200 ease-in-out
                 hover:scale-[1.02] hover:-translate-y-[1px] "
              >
                <SelectValue placeholder="Metric" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="submissions">Submissions</SelectItem>
                <SelectItem value="serviceDeliveries">
                  Service Deliveries
                </SelectItem>
                <SelectItem value="uniqueBeneficiaries">
                  Unique Beneficiaries
                </SelectItem>
              </SelectContent>
            </Select>

            {/* Global Service */}
            <Select
              value={serviceId || "all"}
              onValueChange={(v) => {
                const id = v === "all" ? "" : v;
                setServiceId(id);
                dispatch(setFilters({ serviceId: id || undefined }));
              }}
            >
              <SelectTrigger
                className="w-[220px] bg-white p-2 rounded-md border-0
                 transition-transform duration-200 ease-in-out
                 hover:scale-[1.02] hover:-translate-y-[1px] "
              >
                <SelectValue placeholder="Service" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Services</SelectItem>
                {servicesForSelect.map((s: any) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Global Form Template */}
            <Select
              value={formTemplateId || "all"}
              onValueChange={(v) => {
                const id = v === "all" ? "" : v;
                setFormTemplateId(id);
                dispatch(setFilters({ formTemplateId: id || undefined }));
              }}
            >
              <SelectTrigger
                className="w-[220px] bg-white p-2 rounded-md border-0
                 transition-transform duration-200 ease-in-out
                 hover:scale-[1.02] hover:-translate-y-[1px] "
              >
                <SelectValue placeholder="Form Template" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Templates</SelectItem>
                {(formsState?.templates || []).map((t: any) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      <div className="flex gap-4 justify-end">
        <Button
          variant="outline"
          size="sm"
          className="bg-[#0073e6] text-white border-0 
             transition-transform duration-200 ease-in-out 
             hover:scale-105 hover:-translate-y-[1px]"
        >
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>
    </div>
  );
}
