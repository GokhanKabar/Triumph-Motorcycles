import React, { useState } from 'react';
import UserList from '../components/users/UserList';
import { CreateUserDTO, UserResponseDTO, UpdateUserDTO, UserFormDTO } from '@application/user/dtos/UserDTO';
import { userService } from '../services/api';
import { authService } from '../services/api';
import UserForm from '../components/users/UserForms';
import { UserRole } from '@domain/enums/UserRole';
import { toast } from 'react-toastify';
import { ToastPosition } from 'react-toastify/dist/types';
import axios from 'axios';
import api from '../services/api';

interface SnackbarState {
  open: boolean;
  message: string;
  severity: 'success' | 'error';
}

interface TempPasswordState {
  userId: string;
  password: string;
}

export default function Users() {
  const [openForm, setOpenForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserResponseDTO | undefined>();
  const [refreshKey, setRefreshKey] = useState(0); // Ajout d'une clé de rafraîchissement
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'success',
  });
  const [tempPassword, setTempPassword] = useState<TempPasswordState | null>(null);

  const handleCreateUser = () => {
    setSelectedUser(undefined);
    setOpenForm(true);
  };

  const handleEditUser = (user: UserResponseDTO) => {
    setSelectedUser(user);
    setOpenForm(true);
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const result = await userService.deleteUser(userId);
      
      setRefreshKey(prev => prev + 1); // Déclencher le rafraîchissement
      setSnackbar({
        open: true,
        message: result.message || 'Utilisateur supprimé avec succès',
        severity: 'success',
      });

      // Si l'utilisateur supprimé est l'utilisateur courant, rediriger vers la page de connexion
      const currentUser = authService.getCurrentUser();
      if (currentUser?.id === userId) {
        // Utiliser la navigation programmatique ou rediriger
        window.location.href = '/login';
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 
        'Erreur lors de la suppression de l\'utilisateur';
      
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error',
      });
    }
  };

  const handleResetPassword = async (userId: string) => {
    try {
      // Générer un mot de passe temporaire sécurisé
      const temporaryPassword = generateSecurePassword();
      
      await userService.resetUserPasswordByAdmin(userId, temporaryPassword);
      
      // Afficher le mot de passe temporaire à l'administrateur
      setTempPassword({
        userId,
        password: temporaryPassword
      });
      
      toast.success('Mot de passe réinitialisé avec succès', {
        position: 'top-center' as ToastPosition,
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    } catch (error) {
      toast.error('Erreur lors de la réinitialisation du mot de passe', {
        position: 'top-center' as ToastPosition,
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  };

  const handleSubmitUser = async (userData: UserFormDTO) => {
    try {
      if (selectedUser?.id) {
        const updateData: UpdateUserDTO = {
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          role: userData.role
        };
        await userService.updateUser(selectedUser.id, updateData);
        setRefreshKey(prev => prev + 1); // Trigger refresh
      } else {
        // Vérifier si l'utilisateur actuel est un admin
        const currentUser = authService.getCurrentUser();
        const isAdmin = currentUser?.role === UserRole.ADMIN;
        
        // Créer un utilisateur avec le mot de passe
        await userService.createAdminUser({
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          password: userData.password,
          role: userData.role || UserRole.ADMIN  // Use provided role or default to ADMIN
        });

        // Rafraîchir la liste des utilisateurs
        setRefreshKey(prev => prev + 1);
        
        // Réinitialiser le formulaire
        setSelectedUser(undefined);
        setOpenForm(false);
      }

    } catch (error) {
      // Log détaillé de l'erreur Axios
      if (axios.isAxiosError(error)) {
        // Message d'erreur personnalisé
        const errorMessage = error.response?.data?.message || 
          error.response?.data?.errors?.map((err: any) => err.message).join(', ') || 
          'Erreur lors de la création de l\'utilisateur';
        
        // Afficher les erreurs spécifiques pour chaque champ
        if (error.response?.data?.errors) {
          error.response.data.errors.forEach((err: any) => {
            toast.error(`${err.field}: ${err.message}`, {
              position: 'top-center' as ToastPosition,
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
            });
          });
        } else {
          toast.error(errorMessage, {
            position: 'top-center' as ToastPosition,
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
        }
      } else {
        // Erreur générique
        toast.error('Erreur lors de la création de l\'utilisateur', {
          position: 'top-center' as ToastPosition,
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      }
    }
  };

  // Fonction utilitaire pour générer un mot de passe sécurisé
  const generateSecurePassword = (): string => {
    const length = 12;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+';
    let password = '';
    
    // S'assurer d'avoir au moins un caractère de chaque type
    password += 'A1!'; // Majuscule, chiffre, caractère spécial
    
    for (let i = 3; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset[randomIndex];
    }
    
    // Mélanger le mot de passe
    return password.split('').sort(() => Math.random() - 0.5).join('');
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gray-100">
      <div className="w-full max-w-5xl overflow-hidden bg-white rounded-lg shadow-lg">
        <header className="px-6 py-4 bg-blue-600">
          <h2 className="text-3xl font-semibold text-white">Gestion des utilisateurs</h2>
        </header>
        <div className="p-6">
          <div className="flex justify-end mb-6">
            <button
              onClick={handleCreateUser}
              className="flex items-center px-5 py-2 text-white transition-colors bg-green-500 rounded-md shadow-md hover:bg-green-600"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
              Nouvel utilisateur
            </button>
          </div>
          <UserList 
            onEdit={handleEditUser}
            onDelete={handleDeleteUser}
            refreshKey={refreshKey}  // Pass refreshKey to UserList
          />
        </div>
        <UserForm
          open={openForm}
          user={selectedUser}
          onClose={() => setOpenForm(false)}
          onSubmit={handleSubmitUser}
        />
        {snackbar.open && (
          <div
            className={`fixed bottom-6 right-6 p-4 rounded-lg shadow-lg transition-transform transform ${
              snackbar.severity === 'success'
                ? 'bg-green-500 text-white'
                : 'bg-red-500 text-white'
            }`}
            role="alert"
          >
            <div className="flex items-center">
              <span className="mr-3 text-lg">
                {snackbar.severity === 'success' ? '✓' : '✕'}
              </span>
              <span className="flex-1">{snackbar.message}</span>
              <button
                onClick={() => setSnackbar({ ...snackbar, open: false })}
                className="ml-4 text-xl font-bold focus:outline-none"
              >
                &times;
              </button>
            </div>
          </div>
        )}
        {tempPassword && (
          <div
            className="fixed p-4 text-white transition-transform transform bg-blue-500 rounded-lg shadow-lg bottom-6 right-6"
            role="alert"
          >
            <div className="flex items-center">
              <span className="mr-3 text-lg">🔒</span>
              <span className="flex-1">Mot de passe temporaire pour l'utilisateur {tempPassword.userId} : {tempPassword.password}</span>
              <button
                onClick={() => setTempPassword(null)}
                className="ml-4 text-xl font-bold focus:outline-none"
              >
                &times;
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}