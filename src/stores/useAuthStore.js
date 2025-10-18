import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { adminAuthAPI, handleAPIError, setAdminSafariAuthToken } from '../services/api.js';

const useAuthStore = create(persist(
  (set, get) => ({
    // State
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,

    // Authentication Actions
    login: async (credentials) => {
      set({ isLoading: true, error: null });
      try {
        const response = await adminAuthAPI.login(credentials);
        const { user } = response.data; // Backend returns { data: { user: admin } }
        
        // For Safari/iOS, extract and store auth token from response
        if (response.token) {
          // Store Safari fallback token using centralized function
          setAdminSafariAuthToken(response.token);
        }
        
        set({ 
          user, 
          isAuthenticated: true, 
          isLoading: false 
        });
        
        return { success: true };
      } catch (error) {
        const errorMessage = handleAPIError(error);
        set({ 
          isLoading: false, 
          error: errorMessage,
          user: null,
          isAuthenticated: false 
        });
        return { success: false, error: errorMessage };
      }
    },

          logout: async () => {
        try {
          await adminAuthAPI.logout();
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          // Clear Safari/iOS fallback token
          if (typeof window !== 'undefined') {
            localStorage.removeItem('safari_admin_auth_token');
          }
          set({ 
            user: null, 
            isAuthenticated: false,
            error: null 
          });
        }
      },

      logoutAll: async () => {
        try {
          await adminAuthAPI.logoutAll();
        } catch (error) {
          console.error('Logout all error:', error);
        } finally {
          // Clear Safari/iOS fallback token
          if (typeof window !== 'undefined') {
            localStorage.removeItem('safari_admin_auth_token');
          }
          set({ 
            user: null, 
            isAuthenticated: false,
            error: null 
          });
        }
      },

      checkAuth: async () => {
        try {
          const response = await adminAuthAPI.getCurrentAdmin();
          set({ 
            user: response.data.user, // Backend returns { data: { user: admin } }
            isAuthenticated: true 
          });
        } catch (error) {
          // For now, just set as unauthenticated - disable refresh logic
          set({ 
            user: null, 
            isAuthenticated: false 
          });
        }
      },

    // Clear error
    clearError: () => set({ error: null }),
  }),
  {
    name: 'admin-auth',
    partialize: (state) => ({ 
      user: state.user, 
      isAuthenticated: state.isAuthenticated 
    })
  }
));

export default useAuthStore;