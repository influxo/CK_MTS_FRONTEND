import {
  Calendar,
  CheckCircle,
  FileEdit,
  FileText,
  MapPin,
  User,
  Users,
  ArrowLeft,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Badge } from "../ui/data-display/badge";
import { Button } from "../ui/button/button";
import { Card, CardContent } from "../ui/data-display/card";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/form/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../ui/navigation/tabs";
import { Textarea } from "../ui/form/textarea";

import { SubProjectActivities } from "./SubProjectActivities";
import { SubProjectBeneficiaries } from "./SubProjectBeneficiaries";
import { SubProjectForms } from "./SubProjectForms";
import { SubProjectReports } from "./SubProjectReports";
import { SubProjectTeam } from "./SubProjectTeam";
import { useParams, useNavigate } from "react-router-dom";
import type { AppDispatch, RootState } from "../../store";
import { useDispatch, useSelector } from "react-redux";
import {
  getSubProjectById,
  selectSelectedSubproject,
  selectSubprojectsError,
  selectSubprojectsLoading,
} from "../../store/slices/subProjectSlice";
import { Progress } from "../ui/feedback/progress";
import { toast } from "sonner";
// We don't need to import the SubProject type directly as it's already used in Redux selectors

// TODO: remove this mockSubProjectEnhancement, it's just for testing since we dont have that data yet
//  we fetch the subproject data from the API and enhance it with this data
interface SubProjectDetailsProps {
  onBack?: () => void;
}

// Mock enhancement data for subprojects to provide UI-specific properties that aren't in the API model
const mockSubProjectEnhancement = {
  title: "", // We'll map this from name
  type: "Service Delivery",
  progress: 45,
  beneficiaries: 350,
  startDate: "2025-02-01",
  endDate: "2025-06-30",
  leads: ["Project Coordinator"],
  objectives: ["Provide services to beneficiaries", "Document all activities"],
  activities: ["15"],
  services: ["345"],
  forms: ["12"],
  budget: 120000,
  fundingSource: "Project Funding",
  location: "Project Area",
  lastSync: new Date().toISOString(),
  recentReports: [
    {
      id: "rep-001",
      title: "Progress Report",
      type: "Monthly",
      createdDate: new Date().toISOString(),
    },
  ],
};

