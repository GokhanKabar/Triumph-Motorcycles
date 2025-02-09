import React, { useState, useEffect } from 'react';
import { CreateDriverDTO, DriverDTO } from '@application/driver/dtos/DriverDTO';
import { DriverStatus } from '@domain/driver/entities/Driver';
import { driverService, companyService, motorcycleService } from '../../services/api';
import { CompanyResponseDTO } from '@application/dtos/CompanyDTO';
import { MotorcycleResponseDTO } from '@application/dtos/MotorcycleDTO';

interface DriverFormProps {
  onDriverAdded?: (driver: DriverDTO) => void;
  onDriverCreated?: (driver: any) => void;
  initialData?: Partial<CreateDriverDTO>;
  driverToEdit?: DriverDTO;
  onEditComplete?: () => void;
}

export const DriverForm: React.FC<DriverFormProps> = ({ 
  onDriverAdded, 
  onDriverCreated, 
  initialData = {},
  driverToEdit,
  onEditComplete
}) => {
  const [companies, setCompanies] = useState<CompanyResponseDTO[]>([]);
  const [motorcycles, setMotorcycles] = useState<MotorcycleResponseDTO[]>([]);
  const [existingLicenseNumbers, setExistingLicenseNumbers] = useState<string[]>([]);
  const [formData, setFormData] = useState<CreateDriverDTO>({
    firstName: driverToEdit?.firstName || '',
    lastName: driverToEdit?.lastName || '',
    licenseNumber: driverToEdit?.licenseNumber || '',
    licenseType: driverToEdit?.licenseType || 'A',
    licenseExpirationDate: driverToEdit?.licenseExpirationDate 
      ? new Date(driverToEdit.licenseExpirationDate).toISOString().split('T')[0] 
      : '',
    status: driverToEdit?.status || DriverStatus.ACTIVE,
    companyId: driverToEdit?.companyId || '',
    currentMotorcycleId: driverToEdit?.currentMotorcycleId || '',
    drivingExperience: driverToEdit?.drivingExperience || 0,
    createdAt: driverToEdit?.createdAt || new Date(),
    updatedAt: new Date()
  });
  const [errors, setErrors] = useState<{
    firstName?: string;
    lastName?: string;
    licenseNumber?: string;
    licenseExpirationDate?: string;
    companyId?: string;
    currentMotorcycleId?: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fetchedCompanies, fetchedDrivers, fetchedMotorcycles] = await Promise.all([
          companyService.getAllCompanies(),
          driverService.getAllDrivers(),
          motorcycleService.getAllMotorcycles()
        ]);

        setCompanies(fetchedCompanies);
        setMotorcycles(fetchedMotorcycles);
        
        // Extraire les numéros de permis existants
        const existingLicenses = fetchedDrivers
          .filter(d => d.id !== driverToEdit?.id)
          .map(driver => driver.licenseNumber);
        setExistingLicenseNumbers(existingLicenses);
        
        // Si au moins une entreprise existe et pas de companyId, sélectionner la première par défaut
        if (fetchedCompanies.length > 0 && !formData.companyId) {
          setFormData(prev => ({
            ...prev,
            companyId: fetchedCompanies[0].id
          }));
        }
      } catch (error) {
        alert('Impossible de charger les données');
      }
    };

    fetchData();
  }, [driverToEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: type === 'number' ? Number(value) : 
              name === 'licenseExpirationDate' ? value : value
    }));

    // Réinitialiser l'erreur pour ce champ
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Le prénom est requis';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Le nom est requis';
    }

    if (!formData.licenseNumber.trim()) {
      newErrors.licenseNumber = 'Le numéro de permis est requis';
    } else if (existingLicenseNumbers.includes(formData.licenseNumber)) {
      newErrors.licenseNumber = 'Ce numéro de permis existe déjà';
    }

    if (!formData.licenseExpirationDate) {
      newErrors.licenseExpirationDate = 'La date d\'expiration est requise';
    }

    if (!formData.companyId) {
      newErrors.companyId = 'L\'entreprise est requise';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const driverData: CreateDriverDTO = {
        ...formData,
        licenseExpirationDate: formData.licenseExpirationDate 
          ? new Date(formData.licenseExpirationDate) 
          : new Date(),
        drivingExperience: formData.drivingExperience || 0,
        createdAt: driverToEdit ? driverToEdit.createdAt : new Date(),
        updatedAt: new Date()
      };

      let result: DriverDTO;
      if (driverToEdit) {
        // Mode édition
        result = await driverService.updateDriver(driverToEdit.id, driverData);
        if (onEditComplete) onEditComplete();
      } else {
        // Mode création
        result = await driverService.createDriver(driverData);
      }
      
      alert(driverToEdit ? 'Conducteur mis à jour avec succès' : 'Conducteur ajouté avec succès');

      // Appeler les callbacks
      if (onDriverAdded) onDriverAdded(result);
      if (onDriverCreated) onDriverCreated(result);

      setSubmitStatus('success');

      // Réinitialiser le formulaire si pas en mode édition
      if (!driverToEdit) {
        setFormData({
          firstName: '',
          lastName: '',
          licenseNumber: '',
          licenseType: 'A',
          licenseExpirationDate: '',
          status: DriverStatus.ACTIVE,
          companyId: companies.length > 0 ? companies[0].id : '',
          currentMotorcycleId: '',
          drivingExperience: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
    } catch (error) {
      alert(driverToEdit ? 'Erreur lors de la mise à jour du conducteur' : 'Erreur lors de l\'ajout du conducteur');
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 bg-white shadow-xl rounded-2xl">
      <h2 className="mb-6 text-3xl font-extrabold text-gray-900">
        {driverToEdit ? 'Modifier un Conducteur' : 'Nouveau Conducteur'}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Champs du formulaire */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block mb-1 text-sm font-medium text-gray-700">Prénom</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="Entrez le prénom"
              className="w-full px-3 py-2 text-gray-900 placeholder-gray-500 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            {errors.firstName && (
              <p className="mt-1 text-xs text-red-500">{errors.firstName}</p>
            )}
          </div>
          <div>
            <label htmlFor="lastName" className="block mb-1 text-sm font-medium text-gray-700">Nom</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Entrez le nom"
              className="w-full px-3 py-2 text-gray-900 placeholder-gray-500 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            {errors.lastName && (
              <p className="mt-1 text-xs text-red-500">{errors.lastName}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="licenseNumber" className="block mb-1 text-sm font-medium text-gray-700">Numéro de Permis</label>
            <input
              type="text"
              id="licenseNumber"
              name="licenseNumber"
              value={formData.licenseNumber}
              onChange={handleChange}
              placeholder="Numéro de permis"
              className="w-full px-3 py-2 text-gray-900 placeholder-gray-500 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            {errors.licenseNumber && (
              <p className="mt-1 text-xs text-red-500">{errors.licenseNumber}</p>
            )}
          </div>
          <div>
            <label htmlFor="licenseType" className="block mb-1 text-sm font-medium text-gray-700">Type de Permis</label>
            <select
              id="licenseType"
              name="licenseType"
              value={formData.licenseType}
              onChange={handleChange}
              className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="A">A - Moto sans limitation</option>
              <option value="A1">A1 - Moto légère</option>
              <option value="A2">A2 - Moto puissance moyenne</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="licenseExpirationDate" className="block mb-1 text-sm font-medium text-gray-700">Date d'Expiration</label>
            <input
              type="date"
              id="licenseExpirationDate"
              name="licenseExpirationDate"
              value={formData.licenseExpirationDate}
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            {errors.licenseExpirationDate && (
              <p className="mt-1 text-xs text-red-500">{errors.licenseExpirationDate}</p>
            )}
          </div>
          <div>
            <label htmlFor="drivingExperience" className="block mb-1 text-sm font-medium text-gray-700">Expérience de Conduite (années)</label>
            <input
              type="number"
              id="drivingExperience"
              name="drivingExperience"
              value={formData.drivingExperience}
              onChange={handleChange}
              min="0"
              placeholder="Années d'expérience"
              className="w-full px-3 py-2 text-gray-900 placeholder-gray-500 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="companyId" className="block mb-1 text-sm font-medium text-gray-700">Entreprise</label>
            <select
              id="companyId"
              name="companyId"
              value={formData.companyId}
              onChange={handleChange}
              className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              {companies.map(company => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
            {errors.companyId && (
              <p className="mt-1 text-xs text-red-500">{errors.companyId}</p>
            )}
          </div>
          <div>
            <label htmlFor="currentMotorcycleId" className="block mb-1 text-sm font-medium text-gray-700">Moto Assignée</label>
            <select
              id="currentMotorcycleId"
              name="currentMotorcycleId"
              value={formData.currentMotorcycleId}
              onChange={handleChange}
              className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Aucune moto assignée</option>
              {motorcycles.map(motorcycle => (
                <option key={motorcycle.id} value={motorcycle.id}>
                  {motorcycle.model} - {motorcycle.registrationNumber}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="status" className="block mb-1 text-sm font-medium text-gray-700">Statut</label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {Object.values(DriverStatus).map(status => (
              <option key={status} value={status}>
                {status === DriverStatus.ACTIVE ? 'Actif' : 
                 status === DriverStatus.INACTIVE ? 'Inactif' : 
                 status === DriverStatus.SUSPENDED ? 'Suspendu' : status}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end mt-6 space-x-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-6 py-2 rounded-md text-white font-semibold 
                        ${isSubmitting 
                          ? 'bg-gray-400 cursor-not-allowed' 
                          : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'}`}
          >
            {isSubmitting 
              ? (driverToEdit ? 'Mise à jour...' : 'Ajout...') 
              : (driverToEdit ? 'Mettre à jour' : 'Ajouter')}
          </button>
        </div>
      </form>
    </div>
  );
};
