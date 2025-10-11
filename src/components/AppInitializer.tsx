import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import DataLoadingScreen from './DataLoadingScreen';
import { dataPreloader } from '../services/offline/dataPreloader';

interface AppInitializerProps {
    children: ReactNode;
    userId?: string;
}

/**
 * App Initializer Component
 * 
 * Handles initial data preload before showing the app.
 * Shows loading screen on first load, then shows app immediately on subsequent loads.
 */
export function AppInitializer({ children, userId }: AppInitializerProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [isDataReady, setIsDataReady] = useState(false);

    useEffect(() => {
        const checkAndLoad = async () => {
            try {
                // Check if data is already preloaded
                const isPreloaded = await dataPreloader.isDataPreloaded();
                
                if (isPreloaded) {
                    // Data already exists, show app immediately
                    console.log('✅ Data already preloaded');
                    setIsDataReady(true);
                    setIsLoading(false);
                } else {
                    // Need to show loading screen
                    console.log('⏳ Data not preloaded, showing loading screen');
                    setIsLoading(true);
                }
            } catch (error) {
                console.error('Error checking preload status:', error);
                // Show app anyway to avoid blocking user
                setIsDataReady(true);
                setIsLoading(false);
            }
        };

        checkAndLoad();
    }, []);

    const handleLoadComplete = () => {
        setIsDataReady(true);
        setIsLoading(false);
    };

    // Show loading screen if data needs to be preloaded
    if (isLoading && !isDataReady) {
        return <DataLoadingScreen userId={userId} onComplete={handleLoadComplete} />;
    }

    // Show app
    return <>{children}</>;
}

export default AppInitializer;
