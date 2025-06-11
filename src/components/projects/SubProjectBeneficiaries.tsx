import {
  Calendar,
  Download,
  FileEdit,
  MapPin,
  Phone,
  Plus,
  Search,
  User,
  Users,
} from "lucide-react";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Checkbox } from "../ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Textarea } from "../ui/textarea";

interface SubProjectBeneficiariesProps {
  subProjectId: string;
}

// Mock beneficiary data
const mockBeneficiaries = [
  {
    id: "ben-001",
    subProjectId: "sub-001",
    name: "Maria Johnson",
    gender: "Female",
    age: 27,
    category: "Primary",
    status: "active",
    location: "Northern Village",
    contact: "+123456789",
    registrationDate: "2025-02-10",
    lastService: "2025-05-18",
    serviceCount: 4,
    avatar: "",
    initials: "MJ",
    household: "HH-125",
    vulnerabilityScore: "Medium",
  },
  {
    id: "ben-002",
    subProjectId: "sub-001",
    name: "Sarah Williams",
    gender: "Female",
    age: 31,
    category: "Primary",
    status: "active",
    location: "Eastern Village",
    contact: "+123456790",
    registrationDate: "2025-02-15",
    lastService: "2025-05-15",
    serviceCount: 3,
    avatar: "",
    initials: "SW",
    household: "HH-126",
    vulnerabilityScore: "Low",
  },
  {
    id: "ben-003",
    subProjectId: "sub-001",
    name: "Jennifer Lee",
    gender: "Female",
    age: 24,
    category: "Primary",
    status: "active",
    location: "Central Village",
    contact: "+123456791",
    registrationDate: "2025-03-05",
    lastService: "2025-05-10",
    serviceCount: 2,
    avatar: "",
    initials: "JL",
    household: "HH-130",
    vulnerabilityScore: "High",
  },
  {
    id: "ben-004",
    subProjectId: "sub-001",
    name: "Rebecca Martinez",
    gender: "Female",
    age: 29,
    category: "Primary",
    status: "inactive",
    location: "Western Village",
    contact: "+123456792",
    registrationDate: "2025-03-12",
    lastService: "2025-04-20",
    serviceCount: 1,
    avatar: "",
    initials: "RM",
    household: "HH-135",
    vulnerabilityScore: "Medium",
  },
  {
    id: "ben-005",
    subProjectId: "sub-001",
    name: "James Wilson",
    gender: "Male",
    age: 32,
    category: "Secondary",
    status: "active",
    location: "Northern Village",
    contact: "+123456793",
    registrationDate: "2025-03-20",
    lastService: "2025-05-05",
    serviceCount: 1,
    avatar: "",
    initials: "JW",
    household: "HH-125",
    vulnerabilityScore: "Low",
  },
  {
    id: "ben-006",
    subProjectId: "sub-002",
    name: "Michael Thompson",
    gender: "Male",
    age: 4,
    category: "Primary",
    status: "active",
    location: "Central District",
    contact: "+123456794",
    registrationDate: "2025-02-20",
    lastService: "2025-05-20",
    serviceCount: 2,
    avatar: "",
    initials: "MT",
    household: "HH-140",
    vulnerabilityScore: "Medium",
  },
];

// Mock beneficiary groups
const mockBeneficiaryGroups = [
  {
    id: "group-001",
    subProjectId: "sub-001",
    name: "Pregnant Women - Northern Region",
    category: "Maternal Health",
    count: 42,
    description:
      "Group of pregnant women in the northern region targeted for maternal health services",
    createdDate: "2025-02-01",
  },
  {
    id: "group-002",
    subProjectId: "sub-001",
    name: "High-Risk Pregnancies",
    category: "Maternal Health",
    count: 15,
    description: "Women with high-risk pregnancies requiring special attention",
    createdDate: "2025-02-15",
  },
  {
    id: "group-003",
    subProjectId: "sub-001",
    name: "New Mothers",
    category: "Maternal Health",
    count: 28,
    description: "Recently delivered mothers requiring postpartum care",
    createdDate: "2025-03-10",
  },
];

