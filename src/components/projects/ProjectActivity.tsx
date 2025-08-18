import {
  AlertCircle,
  CheckCircle,
  Clock,
  FileEdit,
  FileText,
  User,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/data-display/avatar";
import { Button } from "../ui/button/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../ui/data-display/card";

interface ProjectActivityProps {
  projectId: string;
}

// Mock activity data
const mockActivities = [
  {
    id: "act-001",
    projectId: "proj-001",
    user: {
      name: "Jane Smith",
      avatar: "",
      initials: "JS",
    },
    action: "updated project status",
    target: "Rural Healthcare Initiative",
    details: "Changed status from 'Planning' to 'Active'",
    timestamp: "2025-05-24T14:32:00",
    type: "edit",
  },
  {
    id: "act-002",
    projectId: "proj-001",
    user: {
      name: "Robert Johnson",
      avatar: "",
      initials: "RJ",
    },
    action: "created a new sub-project",
    target: "Child Vaccination Campaign",
    details: "",
    timestamp: "2025-05-23T11:15:00",
    type: "create",
  },
  {
    id: "act-003",
    projectId: "proj-001",
    user: {
      name: "Sarah Adams",
      avatar: "",
      initials: "SA",
    },
    action: "submitted form",
    target: "Weekly Activity Report",
    details: "Community Health Worker Training",
    timestamp: "2025-05-22T16:45:00",
    type: "form",
  },
  {
    id: "act-004",
    projectId: "proj-001",
    user: {
      name: "System",
      avatar: "",
      initials: "SYS",
    },
    action: "alert",
    target: "Upcoming deadline",
    details: "Community Health Worker Training ending in 3 days",
    timestamp: "2025-05-22T08:00:00",
    type: "alert",
  },
  {
    id: "act-005",
    projectId: "proj-001",
    user: {
      name: "David Miller",
      avatar: "",
      initials: "DM",
    },
    action: "assigned to project",
    target: "Rural Healthcare Initiative",
    details: "Role: Technical Specialist",
    timestamp: "2025-05-21T10:20:00",
    type: "assign",
  },
  {
    id: "act-006",
    projectId: "proj-001",
    user: {
      name: "Jane Smith",
      avatar: "",
      initials: "JS",
    },
    action: "completed milestone",
    target: "Initial Assessment",
    details: "All target communities assessed",
    timestamp: "2025-05-20T15:30:00",
    type: "complete",
  },
];

function getActivityIcon(type: string) {
  switch (type) {
    case "edit":
      return <FileEdit className="h-3 w-3 text-muted-foreground" />;
    case "create":
      return <FileText className="h-3 w-3 text-muted-foreground" />;
    case "form":
      return <FileText className="h-3 w-3 text-muted-foreground" />;
    case "assign":
      return <User className="h-3 w-3 text-muted-foreground" />;
    case "complete":
      return <CheckCircle className="h-3 w-3 text-muted-foreground" />;
    case "alert":
      return <AlertCircle className="h-3 w-3 text-muted-foreground" />;
    default:
      return <Clock className="h-3 w-3 text-muted-foreground" />;
  }
}

export function ProjectActivity({ projectId }: ProjectActivityProps) {
  // Filter activities for this project
  const activities = mockActivities.filter(
    (activity) => activity.projectId === projectId
  );

  return (
    <Card className="bg-[#F7F9FB] border-0 drop-shadow-sm shadow-gray-50">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-base">Recent Activity</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            className="h-7  text-black bg-black bg-opacity-5 "
          >
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-start gap-3 pb-3 border-b last:border-0 last:pb-0"
          >
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={activity.user.avatar}
                alt={activity.user.name}
              />
              <AvatarFallback>{activity.user.initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-1">
                <span className="text-sm font-medium">
                  {activity.user.name}
                </span>
                <span className="text-sm text-muted-foreground">
                  {activity.action}
                </span>
              </div>
              <div className="flex items-center gap-1">
                {getActivityIcon(activity.type)}
                <span className="text-xs text-muted-foreground">
                  {activity.target}
                </span>
              </div>
              {activity.details && (
                <div className="text-xs text-muted-foreground">
                  {activity.details}
                </div>
              )}
            </div>
            <div className="text-xs text-muted-foreground whitespace-nowrap">
              {new Date(activity.timestamp).toLocaleString()}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