export function SubProjectDetails({ onBack }: SubProjectDetailsProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const params = useParams<{ projectId: string; subprojectId: string }>();
  const projectId = params.projectId;
  const subprojectId = params.subprojectId; // Note: URL param is 'subprojectId' (lowercase 'p')
  const navigate = useNavigate();

  const dispatch = useDispatch<AppDispatch>();

  const subProject = useSelector((state: RootState) =>
    selectSelectedSubproject(state)
  );
  const loading = useSelector((state: RootState) =>
    selectSubprojectsLoading(state)
  );
  const error = useSelector((state: RootState) =>
    selectSubprojectsError(state)
  );

  useEffect(() => {
    if (subprojectId) {
      dispatch(getSubProjectById({ id: subprojectId }));
    } else {
      toast.error("Subproject ID is missing");
      if (projectId) {
        navigate(`/projects/${projectId}`);
      } else {
        navigate("/projects");
      }
    }
  }, [subprojectId, projectId, dispatch, navigate]);

  const handleBackToProject = () => {
    if (onBack) {
      onBack();
    } else if (projectId) {
      navigate(`/projects/${projectId}`);
    } else {
      navigate("/projects");
    }
  };

  if (loading)
    return (
      <div className="p-8 flex justify-center">
        <div>Loading subproject details...</div>
      </div>
    );
  if (error) return <div className="p-8 text-red-500">Error: {error}</div>;
  if (!subProject) return <div className="p-8">No Subproject Found</div>;

  // Enhance the subproject data with UI properties
  const enhancedSubProject = {
    ...mockSubProjectEnhancement,
    id: subProject.id,
    title: subProject.name, // Map name to title
    description: subProject.description,
    category: subProject.category,
    status: subProject.status,
    projectId: subProject.projectId,
    createdAt: subProject.createdAt,
    updatedAt: subProject.updatedAt,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={handleBackToProject}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Project
        </Button>
        <h1 className="text-3xl font-semibold capitalize">
          {enhancedSubProject.title}
        </h1>
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="ml-auto bg-[#2B2B2B] text-white"
            >
              <FileEdit className="h-4 w-4 mr-2" />
              Edit Sub-Project
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Edit Sub-Project</DialogTitle>
              <DialogDescription>
                Update the details for this sub-project. All fields marked with
                * are required.
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
                  defaultValue={enhancedSubProject.title}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">
                  Category *
                </Label>
                <Select
                  defaultValue={enhancedSubProject.category.toLowerCase()}
                >
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
                  defaultValue={enhancedSubProject.type
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
                    <SelectItem value="construction">Construction</SelectItem>
                    <SelectItem value="distribution">Distribution</SelectItem>
                    <SelectItem value="research">Research</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">
                  Status
                </Label>
                <Select defaultValue={enhancedSubProject.status}>
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
                  defaultValue={enhancedSubProject.location}
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
                  defaultValue={enhancedSubProject.startDate}
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
                  defaultValue={enhancedSubProject.endDate}
                />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="description" className="text-right pt-2">
                  Description
                </Label>
                <Textarea
                  id="description"
                  className="col-span-3"
                  defaultValue={enhancedSubProject.description}
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

      <Card className="flex  bg-[#F7F9FB] border-0   drop-shadow-sm shadow-gray-50">
        <CardContent className="p-6 w-full">
          <div className="flex flex-col md:flex-row gap-6 w-full">
            <div className="flex-1 space-y-5">
              <div className="flex gap-2">
                <Badge variant="outline">{enhancedSubProject.category}</Badge>
                <Badge variant="outline">{enhancedSubProject.type}</Badge>
                <Badge
                  style={{ backgroundColor: "#2E343E", color: "white" }}
                  variant={
                    enhancedSubProject.status === "active"
                      ? "default"
                      : "secondary"
                  }
                >
                  {enhancedSubProject.status === "active"
                    ? "Active"
                    : "Inactive"}
                </Badge>
              </div>

              <p className="text-xl font-normal  capitalize">
                {enhancedSubProject.description}
              </p>
            </div>

            <div className="grid grid-cols-1 w-2/5 ">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-xl p-4 bg-[#E5ECF6]">
                  <div className="text-sm text-muted-foreground">Timeline</div>
                  <div className="flex items-center gap-1 mt-1">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {new Date(
                        enhancedSubProject.startDate
                      ).toLocaleDateString()}{" "}
                      -{" "}
                      {new Date(
                        enhancedSubProject.endDate
                      ).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="rounded-xl p-4 bg-[#E5ECF6]">
                  <div className="text-sm text-muted-foreground">Lead</div>
                  <div className="flex items-center gap-1 mt-1">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {enhancedSubProject.leads &&
                      enhancedSubProject.leads.length > 0
                        ? enhancedSubProject.leads[0]
                        : "No lead assigned"}
                    </span>
                  </div>
                </div>

                <div className="rounded-xl p-4 bg-[#E5ECF6]">
                  <div className="text-sm text-muted-foreground">Location</div>
                  <div className="flex items-center gap-1 mt-1">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{enhancedSubProject.location}</span>
                  </div>
                </div>

                <div className="rounded-xl p-4 bg-[#E5ECF6]">
                  <div className="text-sm text-muted-foreground">
                    Beneficiaries
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {enhancedSubProject.beneficiaries} Beneficiaries
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full bg-[#E3F5FF]  pt-3 drop-shadow-sm shadow-gray-50   mt-4 h-auto">
          <div className="flex gap-4">
            <TabsTrigger
              value="overview"
              className={`rounded-none bg-transparent border-0 border-b-2 pb-3 hover:bg-transparent text-black ${
                activeTab === "overview" ? "border-black" : "border-transparent"
              }`}
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="forms"
              className={`rounded-none bg-transparent border-0 border-b-2 pb-3 hover:bg-transparent text-black ${
                activeTab === "forms" ? "border-black" : "border-transparent"
              }`}
            >
              Forms & Data
            </TabsTrigger>
            <TabsTrigger
              value="activities"
              className={`rounded-none bg-transparent border-0 border-b-2 pb-3 hover:bg-transparent text-black ${
                activeTab === "activities"
                  ? "border-black"
                  : "border-transparent"
              }`}
            >
              Activities
            </TabsTrigger>
            <TabsTrigger
              value="beneficiaries"
              className={`rounded-none bg-transparent border-0 border-b-2 pb-3 hover:bg-transparent ${
                activeTab === "beneficiaries"
                  ? "border-black"
                  : "border-transparent"
              }`}
            >
              Beneficiaries
            </TabsTrigger>
            <TabsTrigger
              value="team"
              className={`rounded-none bg-transparent border-0 border-b-2 pb-3 hover:bg-transparent ${
                activeTab === "team" ? "border-black" : "border-transparent"
              }`}
            >
              Team
            </TabsTrigger>
            <TabsTrigger
              value="reports"
              className={`rounded-none bg-transparent border-0 border-b-2 pb-3 hover:bg-transparent ${
                activeTab === "reports" ? "border-black" : "border-transparent"
              }`}
            >
              Reports
            </TabsTrigger>
          </div>
        </TabsList>

        <TabsContent value="overview" className="pt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3  gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card className="flex  bg-[#F7F9FB] border-0   drop-shadow-sm shadow-gray-50 ">
                <CardContent className="p-6 ">
                  <h3 className="mb-4">Key Metrics</h3>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="space-y-1">
                      <div className="text-muted-foreground text-sm">
                        Activities
                      </div>
                      <div className="text-2xl font-medium">
                        {enhancedSubProject.activities}
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
                        {enhancedSubProject.beneficiaries}
                      </div>
                      <div className="text-muted-foreground text-sm">
                        Registered individuals
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="text-muted-foreground text-sm">Forms</div>
                      <div className="text-2xl font-medium">
                        {enhancedSubProject.forms}
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
                        {enhancedSubProject.services}
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
                      {/* <Button
                      variant="outline" size="sm">
                        View All Updates
                      </Button> */}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="flex  bg-[#F7F9FB] border-0   drop-shadow-sm shadow-gray-50 ">
                <CardContent className="p-6">
                  <h3 className="mb-3">Sub-Project Objectives</h3>
                  <ul className="space-y-2">
                    {enhancedSubProject.objectives.map((objective, index) => (
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
                        ${enhancedSubProject.budget.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">
                        Funding Source
                      </span>
                      <div>{enhancedSubProject.fundingSource}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="flex  bg-[#F7F9FB] border-0   drop-shadow-sm shadow-gray-50 ">
                <CardContent className="p-6">
                  <h3 className="mb-3">Last Synchronization</h3>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Last synced
                      </span>
                      <span className="text-sm">
                        {new Date(enhancedSubProject.lastSync).toLocaleString()}
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

              {enhancedSubProject.recentReports.length > 0 && (
                <Card className="flex  bg-[#F7F9FB] border-0   drop-shadow-sm shadow-gray-50 ">
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
                      {enhancedSubProject.recentReports.map((report) => (
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
          <SubProjectForms subProjectId={subprojectId || ""} />
        </TabsContent>

        <TabsContent value="activities" className="pt-6">
          <SubProjectActivities subProjectId={subprojectId || ""} />
        </TabsContent>

        <TabsContent value="beneficiaries" className="pt-6">
          <SubProjectBeneficiaries subProjectId={subprojectId || ""} />
        </TabsContent>

        <TabsContent value="team" className="pt-6">
          <SubProjectTeam subProjectId={subprojectId || ""} />
        </TabsContent>

        <TabsContent value="reports" className="pt-6">
          <SubProjectReports subProjectId={subprojectId || ""} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
