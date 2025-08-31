import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { AccountSetup } from "./AccountSetup";
import { EmployeesList } from "./EmployeesList";
import { InviteEmployee } from "./InviteEmployee";
import type { AppDispatch } from "../../store";
import {
  fetchEmployees,
  selectAllEmployees,
  selectEmployeesError,
  selectEmployeesLoading,
} from "../../store/slices/employeesSlice";

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

  useEffect(() => {
    dispatch(fetchEmployees());
  }, [dispatch]);
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
