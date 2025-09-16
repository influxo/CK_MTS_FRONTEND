import * as React from "react";
import { Download, Filter } from "lucide-react";
import { Button } from "../ui/button/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/form/select";
import type { Project } from "../../services/projects/projectModels";
import { useDispatch, useSelector } from "react-redux";
import { setFilters } from "../../store/slices/serviceMetricsSlice";
import {
  fetchSubProjectsByProjectId,
  selectAllSubprojects,
  selectSubprojectsLoading,
} from "../../store/slices/subProjectSlice";

export function FilterControls({ projects }: { projects: Project[] }) {
  const dispatch: any = useDispatch();
  const subprojects = useSelector(selectAllSubprojects);
  const subprojectsLoading = useSelector(selectSubprojectsLoading);

  const [projectId, setProjectId] = React.useState<string>("");
  const [subprojectId, setSubprojectId] = React.useState<string>("");
  const [timePreset, setTimePreset] = React.useState<string>("last-30-days");

  // Fetch subprojects when project changes
  React.useEffect(() => {
    if (projectId) {
      dispatch(fetchSubProjectsByProjectId({ projectId }));
    }
  }, [dispatch, projectId]);

  // Handlers
  const onProjectChange = (value: string) => {
    if (value === "all") {
      setProjectId("");
      setSubprojectId("");
      dispatch(setFilters({ entityId: undefined, entityType: undefined }));
      return;
    }
    setProjectId(value);
    setSubprojectId("");
    dispatch(setFilters({ entityId: value, entityType: "project" }));
  };

  const onSubprojectChange = (value: string) => {
    if (value === "all") {
      setSubprojectId("");
      if (projectId) {
        dispatch(setFilters({ entityId: projectId, entityType: "project" }));
      } else {
        dispatch(setFilters({ entityId: undefined, entityType: undefined }));
      }
      return;
    }
    setSubprojectId(value);
    dispatch(setFilters({ entityId: value, entityType: "subproject" }));
  };

  const onTimePresetChange = (value: string) => {
    setTimePreset(value);
    const now = new Date();
    const end = new Date(now);
    const start = new Date(now);
    if (value === "last-7-days") start.setDate(now.getDate() - 7);
    else if (value === "last-30-days") start.setDate(now.getDate() - 30);
    else if (value === "last-90-days") start.setDate(now.getDate() - 90);
    else return; // ignore custom here; handled elsewhere if needed
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    dispatch(
      setFilters({ startDate: start.toISOString(), endDate: end.toISOString() })
    );
  };

  return (
    <div className="flex flex-col  bg-[#F7F9FB]   drop-shadow-sm shadow-gray-50 sm:flex-row gap-4 mb-6 p-4 bg-card rounded-lg ">
      <div className="flex flex-wrap gap-4 flex-1">
        <Select value={projectId || "all"} onValueChange={onProjectChange}>
          <SelectTrigger className="w-[200px] bg-black/5 text-black border-0">
            <SelectValue placeholder="Select Project" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Projects</SelectItem>
            {projects.map((project) => (
              <SelectItem key={project.id} value={project.id}>
                {project.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={subprojectId || "all"}
          onValueChange={onSubprojectChange}
          disabled={!projectId}
        >
          <SelectTrigger className="w-[200px] bg-black/5 text-black border-0">
            <SelectValue placeholder="Select Subproject" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Subprojects</SelectItem>
            {subprojectsLoading ? (
              <SelectItem value="loading" disabled>
                Loading...
              </SelectItem>
            ) : (
              subprojects
                .filter((sp) => sp.projectId === projectId)
                .map((sp) => (
                  <SelectItem key={sp.id} value={sp.id}>
                    {sp.name}
                  </SelectItem>
                ))
            )}
          </SelectContent>
        </Select>

        <Select value={timePreset} onValueChange={onTimePresetChange}>
          <SelectTrigger className="w-[180px] bg-black/5 text-black border-0">
            <SelectValue placeholder="Time Period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="last-7-days">Last 7 days</SelectItem>
            <SelectItem value="last-30-days">Last 30 days</SelectItem>
            <SelectItem value="last-90-days">Last 90 days</SelectItem>
            <SelectItem value="custom">Custom range</SelectItem>
          </SelectContent>
        </Select>

        {/* <Select defaultValue="all-regions">
          <SelectTrigger className="w-[150px] bg-black/5 text-black border-0">
            <SelectValue placeholder="Region" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all-regions">All Regions</SelectItem>
            <SelectItem value="north">North</SelectItem>
            <SelectItem value="south">South</SelectItem>
            <SelectItem value="east">East</SelectItem>
            <SelectItem value="west">West</SelectItem>
          </SelectContent>
        </Select> */}
      </div>

      <div className="flex gap-4">
        <Button
          variant="outline"
          size="sm"
          className="bg-black/5 text-black border-0"
        >
          <Filter className="h-4 w-4 mr-2" />
          More Filters
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="bg-[#2E343E] text-white  border-0"
        >
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>
    </div>
  );
}
