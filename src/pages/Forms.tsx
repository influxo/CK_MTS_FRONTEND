import { FormsModule } from "../components/forms/FormsModule";
import { useSelector } from "react-redux";
import { fetchForms, selectAllForms } from "../store/slices/formsSlice";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../store";
import { useEffect } from "react";

export function Forms() {
  const dispatch = useDispatch<AppDispatch>();
  const forms = useSelector(selectAllForms);

  useEffect(() => {
    dispatch(fetchForms());
  }, [dispatch]);

  return <FormsModule forms={forms} />;
}
