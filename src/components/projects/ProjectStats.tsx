import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/data-display/card";
import { Progress } from "../ui/feedback/progress";

interface ProjectStatsProps {
  projectId: string;
}

// Mock stats data
const mockServiceStats = [
  { name: "Health Checkups", value: 450 },
  { name: "Vaccinations", value: 385 },
  { name: "Consultations", value: 210 },
  { name: "Training Sessions", value: 28 },
  { name: "Distribution Events", value: 15 },
];

// Mock monthly activity data
const mockMonthlyData = [
  { month: "Jan", activities: 25, beneficiaries: 120 },
  { month: "Feb", activities: 38, beneficiaries: 210 },
  { month: "Mar", activities: 42, beneficiaries: 350 },
  { month: "Apr", activities: 35, beneficiaries: 280 },
  { month: "May", activities: 40, beneficiaries: 410 },
];

export function ProjectStats({ projectId }: ProjectStatsProps) {
  console.log("projectId, veq sa me i ik unused declaration", projectId);
  // For a real application, we would filter stats based on projectId

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Project Progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Overall Progress</span>
              <span>65%</span>
            </div>
            <Progress value={65} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Budget Utilization</span>
              <span>42%</span>
            </div>
            <Progress value={42} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Beneficiary Target</span>
              <span>78%</span>
            </div>
            <Progress value={78} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Activity Completion</span>
              <span>51%</span>
            </div>
            <Progress value={51} className="h-2" />
          </div>

          <div className="pt-2">
            <div className="text-sm font-medium mb-2">Key Statistics</div>
            <div className="grid grid-cols-2 gap-3">
              <div className="border rounded-md p-3">
                <div className="text-sm text-muted-foreground">Activities</div>
                <div className="text-xl font-medium">128</div>
              </div>
              <div className="border rounded-md p-3">
                <div className="text-sm text-muted-foreground">
                  Services Delivered
                </div>
                <div className="text-xl font-medium">1,088</div>
              </div>
              <div className="border rounded-md p-3">
                <div className="text-sm text-muted-foreground">
                  Forms Submitted
                </div>
                <div className="text-xl font-medium">287</div>
              </div>
              <div className="border rounded-md p-3">
                <div className="text-sm text-muted-foreground">
                  Active Beneficiaries
                </div>
                <div className="text-xl font-medium">1,245</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Monthly Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={mockMonthlyData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 0,
                  bottom: 5,
                }}
              >
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar
                  dataKey="activities"
                  name="Activities"
                  fill="var(--chart-1)"
                />
                <Bar
                  dataKey="beneficiaries"
                  name="Beneficiaries"
                  fill="var(--chart-2)"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-6">
            <div className="text-sm font-medium mb-3">Services Delivered</div>
            <div className="space-y-3">
              {mockServiceStats.map((service, index) => (
                <div key={index}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{service.name}</span>
                    <span>{service.value}</span>
                  </div>
                  <Progress
                    value={
                      (service.value /
                        Math.max(...mockServiceStats.map((s) => s.value))) *
                      100
                    }
                    className="h-1.5"
                  />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
