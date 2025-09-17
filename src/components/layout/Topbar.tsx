// No state needed for light-mode only application
import {
  Bell,
  ChevronDown,
  LogOut,
  Menu,
  Plus,
  Search,
  Settings,
  User,
} from "lucide-react";
import { useState } from "react";
import { createPortal } from "react-dom";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { selectCurrentUser } from "../../store/slices/authSlice";
import { Button } from "../ui/button/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/data-display/avatar";
import { Input } from "../ui/form/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/overlay/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "../ui/overlay/sheet";
import type { CreateProjectRequest } from "../../services/projects/projectModels";
import type { AppDispatch } from "../../store";
import { createProject } from "../../store/slices/projectsSlice";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/overlay/dialog";
import { Label } from "../ui/form/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/form/select";
import { Textarea } from "../ui/form/textarea";

interface TopbarProps {
  title?: string;
  toggleMobileSidebar?: () => void;
  isMobileMenuOpen?: boolean;
}

export function Topbar({ title, toggleMobileSidebar }: TopbarProps) {
  // Light mode only - no dark mode toggle
  const [notifOpen, setNotifOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector(selectCurrentUser);

  const [formData, setFormData] = useState<CreateProjectRequest>({
    name: "",
    category: "",
    status: "active",
    description: "",
  });
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
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
    // <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6">
    <header
      style={{ boxShadow: "0 1px 10px rgba(0, 0, 0, 0.1)" }}
      className="sticky top-0 z-40 flex h-16 items-center bg-white gap-4 px-4 sm:px-6"
    >
      <div className="flex flex-1 items-center gap-4">
        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={toggleMobileSidebar}
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Title (visible on mobile) */}
        {title && <h1 className="font-medium hidden sm:block">{title}</h1>}

        {/* Search */}
        <div className="relative hidden sm:block max-w-[400px] w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search..." className="pl-9 w-full bg-gray-100" />
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Mobile Search */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="sm:hidden">
              <Search className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="top" className="pt-10">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search anything..." className="pl-9 w-full" />
            </div>
          </SheetContent>
        </Sheet>

        {/* No theme toggle - light mode only */}

        {/* Create Project */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#2E343E] text-white flex ">
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

        {/* Notifications */}
        <DropdownMenu open={notifOpen} onOpenChange={setNotifOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500"></span>
            </Button>
          </DropdownMenuTrigger>
          {/* Dark overlay behind the dropdown when open, rendered to body to cover the whole page */}
          {notifOpen &&
            createPortal(
              <div
                className="fixed inset-0 bg-black/20 z-[60]"
                onClick={() => setNotifOpen(false)}
              />,
              document.body
            )}
          <DropdownMenuContent
            align="end"
            className="w-[300px] bg-white z-[70]"
          >
            <div className="flex items-center justify-between p-2">
              <span className="font-medium">Notifications</span>
              <Button variant="ghost" size="sm">
                Mark all as read
              </Button>
            </div>
            <DropdownMenuSeparator />
            <div className="max-h-[300px] overflow-auto">
              <div className="p-3 hover:bg-muted cursor-pointer">
                <div className="flex gap-3 items-start">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>JS</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm">
                      <span className="font-medium">Jane Smith</span> invited
                      you to{" "}
                      <span className="font-medium">
                        Rural Healthcare Initiative
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      2 hours ago
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-3 hover:bg-muted cursor-pointer">
                <div className="flex gap-3 items-start">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>ML</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm">
                      <span className="font-medium">Michael Lee</span> commented
                      on your report
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      5 hours ago
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-3 hover:bg-muted cursor-pointer bg-muted/40">
                <div className="flex gap-3 items-start">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>SYS</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm">Weekly system update completed</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Yesterday
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <DropdownMenuSeparator />
            <div className="p-2 text-center">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-center"
              >
                View all notifications
              </Button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-2"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src="" alt="User" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <span className="text-sm font-normal hidden sm:inline-block">
                {user?.firstName} {user?.lastName}
              </span>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-white">
            <DropdownMenuItem onSelect={() => navigate("/dashboard/profile")}>
              <User className="h-4 w-4 mr-2" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-500">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
