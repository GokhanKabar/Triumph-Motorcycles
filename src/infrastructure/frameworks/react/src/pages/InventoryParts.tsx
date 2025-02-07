import React, { useState, useEffect } from 'react';
import { inventoryPartService } from '../services/api';
import { InventoryPartResponseDTO } from '@application/inventory/dtos/InventoryPartResponseDTO';
import { CreateInventoryPartDTO } from '@application/inventory/dtos/CreateInventoryPartDTO';
import { toast } from 'react-toastify';
import InventoryPartList from '../components/inventory/InventoryPartList';
import InventoryPartForm from '../components/inventory/InventoryPartForm';
import { PartCategory } from '@domain/inventory/entities/InventoryPart';

export default function InventoryParts() {
  const [inventoryParts, setInventoryParts] = useState<InventoryPartResponseDTO[]>([]);
  const [openForm, setOpenForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchInventoryParts() {
      try {
        setIsLoading(true);
        const data = await inventoryPartService.getAllInventoryParts();
        setInventoryParts(data);
      } catch (error) {
        toast.error('Erreur lors du chargement des pièces');
      } finally {
        setIsLoading(false);
      }
    }
    fetchInventoryParts();
  }, [refreshKey]);

  const handleCreatePart = async (partData: CreateInventoryPartDTO) => {
    try {
      await inventoryPartService.createInventoryPart(partData);
      toast.success('Pièce créée avec succès');
      setOpenForm(false);
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      toast.error('Erreur lors de la création de la pièce');
    }
  };

  const handleUpdatePart = async (updatedPart: InventoryPartResponseDTO) => {
    try {
      await inventoryPartService.updateInventoryPart(updatedPart.id, updatedPart);
      toast.success('Pièce mise à jour avec succès');
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      toast.error('Erreur lors de la mise à jour de la pièce');
    }
  };

  const handleDeletePart = async (partId: string) => {
    try {
      await inventoryPartService.deleteInventoryPart(partId);
      toast.success('Pièce supprimée avec succès');
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      toast.error('Erreur lors de la suppression de la pièce');
    }
  };

  if (isLoading) {
    return <div className="text-center py-10 text-gray-600">Chargement...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Gestion des Pièces</h1>
        <button 
          onClick={() => setOpenForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
        >
          Nouvelle Pièce
        </button>
      </div>

      {openForm && (
        <div className="mb-6">
          <InventoryPartForm 
            onSubmit={handleCreatePart}
            onCancel={() => setOpenForm(false)}
          />
        </div>
      )}

      <InventoryPartList 
        inventoryParts={inventoryParts} 
        onUpdatePart={handleUpdatePart}
        onDeletePart={handleDeletePart}
      />
    </div>
  );
}
