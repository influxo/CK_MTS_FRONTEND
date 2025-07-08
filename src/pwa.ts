import { registerSW } from 'virtual:pwa-register'

// This is the PWA registration function
export function registerPWA() {
  // Check if the browser supports service workers
  if ('serviceWorker' in navigator) {
    // Register the service worker with auto-update behavior
    const updateSW = registerSW({
      onNeedRefresh() {
        // This function is called when a new version of your app is available
        console.log('New content available, click on reload button to update.')
        // You can show a toast notification here using your UI components
        if (confirm('New content available. Reload?')) {
          updateSW(true)
        }
      },
      onOfflineReady() {
        // This function is called when your app is ready to work offline
        console.log('App ready to work offline')
        // You can show a toast notification here using your UI components
      },
    })
  }
}
