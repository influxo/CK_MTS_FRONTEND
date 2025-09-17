import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  FileEdit,
  User,
  Users,
  Plus,
  X,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "sonner";
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
import { Input } from "../ui/form/input";
import { Label } from "../ui/form/label";
import { RadioGroup, RadioGroupItem } from "../ui/form/radio-group";
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
import { Textarea } from "../ui/form/textarea";
import { ProjectActivity } from "./ProjectActivity";
import { ProjectExport } from "./ProjectExport";
import { ProjectStats } from "./ProjectStats";
import { ProjectTeam } from "./ProjectTeam";
import { SubProjects } from "./SubProjects";
import { ProjectServices } from "./ProjectServices";
import {
  selectAllProjects,
  selectProjectsLoading,
} from "../../store/slices/projectsSlice";
import type { AppDispatch } from "../../store";
import projectService from "../../services/projects/projectService";
import type { Project } from "../../services/projects/projectModels";
import { Progress } from "../ui/feedback/progress";
import {
  fetchEmployees,
  selectAllEmployees,
  selectEmployeesError,
  selectEmployeesLoading,
} from "../../store/slices/employeesSlice";
import {
  fetchSubProjectsByProjectId,
  selectAllSubprojects,
  selectSubprojectsLoading,
  selectSubprojectsError,
} from "../../store/slices/subProjectSlice";
import {
  fetchBeneficiariesByEntity,
  selectBeneficiariesByEntity,
  selectBeneficiariesByEntityError,
  selectBeneficiariesByEntityLoading,
  selectBeneficiariesByEntityPagination,
} from "../../store/slices/beneficiarySlice";
import {
  createBeneficiary,
  associateBeneficiaryToEntities,
  clearBeneficiaryMessages,
  selectBeneficiaryIsLoading,
  selectBeneficiaryError,
  selectBeneficiaryCreateSuccessMessage,
  selectBeneficiaryAssociateLoading,
  fetchBeneficiaries,
  selectBeneficiaries,
  selectBeneficiariesLoading,
  selectBeneficiariesError,
} from "../../store/slices/beneficiarySlice";
import type { CreateBeneficiaryRequest } from "../../services/beneficiaries/beneficiaryModels";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/data-display/avatar";
import { Checkbox } from "../ui/form/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/data-display/table";

// Mock project data for enhanced details
const mockProjectDetails = {
  id: "proj-001",
  title: "Rural Healthcare Initiative",
  category: "Healthcare",
  type: "Service Delivery",
  status: "active",
  progress: 65,
  subProjects: 4,
  beneficiaries: 1245,
  startDate: "2025-01-15",
  endDate: "2025-07-15",
  leads: ["Jane Smith", "Robert Johnson"],
  description:
    "Comprehensive healthcare services for underserved rural communities in the northern region. This project aims to provide basic healthcare services to communities with limited access to medical facilities. Services include regular health checkups, vaccinations, maternal care, and health education.",
  objectives: [
    "Provide healthcare services to at least 2,000 beneficiaries",
    "Conduct 5,000 health consultations",
    "Establish 5 temporary health clinics in remote areas",
    "Train 30 community health workers",
  ],
  budget: 450000,
  fundingSource: "Global Health Fund",
};

