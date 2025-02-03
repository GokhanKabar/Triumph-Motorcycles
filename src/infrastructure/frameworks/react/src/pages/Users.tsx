import React, { useState } from 'react';
import UserList from '../components/users/UserList';
import UserForm from '../components/users/UserForms';
import { CreateUserDTO, UserResponseDTO, UpdateUserDTO } from '../../../../../application/user/dtos/UserDTO';
import { userService } from '../services/api';
import { authService } from '../services/api';


enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
  DEALER = 'DEALER',
  MANAGER = 'MANAGER'
}

interface SnackbarState {
  open: boolean;
  message: string;
  severity: 'success' | 'error';
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

  const handleSubmitUser = async (userData: CreateUserDTO | UpdateUserDTO) => {
    try {
      if (selectedUser?.id) {
        const updateData: UpdateUserDTO = {
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          role: userData.role
        };
        await userService.updateUser(selectedUser.id, updateData);
      } else {
        // Check if current user is an admin
        const currentUser = authService.getCurrentUser();
        const isAdmin = currentUser?.role === UserRole.ADMIN;
        
        // If admin, use admin create route with selected role
        // Otherwise, default to USER role
        if (isAdmin) {
          await userService.createAdminUser(userData as CreateUserDTO);
        } else {
          // Ensure non-admin users can only create standard users
          const standardUserData = {
            ...userData,
            role: UserRole.USER
          } as CreateUserDTO;
          await userService.createUser(standardUserData);
        }
      }
      
      setRefreshKey(prev => prev + 1);
      setSnackbar({
        open: true,
        message: `Utilisateur ${selectedUser ? 'modifié' : 'créé'} avec succès`,
        severity: 'success',
      });
      setOpenForm(false);
    } catch (error) {
      setSnackbar({
        open: true,
        message: `Erreur lors de ${selectedUser ? 'la modification' : 'la création'} de l'utilisateur`,
        severity: 'error',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl bg-white rounded-lg shadow-lg overflow-hidden">
        <header className="px-6 py-4 bg-blue-600">
          <h2 className="text-3xl font-semibold text-white">Gestion des utilisateurs</h2>
        </header>
        <div className="p-6">
          <div className="flex justify-end mb-6">
            <button
              onClick={handleCreateUser}
              className="flex items-center px-5 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors shadow-md"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
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
            key={refreshKey} // Ajout de la clé pour forcer le rafraîchissement
            onEdit={handleEditUser} 
            onDelete={handleDeleteUser} 
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
      </div>
    </div>
  );
}