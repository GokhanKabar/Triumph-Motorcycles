import React, { useState, useEffect } from 'react';
import { UserRole } from '../../../../../../domain/enums/UserRole';
import { userService } from '../../services/api';
import {
  IUserListProps,
  IUserListState,
  IUserListHandlers,
  IPaginatedData
} from '../../interfaces/components/IUserList';

const initialState: IUserListState = {
  users: [],
  page: 0,
  rowsPerPage: 10
};

const useUserListHandlers = (
  state: IUserListState,
  setState: React.Dispatch<React.SetStateAction<IUserListState>>,
  onDelete: (userId: string) => void
): IUserListHandlers => {
  const handleChangePage = (newPage: number) => {
    setState(prev => ({ ...prev, page: newPage }));
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setState(prev => ({
      ...prev,
      rowsPerPage: newRowsPerPage,
      page: 0
    }));
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await userService.deleteUser(userId);
      onDelete(userId);
      const data = await userService.getUsers();
      setState(prev => ({ ...prev, users: data }));
    } catch (error) {
      console.error('Error deleting user:', error);
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
    handleChangePage,
    handleChangeRowsPerPage,
    handleDeleteUser,
    getRoleColor
  };
};

const getPaginatedData = (state: IUserListState): IPaginatedData => {
  const { users, page, rowsPerPage } = state;
  return {
    paginatedUsers: users.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    paginationConfig: {
      page,
      rowsPerPage,
      totalItems: users.length
    }
  };
};

export default function UserList({ onEdit, onDelete }: IUserListProps) {
  const [state, setState] = useState<IUserListState>(initialState);
  const handlers = useUserListHandlers(state, setState, onDelete);
  const { paginatedUsers, paginationConfig } = getPaginatedData(state);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await userService.getUsers();
        setState(prev => ({ ...prev, users: data }));
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    fetchUsers();
  }, []);

  return (
    <div className="w-full overflow-hidden bg-white rounded-lg shadow">
      <div className="w-full overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rôle</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date de création</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 whitespace-nowrap">
                  {user.firstName} {user.lastName}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">{user.email}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${handlers.getRoleColor(user.role)}`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => onEdit(user)}
                    className="text-blue-600 hover:text-blue-900 mr-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handlers.handleDeleteUser(user.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
        <div className="flex-1 flex justify-between sm:hidden">
          <button
            onClick={() => handlers.handleChangePage(paginationConfig.page - 1)}
            disabled={paginationConfig.page === 0}
            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Précédent
          </button>
          <button
            onClick={() => handlers.handleChangePage(paginationConfig.page + 1)}
            disabled={paginationConfig.page >= Math.ceil(paginationConfig.totalItems / paginationConfig.rowsPerPage) - 1}
            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Suivant
          </button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Affichage de{' '}
              <span className="font-medium">{paginationConfig.page * paginationConfig.rowsPerPage + 1}</span>{' '}
              à{' '}
              <span className="font-medium">
                {Math.min((paginationConfig.page + 1) * paginationConfig.rowsPerPage, paginationConfig.totalItems)}
              </span>{' '}
              sur{' '}
              <span className="font-medium">{paginationConfig.totalItems}</span>{' '}
              utilisateurs
            </p>
          </div>
          <div>
            <select
              value={paginationConfig.rowsPerPage}
              onChange={handlers.handleChangeRowsPerPage}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value={10}>10 par page</option>
              <option value={25}>25 par page</option>
              <option value={100}>100 par page</option>
            </select>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button
                onClick={() => handlers.handleChangePage(paginationConfig.page - 1)}
                disabled={paginationConfig.page === 0}
                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              >
                <span className="sr-only">Précédent</span>
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </button>
              <button
                onClick={() => handlers.handleChangePage(paginationConfig.page + 1)}
                disabled={paginationConfig.page >= Math.ceil(paginationConfig.totalItems / paginationConfig.rowsPerPage) - 1}
                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              >
                <span className="sr-only">Suivant</span>
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}
