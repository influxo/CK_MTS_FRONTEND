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
import { Avatar, AvatarFallback } from "../ui/data-display/avatar";
import { Badge } from "../ui/data-display/badge";
import { Button } from "../ui/button/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../ui/data-display/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/overlay/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/overlay/dropdown-menu";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/data-display/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../ui/navigation/tabs";
import type { Employee as ApiEmployee } from "../../services/employees/employeesModels";
import { useTranslation } from "../../hooks/useTranslation";

// Using API data provided via props; mock employees removed.

// Pending invitation mock data
const mockInvitations: any[] = [];

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
  employees: ApiEmployee[];
  isLoading: boolean;
  error: string | null;
}

export function EmployeesList({
  onEmployeeSelect,
  onInviteClick,
  employees,
  isLoading,
  error,
}: EmployeesListProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("active");
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [projectFilter, setProjectFilter] = useState("all");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<string | null>(null);

  // Canonicalize role names for consistent display and filtering
  const normalizeRole = (raw?: string): string => {
    const n = (raw || "").toLowerCase().trim();
    if (n === "sysadmin" || n.includes("system admin"))
      return "System Administrator";
    if (n === "superadmin" || n.includes("super admin")) return "SuperAdmin";
    if (n.includes("program manager")) return "Program Manager";
    if (n.includes("sub-project manager") || n.includes("sub project manager"))
      return "Sub-Project Manager";
    if (
      n.includes("field operator") ||
      (n.includes("field") && n.includes("operator"))
    )
      return "Field Operator";
    return raw || "N/A";
  };

  const ROLE_OPTIONS = [
    "System Administrator",
    "Program Manager",
    "Sub-Project Manager",
    "Field Operator",
    "SuperAdmin",
  ];

  // Map API employees to the display shape used by the table
  const displayEmployees = employees.map((e) => ({
    id: e.id,
    name: `${e.firstName} ${e.lastName}`.trim(),
    email: e.email,
    role: normalizeRole(
      e.roles && e.roles.length > 0 ? e.roles[0].name : "N/A"
    ),
    status: e.status === "active" ? "active" : "pending",
    lastActive: e.lastLogin,
    projects: ["All Projects"],
    subProjects: [] as string[],
    twoFactorEnabled: e.twoFactorEnabled,
    createdAt: e.createdAt,
  }));

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2>{t('employees.title')}</h2>
            <p className="text-muted-foreground">{t('common.loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2>{t('employees.title')}</h2>
            <p className="text-destructive">{t('common.error')}: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  // Filter employees based on active tab and filters
  const filteredEmployees = displayEmployees.filter((employee) => {
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
    return (
      <Badge className="capitalize bg-[#2E343E] text-white border-0 hover:bg-[#2E343E]">
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
      return displayEmployees.filter((emp) => emp.status === "active").length;
    } else if (tab === "inactive") {
      return displayEmployees.filter((emp) => emp.status === "inactive").length;
    } else if (tab === "pending") {
      return displayEmployees.filter((emp) => emp.status === "pending").length;
    } else if (tab === "invitations") {
      return mockInvitations.length;
    }
    return 0;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-muted-foreground">{t('dashboard.manageStaff')}</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="bg-[#E0F2FE] border-0"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          >
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            {t('employees.filters')}
          </Button>
          <Button
            onClick={onInviteClick}
            className="bg-[#0073e6] border-0 text-white"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            {t('employees.inviteEmployee')}
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 justify-between">
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('employees.searchEmployees')}
              className="pl-9 bg-white border-gray-100 border"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-3">
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[200px] bg-white border-gray-100 border transition-transform duration-200 ease-in-out hover:scale-105 hover:-translate-y-[1px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('common.allRoles')}</SelectItem>
                {ROLE_OPTIONS.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={projectFilter} onValueChange={setProjectFilter}>
              <SelectTrigger className="w-[180px] bg-white border-gray-100 border transition-transform duration-200 ease-in-out hover:scale-105 hover:-translate-y-[1px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('common.allProjects')}</SelectItem>
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
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="bg-[#0073e6] transition-transform duration-200 ease-in-out hover:scale-105 hover:-translate-y-[1px] text-white border-0"
              >
                <Download className="h-4 w-4 mr-2" />
                {t('common.export')}
              </Button>
            </div>
          </div>
        </div>
        {/* <div className="flex gap-3">
          <Button
            variant="outline"
            className="bg-[#2E343E] text-white border-0"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div> */}
      </div>

      {showAdvancedFilters && (
        <Card className="mb-6">
          <CardContent className="py-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>{t('employees.twoFactorStatus')}</Label>
                <Select defaultValue="all">
                  <SelectTrigger className="mt-2 bg-white border-gray-100 border transition-transform duration-200 ease-in-out hover:scale-105 hover:-translate-y-[1px]">
                    <SelectValue placeholder="2FA Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('common.all')}</SelectItem>
                    <SelectItem value="enabled">{t('common.active')}</SelectItem>
                    <SelectItem value="disabled">{t('common.inactive')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t('employees.dateAdded')}</Label>
                <Select defaultValue="any">
                  <SelectTrigger className="mt-2 bg-white border-gray-100 border transition-transform duration-200 ease-in-out hover:scale-105 hover:-translate-y-[1px]">
                    <SelectValue placeholder="Date Added" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">{t('common.all')}</SelectItem>
                    <SelectItem value="today">{t('common.today')}</SelectItem>
                    <SelectItem value="week">{t('common.thisWeek')}</SelectItem>
                    <SelectItem value="month">{t('common.thisMonth')}</SelectItem>
                    <SelectItem value="quarter">{t('common.thisYear')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t('employees.lastActiveDate')}</Label>
                <Select defaultValue="any">
                  <SelectTrigger className="mt-2 bg-white border-gray-100 border transition-transform duration-200 ease-in-out hover:scale-105 hover:-translate-y-[1px]">
                    <SelectValue placeholder="Last Active" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Gjitha</SelectItem>
                    <SelectItem value="today">Sot</SelectItem>
                    <SelectItem value="week">Kjo javë</SelectItem>
                    <SelectItem value="month">Ky muaj</SelectItem>
                    <SelectItem value="inactive">
                      {t('employees.inactive30Days')}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <Button
                variant="outline"
                size="sm"
                className="mr-2 bg-[#E0F2FE] border-0"
              >
                {t('employees.resetFilters')}
              </Button>
              <Button size="sm" className="bg-[#0073e6] text-white border-0">
                {t('employees.applyFilters')}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex space-x-4 border-b">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className=" bg-[#E0F2FE]  items-center">
            <TabsTrigger
              value="active"
              className="data-[state=active]:bg-[#0073e6]  data-[state=active]:text-white"
            >
              {t('employees.allActiveEmployees')} ({getTabCount("active")})
            </TabsTrigger>
            <TabsTrigger
              value="pending"
              className="data-[state=active]:bg-[#0073e6]  data-[state=active]:text-white"
            >
              {t('employees.pendingEmployees')} ({getTabCount("pending")})
            </TabsTrigger>
            <TabsTrigger
              value="inactive"
              className="data-[state=active]:bg-[#2E343E]  data-[state=active]:text-white"
            >
              {t('employees.inactiveEmployees')} ({getTabCount("inactive")})
            </TabsTrigger>
            <TabsTrigger
              value="invitations"
              className="data-[state=active]:bg-[#2E343E]  data-[state=active]:text-white"
            >
              {t('employees.invitations')} ({getTabCount("invitations")})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="pt-6">
            <Card>
              <ScrollArea className="h-[600px]">
                <Table className="border-0">
                  <TableHeader className="bg-[#E5ECF6]">
                    <TableRow>
                      <TableHead className="w-[250px]">{t('employees.employee')}</TableHead>
                      <TableHead>{t('common.role')}</TableHead>
                      <TableHead>{t('projects.title')}</TableHead>
                      <TableHead>{t('subProjects.title')}</TableHead>
                      <TableHead>{t('employees.lastActive')}</TableHead>
                      <TableHead>{t('common.status')}</TableHead>
                      <TableHead>2FA</TableHead>
                      <TableHead className="text-right">{t('common.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="bg-[#F7F9FB]">
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
                                className="bg-[#0073e6] text-white border-0"
                              >
                                All Projects
                              </Badge>
                            ) : (
                              <div className="space-y-1">
                                {employee.projects.map(
                                  (project: string, index: number) => (
                                    <div
                                      key={index}
                                      className="text-sm truncate"
                                    >
                                      {project}
                                    </div>
                                  )
                                )}
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
                                className="bg-[#2E343E] text-white border-0 "
                              >
                                All Sub-Projects
                              </Badge>
                            ) : (
                              <div className="space-y-1">
                                {employee.subProjects.map(
                                  (subProject: string, index: number) => (
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
                            : t('common.never')}
                        </TableCell>
                        <TableCell>
                          {employee.status === "active" ? (
                            <Badge
                              variant="outline"
                              className=" text-[#4AA785] bg-[#DEF8EE] border-0"
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              {t('common.active')}
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="text-black/40 border-0 bg-black/5"
                            >
                              {t('common.pending')}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {employee.twoFactorEnabled ? (
                            <Badge
                              variant="outline"
                              className=" text-[#4AA785] bg-[#DEF8EE] border-0"
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              {t('common.enabled')}
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="text-black/40 border-0 bg-black/5"
                            >
                              {t('common.disabled')}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              className="hover:bg-[#E0F2FE] border-0"
                              variant="outline"
                              size="sm"
                              onClick={() => onEmployeeSelect(employee.id)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Shiko
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
                                  {t('employees.resetPassword')}
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Shield className="h-4 w-4 mr-2" />
                                  {t('employees.managePermissions')}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => handleDeleteClick(employee.id)}
                                >
                                  <Trash className="h-4 w-4 mr-2" />
                                  {t('common.delete')}
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
            <Card className="bg-[#F7F9FB]">
              <ScrollArea className="h-[600px]">
                <Table>
                  <TableHeader className="bg-[#E5ECF6]">
                    <TableRow>
                      <TableHead className="w-[250px]">{t('employees.employee')}</TableHead>
                      <TableHead>{t('common.role')}</TableHead>
                      <TableHead>{t('projects.title')}</TableHead>
                      <TableHead>{t('subProjects.title')}</TableHead>
                      <TableHead>{t('employees.invitedOn')}</TableHead>
                      <TableHead>{t('common.status')}</TableHead>
                      <TableHead className="text-right">{t('common.actions')}</TableHead>
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
                            className="bg-[#E2F5FF] text-[#59A8D4] border-0"
                          >
                            Pending
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              className="hover:bg-black/10 border-0"
                              variant="outline"
                              size="sm"
                              onClick={() => onEmployeeSelect(employee.id)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Shiko
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
            <Card className="bg-[#F7F9FB]">
              <ScrollArea className="h-[600px]">
                <Table>
                  <TableHeader className="bg-[#E5ECF6]">
                    <TableRow>
                      <TableHead className="w-[250px]">Punëtori</TableHead>
                      <TableHead>Roli</TableHead>
                      <TableHead>Projektet</TableHead>
                      <TableHead>Nën projektet</TableHead>
                      <TableHead>Ftuar me</TableHead>
                      <TableHead>Statusi</TableHead>
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
                            className="bg-[#EDEDFF] text-[#8A8CD9] border-0"
                          >
                            Inactive
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="hover:bg-black/10 border-0"
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
                                  className="h-8 w-8 p-0 hover:bg-black/10"
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
            <Card className="bg-[#F7F9FB]">
              <ScrollArea className="h-[600px]">
                <Table>
                  <TableHeader className="bg-[#E5ECF6]">
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Roli</TableHead>
                      <TableHead>Projektet</TableHead>
                      <TableHead>Ftuar nga</TableHead>
                      <TableHead>Ftuar me</TableHead>
                      <TableHead>Skadon</TableHead>
                      <TableHead>Statusi</TableHead>
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
                                className="bg-[#2E343E] text-white border-0"
                              >
                                All Projects
                              </Badge>
                            ) : (
                              <div className="space-y-1">
                                {invitation.projects.map(
                                  (project: string, index: number) => (
                                    <div
                                      key={index}
                                      className="text-sm truncate"
                                    >
                                      {project}
                                    </div>
                                  )
                                )}
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
                              className="bg-[#E2F5FF] text-[#59A8D4] border-0"
                            >
                              Pending
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="bg-[#FFFBD4] text-[#FFC555] border-0"
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
                                  className="bg-[#2E343E] text-white border-0"
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
                                  className="hover:bg-black/10 text-black border-0"
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
                                className="bg-[#2E343E] text-white border-0"
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

      {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-[#E5ECF6] border-0   drop-shadow-sm shadow-gray-50">
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

        <Card className="col-span-3 bg-[#F7F9FB] border-0   drop-shadow-sm shadow-gray-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Recent Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-[#E3F5FF] rounded-md p-4">
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

              <div className="bg-[#E3F5FF] rounded-md p-4">
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

              <div className="bg-[#E3F5FF] rounded-md p-4">
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
      </div> */}

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
