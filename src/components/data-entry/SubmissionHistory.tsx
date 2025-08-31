import { useState } from "react";
import { Button } from "../ui/button/button";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/data-display/table";

import {
  ArrowLeft,
  Search,
  Filter,
  MoreHorizontal,
  Download,
  Eye,
  Edit,
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/overlay/dropdown-menu";

interface SubmissionHistoryProps {
  onBack: () => void;
  onEditSubmission: (formId: string) => void;
}

// Mock submission data
const submissions = [
  {
    id: "sub-001",
    formId: "form-001",
    formTitle: "Community Health Assessment",
    projectName: "Active",
    subProjectName: "Community Health Screening",
    submittedDate: "2025-01-07T14:30:00Z",
    status: "submitted",
    beneficiaryId: "BEN-001234",
    submittedBy: "Arben Kosumi",
    syncStatus: "synced",
  },
  {
    id: "sub-002",
    formId: "form-002",
    formTitle: "Healthcare Service Delivery Report",
    projectName: "Cares",
    subProjectName: "Mobile Health Services",
    submittedDate: "2025-01-06T16:45:00Z",
    status: "submitted",
    beneficiaryId: "-",
    submittedBy: "Shpresa Musliu",
    syncStatus: "synced",
  },
  {
    id: "sub-003",
    formId: "form-001",
    formTitle: "Community Health Assessment",
    projectName: "Active",
    subProjectName: "Community Health Screening",
    submittedDate: "2025-01-06T09:15:00Z",
    status: "draft",
    beneficiaryId: "BEN-001235",
    submittedBy: "Fatima Gashi",
    syncStatus: "pending",
  },
  {
    id: "sub-004",
    formId: "form-003",
    formTitle: "Legal Aid Case Documentation",
    projectName: "MyRight",
    subProjectName: "Legal Support Services",
    submittedDate: "2025-01-05T11:20:00Z",
    status: "submitted",
    beneficiaryId: "BEN-001236",
    submittedBy: "Gentiana Zymberi",
    syncStatus: "synced",
  },
  {
    id: "sub-005",
    formId: "form-001",
    formTitle: "Community Health Assessment",
    projectName: "Active",
    subProjectName: "Community Health Screening",
    submittedDate: "2025-01-04T13:50:00Z",
    status: "submitted",
    beneficiaryId: "BEN-001237",
    submittedBy: "Arben Kosumi",
    syncStatus: "failed",
  },
  {
    id: "sub-006",
    formId: "form-005",
    formTitle: "Home Care Service Log",
    projectName: "Cares",
    subProjectName: "Elderly Care Program",
    submittedDate: "2025-01-03T08:30:00Z",
    status: "submitted",
    beneficiaryId: "BEN-001238",
    submittedBy: "Driton Hoxha",
    syncStatus: "synced",
  },
];

export function SubmissionHistory({
  onBack,
  onEditSubmission,
}: SubmissionHistoryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [syncFilter, setSyncFilter] = useState("all");
  const [projectFilter, setProjectFilter] = useState("all");

  // Filter submissions
  const filteredSubmissions = submissions.filter((submission) => {
    const matchesSearch =
      submission.formTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      submission.projectName
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      submission.beneficiaryId
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || submission.status === statusFilter;
    const matchesSync =
      syncFilter === "all" || submission.syncStatus === syncFilter;
    const matchesProject =
      projectFilter === "all" || submission.projectName === projectFilter;

    return matchesSearch && matchesStatus && matchesSync && matchesProject;
  });

  // Get unique projects for filter
  const projects = [...new Set(submissions.map((s) => s.projectName))];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "submitted":
        return "default";
      case "draft":
        return "secondary";
      case "rejected":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getSyncStatusIcon = (syncStatus: string) => {
    switch (syncStatus) {
      case "synced":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleRetrySync = (submissionId: string) => {
    // Implement retry sync logic
    console.log("Retrying sync for:", submissionId);
  };

  const handleDownload = (submissionId: string) => {
    // Implement download logic
    console.log("Downloading submission:", submissionId);
  };

  const handleView = (submissionId: string) => {
    // Implement view logic
    console.log("Viewing submission:", submissionId);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Forms
        </Button>
        <div>
          <h2>Submission History</h2>
          <p className="text-muted-foreground">
            View and manage your form submissions
          </p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <div>
                <div className="text-sm text-muted-foreground">Submitted</div>
                <div className="text-xl font-medium">
                  {submissions.filter((s) => s.status === "submitted").length}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-500" />
              <div>
                <div className="text-sm text-muted-foreground">Drafts</div>
                <div className="text-xl font-medium">
                  {submissions.filter((s) => s.status === "draft").length}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-blue-500" />
              <div>
                <div className="text-sm text-muted-foreground">Synced</div>
                <div className="text-xl font-medium">
                  {submissions.filter((s) => s.syncStatus === "synced").length}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500" />
              <div>
                <div className="text-sm text-muted-foreground">Failed</div>
                <div className="text-xl font-medium">
                  {submissions.filter((s) => s.syncStatus === "failed").length}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search submissions..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[140px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="submitted">Submitted</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>

          <Select value={syncFilter} onValueChange={setSyncFilter}>
            <SelectTrigger className="w-full sm:w-[140px]">
              <SelectValue placeholder="Sync Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sync</SelectItem>
              <SelectItem value="synced">Synced</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>

          <Select value={projectFilter} onValueChange={setProjectFilter}>
            <SelectTrigger className="w-full sm:w-[160px]">
              <SelectValue placeholder="Project" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              {projects.map((project) => (
                <SelectItem key={project} value={project}>
                  {project}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Submissions Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Form</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Beneficiary ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Sync Status</TableHead>
                  <TableHead>Submitted Date</TableHead>
                  <TableHead>Submitted By</TableHead>
                  <TableHead className="w-[70px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubmissions.map((submission) => (
                  <TableRow key={submission.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {submission.formTitle}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {submission.subProjectName}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{submission.projectName}</Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-sm">
                        {submission.beneficiaryId}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(submission.status)}>
                        {submission.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getSyncStatusIcon(submission.syncStatus)}
                        <span className="text-sm">{submission.syncStatus}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {formatDate(submission.submittedDate)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{submission.submittedBy}</span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleView(submission.id)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </DropdownMenuItem>
                          {submission.status === "draft" && (
                            <DropdownMenuItem
                              onClick={() =>
                                onEditSubmission(submission.formId)
                              }
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => handleDownload(submission.id)}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </DropdownMenuItem>
                          {submission.syncStatus === "failed" && (
                            <DropdownMenuItem
                              onClick={() => handleRetrySync(submission.id)}
                            >
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              Retry Sync
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {filteredSubmissions.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-medium mb-2">No submissions found</h3>
          <p className="text-muted-foreground">
            {searchQuery ||
            statusFilter !== "all" ||
            syncFilter !== "all" ||
            projectFilter !== "all"
              ? "No submissions match your current filters. Try adjusting your search criteria."
              : "You haven't submitted any forms yet. Start by filling out available forms."}
          </p>
        </div>
      )}
    </div>
  );
}
