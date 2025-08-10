import { useState } from "react";

import {
  ArrowLeft,
  Search,
  FileText,
  Calendar,
  Clock,
  Users,
  Target,
  ArrowRight,
} from "lucide-react";
import { Button } from "../ui/button/button";
import { Badge } from "../ui/data-display/badge";
import { Card, CardContent, CardHeader } from "../ui/data-display/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../ui/navigation/tabs";
import { Input } from "../ui/form/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/form/select";

interface FormActivitySelectionProps {
  subProjectId: string;
  onFormSelect: (formId: string, activityId?: string) => void;
  onBack: () => void;
}

// Mock subproject details
const subProjectDetails = {
  "sub-001": {
    id: "sub-001",
    name: "Community Health Screening",
    projectName: "Active",
    description:
      "Regular health screenings and assessments for community members",
  },
  "sub-002": {
    id: "sub-002",
    name: "Mobile Health Services",
    projectName: "Cares",
    description:
      "Mobile healthcare delivery to remote and underserved communities",
  },
  "sub-003": {
    id: "sub-003",
    name: "Legal Support Services",
    projectName: "MyRight",
    description: "Providing legal aid and support to vulnerable populations",
  },
};

// Mock forms for subprojects
const subProjectForms = {
  "sub-001": [
    {
      id: "form-001",
      title: "Community Health Assessment",
      description: "Comprehensive health screening form for community members",
      estimatedTime: "15 minutes",
      fields: 25,
      priority: "high",
      category: "Health Screening",
      lastUsed: "2025-01-07",
    },
    {
      id: "form-002",
      title: "Basic Vital Signs Check",
      description: "Quick vital signs recording for routine checkups",
      estimatedTime: "5 minutes",
      fields: 8,
      priority: "medium",
      category: "Health Screening",
      lastUsed: "2025-01-06",
    },
    {
      id: "form-003",
      title: "Community Feedback Survey",
      description: "Collect feedback from community health screening sessions",
      estimatedTime: "10 minutes",
      fields: 15,
      priority: "low",
      category: "Feedback",
      lastUsed: "2025-01-05",
    },
  ],
  "sub-002": [
    {
      id: "form-004",
      title: "Mobile Service Delivery Report",
      description: "Report on mobile healthcare services provided",
      estimatedTime: "20 minutes",
      fields: 32,
      priority: "high",
      category: "Service Delivery",
      lastUsed: "2025-01-06",
    },
    {
      id: "form-005",
      title: "Patient Registration",
      description: "Register new patients for mobile health services",
      estimatedTime: "12 minutes",
      fields: 18,
      priority: "high",
      category: "Registration",
      lastUsed: "2025-01-07",
    },
  ],
  "sub-003": [
    {
      id: "form-006",
      title: "Legal Aid Case Documentation",
      description: "Document new legal aid cases and client information",
      estimatedTime: "30 minutes",
      fields: 40,
      priority: "high",
      category: "Case Management",
      lastUsed: "2025-01-05",
    },
    {
      id: "form-007",
      title: "Legal Consultation Log",
      description: "Log details of legal consultations provided",
      estimatedTime: "15 minutes",
      fields: 22,
      priority: "medium",
      category: "Consultation",
      lastUsed: "2025-01-04",
    },
  ],
};

// Mock activities for subprojects
const subProjectActivities = {
  "sub-001": [
    {
      id: "act-001",
      title: "Weekly Health Screening - Pristina Center",
      description: "Regular weekly health screenings at the community center",
      status: "ongoing",
      startDate: "2025-01-01",
      endDate: "2025-03-31",
      participantsTarget: 150,
      participantsCurrent: 89,
    },
    {
      id: "act-002",
      title: "Mobile Health Unit - Rural Areas",
      description: "Mobile health screening in rural communities",
      status: "ongoing",
      startDate: "2025-01-15",
      endDate: "2025-06-30",
      participantsTarget: 200,
      participantsCurrent: 45,
    },
  ],
  "sub-002": [
    {
      id: "act-003",
      title: "Elder Care Home Visits",
      description: "Regular home visits for elderly care services",
      status: "ongoing",
      startDate: "2024-12-01",
      endDate: "2025-05-31",
      participantsTarget: 80,
      participantsCurrent: 62,
    },
  ],
  "sub-003": [
    {
      id: "act-004",
      title: "Legal Rights Workshop Series",
      description: "Educational workshops on legal rights and procedures",
      status: "planning",
      startDate: "2025-02-01",
      endDate: "2025-04-30",
      participantsTarget: 100,
      participantsCurrent: 0,
    },
  ],
};

