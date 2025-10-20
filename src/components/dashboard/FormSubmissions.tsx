import * as React from "react";
import { MoreHorizontal, Filter, ChevronDown } from "lucide-react";

import { Badge } from "../ui/data-display/badge";
import { Button } from "../ui/button/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../ui/data-display/card";
// Removed Tabs in favor of a dropdown granularity selector
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/form/select";
import {
  ComposedChart,
  Line,
  Area,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type {
  TimeUnit,
  MetricType,
} from "../../services/services/serviceMetricsModels";
import serviceMetricsService from "../../services/services/serviceMetricsService";
import servicesService from "../../services/services/serviceServices";
import formTemplatesApi from "../../services/forms/formServices";
import subProjectService from "../../services/subprojects/subprojectService";
import type { Project } from "../../services/projects/projectModels";
import { useSelector } from "react-redux";
import { selectMetricsFilters } from "../../store/slices/serviceMetricsSlice";
import { selectCurrentUser } from "../../store/slices/authSlice";
import { selectUserProjectsTree } from "../../store/slices/userProjectsSlice";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@radix-ui/react-tabs";
import { useTranslation } from "../../hooks/useTranslation";

type Granularity = TimeUnit; // 'day' | 'week' | 'month' | 'quarter' | 'year'

function startOfWeek(d: Date) {
  const x = new Date(d);
  const day = (x.getDay() + 6) % 7; // Monday=0
  x.setDate(x.getDate() - day);
  x.setHours(0, 0, 0, 0);
  return x;
}
function startOfMonth(d: Date) {
  const x = new Date(d.getFullYear(), d.getMonth(), 1);
  x.setHours(0, 0, 0, 0);
  return x;
}
function startOfQuarter(d: Date) {
  const q = Math.floor(d.getMonth() / 3) * 3;
  const x = new Date(d.getFullYear(), q, 1);
  x.setHours(0, 0, 0, 0);
  return x;
}
function startOfYear(d: Date) {
  const x = new Date(d.getFullYear(), 0, 1);
  x.setHours(0, 0, 0, 0);
  return x;
}

function defaultWindowFor(g: Granularity): { from: Date; to: Date } {
  const to = new Date();
  const from = new Date(to);
  switch (g) {
    case "day":
      from.setDate(to.getDate() - 7);
      break;
    case "week":
      from.setDate(to.getDate() - 56);
      break;
    case "month":
      from.setMonth(to.getMonth() - 12);
      break;
    case "quarter":
      from.setMonth(to.getMonth() - 24);
      break;
    case "year":
      from.setFullYear(to.getFullYear() - 5);
      break;
  }
  from.setHours(0, 0, 0, 0);
  to.setHours(23, 59, 59, 999);
  return { from, to };
}

export function FormSubmissions({ projects }: { projects: Project[] }) {
  const { t } = useTranslation();
  // Local series state (isolated from global dashboard)
  const [loading, setLoading] = React.useState<boolean>(false);
  const [items, setItems] = React.useState<
    Array<{ periodStart: string; count: number }>
  >([]);
  const [summaryExtra, setSummaryExtra] = React.useState<{
    totalSubmissions?: number;
    totalServiceDeliveries?: number;
    totalUniqueBeneficiaries?: number;
  } | null>(null);
  const [mostFrequentServices, setMostFrequentServices] = React.useState<
    Array<{ serviceId: string; name: string; count: number }>
  >([]);
  const [showAllServices, setShowAllServices] = React.useState<boolean>(false);
  const [granularity, setGranularity] = React.useState<Granularity>("week");
  const [granularityLocal, setGranularityLocal] = React.useState<
    Granularity | undefined
  >(undefined);

  // Local filters (isolated)
  // Use undefined to indicate "inherit from global"
  const [metricLocal, setMetricLocal] = React.useState<MetricType | undefined>(
    undefined
  );
  const [serviceIdLocal, setServiceIdLocal] = React.useState<
    string | undefined
  >(undefined);
  const [formTemplateIdLocal, setFormTemplateIdLocal] = React.useState<
    string | undefined
  >(undefined);
  const [localStartDate, setLocalStartDate] = React.useState<
    string | undefined
  >(undefined);
  const [localEndDate, setLocalEndDate] = React.useState<string | undefined>(
    undefined
  );

  // Local project/subproject UI state
  const [projectId, setProjectId] = React.useState<string>("");
  const [subprojectId, setSubprojectId] = React.useState<string>("");
  const [hasLocalEntityOverride, setHasLocalEntityOverride] =
    React.useState<boolean>(false);

  // Derived project ID when a global subproject is selected
  const [globalDerivedProjectId, setGlobalDerivedProjectId] =
    React.useState<string>("");

  // Local options
  const [servicesOptions, setServicesOptions] = React.useState<any[]>([]);
  const [templatesOptions, setTemplatesOptions] = React.useState<any[]>([]);
  const [subprojectsOptions, setSubprojectsOptions] = React.useState<any[]>([]);

  // Global filters
  const globalFilters = useSelector(selectMetricsFilters);
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

  // UI state for dropdown + custom range
  const [filtersOpen, setFiltersOpen] = React.useState(false);
  const [customOpen, setCustomOpen] = React.useState(false);
  const [customFrom, setCustomFrom] = React.useState<string>("");
  const [customTo, setCustomTo] = React.useState<string>("");
  const [showMoreLocal, setShowMoreLocal] = React.useState<boolean>(false);
  const [chartType, setChartType] = React.useState<"line" | "bar">("line");
  // Keep dropdowns open when paginating inside them
  const [openServicesSelect, setOpenServicesSelect] = React.useState(false);
  const [openTemplatesSelect, setOpenTemplatesSelect] = React.useState(false);
  // Local pagination state for options
  const [servicesPage, setServicesPage] = React.useState<number>(1);
  const [servicesTotalPages, setServicesTotalPages] = React.useState<number>(1);
  const [templatesPage, setTemplatesPage] = React.useState<number>(1);
  const [templatesTotalPages, setTemplatesTotalPages] =
    React.useState<number>(1);

  const dayFmt = new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
  });
  const monthFmt = new Intl.DateTimeFormat(undefined, {
    month: "short",
    year: "2-digit",
  });

  const formatLabel = (iso: string) => {
    const d = new Date(iso);
    switch ((granularity || "week") as Granularity) {
      case "day":
        return dayFmt.format(d);
      case "week": {
        const monday = startOfWeek(d);
        const startYear = new Date(d.getFullYear(), 0, 1);
        const diffDays = Math.floor(
          (monday.getTime() - startYear.getTime()) / 86400000
        );
        const week = Math.floor(diffDays / 7) + 1;
        return `W${week} ${d.getFullYear()}`;
      }
      case "month":
        return monthFmt.format(d);
      case "quarter":
        return `Q${Math.floor(d.getMonth() / 3) + 1} ${d.getFullYear()}`;
      case "year":
        return String(d.getFullYear());
    }
  };

  const chartData = (items || []).map((it) => ({
    name: formatLabel(it.periodStart),
    value: it.count,
  }));

  const applyQuery = (g: Granularity, from?: Date, to?: Date) => {
    const window = from && to ? { from, to } : defaultWindowFor(g);
    // normalize bounds
    let start = new Date(window.from);
    let end = new Date(window.to);
    switch (g) {
      case "day":
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        break;
      case "week":
        start = startOfWeek(start);
        end.setHours(23, 59, 59, 999);
        break;
      case "month":
        start = startOfMonth(start);
        end.setHours(23, 59, 59, 999);
        break;
      case "quarter":
        start = startOfQuarter(start);
        end.setHours(23, 59, 59, 999);
        break;
      case "year":
        start = startOfYear(start);
        end.setHours(23, 59, 59, 999);
        break;
    }

    // Update local granularity and window; a downstream effect will load series
    setGranularity(g);
    setGranularityLocal(g);
    setLocalStartDate(start.toISOString());
    setLocalEndDate(end.toISOString());
  };

  const onCustomApply = () => {
    if (!customFrom || !customTo) return;
    const from = new Date(customFrom);
    const to = new Date(customTo);
    applyQuery(
      ((granularity as Granularity) || "week") as Granularity,
      from,
      to
    );
    setFiltersOpen(false);
    setCustomOpen(false);
  };

  // Resolve projectId from global subproject when needed
  React.useEffect(() => {
    const { entityId, entityType } = globalFilters as any;
    if (entityType === "subproject" && entityId) {
      (async () => {
        const res = await subProjectService.getSubProjectById({ id: entityId });
        if (res.success && (res.data as any)?.projectId) {
          setGlobalDerivedProjectId((res.data as any).projectId as string);
        } else {
          setGlobalDerivedProjectId("");
        }
      })();
    } else if (entityType === "project") {
      setGlobalDerivedProjectId("");
    } else {
      setGlobalDerivedProjectId("");
    }
  }, [globalFilters]);

  // Effective entity IDs for display and data fetching
  const globalEntityType = globalFilters.entityType as any;
  const globalProjectId =
    globalEntityType === "project"
      ? (globalFilters.entityId as string) || ""
      : globalDerivedProjectId || "";
  const globalSubprojectId =
    globalEntityType === "subproject"
      ? (globalFilters.entityId as string) || ""
      : "";

  const effectiveProjectId = hasLocalEntityOverride
    ? projectId
    : globalProjectId;
  const effectiveSubprojectId = hasLocalEntityOverride
    ? subprojectId
    : globalSubprojectId;

  // Reset services pagination when scope changes (global vs project/subproject)
  React.useEffect(() => {
    setServicesPage(1);
  }, [effectiveProjectId, effectiveSubprojectId]);

  // Load templates with pagination based on effective entity context (scoped when applicable)
  React.useEffect(() => {
    (async () => {
      const params: any = { page: templatesPage, limit: 100 };
      if (effectiveSubprojectId) {
        params.subprojectId = effectiveSubprojectId;
        params.entityType = "subproject";
      } else if (effectiveProjectId) {
        params.projectId = effectiveProjectId;
        params.entityType = "project";
      }
      const res = await formTemplatesApi.getFormTemplates(params);
      if (res.success) {
        const data: any = res.data || {};
        setTemplatesOptions(data.templates || []);
        setTemplatesTotalPages(Number(data.pagination?.totalPages || 1));
      } else {
        setTemplatesOptions([]);
        setTemplatesTotalPages(1);
      }
    })();
  }, [effectiveProjectId, effectiveSubprojectId, templatesPage]);

  // Fetch subprojects when effective project changes
  React.useEffect(() => {
    if (!effectiveProjectId) {
      setSubprojectsOptions([]);
      return;
    }
    (async () => {
      const res = await subProjectService.getSubProjectsByProjectId({
        projectId: effectiveProjectId,
      });
      if (res.success) {
        let options = res.data as any[];
        if (isSubProjectManager) {
          try {
            const proj = (userProjectsTree || []).find(
              (p: any) => p.id === effectiveProjectId
            );
            const allowed = new Set<string>(
              (proj?.subprojects || []).map((sp: any) => sp.id)
            );
            options = options.filter((sp: any) => allowed.has(sp.id));
          } catch {}
        }
        setSubprojectsOptions(options);
      }
    })();
  }, [effectiveProjectId, isSubProjectManager, userProjectsTree]);

  // Reset local overrides whenever global filters change so globals take precedence again
  React.useEffect(() => {
    setHasLocalEntityOverride(false);
    setProjectId("");
    setSubprojectId("");
    setMetricLocal(undefined);
    setServiceIdLocal(undefined);
    setFormTemplateIdLocal(undefined);
    setLocalStartDate(undefined);
    setLocalEndDate(undefined);
    setGranularityLocal(undefined);
  }, [globalFilters]);

  // Fetch services when effective entity selection changes (local overrides take precedence, else global) with pagination
  React.useEffect(() => {
    (async () => {
      const effectiveEntityType = effectiveSubprojectId
        ? "subproject"
        : effectiveProjectId
        ? "project"
        : (globalFilters.entityType as any) || undefined;
      const effectiveEntityId =
        effectiveSubprojectId ||
        effectiveProjectId ||
        globalFilters.entityId ||
        undefined;
      if (effectiveEntityType && effectiveEntityId) {
        const res = await servicesService.getEntityServices({
          entityId: effectiveEntityId,
          entityType: effectiveEntityType,
        });
        if (res.success) {
          setServicesOptions(res.items || []);
          setServicesTotalPages(1);
        }
      } else {
        const res = await servicesService.getAllServices({
          page: servicesPage,
          limit: 100,
        });
        if (res.success) {
          setServicesOptions(res.items || []);
          setServicesTotalPages(Number((res as any).totalPages || 1));
        }
      }
    })();
  }, [
    effectiveProjectId,
    effectiveSubprojectId,
    globalFilters.entityId,
    globalFilters.entityType,
    servicesPage,
  ]);

  // Build merged params from global + local overrides
  function buildMergedParams() {
    const effectiveGroupBy: any =
      (granularityLocal as any) || globalFilters.groupBy || "month";
    const startDate = localStartDate || globalFilters.startDate;
    const endDate = localEndDate || globalFilters.endDate;
    const effMetric = (metricLocal ||
      globalFilters.metric ||
      "submissions") as MetricType;
    const effServiceId =
      serviceIdLocal !== undefined
        ? serviceIdLocal || undefined
        : globalFilters.serviceId;
    const effFormTemplateId =
      formTemplateIdLocal !== undefined
        ? formTemplateIdLocal || undefined
        : globalFilters.formTemplateId;
    const effEntityId = subprojectId || projectId || globalFilters.entityId;
    const effEntityType = (
      subprojectId
        ? "subproject"
        : projectId
        ? "project"
        : globalFilters.entityType
    ) as any;
    return {
      groupBy: effectiveGroupBy,
      startDate,
      endDate,
      metric: effMetric,
      serviceId: effServiceId,
      formTemplateId: effFormTemplateId,
      entityId: effEntityId,
      entityType: effEntityType,
    } as any;
  }

  async function loadSeriesMerged() {
    const params = buildMergedParams();
    try {
      setLoading(true);
      const res = await serviceMetricsService.getDeliveriesSeries(params);
      if (res.success) {
        setItems(res.items || []);
        setSummaryExtra((res as any).summary || null);
        setMostFrequentServices((res as any).mostFrequentServices || []);
        setGranularity(
          (res.granularity as Granularity) ||
            (params.groupBy as Granularity) ||
            granularity
        );
      } else {
        setItems([]);
        setSummaryExtra(null);
        setMostFrequentServices([]);
      }
    } finally {
      setLoading(false);
    }
  }

  // Re-fetch when global or local filters change (merged with locals)
  React.useEffect(() => {
    loadSeriesMerged();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    globalFilters,
    projectId,
    subprojectId,
    metricLocal,
    serviceIdLocal,
    formTemplateIdLocal,
    localStartDate,
    localEndDate,
    granularityLocal,
  ]);

  // Build cards from summary totals + most frequent services
  const cardsData: Array<{
    title: string;
    value: number;
    type: "summary" | "service";
  }> = [];

  if (summaryExtra) {
    if (typeof summaryExtra.totalSubmissions === "number") {
      cardsData.push({
        title: t("dashboard.totalSubmissions"),
        value: Number(summaryExtra.totalSubmissions || 0),
        type: "summary",
      });
    }
    if (typeof summaryExtra.totalServiceDeliveries === "number") {
      cardsData.push({
        title: t("dashboard.totalServiceDeliveries"),
        value: Number(summaryExtra.totalServiceDeliveries || 0),
        type: "summary",
      });
    }
    if (typeof summaryExtra.totalUniqueBeneficiaries === "number") {
      cardsData.push({
        title: t("dashboard.totalUniqueBeneficiaries"),
        value: Number(summaryExtra.totalUniqueBeneficiaries || 0),
        type: "summary",
      });
    }
  }

  const svcSource =
    mostFrequentServices && mostFrequentServices.length > 0
      ? mostFrequentServices
      : (summaryExtra as any)?.mostFrequentServices || [];
  (svcSource || [])
    .slice() // copy before sort
    .sort((a: any, b: any) => Number(b?.count || 0) - Number(a?.count || 0))
    .forEach((svc: any) => {
      cardsData.push({
        title: svc.name || svc.serviceName || t("dashboard.service"),
        value: Number(svc.count || 0),
        type: "service",
      });
    });

  const maxServiceCards = 8;
  const summaryCards = cardsData.filter((c) => c.type === "summary");
  const serviceCards = cardsData.filter((c) => c.type === "service");
  const displayedCards = [
    ...summaryCards,
    ...(showAllServices
      ? serviceCards
      : serviceCards.slice(0, maxServiceCards)),
  ];

  return (
    <Card className="mb-6 bg-[#F7F9FB]   drop-shadow-md shadow-gray-50 border-0">
      <CardHeader>
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full lg:w-auto">
            <CardTitle className="text-lg sm:text-xl">
              {(metricLocal || globalFilters.metric) === "serviceDeliveries"
                ? t("dashboard.serviceDeliveriesOverview")
                : (metricLocal || globalFilters.metric) ===
                  "uniqueBeneficiaries"
                ? t("dashboard.uniqueBeneficiariesOverview")
                : t("dashboard.formSubmissionsOverview")}
            </CardTitle>

            <Tabs
              className="w-full sm:w-[220px] bg-blue-50 p-1 rounded-full"
              value={chartType}
              onValueChange={(value) => setChartType(value as "line" | "bar")}
            >
              <TabsList className=" grid w-full grid-cols-2 rounded-full  ">
                <TabsTrigger
                  value="line"
                  className=" data-[state=active]:bg-[#0073e6] rounded-full data-[state=active]:text-white"
                >
                  {t("dashboard.lineChart")}
                </TabsTrigger>
                <TabsTrigger
                  value="bar"
                  className=" data-[state=active]:bg-[#0073e6] rounded-full data-[state=active]:text-white"
                >
                  {t("dashboard.barChart")}
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          {/* Local-only filters for Form Submissions: project/subproject always visible; others hidden behind 'More Filters' */}
          <div className="flex flex-col gap-2 w-full lg:w-auto">
            <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2 sm:gap-3">
              {/* Project (local override) */}
              <Select
                value={
                  hasLocalEntityOverride
                    ? projectId || "all"
                    : globalProjectId || "all"
                }
                onValueChange={(v) => {
                  const id = v === "all" ? "" : v;
                  setProjectId(id);
                  setSubprojectId("");
                  setHasLocalEntityOverride(id !== "");
                  // Clear dependent local filters when switching entity
                  setServiceIdLocal(undefined);
                  setFormTemplateIdLocal(undefined);
                }}
              >
                <SelectTrigger
                  className="w-full sm:w-[180px] bg-white p-2 rounded-md border-gray-100
             transition-transform duration-200 ease-in-out
             hover:scale-[1.02] hover:-translate-y-[1px]"
                >
                  <SelectValue placeholder={t("common.selectProject")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("common.allProjects")}</SelectItem>
                  {(projects || []).map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Subproject (local override) */}
              <Select
                value={
                  hasLocalEntityOverride
                    ? subprojectId || "all"
                    : globalSubprojectId || "all"
                }
                onValueChange={(v) => {
                  const id = v === "all" ? "" : v;
                  setSubprojectId(id);
                  setHasLocalEntityOverride(id !== "" || projectId !== "");
                  // Clear dependent local filters when switching entity
                  setServiceIdLocal(undefined);
                  setFormTemplateIdLocal(undefined);
                }}
                disabled={!effectiveProjectId}
              >
                <SelectTrigger
                  className="w-full sm:w-[180px] bg-white p-2 rounded-md border-gray-100
             transition-transform duration-200 ease-in-out
             hover:scale-[1.02] hover:-translate-y-[1px]"
                >
                  <SelectValue
                    placeholder={t("subProjects.selectSubProject")}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {t("subProjects.allSubProjects")}
                  </SelectItem>
                  {subprojectsOptions
                    .filter((sp) => sp.projectId === effectiveProjectId)
                    .map((sp) => (
                      <SelectItem key={sp.id} value={sp.id}>
                        {sp.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowMoreLocal((s) => !s)}
                className="w-full sm:w-auto bg-[#E0F2FE] text-black border-0 transition-transform duration-200 ease-in-out hover:scale-105 hover:-translate-y-[1px]"
              >
                <Filter className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">
                  {showMoreLocal
                    ? t("dashboard.hideFilters")
                    : t("dashboard.moreFilters")}
                </span>
                <span className="sm:hidden">
                  {showMoreLocal ? "Hide" : "More"}
                </span>
              </Button>
            </div>

            {showMoreLocal && (
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                {/* Metric (local override; inherits global if unset) */}
                <Select
                  value={
                    (metricLocal ||
                      globalFilters.metric ||
                      "submissions") as string
                  }
                  onValueChange={(v) => {
                    setMetricLocal(v as MetricType);
                  }}
                >
                  <SelectTrigger
                    className="w-full sm:w-[180px] bg-white p-2 rounded-md border-gray-100
             transition-transform duration-200 ease-in-out
             hover:scale-[1.02] hover:-translate-y-[1px]"
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
                      {t("dashboard.uniqueBeneficiaries")}
                    </SelectItem>
                  </SelectContent>
                </Select>

                {/* Service (local override; inherits global if unset) */}
                <Select
                  open={openServicesSelect}
                  onOpenChange={setOpenServicesSelect}
                  value={
                    (serviceIdLocal ??
                      globalFilters.serviceId ??
                      "all") as string
                  }
                  onValueChange={(v) => {
                    if (v === "__svc_prev__" || v === "__svc_next__") {
                      if (!effectiveProjectId && !effectiveSubprojectId) {
                        const nextPage =
                          v === "__svc_prev__"
                            ? Math.max(1, servicesPage - 1)
                            : Math.min(
                                servicesTotalPages || 1,
                                servicesPage + 1
                              );
                        setServicesPage(nextPage);
                        setOpenServicesSelect(true);
                      }
                      return;
                    }
                    const id = v === "all" ? "" : v;
                    setServiceIdLocal(id || undefined);
                  }}
                >
                  <SelectTrigger
                    className="w-full sm:w-[180px] bg-white p-2 rounded-md border-gray-100
             transition-transform duration-200 ease-in-out
             hover:scale-[1.02] hover:-translate-y-[1px]"
                  >
                    <SelectValue placeholder={t("dashboard.service")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      {t("dashboard.allServices")}
                    </SelectItem>
                    {servicesOptions.map((s: any) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                    {/* Pagination controls for services when not scoped to entity */}
                    {!effectiveProjectId && !effectiveSubprojectId && (
                      <>
                        <SelectItem
                          value="__svc_prev__"
                          disabled={servicesPage <= 1}
                        >
                          ◀ Prev Page
                        </SelectItem>
                        <SelectItem value="__svc_info__" disabled>
                          Page {servicesPage} of {servicesTotalPages || 1}
                        </SelectItem>
                        <SelectItem
                          value="__svc_next__"
                          disabled={servicesPage >= (servicesTotalPages || 1)}
                        >
                          Next Page ▶
                        </SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>

                {/* Form Template (local override; inherits global if unset) */}
                <Select
                  open={openTemplatesSelect}
                  onOpenChange={setOpenTemplatesSelect}
                  value={
                    (formTemplateIdLocal ??
                      globalFilters.formTemplateId ??
                      "all") as string
                  }
                  onValueChange={(v) => {
                    if (v === "__tpl_prev__" || v === "__tpl_next__") {
                      const nextPage =
                        v === "__tpl_prev__"
                          ? Math.max(1, templatesPage - 1)
                          : Math.min(
                              templatesTotalPages || 1,
                              templatesPage + 1
                            );
                      setTemplatesPage(nextPage);
                      setOpenTemplatesSelect(true);
                      return;
                    }
                    const id = v === "all" ? "" : v;
                    setFormTemplateIdLocal(id || undefined);
                  }}
                >
                  <SelectTrigger
                    className="w-full sm:w-[180px] bg-white p-2 rounded-md border-gray-100
             transition-transform duration-200 ease-in-out
             hover:scale-[1.02] hover:-translate-y-[1px]"
                  >
                    <SelectValue placeholder={t("dashboard.formTemplate")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      {t("dashboard.allTemplates")}
                    </SelectItem>
                    {templatesOptions.map((t: any) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}
                      </SelectItem>
                    ))}
                    {/* Pagination controls for templates */}
                    <SelectItem
                      value="__tpl_prev__"
                      disabled={templatesPage <= 1}
                    >
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

                {/* Granularity dropdown */}
                <div className="relative w-full sm:w-auto">
                  <button
                    onClick={() => setFiltersOpen((s) => !s)}
                    className="w-full sm:w-auto px-3 py-1.5 rounded-md text-sm bg-[#E0F2FE] flex items-center justify-between sm:justify-start gap-2"
                  >
                    <span>
                      {" "}
                      <span className="capitalize font-medium">
                        {(granularity as Granularity) || "week"}
                      </span>
                    </span>
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  {filtersOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-lg p-1 z-10">
                      <ul className="py-1">
                        {(
                          [
                            "day",
                            "week",
                            "month",
                            "quarter",
                            "year",
                          ] as Granularity[]
                        ).map((g) => (
                          <li key={g}>
                            <button
                              onClick={() => {
                                applyQuery(g);
                                setCustomOpen(false);
                                setFiltersOpen(false);
                              }}
                              className={[
                                "w-full text-left px-3 py-2 text-sm rounded-md capitalize transition-transform duration-200 ease-in-out",
                                granularity === g
                                  ? "bg-[#E5ECF6] text-gray-900 scale-[1.02] -translate-y-[1px]"
                                  : "hover:bg-gray-50 hover:scale-[1.02] hover:-translate-y-[1px]",
                              ].join(" ")}
                            >
                              {g}
                            </button>
                          </li>
                        ))}
                        <li className="my-1 border-t border-gray-100" />
                        <li>
                          <button
                            onClick={() => setCustomOpen((s) => !s)}
                            className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-50"
                          >
                            Custom range…
                          </button>
                          {customOpen && (
                            <div className="px-3 pb-2">
                              <div className="grid grid-cols-1 gap-2">
                                <label className="text-xs text-gray-600">
                                  From
                                  <input
                                    type="date"
                                    className="mt-1 w-full border rounded-md px-2 py-1 text-sm"
                                    value={customFrom}
                                    onChange={(e) =>
                                      setCustomFrom(e.target.value)
                                    }
                                  />
                                </label>
                                <label className="text-xs text-gray-600">
                                  To
                                  <input
                                    type="date"
                                    className="mt-1 w-full border rounded-md px-2 py-1 text-sm"
                                    value={customTo}
                                    onChange={(e) =>
                                      setCustomTo(e.target.value)
                                    }
                                  />
                                </label>
                                <div className="flex justify-end gap-2 pt-1">
                                  <button
                                    onClick={() => setCustomOpen(false)}
                                    className="px-3 py-1.5 rounded-md text-sm border border-gray-200"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={onCustomApply}
                                    className="px-3 py-1.5 rounded-md text-sm bg-black text-white"
                                  >
                                    Apply
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        {/* Chart */}
        <div className="h-48 sm:h-64 md:h-80 mt-4">
          {loading ? (
            <div className="h-full w-full flex items-center justify-center text-sm text-gray-600">
              Loading…
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={chartData}
                barCategoryGap="25%"
                barGap={2}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <defs>
                  <linearGradient
                    id="submissionsFill"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="barFill" x1="0" y1="0" x2="0" y2="1">
                    {/* Stronger color at top, subtle fade towards bottom */}
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.95} />
                    <stop offset="60%" stopColor="#3b82f6" stopOpacity={0.68} />
                    <stop
                      offset="100%"
                      stopColor="#3b82f6"
                      stopOpacity={0.26}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#6b7280" }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#6b7280" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "0.5rem",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
                {chartType === "line" ? (
                  <>
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="none"
                      fill="url(#submissionsFill)"
                      fillOpacity={1}
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 6, fill: "#3b82f6" }}
                    />
                  </>
                ) : (
                  <Bar
                    dataKey="value"
                    fill="url(#barFill)"
                    // No stroke; rely on gradient top being strong
                    barSize={100}
                    radius={[6, 6, 0, 0]}
                  />
                )}
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="all">
          <div className="flex items-center justify-between mb-4">
            <TabsList className="flex gap-2">
              <TabsTrigger value="all">{t("common.all")}</TabsTrigger>
              <TabsTrigger value="summary">
                {t("dashboard.summary")}
              </TabsTrigger>
              <TabsTrigger value="services">
                {t("dashboard.services")}
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="all">
            <div className="grid grid-cols-1 md:grid-cols-2   lg:grid-cols-4 gap-4">
              {displayedCards.map((card, index) => (
                <div key={index} className="p-4  bg-[#B1E3FF] rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4
                      className="font-medium text-sm truncate"
                      title={card.title}
                    >
                      {card.title}
                    </h4>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <div className="text-2xl">{card.value}</div>
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-600">
                        {card.type === "summary"
                          ? t("dashboard.summary")
                          : t("dashboard.mostFrequentService")}
                      </div>
                      <Badge
                        variant={
                          card.type === "summary" ? "default" : "secondary"
                        }
                        className={`text-xs ${
                          card.type === "summary"
                            ? "bg-[#DEF8EE] text-[#4AA785]"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {card.type === "summary" ? "summary" : "service"}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {serviceCards.length > maxServiceCards && (
              <div className="flex justify-center mt-4">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowAllServices((s) => !s)}
                  className="bg-blue-200/40 text-blue-700 hover:bg-blue-200/60"
                >
                  {showAllServices ? "Show less" : "Show more services"}
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="summary">
            <div className="grid grid-cols-1 md:grid-cols-2   lg:grid-cols-4 gap-4">
              {summaryCards.map((card, index) => (
                <div key={index} className="p-4  bg-[#B1E3FF] rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4
                      className="font-medium text-sm truncate"
                      title={card.title}
                    >
                      {card.title}
                    </h4>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <div className="text-2xl">{card.value}</div>
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-600">
                        {t("dashboard.summary")}
                      </div>
                      <Badge
                        variant="default"
                        className="text-xs bg-[#DEF8EE] text-[#4AA785]"
                      >
                        summary
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="services">
            <div className="grid grid-cols-1 md:grid-cols-2   lg:grid-cols-4 gap-4">
              {(showAllServices
                ? serviceCards
                : serviceCards.slice(0, maxServiceCards)
              ).map((card, index) => (
                <div key={index} className="p-4  bg-[#B1E3FF] rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4
                      className="font-medium text-sm truncate"
                      title={card.title}
                    >
                      {card.title}
                    </h4>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <div className="text-2xl">{card.value}</div>
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-600">
                        Most Frequent Service
                      </div>
                      <Badge
                        variant="secondary"
                        className="text-xs bg-blue-100 text-blue-700"
                      >
                        service
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {serviceCards.length > maxServiceCards && (
              <div className="flex justify-center mt-4">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowAllServices((s) => !s)}
                  className="bg-blue-200/40 text-blue-700 hover:bg-blue-200/60"
                >
                  {showAllServices ? "Show less" : "Show more services"}
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
