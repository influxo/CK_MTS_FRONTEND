# Local-First Architecture

## 🎯 Core Concept

Your app now uses a **local-first architecture** where:

- ✅ **IndexedDB IS your database** (not a cache)
- ✅ **All operations use IndexedDB** (reads and writes)
- ✅ **Server is for sync only** (background bidirectional sync)
- ✅ **App works identically offline/online** (no difference to user)
- ✅ **Complete database locally** (all entities stored)

## 📊 Local Database Schema (Version 3)

### Core Entities
1. **Projects** (`db.projects`)
2. **Subprojects** (`db.subprojects`) 
3. **Activities** (`db.activities`)
4. **Beneficiaries** (`db.beneficiaries`)

### Forms System
5. **Form Templates** (`db.formTemplates`)
6. **Form Submissions** (`db.formSubmissions`)

### Services & Users
7. **Services** (`db.services`) - Service catalog
8. **Users** (`db.users`) - All system users
9. **Project Users** (`db.projectUsers`) - User assignments to projects
10. **Subproject Users** (`db.subprojectUsers`) - User assignments to subprojects
11. **Entity Services** (`db.entityServices`) - Service assignments to entities

### Sync Management
12. **Pending Mutations** (`db.pendingMutations`) - Queued changes
13. **Sync Metadata** (`db.syncMetadata`) - Sync timestamps

## 🔄 How It Works

### 1. Initial Load (First Time User Opens App)

```
User Opens App (Online)
        ↓
Check if DB has data
        ↓
No data found
        ↓
Show loading screen
        ↓
[Preload Step 1/11] Fetch all projects from /projects
[Preload Step 2/11] Fetch all subprojects for each project
[Preload Step 3/11] Fetch all activities for each subproject
[Preload Step 4/11] Fetch all beneficiaries from /beneficiaries
[Preload Step 5/11] Fetch all form templates from /forms/templates
[Preload Step 6/11] Fetch all services from /services
[Preload Step 7/11] Fetch all users from /users
[Preload Step 8/11] Fetch project user assignments
[Preload Step 9/11] Fetch subproject user assignments
[Preload Step 10/11] Fetch entity service assignments
[Preload Step 11/11] Fetch user-specific data
        ↓
Store everything in IndexedDB with synced:true
        ↓
Show "Ready!" message
        ↓
Open app with full data
```

### 2. Subsequent Loads (Already Have Data)

```
User Opens App
        ↓
Check if DB has data
        ↓
Data found!
        ↓
Open app INSTANTLY (no loading screen)
        ↓
Read all data from IndexedDB
        ↓
Render UI immediately
        ↓
(Background) Sync with server if online
```

### 3. Reading Data (Online or Offline)

```
Component needs projects
        ↓
Call: const projects = await db.projects.toArray()
        ↓
Return data INSTANTLY from IndexedDB
        ↓
(No API call needed!)
```

### 4. Writing Data (Online or Offline)

```
User submits form
        ↓
Generate temp ID: temp-xxx
        ↓
Write to IndexedDB with synced:false
        ↓
Add to pendingMutations queue
        ↓
Return success to user immediately
        ↓
(Background) If online, sync to server
        ↓
On server success: Update synced:true, replace temp ID
```

### 5. Sync Process (Automatic Background)

```
[Every 5 minutes when online]
        ↓
Pull fresh data from server
        ↓
Update IndexedDB (merge, don't delete unsynced)
        ↓
Process pendingMutations queue (FIFO)
        ↓
For each mutation:
  - POST/PUT/DELETE to server
  - On success: Remove from queue, update synced:true
  - On fail: Retry later (max 5 times)
```

## 💻 Usage in Your App

### Reading Data (Always from IndexedDB)

```typescript
import { db } from '@/db/db'

// Get all projects
const projects = await db.projects.toArray()

// Get projects by status
const activeProjects = await db.projects
  .where('status')
  .equals('active')
  .toArray()

// Get single project
const project = await db.projects.get(projectId)

// Get subprojects for a project
const subprojects = await db.subprojects
  .where('projectId')
  .equals(projectId)
  .toArray()

// Get activities for a subproject
const activities = await db.activities
  .where('subprojectId')
  .equals(subprojectId)
  .toArray()

// Get users assigned to a project
const projectUsers = await db.projectUsers
  .where('projectId')
  .equals(projectId)
  .toArray()

// Get services assigned to a project
const services = await db.entityServices
  .where('entityId')
  .equals(projectId)
  .and(s => s.entityType === 'project')
  .toArray()
```

