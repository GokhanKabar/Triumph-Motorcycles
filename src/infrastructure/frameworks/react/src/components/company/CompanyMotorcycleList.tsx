import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import {
  companyMotorcycleService,
  motorcycleService,
} from "../../services/api";

interface CompanyMotorcycle {
  id: string;
  companyId: string;
  motorcycleId: string;
  motorcycle?: {
    brand: string;
    model: string;
    year: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

interface Motorcycle {
  id: string;
  brand: string;
  model: string;
  year: number;
}

interface CompanyMotorcycleListProps {
  companyId: string;
}

export const CompanyMotorcycleList: React.FC<CompanyMotorcycleListProps> = ({
  companyId,
}) => {
  const [motorcycles, setMotorcycles] = useState<CompanyMotorcycle[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [availableMotorcycles, setAvailableMotorcycles] = useState<
    Motorcycle[]
  >([]);
  const [selectedMotorcycleId, setSelectedMotorcycleId] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const fetchMotorcycles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const motorcycles = await companyMotorcycleService.getCompanyMotorcycles(
        companyId
      );
      setMotorcycles(motorcycles);
    } catch (error) {
      console.error(
        "Erreur lors du chargement des motos de l'entreprise:",
        error
      );
      // Si c'est une erreur qui n'est pas liée à l'absence de motos
      if (
        error.response?.status !== 404 &&
        !error.message?.includes("CompanyNotFoundError")
      ) {
        setError("Une erreur inattendue est survenue");
      }
      setMotorcycles([]);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  const fetchAvailableMotorcycles = useCallback(async () => {
    try {
      // Récupérer toutes les motos
      const allMotorcycles = await motorcycleService.getAllMotorcycles();
      
      // Créer un ensemble des IDs des motos déjà assignées
      const assignedMotorcycleIds = new Set(
        motorcycles.map(m => m.motorcycleId)
      );

      // Filtrer les motos qui ne sont pas déjà assignées
      const availableMotoList = allMotorcycles.filter(
        motorcycle => !assignedMotorcycleIds.has(motorcycle.id)
      );

      setAvailableMotorcycles(availableMotoList);
    } catch (error) {
      console.error("Erreur lors du chargement des motos disponibles:", error);
      setAvailableMotorcycles([]);
      if (isModalVisible) {
        toast.error("Erreur lors du chargement des motos disponibles");
      }
    }
  }, [isModalVisible, motorcycles]);

  useEffect(() => {
    fetchMotorcycles();
  }, [fetchMotorcycles]);

  const handleAddMotorcycle = async () => {
    if (!selectedMotorcycleId) {
      toast.warning("Veuillez sélectionner une moto");
      return;
    }

    try {
      await companyMotorcycleService.assignMotorcycle(
        companyId,
        selectedMotorcycleId
      );
      toast.success("Moto assignée avec succès");
      setIsModalVisible(false);
      setSelectedMotorcycleId("");
      fetchMotorcycles();
    } catch (error) {
      console.error("Erreur lors de l'assignation de la moto:", error);
      if (error.response?.status === 404) {
        const errorMessage = error.response?.data?.error || "La moto ou l'entreprise n'existe pas";
        toast.error(errorMessage);
      } else {
        toast.error("Une erreur est survenue lors de l'assignation de la moto");
      }
    }
  };

  const handleRemoveMotorcycle = async (motorcycleId: string) => {
    try {
      await companyMotorcycleService.removeMotorcycle(companyId, motorcycleId);
      toast.success("Moto retirée avec succès");
      fetchMotorcycles();
    } catch (error) {
      toast.error("Erreur lors du retrait de la moto");
    }
  };

  const showModal = () => {
    fetchAvailableMotorcycles();
    setIsModalVisible(true);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Gestion des Motos</h2>
        <button
          className="px-6 py-3 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 flex items-center gap-2 shadow-sm"
          onClick={showModal}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
              clipRule="evenodd"
            />
          </svg>
          Ajouter une moto
        </button>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider">
                Marque
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider">
                Modèle
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider">
                Année
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider">
                Date d'ajout
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center">
                  <div className="text-red-500 text-sm">{error}</div>
                </td>
              </tr>
            ) : motorcycles.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center">
                  <div className="text-gray-500 text-sm">
                    Aucune moto assignée
                  </div>
                </td>
              </tr>
            ) : (
              motorcycles.map((motorcycle) => (
                <tr
                  key={motorcycle.id}
                  className="hover:bg-gray-50 transition-colors duration-150"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    {motorcycle.motorcycle?.brand || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {motorcycle.motorcycle?.model || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {motorcycle.motorcycle?.year || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {new Date(motorcycle.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() =>
                        handleRemoveMotorcycle(motorcycle.motorcycleId)
                      }
                      className="text-red-600 hover:text-red-800 hover:bg-red-50 px-3 py-2 rounded-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 flex items-center gap-2 font-medium"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Retirer
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                Ajouter une moto
              </h3>
              <button
                onClick={() => setIsModalVisible(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-150"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <select
              className="w-full p-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-6 text-gray-700 bg-white shadow-sm"
              onChange={(e) => setSelectedMotorcycleId(e.target.value)}
              value={selectedMotorcycleId}
            >
              <option value="">Sélectionner une moto</option>
              {availableMotorcycles.map((motorcycle) => (
                <option key={motorcycle.id} value={motorcycle.id}>
                  {`${motorcycle.brand} ${motorcycle.model} (${motorcycle.year})`}
                </option>
              ))}
            </select>

            <div className="flex justify-end gap-3">
              <button
                className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-colors duration-200"
                onClick={() => setIsModalVisible(false)}
              >
                Annuler
              </button>
              <button
                className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 shadow-sm"
                onClick={handleAddMotorcycle}
              >
                Ajouter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
