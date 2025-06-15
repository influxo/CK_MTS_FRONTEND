import { Navigate } from "react-router-dom";
import { Dashboard } from "./pages/Dashboard";
import { Projects } from "./pages/Projects";
import { Beneficiaries } from "./pages/Beneficiaries";
import { Forms } from "./pages/Forms";
import { Reports } from "./pages/Reports";
import { Employees } from "./pages/Employees";
import Login from "./pages/Login";

import ProtectedRoute from "./components/auth/ProtectedRoute";
import AppLayout from "./components/layout/AppLayout";



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
        path: "projects",
        element: <Projects />,
      },
      {
        path: "beneficiaries",
        element: <Beneficiaries />,
      },
      {
        path: "forms",
        element: <Forms />,
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
        path: "*",
        element: <Navigate to="/dashboard" replace />,
      },
    ],
  },
];

export default routes;
