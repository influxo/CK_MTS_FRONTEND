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
  SlidersHorizontal,
  Trash,
  UserPlus,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "../../hooks/useTranslation";
import type { Employee as ApiEmployee } from "../../services/employees/employeesModels";
import type { AppDispatch } from "../../store";
import { selectCurrentUser } from "../../store/slices/authSlice";
import {
  deleteEmployee,
  selectEmployeeDeleting,
} from "../../store/slices/employeesSlice";
import { Button } from "../ui/button/button";
import { Avatar, AvatarFallback } from "../ui/data-display/avatar";
import { Badge } from "../ui/data-display/badge";
import { Card, CardContent } from "../ui/data-display/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/data-display/table";
import { Input } from "../ui/form/input";
import { Label } from "../ui/form/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/form/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../ui/navigation/tabs";
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

// Using API data provided via props; mock employees removed.

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
  const dispatch = useDispatch<AppDispatch>();
  const [activeTab, setActiveTab] = useState("active");
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [projectFilter, setProjectFilter] = useState("all");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<string | null>(null);
  const isDeleting = useSelector(selectEmployeeDeleting);

  // Current user for role checking
  const currentUser = useSelector(selectCurrentUser);

  // Determine if current user is sys or super admin
  const normalizedRoles = useMemo(
    () =>
      (currentUser?.roles || []).map((r: any) => r.name?.toLowerCase?.() || ""),
    [currentUser?.roles]
  );
  const isSysOrSuperAdmin = useMemo(() => {
    return normalizedRoles.some(
      (r: string) =>
        r === "sysadmin" ||
        r === "superadmin" ||
        r.includes("system admin") ||
        r.includes("super admin")
    );
  }, [normalizedRoles]);

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
    status:
      e.status === "active"
        ? "active"
        : e.status === "inactive"
        ? "inactive"
        : "pending",
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
            <h2>{t("employees.title")}</h2>
            <p className="text-muted-foreground">{t("common.loading")}</p>
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
            <h2>{t("employees.title")}</h2>
            <p className="text-destructive">
              {t("common.error")}: {error}
            </p>
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

  // Handle delete employee
  const handleDeleteClick = (employeeId: string) => {
    setEmployeeToDelete(employeeId);
    setShowDeleteDialog(true);
  };

  // Confirm delete employee
  const confirmDelete = async () => {
    if (!employeeToDelete) return;

    try {
      await dispatch(deleteEmployee(employeeToDelete)).unwrap();
      setShowDeleteDialog(false);
      setEmployeeToDelete(null);
    } catch (e) {
      // Error toast will be shown by the service
      console.error("Failed to delete employee", e);
      // Keep dialog open to show error
    }
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
    }
    return 0;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-muted-foreground">{t("dashboard.manageStaff")}</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="bg-[#E0F2FE] border-0"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          >
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            {t("employees.filters")}
          </Button>
          <Button
            onClick={onInviteClick}
            className="bg-[#0073e6] border-0 text-white"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            {t("employees.inviteEmployee")}
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 justify-between">
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("employees.searchEmployees")}
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
                <SelectItem value="all">{t("common.allRoles")}</SelectItem>
                {ROLE_OPTIONS.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* E kom hek ket filter se nuk kryn noj pune qysh dyhet, edhe nese bojm fetch, nuk kthen info qysh duhet */}
            {/* <Select value={projectFilter} onValueChange={setProjectFilter}>
              <SelectTrigger className="w-[180px] bg-white border-gray-100 border transition-transform duration-200 ease-in-out hover:scale-105 hover:-translate-y-[1px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("common.allProjects")}</SelectItem>
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
            </Select> */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="bg-[#0073e6] transition-transform duration-200 ease-in-out hover:scale-105 hover:-translate-y-[1px] text-white border-0"
              >
                <Download className="h-4 w-4 mr-2" />
                {t("common.export")}
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
                <Label>{t("employees.twoFactorStatus")}</Label>
                <Select defaultValue="all">
                  <SelectTrigger className="mt-2 bg-white border-gray-100 border transition-transform duration-200 ease-in-out hover:scale-105 hover:-translate-y-[1px]">
                    <SelectValue placeholder="2FA Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("common.all")}</SelectItem>
                    <SelectItem value="enabled">
                      {t("common.active")}
                    </SelectItem>
                    <SelectItem value="disabled">
                      {t("common.inactive")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t("employees.dateAdded")}</Label>
                <Select defaultValue="any">
                  <SelectTrigger className="mt-2 bg-white border-gray-100 border transition-transform duration-200 ease-in-out hover:scale-105 hover:-translate-y-[1px]">
                    <SelectValue placeholder="Date Added" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">{t("common.all")}</SelectItem>
                    <SelectItem value="today">{t("common.today")}</SelectItem>
                    <SelectItem value="week">{t("common.thisWeek")}</SelectItem>
                    <SelectItem value="month">
                      {t("common.thisMonth")}
                    </SelectItem>
                    <SelectItem value="quarter">
                      {t("common.thisYear")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t("employees.lastActiveDate")}</Label>
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
                      {t("employees.inactive30Days")}
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
                {t("employees.resetFilters")}
              </Button>
              <Button size="sm" className="bg-[#0073e6] text-white border-0">
                {t("employees.applyFilters")}
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
              {t("employees.allActiveEmployees")} ({getTabCount("active")})
            </TabsTrigger>
            <TabsTrigger
              value="pending"
              className="data-[state=active]:bg-[#0073e6]  data-[state=active]:text-white"
            >
              {t("employees.pendingEmployees")} ({getTabCount("pending")})
            </TabsTrigger>
            <TabsTrigger
              value="inactive"
              className="data-[state=active]:bg-[#2E343E]  data-[state=active]:text-white"
            >
              {t("employees.inactiveEmployees")} ({getTabCount("inactive")})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="pt-6">
            <Card>
              <div className="w-full overflow-x-auto">
                <Table className="border-0 min-w-[900px]">
                  <TableHeader className="bg-[#E5ECF6]">
                    <TableRow>
                      <TableHead className="w-[250px]">
                        {t("employees.employee")}
                      </TableHead>
                      <TableHead>{t("common.role")}</TableHead>
                      <TableHead>{t("projects.title")}</TableHead>
                      <TableHead>{t("subProjects.title")}</TableHead>
                      <TableHead>{t("employees.lastActive")}</TableHead>
                      <TableHead>{t("common.status")}</TableHead>
                      <TableHead>2FA</TableHead>
                      <TableHead className="text-right">
                        {t("common.actions")}
                      </TableHead>
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
                            : t("common.never")}
                        </TableCell>
                        <TableCell>
                          {employee.status === "active" ? (
                            <Badge
                              variant="outline"
                              className=" text-[#4AA785] bg-[#DEF8EE] border-0"
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              {t("common.active")}
                            </Badge>
                          ) : employee.status === "inactive" ? (
                            <Badge
                              variant="outline"
                              className="text-red-600 border-0 bg-red-50"
                            >
                              {t("common.inactive")}
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="text-black/40 border-0 bg-black/5"
                            >
                              {t("common.pending")}
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
                              {t("common.enabled")}
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="text-black/40 border-0 bg-black/5"
                            >
                              {t("common.disabled")}
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
                                  <KeyRound className="h-4 w-4 mr-2" />
                                  {t("employees.resetPassword")}
                                </DropdownMenuItem>

                                {isSysOrSuperAdmin && (
                                  <DropdownMenuItem
                                    className="text-destructive"
                                    onClick={() =>
                                      handleDeleteClick(employee.id)
                                    }
                                  >
                                    <Trash className="h-4 w-4 mr-2" />
                                    {t("common.delete")}
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="pending" className="pt-6">
            <Card className="bg-[#F7F9FB]">
              <div className="w-full overflow-x-auto">
                <Table className="min-w-[900px]">
                  <TableHeader className="bg-[#E5ECF6]">
                    <TableRow>
                      <TableHead className="w-[250px]">
                        {t("employees.employee")}
                      </TableHead>
                      <TableHead>{t("common.role")}</TableHead>
                      <TableHead>{t("projects.title")}</TableHead>
                      <TableHead>{t("subProjects.title")}</TableHead>
                      <TableHead>{t("employees.invitedOn")}</TableHead>
                      <TableHead>{t("common.status")}</TableHead>
                      <TableHead className="text-right">
                        {t("common.actions")}
                      </TableHead>
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
                                {isSysOrSuperAdmin && (
                                  <DropdownMenuItem
                                    className="text-destructive"
                                    onClick={() =>
                                      handleDeleteClick(employee.id)
                                    }
                                  >
                                    <Trash className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="inactive" className="pt-6">
            <Card className="bg-[#F7F9FB]">
              <div className="w-full overflow-x-auto">
                <Table className="min-w-[900px]">
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
                                {isSysOrSuperAdmin && (
                                  <DropdownMenuItem
                                    className="text-destructive"
                                    onClick={() =>
                                      handleDeleteClick(employee.id)
                                    }
                                  >
                                    <Trash className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </TabsContent>

          {/* <TabsContent value="invitations" className="pt-6">
            <Card className="bg-[#F7F9FB]">
              <div className="w-full overflow-x-auto">
                <Table className="min-w-[900px]">
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
              </div>
            </Card>
          </TabsContent> */}
        </Tabs>
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
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete Employee"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
