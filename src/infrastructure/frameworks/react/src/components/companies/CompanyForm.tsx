import React, { useState, useEffect, FormEvent } from "react";
import { CompanyFormDTO } from "../../../../../../application/dtos/CompanyDTO";
import Company from "../../../../../../domain/company/entities/Company";
import { ValidationService } from "@infrastructure/services/ValidationService";
import { toast } from "react-toastify";

interface CompanyFormProps {
  open: boolean;
  company?: Company;
  onClose: () => void;
  onSubmit: (data: CompanyFormDTO) => Promise<void>;
}

interface CompanyFormState {
  formData: CompanyFormDTO;
  errors: Record<keyof CompanyFormDTO, string>;
  isSubmitting: boolean;
}

const CompanyForm: React.FC<CompanyFormProps> = ({
  open,
  company,
  onClose,
  onSubmit,
}) => {
  const validationService = new ValidationService();

  const createInitialState = (existingCompany?: Company): CompanyFormState => ({
    formData: existingCompany
      ? {
          id: existingCompany.id,
          userId: existingCompany.userId,
          name: existingCompany.name,
          address: existingCompany.address,
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

  const [state, setState] = useState<CompanyFormState>(
    createInitialState(company)
  );

  useEffect(() => {
    if (open) {
      setState(createInitialState(company));
    }
  }, [open, company]);

  const validateForm = (): boolean => {
    const newErrors: Record<keyof CompanyFormDTO, string> = {
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

    setState((prev) => ({
      ...prev,
      errors: newErrors,
    }));

    return !Object.values(newErrors).some((error) => error !== "");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setState((prev) => ({ ...prev, isSubmitting: true }));

    try {
      await onSubmit(state.formData);
      onClose();
    } catch (error) {
      toast.error("Erreur lors de l'envoi du formulaire.");
    } finally {
      setState((prev) => ({ ...prev, isSubmitting: false }));
    }
  };

  const handleChange =
    (field: keyof CompanyFormDTO) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const value = e.target.value;
      setState((prev) => ({
        ...prev,
        formData: {
          ...prev.formData,
          [field]: value,
        },
      }));
    };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center w-full h-full overflow-y-auto bg-gray-600 bg-opacity-50">
      <div className="relative w-full max-w-xl p-8 m-4 bg-white rounded-lg shadow-xl">
        <h2 className="mb-4 text-2xl font-bold">
          {company ? "Modifier une entreprise" : "Créer une entreprise"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nom
            </label>
            <input
              type="text"
              value={state.formData.name}
              onChange={handleChange("name")}
              className="block w-full mt-1 text-gray-900 bg-white border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
            {state.errors.name && (
              <p className="mt-1 text-sm text-red-600">{state.errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Adresse
            </label>
            <input
              type="text"
              value={state.formData.address}
              onChange={handleChange("address")}
              className="block w-full mt-1 text-gray-900 bg-white border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
            {state.errors.address && (
              <p className="mt-1 text-sm text-red-600">
                {state.errors.address}
              </p>
            )}
          </div>

          <div className="flex justify-end mt-6 space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={state.isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {state.isSubmitting ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompanyForm;
