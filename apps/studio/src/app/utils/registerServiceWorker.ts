export function registerServiceWorker() {
  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return
  // Browser installation remains optional; failure must never block the studio.
  const register = () => {
    void navigator.serviceWorker
      .register('/sw.js', { scope: '/', updateViaCache: 'none' })
      .catch(() => undefined)
  }
  if (document.readyState === 'complete') register()
  else window.addEventListener('load', register, { once: true })
}
