# Offline Sync Implementation Guide

## Overview


## Architecture

### 1. **Database Layer** (`src/db/db.ts`)

- Uses **Dexie.js** (IndexedDB wrapper) for local storage
- Stores only user-relevant data (not entire backend database)
- Implements automatic eviction to manage storage size (keeps 100 most recent items per table)
- Tables: `projects`, `activities`, `beneficiaries`, `subprojects`, `pendingMutations`, `syncMetadata`

Each entity includes:
- `id`: Unique identifier
- `updatedAt`: ISO timestamp for conflict resolution
- `synced`: Boolean flag (false = needs to be synced to server)
- `_localUpdatedAt`: Local modification timestamp

### 2. **Sync Service** (`src/services/offline/syncService.ts`)

Central service that handles bidirectional synchronization:

**Key Features:**
- Monitors online/offline status using `navigator.onLine`
- Automatic sync on reconnection
- Periodic sync every 5 minutes when online
- Push pending mutations to server
- Pull fresh data from server
- Conflict resolution using `updatedAt` timestamps
- Event-driven architecture with subscribers

**Methods:**
- `initialize()` - Sets up listeners and performs initial sync
- `syncNow()` - Manually trigger sync
- `forceRefresh()` - Clear cache and re-download from server
- `clearCache()` - Clear local cache (keeps pending mutations)
- `subscribe(listener)` - Listen to sync state changes
- `queueMutation(mutation)` - Add operation to sync queue

### 3. **Offline Data Service** (`src/services/offline/offlineDataService.ts`)

Abstraction layer that provides transparent data access:

**When Online:**
- Fetches from API
- Caches response in IndexedDB
- Returns fresh data

**When Offline:**
- Reads from IndexedDB cache
- Queues write operations for later sync
- Returns cached data

**Available Methods:**
```typescript
// Projects
getProjects(): Promise<Project[]>
getProject(id: string): Promise<Project | null>
createProject(data: CreateProjectRequest): Promise<Project>
updateProject(id: string, updates: Partial<Project>): Promise<Project>

// Activities
getActivitiesForSubproject(subprojectId: string): Promise<Activity[]>
getActivity(id: string): Promise<Activity | null>
createActivity(data: CreateSubprojectActivityRequest): Promise<Activity>
updateActivity(id: string, updates: Partial<Activity>): Promise<Activity>

// Utilities
isEntityModified(entityType, entityId): Promise<boolean>
getUnsyncedCount(): Promise<{projects, activities, total}>
```

### 4. **React Hooks**

#### `useOfflineSync` (`src/hooks/useOfflineSync.ts`)

Provides access to sync state and operations:

```typescript
const {
  isOnline,           // Boolean: online status
  isSyncing,          // Boolean: sync in progress
  pendingMutations,   // Number: unsynced changes
  lastSyncedAt,       // String: last sync timestamp
  syncStatus,         // 'idle' | 'syncing' | 'error'
  errorMessage,       // String: error if sync failed
  syncNow,            // Function: trigger manual sync
  forceRefresh,       // Function: clear and re-download
  clearCache,         // Function: clear local cache
} = useOfflineSync()
```

#### `useOfflineProjects` (`src/hooks/useOfflineProjects.ts`)

Example integration for projects:

```typescript
const {
  projects,           // Project[]
  loading,            // Boolean
  error,              // String | null
  isOnline,           // Boolean
  createProject,      // Function
  updateProject,      // Function
  refetch,            // Function
  getProject,         // Function
} = useOfflineProjects()
```

### 5. **UI Components**

#### `SyncStatusIndicator` (`src/components/offline/SyncStatusIndicator.tsx`)

Visual indicator for sync status with popover showing:
- Online/offline status
- Last sync time
- Pending changes count
- Manual sync button
- Force refresh button
- Clear cache button

**Usage:**
```tsx
import { SyncStatusIndicator } from '@/components/offline/SyncStatusIndicator'

function Header() {
  return (
    <header>
      <h1>My App</h1>
      <SyncStatusIndicator />
    </header>
  )
}
```

## Usage Examples

### Example 1: Display Projects (with offline support)

```tsx
import { useOfflineProjects } from '@/hooks/useOfflineProjects'

function ProjectList() {
  const { projects, loading, error, isOnline } = useOfflineProjects()
  
  if (loading) return <Spinner />
  if (error) return <Error message={error} />
  
  return (
    <div>
      {!isOnline && (
        <Alert>You're offline. Viewing cached data.</Alert>
      )}
      
      {projects.map(project => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  )
}
```

### Example 2: Create Project Offline

