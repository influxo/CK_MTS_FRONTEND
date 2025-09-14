import { format } from "date-fns";
import {
  ArrowLeft,
  BarChart3,
  Calendar as CalendarIcon,
  Check,
  Download,
  FileBarChart,
  Info,
  LineChart,
  PieChart,
  Plus,
  Save,
  Settings,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "../ui/data-display/badge";
import { Button } from "../ui/button/button";
import { Calendar } from "../ui/data-display/calendar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../ui/data-display/card";
import { Checkbox } from "../ui/form/checkbox";
import { Input } from "../ui/form/input";
import { Label } from "../ui/form/label";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/overlay/popover";
import { RadioGroup, RadioGroupItem } from "../ui/form/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/form/select";
import { Separator } from "../ui/layout/separator";
import { Switch } from "../ui/form/switch";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../ui/navigation/tabs";
import { Textarea } from "../ui/form/textarea";

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

// Mock data for report fields based on type
const reportFieldsByType: any = {
  beneficiary: [
    { id: "name", label: "Name", selected: true },
    { id: "id", label: "ID", selected: true },
    { id: "gender", label: "Gender", selected: true },
    { id: "age", label: "Age", selected: true },
    { id: "location", label: "Location", selected: true },
    { id: "household", label: "Household ID", selected: false },
    { id: "contact", label: "Contact Information", selected: false },
    { id: "registration_date", label: "Registration Date", selected: true },
    { id: "status", label: "Status", selected: true },
    { id: "vulnerability", label: "Vulnerability Score", selected: false },
    { id: "services_received", label: "Services Received", selected: true },
    { id: "last_service", label: "Last Service Date", selected: false },
  ],
  activity: [
    { id: "activity_name", label: "Activity Name", selected: true },
    { id: "activity_type", label: "Activity Type", selected: true },
    { id: "description", label: "Description", selected: true },
    { id: "start_date", label: "Start Date", selected: true },
    { id: "end_date", label: "End Date", selected: true },
    { id: "status", label: "Status", selected: true },
    { id: "location", label: "Location", selected: true },
    { id: "responsible_staff", label: "Responsible Staff", selected: true },
    { id: "beneficiaries_count", label: "Beneficiaries Count", selected: true },
    { id: "budget", label: "Budget", selected: false },
    { id: "expenditure", label: "Expenditure", selected: false },
    { id: "notes", label: "Notes", selected: false },
  ],
  completion: [
    { id: "activity_name", label: "Activity Name", selected: true },
    { id: "planned_count", label: "Planned Count", selected: true },
    { id: "completed_count", label: "Completed Count", selected: true },
    { id: "completion_rate", label: "Completion Rate", selected: true },
    { id: "target_date", label: "Target Date", selected: true },
    { id: "actual_date", label: "Actual Date", selected: true },
    { id: "variance", label: "Variance (Days)", selected: true },
    { id: "status", label: "Status", selected: true },
    { id: "responsible_staff", label: "Responsible Staff", selected: false },
    { id: "notes", label: "Notes", selected: false },
  ],
  summary: [
    { id: "project_name", label: "Project Name", selected: true },
    { id: "period", label: "Reporting Period", selected: true },
    { id: "activities_count", label: "Activities Count", selected: true },
    { id: "beneficiaries_count", label: "Beneficiaries Count", selected: true },
    { id: "completion_rate", label: "Overall Completion Rate", selected: true },
    { id: "budget_utilization", label: "Budget Utilization", selected: true },
    { id: "key_achievements", label: "Key Achievements", selected: true },
    { id: "challenges", label: "Challenges", selected: false },
    { id: "next_steps", label: "Next Steps", selected: false },
    { id: "risk_assessment", label: "Risk Assessment", selected: false },
  ],
};

// Mock chart types
const chartTypes = [
  { id: "pie", label: "Pie Chart", icon: <PieChart className="h-5 w-5" /> },
  { id: "bar", label: "Bar Chart", icon: <BarChart3 className="h-5 w-5" /> },
  { id: "line", label: "Line Chart", icon: <LineChart className="h-5 w-5" /> },
];

// Mock email recipients
const mockRecipients = [
  {
    id: "admin",
    email: "admin@example.com",
    name: "Admin Team",
    selected: true,
  },
  {
    id: "managers",
    email: "managers@example.com",
    name: "Project Managers",
    selected: true,
  },
  {
    id: "directors",
    email: "directors@example.com",
    name: "Directors",
    selected: false,
  },
  {
    id: "field",
    email: "field@example.com",
    name: "Field Staff",
    selected: false,
  },
  {
    id: "partners",
    email: "partners@example.com",
    name: "Partner Organizations",
    selected: false,
  },
];

interface ReportGeneratorProps {
  initialConfig?: any;
  onBack: () => void;
  onReportGenerated: (reportId: string) => void;
}

export function ReportGenerator({
  initialConfig,
  onBack,
  onReportGenerated,
}: ReportGeneratorProps) {
  // Initialize state with initial configuration if provided
  const [reportConfig, setReportConfig] = useState({
    name: initialConfig?.name || "",
    type: initialConfig?.type || "beneficiary",
    level: initialConfig?.level || "program",
    scope: initialConfig?.scope || "",
    fields: reportFieldsByType[initialConfig?.type || "beneficiary"],
    dateRange: {
      startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)),
      endDate: new Date(),
    },
    charts: ["pie", "bar"],
    scheduled: initialConfig?.scheduled || false,
    scheduledFrequency: "weekly",
    scheduledDay: "monday",
    recipients: mockRecipients,
    includeAttachments: true,
    includeCharts: true,
    notes: "",
  });

  const [activeTab, setActiveTab] = useState("fields");
  const [isGenerating, setIsGenerating] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  // Get the appropriate fields based on the current report type
  const getReportFields = () => {
    return reportFieldsByType[reportConfig.type] || [];
  };

  // Toggle field selection
  const toggleField = (fieldId: string) => {
    setReportConfig({
      ...reportConfig,
      fields: reportConfig.fields.map((field: any) =>
        field.id === fieldId ? { ...field, selected: !field.selected } : field
      ),
    });
  };

  // Toggle chart selection
  const toggleChart = (chartId: string) => {
    if (reportConfig.charts.includes(chartId)) {
      setReportConfig({
        ...reportConfig,
        charts: reportConfig.charts.filter((id) => id !== chartId),
      });
    } else {
      setReportConfig({
        ...reportConfig,
        charts: [...reportConfig.charts, chartId],
      });
    }
  };

  // Toggle recipient selection
  const toggleRecipient = (recipientId: string) => {
    setReportConfig({
      ...reportConfig,
      recipients: reportConfig.recipients.map((recipient) =>
        recipient.id === recipientId
          ? { ...recipient, selected: !recipient.selected }
          : recipient
      ),
    });
  };

  // Handle report generation
  const handleGenerateReport = () => {
    setIsGenerating(true);

    // Simulate report generation process
    setTimeout(() => {
      setIsGenerating(false);
      // Generate a random report ID
      const reportId = `report-${Math.floor(Math.random() * 10000)}`;
      // Call the parent component's handler
      onReportGenerated(reportId);
    }, 2000);
  };

  // Format date range for display
  const formattedDateRange = `${format(
    reportConfig.dateRange.startDate,
    "MMMM dd, yyyy"
  )} - ${format(reportConfig.dateRange.endDate, "MMMM dd, yyyy")}`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Reports
          </Button>
          <h2>Generate Report: {reportConfig.name}</h2>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" disabled={isGenerating}>
            <Save className="h-4 w-4 mr-2" />
            Save as Template
          </Button>
          <Button onClick={handleGenerateReport} disabled={isGenerating}>
            {isGenerating ? (
              <>Generating...</>
            ) : (
              <>
                <FileBarChart className="h-4 w-4 mr-2" />
                Generate Report
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Report Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="report-name">Report Name</Label>
                <Input
                  id="report-name"
                  value={reportConfig.name}
                  onChange={(e) =>
                    setReportConfig({ ...reportConfig, name: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="report-type">Report Type</Label>
                <Select
                  value={reportConfig.type}
                  onValueChange={(value: any) =>
                    setReportConfig({
                      ...reportConfig,
                      type: value,
                      fields: reportFieldsByType[value],
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select report type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beneficiary">
                      Beneficiary List
                    </SelectItem>
                    <SelectItem value="activity">Activity Log</SelectItem>
                    <SelectItem value="completion">Completion Rates</SelectItem>
                    <SelectItem value="summary">Summary Report</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="report-level">Report Level</Label>
                <Select
                  value={reportConfig.level}
                  onValueChange={(value: any) =>
                    setReportConfig({ ...reportConfig, level: value })
                  }
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

              {reportConfig.level === "project" && (
                <div className="space-y-2">
                  <Label htmlFor="report-project">Select Project</Label>
                  <Select
                    value={reportConfig.scope}
                    onValueChange={(value: any) =>
                      setReportConfig({ ...reportConfig, scope: value })
                    }
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

              {reportConfig.level === "subproject" && (
                <div className="space-y-2">
                  <Label htmlFor="report-subproject">Select Sub-Project</Label>
                  <Select
                    value={reportConfig.scope}
                    onValueChange={(value: any) =>
                      setReportConfig({ ...reportConfig, scope: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select sub-project" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockProjects.flatMap((project) =>
                        project.subProjects.map((subProject) => (
                          <SelectItem key={subProject.id} value={subProject.id}>
                            {subProject.title} ({project.title})
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label>Date Range</Label>
                <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      {formattedDateRange}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="range"
                      selected={{
                        from: reportConfig.dateRange.startDate,
                        to: reportConfig.dateRange.endDate,
                      }}
                      onSelect={(range: any) => {
                        if (range?.from && range?.to) {
                          setReportConfig({
                            ...reportConfig,
                            dateRange: {
                              startDate: range.from,
                              endDate: range.to,
                            },
                          });
                          setDatePickerOpen(false);
                        }
                      }}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="report-schedule">Schedule Report</Label>
                  <Switch
                    id="report-schedule"
                    checked={reportConfig.scheduled}
                    onCheckedChange={(checked: any) =>
                      setReportConfig({ ...reportConfig, scheduled: checked })
                    }
                  />
                </div>

                {reportConfig.scheduled && (
                  <div className="space-y-4 p-3 border rounded-md">
                    <div className="space-y-2">
                      <Label>Frequency</Label>
                      <RadioGroup
                        value={reportConfig.scheduledFrequency}
                        onValueChange={(value: any) =>
                          setReportConfig({
                            ...reportConfig,
                            scheduledFrequency: value,
                          })
                        }
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="daily" id="freq-daily" />
                          <Label htmlFor="freq-daily" className="font-normal">
                            Daily
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="weekly" id="freq-weekly" />
                          <Label htmlFor="freq-weekly" className="font-normal">
                            Weekly
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="monthly" id="freq-monthly" />
                          <Label htmlFor="freq-monthly" className="font-normal">
                            Monthly
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {reportConfig.scheduledFrequency === "weekly" && (
                      <div className="space-y-2">
                        <Label htmlFor="schedule-day">Day of the Week</Label>
                        <Select
                          value={reportConfig.scheduledDay}
                          onValueChange={(value: any) =>
                            setReportConfig({
                              ...reportConfig,
                              scheduledDay: value,
                            })
                          }
                        >
                          <SelectTrigger id="schedule-day">
                            <SelectValue placeholder="Select day" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="monday">Monday</SelectItem>
                            <SelectItem value="tuesday">Tuesday</SelectItem>
                            <SelectItem value="wednesday">Wednesday</SelectItem>
                            <SelectItem value="thursday">Thursday</SelectItem>
                            <SelectItem value="friday">Friday</SelectItem>
                            <SelectItem value="saturday">Saturday</SelectItem>
                            <SelectItem value="sunday">Sunday</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label>Recipients</Label>
                      <div className="space-y-2">
                        {reportConfig.recipients.map((recipient) => (
                          <div
                            key={recipient.id}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={`recipient-${recipient.id}`}
                              checked={recipient.selected}
                              onCheckedChange={() =>
                                toggleRecipient(recipient.id)
                              }
                            />
                            <Label
                              htmlFor={`recipient-${recipient.id}`}
                              className="font-normal"
                            >
                              {recipient.name} ({recipient.email})
                            </Label>
                          </div>
                        ))}
                      </div>
                      <Button variant="outline" size="sm" className="mt-2">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Recipient
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="include-attachments"
                          checked={reportConfig.includeAttachments}
                          onCheckedChange={(checked: any) =>
                            setReportConfig({
                              ...reportConfig,
                              includeAttachments: !!checked,
                            })
                          }
                        />
                        <Label
                          htmlFor="include-attachments"
                          className="font-normal"
                        >
                          Include Excel/PDF attachments
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="include-charts"
                          checked={reportConfig.includeCharts}
                          onCheckedChange={(checked: any) =>
                            setReportConfig({
                              ...reportConfig,
                              includeCharts: !!checked,
                            })
                          }
                        />
                        <Label htmlFor="include-charts" className="font-normal">
                          Include charts in email body
                        </Label>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="report-notes">Notes</Label>
                <Textarea
                  id="report-notes"
                  placeholder="Add any notes about this report"
                  value={reportConfig.notes}
                  onChange={(e) =>
                    setReportConfig({ ...reportConfig, notes: e.target.value })
                  }
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="col-span-12 lg:col-span-8">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Report Content</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Preview PDF
                  </Button>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Advanced Options
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3 mb-6">
                  <TabsTrigger value="fields">Fields</TabsTrigger>
                  <TabsTrigger value="charts">
                    Charts & Visualizations
                  </TabsTrigger>
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                </TabsList>

                <TabsContent value="fields">
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h3>Select Fields to Include</h3>
                      <Button variant="outline" size="sm">
                        <Check className="h-4 w-4 mr-2" />
                        Select All
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {getReportFields().map((field: any) => (
                        <div
                          key={field.id}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={`field-${field.id}`}
                            checked={field.selected}
                            onCheckedChange={() => toggleField(field.id)}
                          />
                          <Label
                            htmlFor={`field-${field.id}`}
                            className="font-normal"
                          >
                            {field.label}
                          </Label>
                        </div>
                      ))}
                    </div>

                    <div className="border border-dashed rounded-md p-4 flex justify-center">
                      <Button variant="outline">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Custom Field
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="charts">
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h3>Charts & Visualizations</h3>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Info className="h-4 w-4 mr-1" />
                        <span>Select up to 3 chart types</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {chartTypes.map((chart: any) => (
                        <div
                          key={chart.id}
                          className={`border rounded-md p-4 flex flex-col items-center gap-3 cursor-pointer ${
                            reportConfig.charts.includes(chart.id)
                              ? "border-primary bg-primary/5"
                              : "hover:border-muted-foreground"
                          }`}
                          onClick={() => toggleChart(chart.id)}
                        >
                          <div
                            className={`text-${
                              reportConfig.charts.includes(chart.id)
                                ? "primary"
                                : "muted-foreground"
                            }`}
                          >
                            {chart.icon}
                          </div>
                          <div className="font-medium">{chart.label}</div>
                          <Checkbox
                            checked={reportConfig.charts.includes(chart.id)}
                            className="hidden"
                          />
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {reportConfig.charts.includes("pie") && (
                        <div className="border rounded-md p-4 space-y-3">
                          <h4>Pie Chart Configuration</h4>
                          <div className="space-y-2">
                            <Label htmlFor="pie-title">Chart Title</Label>
                            <Input
                              id="pie-title"
                              defaultValue={`${
                                reportConfig.type === "beneficiary"
                                  ? "Beneficiary Demographics"
                                  : reportConfig.type === "activity"
                                  ? "Activity Distribution"
                                  : "Completion Status"
                              }`}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="pie-data">Data Dimension</Label>
                            <Select
                              defaultValue={
                                reportConfig.type === "beneficiary"
                                  ? "gender"
                                  : reportConfig.type === "activity"
                                  ? "activity_type"
                                  : "status"
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select data dimension" />
                              </SelectTrigger>
                              <SelectContent>
                                {reportConfig.type === "beneficiary" && (
                                  <>
                                    <SelectItem value="gender">
                                      Gender
                                    </SelectItem>
                                    <SelectItem value="age_group">
                                      Age Group
                                    </SelectItem>
                                    <SelectItem value="location">
                                      Location
                                    </SelectItem>
                                    <SelectItem value="vulnerability">
                                      Vulnerability
                                    </SelectItem>
                                    <SelectItem value="status">
                                      Status
                                    </SelectItem>
                                  </>
                                )}
                                {reportConfig.type === "activity" && (
                                  <>
                                    <SelectItem value="activity_type">
                                      Activity Type
                                    </SelectItem>
                                    <SelectItem value="status">
                                      Status
                                    </SelectItem>
                                    <SelectItem value="location">
                                      Location
                                    </SelectItem>
                                  </>
                                )}
                                {reportConfig.type === "completion" && (
                                  <>
                                    <SelectItem value="status">
                                      Status
                                    </SelectItem>
                                    <SelectItem value="variance_group">
                                      Variance Group
                                    </SelectItem>
                                  </>
                                )}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      )}

                      {reportConfig.charts.includes("bar") && (
                        <div className="border rounded-md p-4 space-y-3">
                          <h4>Bar Chart Configuration</h4>
                          <div className="space-y-2">
                            <Label htmlFor="bar-title">Chart Title</Label>
                            <Input
                              id="bar-title"
                              defaultValue={`${
                                reportConfig.type === "beneficiary"
                                  ? "Beneficiaries by Location"
                                  : reportConfig.type === "activity"
                                  ? "Activities by Status"
                                  : "Completion Rates by Activity"
                              }`}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="bar-data">Data Dimension</Label>
                            <Select
                              defaultValue={
                                reportConfig.type === "beneficiary"
                                  ? "location"
                                  : reportConfig.type === "activity"
                                  ? "status"
                                  : "completion_rate"
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select data dimension" />
                              </SelectTrigger>
                              <SelectContent>
                                {reportConfig.type === "beneficiary" && (
                                  <>
                                    <SelectItem value="location">
                                      Location
                                    </SelectItem>
                                    <SelectItem value="services_received">
                                      Services Received
                                    </SelectItem>
                                    <SelectItem value="age_group">
                                      Age Group
                                    </SelectItem>
                                  </>
                                )}
                                {reportConfig.type === "activity" && (
                                  <>
                                    <SelectItem value="status">
                                      Status
                                    </SelectItem>
                                    <SelectItem value="activity_type">
                                      Activity Type
                                    </SelectItem>
                                    <SelectItem value="responsible_staff">
                                      Responsible Staff
                                    </SelectItem>
                                  </>
                                )}
                                {reportConfig.type === "completion" && (
                                  <>
                                    <SelectItem value="completion_rate">
                                      Completion Rate
                                    </SelectItem>
                                    <SelectItem value="variance">
                                      Timeline Variance
                                    </SelectItem>
                                  </>
                                )}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      )}

                      {reportConfig.charts.includes("line") && (
                        <div className="border rounded-md p-4 space-y-3">
                          <h4>Line Chart Configuration</h4>
                          <div className="space-y-2">
                            <Label htmlFor="line-title">Chart Title</Label>
                            <Input
                              id="line-title"
                              defaultValue={`${
                                reportConfig.type === "beneficiary"
                                  ? "Beneficiary Registration Trend"
                                  : reportConfig.type === "activity"
                                  ? "Activity Timeline"
                                  : "Completion Rate Trend"
                              }`}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="line-data">Data Dimension</Label>
                            <Select
                              defaultValue={
                                reportConfig.type === "beneficiary"
                                  ? "registration_date"
                                  : reportConfig.type === "activity"
                                  ? "start_date"
                                  : "completion_trend"
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select data dimension" />
                              </SelectTrigger>
                              <SelectContent>
                                {reportConfig.type === "beneficiary" && (
                                  <>
                                    <SelectItem value="registration_date">
                                      Registration Date
                                    </SelectItem>
                                    <SelectItem value="service_date">
                                      Service Date
                                    </SelectItem>
                                  </>
                                )}
                                {reportConfig.type === "activity" && (
                                  <>
                                    <SelectItem value="start_date">
                                      Start Date
                                    </SelectItem>
                                    <SelectItem value="end_date">
                                      End Date
                                    </SelectItem>
                                  </>
                                )}
                                {reportConfig.type === "completion" && (
                                  <>
                                    <SelectItem value="completion_trend">
                                      Completion Trend
                                    </SelectItem>
                                    <SelectItem value="target_vs_actual">
                                      Target vs Actual
                                    </SelectItem>
                                  </>
                                )}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="preview">
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h3>Report Preview</h3>
                      <Badge variant="outline">Preview Mode</Badge>
                    </div>

                    <div className="border rounded-md p-8 space-y-6 bg-card">
                      <div className="space-y-1 text-center mb-6">
                        <h2 className="text-xl">{reportConfig.name}</h2>
                        <p className="text-muted-foreground">
                          {formattedDateRange}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <h4>Report Details</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">
                              Report Type:
                            </span>
                            <span className="ml-2 capitalize">
                              {reportConfig.type}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">
                              Level:
                            </span>
                            <span className="ml-2 capitalize">
                              {reportConfig.level}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">
                              Scope:
                            </span>
                            <span className="ml-2">
                              {reportConfig.level === "program"
                                ? "All Projects"
                                : reportConfig.level === "project"
                                ? mockProjects.find(
                                    (p) => p.id === reportConfig.scope
                                  )?.title || reportConfig.scope
                                : mockProjects
                                    .flatMap((p) => p.subProjects)
                                    .find((s) => s.id === reportConfig.scope)
                                    ?.title || reportConfig.scope}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">
                              Generated On:
                            </span>
                            <span className="ml-2">
                              {format(new Date(), "MMMM dd, yyyy")}
                            </span>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      {reportConfig.charts.length > 0 && (
                        <div className="space-y-4">
                          <h4>Charts & Visualizations</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {reportConfig.charts.map((chartType) => (
                              <div
                                key={chartType}
                                className="border rounded-md p-4 h-[200px] flex items-center justify-center"
                              >
                                <div className="text-center text-muted-foreground">
                                  {chartType === "pie" && (
                                    <PieChart className="h-10 w-10 mx-auto mb-2" />
                                  )}
                                  {chartType === "bar" && (
                                    <BarChart3 className="h-10 w-10 mx-auto mb-2" />
                                  )}
                                  {chartType === "line" && (
                                    <LineChart className="h-10 w-10 mx-auto mb-2" />
                                  )}
                                  <p>
                                    {chartType === "pie" && "Pie Chart Preview"}
                                    {chartType === "bar" && "Bar Chart Preview"}
                                    {chartType === "line" &&
                                      "Line Chart Preview"}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="space-y-4">
                        <h4>Data Preview</h4>
                        <div className="border rounded-md p-4 overflow-hidden">
                          <p className="text-muted-foreground text-center py-4">
                            Data table will be generated with{" "}
                            {
                              reportConfig.fields.filter((f: any) => f.selected)
                                .length
                            }{" "}
                            selected fields
                          </p>
                        </div>
                      </div>

                      {reportConfig.notes && (
                        <div className="space-y-2">
                          <h4>Notes</h4>
                          <div className="text-sm p-3 border rounded-md bg-muted/30">
                            {reportConfig.notes}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <div className="flex justify-end mt-6">
            <Button
              onClick={handleGenerateReport}
              disabled={isGenerating}
              size="lg"
            >
              {isGenerating ? (
                <>Generating...</>
              ) : (
                <>
                  <FileBarChart className="h-4 w-4 mr-2" />
                  Generate Report
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
