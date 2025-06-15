import { AlertTriangle, CheckCircle, Info } from "lucide-react";
import { Badge } from "../ui/data-display/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/data-display/card";

export function SystemAlerts() {
  const alerts = [
    {
      type: "warning",
      title: "Low Storage",
      message: "Database storage is 85% full",
      time: "2 hours ago",
    },
    {
      type: "info",
      title: "Scheduled Maintenance",
      message: "System update scheduled for tonight",
      time: "5 hours ago",
    },
    {
      type: "success",
      title: "Backup Complete",
      message: "Daily backup completed successfully",
      time: "1 day ago",
    },
  ];

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case "info":
        return <Info className="h-4 w-4 text-blue-500" />;
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
    }
  };

  // const getAlertVariant = (type: string) => {
  //   switch (type) {
  //     case "warning":
  //       return "destructive";
  //     case "info":
  //       return "default";
  //     case "success":
  //       return "default";
  //     default:
  //       return "destructive";
  //   }
  // };

  return (
    <Card>
      <CardHeader>
        <CardTitle>System Alerts</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {alerts.map((alert, index) => (
            <div
              key={index}
              className="flex items-start space-x-3 p-3 border rounded-lg"
            >
              {getAlertIcon(alert.type)}
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">{alert.title}</div>
                  <Badge variant="outline" className="text-xs">
                    {alert.time}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  {alert.message}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
