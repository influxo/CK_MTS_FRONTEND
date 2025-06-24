import {
  CheckCircle,
  Filter,
  MoreHorizontal,
  Plus,
  Search,
  Users,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "../ui/data-display/badge";
import { Button } from "../ui/button/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/form/select";
import { Tabs, TabsList, TabsTrigger } from "../ui/navigation/tabs";
import { Textarea } from "../ui/form/textarea";
import { Progress } from "../ui/feedback/progress";
import type {
  CreateProjectRequest,
  CreateProjectResponse,
  Project,
} from "../../services/projects/projectModels";
import projectService from "../../services/projects/projectService";

interface ProjectsListProps {
  onProjectSelect: (projectId: string) => void;
  projects: Project[];
}

// Mock project data
const mockProjects = [
  {
    id: "proj-001",
    // name o kan title
    name: "Rural Healthcare Initiative",
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
      "Comprehensive healthcare services for underserved rural communities in the northern region.",
  },
  {
    id: "proj-002",
    name: "Primary Education Support",
    category: "Education",
    type: "Training",
    status: "active",
    progress: 42,
    subProjects: 3,
    beneficiaries: 876,
    startDate: "2025-02-10",
    endDate: "2025-10-30",
    leads: ["Michael Wong"],
    description:
      "Supporting primary education through teacher training and material provision.",
  },
  {
    id: "proj-003",
    name: "Water Sanitation Program",
    category: "Infrastructure",
    type: "Construction",
    status: "active",
    progress: 78,
    subProjects: 6,
    beneficiaries: 3450,
    startDate: "2024-11-05",
    endDate: "2025-11-05",
    leads: ["Sarah Johnson", "David Miller"],
    description:
      "Improving water access and sanitation facilities in urban slum areas.",
  },
  {
    id: "proj-004",
    name: "Youth Employment Initiative",
    category: "Economic Development",
    type: "Training",
    status: "inactive",
    progress: 100,
    subProjects: 2,
    beneficiaries: 540,
    startDate: "2024-09-01",
    endDate: "2025-04-30",
    leads: ["Thomas Rodriguez"],
    description:
      "Skills development and employment opportunities for urban youth.",
  },
  {
    id: "proj-005",
    name: "Maternal Health Outreach",
    category: "Healthcare",
    type: "Service Delivery",
    status: "active",
    progress: 35,
    subProjects: 3,
    beneficiaries: 980,
    startDate: "2025-03-01",
    endDate: "2025-12-31",
    leads: ["Emily Chen", "Lisa Washington"],
    description:
      "Maternal health services and education for women in underserved communities.",
  },
  {
    id: "proj-006",
    name: "Food Security Program",
    category: "Nutrition",
    type: "Distribution",
    status: "active",
    progress: 28,
    subProjects: 5,
    beneficiaries: 1560,
    startDate: "2025-04-15",
    endDate: "2026-04-15",
    leads: ["James Wilson"],
    description:
      "Ensuring food security through sustainable agriculture and distribution systems.",
  },
];

export function ProjectsList({ onProjectSelect, projects }: ProjectsListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewType, setViewType] = useState("grid");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [formData, setFormData] = useState<CreateProjectRequest>({
    name: "",
    category: "",
    // type: "",
    status: "active",
    // startDate: "",
    // endDate: "",
    description: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSelectField = (value: string, fieldName: string) => {
    setFormData((prevData) => ({
      ...prevData,
      [fieldName]: value,
    }));
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    // Check required fields
    if (!formData.name.trim()) errors.name = "Name is required";
    if (!formData.category) errors.category = "Category is required";
    // if (!formData.type) errors.type = "Type is required";
    // if (!formData.startDate) errors.startDate = "Start date is required";
    // if (!formData.endDate) errors.endDate = "End date is required";

    // Additional validation could be added here
    // For example, check if end date is after start date
    // if (formData.startDate && formData.endDate && new Date(formData.endDate) < new Date(formData.startDate)) {
    //   errors.endDate = "End date must be after start date";
    // }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateProject = () => {
    if (validateForm()) {
      submitCreateProject();
      setIsCreateDialogOpen(false);
      // Reset form after successful submission
      setFormData({
        name: "",
        category: "",
        // type: "",
        status: "active",
        // startDate: "",
        // endDate: "",
        description: "",
      });
    } else {
      console.log("Form validation failed", formErrors);
    }
  };

  const submitCreateProject = async () => {
    console.log("Form Data Submitted:", formData);

    try {
      const response: CreateProjectResponse =
        await projectService.createProject(formData);

      if (response.success && response.data) {
        console.log("Project created successfully:", response.data);
        // Optionally redirect or reset form
        // setFormData({ name: "", category: "", status: "active", description: "" });
      } else {
        console.error("Error:", response.message);
      }
    } catch (err) {
      console.error("Unexpected error while creating project:", err);
    }
  };

  // Filter projects based on search and filters
  // const filteredProjects = mockProjects.filter((project) => {
  //   const matchesSearch =
  //     project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
  //     project.description.toLowerCase().includes(searchQuery.toLowerCase());
  //   const matchesStatus =
  //     statusFilter === "all" || project.status === statusFilter;
  //   const matchesCategory =
  //     categoryFilter === "all" || project.category === categoryFilter;

  //   return matchesSearch && matchesStatus && matchesCategory;
  // });

  const categories = [...new Set(mockProjects.map((p) => p.category))];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2>Projects</h2>
          <p className="text-muted-foreground">
            Manage and monitor all projects and sub-projects
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-black text-white">
              <Plus className="h-4 w-4 mr-2" />
              Create Project
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
              <DialogDescription>
                Enter the details for your new project. All fields marked with *
                are required.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">
                  Title *
                </Label>
                <Input
                  id="title"
                  name="name"
                  className={`col-span-3 ${
                    formErrors.name ? "border-red-500" : ""
                  }`}
                  placeholder="Project title"
                  value={formData.name}
                  onChange={handleInputChange}
                />
                {formErrors.name && (
                  <p className="text-red-500 text-sm col-span-3 col-start-2">
                    {formErrors.name}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">
                  Category *
                </Label>
                <Input
                  id="category"
                  name="category"
                  className={`col-span-3 ${
                    formErrors.category ? "border-red-500" : ""
                  }`}
                  placeholder="Project Category"
                  value={formData.category}
                  onChange={handleInputChange}
                />
                {formErrors.category && (
                  <p className="text-red-500 text-sm col-span-3 col-start-2">
                    {formErrors.category}
                  </p>
                )}
              </div>
              {/* <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="type" className="text-right">
                  Type *
                </Label>
                <Select 
                  value={formData.type} 
                  onValueChange={(value) => handleSelectField(value, 'type')}
                >
                  <SelectTrigger className={`col-span-3 ${formErrors.type ? 'border-red-500' : ''}`}>
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
                {formErrors.type && (
                  <p className="text-red-500 text-sm col-span-3 col-start-2">{formErrors.type}</p>
                )}
              </div> */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">
                  Status
                </Label>
                <Select
                  defaultValue="active"
                  value={formData.status}
                  onValueChange={(value) => handleSelectField(value, "status")}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {/* <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="start-date" className="text-right">
                  Start Date *
                </Label>
                <Input 
                  id="start-date" 
                  name="startDate"
                  type="date" 
                  className={`col-span-3 ${formErrors.startDate ? 'border-red-500' : ''}`}
                  value={formData.startDate} 
                  onChange={handleInputChange}
                />
                {formErrors.startDate && (
                  <p className="text-red-500 text-sm col-span-3 col-start-2">{formErrors.startDate}</p>
                )}
              </div> */}
              {/* <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="end-date" className="text-right">
                  End Date *
                </Label>
                <Input 
                  id="end-date" 
                  name="endDate"
                  type="date" 
                  className={`col-span-3 ${formErrors.endDate ? 'border-red-500' : ''}`}
                  value={formData.endDate} 
                  onChange={handleInputChange}
                />
                {formErrors.endDate && (
                  <p className="text-red-500 text-sm col-span-3 col-start-2">{formErrors.endDate}</p>
                )}
              </div> */}
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="description" className="text-right pt-2">
                  Description
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  className="col-span-3"
                  placeholder="Provide a description of the project"
                  rows={3}
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateProject}>Create Project</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-3">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[130px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="planning">Planning</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[160px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category.toLowerCase()}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <Tabs
          value={viewType}
          onValueChange={setViewType}
          className="w-full sm:w-auto"
        >
          <TabsList className="grid w-full sm:w-[180px] grid-cols-2 bg-gray-200 rounded-full">
            <TabsTrigger
              value="grid"
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-full transition-colors"
            >
              Grid View
            </TabsTrigger>
            <TabsTrigger
              value="list"
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-full transition-colors"
            >
              List View
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="mt-6">
        {viewType === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Card key={project.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <h3 className="text-base font-medium">{project.name}</h3>
                      <div className="flex gap-2">
                        <Badge variant="outline">{project.category}</Badge>
                        <Badge
                          variant={
                            project.status === "active"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {project.status === "active" ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => onProjectSelect(project.id)}
                        >
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>Edit Project</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          Delete Project
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="pb-3">
                  <p className="text-muted-foreground text-sm line-clamp-2">
                    {project.description}
                  </p>
                  <div className="mt-4 space-y-3">
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Progress</span>
                        {/* <span>{project.progress}%</span> */}
                        <span>50%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        {/* <Progress value={project.progress} /> */}
                        <Progress value={50} />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-1">
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                        {/* <span>{project.subProjects} Sub-projects</span> */}
                        <span>5 Sub-projects</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        {/* <span>{project.beneficiaries} Beneficiaries</span> */}
                        <span>100 Beneficiaries</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-3 flex justify-between text-sm">
                  <div>
                    <span className="text-muted-foreground">Start: </span>
                    {/* {new Date(project.startDate).toLocaleDateString()} */}
                    {new Date(project.createdAt).toLocaleDateString()}
                  </div>
                  <div>
                    <span className="text-muted-foreground">End: </span>
                    {/* {new Date(project.endDate).toLocaleDateString()} */}
                    {new Date(project.updatedAt).toLocaleDateString()}
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="rounded-md border overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-muted border-b">
                  <th className="text-left p-3 font-medium">Project Name</th>
                  <th className="text-left p-3 font-medium">Category</th>
                  <th className="text-left p-3 font-medium">Status</th>
                  <th className="text-left p-3 font-medium">Progress</th>
                  <th className="text-left p-3 font-medium">Timeline</th>
                  <th className="text-left p-3 font-medium">Sub-Projects</th>
                  <th className="text-left p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {/* {filteredProjects.map((project) => ( */}
                {projects.map((project) => (
                  <tr key={project.id} className="border-b">
                    <td className="p-3">
                      {/* Project Name o kan project.title */}
                      <div className="font-medium">{project.name}</div>
                      <div className="text-muted-foreground text-sm line-clamp-1">
                        {project.description}
                      </div>
                    </td>
                    <td className="p-3">
                      <Badge variant="outline">{project.category}</Badge>
                    </td>
                    <td className="p-3">
                      <Badge
                        variant={
                          project.status === "active" ? "default" : "secondary"
                        }
                      >
                        {project.status === "active" ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary"
                            // style={{ width: `${project.progress}%` }}
                            style={{ width: `50%` }}
                          ></div>
                        </div>
                        {/* <span className="text-sm">{project.progress}%</span> */}
                        <span className="text-sm">50%</span>
                      </div>
                    </td>
                    <td className="p-3 text-sm">
                      <div>
                        {/* {new Date(project.startDate).toLocaleDateString()} */}
                        {new Date(project.createdAt).toLocaleDateString()}
                      </div>
                      <div className="text-muted-foreground">to</div>
                      <div>
                        {/* {new Date(project.endDate).toLocaleDateString()} */}
                        {new Date(project.updatedAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="text-sm">
                        {/* {project.subProjects} Sub-projects */}5 Sub-projects
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {/* {project.beneficiaries} Beneficiaries */}
                        100 Beneficiaries
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onProjectSelect(project.id)}
                        >
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
                            <DropdownMenuItem>Edit Project</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              Delete Project
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
