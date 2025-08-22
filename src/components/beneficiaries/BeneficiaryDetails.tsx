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
  Link2,
  MapPin,
  MoreHorizontal,
  Phone,
  Plus,
  Shield,
  ShieldAlert,
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

interface BeneficiaryDetailsProps {
  beneficiaryId: string;
  onBack: () => void;
}

// Mock data for a single beneficiary
const mockBeneficiary = {
  id: "BEN-2025-001",
  name: "Maria Johnson",
  pseudoId: "BEN78945",
  gender: "Female",
  age: 27,
  dateOfBirth: "1998-03-15",
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
  notes:
    "Pregnant with second child. Works as a community health volunteer in her village. Has regular access to mobile phone.",
  registeredBy: "Jane Smith",
  associatedFamily: [
    {
      name: "Thomas Johnson",
      relationship: "Spouse",
      age: 32,
      id: "BEN-2025-010",
    },
    { name: "Lily Johnson", relationship: "Child", age: 5, id: "BEN-2025-011" },
  ],
};

// Mock service history
const mockServiceHistory = [
  {
    id: "serv-001",
    date: "2025-05-10",
    type: "Health Check-up",
    description: "Prenatal check-up - 2nd trimester",
    provider: "Dr. Sarah Adams",
    subProject: "Maternal Health Services",
    location: "Mobile Clinic, Northern District",
    notes: "Blood pressure normal, provided vitamin supplements.",
  },
  {
    id: "serv-002",
    date: "2025-04-12",
    type: "Training",
    description: "Nutrition education session",
    provider: "Robert Johnson",
    subProject: "Maternal Health Services",
    location: "Community Center, Village A",
    notes: "Participated actively in the session. Received nutrition guide.",
  },
  {
    id: "serv-003",
    date: "2025-03-15",
    type: "Health Check-up",
    description: "Prenatal check-up - 1st trimester",
    provider: "Dr. Sarah Adams",
    subProject: "Maternal Health Services",
    location: "Mobile Clinic, Northern District",
    notes: "First prenatal visit. All vitals normal.",
  },
  {
    id: "serv-004",
    date: "2025-02-20",
    type: "Distribution",
    description: "Prenatal care kit distribution",
    provider: "Field Staff",
    subProject: "Maternal Health Services",
    location: "Village A Distribution Center",
    notes:
      "Received prenatal care kit including vitamins and educational materials.",
  },
];

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

