# Offline-First PWA Implementation Guide

## 🎯 What Changed

Your app now uses an **offline-first architecture** where:
- ✅ **ALL data is preloaded** into IndexedDB on first launch
- ✅ **App ALWAYS reads from local database first** (instant UI)
- ✅ **Background sync** keeps data fresh without blocking
- ✅ **Works identically** whether online or offline
- ✅ **Sidebar and navigation** work offline with full data

## 📦 What Gets Preloaded

On first app launch (or after login), ALL of the following data is downloaded and stored locally:

1. **Projects** - All projects user has access to
2. **Subprojects** - All subprojects within those projects
3. **Activities** - All activities within subprojects
4. **Beneficiaries** - All beneficiaries in the system
5. **Form Templates** - All form templates with full schemas
6. **User Data** - User's specific project assignments

## 🚀 How It Works

### First Launch (Online)
```
1. User opens app
2. Loading screen appears: "Loading Data"
3. Data preloader downloads ALL data from API
4. Data stored in IndexedDB
5. Loading screen shows "Ready!"
6. App opens with full data
```

### Subsequent Launches
```
1. User opens app
2. App checks IndexedDB
3. Data found → App opens INSTANTLY
4. Background sync updates data silently
```

### Offline Mode
```
1. User goes offline
2. App continues working normally
3. All data available from IndexedDB
4. Form submissions queued locally
5. When back online → Auto-sync
```

## 💻 For Developers

### Using the Offline-First Data Service

**IMPORTANT**: Always use `offlineFirstDataService` instead of direct API calls.

```typescript
import { offlineFirstDataService } from '@/services/offline/offlineFirstDataService'

// Get projects (instant from local DB, syncs in background)
const projects = await offlineFirstDataService.getProjects()

// Get subprojects for a project
const subprojects = await offlineFirstDataService.getSubprojects(projectId)

// Get activities for a subproject
const activities = await offlineFirstDataService.getActivities(subprojectId)

// Get form templates
const templates = await offlineFirstDataService.getFormTemplates({
  projectId: 'project-123'
})

// Submit form (works online and offline)
await offlineFirstDataService.submitFormResponse({
  templateId: 'form-123',
  entityId: 'project-456',
  entityType: 'project',
  data: { field1: 'value1' }
})

// Get user's projects with nested structure (for sidebar)
const userProjects = await offlineFirstDataService.getUserProjects(userId)
```

### Key Principles

1. **Always read from local DB first** - Never wait for API
2. **Let background sync handle updates** - Don't block UI
3. **Trust the cache** - It's always fresh enough
4. **Handle offline gracefully** - Queue mutations, don't fail

### Updating Existing Components

**BEFORE** (Old way - direct API calls):
```typescript
// ❌ DON'T DO THIS
const response = await axiosInstance.get('/projects')
const projects = response.data.data
```

**AFTER** (New way - offline-first):
```typescript
// ✅ DO THIS
import { offlineFirstDataService } from '@/services/offline/offlineFirstDataService'

const projects = await offlineFirstDataService.getProjects()
// Returns immediately from cache, syncs in background
```

### Example: Updating a Component

```typescript
// Before
import axiosInstance from '../services/axiosInstance'

function MyComponent() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axiosInstance.get('/projects')
        setProjects(response.data.data)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    fetchProjects()
  }, [])
  
  if (loading) return <div>Loading...</div>
  return <div>{/* render projects */}</div>
}
```

```typescript
// After
import { offlineFirstDataService } from '../services/offline/offlineFirstDataService'

function MyComponent() {
  const [projects, setProjects] = useState([])
  
  useEffect(() => {
    const loadProjects = async () => {
      // Instant from cache, no loading state needed!
      const data = await offlineFirstDataService.getProjects()
      setProjects(data)
    }
    loadProjects()
    
    // Subscribe to updates
    const unsubscribe = offlineFirstDataService.subscribe(() => {
      loadProjects() // Refresh when background sync completes
    })
    
    return () => unsubscribe()
  }, [])
  
  // No loading state - data is instant!
  return <div>{/* render projects */}</div>
}
```

## 🔧 Configuration

### Adjust Preload Behavior

Edit `src/services/offline/dataPreloader.ts`:

```typescript
// Skip preload if data already exists
async isDataPreloaded(): Promise<boolean> {
  const projectCount = await db.projects.count()
  return projectCount > 0 // Adjust threshold as needed
}
```

### Force Data Refresh

```typescript
import { dataPreloader } from '@/services/offline/dataPreloader'

// Force refresh all data
await dataPreloader.forceRefresh(userId)
```

### Check Preload Status

```typescript
import { dataPreloader } from '@/services/offline/dataPreloader'

const stats = await dataPreloader.getStats()
console.log('Cached data:', stats)
// {
//   projects: 10,
//   subprojects: 25,
//   activities: 50,
//   beneficiaries: 100,
//   formTemplates: 15,
//   formSubmissions: 5,
//   pendingMutations: 2,
//   totalSize: 205
// }
```

## 🧪 Testing

### Test Offline Functionality

1. **Open app while online**
   - Should show loading screen on first launch
   - Should preload all data
   - Should show "Ready!" when complete

2. **Close and reopen app**
   - Should open INSTANTLY (no loading screen)
   - All data should be visible

