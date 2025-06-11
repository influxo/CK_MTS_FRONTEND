import {
  CheckCircle,
  Download,
  Eye,
  Filter,
  KeyRound,
  Mail,
  MoreHorizontal,
  Pencil,
  Search,
  Shield,
  ShieldAlert,
  SlidersHorizontal,
  Trash,
  UserCog,
  UserPlus,
  Users,
} from "lucide-react";
import { useState } from "react";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { ScrollArea } from "../ui/scroll-area";
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

// Mock data for employees
const mockEmployees = [
  {
    id: "emp-001",
    name: "Jane Smith",
    email: "jane.smith@example.com",
    role: "Program Manager",
    status: "active",
    lastActive: "2025-05-20T14:30:00",
    projects: ["Rural Healthcare Initiative", "Community Development"],
    subProjects: ["Maternal Health Services", "Water Access Program"],
    twoFactorEnabled: true,
    createdAt: "2025-01-10T09:00:00",
    permissions: ["view_all", "edit_projects", "invite_employees"],
  },
  {
    id: "emp-002",
    name: "Robert Johnson",
    email: "robert.johnson@example.com",
    role: "Field Staff",
    status: "active",
    lastActive: "2025-05-21T16:45:00",
    projects: ["Rural Healthcare Initiative"],
    subProjects: ["Maternal Health Services", "Child Vaccination Campaign"],
    twoFactorEnabled: false,
    createdAt: "2025-02-15T11:30:00",
    permissions: ["view_assigned", "edit_forms"],
  },
  {
    id: "emp-003",
    name: "Michael Lee",
    email: "michael.lee@example.com",
    role: "Admin",
    status: "active",
    lastActive: "2025-05-22T10:15:00",
    projects: ["All Projects"],
    subProjects: ["All Sub-Projects"],
    twoFactorEnabled: true,
    createdAt: "2024-12-05T08:45:00",
    permissions: ["view_all", "edit_all", "admin_access", "manage_users"],
  },
  {
    id: "emp-004",
    name: "Sarah Johnson",
    email: "sarah.johnson@example.com",
    role: "Data Analyst",
    status: "active",
    lastActive: "2025-05-20T12:30:00",
    projects: ["All Projects"],
    subProjects: [],
    twoFactorEnabled: true,
    createdAt: "2025-03-01T10:00:00",
    permissions: ["view_all", "export_data", "generate_reports"],
  },
  {
    id: "emp-005",
    name: "David Williams",
    email: "david.williams@example.com",
    role: "Field Staff",
    status: "inactive",
    lastActive: "2025-04-10T09:45:00",
    projects: ["Youth Empowerment Program"],
    subProjects: ["Education Support", "Skills Training"],
    twoFactorEnabled: false,
    createdAt: "2025-02-20T14:15:00",
    permissions: ["view_assigned", "edit_forms"],
  },
  {
    id: "emp-006",
    name: "Emily Martinez",
    email: "emily.martinez@example.com",
    role: "Field Staff",
    status: "pending",
    lastActive: null,
    projects: ["Community Development"],
    subProjects: ["Food Security Initiative"],
    twoFactorEnabled: false,
    createdAt: "2025-05-18T15:30:00",
    permissions: ["view_assigned"],
  },
  {
    id: "emp-007",
    name: "Thomas Brown",
    email: "thomas.brown@example.com",
    role: "Super Admin",
    status: "active",
    lastActive: "2025-05-22T08:30:00",
    projects: ["All Projects"],
    subProjects: ["All Sub-Projects"],
    twoFactorEnabled: true,
    createdAt: "2024-11-15T08:00:00",
    permissions: [
      "view_all",
      "edit_all",
      "admin_access",
      "manage_users",
      "system_config",
    ],
  },
  {
    id: "emp-008",
    name: "Lisa Anderson",
    email: "lisa.anderson@example.com",
    role: "Program Manager",
    status: "active",
    lastActive: "2025-05-21T11:15:00",
    projects: ["Youth Empowerment Program"],
    subProjects: ["Education Support", "Skills Training"],
    twoFactorEnabled: true,
    createdAt: "2025-01-25T13:45:00",
    permissions: ["view_all", "edit_projects", "invite_employees"],
  },
];

