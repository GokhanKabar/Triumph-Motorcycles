import React, { useRef, useState } from 'react';
import { IncidentList } from '../components/incident/IncidentList';
import { IncidentForm } from '../components/incident/IncidentForm';
import { IncidentDto } from '@application/incident/dto/IncidentDto';
import { Button } from '../components/common/Button';

const IncidentsPage: React.FC = () => {
  const [isAddIncidentModalOpen, setIsAddIncidentModalOpen] = useState(false);
  const [incidentToEdit, setIncidentToEdit] = useState<IncidentDto | null>(null);
  const incidentListRef = useRef<{ refreshIncidents: () => void }>(null);

  const handleOpenAddIncidentModal = () => {
    setIsAddIncidentModalOpen(true);
    setIncidentToEdit(null);
  };

  const handleCloseAddIncidentModal = () => {
    setIsAddIncidentModalOpen(false);
    setIncidentToEdit(null);
  };

  const handleIncidentAdded = () => {
    // Rafraîchir la liste des incidents
    incidentListRef.current?.refreshIncidents();
    handleCloseAddIncidentModal();
  };

  const handleEditIncident = (incident: IncidentDto) => {
    setIncidentToEdit(incident);
    setIsAddIncidentModalOpen(true);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Gestion des Incidents</h1>
        <Button onClick={handleOpenAddIncidentModal}>
          Créer un nouvel incident
        </Button>
      </div>

      <IncidentList 
        ref={incidentListRef}
        onEditIncident={handleEditIncident}
      />

      {isAddIncidentModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-xl font-bold mb-4">
              {incidentToEdit ? 'Modifier' : 'Créer'} un incident
            </h2>
            <IncidentForm
              incidentToEdit={incidentToEdit || undefined}
              onIncidentAdded={handleIncidentAdded}
              onEditComplete={handleCloseAddIncidentModal}
            />
            <div className="mt-4 text-right">
              <Button 
                variant="secondary" 
                onClick={handleCloseAddIncidentModal}
              >
                Annuler
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IncidentsPage;