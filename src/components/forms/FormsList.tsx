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
  Trash2,
  Users,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch } from "../../store";
import {
  fetchProjects,
  selectAllProjects,
  selectProjectsLoading,
} from "../../store/slices/projectsSlice";
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
import type { FormTemplate } from "../../services/forms/formModels";
import {
  deleteForm,
  updateFormToInactive,
} from "../../store/slices/formsSlice";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/overlay/alert-dialog";
import { useNavigate } from "react-router-dom";
import { FormPreview } from "./FormPreview";

// Interface for component props
interface FormsListProps {
  formTemplates: FormTemplate[];
  onCreateForm: () => void;
  onEditForm: (formId: string) => void;
  onFormDeleted: () => void;
}

export function FormsList({
  formTemplates,
  onCreateForm,
  onEditForm,
  onFormDeleted,
}: FormsListProps) {
  const dispatch = useDispatch<AppDispatch>();
  const projects = useSelector(selectAllProjects);
  const isLoadingProjects = useSelector(selectProjectsLoading);
  const navigate = useNavigate();

  // Fetch projects when component mounts
  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch]);

  const [viewType, setViewType] = useState("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [projectFilter, setProjectFilter] = useState("all");
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [newFormName, setNewFormName] = useState("");
  const [newFormDescription, setNewFormDescription] = useState("");
  const [newFormCategory, setNewFormCategory] = useState("");
  const [newFormProject, setNewFormProject] = useState("");
  const [newFormSubProject, setNewFormSubProject] = useState("");
  const [formToDelete, setFormToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentForm, setCurrentForm] = useState<FormTemplate | null>(null);

  // Handle form creation
  const handleCreateForm = () => {
    setIsCreateFormOpen(false);

    onCreateForm();
  };

  // Handle click on a form template to edit
  const handleEditClick = (formId: string) => {
    navigate(`/forms/edit/${formId}`);
  };

  const handleCreateClick = () => {
    navigate(`/forms/create`);
  };

  const handleDeleteClick = (formId: string) => {
    setFormToDelete(formId);
  };

  const handleConfirmDelete = async () => {
    if (!formToDelete) return;

    setIsDeleting(true);
    try {
      await dispatch(updateFormToInactive({ formId: formToDelete })).unwrap();

      onFormDeleted();

      toast.success("Form deleted successfully");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete form"
      );
    } finally {
      setIsDeleting(false);
      setFormToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setFormToDelete(null);
  };

  const handlePreviewClick = (form: FormTemplate) => {
    setCurrentForm(form);
    setIsPreviewMode(true);
  };

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
          <Button variant="outline" onClick={() => setProjectFilter("all")}>
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Advanced Filters
          </Button>

          <Dialog open={isCreateFormOpen} onOpenChange={setIsCreateFormOpen}>
            <Button
              onClick={() => handleCreateClick()}
              className="bg-black text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Form
            </Button>

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
                    disabled={isLoadingProjects}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          isLoadingProjects
                            ? "Loading projects..."
                            : "Select a project"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name}
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
                        {projects.map((subProject) => (
                          <SelectItem key={subProject.id} value={subProject.id}>
                            {subProject.name}
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
                  onClick={() => setIsCreateFormOpen(false)}
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

          <Dialog open={isPreviewMode} onOpenChange={setIsPreviewMode}>
            <DialogContent className="min-w-[600px]">
              <DialogHeader>
                <DialogTitle>Form Preview</DialogTitle>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                {currentForm && (
                  <FormPreview
                    formData={currentForm}
                    setPreviewMode={setIsPreviewMode}
                  />
                )}
              </div>
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
            {/* Comment for now */}
            {/* <Select value={categoryFilter} onValueChange={setCategoryFilter}>
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
            </Select> */}
            {/* <Select value={statusFilter} onValueChange={setStatusFilter}>
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
            </Select> */}
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <FileDown className="h-4 w-4 mr-2" />
            Export
          </Button>
          {/* <Tabs
            value={viewType}
            onValueChange={setViewType}
            className="w-[180px]"
          >
            <TabsList className="grid w-full grid-cols-2 bg-gray-200 rounded-full">
              <TabsTrigger value="grid" className="rounded-full bg-white">
                Grid View
              </TabsTrigger>
              <TabsTrigger value="list">List View</TabsTrigger>
            </TabsList>
          </Tabs> */}
        </div>
      </div>

      {projectFilter !== "all" && (
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
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.name}>
                        {project.name}
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

      {viewType === "list" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {formTemplates.map((formTes) => (
            // <div>{formTes.name}</div>
            <Card key={formTes.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <span>{formTes.name}</span>
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {formTes.description}
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
                        onClick={() => handleEditClick(formTes.id)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Form
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handlePreviewClick(formTes)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Preview
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => handleDeleteClick(formTes.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
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
                        formTes.status === "active"
                          ? "default"
                          : formTes.status === "draft"
                          ? "outline"
                          : "secondary"
                      }
                    >
                      {formTes.status}
                    </Badge>
                    {/* <Badge variant="outline" className="capitalize">
                      {formTes.category}
                    </Badge>
                    <Badge variant="outline">v{formTes.version}</Badge> */}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Fields:</span>
                      <div>{formTes.schema.fields.length}</div>
                    </div>
                    <div>
                      {/* <span className="text-muted-foreground">
                        Submissions:
                      </span> */}
                      {/* <div>{formTes.submissions}</div> */}
                    </div>
                    <div className="col-span-2">
                      <span className="text-muted-foreground">
                        Last updated:
                      </span>
                      <div>
                        {formTes.updatedAt &&
                          new Date(formTes.updatedAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="col-span-2">
                      <span className="text-muted-foreground">Created by:</span>
                      <div>
                        {formTes.createdAt &&
                          new Date(formTes.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t">
                    <span className="text-sm text-muted-foreground">
                      Projects:
                    </span>
                    <div className="mt-1 space-y-1">
                      {formTes.entityAssociations?.map((association, index) => (
                        <div
                          key={`${association.id}-${index}`}
                          className="text-sm flex items-center gap-1"
                        >
                          <Users className="h-3 w-3 text-muted-foreground" />
                          <span className="capitalize">
                            {association.entityType}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {association.entityName}
                          </span>
                        </div>
                      ))}
                      {(!formTes.entityAssociations ||
                        formTes.entityAssociations.length === 0) && (
                        <span className="text-xs text-muted-foreground">
                          No associated projects
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
              <div className="px-6 py-4 bg-gray-100 flex justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground"
                  onClick={() => handleEditClick(formTes.id)}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Configure
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleEditClick(formTes.id)}
                  className="rounded-md bg-black text-white"
                >
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
            <Button onClick={() => handleCreateForm()}>Create Form</Button>
          </Card>
        </div>
      ) : (
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader className="bg-[#E5ECF6]">
              <TableRow>
                <TableHead className="w-[250px]">Form Name</TableHead>
                {/* <TableHead>Category</TableHead> */}
                <TableHead>Status</TableHead>
                <TableHead>Version</TableHead>
                <TableHead>Fields</TableHead>
                {/* <TableHead>Submissions</TableHead> */}
                <TableHead>Project</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="bg-[#F7F9FB]">
              {formTemplates.map((template) => (
                <TableRow key={template.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{template.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {template.description}
                      </div>
                    </div>
                  </TableCell>
                  {/* <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {template.category}
                    </Badge>
                  </TableCell> */}
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
                  <TableCell>{template.schema.fields.length}</TableCell>
                  {/* <TableCell>{template.submissions}</TableCell> */}
                  <TableCell>
                    <div className="space-y-1 max-w-[150px]">
                      {template.entityAssociations.map(
                        (entityAssociation, index) => (
                          <div key={index} className="text-sm truncate">
                            {/* {entityAssociation.entityId} */}
                            {entityAssociation.entityType && (
                              <span className="text-xs text-muted-foreground block">
                                {entityAssociation.entityName}
                              </span>
                            )}
                          </div>
                        )
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      {template.updatedAt &&
                        new Date(template.updatedAt).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        className="hover:bg-black/10 border-0"
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
                            className="h-8 w-8 p-0 hover:bg-black/10"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handlePreviewClick(template)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Preview
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDeleteClick(template.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
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
          <Dialog open={isPreviewMode} onOpenChange={setIsPreviewMode}>
            <DialogContent className="min-w-[600px]">
              <DialogHeader>
                <DialogTitle>Form Preview</DialogTitle>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                {currentForm && (
                  <FormPreview
                    formData={currentForm}
                    setPreviewMode={setIsPreviewMode}
                  />
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {formTemplates.length === 0 && (
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
          Showing {formTemplates.length} of {formTemplates.length} forms
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!formToDelete}
        onOpenChange={(open) => !open && handleCancelDelete()}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              form and all its data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
