import axios from 'axios';
import {
  CreateConcessionDTO,
  ConcessionResponseDTO,
  UpdateConcessionDTO,
  ConcessionFormDTO,
  DeleteConcessionResponseDTO
} from "@/application/dtos/ConcessionDTO";
import { MotorcycleResponseDTO } from '@application/motorcycle/dtos/MotorcycleDTO';
import { MotorcycleStatus } from '@domain/motorcycle/enums/MotorcycleStatus';
import { MaintenanceResponseDTO } from '@application/maintenance/dtos/MaintenanceResponseDTO';
import { MaintenanceType, MaintenanceStatus } from '@domain/maintenance/entities/Maintenance';

// Configuration de l'instance Axios
export const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token aux requêtes
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercepteur pour gérer les erreurs d'authentification
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Vérifier si nous avons une réponse et si c'est une erreur 401
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Essayer de rafraîchir le token
        const response = await authService.refreshToken();
        const { token } = response;

        // Mettre à jour le token dans le localStorage
        localStorage.setItem('token', token);

        // Mettre à jour le header d'autorisation
        originalRequest.headers.Authorization = `Bearer ${token}`;
        
        // Réessayer la requête originale avec le nouveau token
        return api(originalRequest);
      } catch (refreshError) {
        // Si le rafraîchissement échoue, déconnecter l'utilisateur
        localStorage.removeItem('token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Global error interceptor
api.interceptors.response.use(
  response => response,
  error => {
    console.error('DEBUG: Global API Error Interceptor', {
      url: error.config?.url,
      method: error.config?.method,
      params: error.config?.params,
      data: error.config?.data,
      errorMessage: error.message,
      errorResponse: error.response?.data
    });
    return Promise.reject(error);
  }
);

// Global error interceptor
api.interceptors.response.use(
  response => response,
  error => {
    console.error('DEBUG: Global API Error Interceptor', {
      url: error.config?.url,
      method: error.config?.method,
      params: error.config?.params,
      data: error.config?.data,
      errorMessage: error.message,
      errorResponse: error.response?.data
    });
    return Promise.reject(error);
  }
);

// Service d'authentification
export const authService = {
  login: async (credentials: { email: string; password: string }) => {
    try {
      const response = await api.post('/auth/login', credentials);
      
      // Vérification de la réponse
      if (!response.data || !response.data.token || !response.data.user) {
        throw new Error('Réponse du serveur invalide');
      }
      
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        // Erreur avec réponse du serveur
        const message = error.response.data?.message || 'Erreur lors de la connexion';
        console.error('Erreur lors de la connexion:', message);
        throw new Error(message);
      } else {
        // Erreur sans réponse du serveur
        console.error('Erreur lors de la connexion:', error);
        throw new Error('Erreur de connexion au serveur');
      }
    }
  },

  register: async (userData: any) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      throw error;
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
      localStorage.removeItem('token');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      throw error;
    }
  },

  refreshToken: async () => {
    try {
      const response = await api.post('/auth/refresh-token');
      return response.data;
    } catch (error) {
      console.error('Erreur lors du rafraîchissement du token:', error);
      throw error;
    }
  },

  getCurrentUser: async () => {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur courant:', error);
      throw error;
    }
  },

  createAdminUser: async (userData: any) => {
    try {
      // Vérifier si l'utilisateur actuel est admin
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      if (currentUser?.role !== 'ADMIN') {
        throw new Error('Accès non autorisé. Seuls les administrateurs peuvent créer des comptes admin.');
      }

      // Vérifier que tous les champs requis sont présents
      const requiredFields = ['firstName', 'lastName', 'email', 'password', 'role'];
      const missingFields = requiredFields.filter(field => !userData[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`Champs manquants : ${missingFields.join(', ')}`);
      }

      // Créer l'utilisateur admin
      const response = await api.post('/users/admin', userData);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // Erreur avec réponse du serveur
        const errorMessage = error.response?.data?.message || 
          error.response?.data?.errors?.map((err: any) => err.message).join(', ') || 
          'Erreur lors de la création de l\'utilisateur admin';
        
        console.error('Erreur de création d\'utilisateur admin:', {
          errorMessage,
          responseData: error.response?.data,
          status: error.response?.status
        });

        throw new Error(errorMessage);
      } else {
        // Erreur sans réponse du serveur
        console.error('Erreur lors de la création de l\'utilisateur admin:', error);
        throw error;
      }
    }
  },
};

