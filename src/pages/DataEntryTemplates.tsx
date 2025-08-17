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

export function DataEntryTemplates() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const projectId = searchParams.get("projectId") ?? undefined;
  const subprojectId = searchParams.get("subprojectId") ?? undefined;

  const isValid = !!projectId || !!subprojectId;

  const loading = useSelector(selectFormTemplatesLoading);
  const error = useSelector(selectFormTemplatesError);
  const templates = useSelector(selectFormTemplates);
  const selectedTemplate = useSelector(selectSelectedTemplate);
  const selectedTemplateLoading = useSelector(selectSelectedTemplateLoading);
  const selectedTemplateError = useSelector(selectSelectedTemplateError);

  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(
    null
  );

  useEffect(() => {
    if (!isValid) return;

    const entityType = projectId ? "project" : "subproject";
    dispatch(
      fetchFormTemplates({
        projectId,
        subprojectId,
        entityType,
        page: 1,
        limit: 50,
      })
    );
  }, [dispatch, projectId, subprojectId, isValid]);

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

  if (!isValid) {
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

  // Determine entity info for submission
  const entityId = projectId ?? subprojectId ?? undefined;
  const entityType = projectId ? "project" : subprojectId ? "subproject" : undefined;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => (selectedTemplateId ? setSelectedTemplateId(null) : navigate("/data-entry"))}
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
                subprojectId: <Badge variant="outline">{subprojectId}</Badge>
              </>
            )}
          </div>
        </div>
      </div>

      <Card>
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
                          <TableCell className="font-medium">{tpl.name}</TableCell>
                          <TableCell>{tpl.version}</TableCell>
                          <TableCell>
                            <div className="flex gap-2 justify-end">
                              <Button
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
                </>
              ) : (
                <div className="space-y-4">
                  {selectedTemplateLoading && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" /> Loading template...
                    </div>
                  )}
                  {!selectedTemplateLoading && selectedTemplateError && (
                    <Alert variant="destructive">
                      <AlertDescription>{selectedTemplateError}</AlertDescription>
                    </Alert>
                  )}
                  {!selectedTemplateLoading && selectedTemplate && entityId && entityType && (
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
