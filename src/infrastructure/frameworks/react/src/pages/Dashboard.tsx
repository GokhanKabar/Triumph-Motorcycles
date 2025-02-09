import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motorcycleService, maintenanceService } from '../services/api';

interface User {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

interface DashboardStats {
  totalBikes: number;
  activeMaintenance: number;
  upcomingServices: number;
  availableBikes: number;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalBikes: 0,
    activeMaintenance: 0,
    upcomingServices: 0,
    availableBikes: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const userStr = localStorage.getItem('user');
  let storedUser: User | null;
  try {
    storedUser = userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    storedUser = null;
  }
  const isAdmin = storedUser?.role === 'ADMIN';

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Check authentication
        if (!storedUser) {
          navigate('/login');
          return;
        }

        setUser(storedUser);

        // Fetch motorcycles
        const motorcycles = await motorcycleService.getAllMotorcycles();
        const totalBikes = motorcycles.length;
        const availableBikes = motorcycles.filter(m => m.status === 'AVAILABLE').length;

        // Fetch maintenances
        const maintenances = await maintenanceService.getAllMaintenances();
        const activeMaintenance = maintenances.filter(m => m.status === 'IN_PROGRESS').length;
        const upcomingServices = maintenances.filter(m => m.status === 'SCHEDULED').length;

        // Update stats
        setStats({
          totalBikes,
          activeMaintenance,
          upcomingServices,
          availableBikes
        });

        setIsLoading(false);
      } catch (error) {
        console.error('Erreur lors de la récupération des données:', error);
        setError('Erreur lors de la récupération des données');
        navigate('/login');
      }
    };

    fetchDashboardData();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* En-tête de bienvenue */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">
            Bienvenue, {user.firstName} {user.lastName}
          </h1>
          <p className="text-gray-400">
            Voici un aperçu de votre tableau de bord
          </p>
        </div>

        {/* Contenu principal */}
        <div className="grid grid-cols-1 gap-6">
          {/* Informations de l'utilisateur */}
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold text-white mb-4">Profil</h2>
            <div className="space-y-2">
              <p className="text-gray-300">
                <span className="font-medium">Nom:</span> {user.lastName}
              </p>
              <p className="text-gray-300">
                <span className="font-medium">Prénom:</span> {user.firstName}
              </p>
              <p className="text-gray-300">
                <span className="font-medium">Email:</span> {user.email}
              </p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {/* Total Motos */}
            <div className="relative overflow-hidden rounded-lg bg-gray-800 px-4 pb-12 pt-5 shadow sm:px-6 sm:pt-6">
              <dt>
                <div className="absolute rounded-md bg-red-500 p-3">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                  </svg>
                </div>
                <p className="ml-16 truncate text-sm font-medium text-gray-400">Total Motos</p>
              </dt>
              <dd className="ml-16 flex items-baseline pb-6 sm:pb-7">
                <p className="text-2xl font-semibold text-white">{stats.totalBikes}</p>
                <div className="absolute inset-x-0 bottom-0 bg-gray-700/50 px-4 py-4 sm:px-6">
                  <div className="text-sm">
                    <a href="#" className="font-medium text-red-400 hover:text-red-300">Voir toutes les motos<span className="sr-only"> Total Motos</span></a>
                  </div>
                </div>
              </dd>
            </div>

            {/* Maintenance Active */}
            <div className="relative overflow-hidden rounded-lg bg-gray-800 px-4 pb-12 pt-5 shadow sm:px-6 sm:pt-6">
              <dt>
                <div className="absolute rounded-md bg-yellow-500 p-3">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
                  </svg>
                </div>
                <p className="ml-16 truncate text-sm font-medium text-gray-400">Total Maintenance Active</p>
              </dt>
              <dd className="ml-16 flex items-baseline pb-6 sm:pb-7">
                <p className="text-2xl font-semibold text-white">{stats.activeMaintenance}</p>
                <div className="absolute inset-x-0 bottom-0 bg-gray-700/50 px-4 py-4 sm:px-6">
                  <div className="text-sm">
                    <a href="#" className="font-medium text-yellow-400 hover:text-yellow-300">Voir les maintenances<span className="sr-only"> Maintenance Active</span></a>
                  </div>
                </div>
              </dd>
            </div>

            {isAdmin && (
              <div className="bg-gray-800 p-6 rounded-lg shadow-lg md:col-span-2">
                <h2 className="text-xl font-semibold text-white mb-4">Statistiques</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-blue-100 p-4 rounded">
                    <p className="text-2xl font-bold">{stats.totalBikes}</p>
                    <p className="text-gray-300">Total Motos</p>
                  </div>
                  <div className="bg-green-100 p-4 rounded">
                    <p className="text-2xl font-bold">{stats.activeMaintenance}</p>
                    <p className="text-gray-300">Total Maintenance Active</p>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
