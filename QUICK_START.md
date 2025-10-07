# Offline Sync - Quick Start Guide

## 🎯 What Was Implemented

Your PWA now supports **full offline functionality**! Users can:
- View cached data when offline
- Create and edit records offline
- Auto-sync changes when connection restores

## 🚀 3-Minute Integration

### 1. Add Sync Status Indicator (Optional but Recommended)

```tsx
// In your main layout or header component
import { SyncStatusIndicator } from './components/offline/SyncStatusIndicator'

export function Layout() {
  return (
    <div>
      <header>
        <h1>Caritas Platform</h1>
        <SyncStatusIndicator /> {/* Add this */}
      </header>
      {/* rest of layout */}
    </div>
  )
}
```

### 2. Use Offline-Enabled Data Hooks

Replace direct service calls with offline-enabled hooks:

```tsx
// ❌ Before: Direct service call
import projectService from './services/projects/projectService'

function ProjectList() {
  const [projects, setProjects] = useState([])
  
  useEffect(() => {
    projectService.getAllProjects().then(res => {
      if (res.data) setProjects(res.data)
    })
  }, [])
  
  return <div>{projects.map(...)}</div>
}

// ✅ After: Offline-enabled hook
import { useOfflineProjects } from './hooks/useOfflineProjects'

function ProjectList() {
  const { projects, loading, error } = useOfflineProjects()
  
  if (loading) return <Spinner />
  if (error) return <Error message={error} />
  
  return <div>{projects.map(...)}</div>
}
```

### 3. That's It! 🎉

Your app now works offline. The system automatically:
- Caches data from the API
- Queues changes when offline
- Syncs when back online
- Shows notifications

## 📝 Examples

### Example 1: Display Projects

```tsx
import { useOfflineProjects } from './hooks/useOfflineProjects'

function Projects() {
  const { projects, createProject, isOnline } = useOfflineProjects()
  
  return (
    <div>
      {!isOnline && <Badge>Offline Mode</Badge>}
      
      {projects.map(project => (
        <ProjectCard key={project.id} project={project} />
      ))}
      
      <Button onClick={() => createProject({
        name: 'New Project',
        description: 'Test',
        category: 'Education',
        status: 'active'
      })}>
        Create Project {!isOnline && '(Will sync later)'}
      </Button>
    </div>
  )
}
```

### Example 2: Activities for Subproject

```tsx
import { useOfflineActivities } from './hooks/useOfflineProjects'

function Activities({ subprojectId }) {
  const { activities, createActivity } = useOfflineActivities(subprojectId)
  
  return (
    <div>
      {activities.map(activity => (
        <ActivityCard key={activity.id} activity={activity} />
      ))}
    </div>
  )
}
```

### Example 3: Manual Sync Control

```tsx
import { useOfflineSync } from './hooks/useOfflineSync'

function SyncControl() {
  const { 
    isOnline, 
    isSyncing, 
    pendingMutations, 
    syncNow 
  } = useOfflineSync()
  
  return (
    <div>
      <p>Status: {isOnline ? 'Online' : 'Offline'}</p>
      {pendingMutations > 0 && (
        <p>{pendingMutations} pending changes</p>
      )}
      <Button onClick={syncNow} disabled={!isOnline || isSyncing}>
        {isSyncing ? 'Syncing...' : 'Sync Now'}
      </Button>
    </div>
  )
}
```

## 🧪 Test It

### Test Offline Mode:
1. Open Chrome DevTools (F12)
2. Go to **Network** tab
3. Change dropdown to **Offline**
4. Navigate your app - should show cached data
5. Create/edit records - should queue them
6. Change back to **Online**
7. Watch sync happen automatically!

## 📦 What Got Installed

```json
{
  "dependencies": {
    "dexie": "^4.x.x"  // Added for IndexedDB
  }
}
```

## 🗂️ New Files

```
src/
├── db/
│   └── db.ts                          // Database schema
├── services/
│   └── offline/
│       ├── syncService.ts             // Sync orchestration
│       └── offlineDataService.ts      // Data access layer
├── hooks/
│   ├── useOfflineSync.ts              // Sync state hook
│   └── useOfflineProjects.ts          // Example entity hook
├── components/
│   └── offline/
│       └── SyncStatusIndicator.tsx    // UI component
└── pwa.ts                              // Updated with sync init

OFFLINE_SYNC_GUIDE.md                  // Full documentation
OFFLINE_SYNC_IMPLEMENTATION.md          // Implementation summary
QUICK_START.md                          // This file
```

## 🎯 Key Features

- ✅ **Transparent**: No need to check online status manually
- ✅ **Automatic**: Syncs on reconnection and every 5 minutes
- ✅ **Conflict Resolution**: Uses timestamps to resolve conflicts
- ✅ **User Feedback**: Toast notifications for all sync events
- ✅ **Type-Safe**: Full TypeScript support
- ✅ **Extensible**: Easy to add more entities

## 📚 Learn More

- **Full Guide**: See `OFFLINE_SYNC_GUIDE.md`
- **Implementation Details**: See `OFFLINE_SYNC_IMPLEMENTATION.md`
- **API Reference**: Check inline documentation in source files

## 🆘 Need Help?

### Common Questions

**Q: How do I add offline support for beneficiaries?**  
A: See "Extending to Other Entities" section in `OFFLINE_SYNC_GUIDE.md`

**Q: How much data is cached?**  
A: Only data the user has viewed/edited. Default: 100 items per entity type.

**Q: What if sync fails?**  
A: Changes stay queued and retry on next sync (every 5 min or manual)

**Q: Does it work on mobile?**  
A: Yes! Works on Chrome Android and Safari iOS.

## ✅ Next Steps

1. [ ] Add `<SyncStatusIndicator />` to your header
2. [ ] Convert one component to use `useOfflineProjects`
3. [ ] Test offline mode in Chrome DevTools
4. [ ] Review full documentation for advanced features
5. [ ] Extend to other entities as needed

---

**You're all set!** Your PWA now works offline. 🎉

