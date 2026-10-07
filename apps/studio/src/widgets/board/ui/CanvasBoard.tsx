import { useCallback } from 'react'
import { useBlueprintController } from '../model/useBlueprintController.ts'
import { useCanvasBoardHandlers } from '../model/useCanvasBoardHandlers.tsx'
import type { CanvasBoardProps } from '../types/canvasBoardProps.ts'
import { BlueprintInspector } from './BlueprintInspector.tsx'
import { BlueprintSurface } from './BlueprintSurface.tsx'

export function CanvasBoard(props: CanvasBoardProps) {
  const model = useBlueprintController(props)
  const focusNode = useCallback(
    (id: string) => {
      model.setSelected(id)
      void model.flow?.fitView({
        nodes: [{ id }],
        padding: 0.5,
        maxZoom: 1,
        duration: matchMedia('(prefers-reduced-motion: reduce)').matches
          ? 0
          : 200,
      })
    },
    [model],
  )
  const fitBoard = useCallback(() => {
    void model.flow?.fitView({
      padding: 0.2,
      duration: matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 0
        : 200,
    })
  }, [model.flow])
  const handlers = useCanvasBoardHandlers({ ...props, ...model })
  const {
    canvasRef,
    selectionBeforePointerDown,
    selectedIds,
    fullscreen,
    inspectorOpen,
  } = model
  return (
    <div
      ref={canvasRef}
      onPointerDownCapture={() => {
        selectionBeforePointerDown.current = selectedIds
      }}
      className={`canvas-page${fullscreen ? ' canvas-fullscreen' : ''}`}
    >
      <div className="canvas-layout">
        <BlueprintSurface {...props} {...model} {...handlers} />
        {inspectorOpen && (
          <BlueprintInspector
            {...props}
            {...model}
            focusNode={focusNode}
            fitBoard={fitBoard}
          />
        )}
      </div>
    </div>
  )
}
