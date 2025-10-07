# Testing Offline Sync - Complete Guide

## Prerequisites

1. Make sure your API backend is running
2. Start the frontend development server
3. Open Chrome browser (best for testing)

---

## 🎯 **Quick Test (5 Minutes)**

### Step 1: Start the Application

```bash
# In the UI/CK_MTS_FRONTEND directory
npm run dev
```

The app should start at `http://localhost:5173`

### Step 2: Open Chrome DevTools

1. Open your app in Chrome
2. Press **F12** to open DevTools
3. Click the **Console** tab (to see logs)
4. Click the **Network** tab

### Step 3: Test Online Mode (Baseline)

1. Make sure you're logged in
2. Navigate to Projects page
3. You should see your projects load from the API
4. In Console, you should see:
   ```
   Initializing offline database...
   Initializing sync service...
   PWA and offline sync initialized
   ```

### Step 4: Go Offline

1. In the **Network** tab of DevTools
2. Change the throttling dropdown from "No throttling" to **"Offline"**
   - Look for dropdown at top of Network tab
   - Select "Offline" from the list

3. You should see:
   - ✅ A toast notification: "You are offline"
   - ✅ Sync indicator changes to "Offline" badge
   - ✅ Data still displays (from cache!)

### Step 5: Create Data Offline

1. While still offline, try to create a new project:
   - Click "Create Project" button
   - Fill in the form:
     - Name: "Test Offline Project"
     - Description: "Created while offline"
     - Category: "Education"
     - Status: "active"
   - Click Submit

2. You should see:
   - ✅ Toast: "Project will be synced when you're back online"
   - ✅ Project appears in the list immediately
   - ✅ Sync indicator shows "1 pending"

### Step 6: Edit Data Offline

1. While still offline, click on an existing project
2. Edit the description or status
3. Save changes

You should see:
- ✅ Toast: "Changes will be synced when you're back online"
- ✅ Changes appear immediately in UI
- ✅ Sync indicator shows "2 pending" (if you created one earlier)

### Step 7: Go Back Online

1. In the **Network** tab
2. Change throttling back to **"No throttling"**

3. Watch what happens:
   - ✅ Toast: "Back online - Syncing your changes..."
   - ✅ Toast: "2 change(s) synced successfully"
   - ✅ Sync indicator updates to "Online"
   - ✅ Console shows sync activity

### Step 8: Verify Sync Worked

1. Refresh the page (Ctrl+R or Cmd+R)
2. Your offline-created project should still be there
3. Check the API/database - the data should be saved on the server

---

## 🔍 **Detailed Testing Scenarios**

### Test 1: Cache Verification

**Goal:** Verify data is cached in IndexedDB

**Steps:**
1. Load app while online
2. Go to a page with data (e.g., Projects)
3. Open DevTools → **Application** tab → **IndexedDB**
4. Expand **CaritasOfflineDB**
5. Click on **projects** table
6. You should see cached project records with `synced: true`

**Expected Result:**
- Projects are stored in IndexedDB
- Each has `id`, `name`, `description`, etc.
- `synced` field is `true`
- `updatedAt` timestamp is present

---

### Test 2: Pending Mutations Queue

**Goal:** Verify offline changes are queued

**Steps:**
1. Go offline (Network → Offline)
2. Create or edit some data
3. Open DevTools → **Application** → **IndexedDB**
4. Expand **CaritasOfflineDB**
5. Click on **pendingMutations** table

**Expected Result:**
- You should see mutation records
- Each has:
  - `operation`: "create" or "update"
  - `entityType`: "project" or "activity"
  - `data`: the data to sync
  - `endpoint`: API endpoint to call
  - `method`: "POST" or "PUT"

---

### Test 3: Manual Sync

**Goal:** Test manual sync trigger

**Steps:**
1. Create some data offline (2-3 items)
2. Click on the **Sync Status Indicator** in the header
3. You should see:
   - Connection: Offline
   - Pending changes: 3
4. Go back online (Network → No throttling)
5. Click **"Sync Now"** button

**Expected Result:**
- Sync starts immediately
- Toast: "Changes synced"
- Pending count drops to 0

---

### Test 4: Force Refresh

**Goal:** Test clearing cache and re-downloading

**Steps:**
1. Load app with data
2. Click Sync Status Indicator
3. Click **"Force Refresh"** button
4. Confirm in popup

