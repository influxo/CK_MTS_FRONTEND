import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";

export function RecentActivity() {
  const activities = [
    {
      user: "Sarah Johnson",
      avatar: "SJ",
      action: "completed data collection for",
      target: "Rural Healthcare Initiative",
      time: "2 minutes ago",
      type: "completion",
    },
    {
      user: "Michael Lee",
      avatar: "ML",
      action: "created a new report for",
      target: "Education Outreach Program",
      time: "15 minutes ago",
      type: "creation",
    },
    {
      user: "Emily Davis",
      avatar: "ED",
      action: "updated beneficiary records in",
      target: "Clean Water Access",
      time: "1 hour ago",
      type: "update",
    },
    {
      user: "James Wilson",
      avatar: "JW",
      action: "assigned new team member to",
      target: "Community Development Project",
      time: "2 hours ago",
      type: "assignment",
    },
    {
      user: "Lisa Chen",
      avatar: "LC",
      action: "submitted form responses for",
      target: "Nutrition Support Program",
      time: "3 hours ago",
      type: "submission",
    },
    {
      user: "David Miller",
      avatar: "DM",
      action: "exported quarterly report for",
      target: "Rural Healthcare Initiative",
      time: "5 hours ago",
      type: "export",
    },
  ];

  const getActivityBadge = (type: string) => {
    switch (type) {
      case "completion":
        return (
          <Badge variant="secondary" className="text-green-700 bg-green-100">
            Completed
          </Badge>
        );
      case "creation":
        return (
          <Badge variant="secondary" className="text-blue-700 bg-blue-100">
            Created
          </Badge>
        );
      case "update":
        return (
          <Badge variant="secondary" className="text-amber-700 bg-amber-100">
            Updated
          </Badge>
        );
      case "assignment":
        return (
          <Badge variant="secondary" className="text-purple-700 bg-purple-100">
            Assigned
          </Badge>
        );
      case "submission":
        return (
          <Badge variant="secondary" className="text-cyan-700 bg-cyan-100">
            Submitted
          </Badge>
        );
      case "export":
        return <Badge variant="outline">Exported</Badge>;
      default:
        return <Badge variant="outline">Activity</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <div key={index} className="flex items-start space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src="" alt={activity.user} />
                <AvatarFallback className="text-xs">
                  {activity.avatar}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <div className="text-sm">
                  <span className="font-medium">{activity.user}</span>
                  <span className="text-muted-foreground">
                    {" "}
                    {activity.action}{" "}
                  </span>
                  <span className="font-medium">{activity.target}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {activity.time}
                  </span>
                  {getActivityBadge(activity.type)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
