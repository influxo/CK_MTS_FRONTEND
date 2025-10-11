# Offline PWA Functionality

## Overview

The Caritas Platform PWA now supports full offline functionality with automatic bidirectional synchronization. Users can work completely offline, and all changes will automatically sync when connectivity is restored.

## Features

### 1. **Local Database Storage (IndexedDB)**
- All critical data is cached locally using Dexie.js (IndexedDB wrapper)
- Cached entities:
  - Projects
  - Subprojects
  - Activities
  - Beneficiaries
  - Form Templates
  - Form Submissions

### 2. **Automatic Sync**
- **Bidirectional sync**: Changes flow both ways between local DB and server
- **Conflict resolution**: Uses `updatedAt` timestamps to resolve conflicts
- **Automatic retry**: Failed sync operations are retried with exponential backoff
- **Background sync**: Periodic sync every 5 minutes when online

### 3. **Offline Form Submissions**
- Users can submit forms while offline
- Submissions are queued locally and automatically synced when online
- GPS coordinates are captured and stored with submissions
- Service delivery records are included in submissions

### 4. **Visual Indicators**
- **Offline Indicator**: Shows connection status in bottom-right corner
- **Pending Changes Badge**: Displays count of unsynced changes
- **Manual Sync Button**: Allows users to trigger sync manually

## Architecture

### Database Schema (IndexedDB)

```typescript
// Version 2 Schema
{
  projects: 'id, updatedAt, synced, status',
  subprojects: 'id, projectId, updatedAt, synced, status',
  activities: 'id, subprojectId, updatedAt, synced, status',
  beneficiaries: 'id, projectId, updatedAt, synced',
  formTemplates: 'id, updatedAt, synced, status, projectId, subprojectId, activityId',
  formSubmissions: 'id, templateId, entityId, entityType, updatedAt, synced, submittedAt',
  pendingMutations: 'id, entityType, entityId, operation, createdAt',
  syncMetadata: 'entityType, lastSyncedAt'
}
```

### Key Services

#### 1. **Offline Data Service** (`src/services/offline/offlineDataService.ts`)
Provides transparent data access that automatically switches between API and local DB based on connectivity.

```typescript
import { offlineDataService } from '@/services/offline/offlineDataService'

// Get projects (works online and offline)
const projects = await offlineDataService.getProjects()

// Submit form (queues if offline)
await offlineDataService.submitFormResponse({
  templateId: 'form-123',
  entityId: 'project-456',
  entityType: 'project',
  data: { field1: 'value1' }
})

// Get form templates by entity
const templates = await offlineDataService.getFormTemplatesByEntity({
  projectId: 'project-123'
})
```

#### 2. **Sync Service** (`src/services/offline/syncService.ts`)
Handles bidirectional synchronization between local DB and server.

```typescript
import { syncService } from '@/services/offline/syncService'

// Initialize on app start
await syncService.initialize()

// Manually trigger sync
await syncService.syncNow()

// Subscribe to sync state changes
const unsubscribe = syncService.subscribe((state) => {
  console.log('Online:', state.isOnline)
  console.log('Pending mutations:', state.pendingMutations)
})
```

#### 3. **Data Prefetch Service** (`src/services/offline/dataPrefetchService.ts`)
Fetches and caches all necessary data for offline use after login.

```typescript
import { dataPrefetchService } from '@/services/offline/dataPrefetchService'

// Prefetch all data after login
const summary = await dataPrefetchService.prefetchAllData()
console.log('Cached:', summary.total.totalCached, 'records')
```

### React Hooks

#### **useOfflineStatus** (`src/hooks/useOfflineStatus.ts`)
Hook to monitor offline/online status and sync state.

```typescript
import { useOfflineStatus } from '@/hooks/useOfflineStatus'

function MyComponent() {
  const { isOnline, isSyncing, pendingMutations, lastSyncedAt } = useOfflineStatus()
  
  return (
    <div>
      {!isOnline && <Badge>Offline</Badge>}
      {pendingMutations > 0 && <Badge>{pendingMutations} pending</Badge>}
    </div>
  )
}
```

## Usage Guide

### For Developers

#### Adding a New Entity to Offline Support

1. **Update Database Schema** (`src/db/db.ts`):
```typescript
export interface OfflineMyEntity extends OfflineEntity {
  name: string;
  // ... other fields
}

class OfflineDB extends Dexie {
  myEntities!: Table<OfflineMyEntity, string>;
  
  constructor() {
    super('CaritasOfflineDB');
    this.version(3).stores({
      // ... existing tables
      myEntities: 'id, updatedAt, synced',
    });
  }
}
```

