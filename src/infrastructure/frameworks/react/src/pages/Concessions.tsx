import React, { useState } from "react";
import ConcessionList from "../components/concessions/ConcessionList";
import {
  CreateConcessionDTO,
  ConcessionResponseDTO,
  UpdateConcessionDTO,
  ConcessionFormDTO,
} from "@/application/dtos/ConcessionDTO";
import { concessionService } from "../services/api";
import ConcessionForm from "../components/concessions/ConcessionForm";
import { toast } from "react-toastify";

export default function Concessions() {
  const [openForm, setOpenForm] = useState(false);
  const [selectedConcession, setSelectedConcession] = useState<
    ConcessionResponseDTO | undefined
  >();
  const [refreshKey, setRefreshKey] = useState(0);

  const handleCreateConcession = () => {
    setSelectedConcession(undefined);
    setOpenForm(true);
  };

  const handleEditConcession = (concession: ConcessionResponseDTO) => {
    setSelectedConcession(concession);
    setOpenForm(true);
  };

  const handleDeleteConcession = async (concessionId: string) => {
    try {
      const result = await concessionService.deleteConcession(concessionId);
      setRefreshKey((prev) => prev + 1);
      toast.success(result.message || "Concession supprimée avec succès");
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Erreur lors de la suppression de la concession";
      toast.error(errorMessage);
    }
  };

  const handleSubmit = async (data: ConcessionFormDTO) => {
    try {
      if (selectedConcession) {
        const updateData: UpdateConcessionDTO = {
          name: data.name,
          address: data.address,
        };
        await concessionService.updateConcession(selectedConcession.id, updateData);
        toast.success("Concession mise à jour avec succès");
      } else {
        const createData: CreateConcessionDTO = {
          name: data.name,
          address: data.address,
        };
        await concessionService.createConcession(createData);
        toast.success("Concession créée avec succès");
      }
      setOpenForm(false);
      setRefreshKey((prev) => prev + 1);
    } catch (error) {
      toast.error(
        selectedConcession
          ? "Erreur lors de la mise à jour de la concession"
          : "Erreur lors de la création de la concession"
      );
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Concessions</h1>
        <button
          onClick={handleCreateConcession}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Nouvelle Concession
        </button>
      </div>

      <ConcessionList
        onEdit={handleEditConcession}
        onDelete={handleDeleteConcession}
        refreshKey={refreshKey}
      />

      {openForm && (
        <ConcessionForm
          open={openForm}
          concession={selectedConcession}
          onClose={() => setOpenForm(false)}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}
