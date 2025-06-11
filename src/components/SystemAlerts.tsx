import { AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

export function SystemAlerts() {
  return (
    <Card className="mb-6">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">System Alerts</CardTitle>
          <Button variant="ghost" size="sm" className="h-6">
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-red-500 mt-0.5" />
          <div>
            <p className="text-sm font-medium">2 Failed Form Submissions</p>
            <p className="text-xs text-muted-foreground">
              Health Survey | Vaccination Records
            </p>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <Clock className="h-4 w-4 text-amber-500 mt-0.5" />
          <div>
            <p className="text-sm font-medium">3 Pending Users (14+ days)</p>
            <p className="text-xs text-muted-foreground">
              Field Workers | Approval Required
            </p>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
          <div>
            <p className="text-sm font-medium">Weekly Data Backup Completed</p>
            <p className="text-xs text-muted-foreground">
              System Maintenance | Yesterday
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
