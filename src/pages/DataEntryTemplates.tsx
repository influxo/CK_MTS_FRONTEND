import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import type { AppDispatch } from "../store";
import {
  fetchFormTemplates,
  selectFormTemplates,
  selectFormTemplatesError,
  selectFormTemplatesLoading,
  fetchFormTemplateById,
  selectSelectedTemplate,
  selectSelectedTemplateError,
  selectSelectedTemplateLoading,
  selectFormTemplatesPagination,
} from "../store/slices/formSlice";
import { Card } from "../components/ui/data-display/card";
import { Button } from "../components/ui/button/button";
import { Badge } from "../components/ui/data-display/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/data-display/table";
import { Alert, AlertDescription } from "../components/ui/feedback/alert";
import { ArrowLeft, Loader2 } from "lucide-react";
import { FormSubmission } from "../components/data-entry/FormSubmission";
import { useAuth } from "../hooks/useAuth";
import {
  fetchUserProjectsByUserId,
  selectUserProjectsTree,
} from "../store/slices/userProjectsSlice";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/form/select";

export function DataEntryTemplates() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const projectId = searchParams.get("projectId") ?? undefined;
  const subprojectId = searchParams.get("subprojectId") ?? undefined;

  const { user } = useAuth();
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

  // Load user projects if needed
  useEffect(() => {
    if (!isSysOrSuperAdmin && user?.id) {
      dispatch(fetchUserProjectsByUserId(String(user.id)));
    }
  }, [dispatch, isSysOrSuperAdmin, user?.id]);

  // Build allowed sets for non-admins
  const allowedProjectIds = useMemo(() => {
    if (isSysOrSuperAdmin) return null; // admins have access to all
    return new Set((userProjectsTree || []).map((p) => p.id));
  }, [isSysOrSuperAdmin, userProjectsTree]);

  const allowedSubprojectIds = useMemo(() => {
    if (isSysOrSuperAdmin) return null;
    const ids: string[] = [];
    (userProjectsTree || []).forEach((p) => {
      (p.subprojects || []).forEach((sp) => ids.push(sp.id));
    });
    return new Set(ids);
  }, [isSysOrSuperAdmin, userProjectsTree]);

  const hasParam = !!projectId || !!subprojectId;
  const hasAccess = useMemo(() => {
    if (!hasParam) return false;
    if (isSysOrSuperAdmin) return true;
    if (projectId) return allowedProjectIds?.has(projectId) ?? false;
    if (subprojectId) return allowedSubprojectIds?.has(subprojectId) ?? false;
    return false;
  }, [
    hasParam,
    isSysOrSuperAdmin,
    projectId,
    subprojectId,
    allowedProjectIds,
    allowedSubprojectIds,
  ]);

  const loading = useSelector(selectFormTemplatesLoading);
  const error = useSelector(selectFormTemplatesError);
  const templates = useSelector(selectFormTemplates);
  const pagination = useSelector(selectFormTemplatesPagination);
  const selectedTemplate = useSelector(selectSelectedTemplate);
  const selectedTemplateLoading = useSelector(selectSelectedTemplateLoading);
  const selectedTemplateError = useSelector(selectSelectedTemplateError);

  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(
    null
  );

  // Pagination state and loader
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);

  useEffect(() => {
    if (!hasAccess) return;

    const entityType = projectId ? "project" : "subproject";
    dispatch(
      fetchFormTemplates({
        projectId,
        subprojectId,
        entityType,
        page,
        limit,
      })
    );
  }, [dispatch, projectId, subprojectId, hasAccess, page, limit]);

  // When a template is selected, fetch its full schema
  useEffect(() => {
    if (selectedTemplateId) {
      dispatch(fetchFormTemplateById({ id: selectedTemplateId }));
    }
  }, [dispatch, selectedTemplateId]);

  const pageTitle = useMemo(() => {
    if (projectId) return "Templates for Project";
    if (subprojectId) return "Templates for Subproject";
    return "Templates";
  }, [projectId, subprojectId]);

  if (!hasParam) {
    return (
      <div className="space-y-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/data-entry")}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Data Entry
        </Button>
        <Alert variant="destructive">
          <AlertDescription>
            Missing required parameter. Provide either projectId or subprojectId
            in the URL.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="space-y-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/data-entry")}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Data Entry
        </Button>
        <Alert variant="destructive">
          <AlertDescription>
            You do not have access to this selection.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Determine entity info for submission
  const entityId = projectId ?? subprojectId ?? undefined;
  const entityType = projectId
    ? "project"
    : subprojectId
    ? "subproject"
    : undefined;

  // Build numbered pagination tokens (compact with ellipsis)
  const pageTokens = useMemo(() => {
    const total = Math.max(pagination?.totalPages || 1, 1);
    const current = Math.min(Math.max(pagination?.page || 1, 1), total);
    const tokens: Array<number | string> = [];
    if (total <= 7) {
      for (let i = 1; i <= total; i++) tokens.push(i);
      return tokens;
    }
    const left = Math.max(2, current - 1);
    const right = Math.min(total - 1, current + 1);
    tokens.push(1);
    if (left > 2) tokens.push("left-ellipsis");
    for (let i = left; i <= right; i++) tokens.push(i);
    if (right < total - 1) tokens.push("right-ellipsis");
    tokens.push(total);
    return tokens;
  }, [pagination]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button
          className="hover:bg-[#E0F2FE] border-0"
          variant="outline"
          size="sm"
          onClick={() =>
            selectedTemplateId
              ? setSelectedTemplateId(null)
              : navigate("/data-entry")
          }
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <div>
          <h2>{pageTitle}</h2>
          <div className="text-sm text-muted-foreground">
            {projectId ? (
              <>
                projectId: <Badge variant="outline">{projectId}</Badge>
              </>
            ) : (
              <>
                subprojectId:{" "}
                <Badge
                  variant="outline"
                  className="bg-black/5 text-black border-0"
                >
                  {subprojectId}
                </Badge>
              </>
            )}
          </div>
        </div>
      </div>

      <Card className="bg-[#F7F9FB] drop-shadow-sm shadow-gray-50 border-0">
        <div className="p-4">
          {loading && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading templates...
            </div>
          )}

          {!loading && error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!loading && !error && (
            <div className="space-y-4">
              {!selectedTemplateId ? (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Version</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {templates.map((tpl) => (
                        <TableRow key={tpl.id}>
                          <TableCell className="font-medium">
                            {tpl.name}
                          </TableCell>
                          <TableCell>{tpl.version}</TableCell>
                          <TableCell>
                            <div className="flex gap-2 justify-end">
                              <Button
                                className="hover:bg-[#E0F2FE] border-0"
                                size="sm"
                                variant={
                                  selectedTemplateId === tpl.id
                                    ? "default"
                                    : "outline"
                                }
                                onClick={() => setSelectedTemplateId(tpl.id)}
                              >
                                {selectedTemplateId === tpl.id
                                  ? "Selected"
                                  : "Select"}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {templates.length === 0 && (
                        <TableRow>
                          <TableCell
                            colSpan={3}
                            className="text-center text-muted-foreground"
                          >
                            No templates found for this selection.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                  {/* Pagination Controls */}
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>
                        Page {pagination?.page || 1} of{" "}
                        {Math.max(pagination?.totalPages || 1, 1)}
                      </span>
                      <span className="hidden sm:inline">
                        • Total {pagination?.totalCount || 0} records
                      </span>
                      <div className="flex items-center gap-2 ml-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPage((p) => Math.max(1, p - 1))}
                          disabled={loading || (pagination?.page || 1) <= 1}
                          className="bg-[#E0F2FE]"
                        >
                          Prev
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPage((p) => p + 1)}
                          disabled={
                            loading ||
                            (pagination?.totalPages || 0) === 0 ||
                            (pagination?.page || 1) >=
                              (pagination?.totalPages || 1)
                          }
                          className="bg-[#E0F2FE]"
                        >
                          Next
                        </Button>
                        <div className="flex items-center gap-1 ml-2">
                          {pageTokens.map((tok, idx) =>
                            typeof tok === "number" ? (
                              <Button
                                key={`p-${tok}`}
                                variant="outline"
                                size="sm"
                                className={
                                  tok === (pagination?.page || 1)
                                    ? "bg-[#0073e6] text-white border-0"
                                    : "bg-white"
                                }
                                onClick={() =>
                                  tok !== (pagination?.page || 1) &&
                                  setPage(tok)
                                }
                                disabled={loading}
                                aria-current={
                                  tok === (pagination?.page || 1)
                                    ? "page"
                                    : undefined
                                }
                              >
                                {tok}
                              </Button>
                            ) : (
                              <span
                                key={`${tok}-${idx}`}
                                className="px-1 text-muted-foreground"
                              >
                                …
                              </span>
                            )
                          )}
                        </div>
                        <Select
                          value={String(limit)}
                          onValueChange={(val) => {
                            const newLimit = parseInt(val, 10) || 50;
                            setLimit(newLimit);
                            setPage(1);
                          }}
                        >
                          <SelectTrigger className="w-[120px] bg-[#E0F2FE] border-0 text-black">
                            <SelectValue placeholder="Rows" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="10">10 / page</SelectItem>
                            <SelectItem value="20">20 / page</SelectItem>
                            <SelectItem value="50">50 / page</SelectItem>
                            <SelectItem value="100">100 / page</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  {selectedTemplateLoading && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" /> Loading
                      template...
                    </div>
                  )}
                  {!selectedTemplateLoading && selectedTemplateError && (
                    <Alert variant="destructive">
                      <AlertDescription>
                        {selectedTemplateError}
                      </AlertDescription>
                    </Alert>
                  )}
                  {!selectedTemplateLoading &&
                    selectedTemplate &&
                    entityId &&
                    entityType && (
                      <FormSubmission
                        template={selectedTemplate}
                        entityId={entityId}
                        entityType={entityType}
                        onBack={() => setSelectedTemplateId(null)}
                        onSubmissionComplete={() => navigate("/data-entry")}
                      />
                    )}
                </div>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

export default DataEntryTemplates;
