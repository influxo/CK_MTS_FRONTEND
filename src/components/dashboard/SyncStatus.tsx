import { AlertCircle, CheckCircle, Clock } from "lucide-react";
import { Badge } from "../ui/data-display/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/data-display/card";

export function SyncStatus() {
  const syncItems = [
    {
      name: "Project Data",
      status: "synced",
      lastSync: "2 minutes ago",
    },
    {
      name: "Beneficiary Records",
      status: "syncing",
      lastSync: "In progress",
    },
    {
      name: "Form Responses",
      status: "synced",
      lastSync: "5 minutes ago",
    },
    {
      name: "Reports",
      status: "pending",
      lastSync: "15 minutes ago",
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "synced":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "syncing":
        return <Clock className="h-4 w-4 text-blue-500" />;
      case "pending":
        return <AlertCircle className="h-4 w-4 text-amber-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "synced":
        return (
          <Badge variant="secondary" className="text-green-700 bg-green-100">
            Synced
          </Badge>
        );
      case "syncing":
        return (
          <Badge variant="secondary" className="text-blue-700 bg-blue-100">
            Syncing
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="secondary" className="text-amber-700 bg-amber-100">
            Pending
          </Badge>
        );
      default:
        return <Badge variant="destructive">Error</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sync Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {syncItems.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {getStatusIcon(item.status)}
                <div>
                  <div className="text-sm font-medium">{item.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {item.lastSync}
                  </div>
                </div>
              </div>
              {getStatusBadge(item.status)}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
