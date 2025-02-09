import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Users from "../pages/Users";
import Companies from "../pages/Companies";
import Concessions from "../pages/Concessions";
import Motorcycles from "../pages/Motorcycles";
import Maintenances from "../pages/Maintenances";
import InventoryParts from "../pages/InventoryParts";
import Drivers from "../pages/Drivers";
import { CompanyMotorcycles } from "../pages/CompanyMotorcycles";
import Home from "../pages/Home";
import TestRidePage from "../pages/TestRidePage";
import ProtectedRoute from '../components/ProtectedRoute';
import { UserRole } from "@domain/enums/UserRole";

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  
  if (!user || user.role !== UserRole.ADMIN) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const AppRouter: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Route publique */}
        <Route path="/" element={<Home />} />
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
            path="/motorcycles"
            element={
              <AdminRoute>
                <Motorcycles />
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
          <Route
            path="/maintenances"
            element={
              <AdminRoute>
                <Maintenances />
              </AdminRoute>
            }
          />
          <Route
            path="/inventory-parts"
            element={
              <AdminRoute>
                <InventoryParts />
              </AdminRoute>
            }
          />
          <Route
            path="/drivers"
            element={
              <AdminRoute>
                <Drivers />
              </AdminRoute>
            }
          />
          <Route
            path="/company-motorcycles/:companyId?"
            element={
              <AdminRoute>
                <CompanyMotorcycles />
              </AdminRoute>
            }
          />
          <Route
            path="/test-rides"
            element={
              <AdminRoute>
                <TestRidePage />
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
