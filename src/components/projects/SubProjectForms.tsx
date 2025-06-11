import {
  Check,
  Cloud,
  CloudOff,
  Download,
  Eye,
  FileEdit,
  FileText,
  MoreHorizontal,
  Plus,
  X,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Checkbox } from "../ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Textarea } from "../ui/textarea";

interface SubProjectFormsProps {
  subProjectId: string;
}

// Mock forms data
const mockForms = [
  {
    id: "form-001",
    subProjectId: "sub-001",
    title: "Maternal Health Assessment",
    type: "Assessment",
    status: "active",
    submissionCount: 87,
    lastModified: "2025-05-15T09:30:00",
    createdBy: "Jane Smith",
    hasOfflineData: true,
    fields: 24,
    description: "Initial assessment form for pregnant women",
  },
  {
    id: "form-002",
    subProjectId: "sub-001",
    title: "Prenatal Checkup",
    type: "Service Delivery",
    status: "active",
    submissionCount: 156,
    lastModified: "2025-05-10T14:20:00",
    createdBy: "Robert Johnson",
    hasOfflineData: false,
    fields: 18,
    description: "Regular checkup form for pregnant women",
  },
  {
    id: "form-003",
    subProjectId: "sub-001",
    title: "Health Education Session",
    type: "Activity",
    status: "active",
    submissionCount: 42,
    lastModified: "2025-05-08T11:15:00",
    createdBy: "Jane Smith",
    hasOfflineData: true,
    fields: 15,
    description: "Form to record health education sessions conducted",
  },
  {
    id: "form-004",
    subProjectId: "sub-002",
    title: "Vaccination Record",
    type: "Service Delivery",
    status: "active",
    submissionCount: 204,
    lastModified: "2025-05-12T10:45:00",
    createdBy: "Robert Johnson",
    hasOfflineData: false,
    fields: 12,
    description: "Form to record vaccinations administered to children",
  },
  {
    id: "form-005",
    subProjectId: "sub-001",
    title: "Postpartum Follow-up",
    type: "Service Delivery",
    status: "inactive",
    submissionCount: 32,
    lastModified: "2025-04-25T15:30:00",
    createdBy: "Jane Smith",
    hasOfflineData: false,
    fields: 20,
    description: "Follow-up assessment for new mothers after delivery",
  },
];

// Mock form submission data
const mockSubmissions = [
  {
    id: "sub-1001",
    formId: "form-001",
    date: "2025-05-24T09:15:00",
    submittedBy: "Field Worker 1",
    status: "submitted",
    synced: true,
    beneficiary: "Patient ID-4531",
  },
  {
    id: "sub-1002",
    formId: "form-001",
    date: "2025-05-24T11:30:00",
    submittedBy: "Field Worker 2",
    status: "submitted",
    synced: true,
    beneficiary: "Patient ID-4532",
  },
  {
    id: "sub-1003",
    formId: "form-001",
    date: "2025-05-23T14:45:00",
    submittedBy: "Field Worker 1",
    status: "error",
    synced: false,
    beneficiary: "Patient ID-4533",
  },
  {
    id: "sub-1004",
    formId: "form-001",
    date: "2025-05-23T16:20:00",
    submittedBy: "Field Worker 3",
    status: "pending",
    synced: false,
    beneficiary: "Patient ID-4534",
  },
  {
    id: "sub-1005",
    formId: "form-001",
    date: "2025-05-22T10:10:00",
    submittedBy: "Field Worker 2",
    status: "submitted",
    synced: true,
    beneficiary: "Patient ID-4535",
  },
];

