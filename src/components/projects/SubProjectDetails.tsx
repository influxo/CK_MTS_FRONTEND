import {
  Calendar,
  CheckCircle,
  FileEdit,
  FileText,
  MapPin,
  User,
  Users,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Textarea } from "../ui/textarea";

import { SubProjectActivities } from "./SubProjectActivities";
import { SubProjectBeneficiaries } from "./SubProjectBeneficiaries";
import { SubProjectForms } from "./SubProjectForms";
import { SubProjectReports } from "./SubProjectReports";
import { SubProjectTeam } from "./SubProjectTeam";

interface SubProjectDetailsProps {
  projectId: string;
  subProjectId: string;
  onBack: () => void;
}

// Mock sub-project data
const mockSubProjects = [
  {
    id: "sub-001",
    projectId: "proj-001",
    title: "Maternal Health Services",
    category: "Healthcare",
    type: "Service Delivery",
    status: "active",
    progress: 72,
    startDate: "2025-01-20",
    endDate: "2025-06-30",
    beneficiaries: 345,
    lead: "Jane Smith",
    leadAvatar: "",
    leadInitials: "JS",
    description:
      "Providing maternal health services and education in rural communities. This sub-project focuses on prenatal care, safe deliveries, and postnatal follow-up for mothers and newborns in underserved areas. Services include regular checkups, health education, and emergency referrals when needed.",
    activities: 48,
    forms: 125,
    services: 320,
    lastSync: "2025-05-23T14:30:00",
    location: "Northern District",
    objectives: [
      "Provide prenatal care to at least 500 pregnant women",
      "Conduct 100 health education sessions on maternal nutrition",
      "Train 30 traditional birth attendants on safe delivery practices",
      "Reduce maternal complications by 30%",
    ],
    budget: 120000,
    fundingSource: "Global Health Fund",
    recentReports: [
      {
        id: "report-001",
        title: "Monthly Activity Report - April 2025",
        createdDate: "2025-05-05T10:30:00",
        type: "activity",
      },
      {
        id: "report-003",
        title: "Service Delivery Summary",
        createdDate: "2025-05-15T09:15:00",
        type: "service",
      },
    ],
  },
  {
    id: "sub-002",
    projectId: "proj-001",
    title: "Child Vaccination Campaign",
    category: "Healthcare",
    type: "Service Delivery",
    status: "active",
    progress: 85,
    startDate: "2025-02-01",
    endDate: "2025-05-31",
    beneficiaries: 520,
    lead: "Robert Johnson",
    leadAvatar: "",
    leadInitials: "RJ",
    description:
      "Immunization campaign for children under 5 years in rural areas.",
    activities: 62,
    forms: 204,
    services: 518,
    lastSync: "2025-05-24T09:15:00",
    location: "Eastern Region",
    objectives: [
      "Vaccinate 1,000 children under 5 years",
      "Establish 10 mobile vaccination clinics",
      "Train 20 community health workers on vaccination",
      "Achieve 90% immunization coverage in target areas",
    ],
    budget: 85000,
    fundingSource: "Global Health Fund",
    recentReports: [],
  },
];

