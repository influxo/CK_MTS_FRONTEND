import { useOfflineStatus } from '../hooks/useOfflineStatus';
import { WifiOff, RefreshCw, CheckCircle, AlertCircle, Cloud } from 'lucide-react';
import { syncService } from '../services/offline/syncService';
import { toast } from 'sonner';

/**
 * Offline Indicator Component
 * Shows connection status and pending sync count
 */
export function OfflineIndicator() {
    const { isOnline, isSyncing, pendingMutations, lastSyncedAt, syncStatus } = useOfflineStatus();

    const handleManualSync = async () => {
        if (!isOnline) {
            toast.error('Cannot sync while offline');
            return;
        }

        try {
            await syncService.syncNow();
            toast.success('Sync completed');
        } catch (error: any) {
            toast.error('Sync failed: ' + error.message);
        }
    };

    // Don't show anything if online and no pending changes
    if (isOnline && pendingMutations === 0 && !isSyncing) {
        return null;
    }

    return (
        <div className="fixed bottom-4 right-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-3 flex items-center gap-3 min-w-[200px]">
                {/* Status Icon */}
                <div className="flex-shrink-0">
                    {!isOnline && (
                        <WifiOff className="h-5 w-5 text-orange-500" />
                    )}
                    {isOnline && isSyncing && (
                        <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />
                    )}
                    {isOnline && !isSyncing && pendingMutations > 0 && (
                        <AlertCircle className="h-5 w-5 text-yellow-500" />
                    )}
                    {isOnline && !isSyncing && pendingMutations === 0 && syncStatus === 'idle' && (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                </div>

                {/* Status Text */}
                <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {!isOnline && 'Offline Mode'}
                        {isOnline && isSyncing && 'Syncing...'}
                        {isOnline && !isSyncing && pendingMutations > 0 && 'Pending Changes'}
                        {isOnline && !isSyncing && pendingMutations === 0 && 'All Synced'}
                    </div>
                    {pendingMutations > 0 && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                            {pendingMutations} change{pendingMutations !== 1 ? 's' : ''} pending
                        </div>
                    )}
                    {lastSyncedAt && isOnline && pendingMutations === 0 && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                            Last synced: {new Date(lastSyncedAt).toLocaleTimeString()}
                        </div>
                    )}
                </div>

                {/* Manual Sync Button */}
                {isOnline && !isSyncing && pendingMutations > 0 && (
                    <button
                        onClick={handleManualSync}
                        className="flex-shrink-0 p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        title="Sync now"
                    >
                        <Cloud className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    </button>
                )}
            </div>
        </div>
    );
}

export default OfflineIndicator;
