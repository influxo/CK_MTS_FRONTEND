import {
  Calendar,
  Clock,
  Download,
  FileEdit,
  MapPin,
  Plus,
  Search,
  Users,
} from "lucide-react";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/data-display/avatar";
import { Badge } from "../ui/data-display/badge";
import { Button } from "../ui/button/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/data-display/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/overlay/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/overlay/dropdown-menu";
import { Input } from "../ui/form/input";
import { Label } from "../ui/form/label";
import { Progress } from "../ui/feedback/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/form/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/data-display/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/navigation/tabs";
import { Textarea } from "../ui/form/textarea";

interface SubProjectActivitiesProps {
  subProjectId: string;
}

// Mock activities data
const mockActivities = [
  {
    id: "act-001",
    subProjectId: "sub-001",
    projectId: "proj-001",
    title: "Community Health Education Session",
    type: "Education",
    status: "completed",
    date: "2025-05-15",
    time: "09:00-11:30",
    location: "Village Community Center",
    conductedBy: "Jane Smith",
    avatar: "",
    initials: "JS",
    participants: 28,
    description:
      "Health education session on maternal nutrition and prenatal care",
    formsSubmitted: 3,
    mediaAttached: true,
    staff: ["Pal Baftijaj", "Alfred Pjetri", "Valentina Mehmeti", "Vlera Berisha", "Mimoza Bajraktari"]
  },
  {
    id: "act-002",
    subProjectId: "sub-001",
    title: "Mobile Clinic - Antenatal Care",
    type: "Service Delivery",
    status: "completed",
    date: "2025-05-18",
    time: "08:00-16:00",
    location: "Northern Village",
    conductedBy: "Medical Team A",
    avatar: "",
    initials: "MT",
    participants: 42,
    description:
      "Mobile clinic providing antenatal care services to pregnant women",
    formsSubmitted: 42,
    mediaAttached: true,
  },
  {
    id: "act-003",
    subProjectId: "sub-001",
    title: "Staff Training - New Protocols",
    type: "Training",
    status: "completed",
    date: "2025-05-22",
    time: "13:00-17:00",
    location: "District Health Office",
    conductedBy: "Robert Johnson",
    avatar: "",
    initials: "RJ",
    participants: 12,
    description:
      "Training staff on new maternal health protocols and procedures",
    formsSubmitted: 1,
    mediaAttached: false,
  },
  {
    id: "act-004",
    subProjectId: "sub-001",
    title: "Stakeholder Coordination Meeting",
    type: "Coordination",
    status: "completed",
    date: "2025-05-23",
    time: "14:00-16:00",
    location: "District Administration Building",
    conductedBy: "Project Team",
    avatar: "",
    initials: "PT",
    participants: 8,
    description:
      "Coordination meeting with local health officials and community leaders",
    formsSubmitted: 1,
    mediaAttached: false,
  },
  {
    id: "act-005",
    subProjectId: "sub-001",
    title: "Mobile Clinic - Antenatal Care",
    type: "Service Delivery",
    status: "upcoming",
    date: "2025-05-28",
    time: "08:00-16:00",
    location: "Eastern Village",
    conductedBy: "Medical Team B",
    avatar: "",
    initials: "MT",
    participants: 0,
    description:
      "Mobile clinic providing antenatal care services to pregnant women",
    formsSubmitted: 0,
    mediaAttached: false,
  },
  {
    id: "act-006",
    subProjectId: "sub-002",
    title: "Vaccination Campaign - Day 1",
    type: "Service Delivery",
    status: "completed",
    date: "2025-05-20",
    time: "08:00-17:00",
    location: "Central School",
    conductedBy: "Vaccination Team",
    avatar: "",
    initials: "VT",
    participants: 124,
    description: "First day of vaccination campaign for children under 5",
    formsSubmitted: 124,
    mediaAttached: true,
  },
];

