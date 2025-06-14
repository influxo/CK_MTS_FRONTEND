import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  CheckCircle,
  Clock,
  FileDown,
  KeyRound,
  LockKeyhole,
  Mail,
  MailCheck,
  Pencil,
  Save,
  Shield,
  ShieldCheck,
  Smartphone,
  Trash,
  User,
} from "lucide-react";
import { useState } from "react";
import { Avatar, AvatarFallback } from "../ui/data-display/avatar";
import { Badge } from "../ui/data-display/badge";
import { Button } from "../ui/button/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/data-display/card";
import { Checkbox } from "../ui/form/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/overlay/dialog";
import { Input } from "../ui/form/input";
import { Label } from "../ui/form/label";
import { ScrollArea } from "../ui/layout/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/form/select";
import { Separator } from "../ui/layout/separator";
import { Switch } from "../ui/form/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/data-display/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/navigation/tabs";

// Mock data for an employee
const mockEmployee = {
  id: "emp-001",
  name: "Jane Smith",
  email: "jane.smith@example.com",
  role: "Program Manager",
  status: "active",
  phone: "+1 (555) 123-4567",
  lastActive: "2025-05-22T10:15:00",
  projects: ["Rural Healthcare Initiative", "Community Development"],
  subProjects: ["Maternal Health Services", "Water Access Program"],
  twoFactorEnabled: true,
  createdAt: "2025-01-10T09:00:00",
  createdBy: "Michael Lee",
  lastUpdated: "2025-05-10T14:30:00",
  lastUpdatedBy: "Thomas Brown",
  permissions: [
    { id: "perm-001", name: "View all projects", granted: true },
    { id: "perm-002", name: "Edit projects", granted: true },
    { id: "perm-003", name: "Invite employees", granted: true },
    { id: "perm-004", name: "Delete projects", granted: false },
    { id: "perm-005", name: "Admin access", granted: false },
    { id: "perm-006", name: "Manage users", granted: false },
    { id: "perm-007", name: "View reports", granted: true },
    { id: "perm-008", name: "Edit reports", granted: true },
    { id: "perm-009", name: "View forms", granted: true },
    { id: "perm-010", name: "Edit forms", granted: true },
    { id: "perm-011", name: "View beneficiaries", granted: true },
    { id: "perm-012", name: "Edit beneficiaries", granted: true },
    { id: "perm-013", name: "Export data", granted: true },
  ],
};

// Mock activity logs
const mockActivityLogs = [
  {
    id: "log-001",
    action: "Project Assignment",
    description: "Assigned to Community Development project",
    timestamp: "2025-05-15T09:30:00",
    performedBy: "Thomas Brown",
  },
  {
    id: "log-002",
    action: "Login",
    description: "Logged in from 192.168.1.1",
    timestamp: "2025-05-22T10:15:00",
    performedBy: "Jane Smith",
  },
  {
    id: "log-003",
    action: "Form Submission",
    description: "Submitted Monthly Progress Report",
    timestamp: "2025-05-10T14:45:00",
    performedBy: "Jane Smith",
  },
  {
    id: "log-004",
    action: "Project Assignment",
    description: "Assigned to Rural Healthcare Initiative project",
    timestamp: "2025-02-20T11:30:00",
    performedBy: "Michael Lee",
  },
  {
    id: "log-005",
    action: "Permission Update",
    description: "Granted 'Edit reports' permission",
    timestamp: "2025-03-15T16:20:00",
    performedBy: "Thomas Brown",
  },
  {
    id: "log-006",
    action: "2FA Setup",
    description: "Enabled two-factor authentication",
    timestamp: "2025-02-25T09:15:00",
    performedBy: "Jane Smith",
  },
  {
    id: "log-007",
    action: "Password Reset",
    description: "Requested password reset",
    timestamp: "2025-04-10T08:30:00",
    performedBy: "Jane Smith",
  },
];

