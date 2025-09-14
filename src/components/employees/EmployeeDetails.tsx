import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle,
  FileDown,
  KeyRound,
  LockKeyhole,
  Mail,
  MailCheck,
  Pencil,
  Save,
  Shield,
  Smartphone,
  Trash,
  Loader2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch } from "../../store";
import {
  clearSingleEmployee,
  fetchSingleEmployee,
  selectSingleEmployee,
  selectSingleEmployeeError,
  selectSingleEmployeeLoading,
  updateEmployee,
  selectEmployeeUpdating,
  selectEmployeeUpdateError,
  // projects tree
  fetchUserProjects,
  selectUserProjects,
  selectUserProjectsLoading,
  selectUserProjectsError,
} from "../../store/slices/employeesSlice";
import {
  fetchRolePermissions,
  selectRolePermissions,
  selectRolePermissionsLoading,
  selectRolePermissionsError,
  fetchRoles,
  selectAllRoles,
  selectRolesLoading,
  selectRolesError,
} from "../../store/slices/roleSlice";
import type {
  UpdateUserRequest,
  EmployeeStatus,
} from "../../services/employees/employeesModels";
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../ui/navigation/tabs";

// Employee page now fetches data from API; mockEmployee removed

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

// Roles now loaded from store; mockRoles removed

