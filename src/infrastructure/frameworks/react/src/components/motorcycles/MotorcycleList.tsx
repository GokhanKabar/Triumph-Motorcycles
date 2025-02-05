import React, { useState, useEffect, useCallback } from "react";
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
    try {
      await motorcycleService.deleteMotorcycle(motorcycleId);
      fetchMotorcycles();
    } catch (error) {
      setState((prevState) => ({
        ...prevState,
        error:
          error instanceof Error
            ? error
            : new Error("Failed to delete motorcycle"),
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
      const [motorcycles, concessions] = await Promise.all([
        motorcycleService.getMotorcycles(),
        concessionService.getConcessions()
      ]);
      const concessionMap = concessions.reduce((acc, concession) => {
        acc[concession.id] = concession.name;
        return acc;
      }, {} as Record<string, string>);
      setState((prev) => ({
        ...prev,
        motorcycles,
        concessions: concessionMap,
        isLoading: false,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error:
          error instanceof Error
            ? error
            : new Error("Failed to fetch motorcycles"),
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
    return <div className="text-red-600 p-4">{state.error.message}</div>;
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
                <div className="text-sm text-gray-500">{motorcycle.vin}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-500">
                  {motorcycle.currentMileage} km
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-500">{state.concessions[motorcycle.concessionId] || 'Concession inconnue'}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button
                  onClick={() => onEdit(motorcycle)}
                  className="text-indigo-600 hover:text-indigo-900 mr-4 focus:outline-none"
                >
                  Modifier
                </button>
                <button
                  onClick={() => onDelete(motorcycle.id)}
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
