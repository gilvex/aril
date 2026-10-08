import { accentStore } from '../model/accentStore.ts'
import { accentSlice } from '../model/slices/accentSlice.ts'
import { accentKey } from '../config/accentKey.ts'
import { isAccentPreference } from './isAccentPreference.ts'
import type { AccentPreference } from '../types/accentPreference.ts'
export function setAccentPreference(next: AccentPreference) {
  if (!isAccentPreference(next)) return
  accentStore.dispatch(accentSlice.actions.changed(next))
  try {
    localStorage.setItem(accentKey, next)
  } catch {
    /* Keep the in-memory choice when storage is blocked. */
  }
}
