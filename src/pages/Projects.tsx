import { useOutletContext } from "react-router-dom";
import { ProjectsList } from "../components/projects/ProjectsList";
import { ProjectDetails } from "../components/projects/ProjectDetails";
import { SubProjectDetails } from "../components/projects/SubProjectDetails";

type AppLayoutContext = {
  selectedProjectId: string | null;
  selectedSubProjectId: string | null;
  setSelectedProjectId: (id: string | null) => void;
  setSelectedSubProjectId: (id: string | null) => void;
};

export function Projects() {
  const {
    selectedProjectId,
    selectedSubProjectId,
    setSelectedProjectId,
    setSelectedSubProjectId
  } = useOutletContext<AppLayoutContext>();

  const handleProjectSelect = (projectId: string) => {
    setSelectedProjectId(projectId);
    setSelectedSubProjectId(null);
  };

  const handleSubProjectSelect = (subProjectId: string) => {
    setSelectedSubProjectId(subProjectId);
  };

  const handleBackToProjects = () => {
    setSelectedProjectId(null);
    setSelectedSubProjectId(null);
  };

  const handleBackToProject = () => {
    setSelectedSubProjectId(null);
  };

  if (!selectedProjectId) {
    return <ProjectsList onProjectSelect={handleProjectSelect} />;
  }

  if (selectedProjectId && !selectedSubProjectId) {
    return (
      <ProjectDetails
        projectId={selectedProjectId}
        onBack={handleBackToProjects}
        onSubProjectSelect={handleSubProjectSelect}
      />
    );
  }

  if (selectedProjectId && selectedSubProjectId) {
    return (
      <SubProjectDetails
        projectId={selectedProjectId}
        subProjectId={selectedSubProjectId}
        onBack={handleBackToProject}
      />
    );
  }

  return null;
}
