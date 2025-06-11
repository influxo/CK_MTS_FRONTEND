import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  FolderKanban,
  LayoutDashboard,
  PieChart,
  Users,
  X,
} from "lucide-react";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import { cn } from "../ui/utils";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  collapsed?: boolean;
  setCollapsed?: (collapsed: boolean) => void;
  isMobile?: boolean;
  mobileOpen?: boolean;
  setMobileOpen?: (open: boolean) => void;
}

export function Sidebar({
  activeTab,
  onTabChange,
  collapsed = false,
  setCollapsed,
  isMobile = false,
  mobileOpen = false,
  setMobileOpen,
}: SidebarProps) {
  // Navigation items
  const navItems = [
    {
      title: "Dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
      value: "dashboard",
    },
    {
      title: "Projects",
      icon: <FolderKanban className="h-5 w-5" />,
      value: "projects",
    },
    {
      title: "Beneficiaries",
      icon: <Users className="h-5 w-5" />,
      value: "beneficiaries",
    },
    {
      title: "Forms",
      icon: <ClipboardList className="h-5 w-5" />,
      value: "forms",
    },
    {
      title: "Reports",
      icon: <BarChart3 className="h-5 w-5" />,
      value: "reports",
    },
    {
      title: "Employees",
      icon: <Users className="h-5 w-5" />,
      value: "employees",
    },
  ];

  // Handle navigation item click
  const handleNavClick = (value: string) => {
    onTabChange(value);

    // Close mobile sidebar if applicable
    if (isMobile && setMobileOpen) {
      setMobileOpen(false);
    }
  };

  return (
    <aside
      className={cn(
        "flex flex-col border-r bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out",
        collapsed ? "w-[70px]" : "w-[240px]",
        isMobile && "fixed inset-y-0 left-0 z-50 shadow-xl",
        isMobile && !mobileOpen && "hidden"
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
          <div className="flex items-center gap-2">
            <PieChart className="h-6 w-6 text-sidebar-primary" />
            <h1 className="font-semibold text-lg">ProjectPulse</h1>
          </div>
        )}

        {collapsed && !isMobile && (
          <PieChart className="h-6 w-6 text-sidebar-primary" />
        )}

        {!isMobile ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed && setCollapsed(!collapsed)}
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
            onClick={() => setMobileOpen && setMobileOpen(false)}
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
            <Button
              key={item.value}
              variant={activeTab === item.value ? "sidebar" : "ghost"}
              className={cn(
                "justify-start font-normal",
                activeTab === item.value
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50",
                collapsed && "justify-center px-2"
              )}
              onClick={() => handleNavClick(item.value)}
            >
              {item.icon}
              {!collapsed && <span className="ml-2">{item.title}</span>}
            </Button>
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
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start font-normal text-sidebar-foreground/60 hover:text-sidebar-foreground",
            collapsed && "justify-center px-2"
          )}
          onClick={() => setCollapsed && setCollapsed(!collapsed)}
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
