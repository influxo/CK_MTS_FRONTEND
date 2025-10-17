import { registerSW } from 'virtual:pwa-register'
import { syncService } from './services/offline/syncService'
import { initializeDatabase } from './db/db'
import { toast } from 'sonner'

// This is the PWA registration function
export async function registerPWA() {
  // Check if the browser supports service workers
  if ('serviceWorker' in navigator) {
    // Register the service worker with auto-update behavior
    const updateSW = registerSW({
      onNeedRefresh() {
        // This function is called when a new version of your app is available
        console.log('New content available, click on reload button to update.')

        // Show toast notification for app update
        toast.info('New version available', {
          description: 'Click to update to the latest version',
          action: {
            label: 'Update',
            onClick: () => updateSW(true),
          },
          duration: Infinity, // Keep toast visible until user clicks
        })
      },
      onOfflineReady() {
        // This function is called when your app is ready to work offline
        console.log('App ready to work offline')

        // Show toast notification
        toast.success('App ready for offline use', {
          description: 'You can now use this app without an internet connection',
        })
      },
      onRegistered(registration) {
        // Service worker registered successfully
        console.log('Service worker registered:', registration)
      },
      onRegisterError(error) {
        // Service worker registration failed
        console.error('Service worker registration failed:', error)
      },
    })
  }

  // Initialize offline database
  console.log('Initializing offline database...')
  const dbInitialized = await initializeDatabase()

  if (!dbInitialized) {
    console.error('Failed to initialize offline database')
    toast.error('Offline mode unavailable', {
      description: 'Could not initialize offline storage',
    })
    return
  }

  // Initialize sync service
  console.log('Initializing sync service...')
  await syncService.initialize()

  console.log('PWA and offline sync initialized')
}

/**
 * Communicate with the service worker
 * Use this to send messages to the SW for cache updates
 */
export function notifyServiceWorker(message: { type: string; payload?: any }) {
  if (navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage(message)
  }
}

/**
 * Check if the app is running in standalone mode (installed as PWA)
 */
export function isStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true
  )
}

/**
 * Prompt user to install PWA (if not already installed)
 */
export function promptPWAInstall() {
  // This requires setup in main.tsx to capture the beforeinstallprompt event
  const deferredPrompt = (window as any).deferredPrompt

  if (deferredPrompt) {
    deferredPrompt.prompt()
    deferredPrompt.userChoice.then((choiceResult: any) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the PWA install prompt')
      } else {
        console.log('User dismissed the PWA install prompt')
      }
      (window as any).deferredPrompt = null
    })
  }
}
