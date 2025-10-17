import { useEffect, useMemo, useState } from "react";
import { SubProjectSelection } from "../components/data-entry/SubProjectSelection";
import type { AppDispatch } from "../store";
import { useTranslation } from "../hooks/useTranslation";
import { useDispatch, useSelector } from "react-redux";
import { fetchProjects } from "../store/slices/projectsSlice";
import { fetchAllSubProjects } from "../store/slices/subProjectSlice";
import { selectAllProjects } from "../store/slices/projectsSlice";
import { selectAllSubprojects } from "../store/slices/subProjectSlice";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/navigation/tabs";
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
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const [activeTab, setActiveTab] = useState<"entry" | "history">("entry");
  const [entityType, setEntityType] = useState<"project" | "subproject">(
    "project"
  );
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
          <h2>{t('dataEntry.title')}</h2>
          <p className="text-muted-foreground">
            {t('dataEntry.subtitle')}
          </p>
        </div>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList className="bg-[#E0F2FE]  items-center ">
            <TabsTrigger
              value="entry"
              className="data-[state=active]:bg-[#0073e6]  data-[state=active]:text-white"
            >
              {t('dataEntry.dataEntryTab')}
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="data-[state=active]:bg-[#0073e6]  data-[state=active]:text-white"
            >
              {t('dataEntry.submissionHistoryTab')}
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
            <CardContent className=" space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <Select
                  value={entityType}
                  onValueChange={(v) => {
                    setEntityType(v as any);
                    setSelectedEntityId("");
                  }}
                >
                  <SelectTrigger className="w-full sm:w-[200px] border border-gray-100 bg-white transition-transform duration-200 ease-in-out hover:scale-105 hover:-translate-y-[1px]">
                    <SelectValue placeholder={t('dataEntry.entityType')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="project">{t('dataEntry.project')}</SelectItem>
                    <SelectItem value="subproject">{t('dataEntry.subproject')}</SelectItem>
                  </SelectContent>
                </Select>

                {entityType === "project" ? (
                  <Select
                    value={selectedEntityId}
                    onValueChange={setSelectedEntityId}
                  >
                    <SelectTrigger className="w-full sm:w-[260px] border border-gray-100 bg-white transition-transform duration-200 ease-in-out hover:scale-105 hover:-translate-y-[1px]">
                      <SelectValue placeholder={t('dataEntry.selectProject')} />
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
                    <SelectTrigger className="w-full sm:w-[260px] border border-gray-100 bg-white transition-transform duration-200 ease-in-out hover:scale-105 hover:-translate-y-[1px]   ">
                      <SelectValue placeholder={t('dataEntry.selectSubproject')} />
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
                  {t('dataEntry.showingSubmissionsFor')}
                  <Badge variant="outline" className="ml-2">
                    {selectedEntityId
                      ? `${entityType} • ${selectedEntityId}`
                      : t('dataEntry.all')}
                  </Badge>
                </div>
                <SubmissionHistory
                  entityId={selectedEntityId || undefined}
                  entityType={
                    selectedEntityId ? (entityType as any) : undefined
                  }
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
