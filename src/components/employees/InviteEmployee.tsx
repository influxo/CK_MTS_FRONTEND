import { ArrowLeft, Check, Copy, Info, Mail, UserPlus } from "lucide-react";
import { useState } from "react";
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
import { Input } from "../ui/form/input";
import { Label } from "../ui/form/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/form/select";
import { Separator } from "../ui/layout/separator";
import { Switch } from "../ui/form/switch";
import { Textarea } from "../ui/form/textarea";

// Mock data for projects
const mockProjects = [
  {
    id: "proj-001",
    title: "Rural Healthcare Initiative",
    subProjects: [
      { id: "sub-001", title: "Maternal Health Services" },
      { id: "sub-002", title: "Child Vaccination Campaign" },
      { id: "sub-004", title: "Nutrition Support" },
    ],
  },
  {
    id: "proj-002",
    title: "Community Development",
    subProjects: [
      { id: "sub-003", title: "Water Access Program" },
      { id: "sub-005", title: "Food Security Initiative" },
    ],
  },
  {
    id: "proj-003",
    title: "Youth Empowerment Program",
    subProjects: [
      { id: "sub-006", title: "Education Support" },
      { id: "sub-007", title: "Skills Training" },
    ],
  },
];

// Mock roles
const mockRoles = ["Admin", "Program Manager", "Field Staff", "Data Analyst"];

interface InviteEmployeeProps {
  onBack: () => void;
  onInviteCreated: (inviteData: any) => void;
}

