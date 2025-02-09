import React, { useState } from "react";
import MotorcycleList from "../components/motorcycles/MotorcycleList";
import {
  Motorcycle,
  CreateMotorcycleForm,
  UpdateMotorcycleForm,
} from "../types/Motorcycle";
import { motorcycleService } from "../services/api";
import MotorcycleForm from "../components/motorcycles/MotorcycleForm";
import { toast } from "react-toastify";

export default function Motorcycles() {
  const [openForm, setOpenForm] = useState(false);
  const [selectedMotorcycle, setSelectedMotorcycle] = useState<
    Motorcycle | undefined
  >();
  const [refreshKey, setRefreshKey] = useState(0);

  const handleCreateMotorcycle = () => {
    setSelectedMotorcycle(undefined);
    setOpenForm(true);
  };

  const handleEditMotorcycle = (motorcycle: Motorcycle) => {
    setSelectedMotorcycle(motorcycle);
    setOpenForm(true);
  };

  const handleDeleteMotorcycle = async (motorcycleId: string) => {
    try {
      const result = await motorcycleService.deleteMotorcycle(motorcycleId);
      setRefreshKey((prev) => prev + 1);
      toast.success(result.message);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Erreur lors de la suppression de la moto";
      toast.error(errorMessage);
    }
  };

  const handleSubmit = async (data: CreateMotorcycleForm) => {
    try {
      console.log("data", data);
      if (selectedMotorcycle) {
        const updateData: UpdateMotorcycleForm = {
          brand: data.brand,
          model: data.model,
          vin: data.vin,
          concessionId: data.concessionId,
          mileage: data.mileage,
        };
        await motorcycleService.updateMotorcycle(
          selectedMotorcycle.id,
          updateData
        );
        toast.success("Moto mise à jour avec succès");
      } else {
        const createData: CreateMotorcycleDTO = {
          brand: data.brand,
          model: data.model,
          vin: data.vin,
          concessionId: data.concessionId,
          mileage: data.mileage,
        };
        await motorcycleService.createMotorcycle(createData);
        toast.success("Moto créée avec succès");
      }
      setOpenForm(false);
      setRefreshKey((prev) => prev + 1);
    } catch (error) {
      toast.error(
        selectedMotorcycle
          ? "Erreur lors de la mise à jour de la moto"
          : "Erreur lors de la création de la moto"
      );
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Gestion des Motos</h1>
        <button
          onClick={handleCreateMotorcycle}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Nouvelle Moto
        </button>
      </div>

      <MotorcycleList
        onEdit={handleEditMotorcycle}
        onDelete={handleDeleteMotorcycle}
        refreshKey={refreshKey}
      />

      {openForm && (
        <MotorcycleForm
          open={openForm}
          motorcycle={selectedMotorcycle}
          onClose={() => setOpenForm(false)}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}
