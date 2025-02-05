import React, { useState, useEffect, FormEvent } from "react";
import { MotorcycleFormDTO } from "../../../../../../application/dtos/MotorcycleDTO";
import Motorcycle from "../../../../../../domain/motorcycle/entities/Motorcycle";
import { ValidationService } from "@infrastructure/services/ValidationService";
import { concessionService } from "../../services/api";

interface MotorcycleFormProps {
  open: boolean;
  motorcycle?: Motorcycle;
  onClose: () => void;
  onSubmit: (data: MotorcycleFormDTO) => Promise<void>;
}

interface MotorcycleFormState {
  formData: MotorcycleFormDTO;
  errors: Record<keyof MotorcycleFormDTO, string>;
  isSubmitting: boolean;
  concessions: { id: string; name: string }[];
}

const MotorcycleForm: React.FC<MotorcycleFormProps> = ({
  open,
  motorcycle,
  onClose,
  onSubmit,
}) => {
  const validationService = new ValidationService();

  const createInitialState = (existingMotorcycle?: Motorcycle): MotorcycleFormState => ({
    formData: existingMotorcycle
      ? {
          id: existingMotorcycle.id,
          brand: existingMotorcycle.brand,
          model: existingMotorcycle.model,
          vin: existingMotorcycle.vin,
          concessionId: existingMotorcycle.concessionId,
          currentMileage: existingMotorcycle.currentMileage,
        }
      : {
          brand: "",
          model: "",
          vin: "",
          concessionId: "",
          currentMileage: 0,
        },
    errors: {
      id: "",
      brand: "",
      model: "",
      vin: "",
      concessionId: "",
      currentMileage: "",
    },
    isSubmitting: false,
    concessions: [],
  });

  const [state, setState] = useState<MotorcycleFormState>(
    createInitialState(motorcycle)
  );

  useEffect(() => {
    if (open) {
      setState(createInitialState(motorcycle));
      fetchConcessions();
    }
  }, [open, motorcycle]);

  const fetchConcessions = async () => {
    try {
      const concessions = await concessionService.getConcessions();
      setState(prev => ({
        ...prev,
        concessions: concessions.map(c => ({ id: c.id, name: c.name }))
      }));
    } catch (error) {
      console.error("Failed to fetch concessions:", error);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<keyof MotorcycleFormDTO, string> = {
      id: "",
      brand: "",
      model: "",
      vin: "",
      concessionId: "",
      currentMileage: "",
    };

    if (!state.formData.brand) {
      newErrors.brand = "La marque est requise";
    }

    if (!state.formData.model) {
      newErrors.model = "Le modèle est requis";
    }

    if (!state.formData.vin) {
      newErrors.vin = "Le numéro VIN est requis";
    }

    if (!state.formData.concessionId) {
      newErrors.concessionId = "La concession est requise";
    }

    if (state.formData.currentMileage < 0) {
      newErrors.currentMileage = "Le kilométrage ne peut pas être négatif";
    }

    setState((prev) => ({ ...prev, errors: newErrors }));
    return !Object.values(newErrors).some((error) => error !== "");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setState((prev) => ({ ...prev, isSubmitting: true }));
    try {
      await onSubmit(state.formData);
      onClose();
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setState((prev) => ({ ...prev, isSubmitting: false }));
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setState((prev) => ({
      ...prev,
      formData: {
        ...prev.formData,
        [name]: name === "currentMileage" ? parseInt(value) || 0 : value,
      },
      errors: { ...prev.errors, [name]: "" },
    }));
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
        <h2 className="text-xl font-bold mb-4">
          {motorcycle ? "Modifier la moto" : "Nouvelle moto"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="brand" className="block text-sm font-medium text-gray-700">
              Marque
            </label>
            <input
              type="text"
              id="brand"
              name="brand"
              value={state.formData.brand}
              onChange={handleInputChange}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white text-gray-900 ${
                state.errors.brand ? "border-red-500" : ""
              }`}
            />
            {state.errors.brand && (
              <p className="mt-1 text-sm text-red-500">{state.errors.brand}</p>
            )}
          </div>

          <div>
            <label htmlFor="model" className="block text-sm font-medium text-gray-700">
              Modèle
            </label>
            <input
              type="text"
              id="model"
              name="model"
              value={state.formData.model}
              onChange={handleInputChange}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white text-gray-900 ${
                state.errors.model ? "border-red-500" : ""
              }`}
            />
            {state.errors.model && (
              <p className="mt-1 text-sm text-red-500">{state.errors.model}</p>
            )}
          </div>

          <div>
            <label htmlFor="vin" className="block text-sm font-medium text-gray-700">
              Numéro VIN
            </label>
            <input
              type="text"
              id="vin"
              name="vin"
              value={state.formData.vin}
              onChange={handleInputChange}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white text-gray-900 ${
                state.errors.vin ? "border-red-500" : ""
              }`}
            />
            {state.errors.vin && (
              <p className="mt-1 text-sm text-red-500">{state.errors.vin}</p>
            )}
          </div>

          <div>
            <label htmlFor="currentMileage" className="block text-sm font-medium text-gray-700">
              Kilométrage actuel
            </label>
            <input
              type="number"
              id="currentMileage"
              name="currentMileage"
              value={state.formData.currentMileage}
              onChange={handleInputChange}
              min="0"
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white text-gray-900 ${
                state.errors.currentMileage ? "border-red-500" : ""
              }`}
            />
            {state.errors.currentMileage && (
              <p className="mt-1 text-sm text-red-500">{state.errors.currentMileage}</p>
            )}
          </div>

          <div>
            <label htmlFor="concessionId" className="block text-sm font-medium text-gray-700">
              Concession
            </label>
            <select
              id="concessionId"
              name="concessionId"
              value={state.formData.concessionId}
              onChange={handleInputChange}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white text-gray-900 bg-white text-gray-900 ${
                state.errors.concessionId ? "border-red-500" : ""
              }`}
            >
              <option value="">Sélectionnez une concession</option>
              {state.concessions.map((concession) => (
                <option key={concession.id} value={concession.id}>
                  {concession.name}
                </option>
              ))}
            </select>
            {state.errors.concessionId && (
              <p className="mt-1 text-sm text-red-500">{state.errors.concessionId}</p>
            )}
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={state.isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {state.isSubmitting
                ? "En cours..."
                : motorcycle
                ? "Modifier"
                : "Créer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MotorcycleForm;
