# Offline PWA Setup Guide

## Quick Start

Your PWA now has full offline functionality! Here's what you need to know:

## ✅ What's Already Implemented

### 1. Database (IndexedDB)
- ✅ Schema with projects, subprojects, activities, beneficiaries, form templates, and form submissions
- ✅ Automatic versioning and migrations
- ✅ Indexed fields for fast queries

### 2. Offline Data Service
- ✅ Transparent online/offline data access
- ✅ Automatic caching of API responses
- ✅ Queue management for offline mutations
- ✅ Methods for all major entities

### 3. Sync Service
- ✅ Bidirectional sync (local ↔ server)
- ✅ Automatic sync on connection restore
- ✅ Periodic background sync (every 5 minutes)
- ✅ Conflict resolution using timestamps
- ✅ Retry logic with exponential backoff

### 4. UI Components
- ✅ Offline indicator with sync status
- ✅ Pending changes counter
- ✅ Manual sync button
- ✅ Toast notifications for sync events

### 5. Service Worker
- ✅ Auto-update on new version
- ✅ Runtime caching for API calls
- ✅ Static asset caching
- ✅ Offline page support

## 🚀 Testing Offline Functionality

### Method 1: Browser DevTools (Recommended)

1. **Open DevTools** (F12)
2. **Go to Network tab**
3. **Select "Offline" from throttling dropdown**
4. **Test your app**:
   - Navigate to different pages
   - Submit a form
   - View cached data
5. **Go back online**:
   - Select "No throttling"
   - Watch sync happen automatically

### Method 2: Airplane Mode

1. **Enable airplane mode** on your device
2. **Open the PWA**
3. **Test offline features**
4. **Disable airplane mode**
5. **Watch automatic sync**

### Method 3: Service Worker Simulation

```javascript
// In browser console
// Simulate offline
navigator.serviceWorker.controller.postMessage({ type: 'SIMULATE_OFFLINE' })

// Simulate online
navigator.serviceWorker.controller.postMessage({ type: 'SIMULATE_ONLINE' })
```

## 📝 Testing Checklist

### Basic Offline Features
- [ ] App loads while offline
- [ ] Cached projects are visible
- [ ] Cached form templates are accessible
- [ ] Offline indicator appears
- [ ] Pending changes counter shows

### Form Submission Offline
- [ ] Can open a form while offline
- [ ] Can fill out form fields
- [ ] Can submit form
- [ ] See "saved offline" message
- [ ] Submission appears in pending queue

### Sync After Reconnect
- [ ] Offline indicator changes to "syncing"
- [ ] Pending counter decreases
- [ ] Toast notification shows sync success
- [ ] Submitted forms appear in server
- [ ] No duplicate submissions

### Edge Cases
- [ ] Multiple offline submissions sync correctly
- [ ] Conflict resolution works (edit same entity offline and online)
- [ ] Large datasets don't cause performance issues
- [ ] Storage quota not exceeded
- [ ] App recovers from sync errors

## 🔧 Configuration

### Adjust Sync Interval

Edit `src/services/offline/syncService.ts`:

```typescript
// Change from 5 minutes to 10 minutes
this.startPeriodicSync(10 * 60 * 1000);
```

### Adjust Cache Size

Edit `src/db/db.ts`:

```typescript
// Change from 100 to 200 records per table
await db.evictOldRecords(200);
```

### Adjust Service Worker Cache

Edit `vite.config.ts`:

```typescript
workbox: {
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/api\..*\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-cache',
        expiration: {
          maxEntries: 200, // Increase from 100
          maxAgeSeconds: 60 * 60 * 48 // Increase from 24h to 48h
        }
      }
    }
  ]
}
```

## 🐛 Debugging

### View IndexedDB Data

1. **Open DevTools** (F12)
2. **Go to Application tab**
3. **Expand IndexedDB**
4. **Select "CaritasOfflineDB"**
5. **Browse tables**

### View Pending Mutations

