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

  useEffect(() => {
    async function fetchMaintenances() {
      try {
        console.log('DEBUG: Tentative de récupération des maintenances');
        const data = await maintenanceService.getAllMaintenances();
        console.log('DEBUG: Maintenances récupérées', data);
        setMaintenances(data);
      } catch (error) {
        console.error('DEBUG: Erreur détaillée lors du chargement des maintenances', error);
        toast.error('Erreur lors du chargement des maintenances');
      }
    }
    fetchMaintenances();
  }, [refreshKey]);

  const handleCreateMaintenance = async (maintenanceData: CreateMaintenanceDTO) => {
    try {
      const newMaintenance = await maintenanceService.createMaintenanceWithDetails(maintenanceData);
      setMaintenances(prev => [...prev, newMaintenance]);
      toast.success('Maintenance créée avec succès');
      setOpenForm(false);
    } catch (error) {
      toast.error('Erreur lors de la création de maintenance');
    }
  };

  const handleDeleteMaintenance = async (maintenanceId: string) => {
    try {
      await maintenanceService.deleteMaintenanceWithDetails(maintenanceId);
      setMaintenances(prev => prev.filter(m => m.id !== maintenanceId));
      toast.success('Maintenance supprimée avec succès');
    } catch (error) {
      toast.error('Erreur lors de la suppression de maintenance');
    }
  };

  const handleUpdateMaintenance = async (maintenanceId: string, maintenanceData: CreateMaintenanceDTO) => {
    try {
      const updatedMaintenance = await maintenanceService.updateMaintenanceWithDetails(maintenanceId, maintenanceData);
      setMaintenances(prev => 
        prev.map(m => m.id === maintenanceId ? updatedMaintenance : m)
      );
      toast.success('Maintenance mise à jour avec succès');
      setSelectedMaintenance(undefined);
    } catch (error) {
      toast.error('Erreur lors de la mise à jour de maintenance');
    }
  };

  const handleCompleteMaintenance = async (maintenanceId: string) => {
    try {
      const updatedMaintenance = await maintenanceService.completeMaintenanceWithDetails(maintenanceId, {
        actualDate: new Date(),
        mileageAtMaintenance: 0, // À ajuster selon vos besoins
        technicianNotes: 'Maintenance terminée'
      });
      
      setMaintenances(prev => 
        prev.map(m => m.id === maintenanceId ? updatedMaintenance : m)
      );
      
      toast.success('Maintenance terminée avec succès');
    } catch (error) {
      toast.error('Erreur lors de la complétion de maintenance');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Gestion des Maintenances</h1>
      
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
