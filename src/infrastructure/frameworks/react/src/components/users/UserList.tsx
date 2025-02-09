import React, { useState, useEffect, useCallback } from 'react';
import { userService } from '../../services/api';
import {
  IUserListProps,
  IUserListState,
  IUserListHandlers
} from '../../interfaces/components/IUserList';
import { UserResponseDTO } from '../../../../../../application/user/dtos/UserDTO';
import { UserRole } from "@domain/enums/UserRole";

const useUserListHandlers = (
  state: IUserListState,
  setState: React.Dispatch<React.SetStateAction<IUserListState>>,
  fetchUsers: () => Promise<void>
): IUserListHandlers => {
  const handleDeleteUser = async (userId: string) => {
    try {
      await userService.deleteUser(userId);
      fetchUsers();
    } catch (error) {
      setState(prevState => ({
        ...prevState,
        error: error instanceof Error ? error : new Error('Failed to delete user')
      }));
    }
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return 'bg-red-100 text-red-800';
      case UserRole.MANAGER:
        return 'bg-yellow-100 text-yellow-800';
      case UserRole.USER:
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return {
    handleDeleteUser,
    getRoleColor
  };
};

export default function UserList({ 
  onEdit, 
  onDelete, 
  refreshKey = 0 
}: IUserListProps & { 
  refreshKey?: number 
}) {
  const [state, setState] = useState<IUserListState>({
    users: [],
    isLoading: true,
    error: null
  });

  const fetchUsers = useCallback(async () => {
    setState(prevState => ({ ...prevState, isLoading: true }));
    try {
      console.log('DEBUG: Fetching users with refreshKey:', refreshKey);
      const users = await userService.getAllUsers();
      console.log('DEBUG: Users fetched:', users);
      setState({
        users,
        isLoading: false,
        error: null
      });
    } catch (error) {
      console.error('DEBUG: Error fetching users:', error);
      setState({
        users: [],
        isLoading: false,
        error: error instanceof Error ? error : new Error('Failed to fetch users')
      });
    }
  }, [refreshKey]);

  const { handleDeleteUser, getRoleColor } = useUserListHandlers(
    state, 
    setState, 
    fetchUsers
  );

  useEffect(() => {
    console.log('DEBUG: useEffect triggered with refreshKey:', refreshKey);
    fetchUsers();
  }, [fetchUsers, refreshKey]);

  const handleDelete = async (userId: string) => {
    await handleDeleteUser(userId);
    if (onDelete) {
      onDelete(userId);
    }
    fetchUsers();
  };

  const handleEditUser = async (user: UserResponseDTO) => {
    try {
      onEdit(user);
      fetchUsers();
    } catch (error) {
      console.error('Error editing user:', error);
      setState(prevState => ({
        ...prevState,
        error: error instanceof Error ? error : new Error('Failed to edit user')
      }));
    }
  };

  if (state.isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="text-center py-6 text-red-500">
        Error: {state.error.message}
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden bg-white rounded-lg shadow">
      {state.users.length === 0 ? (
        <div className="text-center py-6 text-gray-500">
          Aucun utilisateur trouvé
        </div>
      ) : (
        <div className="w-full overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rôle</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {state.users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {user.firstName} {user.lastName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleColor(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      onClick={() => handleEditUser(user)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      Modifier
                    </button>
                    <button 
                      onClick={() => handleDelete(user.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}