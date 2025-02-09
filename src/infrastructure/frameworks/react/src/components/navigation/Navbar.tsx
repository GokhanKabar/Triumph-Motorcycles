import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { authService } from "../../services/api";
import { UserResponseDTO } from "../../../../../../application/user/dtos/UserDTO";
import { UserRole } from "@domain/enums/UserRole";

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<UserResponseDTO | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await authService.getCurrentUser();
        setUser(userData);
      } catch (error) {
        console.error("Erreur lors de la récupération du profil:", error);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const isActive = (path: string) => {
    return location.pathname === path
      ? "bg-gray-900 text-white ring-2 ring-offset-2 ring-offset-gray-800 ring-white"
      : "text-gray-300 hover:bg-gray-700 hover:text-white";
  };

  const menuItems = [
    { path: "/dashboard", label: "Tableau de bord", adminOnly: false },
    { path: "/users", label: "Utilisateurs", adminOnly: true },
    { path: "/companies", label: "Entreprises", adminOnly: true },
    { path: "/concessions", label: "Concessions", adminOnly: true },
    { path: "/motorcycles", label: "Motos", adminOnly: true },
    { path: "/test-rides", label: "Test Rides", adminOnly: true },
    { path: "/maintenances", label: "Maintenances", adminOnly: true },
    { path: "/inventory-parts", label: "Stock Pièces", adminOnly: true },
    { path: "/drivers", label: "Conducteurs", adminOnly: true },
  ];

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
              {menuItems.map(
                (item) =>
                  (!item.adminOnly || user?.role === UserRole.ADMIN) && (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 ease-in-out transform hover:scale-105 ${isActive(
                        item.path
                      )}`}
                    >
                      {item.label}
                    </Link>
                  )
              )}
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
              onClick={toggleMenu}
              type="button"
              className="inline-flex items-center justify-center p-3 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              aria-controls="mobile-menu"
              aria-expanded={isMenuOpen}
            >
              <span className="sr-only">Ouvrir le menu</span>
              {!isMenuOpen ? (
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
              ) : (
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Menu mobile avec animation */}
      <div
        className={`lg:hidden transition-all duration-300 ease-in-out ${
          isMenuOpen
            ? "max-h-screen opacity-100"
            : "max-h-0 opacity-0 overflow-hidden"
        }`}
      >
        <div className="px-2 pt-2 pb-3 space-y-1 bg-gray-800 shadow-lg">
          {menuItems.map(
            (item) =>
              (!item.adminOnly || user?.role === UserRole.ADMIN) && (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`block px-4 py-3 rounded-md text-base font-medium transition-all duration-300 ${isActive(
                    item.path
                  )}`}
                  onClick={toggleMenu}
                >
                  {item.label}
                </Link>
              )
          )}
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
