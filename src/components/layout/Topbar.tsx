// No state needed for light-mode only application
import {
  Bell,
  ChevronDown,
  LogOut,
  Menu,
  Search,
  Settings,
  User,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/data-display/avatar";
import { Button } from "../ui/button/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/overlay/dropdown-menu";
import { Input } from "../ui/form/input";
import { Sheet, SheetContent, SheetTrigger } from "../ui/overlay/sheet";
import { createPortal } from "react-dom";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchUserProfile,
  selectCurrentUser,
} from "../../store/slices/authSlice";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch } from "../../store";

interface TopbarProps {
  title?: string;
  toggleMobileSidebar?: () => void;
  isMobileMenuOpen?: boolean;
}

export function Topbar({ title, toggleMobileSidebar }: TopbarProps) {
  // Light mode only - no dark mode toggle
  const [notifOpen, setNotifOpen] = useState(false);
  const navigate = useNavigate();

  // const dispatch = useDispatch<AppDispatch>();
  // dispatch(fetchUserProfile());

  const user = useSelector(selectCurrentUser);
  console.log("user from topbar", user);

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