export function SubProjectBeneficiaries({
  subProjectId,
}: SubProjectBeneficiariesProps) {
  const [activeTab, setActiveTab] = useState("individuals");
  const [isCreateBeneficiaryDialogOpen, setIsCreateBeneficiaryDialogOpen] =
    useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedBeneficiaries, setSelectedBeneficiaries] = useState<string[]>(
    []
  );

  // Filter beneficiaries for this sub-project
  const filteredBeneficiaries = mockBeneficiaries.filter((beneficiary) => {
    const matchesSubProject = beneficiary.subProjectId === subProjectId;
    const matchesSearch =
      beneficiary.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      beneficiary.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || beneficiary.status === statusFilter;
    const matchesCategory =
      categoryFilter === "all" || beneficiary.category === categoryFilter;

    return (
      matchesSubProject && matchesSearch && matchesStatus && matchesCategory
    );
  });

  // Filter beneficiary groups for this sub-project
  const filteredGroups = mockBeneficiaryGroups.filter(
    (group) => group.subProjectId === subProjectId
  );

  // Handle selection of all beneficiaries
  const handleSelectAll = () => {
    if (selectedBeneficiaries.length === filteredBeneficiaries.length) {
      setSelectedBeneficiaries([]);
    } else {
      setSelectedBeneficiaries(filteredBeneficiaries.map((b) => b.id));
    }
  };

  // Handle selection of a single beneficiary
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
          <h3>Beneficiaries</h3>
          <p className="text-muted-foreground">
            Manage program beneficiaries and groups
          </p>
        </div>
        <Dialog
          open={isCreateBeneficiaryDialogOpen}
          onOpenChange={setIsCreateBeneficiaryDialogOpen}
        >
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
                Register a new beneficiary for this sub-project.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="beneficiary-name" className="text-right">
                  Full Name *
                </Label>
                <Input
                  id="beneficiary-name"
                  className="col-span-3"
                  placeholder="Beneficiary's full name"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="beneficiary-gender" className="text-right">
                  Gender *
                </Label>
                <Select>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="beneficiary-age" className="text-right">
                  Age *
                </Label>
                <Input
                  id="beneficiary-age"
                  type="number"
                  className="col-span-3"
                  placeholder="Age in years"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="beneficiary-category" className="text-right">
                  Category *
                </Label>
                <Select>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="primary">Primary</SelectItem>
                    <SelectItem value="secondary">Secondary</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="beneficiary-location" className="text-right">
                  Location *
                </Label>
                <Input
                  id="beneficiary-location"
                  className="col-span-3"
                  placeholder="Village or community"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="beneficiary-contact" className="text-right">
                  Contact No.
                </Label>
                <Input
                  id="beneficiary-contact"
                  className="col-span-3"
                  placeholder="Phone number"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="beneficiary-household" className="text-right">
                  Household ID
                </Label>
                <Input
                  id="beneficiary-household"
                  className="col-span-3"
                  placeholder="Household identifier"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="vulnerability-score" className="text-right">
                  Vulnerability
                </Label>
                <Select>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select vulnerability score" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="beneficiary-notes" className="text-right pt-2">
                  Notes
                </Label>
                <Textarea
                  id="beneficiary-notes"
                  className="col-span-3"
                  placeholder="Additional information about the beneficiary"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              {/* <Button
                variant="outline"
                onClick={() => setIsCreateBeneficiaryDialogOpen(false)}
              >
                Cancel
              </Button> */}
              <Button onClick={() => setIsCreateBeneficiaryDialogOpen(false)}>
                Add Beneficiary
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="individuals">
            Individual Beneficiaries
          </TabsTrigger>
          <TabsTrigger value="groups">Beneficiary Groups</TabsTrigger>
        </TabsList>

        <TabsContent value="individuals" className="pt-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-between mb-4">
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
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
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={categoryFilter}
                  onValueChange={setCategoryFilter}
                >
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="Primary">Primary</SelectItem>
                    <SelectItem value="Secondary">Secondary</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {/* <div className="flex gap-2">
              {selectedBeneficiaries.length > 0 && (
                <Button variant="outline" size="sm">
                  Add to Group ({selectedBeneficiaries.length})
                </Button>
              )}
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export List
              </Button>
            </div> */}
          </div>

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
                  <TableHead>Gender</TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Registration</TableHead>
                  <TableHead>Services</TableHead>
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
                          <AvatarFallback>
                            {beneficiary.initials}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{beneficiary.name}</div>
                          <div className="text-sm text-muted-foreground">
                            ID: {beneficiary.id}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{beneficiary.gender}</TableCell>
                    <TableCell>{beneficiary.age}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{beneficiary.category}</Badge>
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
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        <span>{beneficiary.location}</span>
                      </div>
                      {beneficiary.household && (
                        <div className="text-xs text-muted-foreground">
                          Household: {beneficiary.household}
                        </div>
                      )}
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
                      <div className="text-xs text-muted-foreground">
                        Vulnerability: {beneficiary.vulnerabilityScore}
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
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {/* <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button> */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            {/* <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button> */}
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <FileEdit className="h-4 w-4 mr-2" />
                              Edit Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Phone className="h-4 w-4 mr-2" />
                              Contact
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <User className="h-4 w-4 mr-2" />
                              Manage Services
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download className="h-4 w-4 mr-2" />
                              Export Profile
                            </DropdownMenuItem>
                            {beneficiary.status === "active" ? (
                              <DropdownMenuItem className="text-destructive">
                                Deactivate
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem className="text-green-600">
                                Activate
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="groups" className="pt-4">
          <div className="flex justify-end mb-4">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Group
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGroups.map((group) => (
              <Card key={group.id}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between">
                    <CardTitle className="text-base">{group.name}</CardTitle>
                    <Badge variant="outline">{group.category}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {group.description}
                  </p>

                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <span className="text-lg font-medium">{group.count}</span>
                    <span className="text-muted-foreground">beneficiaries</span>
                  </div>

                  <div className="text-sm text-muted-foreground">
                    Created on{" "}
                    {new Date(group.createdDate).toLocaleDateString()}
                  </div>

                  {/* <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm">
                      <Users className="h-4 w-4 mr-2" />
                      View Members
                    </Button>
                    <Button size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      Group Details
                    </Button>
                  </div> */}
                </CardContent>
              </Card>
            ))}

            <Card className="border-dashed flex flex-col items-center justify-center p-6">
              <div className="rounded-full border-dashed border-2 p-3 mb-3">
                <Plus className="h-6 w-6 text-muted-foreground" />
              </div>
              <h4 className="mb-1">Create Beneficiary Group</h4>
              <p className="text-sm text-muted-foreground text-center mb-3">
                Group beneficiaries by category, location, or other criteria
              </p>
              <Button>Create Group</Button>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
