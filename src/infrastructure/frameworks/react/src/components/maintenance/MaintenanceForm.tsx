import React, { useState, useEffect } from 'react';

import { MaintenanceType, MaintenanceStatus } from '@domain/maintenance/entities/Maintenance';
import { CreateMaintenanceDTO } from '@application/maintenance/dtos/CreateMaintenanceDTO';
import { motorcycleService } from '../../services/api';
import { MotorcycleResponseDTO } from '@application/motorcycle/dtos/MotorcycleResponseDTO';
import { inventoryPartService } from '../../services/api';
import { InventoryPartResponseDTO } from '@application/inventory/dtos/InventoryPartResponseDTO';

interface MaintenanceFormProps {
  onSubmit: (maintenanceData: CreateMaintenanceDTO) => void;
  initialData?: Partial<CreateMaintenanceDTO>;
  isEditMode?: boolean;
}

export function MaintenanceForm({ 
  onSubmit, 
  initialData = {}, 
  isEditMode = false 
}: MaintenanceFormProps) {
  const [motorcycles, setMotorcycles] = useState<MotorcycleResponseDTO[]>([]);
  const [inventoryParts, setInventoryParts] = useState<InventoryPartResponseDTO[]>([]);
  const [formData, setFormData] = useState<CreateMaintenanceDTO>({
    motorcycleId: initialData.motorcycleId || '',
    type: initialData.type || MaintenanceType.PREVENTIVE,
    scheduledDate: initialData.scheduledDate || new Date(),
    status: initialData.status || MaintenanceStatus.SCHEDULED,
    mileageAtMaintenance: initialData.mileageAtMaintenance || 0,
    technicianNotes: initialData.technicianNotes || '',
    replacedParts: initialData.replacedParts || [],
    totalCost: initialData.totalCost || 0,
    nextMaintenanceRecommendation: initialData.nextMaintenanceRecommendation || new Date(),
    actualDate: initialData.actualDate || new Date()
  });

  const [newReplacedPart, setNewReplacedPart] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    async function fetchData() {
      try {
        const [motorcycleData, inventoryData] = await Promise.all([
          motorcycleService.getAllMotorcycles(),
          inventoryPartService.getAllParts() // Modification ici
        ]);
        setMotorcycles(motorcycleData);
        setInventoryParts(inventoryData);
      } catch (error) {
      }
    }
    fetchData();
  }, []);

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    // Si ce n'est pas en mode édition, tous les champs sont requis
    if (!isEditMode) {
      if (!formData.motorcycleId) newErrors.motorcycleId = 'Sélectionnez une moto';
      if (!formData.type) newErrors.type = 'Sélectionnez un type de maintenance';
      if (!formData.scheduledDate) newErrors.scheduledDate = 'Date programmée requise';
      if (!formData.status) newErrors.status = 'Sélectionnez un statut';
      if (formData.mileageAtMaintenance === undefined || formData.mileageAtMaintenance === null) 
        newErrors.mileageAtMaintenance = 'Kilométrage requis';
      if (!formData.replacedParts || formData.replacedParts.length === 0) 
        newErrors.replacedParts = 'Au moins une pièce remplacée est requise';
      if (formData.totalCost === undefined || formData.totalCost === null) 
        newErrors.totalCost = 'Coût total requis';
      if (!formData.nextMaintenanceRecommendation) 
        newErrors.nextMaintenanceRecommendation = 'Date de prochaine maintenance requise';
      if (!formData.actualDate) 
        newErrors.actualDate = 'Date réelle de maintenance requise';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const processedValue = 
      name === 'mileageAtMaintenance' || name === 'totalCost'
        ? Number(value) 
        : name === 'scheduledDate' || name === 'nextMaintenanceRecommendation' || name === 'actualDate'
          ? new Date(value)
          : value;

    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));

    // Effacer l'erreur spécifique lors de la modification
    if (errors[name]) {
      const newErrors = { ...errors };
      delete newErrors[name];
      setErrors(newErrors);
    }
  };

  const handleAddReplacedPart = () => {
    if (newReplacedPart) {
      const updatedParts = [...(formData.replacedParts || []), newReplacedPart];
      setFormData(prev => ({
        ...prev,
        replacedParts: updatedParts
      }));
      
      // Réinitialiser la sélection
      setNewReplacedPart(null);

      // Effacer l'erreur de pièces remplacées si des pièces sont ajoutées
      if (errors.replacedParts) {
        const newErrors = { ...errors };
        delete newErrors.replacedParts;
        setErrors(newErrors);
      }
    }
  };

  const handleRemovePart = (partToRemove: string) => {
    const updatedParts = (formData.replacedParts || []).filter(part => part !== partToRemove);
    setFormData(prev => ({
      ...prev,
      replacedParts: updatedParts
    }));

    // Ajouter une erreur si plus aucune pièce n'est présente
    if (updatedParts.length === 0 && !isEditMode) {
      setErrors(prev => ({
        ...prev,
        replacedParts: 'Au moins une pièce remplacée est requise'
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const formatDateForInput = (date?: Date | null) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  };

  // Filtrer les pièces disponibles (avec du stock)
  const availableParts = inventoryParts.filter(part => part.currentStock > 0);

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gray-50">
      <form 
        onSubmit={handleSubmit} 
        className="w-full max-w-4xl px-8 pt-6 pb-8 mb-4 bg-white shadow-2xl rounded-2xl"
        aria-labelledby="maintenance-form-title"
      >
        <h2 
          id="maintenance-form-title" 
          className="pb-4 mb-6 text-3xl font-bold text-center text-gray-800 border-b"
        >
          {isEditMode ? 'Modification de maintenance' : 'Création d\'une maintenance'}
        </h2>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Motorcycle Selection */}
          <div className="form-group">
            <label 
              htmlFor="motorcycleId" 
              className="block mb-2 text-sm font-medium text-gray-700"
            >
              Moto
            </label>
            <select
              id="motorcycleId"
              name="motorcycleId"
              value={formData.motorcycleId}
              onChange={handleChange}
              required={!isEditMode}
              disabled={isEditMode}
              className={`w-full px-3 py-2 border rounded-md shadow-sm 
                         focus:outline-none focus:ring-2 focus:ring-blue-500 
                         focus:border-blue-500 transition duration-200 
                         text-gray-900 bg-white ${
                           errors.motorcycleId 
                             ? 'border-red-500 focus:ring-red-500' 
                             : 'border-gray-300'
                         } ${isEditMode ? 'cursor-not-allowed opacity-50' : ''}`}
              aria-required={!isEditMode}
            >
              <option value="">Sélectionnez une moto</option>
              {motorcycles.map(moto => (
                <option key={moto.id} value={moto.id}>
                  {moto.model} - {moto.registrationNumber}
                </option>
              ))}
            </select>
            {errors.motorcycleId && (
              <p className="mt-1 text-xs text-red-500">{errors.motorcycleId}</p>
            )}
          </div>

          {/* Type de maintenance */}
          <div className="form-group">
            <label 
              htmlFor="type" 
              className="block mb-2 text-sm font-medium text-gray-700"
            >
              Type de maintenance
            </label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              required={!isEditMode}
              className={`w-full px-3 py-2 border rounded-md shadow-sm 
                         focus:outline-none focus:ring-2 focus:ring-blue-500 
                         focus:border-blue-500 transition duration-200 
                         text-gray-900 bg-white ${
                           errors.type 
                             ? 'border-red-500 focus:ring-red-500' 
                             : 'border-gray-300'
                         }`}
            >
              <option value={MaintenanceType.PREVENTIVE}>Maintenance Préventive</option>
              <option value={MaintenanceType.CURATIVE}>Maintenance Curative</option>
            </select>
            {errors.type && (
              <p className="mt-1 text-xs text-red-500">{errors.type}</p>
            )}
          </div>

          {/* Date programmée */}
          <div className="form-group">
            <label 
              htmlFor="scheduledDate" 
              className="block mb-2 text-sm font-medium text-gray-700"
            >
              Date programmée
            </label>
            <input
              type="date"
              id="scheduledDate"
              name="scheduledDate"
              value={formData.scheduledDate ? new Date(formData.scheduledDate).toISOString().split('T')[0] : ''}
              onChange={handleChange}
              required={!isEditMode}
              className={`w-full px-3 py-2 border rounded-md shadow-sm 
                         focus:outline-none focus:ring-2 focus:ring-blue-500 
                         focus:border-blue-500 transition duration-200 
                         text-gray-900 bg-white ${
                           errors.scheduledDate 
                             ? 'border-red-500 focus:ring-red-500' 
                             : 'border-gray-300'
                         }`}
            />
            {errors.scheduledDate && (
              <p className="mt-1 text-xs text-red-500">{errors.scheduledDate}</p>
            )}
          </div>

          {/* Statut */}
          <div className="form-group">
            <label 
              htmlFor="status" 
              className="block mb-2 text-sm font-medium text-gray-700"
            >
              Statut
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              required={!isEditMode}
              className={`w-full px-3 py-2 border rounded-md shadow-sm 
                         focus:outline-none focus:ring-2 focus:ring-blue-500 
                         focus:border-blue-500 transition duration-200 
                         text-gray-900 bg-white ${
                           errors.status 
                             ? 'border-red-500 focus:ring-red-500' 
                             : 'border-gray-300'
                         }`}
            >
              <option value={MaintenanceStatus.SCHEDULED}>Programmée</option>
              <option value={MaintenanceStatus.IN_PROGRESS}>En cours</option>
              <option value={MaintenanceStatus.COMPLETED}>Terminée</option>
              <option value={MaintenanceStatus.CANCELLED}>Annulée</option>
            </select>
            {errors.status && (
              <p className="mt-1 text-xs text-red-500">{errors.status}</p>
            )}
          </div>

          {/* Kilométrage */}
          <div className="form-group">
            <label 
              htmlFor="mileageAtMaintenance" 
              className="block mb-2 text-sm font-medium text-gray-700"
            >
              Kilométrage
            </label>
            <input
              type="number"
              id="mileageAtMaintenance"
              name="mileageAtMaintenance"
              value={formData.mileageAtMaintenance || ''}
              onChange={handleChange}
              required={!isEditMode}
              className={`w-full px-3 py-2 border rounded-md shadow-sm 
                         focus:outline-none focus:ring-2 focus:ring-blue-500 
                         focus:border-blue-500 transition duration-200 
                         text-gray-900 bg-white ${
                           errors.mileageAtMaintenance 
                             ? 'border-red-500 focus:ring-red-500' 
                             : 'border-gray-300'
                         }`}
              min="0"
              placeholder="Kilométrage au moment de la maintenance"
            />
            {errors.mileageAtMaintenance && (
              <p className="mt-1 text-xs text-red-500">{errors.mileageAtMaintenance}</p>
            )}
          </div>

          {/* Date réelle */}
          <div className="form-group">
            <label 
              htmlFor="actualDate" 
              className="block mb-2 text-sm font-medium text-gray-700"
            >
              Date réelle
            </label>
            <input
              type="date"
              id="actualDate"
              name="actualDate"
              value={formData.actualDate ? new Date(formData.actualDate).toISOString().split('T')[0] : ''}
              onChange={handleChange}
              required={!isEditMode}
              className={`w-full px-3 py-2 border rounded-md shadow-sm 
                         focus:outline-none focus:ring-2 focus:ring-blue-500 
                         focus:border-blue-500 transition duration-200 
                         text-gray-900 bg-white ${
                           errors.actualDate 
                             ? 'border-red-500 focus:ring-red-500' 
                             : 'border-gray-300'
                         }`}
            />
            {errors.actualDate && (
              <p className="mt-1 text-xs text-red-500">{errors.actualDate}</p>
            )}
          </div>

          {/* Prochaine maintenance recommandée */}
          <div className="form-group">
            <label 
              htmlFor="nextMaintenanceRecommendation" 
              className="block mb-2 text-sm font-medium text-gray-700"
            >
              Prochaine maintenance
            </label>
            <input
              type="date"
              id="nextMaintenanceRecommendation"
              name="nextMaintenanceRecommendation"
              value={formData.nextMaintenanceRecommendation ? new Date(formData.nextMaintenanceRecommendation).toISOString().split('T')[0] : ''}
              onChange={handleChange}
              required={!isEditMode}
              className={`w-full px-3 py-2 border rounded-md shadow-sm 
                         focus:outline-none focus:ring-2 focus:ring-blue-500 
                         focus:border-blue-500 transition duration-200 
                         text-gray-900 bg-white ${
                           errors.nextMaintenanceRecommendation 
                             ? 'border-red-500 focus:ring-red-500' 
                             : 'border-gray-300'
                         }`}
            />
            {errors.nextMaintenanceRecommendation && (
              <p className="mt-1 text-xs text-red-500">{errors.nextMaintenanceRecommendation}</p>
            )}
          </div>

          {/* Coût total */}
          <div className="form-group">
            <label 
              htmlFor="totalCost" 
              className="block mb-2 text-sm font-medium text-gray-700"
            >
              Coût total
            </label>
            <input
              type="number"
              id="totalCost"
              name="totalCost"
              value={formData.totalCost || ''}
              onChange={handleChange}
              required={!isEditMode}
              className={`w-full px-3 py-2 border rounded-md shadow-sm 
                         focus:outline-none focus:ring-2 focus:ring-blue-500 
                         focus:border-blue-500 transition duration-200 
                         text-gray-900 bg-white ${
                           errors.totalCost 
                             ? 'border-red-500 focus:ring-red-500' 
                             : 'border-gray-300'
                         }`}
              min="0"
              step="0.01"
              placeholder="Entrez le coût total"
            />
            {errors.totalCost && (
              <p className="mt-1 text-xs text-red-500">{errors.totalCost}</p>
            )}
          </div>
        </div>

        {/* Notes du technicien */}
        <div className="mt-4 form-group">
          <label 
            htmlFor="technicianNotes" 
            className="block mb-2 text-sm font-medium text-gray-700"
          >
            Notes du technicien
          </label>
          <textarea
            id="technicianNotes"
            name="technicianNotes"
            value={formData.technicianNotes || ''}
            onChange={handleChange}
            className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={3}
            placeholder="Saisissez des notes supplémentaires"
          />
        </div>

        {/* Pièces remplacées */}
        <div className="mt-4 form-group">
          <label 
            htmlFor="replacedParts" 
            className="block mb-2 text-sm font-medium text-gray-700"
          >
            Pièces remplacées
          </label>
          
          <div className="flex mb-2 space-x-2">
            <select
              id="newReplacedPart"
              value={newReplacedPart || ''}
              onChange={(e) => setNewReplacedPart(e.target.value)}
              className="flex-grow px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Sélectionner une pièce</option>
              {availableParts
                .filter(part => !formData.replacedParts?.includes(part.name))
                .map(part => (
                  <option key={part.id} value={part.name}>
                    {part.name} (Stock: {part.currentStock})
                  </option>
                ))
              }
            </select>
            <button
              type="button"
              onClick={handleAddReplacedPart}
              disabled={!newReplacedPart}
              className="px-3 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          {/* Liste des pièces remplacées */}
          <div className="flex flex-wrap gap-2">
            {formData.replacedParts?.map(part => {
              const inventoryPart = inventoryParts.find(p => p.name === part);
              return (
                <div 
                  key={part} 
                  className="flex items-center px-2 py-1 text-sm bg-gray-100 rounded-full"
                >
                  {part} {inventoryPart && `(Stock: ${inventoryPart.currentStock})`}
                  <button
                    type="button"
                    onClick={() => handleRemovePart(part)}
                    className="ml-2 text-red-500 hover:text-red-700"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>

          {errors.replacedParts && (
            <p className="mt-1 text-xs text-red-500">{errors.replacedParts}</p>
          )}
        </div>

        {/* Bouton de soumission */}
        <div className="flex justify-center mt-6">
          <button
            type="submit"
            className="px-6 py-3 text-white transition duration-200 bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            {isEditMode ? 'Mettre à jour' : 'Créer'}
          </button>
        </div>
      </form>
    </div>
  );
}