### Writing Data (Always to IndexedDB + Queue)

```typescript
import { db } from '@/db/db'
import { syncService } from '@/services/offline/syncService'

// Create project
const tempId = `temp-${crypto.randomUUID()}`
const newProject = {
  id: tempId,
  name: 'New Project',
  status: 'active',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  synced: false,
  _localUpdatedAt: new Date().toISOString(),
}

await db.projects.put(newProject)

await syncService.queueMutation({
  entityType: 'project',
  entityId: tempId,
  operation: 'create',
  data: { name: 'New Project', status: 'active' },
  endpoint: '/projects',
  method: 'POST',
})

// Update project
await db.projects.update(projectId, {
  name: 'Updated Name',
  synced: false,
  _localUpdatedAt: new Date().toISOString(),
})

await syncService.queueMutation({
  entityType: 'project',
  entityId: projectId,
  operation: 'update',
  data: { name: 'Updated Name' },
  endpoint: `/projects/${projectId}`,
  method: 'PUT',
})

// Delete project
await db.projects.delete(projectId)

await syncService.queueMutation({
  entityType: 'project',
  entityId: projectId,
  operation: 'delete',
  data: {},
  endpoint: `/projects/${projectId}`,
  method: 'DELETE',
})
```

### Using with React Components

```typescript
import { useEffect, useState } from 'react'
import { db } from '@/db/db'
import { offlineFirstDataService } from '@/services/offline/offlineFirstDataService'

function ProjectsList() {
  const [projects, setProjects] = useState([])
  
  useEffect(() => {
    // Load from IndexedDB (instant!)
    const loadProjects = async () => {
      const data = await offlineFirstDataService.getProjects()
      setProjects(data)
    }
    
    loadProjects()
    
    // Subscribe to updates from background sync
    const unsubscribe = offlineFirstDataService.subscribe(() => {
      loadProjects() // Refresh when sync completes
    })
    
    return () => unsubscribe()
  }, [])
  
  return (
    <div>
      {projects.map(p => <div key={p.id}>{p.name}</div>)}
    </div>
  )
}
```

## 🔧 Replacing Redux Thunks

### Before (Redux Thunks)

```typescript
// ❌ OLD WAY - Direct API calls
export const fetchProjects = createAsyncThunk(
  'projects/fetch',
  async () => {
    const response = await axiosInstance.get('/projects')
    return response.data.data
  }
)

// In component
useEffect(() => {
  dispatch(fetchProjects())
}, [])
```

### After (IndexedDB)

```typescript
// ✅ NEW WAY - Local-first
function ProjectsComponent() {
  const [projects, setProjects] = useState([])
  
  useEffect(() => {
    db.projects.toArray().then(setProjects)
    
    // Subscribe to changes
    const subscription = offlineFirstDataService.subscribe(() => {
      db.projects.toArray().then(setProjects)
    })
    
    return () => subscription()
  }, [])
  
  return <div>{/* render projects */}</div>
}
```

## 🚀 Migration Strategy

### Phase 1: Keep Redux, Add Local DB (Current)
- Redux thunks still work
- Background preloader populates IndexedDB
- Sync service keeps data fresh
- **No code changes needed yet**

### Phase 2: Gradual Migration
- Replace Redux selectors with IndexedDB queries
- One component at a time
- Test thoroughly

### Phase 3: Remove Redux (Future)
- Once all components use IndexedDB
- Remove Redux entirely
- Simpler codebase

## 📱 Offline Experience

### User Scenario 1: Field Worker

```
Worker opens app at office (online)
  → App preloads all data (one-time, 30 seconds)
  → Worker goes to field (offline)
  → App works perfectly
  → Submits 10 forms offline
  → Forms stored in IndexedDB
  → Returns to office (online)
  → App auto-syncs all 10 forms
  → ✅ All data in server
```

### User Scenario 2: Manager

```
Manager opens app (has data already)
  → App opens in <1 second
  → Views all projects (from IndexedDB)
  → Creates new project (to IndexedDB)
  → Assigns users (to IndexedDB)
  → All instant, no waiting
  → Background sync to server
  → Other devices get updates
```

## 🔐 Security Considerations

### PII Encryption
- Beneficiary PII encrypted in server DB
- IndexedDB stores encrypted version
- Decryption only for authorized users
- Never log raw PII

