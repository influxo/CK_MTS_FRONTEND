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
} from "lucide-react";
import { useState } from "react";
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
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../store";
import { createForm } from "../../store/slices/formsSlice";

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

// Mock form template for editing
const mockFormTemplate = {
  id: "form-001",
  name: "Maternal Health Assessmentaa",
  description: "Assessment form for pregnant women and new mothers",
  category: "health",
  lastUpdated: "2025-05-10T14:30:00",
  status: "active",
  version: "1.2",
  createdBy: "Jane Smith",
  associatedProjects: ["Rural Healthcare Initiative"],
  associatedSubProjects: ["Maternal Health Services"],
  fields: [
    {
      id: "field-001",
      type: "text",
      label: "Full Name",
      placeholder: "Enter full name",
      required: true,
      helpText:
        "Enter the beneficiary's full name as it appears on ID documents",
      validations: { minLength: 2, maxLength: 100 },
    },
    {
      id: "field-002",
      type: "radio",
      label: "Pregnancy Status",
      required: true,
      options: [
        { value: "pregnant", label: "Currently Pregnant" },
        { value: "postpartum", label: "Postpartum (within 42 days)" },
        { value: "not_pregnant", label: "Not Pregnant" },
      ],
      helpText: "Select the current pregnancy status",
    },
    {
      id: "field-003",
      type: "number",
      label: "Age",
      placeholder: "Enter age",
      required: true,
      validations: { min: 12, max: 65 },
    },
    {
      id: "field-004",
      type: "date",
      label: "Date of Last Visit",
      required: false,
      helpText: "If this is the first visit, leave blank",
    },
    {
      id: "field-005",
      type: "checkbox",
      label: "Symptoms",
      required: false,
      options: [
        { value: "fever", label: "Fever" },
        { value: "headache", label: "Headache" },
        { value: "nausea", label: "Nausea/Vomiting" },
        { value: "fatigue", label: "Fatigue" },
        { value: "abdominal_pain", label: "Abdominal Pain" },
      ],
      helpText: "Select all symptoms that apply",
    },
    {
      id: "field-006",
      type: "dropdown",
      label: "Number of Previous Pregnancies",
      required: true,
      options: [
        { value: "0", label: "0 (First pregnancy)" },
        { value: "1", label: "1" },
        { value: "2", label: "2" },
        { value: "3", label: "3" },
        { value: "4", label: "4" },
        { value: "5_plus", label: "5 or more" },
      ],
    },
    {
      id: "field-007",
      type: "textarea",
      label: "Additional Notes",
      placeholder: "Enter any additional information",
      required: false,
      validations: { maxLength: 1000 },
    },
  ],
};

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

interface FormBuilderProps {
  formId?: string;
  onBack: () => void;
  onSave: (formData: any) => void;
}
interface FormFieldOption {
  value: string;
  label: string;
}

interface FormField {
  id: string;
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
  // Add other field properties as needed
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
  // Add other form properties as needed
}