// Service pour les utilisateurs
export const userService = {
  getAllUsers: async () => {
    try {
      const response = await api.get('/users/all');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs:', error);
      throw error;
    }
  },

  getUser: async (id: string) => {
    try {
      // Validate UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(id)) {
        console.error(`Erreur: ID utilisateur invalide: ${id}`);
        throw new Error('ID utilisateur invalide');
      }

      const response = await api.get(`/users/${id}`);
      if (response.status === 404) {
        throw new Error(`Utilisateur non trouvé avec l'ID ${id}`);
      } else if (response.status >= 500) {
        throw new Error(`Erreur serveur lors de la récupération de l'utilisateur ${id}`);
      }
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        // Erreur avec réponse du serveur
        const message = error.response.data?.message || 'Erreur lors de la récupération de l\'utilisateur';
        console.error('Erreur lors de la récupération de l\'utilisateur:', message);
        throw new Error(message);
      } else {
        // Erreur sans réponse du serveur
        console.error('Erreur lors de la récupération de l\'utilisateur:', error);
        throw new Error('Erreur de connexion au serveur');
      }
    }
  },

  createUser: async (userData: any) => {
    try {
      const response = await api.post('/users', userData);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création de l\'utilisateur:', error);
      throw error;
    }
  },

  updateUser: async (id: string, userData: any) => {
    try {
      const response = await api.put(`/users/${id}`, userData);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de l'utilisateur ${id}:`, error);
      throw error;
    }
  },

  deleteUser: async (id: string) => {
    try {
      const response = await api.delete(`/users/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la suppression de l'utilisateur ${id}:`, error);
      throw error;
    }
  },

  resetPassword: async (userId: string) => {
    try {
      const response = await api.post(`/users/reset-password/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la réinitialisation du mot de passe:', error);
      throw error;
    }
  },

  updatePassword: async (data: { currentPassword: string; newPassword: string }) => {
    try {
      const response = await api.post('/users/update-password', data);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du mot de passe:', error);
      throw error;
    }
  },

  createAdminUser: async (userData: any) => {
    try {
      // Vérifier si l'utilisateur actuel est admin
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      if (currentUser?.role !== 'ADMIN') {
        throw new Error('Accès non autorisé. Seuls les administrateurs peuvent créer des comptes admin.');
      }

      // Vérifier que tous les champs requis sont présents
      const requiredFields = ['firstName', 'lastName', 'email', 'password', 'role'];
      const missingFields = requiredFields.filter(field => !userData[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`Champs manquants : ${missingFields.join(', ')}`);
      }

      // Créer l'utilisateur admin
      const response = await api.post('/users/admin', userData);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // Erreur avec réponse du serveur
        const errorMessage = error.response?.data?.message || 
          error.response?.data?.errors?.map((err: any) => err.message).join(', ') || 
          'Erreur lors de la création de l\'utilisateur admin';
        
        console.error('Erreur de création d\'utilisateur admin:', {
          errorMessage,
          responseData: error.response?.data,
          status: error.response?.status
        });

        throw new Error(errorMessage);
      } else {
        // Erreur sans réponse du serveur
        console.error('Erreur lors de la création de l\'utilisateur admin:', error);
        throw error;
      }
    }
  },
};

// Service pour les motos
export const motorcycleService = {
  getAllMotorcycles: async (concessionId?: string): Promise<MotorcycleResponseDTO[]> => {
    try {
      const url = concessionId ? `/?concessionId=${concessionId}` : '/';
      const response = await api.get(`/motorcycles${url}`);
      
      // Transformer les données avec le DTO
      const motorcycles: MotorcycleResponseDTO[] = response.data.map((moto: any) => ({
        id: moto.id,
        brand: moto.brand,
        model: moto.model,
        year: moto.year,
        vin: moto.vin,
        mileage: moto.mileage,
        status: moto.status || MotorcycleStatus.AVAILABLE, // Forcer le statut
        concessionId: moto.concessionId,
        createdAt: new Date(moto.createdAt),
        updatedAt: new Date(moto.updatedAt)
      }));
      
      // Log détaillé des statuts
      const statusCounts = motorcycles.reduce((acc: Record<string, number>, moto: MotorcycleResponseDTO) => {
        console.log('DEBUG: Statut de moto individuel:', {
          id: moto.id,
          status: moto.status,
          statusType: typeof moto.status
        });
        
        acc[moto.status] = (acc[moto.status] || 0) + 1;
        return acc;
      }, {});
      
      console.log('DEBUG: Répartition des statuts de motos:', JSON.stringify(statusCounts, null, 2));
      
      return motorcycles;
    } catch (error) {
      console.error('Erreur lors de la récupération des motos:', error);
      throw error;
    }
  },

  getMotorcyclesByConcession: async (concessionId: string) => {
    try {
      const response = await api.get(`/motorcycles?concessionId=${concessionId}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération des motos pour la concession ${concessionId}:`, error);
      throw error;
    }
  },

  getMotorcycle: async (id: string) => {
    try {
      const response = await api.get(`/motorcycles/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération de la moto ${id}:`, error);
      throw error;
    }
  },

  createMotorcycle: async (motorcycleData: any) => {
    try {
      const response = await api.post('/motorcycles', motorcycleData);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création de la moto:', error);
      throw error;
    }
  },

  updateMotorcycle: async (id: string, motorcycleData: any) => {
    try {
      const response = await api.put(`/motorcycles/${id}`, motorcycleData);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de la moto ${id}:`, error);
      throw error;
    }
  },

  deleteMotorcycle: async (id: string) => {
    try {
      const response = await api.delete(`/motorcycles/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la suppression de la moto ${id}:`, error);
      throw error;
    }
  }
};

