import { defaultWidth } from '../config/defaultWidth.ts'
import { maxWidth } from '../config/maxWidth.ts'
import { minWidth } from '../config/minWidth.ts'
import { storageKey } from '../config/storageKey.ts'
export function createResizableInspectorState() {
  const limit: number = maxWidth
  const width: number = (() => {
    try {
      const saved = Number(localStorage.getItem(storageKey))
      return saved >= minWidth && saved <= maxWidth ? saved : defaultWidth
    } catch {
      return defaultWidth
    }
  })()
  const resizing: boolean = false
  return { limit, width, resizing }
}
