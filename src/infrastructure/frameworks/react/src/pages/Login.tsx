import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authService.login({ email, password });
      
      // Vérifier que nous avons bien reçu les données nécessaires
      if (!response.token || !response.user) {
        throw new Error('Données de connexion invalides');
      }

      // Stocker les données dans le localStorage
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));

      // Vérifier que les données ont bien été stockées
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (!storedToken || !storedUser) {
        throw new Error('Erreur lors du stockage des données');
      }

      // Rediriger vers le dashboard
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la connexion');
      // En cas d'erreur, nettoyer le localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-900 border border-gray-700 shadow-lg rounded-2xl">
        <h2 className="text-3xl font-bold text-center text-gray-200">Connexion</h2>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400">Adresse email</label>
              <input
                type="email"
                required
                className="w-full px-4 py-3 mt-1 text-white placeholder-gray-500 bg-gray-800 border border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="Entrer votre email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400">Mot de passe</label>
              <input
                type="password"
                required
                className="w-full px-4 py-3 mt-1 text-white placeholder-gray-500 bg-gray-800 border border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="Entrer votre mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && <div className="text-sm text-center text-red-500">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 disabled:opacity-50"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
          <div className="text-sm text-center text-gray-500">
            Mot de passe oublié ? <span className="text-gray-600">Indisponible pour le moment</span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
