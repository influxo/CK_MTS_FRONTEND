/**
 * SyncStatusIndicator Component
 * 
 * Visual indicator showing online/offline status and sync progress
 * Can be placed in the app header or footer
 * 
 * Usage:
 *   import { SyncStatusIndicator } from '@/components/offline/SyncStatusIndicator'
 *   
 *   function Header() {
 *     return (
 *       <header>
 *         <h1>My App</h1>
 *         <SyncStatusIndicator />
 *       </header>
 *     )
 *   }
 */

import { useOfflineSync } from '../../hooks/useOfflineSync';
import { Wifi, WifiOff, Cloud, CloudOff, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button/button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '../ui/overlay/popover';
import { Badge } from '../ui/data-display/badge';

export function SyncStatusIndicator() {
    const {
        isOnline,
        isSyncing,
        pendingMutations,
        lastSyncedAt,
        syncStatus,
        errorMessage,
        syncNow,
        forceRefresh,
        clearCache,
    } = useOfflineSync();

    // Format last synced time
    const formatLastSync = (timestamp: string | null): string => {
        if (!timestamp) return 'Never';

        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;

        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours}h ago`;

        return date.toLocaleDateString();
    };

    // Get status icon and color
    const getStatusIcon = () => {
        if (!isOnline) {
            return <WifiOff className="w-4 h-4 text-orange-500" />;
        }

        if (isSyncing) {
            return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
        }

        if (syncStatus === 'error') {
            return <AlertCircle className="w-4 h-4 text-red-500" />;
        }

        if (pendingMutations > 0) {
            return <CloudOff className="w-4 h-4 text-yellow-500" />;
        }

        return <Cloud className="w-4 h-4 text-green-500" />;
    };

    const getStatusText = () => {
        if (!isOnline) return 'Offline';
        if (isSyncing) return 'Syncing...';
        if (syncStatus === 'error') return 'Sync error';
        if (pendingMutations > 0) return `${pendingMutations} pending`;
        return 'Online';
    };

    const getStatusColor = () => {
        if (!isOnline) return 'bg-orange-100 text-orange-700 border-orange-200';
        if (isSyncing) return 'bg-blue-100 text-blue-700 border-blue-200';
        if (syncStatus === 'error') return 'bg-red-100 text-red-700 border-red-200';
        if (pendingMutations > 0) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
        return 'bg-green-100 text-green-700 border-green-200';
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <button
                    className={`
            flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium
            transition-colors hover:opacity-80 border
            ${getStatusColor()}
          `}
                    aria-label="Sync status"
                >
                    {getStatusIcon()}
                    <span className="hidden sm:inline">{getStatusText()}</span>
                </button>
            </PopoverTrigger>

            <PopoverContent className="w-80" align="end">
                <div className="space-y-4">
                    <div>
                        <h3 className="font-semibold text-lg mb-2">Sync Status</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Connection:</span>
                                <span className="font-medium flex items-center gap-1">
                                    {isOnline ? (
                                        <>
                                            <Wifi className="w-3 h-3 text-green-600" />
                                            Online
                                        </>
                                    ) : (
                                        <>
                                            <WifiOff className="w-3 h-3 text-orange-600" />
                                            Offline
                                        </>
                                    )}
                                </span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-gray-600">Last synced:</span>
                                <span className="font-medium">{formatLastSync(lastSyncedAt)}</span>
                            </div>

                            {pendingMutations > 0 && (
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Pending changes:</span>
                                    <Badge variant="secondary">{pendingMutations}</Badge>
                                </div>
                            )}

                            {syncStatus === 'error' && errorMessage && (
                                <div className="p-2 bg-red-50 border border-red-200 rounded text-red-700 text-xs">
                                    {errorMessage}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="border-t pt-3 space-y-2">
                        <Button
                            onClick={syncNow}
                            disabled={!isOnline || isSyncing}
                            className="w-full"
                            size="sm"
                        >
                            {isSyncing ? (
                                <>
                                    <RefreshCw className="w-3 h-3 mr-2 animate-spin" />
                                    Syncing...
                                </>
                            ) : (
                                <>
                                    <RefreshCw className="w-3 h-3 mr-2" />
                                    Sync Now
                                </>
                            )}
                        </Button>

                        <div className="flex gap-2">
                            <Button
                                onClick={forceRefresh}
                                disabled={!isOnline || isSyncing}
                                variant="outline"
                                className="flex-1"
                                size="sm"
                            >
                                Force Refresh
                            </Button>

                            <Button
                                onClick={clearCache}
                                variant="outline"
                                className="flex-1"
                                size="sm"
                            >
                                Clear Cache
                            </Button>
                        </div>
                    </div>

                    <div className="text-xs text-gray-500 pt-2 border-t">
                        {isOnline ? (
                            <p>
                                Changes are automatically synced. You can work offline and
                                changes will sync when connection is restored.
                            </p>
                        ) : (
                            <p>
                                You're working offline. Your changes are saved locally and
                                will be synced when you're back online.
                            </p>
                        )}
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}

/**
 * Simple badge-only version for minimal UI
 */
export function SyncStatusBadge() {
    const { isOnline, pendingMutations } = useOfflineSync();

    if (isOnline && pendingMutations === 0) {
        return null; // Don't show anything when everything is normal
    }

    return (
        <Badge
            variant={isOnline ? "secondary" : "destructive"}
            className="flex items-center gap-1"
        >
            {isOnline ? (
                <>
                    <CloudOff className="w-3 h-3" />
                    {pendingMutations} pending
                </>
            ) : (
                <>
                    <WifiOff className="w-3 h-3" />
                    Offline
                </>
            )}
        </Badge>
    );
}

export default SyncStatusIndicator;

