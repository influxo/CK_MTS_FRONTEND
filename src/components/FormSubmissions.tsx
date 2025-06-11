import { CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";

export function FormSubmissions() {
  return (
    <Card className="mb-6">
      <CardHeader className="pb-0">
        <div className="flex items-center justify-between">
          <CardTitle>Form Submissions</CardTitle>
          <Tabs defaultValue="daily">
            <TabsList className="bg-muted">
              <TabsTrigger value="daily">Daily</TabsTrigger>
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="h-64 flex items-center justify-center text-muted-foreground border-b mb-6">
          Form submission trend chart
        </div>
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">
                  Total Submissions
                </span>
                <span className="text-xl font-medium text-primary">287</span>
                <span className="text-xs text-muted-foreground mt-1">
                  <span className="text-green-500">↑ 5%</span> vs last month
                </span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">
                  Success Rate
                </span>
                <div className="flex items-center gap-1">
                  <span className="text-xl font-medium text-green-500">
                    94.2%
                  </span>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </div>
                <span className="text-xs text-muted-foreground mt-1">
                  <span className="text-green-500">↑ 2.3%</span> vs last month
                </span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">
                  Error Rate
                </span>
                <div className="flex items-center gap-1">
                  <span className="text-xl font-medium text-red-500">5.8%</span>
                  <XCircle className="h-4 w-4 text-red-500" />
                </div>
                <span className="text-xs text-muted-foreground mt-1">
                  <span className="text-green-500">↓ 0.7%</span> vs last month
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
}
