import React, { useState, useRef } from 'react';
import { DriverList } from '../components/driver/DriverList';
import { DriverForm } from '../components/driver/DriverForm';
import { DriverDTO } from '@application/driver/dtos/DriverDTO';

const Drivers: React.FC = () => {
  const [isAddDriverModalOpen, setIsAddDriverModalOpen] = useState(false);
  const [driverToEdit, setDriverToEdit] = useState<DriverDTO | null>(null);
  const driverListRef = useRef<{ refreshDrivers: () => void }>(null);

  const handleOpenAddDriverModal = () => {
    setIsAddDriverModalOpen(true);
    setDriverToEdit(null);
  };

  const handleCloseAddDriverModal = () => {
    setIsAddDriverModalOpen(false);
    setDriverToEdit(null);
  };

  const handleDriverAdded = () => {
    // Rafraîchir la liste des conducteurs
    driverListRef.current?.refreshDrivers();
    handleCloseAddDriverModal();
  };

  const handleEditDriver = (driver: DriverDTO) => {
    setDriverToEdit(driver);
    setIsAddDriverModalOpen(true);
  };

  const handleEditComplete = () => {
    // Rafraîchir la liste des conducteurs après modification
    driverListRef.current?.refreshDrivers();
    handleCloseAddDriverModal();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-extrabold text-gray-900">Gestion des Conducteurs</h1>
          <button 
            onClick={handleOpenAddDriverModal}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors"
          >
            Ajouter un Conducteur
          </button>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-full">
            <DriverList 
              ref={driverListRef} 
              onEditDriver={handleEditDriver}
            />
          </div>
        </div>

        {(isAddDriverModalOpen || driverToEdit) && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto outline-none focus:outline-none"
            onClick={handleCloseAddDriverModal}
          >
            <div 
              className="relative w-auto max-w-3xl mx-auto my-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative flex flex-col w-full bg-white border-0 rounded-lg shadow-xl outline-none focus:outline-none">
                <div className="flex items-start justify-between p-5 border-b border-solid rounded-t border-blueGray-200">
                  <h3 className="text-3xl font-semibold">
                    {driverToEdit ? 'Modifier un Conducteur' : 'Nouveau Conducteur'}
                  </h3>
                  <button
                    className="float-right p-1 ml-auto text-3xl font-semibold leading-none text-black bg-transparent border-0 outline-none opacity-50 focus:outline-none"
                    onClick={handleCloseAddDriverModal}
                  >
                    <span className="block w-6 h-6 text-2xl text-black bg-transparent opacity-50 focus:outline-none">
                      ×
                    </span>
                  </button>
                </div>
                <div className="relative flex-auto p-6">
                  <DriverForm 
                    driverToEdit={driverToEdit || undefined}
                    onDriverAdded={handleDriverAdded}
                    onEditComplete={handleEditComplete}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Drivers;
