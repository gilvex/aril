import { event } from '@/shared/config/themeEvent.ts'
export function subscribe(listener: () => void) {
  window.addEventListener(event, listener)
  return () => window.removeEventListener(event, listener)
}
