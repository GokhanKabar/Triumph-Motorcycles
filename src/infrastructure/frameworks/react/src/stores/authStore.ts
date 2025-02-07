import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  name: string;
  role?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (userData: User, token: string) => void;
  logout: () => void;
  debugAuthState: () => AuthState;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (userData, token) => {
        console.log('DEBUG: Login called with', { 
          userData: userData ? { 
            id: userData.id, 
            email: userData.email, 
            role: userData.role 
          } : null, 
          token: token ? 'Token present' : 'No token' 
        });

        // Vérifier et stocker explicitement dans localStorage
        try {
          localStorage.setItem('debug-token', token || 'NO_TOKEN');
        } catch (error) {
          console.error('DEBUG: Error storing token in localStorage', error);
        }

        set({ 
          user: userData, 
          token, 
          isAuthenticated: !!token 
        });
      },
      logout: () => {
        console.log('DEBUG: Logout called');
        
        // Réinitialise le state Zustand
        set({ 
          user: null, 
          token: null, 
          isAuthenticated: false 
        });
        
        // Supprime explicitement le localStorage
        try {
          localStorage.removeItem('auth-storage');
          localStorage.removeItem('debug-token');
        } catch (error) {
          console.error('DEBUG: Error removing token from localStorage', error);
        }
      },
      debugAuthState: () => {
        const state = get();
        const storedToken = localStorage.getItem('debug-token');
        
        console.log('DEBUG: Auth Store State', {
          user: state.user ? { 
            id: state.user.id, 
            email: state.user.email, 
            role: state.user.role 
          } : null,
          token: state.token ? 'Token present' : 'No token',
          storedToken: storedToken,
          isAuthenticated: state.isAuthenticated
        });
        return state;
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);
