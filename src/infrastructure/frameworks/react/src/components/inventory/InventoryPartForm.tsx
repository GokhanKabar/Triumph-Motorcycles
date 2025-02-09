import React, { useState, useEffect } from 'react';
import { PartCategory } from '@domain/inventory/entities/InventoryPart';
import { CreateInventoryPartDTO } from '@application/inventory/dtos/CreateInventoryPartDTO';
import { motorcycleService } from '../../services/api';
import { MotorcycleResponseDTO } from '@application/motorcycle/dtos/MotorcycleResponseDTO';
import { InventoryPartResponseDTO } from '@application/inventory/dtos/InventoryPartResponseDTO';
import { toast } from "react-toastify";

interface InventoryPartFormProps {
  onSubmit: (partData: Partial<CreateInventoryPartDTO>) => void;
  initialData?: Partial<InventoryPartResponseDTO>;
  isEditMode?: boolean;
  onCancel?: () => void;
}

export default function InventoryPartForm({ 
  onSubmit, 
  initialData = {}, 
  isEditMode = false,
  onCancel
}: InventoryPartFormProps) {
  const [motorcycles, setMotorcycles] = useState<MotorcycleResponseDTO[]>([]);
  const [formData, setFormData] = useState<Partial<CreateInventoryPartDTO>>({
    name: initialData.name || '',
    category: initialData.category || PartCategory.OTHER,
    referenceNumber: initialData.referenceNumber || '',
    currentStock: initialData.currentStock ?? 0,
    minStockThreshold: initialData.minStockThreshold ?? 10,
    unitPrice: initialData.unitPrice ?? 0,
    motorcycleModels: initialData.motorcycleModels || []
  });

  const [newMotorcycleModel, setNewMotorcycleModel] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    async function fetchMotorcycles() {
      try {
        const data = await motorcycleService.getAllMotorcycles();
        setMotorcycles(data);
      } catch (error) {
        toast.error('Erreur lors de la récupération des motos');
      }
    }
    fetchMotorcycles();
  }, []);

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    // Validation uniquement en mode création
    if (!isEditMode) {
      if (!formData.name) newErrors.name = 'Nom de la pièce requis';
      if (!formData.category) newErrors.category = 'Catégorie requise';
      if (!formData.referenceNumber) newErrors.referenceNumber = 'Numéro de référence requis';
      if (formData.currentStock === undefined || formData.currentStock === null) 
        newErrors.currentStock = 'Stock actuel requis';
      if (formData.minStockThreshold === undefined || formData.minStockThreshold === null) 
        newErrors.minStockThreshold = 'Seuil de stock minimum requis';
      if (formData.unitPrice === undefined || formData.unitPrice === null) 
        newErrors.unitPrice = 'Prix unitaire requis';
      if (!formData.motorcycleModels || formData.motorcycleModels.length === 0) 
        newErrors.motorcycleModels = 'Au moins un modèle de moto est requis';
    }

    // Validation en mode édition
    if (isEditMode) {
      // Validation des champs modifiés
      if (formData.name && formData.name.trim() === '') 
        newErrors.name = 'Le nom ne peut pas être vide';
      if (formData.referenceNumber && formData.referenceNumber.trim() === '') 
        newErrors.referenceNumber = 'Le numéro de référence ne peut pas être vide';
      if (formData.unitPrice !== undefined && formData.unitPrice < 0) 
        newErrors.unitPrice = 'Le prix unitaire doit être positif';
      if (formData.currentStock !== undefined && formData.currentStock < 0) 
        newErrors.currentStock = 'Le stock actuel doit être positif';
      if (formData.minStockThreshold !== undefined && formData.minStockThreshold < 0) 
        newErrors.minStockThreshold = 'Le seuil de stock minimum doit être positif';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const processedValue = 
      ['currentStock', 'minStockThreshold', 'unitPrice'].includes(name)
        ? Number(value)
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

  const handleAddMotorcycleModel = () => {
    if (newMotorcycleModel.trim() && !formData.motorcycleModels?.includes(newMotorcycleModel.trim())) {
      const updatedModels = [...(formData.motorcycleModels || []), newMotorcycleModel.trim()];
      setFormData(prev => ({
        ...prev,
        motorcycleModels: updatedModels
      }));
      
      // Effacer l'erreur de modèles de moto si des modèles sont ajoutés
      if (errors.motorcycleModels) {
        const newErrors = { ...errors };
        delete newErrors.motorcycleModels;
        setErrors(newErrors);
      }

      setNewMotorcycleModel('');
    }
  };

  const handleRemoveMotorcycleModel = (modelToRemove: string) => {
    const updatedModels = (formData.motorcycleModels || []).filter(model => model !== modelToRemove);
    setFormData(prev => ({
      ...prev,
      motorcycleModels: updatedModels
    }));

    // Ajouter une erreur si plus aucun modèle n'est présent
    if (updatedModels.length === 0 && !isEditMode) {
      setErrors(prev => ({
        ...prev,
        motorcycleModels: 'Au moins un modèle de moto est requis'
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation de base
    const newErrors: {[key: string]: string} = {};
    if (!formData.name) newErrors.name = 'Le nom est requis';
    if (!formData.referenceNumber) newErrors.referenceNumber = 'Le numéro de référence est requis';
    if (!formData.category) newErrors.category = 'La catégorie est requise';
    if (formData.unitPrice === undefined || formData.unitPrice < 0) newErrors.unitPrice = 'Le prix doit être positif';
    if (formData.currentStock === undefined || formData.currentStock < 0) newErrors.currentStock = 'Le stock doit être positif';
    if (formData.minStockThreshold === undefined || formData.minStockThreshold < 0) newErrors.minStockThreshold = 'Le seuil de stock doit être positif';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Réinitialiser les erreurs
    setErrors({});

    // Préparer les données pour la mise à jour
    const updateData: Partial<CreateInventoryPartDTO> = {
      name: formData.name,
      referenceNumber: formData.referenceNumber,
      category: formData.category,
      unitPrice: formData.unitPrice,
      currentStock: formData.currentStock,
      minStockThreshold: formData.minStockThreshold,
      motorcycleModels: formData.motorcycleModels
    };

    // Supprimer les champs undefined pour éviter de les écraser
    Object.keys(updateData).forEach(key => {
      if ((updateData as any)[key] === undefined) {
        delete (updateData as any)[key];
      }
    });

    // Soumettre le formulaire
    onSubmit(updateData);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-center justify-between pb-4 border-b">
          <h2 className="text-2xl font-semibold text-gray-800">
            {isEditMode ? 'Modifier une pièce' : 'Nouvelle pièce'}
          </h2>
          {onCancel && (
            <button 
              type="button" 
              onClick={onCancel}
              className="text-gray-600 hover:text-gray-900"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-700">
              Nom de la pièce
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name || ''}
              onChange={handleChange}
              required={!isEditMode}
              className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ex: Filtre à huile"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-500">{errors.name}</p>
            )}
          </div>

          <div>
            <label htmlFor="referenceNumber" className="block mb-2 text-sm font-medium text-gray-700">
              Numéro de référence
            </label>
            <input
              type="text"
              id="referenceNumber"
              name="referenceNumber"
              value={formData.referenceNumber || ''}
              onChange={handleChange}
              required={!isEditMode}
              className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ex: HF204"
            />
            {errors.referenceNumber && (
              <p className="mt-1 text-xs text-red-500">{errors.referenceNumber}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="category" className="block mb-2 text-sm font-medium text-gray-700">
              Catégorie
            </label>
            <select
              id="category"
              name="category"
              value={formData.category || ''}
              onChange={handleChange}
              required={!isEditMode}
              className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Sélectionner une catégorie</option>
              {Object.values(PartCategory).map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="mt-1 text-xs text-red-500">{errors.category}</p>
            )}
          </div>

          <div>
            <label htmlFor="unitPrice" className="block mb-2 text-sm font-medium text-gray-700">
              Prix unitaire (€)
            </label>
            <input
              type="number"
              id="unitPrice"
              name="unitPrice"
              value={formData.unitPrice || ''}
              onChange={handleChange}
              min="0"
              step="0.01"
              required={!isEditMode}
              className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ex: 24.99"
            />
            {errors.unitPrice && (
              <p className="mt-1 text-xs text-red-500">{errors.unitPrice}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="currentStock" className="block mb-2 text-sm font-medium text-gray-700">
              Stock actuel
            </label>
            <input
              type="number"
              id="currentStock"
              name="currentStock"
              value={formData.currentStock || ''}
              onChange={handleChange}
              min="0"
              required={!isEditMode}
              className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ex: 50"
            />
            {errors.currentStock && (
              <p className="mt-1 text-xs text-red-500">{errors.currentStock}</p>
            )}
          </div>

          <div>
            <label htmlFor="minStockThreshold" className="block mb-2 text-sm font-medium text-gray-700">
              Seuil de stock minimum
            </label>
            <input
              type="number"
              id="minStockThreshold"
              name="minStockThreshold"
              value={formData.minStockThreshold || ''}
              onChange={handleChange}
              min="0"
              required={!isEditMode}
              className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ex: 10"
            />
            {errors.minStockThreshold && (
              <p className="mt-1 text-xs text-red-500">{errors.minStockThreshold}</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="newMotorcycleModel" className="block mb-2 text-sm font-medium text-gray-700">
            Modèles de moto compatibles
          </label>
          <div className="flex mb-2 space-x-2">
            <select
              id="newMotorcycleModel"
              value={newMotorcycleModel}
              onChange={(e) => setNewMotorcycleModel(e.target.value)}
              className="flex-grow px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Sélectionner un modèle</option>
              {motorcycles
                .filter(moto => !formData.motorcycleModels?.includes(moto.model))
                .map(moto => (
                  <option key={moto.id} value={moto.model}>
                    {moto.model}
                  </option>
                ))
              }
            </select>
            <button
              type="button"
              onClick={handleAddMotorcycleModel}
              disabled={!newMotorcycleModel}
              className="px-3 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          {/* Liste des modèles de moto */}
          <div className="flex flex-wrap gap-2">
            {formData.motorcycleModels?.map(model => (
              <div 
                key={model} 
                className="flex items-center px-2 py-1 text-sm bg-gray-100 rounded-full"
              >
                {model}
                <button
                  type="button"
                  onClick={() => handleRemoveMotorcycleModel(model)}
                  className="ml-2 text-red-500 hover:text-red-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
          {errors.motorcycleModels && (
            <p className="mt-1 text-xs text-red-500">{errors.motorcycleModels}</p>
          )}
        </div>

        <div className="mt-6">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-800 bg-gray-300 rounded hover:bg-gray-400"
            >
              Annuler
            </button>
          )}
          <button
            type="submit"
            className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {isEditMode ? 'Mettre à jour' : 'Créer'}
          </button>
        </div>
      </form>
    </div>
  );
}
