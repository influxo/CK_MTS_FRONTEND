import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  FileEdit,
  User,
  Users,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "sonner";
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
import { ProjectActivity } from "./ProjectActivity";
import { ProjectExport } from "./ProjectExport";
import { ProjectStats } from "./ProjectStats";
import { ProjectTeam } from "./ProjectTeam";
import { SubProjects } from "./SubProjects";
import {
  selectAllProjects,
  selectProjectsLoading,
} from "../../store/slices/projectsSlice";
import type { AppDispatch } from "../../store";
import projectService from "../../services/projects/projectService";
import type { Project } from "../../services/projects/projectModels";
import { Progress } from "../ui/feedback/progress";

// Mock project data for enhanced details
const mockProjectDetails = {
  id: "proj-001",
  title: "Rural Healthcare Initiative",
  category: "Healthcare",
  type: "Service Delivery",
  status: "active",
  progress: 65,
  subProjects: 4,
  beneficiaries: 1245,
  startDate: "2025-01-15",
  endDate: "2025-07-15",
  leads: ["Jane Smith", "Robert Johnson"],
  description:
    "Comprehensive healthcare services for underserved rural communities in the northern region. This project aims to provide basic healthcare services to communities with limited access to medical facilities. Services include regular health checkups, vaccinations, maternal care, and health education.",
  objectives: [
    "Provide healthcare services to at least 2,000 beneficiaries",
    "Conduct 5,000 health consultations",
    "Establish 5 temporary health clinics in remote areas",
    "Train 30 community health workers",
  ],
  budget: 450000,
  fundingSource: "Global Health Fund",
};

