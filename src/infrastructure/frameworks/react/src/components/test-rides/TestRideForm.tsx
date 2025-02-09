import React, { useState, useEffect } from 'react';
import { concessionService, testRideService, motorcycleService } from '../../services/api';
import { ConcessionResponseDTO } from '@/application/dtos/ConcessionDTO';
import { MotorcycleResponseDTO } from '@/application/dtos/MotorcycleDTO';
import { RiderExperience, LicenseType } from '@domain/testRide/entities/TestRide';

export const TestRideForm: React.FC = () => {
  const [concessions, setConcessions] = useState<ConcessionResponseDTO[]>([]);
  const [motorcycles, setMotorcycles] = useState<MotorcycleResponseDTO[]>([]);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'warning';
    message: string;
  } | null>(null);
  const [formData, setFormData] = useState({
    concessionId: '',
    motorcycleId: '',
    motorcycleName: '',
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    desiredDate: '',
    riderExperience: RiderExperience.BEGINNER,
    licenseType: LicenseType.A2,
    licenseNumber: '',
    hasTrainingCertificate: false,
    preferredRideTime: '',
    additionalRequirements: '',
    message: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Charger les concessions
  useEffect(() => {
    const fetchConcessions = async () => {
      try {
        const fetchedConcessions = await concessionService.getAllConcessions();
        console.log('Concessions récupérées:', fetchedConcessions);
        setConcessions(fetchedConcessions);
      } catch (err) {
        console.error('Erreur lors du chargement des concessions:', err);
        setNotification({
          type: 'error',
          message: 'Impossible de charger les concessions'
        });
      }
    };
    fetchConcessions();
  }, []);

  // Charger les motos en fonction de la concession sélectionnée
  useEffect(() => {
    const fetchMotorcycles = async () => {
      if (!formData.concessionId) {
        setMotorcycles([]);
        return;
      }

      try {
        console.log('Récupération des motos pour la concession:', formData.concessionId);
        
        const fetchedMotorcycles = await motorcycleService.getMotorcyclesByConcession(formData.concessionId);
        console.log('Motos récupérées:', fetchedMotorcycles);
        
        setMotorcycles(fetchedMotorcycles);
      } catch (err) {
        console.error('Impossible de charger les motos', err);
        setNotification({
          type: 'error',
          message: 'Impossible de charger les motos'
        });
      }
    };
    fetchMotorcycles();
  }, [formData.concessionId]);

  // Fermer la notification après un délai
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Logique spécifique pour la sélection de la moto
    if (name === 'motorcycleId') {
      const selectedMotorcycle = motorcycles.find(m => m.id === value);
      
      // Log de débogage
      console.log('Moto sélectionnée:', selectedMotorcycle);
      
      // Mise à jour du formulaire avec le nom de la moto
      setFormData(prev => ({
        ...prev,
        [name]: value,
        motorcycleName: selectedMotorcycle ? `${selectedMotorcycle.brand} ${selectedMotorcycle.model}` : ''
      }));
      
      return;
    }

    // Comportement par défaut pour les autres champs
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Préparer les données du test ride
    const testRideData = {
      concessionId: formData.concessionId,
      motorcycleId: formData.motorcycleId,
      motorcycleName: formData.motorcycleName,
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phoneNumber: formData.phoneNumber,
      desiredDate: formData.desiredDate,
      riderExperience: formData.riderExperience,
      licenseType: formData.licenseType,
      licenseNumber: formData.licenseNumber,
      hasTrainingCertificate: formData.hasTrainingCertificate,
      preferredRideTime: formData.preferredRideTime,
      additionalRequirements: formData.additionalRequirements,
      message: formData.message
    };

    console.log('Données du test ride à soumettre:', testRideData);

    try {
      const response = await testRideService.create(testRideData);
      
      // Notification de succès
      setNotification({
        type: 'success',
        message: 'Votre demande de test ride a été soumise avec succès !'
      });

      // Réinitialiser le formulaire
      setFormData({
        concessionId: '',
        motorcycleId: '',
        motorcycleName: '',
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        desiredDate: '',
        riderExperience: RiderExperience.BEGINNER,
        licenseType: LicenseType.A2,
        licenseNumber: '',
        hasTrainingCertificate: false,
        preferredRideTime: '',
        additionalRequirements: '',
        message: ''
      });

      // Afficher un message de succès
      console.log('Test ride créé avec succès:', response);
    } catch (err) {
      console.error('Erreur lors de la soumission du test ride', err);
      
      // Notification d'erreur
      setNotification({
        type: 'error',
        message: 'Impossible de soumettre le test ride. Veuillez réessayer.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative">
      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Informations personnelles */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Informations personnelles</h2>
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">Prénom</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-gray-700 placeholder-gray-400 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:ring-opacity-50 transition duration-200 ease-in-out"
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Nom</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-gray-700 placeholder-gray-400 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:ring-opacity-50 transition duration-200 ease-in-out"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-gray-700 placeholder-gray-400 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:ring-opacity-50 transition duration-200 ease-in-out"
              />
            </div>
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">Numéro de téléphone</label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-gray-700 placeholder-gray-400 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:ring-opacity-50 transition duration-200 ease-in-out"
              />
            </div>
          </div>

          {/* Informations du test ride */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Détails du Test Ride</h2>
            <div>
              <label htmlFor="concessionId" className="block text-sm font-medium text-gray-700">Concession</label>
              <select
                id="concessionId"
                name="concessionId"
                value={formData.concessionId}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-gray-700 placeholder-gray-400 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:ring-opacity-50 transition duration-200 ease-in-out"
              >
                <option value="">Sélectionnez une concession</option>
                {concessions.map(concession => (
                  <option key={concession.id} value={concession.id}>
                    {concession.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="motorcycleId" className="block text-sm font-medium text-gray-700">Moto</label>
              <select
                id="motorcycleId"
                name="motorcycleId"
                value={formData.motorcycleId}
                onChange={handleChange}
                required
                disabled={!formData.concessionId}
                className="mt-1 block w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-gray-700 placeholder-gray-400 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:ring-opacity-50 transition duration-200 ease-in-out"
              >
                <option value="">Sélectionnez une moto</option>
                {motorcycles.map(motorcycle => (
                  <option key={motorcycle.id} value={motorcycle.id}>
                    {motorcycle.brand} {motorcycle.model}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="desiredDate" className="block text-sm font-medium text-gray-700">Date souhaitée</label>
              <input
                type="date"
                id="desiredDate"
                name="desiredDate"
                value={formData.desiredDate}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-gray-700 placeholder-gray-400 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:ring-opacity-50 transition duration-200 ease-in-out"
              />
            </div>
            <div>
              <label htmlFor="preferredRideTime" className="block text-sm font-medium text-gray-700">Heure préférée</label>
              <input
                type="time"
                id="preferredRideTime"
                name="preferredRideTime"
                value={formData.preferredRideTime}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-gray-700 placeholder-gray-400 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:ring-opacity-50 transition duration-200 ease-in-out"
              />
            </div>
          </div>
        </div>

        {/* Informations du permis et de l'expérience */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Permis et Expérience</h2>
            <div>
              <label htmlFor="licenseType" className="block text-sm font-medium text-gray-700">Type de permis</label>
              <select
                id="licenseType"
                name="licenseType"
                value={formData.licenseType}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-gray-700 placeholder-gray-400 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:ring-opacity-50 transition duration-200 ease-in-out"
              >
                {Object.values(LicenseType).map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="licenseNumber" className="block text-sm font-medium text-gray-700">Numéro de permis</label>
              <input
                type="text"
                id="licenseNumber"
                name="licenseNumber"
                value={formData.licenseNumber}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-gray-700 placeholder-gray-400 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:ring-opacity-50 transition duration-200 ease-in-out"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Détails supplémentaires</h2>
            <div>
              <label htmlFor="riderExperience" className="block text-sm font-medium text-gray-700">Expérience de conduite</label>
              <select
                id="riderExperience"
                name="riderExperience"
                value={formData.riderExperience}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-gray-700 placeholder-gray-400 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:ring-opacity-50 transition duration-200 ease-in-out"
              >
                {Object.values(RiderExperience).map(experience => (
                  <option key={experience} value={experience}>{experience}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="hasTrainingCertificate"
                name="hasTrainingCertificate"
                checked={formData.hasTrainingCertificate}
                onChange={handleChange}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="hasTrainingCertificate" className="ml-2 block text-sm text-gray-900">
                Certificat de formation
              </label>
            </div>
          </div>
        </div>

        {/* Message et exigences supplémentaires */}
        <div className="space-y-4 mt-6">
          <div>
            <label htmlFor="additionalRequirements" className="block text-sm font-medium text-gray-700">Exigences supplémentaires</label>
            <textarea
              id="additionalRequirements"
              name="additionalRequirements"
              value={formData.additionalRequirements}
              onChange={handleChange}
              rows={3}
              className="mt-1 block w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-gray-700 placeholder-gray-400 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:ring-opacity-50 transition duration-200 ease-in-out"
              placeholder="Informations complémentaires ou besoins spécifiques"
            ></textarea>
          </div>
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message</label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows={3}
              className="mt-1 block w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-gray-700 placeholder-gray-400 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:ring-opacity-50 transition duration-200 ease-in-out"
              placeholder="Votre message pour le concessionnaire"
            ></textarea>
          </div>
        </div>

        {/* Bouton de soumission */}
        <div className="mt-6">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-600 text-white py-3 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition duration-300 ease-in-out"
          >
            {isLoading ? 'Création en cours...' : 'Réserver un test ride'}
          </button>
        </div>

        {/* Gestion des erreurs */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
      </form>

      {/* Notification Tailwind */}
      {notification && (
        <div 
          className={`
            fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg transition-all duration-300 ease-in-out
            ${notification.type === 'success' 
              ? 'bg-green-100 border-green-400 text-green-700' 
              : notification.type === 'error' 
              ? 'bg-red-100 border-red-400 text-red-700' 
              : 'bg-yellow-100 border-yellow-400 text-yellow-700'}
            animate-slide-in-right
          `}
        >
          <div className="flex items-center">
            {notification.type === 'success' && (
              <svg className="w-5 h-5 mr-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
            {notification.type === 'error' && (
              <svg className="w-5 h-5 mr-3 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            )}
            <p className="text-sm font-medium">{notification.message}</p>
          </div>
        </div>
      )}
    </div>
  );
};
