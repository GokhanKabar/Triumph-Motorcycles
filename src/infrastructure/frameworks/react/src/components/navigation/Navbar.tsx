import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserRole } from '@domain/enums/UserRole';
import { authService } from '../../services/api';

const Navbar = () => {
  const navigate = useNavigate();
  const userStr = localStorage.getItem('user');
  let user;
  try {
    user = userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    user = null;
  }
  const isAdmin = user?.role === UserRole.ADMIN;

  // Si l'utilisateur n'est pas connecté, rediriger vers la page de connexion
  React.useEffect(() => {
    if (!userStr) {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  // Si l'utilisateur n'est pas connecté, ne pas afficher la navbar
  if (!user) {
    return null;
  }

  const menuItems = [
    { path: '/dashboard', label: 'Tableau de bord', adminOnly: false },
    { path: '/motorcycles', label: 'Motos', adminOnly: false },
    { path: '/maintenances', label: 'Maintenances', adminOnly: false },
    { path: '/users', label: 'Utilisateurs', adminOnly: true },
    { path: '/companies', label: 'Entreprises', adminOnly: true },
    { path: '/concessions', label: 'Concessions', adminOnly: true },
    { path: '/inventory-parts', label: 'Stock Pièces', adminOnly: true },
    { path: '/drivers', label: 'Conducteurs', adminOnly: true },
    { path: '/test-rides', label: 'Essais', adminOnly: false }
  ];

  const renderMenuLink = (item: typeof menuItems[0], isMobile: boolean = false) => {
    if (item.adminOnly && !isAdmin) return null;

    const baseClassName = isMobile
      ? 'block px-4 py-3 rounded-md text-base font-medium transition-all duration-300'
      : 'px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 ease-in-out transform hover:scale-105';

    const activeClassName = isMobile
      ? 'bg-gray-900 text-white'
      : 'bg-gray-900 text-white ring-2 ring-offset-2 ring-offset-gray-800 ring-white';

    const inactiveClassName = 'text-gray-300 hover:bg-gray-700 hover:text-white';

    return (
      <Link
        key={item.path}
        to={item.path}
        className={`${baseClassName} ${
          window.location.pathname === item.path ? activeClassName : inactiveClassName
        }`}
      >
        {item.label}
      </Link>
    );
  };

  return (
    <nav className="bg-gray-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
        <div className="relative flex items-center justify-between h-20">
          {/* Logo et titre */}
          <div className="flex items-center flex-shrink-0">
            <Link
              to="/dashboard"
              className="flex items-center space-x-3 group transition-transform duration-300 hover:scale-105"
            >
              <h1 className="text-white text-xl sm:text-2xl lg:text-3xl font-bold tracking-wider">
                Triumph Motorcycles
              </h1>
            </Link>
          </div>

          {/* Menu desktop */}
          <div className="hidden lg:block flex-1 ml-8">
            <div className="flex justify-center space-x-1">
              {menuItems.map(item => renderMenuLink(item))}
            </div>
          </div>

          {/* Bouton de déconnexion desktop */}
          <div className="hidden lg:flex items-center">
            <button
              onClick={handleLogout}
              className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-red-500 transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-800"
            >
              Déconnexion
            </button>
          </div>

          {/* Bouton menu mobile */}
          <div className="lg:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-3 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              aria-controls="mobile-menu"
              aria-expanded="false"
            >
              <span className="sr-only">Ouvrir le menu</span>
              <svg
                className="block h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Menu mobile avec animation */}
      <div className="lg:hidden transition-all duration-300 ease-in-out">
        <div className="px-2 pt-2 pb-3 space-y-1 bg-gray-800 shadow-lg">
          {menuItems.map(item => renderMenuLink(item, true))}
          <div className="border-t border-gray-700 mt-4 pt-4">
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-3 rounded-md text-base font-medium text-red-500 hover:bg-red-100 hover:text-red-700 transition-colors duration-300"
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
