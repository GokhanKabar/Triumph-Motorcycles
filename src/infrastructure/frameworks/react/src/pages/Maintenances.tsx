import React, { useState, useEffect } from 'react';
import { MaintenanceResponseDTO } from '@application/maintenance/dtos/MaintenanceResponseDTO';
import { CreateMaintenanceDTO } from '@application/maintenance/dtos/CreateMaintenanceDTO';
import { MaintenanceType, MaintenanceStatus } from '@domain/maintenance/entities/Maintenance';
import { MaintenanceForm } from '../components/maintenance/MaintenanceForm';
import { MaintenanceList } from '../components/maintenance/MaintenanceList';
import { maintenanceService } from '../services/api';
import { toast } from 'react-toastify';

export default function Maintenances() {
  const [maintenances, setMaintenances] = useState<MaintenanceResponseDTO[]>([]);
  const [openForm, setOpenForm] = useState(false);
  const [selectedMaintenance, setSelectedMaintenance] = useState<MaintenanceResponseDTO | undefined>();
  const [refreshKey, setRefreshKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMaintenances() {
      try {
        setIsLoading(true);
        setError(null);
        const fetchedMaintenances = await maintenanceService.getAllMaintenances();
        setMaintenances(fetchedMaintenances);
      } catch (err) {
        console.error('Erreur lors du chargement des maintenances:', err);
        setError('Impossible de charger les maintenances');
      } finally {
        setIsLoading(false);
      }
    }

    fetchMaintenances();
  }, [refreshKey]);

  // Fonction utilitaire centralisée pour la gestion des erreurs
  const handleOperationError = (
    error: any, 
    defaultMessage: string, 
    operationType: 'delete' | 'complete' | 'update' | 'create'
  ) => {
    // Extraire le message d'erreur le plus pertinent
    const errorMessage = 
      error.response?.data?.message || 
      error.message || 
      defaultMessage;

    // Log détaillé de l'erreur
    console.error(`Erreur lors de ${operationType} de maintenance:`, error);
    
    // Log supplémentaire pour les erreurs de réponse
    if (error.response) {
      console.error('Détails de la réponse d\'erreur:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      });
    }

    // Notifications personnalisées selon le type d'opération
    const notificationMap = {
      'delete': {
        404: 'La maintenance a déjà été supprimée ou n\'existe plus.',
        403: 'Vous n\'avez pas les autorisations nécessaires pour supprimer cette maintenance.',
        default: 'Impossible de supprimer la maintenance.'
      },
      'complete': {
        404: 'La maintenance ne peut pas être terminée car elle n\'existe plus.',
        403: 'Vous n\'avez pas les autorisations nécessaires pour terminer cette maintenance.',
        default: 'Impossible de terminer la maintenance.'
      },
      'update': {
        404: 'La maintenance ne peut pas être mise à jour car elle n\'existe plus.',
        403: 'Vous n\'avez pas les autorisations nécessaires pour modifier cette maintenance.',
        default: 'Impossible de mettre à jour la maintenance.'
      },
      'create': {
        403: 'Vous n\'avez pas les autorisations nécessaires pour créer une maintenance.',
        default: 'Impossible de créer la maintenance.'
      }
    };

    // Choisir le message de notification
    const notifications = notificationMap[operationType];
    const toastMessage = 
      (error.response && notifications[error.response.status]) || 
      notifications.default;

    // Afficher la notification
    toast.error(toastMessage, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });

    // Retourner le message d'erreur pour une utilisation ultérieure si nécessaire
    return errorMessage;
  };

  const handleCreateMaintenance = async (maintenanceData: CreateMaintenanceDTO) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Validation des données du DTO
      if (!maintenanceData.motorcycleId) {
        toast.error('Un identifiant de moto est requis');
        return;
      }

      if (!maintenanceData.type) {
        toast.error('Le type de maintenance est obligatoire');
        return;
      }

      if (!maintenanceData.scheduledDate) {
        toast.error('La date de maintenance est requise');
        return;
      }

      // Définir un statut par défaut si non spécifié
      const maintenanceToCreate: CreateMaintenanceDTO = {
        ...maintenanceData,
        status: maintenanceData.status || MaintenanceStatus.SCHEDULED,
        mileageAtMaintenance: maintenanceData.mileageAtMaintenance || 0,
      };
      
      const newMaintenance = await maintenanceService.createMaintenance(maintenanceToCreate);
      
      // Mettre à jour l'état directement avec le nouveau tableau
      setMaintenances(prevMaintenances => [...prevMaintenances, newMaintenance]);
      
      // Notification de succès
      toast.success('Maintenance créée avec succès', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      
      setOpenForm(false);
      
      // Déclencher un rafraîchissement global
      setRefreshKey(prev => prev + 1);
      
      return newMaintenance;
    } catch (error: any) {
      // Gestion centralisée des erreurs
      handleOperationError(error, 'Erreur lors de la création de maintenance', 'create');
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteMaintenance = async (maintenanceId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Vérifier si la maintenance existe dans la liste actuelle
      const existingMaintenance = maintenances.find(m => m.id === maintenanceId);
      
      if (!existingMaintenance) {
        handleOperationError(
          new Error('Maintenance non trouvée'), 
          'Maintenance introuvable', 
          'delete'
        );
        return;
      }
      
      // Supprimer la maintenance
      await maintenanceService.deleteMaintenance(maintenanceId);
      
      // Mettre à jour l'état directement avec le nouveau tableau
      setMaintenances(prevMaintenances => 
        prevMaintenances.filter(m => m.id !== maintenanceId)
      );
      
      // Notification de succès
      toast.success('Maintenance supprimée avec succès', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      
      // Déclencher un rafraîchissement global
      setRefreshKey(prev => prev + 1);
    } catch (error: any) {
      // Gestion centralisée des erreurs
      handleOperationError(error, 'Erreur lors de la suppression de maintenance', 'delete');
      
      // Retirer la maintenance de la liste en cas d'erreur 404
      if (error.response?.status === 404) {
        setMaintenances(prevMaintenances => 
          prevMaintenances.filter(m => m.id !== maintenanceId)
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateMaintenance = async (maintenanceId: string, maintenanceData: CreateMaintenanceDTO) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const updatedMaintenance = await maintenanceService.updateMaintenance(maintenanceId, maintenanceData);
      
      // Mettre à jour l'état directement avec le tableau mis à jour
      setMaintenances(prevMaintenances => 
        prevMaintenances.map(m => m.id === maintenanceId ? updatedMaintenance : m)
      );
      
      // Notification de succès
      toast.success('Maintenance mise à jour avec succès', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      
      setSelectedMaintenance(undefined);
      
      // Déclencher un rafraîchissement global
      setRefreshKey(prev => prev + 1);
      
      return updatedMaintenance;
    } catch (error: any) {
      // Gestion centralisée des erreurs
      handleOperationError(error, 'Erreur lors de la mise à jour de maintenance', 'update');
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteMaintenance = async (maintenanceId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const maintenance = maintenances.find(m => m.id === maintenanceId);
      
      if (!maintenance) {
        toast.error('Maintenance non trouvée');
        return;
      }
      
      // Utiliser le service pour compléter la maintenance
      const completedMaintenance = await maintenanceService.completeMaintenance(maintenanceId);
      
      // Mettre à jour la liste des maintenances
      setMaintenances(prevMaintenances => 
        prevMaintenances.map(m => m.id === maintenanceId ? completedMaintenance : m)
      );
      
      // Déclencher un rafraîchissement global
      setRefreshKey(prev => prev + 1);
      
      return completedMaintenance;
    } catch (error: any) {
      // Vérifier si l'erreur indique que la maintenance est déjà terminée
      const isAlreadyCompletedError = 
        error.response?.status === 400 && 
        error.response?.data?.message?.includes('déjà terminée');
      
      // Ne pas afficher de toast d'erreur si la maintenance est déjà terminée
      if (!isAlreadyCompletedError) {
        // Gestion centralisée des erreurs
        handleOperationError(error, 'Erreur lors de la complétion de maintenance', 'complete');
      }
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Gestion des Maintenances</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Erreur: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {isLoading && (
        <div className="flex justify-center items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <button 
            onClick={() => setOpenForm(true)} 
            className="bg-green-500 text-white px-4 py-2 rounded mb-4 hover:bg-green-600"
          >
            Nouvelle Maintenance
          </button>

          {openForm && (
            <div className="mb-4">
              <MaintenanceForm 
                onSubmit={handleCreateMaintenance}
                initialData={{}}
              />
            </div>
          )}
        </div>

        <div>
          <MaintenanceList 
            maintenances={maintenances} 
            onComplete={handleCompleteMaintenance}
            onDelete={handleDeleteMaintenance}
          />
        </div>
      </div>
    </div>
  );
}
