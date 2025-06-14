import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  FileEdit,
  User,
  Users,
} from "lucide-react";
import { useState } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/navigation/tabs";
import { Textarea } from "../ui/form/textarea";
import { ProjectActivity } from "./ProjectActivity";
import { ProjectExport } from "./ProjectExport";
import { ProjectStats } from "./ProjectStats";
import { ProjectTeam } from "./ProjectTeam";
import { SubProjects } from "./SubProjects";

interface ProjectDetailsProps {
  projectId: string;
  onBack: () => void;
  onSubProjectSelect: (subProjectId: string) => void;
}

// Mock project data
const mockProjects = [
  {
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
  },
];

export function ProjectDetails({
  projectId,
  onBack,
  onSubProjectSelect,
}: ProjectDetailsProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Find the current project
  const project = mockProjects.find((p) => p.id === projectId);

  if (!project) {
    return <div>Project not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Projects
        </Button>
        <h2>{project.title}</h2>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between">
            <div className="space-y-3 max-w-3xl">
              <div className="flex gap-2">
                <Badge variant="outline">{project.category}</Badge>
                <Badge variant="outline">{project.type}</Badge>
                <Badge
                  variant={
                    project.status === "active" ? "default" : "secondary"
                  }
                >
                  {project.status === "active" ? "Active" : "Inactive"}
                </Badge>
              </div>

              <p className="text-muted-foreground">{project.description}</p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                <div>
                  <div className="text-sm text-muted-foreground">Timeline</div>
                  <div className="flex items-center gap-1 mt-1">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {new Date(project.startDate).toLocaleDateString()} -{" "}
                      {new Date(project.endDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div>
                  <div className="text-sm text-muted-foreground">
                    Project Leads
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{project.leads.join(", ")}</span>
                  </div>
                </div>

                <div>
                  <div className="text-sm text-muted-foreground">
                    Sub-Projects
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    <span>{project.subProjects} Sub-projects</span>
                  </div>
                </div>

                <div>
                  <div className="text-sm text-muted-foreground">
                    Beneficiaries
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{project.beneficiaries} Beneficiaries</span>
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
                        defaultValue={project.title}
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="category" className="text-right">
                        Category *
                      </Label>
                      <Select defaultValue={project.category.toLowerCase()}>
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
                        defaultValue={project.type
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
                      <Select defaultValue={project.status}>
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
                        defaultValue={project.startDate}
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
                        defaultValue={project.endDate}
                      />
                    </div>
                    <div className="grid grid-cols-4 items-start gap-4">
                      <Label htmlFor="description" className="text-right pt-2">
                        Description
                      </Label>
                      <Textarea
                        id="description"
                        className="col-span-3"
                        defaultValue={project.description}
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
              <ProjectStats projectId={projectId} />
            </div>
            <div className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="mb-3">Project Objectives</h3>
                  <ul className="space-y-2">
                    {project.objectives.map((objective, index) => (
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
                        ${project.budget.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">
                        Funding Source
                      </span>
                      <div>{project.fundingSource}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <ProjectActivity projectId={projectId} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="subprojects" className="pt-6">
          <SubProjects
            projectId={projectId}
            onSubProjectSelect={onSubProjectSelect}
          />
        </TabsContent>

        <TabsContent value="team" className="pt-6">
          <ProjectTeam projectId={projectId} />
        </TabsContent>

        <TabsContent value="reports" className="pt-6">
          <ProjectExport projectId={projectId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