export function ProjectDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const [activeTab, setActiveTab] = useState("overview");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [project, setProject] = useState<Project | null>(null);
  const employees = useSelector(selectAllEmployees);
  const isEmployeeLoading = useSelector(selectEmployeesLoading);
  const employeeError = useSelector(selectEmployeesError);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSubProjectId, setSelectedSubProjectId] = useState<
    string | null
  >(null);

  // Create Beneficiary dialog state and form
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [addBeneficiaryTab, setAddBeneficiaryTab] = useState<
    "new" | "existing"
  >("new");
  const [form, setForm] = useState<CreateBeneficiaryRequest>({
    firstName: "",
    lastName: "",
    dob: "",
    nationalId: "",
    phone: "",
    email: "",
    address: "",
    gender: "female",
    municipality: "",
    nationality: "",
    status: "active",
  });
  // Chip-based details state
  const [allergies, setAllergies] = useState<string[]>([]);
  const [disabilities, setDisabilities] = useState<string[]>([]);
  const [chronicConditions, setChronicConditions] = useState<string[]>([]);
  const [medications, setMedications] = useState<string[]>([]);
  // input staging values
  const [allergiesInput, setAllergiesInput] = useState("");
  const [disabilitiesInput, setDisabilitiesInput] = useState("");
  const [chronicConditionsInput, setChronicConditionsInput] = useState("");
  const [medicationsInput, setMedicationsInput] = useState("");
  const [bloodTypeInput, setBloodTypeInput] = useState("");
  const [notesInput, setNotesInput] = useState("");
  const [selectedSubProjects, setSelectedSubProjects] = useState<string[]>([]);

  const addItem = (
    value: string,
    list: string[],
    setter: (next: string[]) => void
  ) => {
    const v = (value || "").trim();
    if (!v) return;
    if (list.some((i) => i.toLowerCase() === v.toLowerCase())) return;
    setter([...list, v]);
  };
  const removeItemAt = (
    index: number,
    list: string[],
    setter: (next: string[]) => void
  ) => {
    setter(list.filter((_, i) => i !== index));
  };

  // Associate Existing state (used in Add Beneficiary modal > Add Existing tab)
  const [associateSelectedBeneficiaryId, setAssociateSelectedBeneficiaryId] =
    useState<string>("");
  const [associateSelectedSubProjects, setAssociateSelectedSubProjects] =
    useState<string[]>([]);

  // Get projects from Redux store
  const allProjects = useSelector(selectAllProjects);
  const storeLoading = useSelector(selectProjectsLoading);

  useEffect(() => {
    const fetchProjectDetails = async () => {
      if (!id) {
        toast.error("Project ID is missing");
        navigate("/projects");
        return;
      }

      // First check if we already have the project in the Redux store
      const projectFromStore = allProjects.find((p) => p.id === id);

      if (projectFromStore) {
        setProject(projectFromStore);
        return;
      }

      // If not in store, fetch from API
      setIsLoading(true);
      setError(null);

      try {
        const response = await projectService.getAllProjects();
        if (response.success) {
          const foundProject = response.data.find((p) => p.id === id);

          if (foundProject) {
            setProject(foundProject);
          } else {
            // toast.error({
            //   title: "Project not found",
            //   description:
            //     "The project you're trying to view doesn't exist or has been removed.",
            //   action: {
            //     label: "Back to Projects",
            //     onClick: () => navigate("/projects"),
            //   },
            // });
            navigate("/projects");
          }
        } else {
          throw new Error(response.message || "Failed to fetch project");
        }
      } catch (err: any) {
        setError(err.message || "An error occurred while fetching the project");
        toast.error("Failed to load project details", {
          description: err.message || "Please try again later",
          action: {
            label: "Back to Projects",
            onClick: () => navigate("/projects"),
          },
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjectDetails();
  }, [id, allProjects, navigate]);

  useEffect(() => {
    dispatch(fetchEmployees());
  }, [dispatch]);
  console.log("employees", employees);

  // Load beneficiaries for this project when the Beneficiaries tab is active
  const byEntityItems = useSelector(selectBeneficiariesByEntity);
  const byEntityLoading = useSelector(selectBeneficiariesByEntityLoading);
  const byEntityError = useSelector(selectBeneficiariesByEntityError);
  const byEntityMeta = useSelector(selectBeneficiariesByEntityPagination);

  // Create/associate selectors
  const createLoading = useSelector(selectBeneficiaryIsLoading);
  const createError = useSelector(selectBeneficiaryError);
  const createSuccess = useSelector(selectBeneficiaryCreateSuccessMessage);
  const associateLoading = useSelector(selectBeneficiaryAssociateLoading);

  // Global beneficiaries list (for association modal)
  const listItems = useSelector(selectBeneficiaries);
  const listLoading = useSelector(selectBeneficiariesLoading);
  const listError = useSelector(selectBeneficiariesError);

  // Subprojects of this project
  const subprojects = useSelector(selectAllSubprojects);
  const subprojectsLoading = useSelector(selectSubprojectsLoading);
  const subprojectsError = useSelector(selectSubprojectsError);

  // Build a view model for table rendering similar to BeneficiariesList
  const tableRows = byEntityItems.map((b) => {
    const pii: any = (b as any).pii || {};
    const firstName: string = pii.firstName || "";
    const lastName: string = pii.lastName || "";
    const fullName = `${firstName} ${lastName}`.trim() || b.pseudonym || b.id;
    const initials =
      `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase() ||
      (b.pseudonym ? b.pseudonym.slice(0, 2) : "") ||
      "BN";
    return {
      id: b.id,
      name: fullName,
      initials,
      pseudonym: b.pseudonym,
      status: b.status,
      createdAt: b.createdAt,
      gender: pii.gender || "",
      dob: pii.dob || "",
      municipality: pii.municipality || "",
      nationality: pii.nationality || "",
      phone: pii.phone || "",
      email: pii.email || "",
    };
  });

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const allSelected =
    selectedIds.length === tableRows.length && tableRows.length > 0;
  const toggleSelectAll = () => {
    setSelectedIds(allSelected ? [] : tableRows.map((r) => r.id));
  };
  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  useEffect(() => {
    if (activeTab === "beneficiaries" && id) {
      dispatch(
        fetchBeneficiariesByEntity({
          entityId: id,
          entityType: "project",
          page: 1,
          limit: 20,
        })
      );
      // Also load subprojects for association selection
      dispatch(
        fetchSubProjectsByProjectId({
          projectId: id,
        })
      );
    }
  }, [activeTab, id, dispatch]);

  // After successful create (+ association if any), close dialog, reset form, refresh list
  useEffect(() => {
    if (createSuccess && !associateLoading && id) {
      setIsAddDialogOpen(false);
      resetForm();
      dispatch(
        fetchBeneficiariesByEntity({
          entityId: id,
          entityType: "project",
          page: 1,
          limit: 20,
        })
      );
      dispatch(clearBeneficiaryMessages());
    }
  }, [createSuccess, associateLoading, id, dispatch]);

  // Fetch beneficiaries list when "Add Existing" tab is visible in the Add dialog
  useEffect(() => {
    if (isAddDialogOpen && addBeneficiaryTab === "existing") {
      dispatch(fetchBeneficiaries(undefined));
    }
  }, [isAddDialogOpen, addBeneficiaryTab, dispatch]);

  const handleAssociateSubmit = async () => {
    if (!id) {
      toast.error("Missing project ID");
      return;
    }
    if (!associateSelectedBeneficiaryId) {
      toast("Please select a beneficiary to associate");
      return;
    }
    const links = [
      { entityId: id, entityType: "project" as const },
      ...associateSelectedSubProjects.map((spId) => ({
        entityId: spId,
        entityType: "subproject" as const,
      })),
    ];
    try {
      await dispatch(
        associateBeneficiaryToEntities({
          id: associateSelectedBeneficiaryId,
          links,
        })
      ).unwrap();
      toast.success("Beneficiary associated successfully");
      setIsAddDialogOpen(false);
      resetAssociateForm();
      // refresh table
      await dispatch(
        fetchBeneficiariesByEntity({
          entityId: id,
          entityType: "project",
          page: 1,
          limit: 20,
        })
      );
    } catch (_) {
      toast.error("Failed to associate beneficiary. Please try again.");
    }
  };

  const resetAssociateForm = () => {
    setAssociateSelectedBeneficiaryId("");
    setAssociateSelectedSubProjects([]);
  };

  const resetForm = () => {
    setForm({
      firstName: "",
      lastName: "",
      dob: "",
      nationalId: "",
      phone: "",
      email: "",
      address: "",
      gender: "female",
      municipality: "",
      nationality: "",
      status: "active",
    });
    setAllergiesInput("");
    setDisabilitiesInput("");
    setChronicConditionsInput("");
    setMedicationsInput("");
    setBloodTypeInput("");
    setNotesInput("");
    setAllergies([]);
    setDisabilities([]);
    setChronicConditions([]);
    setMedications([]);
    setSelectedSubProjects([]);
  };

  const handleCreateSubmit = async () => {
    if (!form.firstName || !form.lastName || !form.gender || !form.status) {
      return;
    }
    try {
      // finalize arrays including any residual input as a single item
      const allergiesFinal = [
        ...allergies,
        ...(allergiesInput.trim() ? [allergiesInput.trim()] : []),
      ];
      const disabilitiesFinal = [
        ...disabilities,
        ...(disabilitiesInput.trim() ? [disabilitiesInput.trim()] : []),
      ];
      const chronicConditionsFinal = [
        ...chronicConditions,
        ...(chronicConditionsInput.trim()
          ? [chronicConditionsInput.trim()]
          : []),
      ];
      const medicationsFinal = [
        ...medications,
        ...(medicationsInput.trim() ? [medicationsInput.trim()] : []),
      ];

      const hasAnyDetails =
        allergiesFinal.length > 0 ||
        disabilitiesFinal.length > 0 ||
        chronicConditionsFinal.length > 0 ||
        medicationsFinal.length > 0 ||
        !!bloodTypeInput.trim() ||
        !!notesInput.trim();

      const payload: CreateBeneficiaryRequest = hasAnyDetails
        ? {
            ...form,
            details: {
              allergies: allergiesFinal,
              disabilities: disabilitiesFinal,
              chronicConditions: chronicConditionsFinal,
              medications: medicationsFinal,
              bloodType: bloodTypeInput.trim(),
              notes: notesInput.trim() || undefined,
            },
          }
        : form;

      const createRes = await dispatch(createBeneficiary(payload)).unwrap();
      const newId = createRes?.data?.id;
      if (newId && id) {
        const links = [
          { entityId: id, entityType: "project" as const },
          ...selectedSubProjects.map((spId) => ({
            entityId: spId,
            entityType: "subproject" as const,
          })),
        ];
        if (links.length > 0) {
          try {
            await dispatch(
              associateBeneficiaryToEntities({
                id: newId,
                links,
              })
            ).unwrap();
            // Explicitly refetch to update the table immediately after association
            await dispatch(
              fetchBeneficiariesByEntity({
                entityId: id,
                entityType: "project",
                page: 1,
                limit: 20,
              })
            );
          } catch (_) {
            // association error handled via slice selectors
          }
        }
      }
      // success effect will close/reset/refresh
    } catch (_) {
      // errors surfaced via createError
    }
  };

  if (isLoading || storeLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4">Loading project details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <h2 className="text-xl font-semibold text-destructive">
          Error loading project
        </h2>
        <p className="mt-2 text-muted-foreground">{error}</p>
        <Button className="mt-4" onClick={() => navigate(-1)}>
          Back to Projects
        </Button>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <h2 className="text-xl font-semibold">Project not found</h2>
        <p className="mt-2 text-muted-foreground">
          The project you're looking for doesn't exist or has been removed.
        </p>
        <Button className="mt-4" onClick={() => navigate(-1)}>
          Back to Projects
        </Button>
      </div>
    );
  }

  // Merge the API project data with mock data for enhanced UI
  const enhancedProject = {
    ...project,
    title: project.name,
    type: mockProjectDetails.type,
    progress: mockProjectDetails.progress,
    subProjects: mockProjectDetails.subProjects,
    beneficiaries: mockProjectDetails.beneficiaries,
    startDate: project.createdAt,
    endDate: project.updatedAt,
    leads: mockProjectDetails.leads,
    objectives: mockProjectDetails.objectives,
    budget: mockProjectDetails.budget,
    fundingSource: mockProjectDetails.fundingSource,
  };

  return (
    <div className="space-y-6 ">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Projects
        </Button>
        <h2 className="text-3xl font-semibold capitalize">
          {enhancedProject.title}
        </h2>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="ml-auto bg-[#0073e6] border-0 text-white"
            >
              <FileEdit className="h-4 w-4 mr-2" />
              Edit Project
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Edit Project</DialogTitle>
              <DialogDescription>
                Update the details for this project. All fields marked with *
                are required.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">
                  Title *
                </Label>
                <Input
                  id="title"
                  className="col-span-3"
                  defaultValue={enhancedProject.title}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">
                  Category *
                </Label>
                <Select defaultValue={enhancedProject.category.toLowerCase()}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="infrastructure">
                      Infrastructure
                    </SelectItem>
                    <SelectItem value="nutrition">Nutrition</SelectItem>
                    <SelectItem value="economic development">
                      Economic Development
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="type" className="text-right">
                  Type *
                </Label>
                <Select
                  defaultValue={enhancedProject.type
                    .toLowerCase()
                    .replace(" ", "-")}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="service-delivery">
                      Service Delivery
                    </SelectItem>
                    <SelectItem value="training">Training</SelectItem>
                    <SelectItem value="construction">Construction</SelectItem>
                    <SelectItem value="distribution">Distribution</SelectItem>
                    <SelectItem value="research">Research</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">
                  Status
                </Label>
                <Select defaultValue={enhancedProject.status}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="start-date" className="text-right">
                  Start Date *
                </Label>
                <Input
                  id="start-date"
                  type="date"
                  className="col-span-3"
                  defaultValue={enhancedProject.startDate.split("T")[0]}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="end-date" className="text-right">
                  End Date *
                </Label>
                <Input
                  id="end-date"
                  type="date"
                  className="col-span-3"
                  defaultValue={enhancedProject.endDate.split("T")[0]}
                />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="description" className="text-right pt-2">
                  Description
                </Label>
                <Textarea
                  id="description"
                  className="col-span-3"
                  defaultValue={enhancedProject.description}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={() => setIsEditDialogOpen(false)}>
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="flex  bg-[#F7F9FB] border-0   drop-shadow-sm shadow-gray-50 ">
        <CardContent className="p-6 w-full">
          <div className="flex flex-col md:flex-row gap-6 w-full">
            <div className="flex-1 space-y-5">
              <div className="flex gap-2">
                <Badge
                  variant="outline"
                  className="bg-[#0073e6] text-white border-0"
                >
                  {enhancedProject.category}
                </Badge>
                <Badge variant="outline">{enhancedProject.type}</Badge>
                <Badge
                  variant="default"
                  className="border-0"
                  style={
                    enhancedProject.status === "active"
                      ? { backgroundColor: "#DEF8EE", color: "#4AA785" }
                      : enhancedProject.status === "pending"
                      ? { backgroundColor: "#E2F5FF", color: "#59A8D4" }
                      : {
                          backgroundColor: "rgba(28,28,28,0.05)",
                          color: "rgba(28,28,28,0.4)",
                        }
                  }
                >
                  {enhancedProject.status === "active"
                    ? "Active"
                    : enhancedProject.status === "pending"
                    ? "Pending"
                    : "Inactive"}
                </Badge>
              </div>
              {/* TODO:   */}
              <h3 className="text-xl font-normal  capitalize">
                {enhancedProject.description}
              </h3>
            </div>

            <div>
              {/* <Dialog
                open={isEditDialogOpen}
                onOpenChange={setIsEditDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button variant="outline" className="bg-[#2B2B2B] text-white">
                    <FileEdit className="h-4 w-4 mr-2" />
                    Edit Project
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[550px]">
                  <DialogHeader>
                    <DialogTitle>Edit Project</DialogTitle>
                    <DialogDescription>
                      Update the details for this project. All fields marked
                      with * are required.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="title" className="text-right">
                        Title *
                      </Label>
                      <Input
                        id="title"
                        className="col-span-3"
                        defaultValue={enhancedProject.title}
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="category" className="text-right">
                        Category *
                      </Label>
                      <Select
                        defaultValue={enhancedProject.category.toLowerCase()}
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="healthcare">Healthcare</SelectItem>
                          <SelectItem value="education">Education</SelectItem>
                          <SelectItem value="infrastructure">
                            Infrastructure
                          </SelectItem>
                          <SelectItem value="nutrition">Nutrition</SelectItem>
                          <SelectItem value="economic development">
                            Economic Development
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="type" className="text-right">
                        Type *
                      </Label>
                      <Select
                        defaultValue={enhancedProject.type
                          .toLowerCase()
                          .replace(" ", "-")}
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="service-delivery">
                            Service Delivery
                          </SelectItem>
                          <SelectItem value="training">Training</SelectItem>
                          <SelectItem value="construction">
                            Construction
                          </SelectItem>
                          <SelectItem value="distribution">
                            Distribution
                          </SelectItem>
                          <SelectItem value="research">Research</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="status" className="text-right">
                        Status
                      </Label>
                      <Select defaultValue={enhancedProject.status}>
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="planning">Planning</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="start-date" className="text-right">
                        Start Date *
                      </Label>
                      <Input
                        id="start-date"
                        type="date"
                        className="col-span-3"
                        defaultValue={enhancedProject.startDate.split("T")[0]}
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="end-date" className="text-right">
                        End Date *
                      </Label>
                      <Input
                        id="end-date"
                        type="date"
                        className="col-span-3"
                        defaultValue={enhancedProject.endDate.split("T")[0]}
                      />
                    </div>
                    <div className="grid grid-cols-4 items-start gap-4">
                      <Label htmlFor="description" className="text-right pt-2">
                        Description
                      </Label>
                      <Textarea
                        id="description"
                        className="col-span-3"
                        defaultValue={enhancedProject.description}
                        rows={3}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsEditDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={() => setIsEditDialogOpen(false)}>
                      Save Changes
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog> */}

              {/* 2x2 grid of project summary cards */}
              <div className=" grid grid-cols-1 sm:grid-cols-2  gap-4">
                <div className=" bg-[#E5ECF6] rounded-xl p-4">
                  <div className="text-sm text-muted-foreground">Timeline</div>
                  <div className="flex items-center gap-1 mt-1">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {new Date(enhancedProject.startDate).toLocaleDateString()}{" "}
                      - {new Date(enhancedProject.endDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className=" bg-[#E5ECF6] rounded-xl p-4">
                  <div className="text-sm text-muted-foreground">
                    Project Leads
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{enhancedProject.leads.join(", ")}</span>
                  </div>
                </div>

                <div className=" bg-[#E5ECF6] rounded-xl p-4">
                  <div className="text-sm text-muted-foreground">
                    Sub-Projects
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    <span>{enhancedProject.subProjects} Sub-projects</span>
                  </div>
                </div>

                <div className=" bg-[#E5ECF6] rounded-xl p-4">
                  <div className="text-sm text-muted-foreground">
                    Beneficiaries
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{enhancedProject.beneficiaries} Beneficiaries</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full bg-[#E3F5FF]  pt-3 drop-shadow-sm shadow-gray-50   mt-4 h-auto">
          <div className="flex gap-4">
            <TabsTrigger
              value="overview"
              className={`rounded-none bg-transparent border-0 border-b-2 pb-3 hover:bg-transparent text-black ${
                activeTab === "overview" ? "border-black" : "border-transparent"
              }`}
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="subprojects"
              className={`rounded-none bg-transparent border-0 border-b-2 pb-3 hover:bg-transparent text-black ${
                activeTab === "subprojects"
                  ? "border-black"
                  : "border-transparent"
              }`}
            >
              Sub-Projects
            </TabsTrigger>
            <TabsTrigger
              value="services"
              className={`rounded-none bg-transparent border-0 border-b-2 pb-3 hover:bg-transparent text-black ${
                activeTab === "services" ? "border-black" : "border-transparent"
              }`}
            >
              Services
            </TabsTrigger>
            <TabsTrigger
              value="team"
              className={`rounded-none bg-transparent border-0 border-b-2 pb-3 hover:bg-transparent text-black ${
                activeTab === "team" ? "border-black" : "border-transparent"
              }`}
            >
              Team
            </TabsTrigger>
            <TabsTrigger
              value="beneficiaries"
              className={`rounded-none bg-transparent border-0 border-b-2 pb-3 hover:bg-transparent text-black ${
                activeTab === "beneficiaries"
                  ? "border-black"
                  : "border-transparent"
              }`}
            >
              Beneficiaries
            </TabsTrigger>
            <TabsTrigger
              value="reports"
              className={`rounded-none bg-transparent border-0 border-b-2 pb-3 hover:bg-transparent text-black ${
                activeTab === "reports" ? "border-black" : "border-transparent"
              }`}
            >
              Reports & Exports
            </TabsTrigger>
          </div>
        </TabsList>

        <TabsContent value="overview" className="pt-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="col-span-2 space-y-6">
              <ProjectStats projectId={enhancedProject.id} />
              {/* <ProjectActivity projectId={enhancedProject.id} /> */}
            </div>
            <div className="space-y-6">
              {/* <Card className="bg-[#F7F9FB] border-0 drop-shadow-sm shadow-gray-50">
                <CardContent className="p-6">
                  <h3 className="mb-3">Project Objectives</h3>
                  <ul className="space-y-2">
                    {enhancedProject.objectives.map((objective, index) => (
                      <li key={index} className="flex items-baseline gap-2">
                        <CheckCircle className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{objective}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-4 pt-4 border-t">
                    <div className="mb-2">
                      <span className="text-sm text-muted-foreground">
                        Budget
                      </span>
                      <div className="text-xl font-medium">
                        ${enhancedProject.budget.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">
                        Funding Source
                      </span>
                      <div>{enhancedProject.fundingSource}</div>
                    </div>
                  </div>
                </CardContent>
              </Card> */}
              <ProjectActivity projectId={enhancedProject.id} />
            </div>
          </div>
        </TabsContent>

        {/* IMPORTANT: */}
        {/* TODO: projectId duhet me shku prej struktures tone, tash shkon statikisht prej mock data*/}

        <TabsContent value="subprojects" className="mt-6">
          {/* <SubProjects projectId={enhancedProject.id}" /> */}
          <SubProjects projectId={enhancedProject.id} />
        </TabsContent>

        <TabsContent value="services" className="pt-6">
          <ProjectServices projectId={enhancedProject.id} />
        </TabsContent>

        <TabsContent value="team" className="pt-6">
          {/* <ProjectTeam projectId={enhancedProject.id} /> */}
          <ProjectTeam projectId={enhancedProject.id} />
        </TabsContent>

        <TabsContent value="beneficiaries" className="pt-6">
          {byEntityLoading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              Loading beneficiaries...
            </div>
          )}
          {byEntityError && !byEntityLoading && (
            <div className="text-sm text-red-600">{byEntityError}</div>
          )}
          {!byEntityLoading && !byEntityError && (
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-medium">
                  Beneficiaries ({byEntityMeta.totalItems})
                </h3>
                <Dialog
                  open={isAddDialogOpen}
                  onOpenChange={setIsAddDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button
                      className="bg-[#0073e6] text-white flex items-center
             px-4 py-2 rounded-md border-0
             transition-transform duration-200 ease-in-out
             hover:scale-[1.02] hover:-translate-y-[1px]"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Beneficiary
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[550px] max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Add Beneficiary</DialogTitle>
                      <DialogDescription>
                        Use the tabs below to add a brand new beneficiary or
                        associate an existing one with this project.
                      </DialogDescription>
                    </DialogHeader>

                    <Tabs
                      value={addBeneficiaryTab}
                      onValueChange={(v) =>
                        setAddBeneficiaryTab(v as "new" | "existing")
                      }
                    >
                      <TabsList className="mb-4 bg-blue-200 bg-opacity-10 items-center">
                        <TabsTrigger
                          value="new"
                          className=" data-[state=active]:bg-[#0073e6]  data-[state=active]:text-white  "
                        >
                          Add New
                        </TabsTrigger>
                        <TabsTrigger
                          value="existing"
                          className="data-[state=active]:bg-[#0073e6]  data-[state=active]:text-white"
                        >
                          Add Existing
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="new" className="m-0 p-0">
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="firstName" className="text-right">
                              First Name *
                            </Label>
                            <Input
                              id="firstName"
                              className="col-span-3"
                              placeholder="Enter first name"
                              value={form.firstName}
                              onChange={(e) =>
                                setForm({ ...form, firstName: e.target.value })
                              }
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="lastName" className="text-right">
                              Last Name *
                            </Label>
                            <Input
                              id="lastName"
                              className="col-span-3"
                              placeholder="Enter last name"
                              value={form.lastName}
                              onChange={(e) =>
                                setForm({ ...form, lastName: e.target.value })
                              }
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Gender *</Label>
                            <RadioGroup
                              className="col-span-3 flex gap-4"
                              value={form.gender}
                              onValueChange={(val) =>
                                setForm({ ...form, gender: val })
                              }
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="female" id="female" />
                                <Label htmlFor="female">Female</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="male" id="male" />
                                <Label htmlFor="male">Male</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="other" id="other" />
                                <Label htmlFor="other">Other</Label>
                              </div>
                            </RadioGroup>
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="dob" className="text-right">
                              Date of Birth *
                            </Label>
                            <Input
                              id="dob"
                              type="date"
                              className="col-span-3"
                              value={form.dob}
                              onChange={(e) =>
                                setForm({ ...form, dob: e.target.value })
                              }
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="nationalId" className="text-right">
                              National ID *
                            </Label>
                            <Input
                              id="nationalId"
                              className="col-span-3"
                              placeholder="Enter national ID"
                              value={form.nationalId}
                              onChange={(e) =>
                                setForm({ ...form, nationalId: e.target.value })
                              }
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="phone" className="text-right">
                              Phone
                            </Label>
                            <Input
                              id="phone"
                              className="col-span-3"
                              placeholder="Enter phone number"
                              value={form.phone}
                              onChange={(e) =>
                                setForm({ ...form, phone: e.target.value })
                              }
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="email" className="text-right">
                              Email
                            </Label>
                            <Input
                              id="email"
                              type="email"
                              className="col-span-3"
                              placeholder="Enter email"
                              value={form.email}
                              onChange={(e) =>
                                setForm({ ...form, email: e.target.value })
                              }
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="address" className="text-right">
                              Address
                            </Label>
                            <Input
                              id="address"
                              className="col-span-3"
                              placeholder="Enter address"
                              value={form.address}
                              onChange={(e) =>
                                setForm({ ...form, address: e.target.value })
                              }
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label
                              htmlFor="municipality"
                              className="text-right"
                            >
                              Municipality
                            </Label>
                            <Input
                              id="municipality"
                              className="col-span-3"
                              placeholder="Enter municipality"
                              value={form.municipality}
                              onChange={(e) =>
                                setForm({
                                  ...form,
                                  municipality: e.target.value,
                                })
                              }
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="nationality" className="text-right">
                              Nationality
                            </Label>
                            <Input
                              id="nationality"
                              className="col-span-3"
                              placeholder="Enter nationality"
                              value={form.nationality}
                              onChange={(e) =>
                                setForm({
                                  ...form,
                                  nationality: e.target.value,
                                })
                              }
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="status" className="text-right">
                              Status *
                            </Label>
                            <Select
                              value={form.status}
                              onValueChange={(val) =>
                                setForm({ ...form, status: val })
                              }
                            >
                              <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">
                                  Inactive
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="border-t pt-2 mt-2">
                            <div className="text-sm font-medium mb-2">
                              Additional Details
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4 mb-2">
                              <Label htmlFor="allergies" className="text-right">
                                Allergies
                              </Label>
                              <div className="col-span-3 space-y-2">
                                <div className="flex gap-2">
                                  <Input
                                    id="allergies"
                                    placeholder="Type and press Enter"
                                    value={allergiesInput}
                                    onChange={(e) =>
                                      setAllergiesInput(e.target.value)
                                    }
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") {
                                        e.preventDefault();
                                        addItem(
                                          allergiesInput,
                                          allergies,
                                          setAllergies
                                        );
                                        setAllergiesInput("");
                                      }
                                    }}
                                  />
                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                      addItem(
                                        allergiesInput,
                                        allergies,
                                        setAllergies
                                      );
                                      setAllergiesInput("");
                                    }}
                                  >
                                    <Plus className="h-4 w-4 mr-1" /> Add
                                  </Button>
                                </div>
                                {allergies.length > 0 && (
                                  <div className="flex flex-wrap gap-2">
                                    {allergies.map((a, idx) => (
                                      <div
                                        key={`${a}-${idx}`}
                                        className="inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs bg-[#E5ECF6]"
                                      >
                                        <span>{a}</span>
                                        <button
                                          type="button"
                                          className="hover:text-red-600"
                                          onClick={() =>
                                            removeItemAt(
                                              idx,
                                              allergies,
                                              setAllergies
                                            )
                                          }
                                          aria-label={`Remove ${a}`}
                                        >
                                          <X className="h-3 w-3" />
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4 mb-2">
                              <Label
                                htmlFor="disabilities"
                                className="text-right"
                              >
                                Disabilities
                              </Label>
                              <div className="col-span-3 space-y-2">
                                <div className="flex gap-2">
                                  <Input
                                    id="disabilities"
                                    placeholder="Type and press Enter"
                                    value={disabilitiesInput}
                                    onChange={(e) =>
                                      setDisabilitiesInput(e.target.value)
                                    }
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") {
                                        e.preventDefault();
                                        addItem(
                                          disabilitiesInput,
                                          disabilities,
                                          setDisabilities
                                        );
                                        setDisabilitiesInput("");
                                      }
                                    }}
                                  />
                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                      addItem(
                                        disabilitiesInput,
                                        disabilities,
                                        setDisabilities
                                      );
                                      setDisabilitiesInput("");
                                    }}
                                  >
                                    <Plus className="h-4 w-4 mr-1" /> Add
                                  </Button>
                                </div>
                                {disabilities.length > 0 && (
                                  <div className="flex flex-wrap gap-2">
                                    {disabilities.map((d, idx) => (
                                      <div
                                        key={`${d}-${idx}`}
                                        className="inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs bg-[#E5ECF6]"
                                      >
                                        <span>{d}</span>
                                        <button
                                          type="button"
                                          className="hover:text-red-600"
                                          onClick={() =>
                                            removeItemAt(
                                              idx,
                                              disabilities,
                                              setDisabilities
                                            )
                                          }
                                          aria-label={`Remove ${d}`}
                                        >
                                          <X className="h-3 w-3" />
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4 mb-2">
                              <Label
                                htmlFor="chronicConditions"
                                className="text-right"
                              >
                                Chronic Conditions
                              </Label>
                              <div className="col-span-3 space-y-2">
                                <div className="flex gap-2">
                                  <Input
                                    id="chronicConditions"
                                    placeholder="Type and press Enter"
                                    value={chronicConditionsInput}
                                    onChange={(e) =>
                                      setChronicConditionsInput(e.target.value)
                                    }
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") {
                                        e.preventDefault();
                                        addItem(
                                          chronicConditionsInput,
                                          chronicConditions,
                                          setChronicConditions
                                        );
                                        setChronicConditionsInput("");
                                      }
                                    }}
                                  />
                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                      addItem(
                                        chronicConditionsInput,
                                        chronicConditions,
                                        setChronicConditions
                                      );
                                      setChronicConditionsInput("");
                                    }}
                                  >
                                    <Plus className="h-4 w-4 mr-1" /> Add
                                  </Button>
                                </div>
                                {chronicConditions.length > 0 && (
                                  <div className="flex flex-wrap gap-2">
                                    {chronicConditions.map((c, idx) => (
                                      <div
                                        key={`${c}-${idx}`}
                                        className="inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs bg-[#E5ECF6]"
                                      >
                                        <span>{c}</span>
                                        <button
                                          type="button"
                                          className="hover:text-red-600"
                                          onClick={() =>
                                            removeItemAt(
                                              idx,
                                              chronicConditions,
                                              setChronicConditions
                                            )
                                          }
                                          aria-label={`Remove ${c}`}
                                        >
                                          <X className="h-3 w-3" />
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4 mb-2">
                              <Label
                                htmlFor="medications"
                                className="text-right"
                              >
                                Medications
                              </Label>
                              <div className="col-span-3 space-y-2">
                                <div className="flex gap-2">
                                  <Input
                                    id="medications"
                                    placeholder="Type and press Enter"
                                    value={medicationsInput}
                                    onChange={(e) =>
                                      setMedicationsInput(e.target.value)
                                    }
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") {
                                        e.preventDefault();
                                        addItem(
                                          medicationsInput,
                                          medications,
                                          setMedications
                                        );
                                        setMedicationsInput("");
                                      }
                                    }}
                                  />
                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                      addItem(
                                        medicationsInput,
                                        medications,
                                        setMedications
                                      );
                                      setMedicationsInput("");
                                    }}
                                  >
                                    <Plus className="h-4 w-4 mr-1" /> Add
                                  </Button>
                                </div>
                                {medications.length > 0 && (
                                  <div className="flex flex-wrap gap-2">
                                    {medications.map((m, idx) => (
                                      <div
                                        key={`${m}-${idx}`}
                                        className="inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs bg-[#E5ECF6]"
                                      >
                                        <span>{m}</span>
                                        <button
                                          type="button"
                                          className="hover:text-red-600"
                                          onClick={() =>
                                            removeItemAt(
                                              idx,
                                              medications,
                                              setMedications
                                            )
                                          }
                                          aria-label={`Remove ${m}`}
                                        >
                                          <X className="h-3 w-3" />
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4 mb-2">
                              <Label htmlFor="bloodType" className="text-right">
                                Blood Type
                              </Label>
                              <Input
                                id="bloodType"
                                className="col-span-3"
                                placeholder="e.g. O+"
                                value={bloodTypeInput}
                                onChange={(e) =>
                                  setBloodTypeInput(e.target.value)
                                }
                              />
                            </div>
                            <div className="grid grid-cols-4 items-start gap-4">
                              <Label
                                htmlFor="notes"
                                className="text-right mt-2"
                              >
                                Notes
                              </Label>
                              <textarea
                                id="notes"
                                className="col-span-3 bg-white border border-input rounded-md p-2 min-h-[70px]"
                                placeholder="Any special notes..."
                                value={notesInput}
                                onChange={(e) => setNotesInput(e.target.value)}
                              />
                            </div>
                            <div className="text-[11px] text-muted-foreground mt-2">
                              Add each item individually using the field above.
                              Press Enter or click Add.
                            </div>
                          </div>

                          {/* Sub-Project Associations (for this project) */}
                          <div className="border-t pt-4 mt-4">
                            <div className="space-y-2">
                              <Label>Sub-Project Associations</Label>
                              <div className="mt-2 space-y-2">
                                {subprojectsLoading ? (
                                  <div className="text-sm text-muted-foreground px-1">
                                    Loading sub-projects...
                                  </div>
                                ) : subprojectsError ? (
                                  <div className="text-sm text-red-500 px-1">
                                    {subprojectsError}
                                  </div>
                                ) : (subprojects || []).filter(
                                    (sp) => sp.projectId === id
                                  ).length > 0 ? (
                                  (subprojects || [])
                                    .filter((sp) => sp.projectId === id)
                                    .map((sp) => (
                                      <div
                                        key={sp.id}
                                        className="flex items-center space-x-2"
                                      >
                                        <Checkbox
                                          id={`sub-${sp.id}`}
                                          checked={selectedSubProjects.includes(
                                            sp.id
                                          )}
                                          onCheckedChange={() => {
                                            setSelectedSubProjects((prev) =>
                                              prev.includes(sp.id)
                                                ? prev.filter(
                                                    (x) => x !== sp.id
                                                  )
                                                : [...prev, sp.id]
                                            );
                                          }}
                                        />
                                        <Label
                                          htmlFor={`sub-${sp.id}`}
                                          className="font-normal"
                                        >
                                          {sp.name}
                                        </Label>
                                      </div>
                                    ))
                                ) : (
                                  <div className="text-sm text-muted-foreground px-1">
                                    No sub-projects for this project
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {createError && (
                            <div className="text-sm text-red-600">
                              {createError}
                            </div>
                          )}
                        </div>
                      </TabsContent>

                      <TabsContent value="existing" className="m-0 p-0">
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Beneficiary *</Label>
                            <div className="col-span-3">
                              {listLoading ? (
                                <div className="text-sm text-muted-foreground">
                                  Loading beneficiaries...
                                </div>
                              ) : listError ? (
                                <div className="text-sm text-red-600">
                                  {listError}
                                </div>
                              ) : (
                                <Select
                                  value={associateSelectedBeneficiaryId}
                                  onValueChange={
                                    setAssociateSelectedBeneficiaryId
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select beneficiary" />
                                  </SelectTrigger>
                                  <SelectContent className="max-h-64 overflow-y-auto">
                                    {listItems.map((b) => {
                                      const pii: any = (b as any).pii || {};
                                      const fullName =
                                        `${pii.firstName || ""} ${
                                          pii.lastName || ""
                                        }`.trim() ||
                                        b.pseudonym ||
                                        b.id;
                                      return (
                                        <SelectItem key={b.id} value={b.id}>
                                          {fullName} ({b.pseudonym})
                                        </SelectItem>
                                      );
                                    })}
                                  </SelectContent>
                                </Select>
                              )}
                            </div>
                          </div>

                          <div className="border-t pt-4 mt-2">
                            <div className="space-y-2">
                              <Label>Sub-Project Associations</Label>
                              <div className="mt-2 space-y-2">
                                {subprojectsLoading ? (
                                  <div className="text-sm text-muted-foreground px-1">
                                    Loading sub-projects...
                                  </div>
                                ) : subprojectsError ? (
                                  <div className="text-sm text-red-500 px-1">
                                    {subprojectsError}
                                  </div>
                                ) : (subprojects || []).filter(
                                    (sp) => sp.projectId === id
                                  ).length > 0 ? (
                                  (subprojects || [])
                                    .filter((sp) => sp.projectId === id)
                                    .map((sp) => (
                                      <div
                                        key={sp.id}
                                        className="flex items-center space-x-2"
                                      >
                                        <Checkbox
                                          id={`assoc-sub-${sp.id}`}
                                          checked={associateSelectedSubProjects.includes(
                                            sp.id
                                          )}
                                          onCheckedChange={() => {
                                            setAssociateSelectedSubProjects(
                                              (prev) =>
                                                prev.includes(sp.id)
                                                  ? prev.filter(
                                                      (x) => x !== sp.id
                                                    )
                                                  : [...prev, sp.id]
                                            );
                                          }}
                                        />
                                        <Label
                                          htmlFor={`assoc-sub-${sp.id}`}
                                          className="font-normal"
                                        >
                                          {sp.name}
                                        </Label>
                                      </div>
                                    ))
                                ) : (
                                  <div className="text-sm text-muted-foreground px-1">
                                    No sub-projects for this project
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>

                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setIsAddDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      {addBeneficiaryTab === "new" ? (
                        <Button
                          onClick={handleCreateSubmit}
                          disabled={createLoading}
                        >
                          {createLoading ? "Saving..." : "Save"}
                        </Button>
                      ) : (
                        <Button
                          onClick={handleAssociateSubmit}
                          disabled={
                            associateLoading || !associateSelectedBeneficiaryId
                          }
                        >
                          {associateLoading ? "Associating..." : "Associate"}
                        </Button>
                      )}
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              <Table>
                <TableHeader className="bg-[#E5ECF6]">
                  <TableRow>
                    <TableHead className="w-[50px]">
                      <Checkbox
                        checked={allSelected}
                        onCheckedChange={toggleSelectAll}
                      />
                    </TableHead>
                    <TableHead className="w-[250px]">Beneficiary</TableHead>
                    <TableHead>Gender/DOB</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Municipality/Nationality</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Registration</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="bg-[#F7F9FB]">
                  {tableRows.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedIds.includes(r.id)}
                          onCheckedChange={() => toggleSelectOne(r.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src="" alt={r.name} />
                            <AvatarFallback>{r.initials}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{r.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {r.pseudonym}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="capitalize">{r.gender || "-"}</div>
                          <div className="text-xs text-muted-foreground">
                            {r.dob || "-"}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="default"
                          className="border-0"
                          style={
                            r.status === "active"
                              ? { backgroundColor: "#DEF8EE", color: "#4AA785" }
                              : r.status === "pending"
                              ? { backgroundColor: "#E2F5FF", color: "#59A8D4" }
                              : {
                                  backgroundColor: "rgba(28,28,28,0.05)",
                                  color: "rgba(28,28,28,0.4)",
                                }
                          }
                        >
                          {r.status === "active"
                            ? "Active"
                            : r.status === "pending"
                            ? "Pending"
                            : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{r.municipality || "-"}</div>
                          <div className="text-xs text-muted-foreground">
                            {r.nationality || "-"}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{r.phone || "-"}</div>
                          <div className="text-xs text-muted-foreground">
                            {r.email || "-"}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(r.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          className="hover:bg-blue-200"
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/beneficiaries/${r.id}`)}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {tableRows.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="py-4 text-center text-muted-foreground"
                      >
                        No beneficiaries found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="reports" className="pt-6">
          {/* <ProjectExport projectId={enhancedProject.id} /> */}
          <ProjectExport projectId={enhancedProject.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
