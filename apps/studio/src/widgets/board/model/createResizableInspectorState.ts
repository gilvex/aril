import { defaultWidth } from '@/widgets/board/config/defaultWidth.ts'
import { maxWidth } from '@/widgets/board/config/maxWidth.ts'
import { minWidth } from '@/widgets/board/config/minWidth.ts'
import { storageKey } from '@/widgets/board/config/storageKey.ts'
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