export function SubProjectForms({ subProjectId }: SubProjectFormsProps) {
  const [activeTab, setActiveTab] = useState("all-forms");
  const [isCreateFormDialogOpen, setIsCreateFormDialogOpen] = useState(false);

  // Filter forms for this sub-project
  const filteredForms = mockForms.filter(
    (form) => form.subProjectId === subProjectId
  );

  // Form submissions for this sub-project's forms
  const filteredSubmissions = mockSubmissions.filter((submission) =>
    filteredForms.some((form) => form.id === submission.formId)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3>Forms & Data Collection</h3>
          <p className="text-muted-foreground">
            Manage forms and view submissions
          </p>
        </div>
        <Dialog
          open={isCreateFormDialogOpen}
          onOpenChange={setIsCreateFormDialogOpen}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create New Form
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Create New Form</DialogTitle>
              <DialogDescription>
                Configure a new data collection form for this sub-project.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="form-title" className="text-right">
                  Form Title *
                </Label>
                <Input
                  id="form-title"
                  className="col-span-3"
                  placeholder="Enter form title"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="form-type" className="text-right">
                  Type *
                </Label>
                <Select>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select form type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="assessment">Assessment</SelectItem>
                    <SelectItem value="service-delivery">
                      Service Delivery
                    </SelectItem>
                    <SelectItem value="activity">Activity</SelectItem>
                    <SelectItem value="monitoring">Monitoring</SelectItem>
                    <SelectItem value="survey">Survey</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="form-description" className="text-right pt-2">
                  Description
                </Label>
                <Textarea
                  id="form-description"
                  className="col-span-3"
                  placeholder="Brief description of this form"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <div className="text-right pt-2">
                  <Label>Options</Label>
                </div>
                <div className="col-span-3 space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="offline-collection" defaultChecked />
                    <label htmlFor="offline-collection">
                      Enable offline data collection
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="require-gps" />
                    <label htmlFor="require-gps">Require GPS location</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="attach-media" />
                    <label htmlFor="attach-media">
                      Allow photo/media attachments
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="require-beneficiary" defaultChecked />
                    <label htmlFor="require-beneficiary">
                      Require beneficiary association
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsCreateFormDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={() => setIsCreateFormDialogOpen(false)}>
                Create Form & Design Fields
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all-forms">All Forms</TabsTrigger>
          <TabsTrigger value="submissions">Recent Submissions</TabsTrigger>
          <TabsTrigger value="offline-data">Offline Data</TabsTrigger>
        </TabsList>

        <TabsContent value="all-forms" className="pt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">Form</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submissions</TableHead>
                <TableHead>Fields</TableHead>
                <TableHead>Created By</TableHead>
                <TableHead>Last Modified</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredForms.map((form) => (
                <TableRow key={form.id}>
                  <TableCell>
                    <div className="font-medium">{form.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {form.description}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{form.type}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        form.status === "active" ? "default" : "secondary"
                      }
                    >
                      {form.status === "active" ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>{form.submissionCount}</TableCell>
                  <TableCell>{form.fields}</TableCell>
                  <TableCell>{form.createdBy}</TableCell>
                  <TableCell>
                    {new Date(form.lastModified).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
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
                          <DropdownMenuItem>
                            <FileEdit className="h-4 w-4 mr-2" />
                            Edit Form
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="h-4 w-4 mr-2" />
                            Export Data
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <FileText className="h-4 w-4 mr-2" />
                            View Submissions
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            Disable Form
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>

        <TabsContent value="submissions" className="pt-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4>Recent Form Submissions</h4>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export All
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Form</TableHead>
                  <TableHead>Beneficiary</TableHead>
                  <TableHead>Submitted By</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubmissions.map((submission) => {
                  const form = mockForms.find(
                    (f) => f.id === submission.formId
                  );
                  return (
                    <TableRow key={submission.id}>
                      <TableCell>
                        {new Date(submission.date).toLocaleString()}
                      </TableCell>
                      <TableCell>{form?.title || "Unknown Form"}</TableCell>
                      <TableCell>{submission.beneficiary}</TableCell>
                      <TableCell>{submission.submittedBy}</TableCell>
                      <TableCell>
                        {submission.status === "submitted" ? (
                          <Badge
                            variant="outline"
                            className="flex items-center gap-1"
                          >
                            <Check className="h-3 w-3 text-green-500" />
                            Submitted
                          </Badge>
                        ) : submission.status === "error" ? (
                          <Badge
                            variant="destructive"
                            className="flex items-center gap-1"
                          >
                            <X className="h-3 w-3" />
                            Error
                          </Badge>
                        ) : (
                          <Badge
                            variant="secondary"
                            className="flex items-center gap-1"
                          >
                            <Cloud className="h-3 w-3" />
                            Pending
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="offline-data" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Offline Data Synchronization</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border rounded-lg p-4 bg-muted/20">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    {filteredForms.some((form) => form.hasOfflineData) ? (
                      <CloudOff className="h-5 w-5 text-amber-500" />
                    ) : (
                      <Cloud className="h-5 w-5 text-green-500" />
                    )}
                    <h4>Offline Data Status</h4>
                  </div>
                  <Button variant="outline" size="sm">
                    Sync Now
                  </Button>
                </div>

                <div className="space-y-4">
                  {filteredForms
                    .filter((form) => form.hasOfflineData)
                    .map((form) => (
                      <div
                        key={form.id}
                        className="flex items-center justify-between border-b pb-3"
                      >
                        <div>
                          <div className="font-medium">{form.title}</div>
                          <div className="text-sm text-muted-foreground">
                            5 offline submissions waiting to sync
                          </div>
                        </div>
                        <Button size="sm" variant="outline">
                          Sync
                        </Button>
                      </div>
                    ))}

                  {!filteredForms.some((form) => form.hasOfflineData) && (
                    <div className="text-center py-4">
                      <Check className="h-10 w-10 text-green-500 mx-auto mb-2" />
                      <p>All data is synchronized! No pending offline data.</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col border rounded-lg p-4">
                <h4 className="mb-3">Offline Settings</h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="offline-enabled" defaultChecked />
                    <label htmlFor="offline-enabled">
                      Enable offline data collection for this sub-project
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="auto-sync" defaultChecked />
                    <label htmlFor="auto-sync">
                      Automatically sync when connection is available
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="media-sync" />
                    <label htmlFor="media-sync">
                      Wait for Wi-Fi to sync media (images, audio)
                    </label>
                  </div>
                </div>
                <Button className="self-end mt-4" size="sm">
                  Save Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
