import { useMemo, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "../../hooks/useTranslation";
import {
  Search,
  ArrowRight,
  FolderKanban,
  FileText,
  Users,
  Calendar,
} from "lucide-react";
import { Card, CardContent } from "../ui/data-display/card";
import { Input } from "../ui/form/input";
import { Badge } from "../ui/data-display/badge";
import { Button } from "../ui/button/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/data-display/table";
import { ScrollArea } from "../ui/layout/scroll-area";
import { selectAllProjects } from "../../store/slices/projectsSlice";
import { selectAllSubprojects } from "../../store/slices/subProjectSlice";
import { useAuth } from "../../hooks/useAuth";
import type { AppDispatch } from "../../store";
import {
  fetchUserProjectsByUserId,
  selectUserProjectsTree,
} from "../../store/slices/userProjectsSlice";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/form/select";

type AggregatedItem = {
  id: string;
  type: "project" | "subproject";
  name: string;
  description?: string;
  status?: string;
  projectName?: string; // for subprojects
  projectId?: string; // for subprojects (to filter by parent project)
};

export function SubProjectSelection() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  // New: scope selector for showing All, Projects, or Subprojects
  const [filterEntityType, setFilterEntityType] = useState<
    "all" | "project" | "subproject"
  >("all");
  const [filterProjectId, setFilterProjectId] = useState<string>("all");
  const [filterSubprojectId, setFilterSubprojectId] = useState<string>("all");

  const allProjects = useSelector(selectAllProjects);
  const allSubprojects = useSelector(selectAllSubprojects);
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

  // Ensure user projects are loaded when needed
  useEffect(() => {
    if (!isSysOrSuperAdmin && user?.id) {
      dispatch(fetchUserProjectsByUserId(String(user.id)));
    }
  }, [dispatch, isSysOrSuperAdmin, user?.id]);

  // Compute allowed projects/subprojects based on role
  const allowedProjects = useMemo(() => {
    if (isSysOrSuperAdmin) return allProjects;
    return (userProjectsTree || []).map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description as any,
      status: p.status as any,
    }));
  }, [isSysOrSuperAdmin, allProjects, userProjectsTree]);

  const allowedSubprojects = useMemo(() => {
    if (isSysOrSuperAdmin) return allSubprojects;
    const flat = [] as Array<{
      id: string;
      name: string;
      description?: string;
      status?: string;
      projectId: string;
    }>;
    (userProjectsTree || []).forEach((p) => {
      (p.subprojects || []).forEach((sp) => {
        flat.push({
          id: sp.id,
          name: sp.name,
          description: sp.description as any,
          status: sp.status as any,
          projectId: (sp as any).projectId || p.id,
        });
      });
    });
    return flat as any;
  }, [isSysOrSuperAdmin, allSubprojects, userProjectsTree]);

  const aggregated: AggregatedItem[] = useMemo(() => {
    const projectMap = new Map(allowedProjects.map((p: any) => [p.id, p]));

    const projectItems: AggregatedItem[] = allowedProjects.map((p: any) => ({
      id: p.id,
      type: "project",
      name: p.name,
      description: p.description,
      status: p.status,
    }));

    const subprojectItems: AggregatedItem[] = (allowedSubprojects as any[]).map(
      (sp: any) => ({
        id: sp.id,
        type: "subproject",
        name: sp.name,
        description: sp.description,
        status: sp.status,
        projectName: projectMap.get(sp.projectId)?.name,
        projectId: sp.projectId,
      })
    );

    return [...projectItems, ...subprojectItems];
  }, [allowedProjects, allowedSubprojects]);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    let list = aggregated;
    // Apply entity filter first
    if (filterEntityType === "project") {
      if (filterProjectId === "all") {
        // show only projects
        list = list.filter((item) => item.type === "project");
      } else {
        // show the selected project and its subprojects
        list = list.filter(
          (item) =>
            (item.type === "project" && item.id === filterProjectId) ||
            (item.type === "subproject" && item.projectId === filterProjectId)
        );
      }
    } else if (filterEntityType === "subproject") {
      if (filterSubprojectId === "all") {
        // show only subprojects
        list = list.filter((item) => item.type === "subproject");
      } else {
        // show only the selected subproject
        list = list.filter(
          (item) => item.type === "subproject" && item.id === filterSubprojectId
        );
      }
    }

    if (!q) return list;
    return list.filter((item) =>
      [item.name, item.description, item.projectName]
        .filter(Boolean)
        .some((v) => (v as string).toLowerCase().includes(q))
    );
  }, [
    aggregated,
    searchQuery,
    filterEntityType,
    filterProjectId,
    filterSubprojectId,
  ]);

  const handleSelect = (item: AggregatedItem) => {
    if (item.type === "project") {
      navigate(`/data-entry/templates?projectId=${item.id}`);
    } else {
      navigate(`/data-entry/templates?subprojectId=${item.id}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2>Data Entry</h2>
          <p className="text-muted-foreground">
            Select a project or subproject to begin
          </p>
        </div>
      </div> */}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-[#E3F5FF] drop-shadow-sm shadow-gray-50 border-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FolderKanban className="h-5 w-5 text-blue-500" />
              <div>
                <div className="text-sm text-muted-foreground">
                  {t('dataEntry.availableSubProjects')}
                </div>
                <div className="text-xl font-medium">56</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#E5ECF6] drop-shadow-sm shadow-gray-50 border-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-green-500" />
              <div>
                <div className="text-sm text-muted-foreground">{t('dataEntry.totalForms')}</div>
                <div className="text-xl font-medium">56</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#E3F5FF] drop-shadow-sm shadow-gray-50 border-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-purple-500" />
              <div>
                <div className="text-sm text-muted-foreground">
                  {t('dataEntry.totalActivities')}
                </div>
                <div className="text-xl font-medium">130</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#E5ECF6] drop-shadow-sm shadow-gray-50 border-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-orange-500" />
              <div>
                <div className="text-sm text-muted-foreground">
                  {t('dataEntry.teamMembers')}
                </div>
                <div className="text-xl font-medium">120</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('dataEntry.searchProjectsSubprojects')}
            className="pl-9 bg-white border-gray-100   border"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        {/* Show scope: All | Projects | Subprojects */}
        <Select
          value={filterEntityType}
          onValueChange={(v) => {
            setFilterEntityType(v as any);
            // Reset the other selection when switching type
            setFilterProjectId("all");
            setFilterSubprojectId("all");
          }}
        >
          <SelectTrigger className="w-full sm:w-[180px] bg-[#E0F2FE] border-0 transition-transform duration-200 ease-in-out hover:scale-105 hover:-translate-y-[1px]">
            <SelectValue placeholder={t('dataEntry.show')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('dataEntry.all')}</SelectItem>
            <SelectItem value="project">{t('dataEntry.project')}</SelectItem>
            <SelectItem value="subproject">{t('dataEntry.subproject')}</SelectItem>
          </SelectContent>
        </Select>

        {/* Project/Subproject picker */}
        {filterEntityType === "project" ? (
          <Select
            value={filterProjectId}
            onValueChange={(v) => setFilterProjectId(v)}
          >
            <SelectTrigger className="w-full sm:w-[220px] bg-white border-gray-100 border-0 transition-transform duration-200 ease-in-out hover:scale-105 hover:-translate-y-[1px]">
              <SelectValue placeholder={t('dataEntry.selectProject')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('dataEntry.allProjects')}</SelectItem>
              {allowedProjects.map((project: any) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : filterEntityType === "subproject" ? (
          <Select
            value={filterSubprojectId}
            onValueChange={(v) => setFilterSubprojectId(v)}
          >
            <SelectTrigger className="w-full sm:w-[260px] bg-[#E0F2FE] border-gray-100 border-0 transition-transform duration-200 ease-in-out hover:scale-105 hover:-translate-y-[1px]">
              <SelectValue placeholder={t('dataEntry.selectSubproject')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('dataEntry.allSubprojects')}</SelectItem>
              {(allowedSubprojects as any[]).map((sp: any) => (
                <SelectItem key={sp.id} value={sp.id}>
                  {sp.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : null}
      </div>

      {/* Aggregated Table */}
      <Card className="bg-[#F7F9FB] drop-shadow-sm shadow-gray-50 border-0">
        <ScrollArea className="h-[600px]">
          <Table className="rounded-md overflow-hidden">
            <TableHeader className="bg-[#E5ECF6] ">
              <TableRow>
                <TableHead className="w-[300px]">{t('dataEntry.name')}</TableHead>
                <TableHead>{t('dataEntry.type')}</TableHead>
                <TableHead>{t('dataEntry.project')}</TableHead>
                <TableHead>{t('dataEntry.status')}</TableHead>
                <TableHead className="text-right">{t('dataEntry.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((item) => (
                <TableRow key={`${item.type}-${item.id}`}>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">{item.name}</div>
                      {item.description && (
                        <div className="text-sm text-muted-foreground line-clamp-1">
                          {item.description}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{item.type}</Badge>
                  </TableCell>
                  <TableCell>
                    {item.type === "subproject" && item.projectName ? (
                      <Badge variant="secondary" className="text-xs">
                        {item.projectName}
                      </Badge>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell>
                    {item.status ? (
                      <Badge
                        variant="outline"
                        className={`text-xs border-0 ${
                          item.status?.toLowerCase() === "active"
                            ? "text-[#4AA785] bg-[#DEF8EE]"
                            : "text-[#59A8D4] bg-[#E2F5FF]"
                        }`}
                      >
                        {item.status}
                      </Badge>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      onClick={() => handleSelect(item)}
                      size="sm"
                      className=" hover:bg-[#E0F2FE]"
                    >
                      {t('dataEntry.select')}
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </Card>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <h3 className="font-medium mb-2">{t('dataEntry.noItemsAvailable')}</h3>
          <p className="text-muted-foreground">
            {t('dataEntry.tryAdjustingSearch')}
          </p>
        </div>
      )}
    </div>
  );
}
