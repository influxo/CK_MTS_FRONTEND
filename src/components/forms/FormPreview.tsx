import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../ui/data-display/card";
import { Button } from "../ui/button/button";
import { FormField } from "./FormField";
import type { FormTemplate } from "../../services/forms/formModels";

export function FormPreview({
  formData,
  setPreviewMode,
}: {
  formData: FormTemplate;
  setPreviewMode: (mode: boolean) => void;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>{formData.name}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {formData.description}
          </p>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-6 max-w-3xl mx-auto">
          {formData.schema.fields.map((field, index) => (
            <FormField key={index} field={{ id: index.toString(), 
                helpText: field.helpText,
                type: field.type.toLocaleLowerCase(), label: field.label, required: field.required, placeholder: field.placeholder, validations: field.validations}} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
