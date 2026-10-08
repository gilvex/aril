import { accentStore } from '../model/accentStore.ts'
import { accentSlice } from '../model/slices/accentSlice.ts'
import { accentKey } from '../config/accentKey.ts'
import { readAccentPreference } from './readAccentPreference.ts'
export function initializeAccent() {
  const apply = () => {
    document.documentElement.dataset.accent = accentStore.getState().value
  }
  apply()
  const unsubscribe = accentStore.subscribe(apply)
  const sync = (event: StorageEvent) => {
    if (event.key === accentKey || event.key === null)
      accentStore.dispatch(accentSlice.actions.changed(readAccentPreference()))
  }
  window.addEventListener('storage', sync)
  return () => {
    unsubscribe()
    window.removeEventListener('storage', sync)
  }
}
