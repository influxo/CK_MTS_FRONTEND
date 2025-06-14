import { HelpCircle } from "lucide-react";
import { Checkbox } from "../ui/form/checkbox";
import { Input } from "../ui/form/input";
import { Label } from "../ui/form/label";
import { RadioGroup, RadioGroupItem } from "../ui/form/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/form/select";
import { Textarea } from "../ui/form/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/overlay/tooltip";

interface FieldOption {
  value: string;
  label: string;
}

interface FieldProps {
  id: string;
  type: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  helpText?: string;
  options?: FieldOption[];
  validations?: {
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    pattern?: string;
  };
}

interface FormFieldProps {
  field: FieldProps;
}

export function FormField({ field }: FormFieldProps) {
  const {
    id,
    type,
    label,
    placeholder,
    required,
    helpText,
    options,
    validations,
  } = field;

  const renderFieldByType = () => {
    switch (type) {
      case "text":
        return (
          <Input
            id={id}
            placeholder={placeholder}
            required={required}
            minLength={validations?.minLength}
            maxLength={validations?.maxLength}
          />
        );

      case "textarea":
        return (
          <Textarea
            id={id}
            placeholder={placeholder}
            required={required}
            minLength={validations?.minLength}
            maxLength={validations?.maxLength}
            rows={4}
          />
        );

      case "number":
        return (
          <Input
            id={id}
            type="number"
            placeholder={placeholder}
            required={required}
            min={validations?.min}
            max={validations?.max}
          />
        );

      case "date":
        return <Input id={id} type="date" required={required} />;

      case "checkbox":
        return options ? (
          <div className="space-y-2">
            {options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Checkbox id={`${id}-${option.value}`} />
                <Label
                  htmlFor={`${id}-${option.value}`}
                  className="font-normal"
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        ) : null;

      case "radio":
        return options ? (
          <RadioGroup>
            <div className="space-y-2">
              {options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem
                    value={option.value}
                    id={`${id}-${option.value}`}
                  />
                  <Label
                    htmlFor={`${id}-${option.value}`}
                    className="font-normal"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        ) : null;

      case "dropdown":
        return options ? (
          <Select>
            <SelectTrigger>
              <SelectValue placeholder={placeholder || "Select an option"} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option, index) => (
                <SelectItem key={index} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : null;

      case "file":
        return <Input id={id} type="file" required={required} />;

      case "boolean":
        return (
          <div className="flex items-center space-x-2">
            <Checkbox id={id} />
            <Label htmlFor={id} className="font-normal">
              Yes
            </Label>
          </div>
        );

      default:
        return <p>Unsupported field type: {type}</p>;
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <Label
          htmlFor={id}
          className={
            required
              ? "after:content-['*'] after:ml-0.5 after:text-destructive"
              : ""
          }
        >
          {label}
        </Label>

        {helpText && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p>{helpText}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      {renderFieldByType()}
    </div>
  );
}
