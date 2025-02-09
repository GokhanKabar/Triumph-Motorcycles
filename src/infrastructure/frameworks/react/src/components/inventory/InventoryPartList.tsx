import React, { useState, useEffect } from 'react';
import { inventoryPartService } from '../../services/api';
import { InventoryPartResponseDTO } from '@application/inventory/dtos/InventoryPartResponseDTO';
import InventoryPartForm from './InventoryPartForm';

export default function InventoryPartList() {
  const [inventoryParts, setInventoryParts] = useState<InventoryPartResponseDTO[]>([]);
  const [selectedPart, setSelectedPart] = useState<InventoryPartResponseDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInventoryParts = async () => {
    try {
      setIsLoading(true);
      const parts = await inventoryPartService.getAllParts();
      setInventoryParts(parts);
      setError(null);
    } catch (err) {
      console.error('Erreur lors de la récupération des pièces d\'inventaire', err);
      setError('Impossible de charger les pièces d\'inventaire');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInventoryParts();
  }, []);

  const handleUpdate = async (updatedPartData: Partial<InventoryPartResponseDTO>) => {
    if (!selectedPart) return;

    try {
      // Filtrer les champs qui ont réellement changé
      const changedFields = Object.fromEntries(
        Object.entries(updatedPartData).filter(([key, value]) => 
          value !== (selectedPart as any)[key]
        )
      );

      const updatedPart = await inventoryPartService.updatePart(
        selectedPart.id, 
        changedFields
      );
      
      // Mettre à jour la liste complète
      setInventoryParts(prevParts => 
        prevParts.map(part => 
          part.id === updatedPart.id ? updatedPart : part
        )
      );

      // Réinitialiser la partie sélectionnée
      setSelectedPart(null);
    } catch (err) {
      console.error('Erreur lors de la mise à jour de la pièce', err);
      setError('Impossible de mettre à jour la pièce');
    }
  };

  const handleStockChange = async (partId: string, quantity: number, action: 'add' | 'remove') => {
    try {
      const updatedPart = await inventoryPartService.manageStock(partId, {
        quantity,
        action
      });
      
      setInventoryParts(prevParts => 
        prevParts.map(part => 
          part.id === updatedPart.id ? updatedPart : part
        )
      );
    } catch (err) {
      console.error('Erreur lors de la modification du stock', err);
      setError('Impossible de modifier le stock');
    }
  };

  const handleDelete = async (partId: string) => {
    try {
      // Confirmation avant suppression
      const confirmDelete = window.confirm('Voulez-vous vraiment supprimer cette pièce ? Cette action est irréversible.');
      
      if (!confirmDelete) return;

      // Vérifier le stock avant suppression
      const partToDelete = inventoryParts.find(part => part.id === partId);
      
      if (partToDelete && partToDelete.currentStock > 0) {
        setError(`Impossible de supprimer la pièce ${partToDelete.name} car elle a encore du stock (${partToDelete.currentStock})`);
        return;
      }

      await inventoryPartService.deletePart(partId);
      
      // Mettre à jour la liste des pièces
      setInventoryParts(prevParts => 
        prevParts.filter(part => part.id !== partId)
      );

      // Message de succès
      const successToast = document.createElement('div');
      successToast.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg';
      successToast.textContent = 'Pièce supprimée avec succès';
      document.body.appendChild(successToast);
      
      // Supprimer le toast après 3 secondes
      setTimeout(() => {
        document.body.removeChild(successToast);
      }, 3000);

    } catch (err) {
      console.error('Erreur lors de la suppression de la pièce', err);
      
      // Gestion des erreurs spécifiques
      if (err.message.includes('stock en inventaire')) {
        setError('Impossible de supprimer une pièce avec du stock en inventaire');
      } else {
        setError('Erreur lors de la suppression de la pièce');
      }
    }
  };

  const getStockStatusClass = (currentStock: number, minStockThreshold: number) => {
    return currentStock < minStockThreshold 
      ? 'bg-red-100 text-red-800 border-red-200' 
      : 'bg-green-100 text-green-800 border-green-200';
  };

  if (isLoading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-500"></div>
    </div>
  );

  if (error) return (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
      <div className="flex items-center">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-6 w-6 mr-2" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
          />
        </svg>
        <span>{error}</span>
      </div>
    </div>
  );

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      {/* Modal d'édition */}
      {selectedPart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative">
            <button 
              onClick={() => setSelectedPart(null)}
              className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
            >
              ✕
            </button>
            <InventoryPartForm 
              onSubmit={handleUpdate}
              initialData={selectedPart}
              isEditMode={true}
              onCancel={() => setSelectedPart(null)}
            />
          </div>
        </div>
      )}

      <table className="w-full">
        <thead className="bg-gray-100 border-b">
          <tr>
            {['Nom', 'Référence', 'Catégorie', 'Stock Actuel', 'Prix Unitaire', 'Actions'].map((header) => (
              <th 
                key={header} 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {inventoryParts.map((part) => (
            <tr key={part.id} className="hover:bg-gray-50 transition duration-150">
              <td className="px-6 py-4 whitespace-nowrap">{part.name}</td>
              <td className="px-6 py-4 whitespace-nowrap">{part.referenceNumber}</td>
              <td className="px-6 py-4 whitespace-nowrap">{part.category}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleStockChange(part.id, 1, 'remove')}
                    className="bg-red-100 text-red-600 p-1 rounded-full hover:bg-red-200 disabled:opacity-50"
                    disabled={part.currentStock <= 0}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <span 
                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStockStatusClass(part.currentStock, part.minStockThreshold)}`}
                  >
                    {part.currentStock}
                  </span>
                  <button
                    onClick={() => handleStockChange(part.id, 1, 'add')}
                    className="bg-green-100 text-green-600 p-1 rounded-full hover:bg-green-200"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 01-1 1h-3a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">{part.unitPrice} €</td>
              <td className="px-6 py-4 whitespace-nowrap flex space-x-2">
                <button
                  onClick={() => setSelectedPart(part)}
                  className="text-blue-600 hover:text-blue-900 transition-colors"
                  aria-label="Éditer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDelete(part.id)}
                  className="text-red-600 hover:text-red-900 transition-colors"
                  aria-label="Supprimer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {inventoryParts.length === 0 && (
        <div className="text-center py-10 text-gray-500">
          Aucune pièce d'inventaire trouvée
        </div>
      )}
    </div>
  );
}
