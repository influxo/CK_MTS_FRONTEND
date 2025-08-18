import { FilterControls } from "../components/dashboard/FilterControls";
import { SummaryMetrics } from "../components/dashboard/SummaryMetrics";
import { FormSubmissions } from "../components/dashboard/FormSubmissions";
import { KpiHighlights } from "../components/dashboard/KpiHighlights";
import { SyncStatus } from "../components/dashboard/SyncStatus";
import { SystemAlerts } from "../components/dashboard/SystemAlerts";
import { BeneficiaryDemographics } from "../components/dashboard/BeneficiaryDemographics";
import { ServiceDelivery } from "../components/dashboard/ServiceDelivery";
import { RecentActivity } from "../components/dashboard/RecentActivity";
import { createProject } from "../store/slices/projectsSlice";
import type { AppDispatch } from "../store";
import { useDispatch } from "react-redux";
import { useState } from "react";
import type { CreateProjectRequest } from "../services/projects/projectModels";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/overlay/dialog";
import { Button } from "../components/ui/button/button";
import { Plus } from "lucide-react";
import { Label } from "../components/ui/form/label";
import { Input } from "../components/ui/form/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/form/select";
import { Textarea } from "../components/ui/form/textarea";
import { toast } from "sonner";

export function Dashboard() {
  const [formData, setFormData] = useState<CreateProjectRequest>({
    name: "",
    category: "",
    // type: "",
    status: "active",
    // startDate: "",
    // endDate: "",
    description: "",
  });
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const dispatch = useDispatch<AppDispatch>();
  // const submitCreateProject = () => {
  //   dispatch(createProject(formData));
  // };

  const submitCreateProject = async () => {
    const result = await dispatch(createProject(formData));

    if (createProject.fulfilled.match(result)) {
      toast.success("Project created successfully!", {
        style: {
          backgroundColor: "#d1fae5",
          color: "#065f46",
          border: "1px solid #10b981",
        },
      });
    } else {
      toast.error(result.payload || "Failed to create project.", {
        style: {
          backgroundColor: "#fee2e2",
          color: "#991b1b",
          border: "1px solid #ef4444",
        },
      });
    }
  };
  const validateForm = () => {
    const errors: Record<string, string> = {};

    // Check required fields
    if (!formData.name.trim()) errors.name = "Name is required";
    if (!formData.category) errors.category = "Category is required";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSelectField = (value: string, fieldName: string) => {
    setFormData((prevData) => ({
      ...prevData,
      [fieldName]: value,
    }));
  };

  const handleCreateProject = () => {
    if (validateForm()) {
      submitCreateProject();
      setIsCreateDialogOpen(false);
      setFormData({
        name: "",
        category: "",
        status: "active",
        description: "",
      });
    } else {
      console.log("Form validation failed", formErrors);
    }
  };
  return (
    <>
      <FilterControls />
      <div className="flex justify-end mb-4">
        {/* Create Project Dialog */}
        {/* TODO: make this a component */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-black text-white flex ">
              <Plus className="h-4 w-4 mr-2 " />
              Create Project
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
              <DialogDescription>
                Enter the details for your new project. All fields marked with *
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
                  name="name"
                  className={`col-span-3 ${
                    formErrors.name ? "border-red-500" : ""
                  }`}
                  placeholder="Project title"
                  value={formData.name}
                  onChange={handleInputChange}
                />
                {formErrors.name && (
                  <p className="text-red-500 text-sm col-span-3 col-start-2">
                    {formErrors.name}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">
                  Category *
                </Label>
                <Input
                  id="category"
                  name="category"
                  className={`col-span-3 ${
                    formErrors.category ? "border-red-500" : ""
                  }`}
                  placeholder="Project Category"
                  value={formData.category}
                  onChange={handleInputChange}
                />
                {formErrors.category && (
                  <p className="text-red-500 text-sm col-span-3 col-start-2">
                    {formErrors.category}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">
                  Status
                </Label>
                <Select
                  defaultValue="active"
                  value={formData.status}
                  onValueChange={(value) => handleSelectField(value, "status")}
                >
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

              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="description" className="text-right pt-2">
                  Description
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  className="col-span-3"
                  placeholder="Provide a description of the project"
                  rows={3}
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateProject}>Create Project</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <SummaryMetrics />

      <FormSubmissions />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <KpiHighlights />
          <div className="lg:col-span-2 py-6">
            <BeneficiaryDemographics />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-1 py-6 gap-6 mb-6">
            <ServiceDelivery />
          </div>
        </div>
        <div className=" space-y-6">
          <SyncStatus />
          <SystemAlerts />
          <RecentActivity />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6"></div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div>{/* Empty space for future components or expansion */}</div>
      </div>
    </>
  );
}
