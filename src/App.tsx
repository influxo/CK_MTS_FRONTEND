import { useState, useEffect } from "react";
import { Sidebar } from "./components/layout/Sidebar";
import { Topbar } from "./components/layout/Topbar";
import { Dashboard } from "./pages/Dashboard";
import { Projects } from "./pages/Projects";
import { Beneficiaries } from "./pages/Beneficiaries";
import { Forms } from "./pages/Forms";
import { Reports } from "./pages/Reports";
import { Employees } from "./pages/Employees";

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null
  );
  const [selectedSubProjectId, setSelectedSubProjectId] = useState<
    string | null
  >(null);
  const [selectedBeneficiaryId, setSelectedBeneficiaryId] = useState<
    string | null
  >(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if screen is mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setSidebarCollapsed(true);
      }
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);

    return () => {
      window.removeEventListener("resize", checkIfMobile);
    };
  }, []);

  const handleProjectSelect = (projectId: string) => {
    setSelectedProjectId(projectId);
    setSelectedSubProjectId(null);
  };

  const handleSubProjectSelect = (subProjectId: string) => {
    setSelectedSubProjectId(subProjectId);
  };

  const handleBeneficiarySelect = (beneficiaryId: string) => {
    setSelectedBeneficiaryId(beneficiaryId);
  };

  const handleBackToProjects = () => {
    setSelectedProjectId(null);
    setSelectedSubProjectId(null);
  };

  const handleBackToProject = () => {
    setSelectedSubProjectId(null);
  };

  const handleBackToBeneficiaries = () => {
    setSelectedBeneficiaryId(null);
  };

  const toggleMobileSidebar = () => {
    setMobileSidebarOpen(!mobileSidebarOpen);
  };

  // Get current page title
  const getCurrentPageTitle = () => {
    switch (activeTab) {
      case "dashboard":
        return "Dashboard";
      case "projects":
        return selectedSubProjectId
          ? "Sub-Project Details"
          : selectedProjectId
          ? "Project Details"
          : "Projects";
      case "beneficiaries":
        return selectedBeneficiaryId ? "Beneficiary Details" : "Beneficiaries";
      case "forms":
        return "Forms";
      case "reports":
        return "Reports";
      case "employees":
        return "Employees";
      default:
        return "ProjectPulse";
    }
  };

  const renderCurrentPage = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />;
      case "projects":
        return (
          <Projects
            selectedProjectId={selectedProjectId}
            selectedSubProjectId={selectedSubProjectId}
            onProjectSelect={handleProjectSelect}
            onSubProjectSelect={handleSubProjectSelect}
            onBackToProjects={handleBackToProjects}
            onBackToProject={handleBackToProject}
          />
        );
      case "beneficiaries":
        return (
          <Beneficiaries
            selectedBeneficiaryId={selectedBeneficiaryId}
            onBeneficiarySelect={handleBeneficiarySelect}
            onBackToBeneficiaries={handleBackToBeneficiaries}
          />
        );
      case "forms":
        return <Forms />;
      case "reports":
        return <Reports />;
      case "employees":
        return <Employees />;
      default:
        return <Dashboard />;
    }
  };

  return (
    // <div className="flex h-screen bg-background">
    <div className="flex h-screen">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        isMobile={isMobile}
        mobileOpen={mobileSidebarOpen}
        setMobileOpen={setMobileSidebarOpen}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Topbar
          title={getCurrentPageTitle()}
          toggleMobileSidebar={toggleMobileSidebar}
          isMobileMenuOpen={mobileSidebarOpen}
        />

        <main className="flex-1 overflow-auto p-6">{renderCurrentPage()}</main>

        {/* <footer className="border-t border-border p-4 text-center text-sm text-muted-foreground"> */}
        <footer className="border-t  p-4 text-center text-sm text-muted-foreground">
          © 2025 ProjectPulse. All rights reserved.
        </footer>
      </div>
    </div>
  );
}
