import { FormBuilder } from "./FormBuilder";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchFormById, selectCurrentForm } from "../../store/slices/formsSlice";
import type { AppDispatch } from "../../store";
import { useEffect } from "react";

export function FormEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const form = useSelector(selectCurrentForm);
  const dispatch = useDispatch<AppDispatch>();

  if (!id) {
    return <div>No form ID provided</div>;
  }

  useEffect(() => {
    if (id) {
      dispatch(fetchFormById(id));
    }
  }, [id, dispatch]);

  if (!form) {
    return <div>No form found</div>;
  }

  const handleBackToForms = () => {
    navigate('/forms');
  };
 
  console.log('The form', form);
  
  return <FormBuilder formId={id} onBack={handleBackToForms} onSave={() => {}} />;
}