// Service pour les maintenances
export const maintenanceService = {
  getAllMaintenances: async (): Promise<MaintenanceResponseDTO[]> => {
    try {
      const response = await api.get('/maintenances/all');
      
      // Log détaillé des statuts de maintenance
      const statusCounts = response.data.reduce((acc: Record<string, number>, maintenance: MaintenanceResponseDTO) => {
        console.log('DEBUG: Statut de maintenance individuel:', {
          id: maintenance.id,
          status: maintenance.status,
          motorcycleId: maintenance.motorcycleId,
          motorcycleExists: !!maintenance.motorcycle
        });
        
        acc[maintenance.status] = (acc[maintenance.status] || 0) + 1;
        return acc;
      }, {});
      
      console.log('DEBUG: Répartition des statuts de maintenances:', JSON.stringify(statusCounts, null, 2));
      
      // Mapper les données pour s'assurer que le champ motorcycle est correctement peuplé
      return response.data.map((maintenance: MaintenanceResponseDTO) => ({
        ...maintenance,
        motorcycle: maintenance.motorcycle ? {
          id: maintenance.motorcycle.id,
          brand: maintenance.motorcycle.brand,
          model: maintenance.motorcycle.model,
          year: maintenance.motorcycle.year,
          vin: maintenance.motorcycle.vin,
          mileage: maintenance.motorcycle.mileage,
          status: maintenance.motorcycle.status,
          concessionId: maintenance.motorcycle.concessionId
        } : undefined
      }));
    } catch (error) {
      console.error('Erreur lors de la récupération des maintenances:', error);
      throw error;
    }
  },

  getMaintenanceById: async (id: string): Promise<MaintenanceResponseDTO> => {
    try {
      const response = await api.get(`/maintenances/${id}`);
      
      console.log('DEBUG: Détails de la maintenance:', {
        id: response.data.id,
        status: response.data.status,
        motorcycleId: response.data.motorcycleId,
        motorcycleExists: !!response.data.motorcycle
      });
      
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération de la maintenance:', error);
      throw error;
    }
  },

  createMaintenance: async (maintenanceData: Partial<MaintenanceResponseDTO>): Promise<MaintenanceResponseDTO> => {
    try {
      const response = await api.post('/maintenances', {
        ...maintenanceData,
        status: maintenanceData.status || MaintenanceStatus.SCHEDULED
      });
      
      console.log('DEBUG: Maintenance créée:', {
        id: response.data.id,
        status: response.data.status,
        motorcycleId: response.data.motorcycleId
      });
      
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création de la maintenance:', error);
      throw error;
    }
  },

  updateMaintenance: async (id: string, maintenanceData: Partial<MaintenanceResponseDTO>): Promise<MaintenanceResponseDTO> => {
    try {
      const response = await api.put(`/maintenances/${id}`, maintenanceData);
      
      console.log('DEBUG: Maintenance mise à jour:', {
        id: response.data.id,
        status: response.data.status,
        motorcycleId: response.data.motorcycleId
      });
      
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la maintenance:', error);
      throw error;
    }
  },

  deleteMaintenance: async (id: string): Promise<void> => {
    try {
      await api.delete(`/maintenances/${id}`);
      
      console.log('DEBUG: Maintenance supprimée:', { id });
    } catch (error) {
      console.error('Erreur lors de la suppression de la maintenance:', error);
      throw error;
    }
  }
};