3. **Go offline** (DevTools → Network → Offline)
   - App should continue working normally
   - Sidebar should show all projects
   - Forms should be accessible
   - Can submit forms

4. **Submit form while offline**
   - Should see "Saved offline" message
   - Offline indicator shows pending count

5. **Go back online**
   - Should auto-sync
   - Pending count goes to 0
   - Form appears in server

### Test Data Freshness

1. **Open app**
2. **Make changes on server** (different device/browser)
3. **Wait 5 minutes** (or trigger manual sync)
4. **Check if changes appear** in app

## 📊 Monitoring

### View Cached Data

```javascript
// In browser console
import { db } from './src/db/db'

// Count records
console.log('Projects:', await db.projects.count())
console.log('Subprojects:', await db.subprojects.count())
console.log('Activities:', await db.activities.count())
console.log('Form Templates:', await db.formTemplates.count())

// View all projects
const projects = await db.projects.toArray()
console.table(projects)
```

### View Preload Progress

```typescript
import { dataPreloader } from '@/services/offline/dataPreloader'

dataPreloader.subscribeToProgress((progress) => {
  console.log(`${progress.current}: ${progress.percentage}%`)
})
```

### Clear All Data

```javascript
// In browser console
import { db } from './src/db/db'
await db.clearAllData()
console.log('All data cleared')
```

## 🎨 UI Components

### Loading Screen

The `DataLoadingScreen` component shows during initial data preload:
- Progress bar
- Current step
- Percentage complete
- Only shows on first launch

### App Initializer

The `AppInitializer` component wraps your app:
- Checks if data is preloaded
- Shows loading screen if needed
- Shows app immediately if data exists

### Offline Indicator

Shows in bottom-right corner:
- Online/offline status
- Pending changes count
- Manual sync button
- Last sync time

## 🚨 Troubleshooting

### App shows loading screen every time

**Problem**: Data not persisting between sessions

**Solution**:
```javascript
// Check if IndexedDB is working
import { isDatabaseAvailable } from './src/db/db'
const available = await isDatabaseAvailable()
console.log('IndexedDB available:', available)
```

### Sidebar is empty offline

**Problem**: Data not preloaded or cleared

**Solution**:
```typescript
// Force refresh data
import { dataPreloader } from '@/services/offline/dataPreloader'
await dataPreloader.forceRefresh(userId)
```

### Data is stale

**Problem**: Background sync not working

**Solution**:
```typescript
// Manually trigger sync
import { syncService } from '@/services/offline/syncService'
await syncService.syncNow()
```

### Storage quota exceeded

**Problem**: Too much cached data

**Solution**:
```typescript
// Clear old data
import { db } from '@/db/db'
await db.evictOldRecords(50) // Keep only 50 most recent per table
```

## 📈 Performance

### Initial Load Time

- **First launch**: 5-15 seconds (depends on data size)
- **Subsequent launches**: <1 second (instant from cache)

### Data Size Estimates

- Projects: ~5KB each
- Subprojects: ~3KB each
- Activities: ~4KB each
- Form Templates: ~10KB each
- Beneficiaries: ~2KB each

**Example**: 100 projects + 250 subprojects + 500 activities + 50 templates + 1000 beneficiaries = ~3MB total

### Optimization Tips

1. **Limit cached data** - Only cache what user needs
2. **Evict old records** - Keep only recent data
3. **Compress large fields** - Use compression for big JSON
4. **Index strategically** - Only index frequently queried fields

## 🔐 Security

### Data Encryption

IndexedDB data is **NOT encrypted by default**. For sensitive PII:

```typescript
// Encrypt before storing
import { encrypt, decrypt } from '@/utils/crypto'

const encrypted = await encrypt(sensitiveData)
await db.beneficiaries.put({ ...beneficiary, pii: encrypted })

// Decrypt when reading
const beneficiary = await db.beneficiaries.get(id)
const decrypted = await decrypt(beneficiary.pii)
```

### Data Cleanup

Users should log out on shared devices:

```typescript
// On logout
import { db } from '@/db/db'
await db.clearAllData()
localStorage.clear()
```

## 🎯 Migration Checklist

- [ ] Replace all direct API calls with `offlineFirstDataService`
- [ ] Remove loading states (data is instant from cache)
- [ ] Subscribe to data updates for background sync
- [ ] Test offline functionality thoroughly
- [ ] Test data preload on first launch
- [ ] Test app reopening (should be instant)
- [ ] Test form submissions offline
- [ ] Test sync after reconnecting
- [ ] Monitor storage usage
- [ ] Add error handling for quota exceeded

## 📚 Additional Resources

- `offlineFirstDataService.ts` - Main offline-first data service
- `dataPreloader.ts` - Data preloading logic
- `AppInitializer.tsx` - App initialization wrapper
- `DataLoadingScreen.tsx` - Loading screen component
- `db.ts` - IndexedDB schema and configuration

## 🎉 Benefits

✅ **Instant UI** - No waiting for API calls
✅ **Works offline** - Full functionality without internet
✅ **Better UX** - No loading spinners
✅ **Reduced server load** - Fewer API calls
✅ **Resilient** - Works even with poor connectivity
✅ **Scalable** - Handles large datasets efficiently