export function InviteEmployee({
  onBack,
  onInviteCreated,
}: InviteEmployeeProps) {
  // State for the invite form
  const [inviteData, setInviteData] = useState({
    emails: "",
    role: "",
    message: "",
    expiration: "7",
    sendCopy: true,
    allProjects: false,
  });

  // State for project selection
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [selectedSubProjects, setSelectedSubProjects] = useState<string[]>([]);

  // State for invite link (shown after submission)
  const [inviteLink, setInviteLink] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLinkCopied, setIsLinkCopied] = useState(false);

  // Handle input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setInviteData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle role change
  const handleRoleChange = (value: string) => {
    setInviteData((prev) => ({ ...prev, role: value }));
  };

  // Handle expiration change
  const handleExpirationChange = (value: string) => {
    setInviteData((prev) => ({ ...prev, expiration: value }));
  };

  // Handle send copy toggle
  const handleSendCopyToggle = (checked: boolean) => {
    setInviteData((prev) => ({ ...prev, sendCopy: checked }));
  };

  // Handle all projects toggle
  const handleAllProjectsToggle = (checked: boolean) => {
    setInviteData((prev) => ({ ...prev, allProjects: checked }));

    if (checked) {
      setSelectedProjects([]);
      setSelectedSubProjects([]);
    }
  };

  // Handle project selection
  const handleProjectToggle = (projectTitle: string) => {
    setSelectedProjects((prev) => {
      if (prev.includes(projectTitle)) {
        // If removing a project, also remove its sub-projects
        const projectObj = mockProjects.find((p) => p.title === projectTitle);
        const subProjectTitles =
          projectObj?.subProjects.map((sp) => sp.title) || [];
        console.log(
          "subProjectTitles test me i ik unused declaration",
          subProjectTitles
        );
        return prev.filter((p) => p !== projectTitle);
      } else {
        return [...prev, projectTitle];
      }
    });
  };

  // Handle sub-project selection
  const handleSubProjectToggle = (
    subProjectTitle: string,
    projectTitle: string
  ) => {
    setSelectedSubProjects((prev) => {
      if (prev.includes(subProjectTitle)) {
        return prev.filter((sp) => sp !== subProjectTitle);
      } else {
        // Make sure the parent project is selected
        if (!selectedProjects.includes(projectTitle)) {
          setSelectedProjects((prevProjects) => [
            ...prevProjects,
            projectTitle,
          ]);
        }
        return [...prev, subProjectTitle];
      }
    });
  };

  // Submit the invite form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Create a random invite link
    const randomString = Math.random().toString(36).substring(2, 10);
    const link = `https://projectpulse.example.com/account-setup/${randomString}`;
    setInviteLink(link);

    // Create invite data object
    const inviteDataObj = {
      ...inviteData,
      projects: inviteData.allProjects ? ["All Projects"] : selectedProjects,
      subProjects: inviteData.allProjects
        ? ["All Sub-Projects"]
        : selectedSubProjects,
      link,
    };

    // Set submitted state
    setIsSubmitted(true);

    // Call the parent component's handler
    onInviteCreated(inviteDataObj);
  };

  // Copy invite link to clipboard
  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setIsLinkCopied(true);

    // Reset copy status after 2 seconds
    setTimeout(() => {
      setIsLinkCopied(false);
    }, 2000);
  };

  // Validate the form
  const isFormValid = inviteData.emails.trim() !== "" && inviteData.role !== "";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Employees
          </Button>
          <h2>Invite Employee</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Invite Details</CardTitle>
            <CardDescription>
              Send an invitation to join your organization.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="emails">Email Addresses*</Label>
                  <Input
                    id="emails"
                    name="emails"
                    placeholder="Enter email addresses separated by commas"
                    value={inviteData.emails}
                    onChange={handleInputChange}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    You can invite multiple people by separating email addresses
                    with commas.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Role*</Label>
                  <Select
                    value={inviteData.role}
                    onValueChange={handleRoleChange}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockRoles.map((role) => (
                        <SelectItem key={role} value={role}>
                          {role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Personal Message</Label>
                  <Textarea
                    id="message"
                    name="message"
                    placeholder="Add a personal message to the invitation email"
                    value={inviteData.message}
                    onChange={handleInputChange}
                    rows={3}
                  />
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Project Access</Label>
                  <div className="flex items-center space-x-2 mt-2">
                    <Checkbox
                      id="allProjects"
                      checked={inviteData.allProjects}
                      onCheckedChange={handleAllProjectsToggle}
                    />
                    <Label htmlFor="allProjects" className="font-normal">
                      Grant access to all projects and sub-projects
                    </Label>
                  </div>

                  {!inviteData.allProjects && (
                    <div className="mt-4 space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Select specific projects and sub-projects:
                      </p>

                      {mockProjects.map((project) => (
                        <div key={project.id} className="border rounded-md p-4">
                          <div className="flex items-center space-x-2 mb-4">
                            <Checkbox
                              id={project.id}
                              checked={selectedProjects.includes(project.title)}
                              onCheckedChange={() =>
                                handleProjectToggle(project.title)
                              }
                            />
                            <Label htmlFor={project.id} className="font-medium">
                              {project.title}
                            </Label>
                          </div>

                          <div className="pl-6 border-l ml-2 space-y-2">
                            {project.subProjects.map((subProject) => (
                              <div
                                key={subProject.id}
                                className="flex items-center space-x-2"
                              >
                                <Checkbox
                                  id={subProject.id}
                                  checked={selectedSubProjects.includes(
                                    subProject.title
                                  )}
                                  onCheckedChange={() =>
                                    handleSubProjectToggle(
                                      subProject.title,
                                      project.title
                                    )
                                  }
                                  disabled={
                                    !selectedProjects.includes(project.title)
                                  }
                                />
                                <Label
                                  htmlFor={subProject.id}
                                  className="font-normal"
                                >
                                  {subProject.title}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="expiration">Invitation Expiration</Label>
                  <Select
                    value={inviteData.expiration}
                    onValueChange={handleExpirationChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select expiration period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 days</SelectItem>
                      <SelectItem value="7">7 days</SelectItem>
                      <SelectItem value="14">14 days</SelectItem>
                      <SelectItem value="30">30 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="sendCopy"
                    checked={inviteData.sendCopy}
                    onCheckedChange={handleSendCopyToggle}
                  />
                  <Label htmlFor="sendCopy" className="font-normal">
                    Send me a copy of the invitation
                  </Label>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={onBack}>
                  Cancel
                </Button>
                <Button type="submit" disabled={!isFormValid}>
                  <Mail className="h-4 w-4 mr-2" />
                  Send Invitation
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Invitation Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md p-4 bg-muted/20">
                <div className="flex items-center gap-2 mb-3">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <UserPlus className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">
                      Invitation to CaritasMotherTeresa
                    </h4>
                  </div>
                </div>

                <p className="text-sm mb-3">
                  You've been invited to join CaritasMotherTeresa as
                  {inviteData.role ? (
                    <Badge className="ml-1">{inviteData.role}</Badge>
                  ) : (
                    <span className="text-muted-foreground"> [Role]</span>
                  )}
                </p>

                {inviteData.message && (
                  <div className="border-l-2 pl-3 py-1 italic text-sm mb-3">
                    {inviteData.message}
                  </div>
                )}

                <div className="border rounded p-3 bg-card text-sm mb-3">
                  <p>
                    Click the button below to accept the invitation and set up
                    your account.
                  </p>
                </div>

                <div className="text-center mb-3">
                  <Button type="button" size="sm" className="w-full">
                    Accept Invitation
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground">
                  This invitation will expire in {inviteData.expiration} days.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-muted-foreground mt-0.5" />
                <p className="text-sm text-muted-foreground">
                  New employees will need to set up their account and create a
                  password when they accept the invitation.
                </p>
              </div>

              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-muted-foreground mt-0.5" />
                <p className="text-sm text-muted-foreground">
                  You can resend invitations or cancel them at any time from the
                  Employees page.
                </p>
              </div>

              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-muted-foreground mt-0.5" />
                <p className="text-sm text-muted-foreground">
                  Permissions are based on the assigned role, but can be
                  customized after the user accepts the invitation.
                </p>
              </div>
            </CardContent>
          </Card>

          {isSubmitted && (
            <Card>
              <CardHeader>
                <CardTitle className="text-green-600 dark:text-green-400 flex items-center gap-2">
                  <Check className="h-5 w-5" />
                  Invitation Sent
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm">
                  The invitation has been sent to the email address(es) you
                  provided.
                </p>

                <div className="border rounded-md p-3 space-y-2">
                  <Label className="text-xs text-muted-foreground">
                    Invitation Link
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input value={inviteLink} readOnly className="text-xs" />
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={copyInviteLink}
                      className="shrink-0"
                    >
                      {isLinkCopied ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    You can share this link manually if needed.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
