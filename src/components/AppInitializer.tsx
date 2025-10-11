import type { ReactNode } from 'react';

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
    // Just render the app immediately
    // The offline middleware will handle reading from IndexedDB
    // The preload happens after login (in Login.tsx)
    return <>{children}</>;
}

export default AppInitializer;
