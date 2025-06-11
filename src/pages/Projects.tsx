import { useState } from "react";
import { ProjectsList } from "../components/projects/ProjectsList";
import { ProjectDetails } from "../components/projects/ProjectDetails";
import { SubProjectDetails } from "../components/projects/SubProjectDetails";

interface ProjectsProps {
  selectedProjectId: string | null;
  selectedSubProjectId: string | null;
  onProjectSelect: (projectId: string) => void;
  onSubProjectSelect: (subProjectId: string) => void;
  onBackToProjects: () => void;
  onBackToProject: () => void;
}

export function Projects({
  selectedProjectId,
  selectedSubProjectId,
  onProjectSelect,
  onSubProjectSelect,
  onBackToProjects,
  onBackToProject,
}: ProjectsProps) {
  if (!selectedProjectId) {
    return <ProjectsList onProjectSelect={onProjectSelect} />;
  }

  if (selectedProjectId && !selectedSubProjectId) {
    return (
      <ProjectDetails
        projectId={selectedProjectId}
        onBack={onBackToProjects}
        onSubProjectSelect={onSubProjectSelect}
      />
    );
  }

  if (selectedProjectId && selectedSubProjectId) {
    return (
      <SubProjectDetails
        projectId={selectedProjectId}
        subProjectId={selectedSubProjectId}
        onBack={onBackToProject}
      />
    );
  }

  return null;
}
