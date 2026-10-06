import { useBlueprintController } from '../model/useBlueprintController.ts'
import { useCanvasBoardHandlers } from '../model/useCanvasBoardHandlers.tsx'
import type { CanvasBoardProps } from '../types/canvasBoardProps.ts'
import { BlueprintInspector } from './BlueprintInspector.tsx'
import { BlueprintSurface } from './BlueprintSurface.tsx'

export function CanvasBoard(props: CanvasBoardProps) {
  const model = useBlueprintController(props)
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
        {inspectorOpen && <BlueprintInspector {...props} {...model} />}
      </div>
    </div>
  )
}
