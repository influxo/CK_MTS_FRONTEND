import { useState } from "react";

import {
  Search,
  Clock,
  Users,
  FileText,
  History,
  CheckCircle2,
} from "lucide-react";
import { Button } from "../ui/button/button";
import { Card, CardContent, CardHeader } from "../ui/data-display/card";
import { Input } from "../ui/form/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/form/select";
import { Badge } from "../ui/data-display/badge";

interface AvailableFormsProps {
  onFormSelect: (formId: string) => void;
  onViewHistory: () => void;
}

// Mock user associations - in real app this would come from auth/user context
const userAssociations = {
  projects: ["proj-001", "proj-002", "proj-006"], // Active, Cares, MyRight
  subProjects: ["sub-001", "sub-002", "sub-003"],
};

// Forms assigned to projects/subprojects
const availableForms = [
  {
    id: "form-001",
    title: "Community Health Assessment",
    description:
      "Monthly health screening and assessment form for community members",
    projectId: "proj-001",
    projectName: "Active",
    subProjectId: "sub-001",
    subProjectName: "Community Health Screening",
    estimatedTime: "15 minutes",
    fields: 25,
    lastSubmission: "2025-01-07",
    totalSubmissions: 47,
    status: "active",
    priority: "high",
  },
  {
    id: "form-002",
    title: "Healthcare Service Delivery Report",
    description:
      "Weekly report on healthcare services provided to beneficiaries",
    projectId: "proj-002",
    projectName: "Cares",
    subProjectId: "sub-002",
    subProjectName: "Mobile Health Services",
    estimatedTime: "20 minutes",
    fields: 32,
    lastSubmission: "2025-01-06",
    totalSubmissions: 28,
    status: "active",
    priority: "medium",
  },
  {
    id: "form-003",
    title: "Legal Aid Case Documentation",
    description: "Document new legal aid cases and client information",
    projectId: "proj-006",
    projectName: "MyRight",
    subProjectId: "sub-003",
    subProjectName: "Legal Support Services",
    estimatedTime: "30 minutes",
    fields: 40,
    lastSubmission: "2025-01-05",
    totalSubmissions: 15,
    status: "active",
    priority: "high",
  },
  {
    id: "form-004",
    title: "Community Engagement Feedback",
    description: "Collect feedback from community engagement sessions",
    projectId: "proj-001",
    projectName: "Active",
    subProjectId: "sub-001",
    subProjectName: "Community Engagement",
    estimatedTime: "10 minutes",
    fields: 18,
    lastSubmission: "2025-01-04",
    totalSubmissions: 62,
    status: "active",
    priority: "low",
  },
  {
    id: "form-005",
    title: "Home Care Service Log",
    description: "Daily log of home care services provided to elderly clients",
    projectId: "proj-002",
    projectName: "Cares",
    subProjectId: "sub-002",
    subProjectName: "Elderly Care Program",
    estimatedTime: "12 minutes",
    fields: 22,
    lastSubmission: "2025-01-03",
    totalSubmissions: 89,
    status: "active",
    priority: "medium",
  },
];

export function AvailableForms({
  onFormSelect,
  onViewHistory,
}: AvailableFormsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [projectFilter, setProjectFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  // Filter forms based on user associations and search criteria
  const filteredForms = availableForms.filter((form) => {
    const hasAccess =
      userAssociations.projects.includes(form.projectId) ||
      userAssociations.subProjects.includes(form.subProjectId);

    if (!hasAccess) return false;

    const matchesSearch =
      form.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      form.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      form.projectName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesProject =
      projectFilter === "all" || form.projectId === projectFilter;
    const matchesPriority =
      priorityFilter === "all" || form.priority === priorityFilter;

    return matchesSearch && matchesProject && matchesPriority;
  });

  // Get unique projects for filter
  const userProjects = availableForms
    .filter((form) => userAssociations.projects.includes(form.projectId))
    .reduce((acc, form) => {
      if (!acc.find((p) => p.id === form.projectId)) {
        acc.push({ id: form.projectId, name: form.projectName });
      }
      return acc;
    }, [] as Array<{ id: string; name: string }>);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "destructive";
      case "medium":
        return "default";
      case "low":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getTimeSinceLastSubmission = (lastSubmission: string) => {
    const today = new Date();
    const lastDate = new Date(lastSubmission);
    const diffTime = Math.abs(today.getTime() - lastDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return `${Math.ceil(diffDays / 30)} months ago`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2>Data Entry</h2>
          <p className="text-muted-foreground">
            Submit data for your assigned projects and subprojects
          </p>
        </div>
        <Button variant="outline" onClick={onViewHistory}>
          <History className="h-4 w-4 mr-2" />
          View Submission History
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-500" />
              <div>
                <div className="text-sm text-muted-foreground">
                  Available Forms
                </div>
                <div className="text-xl font-medium">
                  {filteredForms.length}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <div>
                <div className="text-sm text-muted-foreground">This Week</div>
                <div className="text-xl font-medium">12</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-500" />
              <div>
                <div className="text-sm text-muted-foreground">Projects</div>
                <div className="text-xl font-medium">{userProjects.length}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-500" />
              <div>
                <div className="text-sm text-muted-foreground">Avg. Time</div>
                <div className="text-xl font-medium">18 min</div>
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
            placeholder="Search forms..."
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
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Forms Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredForms.map((form) => (
          <Card
            key={form.id}
            className="overflow-hidden hover:shadow-md transition-shadow"
          >
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <h3 className="font-medium">{form.title}</h3>
                  <div className="flex gap-2 flex-wrap">
                    <Badge variant="outline">{form.projectName}</Badge>
                    <Badge
                      variant={getPriorityColor(form.priority)}
                      className="text-xs"
                    >
                      {form.priority.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground line-clamp-2">
                {form.description}
              </p>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{form.estimatedTime}</span>
                </div>
                <div className="flex items-center gap-1">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span>{form.fields} fields</span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2 border-t">
                <div className="text-xs text-muted-foreground">
                  <div>
                    Last submission:{" "}
                    {getTimeSinceLastSubmission(form.lastSubmission)}
                  </div>
                  <div>{form.totalSubmissions} total submissions</div>
                </div>
                <Button onClick={() => onFormSelect(form.id)}>Fill Form</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredForms.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-medium mb-2">No forms available</h3>
          <p className="text-muted-foreground">
            {searchQuery || projectFilter !== "all" || priorityFilter !== "all"
              ? "No forms match your current filters. Try adjusting your search criteria."
              : "You don't have access to any forms yet. Contact your administrator to get assigned to projects."}
          </p>
        </div>
      )}
    </div>
  );
}
