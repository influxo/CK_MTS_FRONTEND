import { useState } from "react";

import {
  Search,
  FolderKanban,
  Users,
  FileText,
  Calendar,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent } from "../ui/data-display/card";
import { Input } from "../ui/form/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/form/select";
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

interface SubProjectSelectionProps {
  onSubProjectSelect: (subProjectId: string) => void;
}

// Mock user access - in real app this would come from auth/user context
const userAccess = {
  projectIds: ["proj-001", "proj-002", "proj-006"], // Active, Cares, MyRight
  subProjectIds: [
    "sub-001",
    "sub-002",
    "sub-003",
    "sub-004",
    "sub-005",
    "sub-006",
  ],
};

// Available subprojects with their details
const subProjects = [
  {
    id: "sub-001",
    name: "Community Health Screening",
    projectId: "proj-001",
    projectName: "Active",
    description:
      "Regular health screenings and assessments for community members",
    status: "active",
    formsCount: 3,
    activitiesCount: 5,
    lastSubmission: "2025-01-07",
    teamSize: 8,
    location: "Pristina",
  },
  {
    id: "sub-002",
    name: "Mobile Health Services",
    projectId: "proj-002",
    projectName: "Cares",
    description:
      "Mobile healthcare delivery to remote and underserved communities",
    status: "active",
    formsCount: 4,
    activitiesCount: 7,
    lastSubmission: "2025-01-06",
    teamSize: 12,
    location: "Prizren",
  },
  {
    id: "sub-003",
    name: "Legal Support Services",
    projectId: "proj-006",
    projectName: "MyRight",
    description: "Providing legal aid and support to vulnerable populations",
    status: "active",
    formsCount: 6,
    activitiesCount: 4,
    lastSubmission: "2025-01-05",
    teamSize: 6,
    location: "Mitrovica",
  },
  {
    id: "sub-004",
    name: "Elderly Care Program",
    projectId: "proj-002",
    projectName: "Cares",
    description: "Home care services for elderly community members",
    status: "active",
    formsCount: 2,
    activitiesCount: 8,
    lastSubmission: "2025-01-04",
    teamSize: 15,
    location: "Ferizaj",
  },
  {
    id: "sub-005",
    name: "Community Engagement",
    projectId: "proj-001",
    projectName: "Active",
    description: "Building community capacity and engagement initiatives",
    status: "active",
    formsCount: 5,
    activitiesCount: 12,
    lastSubmission: "2025-01-03",
    teamSize: 10,
    location: "Gjakova",
  },
  {
    id: "sub-006",
    name: "Legal Education Outreach",
    projectId: "proj-006",
    projectName: "MyRight",
    description: "Educational programs about legal rights and procedures",
    status: "active",
    formsCount: 3,
    activitiesCount: 6,
    lastSubmission: "2025-01-02",
    teamSize: 8,
    location: "Peja",
  },
];

export function SubProjectSelection({
  onSubProjectSelect,
}: SubProjectSelectionProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [projectFilter, setProjectFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");

  // Filter subprojects based on user access and search criteria
  const filteredSubProjects = subProjects.filter((subProject) => {
    const hasAccess =
      userAccess.projectIds.includes(subProject.projectId) ||
      userAccess.subProjectIds.includes(subProject.id);

    if (!hasAccess) return false;

    const matchesSearch =
      subProject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subProject.description
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      subProject.projectName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesProject =
      projectFilter === "all" || subProject.projectId === projectFilter;
    const matchesLocation =
      locationFilter === "all" || subProject.location === locationFilter;

    return matchesSearch && matchesProject && matchesLocation;
  });

  // Get unique projects and locations for filters
  const userProjects = subProjects
    .filter((sp) => userAccess.projectIds.includes(sp.projectId))
    .reduce((acc, sp) => {
      if (!acc.find((p) => p.id === sp.projectId)) {
        acc.push({ id: sp.projectId, name: sp.projectName });
      }
      return acc;
    }, [] as Array<{ id: string; name: string }>);

  const locations = [...new Set(subProjects.map((sp) => sp.location))];

  const getTimeSinceLastSubmission = (lastSubmission: string) => {
    const today = new Date();
    const lastDate = new Date(lastSubmission);
    const diffTime = Math.abs(today.getTime() - lastDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return `${diffDays} days ago`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2>Data Entry</h2>
          <p className="text-muted-foreground">
            Select a subproject to begin data entry
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
                <div className="text-xl font-medium">
                  {filteredSubProjects.length}
                </div>
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
                <div className="text-xl font-medium">
                  {filteredSubProjects.reduce(
                    (sum, sp) => sum + sp.formsCount,
                    0
                  )}
                </div>
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
                <div className="text-xl font-medium">
                  {filteredSubProjects.reduce(
                    (sum, sp) => sum + sp.activitiesCount,
                    0
                  )}
                </div>
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
                <div className="text-xl font-medium">
                  {filteredSubProjects.reduce(
                    (sum, sp) => sum + sp.teamSize,
                    0
                  )}
                </div>
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
            placeholder="Search subprojects..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={projectFilter} onValueChange={setProjectFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filter by project" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Projects</SelectItem>
            {userProjects.map((project) => (
              <SelectItem key={project.id} value={project.id}>
                {project.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={locationFilter} onValueChange={setLocationFilter}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder="Location" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Locations</SelectItem>
            {locations.map((location) => (
              <SelectItem key={location} value={location}>
                {location}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* SubProjects Table */}
      <Card>
        <ScrollArea className="h-[600px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">Sub-Project</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Forms</TableHead>
                <TableHead>Activities</TableHead>
                <TableHead>Team</TableHead>
                <TableHead>Last</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubProjects.map((subProject) => (
                <TableRow key={subProject.id}>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">{subProject.name}</div>
                      <div className="text-sm text-muted-foreground line-clamp-1">
                        {subProject.description}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{subProject.projectName}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs">
                      {subProject.location}
                    </Badge>
                  </TableCell>
                  <TableCell>{subProject.formsCount}</TableCell>
                  <TableCell>{subProject.activitiesCount}</TableCell>
                  <TableCell>{subProject.teamSize}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {getTimeSinceLastSubmission(subProject.lastSubmission)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button onClick={() => onSubProjectSelect(subProject.id)} size="sm">
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

      {filteredSubProjects.length === 0 && (
        <div className="text-center py-12">
          <FolderKanban className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-medium mb-2">No subprojects available</h3>
          <p className="text-muted-foreground">
            {searchQuery || projectFilter !== "all" || locationFilter !== "all"
              ? "No subprojects match your current filters. Try adjusting your search criteria."
              : "You don't have access to any subprojects yet. Contact your administrator to get assigned to projects."}
          </p>
        </div>
      )}
    </div>
  );
}
