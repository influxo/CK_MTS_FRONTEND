import { MoreHorizontal, Plus, Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/data-display/avatar";
import { Badge } from "../ui/data-display/badge";
import { Button } from "../ui/button/button";

import { Card, CardContent } from "../ui/data-display/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/overlay/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/overlay/dropdown-menu";
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
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store";
import {
  fetchSubProjectUsers,
  selectAssignedSubProjectUsers,
  selectAssignedSubProjectUsersLoading,
  selectAssignedSubProjectUsersError,
  removeUserFromSubProject,
  assignUserToSubProject,
} from "../../store/slices/subProjectSlice";
import { selectAllEmployees } from "../../store/slices/employeesSlice";

interface SubProjectTeamProps {
  subProjectId: string;
  hasFullAccess: boolean;
}

// Team members are fetched from Redux via fetchSubProjectUsers

// Assignment uses employees list from Redux (see selectAllEmployees)
export function SubProjectTeam({
  subProjectId,
  hasFullAccess,
}: SubProjectTeamProps) {
  const [activeTab, setActiveTab] = useState("team-members");
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedMemberId, setSelectedMemberId] = useState("");

  const dispatch = useDispatch<AppDispatch>();
  const users = useSelector((state: RootState) =>
    selectAssignedSubProjectUsers(state)
  );
  const loading = useSelector((state: RootState) =>
    selectAssignedSubProjectUsersLoading(state)
  );
  const error = useSelector((state: RootState) =>
    selectAssignedSubProjectUsersError(state)
  );
  const employees = useSelector(selectAllEmployees);

  const onRemove = (userId: string) => {
    if (!subProjectId || !userId) return;
    dispatch(removeUserFromSubProject({ subProjectId, userId })).then(() =>
      dispatch(fetchSubProjectUsers({ subProjectId }))
    );
  };

  useEffect(() => {
    if (subProjectId && hasFullAccess) {
      dispatch(fetchSubProjectUsers({ subProjectId }));
    }
  }, [subProjectId, dispatch, hasFullAccess]);

  const handleAssignMember = async () => {
    if (!selectedMemberId) return;
    try {
      await dispatch(
        assignUserToSubProject({ subProjectId, userId: selectedMemberId })
      ).unwrap();
      // refresh assigned users, reset and close
      dispatch(fetchSubProjectUsers({ subProjectId }));
      setSelectedMemberId("");
      setIsAssignDialogOpen(false);
    } catch (e) {
      // optional: show toast
    }
  };

  const teamMembers = users.map((u) => {
    const initials = `${u.firstName?.[0] ?? ""}${u.lastName?.[0] ?? ""}`
      .toUpperCase()
      .trim();
    return {
      id: u.id,
      name: `${u.firstName} ${u.lastName}`.trim(),
      email: u.email,
      status: u.status,
      initials: initials || "U",
      avatar: "",
    };
  });

  const filteredTeamMembers = teamMembers.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || member.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  console.log("employees", employees);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3>Sub-Project Team</h3>
          <p className="text-muted-foreground">
            Manage team members assigned to this sub-project
          </p>
        </div>
        <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#2E343E] text-white">
              <Plus className="h-4 w-4 mr-2" />
              Assign Member
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[450px]">
            <DialogHeader>
              <DialogTitle>Assign Team Member</DialogTitle>
              <DialogDescription>
                Assign a team member to this sub-project and define their role.
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
                    <SelectValue placeholder="Select team member" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((emp) => {
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
                            <Badge variant="secondary" className="text-[10px] ">
                              {emp.email}
                            </Badge>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              {/**
               * Additional fields are intentionally hidden for now per requirements.
               *
               * <div className="grid grid-cols-4 items-center gap-4"> ... Role ... </div>
               * <div className="grid grid-cols-4 items-center gap-4"> ... Start Date ... </div>
               * <div className="grid grid-cols-4 items-start gap-4"> ... Notes ... </div>
               */}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsAssignDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button disabled={!selectedMemberId} onClick={handleAssignMember}>
                Assign Member
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-[#2E343E] bg-opacity-10 items-center">
          <TabsTrigger
            value="team-members"
            className="data-[state=active]:bg-[#2E343E]  data-[state=active]:text-white"
          >
            Team Members
          </TabsTrigger>
        </TabsList>

        <TabsContent value="team-members" className="pt-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-between mb-4">
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5  top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search team members..."
                  className="pl-9 bg-black/5 border-0"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-3">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[130px] bg-black/5 border-0">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {loading && (
            <div className="p-4 text-sm">Loading team members...</div>
          )}
          {error && (
            <div className="p-4 text-sm text-red-500">Error: {error}</div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTeamMembers.map((member) => (
              <Card key={member.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={member.avatar} alt={member.name} />
                        <AvatarFallback>{member.initials}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{member.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {member.email}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge
                            variant={
                              member.status === "active"
                                ? "default"
                                : "secondary"
                            }
                            className="text-xs"
                          >
                            {member.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
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
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Send Message</DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => onRemove(member.id)}
                        >
                          Remove from Sub-Project
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="mt-3 flex justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                      onClick={() => onRemove(member.id)}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Remove
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            <Card className="border-dashed bg-[#F7F9FB] flex flex-col items-center justify-center p-6">
              <div className="rounded-full border-dashed border-2 p-3 mb-3">
                <Plus className="h-6 w-6 text-muted-foreground" />
              </div>
              <h4 className="mb-1">Add Team Member</h4>
              <p className="text-sm text-muted-foreground text-center mb-3">
                Assign a new team member to this sub-project
              </p>
              <Button
                className="bg-black/5"
                onClick={() => setIsAssignDialogOpen(true)}
              >
                Assign Member
              </Button>
            </Card>
          </div>
        </TabsContent>

        {/* Roles & Responsibilities tab removed as roles are not part of the API response */}
      </Tabs>
    </div>
  );
}
