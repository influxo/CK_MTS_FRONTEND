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
import { useState, useEffect, useMemo } from "react";
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
// Removed Pagination components in favor of Beneficiaries-style Button pagination
// Tabs components were unused in this component
import { Textarea } from "../ui/form/textarea";
import type { FormTemplate } from "../../services/forms/formModels";
import {
  deleteForm,
  updateFormToInactive,
} from "../../store/slices/formsSlice";
import {
  fetchFormTemplates,
  selectFormTemplates,
  selectFormTemplatesPagination,
} from "../../store/slices/formSlice";
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
import { selectCurrentUser } from "../../store/slices/authSlice";
import { useTranslation } from "../../hooks/useTranslation";

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
  const { t } = useTranslation();
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

  // Pagination state (backend-driven via formSlice)
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  // Paginated data from formSlice (used for table view)
  const templatesFromStore = useSelector(selectFormTemplates);
  const pagination = useSelector(selectFormTemplatesPagination);

  // Fetch paginated templates when page/limit change
  useEffect(() => {
    dispatch(fetchFormTemplates({ page, limit }));
  }, [dispatch, page, limit]);

  // Decide which templates to show in the table: prefer store (paginated) else props
  const displayedTemplates =
    templatesFromStore && templatesFromStore.length > 0
      ? templatesFromStore
      : formTemplates;

  const totalPages =
    pagination?.totalPages ||
    Math.max(1, Math.ceil((formTemplates?.length || 0) / limit));
  const totalCount = pagination?.totalCount ?? (formTemplates?.length || 0);

  // Numbered pagination builder (compact with ellipsis) – match BeneficiariesList design
  const pageTokens = useMemo(() => {
    const total = Math.max(totalPages || 1, 1);
    const current = Math.min(Math.max(page || 1, 1), total);
    const tokens: Array<number | string> = [];
    if (total <= 7) {
      for (let i = 1; i <= total; i++) tokens.push(i);
      return tokens;
    }
    const left = Math.max(2, current - 1);
    const right = Math.min(total - 1, current + 1);
    tokens.push(1);
    if (left > 2) tokens.push("left-ellipsis");
    for (let i = left; i <= right; i++) tokens.push(i);
    if (right < total - 1) tokens.push("right-ellipsis");
    tokens.push(total);
    return tokens;
  }, [page, totalPages]);

  const goToPage = (p: number) => {
    if (p < 1) return;
    const max = totalPages;
    if (p > max) return;
    setPage(p);
  };

  const user = useSelector(selectCurrentUser);
  // Determine role
  const normalizedRoles = useMemo(
    () => (user?.roles || []).map((r: any) => r.name?.toLowerCase?.() || ""),
    [user?.roles]
  );

  const hasFullAccess = useMemo(() => {
    return normalizedRoles.some(
      (r: string) =>
        r === "sysadmin" ||
        r === "superadmin" ||
        r === "program manager" ||
        r === "subproject manager" ||
        r === "sub-project manager" ||
        r.includes("system admin") ||
        r.includes("super admin") ||
        r.includes("program manager") ||
        r.includes("sub project manager") ||
        r.includes("sub-project manager")
    );
  }, [normalizedRoles]);

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

      toast.success(t('forms.formDeletedSuccessfully'));
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t('forms.failedToDeleteForm')
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
          <h2>{t('forms.title')}</h2>
          <p className="text-muted-foreground">
            {t('forms.subtitle')}
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            className="bg-[#E0F2FE] border-0 transition-transform duration-200 ease-in-out hover:scale-105 hover:-translate-y-[1px] text-black"
            variant="outline"
            onClick={() => setProjectFilter("all")}
          >
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            {t('forms.advancedFilters')}
          </Button>

          {hasFullAccess && (
            <Dialog open={isCreateFormOpen} onOpenChange={setIsCreateFormOpen}>
              <Button
                onClick={() => handleCreateClick()}
                className="bg-[#0073e6] text-white transition-transform duration-200 ease-in-out hover:scale-105 hover:-translate-y-[1px]"
              >
                <Plus className="h-4 w-4 mr-2" />
                {t('forms.createForm')}
              </Button>

              <DialogContent className="sm:max-w-[550px]">
                <DialogHeader>
                  <DialogTitle>{t('forms.createNewForm')}</DialogTitle>
                  <DialogDescription>
                    {t('forms.createNewFormDesc')}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="form-name">{t('forms.formName')} *</Label>
                    <Input
                      id="form-name"
                      placeholder={t('forms.enterFormName')}
                      value={newFormName}
                      onChange={(e) => setNewFormName(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="form-description">{t('forms.description')}</Label>
                    <Textarea
                      id="form-description"
                      placeholder={t('forms.enterFormDescription')}
                      rows={3}
                      value={newFormDescription}
                      onChange={(e) => setNewFormDescription(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="form-category">{t('forms.category')} *</Label>
                    <Select
                      value={newFormCategory}
                      onValueChange={setNewFormCategory}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('forms.selectCategory')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="health">{t('forms.health')}</SelectItem>
                        <SelectItem value="agriculture">{t('forms.agriculture')}</SelectItem>
                        <SelectItem value="wash">{t('forms.washCategory')}</SelectItem>
                        <SelectItem value="education">{t('forms.education')}</SelectItem>
                        <SelectItem value="training">{t('forms.training')}</SelectItem>
                        <SelectItem value="other">{t('forms.other')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="form-project">{t('forms.associateWithProject')}</Label>
                    <Select
                      value={newFormProject}
                      onValueChange={setNewFormProject}
                      disabled={isLoadingProjects}
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            isLoadingProjects
                              ? t('forms.loadingProjects')
                              : t('forms.selectProject')
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
                        {t('forms.associateWithSubProject')}
                      </Label>
                      <Select
                        value={newFormSubProject}
                        onValueChange={setNewFormSubProject}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t('forms.selectSubProject')} />
                        </SelectTrigger>
                        <SelectContent>
                          {projects.map((subProject) => (
                            <SelectItem
                              key={subProject.id}
                              value={subProject.id}
                            >
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
                    {t('forms.cancel')}
                  </Button>
                  <Button
                    onClick={handleCreateForm}
                    disabled={!newFormName || !newFormCategory}
                  >
                    {t('forms.createAndOpenBuilder')}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}

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
              placeholder={t('forms.searchForms')}
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-3">{/* Comment for now */}</div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <FileDown className="h-4 w-4 mr-2" />
            {t('forms.export')}
          </Button>
        </div>
      </div>

      {/* TODO: remove this filter | me shume gjasa nuk na duhet hiq */}
      {projectFilter !== "all" && (
        <Card className="mb-6">
          <CardContent className="py-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>{t('forms.project')}</Label>
                <Select value={projectFilter} onValueChange={setProjectFilter}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder={t('forms.allProjects')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('forms.allProjects')}</SelectItem>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.name}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t('forms.createdBy')}</Label>
                <Select>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder={t('forms.allUsers')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('forms.allUsers')}</SelectItem>
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
                <Label>{t('forms.lastUpdated')}</Label>
                <Select>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder={t('forms.anyTime')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">{t('forms.anyTime')}</SelectItem>
                    <SelectItem value="today">{t('forms.today')}</SelectItem>
                    <SelectItem value="week">{t('forms.thisWeek')}</SelectItem>
                    <SelectItem value="month">{t('forms.thisMonth')}</SelectItem>
                    <SelectItem value="quarter">{t('forms.thisQuarter')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <Button variant="outline" size="sm" className="mr-2">
                {t('forms.resetFilters')}
              </Button>
              <Button size="sm">{t('forms.applyFilters')}</Button>
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
                      {hasFullAccess && (
                        <DropdownMenuItem
                          onClick={() => handleEditClick(formTes.id)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          {t('forms.editForm')}
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={() => handlePreviewClick(formTes)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        {t('forms.preview')}
                      </DropdownMenuItem>
                      {hasFullAccess && (
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDeleteClick(formTes.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          {t('forms.delete')}
                        </DropdownMenuItem>
                      )}
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
                      <span className="text-muted-foreground">{t('forms.fields')}:</span>
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
                        {t('forms.lastUpdatedLabel')}
                      </span>
                      <div>
                        {formTes.updatedAt &&
                          new Date(formTes.updatedAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="col-span-2">
                      <span className="text-muted-foreground">{t('forms.createdByLabel')}</span>
                      <div>
                        {formTes.createdAt &&
                          new Date(formTes.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t">
                    <span className="text-sm text-muted-foreground">
                      {t('forms.projects')}:
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
                          {t('forms.noAssociatedProjects')}
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
                  {t('forms.configure')}
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleEditClick(formTes.id)}
                  className="rounded-md bg-black text-white"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  {t('forms.editForm')}
                </Button>
              </div>
            </Card>
          ))}

          {/* Create new form card */}
          <Card className="border-dashed flex flex-col items-center justify-center p-6">
            <div className="rounded-full border-dashed border-2 p-3 mb-3">
              <Plus className="h-6 w-6 text-muted-foreground" />
            </div>
            <h4 className="mb-1">{t('forms.createNewFormCard')}</h4>
            <p className="text-sm text-muted-foreground text-center mb-3">
              {t('forms.designCustomForm')}
            </p>
            <Button onClick={() => handleCreateForm()}>{t('forms.createForm')}</Button>
          </Card>
        </div>
      ) : (
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader className="bg-[#E5ECF6]">
              <TableRow>
                <TableHead className="w-[250px]">{t('forms.formNameHeader')}</TableHead>
                {/* <TableHead>Category</TableHead> */}
                <TableHead>{t('forms.statusHeader')}</TableHead>
                <TableHead>{t('forms.versionHeader')}</TableHead>
                <TableHead>{t('forms.fieldsHeader')}</TableHead>
                {/* <TableHead>Submissions</TableHead> */}
                <TableHead>{t('forms.projectHeader')}</TableHead>
                <TableHead>{t('forms.lastUpdatedHeader')}</TableHead>
                <TableHead className="text-right">{t('forms.actionsHeader')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="bg-[#F7F9FB]">
              {displayedTemplates.map((template) => (
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
                      className={
                        template.status === "active"
                          ? "bg-[#DEF8EE] text-[#4AA785] border-0"
                          : template.status === "inactive"
                          ? "bg-black/10 text-black/40 border-0"
                          : undefined
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
                      <div className="text-sm">
                        {template.entityAssociations.length} {t('forms.projects')}
                      </div>
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
                        className="hover:bg-[#E0F2FE] border-0"
                        size="sm"
                        onClick={() => handleEditClick(template.id)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        {t('forms.edit')}
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-[#E0F2FE]"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handlePreviewClick(template)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            {t('forms.preview')}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDeleteClick(template.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            {t('forms.delete')}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {/* Pagination Controls - mirrored from BeneficiariesList */}
          <div className="flex items-center justify-between flex-wrap gap-3 px-4 py-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>
                {t('forms.pageOf')} {page} {t('forms.of')} {Math.max(totalPages || 1, 1)}
              </span>
              <span className="hidden sm:inline">
                • {t('forms.total')} {totalCount} {t('forms.records')}
              </span>
              <div className="flex items-center gap-2 ml-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(page - 1)}
                  disabled={page <= 1}
                  className="bg-white"
                >
                  {t('forms.prev')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(page + 1)}
                  disabled={totalPages === 0 || page >= totalPages}
                  className="bg-white"
                >
                  {t('forms.next')}
                </Button>
                <div className="flex items-center gap-1 ml-2">
                  {pageTokens.map((tok, idx) =>
                    typeof tok === "number" ? (
                      <Button
                        key={`p-${tok}`}
                        variant="outline"
                        size="sm"
                        className={
                          tok === page
                            ? "bg-[#0073e6] text-white border-0"
                            : "bg-white"
                        }
                        onClick={() => tok !== page && goToPage(tok)}
                        aria-current={tok === page ? "page" : undefined}
                      >
                        {tok}
                      </Button>
                    ) : (
                      <span
                        key={`${tok}-${idx}`}
                        className="px-1 text-muted-foreground"
                      >
                        …
                      </span>
                    )
                  )}
                </div>
                <Select
                  value={String(limit)}
                  onValueChange={(val) => {
                    const newLimit = parseInt(val, 10) || 20;
                    setLimit(newLimit);
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="w-[120px] bg-black/5 border-0 text-black">
                    <SelectValue placeholder={t('forms.rows')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10 {t('forms.perPage')}</SelectItem>
                    <SelectItem value="20">20 {t('forms.perPage')}</SelectItem>
                    <SelectItem value="50">50 {t('forms.perPage')}</SelectItem>
                    <SelectItem value="100">100 {t('forms.perPage')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <Dialog open={isPreviewMode} onOpenChange={setIsPreviewMode}>
            <DialogContent className="min-w-[600px]">
              <DialogHeader>
                <DialogTitle>{t('forms.formPreview')}</DialogTitle>
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
          <h3 className="text-lg mb-2">{t('forms.noFormsFound')}</h3>
          <p className="text-muted-foreground">
            {t('forms.tryAdjustingFilters')}
          </p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {t('forms.showing')} {displayedTemplates.length} {t('forms.of')} {totalCount} {t('forms.records')}
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            className="bg-[#E0F2FE] border-0 text-black"
          >
            <HelpCircle className="h-4 w-4 mr-2" />
            {t('forms.formTemplates')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="bg-[#E0F2FE] border-0 text-black"
          >
            <FileJson className="h-4 w-4 mr-2" />
            {t('forms.importJson')}
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
            <AlertDialogTitle>{t('forms.areYouSure')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('forms.deleteFormConfirmation')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>{t('forms.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? t('forms.deleting') : t('forms.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
