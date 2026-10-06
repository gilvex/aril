import { useSyncExternalStore } from 'react'

export type ThemePreference = 'light' | 'dark' | 'system'
const key = 'pomegranate-appearance'
const event = 'pomegranate-appearance-change'
const media = window.matchMedia('(prefers-color-scheme: dark)')
let preference: ThemePreference = readPreference()

function readPreference(): ThemePreference {
  try {
    const saved = localStorage.getItem(key)
    return saved === 'light' || saved === 'dark' ? saved : 'system'
  } catch {
    return 'system'
  }
}

function apply() {
  const theme =
    preference === 'system' ? (media.matches ? 'dark' : 'light') : preference
  document.documentElement.dataset.theme = theme
  document.documentElement.style.colorScheme = theme
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', theme === 'dark' ? '#19161f' : '#f8f7fa')
  window.dispatchEvent(new Event(event))
}

export function initializeTheme() {
  apply()
  media.addEventListener('change', apply)
  window.addEventListener('storage', (change) => {
    if (change.key !== key && change.key !== null) return
    preference = readPreference()
    apply()
  })
}

export function setThemePreference(next: ThemePreference) {
  preference = next
  try {
    localStorage.setItem(key, next)
  } catch {
    /* Keep working when storage is unavailable. */
  }
  apply()
}

function subscribe(listener: () => void) {
  window.addEventListener(event, listener)
  return () => window.removeEventListener(event, listener)
}

export function useThemePreference() {
  return useSyncExternalStore(subscribe, () => preference)
}