```tsx
import { useOfflineProjects } from '@/hooks/useOfflineProjects'

function CreateProjectForm() {
  const { createProject, isOnline } = useOfflineProjects()
  
  const handleSubmit = async (data) => {
    const newProject = await createProject(data)
    
    if (newProject) {
      // Success! Toast will show:
      // - Online: "Project created successfully"
      // - Offline: "Project will be synced when you're back online"
    }
  }
  
  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
      <Button type="submit">
        Create Project {!isOnline && '(Offline)'}
      </Button>
    </form>
  )
}
```

### Example 3: Manual Sync Control

```tsx
import { useOfflineSync } from '@/hooks/useOfflineSync'

function SyncButton() {
  const { 
    isOnline, 
    isSyncing, 
    pendingMutations, 
    syncNow 
  } = useOfflineSync()
  
  if (!isOnline) {
    return <Badge>Offline - {pendingMutations} pending</Badge>
  }
  
  return (
    <Button 
      onClick={syncNow} 
      disabled={isSyncing}
    >
      {isSyncing ? 'Syncing...' : 'Sync Now'}
      {pendingMutations > 0 && ` (${pendingMutations})`}
    </Button>
  )
}
```

### Example 4: Direct Data Service Usage

```tsx
import { offlineDataService } from '@/services/offline/offlineDataService'

async function updateProjectStatus(projectId: string, status: string) {
  try {
    // Works both online and offline
    const updated = await offlineDataService.updateProject(projectId, {
      status
    })
    
    console.log('Project updated:', updated)
    // If offline, this change is queued and will sync later
  } catch (error) {
    console.error('Failed to update:', error)
  }
}
```

## Creating Hooks for Other Entities

To add offline support for other entities (e.g., beneficiaries, services), follow this pattern:

```typescript
// src/hooks/useOfflineBeneficiaries.ts

import { useState, useEffect, useCallback } from 'react'
import { offlineDataService } from '@/services/offline/offlineDataService'
import { syncService } from '@/services/offline/syncService'

export function useOfflineBeneficiaries() {
  const [beneficiaries, setBeneficiaries] = useState([])
  const [loading, setLoading] = useState(true)

  const loadBeneficiaries = useCallback(async () => {
    try {
      setLoading(true)
      // Add getBeneficiaries() method to offlineDataService
      const data = await offlineDataService.getBeneficiaries()
      setBeneficiaries(data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadBeneficiaries()
  }, [loadBeneficiaries])

  useEffect(() => {
    const unsubscribe = syncService.subscribe((state) => {
      if (state.syncStatus === 'idle' && state.lastSyncedAt) {
        loadBeneficiaries()
      }
    })
    return unsubscribe
  }, [loadBeneficiaries])

  return { beneficiaries, loading, refetch: loadBeneficiaries }
}
```

## Sync Logic Flow

### When User Goes Offline

1. `navigator.onLine` event fires
2. SyncService updates state to `isOnline: false`
3. All subscribers notified (hooks, components)
4. Toast notification shown: "You are offline"
5. All subsequent API calls automatically use IndexedDB

### When User Modifies Data Offline

1. User calls `createProject()` or `updateActivity()`
2. OfflineDataService detects offline status
3. Data stored in IndexedDB with `synced: false`
4. Mutation queued in `pendingMutations` table
5. Toast shown: "Changes will be synced when you're back online"

### When Connection Restored

1. `navigator.onLine` event fires
2. SyncService updates state to `isOnline: true`
3. Toast shown: "Back online - Syncing your changes..."
4. **Sync process starts:**
   - a. Fetch pending mutations from IndexedDB
   - b. Execute each mutation (POST/PUT/DELETE) against API
   - c. On success: mark entity as synced, remove from queue
   - d. On failure: increment retry count, keep in queue
   - e. Pull fresh data from server to update cache
5. Toast shown: "X change(s) synced successfully"

### Conflict Resolution

If a record was modified both locally and remotely:
- Compare `updatedAt` timestamps
- Keep the version with the newer timestamp
- Log warning for manual review if needed

## Data Storage Strategy

### What Gets Cached?

✅ **Cached:**
- Projects user has access to
- Activities for viewed subprojects
- Beneficiaries related to user's work
- Recently viewed/edited records

❌ **Not Cached:**
- Full database (too large)
- Data user hasn't accessed
- Admin-only data
- Historical records beyond 100 per type

### Storage Limits

- **Maximum per table:** 100 records (configurable)
- **Eviction policy:** Keep newest by `updatedAt`, delete oldest
- **Only synced records evicted** (pending changes never deleted)
- **Manual eviction:** Call `db.evictOldRecords(50)` to keep only 50

### Checking Storage Usage

