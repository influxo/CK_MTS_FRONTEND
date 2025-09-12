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
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch } from "../../store";
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
} from "../../store/slices/beneficiarySlice";
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

export function BeneficiariesList({
  onBeneficiarySelect,
}: BeneficiariesListProps) {
  const dispatch = useDispatch<AppDispatch>();
  const beneficiaries = useSelector(selectBeneficiaries);
  const listLoading = useSelector(selectBeneficiariesLoading);
  const listError = useSelector(selectBeneficiariesError);
  // create state
  const createLoading = useSelector(selectBeneficiaryIsLoading);
  const createError = useSelector(selectBeneficiaryError);
  const createSuccess = useSelector(selectBeneficiaryCreateSuccessMessage);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [projectFilter, setProjectFilter] = useState("all");
  const [tagFilter, setTagFilter] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedBeneficiaries, setSelectedBeneficiaries] = useState<string[]>(
    []
  );
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Add Beneficiary form state aligned with CreateBeneficiaryRequest
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

  const resetForm = () =>
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

  // Kick off loading of real beneficiaries
  useEffect(() => {
    // if (!listLoading && beneficiaries.length === 0) {
    dispatch(fetchBeneficiaries(undefined));
    // }
  }, [dispatch]);

  // Close dialog and refresh list on successful create
  useEffect(() => {
    if (createSuccess) {
      setIsAddDialogOpen(false);
      resetForm();
      // refresh list and clear create messages
      dispatch(fetchBeneficiaries(undefined));
      dispatch(clearBeneficiaryMessages());
    }
  }, [createSuccess, dispatch]);

  const handleCreateSubmit = async () => {
    // basic required checks (could be enhanced)
    if (!form.firstName || !form.lastName || !form.gender || !form.status) {
      return;
    }
    try {
      await dispatch(createBeneficiary(form)).unwrap();
      // success handled by effect
    } catch (_) {
      // errors are surfaced via createError
    }
  };

  // Build a simple view model from API data for table rendering
  const list = useMemo(() => {
    return beneficiaries.map((b) => {
      const pii = b.pii || ({} as any);
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
        address: pii.address || "",
      };
    });
  }, [beneficiaries]);

  // Filter beneficiaries based on selected filters (only on available fields)
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
      // project and tag filters are not applicable with current API; keep them as no-op when not "all"
      const matchesProject = projectFilter === "all";
      const matchesTag = tagFilter === "all";
      return matchesSearch && matchesStatus && matchesProject && matchesTag;
    });
  }, [list, searchQuery, statusFilter, projectFilter, tagFilter]);

  // Get unique tags from all beneficiaries
  const uniqueTags = Array.from(
    new Set(mockBeneficiaries.flatMap((beneficiary) => beneficiary.tags))
  );

  // Handle selecting all beneficiaries
  const handleSelectAll = () => {
    if (selectedBeneficiaries.length === filteredBeneficiaries.length) {
      setSelectedBeneficiaries([]);
    } else {
      setSelectedBeneficiaries(filteredBeneficiaries.map((b) => b.id));
    }
  };

  // Handle selecting a single beneficiary
  const handleSelectBeneficiary = (id: string) => {
    if (selectedBeneficiaries.includes(id)) {
      setSelectedBeneficiaries(
        selectedBeneficiaries.filter((beneficiaryId) => beneficiaryId !== id)
      );
    } else {
      setSelectedBeneficiaries([...selectedBeneficiaries, id]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2>Beneficiaries</h2>
          <p className="text-muted-foreground">
            Manage program beneficiaries and their associations
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            className="border bg-black/10 text-black"
            // variant="outline"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          >
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Advanced Filters
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#2E343E] text-white">
                <Plus className="h-4 w-4 mr-2" />
                Add Beneficiary
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px]">
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
                  // variant="outline"
                  onClick={() => {
                    setIsAddDialogOpen(false);
                    resetForm();
                    dispatch(clearBeneficiaryMessages());
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreateSubmit} disabled={createLoading}>
                  {createLoading ? "Creating..." : "Add Beneficiary"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 justify-between">
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground " />
            <Input
              placeholder="Search beneficiaries..."
              className="pl-9 bg-black/5 border-0"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-3">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[130px] bg-black/5 border-0 text-black">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Select value={projectFilter} onValueChange={setProjectFilter}>
              <SelectTrigger className="w-[180px] bg-black/5 border-0 text-black">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                {mockProjects.map((project) => (
                  <SelectItem key={project.id} value={project.title}>
                    {project.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex gap-3 rounded-[-15px] bg-[rgba(255,0,0,0)]">
          <div className="flex gap-2">
            {selectedBeneficiaries.length > 0 && (
              <Button
                className="bg-gray-50"
                // variant="outline"
              >
                Bulk Actions ({selectedBeneficiaries.length})
              </Button>
            )}
          </div>
        </div>
      </div>

      {showAdvancedFilters && (
        <Card className="mb-6">
          <CardContent className="py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label>Location</Label>
                <Select>
                  <SelectTrigger className="mt-2 bg-black/5 border-0 text-black">
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
                    className="bg-black/5 border-0"
                  />
                  <Input
                    type="number"
                    placeholder="Max age"
                    className="bg-black/5 border-0"
                  />
                </div>
              </div>
              <div>
                <Label>Registration Date</Label>
                <div className="grid grid-cols-2 gap-2 mt-2 ">
                  <Input
                    type="date"
                    placeholder="From"
                    className="bg-black/5 border-0"
                  />
                  <Input
                    type="date"
                    placeholder="To"
                    className="bg-black/5 border-0"
                  />
                </div>
              </div>
              <div>
                <Label>Tags</Label>
                <Select value={tagFilter} onValueChange={setTagFilter}>
                  <SelectTrigger className="mt-2 bg-black/5 border-0 text-black">
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
                className="mr-2 bg-black/10"
              >
                Reset Filters
              </Button>
              <Button className="bg-[#2E343E] text-white">Apply Filters</Button>
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
                      className="hover:bg-black/10 border-0"
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
                          className="h-8 w-8 p-0 hover:bg-black/10 border-0"
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

      <div className="flex items-center justify-between">
        {/* <div className="text-sm text-muted-foreground">
          Showing {filteredBeneficiaries.length} of {beneficiaries.length}{" "}
          beneficiaries
        </div> */}
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            className="bg-[#2E343E] text-white"
          >
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Export to Excel
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="bg-[#2E343E] text-white"
          >
            <FileText className="h-4 w-4 mr-2" />
            Export to PDF
          </Button>
        </div>
      </div>
    </div>
  );
}
