// No state needed for light-mode only application
import { ChevronDown, LogOut, Menu, Plus, Search, User } from "lucide-react";
import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useTranslation } from "../../hooks/useTranslation";
import type { CreateProjectRequest } from "../../services/projects/projectModels";
import { KOSOVO_CITIES } from "../../utils/cities";
import type { AppDispatch } from "../../store";
import { selectCurrentUser } from "../../store/slices/authSlice";
import { createProject } from "../../store/slices/projectsSlice";
import { LanguageSwitcher } from "../LanguageSwitcher";
import { Button } from "../ui/button/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/data-display/avatar";
import { Input } from "../ui/form/input";
import { Label } from "../ui/form/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/form/select";
import { Textarea } from "../ui/form/textarea";
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/overlay/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "../ui/overlay/sheet";

interface TopbarProps {
  title?: string;
  toggleMobileSidebar?: () => void;
  isMobileMenuOpen?: boolean;
}

export function Topbar({ title, toggleMobileSidebar }: TopbarProps) {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector(selectCurrentUser);

  const { t } = useTranslation();

  // Determine role
  const normalizedRoles = useMemo(
    () => (user?.roles || []).map((r: any) => r.name?.toLowerCase?.() || ""),
    [user?.roles],
  );
  const isSysOrSuperAdmin = useMemo(() => {
    return normalizedRoles.some(
      (r: string) =>
        r === "sysadmin" ||
        r === "superadmin" ||
        r.includes("system admin") ||
        r.includes("super admin"),
    );
  }, [normalizedRoles]);

  const [formData, setFormData] = useState<CreateProjectRequest>({
    name: "",
    category: "",
    status: "active",
    description: "",
    city: "",
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
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
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
        city: "",
      });
    }
  };

  // Check if all required fields are filled
  const isFormValid =
    formData.name.trim() !== "" && formData.category.trim() !== "";

  return (
    // <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6">
    <header
      style={{ boxShadow: "0 1px 4px rgba(0, 0, 0, 0.05)" }}
      className="sticky top-0 z-40 flex h-16 items-center bg-white gap-4 px-4 sm:px-6"
    >
      <div className="flex flex-1 items-center gap-4">
        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={toggleMobileSidebar}
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Title (visible on mobile) */}
        {title && <h1 className="font-medium hidden sm:block">{title}</h1>}

        {/* Search */}
        {/* <div className="relative hidden sm:block max-w-[400px] w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search..." className="pl-9 w-full bg-gray-100" />
        </div> */}
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

        {/* Language Switcher */}
        <LanguageSwitcher />

        {/* Create Project */}
        {isSysOrSuperAdmin && (
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button
                className="bg-[#0073e6] text-white flex items-center
             px-4 py-2 rounded-md border-0
             transition-transform duration-200 ease-in-out
             hover:scale-[1.02] hover:-translate-y-[1px]"
              >
                <Plus className="h-4 w-4 mr-2" />
                {t("createProject")}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px]">
              <DialogHeader>
                <DialogTitle>{t("projects.createNewProject")}</DialogTitle>
                <DialogDescription>
                  {t("projects.provideDescription")}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="title" className="text-right">
                    {t("projects.projectTitle")} *
                  </Label>
                  <Input
                    id="title"
                    name="name"
                    className={`col-span-3 border-0 bg-blue-50 ${
                      formErrors.name ? "border-red-500" : ""
                    }`}
                    placeholder="Titulli i projektit"
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
                    {t("projects.projectCategory")} *
                  </Label>
                  <Input
                    id="category"
                    name="category"
                    className={`col-span-3 border-0 bg-blue-50 ${
                      formErrors.category ? "border-red-500" : ""
                    }`}
                    placeholder="Kategoria e projektit"
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
                  <Label htmlFor="city" className="text-right">
                    {t("projects.city")}
                  </Label>
                  <Select
                    value={formData.city || ""}
                    onValueChange={(value) => handleSelectField(value, "city")}
                  >
                    <SelectTrigger className="col-span-3 bg-blue-50 border-0">
                      <SelectValue placeholder={t("projects.selectCity")} />
                    </SelectTrigger>
                    <SelectContent className="max-h-64">
                      {KOSOVO_CITIES.map((cityName) => (
                        <SelectItem key={cityName} value={cityName}>
                          {cityName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="status" className="text-right">
                    {t("projects.projectStatus")}
                  </Label>
                  <Select
                    defaultValue="active"
                    value={formData.status}
                    onValueChange={(value) =>
                      handleSelectField(value, "status")
                    }
                  >
                    <SelectTrigger className="col-span-3 bg-blue-50 border-0">
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
                    {t("projects.projectDescription")}
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    className="col-span-3 bg-blue-50 border-0"
                    placeholder="Përshkrimi i projektit"
                    rows={3}
                    value={formData.description}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  className="bg-blue-100 border-0"
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  {t("common.cancel")}
                </Button>
                <Button
                  onClick={handleCreateProject}
                  className="bg-[#0073e6] border-0 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!isFormValid}
                >
                  {t("projects.createProject")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

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
                <AvatarFallback>
                  {`${user?.firstName?.[0] ?? ""}${user?.lastName?.[0] ?? ""}`.toUpperCase()}
                </AvatarFallback>
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
