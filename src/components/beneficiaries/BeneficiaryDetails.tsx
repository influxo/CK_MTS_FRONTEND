import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  Clock,
  Download,
  Edit,
  Eye,
  FileEdit,
  Link,
  MapPin,
  MoreHorizontal,
  Phone,
  Shield,
  ShieldAlert,
  Trash,
  Users,
  User,
  Home,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import type { AppDispatch } from "../../store";
import {
  fetchBeneficiaryById,
  selectBeneficiaryDetail,
  selectBeneficiaryDetailError,
  selectBeneficiaryDetailLoading,
  updateBeneficiaryById,
  selectBeneficiaryUpdateLoading,
  selectBeneficiaryUpdateError,
  selectBeneficiaryUpdateSuccessMessage,
  clearBeneficiaryUpdate,
  fetchBeneficiaryServices,
  selectBeneficiaryServices,
  selectBeneficiaryServicesLoading,
  selectBeneficiaryServicesError,
  selectBeneficiaryServicesMeta,
  fetchBeneficiaryEntities,
  selectBeneficiaryEntities,
  selectBeneficiaryEntitiesLoading,
  selectBeneficiaryEntitiesError,
  removeBeneficiaryEntityAssociation,
  fetchServiceDeliveriesSummary,
  selectServiceDeliveriesSummary,
  selectServiceDeliveriesSummaryLoading,
  selectServiceDeliveriesSummaryError,
} from "../../store/slices/beneficiarySlice";
import type { UpdateBeneficiaryRequest } from "../../services/beneficiaries/beneficiaryModels";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/data-display/avatar";
import { Badge } from "../ui/data-display/badge";
import { Button } from "../ui/button/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../ui/data-display/card";
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../ui/navigation/tabs";
import { Textarea } from "../ui/form/textarea";
import { selectCurrentUser } from "../../store/slices/authSlice";
import { useTranslation } from "../../hooks/useTranslation";

interface BeneficiaryDetailsProps {
  onBack?: () => void;
}

type FamilyMember = {
  name: string;
  relationship: string;
  age: number;
  id?: string;
};

type BeneficiaryVM = {
  id: string;
  name: string;
  pseudoId: string;
  gender: string;
  age?: number;
  dateOfBirth: string;
  location: string;
  contactNumber: string;
  status: string;
  registrationDate: string;
  tags: string[];
  projects: string[];
  subProjects: string[];
  lastService: string;
  serviceCount: number;
  vulnerabilityScore: string;
  household?: string;
  avatar?: string;
  initials: string;
  notes?: string;
  registeredBy?: string;
  associatedFamily: FamilyMember[];
};

// Services are fetched from API; remove mocks

// Mock projects for association
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

