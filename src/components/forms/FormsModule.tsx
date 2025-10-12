import { useState } from "react";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../store";
import { FormsList } from "./FormsList";
import { FormBuilder } from "./FormBuilder";
import type { FormTemplateAndPagination } from "../../services/forms/formModels";
import { createForm } from "../../store/slices/formsSlice";
import { toast } from "sonner";
import { useTranslation } from "../../hooks/useTranslation";

interface FormsModuleProps {
  forms: FormTemplateAndPagination;
  onFormCreated?: () => void;
  onFormDeleted?: () => void;
}

export function FormsModule({ forms, onFormCreated, onFormDeleted }: FormsModuleProps) {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const [selectedFormId, setSelectedFormId] = useState<string | null>(null);
  const [isCreatingForm, setIsCreatingForm] = useState(false);

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
      toast.success(`"${formData.name}" ${t('forms.createdSuccessfully')}`, {
        description: t('forms.formSavedDesc'),
        duration: 5000,
      });
      
      handleBackToForms();
    } catch (err) {
      console.error("Failed to save form:", err);
      toast.error(t('forms.failedToSaveForm'), {
        description: err instanceof Error ? err.message : t('forms.unknownError'),
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
      onFormDeleted={onFormDeleted ? onFormDeleted : () => {}} 
      onEditForm={handleEditForm} 
      formTemplates={forms.templates}
    />
  );
}