// Mock planned activities
const mockPlannedActivities = [
  {
    id: "plan-001",
    subProjectId: "sub-001",
    title: "Community Health Education",
    type: "Education",
    frequency: "Weekly",
    targetNumber: 12,
    completed: 8,
    description: "Regular health education sessions in community centers",
    assignedTo: "Community Health Workers",
  },
  {
    id: "plan-002",
    subProjectId: "sub-001",
    title: "Mobile Antenatal Clinics",
    type: "Service Delivery",
    frequency: "Bi-weekly",
    targetNumber: 20,
    completed: 10,
    description: "Mobile clinics providing antenatal care services",
    assignedTo: "Medical Teams",
  },
  {
    id: "plan-003",
    subProjectId: "sub-001",
    title: "Staff Training Sessions",
    type: "Training",
    frequency: "Monthly",
    targetNumber: 6,
    completed: 3,
    description:
      "Training sessions for project staff and community health workers",
    assignedTo: "Project Coordinators",
  },
];

export function SubProjectActivities({
  subProjectId,
}: SubProjectActivitiesProps) {
  const [activeTab, setActiveTab] = useState("activities");
  const [isCreateActivityDialogOpen, setIsCreateActivityDialogOpen] =
    useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Filter activities for this sub-project
  const filteredActivities = mockActivities.filter((activity) => {
    const matchesSubProject = activity.subProjectId === subProjectId;
    const matchesSearch =
      activity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || activity.status === statusFilter;

    return matchesSubProject && matchesSearch && matchesStatus;
  });

  // Filter planned activities for this sub-project
  const filteredPlannedActivities = mockPlannedActivities.filter(
    (plan) => plan.subProjectId === subProjectId
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3>Activities</h3>
          <p className="text-muted-foreground">
            Manage and track project activities
          </p>
        </div>
        <Dialog
          open={isCreateActivityDialogOpen}
          onOpenChange={setIsCreateActivityDialogOpen}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Record New Activity
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Record New Activity</DialogTitle>
              <DialogDescription>
                Enter details about a new activity conducted for this
                sub-project.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="activity-title" className="text-right">
                  Title *
                </Label>
                <Input
                  id="activity-title"
                  className="col-span-3"
                  placeholder="Activity title"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="activity-type" className="text-right">
                  Type *
                </Label>
                <Select>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select activity type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="service-delivery">
                      Service Delivery
                    </SelectItem>
                    <SelectItem value="training">Training</SelectItem>
                    <SelectItem value="coordination">Coordination</SelectItem>
                    <SelectItem value="monitoring">Monitoring</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="activity-date" className="text-right">
                  Date *
                </Label>
                <Input id="activity-date" type="date" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="activity-time" className="text-right">
                  Time
                </Label>
                <div className="col-span-3 flex gap-2">
                  <Input
                    id="activity-time-start"
                    type="time"
                    placeholder="Start time"
                  />
                  <span className="flex items-center">to</span>
                  <Input
                    id="activity-time-end"
                    type="time"
                    placeholder="End time"
                  />
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="activity-location" className="text-right">
                  Location *
                </Label>
                <Input
                  id="activity-location"
                  className="col-span-3"
                  placeholder="Activity location"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="activity-conductor" className="text-right">
                  Conducted By *
                </Label>
                <Input
                  id="activity-conductor"
                  className="col-span-3"
                  placeholder="Person or team who conducted the activity"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="activity-participants" className="text-right">
                  Participants
                </Label>
                <Input
                  id="activity-participants"
                  type="number"
                  className="col-span-3"
                  placeholder="Number of participants"
                />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label
                  htmlFor="activity-description"
                  className="text-right pt-2"
                >
                  Description
                </Label>
                <Textarea
                  id="activity-description"
                  className="col-span-3"
                  placeholder="Brief description of the activity"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="activity-form" className="text-right">
                  Related Form
                </Label>
                <Select>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a form to attach" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="form-001">
                      Maternal Health Assessment
                    </SelectItem>
                    <SelectItem value="form-002">Prenatal Checkup</SelectItem>
                    <SelectItem value="form-003">
                      Health Education Session
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              {/* <Button
                variant="outline"
                onClick={() => setIsCreateActivityDialogOpen(false)}
              >
                Cancel
              </Button> */}
              <Button onClick={() => setIsCreateActivityDialogOpen(false)}>
                Save Activity
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="activities">Activities Log</TabsTrigger>
          <TabsTrigger value="planned">Planned Activities</TabsTrigger>
        </TabsList>

        <TabsContent value="activities" className="pt-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-between mb-4">
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search activities..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="ongoing">Ongoing</SelectItem>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Activities
            </Button> */}
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px]">Activity</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Conducted By</TableHead>
                <TableHead>Participants</TableHead>
                <TableHead>Forms</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredActivities.map((activity) => (
                <TableRow key={activity.id}>
                  <TableCell>
                    <div className="font-medium">{activity.title}</div>
                    <div className="text-sm text-muted-foreground line-clamp-1">
                      {activity.description}
                    </div>
                    <Badge
                      variant={
                        activity.status === "completed"
                          ? "default"
                          : activity.status === "upcoming"
                          ? "secondary"
                          : "outline"
                      }
                      className="mt-1"
                    >
                      {activity.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{activity.type}</Badge>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <span>
                        {new Date(activity.date).toLocaleDateString()}
                      </span>
                    </div>
                    {activity.time && (
                      <div className="flex items-center gap-1 mt-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span>{activity.time}</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      <span>{activity.location}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage
                          src={activity.avatar}
                          alt={activity.conductedBy}
                        />
                        <AvatarFallback>{activity.initials}</AvatarFallback>
                      </Avatar>
                      <span>{activity.conductedBy}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3 text-muted-foreground" />
                      <span>{activity.participants}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {activity.formsSubmitted > 0 ? (
                      <Badge
                        variant="outline"
                        className="flex items-center gap-1"
                      >
                        <span>{activity.formsSubmitted}</span>
                        <span>submitted</span>
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-sm">
                        None
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {/* <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button> */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          {/* <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button> */}
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <FileEdit className="h-4 w-4 mr-2" />
                            Edit Activity
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="h-4 w-4 mr-2" />
                            Export Details
                          </DropdownMenuItem>
                          {activity.status === "upcoming" && (
                            <DropdownMenuItem className="text-destructive">
                              Cancel Activity
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>

        <TabsContent value="planned" className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlannedActivities.map((plan) => (
              <Card key={plan.id}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between">
                    <CardTitle className="text-base">{plan.title}</CardTitle>
                    <Badge variant="outline">{plan.type}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {plan.description}
                  </p>

                  <div>
                    <div className="text-sm text-muted-foreground">
                      Progress
                    </div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm">
                        {plan.completed} of {plan.targetNumber} completed
                      </span>
                      <span className="text-sm">
                        {Math.round((plan.completed / plan.targetNumber) * 100)}
                        %
                      </span>
                    </div>
                    <Progress
                      value={(plan.completed / plan.targetNumber) * 100}
                      className="h-2"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Frequency</div>
                      <div>{plan.frequency}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Assigned To</div>
                      <div>{plan.assignedTo}</div>
                    </div>
                  </div>

                  {/* <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm">
                      View Schedule
                    </Button>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Record Activity
                    </Button>
                  </div> */}
                </CardContent>
              </Card>
            ))}

            <Card className="border-dashed flex flex-col items-center justify-center p-6">
              <div className="rounded-full border-dashed border-2 p-3 mb-3">
                <Plus className="h-6 w-6 text-muted-foreground" />
              </div>
              <h4 className="mb-1">Create Activity Plan</h4>
              <p className="text-sm text-muted-foreground text-center mb-3">
                Define a scheduled activity to be repeated regularly
              </p>
              <Button>Create Plan</Button>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
