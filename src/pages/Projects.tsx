import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "../hooks/useTranslation";
import { ProjectsList } from "../components/projects/ProjectsList";
import type { AppDispatch } from "../store";
import {
  fetchProjects,
  selectAllProjects,
  selectProjectsError,
  selectProjectsLoading,
} from "../store/slices/projectsSlice";

export function Projects() {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const projects = useSelector(selectAllProjects);
  const isLoading = useSelector(selectProjectsLoading);
  const error = useSelector(selectProjectsError);

  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch]);

  if (isLoading) return <p>{t('common.loading')}</p>;
  if (error) return <p>{t('common.error')}: {error}</p>;

  return <ProjectsList projects={projects} />;
}