export function FormBuilder({ formId, onBack, onSave }: FormBuilderProps) {
  // If formId is provided, we're editing an existing form, otherwise creating a new one
  const isEditing = !!formId;

  // For a real app, we would fetch the form template data based on formId
  // For this demo, we're using mock data
  const [formData, setFormData] = useState<FormData>(
    isEditing
      ? mockFormTemplate
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

  // const [activeTab, setActiveTab] = useState("builder");
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [isAddFieldDialogOpen, setIsAddFieldDialogOpen] = useState(false);
  const [showFormJson, setShowFormJson] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const dispatch = useDispatch<AppDispatch>();

  // Handle form field selection
  const handleFieldSelect = (fieldId: string) => {
    setSelectedField(fieldId);
  };

  // Add a new field to the form
  const handleAddField = (fieldType: string) => {
    const baseField: FormField = {
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
    // Update last updated timestamp
    const updatedForm = {
      ...formData,
      lastUpdated: new Date().toISOString(),
      entities: [
        {
          id: "68c87ec2-2dd2-4914-8ce9-76a7f308b527",
          type: "project"
        }
      ],
      schema: {
        fields: [
          {
            name: "string",
            label: "string",
            type: "Text",
            required: true,
            options: [
              "string"
            ]
          }
        ]
      }
    };

    // Call the parent's save handler
    // onSave(updatedForm);
    // console.log(updatedForm);
    const test = dispatch(createForm(updatedForm));

    console.log(test);
    console.log('ttt');
  };

  // Get the selected field data
  const selectedFieldData = formData.fields.find(
    (field) => field.id === selectedField
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between ">
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
        <div className="flex gap-2 ">
          <Button
            className="bg-[#2E343E] text-white"
            variant="outline"
            onClick={() => setPreviewMode(!previewMode)}
          >
            <Eye className="h-4 w-4 mr-2" />
            {previewMode ? "Exit Preview" : "Preview"}
          </Button>
          <Button className="bg-[#2E343E] text-white" onClick={handleSaveForm}>
            <Save className="h-4 w-4 mr-2" />
            Save Form
          </Button>
        </div>
      </div>

      {!previewMode ? (
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-8">
            <Card className="mb-6 bg-[#F7F9FB] border-0 drop-shadow-sm shadow-gray-50">
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
                        className="bg-black/5 border-0"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="form-category">Category *</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value: any) =>
                          setFormData({ ...formData, category: value })
                        }
                      >
                        <SelectTrigger className="bg-black/5 border-0">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="health">Health</SelectItem>
                          <SelectItem value="agriculture">
                            Agriculture
                          </SelectItem>
                          <SelectItem value="wash">
                            Water & Sanitation
                          </SelectItem>
                          <SelectItem value="education">Education</SelectItem>
                          <SelectItem value="training">Training</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="form-description">Description</Label>
                    <Textarea
                      className="bg-black/5 border-0"
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

            <Card className="mb-6 bg-[#F7F9FB] border-0 drop-shadow-sm shadow-gray-50">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-base">Form Fields</CardTitle>
                <Dialog
                  open={isAddFieldDialogOpen}
                  onOpenChange={setIsAddFieldDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button size="sm" className="bg-[#2E343E] text-white">
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
                        className={` rounded-md p-3 flex items-center gap-3 bg-[#E3F5FF] cursor-pointer ${
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
                          className="h-8 w-8 p-0 "
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
                      className="w-full border-dashed bg-[#E5ECF6] "
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
                <TabsList className="grid w-full grid-cols-2 bg-black/5">
                  <TabsTrigger
                    value="properties"
                    className="data-[state=active]:bg-[#2E343E] data-[state=active]:text-white"
                  >
                    Field Properties
                  </TabsTrigger>
                  <TabsTrigger
                    value="form-settings"
                    className="data-[state=active]:bg-[#2E343E] data-[state=active]:text-white"
                  >
                    Form Settings
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="properties">
                  <Card className="bg-[#F7F9FB] border-0 drop-shadow-sm shadow-gray-50 ">
                    <CardContent className="p-6">
                      {selectedFieldData ? (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="field-label">Field Label</Label>
                            <Input
                              id="field-label"
                              className="bg-black/5 border-0"
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
                                className="bg-black/5 border-0"
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
                                className="bg-white"
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
                              className="bg-black/5 border-0"
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
                                      className="flex items-center gap-2 bg-black/5 border-0"
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
                                  className="bg-black/5 border-0"
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
                                  className="bg-black/5 border-0"
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
                                  className="bg-black/5 border-0"
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
                                  className="bg-black/5 border-0"
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
                              className="w-full bg-[#2E343E] text-white border-0"
                              size="sm"
                              onClick={() => handleDeleteField(selectedField!)}
                            >
                              <Trash className="h-4 w-4 mr-2 " />
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
                  <Card className="bg-[#F7F9FB] border-0">
                    <CardContent className="p-6 space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="form-status">Form Status</Label>
                        <Select
                          value={formData.status}
                          onValueChange={(value: any) =>
                            setFormData({ ...formData, status: value })
                          }
                        >
                          <SelectTrigger
                            id="form-status"
                            className="bg-black/5 border-0"
                          >
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
                          <SelectTrigger
                            className="bg-black/5 border-0"
                            id="form-project"
                          >
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

                      <div className="space-y-2">
                        <Label>Associated Sub-Projects</Label>
                        <Select>
                          <SelectTrigger
                            className="bg-black/5 border-0"
                            id="form-sub-project"
                          >
                            <SelectValue placeholder="Select a sub-project" />
                          </SelectTrigger>
                          <SelectContent>
                            {mockProjects.flatMap((project) =>
                              project.subProjects.map((subProject) => (
                                <SelectItem
                                  key={subProject.id}
                                  value={subProject.id}
                                >
                                  {subProject.title} ({project.title})
                                </SelectItem>
                              ))
                            )}
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
                              className="text-muted-foreground text-sm text-black  bg-black/10 black px-2 py-1 rounded "
                            >
                              Enabled
                            </Label>
                            <Switch id="version-control" />
                          </div>
                        </div>
                        {isEditing && (
                          <div className="border rounded-md p-3 space-y-2 bg-[#E5ECF6]">
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Current Version</span>
                              <Badge
                                variant="outline"
                                className="bg-[#2E343E] text-white"
                              >
                                v{formData.version}
                              </Badge>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full bg-black/10 text-black border-0"
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
                          className="w-full bg-[#2E343E] text-white border-gray-50"
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
}
