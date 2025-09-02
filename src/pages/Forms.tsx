import { FormsModule } from "../components/forms/FormsModule";
import { useSelector } from "react-redux";
import { fetchForms, selectAllForms } from "../store/slices/formsSlice";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../store";
import { useCallback, useEffect, useState } from "react";

export function Forms() {
  const dispatch = useDispatch<AppDispatch>();
  const forms = useSelector(selectAllForms);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchFormsList = useCallback(() => {
    dispatch(fetchForms());
  }, [dispatch]);

  useEffect(() => {
    fetchFormsList();
  }, [fetchFormsList, refreshKey]);

  const handleFormCreated = useCallback(() => {
    // Increment the refresh key to trigger a refetch
    setRefreshKey(prev => prev + 1);
  }, []);

  console.log("Forms state:", forms);

  return <FormsModule forms={forms} onFormCreated={handleFormCreated} />;
}
