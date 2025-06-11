import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Progress } from "../ui/progress";

export function KpiHighlights() {
  const kpis = [
    {
      title: "Project Completion Rate",
      value: 78,
      target: 85,
      unit: "%",
    },
    {
      title: "Beneficiary Satisfaction",
      value: 4.6,
      target: 4.5,
      unit: "/5",
    },
    {
      title: "Data Collection Coverage",
      value: 92,
      target: 95,
      unit: "%",
    },
    {
      title: "Response Time",
      value: 2.3,
      target: 2.0,
      unit: " days",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Key Performance Indicators</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {kpis.map((kpi, index) => (
          <div key={index} className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">{kpi.title}</span>
              <span className="text-sm text-muted-foreground">
                {kpi.value}
                {kpi.unit} / {kpi.target}
                {kpi.unit}
              </span>
            </div>
            <Progress value={(kpi.value / kpi.target) * 100} className="h-2" />
            <div className="text-xs text-muted-foreground">
              {kpi.value >= kpi.target
                ? "Target achieved"
                : `${(kpi.target - kpi.value).toFixed(1)}${
                    kpi.unit
                  } below target`}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
