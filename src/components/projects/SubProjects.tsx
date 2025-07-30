import {
  Calendar,
  CheckCircle,
  FileEdit,
  Filter,
  MoreHorizontal,
  Plus,
  Search,
  Trash,
  Users,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/data-display/avatar";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/data-display/table";
import { Tabs, TabsList, TabsTrigger } from "../ui/navigation/tabs";
import { Textarea } from "../ui/form/textarea";

interface SubProjectsProps {
  projectId: string;
}

// Mock sub-project data
const mockSubProjects = [
  {
    id: "sub-001",
    projectId: "proj-001",
    title: "Maternal Health Services",
    category: "Healthcare",
    status: "active",
    progress: 72,
    startDate: "2025-01-20",
    endDate: "2025-06-30",
    beneficiaries: 345,
    lead: "Jane Smith",
    leadAvatar: "",
    leadInitials: "JS",
    description:
      "Providing maternal health services and education in rural communities.",
    activities: 48,
    forms: 125,
    services: 320,
    lastSync: "2025-05-23T14:30:00",
    location: "Northern District",
  },
  {
    id: "sub-002",
    projectId: "proj-001",
    title: "Child Vaccination Campaign",
    category: "Healthcare",
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
  },
  {
    id: "sub-003",
    projectId: "proj-001",
    title: "Community Health Worker Training",
    category: "Training",
    status: "active",
    progress: 60,
    startDate: "2025-02-15",
    endDate: "2025-04-15",
    beneficiaries: 28,
    lead: "Sarah Adams",
    leadAvatar: "",
    leadInitials: "SA",
    description:
      "Training local community health workers in basic healthcare provision.",
    activities: 18,
    forms: 42,
    services: 0,
    lastSync: "2025-05-22T16:45:00",
    location: "Central District",
  },
  {
    id: "sub-004",
    projectId: "proj-001",
    title: "Rural Health Clinic Setup",
    category: "Infrastructure",
    status: "active",
    progress: 45,
    startDate: "2025-03-01",
    endDate: "2025-07-15",
    beneficiaries: 0,
    lead: "David Miller",
    leadAvatar: "",
    leadInitials: "DM",
    description: "Establishing temporary health clinics in 5 remote locations.",
    activities: 24,
    forms: 36,
    services: 0,
    lastSync: "2025-05-21T11:20:00",
    location: "Western Region",
  },
  {
    id: "sub-005",
    projectId: "proj-002",
    title: "Teacher Training Program",
    category: "Education",
    status: "active",
    progress: 50,
    startDate: "2025-02-10",
    endDate: "2025-05-10",
    beneficiaries: 75,
    lead: "Michael Wong",
    leadAvatar: "",
    leadInitials: "MW",
    description:
      "Training primary school teachers in improved teaching methodologies.",
    activities: 35,
    forms: 82,
    services: 150,
    lastSync: "2025-05-20T15:30:00",
    location: "Southern Region",
  },
];

export function SubProjects({ projectId }: SubProjectsProps) {
  const navigate = useNavigate();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [viewType, setViewType] = useState("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Filter sub-projects for this project
  const filteredSubProjects = mockSubProjects.filter((subProject) => {
    const matchesProject = subProject.projectId === projectId;
    const matchesSearch =
      subProject.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subProject.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || subProject.status === statusFilter;
    const matchesCategory =
      categoryFilter === "all" ||
      subProject.category.toLowerCase() === categoryFilter;

    return matchesProject && matchesSearch && matchesStatus && matchesCategory;
  });

  const categories = [
    ...new Set(
      mockSubProjects
        .filter((s) => s.projectId === projectId)
        .map((s) => s.category)
    ),
  ];

  const handleViewSubProject = (subProjectId: string) => {
    // In the future, we could implement a route like /projects/:projectId/subprojects/:subprojectId
    // For now, we'll just log the action
    console.log(`Navigate to subproject: ${subProjectId}`);
    // Example of future implementation:
    // navigate(`/projects/${projectId}/subprojects/${subProjectId}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3>Sub-Projects</h3>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Sub-Project
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Create New Sub-Project</DialogTitle>
              <DialogDescription>
                Add a new sub-project to this project. All fields marked with *
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
                  className="col-span-3"
                  placeholder="Sub-project title"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">
                  Category *
                </Label>
                <Select>
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
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">
                  Status
                </Label>
                <Select defaultValue="active">
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
                <Label htmlFor="lead" className="text-right">
                  Lead *
                </Label>
                <Select>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select lead" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="jane-smith">Jane Smith</SelectItem>
                    <SelectItem value="robert-johnson">
                      Robert Johnson
                    </SelectItem>
                    <SelectItem value="sarah-adams">Sarah Adams</SelectItem>
                    <SelectItem value="david-miller">David Miller</SelectItem>
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
                  placeholder="Project location"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="start-date" className="text-right">
                  Start Date *
                </Label>
                <Input id="start-date" type="date" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="end-date" className="text-right">
                  End Date *
                </Label>
                <Input id="end-date" type="date" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="beneficiaries" className="text-right">
                  Beneficiaries
                </Label>
                <Input
                  id="beneficiaries"
                  type="number"
                  className="col-span-3"
                  placeholder="0"
                />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="description" className="text-right pt-2">
                  Description
                </Label>
                <Textarea
                  id="description"
                  className="col-span-3"
                  placeholder="Provide a description of the sub-project"
                  rows={3}
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
              <Button onClick={() => setIsCreateDialogOpen(false)}>
                Create Sub-Project
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search sub-projects..."
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
          <TabsList className="grid w-full sm:w-[180px] grid-cols-2">
            <TabsTrigger value="grid">Grid View</TabsTrigger>
            <TabsTrigger value="list">List View</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {viewType === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSubProjects.map((subProject) => (
            <Card key={subProject.id}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <h4 className="font-medium">{subProject.title}</h4>
                    <div className="flex gap-2">
                      <Badge variant="outline">{subProject.category}</Badge>
                      <Badge
                        variant={
                          subProject.status === "active"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {subProject.status === "active" ? "Active" : "Inactive"}
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
                        onClick={() => handleViewSubProject(subProject.id)}
                      >
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <FileEdit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        <Trash className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="pb-3">
                <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
                  {subProject.description}
                </p>

                <div className="flex items-center gap-3 mb-4">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={subProject.leadAvatar}
                      alt={subProject.lead}
                    />
                    <AvatarFallback>{subProject.leadInitials}</AvatarFallback>
                  </Avatar>
                  <div className="text-sm">
                    <div>{subProject.lead}</div>
                    <div className="text-muted-foreground">Project Lead</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
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

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-1">
                      <CheckCircle className="h-4 w-4 text-muted-foreground" />
                      <span>{subProject.activities} Activities</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{subProject.beneficiaries} Beneficiaries</span>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-3 flex justify-between text-sm">
                <div>
                  <span className="text-muted-foreground">Location: </span>
                  {subProject.location}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-primary"
                  onClick={() => handleViewSubProject(subProject.id)}
                >
                  View Details
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px]">Sub-Project</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Timeline</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Lead</TableHead>
                <TableHead>Stats</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubProjects.map((subProject) => (
                <TableRow key={subProject.id}>
                  <TableCell className="font-medium">
                    <div
                      className="hover:text-primary cursor-pointer"
                      onClick={() => handleViewSubProject(subProject.id)}
                    >
                      {subProject.title}
                    </div>
                    <div className="text-muted-foreground text-sm line-clamp-1">
                      {subProject.description}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{subProject.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        subProject.status === "active" ? "default" : "secondary"
                      }
                    >
                      {subProject.status === "active" ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary"
                          style={{ width: `${subProject.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-sm">{subProject.progress}%</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {new Date(subProject.startDate).toLocaleDateString()} -{" "}
                        {new Date(subProject.endDate).toLocaleDateString()}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{subProject.location}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage
                          src={subProject.leadAvatar}
                          alt={subProject.lead}
                        />
                        <AvatarFallback>
                          {subProject.leadInitials}
                        </AvatarFallback>
                      </Avatar>
                      <span>{subProject.lead}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm space-y-1">
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3 text-muted-foreground" />
                        <span>{subProject.beneficiaries} Beneficiaries</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3 text-muted-foreground" />
                        <span>{subProject.activities} Activities</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewSubProject(subProject.id)}
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
                          <DropdownMenuItem>
                            <FileEdit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
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
      )}
    </div>
  );
}
