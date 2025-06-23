import { Activity, CheckCircle, FileText, Users } from "lucide-react";
import { Card, CardContent } from "./ui/data-display/card";

interface MetricCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  subValue?: string;
  subLabel?: string;
  trend?: number;
  trendLabel?: string;
}

function MetricCard({
  icon,
  title,
  value,
  subValue,
  subLabel,
  trend,
}: MetricCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4 flex items-start justify-between">
        <div className="space-y-2">
          <h3 className="text-muted-foreground text-sm">{title}</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-medium">{value}</span>
            {subValue && (
              <span className="text-sm text-muted-foreground">
                {subValue} {subLabel}
              </span>
            )}
          </div>
          {trend !== undefined && (
            <div className="text-xs text-muted-foreground">
              {trend > 0 ? "+" : ""}
              {trend}% vs last month
            </div>
          )}
        </div>
        <div className="bg-gray-100 p-2 rounded-md">{icon}</div>
      </CardContent>
    </Card>
  );
}

export function SummaryMetrics() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <MetricCard
        icon={<Activity className="h-5 w-5" />}
        title="Projects"
        value="24"
        subValue="21"
        subLabel="active"
        trend={10.5}
      />
      <MetricCard
        icon={<CheckCircle className="h-5 w-5" />}
        title="Sub-Projects"
        value="85"
        subValue="64"
        subLabel="active"
        trend={6.8}
      />
      <MetricCard
        icon={<Users className="h-5 w-5" />}
        title="Beneficiaries"
        value="4,328"
        subValue="3,451"
        subLabel="active"
        trend={12.3}
      />
      <MetricCard
        icon={<FileText className="h-5 w-5" />}
        title="Services Delivered"
        value="12,651"
        trend={9.5}
      />
    </div>
  );
}