```javascript
// In browser console
import { db } from './src/db/db'
const pending = await db.pendingMutations.toArray()
console.table(pending)
```

### View Sync State

```javascript
// In browser console
import { syncService } from './src/services/offline/syncService'
const state = syncService.getState()
console.log(state)
```

### Clear All Offline Data

```javascript
// In browser console
import { db } from './src/db/db'
await db.clearAllData()
console.log('All offline data cleared')
```

### Force Sync

```javascript
// In browser console
import { syncService } from './src/services/offline/syncService'
await syncService.syncNow()
console.log('Sync completed')
```

## 📊 Monitoring

### Check Storage Usage

```javascript
// In browser console
if (navigator.storage && navigator.storage.estimate) {
  const estimate = await navigator.storage.estimate()
  console.log('Storage used:', (estimate.usage / 1024 / 1024).toFixed(2), 'MB')
  console.log('Storage quota:', (estimate.quota / 1024 / 1024).toFixed(2), 'MB')
  console.log('Usage:', ((estimate.usage / estimate.quota) * 100).toFixed(2), '%')
}
```

### Monitor Sync Events

```javascript
// In browser console
import { syncService } from './src/services/offline/syncService'

syncService.subscribe((state) => {
  console.log('Sync state changed:', {
    isOnline: state.isOnline,
    isSyncing: state.isSyncing,
    pendingMutations: state.pendingMutations,
    lastSyncedAt: state.lastSyncedAt,
    syncStatus: state.syncStatus
  })
})
```

## 🚨 Common Issues

### Issue: "Storage quota exceeded"
**Solution**: Clear old data or increase browser storage quota
```javascript
await db.clearAllData()
```

### Issue: Sync not happening automatically
**Solution**: Check if sync service is initialized
```javascript
// In src/main.tsx, ensure registerPWA() is called
registerPWA()
```

### Issue: Duplicate form submissions
**Solution**: Check for multiple submit button clicks. The service has deduplication logic.

### Issue: Slow performance offline
**Solution**: Reduce cached data size
```javascript
await db.evictOldRecords(50) // Reduce from 100 to 50
```

## 📱 PWA Installation

### Desktop (Chrome/Edge)
1. Click the install icon in address bar
2. Click "Install"
3. App opens in standalone window

### Mobile (Android)
1. Open menu (⋮)
2. Select "Add to Home screen"
3. Confirm installation

### Mobile (iOS)
1. Tap Share button
2. Select "Add to Home Screen"
3. Confirm

## 🔐 Security Notes

1. **Local Data**: IndexedDB data is NOT encrypted by default
2. **Sensitive Data**: Consider encrypting PII before storing locally
3. **Shared Devices**: Users should log out to clear local data
4. **Token Expiry**: Auth tokens expire; offline mode requires valid token

## 📈 Performance Tips

1. **Prefetch Data**: Call `dataPrefetchService.prefetchAllData()` after login
2. **Lazy Load**: Only cache data user actually views
3. **Periodic Cleanup**: Clear old cached data regularly
4. **Optimize Queries**: Use indexed fields for faster queries
5. **Batch Operations**: Group multiple mutations for efficient sync

## 🎯 Next Steps

1. **Test thoroughly** in offline mode
2. **Monitor storage usage** in production
3. **Gather user feedback** on offline experience
4. **Optimize cache strategy** based on usage patterns
5. **Consider implementing** delta sync for large datasets

## 📚 Additional Resources

- See `OFFLINE_FUNCTIONALITY.md` for detailed architecture
- Check `src/services/offline/` for implementation details
- Review `src/db/db.ts` for database schema
- Examine `vite.config.ts` for PWA configuration

## ✨ Features to Consider

- [ ] Offline analytics dashboard
- [ ] Selective sync (choose what to cache)
- [ ] Conflict resolution UI
- [ ] Background sync API integration
- [ ] Encrypted local storage
- [ ] Delta sync optimization
- [ ] Offline search functionality
- [ ] Export/import offline data
