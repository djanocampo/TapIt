// Register TapIt Progressive Web App Service Worker

export function registerServiceWorker() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then((registration) => {
          // Check for service worker updates
          registration.onupdatefound = () => {
            const installingWorker = registration.installing;
            if (installingWorker == null) {
              return;
            }
            installingWorker.onstatechange = () => {
              if (installingWorker.state === 'installed') {
                if (navigator.serviceWorker.controller) {
                  // New content is available; immediately tell worker to activate
                  installingWorker.postMessage({ type: 'SKIP_WAITING' });
                  console.info('[TapIt PWA] New update available. Activating new version.');
                } else {
                  // Content is cached for offline use.
                  console.info('[TapIt PWA] Content cached for offline use.');
                }
              }
            };
          };
        })
        .catch((error) => {
          console.error('[TapIt PWA] Error registering service worker:', error);
        });

      // Reload page once new controller activates
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });
    });
  }
}
