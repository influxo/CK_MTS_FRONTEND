import { useState } from "react";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../store";
import { FormsList } from "./FormsList";
import { FormBuilder } from "./FormBuilder";
import type { FormTemplateAndPagination } from "../../services/forms/formModels";
import { createForm } from "../../store/slices/formsSlice";
import { toast } from "sonner";

export function FormsModule({ forms }: { forms: FormTemplateAndPagination }) {
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
      toast('Form saved successfully');
      handleBackToForms();
    } catch (err) {
      console.error("Failed to save form:", err);
      toast('Failed to save form');
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
      formTemplates={forms.templates} 
    />
  );
}