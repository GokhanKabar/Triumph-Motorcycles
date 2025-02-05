import React, { useState, useEffect, FormEvent } from "react";
import { ConcessionFormDTO } from "../../../../../../application/dtos/ConcessionDTO";
import Concession from "../../../../../../domain/concession/entities/Concession";
import { ValidationService } from "@infrastructure/services/ValidationService";

interface ConcessionFormProps {
  open: boolean;
  concession?: Concession;
  onClose: () => void;
  onSubmit: (data: ConcessionFormDTO) => Promise<void>;
}

interface ConcessionFormState {
  formData: ConcessionFormDTO;
  errors: Record<keyof ConcessionFormDTO, string>;
  isSubmitting: boolean;
}

const ConcessionForm: React.FC<ConcessionFormProps> = ({
  open,
  concession,
  onClose,
  onSubmit,
}) => {
  const validationService = new ValidationService();

  const createInitialState = (existingConcession?: Concession): ConcessionFormState => ({
    formData: existingConcession
      ? {
          id: existingConcession.id,
          userId: existingConcession.userId,
          name: existingConcession.name,
          address: existingConcession.address,
        }
      : {
          id: undefined,
          userId: "", // This should be set based on the current user
          name: "",
          address: "",
        },
    errors: {
      id: "",
      userId: "",
      name: "",
      address: "",
    },
    isSubmitting: false,
  });

  const [state, setState] = useState<ConcessionFormState>(
    createInitialState(concession)
  );

  useEffect(() => {
    if (open) {
      setState(createInitialState(concession));
    }
  }, [open, concession]);

  const validateForm = (): boolean => {
    const newErrors: Record<keyof ConcessionFormDTO, string> = {
      id: "",
      userId: "",
      name: "",
      address: "",
    };

    if (!state.formData.name) {
      newErrors.name = "Le nom est requis";
    }

    if (!state.formData.address) {
      newErrors.address = "L'adresse est requise";
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
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setState((prev) => ({
      ...prev,
      formData: { ...prev.formData, [name]: value },
      errors: { ...prev.errors, [name]: "" },
    }));
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">
          {concession ? "Modifier la concession" : "Nouvelle concession"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Nom
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={state.formData.name}
              onChange={handleInputChange}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                state.errors.name ? "border-red-500" : ""
              }`}
            />
            {state.errors.name && (
              <p className="mt-1 text-sm text-red-500">{state.errors.name}</p>
            )}
          </div>

          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">
              Adresse
            </label>
            <input
              type="text"
              id="address"
              name="address"
              value={state.formData.address}
              onChange={handleInputChange}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                state.errors.address ? "border-red-500" : ""
              }`}
            />
            {state.errors.address && (
              <p className="mt-1 text-sm text-red-500">{state.errors.address}</p>
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
                : concession
                ? "Modifier"
                : "Créer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConcessionForm;
