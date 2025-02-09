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
      const users = await userService.getAllUsers();
      setState({
        users,
        isLoading: false,
        error: null
      });
    } catch (error) {
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
      setState(prevState => ({
        ...prevState,
        error: error instanceof Error ? error : new Error('Failed to edit user')
      }));
    }
  };

  if (state.isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-b-2 border-gray-900 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="py-6 text-center text-red-500">
        Error: {state.error.message}
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden bg-white rounded-lg shadow">
      {state.users.length === 0 ? (
        <div className="py-6 text-center text-gray-500">
          Aucun utilisateur trouvé
        </div>
      ) : (
        <div className="w-full overflow-x-auto">
          <table className="w-full">
            <thead className="sticky top-0 bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Nom</th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Rôle</th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {state.users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                    {user.firstName} {user.lastName}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleColor(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                    <button 
                      onClick={() => handleEditUser(user)}
                      className="mr-4 text-indigo-600 hover:text-indigo-900"
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