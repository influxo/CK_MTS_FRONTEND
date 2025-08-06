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
const chartData = [
  { name: "Jan", submissions: 400 },
  { name: "Feb", submissions: 300 },
  { name: "Mar", submissions: 600 },
  { name: "Apr", submissions: 800 },
  { name: "May", submissions: 500 },
  { name: "Jun", submissions: 900 },
  { name: "Jul", submissions: 1100 },
];
export function FormSubmissions() {
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
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Form Submissions Overview</CardTitle>
          <Tabs defaultValue="daily">
            <TabsList className="bg-gray-200">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {submissions.map((submission, index) => (
            <div key={index} className="p-4 border rounded-lg">
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
                    className="text-xs"
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
