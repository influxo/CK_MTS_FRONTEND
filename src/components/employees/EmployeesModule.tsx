import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { AccountSetup } from "./AccountSetup";
import { EmployeesList } from "./EmployeesList";
import { InviteEmployee } from "./InviteEmployee";
import type { AppDispatch } from "../../store";
import {
  fetchEmployees,
  fetchMyTeamEmployees,
  selectAllEmployees,
  selectEmployeesError,
  selectEmployeesLoading,
} from "../../store/slices/employeesSlice";
import { selectCurrentUser } from "../../store/slices/authSlice";

type EmployeeView = "list" | "invite" | "setup";

export function EmployeesModule() {
  const [view, setView] = useState<EmployeeView>("list");
  const [inviteData, setInviteData] = useState<any>(null);
  const [setupToken, setSetupToken] = useState<string | null>(null);
  console.log("inviteData test me i ik unused declaration", inviteData);

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const employees = useSelector(selectAllEmployees);
  const isLoading = useSelector(selectEmployeesLoading);
  const error = useSelector(selectEmployeesError);
  const user = useSelector(selectCurrentUser);

  const hasFetchedRef = useRef(false);

  // Determine if user is sys or super admin
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
    if (hasFetchedRef.current) return;
    if (!user || !Array.isArray(user.roles) || user.roles.length === 0) return;

    hasFetchedRef.current = true;
    if (isSysOrSuperAdmin) {
      dispatch(fetchEmployees());
    } else {
      dispatch(fetchMyTeamEmployees());
    }
  }, [dispatch, isSysOrSuperAdmin, user]);
  // Handle when an employee is selected from the list -> navigate to details route
  const handleEmployeeSelect = (employeeId: string) => {
    navigate(`/employees/${employeeId}`);
  };

  // Handle when navigating to invite page
  const handleInviteClick = () => {
    setView("invite");
  };

  // Handle when an invite is created
  const handleInviteCreated = (inviteData: any) => {
    setInviteData(inviteData);
    setView("list");
    // In a real app, we would trigger an API call here
  };

  // Handle when a user accesses the account setup
  // const handleSetupAccount = (token: string) => {
  //   setSetupToken(token);
  //   setView("setup");
  // };

  // Handle back button (used by invite/setup flows)
  const handleBack = () => {
    setView("list");
  };

  // Handle account setup completion
  const handleSetupComplete = () => {
    setView("list");
    setSetupToken(null);
  };

  if (view === "invite") {
    return (
      <InviteEmployee
        onBack={handleBack}
        onInviteCreated={handleInviteCreated}
      />
    );
  }

  if (view === "setup" && setupToken) {
    return (
      <AccountSetup token={setupToken} onSetupComplete={handleSetupComplete} />
    );
  }

  // Default to list view
  return (
    <EmployeesList
      onEmployeeSelect={handleEmployeeSelect}
      onInviteClick={handleInviteClick}
      employees={employees}
      isLoading={isLoading}
      error={error}
    />
  );
}
