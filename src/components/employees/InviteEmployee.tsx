import { ArrowLeft, Check, Copy, Info, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
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
  SelectLabel,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/form/select";
import { Separator } from "../ui/layout/separator";
import { Switch } from "../ui/form/switch";
import { Textarea } from "../ui/form/textarea";
import userService from "../../services/users/userService";
import { toast } from "react-hot-toast";
import type { InviteUserRequest } from "../../services/users/userModels";
import { useDispatch, useSelector } from "react-redux";
import { fetchRoles } from "../../store/slices/roleSlice";
import type { AppDispatch, RootState } from "../../store";

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

// Roles now fetched from API via Redux slice

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
    firstName: "",
    lastName: "",
    email: "",
    role: "",
    message: "",
    expiration: "7",
    sendCopy: true,
    allProjects: false,
    projectIds: [],
    subProjectIds: [],
  });

  // State for project selection
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [selectedSubProjects, setSelectedSubProjects] = useState<string[]>([]);

  // State for invite link (shown after submission)
  const [inviteLink, setInviteLink] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLinkCopied, setIsLinkCopied] = useState(false);

  // State for loading
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redux: roles
  const dispatch = useDispatch<AppDispatch>();
  const roles = useSelector((state: RootState) => state.roles.roles);
  const rolesLoading = useSelector((state: RootState) => state.roles.isLoading);
  const rolesError = useSelector((state: RootState) => state.roles.error);

  useEffect(() => {
    // Fetch roles on mount
    dispatch(fetchRoles(undefined));
  }, [dispatch]);

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
        // Remove sub-projects of the unselected project
        setSelectedSubProjects((prevSubs) =>
          prevSubs.filter((sp) => !subProjectTitles.includes(sp))
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
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Validate selected role id (stored in inviteData.role)
      const selectedRoleId = inviteData.role;
      if (!selectedRoleId) {
        throw new Error("Please select a valid role");
      }
      const roleIdNum = Number(selectedRoleId);
      if (!Number.isFinite(roleIdNum)) {
        throw new Error("Selected role id is invalid");
      }

      if (!inviteData.firstName || !inviteData.lastName || !inviteData.email) {
        throw new Error("Please fill in all required fields");
      }

      // Create the invite request
      const inviteRequest: InviteUserRequest = {
        firstName: inviteData.firstName,
        lastName: inviteData.lastName,
        email: inviteData.email,
        roleIds: [roleIdNum],
        expiration: inviteData.expiration,
        message: inviteData.message,
        projectIds: selectedProjects
          .map((projectName) => {
            const project = mockProjects.find((p) => p.title === projectName);
            return project ? parseInt(project.id.split("-")[1]) : 0;
          })
          .filter((id) => id !== 0),
        subProjectIds: selectedSubProjects
          .map((subProjectName) => {
            // Find which project contains this subproject
            for (const project of mockProjects) {
              const subProject = project.subProjects.find(
                (sp) => sp.title === subProjectName
              );
              if (subProject) return parseInt(subProject.id.split("-")[1]);
            }
            return 0;
          })
          .filter((id) => id !== 0),
      };

      // Call the API to invite the user
      const response = await userService.inviteUser(inviteRequest);

      if (!response.success) {
        throw new Error(response.message || "Failed to invite user");
      }

      // Set the verification link from the response
      const verificationLink = response.data?.verificationLink || "";
      setInviteLink(verificationLink);

      // Create invite data object for parent component
      const inviteDataObj = {
        ...inviteData,
        projects: inviteData.allProjects ? ["All Projects"] : selectedProjects,
        subProjects: inviteData.allProjects
          ? ["All Sub-Projects"]
          : selectedSubProjects,
        link: verificationLink,
      };

      // Set submitted state
      setIsSubmitted(true);

      // Show success message
      toast.success("User invited successfully");

      // Call the parent component's handler
      onInviteCreated(inviteDataObj);
    } catch (err: any) {
      setError(err.message || "Failed to invite user");
      toast.error(err.message || "Failed to invite user");
    } finally {
      setIsLoading(false);
    }
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

  // Check if form is valid for submission
  const isFormValid =
    inviteData.firstName.trim() !== "" &&
    inviteData.lastName.trim() !== "" &&
    inviteData.email.trim() !== "" &&
    inviteData.role !== "";

  console.log("role id", inviteData.role);

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
              Enter the details for the new employee invitation.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    placeholder="Enter first name"
                    value={inviteData.firstName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    placeholder="Enter last name"
                    value={inviteData.lastName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter email address"
                  value={inviteData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={inviteData.role}
                  onValueChange={handleRoleChange}
                >
                  <SelectTrigger disabled={rolesLoading || !!rolesError}>
                    <SelectValue
                      placeholder={
                        rolesLoading
                          ? "Loading roles..."
                          : rolesError
                          ? "Failed to load roles"
                          : "Select a role"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {rolesLoading && (
                      <SelectGroup>
                        <SelectLabel>Loading...</SelectLabel>
                      </SelectGroup>
                    )}
                    {!rolesLoading && rolesError && (
                      <SelectGroup>
                        <SelectLabel>Error loading roles</SelectLabel>
                      </SelectGroup>
                    )}
                    {!rolesLoading && !rolesError && roles && roles.length > 0
                      ? roles.map((role) => (
                          <SelectItem key={role.id} value={String(role.id)}>
                            {role.name}
                          </SelectItem>
                        ))
                      : !rolesLoading &&
                        !rolesError && (
                          <SelectGroup>
                            <SelectLabel>No roles available</SelectLabel>
                          </SelectGroup>
                        )}
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

              <div className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onBack}
                  disabled={isLoading}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading || !isFormValid}
                >
                  {isLoading ? (
                    "Sending Invitation..."
                  ) : isSubmitted ? (
                    "Invitation Sent"
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Send Invitation
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {/* <Card>
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
          </Card> */}

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
                  The invitation has been sent to {inviteData.email}.
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

          {error && (
            <Card className="border-red-500">
              <CardContent className="pt-6">
                <p className="text-red-500">{error}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
