import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { syncService } from '../services/offline/syncService';

interface AppInitializerProps {
    children: ReactNode;
    userId?: string;
}

/**
 * App Initializer Component
 * 
 * Simple wrapper - app works immediately with IndexedDB
 * No loading screen needed - data loads in background via middleware
 */
export function AppInitializer({ children }: AppInitializerProps) {
    // Initialize the offline sync service once
    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                await syncService.initialize();
                if (!mounted) return;
                const state = syncService.getState();
                console.log(`🛰️ Sync initialized. Online=${state.isOnline}, pending=${state.pendingMutations}`);
            } catch (err) {
                console.error('Failed to initialize sync service', err);
            }
        })();
        return () => {
            mounted = false;
            // We keep listeners for the lifetime of the app; no destroy on unmount of wrapper
        };
    }, []);

    // Render app immediately; data comes from IndexedDB via middleware and services
    return <>{children}</>;
}

export default AppInitializer;
