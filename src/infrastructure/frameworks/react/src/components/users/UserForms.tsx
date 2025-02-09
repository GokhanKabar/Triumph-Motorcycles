import React, { useState, useEffect, FormEvent } from 'react';
import { UserFormDTO } from '../../../../../../application/user/dtos/UserDTO';
import User from '../../../../../../domain/user/entities/User';
import { ValidationService } from "@infrastructure/services/ValidationService";
import { UserRole } from "@domain/enums/UserRole";
import { toast } from 'react-toastify';

interface UserFormProps {
  open: boolean;
  user?: User;
  onClose: () => void;
  onSubmit: (data: UserFormDTO) => Promise<void>;
}

interface UserFormState {
  formData: UserFormDTO;
  errors: Record<keyof UserFormDTO, string>;
  isSubmitting: boolean;
}

const UserForm: React.FC<UserFormProps> = ({ open, user, onClose, onSubmit }) => {
  const validationService = new ValidationService();

  const createInitialState = (existingUser?: User): UserFormState => ({
    formData: existingUser
      ? {
          id: existingUser.id,
          firstName: existingUser.firstName,
          lastName: existingUser.lastName,
          email: existingUser.email,
          role: existingUser.role,
          password: ''
        }
      : {
          id: undefined,
          firstName: '',
          lastName: '',
          email: '',
          password: '',
          role: UserRole.USER
        },
    errors: {
      id: '',
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      role: ''
    },
    isSubmitting: false
  });

  const [state, setState] = useState<UserFormState>(createInitialState(user));

  useEffect(() => {
    setState(createInitialState(user));
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setState(prev => ({
      ...prev,
      formData: {
        ...prev.formData,
        [name]: value
      },
      errors: {
        ...prev.errors,
        [name]: ''
      }
    }));
  };

  const validateForm = async (): Promise<boolean> => {
    try {
      const validationType = user ? 'updateUser' : 'createUser';
      await validationService.validate(state.formData, validationType);
      return true;
    } catch (error: any) {
      if (error.errors) {
        const newErrors: Record<keyof UserFormDTO, string> = {
          id: '',
          firstName: '',
          lastName: '',
          email: '',
          password: '',
          role: ''
        };

        error.errors.forEach((err: string) => {
          if (err.includes('firstName')) newErrors.firstName = err;
          if (err.includes('lastName')) newErrors.lastName = err;
          if (err.includes('email')) newErrors.email = err;
          if (err.includes('password')) newErrors.password = err;
          if (err.includes('role')) newErrors.role = err;
        });

        setState(prev => ({
          ...prev,
          errors: newErrors
        }));
      }
      return false;
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setState(prev => ({ ...prev, isSubmitting: true }));

    try {
      const isValid = await validateForm();
      if (isValid) {
        await onSubmit(state.formData);
        onClose();
      }
    } catch (error) {
      toast.error("Erreur lors de l'envoi du formulaire.");
    } finally {
      setState(prev => ({ ...prev, isSubmitting: false }));
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/70 backdrop-blur-sm">
      <form 
        onSubmit={handleSubmit} 
        className="w-full max-w-md p-8 mx-auto space-y-6 bg-white shadow-xl rounded-2xl"
        aria-labelledby="user-form-title"
      >
        <h2 
          id="user-form-title" 
          className="mb-6 text-2xl font-bold text-center text-gray-800"
        >
          {user ? 'Update User' : 'Create User'}
        </h2>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label 
              htmlFor="firstName" 
              className="block text-sm font-semibold text-gray-700"
            >
              First Name
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={state.formData.firstName}
              onChange={handleChange}
              required
              aria-required="true"
              className={`
                w-full px-4 py-2.5 border-2 rounded-lg transition-colors duration-200
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                ${state.errors.firstName ? 'border-red-600 text-red-700 bg-red-50' : 'border-gray-300 hover:border-gray-400 bg-white'}
              `}
              aria-invalid={!!state.errors.firstName}
              aria-describedby={state.errors.firstName ? "firstName-error" : undefined}
            />
            {state.errors.firstName && (
              <span 
                id="firstName-error" 
                className="text-sm font-medium text-red-600"
                role="alert"
              >
                {state.errors.firstName}
              </span>
            )}
          </div>

          <div className="space-y-1.5">
            <label 
              htmlFor="lastName" 
              className="block text-sm font-semibold text-gray-700"
            >
              Last Name
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={state.formData.lastName}
              onChange={handleChange}
              required
              aria-required="true"
              className={`
                w-full px-4 py-2.5 border-2 rounded-lg transition-colors duration-200
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                ${state.errors.lastName ? 'border-red-600 text-red-700 bg-red-50' : 'border-gray-300 hover:border-gray-400 bg-white'}
              `}
              aria-invalid={!!state.errors.lastName}
              aria-describedby={state.errors.lastName ? "lastName-error" : undefined}
            />
            {state.errors.lastName && (
              <span 
                id="lastName-error" 
                className="text-sm font-medium text-red-600"
                role="alert"
              >
                {state.errors.lastName}
              </span>
            )}
          </div>

          <div className="space-y-1.5">
            <label 
              htmlFor="email" 
              className="block text-sm font-semibold text-gray-700"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={state.formData.email}
              onChange={handleChange}
              required
              aria-required="true"
              className={`
                w-full px-4 py-2.5 border-2 rounded-lg transition-colors duration-200
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                ${state.errors.email ? 'border-red-600 text-red-700 bg-red-50' : 'border-gray-300 hover:border-gray-400 bg-white'}
              `}
              aria-invalid={!!state.errors.email}
              aria-describedby={state.errors.email ? "email-error" : undefined}
            />
            {state.errors.email && (
              <span 
                id="email-error" 
                className="text-sm font-medium text-red-600"
                role="alert"
              >
                {state.errors.email}
              </span>
            )}
          </div>

          {!user && (
            <div className="space-y-1.5">
              <label 
                htmlFor="password" 
                className="block text-sm font-semibold text-gray-700"
              >
                Mot de passe
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={state.formData.password}
                onChange={handleChange}
                required
                aria-required="true"
                className={`
                  w-full px-4 py-2.5 border-2 rounded-lg transition-colors duration-200
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                  ${state.errors.password ? 'border-red-600 text-red-700 bg-red-50' : 'border-gray-300 hover:border-gray-400 bg-white'}
                `}
                aria-invalid={!!state.errors.password}
                aria-describedby={state.errors.password ? "password-error" : undefined}
              />
              {state.errors.password && (
                <span 
                  id="password-error" 
                  className="text-sm font-medium text-red-600"
                  role="alert"
                >
                  {state.errors.password}
                </span>
              )}
            </div>
          )}

          <div className="space-y-1.5">
            <label 
              htmlFor="role" 
              className="block text-sm font-semibold text-gray-700"
            >
              Role
            </label>
            <select
              id="role"
              name="role"
              value={state.formData.role}
              onChange={handleChange}
              required
              aria-required="true"
              className={`
                w-full px-4 py-2.5 border-2 rounded-lg transition-colors duration-200
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                ${state.errors.role ? 'border-red-600 text-red-700 bg-red-50' : 'border-gray-300 hover:border-gray-400 bg-white'}
                appearance-none
              `}
              aria-invalid={!!state.errors.role}
              aria-describedby={state.errors.role ? "role-error" : undefined}
            >
              {Object.values(UserRole).map((role: UserRole) => (
                <option key={role.toString()} value={role} className="py-1">
                  {role}
                </option>
              ))}
            </select>
            {state.errors.role && (
              <span 
                id="role-error" 
                className="text-sm font-medium text-red-600"
                role="alert"
              >
                {state.errors.role}
              </span>
            )}
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <button 
            type="button" 
            onClick={onClose}
            className="
              w-full py-2.5 px-4 rounded-lg transition-colors duration-200
              bg-gray-100 text-gray-700 font-semibold border-2 border-gray-300
              hover:bg-gray-200 hover:border-gray-400
              focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={state.isSubmitting}
            className={`
              w-full py-2.5 px-4 rounded-lg font-semibold transition-colors duration-200
              ${state.isSubmitting 
                ? 'bg-blue-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
              }
              text-white
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
              disabled:opacity-50
            `}
            aria-busy={state.isSubmitting}
          >
            {state.isSubmitting ? 'Processing...' : (user ? 'Update User' : 'Create User')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserForm;