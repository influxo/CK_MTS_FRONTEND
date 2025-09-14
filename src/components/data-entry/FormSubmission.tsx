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

import { Save, Send, Clock, AlertCircle } from "lucide-react";
import { Progress } from "../ui/feedback/progress";
import { Alert, AlertDescription } from "../ui/feedback/alert";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch } from "../../store";
import {
  submitFormResponse,
  selectFormSubmitLoading,
  selectFormSubmitError,
} from "../../store/slices/formSlice";
import type { FormTemplate } from "../../services/forms/formModels";
import { MapPin } from "lucide-react";
import {
  enqueueSubmission,
  flushQueue,
  peekQueue,
} from "../../utils/offlineQueue";

interface DynamicFormSubmissionProps {
  template?: FormTemplate;
  entityId?: string;
  entityType?: string; // "project" | "subproject" | "activity"
  onBack: () => void;
  onSubmissionComplete: () => void;
}

const mapFieldType = (t: string | undefined) => {
  const type = (t || "").toLowerCase();
  switch (type) {
    case "text":
    case "string":
      return "text";
    case "number":
      return "number";
    case "date":
      return "date";
    case "textarea":
      return "textarea";
    case "dropdown":
    case "select":
      return "select";
    case "radio":
      return "radio";
    case "checkbox":
    case "checkbox-group":
      return "checkbox-group";
    default:
      return "text";
  }
};

// Legacy mocks removed; component now relies solely on API-provided template schema.