2. **Add Methods to Offline Data Service** (`src/services/offline/offlineDataService.ts`):
```typescript
async getMyEntities(): Promise<MyEntity[]> {
  const isOnline = syncService.isOnline();
  
  if (isOnline) {
    try {
      const response = await axiosInstance.get('/my-entities');
      // Cache in IndexedDB
      for (const entity of response.data.data) {
        await db.myEntities.put({
          ...entity,
          synced: true,
          _localUpdatedAt: new Date().toISOString(),
        });
      }
      return response.data.data;
    } catch (error) {
      // Fall back to cache
      const cached = await db.myEntities.toArray();
      return cached.map(this.stripOfflineFields);
    }
  }
  
  // Offline - use cache
  const cached = await db.myEntities.toArray();
  return cached.map(this.stripOfflineFields);
}
```

3. **Update Sync Service** (`src/services/offline/syncService.ts`):
Add entity type to `markEntityAsSynced` and `clearSyncedData` methods.

### For Users

#### Working Offline

1. **Initial Setup**:
   - Open the app while online
   - Log in to your account
   - Wait for initial data sync (automatic)
   - You're now ready to work offline!

2. **Offline Mode**:
   - When offline, an indicator appears in the bottom-right corner
   - All data you've previously viewed is available
   - You can submit forms and make changes
   - Changes are queued locally

3. **Going Back Online**:
   - Sync happens automatically when connection is restored
   - You'll see a notification when sync completes
   - The pending changes counter will decrease to zero

#### Best Practices

1. **Before Going Offline**:
   - Open all projects/forms you'll need while offline
   - This ensures they're cached locally

2. **While Offline**:
   - Submit forms as normal
   - Note the "saved offline" message
   - Don't clear browser data/cache

3. **After Reconnecting**:
   - Wait for sync to complete
   - Check for any sync errors
   - Verify your submissions appear in the system

## Service Worker Configuration

The PWA uses Workbox for advanced caching strategies:

```typescript
// vite.config.ts
workbox: {
  runtimeCaching: [
    {
      // API calls use NetworkFirst strategy
      urlPattern: /^https:\/\/api\..*\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-cache',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 60 * 60 * 24 // 24 hours
        }
      }
    }
  ]
}
```

## Troubleshooting

### Sync Issues

**Problem**: Changes not syncing
**Solution**: 
1. Check internet connection
2. Click manual sync button in offline indicator
3. Check browser console for errors
4. Clear cache and re-login if persistent

**Problem**: Duplicate submissions
**Solution**: 
- This shouldn't happen due to deduplication logic
- If it does, report the issue with browser console logs

### Storage Issues

**Problem**: "Storage quota exceeded"
**Solution**:
1. Clear old cached data: `await db.clearAllData()`
2. Increase storage quota in browser settings
3. The app automatically evicts old records (keeps 100 most recent per table)

### Performance Issues

**Problem**: Slow performance when offline
**Solution**:
1. Reduce number of cached records
2. Clear old data periodically
3. Ensure device has sufficient storage

## Technical Details

### Sync Algorithm

1. **On Connection Restored**:
   - Push pending mutations to server (FIFO order)
   - Pull fresh data from server
   - Update local cache
   - Mark entities as synced

2. **Conflict Resolution**:
   - Server data always wins for synced entities
   - Local unsynced changes are preserved
   - Uses `updatedAt` timestamp comparison

3. **Retry Logic**:
   - Failed mutations are retried up to 5 times
   - Exponential backoff between retries
   - Persistent failures are logged for manual review

### Security Considerations

1. **Data Encryption**:
   - IndexedDB data is NOT encrypted by default
   - Sensitive PII should be encrypted at application level
   - Consider using Web Crypto API for sensitive data

2. **Authentication**:
   - Auth tokens are stored in localStorage
   - Tokens expire and require re-authentication
   - Offline mode still requires valid token

3. **Data Privacy**:
   - Local data persists until explicitly cleared
   - Users should log out on shared devices
   - Consider implementing auto-logout after inactivity

## Future Enhancements

- [ ] Background sync API for true background syncing
- [ ] Conflict resolution UI for manual conflict handling
- [ ] Selective sync (choose which data to cache)
- [ ] Compression for large datasets
- [ ] Encrypted local storage for PII
- [ ] Offline-first architecture (local DB as primary)
- [ ] Delta sync (only sync changes, not full datasets)
- [ ] Sync progress indicators
- [ ] Offline analytics and reporting

## References

- [Dexie.js Documentation](https://dexie.org/)
- [Workbox Documentation](https://developers.google.com/web/tools/workbox)
- [IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
