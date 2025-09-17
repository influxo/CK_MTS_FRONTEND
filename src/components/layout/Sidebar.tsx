import { NavLink, useNavigate, useLocation, matchPath } from "react-router-dom";
import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  PieChart,
  Users,
  X,
} from "lucide-react";
import { Button } from "../ui/button/button";
import { ScrollArea } from "../ui/layout/scroll-area";
import { cn } from "../ui/utils/utils";
import { useAuth } from "../../hooks/useAuth";
import type { Project } from "../../services/projects/projectModels";
import { useEffect, useMemo, useState } from "react";
import * as Collapsible from "@radix-ui/react-collapsible";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch } from "../../store";
import {
  fetchUserProjectsByUserId,
  selectUserProjectsError,
  selectUserProjectsLoading,
  selectUserProjectsTree,
} from "../../store/slices/userProjectsSlice";

interface SidebarProps {
  collapsed?: boolean;
  isMobile?: boolean;
  onToggleCollapse?: () => void;
  onCloseMobile?: () => void;
  mobileOpen?: boolean;
  projects?: Project[];
  projectsLoading?: boolean;
  projectsError?: string | null;
}

export function Sidebar({
  collapsed = false,
  onToggleCollapse,
  onCloseMobile,
  mobileOpen = false,
  projects,
  projectsLoading,
  projectsError,
}: SidebarProps) {
  const [isProjectsExpanded, setIsProjectsExpanded] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { logout, user, isLoading: authLoading } = useAuth();
  const userProjectsTree = useSelector(selectUserProjectsTree);
  const userProjectsLoading = useSelector(selectUserProjectsLoading);
  const userProjectsError = useSelector(selectUserProjectsError);

  const location = useLocation();
  const matchProject = matchPath("/projects/:projectId", location.pathname);
  const selectedProjectId = matchProject?.params.projectId;

  const handleNavClick = () => {
    if (onCloseMobile) onCloseMobile();
  };

  // Role helpers
  const normalizedRoles = useMemo(
    () => (user?.roles || []).map((r) => r.name?.toLowerCase?.() || ""),
    [user?.roles]
  );
  const isSysOrSuperAdmin = useMemo(() => {
    // Accept a variety of backend-provided naming conventions
    return normalizedRoles.some((r) =>
      r === "sysadmin" ||
      r === "superadmin" ||
      r.includes("system admin") || // matches "system administrator", "system-admin"
      r.includes("super admin") // matches "super administrator", "super-admin"
    );
  }, [normalizedRoles]);
  const isFieldOperator = useMemo(() => {
    // Match common variants
    return (
      normalizedRoles.includes("field operator") ||
      normalizedRoles.includes("field-operator") ||
      normalizedRoles.includes("fieldoperator") ||
      normalizedRoles.includes("field_op") ||
      // Fallback: contains "field" and "operator"
      normalizedRoles.some((r) => r.includes("field") && r.includes("operator"))
    );
  }, [normalizedRoles]);

  // Build navigation items based on role
  const fullNavItems = useMemo(
    () => [
      {
        title: "Dashboard",
        icon: <LayoutDashboard className="h-5 w-5" />,
        to: "/dashboard",
      },
      {
        title: "Projects",
        icon: <FolderKanban className="h-5 w-5" />,
        to: "/projects",
      },
      {
        title: "Beneficiaries",
        icon: <Users className="h-5 w-5" />,
        to: "/beneficiaries",
      },
      {
        title: "Forms",
        icon: <ClipboardList className="h-5 w-5" />,
        to: "/forms",
      },
      {
        title: "Data Entry",
        icon: <ClipboardList className="h-5 w-5" />,
        to: "/data-entry",
      },
      {
        title: "Reports",
        icon: <BarChart3 className="h-5 w-5" />,
        to: "/reports",
      },
      {
        title: "Employees",
        icon: <Users className="h-5 w-5" />,
        to: "/employees",
      },
    ],
    []
  );

  const navItems = useMemo(() => {
    if (isFieldOperator && !isSysOrSuperAdmin) {
      // Field operators should see Dashboard, Projects and Data Entry only
      return fullNavItems.filter((i) =>
        ["Dashboard", "Projects", "Data Entry"].includes(i.title)
      );
    }
    return fullNavItems;
  }, [fullNavItems, isFieldOperator, isSysOrSuperAdmin]);

  // Load user's assigned projects if not admin
  useEffect(() => {
    if (!isSysOrSuperAdmin && user?.id) {
      dispatch(fetchUserProjectsByUserId(String(user.id)));
    }
  }, [dispatch, isSysOrSuperAdmin, user?.id]);

  type SimpleProject = { id: string; name: string };
  const visibleProjects: SimpleProject[] = useMemo(() => {
    if (isSysOrSuperAdmin) {
      return (projects || []).map((p) => ({ id: p.id, name: p.name }));
    }
    return (userProjectsTree || []).map((p) => ({ id: p.id, name: p.name }));
  }, [isSysOrSuperAdmin, projects, userProjectsTree]);

  const isProjectsLoading = isSysOrSuperAdmin
    ? !!projectsLoading
    : !!userProjectsLoading;
  const projectsErrMsg = isSysOrSuperAdmin ? projectsError : userProjectsError;

  return (
    <aside
      style={{
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.08)",
      }}
      className={cn(
        "flex flex-col  bg-sidebar bg-[#F5F5F5] bg-opacity-20 shadow-lg text-sidebar-foreground transition-all duration-300 ease-in-out",
        collapsed ? "w-[70px]" : "w-[240px]",
        "lg:relative fixed inset-y-0 left-0 z-50 lg:z-auto transform",
        mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        "lg:shadow-none",
        mobileOpen && "shadow-xl"
      )}
    >
      <div
        className={cn(
          "flex h-16 items-center  px-4",
          collapsed ? "justify-center" : "justify-between"
        )}
      >
        {!collapsed && (
          <NavLink to="/dashboard" className="flex items-center gap-2">
            <img
              src="/images/logo.jpg"
              alt="Caritas Mother Teresa"
              className=" w-auto object-center h-20"
            />
          </NavLink>
        )}
        {collapsed && !mobileOpen && (
          <PieChart className="h-6 w-6 text-sidebar-primary" />
        )}
        {!mobileOpen ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleCollapse}
            className={cn(
              "text-sidebar-foreground/60 hover:text-sidebar-foreground",
              collapsed && "hidden"
            )}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            onClick={onCloseMobile}
            className="text-sidebar-foreground/60 hover:text-sidebar-foreground"
          >
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      <ScrollArea className="flex-1 py-4">
        <nav className="flex flex-col gap-1 px-2">
          {authLoading || !user ? (
            <div className="px-2 py-2 text-xs text-gray-500">Loading menu…</div>
          ) : (
            <>
              {navItems.map((item) =>
                item.title === "Projects" ? (
                  <div key={item.to}>
                    <button
                      onClick={() => setIsProjectsExpanded(!isProjectsExpanded)}
                      className={cn(
                        "relative flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors w-full text-left",
                        "before:absolute before:top-0 before:bottom-0 before:left-0 before:w-[4px] before:bg-[#0073e6] before:origin-left before:scale-x-0 before:transition-transform before:duration-300 before:rounded-l-full",
                        isProjectsExpanded
                          ? "text-blue bg-blue-900 bg-opacity-5 before:scale-x-100"
                          : "text-black hover:text-black hover:bg-blue-100 hover:bg-opacity-5 before:scale-x-0",
                        collapsed && "justify-center px-2"
                      )}
                    >
                      <FolderKanban className="h-5 w-5" />
                      {!collapsed && (
                        <span className="ml-2 flex-1 text-left">Projects</span>
                      )}
                      {!collapsed && (
                        <ChevronRight
                          size={18}
                          className={cn(
                            "ml-auto transition-transform duration-300",
                            isProjectsExpanded && "rotate-90"
                          )}
                        />
                      )}
                    </button>

                    <Collapsible.Root
                      open={isProjectsExpanded}
                      onOpenChange={setIsProjectsExpanded}
                    >
                      <Collapsible.Content
                        className={cn(
                          "data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down overflow-hidden",
                          !collapsed && "ml-8 mt-1"
                        )}
                      >
                        {isProjectsLoading && (
                          <span className="text-xs text-gray-400">Loading...</span>
                        )}
                        {projectsErrMsg && (
                          <span className="text-xs text-black">
                            Error loading projects
                          </span>
                        )}
                        {visibleProjects?.map((project) => {
                          const isSelected = selectedProjectId === project.id;

                          return (
                            <div key={project.id} className="mb-1">
                              <button
                                onClick={() => {
                                  navigate(`/projects/${project.id}`);
                                  handleNavClick();
                                }}
                                className={cn(
                                  "flex items-center capitalize w-full text-left rounded-md px-2 py-1 text-sm transition-colors",
                                  isSelected
                                    ? "bg-[#0073e6]   bg-opacity-5  text-black"
                                    : "text-black hover:bg-[#0073e6] hover:bg-opacity-5 hover:text-black"
                                )}
                              >
                                {project.name}
                              </button>
                            </div>
                          );
                        })}
                      </Collapsible.Content>
                    </Collapsible.Root>
                  </div>
                ) : (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      cn(
                        "relative flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                        "before:absolute before:top-0 before:bottom-0 before:left-0 before:w-[4px] before:bg-[#0073e6]   before:origin-left before:scale-x-0 before:transition-transform before:duration-300 before:rounded-l-full",
                        isActive
                          ? "text-black bg-blue-900 bg-opacity-5 before:scale-x-100"
                          : "text-black hover:text-black hover:bg-blue-200 hover:bg-opacity-5 before:scale-x-0",
                        collapsed && "justify-center px-2"
                      )
                    }
                    onClick={handleNavClick}
                  >
                    {item.icon}
                    {!collapsed && <span className="ml-2">{item.title}</span>}
                  </NavLink>
                )
              )}
            </>
          )}
        </nav>
      </ScrollArea>

      <div className="mt-auto border-t p-4">
        {!collapsed && (
          <div className="flex items-center gap-2 mb-2">
            <div className="h-2 w-2 rounded-full bg-green-500"></div>
            <span className="text-xs text-sidebar-foreground/60">
              System Online
            </span>
          </div>
        )}

        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start font-normal text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-red-100 mb-2",
            collapsed && "justify-center px-2"
          )}
          onClick={logout}
        >
          <LogOut className={cn("h-5 w-5", !collapsed && "mr-2")} />
          {!collapsed && <span>Logout</span>}
        </Button>

        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start font-normal text-sidebar-foreground/60 hover:text-sidebar-foreground",
            collapsed && "justify-center px-2"
          )}
          onClick={onToggleCollapse}
        >
          {collapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5 mr-2" />
          )}
          {!collapsed && <span>Collapse</span>}
        </Button>
      </div>
    </aside>
  );
}
