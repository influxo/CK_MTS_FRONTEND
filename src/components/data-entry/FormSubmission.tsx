import { useState, useEffect } from "react";
import { Button } from "../ui/button/button";
import { Card, CardContent, CardHeader } from "../ui/data-display/card";
import { Input } from "../ui/form/input";
import { Textarea } from "../ui/form/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/form/select";
import { Checkbox } from "../ui/form/checkbox";
import { RadioGroup, RadioGroupItem } from "../ui/form/radio-group";
import { Label } from "../ui/form/label";
import { Badge } from "../ui/data-display/badge";

import {
  ArrowLeft,
  Save,
  Send,
  Clock,
  AlertCircle,
  Target,
} from "lucide-react";
import { Progress } from "../ui/feedback/progress";
import { Alert, AlertDescription } from "../ui/feedback/alert";

interface FormSubmissionProps {
  subProjectId: string;
  formId: string;
  activityId?: string | null;
  onBack: () => void;
  onSubmissionComplete: () => void;
}

// Mock subproject and activity details
const subProjectDetails = {
  "sub-001": { name: "Community Health Screening", projectName: "Active" },
  "sub-002": { name: "Mobile Health Services", projectName: "Cares" },
  "sub-003": { name: "Legal Support Services", projectName: "MyRight" },
};

const activityDetails = {
  "act-001": { title: "Weekly Health Screening - Pristina Center" },
  "act-002": { title: "Mobile Health Unit - Rural Areas" },
  "act-003": { title: "Elder Care Home Visits" },
  "act-004": { title: "Legal Rights Workshop Series" },
};

// Mock form structures
const formStructures = {
  "form-001": {
    id: "form-001",
    title: "Community Health Assessment",
    estimatedTime: "15 minutes",
    fields: [
      {
        id: "beneficiary_id",
        type: "text",
        label: "Beneficiary ID",
        required: true,
        placeholder: "Enter beneficiary ID",
      },
      {
        id: "assessment_date",
        type: "date",
        label: "Assessment Date",
        required: true,
      },
      {
        id: "health_status",
        type: "select",
        label: "Overall Health Status",
        required: true,
        options: ["Excellent", "Good", "Fair", "Poor"],
      },
      {
        id: "symptoms",
        type: "checkbox-group",
        label: "Current Symptoms",
        options: ["Fever", "Cough", "Headache", "Fatigue", "Other"],
      },
      {
        id: "blood_pressure",
        type: "text",
        label: "Blood Pressure (mmHg)",
        placeholder: "120/80",
      },
      {
        id: "weight",
        type: "number",
        label: "Weight (kg)",
        placeholder: "Enter weight",
      },
      {
        id: "medications",
        type: "textarea",
        label: "Current Medications",
        placeholder: "List any medications the beneficiary is currently taking",
      },
      {
        id: "follow_up_needed",
        type: "radio",
        label: "Follow-up Required?",
        required: true,
        options: ["Yes", "No"],
      },
      {
        id: "notes",
        type: "textarea",
        label: "Additional Notes",
        placeholder: "Any additional observations or comments",
      },
    ],
  },
  "form-002": {
    id: "form-002",
    title: "Basic Vital Signs Check",
    estimatedTime: "5 minutes",
    fields: [
      {
        id: "beneficiary_id",
        type: "text",
        label: "Beneficiary ID",
        required: true,
        placeholder: "Enter beneficiary ID",
      },
      {
        id: "check_date",
        type: "date",
        label: "Check Date",
        required: true,
      },
      {
        id: "temperature",
        type: "number",
        label: "Temperature (°C)",
        placeholder: "36.5",
      },
      {
        id: "heart_rate",
        type: "number",
        label: "Heart Rate (bpm)",
        placeholder: "72",
      },
      {
        id: "blood_pressure_systolic",
        type: "number",
        label: "Systolic BP",
        placeholder: "120",
      },
      {
        id: "blood_pressure_diastolic",
        type: "number",
        label: "Diastolic BP",
        placeholder: "80",
      },
      {
        id: "oxygen_saturation",
        type: "number",
        label: "Oxygen Saturation (%)",
        placeholder: "98",
      },
      {
        id: "notes",
        type: "textarea",
        label: "Notes",
        placeholder: "Additional observations",
      },
    ],
  },
  "form-004": {
    id: "form-004",
    title: "Mobile Service Delivery Report",
    estimatedTime: "20 minutes",
    fields: [
      {
        id: "service_date",
        type: "date",
        label: "Service Date",
        required: true,
      },
      {
        id: "location",
        type: "text",
        label: "Service Location",
        required: true,
        placeholder: "Enter location where services were provided",
      },
      {
        id: "service_type",
        type: "select",
        label: "Type of Service",
        required: true,
        options: [
          "Health Screening",
          "Vaccination",
          "Medical Consultation",
          "Health Education",
          "Other",
        ],
      },
      {
        id: "beneficiaries_served",
        type: "number",
        label: "Number of Beneficiaries Served",
        required: true,
        placeholder: "Enter number",
      },
      {
        id: "age_groups",
        type: "checkbox-group",
        label: "Age Groups Served",
        options: ["0-5 years", "6-17 years", "18-64 years", "65+ years"],
      },
      {
        id: "services_provided",
        type: "textarea",
        label: "Services Provided (Details)",
        required: true,
        placeholder: "Describe the specific services provided",
      },
      {
        id: "challenges",
        type: "textarea",
        label: "Challenges Encountered",
        placeholder: "Describe any challenges or issues",
      },
      {
        id: "supplies_used",
        type: "textarea",
        label: "Medical Supplies Used",
        placeholder: "List medical supplies and quantities used",
      },
    ],
  },
  "form-006": {
    id: "form-006",
    title: "Legal Aid Case Documentation",
    estimatedTime: "30 minutes",
    fields: [
      {
        id: "case_id",
        type: "text",
        label: "Case ID",
        required: true,
        placeholder: "Enter case ID",
      },
      {
        id: "client_id",
        type: "text",
        label: "Client ID",
        required: true,
        placeholder: "Enter client ID",
      },
      {
        id: "case_date",
        type: "date",
        label: "Case Date",
        required: true,
      },
      {
        id: "case_type",
        type: "select",
        label: "Case Type",
        required: true,
        options: [
          "Family Law",
          "Property Rights",
          "Labor Rights",
          "Criminal Defense",
          "Civil Rights",
          "Other",
        ],
      },
      {
        id: "case_status",
        type: "select",
        label: "Case Status",
        required: true,
        options: ["New", "In Progress", "On Hold", "Resolved", "Closed"],
      },
      {
        id: "case_description",
        type: "textarea",
        label: "Case Description",
        required: true,
        placeholder: "Provide detailed description of the case",
      },
      {
        id: "legal_issues",
        type: "checkbox-group",
        label: "Legal Issues Involved",
        options: [
          "Contract Dispute",
          "Property Rights",
          "Family Matters",
          "Employment",
          "Immigration",
          "Other",
        ],
      },
      {
        id: "priority_level",
        type: "radio",
        label: "Priority Level",
        required: true,
        options: ["Low", "Medium", "High", "Urgent"],
      },
      {
        id: "estimated_duration",
        type: "select",
        label: "Estimated Duration",
        options: ["1-2 weeks", "1 month", "2-3 months", "6+ months", "Unknown"],
      },
      {
        id: "notes",
        type: "textarea",
        label: "Additional Notes",
        placeholder: "Any additional information or special considerations",
      },
    ],
  },
};