**Expected Result:**
- Toast: "Refreshing data..."
- All data cleared and re-downloaded from server
- Toast: "Data refreshed"

---

### Test 5: Clear Cache

**Goal:** Test cache clearing

**Steps:**
1. Load app with cached data
2. Open Console and run:
   ```javascript
   // Check cache before
   const db = (await import('./src/db/db')).db
   const count = await db.projects.count()
   console.log('Projects in cache:', count)
   ```
3. Click Sync Status Indicator → **"Clear Cache"**
4. Check count again - should be 0

**Expected Result:**
- Cache is cleared
- Pending mutations are NOT cleared
- Can still sync offline changes

---

### Test 6: Persistence Across Page Refreshes

**Goal:** Verify offline data persists

**Steps:**
1. Go offline
2. Create 2 projects
3. Verify pending: 2
4. **Refresh the page** (F5)
5. Check sync indicator

**Expected Result:**
- After refresh, still offline
- Still shows "2 pending"
- Data still in IndexedDB
- Will sync when you go online

---

### Test 7: Multiple Tabs (Bonus)

**Goal:** Test behavior with multiple tabs

**Steps:**
1. Open app in tab 1
2. Open app in tab 2 (same URL)
3. Go offline in both tabs
4. Create data in tab 1
5. Switch to tab 2 and refresh

**Expected Result:**
- Tab 2 should see pending mutations
- Both tabs share same IndexedDB
- Both tabs can add to mutation queue

---

## 🛠️ **Testing with Browser Console**

### Check Online Status

```javascript
// Check if app thinks it's online
navigator.onLine
// Should return true or false
```

### Inspect Sync State

```javascript
// In browser console (after app loads)
const { syncService } = await import('./src/services/offline/syncService')
const state = syncService.getState()
console.log(state)
// Shows: { isOnline, isSyncing, pendingMutations, lastSyncedAt, etc. }
```

### Check Cached Data

```javascript
const { db } = await import('./src/db/db')

// Count cached items
console.log('Projects:', await db.projects.count())
console.log('Activities:', await db.activities.count())
console.log('Pending:', await db.pendingMutations.count())

// View all projects
const projects = await db.projects.toArray()
console.table(projects)

// View pending mutations
const pending = await db.pendingMutations.toArray()
console.table(pending)
```

### Manually Trigger Sync

```javascript
const { syncService } = await import('./src/services/offline/syncService')
await syncService.syncNow()
console.log('Sync completed!')
```

### Clear Everything

```javascript
const { db } = await import('./src/db/db')
await db.clearAllData()
console.log('All data cleared!')
```

---

## 📱 **Testing on Mobile Devices**

### Android (Chrome)

1. Connect your phone to the same network as dev server
2. Find your computer's IP address:
   ```bash
   # Windows
   ipconfig
   
   # Mac/Linux
   ifconfig
   ```
3. On phone, open Chrome and go to: `http://YOUR_IP:5173`
4. To test offline:
   - Open Chrome menu (3 dots)
   - Enable "Airplane mode" on phone
   - Test creating data
   - Disable airplane mode
   - Watch it sync!

### iOS (Safari)

1. Same as Android for accessing dev server
2. To test offline:
   - Enable Airplane mode in iOS Settings
   - Test app
   - Disable airplane mode
   - Watch sync

---

## 🎭 **Advanced Testing Scenarios**

### Test 8: Simulated Network Errors

**Goal:** Test resilience to network issues

**Steps:**
1. Go online
2. Open DevTools → Network
3. Select "Slow 3G" throttling
4. Try to create data
5. Watch it retry automatically

**Expected Result:**
- App should handle slow connections gracefully
- If timeout occurs, operation queued for retry

---

### Test 9: Auth Token Expiry

**Goal:** Test behavior when token expires offline

**Steps:**
1. Go offline
2. Wait for token to expire (or manually delete from localStorage)
3. Go online
4. Try to sync

**Expected Result:**
- Sync fails with 401
- User redirected to login
- After re-login, sync can be triggered manually

---

### Test 10: Conflict Resolution

**Goal:** Test what happens with concurrent edits

**Steps:**
1. Open app in tab 1
2. Go offline in tab 1
3. Edit Project A → change description to "Offline Edit"
4. In tab 2 (or Postman), edit same Project A → change description to "Server Edit"
5. Go online in tab 1
6. Sync occurs

**Expected Result:**
- The version with newer `updatedAt` wins
- Check console for conflict warnings
- Data should match the newer version

