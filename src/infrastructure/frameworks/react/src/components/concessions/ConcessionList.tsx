import React, { useState, useEffect, useCallback } from "react";
import {
  IConcessionListProps,
  IConcessionListState,
} from "../../interfaces/components/IConcessionList";
import { ConcessionResponseDTO } from "../../../../../../application/dtos/ConcessionDTO";
import { concessionService } from "../../services/api";

export default function ConcessionList({
  onEdit,
  onDelete,
  refreshKey,
}: IConcessionListProps) {
  const [state, setState] = useState<IConcessionListState>({
    concessions: [],
    isLoading: true,
    error: null,
  });

  const fetchConcessions = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      const concessions = await concessionService.getAllConcessions();
      setState((prev) => ({
        ...prev,
        concessions,
        isLoading: false,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error:
          error instanceof Error
            ? error
            : new Error("Failed to fetch concessions"),
        isLoading: false,
      }));
    }
  }, []);

  useEffect(() => {
    fetchConcessions();
  }, [fetchConcessions, refreshKey]);

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
              Nom
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Adresse
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
          {state.concessions.map((concession) => (
            <tr key={concession.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{concession.name}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-500">{concession.address}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button
                  onClick={() => onEdit(concession)}
                  className="text-indigo-600 hover:text-indigo-900 mr-4 focus:outline-none"
                >
                  Modifier
                </button>
                <button
                  onClick={() => onDelete(concession.id)}
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
