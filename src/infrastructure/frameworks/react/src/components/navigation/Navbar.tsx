import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserRole } from "@domain/enums/UserRole";
import { authService } from "../../services/api";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const navigate = useNavigate();
  const userStr = localStorage.getItem("user");
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
      navigate("/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  // Si l'utilisateur n'est pas connecté, ne pas afficher la navbar
  if (!user) {
    return null;
  }

  const menuItems = [
    { path: "/dashboard", label: "Tableau de bord", adminOnly: false },
    { path: "/motorcycles", label: "Motos", adminOnly: false },
    { path: "/maintenances", label: "Maintenances", adminOnly: true },
    { path: "/users", label: "Utilisateurs", adminOnly: true },
    { path: "/companies", label: "Entreprises", adminOnly: true },
    { path: "/concessions", label: "Concessions", adminOnly: true },
    { path: "/inventory-parts", label: "Stock Pièces", adminOnly: true },
    { path: "/drivers", label: "Conducteurs", adminOnly: true },
    { path: "/test-rides", label: "Essais", adminOnly: true },
  ];

  const renderMenuLink = (
    item: (typeof menuItems)[0],
    isMobile: boolean = false
  ) => {
    if (item.adminOnly && !isAdmin) return null;

    const baseClassName = isMobile
      ? "block px-4 py-3 rounded-md text-center text-base font-medium transition-all duration-300"
      : "px-3 py-2 rounded-md text-sm font-medium text-center transition-all duration-300 ease-in-out transform hover:scale-105";

    const activeClassName = isMobile
      ? "bg-gray-900 text-white"
      : "bg-gray-900 text-white ring-2 ring-offset-2 ring-offset-gray-800 ring-white";

    const inactiveClassName =
      "text-gray-300 hover:bg-gray-700 hover:text-white";

    return (
      <Link
        key={item.path}
        to={item.path}
        className={`${baseClassName} ${
          window.location.pathname === item.path
            ? activeClassName
            : inactiveClassName
        }`}
      >
        {item.label}
      </Link>
    );
  };

  return (
    <nav className="bg-gray-800 shadow-lg">
      <div className="container px-4 mx-auto">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center space-x-2">
            <img
              src="/triumph_logo.png"
              alt="Triumph Motorcycle"
              className="h-10"
            />
            <Link
              to="/dashboard"
              className="text-2xl font-bold text-white transition-transform duration-300 hover:scale-105"
            >
              Triumph Motorcycles
            </Link>
          </div>
          <div className="items-center hidden space-x-8 lg:flex">
            {menuItems.map((item) => renderMenuLink(item))}
          </div>
          <div className="flex items-center hidden ml-4 lg:block">
            <button
              onClick={handleLogout}
              className="px-5 py-3 text-sm font-semibold text-white transition-all duration-300 bg-red-600 rounded-md hover:bg-red-500 hover:scale-105"
            >
              Déconnexion
            </button>
          </div>
          <div className="lg:hidden">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-3 text-gray-400 transition-colors duration-300 rounded-md hover:text-white hover:bg-gray-700"
            >
              <span className="sr-only">Ouvrir le menu</span>
              <svg
                className="w-6 h-6"
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
        {isMobileMenuOpen && (
          <div className="flex flex-col items-center py-4 space-y-2 bg-gray-800 shadow-lg lg:hidden">
            {menuItems.map((item) => renderMenuLink(item, true))}
            <button
              onClick={handleLogout}
              className="w-full px-5 py-3 text-red-500 rounded-md hover:bg-red-100 hover:text-red-700"
            >
              Déconnexion
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
