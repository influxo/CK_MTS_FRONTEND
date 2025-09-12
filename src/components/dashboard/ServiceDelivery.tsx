import * as React from "react";
import { ChevronDown } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../ui/data-display/card";
import { Badge } from "../ui/data-display/badge";
import { useDispatch, useSelector } from "react-redux";
import {
  selectSeries,
  fetchDeliveriesSeries,
} from "../../store/slices/serviceMetricsSlice";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
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
  return { from, to };
}

export function ServiceDelivery() {
  const dispatch: any = useDispatch();
  const series = useSelector(selectSeries);
  const { loading, error, items, granularity } = series;

  // local UI state for custom range
  const [customOpen, setCustomOpen] = React.useState(false);
  const [customFrom, setCustomFrom] = React.useState<string>("");
  const [customTo, setCustomTo] = React.useState<string>("");
  const [filtersOpen, setFiltersOpen] = React.useState(false);

  const formatLabel = (iso: string) => {
    const d = new Date(iso);
    const monthFmt = new Intl.DateTimeFormat(undefined, {
      month: "short",
      year: "numeric",
      day: undefined,
    } as any);
    const dayFmt = new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "numeric",
    });
    const yearFmt = new Intl.DateTimeFormat(undefined, { year: "numeric" });

    switch (granularity) {
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
        return yearFmt.format(d);
      default:
        return d.toLocaleDateString();
    }
  };

  const chartData = (items || []).map((it) => ({
    name: formatLabel(it.periodStart),
    deliveries: it.count,
  }));

  const applyQuery = (g: Granularity, from?: Date, to?: Date) => {
    const window = from && to ? { from, to } : defaultWindowFor(g);
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

    // ✅ Dispatch the correct thunk from the store slice
    dispatch(
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
    applyQuery((granularity as Granularity) || "week", from, to);
    setCustomOpen(false);
  };

  React.useEffect(() => {
    if (!items?.length && !loading) {
      applyQuery((granularity as Granularity) || "week");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const g = (granularity || "week") as Granularity;

  return (
    <Card className="bg-[#F7F9FB] drop-shadow-sm shadow-gray-50 border-0">
      <CardHeader>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <CardTitle>Service Deliveries Over Time</CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                onClick={() => setFiltersOpen((s) => !s)}
                className="px-3 py-1.5 rounded-md text-sm   bg-black/5 text-black hover:bg-black/20 flex items-center gap-2"
              >
                <span>
                  Granularity:{" "}
                  <span className="capitalize font-medium">{g}</span>
                </span>
                <ChevronDown className="h-4 w-4" />
              </button>
              {filtersOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-lg p-1 z-10">
                  <ul className="py-1">
                    <li>
                      <button
                        onClick={() => {
                          applyQuery("day");
                          setCustomOpen(false);
                          setFiltersOpen(false);
                        }}
                        className={[
                          "w-full text-left px-3 py-2 text-sm rounded-md",
                          g === "day"
                            ? "bg-[#E5ECF6] text-gray-900"
                            : "hover:bg-gray-50",
                        ].join(" ")}
                      >
                        Day
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => {
                          applyQuery("week");
                          setCustomOpen(false);
                          setFiltersOpen(false);
                        }}
                        className={[
                          "w-full text-left px-3 py-2 text-sm rounded-md",
                          g === "week"
                            ? "bg-[#E5ECF6] text-gray-900"
                            : "hover:bg-gray-50",
                        ].join(" ")}
                      >
                        Week
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => {
                          applyQuery("month");
                          setCustomOpen(false);
                          setFiltersOpen(false);
                        }}
                        className={[
                          "w-full text-left px-3 py-2 text-sm rounded-md",
                          g === "month"
                            ? "bg-[#E5ECF6] text-gray-900"
                            : "hover:bg-gray-50",
                        ].join(" ")}
                      >
                        Month
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => {
                          applyQuery("quarter");
                          setCustomOpen(false);
                          setFiltersOpen(false);
                        }}
                        className={[
                          "w-full text-left px-3 py-2 text-sm rounded-md",
                          g === "quarter"
                            ? "bg-[#E5ECF6] text-gray-900"
                            : "hover:bg-gray-50",
                        ].join(" ")}
                      >
                        Quarter
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => {
                          applyQuery("year");
                          setCustomOpen(false);
                          setFiltersOpen(false);
                        }}
                        className={[
                          "w-full text-left px-3 py-2 text-sm rounded-md",
                          g === "year"
                            ? "bg-[#E5ECF6] text-gray-900"
                            : "hover:bg-gray-50",
                        ].join(" ")}
                      >
                        Year
                      </button>
                    </li>
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
                                onClick={() => {
                                  onCustomApply();
                                  setFiltersOpen(false);
                                }}
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

            {/* <Badge variant="secondary" className="text-xs capitalize">
              {g}
            </Badge> */}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="h-64 flex items-center justify-center">Loading…</div>
        ) : error ? (
          <div className="h-64 flex items-center justify-center text-red-600 text-sm">
            {error}
          </div>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="deliveries"
                  stroke="#0ea5e9"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 5, fill: "#0ea5e9" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
