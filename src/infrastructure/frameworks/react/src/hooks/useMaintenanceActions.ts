import { useState } from 'react';
import { toast } from 'react-toastify';
import { maintenanceService, motorcycleService } from '../services/api';
import { MaintenanceResponseDTO } from '@application/maintenance/dtos/MaintenanceResponseDTO';
import { MaintenanceStatus } from '@domain/maintenance/entities/Maintenance';

interface UseMaintenanceActionsParams {
  onComplete?: (maintenanceId: string) => void;
  setMaintenances?: React.Dispatch<React.SetStateAction<MaintenanceResponseDTO[]>>;
  setRefreshKey?: React.Dispatch<React.SetStateAction<number>>;
}

export const useMaintenanceActions = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCompleteMaintenance = async (
    maintenances: MaintenanceResponseDTO[], 
    maintenanceId: string, 
    params: UseMaintenanceActionsParams = {}
  ) => {
    const { 
      onComplete, 
      setMaintenances, 
      setRefreshKey 
    } = params;

    try {
      setIsLoading(true);
      setError(null);
      
      // Vérifier si la maintenance existe
      const maintenance = maintenances.find(m => m.id === maintenanceId);
      
      if (!maintenance) {
        toast.error('Maintenance non trouvée');
        return null;
      }
      
      // Essayer de compléter la maintenance via le service
      const completedMaintenance = await maintenanceService.completeMaintenance(maintenanceId);
      
      // Charger les détails de la moto si nécessaire
      if (completedMaintenance && !completedMaintenance.motorcycle && completedMaintenance.motorcycleId) {
        try {
          const motorcycle = await motorcycleService.getMotorcycle(completedMaintenance.motorcycleId);
          completedMaintenance.motorcycle = motorcycle;
        } catch (motorcycleError) {
          console.warn(`Impossible de charger les détails de la moto ${completedMaintenance.motorcycleId}:`, motorcycleError);
        }
      }
      
      // Mettre à jour la liste des maintenances si un setter est fourni
      if (setMaintenances) {
        setMaintenances(prevMaintenances => 
          prevMaintenances.map(m => m.id === maintenanceId ? completedMaintenance : m)
        );
      }
      
      // Déclencher un rafraîchissement global si un setter est fourni
      if (setRefreshKey) {
        setRefreshKey(prev => prev + 1);
      }
      
      // Notification de succès
      toast.success('Maintenance terminée avec succès', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      
      // Déclencher le callback parent si fourni
      if (onComplete) {
        onComplete(maintenanceId);
      }
      
      return completedMaintenance;
    } catch (error: any) {
      // Vérifier si l'erreur indique que la maintenance est déjà terminée
      const isAlreadyCompletedError = 
        error.response?.status === 400 && 
        error.response?.data?.message?.includes('déjà terminée');
      
      // Ne pas afficher de toast d'erreur si la maintenance est déjà terminée
      if (!isAlreadyCompletedError) {
        toast.error('Impossible de terminer la maintenance', {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
      
      // Log de l'erreur
      console.error('Erreur lors de la complétion de maintenance:', error);
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    handleCompleteMaintenance,
    isLoading,
    error
  };
};
