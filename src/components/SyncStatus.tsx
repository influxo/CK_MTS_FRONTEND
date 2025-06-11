import { Cloud, CloudOff } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";

export function SyncStatus() {
  return (
    <Card className="mb-6">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Sync Status</CardTitle>
          <span className="text-sm text-muted-foreground">Online</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm">Last sync:</span>
          <span className="text-sm font-medium">May 25, 2025 - 15:28</span>
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm">Pending Sync:</span>
            <span className="text-sm">12 items</span>
          </div>
          <Progress value={42} className="h-2" />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-green-500">
            <Cloud className="h-4 w-4" />
            <span className="text-xs">Connected to server</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <CloudOff className="h-4 w-4" />
            <span className="text-xs">0 sync errors</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
