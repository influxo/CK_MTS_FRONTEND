import {
  AlertCircle,
  Check,
  Copy,
  Edit,
  Eye,
  FileDown,
  FileJson,
  FileText,
  Filter,
  HelpCircle,
  Link,
  MoreHorizontal,
  Plus,
  Search,
  Settings,
  SlidersHorizontal,
  Trash,
  Users,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "../ui/data-display/badge";
import { Button } from "../ui/button/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/data-display/card";
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

// Mock data for form templates
const mockFormTemplates = [
  {
    id: "form-001",
    name: "Maternal Health Assessment",
    description: "Assessment form for pregnant women and new mothers",
    category: "health",
    lastUpdated: "2025-05-10T14:30:00",
    status: "active",
    fieldCount: 24,
    version: "1.2",
    createdBy: "Jane Smith",
    associatedProjects: ["Rural Healthcare Initiative"],
    associatedSubProjects: ["Maternal Health Services"],
    submissions: 152,
    lastSubmission: "2025-05-20T09:15:00",
  },
  {
    id: "form-002",
    name: "Agricultural Productivity Survey",
    description: "Survey for measuring farm productivity and practices",
    category: "agriculture",
    lastUpdated: "2025-04-22T11:45:00",
    status: "active",
    fieldCount: 18,
    version: "2.0",
    createdBy: "Robert Johnson",
    associatedProjects: ["Community Development"],
    associatedSubProjects: ["Food Security Initiative"],
    submissions: 87,
    lastSubmission: "2025-05-18T16:30:00",
  },
  {
    id: "form-003",
    name: "Water Access Questionnaire",
    description: "Questionnaire to assess community water access and quality",
    category: "wash",
    lastUpdated: "2025-05-05T10:15:00",
    status: "active",
    fieldCount: 15,
    version: "1.0",
    createdBy: "Michael Lee",
    associatedProjects: ["Community Development"],
    associatedSubProjects: ["Water Access Program"],
    submissions: 65,
    lastSubmission: "2025-05-19T11:20:00",
  },
  {
    id: "form-004",
    name: "Nutrition Screening Tool",
    description: "Screening tool for child nutrition status",
    category: "health",
    lastUpdated: "2025-04-15T09:30:00",
    status: "active",
    fieldCount: 12,
    version: "1.1",
    createdBy: "Sarah Johnson",
    associatedProjects: ["Rural Healthcare Initiative"],
    associatedSubProjects: ["Nutrition Support"],
    submissions: 98,
    lastSubmission: "2025-05-21T08:45:00",
  },
  {
    id: "form-005",
    name: "Education Needs Assessment",
    description: "Assessment of educational needs for youth programs",
    category: "education",
    lastUpdated: "2025-04-28T15:45:00",
    status: "draft",
    fieldCount: 20,
    version: "0.9",
    createdBy: "Jennifer Davis",
    associatedProjects: ["Youth Empowerment Program"],
    associatedSubProjects: ["Education Support"],
    submissions: 0,
    lastSubmission: null,
  },
  {
    id: "form-006",
    name: "Skills Training Feedback",
    description: "Feedback form for vocational skills training sessions",
    category: "training",
    lastUpdated: "2025-05-14T13:20:00",
    status: "active",
    fieldCount: 10,
    version: "1.0",
    createdBy: "Thomas Brown",
    associatedProjects: ["Youth Empowerment Program"],
    associatedSubProjects: ["Skills Training"],
    submissions: 45,
    lastSubmission: "2025-05-19T15:30:00",
  },
  {
    id: "form-007",
    name: "Child Vaccination Record",
    description: "Form for tracking child vaccinations",
    category: "health",
    lastUpdated: "2025-05-02T11:00:00",
    status: "archived",
    fieldCount: 15,
    version: "2.1",
    createdBy: "Jane Smith",
    associatedProjects: ["Rural Healthcare Initiative"],
    associatedSubProjects: ["Child Vaccination Campaign"],
    submissions: 215,
    lastSubmission: "2025-05-01T14:20:00",
  },
];

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

// Interface for component props
interface FormsListProps {
  onCreateForm: () => void;
  onEditForm: (formId: string) => void;
}

export function FormsList({ onCreateForm, onEditForm }: FormsListProps) {
  const [viewType, setViewType] = useState("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [projectFilter, setProjectFilter] = useState("all");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [isNewFormDialogOpen, setIsNewFormDialogOpen] = useState(false);
  const [newFormName, setNewFormName] = useState("");
  const [newFormDescription, setNewFormDescription] = useState("");
  const [newFormCategory, setNewFormCategory] = useState("");
  const [newFormProject, setNewFormProject] = useState("");
  const [newFormSubProject, setNewFormSubProject] = useState("");

  // Filter form templates based on selected filters
  const filteredTemplates = mockFormTemplates.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      categoryFilter === "all" || template.category === categoryFilter;

    const matchesStatus =
      statusFilter === "all" || template.status === statusFilter;

    const matchesProject =
      projectFilter === "all" ||
      template.associatedProjects.some((project) => project === projectFilter);

    return matchesSearch && matchesCategory && matchesStatus && matchesProject;
  });

  // Get available categories from templates
  const categories = Array.from(
    new Set(mockFormTemplates.map((template) => template.category))
  );

  // Handle form creation
  const handleCreateForm = () => {
    // In a real app, this would save the new form to the database
    console.log("Creating new form:", {
      name: newFormName,
      description: newFormDescription,
      category: newFormCategory,
      project: newFormProject,
      subProject: newFormSubProject,
    });

    setIsNewFormDialogOpen(false);
    // Call the parent component's handler
    onCreateForm();
  };

  // Handle click on a form template to edit
  const handleEditClick = (formId: string) => {
    onEditForm(formId);
  };

  // Get the filtered subprojects based on selected project
  const filteredSubprojects =
    mockProjects.find((p) => p.id === newFormProject)?.subProjects || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2>Forms</h2>
          <p className="text-muted-foreground">
            Create and manage data collection forms
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          >
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Advanced Filters
          </Button>

          <Dialog
            open={isNewFormDialogOpen}
            onOpenChange={setIsNewFormDialogOpen}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Form
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px]">
              <DialogHeader>
                <DialogTitle>Create New Form</DialogTitle>
                <DialogDescription>
                  Create a new data collection form template. You'll be able to
                  add fields in the form builder.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="form-name">Form Name *</Label>
                  <Input
                    id="form-name"
                    placeholder="Enter form name"
                    value={newFormName}
                    onChange={(e) => setNewFormName(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="form-description">Description</Label>
                  <Textarea
                    id="form-description"
                    placeholder="Enter form description"
                    rows={3}
                    value={newFormDescription}
                    onChange={(e) => setNewFormDescription(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="form-category">Category *</Label>
                  <Select
                    value={newFormCategory}
                    onValueChange={setNewFormCategory}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="health">Health</SelectItem>
                      <SelectItem value="agriculture">Agriculture</SelectItem>
                      <SelectItem value="wash">Water & Sanitation</SelectItem>
                      <SelectItem value="education">Education</SelectItem>
                      <SelectItem value="training">Training</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="form-project">Associate with Project</Label>
                  <Select
                    value={newFormProject}
                    onValueChange={setNewFormProject}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a project" />
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
                {newFormProject && (
                  <div className="grid gap-2">
                    <Label htmlFor="form-subproject">
                      Associate with Sub-Project
                    </Label>
                    <Select
                      value={newFormSubProject}
                      onValueChange={setNewFormSubProject}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a sub-project" />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredSubprojects.map((subProject) => (
                          <SelectItem key={subProject.id} value={subProject.id}>
                            {subProject.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsNewFormDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateForm}
                  disabled={!newFormName || !newFormCategory}
                >
                  Create & Open Builder
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 justify-between">
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search forms..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-3">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[150px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <FileDown className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Tabs
            value={viewType}
            onValueChange={setViewType}
            className="w-[180px]"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="grid">Grid View</TabsTrigger>
              <TabsTrigger value="list">List View</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {showAdvancedFilters && (
        <Card className="mb-6">
          <CardContent className="py-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Project</Label>
                <Select value={projectFilter} onValueChange={setProjectFilter}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="All projects" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Projects</SelectItem>
                    {mockProjects.map((project) => (
                      <SelectItem key={project.id} value={project.title}>
                        {project.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Created By</Label>
                <Select>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="All users" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="jane">Jane Smith</SelectItem>
                    <SelectItem value="robert">Robert Johnson</SelectItem>
                    <SelectItem value="michael">Michael Lee</SelectItem>
                    <SelectItem value="sarah">Sarah Johnson</SelectItem>
                    <SelectItem value="jennifer">Jennifer Davis</SelectItem>
                    <SelectItem value="thomas">Thomas Brown</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Last Updated</Label>
                <Select>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Any time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="quarter">This Quarter</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <Button variant="outline" size="sm" className="mr-2">
                Reset Filters
              </Button>
              <Button size="sm">Apply Filters</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {viewType === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <Card key={template.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <span>{template.name}</span>
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {template.description}
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => handleEditClick(template.id)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Form
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Eye className="h-4 w-4 mr-2" />
                        Preview
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Copy className="h-4 w-4 mr-2" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <FileJson className="h-4 w-4 mr-2" />
                        Export JSON
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Link className="h-4 w-4 mr-2" />
                        Assign to Project
                      </DropdownMenuItem>
                      {template.status !== "archived" ? (
                        <DropdownMenuItem>
                          <AlertCircle className="h-4 w-4 mr-2" />
                          Archive
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem>
                          <Check className="h-4 w-4 mr-2" />
                          Restore
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem className="text-destructive">
                        <Trash className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-1.5">
                    <Badge
                      variant={
                        template.status === "active"
                          ? "default"
                          : template.status === "draft"
                          ? "outline"
                          : "secondary"
                      }
                    >
                      {template.status}
                    </Badge>
                    <Badge variant="outline" className="capitalize">
                      {template.category}
                    </Badge>
                    <Badge variant="outline">v{template.version}</Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Fields:</span>
                      <div>{template.fieldCount}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">
                        Submissions:
                      </span>
                      <div>{template.submissions}</div>
                    </div>
                    <div className="col-span-2">
                      <span className="text-muted-foreground">
                        Last updated:
                      </span>
                      <div>
                        {new Date(template.lastUpdated).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="col-span-2">
                      <span className="text-muted-foreground">Created by:</span>
                      <div>{template.createdBy}</div>
                    </div>
                  </div>

                  <div className="pt-2 border-t">
                    <span className="text-sm text-muted-foreground">
                      Projects:
                    </span>
                    <div className="mt-1 space-y-1">
                      {template.associatedProjects.map((project, index) => (
                        <div
                          key={index}
                          className="text-sm flex items-center gap-1"
                        >
                          <Users className="h-3 w-3 text-muted-foreground" />
                          <span>{project}</span>
                          {template.associatedSubProjects[index] && (
                            <span className="text-xs text-muted-foreground">
                              ({template.associatedSubProjects[index]})
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
              <div className="px-6 py-4 bg-muted/50 flex justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground"
                  onClick={() => handleEditClick(template.id)}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Configure
                </Button>
                <Button size="sm" onClick={() => handleEditClick(template.id)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Form
                </Button>
              </div>
            </Card>
          ))}

          {/* Create new form card */}
          <Card className="border-dashed flex flex-col items-center justify-center p-6">
            <div className="rounded-full border-dashed border-2 p-3 mb-3">
              <Plus className="h-6 w-6 text-muted-foreground" />
            </div>
            <h4 className="mb-1">Create New Form</h4>
            <p className="text-sm text-muted-foreground text-center mb-3">
              Design a custom data collection form for your projects
            </p>
            <Button onClick={() => setIsNewFormDialogOpen(true)}>
              Create Form
            </Button>
          </Card>
        </div>
      ) : (
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px]">Form Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Version</TableHead>
                <TableHead>Fields</TableHead>
                <TableHead>Submissions</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTemplates.map((template) => (
                <TableRow key={template.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{template.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {template.description}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {template.category}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        template.status === "active"
                          ? "default"
                          : template.status === "draft"
                          ? "outline"
                          : "secondary"
                      }
                    >
                      {template.status}
                    </Badge>
                  </TableCell>
                  <TableCell>v{template.version}</TableCell>
                  <TableCell>{template.fieldCount}</TableCell>
                  <TableCell>{template.submissions}</TableCell>
                  <TableCell>
                    <div className="space-y-1 max-w-[150px]">
                      {template.associatedProjects.map((project, index) => (
                        <div key={index} className="text-sm truncate">
                          {project}
                          {template.associatedSubProjects[index] && (
                            <span className="text-xs text-muted-foreground block">
                              {template.associatedSubProjects[index]}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      {new Date(template.lastUpdated).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      by {template.createdBy}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditClick(template.id)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
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
                            <Eye className="h-4 w-4 mr-2" />
                            Preview
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Copy className="h-4 w-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <FileJson className="h-4 w-4 mr-2" />
                            Export JSON
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Link className="h-4 w-4 mr-2" />
                            Assign to Project
                          </DropdownMenuItem>
                          {template.status !== "archived" ? (
                            <DropdownMenuItem>
                              <AlertCircle className="h-4 w-4 mr-2" />
                              Archive
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem>
                              <Check className="h-4 w-4 mr-2" />
                              Restore
                            </DropdownMenuItem>
                          )}
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

      {filteredTemplates.length === 0 && (
        <div className="text-center py-10 border rounded-lg">
          <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <h3 className="text-lg mb-2">No forms found</h3>
          <p className="text-muted-foreground">
            Try adjusting your filters or create a new form.
          </p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {filteredTemplates.length} of {mockFormTemplates.length} forms
        </div>
        <div className="space-x-2">
          <Button variant="outline" size="sm">
            <HelpCircle className="h-4 w-4 mr-2" />
            Form Templates
          </Button>
          <Button variant="outline" size="sm">
            <FileJson className="h-4 w-4 mr-2" />
            Import JSON
          </Button>
        </div>
      </div>
    </div>
  );
}
