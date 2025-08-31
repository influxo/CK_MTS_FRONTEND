import { useEffect } from "react";
import { SubProjectSelection } from "../components/data-entry/SubProjectSelection";
import type { AppDispatch } from "../store";
import { useDispatch } from "react-redux";
import { fetchProjects } from "../store/slices/projectsSlice";
import { fetchAllSubProjects } from "../store/slices/subProjectSlice";

interface DataEntryModuleProps {}

// TODO: ksajna i vyn my bo check ma mire!!!

export function DataEntry({}: DataEntryModuleProps) {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    // Load projects and subprojects for aggregation table
    dispatch(fetchProjects());
    dispatch(fetchAllSubProjects());
  }, [dispatch]);

  return (
    <div className="space-y-6">
      {/* 
      {selectedSubProjectId && !selectedFormId && (
        <FormActivitySelection
          subProjectId={selectedSubProjectId}
          onFormSelect={handleFormSelect}
          onBack={handleBackToSubProjects}
        />
      )}

      {selectedSubProjectId && selectedFormId && (
        <FormSubmission
          subProjectId={selectedSubProjectId}
          formId={selectedFormId}
          activityId={selectedActivityId}
          onBack={handleBackToForms}
          onSubmissionComplete={handleSubmissionComplete}
        />
      )}
      */}
      <SubProjectSelection />
    </div>
  );
}

export default DataEntry;
