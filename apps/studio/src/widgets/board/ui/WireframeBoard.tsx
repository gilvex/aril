import { useWireframeBoardHandlers } from '../model/useWireframeBoardHandlers.tsx'
import { useWireframeController } from '../model/useWireframeController.ts'
import type { WireframeBoardProps } from '../types/wireframeBoardProps.ts'
import { WireframeInspector } from './WireframeInspector.tsx'
import { WireframeSurface } from './WireframeSurface.tsx'
import { CanvasToolsProvider } from '@/features/canvasTools/index.ts'

export function WireframeBoard(props: WireframeBoardProps) {
  const model = useWireframeController(props)
  const handlers = useWireframeBoardHandlers({ ...props, ...model })
  const { selectionBefore, selection, preview, inspectorOpen } = model
  return (
    <CanvasToolsProvider key={props.board.id}>
      <div
        className={`canvas-page wireframe-page${props.full.fullscreen ? ' canvas-fullscreen' : ''}${preview ? ' wire-preview' : ''}`}
        onPointerDownCapture={() => {
          selectionBefore.current = selection
        }}
      >
        <div className="canvas-layout">
          <WireframeSurface {...props} {...model} {...handlers} />
          {inspectorOpen && <WireframeInspector {...props} {...model} />}
        </div>
      </div>
    </CanvasToolsProvider>
  )
}
