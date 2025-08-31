import * as React from "react";
import { MoreHorizontal, TrendingDown, TrendingUp } from "lucide-react";

import { Badge } from "../ui/data-display/badge";
import { Button } from "../ui/button/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../ui/data-display/card";
import { Tabs, TabsList, TabsTrigger } from "../ui/navigation/tabs";
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
import { selectSeries, fetchDeliveriesSeries } from "../../store/slices/serviceMetricsSlice";
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

  const dayFmt = new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" });
  const monthFmt = new Intl.DateTimeFormat(undefined, { month: "short", year: "2-digit" });

  const formatLabel = (iso: string) => {
    const d = new Date(iso);
    switch ((granularity || "week") as Granularity) {
      case "day":
        return dayFmt.format(d);
      case "week": {
        const monday = startOfWeek(d);
        const startYear = new Date(d.getFullYear(), 0, 1);
        const diffDays = Math.floor((monday.getTime() - startYear.getTime()) / 86400000);
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

  const applyQuery = (g: Granularity) => {
    const { from, to } = defaultWindowFor(g);
    // normalize bounds
    let start = new Date(from);
    let end = new Date(to);
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

  React.useEffect(() => {
    if (!items?.length && !loading) {
      applyQuery(((granularity as Granularity) || "week"));
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
          <Tabs
            defaultValue="weekly"
            onValueChange={(val) =>
              applyQuery((val === "daily" ? "day" : val === "weekly" ? "week" : "month") as Granularity)
            }
          >
            <TabsList className="bg-[#2E343E] text-white">
              <TabsTrigger value="daily">Daily</TabsTrigger>
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
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
