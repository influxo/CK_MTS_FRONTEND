import { ChevronDown } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/data-display/avatar";

interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function Header({ activeTab, onTabChange }: HeaderProps) {
  return (
    // <header className="border-b border-border px-6 py-3 flex items-center justify-between bg-card">
    <header className="border-b  px-6 py-3 flex items-center justify-between bg-card">
      <div className="flex items-center gap-6">
        <h1 className="font-medium">ProjectPulse</h1>
        <nav className="flex items-center gap-5">
          <a
            href="#"
            className={`py-1.5 ${
              activeTab === "dashboard"
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground"
            }`}
            onClick={(e) => {
              e.preventDefault();
              onTabChange("dashboard");
            }}
          >
            Dashboard
          </a>
          <a
            href="#"
            className={`py-1.5 ${
              activeTab === "projects"
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground"
            }`}
            onClick={(e) => {
              e.preventDefault();
              onTabChange("projects");
            }}
          >
            Projects
          </a>
          <a
            href="#"
            className={`py-1.5 ${
              activeTab === "beneficiaries"
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground"
            }`}
            onClick={(e) => {
              e.preventDefault();
              onTabChange("beneficiaries");
            }}
          >
            Beneficiaries
          </a>
          <a
            href="#"
            className={`py-1.5 ${
              activeTab === "forms"
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground"
            }`}
            onClick={(e) => {
              e.preventDefault();
              onTabChange("forms");
            }}
          >
            Forms
          </a>
          <a
            href="#"
            className={`py-1.5 ${
              activeTab === "reports"
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground"
            }`}
            onClick={(e) => {
              e.preventDefault();
              onTabChange("reports");
            }}
          >
            Reports
          </a>
          <a
            href="#"
            className={`py-1.5 ${
              activeTab === "employees"
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground"
            }`}
            onClick={(e) => {
              e.preventDefault();
              onTabChange("employees");
            }}
          >
            Employees
          </a>
        </nav>
      </div>
      <div className="flex items-center gap-3">
        {/* <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
        </Button> */}
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src="" alt="User" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          <span className="text-muted-foreground">John Doe</span>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>
    </header>
  );
}
