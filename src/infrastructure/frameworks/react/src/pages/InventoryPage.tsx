import React, { useState } from 'react';
import Sidebar from '../components/common/Sidebar';
import InventoryPartList from '../components/inventory/InventoryPartList';
import InventoryPartForm from '../components/inventory/InventoryPartForm';
import { inventoryPartService } from '../services/api';
import { CreateInventoryPartDTO } from '@application/inventory/dtos/CreateInventoryPartDTO';

export default function InventoryPage() {
  const [isCreating, setIsCreating] = useState(false);

  const handleCreatePart = async (partData: CreateInventoryPartDTO) => {
    try {
      await inventoryPartService.createInventoryPart(partData);
      setIsCreating(false);
    } catch (error) {
      console.error('Erreur lors de la création de la pièce', error);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200 p-4">
        <div className="container mx-auto px-4 sm:px-8">
          <div className="py-8">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-gray-800">Gestion des Pièces</h1>
              <button 
                onClick={() => setIsCreating(!isCreating)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out transform hover:scale-105"
              >
                {isCreating ? 'Annuler' : '+ Nouvelle Pièce'}
              </button>
            </div>

            {isCreating && (
              <div className="mb-8">
                <InventoryPartForm 
                  onSubmit={handleCreatePart}
                  onCancel={() => setIsCreating(false)}
                />
              </div>
            )}

            <InventoryPartList />
          </div>
        </div>
      </main>
    </div>
  );
}
