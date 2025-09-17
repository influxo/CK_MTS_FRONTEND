import { useEffect, useMemo, useState } from "react";
import { SubProjectSelection } from "../components/data-entry/SubProjectSelection";
import type { AppDispatch } from "../store";
import { useDispatch, useSelector } from "react-redux";
import { fetchProjects } from "../store/slices/projectsSlice";
import { fetchAllSubProjects } from "../store/slices/subProjectSlice";
import { selectAllProjects } from "../store/slices/projectsSlice";
import { selectAllSubprojects } from "../store/slices/subProjectSlice";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/navigation/tabs";
import { Card, CardContent } from "../components/ui/data-display/card";
import { SubmissionHistory } from "../components/data-entry/SubmissionHistory";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/form/select";
import { Badge } from "../components/ui/data-display/badge";
import { useAuth } from "../hooks/useAuth";
import {
  fetchUserProjectsByUserId,
  selectUserProjectsTree,
} from "../store/slices/userProjectsSlice";

interface DataEntryModuleProps {}

// TODO: ksajna i vyn my bo check ma mire!!!

export function DataEntry({}: DataEntryModuleProps) {
  const dispatch = useDispatch<AppDispatch>();
  const [activeTab, setActiveTab] = useState<"entry" | "history">("entry");
  const [entityType, setEntityType] = useState<"project" | "subproject">("project");
  const [selectedEntityId, setSelectedEntityId] = useState<string>("");

  const { user } = useAuth();
  const projects = useSelector(selectAllProjects);
  const subprojects = useSelector(selectAllSubprojects);
  const userProjectsTree = useSelector(selectUserProjectsTree);

  const normalizedRoles = useMemo(
    () => (user?.roles || []).map((r) => r.name?.toLowerCase?.() || ""),
    [user?.roles]
  );
  const isSysOrSuperAdmin = useMemo(() => {
    return normalizedRoles.some(
      (r) =>
        r === "sysadmin" ||
        r === "superadmin" ||
        r.includes("system admin") ||
        r.includes("super admin")
    );
  }, [normalizedRoles]);

  useEffect(() => {
    // Load projects and subprojects for aggregation table
    dispatch(fetchProjects());
    dispatch(fetchAllSubProjects());
  }, [dispatch]);

  // Ensure user projects loaded for non-admins
  useEffect(() => {
    if (!isSysOrSuperAdmin && user?.id) {
      dispatch(fetchUserProjectsByUserId(String(user.id)));
    }
  }, [dispatch, isSysOrSuperAdmin, user?.id]);

  const allowedProjects = useMemo(() => {
    if (isSysOrSuperAdmin) return projects;
    return (userProjectsTree || []).map((p) => ({ id: p.id, name: p.name }));
  }, [isSysOrSuperAdmin, projects, userProjectsTree]);

  const allowedSubprojects = useMemo(() => {
    if (isSysOrSuperAdmin) return subprojects;
    const flat: Array<{ id: string; name: string }> = [];
    (userProjectsTree || []).forEach((p) => {
      (p.subprojects || []).forEach((sp) => {
        flat.push({ id: sp.id, name: sp.name });
      });
    });
    return flat as any;
  }, [isSysOrSuperAdmin, subprojects, userProjectsTree]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2>Data Entry</h2>
          <p className="text-muted-foreground">Submit forms or view submission history</p>
        </div>
        <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as any)}
            className="w-[280px]"
          >
            <TabsList className="grid w-full grid-cols-2 bg-black/5">
              <TabsTrigger
                value="entry"
                className="data-[state=active]:bg-[#2E343E] data-[state=active]:text-white"
              >
                Data Entry
              </TabsTrigger>
              <TabsTrigger
                value="history"
                className="data-[state=active]:bg-[#2E343E] data-[state=active]:text-white"
              >
                Submission History
              </TabsTrigger>
            </TabsList>
          </Tabs>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsContent value="entry">
          <SubProjectSelection />
        </TabsContent>

        <TabsContent value="history">
          <Card className="drop-shadow-sm shadow-gray-50 border-0">
            <CardContent className="p-4 space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <Select
                  value={entityType}
                  onValueChange={(v) => {
                    setEntityType(v as any);
                    setSelectedEntityId("");
                  }}
                >
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder="Entity Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="project">Project</SelectItem>
                    <SelectItem value="subproject">Subproject</SelectItem>
                  </SelectContent>
                </Select>

                {entityType === "project" ? (
                  <Select
                    value={selectedEntityId}
                    onValueChange={setSelectedEntityId}
                  >
                    <SelectTrigger className="w-full sm:w-[260px]">
                      <SelectValue placeholder="Select a project" />
                    </SelectTrigger>
                    <SelectContent>
                      {allowedProjects.map((p: any) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Select
                    value={selectedEntityId}
                    onValueChange={setSelectedEntityId}
                  >
                    <SelectTrigger className="w-full sm:w-[260px]">
                      <SelectValue placeholder="Select a subproject" />
                    </SelectTrigger>
                    <SelectContent>
                      {allowedSubprojects.map((sp: any) => (
                        <SelectItem key={sp.id} value={sp.id}>
                          {sp.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div>
                <div className="mb-3 text-sm text-muted-foreground">
                  Showing submissions for
                  <Badge variant="outline" className="ml-2">
                    {selectedEntityId ? `${entityType} • ${selectedEntityId}` : "All"}
                  </Badge>
                </div>
                <SubmissionHistory
                  entityId={selectedEntityId || undefined}
                  entityType={selectedEntityId ? (entityType as any) : undefined}
                  onBack={() => setActiveTab("entry")}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default DataEntry;
