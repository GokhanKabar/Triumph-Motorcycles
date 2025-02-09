import React, { useState, useEffect } from 'react';
import { testRideService } from '../services/api';
import { TestRideDto } from '@/application/testRide/dtos/TestRideDto';
import { TestRideStatus } from '@domain/testRide/entities/TestRide';

const formatDate = (dateString: string | Date | undefined): string => {
  if (!dateString) return 'Date non disponible';
  
  try {
    const date = new Date(dateString);
    
    // Vérifier si la date est valide
    if (isNaN(date.getTime())) {
      return 'Date invalide';
    }
    
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch (error) {
    return 'Date non formatée';
  }
};

const TestRidePage: React.FC = () => {
  const [testRides, setTestRides] = useState<TestRideDto[]>([]);
  const [selectedTestRide, setSelectedTestRide] = useState<TestRideDto | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<TestRideStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTestRides();
  }, []);

  const fetchTestRides = async () => {
    try {
      setIsLoading(true);
      const rides = await testRideService.getAll();
      setTestRides(rides);
      setError(null);
    } catch (error) {
      setError('Impossible de charger les test rides. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (selectedTestRide) {
      try {
        await testRideService.delete(selectedTestRide.id);
        fetchTestRides();
        setIsDeleteModalOpen(false);
      } catch (error) {
        setError('Impossible de supprimer le test ride.');
      }
    }
  };

  const handleUpdateStatus = async () => {
    if (selectedTestRide && selectedStatus) {
      try {
        if (!Object.values(TestRideStatus).includes(selectedStatus)) {
          throw new Error('Statut invalide');
        }

        const statusData = {
          status: selectedStatus as TestRideStatus
        };
        await testRideService.updateStatus(selectedTestRide.id, statusData);
        fetchTestRides();
        setIsStatusModalOpen(false);
      } catch (error) {
        setError('Impossible de mettre à jour le statut.');
      }
    }
  };

  const openDeleteModal = (testRide: TestRideDto) => {
    setSelectedTestRide(testRide);
    setIsDeleteModalOpen(true);
  };

  const openDetailModal = (testRide: TestRideDto) => {
    setSelectedTestRide(testRide);
    setIsDetailModalOpen(true);
  };

  const openStatusModal = (testRide: TestRideDto) => {
    setSelectedTestRide(testRide);
    setSelectedStatus(testRide.status);
    setIsStatusModalOpen(true);
  };

  const closeModals = () => {
    setIsDeleteModalOpen(false);
    setIsDetailModalOpen(false);
    setIsStatusModalOpen(false);
    setSelectedTestRide(null);
  };

  const getStatusColor = (status: TestRideStatus) => {
    switch (status) {
      case TestRideStatus.CONFIRMED: return 'bg-green-100 text-green-800';
      case TestRideStatus.PENDING: return 'bg-yellow-100 text-yellow-800';
      case TestRideStatus.CANCELLED: return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="container flex items-center justify-center px-4 py-8 mx-auto">
        <div className="w-32 h-32 border-t-2 border-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container px-4 py-8 mx-auto text-center text-red-600">
        <p>{error}</p>
        <button 
          onClick={fetchTestRides} 
          className="px-4 py-2 mt-4 text-white bg-blue-500 rounded hover:bg-blue-600"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="container min-h-screen px-4 py-8 mx-auto bg-gray-50">
      <h1 className="mb-8 text-4xl font-bold text-gray-800">Gestion des Test Rides</h1>
      
      {testRides.length === 0 ? (
        <div className="text-center text-gray-600">
          Aucun test ride disponible
        </div>
      ) : (
        <div className="overflow-hidden bg-white shadow-lg rounded-xl">
          <table className="w-full">
            <thead className="bg-gray-100 border-b">
              <tr>
                {['Date', 'Moto', 'Client', 'Concession', 'Statut', 'Actions'].map((header) => (
                  <th 
                    key={header} 
                    className="px-6 py-4 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {testRides.map((testRide, index) => (
                <tr 
                  key={`${testRide.id}-${index}`} 
                  className="transition-colors duration-200 hover:bg-gray-50"
                >
                  <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap">
                    {formatDate(testRide.desiredDate)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap">
                    {testRide.motorcycleName || 'Moto non spécifiée'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap">
                    {testRide.firstName} {testRide.lastName}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap">
                    {testRide.concessionName || 'Concession non spécifiée'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span 
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(testRide.status)}`}
                    >
                      {testRide.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => openDetailModal(testRide)}
                        className="text-blue-600 transition-colors hover:text-blue-900"
                      >
                        Détails
                      </button>
                      <button 
                        onClick={() => openStatusModal(testRide)}
                        className="text-yellow-600 transition-colors hover:text-yellow-900"
                      >
                        Statut
                      </button>
                      <button 
                        onClick={() => openDeleteModal(testRide)}
                        className="text-red-600 transition-colors hover:text-red-900"
                      >
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de détails */}
      {isDetailModalOpen && selectedTestRide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="mb-6 text-2xl font-bold text-gray-800">Détails du Test Ride</h2>
            <div className="grid grid-cols-2 gap-4">
              <DetailRow label="Nom" value={`${selectedTestRide.firstName} ${selectedTestRide.lastName}`} />
              <DetailRow label="Email" value={selectedTestRide.email} />
              <DetailRow label="Téléphone" value={selectedTestRide.phoneNumber} />
              <DetailRow label="Moto" value={selectedTestRide.motorcycleName} />
              <DetailRow label="Date" value={formatDate(selectedTestRide.desiredDate)} />
              <DetailRow label="Statut" value={selectedTestRide.status} />
              <DetailRow label="Expérience" value={selectedTestRide.riderExperience} />
              <DetailRow label="Type de Permis" value={selectedTestRide.licenseType} />
            </div>
            <div className="flex justify-end mt-6 space-x-4">
              <button 
                onClick={closeModals}
                className="px-4 py-2 text-gray-800 transition-colors bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de changement de statut */}
      {isStatusModalOpen && selectedTestRide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md p-8 bg-white rounded-xl">
            <h2 className="mb-6 text-2xl font-bold text-gray-800">Changer le statut</h2>
            <div className="space-y-4">
              {Object.values(TestRideStatus).map((status: TestRideStatus) => (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`w-full py-3 rounded-md transition-colors ${
                    selectedStatus === status 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
            <div className="flex justify-end mt-6 space-x-4">
              <button 
                onClick={closeModals}
                className="px-4 py-2 text-gray-800 transition-colors bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Annuler
              </button>
              <button 
                onClick={handleUpdateStatus}
                disabled={!selectedStatus}
                className={`px-4 py-2 rounded-md transition-colors ${
                  selectedStatus
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmation de suppression */}
      {isDeleteModalOpen && selectedTestRide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md p-8 bg-white rounded-xl">
            <h2 className="mb-4 text-2xl font-bold text-red-600">Confirmer la suppression</h2>
            <p className="mb-6 text-gray-700">
              Êtes-vous sûr de vouloir supprimer le test ride pour 
              <span className="font-semibold"> {selectedTestRide.firstName} {selectedTestRide.lastName}</span> ?
            </p>
            <div className="flex justify-end space-x-4">
              <button 
                onClick={closeModals}
                className="px-4 py-2 text-gray-800 transition-colors bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Annuler
              </button>
              <button 
                onClick={handleDelete}
                className="px-4 py-2 text-white transition-colors bg-red-600 rounded-md hover:bg-red-700"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Composant utilitaire pour afficher les détails
const DetailRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="p-4 bg-gray-100 rounded-md">
    <span className="block mb-1 text-xs text-gray-500">{label}</span>
    <span className="text-sm font-semibold text-gray-800">{value}</span>
  </div>
);

export default TestRidePage;
