import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../store";
import { createForm } from "../../store/slices/formsSlice";
import { FormBuilder } from "./FormBuilder";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export function FormCreate() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const handleSaveForm = async (formData: any) => {
    try {
      await dispatch(createForm(formData)).unwrap();

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

  const handleBackToForms = () => {
    navigate('/forms');
  };

  return <FormBuilder onBack={handleBackToForms} onSave={handleSaveForm} />;
}
