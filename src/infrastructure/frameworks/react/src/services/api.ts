import axios from "axios";
import { CompanyMotorcycleDTO } from "@/application/companyMotorcycle/dtos/CompanyMotorcycleDTO";
import { useAuthStore } from "@stores/authStore";
import {
  CreateUserDTO,
  UserResponseDTO,
  UpdateUserDTO,
  PasswordUpdateRequest,
  PasswordUpdateResponse,
} from "@application/user/dtos/UserDTO";
import {
  CreateCompanyDTO,
  UpdateCompanyDTO,
  CompanyResponseDTO,
} from "@application/dtos/CompanyDTO";
import {
  CreateConcessionDTO,
  UpdateConcessionDTO,
  ConcessionResponseDTO,
} from "@application/dtos/ConcessionDTO";
import {
  CreateMaintenanceDTO,
  MaintenanceResponseDTO,
} from "@/application/dtos/MaintenanceDTO";
import {
  CreateInventoryPartDTO,
  InventoryPartResponseDTO,
} from "@/application/dtos/InventoryPartDTO";
import {
  CreateDriverDTO,
  DriverDTO,
} from "@/application/driver/dtos/DriverDTO";
import {
  CreateMotorcycleDTO,
  UpdateMotorcycleDTO,
  MotorcycleResponseDTO,
} from "@/application/dtos/MotorcycleDTO";

