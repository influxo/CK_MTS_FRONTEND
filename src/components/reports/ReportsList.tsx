import {
  BarChart3,
  Calendar,
  CheckCircle,
  Copy,
  Eye,
  FileBarChart,
  FileDown,
  FileSpreadsheet,
  FileText,
  Filter,
  LineChart,
  Mail,
  MoreHorizontal,
  PieChart,
  Plus,
  Repeat,
  Search,
  Settings,
  SlidersHorizontal,
  Trash,
  UserCircle,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Switch } from "../ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

// Mock data for saved reports
const mockSavedReports = [
  {
    id: "report-001",
    name: "Monthly Beneficiary Summary - May 2025",
    type: "beneficiary",
    level: "project",
    scope: "Rural Healthcare Initiative",
    createdBy: "Jane Smith",
    createdDate: "2025-05-20T14:30:00",
    lastViewed: "2025-05-22T10:45:00",
    scheduled: false,
    charts: ["pie", "bar"],
    status: "completed",
  },
  {
    id: "report-002",
    name: "Activity Completion Rates - Q2 2025",
    type: "completion",
    level: "program",
    scope: "All Projects",
    createdBy: "Robert Johnson",
    createdDate: "2025-05-18T09:15:00",
    lastViewed: "2025-05-19T16:20:00",
    scheduled: true,
    scheduledRecipients: ["admin@example.com", "managers@example.com"],
    scheduledFrequency: "weekly",
    charts: ["line", "bar"],
    status: "completed",
  },
  {
    id: "report-003",
    name: "Water Access Sub-project Activity Log",
    type: "activity",
    level: "subproject",
    scope: "Water Access Program",
    createdBy: "Michael Lee",
    createdDate: "2025-05-15T11:45:00",
    lastViewed: "2025-05-17T13:10:00",
    scheduled: false,
    charts: ["bar"],
    status: "completed",
  },
  {
    id: "report-004",
    name: "Maternal Health Services Beneficiary List",
    type: "beneficiary",
    level: "subproject",
    scope: "Maternal Health Services",
    createdBy: "Sarah Johnson",
    createdDate: "2025-05-12T10:20:00",
    lastViewed: "2025-05-14T09:30:00",
    scheduled: false,
    charts: ["pie"],
    status: "completed",
  },
  {
    id: "report-005",
    name: "Education Support Activities - May 2025",
    type: "activity",
    level: "subproject",
    scope: "Education Support",
    createdBy: "Jennifer Davis",
    createdDate: "2025-05-22T16:40:00",
    lastViewed: null,
    scheduled: false,
    charts: ["bar", "line"],
    status: "generating",
  },
  {
    id: "report-006",
    name: "Weekly Completion Rate Dashboard",
    type: "completion",
    level: "program",
    scope: "All Projects",
    createdBy: "System",
    createdDate: "2025-05-21T07:00:00",
    lastViewed: "2025-05-21T08:15:00",
    scheduled: true,
    scheduledRecipients: [
      "admin@example.com",
      "managers@example.com",
      "directors@example.com",
    ],
    scheduledFrequency: "weekly",
    charts: ["line", "bar", "pie"],
    status: "completed",
  },
];

// Mock data for report templates
const mockReportTemplates = [
  {
    id: "template-001",
    name: "Beneficiary List",
    type: "beneficiary",
    description:
      "Comprehensive list of beneficiaries with demographic information and service history",
    charts: ["pie", "bar"],
    lastUsed: "2025-05-20T14:30:00",
  },
  {
    id: "template-002",
    name: "Activity Log",
    type: "activity",
    description:
      "Detailed log of all activities with status, responsible staff, and timeline",
    charts: ["bar", "line"],
    lastUsed: "2025-05-18T09:15:00",
  },
  {
    id: "template-003",
    name: "Completion Rate Analysis",
    type: "completion",
    description:
      "Analysis of activity completion rates with trends and comparisons",
    charts: ["line", "bar", "pie"],
    lastUsed: "2025-05-15T11:45:00",
  },
  {
    id: "template-004",
    name: "Monthly Project Summary",
    type: "summary",
    description:
      "Monthly summary of project activities, beneficiaries, and outcomes",
    charts: ["bar", "pie", "line"],
    lastUsed: "2025-05-12T10:20:00",
  },
];

// Mock data for projects
const mockProjects = [
  {
    id: "proj-001",
    title: "Rural Healthcare Initiative",
    subProjects: [
      { id: "sub-001", title: "Maternal Health Services" },
      { id: "sub-002", title: "Child Vaccination Campaign" },
      { id: "sub-004", title: "Nutrition Support" },
    ],
  },
  {
    id: "proj-002",
    title: "Community Development",
    subProjects: [
      { id: "sub-003", title: "Water Access Program" },
      { id: "sub-005", title: "Food Security Initiative" },
    ],
  },
  {
    id: "proj-003",
    title: "Youth Empowerment Program",
    subProjects: [
      { id: "sub-006", title: "Education Support" },
      { id: "sub-007", title: "Skills Training" },
    ],
  },
];