export function ProjectDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const [activeTab, setActiveTab] = useState("overview");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSubProjectId, setSelectedSubProjectId] = useState<
    string | null
  >(null);

  // Get projects from Redux store
  const allProjects = useSelector(selectAllProjects);
  const storeLoading = useSelector(selectProjectsLoading);

  useEffect(() => {
    const fetchProjectDetails = async () => {
      if (!id) {
        toast.error("Project ID is missing");
        navigate("/projects");
        return;
      }

      // First check if we already have the project in the Redux store
      const projectFromStore = allProjects.find((p) => p.id === id);

      if (projectFromStore) {
        setProject(projectFromStore);
        return;
      }

      // If not in store, fetch from API
      setIsLoading(true);
      setError(null);

      try {
        const response = await projectService.getAllProjects();
        if (response.success) {
          const foundProject = response.data.find((p) => p.id === id);

          if (foundProject) {
            setProject(foundProject);
          } else {
            // toast.error({
            //   title: "Project not found",
            //   description:
            //     "The project you're trying to view doesn't exist or has been removed.",
            //   action: {
            //     label: "Back to Projects",
            //     onClick: () => navigate("/projects"),
            //   },
            // });
            navigate("/projects");
          }
        } else {
          throw new Error(response.message || "Failed to fetch project");
        }
      } catch (err: any) {
        setError(err.message || "An error occurred while fetching the project");
        toast.error("Failed to load project details", {
          description: err.message || "Please try again later",
          action: {
            label: "Back to Projects",
            onClick: () => navigate("/projects"),
          },
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjectDetails();
  }, [id, allProjects, navigate]);

  const handleSubProjectSelect = (subProjectId: string) => {
    setSelectedSubProjectId(subProjectId);
  };

  const handleBackToProject = () => {
    setSelectedSubProjectId(null);
  };

  if (isLoading || storeLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4">Loading project details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <h2 className="text-xl font-semibold text-destructive">
          Error loading project
        </h2>
        <p className="mt-2 text-muted-foreground">{error}</p>
        <Button className="mt-4" onClick={() => navigate("/projects")}>
          Back to Projects
        </Button>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <h2 className="text-xl font-semibold">Project not found</h2>
        <p className="mt-2 text-muted-foreground">
          The project you're looking for doesn't exist or has been removed.
        </p>
        <Button className="mt-4" onClick={() => navigate("/projects")}>
          Back to Projects
        </Button>
      </div>
    );
  }

  // Merge the API project data with mock data for enhanced UI
  const enhancedProject = {
    ...project,
    title: project.name,
    type: mockProjectDetails.type,
    progress: mockProjectDetails.progress,
    subProjects: mockProjectDetails.subProjects,
    beneficiaries: mockProjectDetails.beneficiaries,
    startDate: project.createdAt,
    endDate: project.updatedAt,
    leads: mockProjectDetails.leads,
    objectives: mockProjectDetails.objectives,
    budget: mockProjectDetails.budget,
    fundingSource: mockProjectDetails.fundingSource,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/projects")}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Projects
        </Button>
        <h2>{enhancedProject.title}</h2>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between">
            <div className="space-y-3 max-w-3xl">
              <div className="flex gap-2">
                <Badge variant="outline">{enhancedProject.category}</Badge>
                <Badge variant="outline">{enhancedProject.type}</Badge>
                <Badge
                  variant={
                    enhancedProject.status === "active"
                      ? "default"
                      : "secondary"
                  }
                >
                  {enhancedProject.status === "active" ? "Active" : "Inactive"}
                </Badge>
              </div>

              <p className="text-muted-foreground">
                {enhancedProject.description}
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                <div>
                  <div className="text-sm text-muted-foreground">Timeline</div>
                  <div className="flex items-center gap-1 mt-1">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {new Date(enhancedProject.startDate).toLocaleDateString()}{" "}
                      - {new Date(enhancedProject.endDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div>
                  <div className="text-sm text-muted-foreground">
                    Project Leads
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{enhancedProject.leads.join(", ")}</span>
                  </div>
                </div>

                <div>
                  <div className="text-sm text-muted-foreground">
                    Sub-Projects
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    <span>{enhancedProject.subProjects} Sub-projects</span>
                  </div>
                </div>

                <div>
                  <div className="text-sm text-muted-foreground">
                    Beneficiaries
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{enhancedProject.beneficiaries} Beneficiaries</span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <Dialog
                open={isEditDialogOpen}
                onOpenChange={setIsEditDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <FileEdit className="h-4 w-4 mr-2" />
                    Edit Project
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[550px]">
                  <DialogHeader>
                    <DialogTitle>Edit Project</DialogTitle>
                    <DialogDescription>
                      Update the details for this project. All fields marked
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
                        defaultValue={enhancedProject.title}
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="category" className="text-right">
                        Category *
                      </Label>
                      <Select
                        defaultValue={enhancedProject.category.toLowerCase()}
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
                          <SelectItem value="nutrition">Nutrition</SelectItem>
                          <SelectItem value="economic development">
                            Economic Development
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="type" className="text-right">
                        Type *
                      </Label>
                      <Select
                        defaultValue={enhancedProject.type
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
                      <Select defaultValue={enhancedProject.status}>
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
                      <Label htmlFor="start-date" className="text-right">
                        Start Date *
                      </Label>
                      <Input
                        id="start-date"
                        type="date"
                        className="col-span-3"
                        defaultValue={enhancedProject.startDate.split("T")[0]}
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
                        defaultValue={enhancedProject.endDate.split("T")[0]}
                      />
                    </div>
                    <div className="grid grid-cols-4 items-start gap-4">
                      <Label htmlFor="description" className="text-right pt-2">
                        Description
                      </Label>
                      <Textarea
                        id="description"
                        className="col-span-3"
                        defaultValue={enhancedProject.description}
                        rows={3}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsEditDialogOpen(false)}
                    >
                      Cancel
                    </Button>
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
          <div className="flex gap-4">
            <TabsTrigger
              value="overview"
              className={`rounded-none border-b-2 border-transparent pb-3 ${
                activeTab === "overview" ? "border-primary" : ""
              }`}
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="subprojects"
              className={`rounded-none border-b-2 border-transparent pb-3 ${
                activeTab === "subprojects" ? "border-primary" : ""
              }`}
            >
              Sub-Projects
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
              value="activity"
              className={`rounded-none border-b-2 border-transparent pb-3 ${
                activeTab === "activity" ? "border-primary" : ""
              }`}
            >
              Activity
            </TabsTrigger>
            <TabsTrigger
              value="reports"
              className={`rounded-none border-b-2 border-transparent pb-3 ${
                activeTab === "reports" ? "border-primary" : ""
              }`}
            >
              Reports & Exports
            </TabsTrigger>
          </div>
        </TabsList>

        <TabsContent value="overview" className="pt-6">
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2 space-y-6">
              <ProjectStats projectId={enhancedProject.id} />
            </div>
            <div className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="mb-3">Project Objectives</h3>
                  <ul className="space-y-2">
                    {enhancedProject.objectives.map((objective, index) => (
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
                        ${enhancedProject.budget.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">
                        Funding Source
                      </span>
                      <div>{enhancedProject.fundingSource}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <ProjectActivity projectId={enhancedProject.id} />
            </div>
          </div>
        </TabsContent>

        {/* IMPORTANT: */}
        {/* TODO: projectId duhet me shku prej struktures tone, tash shkon statikisht prej mock data*/}

        <TabsContent value="subprojects" className="mt-6">
          {/* <SubProjects projectId={enhancedProject.id}" /> */}
          <SubProjects projectId="proj-001" />
        </TabsContent>

        <TabsContent value="team" className="pt-6">
          {/* <ProjectTeam projectId={enhancedProject.id} /> */}
          <ProjectTeam projectId="proj-001" />
        </TabsContent>

        <TabsContent value="activity" className="pt-6">
          {/* <ProjectActivity projectId={enhancedProject.id} /> */}
          <ProjectActivity projectId="proj-001" />
        </TabsContent>

        <TabsContent value="reports" className="pt-6">
          {/* <ProjectExport projectId={enhancedProject.id} /> */}
          <ProjectExport projectId="proj-001" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
