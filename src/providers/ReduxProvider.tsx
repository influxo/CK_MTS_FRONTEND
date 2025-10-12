import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { Provider } from 'react-redux';
import store from '../store';
import authService from '../services/auth/authService';
import { fetchUserProfile, setCredentials, clearCredentials } from '../store/slices/authSlice';
import { getLastCachedAuth } from '../services/auth/offlineAuthService';
import { preloadDataForOffline } from '../pwa';

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

        // Helper: hydrate from cached auth (offline reload)
        const hydrateFromCache = async () => {
          const cached = await getLastCachedAuth();
          if (cached?.token && cached?.userData) {
            // Ensure axios has the token and Redux has the user
            localStorage.setItem('token', cached.token);
            try {
              const uid = (cached.userData as any)?.id || (cached.userData as any)?._id;
              if (uid) localStorage.setItem('userId', String(uid));
            } catch {}
            authService.setAuthHeader(cached.token);
            store.dispatch(setCredentials({ user: cached.userData as any, token: cached.token }));
          }
        };

        // If authenticated, try to fetch profile; on failure, use cache; if no cache, clear auth
        if (authService.isAuthenticated()) {
          const action: any = await store.dispatch(fetchUserProfile());
          if (action && typeof action.type === 'string' && action.type.endsWith('/fulfilled')) {
            // After successful profile fetch, kick off full preload when online
            try {
              const uid = (action.payload as any)?.id || (action.payload as any)?._id || localStorage.getItem('userId') || undefined;
              if (navigator.onLine) {
                await preloadDataForOffline(uid ? String(uid) : undefined);
              }
            } catch (e) {
              console.warn('Preload after profile failed:', e);
            }
          } else {
            const cached = await getLastCachedAuth();
            if (cached?.token && cached?.userData) {
              // hydrate from cache
              localStorage.setItem('token', cached.token);
              try {
                const uid = (cached.userData as any)?.id || (cached.userData as any)?._id;
                if (uid) localStorage.setItem('userId', String(uid));
              } catch {}
              authService.setAuthHeader(cached.token);
              store.dispatch(setCredentials({ user: cached.userData as any, token: cached.token }));
              // Try to preload as well (if online)
              try {
                const uid = (cached.userData as any)?.id || (cached.userData as any)?._id;
                if (navigator.onLine) {
                  await preloadDataForOffline(uid ? String(uid) : undefined);
                }
              } catch (e) {
                console.warn('Preload after cache hydration failed:', e);
              }
            } else {
              // no valid cache and profile failed -> clear stale token and creds
              try { localStorage.removeItem('token'); localStorage.removeItem('userId'); } catch {}
              store.dispatch(clearCredentials());
            }
          }
        } else {
          // No token in storage, attempt offline hydration
          await hydrateFromCache();
        }
      } catch (error) {
        console.error('Failed to initialize authentication:', error);
        // As a last resort, try to hydrate from cache
        try { await (async () => { const c = await getLastCachedAuth(); if (c?.token && c?.userData) { localStorage.setItem('token', c.token); authService.setAuthHeader(c.token); store.dispatch(setCredentials({ user: c.userData as any, token: c.token })); } })(); } catch {}
      }
    };
    
    initAuth();
  }, []);
  
  return <Provider store={store}>{children}</Provider>;
};
