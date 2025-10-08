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
import type { AppDispatch } from "../../store";
import {
  fetchProjectUsers,
  assignUserToProject,
  selectAssignedUsers,
  selectAssignedUsersError,
  selectAssignedUsersLoading,
  removeUserFromProject,
} from "../../store/slices/projectsSlice";
import {
  fetchEmployees,
  selectAllEmployees,
} from "../../store/slices/employeesSlice";

interface ProjectTeamProps {
  projectId: string;
  isSysOrSuperAdmin?: boolean;
  isProgramManager?: boolean;
  hasFullAccess?: boolean;
}

// Removed mock team data; now using API data from Redux

export function ProjectTeam({
  projectId,
  isSysOrSuperAdmin,
  isProgramManager,
  hasFullAccess,
}: ProjectTeamProps) {
  const dispatch = useDispatch<AppDispatch>();
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState("");

  const assignedUsers = useSelector(selectAssignedUsers);
  const isLoading = useSelector(selectAssignedUsersLoading);
  const error = useSelector(selectAssignedUsersError);
  const employees = useSelector(selectAllEmployees);
  // Optionally track assigning state via projects slice loading, but we'll keep UI simple

  useEffect(() => {
    if (projectId && hasFullAccess) {
      dispatch(fetchProjectUsers(projectId));
    }
  }, [dispatch, projectId, hasFullAccess]);

  // Ensure employees list is available when opening assignment dialog
  useEffect(() => {
    if (isAssignDialogOpen) {
      dispatch(fetchEmployees());
    }
  }, [dispatch, isAssignDialogOpen]);

  // Exclude already assigned members from modal options
  const assignedIds = useMemo(
    () => new Set((assignedUsers || []).map((u) => u.id)),
    [assignedUsers]
  );
  const employeesForSelect = useMemo(
    () => (employees || []).filter((emp) => !assignedIds.has(emp.id)),
    [employees, assignedIds]
  );

  const handleAssignMember = async () => {
    if (!selectedMemberId) return;
    try {
      await dispatch(
        assignUserToProject({ projectId, userId: selectedMemberId })
      ).unwrap();
      // refresh assigned users
      dispatch(fetchProjectUsers(projectId));
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
      await dispatch(removeUserFromProject({ projectId, userId })).unwrap();
      // refresh assigned users
      dispatch(fetchProjectUsers(projectId));
    } catch (e) {
      // noop: optionally display a toast on error
    }
  };

  return (
    <Card className="bg-[#F7F9FB] drop-shadow-sm shadow-gray-50 border-0">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-base">Project Team</CardTitle>
          {(isSysOrSuperAdmin || isProgramManager) && (
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
                  Assign Member
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Assign Member to Project</DialogTitle>
                  <DialogDescription>
                    Select a team member and role for this project.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="member" className="text-right">
                      Member
                    </Label>
                    <Select
                      value={selectedMemberId}
                      onValueChange={(v) => setSelectedMemberId(v)}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select a member" />
                      </SelectTrigger>
                      <SelectContent>
                        {employeesForSelect.map((emp) => {
                          const fullName =
                            `${emp.firstName ?? ""} ${
                              emp.lastName ?? ""
                            }`.trim() || "N/A";
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
                    Cancel
                  </Button>
                  <Button
                    className="bg-[#0073e6] text-white flex items-center
             px-4 py-2 rounded-md border-0
             transition-transform duration-200 ease-in-out
             hover:scale-[1.02] hover:-translate-y-[1px]"
                    disabled={!selectedMemberId}
                    onClick={handleAssignMember}
                  >
                    Assign Member
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
            Loading team…
          </div>
        ) : error ? (
          <div className="py-4 text-sm text-destructive">{error}</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[280px]">Member</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[80px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignedUsers.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center text-muted-foreground"
                  >
                    No team members assigned yet.
                  </TableCell>
                </TableRow>
              ) : (
                assignedUsers.map((u) => {
                  const fullName = `${u.firstName ?? ""} ${
                    u.lastName ?? ""
                  }`.trim();
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
                          title="Remove from project"
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
        )}
      </CardContent>
    </Card>
  );
}
