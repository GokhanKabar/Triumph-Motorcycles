import axios from "axios";
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
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercepteur pour gérer les erreurs d'authentification
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Déconnexion automatique en cas d'erreur d'authentification
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
  async getCompanies(): Promise<CompanyResponseDTO[]> {
    const response = await api.get("/companies");
    return response.data;
  },

  async getCompany(id: string): Promise<CompanyResponseDTO> {
    const response = await api.get(`/companies/${id}`);
    return response.data;
  },

  async createCompany(company: CreateCompanyDTO): Promise<CompanyResponseDTO> {
    const response = await api.post("/companies", company);
    return response.data;
  },

  async updateCompany(
    id: string,
    company: UpdateCompanyDTO
  ): Promise<CompanyResponseDTO> {
    const response = await api.put(`/companies/${id}`, company);
    return response.data;
  },

  async deleteCompany(id: string): Promise<{ message: string }> {
    const response = await api.delete(`/companies/${id}`);
    return response.data;
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
    return api.delete(`/concessions/${id}`).then((response) => response.data);
  },
};

export default api;
