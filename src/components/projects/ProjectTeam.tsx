import { Plus, X } from "lucide-react";
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
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface ProjectTeamProps {
  projectId: string;
}

// Mock team members data
const mockTeamMembers = [
  {
    id: "user-001",
    projectId: "proj-001",
    name: "Jane Smith",
    role: "Project Lead",
    email: "jane.smith@example.com",
    department: "Healthcare",
    avatar: "",
    initials: "JS",
  },
  {
    id: "user-002",
    projectId: "proj-001",
    name: "Robert Johnson",
    role: "Project Coordinator",
    email: "robert.johnson@example.com",
    department: "Healthcare",
    avatar: "",
    initials: "RJ",
  },
  {
    id: "user-003",
    projectId: "proj-001",
    name: "Sarah Adams",
    role: "Field Officer",
    email: "sarah.adams@example.com",
    department: "Operations",
    avatar: "",
    initials: "SA",
  },
  {
    id: "user-004",
    projectId: "proj-001",
    name: "David Miller",
    role: "Technical Specialist",
    email: "david.miller@example.com",
    department: "Infrastructure",
    avatar: "",
    initials: "DM",
  },
];

// Mock available users for assignment
const availableUsers = [
  {
    id: "user-005",
    name: "Emily Chen",
    department: "Healthcare",
    role: "Field Officer",
  },
  {
    id: "user-006",
    name: "Michael Wong",
    department: "Education",
    role: "Project Coordinator",
  },
  {
    id: "user-007",
    name: "Lisa Washington",
    department: "Healthcare",
    role: "Technical Specialist",
  },
];

// Available roles
const availableRoles = [
  "Project Lead",
  "Project Coordinator",
  "Field Officer",
  "Technical Specialist",
  "Monitoring Officer",
  "Finance Officer",
];

export function ProjectTeam({ projectId }: ProjectTeamProps) {
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [selectedRole, setSelectedRole] = useState("");

  // Filter team members for this project
  const teamMembers = mockTeamMembers.filter(
    (member) => member.projectId === projectId
  );

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-base">Project Team</CardTitle>
          <Dialog
            open={isAssignDialogOpen}
            onOpenChange={setIsAssignDialogOpen}
          >
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Assign Member
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[450px]">
              <DialogHeader>
                <DialogTitle>Assign Team Member</DialogTitle>
                <DialogDescription>
                  Assign a team member to this project and define their role.
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
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {teamMembers.map((member) => (
            <div
              key={member.id}
              className="flex items-start justify-between border rounded-md p-3"
            >
              <div className="flex gap-3">
                <Avatar>
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
                    <Badge variant="secondary">{member.department}</Badge>
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
