import { useWireframeBoardHandlers } from '../model/useWireframeBoardHandlers.tsx'
import { useWireframeController } from '../model/useWireframeController.ts'
import type { WireframeBoardProps } from '../types/wireframeBoardProps.ts'
import { WireframeInspector } from './WireframeInspector.tsx'
import { WireframeSurface } from './WireframeSurface.tsx'

export function WireframeBoard(props: WireframeBoardProps) {
  const model = useWireframeController(props)
  const handlers = useWireframeBoardHandlers({ ...props, ...model })
  const { selectionBefore, selection, preview, inspectorOpen } = model
  return (
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
  )
}
