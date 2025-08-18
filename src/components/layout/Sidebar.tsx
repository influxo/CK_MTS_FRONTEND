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
import { useState } from "react";
import * as Collapsible from "@radix-ui/react-collapsible";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchSubProjectsByProjectId,
  selectAllSubprojects,
  selectSubprojectsError,
  selectSubprojectsLoading,
} from "../../store/slices/subProjectSlice";
import type { AppDispatch } from "../../store";

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
  const [expandedProjectIds, setExpandedProjectIds] = useState<string[]>([]);

  const dispatch = useDispatch<AppDispatch>();
  const subprojects = useSelector(selectAllSubprojects);
  const subprojectsLoading = useSelector(selectSubprojectsLoading);
  const subprojectsError = useSelector(selectSubprojectsError);
  const navigate = useNavigate();
  const { logout } = useAuth();

  const location = useLocation();
  const matchProject = matchPath("/projects/:projectId", location.pathname);
  const matchSubproject = matchPath(
    "/projects/:projectId/subprojects/:subprojectId",
    location.pathname
  );
  const selectedProjectId =
    matchSubproject?.params.projectId || matchProject?.params.projectId;

  const toggleProjectSubprojects = (projectId: string) => {
    const alreadyExpanded = expandedProjectIds.includes(projectId);

    if (alreadyExpanded) {
      setExpandedProjectIds(
        expandedProjectIds.filter((id) => id !== projectId)
      );
    } else {
      setExpandedProjectIds([...expandedProjectIds, projectId]);
      dispatch(fetchSubProjectsByProjectId({ projectId }));
    }
  };

  const handleNavClick = () => {
    if (onCloseMobile) onCloseMobile();
  };

  const navItems = [
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
  ];

  return (
    <aside
      style={{
        boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
      }}
      className={cn(
        "flex flex-col  bg-sidebar bg-white shadow-lg text-sidebar-foreground transition-all duration-300 ease-in-out",
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
            <PieChart className="h-6 w-6 text-sidebar-primary" />
            <h1 className="font-semibold text-lg">CaritasMotherTeresa</h1>
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
          {navItems.map((item) =>
            item.title === "Projects" ? (
              <div key={item.to}>
                <button
                  onClick={() => setIsProjectsExpanded(!isProjectsExpanded)}
                  className={cn(
                    "relative flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors w-full text-left",
                    "before:absolute before:top-0 before:bottom-0 before:left-0 before:w-[4px] before:bg-black before:origin-left before:scale-x-0 before:transition-transform before:duration-300 before:rounded-l-full",
                    isProjectsExpanded
                      ? "text-black bg-black bg-opacity-5 before:scale-x-100"
                      : "text-black hover:text-black hover:bg-black hover:bg-opacity-5 before:scale-x-0",
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
                    {projectsLoading && (
                      <span className="text-xs text-gray-400">Loading...</span>
                    )}
                    {projectsError && (
                      <span className="text-xs text-black">
                        Error loading projects
                      </span>
                    )}
                    {projects?.map((project) => {
                      const relatedSubprojects = subprojects.filter(
                        (sp) => sp.projectId === project.id
                      );
                      const isProjectExpanded =
                        expandedProjectIds.includes(project.id) ||
                        selectedProjectId === project.id;
                      const isSelected = selectedProjectId === project.id;

                      return (
                        <div key={project.id} className="mb-1">
                          <button
                            onClick={() => {
                              toggleProjectSubprojects(project.id);
                              navigate(`/projects/${project.id}`);
                            }}
                            className={cn(
                              "flex items-center capitalize w-full text-left rounded-md px-2 py-1 text-sm transition-colors",
                              isSelected
                                ? "bg-black bg-opacity-5  text-black"
                                : "text-black hover:bg-black hover:bg-opacity-5 hover:text-black"
                            )}
                          >
                            {project.name}
                            {relatedSubprojects.length > 0 && (
                              <ChevronRight
                                className={cn(
                                  "ml-auto transition-transform duration-300",
                                  isProjectExpanded && "rotate-90"
                                )}
                                size={16}
                              />
                            )}
                          </button>

                          {/* Subprojects */}
                          {relatedSubprojects.length > 0 && (
                            <Collapsible.Root
                              open={isProjectExpanded}
                              onOpenChange={(open) =>
                                toggleProjectSubprojects(project.id)
                              }
                            >
                              <Collapsible.Content
                                className={cn(
                                  "data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down overflow-hidden ml-4",
                                  collapsed && "ml-0"
                                )}
                              >
                                {subprojectsLoading && isProjectExpanded && (
                                  <span className="text-xs text-gray-400">
                                    Loading subprojects...
                                  </span>
                                )}
                                {subprojectsError && isProjectExpanded && (
                                  <span className="text-xs text-black">
                                    Error loading subprojects
                                  </span>
                                )}
                                {relatedSubprojects.map((subproject) => (
                                  <NavLink
                                    key={subproject.id}
                                    to={`/projects/${project.id}/subprojects/${subproject.id}`}
                                    className={({ isActive }) =>
                                      cn(
                                        "block text-sm px-8 py-1 mt-1 rounded-md transition-colors capitalize",
                                        isActive
                                          ? "bg-black bg-opacity-5 text-black"
                                          : "text-black hover:bg-black hover:bg-opacity-5 hover:text-black"
                                      )
                                    }
                                    onClick={handleNavClick}
                                  >
                                    {subproject.name}
                                  </NavLink>
                                ))}
                              </Collapsible.Content>
                            </Collapsible.Root>
                          )}
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
                    "before:absolute before:top-0 before:bottom-0 before:left-0 before:w-[4px] before:bg-black  before:origin-left before:scale-x-0 before:transition-transform before:duration-300 before:rounded-l-full",
                    isActive
                      ? "text-black bg-black bg-opacity-5 before:scale-x-100"
                      : "text-black hover:text-black hover:bg-black hover:bg-opacity-5 before:scale-x-0",
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
