import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useOutletContext } from "react-router-dom";
import { ProjectDetails } from "../components/projects/ProjectDetails";
import { ProjectsList } from "../components/projects/ProjectsList";
import { SubProjectDetails } from "../components/projects/SubProjectDetails";
import type { AppDispatch } from "../store";
import {
  fetchProjects,
  selectAllProjects,
  selectProjectsError,
  selectProjectsLoading,
} from "../store/slices/projectsSlice";

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
    setSelectedSubProjectId,
  } = useOutletContext<AppLayoutContext>();

  const dispatch = useDispatch<AppDispatch>();
  const projects = useSelector(selectAllProjects);
  const isLoading = useSelector(selectProjectsLoading);
  const error = useSelector(selectProjectsError);

  // const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch]);

  console.log("Projects", projects);

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

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
    return (
      <ProjectsList onProjectSelect={handleProjectSelect} projects={projects} />
    );
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
