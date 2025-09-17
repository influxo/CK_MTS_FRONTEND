import { Download, FileEdit, Plus, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { Badge } from "../ui/data-display/badge";
import { Button } from "../ui/button/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../ui/data-display/card";
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../ui/navigation/tabs";
import { Textarea } from "../ui/form/textarea";
import type { AppDispatch } from "../../store";
import {
  createActivity,
  selectActivityIsLoading,
  selectActivityError,
  fetchSubprojectActivities,
  selectSubprojectActivities,
  selectSubprojectActivitiesLoading,
  selectSubprojectActivitiesError,
} from "../../store/slices/activitySlice";

interface SubProjectActivitiesProps {
  subProjectId: string;
}

// Activities are loaded from API via Redux

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
  const dispatch = useDispatch<AppDispatch>();
  const isCreating = useSelector(selectActivityIsLoading);
  const createError = useSelector(selectActivityError);
  const activities = useSelector(selectSubprojectActivities);
  const listLoading = useSelector(selectSubprojectActivitiesLoading);
  const listError = useSelector(selectSubprojectActivitiesError);

  // Prefer URL param if present (route: :subprojectId)
  const { subprojectId: subprojectIdParam } = useParams<{
    subprojectId: string;
  }>();
  const effectiveSubProjectId = subprojectIdParam ?? subProjectId;

  // Fetch activities when subproject changes
  useEffect(() => {
    if (effectiveSubProjectId) {
      dispatch(fetchSubprojectActivities(effectiveSubProjectId));
    }
  }, [dispatch, effectiveSubProjectId]);

  // Model-based form state
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [frequency, setFrequency] = useState("monthly");
  const [status, setStatus] = useState("active");
  const [description, setDescription] = useState("");
  const [reportingFieldsRows, setReportingFieldsRows] = useState<
    { key: string; type: string }[]
  >([{ key: "", type: "text" }]);

  // Filter activities from API for this sub-project
  const filteredActivities = activities.filter((activity) => {
    const matchesSubProject = activity.subprojectId === effectiveSubProjectId;
    const matchesSearch =
      activity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (activity.description || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
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
            <Button
              className="bg-[#0073e6] text-white flex items-center
             px-4 py-2 rounded-md border-0
             transition-transform duration-200 ease-in-out
             hover:scale-[1.02] hover:-translate-y-[1px]"
            >
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
            {createError && (
              <div className="text-sm text-destructive">{createError}</div>
            )}
            <div className="grid gap-4 py-4">
              {/* Model-based fields */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="activity-name" className="text-right">
                  Name *
                </Label>
                <Input
                  id="activity-name"
                  className="col-span-3"
                  placeholder="Activity name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="activity-category" className="text-right">
                  Category *
                </Label>
                <Input
                  id="activity-category"
                  className="col-span-3"
                  placeholder="Category (e.g., Shendetesi)"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="activity-frequency" className="text-right">
                  Frequency *
                </Label>
                <Select value={frequency} onValueChange={setFrequency}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="activity-status" className="text-right">
                  Status *
                </Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
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
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label className="text-right pt-2">Reporting Fields</Label>
                <div className="col-span-3 space-y-2">
                  {reportingFieldsRows.map((row, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <Input
                        placeholder="Field key (e.g., beneficiaries)"
                        value={row.key}
                        onChange={(e) => {
                          const next = [...reportingFieldsRows];
                          next[idx] = { ...next[idx], key: e.target.value };
                          setReportingFieldsRows(next);
                        }}
                      />
                      <Select
                        value={row.type}
                        onValueChange={(v: string) => {
                          const next = [...reportingFieldsRows];
                          next[idx] = { ...next[idx], type: v };
                          setReportingFieldsRows(next);
                        }}
                      >
                        <SelectTrigger className="w-[160px]">
                          <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="number">number</SelectItem>
                          <SelectItem value="text">text</SelectItem>
                          <SelectItem value="boolean">boolean</SelectItem>
                          <SelectItem value="date">date</SelectItem>
                          <SelectItem value="time">time</SelectItem>
                          <SelectItem value="datetime">datetime</SelectItem>
                          <SelectItem value="select">select</SelectItem>
                          <SelectItem value="multiselect">
                            multiselect
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="ghost"
                        className="text-destructive"
                        onClick={() => {
                          const next = reportingFieldsRows.filter(
                            (_, i) => i !== idx
                          );
                          setReportingFieldsRows(next);
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    onClick={() =>
                      setReportingFieldsRows([
                        ...reportingFieldsRows,
                        { key: "", type: "text" },
                      ])
                    }
                  >
                    Add Field
                  </Button>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsCreateActivityDialogOpen(false)}
                disabled={isCreating}
              >
                Cancel
              </Button>
              <Button
                onClick={async () => {
                  const reportingFields: Record<string, string> = {};
                  reportingFieldsRows
                    .filter((r) => r.key.trim().length > 0)
                    .forEach((r) => {
                      reportingFields[r.key.trim()] = r.type;
                    });
                  try {
                    await dispatch(
                      createActivity({
                        name,
                        description,
                        category,
                        frequency,
                        reportingFields,
                        status,
                        subprojectId: effectiveSubProjectId,
                      })
                    ).unwrap();
                    // Reset form
                    setName("");
                    setCategory("");
                    setFrequency("monthly");
                    setStatus("active");
                    setDescription("");
                    setReportingFieldsRows([{ key: "", type: "text" }]);
                    setIsCreateActivityDialogOpen(false);
                    // Refresh activities list
                    if (effectiveSubProjectId) {
                      dispatch(
                        fetchSubprojectActivities(effectiveSubProjectId)
                      );
                    }
                  } catch (e) {
                    // error shown via createError
                  }
                }}
                disabled={isCreating}
              >
                {isCreating ? "Saving..." : "Save Activity"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 bg-[#2E343E] bg-opacity-10 items-center">
          <TabsTrigger
            value="activities"
            className="data-[state=active]:bg-[#2E343E]  data-[state=active]:text-white"
          >
            Activities Log
          </TabsTrigger>
          <TabsTrigger
            value="planned"
            className="data-[state=active]:bg-[#2E343E]  data-[state=active]:text-white"
          >
            Planned Activities
          </TabsTrigger>
        </TabsList>

        <TabsContent value="activities" className="pt-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-between mb-4">
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search activities..."
                  className="pl-9 bg-black/5 border-0"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[160px] bg-black/5 border-0">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Activities
            </Button> */}
          </div>

          <Table className="rounded-md overflow-hidden ">
            <TableHeader className="bg-[#E5ECF6]">
              <TableRow>
                <TableHead className="w-[300px]">Activity</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Frequency</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {listLoading && (
                <TableRow>
                  <TableCell colSpan={7}>
                    <span className="text-sm text-muted-foreground">
                      Loading activities...
                    </span>
                  </TableCell>
                </TableRow>
              )}
              {!listLoading && listError && (
                <TableRow>
                  <TableCell colSpan={7}>
                    <span className="text-sm text-destructive">
                      {listError}
                    </span>
                  </TableCell>
                </TableRow>
              )}
              {!listLoading &&
                !listError &&
                filteredActivities.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7}>
                      <span className="text-sm text-muted-foreground">
                        No activities found.
                      </span>
                    </TableCell>
                  </TableRow>
                )}
              {!listLoading &&
                !listError &&
                filteredActivities.map((activity) => (
                  <TableRow key={activity.id}>
                    <TableCell>
                      <div className="font-medium">{activity.name}</div>
                      <div className="text-sm text-muted-foreground line-clamp-1">
                        {activity.description}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="bg-[#0073e6] border-0 text-white"
                      >
                        {activity.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-black/5">
                        {activity.frequency}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          activity.status === "active" ? "default" : "outline"
                        }
                        className="mt-1 text-[#4AA785] bg-[#DEF8EE]"
                      >
                        {activity.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm">
                      {new Date(activity.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm">
                      {new Date(activity.updatedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild></DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <FileEdit className="h-4 w-4 mr-2" />
                              Edit Activity
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download className="h-4 w-4 mr-2" />
                              Export Details
                            </DropdownMenuItem>
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

            <Card className="border-dashed bg-[#F7F9FB] flex flex-col items-center justify-center p-6">
              <div className="rounded-full border-dashed border-2 p-3 mb-3">
                <Plus className="h-6 w-6 text-muted-foreground" />
              </div>
              <h4 className="mb-1">Create Activity Plan</h4>
              <p className="text-sm text-muted-foreground text-center mb-3">
                Define a scheduled activity to be repeated regularly
              </p>
              <Button className="bg-black/5">Create Plan</Button>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
