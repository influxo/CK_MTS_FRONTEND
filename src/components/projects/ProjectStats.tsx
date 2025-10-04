import {
  ResponsiveContainer,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../ui/data-display/card";
import { Progress } from "../ui/feedback/progress";

interface ProjectStatsProps {
  projectId: string;
  summary?: {
    totalSubmissions?: number;
    totalServiceDeliveries?: number;
    totalUniqueBeneficiaries?: number;
  } | null;
}

// (removed unused mockServiceStats)

// Mock monthly activity data
const mockMonthlyData = [
  { month: "Jan", activities: 25, beneficiaries: 120 },
  { month: "Feb", activities: 38, beneficiaries: 210 },
  { month: "Mar", activities: 42, beneficiaries: 350 },
  { month: "Apr", activities: 35, beneficiaries: 280 },
  { month: "May", activities: 40, beneficiaries: 410 },
];

export function ProjectStats({ projectId, summary }: ProjectStatsProps) {
  console.log("projectId, veq sa me i ik unused declaration", projectId);

  return (
    <div className="space-y-6">
      {/* Top full-width Key Statistics row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <h1 className="text-base sm:text-lg font-semibold md:col-span-1">
          Key Statistics
        </h1>
        <div className="md:col-span-4 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-[#B1E3FF] drop-shadow-sm shadow-gray-50 border-0">
            <CardContent className="p-6">
              <div className="text-sm text-muted-foreground">Total Submissions</div>
              <div className="text-3xl font-medium mt-1">{Number(summary?.totalSubmissions || 0).toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card className="bg-[#B1E3FF] drop-shadow-sm shadow-gray-50 border-0">
            <CardContent className="p-6">
              <div className="text-sm text-muted-foreground">Total Service Deliveries</div>
              <div className="text-3xl font-medium mt-1">{Number(summary?.totalServiceDeliveries || 0).toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card className="bg-[#B1E3FF] drop-shadow-sm shadow-gray-50 border-0">
            <CardContent className="p-6">
              <div className="text-sm text-muted-foreground">Total Unique Beneficiaries</div>
              <div className="text-3xl font-medium mt-1">{Number(summary?.totalUniqueBeneficiaries || 0).toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Existing two-column grid content */}
      <div className="grid  grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-[#F7F9FB]  border-0 drop-shadow-sm shadow-gray-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Project Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Overall Progress</span>
                <span>65%</span>
              </div>
              <Progress value={65} className="h-2 " />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  Budget Utilization
                </span>
                <span>42%</span>
              </div>
              <Progress value={42} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  Beneficiary Target
                </span>
                <span>78%</span>
              </div>
              <Progress value={78} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  Activity Completion
                </span>
                <span>51%</span>
              </div>
              <Progress value={51} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#F7F9FB] border-0 drop-shadow-sm shadow-gray-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Monthly Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {(() => {
                const totalActivities = mockMonthlyData.reduce(
                  (sum, m) => sum + m.activities,
                  0
                );
                const totalBeneficiaries = mockMonthlyData.reduce(
                  (sum, m) => sum + m.beneficiaries,
                  0
                );
                const pieData = [
                  { name: "Activities", value: totalActivities },
                  { name: "Beneficiaries", value: totalBeneficiaries },
                ];
                const COLORS = ["#FF5E3A", "#6366F1"]; // brand orange + indigo
                return (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Tooltip
                        formatter={(value: number) => value.toLocaleString()}
                      />
                      <Legend verticalAlign="bottom" height={24} />
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="48%"
                        innerRadius={55}
                        outerRadius={80}
                        paddingAngle={3}
                        dataKey="value"
                        nameKey="name"
                        isAnimationActive
                        animationBegin={200}
                        animationDuration={900}
                        animationEasing="ease-out"
                      >
                        {pieData.map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                );
              })()}
            </div>

            {/* <div className="mt-6">
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
            </div> */}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
