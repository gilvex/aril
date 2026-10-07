import { useEffect, useRef } from 'react'
import type { DesignEditorModel } from '../types/designEditorModel.ts'
export function useDesignPanelBounds(patch: DesignEditorModel['patch']) {
  const ref = useRef<HTMLElement>(null)
  useEffect(() => {
    if (!ref.current) return
    const observer = new ResizeObserver(([entry]) =>
      patch({
        panelSpace: entry.contentRect.width,
        panelVerticalSpace: entry.contentRect.height,
      }),
    )
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [patch])
  return ref
}
