import { FormBuilder } from "./FormBuilder";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchFormById, selectCurrentForm, updateForm } from "../../store/slices/formsSlice";
import type { AppDispatch } from "../../store";
import { useEffect } from "react";
import { toast } from "sonner";

export function FormEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const form = useSelector(selectCurrentForm);
  const dispatch = useDispatch<AppDispatch>();

  if (!id) {
    return <div>No form ID provided</div>;
  }

  useEffect(() => {
    dispatch(fetchFormById(id));
  }, [id, dispatch]);

  if (!form) {
    return <div>No form found</div>;
  }

  const handleBackToForms = () => {
    navigate('/forms');
  };

  const handleEditForm = async (formData: any) => {
    try {
      await dispatch(updateForm({ formId: id, formData })).unwrap();

      toast.success('Form updated successfully!', {
        description: 'The form has been updated.',
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
 
  return <FormBuilder formId={id} onBack={handleBackToForms} onSave={handleEditForm} />;
}
