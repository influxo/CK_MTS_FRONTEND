import { useState, useEffect, useMemo } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "../../hooks/useTranslation";
import {
  fetchProjects,
  selectAllProjects,
  selectProjectsError,
  selectProjectsLoading,
} from "../../store/slices/projectsSlice";
import type { AppDispatch } from "../../store";
import { selectCurrentUser } from "../../store/slices/authSlice";

const AppLayout = () => {
  const { t } = useTranslation();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedSubProjectId, setSelectedSubProjectId] = useState<string | null>(null);
  const [selectedBeneficiaryId, setSelectedBeneficiaryId] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [_isMobile, setIsMobile] = useState(false);
  const location = useLocation();

  // Get current page title based on route
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.startsWith("/projects")) {
      return selectedSubProjectId ? t('subProjects.subProjectDetails') : t('projects.title');
    } else if (path.startsWith("/beneficiaries")) {
      return selectedBeneficiaryId ? t('beneficiaries.beneficiaryDetails') : t('beneficiaries.title');
    } else if (path.startsWith("/employees")) {
      return t('employees.title');
    } else if (path.startsWith("/forms")) {
      return t('forms.title');
    } else if (path.startsWith("/data-entry")) {
      return t('dataEntry.title');
    } else if (path.startsWith("/reports")) {
      return t('reports.title');
    }
    return path === "/dashboard"
      ? t('dashboard.title')
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
  const user = useSelector(selectCurrentUser);

  // Role helpers to determine whether to load all projects
  const normalizedRoles = useMemo(
    () => (user?.roles || []).map((r: any) => r.name?.toLowerCase?.() || ""),
    [user?.roles]
  );
  const isSysOrSuperAdmin = useMemo(() => {
    return normalizedRoles.some(
      (r: string) =>
        r === "sysadmin" ||
        r === "superadmin" ||
        r.includes("system admin") ||
        r.includes("super admin")
    );
  }, [normalizedRoles]);

  useEffect(() => {
    if (isSysOrSuperAdmin && projects.length === 0) {
      dispatch(fetchProjects());
    }
  }, [dispatch, projects.length, isSysOrSuperAdmin]);

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

      <div
        className={
          "flex-1 flex flex-col overflow-hidden " +
          (mobileSidebarOpen ? "hidden lg:flex" : "")
        }
      >
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
          {new Date().getFullYear()} CaritasMotherTeresa. {t('footer.copyright').split('2025 CaritasMotherTeresa. ')[1]}
        </footer>
      </div>
    </div>
  );
};

export default AppLayout;
