import {
  Calendar,
  Mail,
  MoreHorizontal,
  Phone,
  Plus,
  Search,
  X,
} from "lucide-react";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

interface SubProjectTeamProps {
  subProjectId: string;
}

// Mock team members data
const mockTeamMembers = [
  {
    id: "user-001",
    subProjectId: "sub-001",
    name: "Jane Smith",
    role: "Sub-Project Lead",
    email: "jane.smith@example.com",
    phone: "+123456789",
    department: "Healthcare",
    startDate: "2025-01-15",
    avatar: "",
    initials: "JS",
    status: "active",
  },
  {
    id: "user-002",
    subProjectId: "sub-001",
    name: "Robert Johnson",
    role: "Field Coordinator",
    email: "robert.johnson@example.com",
    phone: "+123456790",
    department: "Healthcare",
    startDate: "2025-01-20",
    avatar: "",
    initials: "RJ",
    status: "active",
  },
  {
    id: "user-003",
    subProjectId: "sub-001",
    name: "Sarah Adams",
    role: "Community Health Worker",
    email: "sarah.adams@example.com",
    phone: "+123456791",
    department: "Healthcare",
    startDate: "2025-02-01",
    avatar: "",
    initials: "SA",
    status: "active",
  },
  {
    id: "user-004",
    subProjectId: "sub-001",
    name: "David Miller",
    role: "Data Officer",
    email: "david.miller@example.com",
    phone: "+123456792",
    department: "M&E",
    startDate: "2025-02-10",
    avatar: "",
    initials: "DM",
    status: "active",
  },
  {
    id: "user-005",
    subProjectId: "sub-001",
    name: "Lisa Washington",
    role: "Community Health Worker",
    email: "lisa.washington@example.com",
    phone: "+123456793",
    department: "Healthcare",
    startDate: "2025-02-15",
    avatar: "",
    initials: "LW",
    status: "inactive",
  },
  {
    id: "user-006",
    subProjectId: "sub-002",
    name: "Michael Wong",
    role: "Field Coordinator",
    email: "michael.wong@example.com",
    phone: "+123456794",
    department: "Healthcare",
    startDate: "2025-01-25",
    avatar: "",
    initials: "MW",
    status: "active",
  },
];

// Mock available users for assignment
const availableUsers = [
  {
    id: "user-007",
    name: "Emily Chen",
    department: "Healthcare",
    role: "Community Health Worker",
  },
  {
    id: "user-008",
    name: "James Wilson",
    department: "M&E",
    role: "Data Officer",
  },
  {
    id: "user-009",
    name: "Maria Rodriguez",
    department: "Healthcare",
    role: "Nurse",
  },
];

// Available roles
const availableRoles = [
  "Sub-Project Lead",
  "Field Coordinator",
  "Data Officer",
  "Community Health Worker",
  "Nurse",
  "M&E Officer",
  "Administrative Support",
];

