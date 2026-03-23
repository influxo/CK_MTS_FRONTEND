import { Filter, RotateCcw } from "lucide-react";
import * as React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "../../hooks/useTranslation";
import formTemplatesApi from "../../services/forms/formServices";
import type { Project } from "../../services/projects/projectModels";
import { selectCurrentUser } from "../../store/slices/authSlice";
import { fetchForms, selectAllForms } from "../../store/slices/formsSlice";
import {
  resetFilters,
  selectMetricsFilters,
  setFilters,
} from "../../store/slices/serviceMetricsSlice";
import {
  getAllServices,
  getEntityServices,
  selectAllServices,
  selectEntityServices,
  selectServicesCurrentPage,
  selectServicesTotalPages,
} from "../../store/slices/serviceSlice";
import {
  fetchSubProjectsByProjectId,
  selectAllSubprojects,
  selectSubprojectsLoading,
} from "../../store/slices/subProjectSlice";
import { selectUserProjectsTree } from "../../store/slices/userProjectsSlice";
import { KOSOVO_CITIES } from "../../utils/cities";
import { Button } from "../ui/button/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/form/select";

export function FilterControls({ projects }: { projects: Project[] }) {
  const { t } = useTranslation();
  const dispatch: any = useDispatch();
  const subprojects = useSelector(selectAllSubprojects);
  const subprojectsLoading = useSelector(selectSubprojectsLoading);
  const metricsFilters = useSelector(selectMetricsFilters);
  const entityServices = useSelector(selectEntityServices);
  const allServices = useSelector(selectAllServices);
  const formsState = useSelector(selectAllForms);
  const servicesTotalPages = useSelector(selectServicesTotalPages);
  const servicesCurrentPage = useSelector(selectServicesCurrentPage);

  const [projectId, setProjectId] = React.useState<string>("");
  const [subprojectId, setSubprojectId] = React.useState<string>("");
  const [city, setCity] = React.useState<string>("");
  const [selectedProjectIds, setSelectedProjectIds] = React.useState<
    Set<string>
  >(new Set());
  const [selectedSubprojectIds, setSelectedSubprojectIds] = React.useState<
    Set<string>
  >(new Set());
  const [timePreset, setTimePreset] = React.useState<string>("last-30-days");
  const [metric, setMetric] = React.useState<string>(
    metricsFilters.metric || "submissions",
  );
  const [serviceId, setServiceId] = React.useState<string>(
    metricsFilters.serviceId || "",
  );
  const [formTemplateId, setFormTemplateId] = React.useState<string>(
    metricsFilters.formTemplateId || "",
  );
  const [showMore, setShowMore] = React.useState<boolean>(false);
  const [customOpen, setCustomOpen] = React.useState<boolean>(false);
  const [customFrom, setCustomFrom] = React.useState<string>("");
  const [customTo, setCustomTo] = React.useState<string>("");
  // Control dropdown open state so pagination actions keep the menu open
  const [openServicesSelect, setOpenServicesSelect] = React.useState(false);
  const [openTemplatesSelect, setOpenTemplatesSelect] = React.useState(false);
  // Local paginated templates state (do not change global forms slice)
  const [templatesOptions, setTemplatesOptions] = React.useState<any[]>([]);
  const [templatesPage, setTemplatesPage] = React.useState<number>(1);
  const [templatesTotalPages, setTemplatesTotalPages] =
    React.useState<number>(1);

  // Role-aware: Sub-Project Manager only sees assigned subprojects for selected project
  const user = useSelector(selectCurrentUser);
  const userProjectsTree = useSelector(selectUserProjectsTree as any) as any[];
  const normalizedRoles = React.useMemo(
    () => (user?.roles || []).map((r: any) => r.name?.toLowerCase?.() || ""),
    [user?.roles],
  );
  const isSubProjectManager = React.useMemo(() => {
    return normalizedRoles.some(
      (r: string) =>
        r === "sub-project manager" ||
        r === "sub project manager" ||
        r.includes("sub-project manager") ||
        r.includes("sub project manager"),
    );
  }, [normalizedRoles]);
  const allowedSubprojectIds = React.useMemo(() => {
    try {
      if (selectedProjectIds.size !== 1) return new Set<string>();
      const singleProjectId = Array.from(selectedProjectIds)[0];
      const proj = (userProjectsTree || []).find(
        (p: any) => p.id === singleProjectId,
      );
      const ids = (proj?.subprojects || []).map((sp: any) => sp.id);
      return new Set<string>(ids);
    } catch {
      return new Set<string>();
    }
  }, [userProjectsTree, selectedProjectIds]);

  // Compute filtered projects/subprojects based on city
  const filteredProjects = React.useMemo(() => {
    if (!city) return projects;
    return projects.filter((p) => p.city === city);
  }, [projects, city]);

  // Filter subprojects by selected project (only when exactly 1 project is selected)
  const filteredSubprojects = React.useMemo(() => {
    if (selectedProjectIds.size !== 1) return [];
    const singleProjectId = Array.from(selectedProjectIds)[0];
    const baseFiltered = subprojects.filter(
      (sp) => sp.projectId === singleProjectId,
    );

    if (city) {
      const parentProject = projects.find((p) => p.id === singleProjectId);
      if (parentProject?.city !== city) return [];
    }

    return baseFiltered.filter((sp) =>
      !isSubProjectManager ? true : allowedSubprojectIds.has(sp.id),
    );
  }, [
    subprojects,
    selectedProjectIds,
    city,
    projects,
    isSubProjectManager,
    allowedSubprojectIds,
  ]);

  // Fetch subprojects when exactly 1 project is selected
  React.useEffect(() => {
    if (selectedProjectIds.size === 1) {
      const singleProjectId = Array.from(selectedProjectIds)[0];
      dispatch(fetchSubProjectsByProjectId({ projectId: singleProjectId }));
    }
  }, [dispatch, selectedProjectIds]);

  // Fetch services globally depending on selected entity (project/subproject)
  React.useEffect(() => {
    if (selectedSubprojectIds.size === 1) {
      const singleSubprojectId = Array.from(selectedSubprojectIds)[0];
      dispatch(
        getEntityServices({
          entityId: singleSubprojectId,
          entityType: "subproject",
        }),
      );
    } else if (selectedProjectIds.size === 1) {
      const singleProjectId = Array.from(selectedProjectIds)[0];
      dispatch(
        getEntityServices({ entityId: singleProjectId, entityType: "project" }),
      );
    } else {
      dispatch(getAllServices({ page: 1, limit: 100 }));
    }
  }, [dispatch, selectedProjectIds, selectedSubprojectIds]);

  // Fetch form templates once
  React.useEffect(() => {
    dispatch(fetchForms());
  }, [dispatch]);

  // Load paginated templates locally based on entity context and templatesPage
  React.useEffect(() => {
    const load = async () => {
      try {
        const params: any = { page: templatesPage, limit: 100 };
        if (selectedSubprojectIds.size === 1) {
          const singleSubprojectId = Array.from(selectedSubprojectIds)[0];
          params.subprojectId = singleSubprojectId;
          params.entityType = "subproject";
        } else if (selectedProjectIds.size === 1) {
          const singleProjectId = Array.from(selectedProjectIds)[0];
          params.projectId = singleProjectId;
          params.entityType = "project";
        }
        const res = await formTemplatesApi.getFormTemplates(params);
        if (res.success) {
          const data: any = res.data || {};
          setTemplatesOptions(data.templates || []);
          setTemplatesTotalPages(Number(data.pagination?.totalPages || 1));
        } else {
          // Fallback to redux state
          setTemplatesOptions(
            (formsState as any)?.templates || (formsState as any) || [],
          );
          setTemplatesTotalPages(1);
        }
      } catch (e) {
        setTemplatesOptions(
          (formsState as any)?.templates || (formsState as any) || [],
        );
        setTemplatesTotalPages(1);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templatesPage, selectedProjectIds, selectedSubprojectIds]);

  // Reset templates page when entity scope changes
  React.useEffect(() => {
    setTemplatesPage(1);
  }, [selectedProjectIds, selectedSubprojectIds]);

  // Handlers
  const onCityChange = (value: string) => {
    if (value === "all") {
      setCity("");
      setSelectedProjectIds(new Set());
      setSelectedSubprojectIds(new Set());
      setProjectId("");
      setSubprojectId("");
      dispatch(
        setFilters({
          projectIds: undefined,
          subprojectIds: undefined,
        }),
      );
      return;
    }

    setCity(value);
    setSelectedProjectIds(new Set());
    setSelectedSubprojectIds(new Set());
    setProjectId("");
    setSubprojectId("");

    const matchingProjectIds = projects
      .filter((p) => p.city === value)
      .map((p) => p.id);

    dispatch(
      setFilters({
        projectIds:
          matchingProjectIds.length > 0 ? matchingProjectIds : undefined,
        subprojectIds: undefined,
      }),
    );
  };

  const onProjectToggle = (projectId: string, checked: boolean) => {
    const newSelection = new Set(selectedProjectIds);

    if (checked) {
      newSelection.add(projectId);
    } else {
      newSelection.delete(projectId);
    }

    setSelectedProjectIds(newSelection);
    setSubprojectId("");
    setSelectedSubprojectIds(new Set());

    if (newSelection.size === 0) {
      if (city) {
        const matchingIds = filteredProjects.map((p) => p.id);
        dispatch(
          setFilters({
            projectIds: matchingIds.length > 0 ? matchingIds : undefined,
            subprojectIds: undefined,
          }),
        );
      } else {
        dispatch(
          setFilters({
            projectIds: undefined,
            subprojectIds: undefined,
          }),
        );
      }
    } else {
      dispatch(
        setFilters({
          projectIds: Array.from(newSelection),
          subprojectIds: undefined,
        }),
      );
    }

    setServiceId("");
    setFormTemplateId("");
    dispatch(setFilters({ serviceId: undefined, formTemplateId: undefined }));
  };

  const onSubprojectToggle = (subprojectId: string, checked: boolean) => {
    const newSelection = new Set(selectedSubprojectIds);

    if (checked) {
      newSelection.add(subprojectId);
    } else {
      newSelection.delete(subprojectId);
    }

    setSelectedSubprojectIds(newSelection);

    if (newSelection.size === 0) {
      if (selectedProjectIds.size > 0) {
        dispatch(
          setFilters({
            projectIds: Array.from(selectedProjectIds),
            subprojectIds: undefined,
          }),
        );
      } else if (city) {
        const matchingIds = filteredProjects.map((p) => p.id);
        dispatch(
          setFilters({
            projectIds: matchingIds,
            subprojectIds: undefined,
          }),
        );
      } else {
        dispatch(
          setFilters({
            projectIds: undefined,
            subprojectIds: undefined,
          }),
        );
      }
    } else {
      dispatch(
        setFilters({
          subprojectIds: Array.from(newSelection),
          projectIds: undefined,
        }),
      );
    }

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
    else if (value === "custom") {
      // Don't apply dates yet, let user toggle custom range inputs
      return;
    } else return;
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    dispatch(
      setFilters({
        startDate: start.toISOString(),
        endDate: end.toISOString(),
      }),
    );
  };

  const onCustomApply = () => {
    if (!customFrom || !customTo) return;
    const from = new Date(customFrom);
    const to = new Date(customTo);
    from.setHours(0, 0, 0, 0);
    to.setHours(23, 59, 59, 999);
    dispatch(
      setFilters({
        startDate: from.toISOString(),
        endDate: to.toISOString(),
      }),
    );
    setCustomOpen(false);
  };

  const handleResetFilters = () => {
    // Reset Redux global filters
    dispatch(resetFilters());

    // Reset all local filter states
    setProjectId("");
    setSubprojectId("");
    setCity("");
    setSelectedProjectIds(new Set());
    setSelectedSubprojectIds(new Set());
    setTimePreset("last-30-days");
    setMetric("submissions");
    setServiceId("");
    setFormTemplateId("");
    setShowMore(false);
    setCustomOpen(false);
    setCustomFrom("");
    setCustomTo("");

    // Reset pagination states
    setTemplatesPage(1);
  };

  const servicesForSelect =
    selectedSubprojectIds.size === 1 || selectedProjectIds.size === 1
      ? entityServices
      : allServices;

  return (
    <div className="flex flex-col  bg-[#F7F9FB]   drop-shadow-sm shadow-gray-50 gap-4 mb-6 p-4 bg-card rounded-lg ">
      <div className="flex flex-row flex-wrap gap-4 items-center w-full">
        {/* City Filter */}
        <Select value={city || "all"} onValueChange={onCityChange}>
          <SelectTrigger
            className="w-full md:w-[180px] bg-white p-2 rounded-md border-gray-100
             transition-transform duration-200 ease-in-out
             hover:scale-[1.02] hover:-translate-y-[1px]"
          >
            <SelectValue placeholder="Select City" />
          </SelectTrigger>
          <SelectContent className="max-h-64">
            <SelectItem value="all">All Cities</SelectItem>
            {KOSOVO_CITIES.map((cityName) => (
              <SelectItem key={cityName} value={cityName}>
                {cityName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={selectedProjectIds.size === 0 ? "all" : "selected"}
          onValueChange={() => {}}
        >
          <SelectTrigger
            className="w-full md:w-[180px] bg-white p-2 rounded-md  border-gray-100
             transition-transform duration-200 ease-in-out
             hover:scale-[1.02] hover:-translate-y-[1px] "
          >
            <SelectValue placeholder={t("common.selectProject")}>
              {selectedProjectIds.size === 0
                ? t("common.allProjects")
                : `${selectedProjectIds.size} selected`}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" onSelect={(e) => e.preventDefault()}>
              <div
                className="flex items-center gap-2 cursor-pointer"
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setSelectedProjectIds(new Set());
                  if (city) {
                    const matchingIds = filteredProjects.map((p) => p.id);
                    dispatch(
                      setFilters({
                        entityIds: matchingIds,
                        entityType: "project",
                        entityId: undefined,
                      }),
                    );
                  } else {
                    dispatch(
                      setFilters({
                        entityId: undefined,
                        entityIds: undefined,
                        entityType: undefined,
                      }),
                    );
                  }
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedProjectIds.size === 0}
                  readOnly
                  className="rounded border-gray-300 pointer-events-none"
                />
                <span>{t("common.allProjects")}</span>
              </div>
            </SelectItem>
            {filteredProjects.map((project) => (
              <SelectItem
                key={project.id}
                value={project.id}
                onSelect={(e) => e.preventDefault()}
              >
                <div
                  className="flex items-center gap-2 cursor-pointer"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onProjectToggle(
                      project.id,
                      !selectedProjectIds.has(project.id),
                    );
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedProjectIds.has(project.id)}
                    readOnly
                    className="rounded border-gray-300 pointer-events-none"
                  />
                  <span>{project.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={selectedSubprojectIds.size === 0 ? "all" : "selected"}
          onValueChange={() => {}}
          disabled={
            selectedProjectIds.size === 0 || selectedProjectIds.size > 1
          }
        >
          <SelectTrigger
            className="w-full md:w-[180px] bg-white border-0 border-gray-100 p-2 rounded-md 
             transition-transform duration-200 ease-in-out
             hover:scale-[1.02] hover:-translate-y-[1px] "
          >
            <SelectValue placeholder={t("subProjects.selectSubProject")}>
              {selectedSubprojectIds.size === 0
                ? t("subProjectsDetails.allSubProjects")
                : `${selectedSubprojectIds.size} selected`}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" onSelect={(e) => e.preventDefault()}>
              <div
                className="flex items-center gap-2 cursor-pointer"
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setSelectedSubprojectIds(new Set());
                  if (selectedProjectIds.size > 0) {
                    dispatch(
                      setFilters({
                        projectIds: Array.from(selectedProjectIds),
                        subprojectIds: undefined,
                      }),
                    );
                  } else if (city) {
                    const matchingIds = filteredProjects.map((p) => p.id);
                    dispatch(
                      setFilters({
                        projectIds: matchingIds,
                        subprojectIds: undefined,
                      }),
                    );
                  } else {
                    dispatch(
                      setFilters({
                        projectIds: undefined,
                        subprojectIds: undefined,
                      }),
                    );
                  }
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedSubprojectIds.size === 0}
                  readOnly
                  className="rounded border-gray-300 pointer-events-none"
                />
                <span>{t("subProjectsDetails.allSubProjects")}</span>
              </div>
            </SelectItem>
            {subprojectsLoading ? (
              <SelectItem value="loading" disabled>
                {t("common.loading")}
              </SelectItem>
            ) : (
              filteredSubprojects.map((sp) => (
                <SelectItem
                  key={sp.id}
                  value={sp.id}
                  onSelect={(e) => e.preventDefault()}
                >
                  <div
                    className="flex items-center gap-2 cursor-pointer"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onSubprojectToggle(
                        sp.id,
                        !selectedSubprojectIds.has(sp.id),
                      );
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedSubprojectIds.has(sp.id)}
                      readOnly
                      className="rounded border-gray-300 pointer-events-none"
                    />
                    <span>{sp.name}</span>
                  </div>
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
        <div className="  rounded-md   border-gray-100">
          <div className="flex flex-col md:flex-row flex-wrap gap-4 items-stretch md:items-center">
            <Select value={timePreset} onValueChange={onTimePresetChange}>
              <SelectTrigger
                className="w-full md:w-[180px] bg-white p-2 rounded-md border-0
                 transition-transform duration-200 ease-in-out
                 hover:scale-[1.02] hover:-translate-y-[1px] "
              >
                <SelectValue placeholder={t("dashboard.timePeriod")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-period">
                  {t("dashboard.allPeriod")}
                </SelectItem>
                <SelectItem value="last-7-days">
                  {t("dashboard.last7Days")}
                </SelectItem>
                <SelectItem value="last-30-days">
                  {t("dashboard.last30Days")}
                </SelectItem>
                <SelectItem value="last-90-days">
                  {t("dashboard.last90Days")}
                </SelectItem>
                <div className="border-t border-gray-100 my-1" />
                <div className="px-2 py-1">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setCustomOpen((s) => !s);
                    }}
                    className="w-full text-left px-2 py-1.5 text-sm rounded-md hover:bg-gray-50"
                    type="button"
                  >
                    {t("dashboard.customRange")}…
                  </button>
                  {customOpen && (
                    <div className="px-2 pb-2 pt-2">
                      <div className="grid grid-cols-1 gap-2">
                        <label className="text-xs text-gray-600">
                          From
                          <input
                            type="date"
                            className="mt-1 w-full border rounded-md px-2 py-1 text-sm"
                            value={customFrom}
                            onChange={(e) => setCustomFrom(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </label>
                        <label className="text-xs text-gray-600">
                          To
                          <input
                            type="date"
                            className="mt-1 w-full border rounded-md px-2 py-1 text-sm"
                            value={customTo}
                            onChange={(e) => setCustomTo(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </label>
                        <div className="flex justify-end gap-2 pt-1">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setCustomOpen(false);
                            }}
                            className="px-3 py-1.5 rounded-md text-sm border border-gray-200"
                            type="button"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              onCustomApply();
                            }}
                            className="px-3 py-1.5 rounded-md text-sm bg-black text-white"
                            type="button"
                          >
                            Apply
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
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
                className="w-full md:w-[180px] bg-white p-2 rounded-md border-0
                 transition-transform duration-200 ease-in-out
                 hover:scale-[1.02] hover:-translate-y-[1px] "
              >
                <SelectValue placeholder={t("dashboard.metric")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="submissions">
                  {t("dashboard.submissions")}
                </SelectItem>
                <SelectItem value="serviceDeliveries">
                  {t("dashboard.serviceDeliveries")}
                </SelectItem>
                <SelectItem value="uniqueBeneficiaries">
                  Unique Beneficiaries
                </SelectItem>
              </SelectContent>
            </Select>

            {/* Global Service */}
            <Select
              open={openServicesSelect}
              onOpenChange={setOpenServicesSelect}
              value={serviceId || "all"}
              onValueChange={(v) => {
                if (v === "__svc_prev__" || v === "__svc_next__") {
                  // Only paginate when not scoped to an entity
                  if (!projectId && !subprojectId) {
                    const nextPage =
                      v === "__svc_prev__"
                        ? Math.max(1, (servicesCurrentPage || 1) - 1)
                        : Math.min(
                            servicesTotalPages || 1,
                            (servicesCurrentPage || 1) + 1,
                          );
                    dispatch(getAllServices({ page: nextPage, limit: 100 }));
                    setOpenServicesSelect(true);
                  }
                  return;
                }
                const id = v === "all" ? "" : v;
                setServiceId(id);
                dispatch(setFilters({ serviceId: id || undefined }));
              }}
            >
              <SelectTrigger
                className="w-full md:w-[180px] bg-white p-2 rounded-md border-0
                 transition-transform duration-200 ease-in-out
                 hover:scale-[1.02] hover:-translate-y-[1px] "
              >
                <SelectValue placeholder={t("dashboard.service")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {t("dashboard.allServices")}
                </SelectItem>
                {servicesForSelect.map((s: any) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
                {/* Pagination controls for global services (not when scoped to entity) */}
                {!projectId && !subprojectId && (
                  <>
                    <SelectItem
                      value="__svc_prev__"
                      disabled={(servicesCurrentPage || 1) <= 1}
                    >
                      ◀ Prev Page
                    </SelectItem>
                    <SelectItem value="__svc_info__" disabled>
                      Page {servicesCurrentPage || 1} of{" "}
                      {servicesTotalPages || 1}
                    </SelectItem>
                    <SelectItem
                      value="__svc_next__"
                      disabled={
                        (servicesCurrentPage || 1) >= (servicesTotalPages || 1)
                      }
                    >
                      Next Page ▶
                    </SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>

            {/* Global Form Template */}
            <Select
              open={openTemplatesSelect}
              onOpenChange={setOpenTemplatesSelect}
              value={formTemplateId || "all"}
              onValueChange={(v) => {
                if (v === "__tpl_prev__" || v === "__tpl_next__") {
                  const nextPage =
                    v === "__tpl_prev__"
                      ? Math.max(1, templatesPage - 1)
                      : Math.min(templatesTotalPages || 1, templatesPage + 1);
                  setTemplatesPage(nextPage);
                  setOpenTemplatesSelect(true);
                  return;
                }
                const id = v === "all" ? "" : v;
                setFormTemplateId(id);
                dispatch(setFilters({ formTemplateId: id || undefined }));
              }}
            >
              <SelectTrigger
                className="w-full md:w-[180px] bg-white p-2 rounded-md border-0
                 transition-transform duration-200 ease-in-out
                 hover:scale-[1.02] hover:-translate-y-[1px] "
              >
                <SelectValue placeholder={t("dashboard.formTemplate")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {t("dashboard.allTemplates")}
                </SelectItem>
                {(templatesOptions || []).map((t: any) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
                {/* Pagination controls for templates */}
                <SelectItem value="__tpl_prev__" disabled={templatesPage <= 1}>
                  ◀ Prev Page
                </SelectItem>
                <SelectItem value="__tpl_info__" disabled>
                  Page {templatesPage} of {templatesTotalPages || 1}
                </SelectItem>
                <SelectItem
                  value="__tpl_next__"
                  disabled={templatesPage >= (templatesTotalPages || 1)}
                >
                  Next Page ▶
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
      <div className="flex gap-4 justify-end w-full">
        <Button
          variant="outline"
          size="sm"
          onClick={handleResetFilters}
          className="bg-orange-500 text-white border-0 
             transition-transform duration-200 ease-in-out 
             hover:scale-105 hover:-translate-y-[1px] hover:bg-orange-600"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset Filters
        </Button>
        {/* <Button
          variant="outline"
          size="sm"
          className="bg-[#0073e6] text-white border-0 
             transition-transform duration-200 ease-in-out 
             hover:scale-105 hover:-translate-y-[1px]"
        >
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button> */}
      </div>

      {/* <div className="flex gap-4 justify-end">
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
      </div> */}
    </div>
  );
}