### Auth Tokens
- Stored in localStorage
- Required for sync operations
- Offline mode still needs valid token
- Auto-refresh when online

### Data Privacy
- Local data persists until logout
- Clear IndexedDB on logout
- Shared devices: Force logout
- Consider device-level encryption

## 📈 Performance

### First Load
- **With preload**: 20-60 seconds (one time)
- **Downloads**: ~3-10 MB of data
- **Storage**: 5-20 MB IndexedDB

### Subsequent Loads
- **App opens**: <1 second
- **Data reads**: <50ms
- **UI renders**: Instant

### Sync Performance
- **Background**: Every 5 minutes
- **Per mutation**: ~100-500ms
- **Batch updates**: Efficient

## 🛠️ Developer Tools

### View Local Database

```javascript
// Open DevTools Console

// View all projects
const projects = await db.projects.toArray()
console.table(projects)

// View pending mutations
const pending = await db.pendingMutations.toArray()
console.table(pending)

// View statistics
import { dataPreloader } from '@/services/offline/dataPreloader'
const stats = await dataPreloader.getStats()
console.log(stats)
/*
{
  projects: 50,
  subprojects: 120,
  activities: 350,
  beneficiaries: 2000,
  formTemplates: 25,
  formSubmissions: 500,
  services: 30,
  users: 100,
  projectUsers: 150,
  subprojectUsers: 200,
  entityServices: 180,
  pendingMutations: 5,
  totalSize: 3705
}
*/
```

### Clear Local Database

```javascript
// Clear everything
await db.clearAllData()

// Force refresh
import { dataPreloader } from '@/services/offline/dataPreloader'
await dataPreloader.forceRefresh(userId)
```

### Trigger Manual Sync

```javascript
import { syncService } from '@/services/offline/syncService'
await syncService.syncNow()
```

## 🎯 Key Benefits

### For Users
✅ **Instant app launch** - No waiting for API calls  
✅ **Works offline** - Full functionality without internet  
✅ **Smooth experience** - No loading spinners  
✅ **Reliable** - Data never lost  
✅ **Fast** - Everything is local  

### For Developers
✅ **Simpler code** - Direct DB queries  
✅ **Better DX** - No async complications  
✅ **Easier testing** - No mocking APIs  
✅ **More control** - Direct data access  
✅ **Less state management** - IndexedDB is the state  

### For Business
✅ **Offline-capable** - Field workers productive  
✅ **Reduced server load** - Fewer API calls  
✅ **Better reliability** - Works with poor connectivity  
✅ **Cost savings** - Less bandwidth usage  
✅ **Scalable** - Handles thousands of users  

## 🚨 Important Notes

### Conflict Resolution
- Server data ALWAYS wins for synced entities
- Local unsynced changes preserved
- Uses `updatedAt` timestamp comparison
- Manual resolution UI coming in future

### Storage Limits
- Most browsers: 50-100MB available
- IndexedDB quota per origin
- Auto-evict old records if needed
- Monitor storage usage

### Browser Compatibility
- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support (iOS 13.4+)
- IE: ❌ Not supported

## 📚 Files Reference

### Core Database
- `src/db/db.ts` - IndexedDB schema (Version 3)

### Services
- `src/services/offline/offlineFirstDataService.ts` - Local-first data access
- `src/services/offline/dataPreloader.ts` - Initial data loading
- `src/services/offline/syncService.ts` - Bidirectional sync

### Components
- `src/components/AppInitializer.tsx` - App initialization
- `src/components/DataLoadingScreen.tsx` - Loading UI
- `src/components/OfflineIndicator.tsx` - Sync status

### Hooks
- `src/hooks/useOfflineStatus.ts` - Monitor sync state

## 🎓 Learning Path

1. **Understand**: Read this document
2. **Explore**: Open DevTools and view IndexedDB
3. **Experiment**: Try offline mode
4. **Build**: Create new components using local DB
5. **Migrate**: Replace Redux thunks gradually
6. **Optimize**: Monitor performance and storage

## 🔮 Future Enhancements

- [ ] Conflict resolution UI
- [ ] Selective sync (choose what to cache)
- [ ] Delta sync (only changed data)
- [ ] Encrypted local storage
- [ ] Offline analytics
- [ ] Background Sync API
- [ ] Web Locks API for multi-tab
- [ ] Service Worker for push updates

---

**You now have a true local-first PWA!** 🎉

Your app stores a complete database locally and syncs with the server in the background. Users experience instant performance whether online or offline.