export function BeneficiaryDetails({ onBack }: BeneficiaryDetailsProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddServiceDialogOpen, setIsAddServiceDialogOpen] = useState(false);
  const [isAssociateDialogOpen, setIsAssociateDialogOpen] = useState(false);
  const [isRemoveAssocOpen, setIsRemoveAssocOpen] = useState(false);
  const [selectedAssociation, setSelectedAssociation] = useState<{
    entityId: string;
    entityType: string;
  } | null>(null);
  const [editForm, setEditForm] = useState<UpdateBeneficiaryRequest>({
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
  const [localValidationError, setLocalValidationError] = useState<
    string | null
  >(null);

  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const detail = useSelector(selectBeneficiaryDetail);
  const detailLoading = useSelector(selectBeneficiaryDetailLoading);
  const detailError = useSelector(selectBeneficiaryDetailError);
  const updateLoading = useSelector(selectBeneficiaryUpdateLoading);
  const updateError = useSelector(selectBeneficiaryUpdateError);
  const updateSuccess = useSelector(selectBeneficiaryUpdateSuccessMessage);
  const services = useSelector(selectBeneficiaryServices);
  const servicesLoading = useSelector(selectBeneficiaryServicesLoading);
  const servicesError = useSelector(selectBeneficiaryServicesError);
  const servicesMeta = useSelector(selectBeneficiaryServicesMeta);
  const entities = useSelector(selectBeneficiaryEntities);
  const entitiesLoading = useSelector(selectBeneficiaryEntitiesLoading);
  const entitiesError = useSelector(selectBeneficiaryEntitiesError);
  const deliveriesSummary = useSelector(selectServiceDeliveriesSummary);
  const deliveriesSummaryLoading = useSelector(
    selectServiceDeliveriesSummaryLoading
  );
  const deliveriesSummaryError = useSelector(
    selectServiceDeliveriesSummaryError
  );

  const user = useSelector(selectCurrentUser);

  // Determine role
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

  useEffect(() => {
    if (id) {
      dispatch(fetchBeneficiaryById(id));
      // Preload first page of services for overview widgets
      dispatch(fetchBeneficiaryServices({ id, page: 1, limit: 20 }));
      // Load associated entities for overview
      dispatch(fetchBeneficiaryEntities({ id }));
      // Load service deliveries summary metrics
      dispatch(fetchServiceDeliveriesSummary({ beneficiaryId: id }));
    }
  }, [dispatch, id]);

  // Initialize edit form from detail when dialog opens or detail changes
  useEffect(() => {
    if (!detail) return;
    const pii: any = (detail as any).pii || {};
    setEditForm({
      firstName: pii.firstName || "",
      lastName: pii.lastName || "",
      dob: (pii.dob || "").slice(0, 10),
      nationalId: pii.nationalId || "",
      phone: pii.phone || "",
      email: pii.email || "",
      address: pii.address || "",
      gender: pii.gender || "female",
      municipality: pii.municipality || "",
      nationality: pii.nationality || "",
      status: detail.status || "active",
    });
  }, [detail, isEditDialogOpen]);

  // Close and refresh on successful update
  useEffect(() => {
    if (updateSuccess && id) {
      setIsEditDialogOpen(false);
      dispatch(fetchBeneficiaryById(id));
      // Clear update state after a short tick
      const t = setTimeout(() => dispatch(clearBeneficiaryUpdate()), 0);
      return () => clearTimeout(t);
    }
  }, [updateSuccess, id, dispatch]);

  // Ensure services are refreshed when Services tab becomes active
  // useEffect(() => {
  //   if (activeTab === "services" && id) {
  //     dispatch(
  //       fetchBeneficiaryServices({
  //         id,
  //         page: servicesMeta.page || 1,
  //         limit: servicesMeta.limit || 20,
  //       })
  //     );
  //   }
  // }, [activeTab, id, dispatch]);

  const handleEditInput = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id: fieldId, value } = e.target as HTMLInputElement;
    setEditForm(
      (prev) => ({ ...prev, [fieldId]: value } as UpdateBeneficiaryRequest)
    );
  };

  const handleEditSubmit = () => {
    setLocalValidationError(null);
    if (!editForm.firstName.trim() || !editForm.lastName.trim()) {
      setLocalValidationError(t("beneficiaryDetails.validationError"));
      return;
    }
    if (!id) return;
    dispatch(updateBeneficiaryById({ id, data: editForm }));
  };

  const beneficiary = useMemo<BeneficiaryVM | null>(() => {
    if (!detail) return null;
    const pii: any = (detail as any).pii || {};
    const firstName: string = pii.firstName || "";
    const lastName: string = pii.lastName || "";
    const fullName =
      `${firstName} ${lastName}`.trim() || detail.pseudonym || detail.id;
    const initials =
      ("" + (firstName?.[0] || "") + (lastName?.[0] || "")).toUpperCase() ||
      detail.pseudonym?.slice(0, 2) ||
      "BN";
    const location = pii.address || pii.municipality || "";
    const contactNumber = pii.phone || "";
    const vm: BeneficiaryVM = {
      id: detail.id,
      name: fullName,
      pseudoId: detail.pseudonym,
      gender: pii.gender || "",
      age: undefined as number | undefined,
      dateOfBirth: pii.dob || "",
      location,
      contactNumber,
      status: detail.status,
      registrationDate: detail.createdAt,
      tags: [],
      projects: [],
      subProjects: [],
      lastService: "",
      serviceCount: 0,
      vulnerabilityScore: "",
      household: "",
      avatar: "",
      initials,
      notes: "",
      registeredBy: "",
      associatedFamily: [],
    };
    return vm;
  }, [detail]);

  if (detailLoading) {
    return (
      <div className="p-4 text-sm text-muted-foreground">
        {t("beneficiaryDetails.loadingBeneficiary")}
      </div>
    );
  }
  if (detailError) {
    return <div className="p-4 text-sm text-red-600">{detailError}</div>;
  }
  if (!beneficiary) {
    return <div>{t("beneficiaryDetails.beneficiaryNotFound")}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
        <Button
          className="w-full sm:w-auto hover:bg-[#E0F2FE] border-0 transition-transform duration-200 ease-in-out hover:scale-105 hover:-translate-y-[1px]"
          variant="outline"
          size="sm"
          onClick={onBack ?? (() => navigate("/beneficiaries"))}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          {t("beneficiaryDetails.backToBeneficiaries")}
        </Button>

        <h2 className="truncate w-full sm:w-auto">{beneficiary.name}</h2>
        <Dialog
          open={isEditDialogOpen}
          onOpenChange={(open) => {
            setIsEditDialogOpen(open);
            if (!open) {
              setLocalValidationError(null);
              dispatch(clearBeneficiaryUpdate());
            }
          }}
        >
          <DialogTrigger asChild>
            <Button className="bg-[#0073e6] transition-transform duration-200 ease-in-out hover:scale-105 hover:-translate-y-[1px] text-white sm:ml-auto w-full sm:w-auto">
              <Edit className="h-4 w-4 mr-2" />
              {t("beneficiaryDetails.editProfile")}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>
                {t("beneficiaryDetails.editBeneficiary")}
              </DialogTitle>
              <DialogDescription>
                {t("beneficiaryDetails.updateInformation")}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-3 sm:gap-4 py-4">
              {localValidationError && (
                <div className="col-span-4 text-sm text-red-600">
                  {localValidationError}
                </div>
              )}
              {updateError && (
                <div className="col-span-4 text-sm text-red-600">
                  {updateError}
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-4 items-start gap-2 sm:gap-4">
                <Label htmlFor="firstName" className="sm:text-right text-left">
                  {t("beneficiaryDetails.firstNameRequired")}
                </Label>
                <Input
                  id="firstName"
                  className="col-span-1 sm:col-span-3"
                  value={editForm.firstName}
                  onChange={handleEditInput}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 items-start gap-2 sm:gap-4">
                <Label htmlFor="lastName" className="sm:text-right text-left">
                  {t("beneficiaryDetails.lastNameRequired")}
                </Label>
                <Input
                  id="lastName"
                  className="col-span-1 sm:col-span-3"
                  value={editForm.lastName}
                  onChange={handleEditInput}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 items-start gap-2 sm:gap-4">
                <Label htmlFor="dob" className="sm:text-right text-left">
                  {t("beneficiaryDetails.dateOfBirthRequired")}
                </Label>
                <Input
                  id="dob"
                  type="date"
                  className="col-span-1 sm:col-span-3"
                  value={editForm.dob}
                  onChange={handleEditInput}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 items-start gap-2 sm:gap-4">
                <Label htmlFor="nationalId" className="sm:text-right text-left">
                  {t("beneficiaryDetails.nationalId")}
                </Label>
                <Input
                  id="nationalId"
                  className="col-span-1 sm:col-span-3"
                  value={editForm.nationalId}
                  onChange={handleEditInput}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 items-start gap-2 sm:gap-4">
                <Label htmlFor="phone" className="sm:text-right text-left">
                  {t("beneficiaryDetails.phone")}
                </Label>
                <Input
                  id="phone"
                  className="col-span-1 sm:col-span-3"
                  value={editForm.phone}
                  onChange={handleEditInput}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 items-start gap-2 sm:gap-4">
                <Label htmlFor="email" className="sm:text-right text-left">
                  {t("beneficiaryDetails.email")}
                </Label>
                <Input
                  id="email"
                  className="col-span-1 sm:col-span-3"
                  type="email"
                  value={editForm.email}
                  onChange={handleEditInput}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 items-start gap-2 sm:gap-4">
                <Label htmlFor="address" className="sm:text-right text-left">
                  {t("beneficiaryDetails.address")}
                </Label>
                <Input
                  id="address"
                  className="col-span-1 sm:col-span-3"
                  value={editForm.address}
                  onChange={handleEditInput}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 items-start gap-2 sm:gap-4">
                <Label className="sm:text-right text-left">
                  {" "}
                  {t("beneficiaryDetails.genderRequired")}
                </Label>
                <RadioGroup
                  className="col-span-1 sm:col-span-3 flex flex-wrap gap-3"
                  value={editForm.gender}
                  onValueChange={(v) =>
                    setEditForm((p) => ({ ...p, gender: v }))
                  }
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="female" id="female" />
                    <Label htmlFor="female">
                      {t("beneficiaryDetails.female")}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="male" id="male" />
                    <Label htmlFor="male">{t("beneficiaryDetails.male")}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="other" id="other" />
                    <Label htmlFor="other">
                      {t("beneficiaryDetails.other")}
                    </Label>
                  </div>
                </RadioGroup>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 items-start gap-2 sm:gap-4">
                <Label
                  htmlFor="municipality"
                  className="sm:text-right text-left"
                >
                  {t("beneficiaryDetails.municipality")}
                </Label>
                <Input
                  id="municipality"
                  className="col-span-1 sm:col-span-3"
                  value={editForm.municipality}
                  onChange={handleEditInput}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 items-start gap-2 sm:gap-4">
                <Label
                  htmlFor="nationality"
                  className="sm:text-right text-left"
                >
                  {t("beneficiaryDetails.nationality")}
                </Label>
                <Input
                  id="nationality"
                  className="col-span-1 sm:col-span-3"
                  value={editForm.nationality}
                  onChange={handleEditInput}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 items-start gap-2 sm:gap-4">
                <Label htmlFor="status" className="sm:text-right text-left">
                  {t("beneficiaryDetails.statusRequired")}
                </Label>
                <Select
                  value={editForm.status}
                  onValueChange={(v) =>
                    setEditForm((p) => ({ ...p, status: v }))
                  }
                >
                  <SelectTrigger className="col-span-1 sm:col-span-3">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">
                      {t("beneficiaryDetails.active")}
                    </SelectItem>
                    <SelectItem value="inactive">
                      {t("beneficiaryDetails.inactive")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <div className="flex items-center mr-auto">
                <ShieldAlert className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  {t("beneficiaryDetails.personalDataPseudonymized")}
                </span>
              </div>
              <Button
                className="bg-[#E0F2FE] border-0 w-full sm:w-auto"
                variant="outline"
                onClick={() => {
                  setIsEditDialogOpen(false);
                  setLocalValidationError(null);
                  dispatch(clearBeneficiaryUpdate());
                }}
              >
                {t("beneficiaryDetails.cancel")}
              </Button>
              <Button
                className="bg-[#0073e6] text-white w-full sm:w-auto"
                onClick={handleEditSubmit}
                disabled={updateLoading}
              >
                {updateLoading
                  ? t("beneficiaryDetails.saving")
                  : t("beneficiaryDetails.saveChanges")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isRemoveAssocOpen} onOpenChange={setIsRemoveAssocOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="bg-[#0073e6] text-white transition-transform duration-200 ease-in-out hover:scale-105 hover:-translate-y-[1px] w-full sm:w-auto"
            >
              <Link className="h-4 w-4 mr-2" />
              {t("beneficiaryDetails.removeAssociation")}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[520px]">
            <DialogHeader>
              <DialogTitle>
                {t("beneficiaryDetails.removeAssociation")}
              </DialogTitle>
              <DialogDescription>
                {t("beneficiaryDetails.selectEntityToRemove")}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-3 py-2">
              {entitiesLoading && (
                <div className="text-sm text-muted-foreground">
                  {t("beneficiaryDetails.loadingAssociations")}
                </div>
              )}
              {entitiesError && !entitiesLoading && (
                <div className="text-sm text-red-600">{entitiesError}</div>
              )}
              {!entitiesLoading && !entitiesError && entities.length === 0 && (
                <div className="text-sm text-muted-foreground">
                  {t("beneficiaryDetails.noAssociationsFound")}
                </div>
              )}
              {!entitiesLoading && !entitiesError && entities.length > 0 && (
                <div className="space-y-2">
                  {entities.map((link) => (
                    <label
                      key={`${link.entity.id}`}
                      className="flex items-center gap-3 rounded-md border p-2 bg-[#F7F9FB]"
                    >
                      <input
                        type="radio"
                        name="assoc-select"
                        className="h-4 w-4"
                        checked={
                          selectedAssociation?.entityId === link.entity.id &&
                          selectedAssociation?.entityType === link.entity.type
                        }
                        onChange={() =>
                          setSelectedAssociation({
                            entityId: link.entity.id,
                            entityType: link.entity.type,
                          })
                        }
                      />
                      <div className="flex-1">
                        <div className="text-sm font-medium">
                          {link.entity.name}
                        </div>
                        <div className="text-xs text-muted-foreground uppercase">
                          {link.entity.type}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                className="bg-[#E0F2FE] border-0 w-full sm:w-auto"
                variant="outline"
                onClick={() => setIsRemoveAssocOpen(false)}
              >
                {t("beneficiaryDetails.cancel")}
              </Button>
              <Button
                className="bg-[#0073e6] text-white w-full sm:w-auto"
                disabled={!selectedAssociation || !id}
                onClick={async () => {
                  if (!id || !selectedAssociation) return;
                  try {
                    await dispatch(
                      removeBeneficiaryEntityAssociation({
                        id,
                        entityId: selectedAssociation.entityId,
                        entityType: selectedAssociation.entityType,
                      }) as any
                    ).unwrap();
                    setIsRemoveAssocOpen(false);
                    setSelectedAssociation(null);
                    // refresh entities
                    dispatch(fetchBeneficiaryEntities({ id }));
                  } catch (_) {}
                }}
              >
                {t("beneficiaryDetails.remove")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog
          open={isAssociateDialogOpen}
          onOpenChange={setIsAssociateDialogOpen}
        >
          {/* <DialogTrigger asChild>
            <Button variant="outline" className="bg-[#2E343E] text-white">
              <Link className="h-4 w-4 mr-2" />
              Associate
            </Button>
          </DialogTrigger> */}
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Associate Beneficiary</DialogTitle>
              <DialogDescription>
                Link this beneficiary to projects and sub-projects.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="project" className="text-right">
                  Project
                </Label>
                <Select>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockProjects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="subproject" className="text-right">
                  Sub-Project
                </Label>
                <Select>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select sub-project" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockProjects.flatMap((project) =>
                      project.subProjects.map((subProject) => (
                        <SelectItem key={subProject.id} value={subProject.id}>
                          {subProject.title}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-4">
                <div className="text-sm font-medium mb-2">
                  Current Associations
                </div>
                <div className="space-y-2">
                  {beneficiary.projects.map((project, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 rounded border"
                    >
                      <div>
                        <div className="font-medium">{project}</div>
                        <div className="text-sm text-muted-foreground">
                          {beneficiary.subProjects[index] || "No sub-project"}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsAssociateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={() => setIsAssociateDialogOpen(false)}>
                Add Association
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog
          open={isAddServiceDialogOpen}
          onOpenChange={setIsAddServiceDialogOpen}
        >
          {/* <DialogTrigger asChild>
            <Button variant="outline" className="bg-[#2E343E] text-white">
              <Plus className="h-4 w-4 mr-2 " />
              Record Service
            </Button>
          </DialogTrigger> */}
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Record New Service</DialogTitle>
              <DialogDescription>
                Add a new service provided to this beneficiary.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 sm:grid-cols-4 items-start gap-2 sm:gap-4">
                <Label
                  htmlFor="service-date"
                  className="sm:text-right text-left"
                >
                  Date *
                </Label>
                <Input
                  id="service-date"
                  type="date"
                  className="col-span-1 sm:col-span-3"
                  defaultValue={new Date().toISOString().split("T")[0]}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 items-start gap-2 sm:gap-4">
                <Label
                  htmlFor="service-type"
                  className="sm:text-right text-left"
                >
                  Type *
                </Label>
                <Select>
                  <SelectTrigger className="col-span-1 sm:col-span-3">
                    <SelectValue placeholder="Select service type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="health-checkup">
                      Health Check-up
                    </SelectItem>
                    <SelectItem value="training">Training</SelectItem>
                    <SelectItem value="distribution">Distribution</SelectItem>
                    <SelectItem value="counseling">Counseling</SelectItem>
                    <SelectItem value="referral">Referral</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 items-start gap-2 sm:gap-4">
                <Label
                  htmlFor="service-description"
                  className="sm:text-right text-left"
                >
                  Description *
                </Label>
                <Input
                  id="service-description"
                  className="col-span-1 sm:col-span-3"
                  placeholder="Brief description of the service"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 items-start gap-2 sm:gap-4">
                <Label
                  htmlFor="service-provider"
                  className="sm:text-right text-left"
                >
                  Provider *
                </Label>
                <Input
                  id="service-provider"
                  className="col-span-1 sm:col-span-3"
                  placeholder="Name of person or team providing the service"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 items-start gap-2 sm:gap-4">
                <Label
                  htmlFor="service-location"
                  className="sm:text-right text-left"
                >
                  Location
                </Label>
                <Input
                  id="service-location"
                  className="col-span-1 sm:col-span-3"
                  placeholder="Where the service was provided"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 items-start gap-2 sm:gap-4">
                <Label
                  htmlFor="service-subproject"
                  className="sm:text-right text-left"
                >
                  Sub-Project
                </Label>
                <Select>
                  <SelectTrigger className="col-span-1 sm:col-span-3">
                    <SelectValue placeholder="Select sub-project" />
                  </SelectTrigger>
                  <SelectContent>
                    {beneficiary.subProjects.map((subProject, index) => (
                      <SelectItem key={index} value={subProject}>
                        {subProject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 items-start gap-2 sm:gap-4">
                <Label
                  htmlFor="service-notes"
                  className="sm:text-right text-left pt-2"
                >
                  Notes
                </Label>
                <Textarea
                  id="service-notes"
                  className="col-span-1 sm:col-span-3"
                  rows={3}
                  placeholder="Additional notes about the service provided"
                />
              </div>
            </div>
            {/* <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsAddServiceDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={() => setIsAddServiceDialogOpen(false)}>
                Record Service
              </Button>
            </DialogFooter> */}
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-[#F7F9FB] drop-shadow-sm shadow-gray-50 border-0 w-full max-w-4xl mx-auto">
        <CardContent className="p-6">
          <div className="mx-auto max-w-4xl grid grid-cols-1 sm:grid-cols-5 gap-4 md:gap-6 items-start">
            <div className="sm:col-span-1 flex justify-center sm:justify-start">
              <Avatar className="h-16 w-16">
                <AvatarImage src={beneficiary.avatar} alt={beneficiary.name} />
                <AvatarFallback>{beneficiary.initials}</AvatarFallback>
              </Avatar>
            </div>
            <div className="sm:col-span-4 space-y-2">
              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="font-medium text-2xl md:text-3xl break-words">
                    {beneficiary.name}
                  </h1>
                  <Badge
                    style={{ backgroundColor: "#DEF8EE", color: "#4AA785" }}
                    variant={
                      beneficiary.status === "active" ? "default" : "secondary"
                    }
                  >
                    {beneficiary.status}
                  </Badge>
                  <div className="flex flex-wrap gap-1.5">
                    {beneficiary.tags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag.replace("-", " ")}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <ShieldAlert className="h-3.5 w-3.5" />
                  <span>{beneficiary.pseudoId}</span>
                  <span className="text-xs">(Pseudonymized ID)</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                  <span>{beneficiary.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>{beneficiary.contactNumber}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>
                    Registered on{" "}
                    {new Date(
                      beneficiary.registrationDate
                    ).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            <div className="sm:col-start-2 sm:col-span-4 flex flex-col items-start text-left gap-2">
              <div className="flex mt-2 md:mt-4 flex-col gap-2 items-start text-left">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {t("beneficiaryDetails.gender")}
                  </span>
                  <span className="text-lg font-medium">
                    {beneficiary.gender}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {t("beneficiaryDetails.age")}
                  </span>
                  <span className="ml-1">
                    {beneficiary.age} {t("beneficiaryDetails.years")}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Home className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {t("beneficiaryDetails.household")}
                  </span>
                  <span className="ml-1">{beneficiary.household}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <ShieldAlert className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {t("beneficiaryDetails.vulnerability")}
                  </span>
                  <span className="ml-1">{beneficiary.vulnerabilityScore}</span>
                </div>
              </div>
              <div className="text-sm text-muted-foreground text-[#6B7280]">
                Last updated: {new Date().toLocaleDateString()}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full bg-[#E3F5FF] pt-3 drop-shadow-sm shadow-gray-50   mt-4 h-auto">
          <div className="flex gap-4">
            <TabsTrigger
              value="overview"
              className={`rounded-none bg-transparent border-0 border-b-2 pb-3 hover:bg-transparent ${
                activeTab === "overview" ? "border-[#2E343E]" : ""
              }`}
            >
              {t("beneficiaryDetails.overview")}
            </TabsTrigger>
            <TabsTrigger
              value="services"
              className={`rounded-none bg-transparent border-0 border-b-2 pb-3 hover:bg-transparent ${
                activeTab === "services" ? "border-[#2E343E]" : ""
              }`}
            >
              {t("beneficiaryDetails.serviceHistory")}
            </TabsTrigger>
            <TabsTrigger
              value="info"
              className={`rounded-none bg-transparent border-0 border-b-2 pb-3 hover:bg-transparent ${
                activeTab === "info" ? "border-[#2E343E]" : ""
              }`}
            >
              {t("beneficiaryDetails.info")}
            </TabsTrigger>
          </div>
        </TabsList>

        <TabsContent value="overview" className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <Card className="bg-[#F7F9FB] drop-shadow-sm shadow-gray-50 border-0">
                <CardHeader>
                  <CardTitle className="text-base">
                    {t("beneficiaryDetails.beneficiarySummary")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div>
                    <h4 className="font-medium mb-2">
                      {t("beneficiaryDetails.about")}
                    </h4>
                    <div className="bg-white/60 rounded-md p-3 text-sm">
                      <p className="text-muted-foreground">
                        {beneficiary.notes ||
                          t("beneficiaryDetails.noAdditionalNotes")}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">
                      {t("beneficiaryDetails.currentProjects")}
                    </h4>
                    {entitiesLoading && (
                      <div className="text-sm text-muted-foreground">
                        {t("beneficiaryDetails.loadingAssociatedEntities")}
                      </div>
                    )}
                    {entitiesError && !entitiesLoading && (
                      <div className="text-sm text-red-600">
                        {entitiesError}
                      </div>
                    )}
                    {!entitiesLoading && !entitiesError && (
                      <div>
                        {entities.length > 0 ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {entities.map((link, index) => (
                              <div
                                key={`${link.entity.id}-${index}`}
                                className="rounded-md p-3 bg-[#E5ECF6] text-black"
                              >
                                <div className="flex items-center gap-2">
                                  <Users className="h-4 w-4 text-muted-foreground" />
                                  <div>
                                    <div className="text-xs text-muted-foreground uppercase tracking-wide">
                                      {link.entity.type}
                                    </div>
                                    <div className="font-medium leading-tight">
                                      {link.entity.name}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-sm text-muted-foreground">
                            {t("beneficiaryDetails.noAssociatedEntities")}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">
                      {t("beneficiaryDetails.registrationInformation")}
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2 bg-[#EDEDFF] rounded-md p-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="text-xs text-muted-foreground">
                            {t("beneficiaryDetails.registrationDate")}
                          </div>
                          <div className="font-medium">
                            {new Date(
                              beneficiary.registrationDate
                            ).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 bg-[#EDEDFF] rounded-md p-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="text-xs text-muted-foreground">
                            {t("beneficiaryDetails.registeredBy")}
                          </div>
                          <div className="font-medium">
                            {beneficiary.registeredBy}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 bg-[#EDEDFF] rounded-md p-2">
                        <Shield className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="text-xs text-muted-foreground">
                            {t("beneficiaryDetails.id")}
                          </div>
                          <div className="font-medium">{beneficiary.id}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 bg-[#EDEDFF] rounded-md p-2">
                        <ShieldAlert className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="text-xs text-muted-foreground">
                            {t("beneficiaryDetails.pseudonymizedId")}
                          </div>
                          <div className="font-medium">
                            {beneficiary.pseudoId}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#F7F9FB] drop-shadow-sm shadow-gray-50 border-0">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-base">
                    {t("beneficiaryDetails.recentServices")}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    className="bg-[#E0F2FE] text-black  border-0"
                    size="sm"
                    onClick={() => setActiveTab("services")}
                  >
                    {t("beneficiaryDetails.viewAll")}
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {servicesLoading && (
                      <div className="text-sm text-muted-foreground">
                        {t("beneficiaryDetails.loadingServices")}
                      </div>
                    )}
                    {servicesError && (
                      <div className="text-sm text-red-600">
                        {servicesError}
                      </div>
                    )}
                    {!servicesLoading &&
                      !servicesError &&
                      services.slice(0, 3).map((s) => (
                        <div
                          key={s.id}
                          className="flex items-start gap-3 pb-3 border-b last:border-b-0 last:pb-0"
                        >
                          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                            <CheckCircle className="h-4 w-4 text-muted-foreground " />
                          </div>
                          <div>
                            <div className="font-medium">
                              {s.service.category}: {s.service.name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {s.entity?.name ?? "—"} | {"—"}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                              <Clock className="h-3 w-3" />
                              <span>
                                {s.deliveredAt
                                  ? new Date(s.deliveredAt).toLocaleDateString()
                                  : "—"}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    {!servicesLoading &&
                      !servicesError &&
                      services.length === 0 && (
                        <div className="text-sm text-muted-foreground">
                          {t("beneficiaryDetails.noServicesRecorded")}
                        </div>
                      )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="bg-[#F7F9FB] drop-shadow-sm shadow-gray-50 border-0">
                <CardHeader>
                  <CardTitle className="text-base">
                    {t("beneficiaryDetails.serviceSummary")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-medium">
                      {deliveriesSummaryLoading
                        ? "—"
                        : deliveriesSummary?.totalDeliveries ?? 0}
                    </div>
                    <div className="text-muted-foreground">
                      {t("beneficiaryDetails.totalServicesReceived")}
                    </div>
                  </div>

                  {deliveriesSummaryError && (
                    <div className="text-sm text-red-600 text-center">
                      {deliveriesSummaryError}
                    </div>
                  )}

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {t("beneficiaryDetails.uniqueStaff")}
                      </span>
                      <span>
                        {deliveriesSummaryLoading
                          ? "—"
                          : deliveriesSummary?.uniqueStaff ?? 0}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {t("beneficiaryDetails.uniqueServices")}
                      </span>
                      <span>
                        {deliveriesSummaryLoading
                          ? "—"
                          : deliveriesSummary?.uniqueServices ?? 0}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#F7F9FB] drop-shadow-sm shadow-gray-50 border-0">
                <CardHeader>
                  <CardTitle className="text-base">
                    {t("beneficiaryDetails.dataProtection")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="font-medium">
                        {t("beneficiaryDetails.personalDataProtection")}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {t("beneficiaryDetails.sensitiveDataPseudonymized")}
                      </div>
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    {t("beneficiaryDetails.dataProtectionDescription")}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="services" className="pt-6">
          <Card className="bg-[#F7F9FB] drop-shadow-sm shadow-gray-50 border-0">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">
                {t("beneficiaryDetails.serviceHistory")}
              </CardTitle>
              {isSysOrSuperAdmin && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-[#0073e6] text-white"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {t("beneficiaryDetails.export")}
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("beneficiaryDetails.date")}</TableHead>
                    <TableHead>{t("beneficiaryDetails.category")}</TableHead>
                    <TableHead>{t("beneficiaryDetails.service")}</TableHead>
                    <TableHead>{t("beneficiaryDetails.staffName")}</TableHead>
                    <TableHead>{t("beneficiaryDetails.staffEmail")}</TableHead>
                    {/* <TableHead>Location</TableHead> */}
                    <TableHead>{t("beneficiaryDetails.entity")}</TableHead>
                    <TableHead>{t("beneficiaryDetails.entityType")}</TableHead>
                    <TableHead className="text-right">
                      {t("beneficiaryDetails.actions")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {servicesLoading && (
                    <TableRow>
                      <TableCell colSpan={7}>
                        <div className="text-sm text-muted-foreground">
                          {t("beneficiaryDetails.loadingServices")}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                  {servicesError && !servicesLoading && (
                    <TableRow>
                      <TableCell colSpan={7}>
                        <div className="text-sm text-red-600">
                          {servicesError}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                  {!servicesLoading &&
                    !servicesError &&
                    services.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell>
                          {s.deliveredAt
                            ? new Date(s.deliveredAt).toLocaleDateString()
                            : "—"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="bg-[#0073e6] text-white"
                          >
                            {s.service.category}
                          </Badge>
                        </TableCell>
                        <TableCell>{s.service.name}</TableCell>
                        <TableCell>
                          {`${s.staff?.firstName ?? ""} ${
                            s.staff?.lastName ?? ""
                          }`.trim() || "—"}
                        </TableCell>
                        <TableCell>{s.staff?.email ?? "—"}</TableCell>
                        <TableCell>{s.entity?.name ?? "—"}</TableCell>
                        <TableCell>{s.entity?.type ?? "—"}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              className="hover:bg-black/10"
                              variant="ghost"
                              size="sm"
                              disabled={!s.formResponseId}
                              onClick={() =>
                                s.formResponseId &&
                                navigate(
                                  `/beneficiaries/${id}/form/${s.formResponseId}`
                                )
                              }
                              title={
                                s.formResponseId
                                  ? t("beneficiaryDetails.viewLinkedForm")
                                  : t("beneficiaryDetails.noLinkedForm")
                              }
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 hover:bg-black/10"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <FileEdit className="h-4 w-4 mr-2" />
                                  {t("beneficiaryDetails.edit")}
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Download className="h-4 w-4 mr-2" />
                                  {t("beneficiaryDetails.export")}
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive">
                                  <Trash className="h-4 w-4 mr-2" />
                                  {t("beneficiaryDetails.delete")}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  {!servicesLoading &&
                    !servicesError &&
                    services.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7}>
                          <div className="text-sm text-muted-foreground">
                            {t("beneficiaryDetails.noServicesRecorded")}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                </TableBody>
              </Table>
              {/* Simple pagination (prev/next) using meta */}
              {/* <div className="flex items-center justify-between mt-4 text-sm">
                <div className="text-muted-foreground">
                  Page {servicesMeta.page} of {servicesMeta.totalPages} •{" "}
                  {servicesMeta.totalItems} total
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={servicesLoading || servicesMeta.page <= 1}
                    onClick={() =>
                      id &&
                      dispatch(
                        fetchBeneficiaryServices({
                          id,
                          page: servicesMeta.page - 1,
                          limit: servicesMeta.limit,
                        })
                      )
                    }
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={
                      servicesLoading ||
                      servicesMeta.page >= servicesMeta.totalPages
                    }
                    onClick={() =>
                      id &&
                      dispatch(
                        fetchBeneficiaryServices({
                          id,
                          page: servicesMeta.page + 1,
                          limit: servicesMeta.limit,
                        })
                      )
                    }
                  >
                    Next
                  </Button>
                </div>
              </div> */}
            </CardContent>
          </Card>
          <div className="flex items-center justify-between mt-4 text-sm">
            <div className="text-muted-foreground">
              {t("beneficiaryDetails.page")} {servicesMeta.page}{" "}
              {t("beneficiaryDetails.of")} {servicesMeta.totalPages} •{" "}
              {servicesMeta.totalItems} {t("beneficiaryDetails.total")}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="bg-[#E0F2FE] border-0 text-black"
                size="sm"
                disabled={servicesLoading || servicesMeta.page <= 1}
                onClick={() =>
                  id &&
                  dispatch(
                    fetchBeneficiaryServices({
                      id,
                      page: servicesMeta.page - 1,
                      limit: servicesMeta.limit,
                    })
                  )
                }
              >
                {t("beneficiaryDetails.previous")}
              </Button>
              <Button
                variant="outline"
                className="bg-[#0073e6] text-white"
                size="sm"
                disabled={
                  servicesLoading ||
                  servicesMeta.page >= servicesMeta.totalPages
                }
                onClick={() =>
                  id &&
                  dispatch(
                    fetchBeneficiaryServices({
                      id,
                      page: servicesMeta.page + 1,
                      limit: servicesMeta.limit,
                    })
                  )
                }
              >
                {t("beneficiaryDetails.next")}
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="info" className="pt-6">
          <Card className="bg-[#F7F9FB] drop-shadow-sm shadow-gray-50 border-0">
            <CardHeader>
              <CardTitle className="text-base">
                {t("beneficiaryDetails.info")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md overflow-hidden">
                <Table>
                  <TableHeader className="bg-[#E5ECF6]">
                    <TableRow>
                      <TableHead>{t("beneficiaryDetails.bloodType")}</TableHead>
                      <TableHead>{t("beneficiaryDetails.allergies")}</TableHead>
                      <TableHead>
                        {t("beneficiaryDetails.chronicConditions")}
                      </TableHead>
                      <TableHead>
                        {t("beneficiaryDetails.disabilities")}
                      </TableHead>
                      <TableHead>
                        {t("beneficiaryDetails.medications")}
                      </TableHead>
                      <TableHead>{t("beneficiaryDetails.notes")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="bg-[#F7F9FB] ">
                    <TableRow>
                      <TableCell>
                        {(detail as any)?.details?.bloodType ?? "—"}
                      </TableCell>
                      <TableCell>
                        {((detail as any)?.details?.allergies ?? []).length >
                        0 ? (
                          <div className="flex flex-wrap gap-2">
                            {((detail as any)?.details?.allergies ?? []).map(
                              (a: string, idx: number) => (
                                <Badge key={idx} variant="outline">
                                  {a}
                                </Badge>
                              )
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            —
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {((detail as any)?.details?.chronicConditions ?? [])
                          .length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {(
                              (detail as any)?.details?.chronicConditions ?? []
                            ).map((c: string, idx: number) => (
                              <Badge key={idx} variant="outline">
                                {c}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            —
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {((detail as any)?.details?.disabilities ?? []).length >
                        0 ? (
                          <div className="flex flex-wrap gap-2">
                            {((detail as any)?.details?.disabilities ?? []).map(
                              (d: string, idx: number) => (
                                <Badge key={idx} variant="outline">
                                  {d}
                                </Badge>
                              )
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            —
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {((detail as any)?.details?.medications ?? []).length >
                        0 ? (
                          <div className="flex flex-wrap gap-2">
                            {((detail as any)?.details?.medications ?? []).map(
                              (m: string, idx: number) => (
                                <Badge key={idx} variant="outline">
                                  {m}
                                </Badge>
                              )
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            —
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="whitespace-pre-wrap">
                          {(detail as any)?.details?.notes ?? "—"}
                        </div>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
