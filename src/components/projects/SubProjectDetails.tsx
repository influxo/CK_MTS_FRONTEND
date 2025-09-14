import {
  Calendar,
  CheckCircle,
  FileEdit,
  FileText,
  MapPin,
  User,
  Users,
  ArrowLeft,
  Plus,
  X,
} from "lucide-react";
import { useState, useEffect } from "react";
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

import { SubProjectActivities } from "./SubProjectActivities";
import { SubProjectForms } from "./SubProjectForms";
import { SubProjectReports } from "./SubProjectReports";
import { SubProjectTeam } from "./SubProjectTeam";
import { SubProjectServices } from "./SubProjectServices";
import { useParams, useNavigate } from "react-router-dom";
import type { AppDispatch, RootState } from "../../store";
import { useDispatch, useSelector } from "react-redux";
import {
  getSubProjectById,
  selectSelectedSubproject,
  selectSubprojectsError,
  selectSubprojectsLoading,
} from "../../store/slices/subProjectSlice";
import { fetchEmployees } from "../../store/slices/employeesSlice";
import { toast } from "sonner";
import {
  fetchBeneficiariesByEntity,
  selectBeneficiariesByEntity,
  selectBeneficiariesByEntityError,
  selectBeneficiariesByEntityLoading,
  selectBeneficiariesByEntityPagination,
  // list for association modal
  fetchBeneficiaries,
  selectBeneficiaries,
  selectBeneficiariesLoading,
  selectBeneficiariesError,
} from "../../store/slices/beneficiarySlice";
import {
  createBeneficiary,
  associateBeneficiaryToEntities,
  clearBeneficiaryMessages,
  selectBeneficiaryIsLoading,
  selectBeneficiaryError,
  selectBeneficiaryCreateSuccessMessage,
  selectBeneficiaryAssociateLoading,
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

// We don't need to import the SubProject type directly as it's already used in Redux selectors

// TODO: remove this mockSubProjectEnhancement, it's just for testing since we dont have that data yet
//  we fetch the subproject data from the API and enhance it with this data
interface SubProjectDetailsProps {
  onBack?: () => void;
}

// Mock enhancement data for subprojects to provide UI-specific properties that aren't in the API model
const mockSubProjectEnhancement = {
  title: "", // We'll map this from name
  type: "Service Delivery",
  progress: 45,
  beneficiaries: 350,
  startDate: "2025-02-01",
  endDate: "2025-06-30",
  leads: ["Project Coordinator"],
  objectives: ["Provide services to beneficiaries", "Document all activities"],
  activities: ["15"],
  services: ["345"],
  forms: ["12"],
  budget: 120000,
  fundingSource: "Project Funding",
  location: "Project Area",
  lastSync: new Date().toISOString(),
  recentReports: [
    {
      id: "rep-001",
      title: "Progress Report",
      type: "Monthly",
      createdDate: new Date().toISOString(),
    },
  ],
};

export function SubProjectDetails({ onBack }: SubProjectDetailsProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const params = useParams<{ projectId: string; subprojectId: string }>();
  const projectId = params.projectId;
  const subprojectId = params.subprojectId; // Note: URL param is 'subprojectId' (lowercase 'p')
  const navigate = useNavigate();

  const dispatch = useDispatch<AppDispatch>();

  const subProject = useSelector((state: RootState) =>
    selectSelectedSubproject(state)
  );
  const loading = useSelector((state: RootState) =>
    selectSubprojectsLoading(state)
  );
  const error = useSelector((state: RootState) =>
    selectSubprojectsError(state)
  );

  // Beneficiaries by entity (subproject)
  const subBeneficiaries = useSelector(selectBeneficiariesByEntity);
  const subBeneficiariesLoading = useSelector(
    selectBeneficiariesByEntityLoading
  );
  const subBeneficiariesError = useSelector(selectBeneficiariesByEntityError);
  const subBeneficiariesMeta = useSelector(
    selectBeneficiariesByEntityPagination
  );

  // Create/associate selectors
  const createLoading = useSelector(selectBeneficiaryIsLoading);
  const createError = useSelector(selectBeneficiaryError);
  const createSuccess = useSelector(selectBeneficiaryCreateSuccessMessage);
  const associateLoading = useSelector(selectBeneficiaryAssociateLoading);

  // Global beneficiaries list for association modal
  const listItems = useSelector(selectBeneficiaries);
  const listLoading = useSelector(selectBeneficiariesLoading);
  const listError = useSelector(selectBeneficiariesError);

  // Build view model similar to BeneficiariesList
  const tableRows = subBeneficiaries.map((b) => {
    const pii: any = b.pii || {};
    const firstName: string = pii.firstName || "";
    const lastName: string = pii.lastName || "";
    const fullName = `${firstName} ${lastName}`.trim() || b.pseudonym || b.id;
    const initials =
      `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase() ||
      b.pseudonym?.slice(0, 2) ||
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

  const handleAssociateExistingSubmit = async () => {
    if (!associateSelectedBeneficiaryId || !subprojectId) return;
    try {
      await dispatch(
        associateBeneficiaryToEntities({
          id: associateSelectedBeneficiaryId,
          links: [
            { entityId: subprojectId, entityType: "subproject" as const },
          ],
        })
      ).unwrap();
      setIsAddDialogOpen(false);
      setAssociateSelectedBeneficiaryId("");
      // refresh current subproject beneficiaries list
      dispatch(
        fetchBeneficiariesByEntity({
          entityId: subprojectId,
          entityType: "subproject",
          page: 1,
          limit: 20,
        })
      );
    } catch (_) {
      // errors surfaced via slice
    }
  };

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

  // Create dialog + form state
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
  // Chip-based details state (match ProjectDetails.tsx)
  const [allergies, setAllergies] = useState<string[]>([]);
  const [disabilities, setDisabilities] = useState<string[]>([]);
  const [chronicConditions, setChronicConditions] = useState<string[]>([]);
  const [medications, setMedications] = useState<string[]>([]);
  const [allergiesInput, setAllergiesInput] = useState("");
  const [disabilitiesInput, setDisabilitiesInput] = useState("");
  const [chronicConditionsInput, setChronicConditionsInput] = useState("");
  const [medicationsInput, setMedicationsInput] = useState("");
  const [bloodTypeInput, setBloodTypeInput] = useState("");
  const [notesInput, setNotesInput] = useState("");

  // Helpers for chip lists (match ProjectDetails.tsx behavior)
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
  // Associate Existing state (used in Add dialog > Add Existing tab)
  const [associateSelectedBeneficiaryId, setAssociateSelectedBeneficiaryId] =
    useState<string>("");

  useEffect(() => {
    if (subprojectId) {
      dispatch(getSubProjectById({ id: subprojectId }));
    } else {
      toast.error("Subproject ID is missing");
      if (projectId) {
        navigate(`/projects/${projectId}`);
      } else {
        navigate("/projects");
      }
    }
  }, [subprojectId, projectId, dispatch, navigate]);

  useEffect(() => {
    dispatch(fetchEmployees());
  }, [dispatch]);

  useEffect(() => {
    if (activeTab === "beneficiaries" && subprojectId) {
      dispatch(
        fetchBeneficiariesByEntity({
          entityId: subprojectId,
          entityType: "subproject",
          page: 1,
          limit: 20,
        })
      );
    }
  }, [activeTab, subprojectId, dispatch]);

  // Fetch beneficiaries list when Add dialog is open and tab is "existing"
  useEffect(() => {
    if (isAddDialogOpen && addBeneficiaryTab === "existing") {
      dispatch(fetchBeneficiaries(undefined));
    }
  }, [isAddDialogOpen, addBeneficiaryTab, dispatch]);

  // After successful create (+ association), close dialog, reset form, refresh list
  useEffect(() => {
    if (createSuccess && !associateLoading && subprojectId) {
      setIsAddDialogOpen(false);
      resetForm();
      dispatch(
        fetchBeneficiariesByEntity({
          entityId: subprojectId,
          entityType: "subproject",
          page: 1,
          limit: 20,
        })
      );
      dispatch(clearBeneficiaryMessages());
    }
  }, [createSuccess, associateLoading, subprojectId, dispatch]);

  const handleBackToProject = () => {
    if (onBack) {
      onBack();
    } else if (projectId) {
      navigate(`/projects/${projectId}`);
    } else {
      navigate("/projects");
    }
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
  };

  const handleCreateSubmit = async () => {
    if (!form.firstName || !form.lastName || !form.gender || !form.status) {
      return;
    }
    try {
      // finalize arrays including any residual input as a single item (match ProjectDetails.tsx)
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
      if (newId && subprojectId) {
        try {
          await dispatch(
            associateBeneficiaryToEntities({
              id: newId,
              links: [
                {
                  entityId: subprojectId,
                  entityType: "subproject",
                },
              ],
            })
          ).unwrap();
          // Explicitly refetch to update the table immediately after association
          await dispatch(
            fetchBeneficiariesByEntity({
              entityId: subprojectId,
              entityType: "subproject",
              page: 1,
              limit: 20,
            })
          );
        } catch (_) {
          // association errors handled via slice
        }
      }
      // success effect will close/reset/refresh
    } catch (_) {
      // errors surfaced via createError
    }
  };

  if (loading)
    return (
      <div className="p-8 flex justify-center">
        <div>Loading subproject details...</div>
      </div>
    );
  if (error) return <div className="p-8 text-red-500">Error: {error}</div>;
  if (!subProject) return <div className="p-8">No Subproject Found</div>;

  // Enhance the subproject data with UI properties
  const enhancedSubProject = {
    ...mockSubProjectEnhancement,
    id: subProject.id,
    title: subProject.name, // Map name to title
    description: subProject.description,
    category: subProject.category,
    status: subProject.status,
    projectId: subProject.projectId,
    createdAt: subProject.createdAt,
    updatedAt: subProject.updatedAt,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={handleBackToProject}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Project
        </Button>
        <h1 className="text-3xl font-semibold capitalize">
          {enhancedSubProject.title}
        </h1>
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="ml-auto bg-[#2B2B2B] text-white"
            >
              <FileEdit className="h-4 w-4 mr-2" />
              Edit Sub-Project
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Edit Sub-Project</DialogTitle>
              <DialogDescription>
                Update the details for this sub-project. All fields marked with
                * are required.
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
                  defaultValue={enhancedSubProject.title}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">
                  Category *
                </Label>
                <Select
                  defaultValue={enhancedSubProject.category.toLowerCase()}
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
                    <SelectItem value="training">Training</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="type" className="text-right">
                  Type *
                </Label>
                <Select
                  defaultValue={enhancedSubProject.type
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
                <Select defaultValue={enhancedSubProject.status}>
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
                <Label htmlFor="location" className="text-right">
                  Location *
                </Label>
                <Input
                  id="location"
                  className="col-span-3"
                  defaultValue={enhancedSubProject.location}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="start-date" className="text-right">
                  Start Date *
                </Label>
                <Input
                  id="start-date"
                  type="date"
                  className="col-span-3"
                  defaultValue={enhancedSubProject.startDate}
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
                  defaultValue={enhancedSubProject.endDate}
                />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="description" className="text-right pt-2">
                  Description
                </Label>
                <Textarea
                  id="description"
                  className="col-span-3"
                  defaultValue={enhancedSubProject.description}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              {/* <Button
                      variant="outline"
                      onClick={() => setIsEditDialogOpen(false)}
                    >
                      Cancel
                    </Button> */}
              <Button onClick={() => setIsEditDialogOpen(false)}>
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="flex  bg-[#F7F9FB] border-0   drop-shadow-sm shadow-gray-50">
        <CardContent className="p-6 w-full">
          <div className="flex flex-col md:flex-row gap-6 w-full">
            <div className="flex-1 space-y-5">
              <div className="flex gap-2">
                <Badge variant="outline">{enhancedSubProject.category}</Badge>
                <Badge variant="outline">{enhancedSubProject.type}</Badge>
                <Badge
                  variant="default"
                  className="border-0"
                  style={
                    enhancedSubProject.status === "active"
                      ? { backgroundColor: "#DEF8EE", color: "#4AA785" }
                      : enhancedSubProject.status === "pending"
                      ? { backgroundColor: "#E2F5FF", color: "#59A8D4" }
                      : {
                          backgroundColor: "rgba(28,28,28,0.05)",
                          color: "rgba(28,28,28,0.4)",
                        }
                  }
                >
                  {enhancedSubProject.status === "active"
                    ? "Active"
                    : enhancedSubProject.status === "pending"
                    ? "Pending"
                    : "Inactive"}
                </Badge>
              </div>

              <p className="text-xl font-normal  capitalize">
                {enhancedSubProject.description}
              </p>
            </div>

            <div className="grid grid-cols-1 w-2/5 ">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-xl p-4 bg-[#E5ECF6]">
                  <div className="text-sm text-muted-foreground">Timeline</div>
                  <div className="flex items-center gap-1 mt-1">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {new Date(
                        enhancedSubProject.startDate
                      ).toLocaleDateString()}{" "}
                      -{" "}
                      {new Date(
                        enhancedSubProject.endDate
                      ).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="rounded-xl p-4 bg-[#E5ECF6]">
                  <div className="text-sm text-muted-foreground">Lead</div>
                  <div className="flex items-center gap-1 mt-1">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {enhancedSubProject.leads &&
                      enhancedSubProject.leads.length > 0
                        ? enhancedSubProject.leads[0]
                        : "No lead assigned"}
                    </span>
                  </div>
                </div>

                <div className="rounded-xl p-4 bg-[#E5ECF6]">
                  <div className="text-sm text-muted-foreground">Location</div>
                  <div className="flex items-center gap-1 mt-1">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{enhancedSubProject.location}</span>
                  </div>
                </div>

                <div className="rounded-xl p-4 bg-[#E5ECF6]">
                  <div className="text-sm text-muted-foreground">
                    Beneficiaries
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {enhancedSubProject.beneficiaries} Beneficiaries
                    </span>
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
              value="forms"
              className={`rounded-none bg-transparent border-0 border-b-2 pb-3 hover:bg-transparent text-black ${
                activeTab === "forms" ? "border-black" : "border-transparent"
              }`}
            >
              Forms & Data
            </TabsTrigger>
            <TabsTrigger
              value="activities"
              className={`rounded-none bg-transparent border-0 border-b-2 pb-3 hover:bg-transparent text-black ${
                activeTab === "activities"
                  ? "border-black"
                  : "border-transparent"
              }`}
            >
              Activities
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
              value="beneficiaries"
              className={`rounded-none bg-transparent border-0 border-b-2 pb-3 hover:bg-transparent ${
                activeTab === "beneficiaries"
                  ? "border-black"
                  : "border-transparent"
              }`}
            >
              Beneficiaries
            </TabsTrigger>
            <TabsTrigger
              value="team"
              className={`rounded-none bg-transparent border-0 border-b-2 pb-3 hover:bg-transparent ${
                activeTab === "team" ? "border-black" : "border-transparent"
              }`}
            >
              Team
            </TabsTrigger>
            <TabsTrigger
              value="reports"
              className={`rounded-none bg-transparent border-0 border-b-2 pb-3 hover:bg-transparent ${
                activeTab === "reports" ? "border-black" : "border-transparent"
              }`}
            >
              Reports
            </TabsTrigger>
          </div>
        </TabsList>

        <TabsContent value="overview" className="pt-6">
          <div className="space-y-6">
            <Card className="flex   border-0   drop-shadow-sm shadow-gray-50 ">
              <CardContent className="p-6 ">
                <h3 className="mb-4">Key Metrics</h3>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full">
                  <div className="space-y-1 bg-[#B1E3FF] p-4 rounded-lg h-28">
                    <div className="text-muted-foreground text-sm">
                      Activities
                    </div>
                    <div className="text-2xl font-medium">
                      {enhancedSubProject.activities}
                    </div>
                    <div className="text-muted-foreground text-sm">
                      Total activities
                    </div>
                  </div>

                  <div className="space-y-1 bg-[#B1E3FF] p-4 rounded-lg h-28">
                    <div className="text-muted-foreground text-sm">
                      Beneficiaries
                    </div>
                    <div className="text-2xl font-medium">
                      {enhancedSubProject.beneficiaries}
                    </div>
                    <div className="text-muted-foreground text-sm">
                      Registered individuals
                    </div>
                  </div>

                  <div className="space-y-1 bg-[#B1E3FF] p-4 rounded-lg h-28">
                    <div className="text-muted-foreground text-sm">Forms</div>
                    <div className="text-2xl font-medium">
                      {enhancedSubProject.forms}
                    </div>
                    <div className="text-muted-foreground text-sm">
                      Submissions collected
                    </div>
                  </div>

                  <div className="space-y-1 bg-[#B1E3FF] p-4 rounded-lg h-28">
                    <div className="text-muted-foreground text-sm">
                      Services
                    </div>
                    <div className="text-2xl font-medium">
                      {enhancedSubProject.services}
                    </div>
                    <div className="text-muted-foreground text-sm">
                      Services delivered
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="flex bg-[#E5ECF6] border-0 drop-shadow-sm shadow-gray-50">
                <CardContent className="p-6 ">
                  <h4 className="mb-3">Recent Updates</h4>

                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <div className="font-medium">
                          Health Education Session Completed
                        </div>
                        <div className="text-sm text-muted-foreground">
                          28 participants attended the maternal nutrition
                          workshop
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Today at 10:30 AM
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                        <Users className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <div className="font-medium">
                          15 New Beneficiaries Registered
                        </div>
                        <div className="text-sm text-muted-foreground">
                          New pregnant women registered in the Eastern Village
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Yesterday at 2:15 PM
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                        <FileEdit className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <div className="font-medium">
                          Monthly Report Generated
                        </div>
                        <div className="text-sm text-muted-foreground">
                          April 2025 activity report has been generated
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          May 5, 2025
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end mt-4">
                    {/* <Button variant="outline" size="sm">View All Updates</Button> */}
                  </div>
                </CardContent>
              </Card>

              <div className="flex flex-col gap-6">
                <Card className="flex bg-[#F7F9FB] border-0 h-[120px] drop-shadow-sm shadow-gray-50">
                  <CardContent className="p-6">
                    <h3 className="mb-3">Last Synchronization</h3>

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">
                          Last synced
                        </span>
                        <span className="text-sm">
                          {new Date(
                            enhancedSubProject.lastSync
                          ).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">
                          Sync status
                        </span>
                        <Badge
                          variant="outline"
                          className="flex items-center gap-1"
                        >
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          <span>Complete</span>
                        </Badge>
                      </div>
                    </div>

                    {/* <Button variant="outline" className="w-full" size="sm">
                      Sync Now
                    </Button> */}
                  </CardContent>
                </Card>

                {enhancedSubProject.recentReports.length > 0 && (
                  <Card className="flex bg-[#F7F9FB] border-0 drop-shadow-sm shadow-gray-50">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-center mb-3">
                        <h3>Recent Reports</h3>
                        {/* <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setActiveTab("reports")}
                        >
                          View All
                        </Button> */}
                      </div>

                      <div className="space-y-3">
                        {enhancedSubProject.recentReports.map((report) => (
                          <div
                            key={report.id}
                            className="flex items-start gap-3"
                          >
                            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div>
                              <div className="font-medium">{report.title}</div>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  {report.type}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(
                                    report.createdDate
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      {/*
                      // <Button
                      //   variant="outline"
                      //   className="w-full mt-4"
                      //   size="sm"
                      //   onClick={() => setActiveTab("reports")}
                      // >
                      //   Generate New Report
                      // </Button> */}
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="forms" className="pt-6">
          <SubProjectForms subProjectId={subprojectId || ""} />
        </TabsContent>

        <TabsContent value="activities" className="pt-6">
          <SubProjectActivities subProjectId={subprojectId || ""} />
        </TabsContent>

        <TabsContent value="services" className="pt-6">
          <SubProjectServices subProjectId={subprojectId || ""} />
        </TabsContent>

        <TabsContent value="beneficiaries" className="pt-6">
          {subBeneficiariesLoading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              Loading beneficiaries...
            </div>
          )}
          {subBeneficiariesError && !subBeneficiariesLoading && (
            <div className="text-sm text-red-600">{subBeneficiariesError}</div>
          )}
          {!subBeneficiariesLoading && !subBeneficiariesError && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-medium">
                  Beneficiaries ({subBeneficiariesMeta.totalItems})
                </h3>
                <Dialog
                  open={isAddDialogOpen}
                  onOpenChange={setIsAddDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button className="bg-[#2E343E] text-white">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Beneficiary
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[550px] max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Add Beneficiary</DialogTitle>
                      <DialogDescription>
                        Use the tabs below to add a brand new beneficiary or
                        associate an existing one with this sub-project.
                      </DialogDescription>
                    </DialogHeader>

                    <Tabs
                      value={addBeneficiaryTab}
                      onValueChange={(v) =>
                        setAddBeneficiaryTab(v as "new" | "existing")
                      }
                    >
                      <TabsList className="mb-4">
                        <TabsTrigger value="new">Add New</TabsTrigger>
                        <TabsTrigger value="existing">Add Existing</TabsTrigger>
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
                          onClick={handleAssociateExistingSubmit}
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

        <TabsContent value="team" className="pt-6">
          <SubProjectTeam subProjectId={subprojectId || ""} />
        </TabsContent>

        <TabsContent value="reports" className="pt-6">
          <SubProjectReports subProjectId={subprojectId || ""} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
