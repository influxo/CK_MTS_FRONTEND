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
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store";

import type {
  CreateSubProjectRequest,
  SubProject,
} from "../../services/subprojects/subprojectModels";

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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
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
import {
  clearSubprojectMessages,
  createSubProject,
  fetchSubProjectsByProjectId,
  selectAllSubprojects,
  selectSubprojectsError,
  selectSubprojectsLoading,
} from "../../store/slices/subProjectSlice";
import { selectCreateSuccessMessage } from "../../store/slices/projectsSlice";

interface SubProjectsProps {
  projectId?: string;
}

export function SubProjects({ projectId: propProjectId }: SubProjectsProps) {
  const navigate = useNavigate();
  const { projectId: paramProjectId } = useParams<{ projectId: string }>();
  const projectId = paramProjectId || propProjectId || "";
  const dispatch = useDispatch<AppDispatch>();

  const subprojects = useSelector((state: RootState) =>
    selectAllSubprojects(state)
  );
  const isLoading = useSelector((state: RootState) =>
    selectSubprojectsLoading(state)
  );
  const error = useSelector((state: RootState) =>
    selectSubprojectsError(state)
  );
  const createSuccessMessage = useSelector((state: RootState) =>
    selectCreateSuccessMessage(state)
  );

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [viewType, setViewType] = useState("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Form state for creation
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState<"active" | "inactive" | "pending">(
    "active"
  );

  useEffect(() => {
    if (projectId) {
      dispatch(fetchSubProjectsByProjectId({ projectId: projectId }));
    }
  }, [projectId, dispatch]);

  useEffect(() => {
    if (isCreateDialogOpen) {
      dispatch(clearSubprojectMessages());
    }
  }, [isCreateDialogOpen, dispatch]);

  useEffect(() => {
    if (createSuccessMessage) {
      setName("");
      setDescription("");
      setCategory("");
      setStatus("active");
      const t = setTimeout(() => {
        setIsCreateDialogOpen(false);
        dispatch(clearSubprojectMessages());
      }, 1000);
      return () => clearTimeout(t);
    }
  }, [createSuccessMessage, dispatch]);

  const handleViewSubProject = (subProjectId: string) => {
    if (!projectId) return;
    navigate(`/projects/${projectId}/subprojects/${subProjectId}`);
  };

  const handleCreateSubmit = async () => {
    if (!projectId) return;
    if (!name.trim() || !category.trim()) {
      return;
    }

    const payload: CreateSubProjectRequest = {
      name: name.trim(),
      description: description.trim(),
      category: category.trim(),
      status,
      projectId,
    };

    await dispatch(createSubProject(payload));
  };

  const filteredSubProjects = subprojects.filter((sp: SubProject) => {
    const matchesProject = sp.projectId === projectId;
    const matchesSearch =
      sp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sp.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || sp.status === statusFilter;
    const matchesCategory =
      categoryFilter === "all" ||
      sp.category.toLowerCase() === categoryFilter.toLowerCase();
    return matchesProject && matchesSearch && matchesStatus && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3>Sub-Projects</h3>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            {/* <Button className="bg-[#2E343E] text-white">
              <Plus className="h-4 w-4 mr-2" />
              Create Sub-Project
            </Button> */}
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
                  value={name}
                  onChange={(e) => setName(e.currentTarget.value)}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">
                  Category *
                </Label>
                <Select
                  value={category}
                  onValueChange={(val) => setCategory(val as string)}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Healthcare">Healthcare</SelectItem>
                    <SelectItem value="Education">Education</SelectItem>
                    <SelectItem value="Infrastructure">
                      Infrastructure
                    </SelectItem>
                    <SelectItem value="Training">Training</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">
                  Status
                </Label>
                <Select
                  value={status}
                  onValueChange={(val) =>
                    setStatus(val as "active" | "inactive" | "pending")
                  }
                  defaultValue="active"
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
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="description" className="text-right pt-2">
                  Description
                </Label>
                <Textarea
                  id="description"
                  className="col-span-3"
                  placeholder="Provide a description of the sub-project"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.currentTarget.value)}
                />
              </div>
            </div>
            {error && (
              <div className="text-destructive text-sm mb-2">{error}</div>
            )}
            {createSuccessMessage && (
              <div className="text-green-600 text-sm mb-2">
                {createSuccessMessage}
              </div>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreateDialogOpen(false);
                  dispatch(clearSubprojectMessages());
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateSubmit}
                disabled={isLoading || !name.trim() || !category.trim()}
              >
                {isLoading ? "Creating..." : "Create Sub-Project"}
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
              className="pl-9 border-0 bg-black/5"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex gap-3">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[130px] border-0 bg-black/5">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[160px] border-0 bg-black/5">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* 
                  KJo o per me ndryshu list ose grid view
                */}

        {/* <Tabs
          value={viewType}
          onValueChange={setViewType}
          className="w-full sm:w-auto"
        >
          <TabsList className="grid w-full sm:w-[180px] grid-cols-2 border items-center">
            <TabsTrigger
              value="grid"
              className="data-[state=active]:bg-[#FF5E3A] data-[state=active]:text-white "
            >
              Grid View
            </TabsTrigger>
            <TabsTrigger
              value="list"
              className="data-[state=active]:bg-[#FF5E3A] data-[state=active]:text-white"
            >
              List View
            </TabsTrigger>
          </TabsList>
        </Tabs> */}
      </div>

      {viewType === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSubProjects.map((subProject: SubProject) => (
            <Card key={subProject.id}>
              <CardHeader className="">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <h4 className="font-medium">{subProject.name}</h4>
                    <div className="flex gap-2">
                      <Badge variant="outline">{subProject.category}</Badge>
                      <Badge
                        className="bg-[#2E343E] text-white"
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
              <CardContent className="pb-3  ">
                <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
                  {subProject.description}
                </p>
                <div className="flex items-center gap-3 mb-4">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="" alt={subProject.name} />
                    <AvatarFallback>
                      {subProject.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-sm">
                    <div>{/* lead placeholder */}</div>
                    <div className="text-muted-foreground">Project Lead</div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span>—</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary"
                        style={{ width: `0%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-1">
                      <CheckCircle className="h-4 w-4 text-muted-foreground" />
                      <span>— Activities</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>— Beneficiaries</span>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-3 flex justify-between text-sm">
                <div>
                  <span className="text-muted-foreground">Location: </span>—
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-primary bg-orange-50"
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
            <TableHeader className="bg-[#E5ECF6]">
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
            <TableBody className="bg-[#F7F9FB]">
              {filteredSubProjects.map((subProject: SubProject) => (
                <TableRow key={subProject.id}>
                  <TableCell className="font-medium">
                    <div
                      className="hover:text-primary cursor-pointer"
                      onClick={() => handleViewSubProject(subProject.id)}
                    >
                      {subProject.name}
                    </div>
                    <div className="text-muted-foreground text-sm line-clamp-1">
                      {subProject.description}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="bg-[#0073e6] border-0 text-white"
                    >
                      {subProject.category}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        subProject.status === "active" ? "default" : "secondary"
                      }
                      style={{
                        backgroundColor:
                          subProject.status === "active"
                            ? "#DEF8EE"
                            : "rgba(28,28,28,0.05)",
                        color:
                          subProject.status === "active"
                            ? "#4AA785"
                            : "rgba(28,28,28,0.4)",
                      }}
                    >
                      {subProject.status === "active" ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary"
                          style={{ width: `0%` }}
                        ></div>
                      </div>
                      <span className="text-sm">—%</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>— - —</span>
                    </div>
                  </TableCell>
                  <TableCell>—</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback>
                          {subProject.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span>—</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm space-y-1">
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3 text-muted-foreground" />
                        <span>— Beneficiaries</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3 text-muted-foreground" />
                        <span>— Activities</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        className="hover:bg-black/10 border-0"
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
                            className="h-8 w-8 p-0 hover:bg-black/10"
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
