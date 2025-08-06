import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ProjectsList } from "../components/projects/ProjectsList";
import type { AppDispatch } from "../store";
import {
  fetchProjects,
  selectAllProjects,
  selectProjectsError,
  selectProjectsLoading,
} from "../store/slices/projectsSlice";

export function Projects() {
  const dispatch = useDispatch<AppDispatch>();
  const projects = useSelector(selectAllProjects);
  const isLoading = useSelector(selectProjectsLoading);
  const error = useSelector(selectProjectsError);

  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch]);

  console.log("Projects", projects);

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return <ProjectsList projects={projects} />;
}
