import { useEffect, useState } from 'react';
import { dataPreloader } from '../services/offline/dataPreloader';
import { Loader2, Database, CheckCircle } from 'lucide-react';
import { Progress } from './ui/feedback/progress';

interface LoadingProgress {
    total: number;
    completed: number;
    current: string;
    percentage: number;
}

interface DataLoadingScreenProps {
    userId?: string;
    onComplete: () => void;
}

export function DataLoadingScreen({ userId, onComplete }: DataLoadingScreenProps) {
    const [progress, setProgress] = useState<LoadingProgress>({
        total: 0,
        completed: 0,
        current: 'Initializing...',
        percentage: 0,
    });
    const [isComplete, setIsComplete] = useState(false);

    useEffect(() => {
        let mounted = true;

        const loadData = async () => {
            // Check if data is already preloaded
            const isPreloaded = await dataPreloader.isDataPreloaded();
            
            if (isPreloaded) {
                console.log('✅ Data already preloaded, skipping...');
                if (mounted) {
                    setIsComplete(true);
                    setTimeout(() => onComplete(), 500);
                }
                return;
            }

            // Subscribe to progress updates
            const unsubscribe = dataPreloader.subscribeToProgress((prog) => {
                if (mounted) {
                    setProgress(prog);
                }
            });

            try {
                // Preload all data
                await dataPreloader.preloadAllData(userId);
                
                if (mounted) {
                    setIsComplete(true);
                    setTimeout(() => onComplete(), 1000);
                }
            } catch (error) {
                console.error('Failed to preload data:', error);
                // Still allow app to continue
                if (mounted) {
                    setTimeout(() => onComplete(), 1000);
                }
            } finally {
                unsubscribe();
            }
        };

        loadData();

        return () => {
            mounted = false;
        };
    }, [userId, onComplete]);

    return (
        <div className="fixed inset-0 bg-white dark:bg-gray-900 flex items-center justify-center z-50">
            <div className="max-w-md w-full px-6">
                <div className="text-center space-y-6">
                    {/* Icon */}
                    <div className="flex justify-center">
                        {isComplete ? (
                            <CheckCircle className="h-16 w-16 text-green-500 animate-pulse" />
                        ) : (
                            <Database className="h-16 w-16 text-blue-500 animate-pulse" />
                        )}
                    </div>

                    {/* Title */}
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            {isComplete ? 'Ready!' : 'Loading Data'}
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                            {isComplete 
                                ? 'All data loaded successfully'
                                : 'Preparing your data for offline use...'
                            }
                        </p>
                    </div>

                    {/* Progress */}
                    {!isComplete && (
                        <>
                            <div className="space-y-2">
                                <Progress value={progress.percentage} className="h-2" />
                                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                                    <span>{progress.current}</span>
                                    <span>{progress.percentage}%</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span>
                                    {progress.completed} of {progress.total} steps complete
                                </span>
                            </div>
                        </>
                    )}

                    {/* Info */}
                    <div className="text-xs text-gray-400 dark:text-gray-500">
                        This only happens once. Future loads will be instant.
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DataLoadingScreen;
