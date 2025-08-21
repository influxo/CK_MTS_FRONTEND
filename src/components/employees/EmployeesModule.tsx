import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AccountSetup } from "./AccountSetup";
import { EmployeeDetails } from "./EmployeeDetails";
import { EmployeesList } from "./EmployeesList";
import { InviteEmployee } from "./InviteEmployee";
import type { AppDispatch } from "../../store";
import {
  fetchEmployees,
  selectAllEmployees,
  selectEmployeesError,
  selectEmployeesLoading,
} from "../../store/slices/employeesSlice";

type EmployeeView = "list" | "details" | "invite" | "setup";

export function EmployeesModule() {
  const [view, setView] = useState<EmployeeView>("list");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(
    null
  );
  const [inviteData, setInviteData] = useState<any>(null);
  const [setupToken, setSetupToken] = useState<string | null>(null);
  console.log("inviteData test me i ik unused declaration", inviteData);

  const dispatch = useDispatch<AppDispatch>();
  const employees = useSelector(selectAllEmployees);
  const isLoading = useSelector(selectEmployeesLoading);
  const error = useSelector(selectEmployeesError);

  useEffect(() => {
    dispatch(fetchEmployees());
  }, [dispatch]);
  // Handle when an employee is selected from the list
  const handleEmployeeSelect = (employeeId: string) => {
    setSelectedEmployeeId(employeeId);
    setView("details");
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

  // Handle back button
  const handleBack = () => {
    setView("list");
    setSelectedEmployeeId(null);
  };

  // Handle account setup completion
  const handleSetupComplete = () => {
    setView("list");
    setSetupToken(null);
  };

  // Render appropriate view based on state
  if (view === "details" && selectedEmployeeId) {
    return (
      <EmployeeDetails employeeId={selectedEmployeeId} onBack={handleBack} />
    );
  }

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
