import { useState, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { Sidebar } from "./components/layout/Sidebar";
import { Topbar } from "./components/layout/Topbar";
import { Dashboard } from "./pages/Dashboard";
import { Projects } from "./pages/Projects";
import { Beneficiaries } from "./pages/Beneficiaries";
import { Forms } from "./pages/Forms";
import { Reports } from "./pages/Reports";
import { Employees } from "./pages/Employees";

function AppContent() {
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
  const [ _isMobile,setIsMobile] = useState(false);
  const location = useLocation();

  // Get current page title based on route
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.startsWith("/projects")) {
      return selectedSubProjectId ? "Sub-Project Details" : "Projects";
    } else if (path.startsWith("/beneficiaries")) {
      return selectedBeneficiaryId ? "Beneficiary Details" : "Beneficiaries";
    }
    return path === "/"
      ? "Dashboard"
      : path.charAt(1).toUpperCase() + path.slice(2);
  };

  useEffect(() => {
    const checkIfMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarCollapsed(true);
      }
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  const handleProjectSelect = (projectId: string) => {
    setSelectedProjectId(projectId);
    setSelectedSubProjectId(null);
  };

  const handleSubProjectSelect = (subProjectId: string) => {
    setSelectedSubProjectId(subProjectId);
  };

  const handleBackToProjects = () => {
    setSelectedProjectId(null);
    setSelectedSubProjectId(null);
  };

  const handleBackToProject = () => {
    setSelectedSubProjectId(null);
  };

  const handleBeneficiarySelect = (beneficiaryId: string) => {
    setSelectedBeneficiaryId(beneficiaryId);
  };

  const handleBackToBeneficiaries = () => {
    setSelectedBeneficiaryId(null);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        collapsed={sidebarCollapsed}
        mobileOpen={mobileSidebarOpen}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar
          title={getPageTitle()}
          toggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          isMobileMenuOpen={mobileSidebarOpen}
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route
              path="/projects"
              element={
                <Projects
                  selectedProjectId={selectedProjectId}
                  selectedSubProjectId={selectedSubProjectId}
                  onProjectSelect={handleProjectSelect}
                  onSubProjectSelect={handleSubProjectSelect}
                  onBackToProjects={handleBackToProjects}
                  onBackToProject={handleBackToProject}
                />
              }
            />
            <Route
              path="/beneficiaries"
              element={
                <Beneficiaries
                  selectedBeneficiaryId={selectedBeneficiaryId}
                  onBeneficiarySelect={handleBeneficiarySelect}
                  onBackToBeneficiaries={handleBackToBeneficiaries}
                />
              }
            />
            <Route path="/forms" element={<Forms />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/employees" element={<Employees />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>

        <footer className="border-t p-4 text-center text-sm text-muted-foreground">
          2025 ProjectPulse. All rights reserved.
        </footer>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
