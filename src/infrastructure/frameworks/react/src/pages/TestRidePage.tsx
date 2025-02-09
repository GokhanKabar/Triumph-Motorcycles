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
      console.warn('Date invalide:', dateString);
      return 'Date invalide';
    }
    
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch (error) {
    console.error('Erreur de formatage de date:', error);
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
      
      // Log détaillé pour le débogage
      console.log('Test Rides récupérés:', rides);
      rides.forEach((ride, index) => {
        console.log(`Test Ride ${index + 1}:`, {
          id: ride.id,
          motorcycleName: ride.motorcycleName,
          desiredDate: ride.desiredDate,
          status: ride.status
        });
      });

      setTestRides(rides);
      setError(null);
    } catch (error) {
      console.error('Erreur lors de la récupération des test rides', error);
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
        console.error('Erreur lors de la suppression du test ride', error);
        setError('Impossible de supprimer le test ride.');
      }
    }
  };

  const handleUpdateStatus = async () => {
    if (selectedTestRide && selectedStatus) {
      try {
        // Vérification que le statut est une valeur valide de l'enum
        if (!Object.values(TestRideStatus).includes(selectedStatus)) {
          throw new Error('Statut invalide');
        }

        const statusData = {
          status: selectedStatus as TestRideStatus // Cast explicite pour s'assurer que le type est correct
        };
        
        console.log('Envoi du statut:', JSON.stringify(statusData)); // Pour le débogage
        await testRideService.updateStatus(selectedTestRide.id, statusData);
        fetchTestRides();
        setIsStatusModalOpen(false);
      } catch (error) {
        console.error('Erreur lors de la mise à jour du statut', error);
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
      <div className="container mx-auto px-4 py-8 flex justify-center items-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center text-red-600">
        <p>{error}</p>
        <button 
          onClick={fetchTestRides} 
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-50 min-h-screen">
      <h1 className="text-4xl font-bold mb-8 text-gray-800">Gestion des Test Rides</h1>
      
      {testRides.length === 0 ? (
        <div className="text-center text-gray-600">
          Aucun test ride disponible
        </div>
      ) : (
        <div className="bg-white shadow-lg rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100 border-b">
              <tr>
                {['Date', 'Moto', 'Client', 'Concession', 'Statut', 'Actions'].map((header) => (
                  <th 
                    key={header} 
                    className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
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
                  className="hover:bg-gray-50 transition-colors duration-200"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {formatDate(testRide.desiredDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {testRide.motorcycleName || 'Moto non spécifiée'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {testRide.firstName} {testRide.lastName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {testRide.concessionName || 'Concession non spécifiée'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span 
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(testRide.status)}`}
                    >
                      {testRide.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => openDetailModal(testRide)}
                        className="text-blue-600 hover:text-blue-900 transition-colors"
                      >
                        Détails
                      </button>
                      <button 
                        onClick={() => openStatusModal(testRide)}
                        className="text-yellow-600 hover:text-yellow-900 transition-colors"
                      >
                        Statut
                      </button>
                      <button 
                        onClick={() => openDeleteModal(testRide)}
                        className="text-red-600 hover:text-red-900 transition-colors"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Détails du Test Ride</h2>
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
            <div className="mt-6 flex justify-end space-x-4">
              <button 
                onClick={closeModals}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de changement de statut */}
      {isStatusModalOpen && selectedTestRide && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Changer le statut</h2>
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
            <div className="mt-6 flex justify-end space-x-4">
              <button 
                onClick={closeModals}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4 text-red-600">Confirmer la suppression</h2>
            <p className="mb-6 text-gray-700">
              Êtes-vous sûr de vouloir supprimer le test ride pour 
              <span className="font-semibold"> {selectedTestRide.firstName} {selectedTestRide.lastName}</span> ?
            </p>
            <div className="flex justify-end space-x-4">
              <button 
                onClick={closeModals}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
              >
                Annuler
              </button>
              <button 
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
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
  <div className="bg-gray-100 p-4 rounded-md">
    <span className="block text-xs text-gray-500 mb-1">{label}</span>
    <span className="text-sm font-semibold text-gray-800">{value}</span>
  </div>
);

export default TestRidePage;
