import { Plus, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/data-display/avatar";
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
  DialogTrigger,
} from "../ui/overlay/dialog";
import { Label } from "../ui/form/label";
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
import type { AppDispatch, RootState } from "../../store";
import {
  assignUserToSubProject,
  fetchSubProjectUsers,
  removeUserFromSubProject,
  selectAssignedSubProjectUsers,
  selectAssignedSubProjectUsersError,
  selectAssignedSubProjectUsersLoading,
} from "../../store/slices/subProjectSlice";
import {
  fetchEmployees,
  selectAllEmployees,
} from "../../store/slices/employeesSlice";
import { useTranslation } from "../../hooks/useTranslation";

interface SubProjectTeamProps {
  subProjectId: string;
  hasFullAccess: boolean;
}

export function SubProjectTeam({
  subProjectId,
  hasFullAccess,
}: SubProjectTeamProps) {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const assignedUsers = useSelector((state: RootState) =>
    selectAssignedSubProjectUsers(state),
  );
  const isLoading = useSelector((state: RootState) =>
    selectAssignedSubProjectUsersLoading(state),
  );
  const error = useSelector((state: RootState) =>
    selectAssignedSubProjectUsersError(state),
  );
  const employees = useSelector(selectAllEmployees);

  useEffect(() => {
    if (subProjectId && hasFullAccess) {
      dispatch(fetchSubProjectUsers({ subProjectId }));
    }
  }, [subProjectId, dispatch, hasFullAccess]);

  // Ensure employees list is available when opening assignment dialog
  useEffect(() => {
    if (isAssignDialogOpen) {
      dispatch(fetchEmployees());
    }
  }, [dispatch, isAssignDialogOpen]);

  // Exclude already assigned members from modal options
  const assignedIds = useMemo(
    () => new Set((assignedUsers || []).map((u) => u.id)),
    [assignedUsers],
  );
  const employeesForSelect = useMemo(
    () => (employees || []).filter((emp) => !assignedIds.has(emp.id)),
    [employees, assignedIds],
  );

  const handleAssignMember = async () => {
    if (!selectedMemberId) return;
    try {
      await dispatch(
        assignUserToSubProject({ subProjectId, userId: selectedMemberId }),
      ).unwrap();
      // refresh assigned users
      dispatch(fetchSubProjectUsers({ subProjectId }));
      // reset and close
      setSelectedMemberId("");
      setIsAssignDialogOpen(false);
    } catch (e) {
      // noop: error handling can be added with toasts if desired
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!userId) return;
    try {
      await dispatch(
        removeUserFromSubProject({ subProjectId, userId }),
      ).unwrap();
      // refresh assigned users
      dispatch(fetchSubProjectUsers({ subProjectId }));
    } catch (e) {
      // noop: optionally display a toast on error
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(assignedUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedUsers = assignedUsers.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <Card className="bg-[#F7F9FB] drop-shadow-sm shadow-gray-50 border-0">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-base">
            {t("subProjectTeam.title")}
          </CardTitle>
          {hasFullAccess && (
            <Dialog
              open={isAssignDialogOpen}
              onOpenChange={setIsAssignDialogOpen}
            >
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  className="bg-[#0073e6] text-white flex items-center
             px-4 py-2 rounded-md border-0
             transition-transform duration-200 ease-in-out
             hover:scale-[1.02] hover:-translate-y-[1px]"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {t("subProjectTeam.assignMember")}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>
                    {t("subProjectTeam.assignTeamMemberTitle")}
                  </DialogTitle>
                  <DialogDescription>
                    {t("subProjectTeam.assignTeamMemberDescription")}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="member" className="text-right">
                      {t("subProjectTeam.memberLabel")}
                    </Label>
                    <Select
                      value={selectedMemberId}
                      onValueChange={(v) => setSelectedMemberId(v)}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue
                          placeholder={t("subProjectTeam.selectTeamMember")}
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
                                <Badge
                                  variant="secondary"
                                  className="text-[10px]"
                                >
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
                    variant="outline"
                    onClick={() => setIsAssignDialogOpen(false)}
                  >
                    {t("subProjectTeam.cancel")}
                  </Button>
                  <Button
                    className="bg-[#0073e6] text-white flex items-center
             px-4 py-2 rounded-md border-0
             transition-transform duration-200 ease-in-out
             hover:scale-[1.02] hover:-translate-y-[1px]"
                    disabled={!selectedMemberId}
                    onClick={handleAssignMember}
                  >
                    {t("subProjectTeam.assignMember")}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="py-4 text-sm text-muted-foreground">
            {t("subProjectTeam.loadingTeamMembers")}
          </div>
        ) : error ? (
          <div className="py-4 text-sm text-destructive">{error}</div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[280px]">
                    {t("subProjectTeam.memberLabel")}
                  </TableHead>
                  <TableHead>{t("subProjectTeam.email")}</TableHead>
                  <TableHead>{t("subProjectTeam.status")}</TableHead>
                  <TableHead className="w-[80px] text-right">
                    {t("subProjectTeam.actions")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignedUsers.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center text-muted-foreground"
                    >
                      {t("subProjectTeam.noTeamMembers")}
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedUsers.map((u) => {
                    const fullName =
                      `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim();
                    const initials = (fullName || u.email || "N/A")
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase();
                    return (
                      <TableRow key={u.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src="" alt={fullName || u.email} />
                              <AvatarFallback>{initials}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">
                                {fullName || "N/A"}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {u.email}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{u.email}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="capitalize text-[#4AA785] bg-[#DEF8EE] border-0"
                          >
                            {u.status || "unknown"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive"
                            onClick={() => handleRemoveMember(u.id)}
                            title="Remove from sub-project"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>

            {assignedUsers.length > itemsPerPage && (
              <div className="flex items-center justify-between px-2 py-4">
                <div className="text-sm text-muted-foreground">
                  {t("common.showing")} {startIndex + 1} {t("common.to")}{" "}
                  {Math.min(endIndex, assignedUsers.length)} {t("common.of")}{" "}
                  {assignedUsers.length} {t("common.results")}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    {t("common.previous")}
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(page)}
                        className={
                          currentPage === page ? "bg-[#0073e6] text-white" : ""
                        }
                      >
                        {page}
                      </Button>
                    ),
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    {t("common.next")}
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
