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
  selectServicesTotalPages,
  selectServicesCurrentPage,
} from "../../store/slices/serviceSlice";
import { fetchForms, selectAllForms } from "../../store/slices/formsSlice";
import formTemplatesApi from "../../services/forms/formServices";
import { selectCurrentUser } from "../../store/slices/authSlice";
import { useTranslation } from "../../hooks/useTranslation";
import { selectUserProjectsTree } from "../../store/slices/userProjectsSlice";

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
    [user?.roles]
  );
  const isSubProjectManager = React.useMemo(() => {
    return normalizedRoles.some(
      (r: string) =>
        r === "sub-project manager" ||
        r === "sub project manager" ||
        r.includes("sub-project manager") ||
        r.includes("sub project manager")
    );
  }, [normalizedRoles]);
  const allowedSubprojectIds = React.useMemo(() => {
    try {
      const proj = (userProjectsTree || []).find(
        (p: any) => p.id === projectId
      );
      const ids = (proj?.subprojects || []).map((sp: any) => sp.id);
      return new Set<string>(ids);
    } catch {
      return new Set<string>();
    }
  }, [userProjectsTree, projectId]);

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

  // Load paginated templates locally based on entity context and templatesPage
  React.useEffect(() => {
    const load = async () => {
      try {
        const params: any = { page: templatesPage, limit: 100 };
        if (subprojectId) {
          params.subprojectId = subprojectId;
          params.entityType = "subproject";
        } else if (projectId) {
          params.projectId = projectId;
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
            (formsState as any)?.templates || (formsState as any) || []
          );
          setTemplatesTotalPages(1);
        }
      } catch (e) {
        setTemplatesOptions(
          (formsState as any)?.templates || (formsState as any) || []
        );
        setTemplatesTotalPages(1);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templatesPage, projectId, subprojectId]);

  // Reset templates page when entity scope changes
  React.useEffect(() => {
    setTemplatesPage(1);
  }, [projectId, subprojectId]);

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
            className="w-[180px] bg-white p-2 rounded-md  border-gray-100
             transition-transform duration-200 ease-in-out
             hover:scale-[1.02] hover:-translate-y-[1px] "
          >
            <SelectValue placeholder={t('common.selectProject')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('common.allProjects')}</SelectItem>
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
            <SelectValue placeholder={t('subProjects.selectSubProject')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('subProjects.allSubProjects')}</SelectItem>
            {subprojectsLoading ? (
              <SelectItem value="loading" disabled>
                {t('common.loading')}
              </SelectItem>
            ) : (
              subprojects
                .filter((sp) => sp.projectId === projectId)
                .filter((sp) =>
                  !isSubProjectManager ? true : allowedSubprojectIds.has(sp.id)
                )
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
      {showMore && (
        <div className="  rounded-md   border-gray-100">
          <div className="flex flex-wrap gap-4 items-center">
            <Select value={timePreset} onValueChange={onTimePresetChange}>
              <SelectTrigger
                className="w-[180px] bg-white p-2 rounded-md border-0
                 transition-transform duration-200 ease-in-out
                 hover:scale-[1.02] hover:-translate-y-[1px] "
              >
                <SelectValue placeholder={t('dashboard.timePeriod')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-period">{t('dashboard.allPeriod')}</SelectItem>
                <SelectItem value="last-7-days">{t('dashboard.last7Days')}</SelectItem>
                <SelectItem value="last-30-days">{t('dashboard.last30Days')}</SelectItem>
                <SelectItem value="last-90-days">{t('dashboard.last90Days')}</SelectItem>
                <SelectItem value="custom">{t('dashboard.customRange')}</SelectItem>
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
                className="w-[180px] bg-white p-2 rounded-md border-0
                 transition-transform duration-200 ease-in-out
                 hover:scale-[1.02] hover:-translate-y-[1px] "
              >
                <SelectValue placeholder={t('dashboard.metric')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="submissions">{t('dashboard.submissions')}</SelectItem>
                <SelectItem value="serviceDeliveries">
                  {t('dashboard.serviceDeliveries')}
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
                            (servicesCurrentPage || 1) + 1
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
                className="w-[180px] bg-white p-2 rounded-md border-0
                 transition-transform duration-200 ease-in-out
                 hover:scale-[1.02] hover:-translate-y-[1px] "
              >
                <SelectValue placeholder={t('dashboard.service')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('dashboard.allServices')}</SelectItem>
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
                className="w-[180px] bg-white p-2 rounded-md border-0
                 transition-transform duration-200 ease-in-out
                 hover:scale-[1.02] hover:-translate-y-[1px] "
              >
                <SelectValue placeholder={t('dashboard.formTemplate')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('dashboard.allTemplates')}</SelectItem>
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
