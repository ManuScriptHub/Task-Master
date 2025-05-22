import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { loginUser, registerUser } from '../lib/api';
import { JWT_TOKEN_KEY } from '../lib/constants';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      
      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const response = await loginUser(credentials);
          const { token, user } = response;
          
          localStorage.setItem(JWT_TOKEN_KEY, token);
          
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null
          });
          
          return { success: true };
        } catch (error) {
          set({
            isLoading: false,
            error: error.message || 'Failed to login'
          });
          return { success: false, error: error.message };
        }
      },
      
      register: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await registerUser(userData);
          const { token, user } = response;
          
          localStorage.setItem(JWT_TOKEN_KEY, token);
          
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null
          });
          
          return { success: true };
        } catch (error) {
          set({
            isLoading: false,
            error: error.message || 'Failed to register'
          });
          return { success: false, error: error.message };
        }
      },
      
      logout: () => {
        localStorage.removeItem(JWT_TOKEN_KEY);
        
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null
        });
      },
      
      updateUser: (userData) => {
        set({
          user: { ...get().user, ...userData }
        });
      },
      
      clearError: () => {
        set({ error: null });
      }
    }),
    {
      name: 'auth-storage',
      getStorage: () => localStorage,
    }
  )
);

// Initialize auth from token if it exists
export const initializeAuth = async () => {
  const { isAuthenticated, token } = useAuthStore.getState();
  
  if (!isAuthenticated && token) {
    try {
      // Validate the token with a backend call
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api"}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const userData = await response.json();
        useAuthStore.setState({ 
          isAuthenticated: true,
          user: userData
        });
      } else {
        // Token is invalid, clear it
        localStorage.removeItem(JWT_TOKEN_KEY);
        useAuthStore.setState({ 
          token: null,
          user: null,
          isAuthenticated: false
        });
      }
    } catch (error) {
      console.error("Failed to validate token:", error);
      // Don't clear the token on network errors, as it might be valid
      // but the server might be temporarily unavailable
    }
  }
};