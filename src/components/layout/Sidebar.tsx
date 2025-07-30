import { NavLink } from "react-router-dom";
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

interface SidebarProps {
  collapsed?: boolean;
  isMobile?: boolean;
  onToggleCollapse?: () => void;
  onCloseMobile?: () => void;
  mobileOpen?: boolean;
  projects?: Project[]; // <-- Add this
  projectsLoading?: boolean; // optional
  projectsError?: string | null; // optional
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
  // Navigation items
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

  const [isExpanded, setIsExpanded] = useState(false);

  // Close mobile sidebar when clicking a nav item
  const handleNavClick = () => {
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const { logout } = useAuth();

  return (
    <aside
      className={cn(
        "flex flex-col border-r bg-sidebar bg-gray-50 text-sidebar-foreground transition-all duration-300 ease-in-out",
        collapsed ? "w-[70px]" : "w-[240px]",
        "lg:relative fixed inset-y-0 left-0 z-50 lg:z-auto transform",
        mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        "lg:shadow-none",
        mobileOpen && "shadow-xl"
      )}
    >
      {/* Sidebar Header */}
      <div
        className={cn(
          "flex h-16 items-center border-b px-4",
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

      {/* Navigation */}

      <ScrollArea className="flex-1 py-4">
        <nav className="flex flex-col gap-1 px-2">
          {navItems.map((item) => {
            // if (item.title === "Projects") {
            //   return (
            //     <div key={item.to} className="flex flex-col">
            //       <button
            //         onClick={() => setIsExpanded((prev) => !prev)}
            //         className={cn(
            //           "relative flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors w-full text-left",
            //           "before:absolute before:top-0 before:bottom-0 before:left-0 before:w-[4px] before:bg-red-600 before:origin-left before:scale-x-0 before:transition-transform before:duration-300 before:rounded-l-full",
            //           isExpanded
            //             ? "text-red-700 bg-red-50 before:scale-x-100"
            //             : "text-gray-600 hover:text-red-600 hover:bg-gray-50 before:scale-x-0",
            //           collapsed && "justify-center px-2"
            //         )}
            //       >
            //         {item.icon}
            //         {!collapsed && (
            //           <span className="ml-2 flex-1 text-left">
            //             {item.title}
            //           </span>
            //         )}
            //       </button>

            //       {!collapsed && isExpanded && projects && (
            //         <div className="ml-8 mt-1 flex flex-col gap-1">
            //           {projectsLoading && (
            //             <span className="text-xs text-gray-400">
            //               Loading...
            //             </span>
            //           )}
            //           {projectsError && (
            //             <span className="text-xs text-red-500">
            //               Error loading projects
            //             </span>
            //           )}
            //           {projects.map((project) => (
            //             <NavLink
            //               key={project.id}
            //               to={`/projects/${project.id}`}
            //               className={({ isActive }) =>
            //                 cn(
            //                   "text-sm px-2 py-1 rounded-md transition-colors",
            //                   isActive
            //                     ? "bg-red-100 text-red-700"
            //                     : "text-gray-600 hover:bg-gray-100 hover:text-red-600"
            //                 )
            //               }
            //               onClick={handleNavClick}
            //             >
            //               {project.name}
            //             </NavLink>
            //           ))}
            //         </div>
            //       )}
            //     </div>
            //   );
            // }

            // Render all other nav items as usual
            if (item.title === "Projects") {
              return (
                <Collapsible.Root
                  key={item.to}
                  open={isExpanded}
                  onOpenChange={setIsExpanded}
                >
                  <Collapsible.Trigger asChild>
                    <button
                      className={cn(
                        "relative flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors w-full text-left",
                        "before:absolute before:top-0 before:bottom-0 before:left-0 before:w-[4px] before:bg-red-600 before:origin-left before:scale-x-0 before:transition-transform before:duration-300 before:rounded-l-full",
                        isExpanded
                          ? "text-red-700 bg-red-50 before:scale-x-100"
                          : "text-gray-600 hover:text-red-600 hover:bg-gray-50 before:scale-x-0",
                        collapsed && "justify-center px-2"
                      )}
                    >
                      {item.icon}
                      {!collapsed && (
                        <span className="ml-2 flex-1 text-left">
                          {item.title}
                        </span>
                      )}
                    </button>
                  </Collapsible.Trigger>

                  {/* Animated dropdown content */}
                  <Collapsible.Content
                    className={cn(
                      "data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down overflow-hidden",
                      !collapsed && "ml-8 mt-1"
                    )}
                  >
                    {projects && (
                      <div className="flex flex-col gap-1">
                        {projectsLoading && (
                          <span className="text-xs text-gray-400">
                            Loading...
                          </span>
                        )}
                        {projectsError && (
                          <span className="text-xs text-red-500">
                            Error loading projects
                          </span>
                        )}
                        {projects.map((project) => (
                          <NavLink
                            key={project.id}
                            to={`/projects/${project.id}`}
                            className={({ isActive }) =>
                              cn(
                                "text-sm px-2 py-1 rounded-md transition-colors",
                                isActive
                                  ? "bg-red-100 text-red-700"
                                  : "text-gray-600 hover:bg-gray-100 hover:text-red-600"
                              )
                            }
                            onClick={handleNavClick}
                          >
                            {project.name}
                          </NavLink>
                        ))}
                      </div>
                    )}
                  </Collapsible.Content>
                </Collapsible.Root>
              );
            }
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "relative flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    "before:absolute before:top-0 before:bottom-0 before:left-0 before:w-[4px] before:bg-red-600 before:origin-left before:scale-x-0 before:transition-transform before:duration-300 before:rounded-l-full",
                    isActive
                      ? "text-red-700 bg-red-50 before:scale-x-100"
                      : "text-gray-600 hover:text-red-600 hover:bg-gray-50 before:scale-x-0",
                    collapsed && "justify-center px-2"
                  )
                }
                onClick={handleNavClick}
              >
                {item.icon}
                {!collapsed && <span className="ml-2">{item.title}</span>}
              </NavLink>
            );
          })}
        </nav>
      </ScrollArea>

      {/* Sidebar Footer */}
      <div className="mt-auto border-t p-4">
        {!collapsed && (
          <div className="flex items-center gap-2 mb-2">
            <div className="h-2 w-2 rounded-full bg-green-500"></div>
            <span className="text-xs text-sidebar-foreground/60">
              System Online
            </span>
          </div>
        )}

        {/* Logout Button */}
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
