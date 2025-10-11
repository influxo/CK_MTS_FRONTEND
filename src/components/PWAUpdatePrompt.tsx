/**
 * PWA Update Prompt
 * 
 * Shows a toast notification when a new app version is available
 */

import { useEffect } from 'react';
// @ts-ignore - Virtual module provided by vite-plugin-pwa at build time
import { useRegisterSW } from 'virtual:pwa-register/react';
import { toast } from 'sonner';

export function PWAUpdatePrompt() {
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(registration: any) {
      console.log('✅ Service Worker registered');
      
      // Check for updates every hour
      if (registration) {
        setInterval(() => {
          registration.update();
        }, 60 * 60 * 1000); // 1 hour
      }
    },
    onRegisterError(error: any) {
      console.error('❌ Service Worker registration error:', error);
    },
  });

  useEffect(() => {
    if (needRefresh) {
      toast.info('New version available!', {
        description: 'Click to update the app',
        duration: 0, // Don't auto-dismiss
        action: {
          label: 'Update',
          onClick: () => {
            updateServiceWorker(true);
          },
        },
        cancel: {
          label: 'Later',
          onClick: () => {
            console.log('User postponed update');
          },
        },
      });
    }
  }, [needRefresh, updateServiceWorker]);

  return null;
}
