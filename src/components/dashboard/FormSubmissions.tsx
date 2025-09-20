import * as React from "react";
import {
  MoreHorizontal,
  TrendingDown,
  TrendingUp,
  ChevronDown,
} from "lucide-react";

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
import formService from "../../services/forms/formService";
import subProjectService from "../../services/subprojects/subprojectService";
import type { Project } from "../../services/projects/projectModels";
import { useSelector } from "react-redux";
import { selectMetricsFilters } from "../../store/slices/serviceMetricsSlice";

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
  // Local series state (isolated from global dashboard)
  const [loading, setLoading] = React.useState<boolean>(false);
  const [items, setItems] = React.useState<
    Array<{ periodStart: string; count: number }>
  >([]);
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

  // UI state for dropdown + custom range
  const [filtersOpen, setFiltersOpen] = React.useState(false);
  const [customOpen, setCustomOpen] = React.useState(false);
  const [customFrom, setCustomFrom] = React.useState<string>("");
  const [customTo, setCustomTo] = React.useState<string>("");

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

  // Initial load: inherit global filters for defaults
  React.useEffect(() => {
    // Load templates
    (async () => {
      const forms = await formService.getForms();
      const templates = (forms?.data as any)?.templates || forms?.data || [];
      setTemplatesOptions(templates || []);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      ? ((globalFilters.entityId as string) || "")
      : globalDerivedProjectId || "";
  const globalSubprojectId =
    globalEntityType === "subproject"
      ? ((globalFilters.entityId as string) || "")
      : "";

  const effectiveProjectId = hasLocalEntityOverride
    ? projectId
    : globalProjectId;
  const effectiveSubprojectId = hasLocalEntityOverride
    ? subprojectId
    : globalSubprojectId;

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
      if (res.success) setSubprojectsOptions(res.data);
    })();
  }, [effectiveProjectId]);

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

  // Fetch services when effective entity selection changes (local overrides take precedence, else global)
  React.useEffect(() => {
    (async () => {
      const effectiveEntityType = effectiveSubprojectId
        ? "subproject"
        : effectiveProjectId
        ? "project"
        : (globalFilters.entityType as any) || undefined;
      const effectiveEntityId =
        effectiveSubprojectId || effectiveProjectId || globalFilters.entityId || undefined;
      if (effectiveEntityType && effectiveEntityId) {
        const res = await servicesService.getEntityServices({
          entityId: effectiveEntityId,
          entityType: effectiveEntityType,
        });
        if (res.success) setServicesOptions(res.items || []);
      } else {
        const res = await servicesService.getAllServices({
          page: 1,
          limit: 100,
        });
        if (res.success) setServicesOptions(res.items || []);
      }
    })();
  }, [
    effectiveProjectId,
    effectiveSubprojectId,
    globalFilters.entityId,
    globalFilters.entityType,
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
        setGranularity(
          (res.granularity as Granularity) ||
            (params.groupBy as Granularity) ||
            granularity
        );
      } else {
        setItems([]);
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
  const submissions = [
    {
      form: "Healthcare Assessment",
      submissions: 342,
      change: 12,
      trend: "up",
      status: "active",
    },
    {
      form: "Education Survey",
      submissions: 198,
      change: -5,
      trend: "down",
      status: "active",
    },
    {
      form: "Water Quality Report",
      submissions: 89,
      change: 23,
      trend: "up",
      status: "pending",
    },
    {
      form: "Community Feedback",
      submissions: 156,
      change: 8,
      trend: "up",
      status: "active",
    },
  ];

  return (
    <Card className="mb-6 bg-[#F7F9FB]   drop-shadow-md shadow-gray-50 border-0">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>
            {(metricLocal || globalFilters.metric) === "serviceDeliveries"
              ? "Service Deliveries Overview"
              : (metricLocal || globalFilters.metric) === "uniqueBeneficiaries"
              ? "Unique Beneficiaries Overview"
              : "Form Submissions Overview"}
          </CardTitle>
          {/* Local-only filters for Form Submissions: project/subproject + metric/service/template */}
          <div className=" flex flex-wrap items-center  gap-3">
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
              <SelectTrigger className="w-[200px] bg-blue-200/30 border-0 hover:scale-[1.02] hover:-translate-y-[1px]">
                <SelectValue placeholder="Project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
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
              <SelectTrigger className="w-[220px] bg-blue-200/30   border-0 hover:scale-[1.02] hover:-translate-y-[1px]">
                <SelectValue placeholder="Subproject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subprojects</SelectItem>
                {subprojectsOptions
                  .filter((sp) => sp.projectId === effectiveProjectId)
                  .map((sp) => (
                    <SelectItem key={sp.id} value={sp.id}>
                      {sp.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>

          {/* Metric (local override; inherits global if unset) */}
          <Select
            value={
              (metricLocal || globalFilters.metric || "submissions") as string
            }
            onValueChange={(v) => {
              setMetricLocal(v as MetricType);
            }}
          >
            <SelectTrigger
              className="w-[220px] bg-blue-200/30 p-2 rounded-md border-0 transition-transform duration-200 ease-in-out hover:scale-[1.02] hover:-translate-y-[1px]"
            >
              <SelectValue placeholder="Beneficiary" />
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

            {/* Service (local override; inherits global if unset) */}
            <Select
              value={
                (serviceIdLocal ?? globalFilters.serviceId ?? "all") as string
              }
              onValueChange={(v) => {
                const id = v === "all" ? "" : v;
                setServiceIdLocal(id || undefined);
              }}
            >
              <SelectTrigger className="w-[200px] bg-blue-200/30 border-0 hover:scale-[1.02] hover:-translate-y-[1px]">
                <SelectValue placeholder="Service" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Services</SelectItem>
                {servicesOptions.map((s: any) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Form Template (local override; inherits global if unset) */}
            <Select
              value={
                (formTemplateIdLocal ??
                  globalFilters.formTemplateId ??
                  "all") as string
              }
              onValueChange={(v) => {
                const id = v === "all" ? "" : v;
                setFormTemplateIdLocal(id || undefined);
              }}
            >
              <SelectTrigger className="w-[200px] bg-blue-200/30 border-0 hover:scale-[1.02] hover:-translate-y-[1px]">
                <SelectValue placeholder="Form Template" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Templates</SelectItem>
                {templatesOptions.map((t: any) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="relative">
            <button
              onClick={() => setFiltersOpen((s) => !s)}
              className="px-3 py-1.5 rounded-md text-sm bg-blue-200 text-blue-600 hover:bg-blue-200/30 flex items-center gap-2"
            >
              <span>
                Granularity:{" "}
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
                    ["day", "week", "month", "quarter", "year"] as Granularity[]
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
                              onChange={(e) => setCustomFrom(e.target.value)}
                            />
                          </label>
                          <label className="text-xs text-gray-600">
                            To
                            <input
                              type="date"
                              className="mt-1 w-full border rounded-md px-2 py-1 text-sm"
                              value={customTo}
                              onChange={(e) => setCustomTo(e.target.value)}
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
        {/* Chart */}
        <div className="h-64 mt-4">
          {loading ? (
            <div className="h-full w-full flex items-center justify-center text-sm text-gray-600">
              Loading…
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={chartData}
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
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2   lg:grid-cols-4 gap-4">
          {submissions.map((submission, index) => (
            <div key={index} className="p-4  bg-[#B1E3FF] rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-sm">{submission.form}</h4>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-2">
                <div className="text-2xl">{submission.submissions}</div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-xs">
                    {submission.trend === "up" ? (
                      <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                    ) : (
                      <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
                    )}
                    {Math.abs(submission.change)}% this week
                  </div>
                  <Badge
                    variant={
                      submission.status === "active" ? "default" : "secondary"
                    }
                    className={`text-xs ${
                      submission.status === "active"
                        ? "bg-[#DEF8EE] text-[#4AA785]"
                        : submission.status === "pending"
                        ? "bg-amber-100 text-amber-700"
                        : ""
                    }`}
                  >
                    {submission.status}
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
