import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../../services/api';
import { UserResponseDTO } from '../../../../../../application/user/dtos/UserDTO';
import { UserRole } from "@domain/enums/UserRole";


const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<UserResponseDTO | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await authService.getCurrentUser();
        setUser(userData);
      } catch (error) {
        console.error('Erreur lors de la récupération du profil:', error);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const isActive = (path: string) => {
    return location.pathname === path ? 'bg-gray-900' : '';
  };

  return (
    <nav className="bg-gray-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link to="/">
                <h1 className="text-white text-2xl font-bold">Triumph Motorcycles</h1>
              </Link>
            </div>
            <div className="ml-10 flex items-baseline space-x-4">
              <Link
                to="/dashboard"
                className={`text-white rounded-md px-3 py-2 text-sm font-medium ${isActive('/dashboard')}`}
              >
                Tableau de bord
              </Link>
              {user?.role === UserRole.ADMIN && (
                <Link
                  to="/users"
                  className={`text-white rounded-md px-3 py-2 text-sm font-medium ${isActive('/users')}`}
                >
                  Gestion des utilisateurs
                </Link>
              )}
            </div>
          </div>
          <div className="flex items-center">
            <button
              onClick={handleLogout}
              className="rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
