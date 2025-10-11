import { ArrowLeft, Check, Copy, Info, UserPlus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import type { InviteUserRequest } from "../../services/users/userModels";
import userService from "../../services/users/userService";
import type { AppDispatch, RootState } from "../../store";
import { selectCurrentUser } from "../../store/slices/authSlice";
import { fetchProjects } from "../../store/slices/projectsSlice";
import { fetchRoles } from "../../store/slices/roleSlice";
import { fetchAllSubProjects } from "../../store/slices/subProjectSlice";
import {
  fetchUserProjectsByUserId,
  selectUserProjectsTree,
} from "../../store/slices/userProjectsSlice";
import { Button } from "../ui/button/button";
import { Badge } from "../ui/data-display/badge";
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
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../ui/form/select";
import { Textarea } from "../ui/form/textarea";
import { Separator } from "../ui/layout/separator";

// Projects and subprojects are now fetched from API via Redux slices

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

  // Redux: projects and subprojects
  const projects = useSelector((state: RootState) => state.projects.projects);
  const projectsLoading = useSelector(
    (state: RootState) => state.projects.isLoading
  );
  const projectsError = useSelector((state: RootState) => state.projects.error);

  const subprojects = useSelector(
    (state: RootState) => state.subprojects.subprojects
  );
  const subprojectsLoading = useSelector(
    (state: RootState) => state.subprojects.isLoading
  );
  const subprojectsError = useSelector(
    (state: RootState) => state.subprojects.error
  );

  // Role + assigned projects
  const user = useSelector(selectCurrentUser);
  const userProjectsTree = useSelector(selectUserProjectsTree as any) as any[];
  const normalizedRoles = useMemo(
    () => (user?.roles || []).map((r: any) => r.name?.toLowerCase?.() || ""),
    [user?.roles]
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
  const isProgramManager = useMemo(() => {
    return normalizedRoles.some((r: string) => r.includes("program manager"));
  }, [normalizedRoles]);
  const isSubProjectManager = useMemo(() => {
    return normalizedRoles.some(
      (r: string) =>
        r === "sub-project manager" ||
        r === "sub project manager" ||
        r.includes("sub-project manager") ||
        r.includes("sub project manager")
    );
  }, [normalizedRoles]);

  // Loading state for Project Access section depending on role
  const projectAccessLoading = useMemo(() => {
    if (isSysOrSuperAdmin) return projectsLoading || subprojectsLoading;
    return (userProjectsTree || []).length === 0;
  }, [
    isSysOrSuperAdmin,
    projectsLoading,
    subprojectsLoading,
    userProjectsTree?.length,
  ]);

  useEffect(() => {
    // Fetch roles always
    dispatch(fetchRoles(undefined));
    // Fetch projects/subprojects based on role
    if (isSysOrSuperAdmin) {
      dispatch(fetchProjects());
      dispatch(fetchAllSubProjects());
    } else if ((userProjectsTree || []).length === 0 && user?.id) {
      dispatch(fetchUserProjectsByUserId(String(user.id)) as any);
    }
  }, [dispatch, isSysOrSuperAdmin, user?.id, userProjectsTree?.length]);

  // Group subprojects by projectId for quick lookup
  const subprojectsByProjectId = useMemo(() => {
    const map: Record<
      string,
      { id: string; name: string; projectId: string }[]
    > = {};
    for (const sp of subprojects) {
      if (!map[sp.projectId]) map[sp.projectId] = [];
      map[sp.projectId].push({
        id: sp.id,
        name: sp.name,
        projectId: sp.projectId,
      });
    }
    return map;
  }, [subprojects]);

  // Resolve selected role name from roles slice
  const selectedRoleName = useMemo(() => {
    const role = roles?.find((r) => String(r.id) === inviteData.role);
    return role?.name ?? "";
  }, [roles, inviteData.role]);

  // RBAC: roles available to assign in invitation
  const rolesForSelect = useMemo(() => {
    const rs = roles || [];
    if (isSysOrSuperAdmin) return rs;
    const normalize = (n: string) => (n || "").toLowerCase();
    const isFieldOp = (n: string) => {
      const x = normalize(n);
      return (
        x === "field operator" ||
        x === "field-operator" ||
        (x.includes("field") && x.includes("operator"))
      );
    };
    const isSubProjMgr = (n: string) => {
      const x = normalize(n);
      return (
        x === "sub-project manager" ||
        x === "sub project manager" ||
        (x.includes("sub") && x.includes("project") && x.includes("manager"))
      );
    };
    if (isProgramManager) {
      return rs.filter((r: any) => isSubProjMgr(r?.name) || isFieldOp(r?.name));
    }
    if (isSubProjectManager) {
      return rs.filter((r: any) => isFieldOp(r?.name));
    }
    // default: show all roles
    return rs;
  }, [roles, isSysOrSuperAdmin, isProgramManager, isSubProjectManager]);

  // Ensure selected role remains valid for current user's allowed options
  useEffect(() => {
    const allowed = new Set(
      (rolesForSelect || []).map((r: any) => String(r.id))
    );
    if (inviteData.role && !allowed.has(String(inviteData.role))) {
      setInviteData((prev) => ({ ...prev, role: "" }));
    }
  }, [rolesForSelect]);

  // RBAC: projects available for selection
  const projectsForSelect = useMemo(() => {
    if (isSysOrSuperAdmin) return projects;
    // Program/Subproject Managers: assigned only
    if (isProgramManager || isSubProjectManager) {
      return (userProjectsTree || []).map((p: any) => ({
        id: p.id,
        name: p.name,
      }));
    }
    // Default: assigned if present
    return (userProjectsTree || []).map((p: any) => ({
      id: p.id,
      name: p.name,
    }));
  }, [
    isSysOrSuperAdmin,
    isProgramManager,
    isSubProjectManager,
    projects,
    userProjectsTree,
  ]);

  // Helper: get subprojects for a project respecting role
  const getSubprojectsForProject = (projectId: string) => {
    if (isSysOrSuperAdmin) {
      return (subprojectsByProjectId[projectId] || []) as Array<{
        id: string;
        name: string;
        projectId: string;
      }>;
    }
    // Program/Subproject Managers: from assigned tree
    const proj = (userProjectsTree || []).find((p: any) => p.id === projectId);
    return ((proj?.subprojects || []) as any[]).map((sp: any) => ({
      id: sp.id,
      name: sp.name,
      projectId,
    }));
  };

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

  // Handle project selection
  const handleProjectToggle = (projectId: string) => {
    setSelectedProjects((prev) => {
      if (prev.includes(projectId)) {
        // If removing a project, also remove its sub-projects
        const subProjectsForProject = getSubprojectsForProject(projectId) || [];
        const subProjectIds = subProjectsForProject.map((sp) => sp.id);
        setSelectedSubProjects((prevSubs) =>
          prevSubs.filter((spId) => !subProjectIds.includes(spId))
        );
        return prev.filter((p) => p !== projectId);
      } else {
        // If adding a project, also select all of its sub-projects by default
        const subProjectsForProject = getSubprojectsForProject(projectId) || [];
        const subProjectIds = subProjectsForProject.map((sp) => sp.id);
        setSelectedSubProjects((prevSubs) => {
          const next = new Set(prevSubs);
          for (const id of subProjectIds) next.add(id);
          return Array.from(next);
        });
        return [...prev, projectId];
      }
    });
  };

  // Handle sub-project selection
  const handleSubProjectToggle = (subProjectId: string, projectId: string) => {
    setSelectedSubProjects((prev) => {
      if (prev.includes(subProjectId)) {
        return prev.filter((sp) => sp !== subProjectId);
      } else {
        // Make sure the parent project is selected
        if (!selectedProjects.includes(projectId)) {
          setSelectedProjects((prevProjects) => [...prevProjects, projectId]);
        }
        return [...prev, subProjectId];
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

      if (!inviteData.firstName || !inviteData.lastName || !inviteData.email) {
        throw new Error("Please fill in all required fields");
      }

      // Determine project and subproject IDs to send (selected only)
      const projectIdsToSend = selectedProjects;
      const subProjectIdsToSend = selectedSubProjects;

      // Create the invite request
      const inviteRequest: InviteUserRequest = {
        firstName: inviteData.firstName,
        lastName: inviteData.lastName,
        email: inviteData.email,
        roleIds: [selectedRoleId],
        expiration: inviteData.expiration,
        message: inviteData.message,
        projectIds: projectIdsToSend,
        subProjectIds: subProjectIdsToSend,
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
        projects: selectedProjects,
        subProjects: selectedSubProjects,
        link: verificationLink,
      };

      // Set submitted state
      setIsSubmitted(true);

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
  inviteData.role !== "";

  console.log("role id", inviteData.role);
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            className="hover:bg-[#E0F2FE] border-0"
            onClick={onBack}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Kthehu
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-[#F7F9FB] border-0   drop-shadow-sm shadow-gray-50">
          <CardHeader>
            <CardTitle>Fto punonjës</CardTitle>
            <CardDescription>
              Shtoni të dhëna për të ftuar punonjës të ri.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Emri</Label>
                  <Input
                    className="bg-white border border-gray-100 focus:ring-1 focus:border-1 focus:ring-black/5 focus:border-black/5  "
                    id="firstName"
                    name="firstName"
                    placeholder="Shkruaj Emrin"
                    value={inviteData.firstName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Mbiemri</Label>
                  <Input
                    className="bg-white border border-gray-100 focus:ring-1 focus:border-1 focus:ring-black/5 focus:border-black/5  "
                    id="lastName"
                    name="lastName"
                    placeholder="Shkruaj Mbiemrin"
                    value={inviteData.lastName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  className="bg-white border border-gray-100 focus:ring-1 focus:border-1 focus:ring-black/5 focus:border-black/5  "
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Shkruaj Email adresën"
                  value={inviteData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Roli</Label>
                <Select
                  value={inviteData.role}
                  onValueChange={handleRoleChange}
                >
                  <SelectTrigger
                    className="bg-white border border-gray-100 focus:ring-1 focus:border-1 focus:ring-black/5 focus:border-black/5  "
                    disabled={rolesLoading || !!rolesError}
                  >
                    <SelectValue
                      placeholder={
                        rolesLoading
                          ? "Duke procesuar..."
                          : rolesError
                          ? "Diçka shkoi gabim"
                          : "Zgjedh rolin"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {rolesLoading && (
                      <SelectGroup>
                        <SelectLabel>Duke procesuar...</SelectLabel>
                      </SelectGroup>
                    )}
                    {!rolesLoading && rolesError && (
                      <SelectGroup>
                        <SelectLabel>Diçka shkoi gabim</SelectLabel>
                      </SelectGroup>
                    )}
                    {!rolesLoading &&
                    !rolesError &&
                    rolesForSelect &&
                    rolesForSelect.length > 0
                      ? rolesForSelect.map((role: any) => (
                          <SelectItem key={role.id} value={String(role.id)}>
                            {role.name}
                          </SelectItem>
                        ))
                      : !rolesLoading &&
                        !rolesError && (
                          <SelectGroup>
                            <SelectLabel>
                              Nuk ka role të disponueshme.
                            </SelectLabel>
                          </SelectGroup>
                        )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Mesazhi personal</Label>
                <Textarea
                  className="bg-white border border-gray-100 focus:ring-1 focus:border-1 focus:ring-black/5 focus:border-black/5  "
                  id="message"
                  name="message"
                  placeholder="Shtoni një mesazh personal për emailin ftues"
                  value={inviteData.message}
                  onChange={handleInputChange}
                  rows={3}
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Qasja në projekte</Label>
                <div className="mt-4 space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Zgjedh projekte dhe nëpërprojekte specifike:
                  </p>

                  {projectAccessLoading ? (
                    <div className="text-sm text-muted-foreground px-1">
                      Duke procesuar...
                    </div>
                  ) : projectsError || subprojectsError ? (
                    <div className="text-sm text-red-500 px-1">
                      {projectsError || subprojectsError}
                    </div>
                  ) : projectsForSelect && projectsForSelect.length > 0 ? (
                    projectsForSelect.map((project: any) => (
                      <div key={project.id} className="border rounded-md p-4">
                        <div className="flex items-center space-x-2 mb-4">
                          <Checkbox
                            id={project.id}
                            checked={selectedProjects.includes(project.id)}
                            onCheckedChange={() =>
                              handleProjectToggle(project.id)
                            }
                          />
                          <Label htmlFor={project.id} className="font-medium">
                            {project.name}
                          </Label>
                        </div>

                        <div className="pl-6 border-l ml-2 space-y-2">
                          {getSubprojectsForProject(project.id).map(
                            (subProject: any) => (
                              <div
                                key={subProject.id}
                                className="flex items-center space-x-2"
                              >
                                <Checkbox
                                  id={subProject.id}
                                  checked={selectedSubProjects.includes(
                                    subProject.id
                                  )}
                                  onCheckedChange={() =>
                                    handleSubProjectToggle(
                                      subProject.id,
                                      project.id
                                    )
                                  }
                                  disabled={
                                    !selectedProjects.includes(project.id)
                                  }
                                />
                                <Label
                                  htmlFor={subProject.id}
                                  className="font-normal"
                                >
                                  {subProject.name}
                                </Label>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-muted-foreground px-1">
                      No projects available
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="expiration">Skadimi i ftesës</Label>
                <Select
                  value={inviteData.expiration}
                  onValueChange={handleExpirationChange}
                >
                  <SelectTrigger className="bg-white border border-gray-100 focus:ring-1 focus:border-1 focus:ring-black/5 focus:border-black/5  ">
                    <SelectValue placeholder="Select expiration period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 ditë</SelectItem>
                    <SelectItem value="7">7 ditë</SelectItem>
                    <SelectItem value="14">14 ditë</SelectItem>
                    <SelectItem value="30">30 ditë</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-between">
                <Button
                  className="bg-[#E0F2FE]  border-0 focus:ring-1 focus:border-1 focus:ring-black/5 focus:border-black/5"
                  type="button"
                  variant="outline"
                  onClick={onBack}
                  disabled={isLoading}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Khtehuni
                </Button>
                <Button
                  type="submit"
                  className="w-2/2 bg-[#0073e6] text-white"
                  disabled={isLoading || !isFormValid}
                >
                  {isLoading ? (
                    "Dërgimi në proces..."
                  ) : isSubmitted ? (
                    "Ftesa u dërgua"
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Dërgo ftesë
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="bg-[#F7F9FB] border-0   drop-shadow-sm shadow-gray-50">
            <CardHeader>
              <CardTitle>Pamje paraprake e ftesës</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-[#E3F5FF] rounded-md p-4 ">
                <div className="flex items-center gap-2 mb-3">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <UserPlus className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">
                      Ftesa për CaritasMotherTeresa
                    </h4>
                  </div>
                </div>

                <p className="text-sm mb-3">
                  Jeni ftuar t’i bashkoheni CaritasMotherTeresa si
                  {selectedRoleName ? (
                    <Badge className="ml-1">{selectedRoleName}</Badge>
                  ) : (
                    <span className="text-muted-foreground ml-1">[Role]</span>
                  )}
                </p>

                {inviteData.message && (
                  <div className="border-l-2 border-black/20 pl-3 py-1 italic text-sm mb-3">
                    {inviteData.message}
                  </div>
                )}

                <div className="border rounded p-3 bg-card text-sm mb-3">
                  <p>
                    Klikoni butonin më poshtë për të pranuar ftesën dhe për të
                    krijuar llogarinë tuaj.
                  </p>
                </div>

                <div className="text-center mb-3">
                  <Button
                    type="button"
                    size="sm"
                    className="w-full bg-[#0073e6] text-white"
                  >
                    Prano ftesën
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground">
                  Kjo ftesë do të skadon në {inviteData.expiration} ditë.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#F7F9FB] border-0   drop-shadow-sm shadow-gray-50">
            <CardHeader>
              <CardTitle>Informata shtesë</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-muted-foreground mt-0.5" />
                <p className="text-sm text-muted-foreground">
                  Punonjësit e rinj do të duhet të krijojnë llogarinë e tyre dhe
                  të vendosin një fjalëkalim kur të pranojnë ftesën.
                </p>
              </div>

              {/* <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-muted-foreground mt-0.5" />
                <p className="text-sm text-muted-foreground">
                  You can resend invitations or cancel them at any time from the
                  Employees page.
                </p>
              </div> */}

              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-muted-foreground mt-0.5" />
                <p className="text-sm text-muted-foreground">
                  Akseset bazohen në rolin e caktuar gjatë ftesës.
                </p>
              </div>
            </CardContent>
          </Card>

          {isSubmitted && (
            <Card>
              <CardHeader>
                <CardTitle className="text-green-600 dark:text-green-400 flex items-center gap-2">
                  <Check className="h-5 w-5" />
                  Ftesa u dërgua
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm">Ftesa u dërgua në {inviteData.email}.</p>

                <div className="border rounded-md p-3 space-y-2">
                  <Label className="text-xs text-muted-foreground">
                    Linku i ftesës
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
                    Mund ta shpërndani këtë link manualisht.
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
