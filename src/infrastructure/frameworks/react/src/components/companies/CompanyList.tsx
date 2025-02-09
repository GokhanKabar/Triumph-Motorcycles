import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  ICompanyListProps,
  ICompanyListState,
  ICompanyListHandlers,
} from "../../interfaces/components/ICompanyList";
import { CompanyResponseDTO } from "../../../../../../application/dtos/CompanyDTO";
import { companyService } from "../../services/api";

const useCompanyListHandlers = (
  state: ICompanyListState,
  setState: React.Dispatch<React.SetStateAction<ICompanyListState>>,
  fetchCompanies: () => Promise<void>
): ICompanyListHandlers => {
  const handleDeleteCompany = async (companyId: string) => {
    try {
      await companyService.deleteCompany(companyId);
      fetchCompanies();
    } catch (error) {
      setState((prevState) => ({
        ...prevState,
        error:
          error instanceof Error
            ? error
            : new Error("Failed to delete company"),
      }));
    }
  };

  return {
    handleDeleteCompany,
  };
};

export default function CompanyList({
  onEdit,
  onDelete,
  refreshKey,
}: ICompanyListProps) {
  const [state, setState] = useState<ICompanyListState>({
    companies: [],
    isLoading: true,
    error: null,
  });

  const fetchCompanies = useCallback(async () => {
    try {
      const companies = await companyService.getAllCompanies();
      setState((prevState) => ({
        ...prevState,
        companies,
        isLoading: false,
      }));
    } catch (error) {
      setState((prevState) => ({
        ...prevState,
        error:
          error instanceof Error
            ? error
            : new Error("Failed to fetch companies"),
        isLoading: false,
      }));
    }
  }, []);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies, refreshKey]);

  const handlers = useCompanyListHandlers(state, setState, fetchCompanies);
  const navigate = useNavigate();

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
              Name
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Address
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
          {state.companies.map((company) => (
            <tr key={company.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{company.name}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-500">{company.address}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button
                  onClick={() => onEdit(company)}
                  className="text-indigo-600 hover:text-indigo-900 mr-4 focus:outline-none"
                >
                  Modifier
                </button>
                <button
                  onClick={() => onDelete(company.id)}
                  className="text-red-600 hover:text-red-900 focus:outline-none mr-4"
                >
                  Supprimer
                </button>
                <button
                  onClick={() => navigate(`/company-motorcycles/${company.id}`)}
                  className="text-green-600 hover:text-green-900 focus:outline-none"
                >
                  Gérer les motos
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