// Props interface
interface ReportsListProps {
  onReportSelect: (reportId: string) => void;
  onCreateReport: (config: any) => void;
}

export function ReportsList({
  onReportSelect,
  onCreateReport,
}: ReportsListProps) {
  const [activeTab, setActiveTab] = useState("saved-reports");
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [levelFilter, setLevelFilter] = useState("all");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [isNewReportDialogOpen, setIsNewReportDialogOpen] = useState(false);

  // New report form state
  const [newReportName, setNewReportName] = useState("");
  const [newReportType, setNewReportType] = useState("");
  const [newReportLevel, setNewReportLevel] = useState("");
  const [newReportScope, setNewReportScope] = useState("");
  const [newReportSchedule, setNewReportSchedule] = useState(false);

  // Filter saved reports
  const filteredReports = mockSavedReports.filter((report) => {
    const matchesSearch =
      report.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.scope.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = typeFilter === "all" || report.type === typeFilter;

    const matchesLevel = levelFilter === "all" || report.level === levelFilter;

    return matchesSearch && matchesType && matchesLevel;
  });

  // Handle creating a new report
  const handleCreateReport = () => {
    // Create a configuration object based on form inputs
    const config = {
      name: newReportName,
      type: newReportType,
      level: newReportLevel,
      scope: newReportScope,
      scheduled: newReportSchedule,
    };

    // Close the dialog
    setIsNewReportDialogOpen(false);

    // Reset form
    setNewReportName("");
    setNewReportType("");
    setNewReportLevel("");
    setNewReportScope("");
    setNewReportSchedule(false);

    // Call the parent component's handler
    onCreateReport(config);
  };

  // Get filtered subprojects based on selected level and scope
  // const getFilteredSubprojects = () => {
  //   if (newReportLevel === "project") {
  //     const selectedProject = mockProjects.find((p) => p.id === newReportScope);
  //     return selectedProject ? selectedProject.subProjects : [];
  //   }
  //   return [];
  // };

  // Render chart icons for a report
  const renderChartIcons = (charts: string[]) => {
    return (
      <div className="flex gap-1">
        {charts.includes("pie") && (
          <PieChart className="h-4 w-4 text-muted-foreground" />
        )}
        {charts.includes("bar") && (
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        )}
        {charts.includes("line") && (
          <LineChart className="h-4 w-4 text-muted-foreground" />
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2>Reports</h2>
          <p className="text-muted-foreground">
            Generate and manage project reports
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          >
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Advanced Filters
          </Button>

          <Dialog
            open={isNewReportDialogOpen}
            onOpenChange={setIsNewReportDialogOpen}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px]">
              <DialogHeader>
                <DialogTitle>Generate New Report</DialogTitle>
                <DialogDescription>
                  Configure the report parameters. You'll be able to customize
                  the report further in the next step.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="report-name">Report Name *</Label>
                  <Input
                    id="report-name"
                    placeholder="Enter report name"
                    value={newReportName}
                    onChange={(e) => setNewReportName(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="report-type">Report Type *</Label>
                  <Select
                    value={newReportType}
                    onValueChange={setNewReportType}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select report type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beneficiary">
                        Beneficiary List
                      </SelectItem>
                      <SelectItem value="activity">Activity Log</SelectItem>
                      <SelectItem value="completion">
                        Completion Rates
                      </SelectItem>
                      <SelectItem value="summary">Summary Report</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="report-level">Report Level *</Label>
                  <Select
                    value={newReportLevel}
                    onValueChange={setNewReportLevel}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select report level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="program">
                        Program (All Projects)
                      </SelectItem>
                      <SelectItem value="project">Project</SelectItem>
                      <SelectItem value="subproject">Sub-Project</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {newReportLevel === "project" && (
                  <div className="grid gap-2">
                    <Label htmlFor="report-project">Select Project</Label>
                    <Select
                      value={newReportScope}
                      onValueChange={setNewReportScope}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select project" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockProjects.map((project) => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {newReportLevel === "subproject" && (
                  <div className="grid gap-2">
                    <Label htmlFor="report-subproject">
                      Select Sub-Project
                    </Label>
                    <Select
                      value={newReportScope}
                      onValueChange={setNewReportScope}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select sub-project" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockProjects.flatMap((project) =>
                          project.subProjects.map((subProject) => (
                            <SelectItem
                              key={subProject.id}
                              value={subProject.id}
                            >
                              {subProject.title} ({project.title})
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Switch
                    id="report-schedule"
                    checked={newReportSchedule}
                    onCheckedChange={setNewReportSchedule}
                  />
                  <Label htmlFor="report-schedule">
                    Schedule regular report generation
                  </Label>
                </div>

                {newReportSchedule && (
                  <div className="grid gap-2 border rounded-md p-3">
                    <p className="text-sm text-muted-foreground">
                      You can configure the schedule details after creating the
                      report.
                    </p>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsNewReportDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateReport}
                  disabled={
                    !newReportName ||
                    !newReportType ||
                    !newReportLevel ||
                    (newReportLevel !== "program" && !newReportScope)
                  }
                >
                  Continue
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 justify-between">
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search reports..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-3">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[150px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="beneficiary">Beneficiary</SelectItem>
                <SelectItem value="activity">Activity</SelectItem>
                <SelectItem value="completion">Completion</SelectItem>
                <SelectItem value="summary">Summary</SelectItem>
              </SelectContent>
            </Select>
            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger className="w-[150px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="program">Program</SelectItem>
                <SelectItem value="project">Project</SelectItem>
                <SelectItem value="subproject">Sub-Project</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <FileDown className="h-4 w-4 mr-2" />
            Export List
          </Button>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-[220px]"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="saved-reports">Saved</TabsTrigger>
              <TabsTrigger value="templates">Templates</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {showAdvancedFilters && (
        <Card className="mb-6">
          <CardContent className="py-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Created By</Label>
                <Select>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="All users" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="jane">Jane Smith</SelectItem>
                    <SelectItem value="robert">Robert Johnson</SelectItem>
                    <SelectItem value="michael">Michael Lee</SelectItem>
                    <SelectItem value="sarah">Sarah Johnson</SelectItem>
                    <SelectItem value="jennifer">Jennifer Davis</SelectItem>
                    <SelectItem value="system">System Generated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Date Created</Label>
                <Select>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Any time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="quarter">This Quarter</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Status</Label>
                <Select>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Any status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any Status</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="generating">Generating</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <Button variant="outline" size="sm" className="mr-2">
                Reset Filters
              </Button>
              <Button size="sm">Apply Filters</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsContent value="saved-reports">
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">Report Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Charts</TableHead>
                  <TableHead>Created By</TableHead>
                  <TableHead>Date Created</TableHead>
                  <TableHead>Scheduled</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{report.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {report.scope}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {report.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="capitalize">{report.level}</TableCell>
                    <TableCell>{renderChartIcons(report.charts)}</TableCell>
                    <TableCell>{report.createdBy}</TableCell>
                    <TableCell>
                      {new Date(report.createdDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {report.scheduled ? (
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Weekly
                        </Badge>
                      ) : (
                        <Badge variant="outline">One-time</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onReportSelect(report.id)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <FileSpreadsheet className="h-4 w-4 mr-2" />
                              Export Excel
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <FileText className="h-4 w-4 mr-2" />
                              Export PDF
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Mail className="h-4 w-4 mr-2" />
                              Email Report
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Copy className="h-4 w-4 mr-2" />
                              Duplicate
                            </DropdownMenuItem>
                            {!report.scheduled ? (
                              <DropdownMenuItem>
                                <Repeat className="h-4 w-4 mr-2" />
                                Schedule
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem>
                                <Settings className="h-4 w-4 mr-2" />
                                Edit Schedule
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem className="text-destructive">
                              <Trash className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredReports.length === 0 && (
            <div className="text-center py-10 border rounded-lg">
              <FileBarChart className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-lg mb-2">No reports found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your filters or create a new report.
              </p>
              <Button onClick={() => setIsNewReportDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="templates">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockReportTemplates.map((template) => (
              <Card key={template.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <FileBarChart className="h-5 w-5 text-muted-foreground" />
                        <span>{template.name}</span>
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {template.description}
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          Preview
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Copy className="h-4 w-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Settings className="h-4 w-4 mr-2" />
                          Edit Template
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-1.5">
                      <Badge variant="outline" className="capitalize">
                        {template.type}
                      </Badge>
                      <div className="flex gap-1 items-center border rounded-full px-2 py-0.5">
                        {renderChartIcons(template.charts)}
                      </div>
                    </div>

                    <div className="text-sm text-muted-foreground">
                      Last used:{" "}
                      {new Date(template.lastUsed).toLocaleDateString()}
                    </div>
                  </div>
                </CardContent>
                <div className="px-6 py-4 bg-muted/50 flex justify-end">
                  <Button
                    onClick={() => {
                      setNewReportType(template.type);
                      setIsNewReportDialogOpen(true);
                    }}
                  >
                    Use Template
                  </Button>
                </div>
              </Card>
            ))}

            {/* Create new template card */}
            <Card className="border-dashed flex flex-col items-center justify-center p-6">
              <div className="rounded-full border-dashed border-2 p-3 mb-3">
                <Plus className="h-6 w-6 text-muted-foreground" />
              </div>
              <h4 className="mb-1">Create New Template</h4>
              <p className="text-sm text-muted-foreground text-center mb-3">
                Design a custom report template for future use
              </p>
              <Button>Create Template</Button>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-muted-foreground">
          {activeTab === "saved-reports" && (
            <>
              Showing {filteredReports.length} of {mockSavedReports.length}{" "}
              reports
            </>
          )}
          {activeTab === "templates" && (
            <>Showing {mockReportTemplates.length} templates</>
          )}
        </div>
        <div className="space-x-2">
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Scheduled Reports
          </Button>
          <Button variant="outline" size="sm">
            <UserCircle className="h-4 w-4 mr-2" />
            Manage Recipients
          </Button>
        </div>
      </div>
    </div>
  );
}