export function SubProjectDetails({
  projectId,
  subProjectId,
  onBack,
}: SubProjectDetailsProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  console.log("projectId, veq sa me i ik unused declaration", projectId);
  console.log("onBack, veq sa me i ik unused declaration", onBack);
  // Find the current sub-project
  const subProject = mockSubProjects.find((sp) => sp.id === subProjectId);

  if (!subProject) {
    return <div>Sub-Project not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        {/* <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Project
        </Button> */}
        <h2>{subProject.title}</h2>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between">
            <div className="space-y-3 max-w-3xl">
              <div className="flex gap-2">
                <Badge variant="outline">{subProject.category}</Badge>
                <Badge variant="outline">{subProject.type}</Badge>
                <Badge
                  variant={
                    subProject.status === "active" ? "default" : "secondary"
                  }
                >
                  {subProject.status === "active" ? "Active" : "Inactive"}
                </Badge>
              </div>

              <p className="text-muted-foreground">{subProject.description}</p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                <div>
                  <div className="text-sm text-muted-foreground">Timeline</div>
                  <div className="flex items-center gap-1 mt-1">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {new Date(subProject.startDate).toLocaleDateString()} -{" "}
                      {new Date(subProject.endDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div>
                  <div className="text-sm text-muted-foreground">Lead</div>
                  <div className="flex items-center gap-1 mt-1">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{subProject.lead}</span>
                  </div>
                </div>

                <div>
                  <div className="text-sm text-muted-foreground">Location</div>
                  <div className="flex items-center gap-1 mt-1">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{subProject.location}</span>
                  </div>
                </div>

                <div>
                  <div className="text-sm text-muted-foreground">
                    Beneficiaries
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{subProject.beneficiaries} Beneficiaries</span>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Progress</span>
                  <span>{subProject.progress}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary"
                    style={{ width: `${subProject.progress}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div>
              <Dialog
                open={isEditDialogOpen}
                onOpenChange={setIsEditDialogOpen}
              >
                <DialogTrigger asChild>
                  {/* <Button variant="outline">
                    <FileEdit className="h-4 w-4 mr-2" />
                    Edit Sub-Project
                  </Button> */}
                </DialogTrigger>
                <DialogContent className="sm:max-w-[550px]">
                  <DialogHeader>
                    <DialogTitle>Edit Sub-Project</DialogTitle>
                    <DialogDescription>
                      Update the details for this sub-project. All fields marked
                      with * are required.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="title" className="text-right">
                        Title *
                      </Label>
                      <Input
                        id="title"
                        className="col-span-3"
                        defaultValue={subProject.title}
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="category" className="text-right">
                        Category *
                      </Label>
                      <Select defaultValue={subProject.category.toLowerCase()}>
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="healthcare">Healthcare</SelectItem>
                          <SelectItem value="education">Education</SelectItem>
                          <SelectItem value="infrastructure">
                            Infrastructure
                          </SelectItem>
                          <SelectItem value="training">Training</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="type" className="text-right">
                        Type *
                      </Label>
                      <Select
                        defaultValue={subProject.type
                          .toLowerCase()
                          .replace(" ", "-")}
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="service-delivery">
                            Service Delivery
                          </SelectItem>
                          <SelectItem value="training">Training</SelectItem>
                          <SelectItem value="construction">
                            Construction
                          </SelectItem>
                          <SelectItem value="distribution">
                            Distribution
                          </SelectItem>
                          <SelectItem value="research">Research</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="status" className="text-right">
                        Status
                      </Label>
                      <Select defaultValue={subProject.status}>
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="planning">Planning</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="location" className="text-right">
                        Location *
                      </Label>
                      <Input
                        id="location"
                        className="col-span-3"
                        defaultValue={subProject.location}
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="start-date" className="text-right">
                        Start Date *
                      </Label>
                      <Input
                        id="start-date"
                        type="date"
                        className="col-span-3"
                        defaultValue={subProject.startDate}
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="end-date" className="text-right">
                        End Date *
                      </Label>
                      <Input
                        id="end-date"
                        type="date"
                        className="col-span-3"
                        defaultValue={subProject.endDate}
                      />
                    </div>
                    <div className="grid grid-cols-4 items-start gap-4">
                      <Label htmlFor="description" className="text-right pt-2">
                        Description
                      </Label>
                      <Textarea
                        id="description"
                        className="col-span-3"
                        defaultValue={subProject.description}
                        rows={3}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    {/* <Button
                      variant="outline"
                      onClick={() => setIsEditDialogOpen(false)}
                    >
                      Cancel
                    </Button> */}
                    <Button onClick={() => setIsEditDialogOpen(false)}>
                      Save Changes
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full border-b bg-transparent p-0 h-auto">
          <div className="flex flex-wrap gap-4">
            <TabsTrigger
              value="overview"
              className={`rounded-none border-b-2 border-transparent pb-3 ${
                activeTab === "overview" ? "border-primary" : ""
              }`}
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="forms"
              className={`rounded-none border-b-2 border-transparent pb-3 ${
                activeTab === "forms" ? "border-primary" : ""
              }`}
            >
              Forms & Data
            </TabsTrigger>
            <TabsTrigger
              value="activities"
              className={`rounded-none border-b-2 border-transparent pb-3 ${
                activeTab === "activities" ? "border-primary" : ""
              }`}
            >
              Activities
            </TabsTrigger>
            <TabsTrigger
              value="beneficiaries"
              className={`rounded-none border-b-2 border-transparent pb-3 ${
                activeTab === "beneficiaries" ? "border-primary" : ""
              }`}
            >
              Beneficiaries
            </TabsTrigger>
            <TabsTrigger
              value="team"
              className={`rounded-none border-b-2 border-transparent pb-3 ${
                activeTab === "team" ? "border-primary" : ""
              }`}
            >
              Team
            </TabsTrigger>
            <TabsTrigger
              value="reports"
              className={`rounded-none border-b-2 border-transparent pb-3 ${
                activeTab === "reports" ? "border-primary" : ""
              }`}
            >
              Reports
            </TabsTrigger>
          </div>
        </TabsList>

        <TabsContent value="overview" className="pt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="mb-4">Key Metrics</h3>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="space-y-1">
                      <div className="text-muted-foreground text-sm">
                        Activities
                      </div>
                      <div className="text-2xl font-medium">
                        {subProject.activities}
                      </div>
                      <div className="text-muted-foreground text-sm">
                        Total activities
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="text-muted-foreground text-sm">
                        Beneficiaries
                      </div>
                      <div className="text-2xl font-medium">
                        {subProject.beneficiaries}
                      </div>
                      <div className="text-muted-foreground text-sm">
                        Registered individuals
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="text-muted-foreground text-sm">Forms</div>
                      <div className="text-2xl font-medium">
                        {subProject.forms}
                      </div>
                      <div className="text-muted-foreground text-sm">
                        Submissions collected
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="text-muted-foreground text-sm">
                        Services
                      </div>
                      <div className="text-2xl font-medium">
                        {subProject.services}
                      </div>
                      <div className="text-muted-foreground text-sm">
                        Services delivered
                      </div>
                    </div>
                  </div>

                  <div className="border-t mt-6 pt-6">
                    <h4 className="mb-3">Recent Updates</h4>

                    <div className="space-y-4">
                      <div className="flex gap-3">
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                          <CheckCircle className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                          <div className="font-medium">
                            Health Education Session Completed
                          </div>
                          <div className="text-sm text-muted-foreground">
                            28 participants attended the maternal nutrition
                            workshop
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Today at 10:30 AM
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                          <Users className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                          <div className="font-medium">
                            15 New Beneficiaries Registered
                          </div>
                          <div className="text-sm text-muted-foreground">
                            New pregnant women registered in the Eastern Village
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Yesterday at 2:15 PM
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                          <FileEdit className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                          <div className="font-medium">
                            Monthly Report Generated
                          </div>
                          <div className="text-sm text-muted-foreground">
                            April 2025 activity report has been generated
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            May 5, 2025
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end mt-4">
                      {/* <Button variant="outline" size="sm">
                        View All Updates
                      </Button> */}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="mb-3">Sub-Project Objectives</h3>
                  <ul className="space-y-2">
                    {subProject.objectives.map((objective, index) => (
                      <li key={index} className="flex items-baseline gap-2">
                        <CheckCircle className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{objective}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-4 pt-4 border-t">
                    <div className="mb-2">
                      <span className="text-sm text-muted-foreground">
                        Budget
                      </span>
                      <div className="text-xl font-medium">
                        ${subProject.budget.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">
                        Funding Source
                      </span>
                      <div>{subProject.fundingSource}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="mb-3">Last Synchronization</h3>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Last synced
                      </span>
                      <span className="text-sm">
                        {new Date(subProject.lastSync).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Sync status
                      </span>
                      <Badge
                        variant="outline"
                        className="flex items-center gap-1"
                      >
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        <span>Complete</span>
                      </Badge>
                    </div>
                  </div>

                  {/* <Button variant="outline" className="w-full" size="sm">
                    Sync Now
                  </Button> */}
                </CardContent>
              </Card>

              {subProject.recentReports.length > 0 && (
                <Card>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-center mb-3">
                      <h3>Recent Reports</h3>
                      {/* <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setActiveTab("reports")}
                      >
                        View All
                      </Button> */}
                    </div>

                    <div className="space-y-3">
                      {subProject.recentReports.map((report) => (
                        <div key={report.id} className="flex items-start gap-3">
                          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div>
                            <div className="font-medium">{report.title}</div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {report.type}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {new Date(
                                  report.createdDate
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    {/* 
                    <Button
                      variant="outline"
                      className="w-full mt-4"
                      size="sm"
                      onClick={() => setActiveTab("reports")}
                    >
                      Generate New Report
                    </Button> */}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="forms" className="pt-6">
          <SubProjectForms subProjectId={subProjectId} />
        </TabsContent>

        <TabsContent value="activities" className="pt-6">
          <SubProjectActivities subProjectId={subProjectId} />
        </TabsContent>

        <TabsContent value="beneficiaries" className="pt-6">
          <SubProjectBeneficiaries subProjectId={subProjectId} />
        </TabsContent>

        <TabsContent value="team" className="pt-6">
          <SubProjectTeam subProjectId={subProjectId} />
        </TabsContent>

        <TabsContent value="reports" className="pt-6">
          <SubProjectReports subProjectId={subProjectId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