// Service pour les pièces d'inventaire
export const inventoryPartService = {
  getAllParts: async () => {
    try {
      const response = await api.get('/inventory-parts');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des pièces:', error);
      throw error;
    }
  },

  getAllInventoryParts: async () => {
    return inventoryPartService.getAllParts();
  },

  getPart: async (id: string) => {
    try {
      const response = await api.get(`/inventory-parts/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération de la pièce ${id}:`, error);
      throw error;
    }
  },

  createPart: async (partData: any) => {
    try {
      const response = await api.post('/inventory-parts', partData);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création de la pièce:', error);
      throw error;
    }
  },

  createInventoryPart: async (partData: any) => {
    return inventoryPartService.createPart(partData);
  },

  updatePart: async (id: string, partData: any) => {
    try {
      const response = await api.put(`/inventory-parts/${id}`, partData);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de la pièce ${id}:`, error);
      throw error;
    }
  },

  updateInventoryPart: async (id: string, partData: any) => {
    return inventoryPartService.updatePart(id, partData);
  },

  deletePart: async (id: string) => {
    try {
      await api.delete(`/inventory-parts/${id}`);
    } catch (error) {
      console.error(`Erreur lors de la suppression de la pièce ${id}:`, error);
      throw error;
    }
  },

  deleteInventoryPart: async (id: string) => {
    return inventoryPartService.deletePart(id);
  },

  manageStock: async (id: string, stockData: any) => {
    try {
      const response = await api.patch(`/inventory-parts/${id}/stock`, stockData);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la gestion du stock de la pièce ${id}:`, error);
      throw error;
    }
  }
};

// Service pour les entreprises
export const companyService = {
  getAllCompanies: async () => {
    try {
      const response = await api.get('/companies');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des entreprises:', error);
      throw error;
    }
  },

  getCompanyById: async (id: string) => {
    try {
      const response = await api.get(`/companies/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération de l'entreprise ${id}:`, error);
      throw error;
    }
  },

  createCompany: async (companyData: any) => {
    try {
      const response = await api.post('/companies', companyData);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création de l\'entreprise:', error);
      throw error;
    }
  },

  updateCompany: async (id: string, companyData: any) => {
    try {
      const response = await api.put(`/companies/${id}`, companyData);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de l'entreprise ${id}:`, error);
      throw error;
    }
  },

  deleteCompany: async (id: string) => {
    try {
      const response = await api.delete(`/companies/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la suppression de l'entreprise ${id}:`, error);
      throw error;
    }
  }
};