export function EmployeeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const singleEmployee = useSelector(selectSingleEmployee);
  const isSingleLoading = useSelector(selectSingleEmployeeLoading);
  const singleError = useSelector(selectSingleEmployeeError);
  const isUpdating = useSelector(selectEmployeeUpdating);
  const updateError = useSelector(selectEmployeeUpdateError);
  // User projects tree state
  const userProjects = useSelector(selectUserProjects);
  const isUserProjectsLoading = useSelector(selectUserProjectsLoading);
  const userProjectsError = useSelector(selectUserProjectsError);

  // Tabs & edit state (activeTab must be declared before effects below)
  const [activeTab, setActiveTab] = useState("profile");

  // Role ID derived from the selected employee (not the authenticated user)
  const roleId = useMemo(() => {
    const idVal = (singleEmployee as any)?.roles?.[0]?.id as
      | string
      | number
      | undefined;
    return idVal !== undefined && idVal !== null ? String(idVal) : undefined;
  }, [singleEmployee]);

  // Roles data from store
  const roles = useSelector(selectAllRoles);
  const rolesLoading = useSelector(selectRolesLoading);
  const rolesError = useSelector(selectRolesError);

  // Local selected role id for editing (defaults to employee's current role)
  const [selectedRoleId, setSelectedRoleId] = useState<string | undefined>(
    undefined
  );

  useEffect(() => {
    setSelectedRoleId(roleId);
  }, [roleId]);

  // Fetch roles list if not present
  useEffect(() => {
    if (!rolesLoading && roles.length === 0) {
      dispatch(fetchRoles(undefined));
    }
  }, [dispatch, rolesLoading, roles.length]);

  // Role permissions from store and status flags
  const rolePermissions = useSelector((state: any) =>
    roleId ? selectRolePermissions(state, roleId) : []
  );
  const isPermissionsLoading = useSelector(selectRolePermissionsLoading);
  const permissionsError = useSelector(selectRolePermissionsError);

  // Fetch role permissions when Permissions tab is active and not yet loaded
  useEffect(() => {
    if (activeTab === "permissions" && roleId) {
      if (
        !isPermissionsLoading &&
        !permissionsError &&
        (!rolePermissions || rolePermissions.length === 0)
      ) {
        dispatch(fetchRolePermissions(roleId));
      }
    }
  }, [
    activeTab,
    roleId,
    isPermissionsLoading,
    permissionsError,
    rolePermissions?.length,
    dispatch,
  ]);

  // Map store permissions -> local UI state for checkboxes
  useEffect(() => {
    if (activeTab !== "permissions") return;
    if (rolePermissions && rolePermissions.length > 0) {
      const mapped = rolePermissions.map((p: any) => ({
        id: p.id,
        name: p.description || `${p.resource}:${p.action}`,
        granted: true,
      }));
      setPermissions(mapped);
    } else if (rolePermissions && rolePermissions.length === 0) {
      setPermissions([]);
    }
  }, [rolePermissions, activeTab]);

  useEffect(() => {
    if (id) {
      dispatch(fetchSingleEmployee(id));
    }
    return () => {
      dispatch(clearSingleEmployee());
    };
  }, [dispatch, id]);

  // Fetch user projects when Projects tab is active
  useEffect(() => {
    if (activeTab === "projects" && id) {
      dispatch(fetchUserProjects(id));
    }
  }, [activeTab, id, dispatch]);

  // Map API employee to UI-friendly shape
  const employee = useMemo(() => {
    return singleEmployee
      ? {
          id: singleEmployee.id,
          name: `${singleEmployee.firstName} ${singleEmployee.lastName}`.trim(),
          email: singleEmployee.email,
          role:
            singleEmployee.roles && singleEmployee.roles.length > 0
              ? singleEmployee.roles[0].name
              : "N/A",
          status:
            singleEmployee.status === "active"
              ? "active"
              : singleEmployee.status === "invited"
              ? "pending"
              : "inactive",
          phone: "-",
          // lastActive: singleEmployee.lastLogin,
          projects: ["All Projects"],
          subProjects: [] as string[],
          twoFactorEnabled: singleEmployee.twoFactorEnabled,
          createdAt: singleEmployee.createdAt,
          createdBy: singleEmployee.invitedBy ?? "-",
          lastUpdated: singleEmployee.updatedAt,
          lastLogin: singleEmployee.lastLogin,
          lastUpdatedBy: "-",
          permissions: [] as { id: string; name: string; granted: boolean }[],
        }
      : null;
  }, [singleEmployee]);

  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordResetDialog, setShowPasswordResetDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  console.log("employee", singleEmployee);

  // Editable employee state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    status: "",
    twoFactorEnabled: false,
    projects: [] as string[],
    subProjects: [] as string[],
  });

  // Project selection state
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [selectedSubProjects, setSelectedSubProjects] = useState<string[]>([]);

  // Permission state
  const [permissions, setPermissions] = useState(
    [] as { id: string; name: string; granted: boolean }[]
  );

  // Sync form state when employee loads
  useEffect(() => {
    if (employee) {
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
      setSelectedProjects(employee.projects);
      setSelectedSubProjects(employee.subProjects);
      setPermissions(employee.permissions);
    }
  }, [employee]);

  const handleBack = () => navigate("/employees");

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle role change (value is roleId)
  const handleRoleChange = (value: string) => {
    setSelectedRoleId(value);
    const found = roles.find((r) => r.id === value);
    setFormData((prev) => ({ ...prev, role: found ? found.name : prev.role }));
  };

  // Handle status change
  const handleStatusChange = (value: string) => {
    setFormData((prev) => ({ ...prev, status: value }));
  };

  // Handle 2FA toggle
  const handle2FAToggle = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, twoFactorEnabled: checked }));
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
  const handleSaveClick = async () => {
    // Update the form data with the selected projects and sub-projects (local only)
    setFormData((prev) => ({
      ...prev,
      projects: selectedProjects,
      subProjects: selectedSubProjects,
    }));

    if (!singleEmployee) return;

    const [first, ...rest] = (formData.name || "").trim().split(/\s+/);
    const firstName = first ?? "";
    const lastName = rest.join(" ");

    const apiStatus: EmployeeStatus =
      formData.status === "active"
        ? "active"
        : formData.status === "pending"
        ? "invited"
        : formData.status === "inactive"
        ? "inactive"
        : singleEmployee.status; // fallback to original if unsupported value selected

    const payload: UpdateUserRequest = {
      firstName,
      lastName,
      email: formData.email,
      status: apiStatus,
      roleIds: selectedRoleId ? [selectedRoleId] : roleId ? [roleId] : [],
    };

    try {
      await dispatch(
        updateEmployee({ userId: singleEmployee.id, data: payload })
      ).unwrap();
      setIsEditing(false);
    } catch (e) {
      // keep editing; error message will show
      console.error("Failed to update user", e);
    }
  };

  // Cancel editing
  const handleCancelClick = () => {
    if (!employee) return;
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

    // Reset role selection to original
    setSelectedRoleId(roleId);

    // Exit edit mode
    setIsEditing(false);
  };

  // Handle password reset
  const handlePasswordReset = () => {
    // In a real app, we would call an API to reset the password
    if (!employee) return;
    console.log("Resetting password for:", employee.email);
    setShowPasswordResetDialog(false);
  };

  // Handle delete employee
  const handleDeleteEmployee = () => {
    // In a real app, we would call an API to delete the employee
    if (employee) {
      console.log("Deleting employee:", employee.id);
    }
    setShowDeleteDialog(false);
    navigate("/employees");
  };

  // Format date for display
  // const formatDate = (dateString: string) => {
  //   return new Date(dateString).toLocaleDateString("en-US", {
  //     year: "numeric",
  //     month: "long",
  //     day: "numeric",
  //   });
  // };

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

  if (isSingleLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Employees
            </Button>
            <h2>Employee Details</h2>
          </div>
          <div className="text-muted-foreground">Loading…</div>
        </div>
      </div>
    );
  }

  if (singleError) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Employees
            </Button>
            <h2>Employee Details</h2>
          </div>
          <div className="text-destructive">Error: {singleError}</div>
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Employees
            </Button>
            <h2>Employee Details</h2>
          </div>
          <div className="text-muted-foreground">No data</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Employees
          </Button>
          <h2>Employee Details</h2>
        </div>
        <div className="flex gap-2">
          {!isEditing ? (
            <>
              <Button
                className="bg-black/10 text-black border-0"
                variant="outline"
                onClick={() => setShowPasswordResetDialog(true)}
              >
                <KeyRound className="h-4 w-4 mr-2" />
                Reset Password
              </Button>

              <Button
                className="bg-black/10 text-black border-0"
                variant="destructive"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash className="h-4 w-4 mr-2" />
                Delete
              </Button>
              <Button
                className="bg-[#2E343E] text-white border-0"
                variant="outline"
                onClick={handleEditClick}
              >
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={handleCancelClick}
                disabled={isUpdating}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveClick} disabled={isUpdating}>
                {isUpdating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <Card className="col-span-12 lg:col-span-3 bg-[#F7F9FB]  border-0 drop-shadow-sm shadow-gray-50    ">
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
                <Pencil className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Last updated:</span>
                <span>{formatDateTime(employee.lastUpdated)}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Pencil className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Last Login:</span>
                {employee.lastLogin && (
                  <span>{formatDateTime(employee.lastLogin)}</span>
                )}
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <h4 className="text-sm font-medium">Quick Actions</h4>
              <div className="grid grid-cols-1 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="justify-start bg-[#2E343E] text-white"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Send Email
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="justify-start bg-[#2E343E] text-white"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  View Permissions
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="justify-start bg-[#2E343E] text-white"
                >
                  <FileDown className="h-4 w-4 mr-2" />
                  Export Data
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="col-span-12 lg:col-span-9 space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-[#E3F5FF] w-full justify-start border-b rounded-md drop-shadow-sm shadow-gray-50   items-center h-auto p-2 ">
              <TabsTrigger
                value="profile"
                className="rounded-none bg-transparent border-b-2 border-transparent px-4 pb-3 h-auto hover:bg-transparent hover:text-black data-[state=active]:border-b-[#2E343E] data-[state=active]:text-black"
              >
                Profile
              </TabsTrigger>
              <TabsTrigger
                value="permissions"
                className="rounded-none bg-transparent border-b-2 border-transparent px-4 pb-3 h-auto hover:bg-transparent hover:text-black data-[state=active]:border-b-[#2E343E] data-[state=active]:text-black"
              >
                Permissions
              </TabsTrigger>
              <TabsTrigger
                value="projects"
                className="rounded-none bg-transparent border-b-2 border-transparent px-4 pb-3 h-auto hover:bg-transparent hover:text-black data-[state=active]:border-b-[#2E343E] data-[state=active]:text-black"
              >
                Projects
              </TabsTrigger>
              <TabsTrigger
                value="security"
                className="rounded-none bg-transparent border-b-2 border-transparent px-4 pb-3 h-auto hover:bg-transparent hover:text-black data-[state=active]:border-b-[#2E343E] data-[state=active]:text-black"
              >
                Security
              </TabsTrigger>
              <TabsTrigger
                value="activity"
                className="rounded-none bg-transparent border-b-2 border-transparent px-4 pb-3 h-auto hover:bg-transparent hover:text-black data-[state=active]:border-b-[#2E343E] data-[state=active]:text-black"
              >
                Activity Log
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-6 pt-6">
              <Card className="bg-[#F7F9FB] border-0 drop-shadow-sm shadow-gray-50">
                <CardHeader>
                  <CardTitle className="text-lg">
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {updateError && (
                    <div className="bg-destructive/10 border border-destructive rounded-md p-3 mb-4">
                      <span className="text-destructive">
                        Failed to update user: {updateError}
                      </span>
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        className="bg-black/5 border-0"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        disabled={!isEditing || isUpdating}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        className="bg-black/5 border-0"
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        disabled={!isEditing || isUpdating}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        className="bg-black/5 border-0"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        disabled={!isEditing || isUpdating}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">Role</Label>
                      {isEditing ? (
                        <>
                          <Select
                            value={selectedRoleId}
                            onValueChange={handleRoleChange}
                            disabled={isUpdating || rolesLoading}
                          >
                            <SelectTrigger>
                              <SelectValue
                                placeholder={
                                  rolesLoading
                                    ? "Loading roles…"
                                    : "Select role"
                                }
                              />
                            </SelectTrigger>
                            <SelectContent>
                              {roles.map((r) => (
                                <SelectItem key={r.id} value={r.id}>
                                  {r.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {rolesError && (
                            <div className="text-destructive text-sm mt-1">
                              Failed to load roles: {rolesError}
                            </div>
                          )}
                        </>
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
                            disabled={isUpdating}
                          >
                            <SelectTrigger className="bg-black/5 border-0">
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
                            className="bg-black/5"
                            id="twoFactor"
                            checked={formData.twoFactorEnabled}
                            onCheckedChange={handle2FAToggle}
                            disabled={isUpdating}
                          />
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="permissions" className="space-y-6 pt-6">
              <Card className="bg-[#F7F9FB] border-0   drop-shadow-sm shadow-gray-50">
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
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-black/10"
                      >
                        Select All
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {isPermissionsLoading ? (
                    <div className="text-muted-foreground">
                      Loading permissions…
                    </div>
                  ) : permissionsError ? (
                    <div className="bg-destructive/10 border border-destructive rounded-md p-3 flex items-center justify-between">
                      <span className="text-destructive">
                        Failed to load permissions: {permissionsError}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          roleId && dispatch(fetchRolePermissions(roleId))
                        }
                      >
                        Retry
                      </Button>
                    </div>
                  ) : permissions.length === 0 ? (
                    <div className="text-muted-foreground">
                      No permissions found for this role.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {permissions.map((permission) => (
                        <div
                          key={permission.id}
                          className="group flex items-center gap-2 rounded-md bg-white   px-3 py-2 hover:bg-black/5 transition-colors"
                        >
                          {/* Left indicator: green tick if granted, gray dot otherwise */}
                          {permission.granted ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <span
                              className="inline-block h-2.5 w-2.5 rounded-full bg-gray-300"
                              aria-hidden
                            />
                          )}
                          <Label
                            htmlFor={permission.id}
                            className={`cursor-default text-sm transition-colors group-hover:font-medium ${
                              permission.granted
                                ? "text-foreground"
                                : "text-muted-foreground"
                            }`}
                          >
                            {permission.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* <div className="bg-[#EDEDFF] border  rounded-md p-4 flex items-start gap-3 ">
                <AlertTriangle className="h-5 w-5 text-[#8A8CD9] mt-0.5" />
                <div>
                  <h4 className="font-medium text-[#8A8CD9] ">
                    Permission Changes
                  </h4>
                  <p className="text-[#8A8CD9]/80 text-sm mt-1 ">
                    Changes to permissions will take effect immediately. Make
                    sure you understand the implications of each permission.
                  </p>
                </div>
              </div> */}
            </TabsContent>

            <TabsContent value="projects" className="space-y-6 pt-6">
              <Card className="bg-[#F7F9FB] border-0   drop-shadow-sm shadow-gray-50">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-lg">Projects</CardTitle>
                      <CardDescription>
                        Projects, subprojects and activities assigned to this
                        employee.
                      </CardDescription>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {isUserProjectsLoading && (
                        <span className="inline-flex items-center">
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Loading projects…
                        </span>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {userProjectsError ? (
                    <div className="bg-destructive/10 border border-destructive rounded-md p-3 flex items-center justify-between">
                      <span className="text-destructive">
                        Failed to load projects: {userProjectsError}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => id && dispatch(fetchUserProjects(id))}
                      >
                        Retry
                      </Button>
                    </div>
                  ) : userProjects.length === 0 && !isUserProjectsLoading ? (
                    <div className="text-muted-foreground">
                      No projects found.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {userProjects.map((project) => (
                        <div key={project.id} className="border rounded-md p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <div className="font-medium">{project.name}</div>
                              {project.description && (
                                <div className="text-sm text-muted-foreground">
                                  {project.description}
                                </div>
                              )}
                            </div>
                            {project.status && (
                              <Badge variant="outline">{project.status}</Badge>
                            )}
                          </div>
                          {project.subprojects &&
                            project.subprojects.length > 0 && (
                              <div className="pl-6 border-l ml-2 mt-3 space-y-3">
                                {project.subprojects.map((sub) => (
                                  <div key={sub.id}>
                                    <div className="flex items-start justify-between gap-4">
                                      <div>
                                        <div className="font-normal">
                                          {sub.name}
                                        </div>
                                        {sub.description && (
                                          <div className="text-sm text-muted-foreground">
                                            {sub.description}
                                          </div>
                                        )}
                                      </div>
                                      {sub.status && (
                                        <Badge variant="outline">
                                          {sub.status}
                                        </Badge>
                                      )}
                                    </div>
                                    {sub.activities &&
                                      sub.activities.length > 0 && (
                                        <div className="mt-2 pl-5 border-l space-y-1">
                                          {sub.activities.map((act) => (
                                            <div
                                              key={act.id}
                                              className="flex items-center justify-between"
                                            >
                                              <div className="text-sm">
                                                {act.name}
                                              </div>
                                              {act.status && (
                                                <Badge
                                                  variant="outline"
                                                  className="ml-2"
                                                >
                                                  {act.status}
                                                </Badge>
                                              )}
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                  </div>
                                ))}
                              </div>
                            )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="space-y-6 pt-6">
              <Card className="bg-[#F7F9FB] border-0   drop-shadow-sm shadow-gray-50">
                <CardHeader>
                  <CardTitle className="text-lg">Account Security</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className=" bg-white rounded-md p-4">
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
                        className="bg-[#2E343E] border-0 text-white"
                        onClick={() => setShowPasswordResetDialog(true)}
                      >
                        Reset Password
                      </Button>
                    </div>
                  </div>

                  <div className="bg-white rounded-md p-4">
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
                        <Button
                          variant="outline"
                          className="bg-black/10 border-0 text-text-black/40"
                          disabled={!isEditing}
                        >
                          {formData.twoFactorEnabled ? "Disable" : "Enable"}
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="bg-white rounded-md p-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="bg-[primary/10] p-2 rounded-full">
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
                        className="bg-green-100 text-[#4AA785] border-0"
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    </div>
                  </div>

                  <div className="bg-[#EDEDFF]  rounded-md p-4 flex items-start gap-3 ">
                    <AlertTriangle className="h-5 w-5 text-[#8A8CD9] mt-0.5" />
                    <div>
                      <h4 className="font-medium text-[#8A8CD9] ">
                        Security Recommendation
                      </h4>
                      <p className="text-[#8A8CD9]/80 text-sm mt-1 ">
                        Two-factor authentication is highly recommended for all
                        users, especially those with administrative access.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity" className="space-y-6 pt-6">
              <Card className="bg-[#F7F9FB] border-0   drop-shadow-sm shadow-gray-50">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-lg">Activity Log</CardTitle>
                      <CardDescription>
                        Recent actions performed by or affecting this employee.
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-[#2E343E] border-0 text-white"
                    >
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
