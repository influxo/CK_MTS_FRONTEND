import {
  Check,
  Clock,
  Download,
  Eye,
  FileEdit,
  FileSpreadsheet,
  FileText,
  Plus,
  Printer,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "../ui/data-display/badge";
import { Button } from "../ui/button/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../ui/data-display/card";
import { Checkbox } from "../ui/form/checkbox";
import { Input } from "../ui/form/input";
import { Label } from "../ui/form/label";
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

interface SubProjectReportsProps {
  subProjectId: string;
}

// Mock saved reports
const mockSavedReports = [
  {
    id: "report-001",
    subProjectId: "sub-001",
    title: "Monthly Activity Report - April 2025",
    type: "activity",
    createdBy: "Jane Smith",
    createdDate: "2025-05-05T10:30:00",
    periodCovered: "April 2025",
    format: "pdf",
    status: "completed",
  },
  {
    id: "report-002",
    subProjectId: "sub-001",
    title: "Beneficiary Status Report",
    type: "beneficiary",
    createdBy: "Robert Johnson",
    createdDate: "2025-05-10T14:45:00",
    periodCovered: "Q1 2025",
    format: "excel",
    status: "completed",
  },
  {
    id: "report-003",
    subProjectId: "sub-001",
    title: "Service Delivery Summary",
    type: "service",
    createdBy: "Jane Smith",
    createdDate: "2025-05-15T09:15:00",
    periodCovered: "Jan-Apr 2025",
    format: "pdf",
    status: "completed",
  },
  {
    id: "report-004",
    subProjectId: "sub-001",
    title: "Upcoming Monthly Report - May 2025",
    type: "activity",
    createdBy: "System",
    createdDate: "2025-05-25T08:00:00",
    periodCovered: "May 2025",
    format: "pdf",
    status: "scheduled",
  },
  {
    id: "report-005",
    subProjectId: "sub-002",
    title: "Vaccination Campaign Summary",
    type: "service",
    createdBy: "Michael Wong",
    createdDate: "2025-05-12T11:30:00",
    periodCovered: "Feb-Apr 2025",
    format: "pdf",
    status: "completed",
  },
];

// Mock KPI data
const mockKPIs = [
  {
    id: "kpi-001",
    subProjectId: "sub-001",
    title: "Prenatal Checkups Conducted",
    category: "Service Delivery",
    target: 500,
    current: 325,
    period: "Q1-Q2 2025",
    unit: "checkups",
  },
  {
    id: "kpi-002",
    subProjectId: "sub-001",
    title: "Women Receiving Health Education",
    category: "Education",
    target: 1000,
    current: 780,
    period: "Q1-Q2 2025",
    unit: "beneficiaries",
  },
  {
    id: "kpi-003",
    subProjectId: "sub-001",
    title: "Community Health Workers Trained",
    category: "Training",
    target: 30,
    current: 28,
    period: "Q1-Q2 2025",
    unit: "staff",
  },
  {
    id: "kpi-004",
    subProjectId: "sub-001",
    title: "Health Education Sessions",
    category: "Education",
    target: 60,
    current: 42,
    period: "Q1-Q2 2025",
    unit: "sessions",
  },
];

// Mock report templates
const mockReportTemplates = [
  {
    id: "template-001",
    title: "Monthly Activity Summary",
    type: "activity",
    description: "Standard monthly summary of all activities conducted",
    lastUsed: "2025-05-10T15:30:00",
  },
  {
    id: "template-002",
    title: "Beneficiary Status Report",
    type: "beneficiary",
    description:
      "Detailed report on beneficiary demographics and service coverage",
    lastUsed: "2025-04-20T11:45:00",
  },
  {
    id: "template-003",
    title: "Service Delivery Analysis",
    type: "service",
    description: "Analysis of service delivery efficiency and coverage metrics",
    lastUsed: "2025-05-01T09:15:00",
  },
  {
    id: "template-004",
    title: "Quarterly Progress Report",
    type: "progress",
    description: "Comprehensive quarterly report for stakeholders and donors",
    lastUsed: "2025-04-05T14:20:00",
  },
];

export function SubProjectReports({ subProjectId }: SubProjectReportsProps) {
  const [activeTab, setActiveTab] = useState("saved-reports");
  const [selectedReportType, setSelectedReportType] = useState("activity");
  const [selectedPeriod, setSelectedPeriod] = useState("last-month");
  const [selectedFormat, setSelectedFormat] = useState("pdf");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [showTemplates, setShowTemplates] = useState(false);

  // Filter reports for this sub-project
  const filteredReports = mockSavedReports.filter(
    (report) => report.subProjectId === subProjectId
  );

  // Filter KPIs for this sub-project
  const filteredKPIs = mockKPIs.filter(
    (kpi) => kpi.subProjectId === subProjectId
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3>Reports & Exports</h3>
          <p className="text-muted-foreground">
            Generate and view reports for this sub-project
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-[#E0F2FE] items-center ">
          <TabsTrigger
            value="saved-reports"
            className="data-[state=active]:bg-[#0073e6]  data-[state=active]:text-white"
          >
            Saved Reports
          </TabsTrigger>
          <TabsTrigger
            value="generate-report"
            className="data-[state=active]:bg-[#0073e6]  data-[state=active]:text-white"
          >
            Generate New Report
          </TabsTrigger>
          <TabsTrigger
            value="kpi-tracking"
            className="data-[state=active]:bg-[#0073e6]  data-[state=active]:text-white"
          >
            KPI Tracking
          </TabsTrigger>
          <TabsTrigger
            value="templates"
            className="data-[state=active]:bg-[#0073e6]  data-[state=active]:text-white"
          >
            Report Templates
          </TabsTrigger>
        </TabsList>

        <TabsContent value="saved-reports" className="pt-4">
          <Table className="rounded-md overflow-hidden">
            <TableHeader className="bg-[#E5ECF6]">
              <TableRow>
                <TableHead className="w-[300px]">Report</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Created By</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Format</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell className="font-medium">{report.title}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {report.type.charAt(0).toUpperCase() +
                        report.type.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>{report.periodCovered}</TableCell>
                  <TableCell>{report.createdBy}</TableCell>
                  <TableCell>
                    {new Date(report.createdDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="uppercase">{report.format}</TableCell>
                  <TableCell>
                    {report.status === "completed" ? (
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400">
                        <Check className="h-3 w-3 mr-1" />
                        Completed
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        <Clock className="h-3 w-3 mr-1" />
                        Scheduled
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {report.status === "completed" && (
                        <>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </>
                      )}
                      {report.status === "scheduled" && (
                        <Button variant="outline" size="sm">
                          View Schedule
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>

        <TabsContent value="generate-report" className="pt-4">
          <Card className="bg-[#F7F9FB] border-0">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-base">Generate New Report</CardTitle>
                <Button
                  className="bg-[#2E343E] text-white border-0"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowTemplates(!showTemplates)}
                >
                  {showTemplates ? "Custom Report" : "Use Template"}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {showTemplates ? (
                <div className="space-y-4">
                  <Label>Select a Report Template</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {mockReportTemplates.map((template) => (
                      <Card
                        key={template.id}
                        className={`cursor-pointer hover:border-primary transition-colors bg-[#E5ECF6] border-0 ${
                          selectedTemplate === template.id
                            ? "border-primary"
                            : ""
                        }`}
                        onClick={() => setSelectedTemplate(template.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h4>{template.title}</h4>
                            <Badge
                              variant="outline"
                              className="bg-[#2E343E] border-0 text-white"
                            >
                              {template.type}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {template.description}
                          </p>
                          <div className="text-xs text-muted-foreground">
                            Last used:{" "}
                            {new Date(template.lastUsed).toLocaleDateString()}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <div className="space-y-2 pt-4 border-t">
                    <div className="space-y-2">
                      <Label htmlFor="report-period">Time Period</Label>
                      <Select
                        value={selectedPeriod}
                        onValueChange={setSelectedPeriod}
                      >
                        <SelectTrigger className="bg-black/5 text-black border-0">
                          <SelectValue placeholder="Select time period" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="last-month">Last Month</SelectItem>
                          <SelectItem value="last-quarter">
                            Last Quarter
                          </SelectItem>
                          <SelectItem value="year-to-date">
                            Year to Date
                          </SelectItem>
                          <SelectItem value="custom">Custom Range</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {selectedPeriod === "custom" && (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="start-date">Start Date</Label>
                          <Input id="start-date" type="date" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="end-date">End Date</Label>
                          <Input id="end-date" type="date" />
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="report-format">Output Format</Label>
                      <Select
                        value={selectedFormat}
                        onValueChange={setSelectedFormat}
                      >
                        <SelectTrigger className="bg-black/5 text-black border-0">
                          <SelectValue placeholder="Select format" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pdf">PDF Document</SelectItem>
                          <SelectItem value="excel">
                            Excel Spreadsheet
                          </SelectItem>
                          <SelectItem value="word">Word Document</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* <div className="flex justify-end gap-3 pt-4">
                    <Button variant="outline" size="lg">
                      <Eye className="h-4 w-4 mr-2" />
                      Preview Report
                    </Button>
                    <Button size="lg">
                      <FileText className="h-4 w-4 mr-2" />
                      Generate Report
                    </Button>
                  </div> */}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="report-title">Report Title</Label>
                      <Input
                        className="bg-black/5 border-0"
                        id="report-title"
                        placeholder="Enter a title for this report"
                        defaultValue={`${
                          selectedReportType.charAt(0).toUpperCase() +
                          selectedReportType.slice(1)
                        } Report - ${
                          selectedPeriod === "last-month"
                            ? "May 2025"
                            : selectedPeriod === "last-quarter"
                            ? "Q1 2025"
                            : selectedPeriod === "year-to-date"
                            ? "Jan-May 2025"
                            : "Custom Period"
                        }`}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="report-type">Report Type</Label>
                      <Select
                        value={selectedReportType}
                        onValueChange={setSelectedReportType}
                      >
                        <SelectTrigger className="bg-black/5 border-0   ">
                          <SelectValue
                            placeholder="Select report type"
                            className=""
                          />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="activity">
                            Activity Report
                          </SelectItem>
                          <SelectItem value="beneficiary">
                            Beneficiary Report
                          </SelectItem>
                          <SelectItem value="service">
                            Service Delivery Report
                          </SelectItem>
                          <SelectItem value="financial">
                            Financial Report
                          </SelectItem>
                          <SelectItem value="progress">
                            Progress Report
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="report-period">Time Period</Label>
                      <Select
                        value={selectedPeriod}
                        onValueChange={setSelectedPeriod}
                      >
                        <SelectTrigger className="bg-black/5 border-0">
                          <SelectValue placeholder="Select time period" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="last-month">Last Month</SelectItem>
                          <SelectItem value="last-quarter">
                            Last Quarter
                          </SelectItem>
                          <SelectItem value="year-to-date">
                            Year to Date
                          </SelectItem>
                          <SelectItem value="custom">Custom Range</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {selectedPeriod === "custom" && (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="start-date">Start Date</Label>
                          <Input id="start-date" type="date" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="end-date">End Date</Label>
                          <Input id="end-date" type="date" />
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="report-format">Output Format</Label>
                      <Select
                        value={selectedFormat}
                        onValueChange={setSelectedFormat}
                      >
                        <SelectTrigger className="bg-black/5 border-0">
                          <SelectValue placeholder="Select format" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pdf">PDF Document</SelectItem>
                          <SelectItem value="excel">
                            Excel Spreadsheet
                          </SelectItem>
                          <SelectItem value="word">Word Document</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label className="block mb-2">Report Contents</Label>
                    <div className="space-y-3  rounded-md p-4 bg-[#E5ECF6]">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="include-summary"
                          className="bg-black/10"
                          defaultChecked
                        />
                        <label htmlFor="include-summary">
                          Executive Summary
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="include-activities"
                          className="bg-black/10"
                          defaultChecked
                        />
                        <label htmlFor="include-activities">
                          Activities Log
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="include-beneficiaries"
                          className="bg-black/10"
                          defaultChecked
                        />
                        <label htmlFor="include-beneficiaries">
                          Beneficiary Data
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="include-kpis"
                          className="bg-black/10"
                          defaultChecked
                        />
                        <label htmlFor="include-kpis">KPI Progress</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="include-charts"
                          className="bg-black/10"
                          defaultChecked
                        />
                        <label htmlFor="include-charts">
                          Charts and Visualizations
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="include-recommendations"
                          className="bg-black/10"
                        />
                        <label htmlFor="include-recommendations">
                          Recommendations
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  size="lg"
                  className="bg-[#2E343E] text-white"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Preview Report
                </Button>
                <Button size="lg" className="bg-[#2E343E] text-white">
                  {selectedFormat === "pdf" ? (
                    <FileText className="h-4 w-4 mr-2" />
                  ) : selectedFormat === "excel" ? (
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                  ) : (
                    <FileText className="h-4 w-4 mr-2" />
                  )}
                  Generate Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="kpi-tracking" className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredKPIs.map((kpi) => (
              <Card key={kpi.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-base">{kpi.title}</CardTitle>
                    <Badge variant="outline">{kpi.category}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span>
                        {Math.round((kpi.current / kpi.target) * 100)}%
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#2E343E]"
                        style={{
                          width: `${(kpi.current / kpi.target) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <div>
                      <div className="text-muted-foreground text-sm">
                        Current
                      </div>
                      <div className="text-2xl font-medium">
                        {kpi.current.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {kpi.unit}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-muted-foreground text-sm">
                        Target
                      </div>
                      <div className="text-2xl font-medium">
                        {kpi.target.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {kpi.unit}
                      </div>
                    </div>
                  </div>

                  <div className="text-sm text-muted-foreground">
                    Period: {kpi.period}
                  </div>

                  <div className="flex justify-end">
                    <Button variant="outline" size="sm">
                      View Trend
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            <Card className="border-dashed  bg-[#F7F9FB] flex flex-col items-center justify-center p-6">
              <div className="rounded-full border-dashed border-2 p-3 mb-3">
                <Plus className="h-6 w-6 text-muted-foreground" />
              </div>
              <h4 className="mb-1">Add New KPI</h4>
              <p className="text-sm text-muted-foreground text-center mb-3">
                Define a new key performance indicator to track
              </p>
              <Button className="bg-black/10">Create KPI</Button>
            </Card>
          </div>

          <div className="flex  justify-end gap-4 mt-6">
            <Button
              variant="outline"
              size="sm"
              className="bg-[#2E343E] text-white"
            >
              <Eye className="h-4 w-4 mr-2" />
              View All KPIs
            </Button>
            <div className="space-x-2">
              <Button
                variant="outline"
                size="sm"
                className="bg-[#2E343E] text-white"
              >
                <Printer className="h-4 w-4 mr-2" />
                Print KPI Dashboard
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="bg-[#2E343E] text-white"
              >
                <Download className="h-4 w-4 mr-2" />
                Export KPI Data
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="templates" className="pt-4">
          <div className="flex justify-between mb-6">
            <div>
              <h3>Report Templates</h3>
              <p className="text-muted-foreground">
                Create, edit and use report templates for consistent reporting
              </p>
            </div>
            <Button className="bg-[#2E343E] text-white">
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockReportTemplates.map((template) => (
              <Card key={template.id} className="bg-[#E5ECF6]">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-base">
                      {template.title}
                    </CardTitle>
                    <Badge
                      variant="outline"
                      className="bg-[#2E343E] text-white"
                    >
                      {template.type}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {template.description}
                  </p>

                  <div className="text-sm text-muted-foreground">
                    Last used:{" "}
                    {new Date(template.lastUsed).toLocaleDateString()}
                  </div>

                  <div className="flex justify-end gap-4 ">
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-black/10 text-black"
                    >
                      <FileEdit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button size="sm" className="bg-[#2E343E] text-white">
                      Use Template
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            <Card className="border-dashed bg-[#F7F9FB] flex flex-col items-center justify-center p-6">
              <div className="rounded-full border-dashed border-2 p-3 mb-3">
                <Plus className="h-6 w-6 text-muted-foreground" />
              </div>
              <h4 className="mb-1">Create New Template</h4>
              <p className="text-sm text-muted-foreground text-center mb-3">
                Design a custom report template for future use
              </p>
              <Button className="bg-black/10 text-black">
                Create Template
              </Button>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