const API_BASE_URL = "http://localhost:3001/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Intercepteur pour ajouter le token à chaque requête
api.interceptors.request.use(
  (config) => {
    // Récupérer directement depuis le localStorage
    const storedAuth = localStorage.getItem("auth-storage");
    const parsedAuth = storedAuth ? JSON.parse(storedAuth) : null;
    const token = parsedAuth?.state?.token;

    console.log("DEBUG: Interceptor Request", {
      url: config.url,
      method: config.method,
      token: token ? "Token present" : "No token",
      parsedAuth: parsedAuth,
    });

    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
      console.log("DEBUG: Added Authorization header to request", {
        url: config.url,
        method: config.method,
      });
    } else {
      console.warn("DEBUG: No token found in auth store", {
        url: config.url,
        method: config.method,
      });
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs d'authentification
api.interceptors.response.use(
  (response) => {
    console.log("DEBUG: Response Interceptor", {
      url: response.config.url,
      method: response.config.method,
      status: response.status,
      data: response.data,
    });
    return response;
  },
  (error) => {
    console.error("DEBUG: Response Interceptor Error", {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      headers: error.config?.headers,
    });

    if (error.response && error.response.status === 401) {
      // Déconnexion automatique en cas d'erreur d'authentification
      console.warn("DEBUG: Unauthorized - Logging out");
      useAuthStore.getState().logout();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export interface AuthResponse {
  token: string;
  user: UserResponseDTO;
}

export const authService = {
  login: async (email: string, password: string) => {
    try {
      const response = await api.post("/auth/login", { email, password });
      const { user, token } = response.data;
      useAuthStore.getState().login(user, token);
      return { user, token };
    } catch (error) {
      console.error("Login failed", error);
      throw error;
    }
  },

  logout: () => {
    useAuthStore.getState().logout();
  },

  getCurrentUser: (): UserResponseDTO | null => {
    const user = useAuthStore.getState().user;
    return user;
  },

  isAuthenticated: (): boolean => {
    return !!useAuthStore.getState().token;
  },
};

export const userService = {
  createUser: async (userData: CreateUserDTO): Promise<UserResponseDTO> => {
    const response = await api.post<UserResponseDTO>("/users", userData);
    return response.data;
  },

  updateUser: async (
    id: string,
    userData: Partial<UpdateUserDTO>
  ): Promise<UserResponseDTO> => {
    // Supprimer les champs de mot de passe s'ils sont présents
    const dataToUpdate: Partial<UpdateUserDTO> = { ...userData };

    delete dataToUpdate.currentPassword;
    delete dataToUpdate.newPassword;

    const response = await api.put<UserResponseDTO>(
      `/users/${id}`,
      dataToUpdate
    );
    return response.data;
  },

  getUsers: async (): Promise<UserResponseDTO[]> => {
    const response = await api.get<UserResponseDTO[]>("/users/all");
    return response.data;
  },

  deleteUser: async (
    id: string
  ): Promise<{ message: string; userId: string }> => {
    try {
      const response = await api.delete<{ message: string; userId: string }>(
        `/users/${id}`
      );

      // Déconnexion uniquement si l'utilisateur supprimé est l'utilisateur connecté
      const currentUser = useAuthStore.getState().user;
      if (currentUser && currentUser.id === id) {
        useAuthStore.getState().logout();
      }

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.message ||
          "Une erreur est survenue lors de la suppression du compte.";
        throw new Error(errorMessage);
      }
      throw error;
    }
  },

  createAdminUser: async (
    userData: CreateUserDTO
  ): Promise<UserResponseDTO> => {
    const response = await api.post<UserResponseDTO>("/users/admin", userData);
    return response.data;
  },

  // Méthode pour réinitialiser le mot de passe par un administrateur
  resetUserPasswordByAdmin: async (
    userId: string,
    password: string
  ): Promise<{ message: string }> => {
    try {
      const response = await api.post<{ message: string }>(
        `/users/reset-password/${userId}`,
        {
          password,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error resetting user password", error);
      throw error;
    }
  },

  // Méthode pour mettre à jour le mot de passe par l'utilisateur lui-même
  updateUserPassword: async (
    currentPassword: string,
    password: string
  ): Promise<{ message: string }> => {
    try {
      const response = await api.put<{ message: string }>(
        "/users/update-password",
        {
          currentPassword,
          password,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error updating user password", error);
      throw error;
    }
  },

  // Méthode pour demander un lien de réinitialisation de mot de passe
  requestPasswordResetLink: async (
    email: string
  ): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>(
      "/users/request-password-reset",
      { email }
    );
    return response.data;
  },

  // Méthode pour réinitialiser le mot de passe à partir d'un lien de réinitialisation
  resetPasswordFromLink: async (
    token: string,
    newPassword: string
  ): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>(
      "/users/reset-password-from-link",
      { token, newPassword }
    );
    return response.data;
  },
};

export const companyService = {
  getCompanies(): Promise<CompanyResponseDTO[]> {
    return api.get("/companies").then((response) => response.data);
  },

  getCompany(id: string): Promise<CompanyResponseDTO> {
    return api.get(`/companies/${id}`).then((response) => response.data);
  },

  createCompany(company: CreateCompanyDTO): Promise<CompanyResponseDTO> {
    return api.post("/companies", company).then((response) => response.data);
  },

  updateCompany(
    id: string,
    company: UpdateCompanyDTO
  ): Promise<CompanyResponseDTO> {
    return api
      .put(`/companies/${id}`, company)
      .then((response) => response.data);
  },

  async deleteCompany(id: string): Promise<{ message: string }> {
    try {
      const response = await api.delete(`/companies/${id}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error("Une erreur est survenue lors de la suppression de l'entreprise");
    }
  },

  getAllCompanies(): Promise<CompanyResponseDTO[]> {
    try {
      console.log("DEBUG: Calling getAllCompanies API");
      return api.get("/companies").then((response) => {
        console.log("DEBUG: getAllCompanies API Response", {
          status: response.status,
          dataType: typeof response.data,
          dataLength: response.data ? response.data.length : "No data",
          firstCompany:
            response.data && response.data.length > 0
              ? {
                  id: response.data[0].id,
                  name: response.data[0].name,
                }
              : null,
        });
        return response.data;
      });
    } catch (error) {
      console.error("DEBUG: Error in getAllCompanies", {
        errorMessage: error.message,
        errorResponse: error.response
          ? {
              status: error.response.status,
              data: error.response.data,
            }
          : "No response",
      });
      throw error;
    }
  },
};

export const motorcycleService = {
  getMotorcycles: async (): Promise<MotorcycleResponseDTO[]> => {
    const response = await api.get("/motorcycles");
    return response.data;
  },

  getMotorcycle: async (id: string): Promise<MotorcycleResponseDTO> => {
    const response = await api.get(`/motorcycles/${id}`);
    return response.data;
  },

  createMotorcycle: async (
    data: CreateMotorcycleDTO
  ): Promise<MotorcycleResponseDTO> => {
    const response = await api.post("/motorcycles", data);
    return response.data;
  },

  updateMotorcycle: async (
    id: string,
    data: UpdateMotorcycleDTO
  ): Promise<MotorcycleResponseDTO> => {
    const response = await api.put(`/motorcycles/${id}`, data);
    return response.data;
  },

  deleteMotorcycle: async (id: string): Promise<{ message: string }> => {
    try {
      await api.delete(`/motorcycles/${id}`);
      return { message: "Moto supprimée avec succès" };
    } catch (error) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  },

  getAllMotorcycles: async (): Promise<MotorcycleResponseDTO[]> => {
    try {
      const response = await api.get<MotorcycleResponseDTO[]>("/motorcycles");
      return response.data;
    } catch (error) {
      console.error("Error getting all motorcycles", error);
      throw error;
    }
  },
};

export const concessionService = {
  getConcessions(): Promise<ConcessionResponseDTO[]> {
    return api.get("/concessions").then((response) => response.data);
  },

  getConcession(id: string): Promise<ConcessionResponseDTO> {
    return api.get(`/concessions/${id}`).then((response) => response.data);
  },

  createConcession(
    concession: CreateConcessionDTO
  ): Promise<ConcessionResponseDTO> {
    return api
      .post("/concessions", concession)
      .then((response) => response.data);
  },

  updateConcession(
    id: string,
    concession: UpdateConcessionDTO
  ): Promise<ConcessionResponseDTO> {
    return api
      .put(`/concessions/${id}`, concession)
      .then((response) => response.data);
  },

  deleteConcession(id: string): Promise<{ message: string }> {
    return api
      .delete(`/concessions/${id}`)
      .then((response) => response.data)
      .catch((error) => {
        if (error.response?.data?.message) {
          throw new Error(error.response.data.message);
        }
        throw error;
      });
  },
};

export interface MaintenanceDTO {
  id: string;
  motorcycleId: string;
  type: string;
  scheduledDate: Date;
  status: string;
  mileageAtMaintenance: number;
  technicianNotes?: string;
  replacedParts?: string[];
  totalCost?: number;
  nextMaintenanceRecommendation?: Date;
  actualDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export const maintenanceService = {
  createMaintenance: async (
    maintenanceData: CreateMaintenanceDTO
  ): Promise<MaintenanceDTO> => {
    try {
      console.log("Envoi des données de maintenance:", maintenanceData);
      const response = await api.post<MaintenanceDTO>(
        "/maintenances",
        maintenanceData
      );
      console.log("Réponse de création de maintenance:", response.data);
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la création de maintenance:", error);
      throw error;
    }
  },

  completeMaintenance(
    maintenanceId: string,
    completionDetails: any
  ): Promise<MaintenanceDTO> {
    return api
      .patch(`/maintenances/${maintenanceId}/complete`, completionDetails)
      .then((response) => response.data);
  },

  completeMaintenanceWithDetails(
    maintenanceId: string,
    maintenanceData: CompleteMaintenanceDTO
  ): Promise<MaintenanceResponseDTO> {
    return api
      .patch(`/maintenances/${maintenanceId}/complete`, maintenanceData)
      .then(async (response) => {
        // Récupérer les informations de la moto pour la maintenance
        try {
          const motorcycleResponse = await api.get(
            `/motorcycles/${response.data.motorcycleId}`
          );
          return {
            ...response.data,
            motorcycle: motorcycleResponse.data,
          };
        } catch (error) {
          console.error(
            `Erreur lors de la récupération des détails de la moto ${response.data.motorcycleId}:`,
            error
          );
          return response.data;
        }
      })
      .catch((error) => {
        console.error("Erreur lors de la complétion de maintenance:", error);
        throw error;
      });
  },

  getDueMaintenances(): Promise<MaintenanceDTO[]> {
    return api.get("/maintenances/due").then((response) => response.data);
  },

  getAllMaintenances: async (): Promise<MaintenanceResponseDTO[]> => {
    try {
      console.log(
        "DEBUG: Tentative de récupération de toutes les maintenances"
      );
      const response = await api.get<MaintenanceResponseDTO[]>(
        "/maintenances/all"
      );

      // Récupérer les détails de chaque moto
      const maintenancesWithMotorcycles = await Promise.all(
        response.data.map(async (maintenance) => {
          if (maintenance.motorcycleId) {
            try {
              const motorcycleResponse = await api.get(
                `/motorcycles/${maintenance.motorcycleId}`
              );
              return {
                ...maintenance,
                motorcycle: motorcycleResponse.data,
              };
            } catch (error) {
              console.error(
                `Erreur lors de la récupération de la moto ${maintenance.motorcycleId}:`,
                error
              );
              return maintenance;
            }
          }
          return maintenance;
        })
      );

      console.log(
        "DEBUG: Maintenances récupérées avec détails de moto",
        maintenancesWithMotorcycles
      );
      return maintenancesWithMotorcycles;
    } catch (error) {
      console.error(
        "Erreur lors de la récupération de toutes les maintenances:",
        error
      );
      throw error;
    }
  },

  deleteMaintenance(maintenanceId: string): Promise<void> {
    return api
      .delete(`/maintenances/${maintenanceId}`)
      .then((response) => response.data);
  },

  updateMaintenance: async (
    maintenanceId: string,
    maintenanceData: CreateMaintenanceDTO
  ) => {
    try {
      const response = await api.put(
        `/maintenances/${maintenanceId}`,
        maintenanceData
      );
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la maintenance:", error);
      throw error;
    }
  },

  createMaintenanceWithDetails(
    maintenanceData: CreateMaintenanceDTO
  ): Promise<MaintenanceResponseDTO> {
    return api
      .post("/maintenances", maintenanceData)
      .then(async (response) => {
        try {
          const motorcycleResponse = await api.get(
            `/motorcycles/${response.data.motorcycleId}`
          );
          return {
            ...response.data,
            motorcycle: motorcycleResponse.data,
          };
        } catch (error) {
          console.error(
            `Erreur lors de la récupération des détails de la moto ${response.data.motorcycleId}:`,
            error
          );
          return response.data;
        }
      })
      .catch((error) => {
        console.error("Erreur lors de la création de maintenance:", error);
        throw error;
      });
  },

  deleteMaintenanceWithDetails(
    maintenanceId: string
  ): Promise<MaintenanceResponseDTO> {
    return api
      .delete(`/maintenances/${maintenanceId}`)
      .then((response) => response.data)
      .catch((error) => {
        console.error("Erreur lors de la suppression de maintenance:", error);
        throw error;
      });
  },

  updateMaintenanceWithDetails(
    maintenanceId: string,
    maintenanceData: CreateMaintenanceDTO
  ): Promise<MaintenanceResponseDTO> {
    return api
      .patch(`/maintenances/${maintenanceId}`, maintenanceData)
      .then(async (response) => {
        try {
          const motorcycleResponse = await api.get(
            `/motorcycles/${response.data.motorcycleId}`
          );
          return {
            ...response.data,
            motorcycle: motorcycleResponse.data,
          };
        } catch (error) {
          console.error(
            `Erreur lors de la récupération des détails de la moto ${response.data.motorcycleId}:`,
            error
          );
          return response.data;
        }
      })
      .catch((error) => {
        console.error("Erreur lors de la mise à jour de maintenance:", error);
        throw error;
      });
  },
};

export const inventoryPartService = {
  async createInventoryPart(
    partData: CreateInventoryPartDTO
  ): Promise<InventoryPartResponseDTO> {
    try {
      console.log("DEBUG: Creating inventory part", {
        partData,
        token: useAuthStore.getState().token,
      });
      const response = await api.post("/inventory-parts", partData);
      console.log("DEBUG: Create inventory part response", response.data);
      return response.data;
    } catch (error) {
      console.error("DEBUG: Error creating inventory part", error);
      throw error;
    }
  },

  async updateInventoryPart(
    partId: string,
    partData: Partial<CreateInventoryPartDTO>
  ): Promise<InventoryPartResponseDTO> {
    try {
      console.log("DEBUG: Updating inventory part", {
        partId,
        partData,
        token: useAuthStore.getState().token,
      });
      const response = await api.put(`/inventory-parts/${partId}`, partData);
      console.log("DEBUG: Update inventory part response", response.data);
      return response.data;
    } catch (error) {
      console.error("DEBUG: Error updating inventory part", error);
      throw error;
    }
  },

  async manageInventoryStock(
    partId: string,
    quantity: number,
    action: "add" | "remove"
  ): Promise<InventoryPartResponseDTO> {
    try {
      console.log("DEBUG: Managing inventory stock", {
        partId,
        quantity,
        action,
        token: useAuthStore.getState().token,
      });
      const response = await api.patch(`/inventory-parts/${partId}/stock`, {
        quantity,
        action,
      });
      console.log("DEBUG: Manage inventory stock response", response.data);
      return response.data;
    } catch (error) {
      console.error("DEBUG: Error managing inventory stock", error);
      throw error;
    }
  },

  async getAllInventoryParts(): Promise<InventoryPartResponseDTO[]> {
    try {
      console.log("DEBUG: Getting all inventory parts", {
        token: useAuthStore.getState().token,
      });
      const response = await api.get("/inventory-parts");
      console.log("DEBUG: Get all inventory parts response", response.data);
      return response.data;
    } catch (error) {
      console.error("DEBUG: Error getting all inventory parts", error);
      throw error;
    }
  },

  async deleteInventoryPart(
    partId: string
  ): Promise<{ message: string; id: string }> {
    try {
      console.log("DEBUG: Suppression de la pièce d'inventaire", {
        partId,
        token: useAuthStore.getState().token,
      });
      const response = await api.delete(`/inventory-parts/${partId}`);
      console.log("DEBUG: Suppression de la pièce réussie", response.data);
      return response.data;
    } catch (error) {
      console.error("DEBUG: Erreur lors de la suppression de la pièce", error);

      // Gérer différents types d'erreurs
      if (error.response) {
        // L'erreur vient du serveur
        if (error.response.status === 400) {
          throw new Error(
            "Impossible de supprimer une pièce avec du stock en inventaire"
          );
        } else if (error.response.status === 404) {
          throw new Error("Pièce d'inventaire non trouvée");
        }
      }

      throw error;
    }
  },
};

export const driverService = {
  async createDriver(driverData: CreateDriverDTO): Promise<DriverDTO> {
    const response = await api.post("/drivers", driverData);
    return response.data;
  },

  async getAllDrivers(): Promise<DriverDTO[]> {
    try {
      console.log("DEBUG: Calling getAllDrivers API");
      const response = await api.get("/drivers");

      console.log("DEBUG: getAllDrivers API Response", {
        status: response.status,
        dataType: typeof response.data,
        dataLength: response.data ? response.data.length : "No data",
        firstDriver:
          response.data && response.data.length > 0
            ? {
                id: response.data[0].id,
                firstName: response.data[0].firstName,
                lastName: response.data[0].lastName,
                licenseNumber: response.data[0].licenseNumber,
                licenseType: response.data[0].licenseType,
                status: response.data[0].status,
              }
            : null,
      });

      return response.data;
    } catch (error) {
      console.error("DEBUG: Error in getAllDrivers", {
        errorMessage: error.message,
        errorResponse: error.response
          ? {
              status: error.response.status,
              data: error.response.data,
            }
          : "No response",
      });
      throw error;
    }
  },

  async updateDriver(
    driverId: string,
    driverData: Partial<CreateDriverDTO>
  ): Promise<DriverDTO> {
    try {
      // Filtrer les champs vides
      const filteredDriverData = Object.fromEntries(
        Object.entries(driverData).filter(
          ([_, value]) => value !== "" && value !== null && value !== undefined
        )
      );

      const response = await api.put(
        `/drivers/${driverId}`,
        filteredDriverData
      );
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la mise à jour du conducteur:", error);
      throw error;
    }
  },

  async deleteDriver(driverId: string): Promise<void> {
    try {
      await api.delete(`/drivers/${driverId}`);
    } catch (error) {
      console.error("Erreur lors de la suppression du conducteur:", error);
      throw error;
    }
  },

  async assignMotorcycleToDriver(
    driverId: string,
    motorcycleId: string
  ): Promise<DriverDTO> {
    const response = await api.patch("/drivers/assign-motorcycle", {
      driverId,
      motorcycleId,
    });
    return response.data;
  },

  async recordDriverIncident(
    driverId: string,
    incidentDetails: any
  ): Promise<DriverDTO> {
    const response = await api.patch(`/drivers/record-incident`, {
      driverId,
      incident: incidentDetails,
    });
    return response.data;
  },

  async changeDriverStatus(
    driverId: string,
    status: string
  ): Promise<DriverDTO> {
    try {
      const response = await api.patch(`/drivers/${driverId}/status`, {
        status,
      });
      return response.data;
    } catch (error) {
      console.error("Erreur lors du changement de statut:", error);
      throw error;
    }
  },
};

export const companyMotorcycleService = {
  async getCompanyMotorcycles(
    companyId: string
  ): Promise<CompanyMotorcycleDTO[]> {
    try {
      const response = await api.get(`/companies/${companyId}/motorcycles`);
      return response.data || [];
    } catch (error) {
      // Si c'est une erreur 404, retourner un tableau vide
      if (error.response?.status === 404) {
        return [];
      }
      // Sinon relancer l'erreur
      throw error;
    }
  },

  async assignMotorcycle(
    companyId: string,
    motorcycleId: string
  ): Promise<void> {
    try {
      const response = await api.post(`/companies/${companyId}/motorcycles`, {
        motorcycleId,
      });
      console.log("DEBUG: Successful motorcycle assignment:", response.data);
      return response.data;
    } catch (error) {
      console.error("Erreur lors de l'assignation de la moto:", error);
      if (error.response?.status === 404) {
        const errorMessage =
          error.response?.data?.error || "La moto ou l'entreprise n'existe pas";
        throw new Error(errorMessage);
      }
      throw error;
    }
  },

  async removeMotorcycle(
    companyId: string,
    motorcycleId: string
  ): Promise<void> {
    try {
      const response = await api.delete(
        `/companies/${companyId}/motorcycles/${motorcycleId}`
      );
      return response.data;
    } catch (error) {
      console.error("Erreur lors du retrait de la moto:", error);
      throw error;
    }
  },
};

export default api;
