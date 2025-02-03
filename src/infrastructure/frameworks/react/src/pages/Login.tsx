import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import { useAuthStore } from '../stores/authStore';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isPasswordUpdateModalOpen, setIsPasswordUpdateModalOpen] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const { user, token } = await authService.login(email, password);
      login(user, token);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Une erreur est survenue lors de la connexion');
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation côté client
    if (currentPassword.length < 8) {
      // toast.error('Le mot de passe actuel doit contenir au moins 8 caractères');
      return;
    }
    
    if (newPassword.length < 8) {
      // toast.error('Le nouveau mot de passe doit contenir au moins 8 caractères');
      return;
    }
    
    try {
      await authService.updateUserPassword(currentPassword, newPassword);
      
      // toast.success('Mot de passe mis à jour avec succès');
      
      // Réinitialiser les champs
      setCurrentPassword('');
      setNewPassword('');
      
      // Fermer le modal ou naviguer
      setIsPasswordUpdateModalOpen(false);
    } catch (error) {
      // Gestion des erreurs spécifiques
      if (error instanceof Error) {
        const errorMessage = error.message || 'Erreur lors de la mise à jour du mot de passe';
        // toast.error(errorMessage);
      } else {
        // toast.error('Une erreur inattendue est survenue');
      }
    }
  };

  return (
    <div className="h-screen w-screen bg-gray-900 flex items-center justify-center">
      <div className="w-full max-w-md bg-gray-800 p-8 rounded-xl shadow-lg">
        <div className="text-center mb-8">
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-white">
            Triumph Motorcycles
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            Gérez votre flotte de motos Triumph
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300">
              Adresse email
            </label>
            <div className="mt-2">
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="block w-full appearance-none rounded-md border border-gray-700 bg-gray-700 px-4 py-3 text-white placeholder-gray-400 focus:border-red-500 focus:outline-none focus:ring-red-500 sm:text-sm"
                placeholder="nom@entreprise.com"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300">
              Mot de passe
            </label>
            <div className="mt-2">
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="block w-full appearance-none rounded-md border border-gray-700 bg-gray-700 px-4 py-3 text-white placeholder-gray-400 focus:border-red-500 focus:outline-none focus:ring-red-500 sm:text-sm"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <a href="#" className="font-medium text-red-500 hover:text-red-400">
                Mot de passe oublié ?
              </a>
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-red-900/50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-400">{error}</p>
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            className="flex w-full justify-center rounded-md bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 transition-colors duration-200"
          >
            Se connecter
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-400">
          Triumph Motorcycles 2025
        </div>
      </div>
    </div>
  );
}
