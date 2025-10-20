import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckSquare,
  ChevronDown,
  Eye,
  FileText,
  Grip,
  Hash,
  Loader2,
  Plus,
  Save,
  Settings,
  Trash,
  Type,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch } from "../../store";
import { useTranslation } from "../../hooks/useTranslation";
import {
  fetchFormById,
  selectCurrentForm,
} from "../../store/slices/formsSlice";
import {
  fetchProjects,
  selectAllProjects,
} from "../../store/slices/projectsSlice";
import {
  fetchSubProjectsByProjectId,
  selectAllSubprojects,
} from "../../store/slices/subProjectSlice";
import { selectCurrentUser } from "../../store/slices/authSlice";
import {
  fetchUserProjectsByUserId,
  selectUserProjectsTree,
} from "../../store/slices/userProjectsSlice";
import { Button } from "../ui/button/button";
import { Badge } from "../ui/data-display/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../ui/data-display/card";
import { Checkbox } from "../ui/form/checkbox";
import { Input } from "../ui/form/input";
import { Label } from "../ui/form/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/form/select";
import { Switch } from "../ui/form/switch";
import { Separator } from "../ui/layout/separator";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../ui/navigation/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/overlay/dialog";
import { FormField } from "./FormField";
import subProjectService from "../../services/subprojects/subprojectService";

// Field types available for forms - will be translated dynamically
const getFieldTypes = (t: any) => [
  { id: "text", name: t("forms.text"), icon: <Type className="h-4 w-4" /> },
  { id: "number", name: t("forms.number"), icon: <Hash className="h-4 w-4" /> },
  { id: "date", name: t("forms.date"), icon: <Calendar className="h-4 w-4" /> },
  {
    id: "checkbox",
    name: t("forms.checkbox"),
    icon: <CheckSquare className="h-4 w-4" />,
  },
  {
    id: "dropdown",
    name: t("forms.dropdown"),
    icon: <ChevronDown className="h-4 w-4" />,
  },
];
interface FormBuilderProps {
  formId?: string;
  onBack: () => void;
  onSave: (formData: any) => void;
  isSaving?: boolean;
  error?: string | null;
}

interface FormFieldOption {
  value: string;
  label: string;
}

export interface FormField {
  id: string;
  name: string;
  type: string;
  label: string;
  required?: boolean;
  placeholder?: string;
  helpText?: string;
  options?: FormFieldOption[];
  validations?: {
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
  };
}

export interface FormData {
  id: string;
  name: string;
  description: string;
  category: string;
  status: string;
  version: string;
  fields: FormField[];
  lastUpdated?: string;
  project?: string;
  subProject?: string;
}

