import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchProjects,
  selectAllProjects,
  selectProjectsError,
  selectProjectsLoading,
} from "../../store/slices/projectsSlice";
import type { AppDispatch } from "../../store";

const AppLayout = () => {
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
  const [_isMobile, setIsMobile] = useState(false);
  const location = useLocation();

  // Get current page title based on route
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.startsWith("/projects")) {
      return selectedSubProjectId ? "Sub-Project Details" : "Projects";
    } else if (path.startsWith("/beneficiaries")) {
      return selectedBeneficiaryId ? "Beneficiary Details" : "Beneficiaries";
    }
    return path === "/dashboard"
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

  const dispatch = useDispatch<AppDispatch>();
  const projects = useSelector(selectAllProjects);
  const isLoading = useSelector(selectProjectsLoading);
  const error = useSelector(selectProjectsError);

  useEffect(() => {
    if (projects.length === 0) {
      dispatch(fetchProjects());
    }
  }, [dispatch, projects.length]);

  return (
    <div className="flex h-screen bg-white">
      <Sidebar
        collapsed={sidebarCollapsed}
        mobileOpen={mobileSidebarOpen}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        projects={projects} // pass projects as prop (optional, or use Redux in Sidebar)
        projectsLoading={isLoading}
        projectsError={error}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar
          title={getPageTitle()}
          toggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          isMobileMenuOpen={mobileSidebarOpen}
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#FEFFFE]">
          <Outlet
            context={{
              selectedProjectId,
              selectedSubProjectId,
              selectedBeneficiaryId,
              setSelectedProjectId,
              setSelectedSubProjectId,
              setSelectedBeneficiaryId,
            }}
          />
        </main>

        <footer className="border-t p-4 text-center text-sm text-muted-foreground">
          2025 CaritasMotherTeresa. All rights reserved.
        </footer>
      </div>
    </div>
  );
};

export default AppLayout;