```typescript
import { db } from '@/db/db'

// Get counts
const projectCount = await db.projects.count()
const pendingCount = await db.pendingMutations.count()

console.log(`Cached: ${projectCount} projects`)
console.log(`Pending: ${pendingCount} changes`)
```

## Testing Offline Mode

### Chrome DevTools

1. Open DevTools (F12)
2. Go to **Network** tab
3. Change throttling dropdown to **Offline**
4. Test your app:
   - View cached data
   - Create/update records
   - Go back online
   - Verify sync occurs

### Programmatic Testing

```typescript
// Simulate going offline
Object.defineProperty(navigator, 'onLine', {
  writable: true,
  value: false
})
window.dispatchEvent(new Event('offline'))

// Make changes while "offline"
await createProject({ name: 'Test' })

// Simulate coming back online
Object.defineProperty(navigator, 'onLine', {
  writable: true,
  value: true
})
window.dispatchEvent(new Event('online'))

// Verify sync
await new Promise(resolve => setTimeout(resolve, 2000))
const pending = await db.getPendingMutationsCount()
console.log(`Pending: ${pending}`) // Should be 0 after sync
```

## Error Handling

### Sync Failures

If a mutation fails to sync:
- Kept in queue with incremented `retryCount`
- Will retry on next sync attempt (every 5 minutes)
- After 5 failures, logged as warning (review manually)
- User can trigger manual sync anytime

### Cache Corruption

If IndexedDB becomes corrupted:
```typescript
import { db } from '@/db/db'

// Clear all data
await db.clearAllData()

// Re-initialize
await db.open()

// Sync from server
await syncService.forceRefresh()
```

## Performance Considerations

### Optimize for Large Datasets

```typescript
// Use Dexie's efficient queries
const recentProjects = await db.projects
  .where('updatedAt')
  .above(oneWeekAgo)
  .limit(50)
  .toArray()

// Use compound indices for common queries
// (Add in db.ts schema)
activities: 'id, [subprojectId+updatedAt], synced'
```

### Debounce Sync Triggers

```typescript
// In your component
const debouncedSync = useMemo(
  () => debounce(() => syncService.syncNow(), 5000),
  []
)

// Call on user actions
onChange={() => {
  updateProject(id, changes)
  debouncedSync()
}}
```

## Security Considerations

1. **No sensitive data stored unencrypted**
   - IndexedDB is domain-specific but not encrypted
   - Don't cache passwords, tokens (except in localStorage/sessionStorage with appropriate flags)

2. **Token expiry**
   - If auth token expires while offline, user must re-login
   - Pending mutations will fail with 401
   - Handle in sync error handling

3. **User logout**
   - Always clear cache on logout:
   ```typescript
   async function logout() {
     await db.clearAllData()
     await syncService.destroy()
     localStorage.removeItem('token')
     window.location.href = '/login'
   }
   ```

## Troubleshooting

### Issue: Changes not syncing

1. Check online status: `syncService.isOnline()`
2. Check pending mutations: `await db.getPendingMutationsCount()`
3. Check sync status: `syncService.getState()`
4. Manual sync: `await syncService.syncNow()`
5. Check console for errors

### Issue: Stale data shown

1. Force refresh: `await syncService.forceRefresh()`
2. Clear cache: `await syncService.clearCache()`
3. Check last sync time: `syncService.getState().lastSyncedAt`

### Issue: IndexedDB quota exceeded

1. Check browser storage quota
2. Reduce cache size: `await db.evictOldRecords(50)`
3. Clear cache: `await db.clearAllData()`

## Future Enhancements

Possible improvements:

1. **Intelligent prefetching** - Predict and cache data user will likely need
2. **Partial sync** - Sync only changed fields, not entire records
3. **Multi-tab sync** - Coordinate IndexedDB changes across browser tabs
4. **Service Worker sync** - Use Background Sync API for guaranteed sync
5. **Compression** - Compress cached data to save space
6. **Encryption** - Encrypt sensitive data at rest in IndexedDB
7. **Conflict UI** - Visual interface for resolving conflicts manually

## API Reference

See inline documentation in source files:
- `src/db/db.ts` - Database schema and operations
- `src/services/offline/syncService.ts` - Sync logic
- `src/services/offline/offlineDataService.ts` - Data access layer
- `src/hooks/useOfflineSync.ts` - Sync state hook
- `src/hooks/useOfflineProjects.ts` - Example entity hook

## Support

For questions or issues:
1. Check this documentation
2. Review source code comments
3. Check browser console for errors
4. Test in Chrome DevTools offline mode
5. Contact development team

---

**Last Updated:** October 2025  
**Version:** 1.0.0

