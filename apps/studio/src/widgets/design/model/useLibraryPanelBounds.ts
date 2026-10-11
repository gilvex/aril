import { useEffect, useRef } from 'react'
import type { DesignEditorModel } from '../types/designEditorModel.ts'

export function useLibraryPanelBounds(patch: DesignEditorModel['patch']) {
  const ref = useRef<HTMLElement>(null)
  useEffect(() => {
    const explorer = ref.current
    const workspace = explorer?.closest('.main-area')
    if (!explorer || !workspace) return
    let previous = ''
    const measure = () => {
      const outer = workspace.getBoundingClientRect()
      if (!outer.width || !outer.height) return
      const inner = explorer.getBoundingClientRect()
      const bounds = {
        workspace: {
          left: outer.left,
          top: outer.top,
          width: outer.width,
          height: outer.height,
        },
        graph: {
          left: inner.left - outer.left,
          top: inner.top - outer.top,
          width: inner.width,
          height: inner.height,
        },
      }
      const serialized = JSON.stringify(bounds)
      if (previous === serialized) return
      previous = serialized
      patch({
        libraryPanelBounds: bounds,
        panelSpace: outer.width,
        panelVerticalSpace: outer.height,
      })
    }
    const observer = new ResizeObserver(measure)
    observer.observe(workspace)
    observer.observe(explorer)
    window.addEventListener('resize', measure)
    window.addEventListener('scroll', measure, true)
    measure()
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', measure)
      window.removeEventListener('scroll', measure, true)
    }
  }, [patch])
  return ref
}
