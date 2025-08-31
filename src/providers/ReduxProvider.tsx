import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { Provider } from 'react-redux';
import store from '../store';
import authService from '../services/auth/authService';
import { fetchUserProfile } from '../store/slices/authSlice';

interface ReduxProviderProps {
  children: ReactNode;
}

/**
 * Redux Provider component that initializes auth state
 */
export const ReduxProvider = ({ children }: ReduxProviderProps) => {
  useEffect(() => {
    // Initialize authentication on app start
    const initAuth = async () => {
      try {
        // Set auth header if token exists
        authService.initializeAuth();
        
        // If authenticated, fetch the user profile
        if (authService.isAuthenticated()) {
          await store.dispatch(fetchUserProfile());
        }
      } catch (error) {
        console.error('Failed to initialize authentication:', error);
      }
    };
    
    initAuth();
  }, []);
  
  return <Provider store={store}>{children}</Provider>;
};