export function SubProjectTeam({ subProjectId }: SubProjectTeamProps) {
  const [activeTab, setActiveTab] = useState("team-members");
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [selectedRole, setSelectedRole] = useState("");

  // Filter team members for this sub-project
  const filteredTeamMembers = mockTeamMembers.filter((member) => {
    const matchesSubProject = member.subProjectId === subProjectId;
    const matchesSearch =
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || member.role === roleFilter;
    const matchesStatus =
      statusFilter === "all" || member.status === statusFilter;

    return matchesSubProject && matchesSearch && matchesRole && matchesStatus;
  });

  // Get unique roles from the filtered team members
  const uniqueRoles = [
    ...new Set(filteredTeamMembers.map((member) => member.role)),
  ];

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
            <Button>
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
                  onValueChange={setSelectedMemberId}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select team member" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableUsers.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name} - {user.department}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="role" className="text-right">
                  Role
                </Label>
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableRoles.map((role) => (
                      <SelectItem
                        key={role}
                        value={role.toLowerCase().replace(" ", "-")}
                      >
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="start-date" className="text-right">
                  Start Date
                </Label>
                <Input
                  id="start-date"
                  type="date"
                  className="col-span-3"
                  defaultValue={new Date().toISOString().slice(0, 10)}
                />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="notes" className="text-right pt-2">
                  Notes
                </Label>
                <Input
                  id="notes"
                  className="col-span-3"
                  placeholder="Any additional notes"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsAssignDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={() => setIsAssignDialogOpen(false)}>
                Assign Member
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="team-members">Team Members</TabsTrigger>
          <TabsTrigger value="roles-responsibilities">
            Roles & Responsibilities
          </TabsTrigger>
        </TabsList>

        <TabsContent value="team-members" className="pt-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-between mb-4">
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search team members..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-3">
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    {uniqueRoles.map((role) => (
                      <SelectItem key={role} value={role}>
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[130px]">
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
                          <Badge variant="outline">{member.role}</Badge>
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
                        <DropdownMenuItem>Change Role</DropdownMenuItem>
                        <DropdownMenuItem>Send Message</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          Remove from Sub-Project
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="mt-3 pt-3 border-t grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <div className="text-muted-foreground">Department</div>
                      <div>{member.department}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Start Date</div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span>
                          {new Date(member.startDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Phone</div>
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        <span>{member.phone}</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Email</div>
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        <span className="truncate">{member.email}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Remove
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            <Card className="border-dashed flex flex-col items-center justify-center p-6">
              <div className="rounded-full border-dashed border-2 p-3 mb-3">
                <Plus className="h-6 w-6 text-muted-foreground" />
              </div>
              <h4 className="mb-1">Add Team Member</h4>
              <p className="text-sm text-muted-foreground text-center mb-3">
                Assign a new team member to this sub-project
              </p>
              <Button onClick={() => setIsAssignDialogOpen(true)}>
                Assign Member
              </Button>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="roles-responsibilities" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Team Roles & Responsibilities
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {uniqueRoles.map((role, index) => (
                <div
                  key={index}
                  className="border-b pb-4 last:border-b-0 last:pb-0"
                >
                  <h4 className="font-medium mb-2">{role}</h4>

                  <div className="space-y-2 mb-3">
                    {role === "Sub-Project Lead" && (
                      <ul className="list-disc pl-5 text-sm space-y-1">
                        <li>
                          Overall management and coordination of the sub-project
                        </li>
                        <li>Supervise all team members and activities</li>
                        <li>Report to project management and stakeholders</li>
                        <li>Ensure sub-project objectives are achieved</li>
                        <li>Manage budget and resources allocation</li>
                      </ul>
                    )}

                    {role === "Field Coordinator" && (
                      <ul className="list-disc pl-5 text-sm space-y-1">
                        <li>
                          Coordinate field activities and service delivery
                        </li>
                        <li>
                          Supervise field staff and community health workers
                        </li>
                        <li>Ensure quality of service delivery</li>
                        <li>Manage logistics for field operations</li>
                        <li>Report field activities to sub-project lead</li>
                      </ul>
                    )}

                    {role === "Data Officer" && (
                      <ul className="list-disc pl-5 text-sm space-y-1">
                        <li>Manage data collection and entry</li>
                        <li>Ensure data quality and integrity</li>
                        <li>Generate reports and analyze data</li>
                        <li>Manage the sub-project database</li>
                        <li>Provide data support to team members</li>
                      </ul>
                    )}

                    {role === "Community Health Worker" && (
                      <ul className="list-disc pl-5 text-sm space-y-1">
                        <li>Deliver direct services to beneficiaries</li>
                        <li>Conduct community education and outreach</li>
                        <li>Collect data using project forms</li>
                        <li>Follow up with beneficiaries</li>
                        <li>Report activities to field coordinator</li>
                      </ul>
                    )}
                  </div>

                  <div className="text-sm text-muted-foreground">
                    Team members with this role:{" "}
                    {filteredTeamMembers.filter((m) => m.role === role).length}
                  </div>
                </div>
              ))}

              <div className="flex justify-end">
                <Button variant="outline" size="sm">
                  Edit Roles & Responsibilities
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