export function FormSubmission({
  template,
  entityId,
  entityType,
  onBack,
  onSubmissionComplete,
}: DynamicFormSubmissionProps) {
  const dispatch = useDispatch<AppDispatch>();
  const submitLoading = useSelector(selectFormSubmitLoading);
  const submitError = useSelector(selectFormSubmitError);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isDraft, setIsDraft] = useState(false);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [progress, setProgress] = useState(0);
  const [gps, setGps] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );
  const [syncing, setSyncing] = useState(false);
  const [queueCount, setQueueCount] = useState(0);
  const [localNotice, setLocalNotice] = useState<string | null>(null);
  const isMobileOrTablet =
    typeof navigator !== "undefined" &&
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

  // Build dynamic structure from API template when provided
  const dynamicFormStructure = template
    ? {
        id: template.id,
        title: template.name,
        estimatedTime: "",
        fields: (template.schema?.fields || []).map((f: any) => ({
          id: f.name,
          type: mapFieldType(f.type),
          label: f.label || f.name,
          required: !!f.required,
          options: f.options,
        })),
      }
    : null;
  const formStructure = dynamicFormStructure;
      useEffect(() => {
        if (template) {
          console.log(template);
        }
      }, [template])
  const requestGps = async (): Promise<{ lat: number; lng: number }> => {
    setGpsError(null);
    setGpsLoading(true);
    try {
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          if (!navigator?.geolocation) {
            reject(new Error("Geolocation is not supported by this browser."));
            return;
          }
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 0,
          });
        }
      );
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      const coords = { lat, lng };
      setGps(coords);
      return coords;
    } catch (e: any) {
      // Fallback: retry with low accuracy and longer timeout (useful for laptops using network provider)
      try {
        const position2 = await new Promise<GeolocationPosition>(
          (resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: false,
              timeout: 60000,
              maximumAge: 60000,
            });
          }
        );
        const lat = position2.coords.latitude;
        const lng = position2.coords.longitude;
        const coords = { lat, lng };
        setGps(coords);
        return coords;
      } catch (e2: any) {
        // Provide clearer guidance for offline devices without GPS hardware
        const offline = typeof navigator !== "undefined" && !navigator.onLine;
        const errMsg = offline
          ? "Offline geolocation is not available on this device. Use a tablet/phone with built-in GPS or re-enable internet to assist location."
          : e2?.message ||
            e?.message ||
            "Failed to retrieve GPS location. Please enable location services and grant permission.";
        setGpsError(errMsg);
        throw e2;
      }
    } finally {
      setGpsLoading(false);
    }
  };

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

  // Watch online/offline and try to flush queue when online
  useEffect(() => {
    const updateOnline = () => setIsOnline(true);
    const updateOffline = () => setIsOnline(false);
    window.addEventListener("online", updateOnline);
    window.addEventListener("offline", updateOffline);
    // initialize queue count and attempt flush if online
    setQueueCount(peekQueue().length);
    if (navigator.onLine) {
      (async () => {
        try {
          setSyncing(true);
          await flushQueue(async (templateId, payload) => {
            await (
              dispatch(submitFormResponse({ templateId, payload })) as any
            ).unwrap();
          });
        } catch (_) {
          // keep remaining in queue
        } finally {
          setQueueCount(peekQueue().length);
          setSyncing(false);
        }
      })();
    }
    return () => {
      window.removeEventListener("online", updateOnline);
      window.removeEventListener("offline", updateOffline);
    };
  }, [dispatch]);

  // Continuously watch GPS for smoother UX and better accuracy
  useEffect(() => {
    if (!navigator?.geolocation) return;
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setGps({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        if (gpsError) setGpsError(null);
      },
      (err) => {
        // don't override an already captured GPS
        if (!gps) {
          const offline = typeof navigator !== "undefined" && !navigator.onLine;
          const errMsg = offline
            ? "Offline geolocation is not available on this device. Use a tablet/phone with built-in GPS or re-enable internet to assist location."
            : err?.message || "Unable to watch position.";
          setGpsError(errMsg);
        }
      },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 60000 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!formStructure) {
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
    if (!validateForm()) return;

    // Dynamic/API-driven submission
    if (template && template.id && entityId && entityType) {
      try {
        // Ensure GPS is available
        let coords = gps;
        if (!coords) {
          if (isMobileOrTablet) {
            coords = await requestGps();
          } else {
            // Desktop/laptop: GPS optional, submit with 0,0
            coords = { lat: 0, lng: 0 };
          }
        }
        const payload = {
          entityId,
          entityType,
          data: formData,
          latitude: coords.lat,
          longitude: coords.lng,
        };

        if (!isOnline) {
          enqueueSubmission(template.id, payload);
          setQueueCount(peekQueue().length);
          setLocalNotice(
            "Submission saved offline. It will sync automatically when you're back online."
          );
          onSubmissionComplete();
          return;
        }

        try {
          await (
            dispatch(
              submitFormResponse({ templateId: template.id, payload })
            ) as any
          ).unwrap();
          onSubmissionComplete();
        } catch (e) {
          // On failure (likely network), save offline
          enqueueSubmission(template.id, payload);
          setQueueCount(peekQueue().length);
          setLocalNotice(
            "Network issue detected. Submission saved offline and will auto-sync."
          );
          onSubmissionComplete();
        }
      } catch (e) {
        // submitError selector will show the error alert
        console.error("Submit failed", e);
      }
      return;
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
              className={
                hasError
                  ? "border-destructive"
                  : " bg-black/5 border-0 focus:ring-1 focus:border-1 focus:ring-black/5 focus:border-black/5"
              }
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
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        {/* <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Forms
        </Button> */}
        <div className="mt-2">
          <h2 className="text-2xl mb-4">{formStructure.title}</h2>
          {/* <div className="flex items-center bg-[#E5ECF6] rounded-md p-2 w-full gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span> Time Captured: {formStructure.estimatedTime}</span>
          </div> */}
        </div>
      </div>

      {/* Location & connectivity status */}
      {/* <div className="flex items-center bg-[#E5ECF6] rounded-md p-2  gap-2 text-sm text-muted-foreground">
        <MapPin className="h-4 w-4" />
        {gps ? (
          <span>
            Location captured: {gps.lat.toFixed(5)}, {gps.lng.toFixed(5)}
          </span>
        ) : (
          <>
            <span>
              {isMobileOrTablet
                ? "Location required for submission."
                : "Location optional on this device."}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={requestGps}
              disabled={gpsLoading}
            >
              {gpsLoading ? "Detecting..." : "Get GPS"}
            </Button>
          </>
        )}
        <span>•</span>
        <span className="font-semibold text-[#E3F5FF]">
          {isOnline ? "Online" : "Offline"}
        </span>
        {queueCount > 0 && (
          <>
            <span>•</span>
            <span>{queueCount} queued</span>
            {isOnline && (
              <Button
                variant="outline"
                size="sm"
                disabled={syncing}
                onClick={async () => {
                  try {
                    setSyncing(true);
                    await flushQueue(async (templateId, payload) => {
                      await (
                        dispatch(
                          submitFormResponse({ templateId, payload })
                        ) as any
                      ).unwrap();
                    });
                  } finally {
                    setQueueCount(peekQueue().length);
                    setSyncing(false);
                  }
                }}
              >
                {syncing ? "Syncing..." : "Sync Now"}
              </Button>
            )}
          </>
        )}
      </div> */}

      {/* Context Information removed (legacy). */}

      {/* Progress Indicator */}

      {/* Form Fields */}

      <Card className="border-0 bg-white">
        <CardHeader>
          <h3>Form Details</h3>

          <div className="flex items-center justify-end ">
            <span className="text-sm  text-muted-foreground">
              {Math.round(progress)}%
            </span>
          </div>
          <Progress value={progress} className="h-2  bg-[#E5ECF6]" />
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

      {/* Submission Error */}
      {submitError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{submitError}</AlertDescription>
        </Alert>
      )}
      {localNotice && (
        <Alert>
          <AlertDescription>{localNotice}</AlertDescription>
        </Alert>
      )}
      {gpsError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{gpsError}</AlertDescription>
        </Alert>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-end">
        <Button
          variant="outline"
          className="w-full bg-black/10 text-black sm:w-auto"
          onClick={handleSaveDraft}
          disabled={isDraft}
        >
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
          className="w-full bg-[#2E343E] text-white sm:w-auto"
          onClick={handleSubmit}
          disabled={
            submitLoading ||
            gpsLoading ||
            (isMobileOrTablet && !gps) ||
            progress < 100
          }
        >
          {submitLoading || gpsLoading ? (
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
