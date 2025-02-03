import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@stores/authStore';
import Navbar from './navigation/Navbar';

export const ProtectedRoute: React.FC = () => {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    // Rediriger vers la page de connexion si non authentifié
    return <Navigate to="/login" replace />;
  }

  // Rendre la Navbar et les routes enfants si authentifié
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
};
