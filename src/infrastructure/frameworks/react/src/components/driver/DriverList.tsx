import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { DriverDTO } from '@application/driver/dtos/DriverDTO';
import { driverService } from '../../services/api';
import { DriverStatus } from '@domain/driver/entities/Driver';

interface DriverListProps {
  onEditDriver?: (driver: DriverDTO) => void;
}

export const DriverList = forwardRef<{ refreshDrivers: () => void }, DriverListProps>(
  ({ onEditDriver }, ref) => {
    const [drivers, setDrivers] = useState<DriverDTO[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedDriver, setSelectedDriver] = useState<DriverDTO | null>(null);
    const [confirmDeleteDriver, setConfirmDeleteDriver] = useState<DriverDTO | null>(null);

    const fetchDrivers = async () => {
      try {
        setIsLoading(true);
        const fetchedDrivers = await driverService.getAllDrivers();
        setDrivers(fetchedDrivers);
        setIsLoading(false);
      } catch (err) {
        console.error('Erreur lors de la récupération des conducteurs:', err);
        setError('Impossible de charger les conducteurs');
        setIsLoading(false);
      }
    };

    useEffect(() => {
      fetchDrivers();
    }, []);

    useImperativeHandle(ref, () => ({
      refreshDrivers: fetchDrivers
    }));

    const handleDriverSelect = (driver: DriverDTO) => {
      setSelectedDriver(driver);
    };

    const handleCloseModal = () => {
      setSelectedDriver(null);
      setConfirmDeleteDriver(null);
    };

    const handleEditDriver = (driver: DriverDTO) => {
      if (onEditDriver) {
        onEditDriver(driver);
      }
    };

    const handleDeleteDriver = async (driver: DriverDTO) => {
      try {
        await driverService.deleteDriver(driver.id);
        // Mettre à jour la liste des conducteurs après suppression
        await fetchDrivers();
        setConfirmDeleteDriver(null);
      } catch (error) {
        console.error('Erreur lors de la suppression du conducteur:', error);
        alert('Impossible de supprimer le conducteur');
      }
    };

    const handleChangeStatus = async (driver: DriverDTO, newStatus: DriverStatus) => {
      try {
        await driverService.changeDriverStatus(driver.id, newStatus);
        await fetchDrivers();
      } catch (error) {
        console.error('Erreur lors du changement de statut:', error);
        alert('Impossible de changer le statut du conducteur');
      }
    };

    const getInitials = (firstName?: string, lastName?: string) => {
      if (!firstName || !lastName) return '??';
      return `${firstName[0] || '?'}${lastName[0] || '?'}`;
    };

    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Erreur ! </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      );
    }

    return (
      <div className="bg-white shadow-xl rounded-2xl p-6">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-6">Liste des Conducteurs</h2>
        {drivers.length === 0 ? (
          <div className="text-center text-gray-500">
            Aucun conducteur trouvé
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {drivers.map((driver, index) => {
              return (
                <div 
                  key={driver.id} 
                  className="bg-gray-100 rounded-lg p-4 shadow-md hover:shadow-lg transition-all cursor-pointer"
                >
                  <div 
                    onClick={() => handleDriverSelect(driver)}
                    className="flex items-center space-x-4"
                  >
                    <div className="flex-shrink-0">
                      <div className="h-12 w-12 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold">
                        {getInitials(driver.firstName, driver.lastName)}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {driver.firstName || 'N/A'} {driver.lastName || 'N/A'}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Permis {driver.licenseType || 'N/A'} - {driver.licenseNumber || 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 border-t border-gray-200 pt-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Statut :</span>
                      <span 
                        className={`
                          font-semibold 
                          ${driver.status === 'ACTIVE' 
                            ? 'text-green-600' 
                            : 'text-red-600'
                          }
                        `}
                      >
                        {driver.status || 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm mt-2">
                      <span className="text-gray-500">Expiration :</span>
                      <span className="text-gray-700">
                        {driver.licenseExpirationDate 
                          ? new Date(driver.licenseExpirationDate).toLocaleDateString() 
                          : 'N/A'}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between mt-4">
                    <button 
                      onClick={() => handleEditDriver(driver)}
                      className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 transition-colors"
                    >
                      Éditer
                    </button>
                    <button 
                      onClick={() => setConfirmDeleteDriver(driver)}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors"
                    >
                      Supprimer
                    </button>
                    <div className="relative">
                      <select 
                        value={driver.status}
                        onChange={(e) => handleChangeStatus(driver, e.target.value as DriverStatus)}
                        className="bg-gray-200 text-gray-800 px-2 py-1 rounded"
                      >
                        {Object.values(DriverStatus).map(status => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal de confirmation de suppression */}
        {confirmDeleteDriver && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-xl">
              <h3 className="text-xl font-bold mb-4">Confirmer la suppression</h3>
              <p>Voulez-vous vraiment supprimer le conducteur {confirmDeleteDriver.firstName} {confirmDeleteDriver.lastName} ?</p>
              <div className="flex justify-end mt-4">
                <button 
                  onClick={handleCloseModal}
                  className="mr-2 bg-gray-300 text-gray-800 px-4 py-2 rounded"
                >
                  Annuler
                </button>
                <button 
                  onClick={() => handleDeleteDriver(confirmDeleteDriver)}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de détails du conducteur */}
        {selectedDriver && (
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto outline-none focus:outline-none">
            <div className="relative w-auto max-w-3xl mx-auto my-6">
              <div className="relative flex flex-col w-full bg-white border-0 rounded-lg shadow-lg outline-none focus:outline-none">
                <div className="flex items-start justify-between p-5 border-b border-solid rounded-t border-blueGray-200">
                  <h3 className="text-3xl font-semibold">
                    Détails du Conducteur
                  </h3>
                  <button
                    className="float-right p-1 ml-auto text-3xl font-semibold leading-none text-black bg-transparent border-0 outline-none opacity-5 focus:outline-none"
                    onClick={handleCloseModal}
                  >
                    <span className="block w-6 h-6 text-2xl text-black bg-transparent opacity-5 focus:outline-none">
                      ×
                    </span>
                  </button>
                </div>
                <div className="relative flex-auto p-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="mb-2 text-lg font-bold">Nom</p>
                      <p>{selectedDriver.firstName || 'N/A'} {selectedDriver.lastName || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="mb-2 text-lg font-bold">Numéro de Permis</p>
                      <p>{selectedDriver.licenseNumber || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="mb-2 text-lg font-bold">Type de Permis</p>
                      <p>{selectedDriver.licenseType || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="mb-2 text-lg font-bold">Date d'Expiration</p>
                      <p>{selectedDriver.licenseExpirationDate 
                          ? new Date(selectedDriver.licenseExpirationDate).toLocaleDateString() 
                          : 'N/A'}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-end p-6 border-t border-solid rounded-b border-blueGray-200">
                  <button
                    className="px-6 py-2 mb-1 mr-1 text-sm font-bold text-blue-500 uppercase transition-all duration-150 ease-linear outline-none background-transparent focus:outline-none"
                    type="button"
                    onClick={handleCloseModal}
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
);
