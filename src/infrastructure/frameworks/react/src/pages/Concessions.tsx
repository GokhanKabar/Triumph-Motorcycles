import React, { useState, useEffect } from "react";
import ConcessionList from "../components/concessions/ConcessionList";
import {
  CreateConcessionDTO,
  ConcessionResponseDTO,
  UpdateConcessionDTO,
  ConcessionFormDTO,
  DeleteConcessionResponseDTO
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
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchCurrentUser = () => {
      try {
        // Récupérer l'utilisateur depuis le localStorage
        const userString = localStorage.getItem('user');
        if (userString) {
          const user = JSON.parse(userString);
          setCurrentUserId(user.id);
        } else {
          console.error("Aucun utilisateur trouvé dans le localStorage");
          toast.error("Utilisateur non connecté");
        }
      } catch (error) {
        console.error("Erreur lors de la récupération de l'utilisateur :", error);
        toast.error("Impossible de récupérer l'utilisateur connecté");
      }
    };

    fetchCurrentUser();
  }, []);

  const handleCreateConcession = () => {
    setSelectedConcession(undefined);
    setOpenForm(true);
  };

  const handleUpdateConcession = async (concessionData: ConcessionFormDTO) => {
    if (!currentUserId) {
      toast.error("Utilisateur non connecté");
      return;
    }

    try {
      const updateData = {
        name: concessionData.name.trim(),
        address: concessionData.address.trim()
      };
      await concessionService.updateConcession(selectedConcession!.id, updateData);
      toast.success("Concession mise à jour avec succès");
      setRefreshKey((prev) => prev + 1);
      setOpenForm(false);
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la concession:", error);
      toast.error(error instanceof Error ? error.message : "Erreur lors de la mise à jour");
    }
  };

  const handleSubmit = async (data: ConcessionFormDTO) => {
    if (selectedConcession) {
      // Logique de mise à jour
      await handleUpdateConcession(data);
    } else {
      // Logique de création
      try {
        const createData: CreateConcessionDTO = {
          name: data.name.trim(),
          address: data.address.trim(),
          userId: currentUserId!
        };

        const newConcession = await concessionService.createConcession(createData);
        
        toast.success("Concession créée avec succès");
        setRefreshKey((prev) => prev + 1);
        setOpenForm(false);
      } catch (error) {
        console.error("Erreur lors de la création de la concession:", error);
        toast.error(error instanceof Error ? error.message : "Erreur lors de la création");
      }
    }
  };

  const handleEditConcession = (concession: ConcessionResponseDTO) => {
    setSelectedConcession(concession);
    setOpenForm(true);
  };

  const handleDeleteConcession = async (concessionId: string) => {
    try {
      console.log('Tentative de suppression de la concession:', concessionId);
      const result = await concessionService.deleteConcession(concessionId);
      console.log('Résultat de la suppression:', result);

      if (result.success) {
        toast.success(result.message);
        setRefreshKey((prev) => prev + 1);
      } else {
        // Gérer les différents types d'erreurs
        console.error('Erreur de suppression:', result);
        
        // Cas spécifique : concession avec des motos
        if (result.error?.code === 'CONCESSION_HAS_MOTORCYCLES') {
          const motorcycleCount = result.error.details?.motorcycleCount || 'plusieurs';
          const errorMessage = `Impossible de supprimer la concession car elle possède ${motorcycleCount} motos. Veuillez d'abord supprimer ou réaffecter toutes les motos.`;
          console.warn(errorMessage);
          toast.error(errorMessage);
        } 
        // Autres cas d'erreur
        else {
          const errorMessage = result.message || 'Erreur lors de la suppression de la concession';
          toast.error(errorMessage);
        }
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de la concession:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Erreur lors de la suppression de la concession";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Gestion des Concessions</h1>
        <button
          onClick={handleCreateConcession}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Ajouter une concession
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
          onClose={() => {
            setOpenForm(false);
            setSelectedConcession(undefined);
          }}
          onSubmit={handleSubmit}
          userId={currentUserId} // Passer l'ID utilisateur
        />
      )}
    </div>
  );
}
