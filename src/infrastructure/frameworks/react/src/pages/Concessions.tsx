import { useState, useEffect } from "react";
import ConcessionList from "../components/concessions/ConcessionList";
import {
  CreateConcessionDTO,
  ConcessionResponseDTO,
  ConcessionFormDTO
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
          toast.error("Utilisateur non connecté");
        }
      } catch (error) {
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
      const result = await concessionService.deleteConcession(concessionId);

      if (result.success) {
        toast.success(result.message);
        setRefreshKey((prev) => prev + 1);
      } else {
        // Cas spécifique : concession avec des motos
        if (result.error?.code === 'CONCESSION_HAS_MOTORCYCLES') {
          const motorcycleCount = result.error.details?.motorcycleCount || 'plusieurs';
          toast.error(`Impossible de supprimer la concession car elle possède ${motorcycleCount} motos. Veuillez d'abord supprimer ou réaffecter toutes les motos.`);
        } 
        // Autres cas d'erreur
        else {
          toast.error(result.message || 'Erreur lors de la suppression de la concession');
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Erreur lors de la suppression de la concession";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="container px-4 py-8 mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Gestion des Concessions</h1>
        <button
          onClick={handleCreateConcession}
          className="px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-blue-700"
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
          userId={currentUserId}
        />
      )}
    </div>
  );
}
