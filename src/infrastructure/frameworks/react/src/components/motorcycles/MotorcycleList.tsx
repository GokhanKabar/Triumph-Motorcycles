import React, { useState, useEffect, useCallback } from "react";
import StatusBadge from "./StatusBadge";
import {
  IMotorcycleListProps,
  IMotorcycleListState,
  IMotorcycleListHandlers,
} from "../../interfaces/components/IMotorcycleList";
import { MotorcycleResponseDTO } from "../../../../../../application/dtos/MotorcycleDTO";
import { motorcycleService, concessionService } from "../../services/api";

const useMotorcycleListHandlers = (
  state: IMotorcycleListState,
  setState: React.Dispatch<React.SetStateAction<IMotorcycleListState>>,
  fetchMotorcycles: () => Promise<void>
): IMotorcycleListHandlers => {
  const handleDeleteMotorcycle = async (motorcycleId: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette moto ?')) {
      return;
    }

    try {
      setState((prev) => ({
        ...prev,
        isLoading: true,
        error: null,
      }));

      await motorcycleService.deleteMotorcycle(motorcycleId);

      // Mettre à jour la liste des motos après la suppression
      const updatedMotorcycles = state.motorcycles.filter(
        (moto) => moto.id !== motorcycleId
      );

      setState((prev) => ({
        ...prev,
        motorcycles: updatedMotorcycles,
        isLoading: false,
      }));
    } catch (error: any) {
      console.error('Erreur lors de la suppression:', error);

      // Message d'erreur personnalisé en fonction du type d'erreur
      let errorMessage = 'Une erreur est survenue lors de la suppression';

      if (error.response?.status === 500) {
        errorMessage = 'Impossible de supprimer cette moto car elle a des maintenances associées';
      }

      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
    }
  };

  return {
    handleDeleteMotorcycle,
  };
};

export default function MotorcycleList({
  onEdit,
  onDelete,
  refreshKey,
}: IMotorcycleListProps) {
  const [state, setState] = useState<IMotorcycleListState>({
    motorcycles: [],
    concessions: {},
    isLoading: true,
    error: null,
  });

  const fetchMotorcycles = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      // Récupérer d'abord les concessions
      const concessions = await concessionService.getAllConcessions();
      const concessionMap = concessions.reduce((acc, concession) => {
        acc[concession.id] = concession.name;
        return acc;
      }, {} as Record<string, string>);

      console.log('Concession Map:', concessionMap);

      // Puis récupérer les motos
      const motorcycles = await motorcycleService.getAllMotorcycles();

      setState((prev) => ({
        ...prev,
        motorcycles,
        concessions: concessionMap,
        isLoading: false,
      }));
    } catch (error) {
      console.error('Erreur lors de la récupération des données:', error);
      setState((prev) => ({
        ...prev,
        error:
          error instanceof Error
            ? error
            : new Error("Impossible de récupérer les données"),
        isLoading: false,
      }));
    }
  }, []);

  useEffect(() => {
    fetchMotorcycles();
  }, [fetchMotorcycles, refreshKey]);

  const handlers = useMotorcycleListHandlers(state, setState, fetchMotorcycles);

  if (state.isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (state.error) {
    return <div className="text-red-600 p-4">{state.error}</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Marque
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Modèle
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Année
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              VIN
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Kilométrage
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Statut
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Concession
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {state.motorcycles.map((motorcycle) => (
            <tr key={motorcycle.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{motorcycle.brand}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{motorcycle.model}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-500">{motorcycle.year}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-500">{motorcycle.vin}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-500">
                  {motorcycle.mileage} km
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <StatusBadge status={motorcycle.status} />
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-500">
                  {(() => {
                    console.log('Motorcycle Concession ID:', motorcycle.concessionId);
                    console.log('Concession Name:', state.concessions[motorcycle.concessionId]);
                    return state.concessions[motorcycle.concessionId] || "Concession inconnue";
                  })()}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button
                  onClick={() => onEdit(motorcycle)}
                  className="text-indigo-600 hover:text-indigo-900 mr-4 focus:outline-none"
                >
                  Modifier
                </button>
                <button
                  onClick={() => handlers.handleDeleteMotorcycle(motorcycle.id)}
                  className="text-red-600 hover:text-red-900 focus:outline-none"
                >
                  Supprimer
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
