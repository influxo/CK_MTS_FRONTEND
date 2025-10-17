import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../ui/data-display/card";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/data-display/avatar";
import { Badge } from "../ui/data-display/badge";
import { useTranslation } from "../../hooks/useTranslation";

export function RecentActivity() {
  const { t } = useTranslation();
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
            {t('dashboard.completed')}
          </Badge>
        );
      case "creation":
        return (
          <Badge variant="secondary" className="text-blue-700 bg-blue-100">
            {t('dashboard.created')}
          </Badge>
        );
      case "update":
        return (
          <Badge variant="secondary" className="text-amber-700 bg-amber-100">
            {t('dashboard.updated')}
          </Badge>
        );
      case "assignment":
        return (
          <Badge variant="secondary" className="text-purple-700 bg-purple-100">
            {t('dashboard.assigned')}
          </Badge>
        );
      case "submission":
        return (
          <Badge variant="secondary" className="text-cyan-700 bg-cyan-100">
            {t('dashboard.submitted')}
          </Badge>
        );
      case "export":
        return <Badge variant="outline">{t('dashboard.exported')}</Badge>;
      default:
        return <Badge variant="outline">{t('dashboard.unknown_activity')}</Badge>;
    }
  };

  return (
    <Card className="bg-[#F7F9FB]      drop-shadow-sm shadow-gray-50 border-0">
      <CardHeader>
        <CardTitle>{t('dashboard.recentActivity')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <div key={index} className="flex items-start space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={`https://example.com/${activity.avatar}.jpg`} alt={activity.user} />
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
