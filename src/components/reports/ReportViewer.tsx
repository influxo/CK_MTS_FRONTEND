import {
  ArrowLeft,
  Download,
  FileDown,
  FileSpreadsheet,
  FileText,
  Mail,
  PieChart,
  Printer,
  Repeat,
  Share,
  UserCircle,
  Calendar,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/overlay/dialog";
import { Input } from "../ui/form/input";
import { Label } from "../ui/form/label";
import { ScrollArea } from "../ui/layout/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/form/select";
import { Switch } from "../ui/form/switch";
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
import {
  PieChart as RePieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

// Mock data for a saved report
const mockReportData = {
  id: "report-001",
  name: "Monthly Beneficiary Summary - May 2025",
  type: "beneficiary",
  level: "project",
  scope: "Rural Healthcare Initiative",
  createdBy: "Jane Smith",
  createdDate: "2025-05-20T14:30:00",
  lastViewed: "2025-05-22T10:45:00",
  dateRange: {
    startDate: "2025-05-01T00:00:00",
    endDate: "2025-05-31T23:59:59",
  },
  scheduled: false,
  charts: ["pie", "bar"],
  status: "completed",
  chartData: {
    pie: {
      title: "Beneficiary Demographics",
      labels: ["Female", "Male", "Other"],
      data: [65, 30, 5],
      colors: ["#4f46e5", "#06b6d4", "#8b5cf6"],
    },
    bar: {
      title: "Beneficiaries by Location",
      labels: [
        "Northern District",
        "Eastern Region",
        "Southern Province",
        "Western District",
        "Central Region",
      ],
      data: [42, 28, 35, 18, 22],
      colors: ["#4f46e5"],
    },
  },
  tableData: {
    headers: [
      "Name",
      "ID",
      "Gender",
      "Age",
      "Location",
      "Registration Date",
      "Status",
      "Services",
    ],
    rows: [
      [
        "Maria Johnson",
        "BEN78945",
        "Female",
        "27",
        "Northern District",
        "2025-01-15",
        "Active",
        "4",
      ],
      [
        "James Wilson",
        "BEN45672",
        "Male",
        "32",
        "Eastern Region",
        "2025-01-18",
        "Active",
        "3",
      ],
      [
        "Sarah Williams",
        "BEN35689",
        "Female",
        "24",
        "Southern Province",
        "2025-02-03",
        "Active",
        "5",
      ],
      [
        "Thomas Brown",
        "BEN25478",
        "Male",
        "45",
        "Western District",
        "2025-02-10",
        "Inactive",
        "2",
      ],
      [
        "Emily Martinez",
        "BEN58963",
        "Female",
        "29",
        "Central Region",
        "2025-02-15",
        "Active",
        "6",
      ],
      [
        "Michael Thompson",
        "BEN12547",
        "Male",
        "37",
        "Northern District",
        "2025-02-18",
        "Active",
        "4",
      ],
      [
        "Jennifer Lee",
        "BEN75395",
        "Female",
        "31",
        "Eastern Region",
        "2025-02-22",
        "Active",
        "7",
      ],
      [
        "Robert Davis",
        "BEN95123",
        "Male",
        "52",
        "Southern Province",
        "2025-03-01",
        "Inactive",
        "3",
      ],
    ],
  },
  summary: {
    totalBeneficiaries: 145,
    activeBeneficiaries: 128,
    inactiveBeneficiaries: 17,
    femalePercentage: 65,
    malePercentage: 30,
    otherPercentage: 5,
    averageAge: 34,
    totalServices: 532,
  },
};

interface ReportViewerProps {
  reportId: string;
  onBack: () => void;
}

export function ReportViewer({ reportId, onBack }: ReportViewerProps) {
  // For a real app, we would fetch the report data based on reportId
  // For this demo, we're using mock data
  const report = mockReportData;
  console.log("reportId me i ik unused declaration", reportId);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [emailRecipients, setEmailRecipients] = useState("");
  const [includeAttachments, setIncludeAttachments] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  // Pie chart data for Female/Male/Other using configured colors
  const pieData = report.chartData.pie.labels.map((name, index) => ({
    name,
    value: report.chartData.pie.data[index],
    color: report.chartData.pie.colors[index],
  }));

  // Bar chart data for Locations/Regions
  const barData = report.chartData.bar.labels.map((name, index) => ({
    name,
    value: report.chartData.bar.data[index],
    color:
      report.chartData.bar.colors[index % report.chartData.bar.colors.length],
  }));

  // Pagination for Data tab table
  const totalRows = report.tableData.rows.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));
  const startIndex = (page - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalRows);
  const visibleRows = report.tableData.rows.slice(startIndex, endIndex);

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Handle email sending
  const handleSendEmail = () => {
    console.log("Sending email to:", emailRecipients);
    console.log("Include attachments:", includeAttachments);
    setIsShareDialogOpen(false);
  };

  // Handle scheduling
  const handleSchedule = () => {
    console.log("Setting up schedule for report");
    setIsScheduleDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col items-start gap-1 min-w-0">
          <Button
            variant="outline"
            size="sm"
            onClick={onBack}
            className="shrink-0 whitespace-nowrap bg-[#E0F2FE] border-0"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Reports
          </Button>
          <h2 className="truncate">{report.name}</h2>
        </div>
        <div className="flex flex-wrap gap-2 md:justify-end">
          <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="bg-[#E0F2FE] border-0 whitespace-nowrap"
              >
                <Share className="h-4 w-4 mr-2" />
                Share
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Share Report</DialogTitle>
                <DialogDescription>
                  Email this report to team members or stakeholders.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="recipients">Recipients</Label>
                  <Input
                    id="recipients"
                    placeholder="email@example.com, email2@example.com"
                    value={emailRecipients}
                    onChange={(e) => setEmailRecipients(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Separate multiple email addresses with commas
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="include-attachments"
                    checked={includeAttachments}
                    onCheckedChange={setIncludeAttachments}
                  />
                  <Label htmlFor="include-attachments">
                    Include Excel/PDF attachments
                  </Label>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsShareDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleSendEmail}>
                  <Mail className="h-4 w-4 mr-2" />
                  Send Email
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog
            open={isScheduleDialogOpen}
            onOpenChange={setIsScheduleDialogOpen}
          >
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="bg-[#E0F2FE] border-0 whitespace-nowrap"
              >
                <Repeat className="h-4 w-4 mr-2" />
                Schedule
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Schedule Report</DialogTitle>
                <DialogDescription>
                  Set up automatic generation and delivery of this report.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="frequency">Frequency</Label>
                  <Select defaultValue="weekly">
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="day">Day of the Week</Label>
                  <Select defaultValue="monday">
                    <SelectTrigger>
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
                <div className="grid gap-2">
                  <Label htmlFor="recipients">Recipients</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Recipients"
                      defaultValue="admin@example.com, managers@example.com"
                    />
                    <Button variant="outline" size="icon">
                      <UserCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsScheduleDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleSchedule}>Save Schedule</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button className="bg-[#0073e6] text-white border-0 whitespace-nowrap">
            <FileDown className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <Card className="mb-6 bg-[#F7F9FB] drop-shadow-sm shadow-gray-50 border-0">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row justify-between gap-6">
            <div className="space-y-2">
              <div className="flex gap-2 items-center">
                <h3>{report.name}</h3>
                <Badge
                  variant="outline"
                  className="capitalize bg-[#0073e6] text-white border-0"
                >
                  {report.type}
                </Badge>
              </div>
              <div className="flex gap-1.5 items-center text-muted-foreground">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">
                  {formatDate(report.dateRange.startDate)} -{" "}
                  {formatDate(report.dateRange.endDate)}
                </span>
              </div>
              <div className="flex gap-1.5 items-center text-muted-foreground">
                <UserCircle className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium capitalize">
                  {report.level}: {report.scope}
                </span>
              </div>
            </div>

            <div className="flex flex-col text-sm space-y-1 md:text-right">
              <div>
                <span className="text-muted-foreground">Created By:</span>
                <span className="ml-2">{report.createdBy}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Date Created:</span>
                <span className="ml-2">{formatDate(report.createdDate)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Last Viewed:</span>
                <span className="ml-2">
                  {report.lastViewed ? formatDate(report.lastViewed) : "Never"}
                </span>
              </div>
              <div className="pt-2">
                <Badge
                  className="border-0"
                  variant={report.scheduled ? "default" : "outline"}
                >
                  {report.scheduled ? "Scheduled" : "One-time Report"}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full bg-[#E3F5FF]  pt-3 drop-shadow-sm shadow-gray-50   mt-4 h-auto">
          <div className="flex flex-wrap gap-4">
            <TabsTrigger
              value="dashboard"
              className={`rounded-none bg-transparent border-0 border-b-2 pb-3 hover:bg-transparent text-black ${
                activeTab === "dashboard"
                  ? "border-black"
                  : "border-transparent"
              }`}
            >
              Dashboard
            </TabsTrigger>
            <TabsTrigger
              value="data"
              className={`rounded-none bg-transparent border-0 border-b-2 pb-3 hover:bg-transparent text-black ${
                activeTab === "data" ? "border-black" : "border-transparent"
              }`}
            >
              Data
            </TabsTrigger>
            <TabsTrigger
              value="exports"
              className={`rounded-none bg-transparent border-0 border-b-2 pb-3 hover:bg-transparent text-black ${
                activeTab === "exports" ? "border-black" : "border-transparent"
              }`}
            >
              Export Options
            </TabsTrigger>
          </div>
        </TabsList>

        <TabsContent value="dashboard">
          <div className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <Card className="bg-[#E5ECF6] drop-shadow-sm shadow-gray-50 border-0">
                <CardContent className="p-6">
                  <div className="text-sm text-muted-foreground">
                    Total Beneficiaries
                  </div>
                  <div className="text-3xl font-medium mt-1">
                    {report.summary.totalBeneficiaries}
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-[#E5ECF6] drop-shadow-sm shadow-gray-50 border-0">
                <CardContent className="p-6">
                  <div className="text-sm text-muted-foreground">
                    Active Beneficiaries
                  </div>
                  <div className="text-3xl font-medium mt-1">
                    {report.summary.activeBeneficiaries}
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-[#E5ECF6] drop-shadow-sm shadow-gray-50 border-0">
                <CardContent className="p-6">
                  <div className="text-sm text-muted-foreground">
                    Average Age
                  </div>
                  <div className="text-3xl font-medium mt-1">
                    {report.summary.averageAge}
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-[#E5ECF6] drop-shadow-sm shadow-gray-50 border-0">
                <CardContent className="p-6">
                  <div className="text-sm text-muted-foreground">
                    Total Services
                  </div>
                  <div className="text-3xl font-medium mt-1">
                    {report.summary.totalServices}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {report.charts.includes("pie") && (
                <Card className="bg-[#F7F9FB] drop-shadow-sm shadow-gray-50 border-0">
                  <CardHeader>
                    <CardTitle className="text-base">
                      {report.chartData.pie.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 h-[300px] flex items-center justify-center">
                    <div className="relative h-full w-full flex items-center justify-center">
                      <ResponsiveContainer width="100%" height={250}>
                        <RePieChart>
                          <Pie
                            data={pieData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            label={({ name, value }) => `${name} ${value}%`}
                          >
                            {pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value: number) => `${value}%`} />
                        </RePieChart>
                      </ResponsiveContainer>
                      <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-4">
                        {report.chartData.pie.labels.map((label, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-1.5"
                          >
                            <div
                              className="h-3 w-3 rounded-full"
                              style={{
                                backgroundColor:
                                  report.chartData.pie.colors[index],
                              }}
                            ></div>
                            <span className="text-sm">
                              {label}: {report.chartData.pie.data[index]}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {report.charts.includes("bar") && (
                <Card className="bg-[#F7F9FB] drop-shadow-sm shadow-gray-50 border-0">
                  <CardHeader>
                    <CardTitle className="text-base">
                      {report.chartData.bar.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 h-[300px]">
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={barData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="name"
                          tick={{ fontSize: 12 }}
                          interval={0}
                        />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value">
                          {barData.map((entry, index) => (
                            <Cell
                              key={`bar-cell-${index}`}
                              fill={entry.color}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}
            </div>

            <Card className="bg-[#F7F9FB] drop-shadow-sm shadow-gray-50 border-0">
              <CardHeader>
                <CardTitle className="text-base">Data Summary</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-2">Demographic Breakdown</h4>
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Female</span>
                          <span>{report.summary.femalePercentage}%</span>
                        </div>
                        <div className="h-2 bg-[#E5ECF6] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#E3F5FF]"
                            style={{
                              width: `${report.summary.femalePercentage}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Male</span>
                          <span>{report.summary.malePercentage}%</span>
                        </div>
                        <div className="h-2 bg-[#E5ECF6] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#E3F5FF]"
                            style={{
                              width: `${report.summary.malePercentage}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Other</span>
                          <span>{report.summary.otherPercentage}%</span>
                        </div>
                        <div className="h-2 bg-[#E5ECF6] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#E3F5FF]"
                            style={{
                              width: `${report.summary.otherPercentage}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Status Breakdown</h4>
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Active</span>
                          <span>
                            {(
                              (report.summary.activeBeneficiaries /
                                report.summary.totalBeneficiaries) *
                              100
                            ).toFixed(1)}
                            %
                          </span>
                        </div>
                        <div className="h-2 bg-[#E5ECF6] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#E3F5FF]"
                            style={{
                              width: `${
                                (report.summary.activeBeneficiaries /
                                  report.summary.totalBeneficiaries) *
                                100
                              }%`,
                            }}
                          ></div>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            Inactive
                          </span>
                          <span>
                            {(
                              (report.summary.inactiveBeneficiaries /
                                report.summary.totalBeneficiaries) *
                              100
                            ).toFixed(1)}
                            %
                          </span>
                        </div>
                        <div className="h-2 bg-[#E5ECF6] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#E3F5FF]"
                            style={{
                              width: `${
                                (report.summary.inactiveBeneficiaries /
                                  report.summary.totalBeneficiaries) *
                                100
                              }%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="data">
          <div className="pt-6">
            <Card className="drop-shadow-sm shadow-gray-50 bg-[#F7F9FB] border-0">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-base">Report Data</CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-[#0073e6] text-white border-0"
                    >
                      <FileSpreadsheet className="h-4 w-4 mr-2" />
                      Export Excel
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="w-full overflow-x-auto">
                  <div className="rounded-md border overflow-hidden min-w-[900px]">
                    <ScrollArea className="max-h-[400px] md:max-h-[500px] rounded-md">
                      <Table className="min-w-[900px]">
                        <TableHeader className="bg-[#E5ECF6]">
                          <TableRow>
                            {report.tableData.headers.map((header, index) => (
                              <TableHead key={index}>{header}</TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody className="bg-[#F7F9FB]">
                          {visibleRows.map((row, rowIndex) => (
                            <TableRow key={rowIndex}>
                              {row.map((cell, cellIndex) => (
                                <TableCell key={cellIndex}>
                                  {cellIndex === 0 ? (
                                    <span className="font-medium">{cell}</span>
                                  ) : cellIndex === 6 ? (
                                    <Badge
                                      className={
                                        cell === "Active"
                                          ? "text-[#4AA785] bg-[#DEF8EE] border-0"
                                          : cell === "Pending"
                                          ? "text-[#59A8D4] bg-[#E2F5FF] border-0"
                                          : "text-[rgba(28,28,28,0.4)] bg-[rgba(28,28,28,0.05)] border-0"
                                      }
                                    >
                                      {cell}
                                    </Badge>
                                  ) : (
                                    cell
                                  )}
                                </TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                  </div>
                </div>
                <div className="p-4 border-t flex items-center justify-between gap-3">
                  <div className="text-sm text-muted-foreground">
                    Showing {startIndex + 1}-{endIndex} of {totalRows} rows
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-[#E0F2FE] border-0"
                      disabled={page === 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                      Previous
                    </Button>
                    <div className="text-sm text-muted-foreground whitespace-nowrap">
                      Page {page} of {totalPages}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-[#E0F2FE] border-0"
                      disabled={page === totalPages}
                      onClick={() =>
                        setPage((p) => Math.min(totalPages, p + 1))
                      }
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="exports">
          <div className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="overflow-hidden drop-shadow-sm shadow-gray-50 bg-[#F7F9FB] border-0">
                <CardHeader>
                  <CardTitle className="text-base">PDF Export</CardTitle>
                </CardHeader>
                <CardContent className="pb-0">
                  <div className="space-y-4">
                    <p className="text-muted-foreground">
                      Export the report as a formatted PDF document with charts
                      and data tables.
                    </p>
                    <div className="bg-[#E5ECF6] rounded-md bg-muted/30 p-4">
                      <div className="text-sm">
                        <div className="font-medium">Export Options:</div>
                        <ul className="list-disc pl-5 mt-2 space-y-1 text-muted-foreground">
                          <li>Cover page with report metadata</li>
                          <li>Executive summary</li>
                          <li>Charts and visualizations</li>
                          <li>Tabular data</li>
                          <li>Appendices</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <div className="px-6 py-4 bg-muted/50 mt-4 flex justify-center">
                  <Button className="bg-[#2E343E] text-white w-full border-0">
                    <FileText className="h-4 w-4 mr-2" />
                    Export PDF
                  </Button>
                </div>
              </Card>

              <Card className="overflow-hidden drop-shadow-sm shadow-gray-50 bg-[#F7F9FB] border-0">
                <CardHeader>
                  <CardTitle className="text-base">Excel Export</CardTitle>
                </CardHeader>
                <CardContent className="pb-0">
                  <div className="space-y-4">
                    <p className="text-muted-foreground">
                      Export the report data as an Excel spreadsheet for further
                      analysis and manipulation.
                    </p>
                    <div className="bg-[#E5ECF6] rounded-md bg-muted/30 p-4">
                      <div className="text-sm">
                        <div className="font-medium">Export Options:</div>
                        <ul className="list-disc pl-5 mt-2 space-y-1 text-muted-foreground">
                          <li>Full dataset in structured format</li>
                          <li>Multiple worksheets by category</li>
                          <li>Chart data included</li>
                          <li>Filtering and sorting enabled</li>
                          <li>Pivot tables setup</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <div className="px-6 py-4 bg-muted/50 mt-4 flex justify-center">
                  <Button className="bg-[#2E343E] w-full text-white border-0">
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    Export Excel
                  </Button>
                </div>
              </Card>

              <Card className="overflow-hidden drop-shadow-sm shadow-gray-50 bg-[#F7F9FB] border-0">
                <CardHeader>
                  <CardTitle className="text-base">Email Report</CardTitle>
                </CardHeader>
                <CardContent className="pb-0">
                  <div className="space-y-4">
                    <p className="text-muted-foreground">
                      Email the report to team members, stakeholders, or
                      yourself with attachments.
                    </p>
                    <div className="bg-[#E5ECF6] rounded-md bg-muted/30 p-4">
                      <div className="text-sm">
                        <div className="font-medium">Email Options:</div>
                        <ul className="list-disc pl-5 mt-2 space-y-1 text-muted-foreground">
                          <li>Send to multiple recipients</li>
                          <li>Include PDF attachment</li>
                          <li>Include Excel attachment</li>
                          <li>Preview in email body</li>
                          <li>Add custom message</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <div className="px-6 py-4 bg-muted/50 mt-4 flex justify-center">
                  <Button
                    onClick={() => setIsShareDialogOpen(true)}
                    className="bg-[#2E343E] w-full text-white border-0"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Email Report
                  </Button>
                </div>
              </Card>

              <Card className="overflow-hidden drop-shadow-sm shadow-gray-50 bg-[#F7F9FB] border-0">
                <CardHeader>
                  <CardTitle className="text-base">Print Report</CardTitle>
                </CardHeader>
                <CardContent className="pb-0">
                  <div className="space-y-4">
                    <p className="text-muted-foreground">
                      Print the report directly to your printer with custom
                      formatting.
                    </p>
                    <div className="bg-[#E5ECF6] rounded-md bg-muted/30 p-4">
                      <div className="text-sm">
                        <div className="font-medium">Print Options:</div>
                        <ul className="list-disc pl-5 mt-2 space-y-1 text-muted-foreground">
                          <li>Print all pages</li>
                          <li>Print selected sections</li>
                          <li>Print charts only</li>
                          <li>Print data tables only</li>
                          <li>Custom page setup</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <div className="px-6 py-4 bg-muted/50 mt-4 flex justify-center">
                  <Button className="bg-[#2E343E] w-full text-white border-0">
                    <Printer className="h-4 w-4 mr-2" />
                    Print Report
                  </Button>
                </div>
              </Card>

              <Card className="overflow-hidden drop-shadow-sm shadow-gray-50 bg-[#F7F9FB] border-0">
                <CardHeader>
                  <CardTitle className="text-base">
                    Schedule Regular Exports
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-0">
                  <div className="space-y-4">
                    <p className="text-muted-foreground">
                      Set up automated delivery of this report on a regular
                      schedule.
                    </p>
                    <div className="bg-[#E5ECF6] rounded-md bg-muted/30 p-4">
                      <div className="text-sm">
                        <div className="font-medium">Schedule Options:</div>
                        <ul className="list-disc pl-5 mt-2 space-y-1 text-muted-foreground">
                          <li>Daily, weekly, or monthly</li>
                          <li>Select delivery day and time</li>
                          <li>Choose recipients</li>
                          <li>Select export formats</li>
                          <li>Custom message template</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <div className="px-6 py-4 bg-muted/50 mt-4 flex justify-center">
                  <Button
                    onClick={() => setIsScheduleDialogOpen(true)}
                    className="bg-[#2E343E] w-full text-white border-0"
                  >
                    <Repeat className="h-4 w-4 mr-2" />
                    Set Schedule
                  </Button>
                </div>
              </Card>

              <Card className="overflow-hidden drop-shadow-sm shadow-gray-50 bg-[#F7F9FB] border-0">
                <CardHeader>
                  <CardTitle className="text-base">Raw Data Export</CardTitle>
                </CardHeader>
                <CardContent className="pb-0">
                  <div className="space-y-4">
                    <p className="text-muted-foreground">
                      Export the raw data in various formats for integration
                      with other systems.
                    </p>
                    <div className="bg-[#E5ECF6] rounded-md bg-muted/30 p-4">
                      <div className="text-sm">
                        <div className="font-medium">Format Options:</div>
                        <ul className="list-disc pl-5 mt-2 space-y-1 text-muted-foreground">
                          <li>CSV (Comma Separated Values)</li>
                          <li>JSON (JavaScript Object Notation)</li>
                          <li>XML (Extensible Markup Language)</li>
                          <li>API endpoint access</li>
                          <li>Database direct export</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <div className="px-6 py-4 bg-muted/50 mt-4 flex justify-center">
                  <Button className="bg-[#2E343E] w-full text-white border-0">
                    <Download className="h-4 w-4 mr-2" />
                    Export Raw Data
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
