import { useEffect, useMemo, useState } from "react";
import { SubProjectSelection } from "../components/data-entry/SubProjectSelection";
import type { AppDispatch } from "../store";
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

interface DataEntryModuleProps {}

// TODO: ksajna i vyn my bo check ma mire!!!

export function DataEntry({}: DataEntryModuleProps) {
  const dispatch = useDispatch<AppDispatch>();
  const [activeTab, setActiveTab] = useState<"entry" | "history">("entry");
  const [entityType, setEntityType] = useState<"project" | "subproject">(
    "project"
  );
  const [selectedEntityId, setSelectedEntityId] = useState<string>("");

  const projects = useSelector(selectAllProjects);
  const subprojects = useSelector(selectAllSubprojects);

  useEffect(() => {
    // Load projects and subprojects for aggregation table
    dispatch(fetchProjects());
    dispatch(fetchAllSubProjects());
  }, [dispatch]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2>Data Entry</h2>
          <p className="text-muted-foreground">
            Submit forms or view submission history
          </p>
        </div>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList className="bg-[#2E343E] bg-opacity-10 items-center ">
            <TabsTrigger
              value="entry"
              className="data-[state=active]:bg-[#2E343E]  data-[state=active]:text-white"
            >
              Data Entry
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="data-[state=active]:bg-[#2E343E]  data-[state=active]:text-white"
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
          <Card className="bg-[#F7F9FB] drop-shadow-sm shadow-gray-50 border-0">
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
                      {projects.map((p) => (
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
                      {subprojects.map((sp) => (
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
                    {selectedEntityId
                      ? `${entityType} • ${selectedEntityId}`
                      : "All"}
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
