import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ProtectedRoute } from "../components/ProtectedRoute";
import { useAuthStore } from "@stores/authStore";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Users from "../pages/Users";
import { UserRole } from "@domain/enums/UserRole";
import Companies from "../pages/Companies";
import Concessions from "../pages/Concessions";

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { user } = useAuthStore();
  const isAdmin = user?.role === UserRole.ADMIN;

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const AppRouter: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Route publique */}
        <Route path="/login" element={<Login />} />

        {/* Routes protégées */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route
            path="/users"
            element={
              <AdminRoute>
                <Users />
              </AdminRoute>
            }
          />
          <Route
            path="/companies"
            element={
              <AdminRoute>
                <Companies />
              </AdminRoute>
            }
          />
          <Route
            path="/concessions"
            element={
              <AdminRoute>
                <Concessions />
              </AdminRoute>
            }
          />
        </Route>

        {/* Redirection par défaut */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;
