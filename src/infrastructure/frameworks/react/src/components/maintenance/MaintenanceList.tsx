import React, { useState, useEffect, useCallback } from 'react';
import { maintenanceService } from '../../services/api';
import {
  IMaintenanceListProps,
  IMaintenanceListState,
  IMaintenanceListHandlers
} from '../../interfaces/components/IMaintenanceList';
import { MaintenanceResponseDTO } from '@application/maintenance/dtos/MaintenanceResponseDTO';
import { MaintenanceForm } from './MaintenanceForm';
import { CreateMaintenanceDTO } from '@application/maintenance/dtos/CreateMaintenanceDTO';

interface MaintenanceListProps {
  maintenances: MaintenanceResponseDTO[];
  onComplete?: (maintenanceId: string) => void;
  onDelete?: (maintenanceId: string) => void;
  onEdit?: (maintenance: MaintenanceResponseDTO) => void;
}

const useMaintenanceListHandlers = (
  state: IMaintenanceListState,
  setState: React.Dispatch<React.SetStateAction<IMaintenanceListState>>
): IMaintenanceListHandlers => {
  const handleCompleteMaintenance = async (maintenanceId: string) => {
    try {
      const updatedMaintenance = await maintenanceService.completeMaintenanceWithDetails(maintenanceId, {
        actualDate: new Date(),
        mileageAtMaintenance: 0, // À ajuster selon vos besoins
        technicianNotes: 'Maintenance terminée'
      });

      // Mettre à jour directement la liste des maintenances
      setState(prevState => ({
        ...prevState,
        maintenances: prevState.maintenances.map(maintenance => 
          maintenance.id === maintenanceId ? updatedMaintenance : maintenance
        )
      }));

      toast.success('Maintenance terminée avec succès');
    } catch (error) {
      setState(prevState => ({
        ...prevState,
        error: error instanceof Error ? error : new Error('Échec de la complétion de maintenance')
      }));
      toast.error('Erreur lors de la complétion de maintenance');
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

  return {
    handleCompleteMaintenance,
    getStatusColor
  };
};

export function MaintenanceList({ 
  maintenances, 
  onComplete, 
  onDelete, 
  onEdit 
}: MaintenanceListProps) {
  console.log('DEBUG: Rendu MaintenanceList', { 
    maintenances, 
    maintenancesCount: maintenances.length 
  });

  const [state, setState] = useState<IMaintenanceListState>({
    maintenances: maintenances,
    isLoading: false,
    error: null
  });

  const [selectedMaintenance, setSelectedMaintenance] = useState<MaintenanceResponseDTO | null>(null);

  const { handleCompleteMaintenance, getStatusColor } = useMaintenanceListHandlers(
    state, 
    setState
  );

  useEffect(() => {
    setState(prevState => ({
      ...prevState,
      maintenances: maintenances
    }));
  }, [maintenances]);

  const handleComplete = async (maintenanceId: string) => {
    await handleCompleteMaintenance(maintenanceId);
    if (onComplete) {
      onComplete(maintenanceId);
    }
  };

  const handleUpdateMaintenance = async (maintenanceData: CreateMaintenanceDTO) => {
    try {
      if (selectedMaintenance) {
        await maintenanceService.updateMaintenance(selectedMaintenance.id, maintenanceData);
        setSelectedMaintenance(null);
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la maintenance:', error);
      setState(prevState => ({
        ...prevState,
        error: error instanceof Error ? error : new Error('Échec de la mise à jour de maintenance')
      }));
    }
  };

  const handleEditMaintenance = async (maintenance: MaintenanceResponseDTO) => {
    try {
      if (onEdit) {
        onEdit(maintenance);
      }
    } catch (error) {
      console.error('Erreur lors de l\'édition de la maintenance:', error);
      setState(prevState => ({
        ...prevState,
        error: error instanceof Error ? error : new Error('Échec de l\'édition de maintenance')
      }));
    }
  };

  const renderMaintenanceDetails = (maintenance: MaintenanceResponseDTO) => {
    console.log('DEBUG: Maintenance details', {
      maintenanceId: maintenance.id,
      motorcycle: maintenance.motorcycle,
      motorcycleId: maintenance.motorcycleId
    });

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
      <div className="bg-white shadow-md rounded-lg p-4 mb-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">
            {maintenance.motorcycle ? `${maintenance.motorcycle.brand} ${maintenance.motorcycle.model}` : 'Moto non disponible'}
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
                className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-200 text-xs"
              >
                Modifier
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(maintenance.id)}
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors"
              >
                Supprimer
              </button>
            )}
            {onEdit && (
              <button
                onClick={() => handleEditMaintenance(maintenance)}
                className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors"
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
          <div className="mt-4 border-t pt-4">
            <p className="text-gray-600">Prochaine maintenance recommandée</p>
            <p className="font-medium">{formatDate(maintenance.nextMaintenanceRecommendation)}</p>
          </div>
        )}
        <div className="mt-4 flex space-x-2">
          {maintenance.status !== 'COMPLETED' && onComplete && (
            <button
              onClick={() => onComplete(maintenance.id)}
              className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition-colors"
            >
              Terminer
            </button>
          )}
        </div>
      </div>
    );
  };

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
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6">Liste des Maintenances</h2>
      {state.error ? (
        <p className="text-red-500">Erreur : {state.error.message}</p>
      ) : maintenances.length === 0 ? (
        <p>Aucune maintenance trouvée.</p>
      ) : (
        maintenances.map(maintenance => (
          <div key={maintenance.id}>
            {renderMaintenanceDetails(maintenance)}
          </div>
        ))
      )}
    </div>
  );
}