// Pending invitation mock data
const mockInvitations = [
  {
    id: "inv-001",
    email: "alex.taylor@example.com",
    role: "Field Staff",
    projects: ["Rural Healthcare Initiative"],
    subProjects: ["Child Vaccination Campaign"],
    invitedBy: "Jane Smith",
    invitedAt: "2025-05-20T10:30:00",
    expiresAt: "2025-05-27T10:30:00",
    status: "pending",
  },
  {
    id: "inv-002",
    email: "jessica.wilson@example.com",
    role: "Data Analyst",
    projects: ["All Projects"],
    subProjects: [],
    invitedBy: "Michael Lee",
    invitedAt: "2025-05-21T09:15:00",
    expiresAt: "2025-05-28T09:15:00",
    status: "pending",
  },
  {
    id: "inv-003",
    email: "brian.miller@example.com",
    role: "Field Staff",
    projects: ["Community Development"],
    subProjects: ["Water Access Program"],
    invitedBy: "Jane Smith",
    invitedAt: "2025-05-19T14:45:00",
    expiresAt: "2025-05-26T14:45:00",
    status: "expired",
  },
];

// Mock data for roles
const mockRoles = [
  { id: "role-001", name: "Super Admin", count: 1 },
  { id: "role-002", name: "Admin", count: 1 },
  { id: "role-003", name: "Program Manager", count: 2 },
  { id: "role-004", name: "Field Staff", count: 3 },
  { id: "role-005", name: "Data Analyst", count: 1 },
];

// Props interface
interface EmployeesListProps {
  onEmployeeSelect: (employeeId: string) => void;
  onInviteClick: () => void;
}

