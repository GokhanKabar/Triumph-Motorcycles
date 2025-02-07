import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { CompanyMotorcycleList } from "../components/company/CompanyMotorcycleList";
import { companyService } from "../services/api";
import { CompanyResponseDTO } from "@/application/dtos/CompanyDTO";

export const CompanyMotorcycles: React.FC = () => {
  const { companyId } = useParams<{ companyId: string }>();
  const [companies, setCompanies] = useState<CompanyResponseDTO[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>(
    companyId || ""
  );

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await companyService.getAllCompanies();
        setCompanies(response);
        if (!selectedCompany && response.length > 0) {
          setSelectedCompany(response[0].id);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des entreprises:", error);
      }
    };

    fetchCompanies();
  }, []);

  const selectedCompanyName = companies.find(
    (c) => c.id === selectedCompany
  )?.name;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="space-y-8 w-full">
        <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white p-8 rounded-2xl shadow-2xl border border-blue-700">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex-1">
              <h2 className="text-4xl font-bold mb-3 text-blue-100">
                Gestion des Motos par Entreprise
              </h2>
              {selectedCompanyName && (
                <p className="text-blue-200 text-xl">
                  Entreprise sélectionnée :{" "}
                  <span className="font-bold text-white bg-blue-700 px-3 py-1 rounded-lg">
                    {selectedCompanyName}
                  </span>
                </p>
              )}
            </div>
            <div className="w-full md:w-96">
              <select
                className="w-full p-4 text-lg bg-blue-950 border-2 border-blue-600 rounded-xl
                         focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400
                         text-white placeholder-blue-300 shadow-lg transition-all duration-200
                         hover:bg-blue-900 hover:border-blue-500"
                value={selectedCompany}
                onChange={(e) => setSelectedCompany(e.target.value)}
              >
                <option value="" className="text-gray-900 bg-white">
                  Sélectionner une entreprise
                </option>
                {companies.map((company) => (
                  <option
                    key={company.id}
                    value={company.id}
                    className="text-gray-900 bg-white"
                  >
                    {company.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {selectedCompany && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100">
            <CompanyMotorcycleList companyId={selectedCompany} />
          </div>
        )}
      </div>
    </div>
  );
};
