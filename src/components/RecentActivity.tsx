import { CheckCircle, Clock, FileText, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

interface ActivityItemProps {
  avatar: string;
  initials: string;
  user: string;
  action: string;
  target: string;
  time: string;
  icon: React.ReactNode;
}

function ActivityItem({
  avatar,
  initials,
  user,
  action,
  target,
  time,
  icon,
}: ActivityItemProps) {
  return (
    <div className="flex items-start gap-3 py-2">
      <Avatar className="h-8 w-8">
        <AvatarImage src={avatar} alt={user} />
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-1">
          <span className="text-sm font-medium">{user}</span>
          <span className="text-sm text-muted-foreground">{action}</span>
        </div>
        <div className="flex items-center gap-1">
          {icon}
          <span className="text-xs text-muted-foreground">{target}</span>
        </div>
      </div>
      <span className="text-xs text-muted-foreground whitespace-nowrap">
        {time}
      </span>
    </div>
  );
}

export function RecentActivity() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Recent Activity</CardTitle>
          <Button variant="ghost" size="sm" className="h-6">
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-1">
        <ActivityItem
          avatar=""
          initials="MJ"
          user="Mark Johnson"
          action="submitted a new form"
          target="Household Survey | Community A"
          time="10 mins ago"
          icon={<FileText className="h-3 w-3 text-muted-foreground" />}
        />
        <ActivityItem
          avatar=""
          initials="SL"
          user="Sarah Lewis"
          action="added 12 new beneficiaries"
          target="Education Program | Central District"
          time="2 hours ago"
          icon={<User className="h-3 w-3 text-muted-foreground" />}
        />
        <ActivityItem
          avatar=""
          initials="RW"
          user="Robert Wilson"
          action="completed activity report"
          target="Health Outreach | Western Region"
          time="5 hours ago"
          icon={<CheckCircle className="h-3 w-3 text-muted-foreground" />}
        />
        <ActivityItem
          avatar=""
          initials="AM"
          user="Alice Martinez"
          action="updated project status"
          target="Nutrition Support | Northern Communities"
          time="Yesterday"
          icon={<Clock className="h-3 w-3 text-muted-foreground" />}
        />
        <ActivityItem
          avatar=""
          initials="JT"
          user="James Thompson"
          action="submitted monthly report"
          target="Education Programs | Southern District"
          time="2 days ago"
          icon={<FileText className="h-3 w-3 text-muted-foreground" />}
        />
      </CardContent>
    </Card>
  );
}
