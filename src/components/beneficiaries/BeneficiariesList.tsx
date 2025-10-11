import {
  Calendar,
  Eye,
  FileCheck,
  FileEdit,
  FileSpreadsheet,
  FileText,
  Filter,
  Link,
  MapPin,
  MoreHorizontal,
  Plus,
  Search,
  ShieldAlert,
  SlidersHorizontal,
  Trash,
  User,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store";
import {
  createBeneficiary,
  fetchBeneficiaries,
  selectBeneficiaries,
  selectBeneficiariesError,
  selectBeneficiariesLoading,
  selectBeneficiaryIsLoading,
  selectBeneficiaryError,
  selectBeneficiaryCreateSuccessMessage,
  clearBeneficiaryMessages,
  associateBeneficiaryToEntities,
  selectBeneficiaryAssociateLoading,
  fetchBeneficiariesByEntity,
  selectBeneficiariesByEntity,
  selectBeneficiariesByEntityLoading,
  selectBeneficiariesByEntityError,
  selectBeneficiariesPagination,
  selectBeneficiariesByEntityPagination,
} from "../../store/slices/beneficiarySlice";
import { fetchProjects } from "../../store/slices/projectsSlice";
import { fetchAllSubProjects } from "../../store/slices/subProjectSlice";
import { selectCurrentUser } from "../../store/slices/authSlice";
import {
  fetchUserProjectsByUserId,
  selectUserProjectsTree,
} from "../../store/slices/userProjectsSlice";
import type { CreateBeneficiaryRequest } from "../../services/beneficiaries/beneficiaryModels";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/data-display/avatar";
import { Badge } from "../ui/data-display/badge";
import { Button } from "../ui/button/button";
import { Card, CardContent } from "../ui/data-display/card";
import { Checkbox } from "../ui/form/checkbox";
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
import { RadioGroup, RadioGroupItem } from "../ui/form/radio-group";
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
import { toast } from "sonner";
interface BeneficiariesListProps {
  onBeneficiarySelect: (beneficiaryId: string) => void;
}

// Mock data for beneficiaries
const mockBeneficiaries = [
  {
    id: "BEN-2025-001",
    name: "Maria Johnson",
    pseudoId: "BEN78945",
    gender: "Female",
    age: 27,
    location: "Northern District, Village A",
    contactNumber: "+123-456-7890",
    status: "active",
    registrationDate: "2025-01-15",
    tags: ["maternal-health", "nutrition"],
    projects: ["Rural Healthcare Initiative"],
    subProjects: ["Maternal Health Services"],
    lastService: "2025-05-10",
    serviceCount: 4,
    vulnerabilityScore: "Medium",
    household: "HH-125",
    avatar: "",
    initials: "MJ",
  },
  {
    id: "BEN-2025-002",
    name: "James Wilson",
    pseudoId: "BEN45672",
    gender: "Male",
    age: 32,
    location: "Eastern Region, Town B",
    contactNumber: "+123-456-7891",
    status: "active",
    registrationDate: "2025-01-18",
    tags: ["agriculture", "financial-inclusion"],
    projects: ["Rural Healthcare Initiative", "Community Development"],
    subProjects: ["Food Security Initiative"],
    lastService: "2025-05-15",
    serviceCount: 3,
    vulnerabilityScore: "Low",
    household: "HH-126",
    avatar: "",
    initials: "JW",
  },
  {
    id: "BEN-2025-003",
    name: "Sarah Williams",
    pseudoId: "BEN35689",
    gender: "Female",
    age: 24,
    location: "Southern Province, Village C",
    contactNumber: "+123-456-7892",
    status: "active",
    registrationDate: "2025-02-03",
    tags: ["maternal-health", "education"],
    projects: ["Rural Healthcare Initiative"],
    subProjects: ["Maternal Health Services", "Education Support"],
    lastService: "2025-05-12",
    serviceCount: 5,
    vulnerabilityScore: "High",
    household: "HH-127",
    avatar: "",
    initials: "SW",
  },
  {
    id: "BEN-2025-004",
    name: "Thomas Brown",
    pseudoId: "BEN25478",
    gender: "Male",
    age: 45,
    location: "Western District, Town D",
    contactNumber: "+123-456-7893",
    status: "inactive",
    registrationDate: "2025-02-10",
    tags: ["agriculture", "water-sanitation"],
    projects: ["Community Development"],
    subProjects: ["Water Access Program"],
    lastService: "2025-04-02",
    serviceCount: 2,
    vulnerabilityScore: "Medium",
    household: "HH-128",
    avatar: "",
    initials: "TB",
  },
  {
    id: "BEN-2025-005",
    name: "Emily Martinez",
    pseudoId: "BEN58963",
    gender: "Female",
    age: 29,
    location: "Central Region, Village E",
    contactNumber: "+123-456-7894",
    status: "active",
    registrationDate: "2025-02-15",
    tags: ["education", "child-protection"],
    projects: ["Youth Empowerment Program"],
    subProjects: ["Education Support"],
    lastService: "2025-05-18",
    serviceCount: 6,
    vulnerabilityScore: "Low",
    household: "HH-129",
    avatar: "",
    initials: "EM",
  },
  {
    id: "BEN-2025-006",
    name: "Michael Thompson",
    pseudoId: "BEN12547",
    gender: "Male",
    age: 37,
    location: "Northern District, Town F",
    contactNumber: "+123-456-7895",
    status: "active",
    registrationDate: "2025-02-18",
    tags: ["financial-inclusion", "agriculture"],
    projects: ["Community Development", "Rural Healthcare Initiative"],
    subProjects: ["Food Security Initiative"],
    lastService: "2025-05-15",
    serviceCount: 4,
    vulnerabilityScore: "Medium",
    household: "HH-130",
    avatar: "",
    initials: "MT",
  },
  {
    id: "BEN-2025-007",
    name: "Jennifer Lee",
    pseudoId: "BEN75395",
    gender: "Female",
    age: 31,
    location: "Eastern Region, Village G",
    contactNumber: "+123-456-7896",
    status: "active",
    registrationDate: "2025-02-22",
    tags: ["maternal-health", "nutrition"],
    projects: ["Rural Healthcare Initiative"],
    subProjects: ["Maternal Health Services", "Nutrition Support"],
    lastService: "2025-05-20",
    serviceCount: 7,
    vulnerabilityScore: "Medium",
    household: "HH-131",
    avatar: "",
    initials: "JL",
  },
  {
    id: "BEN-2025-008",
    name: "Robert Davis",
    pseudoId: "BEN95123",
    gender: "Male",
    age: 52,
    location: "Southern Province, Town H",
    contactNumber: "+123-456-7897",
    status: "inactive",
    registrationDate: "2025-03-01",
    tags: ["water-sanitation", "infrastructure"],
    projects: ["Community Development"],
    subProjects: ["Water Access Program"],
    lastService: "2025-04-10",
    serviceCount: 3,
    vulnerabilityScore: "High",
    household: "HH-132",
    avatar: "",
    initials: "RD",
  },
];

// (Removed unused mockProjects in favor of real projects from Redux)

export function BeneficiariesList({
  onBeneficiarySelect,
}: BeneficiariesListProps) {
  const dispatch = useDispatch<AppDispatch>();
  // Global list selectors
  const allBeneficiaries = useSelector(selectBeneficiaries);
  const allListLoading = useSelector(selectBeneficiariesLoading);
  const allListError = useSelector(selectBeneficiariesError);
  const allPagination = useSelector(selectBeneficiariesPagination);
  // By-entity list selectors
  const byEntityBeneficiaries = useSelector(selectBeneficiariesByEntity);
  const byEntityListLoading = useSelector(selectBeneficiariesByEntityLoading);
  const byEntityListError = useSelector(selectBeneficiariesByEntityError);
  const byEntityPagination = useSelector(selectBeneficiariesByEntityPagination);
  // create state
  const createLoading = useSelector(selectBeneficiaryIsLoading);
  const createError = useSelector(selectBeneficiaryError);
  const createSuccess = useSelector(selectBeneficiaryCreateSuccessMessage);
  const associateLoading = useSelector(selectBeneficiaryAssociateLoading);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [filterProjectId, setFilterProjectId] = useState("all");
  const [filterSubProjectId, setFilterSubProjectId] = useState("all");
  const [tagFilter, setTagFilter] = useState("all");
  // pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedBeneficiaries, setSelectedBeneficiaries] = useState<string[]>(
    []
  );
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Associations selection state (similar to InviteEmployee Project Access)
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [selectedSubProjects, setSelectedSubProjects] = useState<string[]>([]);

  // Projects & Subprojects from Redux
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

  // Role + assigned projects tree
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
  const isSubProjectManager = useMemo(() => {
    return normalizedRoles.some(
      (r: string) =>
        r === "sub-project manager" ||
        r === "sub project manager" ||
        r.includes("sub-project manager") ||
        r.includes("sub project manager")
    );
  }, [normalizedRoles]);
  const isFieldOperator = useMemo(() => {
    return (
      normalizedRoles.includes("field operator") ||
      normalizedRoles.includes("field-operator") ||
      normalizedRoles.includes("fieldoperator") ||
      normalizedRoles.includes("field_op") ||
      normalizedRoles.some(
        (r: string) => r.includes("field") && r.includes("operator")
      )
    );
  }, [normalizedRoles]);

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

  const subprojectsForSelectedProject = useMemo(() => {
    if (filterProjectId === "all")
      return [] as { id: string; name: string; projectId: string }[];
    if (isSysOrSuperAdmin) {
      return subprojectsByProjectId[filterProjectId] || [];
    }
    // Non-admins: build from userProjectsTree
    const proj = (userProjectsTree || []).find(
      (p: any) => p.id === filterProjectId
    );
    return ((proj?.subprojects || []) as any[]).map((sp: any) => ({
      id: sp.id,
      name: sp.name,
      projectId: filterProjectId,
    }));
  }, [
    filterProjectId,
    subprojectsByProjectId,
    isSysOrSuperAdmin,
    userProjectsTree,
  ]);

  // Build project options based on role
  const projectsForSelect = useMemo(() => {
    if (isSysOrSuperAdmin) return projects;
    const assigned = (userProjectsTree || []).map((p: any) => ({
      id: p.id,
      name: p.name,
    }));
    return assigned as Array<{ id: string; name: string }> as any;
  }, [isSysOrSuperAdmin, projects, userProjectsTree]);

  // Role-based projects shown in the Add Beneficiary modal (same logic as Dashboard)
  const projectsForModal = useMemo(() => {
    if (isSysOrSuperAdmin) return projects;
    const assigned = (userProjectsTree || []).map((p: any) => ({
      id: p.id,
      name: p.name,
    }));
    return assigned as Array<{ id: string; name: string }> as any;
  }, [isSysOrSuperAdmin, projects, userProjectsTree]);

  // Allowed subprojects for current project (for subproject managers and field operators)
  const allowedSubprojectIds = useMemo(() => {
    try {
      if (filterProjectId === "all") return new Set<string>();
      const proj = (userProjectsTree || []).find(
        (p: any) => p.id === filterProjectId
      );
      const ids = (proj?.subprojects || []).map((sp: any) => sp.id);
      return new Set<string>(ids);
    } catch {
      return new Set<string>();
    }
  }, [userProjectsTree, filterProjectId]);

  const subprojectsForSelect = useMemo(() => {
    const base = subprojectsForSelectedProject;
    if (isSysOrSuperAdmin) return base;
    if (isSubProjectManager || isFieldOperator) {
      return base.filter((sp) => allowedSubprojectIds.has(sp.id));
    }
    return base;
  }, [
    subprojectsForSelectedProject,
    isSysOrSuperAdmin,
    isSubProjectManager,
    isFieldOperator,
    allowedSubprojectIds,
  ]);

  // Subprojects per project for the modal, filtered by role (SP Manager sees only assigned subprojects)
  const subprojectsForModalByProjectId = useMemo(() => {
    const result: Record<
      string,
      { id: string; name: string; projectId: string }[]
    > = {};
    (projectsForModal || []).forEach((p: any) => {
      const base = subprojectsByProjectId[p.id] || [];
      if (isSysOrSuperAdmin) {
        result[p.id] = base;
      } else if (isSubProjectManager) {
        try {
          const proj = (userProjectsTree || []).find(
            (xp: any) => xp.id === p.id
          );
          const allowed = new Set<string>(
            (proj?.subprojects || []).map((sp: any) => sp.id)
          );
          result[p.id] = base.filter((sp) => allowed.has(sp.id));
        } catch {
          result[p.id] = [];
        }
      } else {
        // Program Manager or other non-admin roles: show all subprojects for assigned projects
        result[p.id] = base;
      }
    });
    return result;
  }, [
    projectsForModal,
    subprojectsByProjectId,
    isSysOrSuperAdmin,
    isSubProjectManager,
    userProjectsTree,
  ]);

  // Form state for creating a beneficiary
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
  // Additional local state for extended details (improved UX with add/remove chips)
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
  const [ethnicity, setEthnicity] = useState("");
  const [isUrban, setIsUrban] = useState<boolean>(false);
  const [householdMembers, setHouseholdMembers] = useState<string>("");

  const addItem = (
    value: string,
    list: string[],
    setter: (next: string[]) => void
  ) => {
    const v = (value || "").trim();
    if (!v) return;
    // avoid case-insensitive duplicates
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
    setSelectedProjects([]);
    setSelectedSubProjects([]);
    setEthnicity("");
    setIsUrban(false);
    setHouseholdMembers("");
  };

  // Decide which source is active
  const isEntityMode =
    filterSubProjectId !== "all" || filterProjectId !== "all";
  const activePagination = isEntityMode ? byEntityPagination : allPagination;
  const listLoading = isEntityMode ? byEntityListLoading : allListLoading;
  const listError = isEntityMode ? byEntityListError : allListError;

  // Loader based on filters and pagination
  const loadBeneficiaries = useCallback(() => {
    const statusParam =
      statusFilter === "all"
        ? undefined
        : (statusFilter as "active" | "inactive");
    if (filterSubProjectId !== "all") {
      dispatch(
        fetchBeneficiariesByEntity({
          entityId: filterSubProjectId,
          entityType: "subproject",
          status: statusParam,
          page,
          limit,
        })
      );
      return;
    }
    if (filterProjectId !== "all") {
      dispatch(
        fetchBeneficiariesByEntity({
          entityId: filterProjectId,
          entityType: "project",
          status: statusParam,
          page,
          limit,
        })
      );
      return;
    }
    dispatch(
      fetchBeneficiaries({
        status: statusParam,
        page,
        limit,
      })
    );
  }, [
    dispatch,
    filterProjectId,
    filterSubProjectId,
    statusFilter,
    page,
    limit,
  ]);

  useEffect(() => {
    loadBeneficiaries();
  }, [loadBeneficiaries]);

  // Load projects & subprojects for association selection
  useEffect(() => {
    if (isSysOrSuperAdmin) {
      dispatch(fetchProjects());
      dispatch(fetchAllSubProjects());
    } else if ((userProjectsTree || []).length === 0 && user?.id) {
      dispatch(fetchUserProjectsByUserId(String(user.id)) as any);
    }
  }, [dispatch, isSysOrSuperAdmin, user?.id, userProjectsTree?.length]);

  // Close dialog and refresh list on successful create
  useEffect(() => {
    if (createSuccess && !associateLoading) {
      setIsAddDialogOpen(false);
      resetForm();
      // refresh list and clear messages
      loadBeneficiaries();
      dispatch(clearBeneficiaryMessages());
    }
  }, [createSuccess, associateLoading, dispatch, loadBeneficiaries]);

  // Build a simple view model from API data for table rendering
  const rawList = isEntityMode ? byEntityBeneficiaries : allBeneficiaries;
  const list = useMemo(() => {
    return rawList.map((b) => {
      const pii = (b as any).pii || ({} as any);
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
        address: pii.address || "",
      };
    });
  }, [rawList]);

  // Filter list by search/status (project/tag filters are placeholders)
  const filteredBeneficiaries = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return list.filter((b) => {
      const matchesSearch =
        b.name.toLowerCase().includes(q) ||
        b.id.toLowerCase().includes(q) ||
        (b.pseudonym || "").toLowerCase().includes(q) ||
        b.municipality.toLowerCase().includes(q) ||
        b.nationality.toLowerCase().includes(q) ||
        b.phone.toLowerCase().includes(q) ||
        b.email.toLowerCase().includes(q);

      const matchesStatus = statusFilter === "all" || b.status === statusFilter;
      const matchesTag = tagFilter === "all"; // placeholder
      return matchesSearch && matchesStatus && matchesTag;
    });
  }, [list, searchQuery, statusFilter, tagFilter]);

  // Numbered pagination builder (compact with ellipsis)
  const pageTokens = useMemo(() => {
    const total = Math.max(activePagination.totalPages || 1, 1);
    const current = Math.min(Math.max(activePagination.page || 1, 1), total);
    const tokens: Array<number | string> = [];
    if (total <= 7) {
      for (let i = 1; i <= total; i++) tokens.push(i);
      return tokens;
    }
    const left = Math.max(2, current - 1);
    const right = Math.min(total - 1, current + 1);
    tokens.push(1);
    if (left > 2) tokens.push("left-ellipsis");
    for (let i = left; i <= right; i++) tokens.push(i);
    if (right < total - 1) tokens.push("right-ellipsis");
    tokens.push(total);
    return tokens;
  }, [activePagination]);

  // Unique tags for advanced filter mock (using mockBeneficiaries)
  const uniqueTags = Array.from(
    new Set(mockBeneficiaries.flatMap((beneficiary) => beneficiary.tags))
  );

  // Selection helpers
  const handleSelectAll = () => {
    if (selectedBeneficiaries.length === filteredBeneficiaries.length) {
      setSelectedBeneficiaries([]);
    } else {
      setSelectedBeneficiaries(filteredBeneficiaries.map((b) => b.id));
    }
  };

  const handleSelectBeneficiary = (id: string) => {
    if (selectedBeneficiaries.includes(id)) {
      setSelectedBeneficiaries(
        selectedBeneficiaries.filter((beneficiaryId) => beneficiaryId !== id)
      );
    } else {
      setSelectedBeneficiaries([...selectedBeneficiaries, id]);
    }
  };

  const handleCreateSubmit = async () => {
    if (!form.firstName || !form.lastName || !form.gender || !form.status) {
      return;
    }
    try {
      // Incorporate any text left in the inputs as single items for convenience
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
      if (newId) {
        const projectIdsToSend = selectedProjects;
        const subProjectIdsToSend = selectedSubProjects;

        const links = [
          ...projectIdsToSend.map((id) => ({
            entityId: id,
            entityType: "project",
          })),
          ...subProjectIdsToSend.map((id) => ({
            entityId: id,
            entityType: "subproject",
          })),
        ];

        if (links.length > 0) {
          try {
            await dispatch(
              associateBeneficiaryToEntities({ id: newId, links })
            ).unwrap();
          } catch (_) {
            // Association errors are surfaced via slice selectors
          }
        }
      }
      // createSuccess effect will handle closing/reset
      toast.success("Përfituesi u krijua me sukses", {
        style: {
          backgroundColor: "#d1fae5",
          color: "#065f46",
          border: "1px solid #10b981",
        },
      });
    } catch (_) {
      // errors are surfaced via createError
    }
  };

  return (
    <div className="space-y-6">
      {/* ... (rest of the code remains the same) */}

      <div className="flex flex-col lg:flex-row gap-4 justify-between">
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground " />
            <Input
              placeholder="Search beneficiaries..."
              className="pl-9 bg-white border border-gray-100"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-3">
            <Select
              value={statusFilter}
              onValueChange={(val) => {
                setStatusFilter(val);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[130px] bg-white border transition-transform duration-200 ease-in-out hover:scale-105 hover:-translate-y-[1px] border-gray-100 text-black">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filterProjectId}
              onValueChange={(val) => {
                setFilterProjectId(val);
                // Reset subproject when project changes
                setFilterSubProjectId("all");
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[220px] bg-white border transition-transform duration-200 ease-in-out hover:scale-105 hover:-translate-y-[1px] border-gray-100 text-black">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                {projectsForSelect.map((project: any) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filterSubProjectId}
              onValueChange={(val) => {
                setFilterSubProjectId(val);
                setPage(1);
              }}
              disabled={filterProjectId === "all"}
            >
              <SelectTrigger className="w-[240px] bg-white border transition-transform duration-200 ease-in-out hover:scale-105 hover:-translate-y-[1px] border-gray-100 text-black">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Subproject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subprojects</SelectItem>
                {subprojectsForSelect.map((sp) => (
                  <SelectItem key={sp.id} value={sp.id}>
                    {sp.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              type="button"
              variant="outline"
              className="bg-white border transition-transform duration-200 ease-in-out hover:scale-105 hover:-translate-y-[1px] border-gray-100 text-black"
              onClick={() => setShowAdvancedFilters((v) => !v)}
              title={
                showAdvancedFilters
                  ? "Hide advanced filters"
                  : "Show advanced filters"
              }
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              {showAdvancedFilters ? "Advanced Off" : "Advanced"}
            </Button>
          </div>
        </div>
        <div className="flex gap-3 rounded-[-15px] bg-[rgba(255,0,0,0)]">
          <div className="flex gap-2">
            {selectedBeneficiaries.length > 0 && (
              <Button
                className="bg-white border transition-transform duration-200 ease-in-out hover:scale-105 hover:-translate-y-[1px] border-gray-100 text-black"
                // variant="outline"
              >
                Bulk Actions ({selectedBeneficiaries.length})
              </Button>
            )}
          </div>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#0073e6] transition-transform duration-200 ease-in-out hover:scale-105 hover:-translate-y-[1px] text-white">
              <Plus className="h-4 w-4 mr-2" />
              Add Beneficiary
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px] max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Beneficiary</DialogTitle>
              <DialogDescription>
                Enter the details of the beneficiary you want to add to the
                system.
              </DialogDescription>
            </DialogHeader>
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
                  onValueChange={(val) => setForm({ ...form, gender: val })}
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
                  onChange={(e) => setForm({ ...form, dob: e.target.value })}
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
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
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
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
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
                <Label htmlFor="municipality" className="text-right">
                  Municipality
                </Label>
                <Input
                  id="municipality"
                  className="col-span-3"
                  placeholder="Enter municipality"
                  value={form.municipality}
                  onChange={(e) =>
                    setForm({ ...form, municipality: e.target.value })
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
                    setForm({ ...form, nationality: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="ethnicity" className="text-right">
                  Ethnicity
                </Label>
                <Select value={ethnicity} onValueChange={setEthnicity}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select ethnicity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Shqiptar">Shqiptar</SelectItem>
                    <SelectItem value="Serb">Serb</SelectItem>
                    <SelectItem value="Boshnjak">Boshnjak</SelectItem>
                    <SelectItem value="Turk">Turk</SelectItem>
                    <SelectItem value="Ashkali">Ashkali</SelectItem>
                    <SelectItem value="Rom">Rom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Residence</Label>
                <RadioGroup
                  className="col-span-3 flex gap-6"
                  value={isUrban ? "urban" : "rural"}
                  onValueChange={(val) => setIsUrban(val === "urban")}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="rural" id="residence-rural" />
                    <Label htmlFor="residence-rural">Rural</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="urban" id="residence-urban" />
                    <Label htmlFor="residence-urban">Urban</Label>
                  </div>
                </RadioGroup>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="householdMembers" className="text-right">
                  Household Members
                </Label>
                <Input
                  id="householdMembers"
                  type="number"
                  min={0}
                  step={1}
                  className="col-span-3"
                  placeholder="Enter number of household members"
                  value={householdMembers}
                  onChange={(e) => setHouseholdMembers(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">
                  Status *
                </Label>
                <Select
                  value={form.status}
                  onValueChange={(val) => setForm({ ...form, status: val })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Extended medical/details section */}
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
                        onChange={(e) => setAllergiesInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addItem(allergiesInput, allergies, setAllergies);
                            setAllergiesInput("");
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          addItem(allergiesInput, allergies, setAllergies);
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
                                removeItemAt(idx, allergies, setAllergies)
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
                  <Label htmlFor="disabilities" className="text-right">
                    Disabilities
                  </Label>
                  <div className="col-span-3 space-y-2">
                    <div className="flex gap-2">
                      <Input
                        id="disabilities"
                        placeholder="Type and press Enter"
                        value={disabilitiesInput}
                        onChange={(e) => setDisabilitiesInput(e.target.value)}
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
                                removeItemAt(idx, disabilities, setDisabilities)
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
                  <Label htmlFor="chronicConditions" className="text-right">
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
                  <Label htmlFor="medications" className="text-right">
                    Medications
                  </Label>
                  <div className="col-span-3 space-y-2">
                    <div className="flex gap-2">
                      <Input
                        id="medications"
                        placeholder="Type and press Enter"
                        value={medicationsInput}
                        onChange={(e) => setMedicationsInput(e.target.value)}
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
                                removeItemAt(idx, medications, setMedications)
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
                    onChange={(e) => setBloodTypeInput(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label htmlFor="notes" className="text-right mt-2">
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
                  Add each item individually using the field above. Press Enter
                  or click Add.
                </div>
              </div>

              {/* Project Associations */}
              <div className="border-t pt-4 mt-4">
                <div className="space-y-2">
                  <Label>Project Associations</Label>
                  <div className="mt-4 space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Select specific projects and sub-projects:
                    </p>

                    {projectsLoading || subprojectsLoading ? (
                      <div className="text-sm text-muted-foreground px-1">
                        Loading projects...
                      </div>
                    ) : projectsError || subprojectsError ? (
                      <div className="text-sm text-red-500 px-1">
                        {projectsError || subprojectsError}
                      </div>
                    ) : projectsForModal && projectsForModal.length > 0 ? (
                      projectsForModal.map((project: any) => (
                        <div key={project.id} className="border rounded-md p-4">
                          <div className="flex items-center space-x-2 mb-4">
                            <Checkbox
                              id={`proj-${project.id}`}
                              checked={selectedProjects.includes(project.id)}
                              onCheckedChange={() => {
                                setSelectedProjects((prev) => {
                                  if (prev.includes(project.id)) {
                                    const subProjectsForProject =
                                      subprojectsForModalByProjectId[
                                        project.id
                                      ] || [];
                                    const subIds = subProjectsForProject.map(
                                      (sp) => sp.id
                                    );
                                    setSelectedSubProjects((prevSubs) =>
                                      prevSubs.filter(
                                        (spId) => !subIds.includes(spId)
                                      )
                                    );
                                    return prev.filter((p) => p !== project.id);
                                  } else {
                                    return [...prev, project.id];
                                  }
                                });
                              }}
                            />
                            <Label
                              htmlFor={`proj-${project.id}`}
                              className="font-medium"
                            >
                              {project.name}
                            </Label>
                          </div>

                          <div className="pl-6 border-l ml-2 space-y-2">
                            {(
                              subprojectsForModalByProjectId[project.id] || []
                            ).map((subProject) => (
                              <div
                                key={subProject.id}
                                className="flex items-center space-x-2"
                              >
                                <Checkbox
                                  id={`sub-${subProject.id}`}
                                  checked={selectedSubProjects.includes(
                                    subProject.id
                                  )}
                                  onCheckedChange={() => {
                                    setSelectedSubProjects((prev) => {
                                      if (prev.includes(subProject.id)) {
                                        return prev.filter(
                                          (sp) => sp !== subProject.id
                                        );
                                      } else {
                                        if (
                                          !selectedProjects.includes(project.id)
                                        ) {
                                          setSelectedProjects(
                                            (prevProjects) => [
                                              ...prevProjects,
                                              project.id,
                                            ]
                                          );
                                        }
                                        return [...prev, subProject.id];
                                      }
                                    });
                                  }}
                                  disabled={
                                    !selectedProjects.includes(project.id)
                                  }
                                />
                                <Label
                                  htmlFor={`sub-${subProject.id}`}
                                  className="font-normal"
                                >
                                  {subProject.name}
                                </Label>
                              </div>
                            ))}
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
              </div>

              {createError && (
                <div className="col-span-4 text-red-600 text-sm">
                  {createError}
                </div>
              )}
            </div>
            <DialogFooter>
              <div className="flex items-center mr-auto">
                <ShieldAlert className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  Personal data will be pseudonymized
                </span>
              </div>
              <Button
                onClick={() => {
                  setIsAddDialogOpen(false);
                  resetForm();
                  dispatch(clearBeneficiaryMessages());
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateSubmit}
                disabled={createLoading || associateLoading}
              >
                {createLoading
                  ? "Creating..."
                  : associateLoading
                  ? "Associating..."
                  : "Add Beneficiary"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {showAdvancedFilters && (
        <Card className="mb-6">
          <CardContent className="py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label>Location</Label>
                <Select>
                  <SelectTrigger className="mt-2 bg-white border transition-transform duration-200 ease-in-out hover:scale-105 hover:-translate-y-[1px] border-gray-100 text-black">
                    <SelectValue placeholder="All locations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    <SelectItem value="northern">Northern District</SelectItem>
                    <SelectItem value="eastern">Eastern Region</SelectItem>
                    <SelectItem value="southern">Southern Province</SelectItem>
                    <SelectItem value="western">Western District</SelectItem>
                    <SelectItem value="central">Central Region</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Age Range</Label>
                <div className="grid grid-cols-2 gap-2 mt-2 ">
                  <Input
                    type="number"
                    placeholder="Min age"
                    className="bg-white border transition-transform duration-200 ease-in-out hover:scale-105 hover:-translate-y-[1px] border-gray-100 text-black"
                  />
                  <Input
                    type="number"
                    placeholder="Max age"
                    className="bg-white border transition-transform duration-200 ease-in-out hover:scale-105 hover:-translate-y-[1px] border-gray-100 text-black"
                  />
                </div>
              </div>
              <div>
                <Label>Registration Date</Label>
                <div className="grid grid-cols-2 gap-2 mt-2 ">
                  <Input
                    type="date"
                    placeholder="From"
                    className="bg-white border transition-transform duration-200 ease-in-out hover:scale-105 hover:-translate-y-[1px] border-gray-100 text-black"
                  />
                  <Input
                    type="date"
                    placeholder="To"
                    className="bg-white border transition-transform duration-200 ease-in-out hover:scale-105 hover:-translate-y-[1px] border-gray-100 text-black"
                  />
                </div>
              </div>
              <div>
                <Label>Tags</Label>
                <Select value={tagFilter} onValueChange={setTagFilter}>
                  <SelectTrigger className="mt-2 bg-white border transition-transform duration-200 ease-in-out hover:scale-105 hover:-translate-y-[1px] border-gray-100 text-black">
                    <SelectValue placeholder="All tags" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tags</SelectItem>
                    {uniqueTags.map((tag) => (
                      <SelectItem key={tag} value={tag}>
                        {tag.replace("-", " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <Button
                //  variant="outline"
                // size="sm"
                className="mr-2 bg-[#E0F2FE]"
              >
                Reset Filters
              </Button>
              <Button className="bg-[#0073e6] text-white">Apply Filters</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="rounded-md border overflow-hidden">
        {listLoading && (
          <div className="p-4 text-sm text-muted-foreground">
            Loading beneficiaries...
          </div>
        )}
        {listError && !listLoading && (
          <div className="p-4 text-sm text-red-600">{listError}</div>
        )}
        <Table>
          <TableHeader className="bg-[#E5ECF6]">
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={
                    selectedBeneficiaries.length ===
                      filteredBeneficiaries.length &&
                    filteredBeneficiaries.length > 0
                  }
                  onCheckedChange={handleSelectAll}
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
            {filteredBeneficiaries.map((beneficiary) => (
              <TableRow key={beneficiary.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedBeneficiaries.includes(beneficiary.id)}
                    onCheckedChange={() =>
                      handleSelectBeneficiary(beneficiary.id)
                    }
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={""} alt={beneficiary.name} />
                      <AvatarFallback>{beneficiary.initials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{beneficiary.name}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <ShieldAlert className="h-3 w-3" />
                        {beneficiary.pseudonym}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div>{beneficiary.gender || "—"}</div>
                  <div>
                    {beneficiary.dob
                      ? new Date(beneficiary.dob).toLocaleDateString()
                      : "—"}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    className={
                      beneficiary.status === "active"
                        ? "bg-[#DEF8EE] text-[#4AA785] border-0"
                        : "bg-black/10 text-black/40 border-0"
                    }
                    variant={
                      beneficiary.status === "active" ? "default" : "secondary"
                    }
                  >
                    {beneficiary.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                    <span className="truncate max-w-[200px]">
                      {beneficiary.municipality || "—"}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Nationality: {beneficiary.nationality || "—"}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm truncate max-w-[220px]">
                    <span className="mr-2">{beneficiary.phone || "—"}</span>
                  </div>
                  <div className="text-xs text-muted-foreground truncate max-w-[220px]">
                    {beneficiary.email || "—"}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    <span>
                      {beneficiary.createdAt
                        ? new Date(beneficiary.createdAt).toLocaleDateString()
                        : "—"}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      className="hover:bg-[#E0F2FE] border-0"
                      // variant="outline"
                      // size="sm"
                      onClick={() => onBeneficiarySelect(beneficiary.id)}
                    >
                      <Eye className="h-4 w-4 mr-2 " />
                      View
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          // variant="ghost"
                          // size="sm"
                          className="h-8 w-8 p-0 hover:bg-[#E0F2FE] border-0"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <FileEdit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Link className="h-4 w-4 mr-2" />
                          Associate
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <FileCheck className="h-4 w-4 mr-2" />
                          Record Service
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {filteredBeneficiaries.length === 0 && !listLoading && (
        <div className="text-center py-10 border rounded-lg">
          <User className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <h3 className="text-lg mb-2">No beneficiaries found</h3>
          <p className="text-muted-foreground">
            Try adjusting your filters or search criteria.
          </p>
        </div>
      )}

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>
            Page {activePagination.page} of{" "}
            {Math.max(activePagination.totalPages || 1, 1)}
          </span>
          <span className="hidden sm:inline">
            • Total {activePagination.totalItems} records
          </span>
          <div className="flex items-center gap-2 ml-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={listLoading || activePagination.page <= 1}
              className="bg-white"
            >
              Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={
                listLoading ||
                activePagination.totalPages === 0 ||
                activePagination.page >= activePagination.totalPages
              }
              className="bg-white"
            >
              Next
            </Button>
            <div className="flex items-center gap-1 ml-2">
              {pageTokens.map((tok, idx) =>
                typeof tok === "number" ? (
                  <Button
                    key={`p-${tok}`}
                    variant="outline"
                    size="sm"
                    className={
                      tok === activePagination.page
                        ? "bg-[#0073e6] text-white border-0"
                        : "bg-white"
                    }
                    onClick={() =>
                      tok !== activePagination.page && setPage(tok)
                    }
                    disabled={listLoading}
                    aria-current={
                      tok === activePagination.page ? "page" : undefined
                    }
                  >
                    {tok}
                  </Button>
                ) : (
                  <span
                    key={`${tok}-${idx}`}
                    className="px-1 text-muted-foreground"
                  >
                    …
                  </span>
                )
              )}
            </div>
            <Select
              value={String(limit)}
              onValueChange={(val) => {
                const newLimit = parseInt(val, 10) || 20;
                setLimit(newLimit);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[120px] bg-[#E0F2FE] border-0 text-black">
                <SelectValue placeholder="Rows" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 / page</SelectItem>
                <SelectItem value="20">20 / page</SelectItem>
                <SelectItem value="50">50 / page</SelectItem>
                <SelectItem value="100">100 / page</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            className="bg-[#0073e6] text-white"
          >
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Export to Excel
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="bg-[#0073e6] text-white"
          >
            <FileText className="h-4 w-4 mr-2" />
            Export to PDF
          </Button>
        </div>
      </div>
    </div>
  );
}