export function FormActivitySelection({
  subProjectId,
  onFormSelect,
  onBack,
}: FormActivitySelectionProps) {
  const [selectedActivityId, setSelectedActivityId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const subProject =
    subProjectDetails[subProjectId as keyof typeof subProjectDetails];
  const forms =
    subProjectForms[subProjectId as keyof typeof subProjectForms] || [];
  const activities =
    subProjectActivities[subProjectId as keyof typeof subProjectActivities] ||
    [];

  if (!subProject) {
    return (
      <div className="text-center py-12">
        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="font-medium mb-2">SubProject not found</h3>
        <p className="text-muted-foreground mb-4">
          The requested subproject could not be loaded.
        </p>
        <Button onClick={onBack}>Go Back</Button>
      </div>
    );
  }

  // Filter forms based on search and category
  const filteredForms = forms.filter((form) => {
    const matchesSearch =
      form.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      form.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || form.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Get unique categories
  const categories = [...new Set(forms.map((form) => form.category))];

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ongoing":
        return "default";
      case "planning":
        return "secondary";
      case "completed":
        return "outline";
      default:
        return "outline";
    }
  };

  const handleFormSelect = (formId: string) => {
    onFormSelect(formId, selectedActivityId || undefined);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to SubProjects
        </Button>
        <div>
          <h2>{subProject.name}</h2>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Badge variant="outline">{subProject.projectName}</Badge>
            <span>•</span>
            <span>{subProject.description}</span>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-500" />
              <div>
                <div className="text-sm text-muted-foreground">
                  Available Forms
                </div>
                <div className="text-xl font-medium">{forms.length}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-green-500" />
              <div>
                <div className="text-sm text-muted-foreground">Activities</div>
                <div className="text-xl font-medium">{activities.length}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-purple-500" />
              <div>
                <div className="text-sm text-muted-foreground">
                  Target Participants
                </div>
                <div className="text-xl font-medium">
                  {activities.reduce(
                    (sum, act) => sum + act.participantsTarget,
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
                  Current Participants
                </div>
                <div className="text-xl font-medium">
                  {activities.reduce(
                    (sum, act) => sum + act.participantsCurrent,
                    0
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="forms" className="space-y-6">
        <TabsList>
          <TabsTrigger value="forms">Select Form</TabsTrigger>
          <TabsTrigger value="activities">
            Select Activity (Optional)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="forms" className="space-y-6">
          {/* Form Filters */}
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
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
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
                        <Badge variant="outline">{form.category}</Badge>
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
                      Last used: {new Date(form.lastUsed).toLocaleDateString()}
                    </div>
                    <Button onClick={() => handleFormSelect(form.id)}>
                      Select Form
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
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
                {searchQuery || categoryFilter !== "all"
                  ? "No forms match your current filters. Try adjusting your search criteria."
                  : "No forms are available for this subproject yet."}
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="activities" className="space-y-6">
          <div className="mb-4">
            <h3 className="font-medium mb-2">Select Activity (Optional)</h3>
            <p className="text-sm text-muted-foreground">
              You can optionally associate your form submission with a specific
              activity. This helps with better organization and reporting.
            </p>
          </div>

          {/* Activity Selection */}
          <div className="space-y-4">
            <div
              className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => setSelectedActivityId("")}
            >
              <input
                type="radio"
                checked={selectedActivityId === ""}
                onChange={() => setSelectedActivityId("")}
                className="mr-2"
              />
              <div>
                <div className="font-medium">No specific activity</div>
                <div className="text-sm text-muted-foreground">
                  Submit form without associating it to any activity
                </div>
              </div>
            </div>

            {activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => setSelectedActivityId(activity.id)}
              >
                <input
                  type="radio"
                  checked={selectedActivityId === activity.id}
                  onChange={() => setSelectedActivityId(activity.id)}
                  className="mr-2"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium">{activity.title}</h4>
                    <Badge variant={getStatusColor(activity.status)}>
                      {activity.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {activity.description}
                  </p>
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    <span>
                      Start: {new Date(activity.startDate).toLocaleDateString()}
                    </span>
                    <span>
                      End: {new Date(activity.endDate).toLocaleDateString()}
                    </span>
                    <span>
                      Participants: {activity.participantsCurrent}/
                      {activity.participantsTarget}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {activities.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium mb-2">No activities available</h3>
              <p className="text-muted-foreground">
                No activities are currently available for this subproject.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Selected Activity Summary */}
      {selectedActivityId && (
        <Card className="border-green-200 bg-green-50/50">
          <CardContent className="p-4">
            <h4 className="font-medium text-green-800 mb-1">
              Selected Activity
            </h4>
            <p className="text-sm text-green-700">
              Your form submission will be associated with:{" "}
              {activities.find((a) => a.id === selectedActivityId)?.title}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