export function EmployeesList({
  onEmployeeSelect,
  onInviteClick,
}: EmployeesListProps) {
  const [activeTab, setActiveTab] = useState("active");
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [projectFilter, setProjectFilter] = useState("all");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<string | null>(null);

  // Filter employees based on active tab and filters
  const filteredEmployees = mockEmployees.filter((employee) => {
    // Filter by tab (active/inactive/pending)
    if (activeTab === "active" && employee.status !== "active") return false;
    if (activeTab === "inactive" && employee.status !== "inactive")
      return false;
    if (activeTab === "pending" && employee.status !== "pending") return false;

    // Filter by search query
    const matchesSearch =
      employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.role.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    // Filter by role
    if (roleFilter !== "all" && employee.role !== roleFilter) return false;

    // Filter by project
    if (
      projectFilter !== "all" &&
      !employee.projects.includes(projectFilter) &&
      employee.projects[0] !== "All Projects"
    )
      return false;

    return true;
  });

  // Get invitations based on tab
  const filteredInvitations = mockInvitations.filter((invitation) => {
    if (activeTab !== "invitations") return false;

    // Filter by search query
    const matchesSearch =
      invitation.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invitation.role.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    // Filter by role
    if (roleFilter !== "all" && invitation.role !== roleFilter) return false;

    // Filter by project
    if (
      projectFilter !== "all" &&
      !invitation.projects.includes(projectFilter) &&
      invitation.projects[0] !== "All Projects"
    )
      return false;

    return true;
  });

  // Handle delete employee
  const handleDeleteClick = (employeeId: string) => {
    setEmployeeToDelete(employeeId);
    setShowDeleteDialog(true);
  };

  // Confirm delete employee
  const confirmDelete = () => {
    console.log("Deleting employee:", employeeToDelete);
    // In a real app, we would call an API to delete the employee
    setShowDeleteDialog(false);
    setEmployeeToDelete(null);
  };

  // Handle resend invitation
  const handleResendInvite = (invitationId: string) => {
    console.log("Resending invitation:", invitationId);
    // In a real app, we would call an API to resend the invitation
  };

  // Handle cancel invitation
  const handleCancelInvite = (invitationId: string) => {
    console.log("Cancelling invitation:", invitationId);
    // In a real app, we would call an API to cancel the invitation
  };

  // Render role badge
  const renderRoleBadge = (role: string) => {
    let variant = "outline";

    if (role === "Super Admin" || role === "Admin") {
      variant = "destructive";
    } else if (role === "Program Manager") {
      variant = "default";
    }

    return (
      <Badge variant={variant as any} className="capitalize">
        {role}
      </Badge>
    );
  };

  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Never";

    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Get total count for the current tab
  const getTabCount = (tab: string) => {
    if (tab === "active") {
      return mockEmployees.filter((emp) => emp.status === "active").length;
    } else if (tab === "inactive") {
      return mockEmployees.filter((emp) => emp.status === "inactive").length;
    } else if (tab === "pending") {
      return mockEmployees.filter((emp) => emp.status === "pending").length;
    } else if (tab === "invitations") {
      return mockInvitations.length;
    }
    return 0;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2>Employees</h2>
          <p className="text-muted-foreground">
            Manage staff and their project assignments
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          >
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <Button onClick={onInviteClick}>
            <UserPlus className="h-4 w-4 mr-2" />
            Invite Employee
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 justify-between">
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search employees..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-3">
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[150px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="Super Admin">Super Admin</SelectItem>
                <SelectItem value="Admin">Admin</SelectItem>
                <SelectItem value="Program Manager">Program Manager</SelectItem>
                <SelectItem value="Field Staff">Field Staff</SelectItem>
                <SelectItem value="Data Analyst">Data Analyst</SelectItem>
              </SelectContent>
            </Select>
            <Select value={projectFilter} onValueChange={setProjectFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                <SelectItem value="Rural Healthcare Initiative">
                  Rural Healthcare
                </SelectItem>
                <SelectItem value="Community Development">
                  Community Dev
                </SelectItem>
                <SelectItem value="Youth Empowerment Program">
                  Youth Empowerment
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {showAdvancedFilters && (
        <Card className="mb-6">
          <CardContent className="py-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Two-Factor Status</Label>
                <Select defaultValue="all">
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="2FA Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="enabled">Enabled</SelectItem>
                    <SelectItem value="disabled">Disabled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Date Added</Label>
                <Select defaultValue="any">
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Date Added" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="quarter">This Quarter</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Last Active</Label>
                <Select defaultValue="any">
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Last Active" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="inactive">
                      Inactive (30+ days)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <Button variant="outline" size="sm" className="mr-2">
                Reset Filters
              </Button>
              <Button size="sm">Apply Filters</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex space-x-4 border-b">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-transparent p-0 h-10">
            <TabsTrigger
              value="active"
              className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none border-b-2 border-transparent px-4 h-10"
            >
              Active ({getTabCount("active")})
            </TabsTrigger>
            <TabsTrigger
              value="pending"
              className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none border-b-2 border-transparent px-4 h-10"
            >
              Pending ({getTabCount("pending")})
            </TabsTrigger>
            <TabsTrigger
              value="inactive"
              className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none border-b-2 border-transparent px-4 h-10"
            >
              Inactive ({getTabCount("inactive")})
            </TabsTrigger>
            <TabsTrigger
              value="invitations"
              className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none border-b-2 border-transparent px-4 h-10"
            >
              Invitations ({getTabCount("invitations")})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="pt-6">
            <Card>
              <ScrollArea className="h-[600px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[250px]">Employee</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Projects</TableHead>
                      <TableHead>Sub-Projects</TableHead>
                      <TableHead>Last Active</TableHead>
                      <TableHead>2FA</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEmployees.map((employee) => (
                      <TableRow key={employee.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback>
                                {employee.name
                                  .split(" ")
                                  .map((name) => name[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{employee.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {employee.email}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{renderRoleBadge(employee.role)}</TableCell>
                        <TableCell>
                          <div className="max-w-[200px]">
                            {employee.projects[0] === "All Projects" ? (
                              <Badge
                                variant="outline"
                                className="bg-primary/10"
                              >
                                All Projects
                              </Badge>
                            ) : (
                              <div className="space-y-1">
                                {employee.projects.map((project, index) => (
                                  <div key={index} className="text-sm truncate">
                                    {project}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-[200px]">
                            {employee.subProjects.length === 0 ? (
                              <span className="text-muted-foreground text-sm">
                                None
                              </span>
                            ) : employee.subProjects[0] ===
                              "All Sub-Projects" ? (
                              <Badge
                                variant="outline"
                                className="bg-primary/10"
                              >
                                All Sub-Projects
                              </Badge>
                            ) : (
                              <div className="space-y-1">
                                {employee.subProjects.map(
                                  (subProject, index) => (
                                    <div
                                      key={index}
                                      className="text-sm truncate"
                                    >
                                      {subProject}
                                    </div>
                                  )
                                )}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {employee.lastActive
                            ? formatDate(employee.lastActive)
                            : "Never"}
                        </TableCell>
                        <TableCell>
                          {employee.twoFactorEnabled ? (
                            <Badge
                              variant="outline"
                              className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
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
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onEmployeeSelect(employee.id)}
                            >
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
                                <DropdownMenuItem
                                  onClick={() => onEmployeeSelect(employee.id)}
                                >
                                  <Pencil className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Mail className="h-4 w-4 mr-2" />
                                  Send Email
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <KeyRound className="h-4 w-4 mr-2" />
                                  Reset Password
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Shield className="h-4 w-4 mr-2" />
                                  Manage Permissions
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => handleDeleteClick(employee.id)}
                                >
                                  <Trash className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </Card>
          </TabsContent>

          <TabsContent value="pending" className="pt-6">
            <Card>
              <ScrollArea className="h-[600px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[250px]">Employee</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Projects</TableHead>
                      <TableHead>Sub-Projects</TableHead>
                      <TableHead>Invited On</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEmployees.map((employee) => (
                      <TableRow key={employee.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback>
                                {employee.name
                                  .split(" ")
                                  .map((name) => name[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{employee.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {employee.email}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{renderRoleBadge(employee.role)}</TableCell>
                        <TableCell>
                          <div className="max-w-[200px]">
                            {employee.projects[0] === "All Projects" ? (
                              <Badge
                                variant="outline"
                                className="bg-primary/10"
                              >
                                All Projects
                              </Badge>
                            ) : (
                              <div className="space-y-1">
                                {employee.projects.map((project, index) => (
                                  <div key={index} className="text-sm truncate">
                                    {project}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-[200px]">
                            {employee.subProjects.length === 0 ? (
                              <span className="text-muted-foreground text-sm">
                                None
                              </span>
                            ) : employee.subProjects[0] ===
                              "All Sub-Projects" ? (
                              <Badge
                                variant="outline"
                                className="bg-primary/10"
                              >
                                All Sub-Projects
                              </Badge>
                            ) : (
                              <div className="space-y-1">
                                {employee.subProjects.map(
                                  (subProject, index) => (
                                    <div
                                      key={index}
                                      className="text-sm truncate"
                                    >
                                      {subProject}
                                    </div>
                                  )
                                )}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{formatDate(employee.createdAt)}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400"
                          >
                            Pending Setup
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onEmployeeSelect(employee.id)}
                            >
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
                                <DropdownMenuItem
                                  onClick={() => onEmployeeSelect(employee.id)}
                                >
                                  <Pencil className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Mail className="h-4 w-4 mr-2" />
                                  Resend Invitation
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => handleDeleteClick(employee.id)}
                                >
                                  <Trash className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </Card>
          </TabsContent>

          <TabsContent value="inactive" className="pt-6">
            <Card>
              <ScrollArea className="h-[600px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[250px]">Employee</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Projects</TableHead>
                      <TableHead>Sub-Projects</TableHead>
                      <TableHead>Last Active</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEmployees.map((employee) => (
                      <TableRow key={employee.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback>
                                {employee.name
                                  .split(" ")
                                  .map((name) => name[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{employee.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {employee.email}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{renderRoleBadge(employee.role)}</TableCell>
                        <TableCell>
                          <div className="max-w-[200px]">
                            {employee.projects[0] === "All Projects" ? (
                              <Badge
                                variant="outline"
                                className="bg-primary/10"
                              >
                                All Projects
                              </Badge>
                            ) : (
                              <div className="space-y-1">
                                {employee.projects.map((project, index) => (
                                  <div key={index} className="text-sm truncate">
                                    {project}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-[200px]">
                            {employee.subProjects.length === 0 ? (
                              <span className="text-muted-foreground text-sm">
                                None
                              </span>
                            ) : employee.subProjects[0] ===
                              "All Sub-Projects" ? (
                              <Badge
                                variant="outline"
                                className="bg-primary/10"
                              >
                                All Sub-Projects
                              </Badge>
                            ) : (
                              <div className="space-y-1">
                                {employee.subProjects.map(
                                  (subProject, index) => (
                                    <div
                                      key={index}
                                      className="text-sm truncate"
                                    >
                                      {subProject}
                                    </div>
                                  )
                                )}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {employee.lastActive
                            ? formatDate(employee.lastActive)
                            : "Never"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
                          >
                            Inactive
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onEmployeeSelect(employee.id)}
                            >
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
                                <DropdownMenuItem
                                  onClick={() => onEmployeeSelect(employee.id)}
                                >
                                  <Pencil className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Mail className="h-4 w-4 mr-2" />
                                  Send Email
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Reactivate
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => handleDeleteClick(employee.id)}
                                >
                                  <Trash className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </Card>
          </TabsContent>

          <TabsContent value="invitations" className="pt-6">
            <Card>
              <ScrollArea className="h-[600px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Projects</TableHead>
                      <TableHead>Invited By</TableHead>
                      <TableHead>Invited On</TableHead>
                      <TableHead>Expires</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInvitations.map((invitation) => (
                      <TableRow key={invitation.id}>
                        <TableCell>
                          <div className="font-medium">{invitation.email}</div>
                        </TableCell>
                        <TableCell>
                          {renderRoleBadge(invitation.role)}
                        </TableCell>
                        <TableCell>
                          <div className="max-w-[200px]">
                            {invitation.projects[0] === "All Projects" ? (
                              <Badge
                                variant="outline"
                                className="bg-primary/10"
                              >
                                All Projects
                              </Badge>
                            ) : (
                              <div className="space-y-1">
                                {invitation.projects.map((project, index) => (
                                  <div key={index} className="text-sm truncate">
                                    {project}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{invitation.invitedBy}</TableCell>
                        <TableCell>
                          {formatDate(invitation.invitedAt)}
                        </TableCell>
                        <TableCell>
                          {formatDate(invitation.expiresAt)}
                        </TableCell>
                        <TableCell>
                          {invitation.status === "pending" ? (
                            <Badge
                              variant="outline"
                              className="bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400"
                            >
                              Pending
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
                            >
                              Expired
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {invitation.status === "pending" ? (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    handleResendInvite(invitation.id)
                                  }
                                >
                                  <Mail className="h-4 w-4 mr-2" />
                                  Resend
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    handleCancelInvite(invitation.id)
                                  }
                                >
                                  <Trash className="h-4 w-4 mr-2" />
                                  Cancel
                                </Button>
                              </>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleResendInvite(invitation.id)
                                }
                              >
                                <Mail className="h-4 w-4 mr-2" />
                                Resend
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Role Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockRoles.map((role) => (
                <div
                  key={role.id}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    {role.name === "Super Admin" || role.name === "Admin" ? (
                      <ShieldAlert className="h-4 w-4 text-destructive" />
                    ) : role.name === "Program Manager" ? (
                      <UserCog className="h-4 w-4 text-primary" />
                    ) : (
                      <Users className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span>{role.name}</span>
                  </div>
                  <Badge variant="outline" className="ml-auto">
                    {role.count}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Recent Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border rounded-md p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>ML</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">Michael Lee</div>
                      <div className="text-sm text-muted-foreground">
                        Changed role of Robert Johnson from Field Staff to
                        Program Manager
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    2 hours ago
                  </div>
                </div>
              </div>

              <div className="border rounded-md p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>JS</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">Jane Smith</div>
                      <div className="text-sm text-muted-foreground">
                        Invited Alex Taylor to join as Field Staff
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    5 hours ago
                  </div>
                </div>
              </div>

              <div className="border rounded-md p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>TB</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">Thomas Brown</div>
                      <div className="text-sm text-muted-foreground">
                        Assigned Lisa Anderson to Youth Empowerment Program
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">Yesterday</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

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
            <Button variant="destructive" onClick={confirmDelete}>
              Delete Employee
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