// Service pour les motos d'entreprise
export const companyMotorcycleService = {
  assignMotorcycleToCompany: async (companyId: string, motorcycleId: string) => {
    try {
      const response = await api.post('/company-motorcycles', { companyId, motorcycleId });
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de l'assignation de la moto ${motorcycleId} à l'entreprise ${companyId}:`, error);
      throw error;
    }
  },

  removeMotorcycleFromCompany: async (companyId: string, motorcycleId: string) => {
    try {
      const response = await api.delete(`/company-motorcycles/${companyId}/${motorcycleId}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la suppression de la moto ${motorcycleId} de l'entreprise ${companyId}:`, error);
      throw error;
    }
  },

  getCompanyMotorcycles: async (companyId: string) => {
    try {
      const response = await api.get(`/company-motorcycles/${companyId}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération des motos de l'entreprise ${companyId}:`, error);
      throw error;
    }
  }
};

// Service pour les conducteurs
export const driverService = {
  createDriver: async (driverData: any) => {
    try {
      const response = await api.post('/drivers', driverData);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création du conducteur:', error);
      throw error;
    }
  },

  getAllDrivers: async () => {
    try {
      const response = await api.get('/drivers');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des conducteurs:', error);
      throw error;
    }
  },

  updateDriver: async (id: string, driverData: any) => {
    try {
      const response = await api.put(`/drivers/${id}`, driverData);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du conducteur ${id}:`, error);
      throw error;
    }
  },

  deleteDriver: async (id: string) => {
    try {
      const response = await api.delete(`/drivers/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la suppression du conducteur ${id}:`, error);
      throw error;
    }
  },

  assignMotorcycle: async (driverData: any) => {
    try {
      const response = await api.patch('/drivers/assign-motorcycle', driverData);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de l\'assignation de la moto au conducteur:', error);
      throw error;
    }
  },

  recordIncident: async (incidentData: any) => {
    try {
      const response = await api.patch('/drivers/record-incident', incidentData);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de l\'incident:', error);
      throw error;
    }
  },

  changeDriverStatus: async (id: string, newStatus: DriverStatus) => {
    try {
      const response = await api.patch(`/drivers/${id}/status`, { status: newStatus });
      return response.data;
    } catch (error) {
      console.error(`Erreur lors du changement de statut du conducteur ${id}:`, error);
      throw error;
    }
  }
};

// Service pour les essais de moto
export const testRideService = {
  create: async (testRideData: any) => {
    try {
      const response = await api.post('/test-rides', testRideData);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création de l\'essai:', error);
      throw error;
    }
  },

  getAll: async () => {
    try {
      const response = await api.get('/test-rides');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des essais:', error);
      throw error;
    }
  },

  getById: async (id: string) => {
    try {
      const response = await api.get(`/test-rides/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération de l'essai ${id}:`, error);
      throw error;
    }
  },

  getByConcessionId: async (concessionId: string) => {
    try {
      const response = await api.get(`/test-rides/concession/${concessionId}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération des essais pour la concession ${concessionId}:`, error);
      throw error;
    }
  },

  delete: async (id: string) => {
    try {
      const response = await api.delete(`/test-rides/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la suppression de l'essai ${id}:`, error);
      throw error;
    }
  },

  updateStatus: async (id: string, statusData: { status: TestRideStatus }) => {
    try {
      const response = await api.patch(`/test-rides/${id}/status`, statusData);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du statut de l'essai ${id}:`, error);
      throw error;
    }
  }
};

