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
import { useEffect } from "react";
import getApiUrl from "../../services/apiUrl";
import { useAuth } from "../../hooks/useAuth";

interface SidebarProps {
  collapsed?: boolean;
  isMobile?: boolean;
  onToggleCollapse?: () => void;
  onCloseMobile?: () => void;
  mobileOpen?: boolean;
}

export function Sidebar({
  collapsed = false,
  onToggleCollapse,
  onCloseMobile,
  mobileOpen = false,
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

  // Close mobile sidebar when clicking a nav item
  const handleNavClick = () => {
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const { logout } = useAuth();

  useEffect(() => {
    const apiUrl = getApiUrl();
    console.log("apiurl ", apiUrl);
  }, []);

  return (
    <aside
      className={cn(
        "flex flex-col border-r bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out",
        collapsed ? "w-[70px]" : "w-[240px]",
        mobileOpen && "fixed inset-y-0 left-0 z-50 shadow-xl",
        mobileOpen && !mobileOpen && "hidden"
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
            <h1 className="font-semibold text-lg">ProjectPulse</h1>
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
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                  collapsed && "justify-center px-2"
                )
              }
              onClick={handleNavClick}
            >
              {item.icon}
              {!collapsed && <span className="ml-2">{item.title}</span>}
            </NavLink>
          ))}
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