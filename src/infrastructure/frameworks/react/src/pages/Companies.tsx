import React, { useState } from "react";
import CompanyList from "../components/companies/CompanyList";
import {
  CreateCompanyDTO,
  CompanyResponseDTO,
  UpdateCompanyDTO,
  CompanyFormDTO,
} from "@/application/dtos/CompanyDTO";
import { companyService } from "../services/api";
import CompanyForm from "../components/companies/CompanyForm";
import { toast } from "react-toastify";

interface SnackbarState {
  open: boolean;
  message: string;
  severity: "success" | "error";
}

export default function Companies() {
  const [openForm, setOpenForm] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<
    CompanyResponseDTO | undefined
  >();
  const [refreshKey, setRefreshKey] = useState(0);
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: "",
    severity: "success",
  });

  const handleCreateCompany = () => {
    setSelectedCompany(undefined);
    setOpenForm(true);
  };

  const handleEditCompany = (company: CompanyResponseDTO) => {
    setSelectedCompany(company);
    setOpenForm(true);
  };

  const handleDeleteCompany = async (companyId: string) => {
    try {
      const result = await companyService.deleteCompany(companyId);
      setRefreshKey((prev) => prev + 1);
      toast.success(result.message || "Entreprise supprimée avec succès");
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la suppression de l'entreprise");
    }
  };

  const handleSubmit = async (formData: CompanyFormDTO) => {
    try {
      if (selectedCompany) {
        // Update
        await companyService.updateCompany(
          selectedCompany.id,
          formData as UpdateCompanyDTO
        );
        toast.success("Entreprise mise à jour avec succès");
      } else {
        // Create
        await companyService.createCompany(formData as CreateCompanyDTO);
        toast.success("Entreprise créée avec succès");
      }

      setOpenForm(false);
      setRefreshKey((prev) => prev + 1);
    } catch (error) {
      toast.error("Une erreur est survenue");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Gestion des entreprises
        </h1>
        <button
          onClick={handleCreateCompany}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Ajouter une entreprise
        </button>
      </div>

      <CompanyList
        onEdit={handleEditCompany}
        onDelete={handleDeleteCompany}
        refreshKey={refreshKey}
      />

      <CompanyForm
        open={openForm}
        company={selectedCompany}
        onClose={() => setOpenForm(false)}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
