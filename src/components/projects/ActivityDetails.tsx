import {
  ArrowLeft,
  Calendar,
  FileEdit,
  FileText,
  FolderKanban,
  Plus,
  Trash2,
  TrendingUp,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import type { AppDispatch, RootState } from "../../store";
import { selectCurrentUser } from "../../store/slices/authSlice";
import {
  fetchEmployees,
  selectAllEmployees,
} from "../../store/slices/employeesSlice";
import activityService from "../../services/activities/activityService";
import type { Activity, ActivityUser } from "../../services/activities/activityModels";
import { Button } from "../ui/button/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/data-display/avatar";
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
import { Textarea } from "../ui/form/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/overlay/dialog";
import { useTranslation } from "../../hooks/useTranslation";

export function ActivityDetails() {
  const { t } = useTranslation();
  const { projectId, subprojectId, activityId } = useParams<{
    projectId: string;
    subprojectId: string;
    activityId: string;
  }>();
  const navigate = useNavigate();
  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activityUsers, setActivityUsers] = useState<ActivityUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [isAssignUserDialogOpen, setIsAssignUserDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [isRemoveUserDialogOpen, setIsRemoveUserDialogOpen] = useState(false);
  const [userToRemove, setUserToRemove] = useState<ActivityUser | null>(null);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form state matching create activity modal
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [frequency, setFrequency] = useState("monthly");
  const [status, setStatus] = useState("active");
  const [description, setDescription] = useState("");
  const [reportingFieldsRows, setReportingFieldsRows] = useState<
    { key: string; type: string }[]
  >([{ key: "", type: "text" }]);

  // User role check and employees
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => selectCurrentUser(state));
  const employees = useSelector(selectAllEmployees);
  const normalizedRoles = useMemo(
    () => (user?.roles || []).map((r: any) => r.name?.toLowerCase?.() || ""),
    [user?.roles]
  );

  const isAdmin = useMemo(() => {
    return normalizedRoles.some(
      (r: string) =>
        r === "sysadmin" ||
        r === "superadmin" ||
        r === "system admin" ||
        r === "super admin" ||
        r.includes("system admin") ||
        r.includes("super admin")
    );
  }, [normalizedRoles]);

  // Fetch employees when assign dialog opens
  useEffect(() => {
    if (isAssignUserDialogOpen) {
      dispatch(fetchEmployees());
    }
  }, [dispatch, isAssignUserDialogOpen]);

  // Filter out already assigned users from employee list
  const assignedUserIds = useMemo(
    () => new Set(activityUsers.map((u) => u.id)),
    [activityUsers]
  );
  const employeesForSelect = useMemo(
    () => (employees || []).filter((emp) => !assignedUserIds.has(emp.id)),
    [employees, assignedUserIds]
  );

  const fetchActivity = async () => {
    if (!activityId) {
      setError("Activity ID is missing");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await activityService.getActivityById(activityId);
      if (response.success && response.data) {
        setActivity(response.data);
        setError(null);
      } else {
        setError(response.message || "Failed to fetch activity");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivity();
    fetchActivityUsers();
  }, [activityId]);

  const fetchActivityUsers = async () => {
    if (!activityId) {
      setUsersError("Activity ID is missing");
      setUsersLoading(false);
      return;
    }

    try {
      setUsersLoading(true);
      const response = await activityService.getActivityUsers(activityId);
      if (response.success && response.data) {
        setActivityUsers(response.data);
        setUsersError(null);
      } else {
        setUsersError(response.message || "Failed to fetch activity users");
      }
    } catch (err: any) {
      setUsersError(err.message || "An error occurred");
    } finally {
      setUsersLoading(false);
    }
  };

  // Populate form when activity loads or dialog opens
  useEffect(() => {
    if (activity && isUpdateDialogOpen) {
      setName(activity.name || "");
      setCategory(activity.category || "");
      setFrequency(activity.frequency || "monthly");
      setStatus(activity.status || "active");
      setDescription(activity.description || "");

      // Convert reportingFields object to rows array
      const fields = activity.reportingFields || {};
      const rows = Object.entries(fields).map(([key, type]) => ({ key, type }));
      setReportingFieldsRows(
        rows.length > 0 ? rows : [{ key: "", type: "text" }]
      );
    }
  }, [activity, isUpdateDialogOpen]);

  const handleUpdateSubmit = async () => {
    if (!activityId) return;

    const reportingFields: Record<string, string> = {};
    reportingFieldsRows
      .filter((r) => r.key.trim().length > 0)
      .forEach((r) => {
        reportingFields[r.key.trim()] = r.type;
      });

    try {
      setIsUpdating(true);
      const response = await activityService.updateActivity(activityId, {
        name,
        description,
        category,
        frequency,
        reportingFields,
        status,
      });

      if (response.success) {
        setIsUpdateDialogOpen(false);
        // Refresh activity data
        await fetchActivity();
      }
    } catch (e) {
      // Error handled by service toast
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteSubmit = async () => {
    if (!activityId) return;

    try {
      setIsDeleting(true);
      const response = await activityService.deleteActivity(activityId);

      if (response.success) {
        setIsDeleteDialogOpen(false);
        // Navigate back to subproject after deletion
        if (projectId && subprojectId) {
          navigate(`/projects/${projectId}/subprojects/${subprojectId}`);
        } else {
          navigate(-1);
        }
      }
    } catch (e) {
      // Error handled by service toast
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAssignUser = async () => {
    if (!selectedUserId || !activityId) return;

    try {
      const response = await activityService.assignUserToActivity(activityId, {
        userId: selectedUserId,
      });

      if (response.success) {
        // Refresh activity users list
        await fetchActivityUsers();
        setSelectedUserId("");
        setIsAssignUserDialogOpen(false);
      }
    } catch (e) {
      // Error handled by service toast
    }
  };

  const handleRemoveUser = async () => {
    if (!activityId || !userToRemove) return;

    try {
      const response = await activityService.removeUserFromActivity(activityId, userToRemove.id);

      if (response.success) {
        // Refresh activity users list
        await fetchActivityUsers();
        setIsRemoveUserDialogOpen(false);
        setUserToRemove(null);
      }
    } catch (e) {
      // Error handled by service toast
    }
  };

  const openRemoveUserDialog = (user: ActivityUser) => {
    setUserToRemove(user);
    setIsRemoveUserDialogOpen(true);
  };

  const handleBack = () => {
    if (projectId && subprojectId) {
      navigate(`/projects/${projectId}/subprojects/${subprojectId}`);
    } else {
      navigate(-1);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <div>{t("activityDetails.loading")}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="mb-4">
          <Button
            variant="outline"
            className="bg-[#E0F2FE] border-0"
            size="sm"
            onClick={handleBack}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            {t("activityDetails.back")}
          </Button>
        </div>
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="p-8">
        <div className="mb-4">
          <Button
            variant="outline"
            className="bg-[#E0F2FE] border-0"
            size="sm"
            onClick={handleBack}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            {t("activityDetails.back")}
          </Button>
        </div>
        <div>{t("activityDetails.notFound")}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          className="bg-[#E0F2FE] border-0 transition-transform duration-200 ease-in-out hover:scale-[1.02] hover:-translate-y-[1px]"
          size="sm"
          onClick={handleBack}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          {t("activityDetails.backToSubproject")}
        </Button>

        <div className="flex gap-2">
          <Dialog
            open={isUpdateDialogOpen}
            onOpenChange={setIsUpdateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button className="bg-[#0073e6] border-0 text-white">
                <FileEdit className="h-4 w-4 mr-2" />
                {t("activityDetails.editActivity")}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px]">
              <DialogHeader>
                <DialogTitle>
                  {t("activityDetails.updateActivityTitle")}
                </DialogTitle>
                <DialogDescription>
                  {t("activityDetails.updateActivityDescription")}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                {/* Model-based fields */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="activity-name" className="text-right">
                    {t("subProjectActivities.nameLabel")}
                  </Label>
                  <Input
                    id="activity-name"
                    className="col-span-3"
                    placeholder={t("subProjectActivities.namePlaceholder")}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="activity-category" className="text-right">
                    {t("subProjectActivities.categoryLabel")}
                  </Label>
                  <Input
                    id="activity-category"
                    className="col-span-3"
                    placeholder={t("subProjectActivities.categoryPlaceholder")}
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="activity-frequency" className="text-right">
                    {t("subProjectActivities.frequencyLabel")}
                  </Label>
                  <Select value={frequency} onValueChange={setFrequency}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue
                        placeholder={t("subProjectActivities.selectFrequency")}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">
                        {t("subProjectActivities.daily")}
                      </SelectItem>
                      <SelectItem value="weekly">
                        {t("subProjectActivities.weekly")}
                      </SelectItem>
                      <SelectItem value="monthly">
                        {t("subProjectActivities.monthly")}
                      </SelectItem>
                      <SelectItem value="quarterly">
                        {t("subProjectActivities.quarterly")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="activity-status" className="text-right">
                    {t("subProjectActivities.statusLabel")}
                  </Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue
                        placeholder={t("subProjectActivities.selectStatus")}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">
                        {t("subProjectActivities.active")}
                      </SelectItem>
                      <SelectItem value="inactive">
                        {t("subProjectActivities.inactive")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label
                    htmlFor="activity-description"
                    className="text-right pt-2"
                  >
                    {t("subProjectActivities.descriptionLabel")}
                  </Label>
                  <Textarea
                    id="activity-description"
                    className="col-span-3"
                    placeholder={t(
                      "subProjectActivities.descriptionPlaceholder"
                    )}
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label className="text-right pt-2">
                    {t("subProjectActivities.reportingFields")}
                  </Label>
                  <div className="col-span-3 space-y-2">
                    {reportingFieldsRows.map((row, idx) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <Input
                          placeholder={t(
                            "subProjectActivities.fieldKeyPlaceholder"
                          )}
                          value={row.key}
                          onChange={(e) => {
                            const next = [...reportingFieldsRows];
                            next[idx] = { ...next[idx], key: e.target.value };
                            setReportingFieldsRows(next);
                          }}
                        />
                        <Select
                          value={row.type}
                          onValueChange={(v: string) => {
                            const next = [...reportingFieldsRows];
                            next[idx] = { ...next[idx], type: v };
                            setReportingFieldsRows(next);
                          }}
                        >
                          <SelectTrigger className="w-[160px]">
                            <SelectValue
                              placeholder={t(
                                "subProjectActivities.typePlaceholder"
                              )}
                            />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="number">
                              {t("subProjectActivities.number")}
                            </SelectItem>
                            <SelectItem value="text">
                              {t("subProjectActivities.text")}
                            </SelectItem>
                            <SelectItem value="boolean">
                              {t("subProjectActivities.boolean")}
                            </SelectItem>
                            <SelectItem value="date">
                              {t("subProjectActivities.date")}
                            </SelectItem>
                            <SelectItem value="time">
                              {t("subProjectActivities.time")}
                            </SelectItem>
                            <SelectItem value="datetime">
                              {t("subProjectActivities.datetime")}
                            </SelectItem>
                            <SelectItem value="select">
                              {t("subProjectActivities.select")}
                            </SelectItem>
                            <SelectItem value="multiselect">
                              {t("subProjectActivities.multiselect")}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          variant="ghost"
                          className="hover:bg-[#E0F2FE] hover:text-black"
                          onClick={() => {
                            const next = reportingFieldsRows.filter(
                              (_, i) => i !== idx
                            );
                            setReportingFieldsRows(next);
                          }}
                        >
                          {t("subProjectActivities.remove")}
                        </Button>
                      </div>
                    ))}
                    <Button
                      className="bg-[#E0F2FE] border-0 text-black"
                      onClick={() =>
                        setReportingFieldsRows([
                          ...reportingFieldsRows,
                          { key: "", type: "text" },
                        ])
                      }
                    >
                      {t("subProjectActivities.addField")}
                    </Button>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  className="bg-[#E0F2FE] border-0 text-black"
                  onClick={() => setIsUpdateDialogOpen(false)}
                  disabled={isUpdating}
                >
                  {t("subProjectActivities.cancel")}
                </Button>
                <Button
                  className="bg-[#0073e6] border-0 text-white"
                  onClick={handleUpdateSubmit}
                  disabled={isUpdating}
                >
                  {isUpdating
                    ? t("activityDetails.updating")
                    : t("activityDetails.updateActivity")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {isAdmin && (
            <Dialog
              open={isDeleteDialogOpen}
              onOpenChange={setIsDeleteDialogOpen}
            >
              <DialogTrigger asChild>
                <Button
                  variant="destructive"
                  className="bg-red-600 border-0 text-white hover:bg-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {t("activityDetails.deleteActivity")}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>
                    {t("activityDetails.deleteConfirmTitle")}
                  </DialogTitle>
                  <DialogDescription>
                    {t("activityDetails.deleteConfirmDescription")}
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <p className="text-sm text-muted-foreground">
                    {t("activityDetails.deleteWarning")}
                  </p>
                  {activity && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <p className="font-semibold">{activity.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {activity.category} • {activity.frequency}
                      </p>
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsDeleteDialogOpen(false)}
                    disabled={isDeleting}
                  >
                    {t("activityDetails.cancel")}
                  </Button>
                  <Button
                    variant="destructive"
                    className="bg-red-600 border-0 text-white hover:bg-red-700"
                    onClick={handleDeleteSubmit}
                    disabled={isDeleting}
                  >
                    {isDeleting
                      ? t("activityDetails.deleting")
                      : t("activityDetails.confirmDelete")}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Activity Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold">{activity.name}</h1>
          <Badge
            variant={activity.status === "active" ? "default" : "outline"}
            className="text-[#4AA785] bg-[#DEF8EE]"
          >
            {activity.status}
          </Badge>
        </div>
        {activity.description && (
          <p className="text-muted-foreground text-lg">
            {activity.description}
          </p>
        )}
      </div>

      {/* Activity Information Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Category Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#E0F2FE] rounded-lg">
                <FolderKanban className="h-6 w-6 text-[#0073e6]" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {t("activityDetails.category")}
                </p>
                <p className="text-xl font-semibold">{activity.category}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Frequency Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#DEF8EE] rounded-lg">
                <TrendingUp className="h-6 w-6 text-[#4AA785]" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {t("activityDetails.frequency")}
                </p>
                <p className="text-xl font-semibold capitalize">
                  {activity.frequency}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Created Date Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#FEF3C7] rounded-lg">
                <Calendar className="h-6 w-6 text-[#F59E0B]" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {t("activityDetails.created")}
                </p>
                <p className="text-xl font-semibold">
                  {new Date(activity.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reporting Fields Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-[#0073e6]" />
              <h2 className="text-xl font-semibold">
                {t("activityDetails.reportingFields")}
              </h2>
            </div>
            {activity.reportingFields &&
            Object.keys(activity.reportingFields).length > 0 ? (
              <div className="grid gap-3 md:grid-cols-2">
                {Object.entries(activity.reportingFields).map(([key, type]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <span className="font-medium">{key}</span>
                    <Badge variant="outline" className="bg-white">
                      {type}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">
                {t("activityDetails.noReportingFields")}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Activity Users */}
      <Card className="bg-white border border-gray-100">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">
              {t("activityDetails.activityUsers")}
            </h3>
            <Dialog
              open={isAssignUserDialogOpen}
              onOpenChange={setIsAssignUserDialogOpen}
            >
              <DialogTrigger asChild>
                <Button className="bg-[#0073e6] text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  {t("activityDetails.assignUser")}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[450px]">
                <DialogHeader>
                  <DialogTitle>
                    {t("activityDetails.assignUserTitle")}
                  </DialogTitle>
                  <DialogDescription>
                    {t("activityDetails.assignUserDescription")}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="user" className="text-right">
                      {t("activityDetails.userLabel")}
                    </Label>
                    <Select
                      value={selectedUserId}
                      onValueChange={(v) => setSelectedUserId(v)}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue
                          placeholder={t("activityDetails.selectUser")}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {employeesForSelect.map((emp) => {
                          const fullName =
                            `${emp.firstName ?? ""} ${emp.lastName ?? ""}`.trim() ||
                            "N/A";
                          const initials = fullName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase();
                          return (
                            <SelectItem key={emp.id} value={emp.id}>
                              <div className="flex items-center gap-2">
                                <Avatar className="h-6 w-6">
                                  <AvatarImage src="" alt={fullName} />
                                  <AvatarFallback className="text-[10px]">
                                    {initials}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-sm">{fullName}</span>
                                <Badge variant="secondary" className="text-[10px]">
                                  {emp.email}
                                </Badge>
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    className="bg-[#E0F2FE] border-0"
                    variant="outline"
                    onClick={() => setIsAssignUserDialogOpen(false)}
                  >
                    {t("activityDetails.cancel")}
                  </Button>
                  <Button
                    className="bg-[#0073e6] border-0 text-white"
                    disabled={!selectedUserId}
                    onClick={handleAssignUser}
                  >
                    {t("activityDetails.assignUser")}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          {usersLoading ? (
            <p className="text-sm text-muted-foreground">
              {t("activityDetails.loadingUsers")}
            </p>
          ) : usersError ? (
            <p className="text-sm text-red-600">{usersError}</p>
          ) : activityUsers.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {t("activityDetails.noUsersFound")}
            </p>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader className="bg-[#E5ECF6]">
                  <TableRow>
                    <TableHead>{t("activityDetails.userName")}</TableHead>
                    <TableHead>{t("activityDetails.userEmail")}</TableHead>
                    <TableHead>{t("activityDetails.userStatus")}</TableHead>
                    <TableHead className="text-right">
                      {t("activityDetails.actions")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activityUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.firstName} {user.lastName}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge
                          variant={user.status === "active" ? "default" : "outline"}
                          className={
                            user.status === "active"
                              ? "text-[#4AA785] bg-[#DEF8EE]"
                              : "text-gray-600 bg-gray-100"
                          }
                        >
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => openRemoveUserDialog(user)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          {t("activityDetails.removeUser")}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Remove User Confirmation Dialog */}
      <Dialog open={isRemoveUserDialogOpen} onOpenChange={setIsRemoveUserDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t("activityDetails.removeUserTitle")}</DialogTitle>
            <DialogDescription>
              {t("activityDetails.removeUserDescription")}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {userToRemove && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="font-semibold">
                  {userToRemove.firstName} {userToRemove.lastName}
                </p>
                <p className="text-sm text-muted-foreground">
                  {userToRemove.email}
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsRemoveUserDialogOpen(false);
                setUserToRemove(null);
              }}
            >
              {t("activityDetails.cancel")}
            </Button>
            <Button
              variant="destructive"
              className="bg-red-600 border-0 text-white hover:bg-red-700"
              onClick={handleRemoveUser}
            >
              {t("activityDetails.confirmRemove")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Metadata */}
      <Card className="bg-white border border-gray-100">
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-4">
            {t("activityDetails.metadata")}
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">
                {t("activityDetails.activityId")}
              </p>
              <p className="font-mono text-xs">{activity.id}</p>
            </div>
            <div>
              <p className="text-muted-foreground">
                {t("activityDetails.subprojectId")}
              </p>
              <p className="font-mono text-xs">{activity.subprojectId}</p>
            </div>
            <div>
              <p className="text-muted-foreground">
                {t("activityDetails.createdAt")}
              </p>
              <p>{new Date(activity.createdAt).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-muted-foreground">
                {t("activityDetails.updatedAt")}
              </p>
              <p>{new Date(activity.updatedAt).toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ActivityDetails;
