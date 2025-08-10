import { useState } from "react";
import { SubProjectSelection } from "../components/data-entry/SubProjectSelection";
import { FormActivitySelection } from "../components/data-entry/FormActivitySelection";
import { FormSubmission } from "../components/data-entry/FormSubmission";

interface DataEntryModuleProps {}

export function DataEntry({}: DataEntryModuleProps) {
  const [selectedSubProjectId, setSelectedSubProjectId] = useState<
    string | null
  >(null);
  const [selectedFormId, setSelectedFormId] = useState<string | null>(null);
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(
    null
  );

  const handleSubProjectSelect = (subProjectId: string) => {
    setSelectedSubProjectId(subProjectId);
    setSelectedFormId(null);
    setSelectedActivityId(null);
  };

  const handleFormSelect = (formId: string, activityId?: string) => {
    setSelectedFormId(formId);
    setSelectedActivityId(activityId || null);
  };

  const handleBackToSubProjects = () => {
    setSelectedSubProjectId(null);
    setSelectedFormId(null);
    setSelectedActivityId(null);
  };

  const handleBackToForms = () => {
    setSelectedFormId(null);
    setSelectedActivityId(null);
  };

  const handleSubmissionComplete = () => {
    // After submission, go back to form selection to allow more submissions
    setSelectedFormId(null);
    setSelectedActivityId(null);
  };

  return (
    <div className="space-y-6">
      {!selectedSubProjectId && (
        <SubProjectSelection onSubProjectSelect={handleSubProjectSelect} />
      )}

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
    </div>
  );
}

export default DataEntry;
