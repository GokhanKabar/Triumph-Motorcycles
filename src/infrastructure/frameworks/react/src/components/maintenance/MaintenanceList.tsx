import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { maintenanceService } from '../../services/api';
import { motorcycleService } from '../../services/api';
import { MaintenanceResponseDTO } from '@application/maintenance/dtos/MaintenanceResponseDTO';
import { MaintenanceForm } from './MaintenanceForm';
import { CreateMaintenanceDTO } from '@application/maintenance/dtos/CreateMaintenanceDTO';
import { MaintenanceStatus } from '@domain/maintenance/entities/Maintenance';

interface MaintenanceListProps {
  maintenances: MaintenanceResponseDTO[];
  onComplete?: (maintenanceId: string) => void;
  onDelete?: (maintenanceId: string) => void;
  onEdit?: (maintenance: MaintenanceResponseDTO) => void;
}

export function MaintenanceList({ 
  maintenances, 
  onComplete, 
  onDelete, 
  onEdit 
}: MaintenanceListProps) {
  const [extendedMaintenances, setExtendedMaintenances] = useState<MaintenanceResponseDTO[]>(maintenances);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMaintenance, setSelectedMaintenance] = useState<MaintenanceResponseDTO | null>(null);

  // Fonction utilitaire centralisée pour la gestion des erreurs
  const handleOperationError = (
    error: any, 
    defaultMessage: string, 
    operationType: 'delete' | 'complete' | 'update'
  ) => {
    // Extraire le message d'erreur le plus pertinent
    const errorMessage = 
      error.response?.data?.message || 
      error.message || 
      defaultMessage;

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

  const handleCompleteMaintenance = async (maintenanceId: string, showToast: boolean = true) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Vérifier si la maintenance existe dans la liste actuelle
      const existingMaintenance = extendedMaintenances.find(m => m.id === maintenanceId);
      
      if (!existingMaintenance) {
        handleOperationError(
          new Error('Maintenance non trouvée'), 
          'Maintenance introuvable', 
          'complete'
        );
        return;
      }
      
      // Tenter de récupérer la maintenance actuelle
      let currentMaintenance;
      try {
        currentMaintenance = await maintenanceService.getMaintenanceById(maintenanceId);
      } catch (fetchError: any) {
        // Si 404, utiliser les données de la liste existante
        if (fetchError.response?.status === 404) {
          currentMaintenance = existingMaintenance;
        } else {
          throw fetchError;
        }
      }
      
      // Mettre à jour la maintenance avec le statut COMPLETED
      const updatedMaintenance = await maintenanceService.updateMaintenance(maintenanceId, {
        ...currentMaintenance,
        status: MaintenanceStatus.COMPLETED,
        actualDate: new Date(),
        mileageAtMaintenance: currentMaintenance.motorcycle?.mileage || 0,
        technicianNotes: 'Maintenance terminée'
      });
      
      // Mettre à jour l'état directement avec le tableau mis à jour
      setExtendedMaintenances(prevMaintenances => 
        prevMaintenances.map(m => m.id === maintenanceId ? updatedMaintenance : m)
      );
      
      // Notification de succès conditionnelle
      if (showToast) {
        toast.success('Maintenance terminée avec succès', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
      
      // Déclencher un rafraîchissement global
      if (onComplete) {
        onComplete(maintenanceId);
      }
      
      return updatedMaintenance;
    } catch (error: any) {
      // Gestion centralisée des erreurs
      handleOperationError(error, 'Erreur lors de la complétion de maintenance', 'complete');
      
      // Retirer la maintenance de la liste en cas d'erreur 404
      if (error.response?.status === 404) {
        setExtendedMaintenances(prevMaintenances => 
          prevMaintenances.filter(m => m.id !== maintenanceId)
        );
      }
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (maintenanceId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Vérifier si la maintenance existe dans la liste actuelle
      const existingMaintenance = extendedMaintenances.find(m => m.id === maintenanceId);
      
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

      if (onDelete) {
        onDelete(maintenanceId);
      }
      
      // Notification de succès
      toast.success('Maintenance supprimée avec succès', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (error: any) {
      // Gestion centralisée des erreurs
      handleOperationError(error, 'Erreur lors de la suppression de maintenance', 'delete');
      
      // Retirer la maintenance de la liste en cas d'erreur 404
      if (error.response?.status === 404) {
        setExtendedMaintenances(prevMaintenances => 
          prevMaintenances.filter(m => m.id !== maintenanceId)
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditMaintenance = async (maintenance: MaintenanceResponseDTO) => {
    try {
      if (onEdit) {
        onEdit(maintenance);
      }
      setSelectedMaintenance(maintenance);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 
        error.message || 
        'Erreur lors de l\'édition de la maintenance';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleUpdateMaintenance = async (maintenanceData: CreateMaintenanceDTO) => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!selectedMaintenance) {
        toast.error('Aucune maintenance sélectionnée');
        return;
      }

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
      const maintenanceToUpdate: CreateMaintenanceDTO = {
        ...maintenanceData,
        status: maintenanceData.status || 'SCHEDULED',
        mileageAtMaintenance: maintenanceData.mileageAtMaintenance || 0,
      };

      if (selectedMaintenance) {
        await maintenanceService.updateMaintenance(selectedMaintenance.id, maintenanceToUpdate);
        setSelectedMaintenance(null);
        
        // Notification de succès
        toast.success('Maintenance mise à jour avec succès', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    } catch (error: any) {
      // Gestion centralisée des erreurs
      handleOperationError(error, 'Erreur lors de la mise à jour de la maintenance', 'update');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return 'bg-yellow-100 text-yellow-800';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getMotorcycleName = (maintenance: MaintenanceResponseDTO) => {
    // Vérifier si les informations de la moto sont disponibles
    if (!maintenance.motorcycle) {
      return 'Moto non disponible';
    }

    const { brand, model, year } = maintenance.motorcycle;

    // Construire le nom de la moto avec des valeurs par défaut
    const motorcycleName = [
      brand || 'Marque inconnue', 
      model || 'Modèle inconnu', 
      year ? `(${year})` : ''
    ].filter(Boolean).join(' ');

    return motorcycleName;
  };

  const renderMaintenanceDetails = (maintenance: MaintenanceResponseDTO) => {
    const formatDate = (date: Date) => {
      return new Date(date).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    };

    const formatType = (type: string) => {
      switch (type) {
        case 'PREVENTIVE':
          return 'Maintenance Préventive';
        case 'CURATIVE':
          return 'Maintenance Curative';
        default:
          return 'Type de maintenance non spécifié';
      }
    };

    const formatMileage = (mileage: number | undefined) => {
      return mileage !== undefined && !isNaN(mileage) 
        ? `${mileage.toLocaleString('fr-FR')} km` 
        : '0 km';
    };

    const formatCost = (cost: number | string | undefined) => {
      const numericCost = typeof cost === 'string' 
        ? parseFloat(cost) 
        : cost;

      return numericCost !== undefined && !isNaN(numericCost) 
        ? `${Number(numericCost).toFixed(2)} €` 
        : 'Non spécifié';
    };

    return (
      <div className="p-4 mb-4 bg-white rounded-lg shadow-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">
            {getMotorcycleName(maintenance)}
          </h3>
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(maintenance.status)}`}>
              {maintenance.status === 'SCHEDULED' ? 'Programmé' : 
               maintenance.status === 'IN_PROGRESS' ? 'En cours' : 
               maintenance.status === 'COMPLETED' ? 'Terminé' : 
               'Annulé'}
            </span>
            {maintenance.status !== 'COMPLETED' && (
              <button 
                onClick={() => setSelectedMaintenance(maintenance)}
                className="px-3 py-1 text-xs text-white transition duration-200 bg-blue-500 rounded-md hover:bg-blue-600"
              >
                Modifier
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => handleDelete(maintenance.id)}
                className="px-3 py-1 text-white transition-colors bg-red-500 rounded hover:bg-red-600"
              >
                Supprimer
              </button>
            )}
            {onEdit && (
              <button
                onClick={() => handleEditMaintenance(maintenance)}
                className="px-3 py-1 text-white transition-colors bg-blue-500 rounded hover:bg-blue-600"
              >
                Éditer
              </button>
            )}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-gray-600">Type de maintenance</p>
            <p className="font-medium">{formatType(maintenance.type)}</p>
          </div>
          <div>
            <p className="text-gray-600">Date programmée</p>
            <p className="font-medium">{formatDate(maintenance.scheduledDate)}</p>
          </div>
          <div>
            <p className="text-gray-600">Kilométrage</p>
            <p className="font-medium">{formatMileage(maintenance.mileageAtMaintenance)}</p>
          </div>
          <div>
            <p className="text-gray-600">Coût total</p>
            <p className="font-medium">{formatCost(maintenance.totalCost)}</p>
          </div>
          {maintenance.technicianNotes && (
            <div className="col-span-2">
              <p className="text-gray-600">Notes du technicien</p>
              <p className="font-medium">{maintenance.technicianNotes}</p>
            </div>
          )}
          {maintenance.replacedParts && maintenance.replacedParts.length > 0 && (
            <div className="col-span-2">
              <p className="text-gray-600">Pièces remplacées</p>
              <ul className="list-disc list-inside">
                {maintenance.replacedParts.map((part, index) => (
                  <li key={index} className="font-medium">{part}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
        {maintenance.nextMaintenanceRecommendation && (
          <div className="pt-4 mt-4 border-t">
            <p className="text-gray-600">Prochaine maintenance recommandée</p>
            <p className="font-medium">{formatDate(maintenance.nextMaintenanceRecommendation)}</p>
          </div>
        )}
        <div className="flex mt-4 space-x-2">
          {maintenance.status !== 'COMPLETED' && onComplete && (
            <button
              onClick={() => handleCompleteMaintenance(maintenance.id)}
              className="px-3 py-1 text-white transition-colors bg-green-500 rounded hover:bg-green-600"
            >
              Terminer
            </button>
          )}
        </div>
      </div>
    );
  };

  // Charger les informations de la moto pour chaque maintenance
  const loadMotorcycleDetails = async (maintenances: MaintenanceResponseDTO[]) => {
    try {
      const updatedMaintenances = await Promise.all(
        maintenances.map(async (maintenance) => {
          if (!maintenance.motorcycle && maintenance.motorcycleId) {
            try {
              const motorcycle = await motorcycleService.getMotorcycle(maintenance.motorcycleId);
              return {
                ...maintenance,
                motorcycle: motorcycle
              };
            } catch (error) {
              return maintenance;
            }
          }
          return maintenance;
        })
      );

      return updatedMaintenances;
    } catch (error) {
      return maintenances;
    }
  };

  // Effet pour charger les détails des motos
  useEffect(() => {
    const fetchMotorcycleDetails = async () => {
      setIsLoading(true);
      try {
        if (maintenances.length > 0) {
          const updatedMaintenances = await loadMotorcycleDetails(maintenances);
          setExtendedMaintenances(updatedMaintenances);
        }
      } catch (err) {
        setError('Impossible de charger les détails des maintenances');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMotorcycleDetails();
  }, [maintenances]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-32 h-32 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative px-4 py-3 text-red-700 bg-red-100 border border-red-400 rounded" role="alert">
        {error}
      </div>
    );
  }

  // Si une maintenance est sélectionnée pour modification
  if (selectedMaintenance) {
    return (
      <MaintenanceForm 
        initialData={{
          motorcycleId: selectedMaintenance.motorcycle?.id || '',
          type: selectedMaintenance.type,
          scheduledDate: new Date(selectedMaintenance.scheduledDate),
          status: selectedMaintenance.status,
          mileageAtMaintenance: selectedMaintenance.mileageAtMaintenance,
          technicianNotes: selectedMaintenance.technicianNotes || '',
          replacedParts: selectedMaintenance.replacedParts || [],
          totalCost: selectedMaintenance.totalCost,
          nextMaintenanceRecommendation: selectedMaintenance.nextMaintenanceRecommendation 
            ? new Date(selectedMaintenance.nextMaintenanceRecommendation) 
            : undefined,
          actualDate: selectedMaintenance.actualDate 
            ? new Date(selectedMaintenance.actualDate) 
            : new Date()
        }}
        onSubmit={handleUpdateMaintenance}
        isEditMode={true}
      />
    );
  }

  return (
    <div className="container px-4 py-8 mx-auto">
      <h2 className="mb-6 text-2xl font-bold">Liste des Maintenances</h2>
      
      {extendedMaintenances.length === 0 ? (
        <p className="text-center text-gray-500">Aucune maintenance trouvée.</p>
      ) : (
        extendedMaintenances.map(maintenance => (
          <div key={maintenance.id}>
            {renderMaintenanceDetails(maintenance)}
          </div>
        ))
      )}
    </div>
  );
}
