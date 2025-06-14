import { MoreHorizontal, TrendingDown, TrendingUp } from "lucide-react";
import { Badge } from "../ui/data-display/badge";
import { Button } from "../ui/button/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/data-display/card";

export function FormSubmissions() {
  const submissions = [
    {
      form: "Healthcare Assessment",
      submissions: 342,
      change: 12,
      trend: "up",
      status: "active",
    },
    {
      form: "Education Survey",
      submissions: 198,
      change: -5,
      trend: "down",
      status: "active",
    },
    {
      form: "Water Quality Report",
      submissions: 89,
      change: 23,
      trend: "up",
      status: "pending",
    },
    {
      form: "Community Feedback",
      submissions: 156,
      change: 8,
      trend: "up",
      status: "active",
    },
  ];

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Form Submissions Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {submissions.map((submission, index) => (
            <div key={index} className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-sm">{submission.form}</h4>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-2">
                <div className="text-2xl">{submission.submissions}</div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-xs">
                    {submission.trend === "up" ? (
                      <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                    ) : (
                      <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
                    )}
                    {Math.abs(submission.change)}% this week
                  </div>
                  <Badge
                    variant={
                      submission.status === "active" ? "default" : "secondary"
                    }
                    className="text-xs"
                  >
                    {submission.status}
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
