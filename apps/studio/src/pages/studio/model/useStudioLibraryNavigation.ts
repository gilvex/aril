import { useCallback, useMemo } from 'react'
import type { StudioModel } from '../types/studioModel.ts'
import type { DesignEditorState } from '@/widgets/design/index.ts'
export function useStudioLibraryNavigation({
  library,
  setLibrary,
  setView,
  setBoardId,
  setCanvasMode,
}: Pick<
  StudioModel,
  'library' | 'setLibrary' | 'setView' | 'setBoardId' | 'setCanvasMode'
>) {
  const open = useCallback(
    (boardId: string | null, tab: 'graph' | 'variables' = 'graph') => {
      setLibrary({ boardId, tab, target: null })
      setView('library')
    },
    [setLibrary, setView],
  )
  const design = useCallback(
    (target: Partial<DesignEditorState> = {}) => {
      setLibrary({ target })
      if (library.boardId) {
        setBoardId(library.boardId)
        setCanvasMode('design')
        setView('canvas')
      } else setView('design')
    },
    [library.boardId, setLibrary, setBoardId, setCanvasMode, setView],
  )
  const consume = useCallback(() => setLibrary({ target: null }), [setLibrary])
  return useMemo(
    () => ({ ...library, open, design, consume }),
    [library, open, design, consume],
  )
}