export function BeneficiaryDetails({
  // beneficiaryId,
  onBack,
}: BeneficiaryDetailsProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddServiceDialogOpen, setIsAddServiceDialogOpen] = useState(false);
  const [isAssociateDialogOpen, setIsAssociateDialogOpen] = useState(false);

  // In a real application, this would fetch the beneficiary data based on the ID
  // For this demo, we're using the mock data directly
  const beneficiary = mockBeneficiary;

  if (!beneficiary) {
    return <div>Beneficiary not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Beneficiaries
        </Button>

        <h2>{beneficiary.name}</h2>
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#2E343E] text-white ml-auto">
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Edit Beneficiary</DialogTitle>
              <DialogDescription>
                Update the beneficiary's information. Fields marked with * are
                required.
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
                  defaultValue={beneficiary.name}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Gender *</Label>
                <RadioGroup
                  className="col-span-3 flex gap-4"
                  defaultValue={beneficiary.gender.toLowerCase()}
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
                  defaultValue={beneficiary.dateOfBirth}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="location" className="text-right">
                  Location *
                </Label>
                <Input
                  id="location"
                  className="col-span-3"
                  defaultValue={beneficiary.location}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="contact" className="text-right">
                  Contact Number
                </Label>
                <Input
                  id="contact"
                  className="col-span-3"
                  defaultValue={beneficiary.contactNumber}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="household" className="text-right">
                  Household ID
                </Label>
                <Input
                  id="household"
                  className="col-span-3"
                  defaultValue={beneficiary.household}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="vulnerability" className="text-right">
                  Vulnerability
                </Label>
                <Select
                  defaultValue={beneficiary.vulnerabilityScore.toLowerCase()}
                >
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
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">
                  Status
                </Label>
                <Select defaultValue={beneficiary.status}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="notes" className="text-right pt-2">
                  Notes
                </Label>
                <Textarea
                  id="notes"
                  className="col-span-3"
                  rows={3}
                  defaultValue={beneficiary.notes}
                />
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

        <Dialog
          open={isAssociateDialogOpen}
          onOpenChange={setIsAssociateDialogOpen}
        >
          <DialogTrigger asChild>
            <Button variant="outline" className="bg-[#2E343E] text-white">
              <Link className="h-4 w-4 mr-2" />
              Associate
            </Button>
          </DialogTrigger>
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
          <DialogTrigger asChild>
            <Button variant="outline" className="bg-[#2E343E] text-white">
              <Plus className="h-4 w-4 mr-2 " />
              Record Service
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Record New Service</DialogTitle>
              <DialogDescription>
                Add a new service provided to this beneficiary.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="service-date" className="text-right">
                  Date *
                </Label>
                <Input
                  id="service-date"
                  type="date"
                  className="col-span-3"
                  defaultValue={new Date().toISOString().split("T")[0]}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="service-type" className="text-right">
                  Type *
                </Label>
                <Select>
                  <SelectTrigger className="col-span-3">
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
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="service-description" className="text-right">
                  Description *
                </Label>
                <Input
                  id="service-description"
                  className="col-span-3"
                  placeholder="Brief description of the service"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="service-provider" className="text-right">
                  Provider *
                </Label>
                <Input
                  id="service-provider"
                  className="col-span-3"
                  placeholder="Name of person or team providing the service"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="service-location" className="text-right">
                  Location
                </Label>
                <Input
                  id="service-location"
                  className="col-span-3"
                  placeholder="Where the service was provided"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="service-subproject" className="text-right">
                  Sub-Project
                </Label>
                <Select>
                  <SelectTrigger className="col-span-3">
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
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="service-notes" className="text-right pt-2">
                  Notes
                </Label>
                <Textarea
                  id="service-notes"
                  className="col-span-3"
                  rows={3}
                  placeholder="Additional notes about the service provided"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsAddServiceDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={() => setIsAddServiceDialogOpen(false)}>
                Record Service
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-[#F7F9FB] drop-shadow-sm shadow-gray-50 border-0">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row justify-between gap-6">
            <div className="flex items-start gap-6 ">
              <Avatar className="h-16 w-16">
                <AvatarImage src={beneficiary.avatar} alt={beneficiary.name} />
                <AvatarFallback>{beneficiary.initials}</AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 ">
                    <h1 className="font-medium text-3xl">{beneficiary.name}</h1>
                    <Badge
                      style={{ backgroundColor: "#2E343E" }}
                      variant={
                        beneficiary.status === "active"
                          ? "default"
                          : "secondary"
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
              <div className="flex mt-10 flex-col gap-4 md:text-right">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span className="text-muted-foreground">Gender</span>
                  <span className="text-lg font-medium">
                    {beneficiary.gender}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span className="text-muted-foreground">Age</span>
                  <span className="ml-1">{beneficiary.age} years</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span className="text-muted-foreground">Household:</span>
                  <span className="ml-1">{beneficiary.household}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span className="text-muted-foreground">Vulnerability:</span>
                  <span className="ml-1">{beneficiary.vulnerabilityScore}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 md:text-right">
              <div className="text-sm text-muted-foreground mt-2 text-[#6B7280]">
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
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="services"
              className={`rounded-none bg-transparent border-0 border-b-2 pb-3 hover:bg-transparent ${
                activeTab === "services" ? "border-[#2E343E]" : ""
              }`}
            >
              Service History
            </TabsTrigger>
            <TabsTrigger
              value="family"
              className={`rounded-none bg-transparent border-0 border-b-2 pb-3 hover:bg-transparent ${
                activeTab === "family" ? "border-[#2E343E]" : ""
              }`}
            >
              Family
            </TabsTrigger>
            <TabsTrigger
              value="documents"
              className={`rounded-none bg-transparent border-0 border-b-2 pb-3 hover:bg-transparent ${
                activeTab === "documents" ? "border-[#2E343E]" : ""
              }`}
            >
              Documents
            </TabsTrigger>
          </div>
        </TabsList>

        <TabsContent value="overview" className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <Card className="bg-[#F7F9FB] drop-shadow-sm shadow-gray-50 border-0">
                <CardHeader>
                  <CardTitle className="text-base">
                    Beneficiary Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">About</h4>
                    <p className="text-muted-foreground">{beneficiary.notes}</p>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Current Projects</h4>
                    <div className="space-y-3">
                      {beneficiary.projects.map((project, index) => (
                        <div
                          key={index}
                          className=" text-black rounded-md p-3 bg-[#E5ECF6]"
                        >
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{project}</span>
                          </div>
                          {beneficiary.subProjects[index] && (
                            <div className="text-sm text-muted-foreground mt-1 ml-6">
                              Sub-project: {beneficiary.subProjects[index]}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">
                      Registration Information
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">
                          Registration Date:
                        </span>
                        <div>
                          {new Date(
                            beneficiary.registrationDate
                          ).toLocaleDateString()}
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">
                          Registered By:
                        </span>
                        <div>{beneficiary.registeredBy}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">ID:</span>
                        <div>{beneficiary.id}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">
                          Pseudonymized ID:
                        </span>
                        <div>{beneficiary.pseudoId}</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#F7F9FB] drop-shadow-sm shadow-gray-50 border-0">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-base">Recent Services</CardTitle>
                  <Button
                    variant="ghost"
                    className="bg-black/10 text-black  border-0"
                    size="sm"
                    onClick={() => setActiveTab("services")}
                  >
                    View All
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockServiceHistory.slice(0, 3).map((service) => (
                      <div
                        key={service.id}
                        className="flex items-start gap-3 pb-3 border-b last:border-b-0 last:pb-0"
                      >
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                          <CheckCircle className="h-4 w-4 text-muted-foreground " />
                        </div>
                        <div>
                          <div className="font-medium">
                            {service.type}: {service.description}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {service.subProject} | {service.location}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                            <Clock className="h-3 w-3" />
                            <span>
                              {new Date(service.date).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="bg-[#F7F9FB] drop-shadow-sm shadow-gray-50 border-0">
                <CardHeader>
                  <CardTitle className="text-base">Service Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-medium">
                      {beneficiary.serviceCount}
                    </div>
                    <div className="text-muted-foreground">
                      Total Services Received
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Last Service:
                      </span>
                      <span>
                        {new Date(beneficiary.lastService).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Service Frequency:
                      </span>
                      <span>Monthly</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Next Scheduled:
                      </span>
                      <span>June 10, 2025</span>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full bg-[#2E343E] text-white"
                    onClick={() => setIsAddServiceDialogOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-2 " />
                    Record New Service
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-[#F7F9FB] drop-shadow-sm shadow-gray-50 border-0">
                <CardHeader>
                  <CardTitle className="text-base">Family Members</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {beneficiary.associatedFamily.map((member, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center pb-2 border-b last:border-b-0 last:pb-0"
                    >
                      <div>
                        <div className="font-medium">{member.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {member.relationship}, {member.age} years
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Link2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}

                  <Button
                    variant="outline"
                    className="w-full bg-[#2E343E] text-white"
                    onClick={() => setActiveTab("family")}
                  >
                    Manage Family
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-[#F7F9FB] drop-shadow-sm shadow-gray-50 border-0">
                <CardHeader>
                  <CardTitle className="text-base">Data Protection</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="font-medium">
                        Personal Data Protection
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Sensitive data is pseudonymized
                      </div>
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    Personal identifiable information is protected and masked
                    with pseudonymized IDs in reports and exports. Access to
                    full data is restricted based on user roles.
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="services" className="pt-6">
          <Card className="bg-[#F7F9FB] drop-shadow-sm shadow-gray-50 border-0">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Service History</CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-[#2E343E] text-white"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Button
                  className="bg-[#2E343E] text-white"
                  size="sm"
                  onClick={() => setIsAddServiceDialogOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Record Service
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Service Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Provider</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Sub-Project</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockServiceHistory.map((service) => (
                    <TableRow key={service.id}>
                      <TableCell>
                        {new Date(service.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{service.type}</Badge>
                      </TableCell>
                      <TableCell>{service.description}</TableCell>
                      <TableCell>{service.provider}</TableCell>
                      <TableCell>{service.location}</TableCell>
                      <TableCell>{service.subProject}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
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
                                <Download className="h-4 w-4 mr-2" />
                                Export
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="family" className="pt-6">
          <Card className="bg-[#F7F9FB] drop-shadow-sm shadow-gray-50 border-0">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Family Members</CardTitle>
              <Button size="sm" className="bg-[#2E343E] text-white">
                <Plus className="h-4 w-4 mr-2" />
                Add Family Member
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Relationship</TableHead>
                    <TableHead>Age</TableHead>
                    <TableHead>ID</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {beneficiary.associatedFamily.map((member, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        {member.name}
                      </TableCell>
                      <TableCell>{member.relationship}</TableCell>
                      <TableCell>{member.age} years</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <ShieldAlert className="h-3 w-3" />
                          <span>{member.id}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="default"
                          className="bg-[#2E343E] text-white"
                        >
                          Active
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-[#2E343E] text-white"
                          >
                            <Link2 className="h-4 w-4 mr-2" />
                            View Profile
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <FileEdit className="h-4 w-4 mr-2" />
                                Edit Relationship
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive">
                                <Trash className="h-4 w-4 mr-2" />
                                Remove
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="pt-6">
          <Card className="bg-[#F7F9FB] drop-shadow-sm shadow-gray-50 border-0">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Documents</CardTitle>
              <Button size="sm" className="bg-[#2E343E] text-white">
                <Plus className="h-4 w-4 mr-2" />
                Upload Document
              </Button>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-48 border border-dashed rounded-md">
                <div className="text-center">
                  <User className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <h3 className="text-lg mb-2">No documents found</h3>
                  <p className="text-muted-foreground">
                    Upload a document to associate with this beneficiary.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
