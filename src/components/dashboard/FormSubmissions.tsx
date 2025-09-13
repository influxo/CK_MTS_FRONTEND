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
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useDispatch, useSelector } from "react-redux";
import {
  selectSeries,
  fetchDeliveriesSeries,
} from "../../store/slices/serviceMetricsSlice";
import type { TimeUnit } from "../../services/services/serviceMetricsModels";

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

export function FormSubmissions() {
  const dispatch: any = useDispatch();
  const series = useSelector(selectSeries);
  const { loading, items, granularity } = series;

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
    submissions: it.count,
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

    dispatch(
      // @ts-ignore untyped dispatch
      fetchDeliveriesSeries({
        groupBy: g,
        startDate: start.toISOString(),
        endDate: end.toISOString(),
      })
    );
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

  React.useEffect(() => {
    if (!items?.length && !loading) {
      applyQuery((granularity as Granularity) || "week");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
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
          <CardTitle>Form Submissions Overview</CardTitle>
          {/* Granularity dropdown */}
          <div className=" flex flex-wrap items-center  gap-3">
            <Select>
              <SelectTrigger className="w-[200px] bg-black/5 text-black border-0">
                <SelectValue placeholder="Project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                <SelectItem value="project-a">Project A</SelectItem>
                <SelectItem value="project-b">Project B</SelectItem>
              </SelectContent>
            </Select>

            <Select>
              <SelectTrigger className="w-[220px] bg-black/5 text-black border-0">
                <SelectValue placeholder="Subproject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subprojects</SelectItem>
                <SelectItem value="sp-1">Subproject 1</SelectItem>
                <SelectItem value="sp-2">Subproject 2</SelectItem>
              </SelectContent>
            </Select>

            <Select>
              <SelectTrigger className="w-[220px] bg-black/5 text-black border-0">
                <SelectValue placeholder="Beneficiary" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Beneficiaries</SelectItem>
                <SelectItem value="b-1">Beneficiary 1</SelectItem>
                <SelectItem value="b-2">Beneficiary 2</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="relative">
            <button
              onClick={() => setFiltersOpen((s) => !s)}
              className="px-3 py-1.5 rounded-md text-sm bg-black/5 text-black hover:bg-black/20 flex items-center gap-2"
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
                          "w-full text-left px-3 py-2 text-sm rounded-md capitalize",
                          granularity === g
                            ? "bg-[#E5ECF6] text-gray-900"
                            : "hover:bg-gray-50",
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
        {/* Lightweight UI-only filters */}
        {/* <div className="mt-3 flex flex-wrap items-center gap-3">
          <Select>
            <SelectTrigger className="w-[200px] bg-black/5 text-black border-0">
              <SelectValue placeholder="Project" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              <SelectItem value="project-a">Project A</SelectItem>
              <SelectItem value="project-b">Project B</SelectItem>
            </SelectContent>
          </Select>

          <Select>
            <SelectTrigger className="w-[220px] bg-black/5 text-black border-0">
              <SelectValue placeholder="Subproject" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subprojects</SelectItem>
              <SelectItem value="sp-1">Subproject 1</SelectItem>
              <SelectItem value="sp-2">Subproject 2</SelectItem>
            </SelectContent>
          </Select>

          <Select>
            <SelectTrigger className="w-[220px] bg-black/5 text-black border-0">
              <SelectValue placeholder="Beneficiary" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Beneficiaries</SelectItem>
              <SelectItem value="b-1">Beneficiary 1</SelectItem>
              <SelectItem value="b-2">Beneficiary 2</SelectItem>
            </SelectContent>
          </Select>
        </div> */}
        <div className="h-64 mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
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
              <Line
                type="monotone"
                dataKey="submissions"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6, fill: "#3b82f6" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2   lg:grid-cols-4 gap-4">
          {submissions.map((submission, index) => (
            <div key={index} className="p-4  bg-[#E5ECF6] rounded-lg">
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
