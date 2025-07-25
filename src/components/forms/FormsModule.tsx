import { useState } from "react";
import { FormsList } from "./FormsList";
import { FormBuilder } from "./FormBuilder";

export function FormsModule() {
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

  const handleSaveForm = (formData: any) => {
    console.log("Saving form:", formData);
    // In a real app, this would save the form to the database

    // After saving, go back to the form list
    handleBackToForms();
  };

  if (selectedFormId || isCreatingForm) {
    return (
      <FormBuilder
        formId={selectedFormId}
        onBack={handleBackToForms}
        onSave={handleSaveForm}
      />
    );
  }

  return (
    <FormsList onCreateForm={handleCreateForm} onEditForm={handleEditForm} />
  );
}
