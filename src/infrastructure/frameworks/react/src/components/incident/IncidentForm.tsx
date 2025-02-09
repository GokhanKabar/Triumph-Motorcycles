import React, { useState, useEffect } from 'react';
import { IncidentDto } from '@application/incident/dto/IncidentDto';
import { TestRideDto } from '@application/testRide/dtos/TestRideDto';
import { IncidentType, IncidentStatus } from '@domain/incident/enum';
import { TestRideStatus } from '@domain/testRide/enum';
import { incidentService } from '../../services/api';
import { testRideService } from '../../services/api';
import { Button } from '../common/Button';
import { toast } from 'react-toastify';

interface IncidentFormProps {
  onIncidentAdded?: (incident: IncidentDto) => void;
  onIncidentCreated?: (incident: IncidentDto) => void;
  initialData?: Partial<IncidentDto>;
  incidentToEdit?: IncidentDto;
  onEditComplete?: () => void;
}

export const IncidentForm: React.FC<IncidentFormProps> = ({
  onIncidentAdded,
  onIncidentCreated,
  initialData = {},
  incidentToEdit,
  onEditComplete
}) => {
  const [testRides, setTestRides] = useState<TestRideDto[]>([]);
  const [formData, setFormData] = useState<Partial<IncidentDto>>({
    type: incidentToEdit?.type || initialData.type || IncidentType.MECHANICAL,
    status: incidentToEdit?.status || initialData.status || IncidentStatus.REPORTED,
    description: incidentToEdit?.description || initialData.description || '',
    incidentDate: incidentToEdit?.incidentDate || initialData.incidentDate || new Date().toISOString(),
    testRideId: incidentToEdit?.testRideId || initialData.testRideId || ''
  });

  const [errors, setErrors] = useState<Partial<Record<keyof IncidentDto, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchTestRides = async () => {
      try {
        const rides = await testRideService.getAll();
        setTestRides(rides);
      } catch (error) {
        toast.error('Impossible de charger les test rides');
      }
    };

    fetchTestRides();
  }, []);

  const formatDateForInput = (dateString?: string | Date) => {
    try {
      const date = dateString ? new Date(dateString) : new Date();
      return date.toISOString().split('T')[0];
    } catch (error) {
      console.error('Date formatting error:', error);
      return new Date().toISOString().split('T')[0];
    }
  };

  const validateForm = () => {
    const newErrors: Partial<Record<keyof IncidentDto, string>> = {};

    if (!formData.description?.trim()) {
      newErrors.description = 'La description est requise';
    }

    if (!formData.incidentDate) {
      newErrors.incidentDate = 'La date de l\'incident est requise';
    }

    if (!formData.testRideId) {
      newErrors.testRideId = 'Un test ride doit être sélectionné';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: name === 'incidentDate' ? new Date(value).toISOString() : value
    }));

    if (errors[name as keyof IncidentDto]) {
      setErrors(prev => ({ ...prev, [name as keyof IncidentDto]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const incidentData: Partial<IncidentDto> = {
        ...formData,
        createdAt: incidentToEdit ? incidentToEdit.createdAt : new Date(),
        updatedAt: new Date()
      };

      let result: IncidentDto;
      if (incidentToEdit) {
        result = await incidentService.update(incidentToEdit.id, incidentData);
        if (onEditComplete) onEditComplete();
      } else {
        result = await incidentService.create(incidentData);
        if (onIncidentCreated) onIncidentCreated(result);
        if (onIncidentAdded) onIncidentAdded(result);
      }

      toast.success(incidentToEdit ? 'Incident mis à jour' : 'Incident créé');
      
      setFormData({
        type: IncidentType.MECHANICAL,
        status: IncidentStatus.REPORTED,
        description: '',
        incidentDate: new Date().toISOString(),
        testRideId: ''
      });
    } catch (error) {
      toast.error('Erreur lors de l\'enregistrement de l\'incident');
    } finally {
      setIsSubmitting(false);
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-xl mx-auto bg-white shadow-2xl rounded-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6">
          <h2 className="text-2xl font-bold text-white text-center">
            {incidentToEdit ? 'Modifier l\'incident' : 'Déclarer un incident'}
          </h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Test Ride</label>
              <div className="relative">
                <select
                  name="testRideId"
                  value={formData.testRideId}
                  onChange={handleChange}
                  className={`
                    w-full px-4 py-3 rounded-lg border-2 transition-all duration-300 
                    ${errors.testRideId 
                      ? 'border-red-500 focus:ring-2 focus:ring-red-200' 
                      : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'}
                    text-gray-900 bg-white
                  `}
                  required
                >
                  <option value="" className="text-gray-400">Sélectionner un test ride</option>
                  {testRides.map(ride => (
                    <option 
                      key={ride.id} 
                      value={ride.id} 
                      className="text-gray-900"
                    >
                      {ride.firstName} {ride.lastName} - {ride.motorcycleName} ({ride.email})
                    </option>
                  ))}
                </select>
                {errors.testRideId && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
              {errors.testRideId && (
                <p className="mt-2 text-sm text-red-600">{errors.testRideId}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type d'incident</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-gray-900 bg-white transition-all duration-300"
                >
                  {Object.values(IncidentType).map(type => (
                    <option key={type} value={type}>
                      {translateType(type)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-gray-900 bg-white transition-all duration-300"
                >
                  {Object.values(IncidentStatus).map(status => (
                    <option key={status} value={status}>
                      {translateStatus(status)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className={`
                  w-full px-4 py-3 rounded-lg border-2 transition-all duration-300
                  ${errors.description 
                    ? 'border-red-500 focus:ring-2 focus:ring-red-200' 
                    : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'}
                  text-gray-900 bg-white
                `}
                placeholder="Description détaillée de l'incident"
                required
              />
              {errors.description && (
                <p className="mt-2 text-sm text-red-600">{errors.description}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date de l'incident</label>
              <input
                type="date"
                name="incidentDate"
                value={formatDateForInput(formData.incidentDate)}
                onChange={handleChange}
                className={`
                  w-full px-4 py-3 rounded-lg border-2 transition-all duration-300
                  ${errors.incidentDate 
                    ? 'border-red-500 focus:ring-2 focus:ring-red-200' 
                    : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'}
                  text-gray-900 bg-white
                `}
                required
              />
              {errors.incidentDate && (
                <p className="mt-2 text-sm text-red-600">{errors.incidentDate}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-4 mt-6">
            {onEditComplete && (
              <button
                type="button"
                onClick={onEditComplete}
                className="px-6 py-3 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-300"
              >
                Annuler
              </button>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`
                px-6 py-3 rounded-lg text-white transition-all duration-300
                ${isSubmitting 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'}
              `}
            >
              {isSubmitting ? 'Enregistrement...' : (incidentToEdit ? 'Mettre à jour' : 'Créer')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