// Service pour les concessions
export const concessionService = {
  getAllConcessions: async () => {
    try {
      const response = await api.get('/concessions');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des concessions:', error);
      throw error;
    }
  },

  getConcession: async (id: string) => {
    try {
      const response = await api.get(`/concessions/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération de la concession ${id}:`, error);
      throw error;
    }
  },

  createConcession: async (concessionData: CreateConcessionDTO): Promise<ConcessionResponseDTO> => {
    try {
      console.log('Tentative de création de concession:', concessionData);
      
      // Validation côté client avant l'envoi
      if (!concessionData.name || !concessionData.name.trim()) {
        console.error('Validation error: Name is required');
        throw new Error("Le nom de la concession est obligatoire");
      }

      if (!concessionData.userId) {
        console.error('Validation error: User ID is required');
        throw new Error("L'ID utilisateur est requis");
      }

      // Supprimer explicitement l'ID si undefined
      const { id, ...dataToSend } = concessionData;
      
      console.log('Données envoyées:', dataToSend);

      const response = await api.post('/concessions', dataToSend, {
        // Configuration Axios pour obtenir plus de détails sur l'erreur
        validateStatus: function (status) {
          return status >= 200 && status < 500; // Accepter les statuts 2xx et 4xx
        }
      });

      console.log('Statut de la réponse:', response.status);
      console.log('Réponse de création de concession:', response.data);
      
      // Gestion des différents codes de statut
      if (response.status === 400) {
        console.error('Validation error response:', response.data);
        throw new Error(response.data.error?.message || "Erreur de validation");
      }

      if (response.status === 401) {
        console.error('Unauthorized error');
        throw new Error("Non autorisé");
      }

      // Vérifier la structure de la réponse
      if (!response.data || !response.data.concession) {
        console.error('Invalid server response structure', response.data);
        throw new Error("Réponse invalide du serveur");
      }
      
      return response.data.concession;
    } catch (error: any) {
      console.error('Erreur lors de la création de la concession:', {
        errorResponse: error.response?.data,
        errorMessage: error.message,
        fullError: error,
        requestData: concessionData
      });
      
      // Gestion des différents types d'erreurs
      if (error.response?.data?.error) {
        const errorData = error.response.data.error;
        console.error('Server error details:', errorData);
        throw new Error(errorData.message || 'Erreur lors de la création de la concession');
      }
      
      // Erreur par défaut
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Erreur lors de la création de la concession'
      );
    }
  },

  updateConcession: async (id: string, concessionData: UpdateConcessionDTO) => {
    try {
      // Vérification des données requises
      if (!concessionData.name?.trim() || !concessionData.address?.trim()) {
        throw new Error('Le nom et l\'adresse sont requis pour la mise à jour');
      }

      // Nettoyer et structurer les données
      const updateData: UpdateConcessionDTO = {
        name: concessionData.name.trim(),
        address: concessionData.address.trim()
      };

      // Log pour le débogage
      console.log('Envoi de la requête de mise à jour:', {
        url: `/concessions/${id}`,
        method: 'PUT',
        data: updateData
      });

      const response = await api.put(`/concessions/${id}`, updateData);
      return response.data;
    } catch (error: any) {
      console.error(`Erreur lors de la mise à jour de la concession ${id}:`, error);
      
      // Récupérer le message d'erreur du backend si disponible
      const errorMessage = error.response?.data?.message || 
                         error.response?.data?.error || 
                         error.message || 
                         'Une erreur est survenue lors de la mise à jour';
      
      // Log détaillé pour le débogage
      console.log('Détails de l\'erreur:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: errorMessage
      });

      throw new Error(errorMessage);
    }
  },

  deleteConcession: async (id: string): Promise<DeleteConcessionResponseDTO> => {
    try {
      const response = await api.delete(`/concessions/${id}`);
      return {
        success: true,
        message: 'Concession supprimée avec succès'
      };
    } catch (error: any) {
      console.error('Erreur de suppression de concession:', error.response?.data, error);
      
      if (error.response?.data?.error) {
        return {
          success: false,
          message: error.response.data.error.message || 
                   (error.response.data.error.code === 'CONCESSION_HAS_MOTORCYCLES' 
                    ? `Impossible de supprimer la concession car elle possède des motos.` 
                    : 'Erreur lors de la suppression de la concession'),
          error: {
            code: error.response.data.error.code,
            details: error.response.data.error.details
          }
        };
      }
      
      // Erreur par défaut si la structure n'est pas celle attendue
      return {
        success: false,
        message: 'Impossible de supprimer la concession',
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          details: error.message
        }
      };
    }
  }
};

export default api;
