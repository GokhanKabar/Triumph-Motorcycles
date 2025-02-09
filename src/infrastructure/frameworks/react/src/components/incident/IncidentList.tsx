import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { IncidentDto } from '@application/incident/dto/IncidentDto';
import { IncidentType, IncidentStatus } from '@domain/incident/enum';
import { incidentService } from '../../services/api';
import { Button } from '../common/Button';
import { toast } from 'react-toastify';

export interface IncidentListProps {
  onEditIncident?: (incident: IncidentDto) => void;
}

export const IncidentList = forwardRef<{ refreshIncidents: () => void }, IncidentListProps>(
  ({ onEditIncident }, ref) => {
    const [incidents, setIncidents] = useState<IncidentDto[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedIncident, setSelectedIncident] = useState<IncidentDto | null>(null);
    const [confirmDeleteIncident, setConfirmDeleteIncident] = useState<IncidentDto | null>(null);
    const [testRideDetails, setTestRideDetails] = useState<{[key: string]: any}>({});

    const fetchIncidents = async () => {
      try {
        setIsLoading(true);
        const fetchedIncidents = await incidentService.getAll();
        
        // Récupérer les détails des test rides pour chaque incident
        const detailsPromises = fetchedIncidents.map(async (incident) => {
          const details = await getTestRideDetails(incident.testRideId);
          return { [incident.testRideId]: details };
        });

        const detailsResults = await Promise.all(detailsPromises);
        const detailsMap = detailsResults.reduce((acc, curr) => ({ ...acc, ...curr }), {});
        
        setTestRideDetails(detailsMap);

        setIncidents(fetchedIncidents);
        setError(null);
      } catch (err) {
        console.error('Erreur lors de la récupération des incidents :', err);
        setError('Impossible de charger les incidents');
        toast.error('Erreur lors du chargement des incidents');
      } finally {
        setIsLoading(false);
      }
    };

    // Nouvelle fonction pour récupérer les détails du test ride
    const getTestRideDetails = async (testRideId: string) => {
      try {

        const response = await fetch(`${apiBaseUrl}/test-rides/${testRideId}/details`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json'
          }
        });

        if (!response.ok) {
          // Gérer différents types d'erreurs
          if (response.status === 404) {
            console.warn(`Test ride ${testRideId} non trouvé`);
            return null;
          } else if (response.status === 500) {
            console.error('Erreur interne du serveur lors de la récupération des détails du test ride');
            return null;
          } else {
            throw new Error(`Erreur HTTP: ${response.status}`);
          }
        }

        const details = await response.json();
        console.log('Détails du test ride :', details);
        return details;
      } catch (err) {
        console.error('Erreur lors de la récupération des détails du test ride :', err);
        
        // Afficher un message d'erreur à l'utilisateur
        toast.error('Impossible de charger les détails du test ride. Veuillez réessayer.');
        
        return null;
      }
    };

    useEffect(() => {
      fetchIncidents();
    }, []);

    useImperativeHandle(ref, () => ({
      refreshIncidents: fetchIncidents
    }));

    const handleDeleteIncident = async (incident: IncidentDto) => {
      try {
        await incidentService.delete(incident.id);
        setIncidents(incidents.filter(i => i.id !== incident.id));
        toast.success('Incident supprimé avec succès');
        setConfirmDeleteIncident(null);
      } catch (err) {
        toast.error('Impossible de supprimer l\'incident');
      }
    };

    const handleEditIncident = (incident: IncidentDto) => {
      if (onEditIncident) {
        onEditIncident(incident);
      }
    };

    const formatDate = (dateString: string | Date) => {
      try {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      } catch (error) {
        console.error('Date formatting error:', error);
        return 'Date invalide';
      }
    };

    const translateStatus = (status: IncidentStatus): string => {
      const translations: Record<IncidentStatus, string> = {
        [IncidentStatus.REPORTED]: 'Signalé',
        [IncidentStatus.UNDER_INVESTIGATION]: 'En cours d\'investigation',
        [IncidentStatus.ADDITIONAL_INFO_REQUIRED]: 'Informations complémentaires requises',
        [IncidentStatus.RESOLVED]: 'Résolu',
        [IncidentStatus.PARTIALLY_RESOLVED]: 'Partiellement résolu',
        [IncidentStatus.CLOSED]: 'Clôturé',
        [IncidentStatus.ARCHIVED]: 'Archivé',
        [IncidentStatus.DISMISSED]: 'Rejeté',
        [IncidentStatus.PENDING_ACTION]: 'En attente d\'action'
      };
      return translations[status] || status;
    };

    const translateType = (type: IncidentType): string => {
      const translations: Record<IncidentType, string> = {
        [IncidentType.ACCIDENT]: 'Accident',
        [IncidentType.NEAR_MISS]: 'Quasi-accident',
        [IncidentType.MECHANICAL_ISSUE]: 'Problème mécanique',
        [IncidentType.SAFETY_CONCERN]: 'Préoccupation de sécurité',
        [IncidentType.THEFT]: 'Vol',
        [IncidentType.DAMAGE]: 'Dommage',
        [IncidentType.MAINTENANCE_ISSUE]: 'Problème de maintenance',
        [IncidentType.OTHER]: 'Autre'
      };
      return translations[type] || type;
    };

    if (isLoading) return <div>Chargement des incidents...</div>;
    if (error) return <div>{error}</div>;

    return (
      <div className="space-y-4">
        {incidents.map(incident => (
          <div 
            key={incident.id} 
            className="bg-white shadow-md rounded-lg p-4 flex justify-between items-center"
          >
            <div>
              <h3 className="text-lg font-semibold">{translateType(incident.type)}</h3>
              <p className="text-gray-600">{incident.description}</p>
              <div className="flex items-center space-x-2 mt-2">
                <span className="text-sm text-gray-500">
                  {formatDate(incident.incidentDate)}
                </span>
                <span className={`
                  px-2 py-1 rounded-full text-xs font-semibold
                  ${incident.status === IncidentStatus.REPORTED ? 'bg-yellow-100 text-yellow-800' : 
                    incident.status === IncidentStatus.UNDER_INVESTIGATION ? 'bg-blue-100 text-blue-800' : 
                    incident.status === IncidentStatus.RESOLVED ? 'bg-green-100 text-green-800' : 
                    'bg-gray-100 text-gray-800'}
                `}>
                  {translateStatus(incident.status)}
                </span>
              </div>
              
              {/* Informations du conducteur */}
              <div className="mt-4 border-t pt-2">
                <h4 className="text-md font-semibold mb-2">Détails du Conducteur</h4>
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
                    <span className="ml-2 text-gray-600">Chargement...</span>
                  </div>
                ) : testRideDetails[incident.testRideId] ? (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-sm text-gray-600">
                        <strong>Nom :</strong> {testRideDetails[incident.testRideId].firstName} {testRideDetails[incident.testRideId].lastName}
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>Email :</strong> {testRideDetails[incident.testRideId].email}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">
                        <strong>Moto :</strong> {testRideDetails[incident.testRideId].motorcycleName}
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>Statut :</strong> {testRideDetails[incident.testRideId].status}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-2">
                    <p>Impossible de récupérer les détails du conducteur</p>
                    <button 
                      onClick={() => getTestRideDetails(incident.testRideId)}
                      className="mt-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                    >
                      Réessayer
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="flex space-x-2">
              <Button 
                variant="secondary" 
                onClick={() => handleEditIncident(incident)}
              >
                Modifier
              </Button>
              <Button 
                variant="danger" 
                onClick={() => setConfirmDeleteIncident(incident)}
              >
                Supprimer
              </Button>
            </div>
          </div>
        ))}

        {confirmDeleteIncident && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg">
              <h2 className="text-xl font-bold mb-4">Confirmer la suppression</h2>
              <p>Voulez-vous vraiment supprimer cet incident ?</p>
              <div className="flex justify-end space-x-2 mt-4">
                <Button 
                  variant="secondary" 
                  onClick={() => setConfirmDeleteIncident(null)}
                >
                  Annuler
                </Button>
                <Button 
                  variant="danger" 
                  onClick={() => handleDeleteIncident(confirmDeleteIncident)}
                >
                  Supprimer
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
);
