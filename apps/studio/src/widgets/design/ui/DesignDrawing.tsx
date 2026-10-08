import { useCallback } from 'react'
import { CanvasDrawing } from '@/features/canvasTools/index.ts'
import type { CanvasStrokes } from '@pomegranate/domain/drawing'
import type { DesignEditorModel } from '../types/designEditorModel.ts'
export function DesignDrawing({ model }: { model: DesignEditorModel }) {
  const save = useCallback(
    (strokes: CanvasStrokes) => {
      model.updateDesign({
        ...model.design,
        pages: model.pages.map((page) =>
          page.id === model.page.id ? { ...page, strokes } : page,
        ),
      })
    },
    [model],
  )
  if (model.component) return null
  return (
    <CanvasDrawing
      scope={model.page.id}
      strokes={model.page.strokes}
      onChange={save}
      disabled={model.libraryView !== 'canvas'}
    />
  )
}
