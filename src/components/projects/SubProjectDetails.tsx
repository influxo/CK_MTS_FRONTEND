import {
  ArrowLeft,
  BarChart3,
  Calendar,
  CheckCircle,
  FileEdit,
  FileText,
  Filter,
  FolderKanban,
  MapPin,
  Plus,
  TrendingDown,
  TrendingUp,
  User,
  Users,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "../ui/button/button";
import { Badge } from "../ui/data-display/badge";
import { Card, CardContent } from "../ui/data-display/card";
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
import { Textarea } from "../ui/form/textarea";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../ui/navigation/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/overlay/dialog";

import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import type { CreateBeneficiaryRequest } from "../../services/beneficiaries/beneficiaryModels";
import formService from "../../services/forms/formService";
import type { TimeUnit } from "../../services/services/serviceMetricsModels";
import serviceMetricsService from "../../services/services/serviceMetricsService";
import servicesService from "../../services/services/serviceServices";
import type { AppDispatch, RootState } from "../../store";
import { selectCurrentUser } from "../../store/slices/authSlice";
import {
  associateBeneficiaryToEntities,
  clearBeneficiaryMessages,
  createBeneficiary,
  // list for association modal
  fetchBeneficiaries,
  fetchBeneficiariesByEntity,
  selectBeneficiaries,
  selectBeneficiariesByEntity,
  selectBeneficiariesByEntityError,
  selectBeneficiariesByEntityLoading,
  selectBeneficiariesByEntityPagination,
  selectBeneficiariesError,
  selectBeneficiariesLoading,
  selectBeneficiaryAssociateLoading,
  selectBeneficiaryCreateSuccessMessage,
  selectBeneficiaryError,
  selectBeneficiaryIsLoading,
} from "../../store/slices/beneficiarySlice";
import { fetchEmployees } from "../../store/slices/employeesSlice";
import {
  fetchSubProjectDeliveriesSeries,
  fetchSubProjectDeliveriesSummary,
  getSubProjectById,
  selectSelectedSubproject,
  selectSubProjectMetricsSeries,
  selectSubProjectMetricsSummary,
  selectSubprojectsError,
  selectSubprojectsLoading,
  updateSubProject,
} from "../../store/slices/subProjectSlice";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/data-display/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/data-display/table";
import { Checkbox } from "../ui/form/checkbox";
import { SubProjectActivities } from "./SubProjectActivities";
import { SubProjectForms } from "./SubProjectForms";
import { SubProjectReports } from "./SubProjectReports";
import { SubProjectServices } from "./SubProjectServices";
import { SubProjectTeam } from "./SubProjectTeam";
import { useTranslation } from "../../hooks/useTranslation";

// We don't need to import the SubProject type directly as it's already used in Redux selectors

// TODO: remove this mockSubProjectEnhancement, it's just for testing since we dont have that data yet
//  we fetch the subproject data from the API and enhance it with this data

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

export function SubProjectDetails() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  // Edit dialog local state
  const [editName, setEditName] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editStatus, setEditStatus] = useState<
    "active" | "inactive" | "pending"
  >("active");
  const [editDescription, setEditDescription] = useState("");

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

  // Subproject-scoped metrics state (typed with RootState)
  const summaryState = useSelector((state: RootState) =>
    selectSubProjectMetricsSummary(state)
  );
  const seriesState = useSelector((state: RootState) =>
    selectSubProjectMetricsSeries(state)
  );

  // Overview local filter state (mirroring ProjectDetails)
  const [chartType, setChartType] = useState<"line" | "bar">("line");
  const [granularity, setGranularity] = useState<TimeUnit>("week");
  const [startDate, setStartDate] = useState<string | undefined>(undefined);
  const [endDate, setEndDate] = useState<string | undefined>(undefined);
  const [showMoreLocal, setShowMoreLocal] = useState<boolean>(false);
  const [metricLocal, setMetricLocal] = useState<
    "submissions" | "serviceDeliveries" | "uniqueBeneficiaries"
  >("submissions");
  const [serviceIdLocal, setServiceIdLocal] = useState<string | undefined>(
    undefined
  );
  const [formTemplateIdLocal, setFormTemplateIdLocal] = useState<
    string | undefined
  >(undefined);
  const [servicesOptions, setServicesOptions] = useState<any[]>([]);
  const [templatesOptions, setTemplatesOptions] = useState<any[]>([]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [timePreset, setTimePreset] = useState<string>("all-period");
  // Custom range controls (mirroring FormSubmissions)
  const [customOpen, setCustomOpen] = useState(false);
  const [customFrom, setCustomFrom] = useState<string>("");
  const [customTo, setCustomTo] = useState<string>("");
  const [seriesSummary, setSeriesSummary] = useState<{
    totalSubmissions?: number;
    totalServiceDeliveries?: number;
    totalUniqueBeneficiaries?: number;
  } | null>(null);

  const user = useSelector(selectCurrentUser);
  // Determine role
  const normalizedRoles = useMemo(
    () => (user?.roles || []).map((r: any) => r.name?.toLowerCase?.() || ""),
    [user?.roles]
  );

  const hasFullAccess = useMemo(() => {
    return normalizedRoles.some(
      (r: string) =>
        r === "sysadmin" ||
        r === "superadmin" ||
        r === "program manager" ||
        r === "subproject manager" ||
        r === "sub-project manager" ||
        r.includes("system admin") ||
        r.includes("super admin") ||
        r.includes("program manager") ||
        r.includes("sub project manager") ||
        r.includes("sub-project manager")
    );
  }, [normalizedRoles]);

  const onTimePresetChange = (value: string) => {
    setTimePreset(value);
    const now = new Date();
    const end = new Date(now);
    const start = new Date(now);
    if (value === "all-period") {
      setStartDate(undefined);
      setEndDate(undefined);
      return;
    } else if (value === "last-7-days") start.setDate(now.getDate() - 7);
    else if (value === "last-30-days") start.setDate(now.getDate() - 30);
    else if (value === "last-90-days") start.setDate(now.getDate() - 90);
    else {
      return;
    }
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    setStartDate(start.toISOString());
    setEndDate(end.toISOString());
  };

  const applyGranularity = (g: TimeUnit) => setGranularity(g);

  const onCustomApply = () => {
    if (!customFrom || !customTo) return;
    const from = new Date(customFrom);
    const to = new Date(customTo);
    from.setHours(0, 0, 0, 0);
    to.setHours(23, 59, 59, 999);
    setStartDate(from.toISOString());
    setEndDate(to.toISOString());
    setFiltersOpen(false);
    setCustomOpen(false);
  };

  // Label formatting helpers
  const dayFmt = new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
  });
  const monthFmt = new Intl.DateTimeFormat(undefined, {
    month: "short",
    year: "2-digit",
  });
  const startOfWeek = (d: Date) => {
    const x = new Date(d);
    const day = (x.getDay() + 6) % 7;
    x.setDate(x.getDate() - day);
    x.setHours(0, 0, 0, 0);
    return x;
  };
  const formatLabel = (iso: string) => {
    const d = new Date(iso);
    switch (granularity) {
      case "day":
        return dayFmt.format(d);
      case "week": {
        const monday = startOfWeek(d);
        const startYear = new Date(d.getFullYear(), 0, 1);
        const diffDays = Math.floor(
          (monday.getTime() - startYear.getTime()) / 86400000
        );
        const week = Math.floor(diffDays / 7) + 1;
        return `W${week} ${d.getFullYear()}`;
      }
      case "month":
        return monthFmt.format(d);
      case "quarter":
        return `Q${Math.floor(d.getMonth() / 3) + 1} ${d.getFullYear()}`;
      case "year":
        return String(d.getFullYear());
      default:
        return monthFmt.format(d);
    }
  };

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
      toast.success("Përfituesi u shtua me sukses", {
        style: {
          backgroundColor: "#d1fae5",
          color: "#065f46",
          border: "1px solid #10b981",
        },
      });
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
  const [ethnicity, setEthnicity] = useState("");
  const [isUrban, setIsUrban] = useState<boolean>(false);
  const [householdMembers, setHouseholdMembers] = useState<string>("");

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

  // Seed edit fields when selected subproject changes or dialog opens
  useEffect(() => {
    if (!subProject) return;
    setEditName(subProject.name || "");
    setEditCategory(subProject.category || "");
    setEditStatus(subProject.status as any);
    setEditDescription(subProject.description || "");
  }, [subProject, isEditDialogOpen]);

  useEffect(() => {
    if (user?.roles == null || user.roles.length === 0) return;
    if (!hasFullAccess) return;
    dispatch(fetchEmployees());
  }, [dispatch, hasFullAccess, user?.roles]);

  useEffect(() => {
    if (!subprojectId) return;

    // Only run effect if user roles are loaded
    if (user?.roles == null || user.roles.length === 0) return;

    if (!hasFullAccess) {
      return; // exit
    }

    const fetchBeneficiaries = async () => {
      console.log("Dispatching fetch beneficiaries for:", subprojectId);
      await dispatch(
        fetchBeneficiariesByEntity({
          entityId: subprojectId,
          entityType: "subproject",
          page: 1,
          limit: 20,
        })
      );
    };

    fetchBeneficiaries();
  }, [subprojectId, dispatch, hasFullAccess, user?.roles]);

  // Fetch beneficiaries list when Add dialog is open and tab is "existing"
  useEffect(() => {
    // Only run effect if user roles are loaded
    if (user?.roles == null || user.roles.length === 0) return;

    if (!hasFullAccess) {
      return; // exit
    }
    if (isAddDialogOpen && addBeneficiaryTab === "existing") {
      dispatch(fetchBeneficiaries(undefined));
    }
  }, [
    isAddDialogOpen,
    addBeneficiaryTab,
    dispatch,
    hasFullAccess,
    user?.roles,
  ]);

  // Load services and templates for filters
  useEffect(() => {
    (async () => {
      if (!subprojectId) return;

      // Only run effect if user roles are loaded
      if (user?.roles == null || user.roles.length === 0) return;

      if (!hasFullAccess) {
        return; // exit
      }
      const res = await servicesService.getEntityServices({
        entityId: subprojectId,
        entityType: "subproject" as any,
      });
      if (res && res.success) setServicesOptions(res.items || []);
      else setServicesOptions([]);
    })();
  }, [subprojectId, hasFullAccess, user?.roles]);

  useEffect(() => {
    (async () => {
      const forms = await formService.getForms();
      const templates = (forms?.data as any)?.templates || forms?.data || [];
      setTemplatesOptions(templates || []);
    })();
  }, []);

  // Fetch subproject metrics whenever Overview is active and filters change
  useEffect(() => {
    if (activeTab !== "overview") return;
    if (!subprojectId) return;

    // Only run effect if user roles are loaded
    if (user?.roles == null || user.roles.length === 0) return;

    if (!hasFullAccess) {
      return; // exit
    }

    const commonFilters = {
      entityId: subprojectId,
      entityType: "subproject" as any,
      serviceId: serviceIdLocal,
      formTemplateId: formTemplateIdLocal,
    } as any;

    dispatch(
      fetchSubProjectDeliveriesSummary({
        ...commonFilters,
        startDate,
        endDate,
      }) as any
    );

    dispatch(
      fetchSubProjectDeliveriesSeries({
        ...commonFilters,
        startDate,
        endDate,
        groupBy: granularity,
        metric: metricLocal,
      }) as any
    );
  }, [
    dispatch,
    subprojectId,
    activeTab,
    startDate,
    endDate,
    granularity,
    metricLocal,
    serviceIdLocal,
    formTemplateIdLocal,
    hasFullAccess,
    user?.roles,
  ]);

  // Fetch series summary exactly as in FormSubmissions for subproject scope
  useEffect(() => {
    (async () => {
      if (activeTab !== "overview") return;
      if (!subprojectId) return;
      if (user?.roles == null || user.roles.length === 0) return;
      if (!hasFullAccess) {
        setSeriesSummary(null);
        return;
      }
      try {
        const res = await serviceMetricsService.getDeliveriesSeries({
          entityId: subprojectId,
          entityType: "subproject" as any,
          groupBy: granularity,
          metric: "submissions",
          startDate,
          endDate,
          serviceId: serviceIdLocal,
          formTemplateId: formTemplateIdLocal,
        } as any);
        if (res && res.success) {
          setSeriesSummary((res as any).summary || null);
        } else {
          setSeriesSummary(null);
        }
      } catch {
        setSeriesSummary(null);
      }
    })();
  }, [
    activeTab,
    subprojectId,
    granularity,
    startDate,
    endDate,
    serviceIdLocal,
    formTemplateIdLocal,
    hasFullAccess,
    user?.roles,
  ]);

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
    setEthnicity("");
    setIsUrban(false);
    setHouseholdMembers("");
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
      toast.success("Përfituesi u krijua me sukses", {
        style: {
          backgroundColor: "#d1fae5",
          color: "#065f46",
          border: "1px solid #10b981",
        },
      });
      // success effect will close/reset/refresh
    } catch (_) {
      // errors surfaced via createError
    }
  };

  if (loading)
    return (
      <div className="p-8 flex justify-center">
        <div>{t("subProjectDetails.loadingSubprojectDetails")}</div>
      </div>
    );
  if (error)
    return (
      <div className="p-8 text-red-500">
        {t("subProjectDetails.error")}: {error}
      </div>
    );
  if (!subProject)
    return (
      <div className="p-8">{t("subProjectDetails.noSubprojectFound")}</div>
    );

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
      <div className="flex flex-wrap items-center gap-3">
        <Button
          variant="outline"
          className="bg-[#E0F2FE] border-0 transition-transform duration-200 ease-in-out hover:scale-[1.02] hover:-translate-y-[1px]"
          size="sm"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          {t("subProjectDetails.backToProject")}
        </Button>
        {hasFullAccess && (
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="ml-auto bg-[#0073e6] border-0 text-white"
              >
                <FileEdit className="h-4 w-4 mr-2" />
                {t("subProjectDetails.editSubProject")}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px]">
              <DialogHeader>
                <DialogTitle>
                  {t("subProjectDetails.editSubProjectTitle")}
                </DialogTitle>
                <DialogDescription>
                  {t("subProjectDetails.editSubProjectDesc")}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="title" className="text-right">
                    {t("subProjectDetails.title")}
                  </Label>
                  <Input
                    id="title"
                    className="col-span-3"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="category" className="text-right">
                    {t("subProjectDetails.category")}
                  </Label>
                  <Select
                    value={editCategory.toLowerCase()}
                    onValueChange={(v) => setEditCategory(v)}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue
                        placeholder={t("subProjectDetails.selectCategory")}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="healthcare">
                        {t("subProjectDetails.healthcare")}
                      </SelectItem>
                      <SelectItem value="education">
                        {t("subProjectDetails.education")}
                      </SelectItem>
                      <SelectItem value="infrastructure">
                        {t("subProjectDetails.infrastructure")}
                      </SelectItem>
                      <SelectItem value="training">
                        {t("subProjectDetails.training")}
                      </SelectItem>
                      <SelectItem value="food aid">
                        {t("subProjectDetails.foodAid")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="type" className="text-right">
                    {t("subProjectDetails.type")}
                  </Label>
                  <Select
                    defaultValue={enhancedSubProject.type
                      .toLowerCase()
                      .replace(" ", "-")}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue
                        placeholder={t("subProjectDetails.selectType")}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="service-delivery">
                        {t("subProjectDetails.serviceDelivery")}
                      </SelectItem>
                      <SelectItem value="training">
                        {t("subProjectDetails.training")}
                      </SelectItem>
                      <SelectItem value="construction">
                        {t("subProjectDetails.construction")}
                      </SelectItem>
                      <SelectItem value="distribution">
                        {t("subProjectDetails.distribution")}
                      </SelectItem>
                      <SelectItem value="research">
                        {t("subProjectDetails.research")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="status" className="text-right">
                    {t("subProjectDetails.status")}
                  </Label>
                  <Select
                    value={editStatus}
                    onValueChange={(v) => setEditStatus(v as any)}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue
                        placeholder={t("subProjectDetails.selectStatus")}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">
                        {t("subProjectDetails.active")}
                      </SelectItem>
                      <SelectItem value="inactive">
                        {t("subProjectDetails.inactive")}
                      </SelectItem>
                      <SelectItem value="pending">
                        {t("subProjectDetails.pending")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="location" className="text-right">
                    {t("subProjectDetails.location")}
                  </Label>
                  <Input
                    id="location"
                    className="col-span-3"
                    defaultValue={enhancedSubProject.location}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="start-date" className="text-right">
                    {t("subProjectDetails.startDate")}
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
                    {t("subProjectDetails.endDate")}
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
                    {t("subProjectDetails.description")}
                  </Label>
                  <Textarea
                    id="description"
                    className="col-span-3"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  {t("subProjectDetails.cancel")}
                </Button>
                <Button
                  className="bg-[#0073e6] border-0 text-white"
                  onClick={async () => {
                    if (!subprojectId) return;
                    try {
                      const res = await dispatch(
                        updateSubProject({
                          id: subprojectId,
                          name: editName,
                          description: editDescription,
                          category: editCategory,
                          status: editStatus,
                        }) as any
                      ).unwrap();
                      if (res && res.success) {
                        toast.success("Nënprojekti u modifikua me sukses", {
                          style: {
                            backgroundColor: "#d1fae5",
                            color: "#065f46",
                            border: "1px solid #10b981",
                          },
                        });
                      }
                      setIsEditDialogOpen(false);
                    } catch (_) {
                      toast.error("Diçka shkoi gabim", {
                        style: {
                          backgroundColor: "#fee2e2",
                          color: "#991b1b",
                          border: "1px solid #ef4444",
                        },
                      });
                    }
                  }}
                >
                  {t("subProjectDetails.saveChanges")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
        <h1 className="text-3xl basis-full font-semibold capitalize">
          {enhancedSubProject.title}
        </h1>
        {/* {hasFullAccess && (
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="ml-auto bg-[#0073e6] border-0 text-white"
              >
                <FileEdit className="h-4 w-4 mr-2" />
                {t("subProjectDetails.editSubProject")}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px]">
              <DialogHeader>
                <DialogTitle>
                  {t("subProjectDetails.editSubProjectTitle")}
                </DialogTitle>
                <DialogDescription>
                  {t("subProjectDetails.editSubProjectDesc")}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="title" className="text-right">
                    {t("subProjectDetails.title")}
                  </Label>
                  <Input
                    id="title"
                    className="col-span-3"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="category" className="text-right">
                    {t("subProjectDetails.category")}
                  </Label>
                  <Select
                    value={editCategory.toLowerCase()}
                    onValueChange={(v) => setEditCategory(v)}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue
                        placeholder={t("subProjectDetails.selectCategory")}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="healthcare">
                        {t("subProjectDetails.healthcare")}
                      </SelectItem>
                      <SelectItem value="education">
                        {t("subProjectDetails.education")}
                      </SelectItem>
                      <SelectItem value="infrastructure">
                        {t("subProjectDetails.infrastructure")}
                      </SelectItem>
                      <SelectItem value="training">
                        {t("subProjectDetails.training")}
                      </SelectItem>
                      <SelectItem value="food aid">
                        {t("subProjectDetails.foodAid")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="type" className="text-right">
                    {t("subProjectDetails.type")}
                  </Label>
                  <Select
                    defaultValue={enhancedSubProject.type
                      .toLowerCase()
                      .replace(" ", "-")}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue
                        placeholder={t("subProjectDetails.selectType")}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="service-delivery">
                        {t("subProjectDetails.serviceDelivery")}
                      </SelectItem>
                      <SelectItem value="training">
                        {t("subProjectDetails.training")}
                      </SelectItem>
                      <SelectItem value="construction">
                        {t("subProjectDetails.construction")}
                      </SelectItem>
                      <SelectItem value="distribution">
                        {t("subProjectDetails.distribution")}
                      </SelectItem>
                      <SelectItem value="research">
                        {t("subProjectDetails.research")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="status" className="text-right">
                    {t("subProjectDetails.status")}
                  </Label>
                  <Select
                    value={editStatus}
                    onValueChange={(v) => setEditStatus(v as any)}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue
                        placeholder={t("subProjectDetails.selectStatus")}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">
                        {t("subProjectDetails.active")}
                      </SelectItem>
                      <SelectItem value="inactive">
                        {t("subProjectDetails.inactive")}
                      </SelectItem>
                      <SelectItem value="pending">
                        {t("subProjectDetails.pending")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="location" className="text-right">
                    {t("subProjectDetails.location")}
                  </Label>
                  <Input
                    id="location"
                    className="col-span-3"
                    defaultValue={enhancedSubProject.location}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="start-date" className="text-right">
                    {t("subProjectDetails.startDate")}
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
                    {t("subProjectDetails.endDate")}
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
                    {t("subProjectDetails.description")}
                  </Label>
                  <Textarea
                    id="description"
                    className="col-span-3"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  {t("subProjectDetails.cancel")}
                </Button>
                <Button
                  className="bg-[#0073e6] border-0 text-white"
                  onClick={async () => {
                    if (!subprojectId) return;
                    try {
                      const res = await dispatch(
                        updateSubProject({
                          id: subprojectId,
                          name: editName,
                          description: editDescription,
                          category: editCategory,
                          status: editStatus,
                        }) as any
                      ).unwrap();
                      if (res && res.success) {
                        toast.success("Nënprojekti u modifikua me sukses", {
                          style: {
                            backgroundColor: "#d1fae5",
                            color: "#065f46",
                            border: "1px solid #10b981",
                          },
                        });
                      }
                      setIsEditDialogOpen(false);
                    } catch (_) {
                      toast.error("Diçka shkoi gabim", {
                        style: {
                          backgroundColor: "#fee2e2",
                          color: "#991b1b",
                          border: "1px solid #ef4444",
                        },
                      });
                    }
                  }}
                >
                  {t("subProjectDetails.saveChanges")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )} */}
      </div>

      <Card className="flex  bg-[#F7F9FB] border-0   drop-shadow-sm shadow-gray-50">
        <CardContent className="p-6 w-full">
          <div className="flex flex-col md:flex-row gap-6 w-full">
            <div className="flex-1 space-y-5">
              <div className="flex gap-2">
                <Badge
                  variant="outline"
                  className="bg-[#0073e6] text-white border-0"
                >
                  {enhancedSubProject.category}
                </Badge>
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
                    ? t("subProjectDetails.active")
                    : enhancedSubProject.status === "pending"
                    ? t("subProjectDetails.pending")
                    : t("subProjectDetails.inactive")}
                </Badge>
              </div>

              <p className="text-xl font-normal  capitalize">
                {enhancedSubProject.description}
              </p>
            </div>

            <div className="grid grid-cols-1 w-full md:w-2/5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl p-4 bg-[#E5ECF6]">
                  <div className="text-sm text-muted-foreground">
                    {t("subProjectDetails.timeline")}
                  </div>
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
                  <div className="text-sm text-muted-foreground">
                    {t("subProjectDetails.lead")}
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {enhancedSubProject.leads &&
                      enhancedSubProject.leads.length > 0
                        ? enhancedSubProject.leads[0]
                        : t("subProjectDetails.noLeadAssigned")}
                    </span>
                  </div>
                </div>

                <div className="rounded-xl p-4 bg-[#E5ECF6]">
                  <div className="text-sm text-muted-foreground">
                    {t("subProjectDetails.location")}
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{enhancedSubProject.location}</span>
                  </div>
                </div>

                <div className="rounded-xl p-4 bg-[#E5ECF6]">
                  <div className="text-sm text-muted-foreground">
                    {t("subProjectDetails.beneficiariesLabel")}
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {(subBeneficiariesMeta.totalItems ?? 0).toLocaleString()}{" "}
                      {t("subProjectDetails.beneficiariesLabel")}
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
          <div className="flex gap-4 overflow-x-auto whitespace-nowrap scrollbar-hide">
            <TabsTrigger
              value="overview"
              className={`rounded-none bg-transparent border-0 border-b-2 pb-3 hover:bg-transparent text-black ${
                activeTab === "overview" ? "border-black" : "border-transparent"
              }`}
            >
              {t("subProjectDetails.overview")}
            </TabsTrigger>
            <TabsTrigger
              value="forms"
              className={`rounded-none bg-transparent border-0 border-b-2 pb-3 hover:bg-transparent text-black ${
                activeTab === "forms" ? "border-black" : "border-transparent"
              }`}
            >
              {t("subProjectDetails.formsData")}
            </TabsTrigger>
            <TabsTrigger
              value="activities"
              className={`rounded-none bg-transparent border-0 border-b-2 pb-3 hover:bg-transparent text-black ${
                activeTab === "activities"
                  ? "border-black"
                  : "border-transparent"
              }`}
            >
              {t("subProjectDetails.activitiesTab")}
            </TabsTrigger>
            <TabsTrigger
              value="services"
              className={`rounded-none bg-transparent border-0 border-b-2 pb-3 hover:bg-transparent text-black ${
                activeTab === "services" ? "border-black" : "border-transparent"
              }`}
            >
              {t("subProjectDetails.services")}
            </TabsTrigger>
            <TabsTrigger
              value="beneficiaries"
              className={`rounded-none bg-transparent border-0 border-b-2 pb-3 hover:bg-transparent ${
                activeTab === "beneficiaries"
                  ? "border-black"
                  : "border-transparent"
              }`}
            >
              {t("subProjectDetails.beneficiariesTab")}
            </TabsTrigger>
            <TabsTrigger
              value="team"
              className={`rounded-none bg-transparent border-0 border-b-2 pb-3 hover:bg-transparent ${
                activeTab === "team" ? "border-black" : "border-transparent"
              }`}
            >
              {t("subProjectDetails.team")}
            </TabsTrigger>
            <TabsTrigger
              value="reports"
              className={`rounded-none bg-transparent border-0 border-b-2 pb-3 hover:bg-transparent ${
                activeTab === "reports" ? "border-black" : "border-transparent"
              }`}
            >
              {t("subProjectDetails.reports")}
            </TabsTrigger>
          </div>
        </TabsList>

        {hasFullAccess && (
          <TabsContent value="overview" className="pt-6">
            <div className="space-y-6">
              {/* Overview Filters */}
              <div className="flex flex-col gap-2">
                <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center">
                  {/* Time Period */}
                  <Select value={timePreset} onValueChange={onTimePresetChange}>
                    <SelectTrigger className="w-full md:w-[200px] bg-white border-gray-100 border p-2 rounded-md  transition-transform duration-200 ease-in-out hover:scale-[1.02] hover:-translate-y-[1px]">
                      <SelectValue
                        placeholder={t("subProjectDetails.timePeriod")}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all-period">
                        {t("subProjectDetails.allPeriod")}
                      </SelectItem>
                      <SelectItem value="last-7-days">
                        {t("subProjectDetails.last7Days")}
                      </SelectItem>
                      <SelectItem value="last-30-days">
                        {t("subProjectDetails.last30Days")}
                      </SelectItem>
                      <SelectItem value="last-90-days">
                        {t("subProjectDetails.last90Days")}
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowMoreLocal((s) => !s)}
                    className="bg-[#E0F2FE] text-black border-0 transition-transform duration-200 ease-in-out hover:scale-105 hover:-translate-y-[1px] w-full md:w-auto"
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    {showMoreLocal
                      ? t("subProjectDetails.hideFilters")
                      : t("subProjectDetails.moreFilters")}
                  </Button>
                </div>

                {showMoreLocal && (
                  <div className="w-full md:w-auto">
                    <div className="flex flex-col gap-3 w-full md:flex-row md:flex-wrap md:items-center">
                      {/* Metric */}
                      <Select
                        value={metricLocal}
                        onValueChange={(v) => setMetricLocal(v as any)}
                      >
                        <SelectTrigger className="w-full md:w-[200px] p-2 rounded-md border-gray-100 border transition-transform duration-200 ease-in-out hover:scale-[1.02] hover:-translate-y-[1px]">
                          <SelectValue
                            placeholder={t("subProjectDetails.metric")}
                          />
                        </SelectTrigger>

                        <SelectContent>
                          <SelectItem value="submissions">
                            {t("subProjectDetails.submissions")}
                          </SelectItem>
                          <SelectItem value="serviceDeliveries">
                            {t("subProjectDetails.serviceDeliveriesMetric")}
                          </SelectItem>
                          <SelectItem value="uniqueBeneficiaries">
                            {t("subProjectDetails.uniqueBeneficiaries")}
                          </SelectItem>
                        </SelectContent>
                      </Select>

                      {/* Service */}
                      <Select
                        value={(serviceIdLocal ?? "all") as string}
                        onValueChange={(v) => {
                          const id = v === "all" ? "" : v;
                          setServiceIdLocal(id || undefined);
                        }}
                      >
                        <SelectTrigger className="w-full md:w-[200px] p-2 rounded-md border-gray-100 border transition-transform duration-200 ease-in-out hover:scale-[1.02] hover:-translate-y-[1px]">
                          <SelectValue
                            placeholder={t("subProjectDetails.service")}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">
                            {t("subProjectDetails.allServices")}
                          </SelectItem>
                          {(servicesOptions || []).map((s: any) => (
                            <SelectItem key={s.id} value={s.id}>
                              {s.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {/* Form Template */}
                      <Select
                        value={(formTemplateIdLocal ?? "all") as string}
                        onValueChange={(v) => {
                          const id = v === "all" ? "" : v;
                          setFormTemplateIdLocal(id || undefined);
                        }}
                      >
                        <SelectTrigger className="w-full md:w-[200px] p-2 rounded-md border-gray-100 border transition-transform duration-200 ease-in-out hover:scale-[1.02] hover:-translate-y-[1px]">
                          <SelectValue
                            placeholder={t("subProjectDetails.formTemplate")}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">
                            {t("subProjectDetails.allTemplates")}
                          </SelectItem>
                          {(templatesOptions || []).map((t: any) => (
                            <SelectItem key={t.id} value={t.id}>
                              {t.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {/* Granularity dropdown */}
                      <div className="relative w-full md:w-auto">
                        <button
                          onClick={() => setFiltersOpen((s) => !s)}
                          className="px-3 py-1.5 rounded-md text-sm bg-[#E0F2FE]  flex items-center justify-between w-full md:w-auto transition-transform duration-200 ease-in-out hover:scale-[1.02] hover:-translate-y-[1px] gap-2"
                        >
                          <span>
                            {" "}
                            <span className="capitalize font-medium">
                              {granularity}
                            </span>
                          </span>
                          <svg
                            className="h-4 w-4"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M5.23 7.21a.75.75 0 011.06.02L10 11.086l3.71-3.854a.75.75 0 111.08 1.04l-4.24 4.4a.75.75 0 01-1.08 0l-4.24-4.4a.75.75 0 01.02-1.06z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                        {filtersOpen && (
                          <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-lg p-1 z-10">
                            <ul className="py-1">
                              {["day", "week", "month", "quarter", "year"].map(
                                (g) => (
                                  <li key={g}>
                                    <button
                                      onClick={() => {
                                        applyGranularity(g as TimeUnit);
                                        setFiltersOpen(false);
                                        setCustomOpen(false);
                                      }}
                                      className={[
                                        "w-full text-left px-3 py-2 text-sm rounded-md capitalize transition-transform duration-200 ease-in-out",
                                        granularity === (g as TimeUnit)
                                          ? "bg-[#E5ECF6] text-gray-900 scale-[1.02] -translate-y-[1px]"
                                          : "hover:bg-gray-50 hover:scale-[1.02] hover:-translate-y-[1px]",
                                      ].join(" ")}
                                    >
                                      {g}
                                    </button>
                                  </li>
                                )
                              )}
                              <li className="my-1 border-t border-gray-100" />
                              <li>
                                <button
                                  onClick={() => setCustomOpen((s) => !s)}
                                  className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-50"
                                >
                                  {t("subProjectDetails.customRange")}
                                </button>
                                {customOpen && (
                                  <div className="px-3 pb-2">
                                    <div className="grid grid-cols-1 gap-2">
                                      <label className="text-xs text-gray-600">
                                        {t("subProjectDetails.from")}
                                        <input
                                          type="date"
                                          className="mt-1 w-full border rounded-md px-2 py-1 text-sm"
                                          value={customFrom}
                                          onChange={(e) =>
                                            setCustomFrom(e.target.value)
                                          }
                                        />
                                      </label>
                                      <label className="text-xs text-gray-600">
                                        {t("subProjectDetails.to")}
                                        <input
                                          type="date"
                                          className="mt-1 w-full border rounded-md px-2 py-1 text-sm"
                                          value={customTo}
                                          onChange={(e) =>
                                            setCustomTo(e.target.value)
                                          }
                                        />
                                      </label>
                                      <div className="flex justify-end gap-2 pt-1">
                                        <button
                                          onClick={() => setCustomOpen(false)}
                                          className="px-3 py-1.5 rounded-md text-sm border border-gray-200"
                                        >
                                          {t("subProjectDetails.cancel")}
                                        </button>
                                        <button
                                          onClick={onCustomApply}
                                          className="px-3 py-1.5 rounded-md text-sm bg-black text-white"
                                        >
                                          {t("subProjectDetails.apply")}
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </li>
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Dynamic Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-[#E3F5FF] drop-shadow-sm shadow-gray-50 border-0 hover:-translate-y-1 hover:shadow-md transition rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm">
                        {t("subProjectDetails.serviceDeliveriesCard")}
                      </div>
                      <div className="text-2xl">
                        {summaryState.loading
                          ? "…"
                          : (
                              summaryState.data?.totalDeliveries ?? 0
                            ).toLocaleString()}
                      </div>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <TrendingUp className="h-3 w-3 mr-1 text-green-500" />{" "}
                        Snapshot
                      </div>
                    </div>
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>

                <div className="bg-[#E5ECF6] drop-shadow-sm shadow-gray-50 border-0 hover:-translate-y-1 hover:shadow-md transition rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm">
                        {t("subProjectDetails.uniqueBeneficiariesCard")}
                      </div>
                      <div className="text-2xl">
                        {summaryState.loading
                          ? "…"
                          : (
                              summaryState.data?.uniqueBeneficiaries ?? 0
                            ).toLocaleString()}
                      </div>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <TrendingUp className="h-3 w-3 mr-1 text-green-500" />{" "}
                        Snapshot
                      </div>
                    </div>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>

                <div className="bg-[#E3F5FF] drop-shadow-sm shadow-gray-50 border-0 hover:-translate-y-1 hover:shadow-md transition rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm">
                        {t("subProjectDetails.uniqueStaff")}
                      </div>
                      <div className="text-2xl">
                        {summaryState.loading
                          ? "…"
                          : (
                              summaryState.data?.uniqueStaff ?? 0
                            ).toLocaleString()}
                      </div>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <TrendingDown className="h-3 w-3 mr-1 text-red-500" />{" "}
                        Snapshot
                      </div>
                    </div>
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>

                <div className="bg-[#E5ECF6] drop-shadow-sm shadow-gray-50 border-0 hover:-translate-y-1 hover:shadow-md transition rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm">
                        {t("subProjectDetails.uniqueServices")}
                      </div>
                      <div className="text-2xl">
                        {summaryState.loading
                          ? "…"
                          : (
                              summaryState.data?.uniqueServices ?? 0
                            ).toLocaleString()}
                      </div>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <TrendingUp className="h-3 w-3 mr-1 text-green-500" />{" "}
                        Snapshot
                      </div>
                    </div>
                    <FolderKanban className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </div>

              {/* Series Chart */}
              <Card className="bg-[#F7F9FB] drop-shadow-md shadow-gray-50 border-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-3">
                      <h4>
                        {t("subProjectDetails.subprojectActivityOverview")}
                      </h4>
                    </div>
                    <div className="flex space-x-4 justify-end">
                      <Tabs
                        className="w-full"
                        value={chartType}
                        onValueChange={(v) => setChartType(v as "line" | "bar")}
                      >
                        <TabsList className=" bg-[#E0F2FE] items-center">
                          <TabsTrigger
                            value="line"
                            className="data-[state=active]:bg-[#0073e6]  data-[state=active]:text-white"
                          >
                            {t("subProjectDetails.line")}
                          </TabsTrigger>
                          <TabsTrigger
                            value="bar"
                            className="data-[state=active]:bg-[#0073e6]  data-[state=active]:text-white"
                          >
                            {t("subProjectDetails.bar")}
                          </TabsTrigger>
                        </TabsList>
                      </Tabs>
                    </div>
                  </div>
                  <div className="h-64 mt-4">
                    {seriesState.loading ? (
                      <div className="h-full w-full flex items-center justify-center text-sm text-gray-600">
                        {t("subProjectDetails.loading")}
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart
                          data={(seriesState.items || []).map((it: any) => ({
                            name: formatLabel(it.periodStart),
                            value: it.count,
                          }))}
                          barCategoryGap="25%"
                          barGap={2}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <defs>
                            <linearGradient
                              id="subprojAreaFill"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="0%"
                                stopColor="#3b82f6"
                                stopOpacity={0.25}
                              />
                              <stop
                                offset="100%"
                                stopColor="#3b82f6"
                                stopOpacity={0}
                              />
                            </linearGradient>
                            <linearGradient
                              id="subprojBarFill"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="0%"
                                stopColor="#3b82f6"
                                stopOpacity={0.95}
                              />
                              <stop
                                offset="60%"
                                stopColor="#3b82f6"
                                stopOpacity={0.68}
                              />
                              <stop
                                offset="100%"
                                stopColor="#3b82f6"
                                stopOpacity={0.26}
                              />
                            </linearGradient>
                          </defs>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                          />
                          <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: "#6b7280" }}
                          />
                          <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: "#6b7280" }}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#fff",
                              border: "1px solid #e5e7eb",
                              borderRadius: "0.5rem",
                            }}
                          />
                          {chartType === "line" ? (
                            <>
                              <Area
                                type="monotone"
                                dataKey="value"
                                stroke="none"
                                fill="url(#subprojAreaFill)"
                                fillOpacity={1}
                              />
                              <Line
                                type="monotone"
                                dataKey="value"
                                stroke="#3b82f6"
                                strokeWidth={2}
                                dot={false}
                                activeDot={{ r: 6, fill: "#3b82f6" }}
                              />
                            </>
                          ) : (
                            <Bar
                              dataKey="value"
                              fill="url(#subprojBarFill)"
                              barSize={100}
                              radius={[6, 6, 0, 0]}
                            />
                          )}
                        </ComposedChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Series Summary Cards (below chart) */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-[#E3F5FF] drop-shadow-sm shadow-gray-50 border-0 hover:-translate-y-1 hover:shadow-md transition rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm">
                        {t("subProjectDetails.totalSubmissionsCard")}
                      </div>
                      <div className="text-2xl">
                        {seriesState.loading
                          ? "…"
                          : Number(
                              seriesSummary?.totalSubmissions || 0
                            ).toLocaleString()}
                      </div>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <TrendingUp className="h-3 w-3 mr-1 text-green-500" />{" "}
                        Snapshot
                      </div>
                    </div>
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>

                <div className="bg-[#E5ECF6] drop-shadow-sm shadow-gray-50 border-0 hover:-translate-y-1 hover:shadow-md transition rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm">
                        {t("subProjectDetails.totalServiceDeliveriesCard")}
                      </div>
                      <div className="text-2xl">
                        {seriesState.loading
                          ? "…"
                          : Number(
                              seriesSummary?.totalServiceDeliveries || 0
                            ).toLocaleString()}
                      </div>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <TrendingUp className="h-3 w-3 mr-1 text-green-500" />{" "}
                        Snapshot
                      </div>
                    </div>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>

                <div className="bg-[#E3F5FF] drop-shadow-sm shadow-gray-50 border-0 hover:-translate-y-1 hover:shadow-md transition rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm">
                        {t("subProjectDetails.totalUniqueBeneficiariesCard")}
                      </div>
                      <div className="text-2xl">
                        {seriesState.loading
                          ? "…"
                          : Number(
                              seriesSummary?.totalUniqueBeneficiaries || 0
                            ).toLocaleString()}
                      </div>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <TrendingDown className="h-3 w-3 mr-1 text-red-500" />{" "}
                        Snapshot
                      </div>
                    </div>
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </div>

              {/* Recent Updates and Objectives */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="flex bg-[#E5ECF6] border-0 drop-shadow-sm shadow-gray-50">
                  <CardContent className="p-6 ">
                    <h4 className="mb-3">
                      {t("subProjectDetails.recentUpdates")}
                    </h4>

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
                                <div className="font-medium">
                                  {report.title}
                                </div>
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
        )}

        <TabsContent value="forms" className="pt-6">
          <SubProjectForms subProjectId={subprojectId || ""} />
        </TabsContent>

        {hasFullAccess && (
          <TabsContent value="activities" className="pt-6">
            <SubProjectActivities subProjectId={subprojectId || ""} />
          </TabsContent>
        )}

        {hasFullAccess && (
          <TabsContent value="services" className="pt-6">
            <SubProjectServices subProjectId={subprojectId || ""} />
          </TabsContent>
        )}

        {hasFullAccess && (
          <TabsContent value="beneficiaries" className="pt-6">
            {subBeneficiariesLoading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                {t("subProjectDetails.loadingBeneficiaries")}
              </div>
            )}
            {subBeneficiariesError && !subBeneficiariesLoading && (
              <div className="text-sm text-red-600">
                {subBeneficiariesError}
              </div>
            )}
            {!subBeneficiariesLoading && !subBeneficiariesError && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-medium">
                    {t("subProjectDetails.beneficiariesLabel")} (
                    {subBeneficiariesMeta.totalItems})
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
                        {t("subProjectDetails.addBeneficiary")}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[550px] max-h-[85vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>
                          {t("subProjectDetails.addBeneficiaryTitle")}
                        </DialogTitle>
                        <DialogDescription>
                          {t("subProjectDetails.addBeneficiaryDesc")}
                        </DialogDescription>
                      </DialogHeader>

                      <Tabs
                        value={addBeneficiaryTab}
                        onValueChange={(v) =>
                          setAddBeneficiaryTab(v as "new" | "existing")
                        }
                      >
                        <TabsList className="mb-4 bg-[#E0F2FE] ">
                          <TabsTrigger
                            value="new"
                            className="data-[state=active]:bg-[#0073e6]  data-[state=active]:text-white"
                          >
                            {t("subProjectDetails.createNew")}
                          </TabsTrigger>
                          <TabsTrigger
                            value="existing"
                            className="data-[state=active]:bg-[#0073e6]  data-[state=active]:text-white"
                          >
                            {t("subProjectDetails.addExisting")}
                          </TabsTrigger>
                        </TabsList>

                        <TabsContent value="new" className="m-0 p-0">
                          <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="firstName" className="text-right">
                                {t("subProjectDetails.firstName")}
                              </Label>
                              <Input
                                id="firstName"
                                className="col-span-3"
                                placeholder={t(
                                  "subProjectDetails.enterFirstName"
                                )}
                                value={form.firstName}
                                onChange={(e) =>
                                  setForm({
                                    ...form,
                                    firstName: e.target.value,
                                  })
                                }
                              />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="lastName" className="text-right">
                                {t("subProjectDetails.lastName")}
                              </Label>
                              <Input
                                id="lastName"
                                className="col-span-3"
                                placeholder={t(
                                  "subProjectDetails.enterLastName"
                                )}
                                value={form.lastName}
                                onChange={(e) =>
                                  setForm({ ...form, lastName: e.target.value })
                                }
                              />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label className="text-right">
                                {t("subProjectDetails.gender")}
                              </Label>
                              <RadioGroup
                                className="col-span-3 flex gap-4"
                                value={form.gender}
                                onValueChange={(val) =>
                                  setForm({ ...form, gender: val })
                                }
                              >
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="female" id="female" />
                                  <Label htmlFor="female">
                                    {t("subProjectDetails.female")}
                                  </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="male" id="male" />
                                  <Label htmlFor="male">
                                    {t("subProjectDetails.male")}
                                  </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="other" id="other" />
                                  <Label htmlFor="other">
                                    {t("subProjectDetails.other")}
                                  </Label>
                                </div>
                              </RadioGroup>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="dob" className="text-right">
                                {t("subProjectDetails.dateOfBirth")}
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
                              <Label
                                htmlFor="nationalId"
                                className="text-right"
                              >
                                {t("subProjectDetails.nationalId")}
                              </Label>
                              <Input
                                id="nationalId"
                                className="col-span-3"
                                placeholder={t(
                                  "subProjectDetails.enterNationalId"
                                )}
                                value={form.nationalId}
                                onChange={(e) =>
                                  setForm({
                                    ...form,
                                    nationalId: e.target.value,
                                  })
                                }
                              />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="phone" className="text-right">
                                {t("subProjectDetails.phone")}
                              </Label>
                              <Input
                                id="phone"
                                className="col-span-3"
                                placeholder={t(
                                  "subProjectDetails.enterPhoneNumber"
                                )}
                                value={form.phone}
                                onChange={(e) =>
                                  setForm({ ...form, phone: e.target.value })
                                }
                              />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="email" className="text-right">
                                {t("subProjectDetails.email")}
                              </Label>
                              <Input
                                id="email"
                                type="email"
                                className="col-span-3"
                                placeholder={t("subProjectDetails.enterEmail")}
                                value={form.email}
                                onChange={(e) =>
                                  setForm({ ...form, email: e.target.value })
                                }
                              />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="address" className="text-right">
                                {t("subProjectDetails.address")}
                              </Label>
                              <Input
                                id="address"
                                className="col-span-3"
                                placeholder={t(
                                  "subProjectDetails.enterAddress"
                                )}
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
                                {t("subProjectDetails.municipality")}
                              </Label>
                              <Input
                                id="municipality"
                                className="col-span-3"
                                placeholder={t(
                                  "subProjectDetails.enterMunicipality"
                                )}
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
                              <Label htmlFor="ethnicity" className="text-right">
                                {t("subProjectDetails.ethnicity")}
                              </Label>
                              <Select
                                value={ethnicity}
                                onValueChange={setEthnicity}
                              >
                                <SelectTrigger className="col-span-3">
                                  <SelectValue
                                    placeholder={t(
                                      "subProjectDetails.selectEthnicity"
                                    )}
                                  />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Shqiptar">
                                    Shqiptar
                                  </SelectItem>
                                  <SelectItem value="Serb">Serb</SelectItem>
                                  <SelectItem value="Boshnjak">
                                    Boshnjak
                                  </SelectItem>
                                  <SelectItem value="Turk">Turk</SelectItem>
                                  <SelectItem value="Ashkali">
                                    Ashkali
                                  </SelectItem>
                                  <SelectItem value="Rom">Rom</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label className="text-right">
                                {t("subProjectDetails.residence")}
                              </Label>
                              <RadioGroup
                                className="col-span-3 flex gap-6"
                                value={isUrban ? "urban" : "rural"}
                                onValueChange={(val) =>
                                  setIsUrban(val === "urban")
                                }
                              >
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem
                                    value="rural"
                                    id="residence-rural"
                                  />
                                  <Label htmlFor="residence-rural">
                                    {t("subProjectDetails.rural")}
                                  </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem
                                    value="urban"
                                    id="residence-urban"
                                  />
                                  <Label htmlFor="residence-urban">
                                    {t("subProjectDetails.urban")}
                                  </Label>
                                </div>
                              </RadioGroup>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label
                                htmlFor="householdMembers"
                                className="text-right"
                              >
                                {t("subProjectDetails.householdMembers")}
                              </Label>
                              <Input
                                id="householdMembers"
                                type="number"
                                min={0}
                                step={1}
                                className="col-span-3"
                                placeholder={t(
                                  "subProjectDetails.enterHouseholdMembers"
                                )}
                                value={householdMembers}
                                onChange={(e) =>
                                  setHouseholdMembers(e.target.value)
                                }
                              />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="status" className="text-right">
                                {t("subProjectDetails.status")}
                              </Label>
                              <Select
                                value={form.status}
                                onValueChange={(val) =>
                                  setForm({ ...form, status: val })
                                }
                              >
                                <SelectTrigger className="col-span-3">
                                  <SelectValue
                                    placeholder={t(
                                      "subProjectDetails.selectStatus"
                                    )}
                                  />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="active">
                                    {t("subProjectDetails.active")}
                                  </SelectItem>
                                  <SelectItem value="inactive">
                                    {t("subProjectDetails.inactive")}
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="border-t pt-2 mt-2">
                              <div className="text-sm font-medium mb-2">
                                {t("subProjectDetails.additionalDetails")}
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4 mb-2">
                                <Label
                                  htmlFor="allergies"
                                  className="text-right"
                                >
                                  {t("subProjectDetails.allergies")}
                                </Label>
                                <div className="col-span-3 space-y-2">
                                  <div className="flex gap-2">
                                    <Input
                                      id="allergies"
                                      placeholder={t(
                                        "subProjectDetails.typeAndPressEnter"
                                      )}
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
                                      className="hover:bg-[#E0F2FE] border-0"
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
                                      <Plus className="h-4 w-4 mr-1" />{" "}
                                      {t("subProjectDetails.add")}
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
                                  {t("subProjectDetails.disabilities")}
                                </Label>
                                <div className="col-span-3 space-y-2">
                                  <div className="flex gap-2">
                                    <Input
                                      id="disabilities"
                                      placeholder={t(
                                        "subProjectDetails.typeAndPressEnter"
                                      )}
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
                                      className="hover:bg-[#E0F2FE] border-0"
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
                                      <Plus className="h-4 w-4 mr-1" />{" "}
                                      {t("subProjectDetails.add")}
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
                                  {t("subProjectDetails.chronicConditions")}
                                </Label>
                                <div className="col-span-3 space-y-2">
                                  <div className="flex gap-2">
                                    <Input
                                      id="chronicConditions"
                                      placeholder={t(
                                        "subProjectDetails.typeAndPressEnter"
                                      )}
                                      value={chronicConditionsInput}
                                      onChange={(e) =>
                                        setChronicConditionsInput(
                                          e.target.value
                                        )
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
                                      className="hover:bg-[#E0F2FE] border-0"
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
                                      <Plus className="h-4 w-4 mr-1" />{" "}
                                      {t("subProjectDetails.add")}
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
                                  {t("subProjectDetails.medications")}
                                </Label>
                                <div className="col-span-3 space-y-2">
                                  <div className="flex gap-2">
                                    <Input
                                      id="medications"
                                      placeholder={t(
                                        "subProjectDetails.typeAndPressEnter"
                                      )}
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
                                      className="hover:bg-[#E0F2FE] border-0"
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
                                      <Plus className="h-4 w-4 mr-1" />{" "}
                                      {t("subProjectDetails.add")}
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
                                <Label
                                  htmlFor="bloodType"
                                  className="text-right"
                                >
                                  {t("subProjectDetails.bloodType")}
                                </Label>
                                <Input
                                  id="bloodType"
                                  className="col-span-3"
                                  placeholder={t(
                                    "subProjectDetails.bloodTypePlaceholder"
                                  )}
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
                                  {t("subProjectDetails.notes")}
                                </Label>
                                <textarea
                                  id="notes"
                                  className="col-span-3 bg-white border border-input rounded-md p-2 min-h-[70px]"
                                  placeholder={t(
                                    "subProjectDetails.notesPlaceholder"
                                  )}
                                  value={notesInput}
                                  onChange={(e) =>
                                    setNotesInput(e.target.value)
                                  }
                                />
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
                              <Label className="text-right">
                                {t("subProjectDetails.beneficiaryRequired")}
                              </Label>
                              <div className="col-span-3">
                                {listLoading ? (
                                  <div className="text-sm text-muted-foreground">
                                    {t(
                                      "subProjectDetails.loadingBeneficiaries"
                                    )}
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
                                      <SelectValue
                                        placeholder={t(
                                          "subProjectDetails.selectBeneficiary"
                                        )}
                                      />
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
                          className="bg-[#E0F2FE] border-0"
                          variant="outline"
                          onClick={() => setIsAddDialogOpen(false)}
                        >
                          {t("subProjectDetails.cancel")}
                        </Button>
                        {addBeneficiaryTab === "new" ? (
                          <Button
                            className="bg-[#0073e6] border-0 text-white"
                            onClick={handleCreateSubmit}
                            disabled={createLoading}
                          >
                            {createLoading
                              ? t("subProjectDetails.saving")
                              : t("subProjectDetails.save")}
                          </Button>
                        ) : (
                          <Button
                            className="bg-[#0073e6] border-0 text-white"
                            onClick={handleAssociateExistingSubmit}
                            disabled={
                              associateLoading ||
                              !associateSelectedBeneficiaryId
                            }
                          >
                            {associateLoading
                              ? t("subProjectDetails.associating")
                              : t("subProjectDetails.associate")}
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
                      <TableHead className="w-[250px]">
                        {t("subProjectDetails.beneficiaryColumn")}
                      </TableHead>
                      <TableHead>{t("subProjectDetails.genderDob")}</TableHead>
                      <TableHead>{t("subProjectDetails.status")}</TableHead>
                      <TableHead>
                        {t("subProjectDetails.municipalityNationality")}
                      </TableHead>
                      <TableHead>{t("subProjectDetails.contact")}</TableHead>
                      <TableHead>
                        {t("subProjectDetails.registration")}
                      </TableHead>
                      <TableHead className="text-right">
                        {t("subProjectDetails.actions")}
                      </TableHead>
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
                                ? {
                                    backgroundColor: "#DEF8EE",
                                    color: "#4AA785",
                                  }
                                : r.status === "pending"
                                ? {
                                    backgroundColor: "#E2F5FF",
                                    color: "#59A8D4",
                                  }
                                : {
                                    backgroundColor: "rgba(28,28,28,0.05)",
                                    color: "rgba(28,28,28,0.4)",
                                  }
                            }
                          >
                            {r.status === "active"
                              ? t("subProjectDetails.active")
                              : r.status === "pending"
                              ? t("subProjectDetails.pending")
                              : t("subProjectDetails.inactive")}
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
                            className="hover:bg-[#E0F2FE] border-0"
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/beneficiaries/${r.id}`)}
                          >
                            {t("subProjectDetails.view")}
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
                          {t("subProjectDetails.noBeneficiariesFound")}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
        )}

        {hasFullAccess && (
          <TabsContent value="team" className="pt-6">
            <SubProjectTeam
              subProjectId={subprojectId || ""}
              hasFullAccess={hasFullAccess}
            />
          </TabsContent>
        )}

        {hasFullAccess && (
          <TabsContent value="reports" className="pt-6">
            <SubProjectReports subProjectId={subprojectId || ""} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
