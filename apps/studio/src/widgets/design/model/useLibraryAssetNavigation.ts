import { useCallback } from 'react'
import type { DesignEditorModel } from '../types/designEditorModel.ts'
export function useLibraryAssetNavigation(model: DesignEditorModel) {
  const { patch, libraryAsset, libraryAssetHistory } = model
  const inspect = useCallback(
    (id: string) => {
      if (id === libraryAsset) return
      patch({
        libraryAsset: id,
        librarySelection: [],
        libraryDetailsOpen: true,
        libraryAssetHistory: libraryAsset
          ? [...libraryAssetHistory, libraryAsset].slice(-30)
          : libraryAssetHistory,
      })
    },
    [patch, libraryAsset, libraryAssetHistory],
  )
  const back = useCallback(() => {
    const id = libraryAssetHistory.at(-1)
    if (id)
      patch({
        libraryAsset: id,
        librarySelection: [],
        libraryAssetHistory: libraryAssetHistory.slice(0, -1),
      })
  }, [patch, libraryAssetHistory])
  const reveal = useCallback(
    () => patch({ libraryTab: 'graph', libraryFocus: true, libraryOffset: 0 }),
    [patch],
  )
  return { inspect, back, reveal }
}