// Mock projects data
const mockProjects = [
  {
    id: "proj-001",
    title: "Rural Healthcare Initiative",
    subProjects: [
      { id: "sub-001", title: "Maternal Health Services" },
      { id: "sub-002", title: "Child Vaccination Campaign" },
      { id: "sub-004", title: "Nutrition Support" },
    ],
  },
  {
    id: "proj-002",
    title: "Community Development",
    subProjects: [
      { id: "sub-003", title: "Water Access Program" },
      { id: "sub-005", title: "Food Security Initiative" },
    ],
  },
  {
    id: "proj-003",
    title: "Youth Empowerment Program",
    subProjects: [
      { id: "sub-006", title: "Education Support" },
      { id: "sub-007", title: "Skills Training" },
    ],
  },
];

// Mock roles
const mockRoles = [
  "Super Admin",
  "Admin",
  "Program Manager",
  "Field Staff",
  "Data Analyst",
];

interface EmployeeDetailsProps {
  employeeId: string;
  onBack: () => void;
}

export function EmployeeDetails({ employeeId, onBack }: EmployeeDetailsProps) {
  // In a real app, we would fetch the employee data based on employeeId
  // For this demo, we're using mock data
  const employee = mockEmployee;
  console.log("employeeId test me i ik unused declaration", employeeId);
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordResetDialog, setShowPasswordResetDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Editable employee state
  const [formData, setFormData] = useState({
    name: employee.name,
    email: employee.email,
    phone: employee.phone,
    role: employee.role,
    status: employee.status,
    twoFactorEnabled: employee.twoFactorEnabled,
    projects: employee.projects,
    subProjects: employee.subProjects,
  });

  // Project selection state
  const [selectedProjects, setSelectedProjects] = useState<string[]>(
    employee.projects
  );
  const [selectedSubProjects, setSelectedSubProjects] = useState<string[]>(
    employee.subProjects
  );

  // Permission state
  const [permissions, setPermissions] = useState(employee.permissions);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle role change
  const handleRoleChange = (value: string) => {
    setFormData((prev) => ({ ...prev, role: value }));
  };

  // Handle status change
  const handleStatusChange = (value: string) => {
    setFormData((prev) => ({ ...prev, status: value }));
  };

  // Handle 2FA toggle
  const handle2FAToggle = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, twoFactorEnabled: checked }));
  };

  // Handle project selection
  const handleProjectToggle = (projectTitle: string) => {
    setSelectedProjects((prev) => {
      if (prev.includes(projectTitle)) {
        return prev.filter((p) => p !== projectTitle);
      } else {
        return [...prev, projectTitle];
      }
    });
  };

  // Handle sub-project selection
  const handleSubProjectToggle = (subProjectTitle: string) => {
    setSelectedSubProjects((prev) => {
      if (prev.includes(subProjectTitle)) {
        return prev.filter((sp) => sp !== subProjectTitle);
      } else {
        return [...prev, subProjectTitle];
      }
    });
  };

  // Handle permission toggle
  const handlePermissionToggle = (permId: string) => {
    setPermissions((prev) =>
      prev.map((p) => (p.id === permId ? { ...p, granted: !p.granted } : p))
    );
  };

  // Start editing
  const handleEditClick = () => {
    setIsEditing(true);
  };

  // Save changes
  const handleSaveClick = () => {
    // In a real app, we would call an API to update the employee
    // Update the form data with the selected projects and sub-projects
    setFormData((prev) => ({
      ...prev,
      projects: selectedProjects,
      subProjects: selectedSubProjects,
    }));

    // Exit edit mode
    setIsEditing(false);
  };

  // Cancel editing
  const handleCancelClick = () => {
    // Reset form data to original employee data
    setFormData({
      name: employee.name,
      email: employee.email,
      phone: employee.phone,
      role: employee.role,
      status: employee.status,
      twoFactorEnabled: employee.twoFactorEnabled,
      projects: employee.projects,
      subProjects: employee.subProjects,
    });

    // Reset project selections
    setSelectedProjects(employee.projects);
    setSelectedSubProjects(employee.subProjects);

    // Reset permissions
    setPermissions(employee.permissions);

    // Exit edit mode
    setIsEditing(false);
  };

  // Handle password reset
  const handlePasswordReset = () => {
    // In a real app, we would call an API to reset the password
    console.log("Resetting password for:", employee.email);
    setShowPasswordResetDialog(false);
  };

  // Handle delete employee
  const handleDeleteEmployee = () => {
    // In a real app, we would call an API to delete the employee
    console.log("Deleting employee:", employee.id);
    setShowDeleteDialog(false);
    onBack(); // Navigate back to the list
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Format datetime for display
  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Employees
          </Button>
          <h2>Employee Details</h2>
        </div>
        <div className="flex gap-2">
          {!isEditing ? (
            <>
              <Button
                variant="outline"
                onClick={() => setShowPasswordResetDialog(true)}
              >
                <KeyRound className="h-4 w-4 mr-2" />
                Reset Password
              </Button>
              <Button variant="outline" onClick={handleEditClick}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button
                variant="destructive"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={handleCancelClick}>
                Cancel
              </Button>
              <Button onClick={handleSaveClick}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <Card className="col-span-12 lg:col-span-3">
          <CardHeader className="text-center">
            <Avatar className="h-24 w-24 mx-auto">
              <AvatarFallback className="text-2xl">
                {employee.name
                  .split(" ")
                  .map((name) => name[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <CardTitle className="mt-4">{employee.name}</CardTitle>
            <CardDescription>{employee.email}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Status</span>
                {employee.status === "active" ? (
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                    Active
                  </Badge>
                ) : employee.status === "pending" ? (
                  <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400">
                    Pending
                  </Badge>
                ) : (
                  <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400">
                    Inactive
                  </Badge>
                )}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Role</span>
                <Badge variant="outline">{employee.role}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Two-Factor Auth</span>
                {employee.twoFactorEnabled ? (
                  <Badge
                    variant="outline"
                    className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                  >
                    Enabled
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400"
                  >
                    Disabled
                  </Badge>
                )}
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Member since:</span>
                <span>{formatDate(employee.createdAt)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Last active:</span>
                <span>{formatDate(employee.lastActive)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Created by:</span>
                <span>{employee.createdBy}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Pencil className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Last updated:</span>
                <span>{formatDate(employee.lastUpdated)}</span>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <h4 className="text-sm font-medium">Quick Actions</h4>
              <div className="grid grid-cols-1 gap-2">
                <Button variant="outline" size="sm" className="justify-start">
                  <Mail className="h-4 w-4 mr-2" />
                  Send Email
                </Button>
                <Button variant="outline" size="sm" className="justify-start">
                  <Shield className="h-4 w-4 mr-2" />
                  View Permissions
                </Button>
                <Button variant="outline" size="sm" className="justify-start">
                  <FileDown className="h-4 w-4 mr-2" />
                  Export Data
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="col-span-12 lg:col-span-9 space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-transparent w-full justify-start border-b rounded-none p-0 h-10">
              <TabsTrigger
                value="profile"
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none border-b-2 border-transparent px-4 h-10"
              >
                Profile
              </TabsTrigger>
              <TabsTrigger
                value="permissions"
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none border-b-2 border-transparent px-4 h-10"
              >
                Permissions
              </TabsTrigger>
              <TabsTrigger
                value="projects"
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none border-b-2 border-transparent px-4 h-10"
              >
                Projects
              </TabsTrigger>
              <TabsTrigger
                value="security"
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none border-b-2 border-transparent px-4 h-10"
              >
                Security
              </TabsTrigger>
              <TabsTrigger
                value="activity"
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none border-b-2 border-transparent px-4 h-10"
              >
                Activity Log
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-6 pt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">Role</Label>
                      {isEditing ? (
                        <Select
                          value={formData.role}
                          onValueChange={handleRoleChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            {mockRoles.map((role) => (
                              <SelectItem key={role} value={role}>
                                {role}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input id="role" value={formData.role} disabled />
                      )}
                    </div>
                    {isEditing && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="status">Status</Label>
                          <Select
                            value={formData.status}
                            onValueChange={handleStatusChange}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="inactive">Inactive</SelectItem>
                              <SelectItem value="pending">Pending</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="twoFactor">
                            Two-Factor Authentication
                          </Label>
                          <Switch
                            id="twoFactor"
                            checked={formData.twoFactorEnabled}
                            onCheckedChange={handle2FAToggle}
                          />
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="permissions" className="space-y-6 pt-6">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-lg">
                        User Permissions
                      </CardTitle>
                      <CardDescription>
                        Define what this employee can access and modify in the
                        system.
                      </CardDescription>
                    </div>
                    {isEditing && (
                      <Button variant="outline" size="sm">
                        Select All
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {permissions.map((permission) => (
                      <div
                        key={permission.id}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={permission.id}
                          checked={permission.granted}
                          onCheckedChange={() =>
                            handlePermissionToggle(permission.id)
                          }
                          disabled={!isEditing}
                        />
                        <Label
                          htmlFor={permission.id}
                          className={`font-normal ${
                            !permission.granted && "text-muted-foreground"
                          }`}
                        >
                          {permission.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="bg-amber-50 border border-amber-200 rounded-md p-4 flex items-start gap-3 dark:bg-amber-950/20 dark:border-amber-900">
                <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
                <div>
                  <h4 className="font-medium text-amber-800 dark:text-amber-400">
                    Permission Changes
                  </h4>
                  <p className="text-amber-800/80 text-sm mt-1 dark:text-amber-400/80">
                    Changes to permissions will take effect immediately. Make
                    sure you understand the implications of each permission.
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="projects" className="space-y-6 pt-6">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-lg">
                        Project Assignments
                      </CardTitle>
                      <CardDescription>
                        Manage which projects and sub-projects this employee has
                        access to.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {isEditing && (
                      <div className="flex items-center space-x-2 mb-6">
                        <Checkbox
                          id="all-projects"
                          checked={selectedProjects.includes("All Projects")}
                          onCheckedChange={(checked: any) => {
                            if (checked) {
                              setSelectedProjects(["All Projects"]);
                              setSelectedSubProjects(["All Sub-Projects"]);
                            } else {
                              setSelectedProjects([]);
                              setSelectedSubProjects([]);
                            }
                          }}
                        />
                        <Label htmlFor="all-projects" className="font-medium">
                          Grant Access to All Projects
                        </Label>
                      </div>
                    )}

                    {!isEditing && selectedProjects.includes("All Projects") ? (
                      <div className="bg-primary/5 p-4 rounded-md border">
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="h-5 w-5 text-primary" />
                          <span className="font-medium">
                            This employee has access to all projects and
                            sub-projects
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {mockProjects.map((project) => (
                          <div
                            key={project.id}
                            className="border rounded-md p-4"
                          >
                            <div className="flex items-center space-x-2 mb-4">
                              <Checkbox
                                id={project.id}
                                checked={selectedProjects.includes(
                                  project.title
                                )}
                                onCheckedChange={() =>
                                  handleProjectToggle(project.title)
                                }
                                disabled={
                                  !isEditing ||
                                  selectedProjects.includes("All Projects")
                                }
                              />
                              <Label
                                htmlFor={project.id}
                                className="font-medium"
                              >
                                {project.title}
                              </Label>
                            </div>

                            <div className="pl-6 border-l ml-2 space-y-2">
                              {project.subProjects.map((subProject) => (
                                <div
                                  key={subProject.id}
                                  className="flex items-center space-x-2"
                                >
                                  <Checkbox
                                    id={subProject.id}
                                    checked={
                                      selectedProjects.includes(
                                        "All Projects"
                                      ) ||
                                      selectedSubProjects.includes(
                                        subProject.title
                                      )
                                    }
                                    onCheckedChange={() =>
                                      handleSubProjectToggle(subProject.title)
                                    }
                                    disabled={
                                      !isEditing ||
                                      selectedProjects.includes(
                                        "All Projects"
                                      ) ||
                                      !selectedProjects.includes(project.title)
                                    }
                                  />
                                  <Label
                                    htmlFor={subProject.id}
                                    className="font-normal"
                                  >
                                    {subProject.title}
                                  </Label>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="space-y-6 pt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Account Security</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="border rounded-md p-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <LockKeyhole className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium">Password</h4>
                          <p className="text-sm text-muted-foreground">
                            Last changed 3 months ago
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => setShowPasswordResetDialog(true)}
                      >
                        Reset Password
                      </Button>
                    </div>
                  </div>

                  <div className="border rounded-md p-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <Smartphone className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium">
                            Two-Factor Authentication
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {formData.twoFactorEnabled
                              ? "Enabled via authenticator app"
                              : "Not enabled"}
                          </p>
                        </div>
                      </div>
                      {isEditing ? (
                        <Switch
                          checked={formData.twoFactorEnabled}
                          onCheckedChange={handle2FAToggle}
                        />
                      ) : (
                        <Button variant="outline" disabled={!isEditing}>
                          {formData.twoFactorEnabled ? "Disable" : "Enable"}
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="border rounded-md p-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <MailCheck className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium">Email Verification</h4>
                          <p className="text-sm text-muted-foreground">
                            Email is verified
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    </div>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-md p-4 flex items-start gap-3 dark:bg-amber-950/20 dark:border-amber-900">
                    <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-amber-800 dark:text-amber-400">
                        Security Recommendation
                      </h4>
                      <p className="text-amber-800/80 text-sm mt-1 dark:text-amber-400/80">
                        Two-factor authentication is highly recommended for all
                        users, especially those with administrative access.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity" className="space-y-6 pt-6">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-lg">Activity Log</CardTitle>
                      <CardDescription>
                        Recent actions performed by or affecting this employee.
                      </CardDescription>
                    </div>
                    <Button variant="outline" size="sm">
                      <FileDown className="h-4 w-4 mr-2" />
                      Export Log
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Action</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Performed By</TableHead>
                          <TableHead>Timestamp</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {mockActivityLogs.map((log) => (
                          <TableRow key={log.id}>
                            <TableCell className="font-medium">
                              {log.action}
                            </TableCell>
                            <TableCell>{log.description}</TableCell>
                            <TableCell>{log.performedBy}</TableCell>
                            <TableCell>
                              {formatDateTime(log.timestamp)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Dialog
        open={showPasswordResetDialog}
        onOpenChange={setShowPasswordResetDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              This will send a password reset link to the employee's email
              address.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="flex items-center space-x-3">
              <Avatar>
                <AvatarFallback>
                  {employee.name
                    .split(" ")
                    .map((name) => name[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{employee.name}</p>
                <p className="text-sm text-muted-foreground">
                  {employee.email}
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowPasswordResetDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handlePasswordReset}>Send Reset Link</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Employee</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this employee? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="flex items-center space-x-3 mb-4">
              <Avatar>
                <AvatarFallback>
                  {employee.name
                    .split(" ")
                    .map((name) => name[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{employee.name}</p>
                <p className="text-sm text-muted-foreground">
                  {employee.email}
                </p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              All data associated with this employee will be permanently
              removed. This includes:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-sm text-muted-foreground">
              <li>Personal information</li>
              <li>Project assignments</li>
              <li>Activity history</li>
              <li>Form submissions</li>
            </ul>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteEmployee}>
              Delete Employee
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
