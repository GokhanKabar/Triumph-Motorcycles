import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { authService } from '../services/api';
import Navbar from './navigation/Navbar';

const ProtectedRoute = () => {
  // Vérifier d'abord si le token existe
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Ensuite vérifier les données utilisateur
  const userStr = localStorage.getItem('user');
  let user = null;

  if (userStr) {
    try {
      user = JSON.parse(userStr);
    } catch (error) {
      // En cas d'erreur de parsing, supprimer les données corrompues
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      return <Navigate to="/login" replace />;
    }
  }

  // Si pas d'utilisateur valide, rediriger
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Si authentifié, afficher la navbar et les routes protégées
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
};

export default ProtectedRoute;
