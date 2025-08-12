import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
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
};

export function SubProjectSelection() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const projects = useSelector(selectAllProjects);
  const subprojects = useSelector(selectAllSubprojects);

  const aggregated: AggregatedItem[] = useMemo(() => {
    const projectMap = new Map(projects.map((p) => [p.id, p]));

    const projectItems: AggregatedItem[] = projects.map((p) => ({
      id: p.id,
      type: "project",
      name: p.name,
      description: (p as any).description,
      status: (p as any).status,
    }));

    const subprojectItems: AggregatedItem[] = subprojects.map((sp) => ({
      id: sp.id,
      type: "subproject",
      name: sp.name,
      description: (sp as any).description,
      status: (sp as any).status,
      projectName: projectMap.get(sp.projectId)?.name,
    }));

    return [...projectItems, ...subprojectItems];
  }, [projects, subprojects]);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return aggregated;
    return aggregated.filter((item) =>
      [item.name, item.description, item.projectName]
        .filter(Boolean)
        .some((v) => (v as string).toLowerCase().includes(q))
    );
  }, [aggregated, searchQuery]);

  const handleSelect = (item: AggregatedItem) => {
    if (item.type === "project") {
      navigate(`/data-entry/templates?projectId=${item.id}`);
    } else {
      navigate(`/data-entry/templates?subprojectId=${item.id}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2>Data Entry</h2>
          <p className="text-muted-foreground">
            Select a project or subproject to begin
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FolderKanban className="h-5 w-5 text-blue-500" />
              <div>
                <div className="text-sm text-muted-foreground">
                  Available SubProjects
                </div>
                <div className="text-xl font-medium">56</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-green-500" />
              <div>
                <div className="text-sm text-muted-foreground">Total Forms</div>
                <div className="text-xl font-medium">56</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-purple-500" />
              <div>
                <div className="text-sm text-muted-foreground">
                  Total Activities
                </div>
                <div className="text-xl font-medium">130</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-orange-500" />
              <div>
                <div className="text-sm text-muted-foreground">
                  Team Members
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
            placeholder="Search projects or subprojects..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        {/* <Select value={projectFilter} onValueChange={setProjectFilter}> */}
        <Select>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filter by project" />
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
        {/* <Select value={locationFilter} onValueChange={setLocationFilter}> */}
        <Select>
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder="Location" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Locations</SelectItem>
            {/* {locations.map((location) => (
              <SelectItem key={location} value={location}>
                {location}
              </SelectItem>
            ))} */}
          </SelectContent>
        </Select>
      </div>

      {/* Aggregated Table */}
      <Card>
        <ScrollArea className="h-[600px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
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
                  <TableCell>{item.status ?? "—"}</TableCell>
                  <TableCell className="text-right">
                    <Button onClick={() => handleSelect(item)} size="sm">
                      Select
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
          <h3 className="font-medium mb-2">No items available</h3>
          <p className="text-muted-foreground">
            Try adjusting your search criteria.
          </p>
        </div>
      )}
    </div>
  );
}
