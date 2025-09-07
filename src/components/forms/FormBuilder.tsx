import {
  AlignLeft,
  ArrowLeft,
  Calendar,
  CheckSquare,
  ChevronDown,
  Eye,
  FileText,
  Grip,
  Hash,
  ListChecks,
  Plus,
  Radio,
  Save,
  Settings,
  ToggleLeft,
  Trash,
  Type,
  Upload,
  X,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "../ui/data-display/badge";
import { Button } from "../ui/button/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../ui/data-display/card";
import { Checkbox } from "../ui/form/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/overlay/dialog";
import { Input } from "../ui/form/input";
import { Label } from "../ui/form/label";
import { ScrollArea } from "../ui/layout/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/form/select";
import { Separator } from "../ui/layout/separator";
import { Switch } from "../ui/form/switch";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../ui/navigation/tabs";
import { Textarea } from "../ui/form/textarea";
import { FormField } from "./FormField";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch } from "../../store";
import {
  fetchProjects,
  selectAllProjects,
} from "../../store/slices/projectsSlice";
import { fetchSubProjectsByProjectId, selectAllSubprojects } from "../../store/slices/subProjectSlice";

// Field types available for forms
const fieldTypes = [
  { id: "text", name: "Text", icon: <Type className="h-4 w-4" /> },
  {
    id: "textarea",
    name: "Text Area",
    icon: <AlignLeft className="h-4 w-4" />,
  },
  { id: "number", name: "Number", icon: <Hash className="h-4 w-4" /> },
  { id: "date", name: "Date", icon: <Calendar className="h-4 w-4" /> },
  {
    id: "checkbox",
    name: "Checkbox",
    icon: <CheckSquare className="h-4 w-4" />,
  },
  { id: "radio", name: "Radio Group", icon: <Radio className="h-4 w-4" /> },
  {
    id: "dropdown",
    name: "Dropdown",
    icon: <ChevronDown className="h-4 w-4" />,
  },
  {
    id: "multiselect",
    name: "Multi-Select",
    icon: <ListChecks className="h-4 w-4" />,
  },
  { id: "file", name: "File Upload", icon: <Upload className="h-4 w-4" /> },
  { id: "boolean", name: "Yes/No", icon: <ToggleLeft className="h-4 w-4" /> },
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

interface FormField {
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

interface FormData {
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
  const dispatch = useDispatch<AppDispatch>();
  const projects = useSelector(selectAllProjects);
  // const subProjects = useSelector(selectAllSubProjects);
  const subProjects = useSelector(selectAllSubprojects);


  // Fetch projects when component mounts
  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch]);

  // If formId is provided, we're editing an existing form, otherwise creating a new one
  const isEditing = !!formId;

  // For a real app, we would fetch the form template data based on formId
  // For this demo, we're using mock data
  const [formData, setFormData] = useState<FormData>(
    isEditing
      ? {
          id: "123",
          name: "",
          description: "",
          category: "",
          status: "draft",
          version: "0.2222",
          fields: [],
        }
      : {
          id: "",
          name: "",
          description: "",
          category: "",
          status: "draft",
          version: "0.1",
          fields: [],
        }
  );

  console.log(formData);

  // const [activeTab, setActiveTab] = useState("builder");
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [isAddFieldDialogOpen, setIsAddFieldDialogOpen] = useState(false);
  const [showFormJson, setShowFormJson] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  // const dispatch = useDispatch<AppDispatch>();

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
      ...((fieldType === "dropdown" ||
        fieldType === "radio" ||
        fieldType === "checkbox") && {
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

    // Format the form data to match the required API structure
    const formattedData = {
      name: formData.name,
      entities: [
        {
          id: formData.subProject ? formData.subProject : formData.project,
          type: "project",
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
                required: field.required || false,
                options: field.options?.map((opt) => opt.value) || [],
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
    };

    onSave(formattedData);
  };

  // Get the selected field data
  const selectedFieldData = formData.fields.find(
    (field) => field.id === selectedField
  );

  const handleChangeProject = (projectId: string) => {
    setFormData({ ...formData, project: projectId, subProject: '' });

    if (projectId) {
      dispatch(fetchSubProjectsByProjectId({ projectId }));
    }
  };

  const handleChangeSubProject = (subProjectId: string) => {
    setFormData({ ...formData, subProject: subProjectId });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Forms
          </Button>
          <h2>
            {isEditing ? "Edit Form" : "Create Form"}: {formData.name}
          </h2>
          {isEditing && <Badge variant="outline">v{formData.version}</Badge>}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setPreviewMode(!previewMode)}
          >
            <Eye className="h-4 w-4 mr-2" />
            {previewMode ? "Exit Preview" : "Preview"}
          </Button>
          <Button onClick={handleSaveForm} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Form
              </>
            )}
          </Button>
        </div>
      </div>

      {!previewMode ? (
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-8">
            <Card className="mb-6">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Form Builder</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="form-name">Form Name *</Label>
                      <Input
                        id="form-name"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="form-project">Project *</Label>
                      <Select
                        value={formData.project}
                        onValueChange={handleChangeProject}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a project" />
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

                    {formData.project && (
                      <>
                        <div className="space-y-2"></div>

                        <div className="space-y-2">
                          <Label htmlFor="form-project">Sub Project</Label>
                          <Select
                            value={formData.subProject}
                            onValueChange={handleChangeSubProject}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select a subproject" />
                            </SelectTrigger>
                            <SelectContent>
                              {subProjects.map((subProject) => (
                                <SelectItem key={subProject.id} value={subProject.id}>
                                  {subProject.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="form-description">Description</Label>
                    <Textarea
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
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-base">Form Fields</CardTitle>
                <Dialog
                  open={isAddFieldDialogOpen}
                  onOpenChange={setIsAddFieldDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Field
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Add Field</DialogTitle>
                      <DialogDescription>
                        Select a field type to add to your form.
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
                          <span>{fieldType.name}</span>
                        </Button>
                      ))}
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {formData.fields.length === 0 ? (
                  <div className="text-center py-8 border border-dashed rounded-md">
                    <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                    <h3 className="text-lg mb-2">No fields added yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Start building your form by adding fields
                    </p>
                    <Button onClick={() => setIsAddFieldDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Field
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {formData.fields.map((field) => (
                      <div
                        key={field.id}
                        className={`border rounded-md p-3 flex items-center gap-3 cursor-pointer ${
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
                                Required
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
                      className="w-full border-dashed"
                      onClick={() => setIsAddFieldDialogOpen(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Field
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="col-span-12 lg:col-span-4">
            <div className="sticky top-6">
              <Tabs defaultValue="properties" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="properties">Field Properties</TabsTrigger>
                  <TabsTrigger value="form-settings">Form Settings</TabsTrigger>
                </TabsList>
                <TabsContent value="properties">
                  <Card>
                    <CardContent className="p-6">
                      {selectedFieldData ? (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="field-label">Field Label</Label>
                            <Input
                              id="field-label"
                              value={selectedFieldData.label}
                              onChange={(e) =>
                                handleFieldUpdate(selectedField!, {
                                  label: e.target.value,
                                })
                              }
                            />
                          </div>

                          {(selectedFieldData.type === "text" ||
                            selectedFieldData.type === "textarea" ||
                            selectedFieldData.type === "number") && (
                            <div className="space-y-2">
                              <Label htmlFor="field-placeholder">
                                Placeholder
                              </Label>
                              <Input
                                id="field-placeholder"
                                value={selectedFieldData.placeholder || ""}
                                onChange={(e) =>
                                  handleFieldUpdate(selectedField!, {
                                    placeholder: e.target.value,
                                  })
                                }
                              />
                            </div>
                          )}

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
                                Required Field
                              </Label>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="field-help-text">Help Text</Label>
                            <Textarea
                              id="field-help-text"
                              value={selectedFieldData.helpText || ""}
                              onChange={(e) =>
                                handleFieldUpdate(selectedField!, {
                                  helpText: e.target.value,
                                })
                              }
                              placeholder="Add helpful information for this field"
                              rows={2}
                            />
                          </div>
                          {(selectedFieldData?.type === "dropdown" ||
                            selectedFieldData?.type === "radio" ||
                            selectedFieldData?.type === "checkbox") && (
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <Label>Options</Label>
                                <Button
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
                                  Add Option
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

                          {selectedFieldData.type === "number" && (
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="field-min">Min Value</Label>
                                <Input
                                  id="field-min"
                                  type="number"
                                  value={
                                    selectedFieldData.validations?.min || ""
                                  }
                                  onChange={(e) => {
                                    const validations =
                                      selectedFieldData.validations || {};
                                    handleFieldUpdate(selectedField!, {
                                      validations: {
                                        ...validations,
                                        min: e.target.value
                                          ? Number(e.target.value)
                                          : undefined,
                                      },
                                    });
                                  }}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="field-max">Max Value</Label>
                                <Input
                                  id="field-max"
                                  type="number"
                                  value={
                                    selectedFieldData.validations?.max || ""
                                  }
                                  onChange={(e) => {
                                    const validations =
                                      selectedFieldData.validations || {};
                                    handleFieldUpdate(selectedField!, {
                                      validations: {
                                        ...validations,
                                        max: e.target.value
                                          ? Number(e.target.value)
                                          : undefined,
                                      },
                                    });
                                  }}
                                />
                              </div>
                            </div>
                          )}

                          {(selectedFieldData.type === "text" ||
                            selectedFieldData.type === "textarea") && (
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="field-min-length">
                                  Min Length
                                </Label>
                                <Input
                                  id="field-min-length"
                                  type="number"
                                  value={
                                    selectedFieldData.validations?.minLength ||
                                    ""
                                  }
                                  onChange={(e) => {
                                    const validations =
                                      selectedFieldData.validations || {};
                                    handleFieldUpdate(selectedField!, {
                                      validations: {
                                        ...validations,
                                        minLength: e.target.value
                                          ? Number(e.target.value)
                                          : undefined,
                                      },
                                    });
                                  }}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="field-max-length">
                                  Max Length
                                </Label>
                                <Input
                                  id="field-max-length"
                                  type="number"
                                  value={
                                    selectedFieldData.validations?.maxLength ||
                                    ""
                                  }
                                  onChange={(e) => {
                                    const validations =
                                      selectedFieldData.validations || {};
                                    handleFieldUpdate(selectedField!, {
                                      validations: {
                                        ...validations,
                                        maxLength: e.target.value
                                          ? Number(e.target.value)
                                          : undefined,
                                      },
                                    });
                                  }}
                                />
                              </div>
                            </div>
                          )}

                          <Separator />

                          <div className="pt-2">
                            <Button
                              variant="outline"
                              className="w-full"
                              size="sm"
                              onClick={() => handleDeleteField(selectedField!)}
                            >
                              <Trash className="h-4 w-4 mr-2" />
                              Delete Field
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-6">
                          <Settings className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                          <h3 className="text-lg mb-2">No Field Selected</h3>
                          <p className="text-muted-foreground mb-4">
                            Select a field to edit its properties
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="form-settings">
                  <Card>
                    <CardContent className="p-6 space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="form-status">Form Status</Label>
                        <Select
                          value={formData.status}
                          onValueChange={(value: any) =>
                            setFormData({ ...formData, status: value })
                          }
                        >
                          <SelectTrigger id="form-status">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="archived">Archived</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Associated Projects</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a project" />
                          </SelectTrigger>
                          <SelectContent>
                            {/* {mockProjects.map((project) => (
                              <SelectItem key={project.id} value={project.id}>
                                {project.title}
                              </SelectItem>
                            ))} */}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Associated Sub-Projects</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a sub-project" />
                          </SelectTrigger>
                          <SelectContent>
                            {/* {mockProjects.flatMap((project) =>
                              project.subProjects.map((subProject) => (
                                <SelectItem
                                  key={subProject.id}
                                  value={subProject.id}
                                >
                                  {subProject.title} ({project.title})
                                </SelectItem>
                              ))
                            )} */}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="version-control">
                            Version Control
                          </Label>
                          <div className="flex items-center space-x-2">
                            <Label
                              htmlFor="version-control"
                              className="text-muted-foreground text-sm"
                            >
                              Enabled
                            </Label>
                            <Switch id="version-control" />
                          </div>
                        </div>
                        {isEditing && (
                          <div className="border rounded-md p-3 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Current Version</span>
                              <Badge variant="outline">
                                v{formData.version}
                              </Badge>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Create New Version
                            </Button>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2 pt-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="show-json">Show Form JSON</Label>
                          <Switch
                            id="show-json"
                            checked={showFormJson}
                            onCheckedChange={setShowFormJson}
                          />
                        </div>

                        {showFormJson && (
                          <ScrollArea className="h-[200px] w-full rounded-md border p-4">
                            <pre className="text-xs font-mono">
                              {JSON.stringify(formData, null, 2)}
                            </pre>
                          </ScrollArea>
                        )}
                      </div>

                      <div className="pt-2">
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={handleSaveForm}
                        >
                          <Save className="h-4 w-4 mr-2" />
                          Save Form
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      ) : (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>{formData.name}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {formData.description}
              </p>
            </div>
            <Button variant="outline" onClick={() => setPreviewMode(false)}>
              {/* <Edit className="h-4 w-4 mr-2" /> */}
              Edit Form
            </Button>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-6 max-w-3xl mx-auto">
              {formData.fields.map((field) => (
                <FormField key={field.id} field={field} />
              ))}

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline">Cancel</Button>
                <Button>Submit Form</Button>
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