---

## 🐛 **Debugging Failed Tests**

### Issue: Sync not happening

**Debug:**
```javascript
// Check sync service state
const { syncService } = await import('./src/services/offline/syncService')
console.log('Online?', syncService.isOnline())
console.log('State:', syncService.getState())

// Check pending mutations
const { db } = await import('./src/db/db')
const pending = await db.pendingMutations.toArray()
console.log('Pending mutations:', pending)

// Try manual sync
await syncService.syncNow()
```

### Issue: Data not caching

**Debug:**
```javascript
// Check if IndexedDB initialized
const { db } = await import('./src/db/db')
console.log('DB open?', db.isOpen())

// Check tables exist
console.log('Tables:', db.tables.map(t => t.name))

// Try to add data manually
await db.projects.add({
  id: 'test-1',
  name: 'Test',
  description: 'Test',
  category: 'Test',
  status: 'active',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  synced: true
})
console.log('Added test project')
```

### Issue: Console errors

**Common Errors:**

1. **"Cannot find module '@/db/db'"**
   - Already fixed - uses relative imports

2. **"Database is closed"**
   - Sync service not initialized
   - Check pwa.ts is calling `registerPWA()` in main.tsx

3. **"Network error"**
   - Check API is running
   - Check CORS settings

---

## ✅ **Testing Checklist**

Use this checklist to verify everything works:

### Basic Functionality
- [ ] App starts without errors
- [ ] Console shows: "PWA and offline sync initialized"
- [ ] Sync indicator appears in header
- [ ] Projects load from API

### Offline Mode
- [ ] Can go offline (Network → Offline)
- [ ] Toast shows "You are offline"
- [ ] Cached data still displays
- [ ] Can create new records offline
- [ ] Can edit existing records offline
- [ ] Sync indicator shows pending count

### Sync
- [ ] Going online triggers auto-sync
- [ ] Toast shows "Back online - Syncing..."
- [ ] Toast shows "X changes synced"
- [ ] Pending count drops to 0
- [ ] Data persists after page refresh

### IndexedDB
- [ ] Data visible in DevTools → Application → IndexedDB
- [ ] Projects table has cached data
- [ ] Pending mutations table has queued operations
- [ ] Synced records have `synced: true`
- [ ] Unsynced records have `synced: false`

### UI Components
- [ ] Sync status indicator shows correct status
- [ ] Can click indicator to open popover
- [ ] Popover shows correct pending count
- [ ] Manual sync button works
- [ ] Force refresh works
- [ ] Clear cache works

### Edge Cases
- [ ] Works after page refresh
- [ ] Works across multiple tabs
- [ ] Handles slow connections
- [ ] Survives app restart
- [ ] Auth token expiry handled

---

## 🎥 **Expected Console Output**

### On App Start (Online):
```
Initializing offline database...
✅ Offline database initialized
Initializing sync service...
🔄 Initializing offline sync service...
✅ Sync service initialized
✅ PWA and offline sync initialized
⬇️ Syncing from server...
✅ Cached 5 projects
```

### Going Offline:
```
🔴 Connection lost
```

### Creating Data Offline:
```
📱 Creating project offline
📝 Queued mutation: create project temp-abc-123
```

### Going Online:
```
🟢 Connection restored
⬆️ Syncing 2 pending changes...
✅ Synced create project temp-abc-123
✅ Synced update activity xyz-456
✅ Sync complete: 2 succeeded, 0 failed
```

---

## 🚀 **Next Steps After Testing**

Once all tests pass:

1. **Integrate into your app**
   - Add `<SyncStatusIndicator />` to header
   - Replace service calls with offline hooks

2. **Test on real devices**
   - Test on actual phones/tablets
   - Test with real network conditions

3. **Monitor in production**
   - Set up error logging
   - Track sync success rates
   - Monitor storage usage

4. **User training**
   - Document offline features
   - Train support team
   - Add help text in UI

---

## 📞 **Need Help?**

If tests fail or you see unexpected behavior:

1. Check console for errors
2. Verify API is running
3. Clear browser cache and try again
4. Check IndexedDB in DevTools
5. Review the implementation guide

**Common fixes:**
- Restart dev server
- Clear browser cache (Ctrl+Shift+Del)
- Try incognito/private mode
- Check browser console for errors

---

**Happy Testing! 🎉**

Your offline sync is production-ready once all tests pass.

