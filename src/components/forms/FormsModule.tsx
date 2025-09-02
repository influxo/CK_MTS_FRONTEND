import { useState } from "react";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../store";
import { FormsList } from "./FormsList";
import { FormBuilder } from "./FormBuilder";
import type { FormTemplate, Pagination } from "../../services/forms/formModels";
import { createForm } from "../../store/slices/formsSlice";
import { toast } from "sonner";

interface FormsModuleProps {
  forms: { templates: FormTemplate[], pagination: Pagination };
  onFormCreated?: () => void;
}

export function FormsModule({ forms, onFormCreated }: FormsModuleProps) {
  const dispatch = useDispatch<AppDispatch>();
  const [selectedFormId, setSelectedFormId] = useState<string | null>(null);
  const [isCreatingForm, setIsCreatingForm] = useState(false);

  console.log("Forms:", forms);
  const handleCreateForm = () => {
    setIsCreatingForm(true);
    setSelectedFormId(null);
  };

  const handleEditForm = (formId: string) => {
    setSelectedFormId(formId);
    setIsCreatingForm(false);
  };

  const handleBackToForms = () => {
    setSelectedFormId(null);
    setIsCreatingForm(false);
  };

  const handleSaveForm = async (formData: any) => {
    try {
      const result = await dispatch(createForm(formData)).unwrap();
      console.log("Form saved successfully:", result);
      
      // Call the onFormCreated callback if provided
      if (onFormCreated) {
        onFormCreated();
      }
      
      // Show success toast
      toast.success(`"${formData.name}" created successfully!`, {
        description: 'The form has been saved and is now available in your forms list.',
        duration: 5000,
      });
      
      handleBackToForms();
    } catch (err) {
      console.error("Failed to save form:", err);
      toast.error('Failed to save form', {
        description: err instanceof Error ? err.message : 'An unknown error occurred',
        duration: 5000,
      });
    }
  };

  // Show FormBuilder if we're either creating a new form or editing an existing one
  if (isCreatingForm || selectedFormId) {
    return (
        <FormBuilder
          formId={selectedFormId || undefined}
          onBack={handleBackToForms}
          onSave={handleSaveForm}
      />
    );
  }

  return (
    <FormsList 
      onCreateForm={handleCreateForm} 
      onEditForm={handleEditForm} 
      formTemplates={forms?.templates ?? []} 
    />
  );
}