export function FormBuilder({
  formId,
  onBack,
  onSave,
  isSaving = false,
  error,
}: FormBuilderProps) {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const projects = useSelector(selectAllProjects);
  const subProjects = useSelector(selectAllSubprojects);
  const formToEdit = useSelector(selectCurrentForm);
  const isEditing = !!formId;
  const user = useSelector(selectCurrentUser);
  const userProjectsTree = useSelector(selectUserProjectsTree as any) as any[];

  // Normalize roles and detect sys/super admin
  const normalizedRoles = (user?.roles || []).map(
    (r: any) => r.name?.toLowerCase?.() || ""
  );
  const isSysOrSuperAdmin = normalizedRoles.some(
    (r: string) =>
      r === "sysadmin" ||
      r === "superadmin" ||
      r.includes("system admin") ||
      r.includes("super admin")
  );

  const [formData, setFormData] = useState<FormData>({
    id: "",
    name: "",
    description: "",
    category: "",
    status: "draft",
    version: "0.1",
    fields: [],
  });

  // Role-aware: fetch either all projects (admin) or assigned projects (others)
  useEffect(() => {
    if (!user?.id) return;
    if (isSysOrSuperAdmin) {
      dispatch(fetchProjects());
    } else {
      dispatch(fetchUserProjectsByUserId(String(user.id)));
    }
  }, [dispatch, user?.id, isSysOrSuperAdmin]);

  useEffect(() => {
    if (formId) {
      dispatch(fetchFormById(formId));
    }
  }, [formId, dispatch]);

  useEffect(() => {
    if (formToEdit && formId) {
      const assoc = (formToEdit as any).entityAssociations?.[0] as
        | { entityId: string; entityType?: string }
        | undefined;
      const assocEntityId = assoc?.entityId || "";
      const assocEntityType = (assoc?.entityType || "project").toLowerCase();

      const fields = formToEdit.schema.fields.map((field, index) => ({
        id: `field-${Date.now()}-${index}`,
        name: field.name,
        label: field.label,
        type: field.type.toLowerCase(),
        placeholder: field.placeholder,
        helpText: field.helpText,
        validations: field.validations,
        required: field.required,
        options:
          field.options?.map((opt) => ({ value: opt, label: opt })) || [],
      }));

      // Set includeBeneficiaries state from the form data
      setIncludeBeneficiaries(formToEdit.includeBeneficiaries ?? true);

      if (assocEntityType === "subproject" && assocEntityId) {
        (async () => {
          try {
            const res = await subProjectService.getSubProjectById({
              id: assocEntityId,
            });
            const projectId =
              (res.success && (res.data as any)?.projectId) || "";
            setFormData({
              id: formToEdit.id,
              name: formToEdit.name,
              description: formToEdit.description || "",
              category: formToEdit.category || "",
              status: formToEdit.status || "draft",
              version: formToEdit.version || "0.1",
              fields: fields,
              project: projectId,
              subProject: assocEntityId,
            });
            if (projectId) {
              dispatch(fetchSubProjectsByProjectId({ projectId }));
            }
          } catch {
            // Fallback: set only subproject
            setFormData((prev) => ({ ...prev, subProject: assocEntityId }));
          }
        })();
      } else {
        const projectId = assocEntityId;
        setFormData({
          id: formToEdit.id,
          name: formToEdit.name,
          description: formToEdit.description || "",
          category: formToEdit.category || "",
          status: formToEdit.status || "draft",
          version: formToEdit.version || "0.1",
          fields: fields,
          project: projectId,
        });
        if (projectId) {
          dispatch(fetchSubProjectsByProjectId({ projectId }));
        }
      }
    }
  }, [formToEdit, formId]);

  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [isAddFieldDialogOpen, setIsAddFieldDialogOpen] = useState(false);
  const [showFormJson, setShowFormJson] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [includeBeneficiaries, setIncludeBeneficiaries] = useState(true);

  // Get translated field types
  const fieldTypes = getFieldTypes(t);

  // Build projects list for UI based on role
  const projectsForUi = isSysOrSuperAdmin
    ? projects
    : (userProjectsTree || []).map((p: any) => ({
        id: p.id,
        name: p.name,
        description: p.description || "",
        category: p.category || "",
        status: "active" as const,
        createdAt: p.createdAt || "",
        updatedAt: p.updatedAt || "",
      }));

  // Allowed subproject IDs for non-admin users under the selected project
  const allowedSubprojectIds = (() => {
    if (isSysOrSuperAdmin) return new Set<string>();
    try {
      const proj = (userProjectsTree || []).find(
        (p: any) => p.id === formData.project
      );
      const ids = (proj?.subprojects || []).map((sp: any) => sp.id);
      return new Set<string>(ids);
    } catch {
      return new Set<string>();
    }
  })();

  // Handle form field selection
  const handleFieldSelect = (fieldId: string) => {
    setSelectedField(fieldId);
  };

  // Add a new field to the form
  const handleAddField = (fieldType: string) => {
    const baseField: FormField = {
      name: `field-${Date.now()}`,
      id: `field-${Date.now()}`,
      type: fieldType,
      label: `New ${
        fieldType.charAt(0).toUpperCase() + fieldType.slice(1)
      } Field`,
      required: false,
    };

    // Add type-specific properties
    const fieldWithType: FormField = {
      ...baseField,
      ...(fieldType === "text" && { placeholder: "Enter text" }),
      ...(fieldType === "textarea" && { placeholder: "Enter longer text" }),
      ...(fieldType === "number" && { placeholder: "Enter number" }),
      ...(fieldType === "dropdown" && {
        options: [{ value: "option1", label: "Option 1" }],
      }),
    };

    setFormData((prev) => ({
      ...prev,
      fields: [...prev.fields, fieldWithType],
    }));

    setSelectedField(fieldWithType.id);
    setIsAddFieldDialogOpen(false);
  };

  // Update field properties
  const handleFieldUpdate = (fieldId: string, updates: Partial<FormField>) => {
    setFormData((prev) => ({
      ...prev,
      fields: prev.fields.map((field) =>
        field.id === fieldId ? { ...field, ...updates } : field
      ),
    }));
  };

  // Delete a field
  const handleDeleteField = (fieldId: string) => {
    setFormData((prev) => ({
      ...prev,
      fields: prev.fields.filter((field) => field.id !== fieldId),
    }));

    if (selectedField === fieldId) {
      setSelectedField(null);
    }
  };

  // Save the form
  const handleSaveForm = () => {
    const fields = Array.isArray(formData.fields) ? formData.fields : [];

    const formattedData = {
      name: formData.name,
      entities: [
        {
          id: formData.subProject ? formData.subProject : formData.project,
          type: formData.subProject ? "subproject" : "project",
        },
      ],
      schema: {
        fields:
          fields.length > 0
            ? fields.map((field) => ({
                name: field.name || "field",
                label: field.label || "Field",
                type: field.type
                  ? field.type.charAt(0).toUpperCase() + field.type.slice(1)
                  : "Text",
                placeholder: field.placeholder,
                required: field.required || false,
                helpText: field.helpText,
                validations: field.validations,
                options:
                  field.type === "dropdown"
                    ? field.options?.map((opt) => opt.value) || []
                    : [],
              }))
            : [
                // Default field if no fields are added
                {
                  name: "field1",
                  label: "Field 1",
                  type: "Text",
                  required: true,
                  options: [],
                },
              ],
      },
      includeBeneficiaries: includeBeneficiaries,
    };

    onSave(formattedData);
  };

  // Get the selected field data
  const selectedFieldData = formData.fields.find(
    (field) => field.id === selectedField
  );

  const handleChangeProject = (projectId: string) => {
    setFormData({ ...formData, project: projectId, subProject: "" });

    if (projectId) {
      dispatch(fetchSubProjectsByProjectId({ projectId }));
    }
  };

  const handleChangeSubProject = (subProjectId: string) => {
    setFormData({ ...formData, subProject: subProjectId });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3">
        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto flex-wrap">
          <Button
            variant="outline"
            className="bg-[#E0F2FE] border-0 transition-transform duration-200 ease-in-out hover:scale-105 hover:-translate-y-[1px] w-full sm:w-auto"
            size="sm"
            onClick={onBack}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            {t("forms.backToForms")}
          </Button>
          <h2 className="flex-1 sm:flex-none min-w-0 truncate">
            {isEditing ? t("forms.editFormTitle") : t("forms.createFormTitle")}:{" "}
            {formData.name}
          </h2>
          {isEditing && <Badge variant="outline">v{formData.version}</Badge>}
        </div>
        <div className="flex gap-2 w-full sm:w-auto justify-between sm:justify-end flex-wrap">
          <Button
            className="bg-[#E0F2FE] border-0 transition-transform duration-200 ease-in-out hover:scale-105 hover:-translate-y-[1px] w-full sm:w-auto"
            variant="outline"
            onClick={() => setPreviewMode(!previewMode)}
          >
            <Eye className="h-4 w-4 mr-2" />
            {previewMode ? t("forms.exitPreview") : t("forms.preview")}
          </Button>
          <Button
            className="bg-[#0073e6] text-white border-0 transition-transform duration-200 ease-in-out hover:scale-105 hover:-translate-y-[1px] w-full sm:w-auto"
            onClick={handleSaveForm}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("forms.saving")}
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {t("forms.saveForm")}
              </>
            )}
          </Button>
        </div>
      </div>

      {!previewMode ? (
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-8">
            <Card className="mb-6 bg-[#F7F9FB] border-0   drop-shadow-sm shadow-gray-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">
                  {t("forms.formBuilder")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="form-name">
                        {t("forms.formNameRequired")}
                      </Label>
                      <Input
                        className="bg-white border-gray-100 border"
                        id="form-name"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="form-project">
                        {t("forms.projectRequired")}
                      </Label>
                      <Select
                        value={formData.project}
                        onValueChange={handleChangeProject}
                      >
                        <SelectTrigger className="bg-white border-gray-100 border">
                          <SelectValue placeholder={t("forms.selectProject")} />
                        </SelectTrigger>
                        <SelectContent>
                          {projectsForUi.map((project) => (
                            <SelectItem key={project.id} value={project.id}>
                              {project.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {formData.project && (
                      <>
                        <div className="hidden md:block"></div>

                        <div className="space-y-2">
                          <Label htmlFor="form-project">
                            {t("forms.subProject")}
                          </Label>
                          <Select
                            value={formData.subProject}
                            onValueChange={handleChangeSubProject}
                          >
                            <SelectTrigger className="bg-white border-gray-100 border">
                              <SelectValue
                                placeholder={t("forms.selectASubproject")}
                              />
                            </SelectTrigger>
                            <SelectContent>
                              {subProjects
                                .filter(
                                  (sp) => sp.projectId === formData.project
                                )
                                .filter((sp) =>
                                  isSysOrSuperAdmin
                                    ? true
                                    : allowedSubprojectIds.size === 0
                                    ? false
                                    : allowedSubprojectIds.has(sp.id)
                                )
                                .map((subProject) => (
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
                      </>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <Label>{t("forms.includeBeneficiaries")}</Label>
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={includeBeneficiaries}
                        onCheckedChange={setIncludeBeneficiaries}
                        aria-label={t("forms.includeBeneficiaries")}
                      />
                      <span className="text-sm text-muted-foreground">
                        {includeBeneficiaries
                          ? t("forms.enabled")
                          : t("forms.disabled")}
                      </span>
                    </div>
                  </div>
                  {/* <div className="space-y-2">
                    <Label htmlFor="form-description">Description</Label>
                    <Textarea
                      className="bg-[#EAF4FB] border-0"
                      id="form-description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      rows={2}
                    />
                  </div> */}
                </div>
              </CardContent>
            </Card>

            <Card className="mb-6 bg-[#F7F9FB] border-0   drop-shadow-sm shadow-gray-50">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-base">
                  {t("forms.formFields")}
                </CardTitle>
                <Dialog
                  open={isAddFieldDialogOpen}
                  onOpenChange={setIsAddFieldDialogOpen}
                >
                  <DialogTrigger asChild>
                    {/* <Button size="sm" className="bg-[#E0F2FE] border-0">
                      <Plus className="h-4 w-4 mr-2" />
                      {t('forms.addField')}
                    </Button> */}
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>{t("forms.addField")}</DialogTitle>
                      <DialogDescription>
                        {t("forms.selectFieldType")}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-3 py-4">
                      {fieldTypes.map((fieldType) => (
                        <Button
                          key={fieldType.id}
                          variant="outline"
                          className="justify-start h-auto py-3"
                          onClick={() => handleAddField(fieldType.id)}
                        >
                          <div className="mr-2">{fieldType.icon}</div>
                          <span className="">{fieldType.name}</span>
                        </Button>
                      ))}
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {formData.fields.length === 0 ? (
                  <div className="text-center  py-8 border bg-[#E3F5FF] border-dashed rounded-md">
                    <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                    <h3 className="text-lg mb-2">{t("forms.noFieldsYet")}</h3>
                    <p className="text-muted-foreground mb-4">
                      {t("forms.startBuildingForm")}
                    </p>
                    <Button
                      onClick={() => setIsAddFieldDialogOpen(true)}
                      className="bg-[#E0F2FE] border-0"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      {t("forms.addFirstField")}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {formData.fields.map((field) => (
                      <div
                        key={field.id}
                        className={` bg-[#E3F5FF] rounded-md p-3 flex items-center gap-3 cursor-pointer ${
                          selectedField === field.id
                            ? "border-primary bg-muted/30"
                            : ""
                        }`}
                        onClick={() => handleFieldSelect(field.id)}
                      >
                        <Grip className="h-5 w-5 text-muted-foreground cursor-grab" />
                        <div className="flex-1">
                          <div className="font-medium">{field.label}</div>
                          <div className="text-sm text-muted-foreground flex items-center gap-2">
                            {fieldTypes.find((f) => f.id === field.type)?.icon}
                            <span className="capitalize">{field.type}</span>
                            {field.required && (
                              <Badge
                                variant="outline"
                                className="text-destructive border-destructive ml-2"
                              >
                                {t("forms.requiredBadge")}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteField(field.id);
                          }}
                        >
                          <Trash className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      className="w-full border-dashed  bg-[#E0F2FE]"
                      onClick={() => setIsAddFieldDialogOpen(true)}
                    >
                      <Plus className="h-4 w-4 mr-2 " />
                      {t("forms.addField")}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="col-span-12 lg:col-span-4">
            <div className="sticky top-6">
              <Tabs defaultValue="properties" className="w-full">
                <TabsList className="grid w-full grid-cols-1 bg-[#EAF4FB]">
                  <TabsTrigger
                    value="properties"
                    className="data-[state=active]:bg-[#0073e6]  data-[state=active]:text-white"
                  >
                    {t("forms.fieldProperties")}
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="properties">
                  <Card className=" bg-[#F7F9FB] border-0   drop-shadow-sm shadow-gray-50">
                    <CardContent className="p-6">
                      {selectedFieldData ? (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="field-label">
                              {t("forms.fieldLabelInput")}
                            </Label>
                            <Input
                              className="bg-white border-gray-100 border"
                              id="field-label"
                              value={selectedFieldData.label}
                              onChange={(e) =>
                                handleFieldUpdate(selectedField!, {
                                  label: e.target.value,
                                })
                              }
                            />
                          </div>

                          {selectedFieldData?.type !== "checkbox" && (
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id="field-required"
                                  checked={selectedFieldData.required}
                                  onCheckedChange={(checked: any) =>
                                    handleFieldUpdate(selectedField!, {
                                      required: !!checked,
                                    })
                                  }
                                />
                                <Label htmlFor="field-required">
                                  {t("forms.requiredField")}
                                </Label>
                              </div>
                            </div>
                          )}

                          {selectedFieldData?.type === "dropdown" && (
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <Label>{t("forms.options")}</Label>
                                <Button
                                  className="hover:bg-[#E0F2FE]"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    const newOption = {
                                      value: `option${
                                        (selectedFieldData.options?.length ||
                                          0) + 1
                                      }`,
                                      label: `Option ${
                                        (selectedFieldData.options?.length ||
                                          0) + 1
                                      }`,
                                    };
                                    handleFieldUpdate(selectedField!, {
                                      options: [
                                        ...(selectedFieldData.options || []),
                                        newOption,
                                      ],
                                    });
                                  }}
                                >
                                  <Plus className="h-4 w-4 mr-1" />
                                  {t("forms.addOption")}
                                </Button>
                              </div>
                              <div className="space-y-2 border rounded-md p-3">
                                {selectedFieldData.options?.map(
                                  (option, index) => (
                                    <div
                                      key={index}
                                      className="flex items-center gap-2"
                                    >
                                      <Input
                                        value={option.label}
                                        onChange={(e) => {
                                          const updatedOptions = [
                                            ...(selectedFieldData.options ||
                                              []),
                                          ];
                                          updatedOptions[index] = {
                                            ...updatedOptions[index],
                                            label: e.target.value,
                                            value: e.target.value
                                              .toLowerCase()
                                              .replace(/\s+/g, "-"),
                                          };
                                          handleFieldUpdate(selectedField!, {
                                            options: updatedOptions,
                                          });
                                        }}
                                      />
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                          const updatedOptions = [
                                            ...(selectedFieldData.options ||
                                              []),
                                          ];
                                          updatedOptions.splice(index, 1);
                                          handleFieldUpdate(selectedField!, {
                                            options: updatedOptions,
                                          });
                                        }}
                                      >
                                        <X className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          )}

                          <Separator />

                          <div className="pt-2">
                            <Button
                              variant="outline"
                              className="w-full bg-[#E0F2FE] border-0 "
                              size="sm"
                              onClick={() => handleDeleteField(selectedField!)}
                            >
                              <Trash className="h-4 w-4 mr-2" />
                              {t("forms.deleteField")}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-6">
                          <Settings className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                          <h3 className="text-lg mb-2">
                            {t("forms.noFieldSelected")}
                          </h3>
                          <p className="text-muted-foreground mb-4">
                            {t("forms.selectFieldToEdit")}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      ) : (
        <Card className="bg-[#F7F9FB] border-0">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>{formData.name}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {formData.description}
              </p>
            </div>
            <Button
              className="bg-[#E0F2FE] border-0"
              variant="outline"
              onClick={() => setPreviewMode(false)}
            >
              {t("forms.editFormMode")}
            </Button>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-6 max-w-3xl mx-auto">
              {formData.fields.map((field) => (
                <FormField key={field.id} field={field} />
              ))}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" className="bg-[#E0F2FE] border-0">
                  {t("forms.cancel")}
                </Button>
                <Button className="bg-[#0073e6] text-white">
                  {t("forms.submitForm")}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  {
    error && (
      <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md">
        <AlertCircle className="h-4 w-4 inline mr-2" />
        {error}
      </div>
    );
  }
}