export function FormSubmission({
  subProjectId,
  formId,
  activityId,
  onBack,
  onSubmissionComplete,
}: FormSubmissionProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDraft, setIsDraft] = useState(false);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [progress, setProgress] = useState(0);

  const subProject =
    subProjectDetails[subProjectId as keyof typeof subProjectDetails];
  const activity = activityId
    ? activityDetails[activityId as keyof typeof activityDetails]
    : null;
  const formStructure = formStructures[formId as keyof typeof formStructures];

  useEffect(() => {
    // Calculate progress based on filled required fields
    if (!formStructure) return;

    const requiredFields =
      formStructure.fields.filter((field) => field.required) || [];
    const filledRequiredFields = requiredFields.filter((field) => {
      const value = formData[field.id];
      return value !== undefined && value !== "" && value !== null;
    });

    const progressPercent =
      requiredFields.length > 0
        ? (filledRequiredFields.length / requiredFields.length) * 100
        : 0;

    setProgress(progressPercent);
  }, [formData, formStructure]);

  if (!subProject || !formStructure) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="font-medium mb-2">Form not found</h3>
        <p className="text-muted-foreground mb-4">
          The requested form could not be loaded.
        </p>
        <Button onClick={onBack}>Go Back</Button>
      </div>
    );
  }

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [fieldId]: value,
    }));

    // Clear validation error for this field
    if (validationErrors[fieldId]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldId];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    formStructure.fields.forEach((field) => {
      if (field.required) {
        const value = formData[field.id];
        if (
          !value ||
          value === "" ||
          (Array.isArray(value) && value.length === 0)
        ) {
          errors[field.id] = `${field.label} is required`;
        }
      }
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveDraft = async () => {
    setIsDraft(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsDraft(false);
    // Show success message
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Success
      onSubmissionComplete();
    } catch (error) {
      // Handle error
      console.error("Submission failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderField = (field: any) => {
    const value = formData[field.id] || "";
    const hasError = validationErrors[field.id];

    switch (field.type) {
      case "text":
      case "number":
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label}{" "}
              {field.required && <span className="text-destructive">*</span>}
            </Label>
            <Input
              id={field.id}
              type={field.type}
              placeholder={field.placeholder}
              value={value}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              className={hasError ? "border-destructive" : ""}
            />
            {hasError && <p className="text-sm text-destructive">{hasError}</p>}
          </div>
        );

      case "date":
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label}{" "}
              {field.required && <span className="text-destructive">*</span>}
            </Label>
            <Input
              id={field.id}
              type="date"
              value={value}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              className={hasError ? "border-destructive" : ""}
            />
            {hasError && <p className="text-sm text-destructive">{hasError}</p>}
          </div>
        );

      case "textarea":
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label}{" "}
              {field.required && <span className="text-destructive">*</span>}
            </Label>
            <Textarea
              id={field.id}
              placeholder={field.placeholder}
              value={value}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              className={hasError ? "border-destructive" : ""}
              rows={3}
            />
            {hasError && <p className="text-sm text-destructive">{hasError}</p>}
          </div>
        );

      case "select":
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label}{" "}
              {field.required && <span className="text-destructive">*</span>}
            </Label>
            <Select
              value={value}
              onValueChange={(val) => handleFieldChange(field.id, val)}
            >
              <SelectTrigger className={hasError ? "border-destructive" : ""}>
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option: string) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {hasError && <p className="text-sm text-destructive">{hasError}</p>}
          </div>
        );

      case "radio":
        return (
          <div key={field.id} className="space-y-2">
            <Label>
              {field.label}{" "}
              {field.required && <span className="text-destructive">*</span>}
            </Label>
            <RadioGroup
              value={value}
              onValueChange={(val) => handleFieldChange(field.id, val)}
            >
              {field.options?.map((option: string) => (
                <div key={option} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`${field.id}-${option}`} />
                  <Label htmlFor={`${field.id}-${option}`}>{option}</Label>
                </div>
              ))}
            </RadioGroup>
            {hasError && <p className="text-sm text-destructive">{hasError}</p>}
          </div>
        );

      case "checkbox-group":
        const checkboxValues = Array.isArray(value) ? value : [];
        return (
          <div key={field.id} className="space-y-2">
            <Label>
              {field.label}{" "}
              {field.required && <span className="text-destructive">*</span>}
            </Label>
            <div className="space-y-2">
              {field.options?.map((option: string) => (
                <div key={option} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${field.id}-${option}`}
                    checked={checkboxValues.includes(option)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        handleFieldChange(field.id, [
                          ...checkboxValues,
                          option,
                        ]);
                      } else {
                        handleFieldChange(
                          field.id,
                          checkboxValues.filter((v: string) => v !== option)
                        );
                      }
                    }}
                  />
                  <Label htmlFor={`${field.id}-${option}`}>{option}</Label>
                </div>
              ))}
            </div>
            {hasError && <p className="text-sm text-destructive">{hasError}</p>}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Forms
        </Button>
        <div>
          <h2>{formStructure.title}</h2>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Badge variant="outline">{subProject.projectName}</Badge>
            <span>•</span>
            <span>{subProject.name}</span>
            <span>•</span>
            <Clock className="h-4 w-4" />
            <span>{formStructure.estimatedTime}</span>
          </div>
        </div>
      </div>

      {/* Context Information */}
      {activity && (
        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-blue-600" />
              <h4 className="font-medium text-blue-800">Associated Activity</h4>
            </div>
            <p className="text-sm text-blue-700 mt-1">
              This submission will be linked to: {activity.title}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Progress Indicator */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Form Completion</span>
            <span className="text-sm text-muted-foreground">
              {Math.round(progress)}%
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </CardContent>
      </Card>

      {/* Form Fields */}
      <Card>
        <CardHeader>
          <h3>Form Details</h3>
        </CardHeader>
        <CardContent className="space-y-6">
          {formStructure.fields.map(renderField)}
        </CardContent>
      </Card>

      {/* Validation Summary */}
      {Object.keys(validationErrors).length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please fix the following errors before submitting:
            <ul className="mt-2 list-disc list-inside">
              {Object.values(validationErrors).map((error, index) => (
                <li key={index} className="text-sm">
                  {error}
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-end">
        <Button variant="outline" onClick={handleSaveDraft} disabled={isDraft}>
          {isDraft ? (
            <>Saving...</>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Draft
            </>
          )}
        </Button>

        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || progress < 100}
        >
          {isSubmitting ? (
            <>Submitting...</>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Submit Form
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
