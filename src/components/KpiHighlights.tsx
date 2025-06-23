import { Activity, CheckCircle, Target, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/data-display/card";
import { Progress } from "./ui/feedback/progress";

interface KpiCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  target?: string;
  progress?: number;
  trend?: string;
}

function KpiCard({
  icon,
  title,
  value,
  target,
  progress,
  trend,
}: KpiCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h4 className="text-sm text-muted-foreground">{title}</h4>
          <div className="bg-muted p-1.5 rounded-md">{icon}</div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-xl font-medium">{value}</span>
          {target && (
            <span className="text-xs text-muted-foreground">
              vs {target} target
            </span>
          )}
        </div>
        {progress !== undefined && (
          <div className="mt-2">
            <Progress value={progress} className="h-1.5" />
            <div className="text-xs text-muted-foreground mt-1">
              {progress}% {trend}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function KpiHighlights() {
  return (
    <Card className="mb-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">
          KPI Highlights: Rural Healthcare Project
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4">
        <KpiCard
          icon={<Activity className="h-4 w-4" />}
          title="Activities Conducted"
          value="128"
          target="140"
          progress={91.4}
          trend="on target"
        />
        <KpiCard
          icon={<Users className="h-4 w-4" />}
          title="Active Beneficiaries"
          value="1,246"
          target="1,500"
          progress={83}
          trend="on target"
        />
        <KpiCard
          icon={<Target className="h-4 w-4" />}
          title="Service Delivery Rate"
          value="92.7%"
          progress={92.7}
          trend="vs target"
        />
        <KpiCard
          icon={<CheckCircle className="h-4 w-4" />}
          title="Form Success Rate"
          value="96.2%"
          progress={96.2}
          trend="last month"
        />
      </CardContent>
    </Card>
  );
}
