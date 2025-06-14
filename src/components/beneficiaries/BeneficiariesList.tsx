import {
  Calendar,
  Eye,
  FileCheck,
  FileDown,
  FileEdit,
  FileSpreadsheet,
  FileText,
  Filter,
  Link,
  MapPin,
  MoreHorizontal,
  Phone,
  Plus,
  Search,
  ShieldAlert,
  SlidersHorizontal,
  Trash,
  User,
  Users,
} from "lucide-react";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/data-display/avatar";
import { Badge } from "../ui/data-display/badge";
import { Button } from "../ui/button/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/data-display/card";
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
import { Tabs, TabsList, TabsTrigger } from "../ui/navigation/tabs";

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
  const [viewType, setViewType] = useState("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [projectFilter, setProjectFilter] = useState("all");
  const [tagFilter, setTagFilter] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedBeneficiaries, setSelectedBeneficiaries] = useState<string[]>(
    []
  );
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Filter beneficiaries based on selected filters
  const filteredBeneficiaries = mockBeneficiaries.filter((beneficiary) => {
    const matchesSearch =
      beneficiary.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      beneficiary.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      beneficiary.pseudoId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      beneficiary.location.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || beneficiary.status === statusFilter;

    const matchesProject =
      projectFilter === "all" ||
      beneficiary.projects.some((project) => project === projectFilter);

    const matchesTag =
      tagFilter === "all" || beneficiary.tags.includes(tagFilter);

    return matchesSearch && matchesStatus && matchesProject && matchesTag;
  });

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
            // variant="outline"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          >
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Advanced Filters
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
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
                  <Label htmlFor="name" className="text-right">
                    Full Name *
                  </Label>
                  <Input
                    id="name"
                    className="col-span-3"
                    placeholder="Enter full name"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Gender *</Label>
                  <RadioGroup
                    className="col-span-3 flex gap-4"
                    defaultValue="female"
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
                  <Label htmlFor="age" className="text-right">
                    Age *
                  </Label>
                  <Input
                    id="age"
                    type="number"
                    className="col-span-3"
                    placeholder="Enter age"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="location" className="text-right">
                    Location *
                  </Label>
                  <Input
                    id="location"
                    className="col-span-3"
                    placeholder="Region, District, Village/Town"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="contact" className="text-right">
                    Contact Number
                  </Label>
                  <Input
                    id="contact"
                    className="col-span-3"
                    placeholder="Enter phone number"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="household" className="text-right">
                    Household ID
                  </Label>
                  <Input
                    id="household"
                    className="col-span-3"
                    placeholder="Enter household identifier"
                  />
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label className="text-right pt-2">Tags</Label>
                  <div className="col-span-3 space-y-2">
                    {uniqueTags.map((tag) => (
                      <div key={tag} className="flex items-center space-x-2">
                        <Checkbox id={`tag-${tag}`} />
                        <Label htmlFor={`tag-${tag}`}>
                          {tag.replace("-", " ")}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="project" className="text-right">
                    Project *
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
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="vulnerability" className="text-right">
                    Vulnerability
                  </Label>
                  <Select>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select vulnerability level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={() => setIsAddDialogOpen(false)}>
                  Add Beneficiary
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 justify-between">
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search beneficiaries..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-3">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[130px]">
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
              <SelectTrigger className="w-[180px]">
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
              // variant="outline"
              >
                Bulk Actions ({selectedBeneficiaries.length})
              </Button>
            )}
            <Button
            // variant="outline"
            >
              <FileDown className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
          <Tabs
            value={viewType}
            onValueChange={setViewType}
            className="w-[180px]"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="grid">Grid View</TabsTrigger>
              <TabsTrigger value="list">List View</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {showAdvancedFilters && (
        <Card className="mb-6">
          <CardContent className="py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label>Location</Label>
                <Select>
                  <SelectTrigger className="mt-2">
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
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <Input type="number" placeholder="Min age" />
                  <Input type="number" placeholder="Max age" />
                </div>
              </div>
              <div>
                <Label>Registration Date</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <Input type="date" placeholder="From" />
                  <Input type="date" placeholder="To" />
                </div>
              </div>
              <div>
                <Label>Tags</Label>
                <Select value={tagFilter} onValueChange={setTagFilter}>
                  <SelectTrigger className="mt-2">
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
                className="mr-2"
              >
                Reset Filters
              </Button>
              <Button
              // size="sm"
              >
                Apply Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {viewType === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBeneficiaries.map((beneficiary) => (
            <Card key={beneficiary.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={selectedBeneficiaries.includes(beneficiary.id)}
                      onCheckedChange={() =>
                        handleSelectBeneficiary(beneficiary.id)
                      }
                    />
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={beneficiary.avatar}
                          alt={beneficiary.name}
                        />
                        <AvatarFallback>{beneficiary.initials}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-base">
                          {beneficiary.name}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <ShieldAlert className="h-3 w-3" />
                          {beneficiary.pseudoId}
                        </p>
                      </div>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        // variant="ghost"
                        //  size="sm"
                        className="h-8 w-8 p-0"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => onBeneficiarySelect(beneficiary.id)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
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
              </CardHeader>
              <CardContent className="pb-3">
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-1.5">
                    <Badge
                      variant={
                        beneficiary.status === "active"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {beneficiary.status}
                    </Badge>
                    {beneficiary.tags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag.replace("-", " ")}
                      </Badge>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Gender/Age:</span>
                      <div>
                        {beneficiary.gender}, {beneficiary.age}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Household:</span>
                      <div>{beneficiary.household}</div>
                    </div>
                    <div className="col-span-2">
                      <span className="text-muted-foreground">Location:</span>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                        <span className="truncate">{beneficiary.location}</span>
                      </div>
                    </div>
                    <div className="col-span-2">
                      <span className="text-muted-foreground">Contact:</span>
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        <span>{beneficiary.contactNumber}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t">
                    <span className="text-sm text-muted-foreground">
                      Projects:
                    </span>
                    <div className="mt-1 space-y-1">
                      {beneficiary.projects.map((project) => (
                        <div
                          key={project}
                          className="text-sm flex items-center gap-1"
                        >
                          <Users className="h-3 w-3 text-muted-foreground" />
                          <span>{project}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">
                        Last Service:
                      </span>
                      <span>
                        {new Date(beneficiary.lastService).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Total Services:
                      </span>
                      <span>{beneficiary.serviceCount}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-1">
                <Button
                  // variant="outline"
                  // size="sm"
                  className="w-full"
                  onClick={() => onBeneficiarySelect(beneficiary.id)}
                >
                  View Full Profile
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
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
                <TableHead>Gender/Age</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Projects</TableHead>
                <TableHead>Services</TableHead>
                <TableHead>Registration</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
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
                        <AvatarImage
                          src={beneficiary.avatar}
                          alt={beneficiary.name}
                        />
                        <AvatarFallback>{beneficiary.initials}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{beneficiary.name}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <ShieldAlert className="h-3 w-3" />
                          {beneficiary.pseudoId}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>{beneficiary.gender}</div>
                    <div>{beneficiary.age} years</div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        beneficiary.status === "active"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {beneficiary.status}
                    </Badge>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {beneficiary.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag.replace("-", " ")}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                      <span className="truncate max-w-[150px]">
                        {beneficiary.location}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Household: {beneficiary.household}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1 max-w-[150px]">
                      {beneficiary.projects.map((project) => (
                        <div key={project} className="text-sm truncate">
                          {project}
                        </div>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {beneficiary.serviceCount} services
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Last:{" "}
                      {new Date(beneficiary.lastService).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <span>
                        {new Date(
                          beneficiary.registrationDate
                        ).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Vulnerability: {beneficiary.vulnerabilityScore}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        // variant="outline"
                        // size="sm"
                        onClick={() => onBeneficiarySelect(beneficiary.id)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            // variant="ghost"
                            // size="sm"
                            className="h-8 w-8 p-0"
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
      )}

      {filteredBeneficiaries.length === 0 && (
        <div className="text-center py-10 border rounded-lg">
          <User className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <h3 className="text-lg mb-2">No beneficiaries found</h3>
          <p className="text-muted-foreground">
            Try adjusting your filters or search criteria.
          </p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {filteredBeneficiaries.length} of {mockBeneficiaries.length}{" "}
          beneficiaries
        </div>
        <div className="space-x-2">
          <Button variant="outline" size="sm">
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Export to Excel
          </Button>
          <Button
          // variant="outline"
          //  size="sm"
          >
            <FileText className="h-4 w-4 mr-2" />
            Export to PDF
          </Button>
        </div>
      </div>
    </div>
  );
}
