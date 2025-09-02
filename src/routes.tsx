import { Navigate } from "react-router-dom";
import { Dashboard } from "./pages/Dashboard";
import { Projects } from "./pages/Projects";
import { Beneficiaries } from "./pages/Beneficiaries";
import { Forms } from "./pages/Forms";
import { Reports } from "./pages/Reports";
import { Employees } from "./pages/Employees";
import Login from "./pages/auth/Login";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import { ProjectDetails } from "./components/projects/ProjectDetails";
import { BeneficiaryDetails } from "./components/beneficiaries/BeneficiaryDetails";

import ProtectedRoute from "./components/auth/ProtectedRoute";
import AppLayout from "./components/layout/AppLayout";
import { SubProjectDetails } from "./components/projects/SubProjectDetails";
import DataEntry from "./pages/DataEntry";
import DataEntryTemplates from "./pages/DataEntryTemplates";
import { EmployeeDetails } from "./components/employees/EmployeeDetails";
import AcceptInvitation from "./pages/auth/AcceptInvitation";
import { Profile } from "./pages/Profile";
import { FormDetails } from "./components/forms/FormDetails";
import { FormCreate } from "./components/forms/FormCreate";
import { FormEdit } from "./components/forms/FormEdit";

const routes = [
  {
    path: "/",
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/accept-invitation",
    element: <AcceptInvitation />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPassword />,
  },
  {
    path: "/reset-password",
    element: <ResetPassword />,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "dashboard",
        element: <Dashboard />,
      },
      {
        path: "dashboard/profile",
        element: <Profile />,
      },
      {
        path: "projects",
        element: <Projects />,
      },
      {
        path: "projects/:id",
        element: <ProjectDetails />,
      },
      {
        path: "projects/:id/subprojects/:subprojectId",
        element: <SubProjectDetails />,
      },
      {
        path: "beneficiaries",
        element: <Beneficiaries />,
      },
      {
        path: "beneficiaries/:id",
        element: <BeneficiaryDetails />,
      },
      {
        path: "forms",
        element: <Forms />,
      },
      {
        path: "forms/create",
        element: <FormCreate />,
      },
      {
        path: "forms/edit/:id",
        element: <FormEdit />,
      },
      {
        path: "data-entry",
        element: <DataEntry />,
      },
      {
        path: "data-entry/templates",
        element: <DataEntryTemplates />,
      },
      {
        path: "reports",
        element: <Reports />,
      },
      {
        path: "employees",
        element: <Employees />,
      },
      {
        path: "employees/:id",
        element: <EmployeeDetails />,
      },
      {
        path: "*",
        element: <Navigate to="/dashboard" replace />,
      },
    ],
  },
];

export default routes;
